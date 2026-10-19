# Backend Architecture

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

The backend is a Rust application built with the Axum web framework. It is structured as a **modular monolith** — a single deployable binary with internally well-defined module boundaries that can be extracted into separate services later if needed.

See [ADR-002](architecture-decisions/ADR-002-modular-monolith.md) and [ADR-009](architecture-decisions/ADR-009-backend-language-framework.md) for the rationale behind these choices.

---

## Module Structure

```
crates/
└── api/
    ├── src/
    │   ├── main.rs                   # Entry point: sets up Axum router, state, listeners
    │   ├── config.rs                 # Configuration loading (env vars, config files)
    │   ├── errors.rs                 # Unified error type (thiserror + AppError)
    │   │
    │   ├── modules/
    │   │   ├── auth/                 # Authentication and authorization
    │   │   │   ├── mod.rs
    │   │   │   ├── handlers.rs       # Login, signup, OAuth callback, refresh, logout
    │   │   │   ├── middleware.rs     # JWT extraction and validation middleware
    │   │   │   ├── service.rs        # Auth business logic
    │   │   │   └── models.rs         # User, Session, OAuthIdentity
    │   │   │
    │   │   ├── boards/               # Board CRUD and permissions
    │   │   │   ├── mod.rs
    │   │   │   ├── handlers.rs
    │   │   │   ├── service.rs
    │   │   │   └── models.rs
    │   │   │
    │   │   ├── collaboration/        # WebSocket and CRDT sync
    │   │   │   ├── mod.rs
    │   │   │   ├── ws_handler.rs     # WebSocket upgrade handler
    │   │   │   ├── session.rs        # Per-connection session state
    │   │   │   ├── broadcast.rs      # Redis pub/sub fan-out
    │   │   │   └── persistence.rs    # CRDT state persistence to PostgreSQL
    │   │   │
    │   │   ├── assets/               # File upload and asset management
    │   │   │   ├── mod.rs
    │   │   │   ├── handlers.rs       # Pre-signed URL generation, upload confirmation
    │   │   │   └── service.rs        # S3 client, MIME validation, size limits
    │   │   │
    │   │   ├── ai/                   # AI request proxy
    │   │   │   ├── mod.rs
    │   │   │   ├── handlers.rs       # Accept AI request, add API key, forward
    │   │   │   ├── providers.rs      # Provider trait + OpenAI / Anthropic impls
    │   │   │   └── rate_limit.rs     # Per-user rate limiting
    │   │   │
    │   │   ├── plugins/              # Plugin registry
    │   │   │   ├── mod.rs
    │   │   │   ├── handlers.rs       # List plugins, get manifest
    │   │   │   └── models.rs         # PluginManifest
    │   │   │
    │   │   └── health/               # Health and readiness checks
    │   │       └── handlers.rs
    │   │
    │   └── infra/                    # Infrastructure adapters
    │       ├── db.rs                 # PostgreSQL connection pool (sqlx)
    │       ├── redis.rs              # Redis connection pool
    │       ├── s3.rs                 # S3 client wrapper
    │       └── email.rs              # Email sender (SMTP)
    │
    ├── migrations/                   # SQL migration files (sqlx-migrate)
    │   ├── 0001_initial.sql
    │   ├── 0002_add_snapshots.sql
    │   └── ...
    │
    ├── Cargo.toml
    └── Cargo.lock
```

---

## Application State

Axum routes receive shared state via `Extension` or `State` extractors:

```rust
#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,            // sqlx PostgreSQL connection pool
    pub redis: RedisPool,      // Redis connection pool
    pub s3: S3Client,          // Object storage client
    pub config: Arc<Config>,   // Application configuration
}
```

The `AppState` is constructed in `main.rs` and passed to the Axum router. All handlers receive it via `State<AppState>`.

---

## Router Structure

```rust
let app = Router::new()
    // Health
    .route("/health", get(health::alive))
    .route("/ready", get(health::ready))

    // Auth (no auth middleware)
    .route("/auth/login", post(auth::login))
    .route("/auth/signup", post(auth::signup))
    .route("/auth/refresh", post(auth::refresh_token))
    .route("/auth/logout", post(auth::logout))
    .route("/auth/callback/:provider", get(auth::oauth_callback))

    // Protected routes (JWT middleware applied)
    .nest("/api/v1", protected_routes())

    // WebSocket
    .route("/ws/board/:board_id", get(collaboration::ws_handler))

    .layer(CorsLayer::permissive())   // Configured per environment
    .layer(TraceLayer::new_for_http())
    .with_state(state);
```

---

## Authentication Middleware

```rust
// Applied to all /api/v1/* routes
async fn auth_middleware(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_bearer_token(&req)?;
    let claims = verify_jwt(&token, &state.config.jwt_secret)?;
    req.extensions_mut().insert(AuthUser::from(claims));
    Ok(next.run(req).await)
}
```

---

## WebSocket Handler

The WebSocket handler manages Yjs CRDT synchronization:

```rust
async fn ws_handler(
    ws: WebSocketUpgrade,
    Path(board_id): Path<Uuid>,
    State(state): State<AppState>,
    auth: Option<AuthUser>,  // Optional — viewers may not be authenticated
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_ws_connection(socket, board_id, state, auth))
}

async fn handle_ws_connection(
    socket: WebSocket,
    board_id: Uuid,
    state: AppState,
    auth: Option<AuthUser>,
) {
    let (sender, receiver) = socket.split();
    let session = CollabSession::new(board_id, sender, auth);

    // Load existing CRDT state from DB and send to client (Yjs sync step 1)
    let initial_state = load_board_crdt_state(&state.db, board_id).await?;
    session.send_sync_step1(initial_state).await;

    // Subscribe to Redis pub/sub for this board
    let mut redis_sub = state.redis.subscribe(board_channel(board_id)).await;

    // Concurrent tasks: receive from client + receive from Redis
    tokio::select! {
        _ = receive_from_client(receiver, &session, &state) => {},
        _ = receive_from_redis(&mut redis_sub, &session) => {},
    }

    // Clean up on disconnect
    persist_crdt_state(&state.db, board_id, session.crdt_state()).await;
}
```

---

## Error Handling

All handlers return `Result<T, AppError>`. `AppError` implements `IntoResponse`:

```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Forbidden")]
    Forbidden,
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Internal error")]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".to_string()),
            AppError::Forbidden => (StatusCode::FORBIDDEN, "Forbidden".to_string()),
            AppError::Validation(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Internal(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".to_string()),
        };
        (status, Json(json!({ "error": message }))).into_response()
    }
}
```

---

## Module Communication

Modules communicate via Rust traits (interfaces), not direct imports of implementation types:

```rust
// boards module defines:
pub trait BoardRepository: Send + Sync {
    async fn find_by_id(&self, id: Uuid) -> Result<Board, AppError>;
    async fn create(&self, input: CreateBoardInput) -> Result<Board, AppError>;
    // ...
}

// infra provides:
pub struct PostgresBoardRepository { pool: PgPool }
impl BoardRepository for PostgresBoardRepository { ... }
```

This pattern allows swapping implementations in tests (e.g., in-memory repository for unit tests).

---

## Related Documents

- [Technology Stack](technology-stack.md)
- [Database Design](database-design.md)
- [API Design](api-design.md)
- [Collaboration Engine](collaboration-engine.md)
- [Authentication & Authorization](authentication-and-authorization.md)
- [ADR-002: Modular Monolith](architecture-decisions/ADR-002-modular-monolith.md)
- [ADR-009: Backend Language & Framework](architecture-decisions/ADR-009-backend-language-framework.md)
