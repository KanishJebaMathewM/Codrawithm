# Codrawithm Backend API (`apps/api`)

Rust + Axum backend service for the Codrawithm collaborative visual workspace.

## Architecture

- **Web Framework:** [Axum](https://github.com/tokio-rs/axum) (0.7) on Tokio async runtime
- **Database:** PostgreSQL 16 managed via [sqlx](https://github.com/launchbadge/sqlx)
- **Real-time Engine:** WebSockets with room fan-out and CRDT state persistence
- **Authentication:** JWT (HMAC-SHA256) with Argon2id password hashing

## Prerequisites

1. **Rust:** Ensure Rust stable (>= 1.75) is installed:
   ```bash
   # Install via rustup if needed: https://rustup.rs/
   rustup show
   ```
2. **Docker Desktop:** For local PostgreSQL and Redis instances:
   ```bash
   docker compose up -d
   ```
3. **sqlx-cli (optional):** For managing migrations:
   ```bash
   cargo install sqlx-cli --no-default-features --features native-tls,postgres
   ```

## Configuration

Copy `.env.example` (or edit existing `.env`):

```bash
PORT=3002
HOST=0.0.0.0
DATABASE_URL=postgres://codrawithm:devpassword@localhost:5432/codrawithm_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=local-dev-jwt-secret-key-32-chars-long
JWT_EXPIRES_IN=900
CORS_ORIGIN=http://localhost:3000
```

## Running Database Migrations

Migrations live in `migrations/` and run automatically on startup in `main.rs`.
To run manually via `sqlx-cli`:

```bash
cd apps/api
sqlx migrate run
```

Available migrations:
- `0001_initial.sql`: Users, OAuth identities, boards, board states, board members
- `0002_assets.sql`: Board media and asset storage records
- `0003_comments.sql`: Canvas comments and threaded discussions
- `0004_snapshots.sql`: Board version history snapshots
- `0005_plugins.sql`: Plugin registry and manifests
- `0006_ai_audit.sql`: AI audit logging and token accounting

## Running the API Server

```bash
# Debug run
cargo run

# Watch mode (with cargo-watch)
cargo watch -x run
```

The service will start on `http://127.0.0.1:3002`.

## Testing

```bash
cargo test
```

## Endpoints Overview

- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe (checks DB connection)
- `POST /auth/signup` - Register user account
- `POST /auth/login` - Authenticate user & get JWT tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate session
- `GET /api/v1/boards` - List boards
- `POST /api/v1/boards` - Create a board
- `GET /api/v1/boards/:id` - Fetch board details & CRDT version
- `PATCH /api/v1/boards/:id` - Update board metadata/settings
- `DELETE /api/v1/boards/:id` - Soft delete board
- `POST /api/v1/boards/:id/duplicate` - Duplicate board
- `GET /api/v1/boards/share/:share_token` - View shared board
- `GET/POST /api/v1/boards/:id/members` - Manage board members
- `GET/POST /api/v1/boards/:id/snapshots` - Board version snapshots
- `GET/POST/DELETE /api/v1/boards/:id/assets` - Asset management
- `GET/POST /api/v1/boards/:id/comments` - Comments and threads
- `GET/POST /api/v1/plugins` - Plugin registry
- `GET /ws/board/:board_id` - Real-time WebSocket collaboration
