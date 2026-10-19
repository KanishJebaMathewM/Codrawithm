# Observability

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Observability covers three pillars: **logging**, **metrics**, and **tracing**. The goal is to understand system behavior in production and debug issues without guesswork.

---

## Logging

### Backend (Rust + tracing)

The backend uses the `tracing` crate with `tracing-subscriber` for structured JSON logs.

```rust
// Log format (JSON in production, human-readable in development)
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "target": "codrawithm_api::modules::boards::handlers",
  "span": { "board_id": "a1b2c3d4", "user_id": "e5f6g7h8" },
  "message": "Board loaded successfully"
}
```

**Log levels:**

| Level | Usage |
|-------|-------|
| `ERROR` | Application errors that require attention |
| `WARN` | Unexpected conditions that are handled |
| `INFO` | Significant lifecycle events (request completed, board saved) |
| `DEBUG` | Detailed flow for debugging (disabled in production) |
| `TRACE` | Very detailed (SQL queries, CRDT updates) — development only |

**Span instrumentation** via `#[instrument]` macro:

```rust
#[instrument(skip(db, state), fields(board_id = %board_id))]
async fn get_board_handler(
    State(state): State<AppState>,
    Path(board_id): Path<Uuid>,
    auth: AuthUser,
) -> Result<Json<Board>, AppError> {
    // All log statements in this function include board_id and user_id spans
}
```

### Frontend

The frontend logger sends errors to the backend `/api/v1/client-errors` endpoint in production:

```typescript
const logger = {
  error: (message: string, context?: object) => {
    console.error(message, context);
    if (import.meta.env.PROD) {
      // Non-blocking fire-and-forget
      fetch('/api/v1/client-errors', {
        method: 'POST',
        body: JSON.stringify({ message, context, url: location.href }),
        keepalive: true,
      });
    }
  },
};
```

---

## Metrics

### Backend (Prometheus)

The backend exposes a `/metrics` endpoint in the Prometheus text format:

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/boards",status="200"} 1234

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 1200
http_request_duration_seconds_bucket{le="0.5"} 1230
http_request_duration_seconds_bucket{le="1"} 1234

# HELP ws_connections_active Active WebSocket connections
# TYPE ws_connections_active gauge
ws_connections_active{board_id="a1b2c3d4"} 12

# HELP crdt_updates_total Total Yjs CRDT updates processed
# TYPE crdt_updates_total counter
crdt_updates_total 98765
```

**Key metrics:**

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | HTTP requests by method, path, status |
| `http_request_duration_seconds` | Histogram | Request latency (p50, p95, p99) |
| `ws_connections_active` | Gauge | Active WebSocket connections |
| `crdt_updates_total` | Counter | Yjs updates processed |
| `ai_requests_total` | Counter | AI generation requests by provider and outcome |
| `db_query_duration_seconds` | Histogram | Database query latency |

### Frontend (Core Web Vitals)

```typescript
import { onLCP, onFID, onCLS, onTTFB, onINP } from 'web-vitals';

const reportMetric = (metric: Metric) => {
  if (import.meta.env.PROD) {
    navigator.sendBeacon('/api/v1/vitals', JSON.stringify(metric));
  }
};

onLCP(reportMetric);
onFID(reportMetric);
onCLS(reportMetric);
onTTFB(reportMetric);
onINP(reportMetric);
```

---

## Distributed Tracing

For Phase 1, structured logging with span context is sufficient. Phase 2 will add OpenTelemetry tracing:

```rust
// Future: OpenTelemetry integration
use opentelemetry::trace::Tracer;
let tracer = opentelemetry::global::tracer("codrawithm-api");
let span = tracer.start("handle_board_update");
```

The tracing backend (Jaeger, Tempo) is optional for self-hosted deployments.

---

## Health Checks

Two health endpoints:

```
GET /health   → Liveness probe
              Returns 200 if the process is alive.
              Returns 503 if in a fatal error state.

GET /ready    → Readiness probe
              Returns 200 if PostgreSQL and Redis connections are healthy.
              Returns 503 if any dependency is unavailable.
```

Docker Compose uses these for health checks. Kubernetes deployments use them as liveness and readiness probes.

```rust
async fn alive() -> StatusCode {
    StatusCode::OK
}

async fn ready(State(state): State<AppState>) -> StatusCode {
    let db_ok = state.db.acquire().await.is_ok();
    let redis_ok = state.redis.ping().await.is_ok();
    if db_ok && redis_ok {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    }
}
```

---

## Alerting

For self-hosted deployments, alerting is set up by the operator. Recommended alerts:

| Alert | Condition | Severity |
|-------|-----------|---------|
| High error rate | HTTP 5xx rate > 1% | Critical |
| High latency | p99 request duration > 2s | Warning |
| Database unavailable | `/ready` returns 503 | Critical |
| WebSocket connection drop | Active connections drop > 50% in 1 minute | Warning |
| Disk full | MinIO or PostgreSQL volume > 90% | Critical |

---

## Related Documents

- [Error Handling](error-handling.md)
- [Incident Response](../operations/incident-response.md)
- [Deployment Architecture](../architecture/deployment-architecture.md)
