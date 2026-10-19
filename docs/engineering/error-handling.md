# Error Handling

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Consistent error handling reduces bugs and improves debugging. This document defines error handling patterns for both TypeScript (frontend) and Rust (backend).

---

## TypeScript Error Handling (Frontend)

### Never Swallow Errors

Every `catch` block must either handle the error or propagate it. Silent error swallowing is forbidden:

```typescript
// Bad
try {
  await saveBoard();
} catch (_) {}  // Silent swallow

// Good
try {
  await saveBoard();
} catch (error) {
  logger.error('Failed to save board', { error });
  toast.error('Failed to save. Please try again.');
}
```

### Result Pattern for Expected Failures

For operations where failure is a normal, expected outcome, use a `Result<T, E>` pattern rather than throwing:

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function parseAlgorithmInput(raw: string): Promise<Result<number[]>> {
  const parsed = raw.split(',').map(Number);
  if (parsed.some(isNaN)) {
    return { ok: false, error: new Error('Input must be comma-separated integers') };
  }
  return { ok: true, value: parsed };
}

// Usage
const result = await parseAlgorithmInput(userInput);
if (!result.ok) {
  showValidationError(result.error.message);
  return;
}
processNumbers(result.value);
```

### API Error Handling

TanStack Query mutations handle errors via `onError` callbacks:

```typescript
const saveBoard = useMutation({
  mutationFn: (board: Board) => api.boards.update(board),
  onSuccess: () => toast.success('Board saved'),
  onError: (error) => {
    if (error.status === 403) {
      toast.error('You do not have permission to edit this board.');
    } else {
      toast.error('Failed to save board. Please try again.');
      logger.error('Board save failed', { error });
    }
  },
});
```

### Error Boundaries

React Error Boundaries catch unhandled errors in the component tree:
- A top-level `AppErrorBoundary` catches catastrophic errors and shows a "Something went wrong" page.
- A `CanvasErrorBoundary` wraps the canvas component to prevent a canvas crash from taking down the entire app.
- Error boundary `fallback` components include a "Reload" button.

### Logging

The frontend uses a logger that wraps `console`:

```typescript
const logger = {
  error: (message: string, context?: object) => {
    console.error(message, context);
    // In production: send to Sentry or similar
  },
  warn: (message: string, context?: object) => console.warn(message, context),
  info: (message: string, context?: object) => {
    if (isDev) console.info(message, context);
  },
};
```

---

## Rust Error Handling (Backend)

### Typed Errors with `thiserror`

Library code and modules use `thiserror` for typed, structured errors:

```rust
#[derive(Debug, thiserror::Error)]
pub enum BoardError {
    #[error("Board not found: {id}")]
    NotFound { id: Uuid },

    #[error("Insufficient permissions: required {required:?}, have {actual:?}")]
    Forbidden { required: Role, actual: Role },

    #[error("Database error")]
    Database(#[from] sqlx::Error),
}
```

### Application Error Conversion

The application layer converts typed module errors to `AppError` for HTTP responses:

```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Forbidden")]
    Forbidden,
    #[error("Bad request: {0}")]
    BadRequest(String),
    #[error("Rate limit exceeded")]
    RateLimitExceeded,
    #[error("Internal error")]
    Internal(#[from] anyhow::Error),
}

impl From<BoardError> for AppError {
    fn from(e: BoardError) -> Self {
        match e {
            BoardError::NotFound { id } => AppError::NotFound(format!("Board {id}")),
            BoardError::Forbidden { .. } => AppError::Forbidden,
            BoardError::Database(e) => AppError::Internal(e.into()),
        }
    }
}
```

### Error Propagation with `?`

Use `?` to propagate errors up the call stack:

```rust
async fn load_board(db: &PgPool, id: Uuid, user_id: Uuid) -> Result<Board, AppError> {
    let board = boards_repo::find_by_id(db, id).await?;    // BoardError -> AppError
    check_permission(&board, user_id, Permission::Read)?;  // AppError
    Ok(board)
}
```

### No `unwrap()` in Production

`unwrap()` is only allowed in:
- Tests (`#[cfg(test)]`).
- The `main()` function for startup configuration that must succeed.
- Cases that are truly impossible — with a comment explaining why.

```rust
// Bad
let pool = PgPool::connect(&config.database_url).await.unwrap();

// Good
let pool = PgPool::connect(&config.database_url)
    .await
    .context("Failed to connect to PostgreSQL")?;
```

### Logging with `tracing`

```rust
use tracing::{error, warn, info, debug, instrument};

#[instrument(skip(db), fields(board_id = %id))]
async fn handle_board_load(db: &PgPool, id: Uuid) -> Result<Board, AppError> {
    let board = load_board(db, id).await.map_err(|e| {
        error!("Failed to load board {}: {}", id, e);
        e
    })?;
    info!("Board loaded successfully");
    Ok(board)
}
```

---

## Error Response Format

All API errors return a consistent JSON structure (see [API Design](../architecture/api-design.md)):

```json
{
  "error": {
    "code": "BOARD_NOT_FOUND",
    "message": "Board a1b2c3d4 was not found.",
    "details": null
  }
}
```

The `code` field is a machine-readable string for clients to handle specific errors programmatically.

---

## Related Documents

- [Coding Standards](coding-standards.md)
- [API Design](../architecture/api-design.md)
- [Observability](observability.md)
