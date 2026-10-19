# Environment Configuration

**Status:** Proposed  
**Audience:** Engineers, DevOps  
**Last Reviewed:** 2024-01-15

## Overview

Codrawithm uses environment variables for all configuration that varies between environments. Secrets are never committed to the repository.

---

## Frontend Environment Variables

Prefix: `VITE_` (exposed to browser bundle — never put secrets here)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | — | Backend REST API base URL |
| `VITE_WS_URL` | Yes | — | WebSocket server URL |
| `VITE_APP_ENV` | No | `development` | Environment name for analytics |
| `VITE_SENTRY_DSN` | No | — | Sentry error tracking DSN (public) |
| `VITE_POSTHOG_KEY` | No | — | PostHog analytics key (public) |

**`apps/web/.env.example`:**
```bash
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_ENV=development
# VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
# VITE_POSTHOG_KEY=phc_xxx
```

---

## Backend Environment Variables

These are server-side only and must never appear in frontend bundles.

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars, random) |
| `PORT` | HTTP/WebSocket server port (default: 3000) |

### Optional — AI Integration

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (server-side only, never in browser) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `AI_DEFAULT_PROVIDER` | `openai` or `anthropic` |
| `AI_ENABLED` | `true` or `false` (default: `false` until Phase 4) |

### Optional — Storage

| Variable | Description |
|----------|-------------|
| `STORAGE_PROVIDER` | `local` or `s3` (default: `local` for dev) |
| `S3_BUCKET` | S3 bucket name |
| `S3_REGION` | AWS region |
| `S3_ENDPOINT` | Custom endpoint (for MinIO / compatible services) |
| `AWS_ACCESS_KEY_ID` | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials |
| `LOCAL_STORAGE_PATH` | Path for local file storage (dev only) |

### Optional — Email

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (default: 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |
| `EMAIL_FROM` | From address for outbound email |

### Optional — Observability

| Variable | Description |
|----------|-------------|
| `RUST_LOG` | Rust log level (`debug`, `info`, `warn`, `error`) |
| `SENTRY_DSN` | Sentry DSN (server-side) |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry collector endpoint |

### Optional — Security

| Variable | Description |
|----------|-------------|
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |
| `RATE_LIMIT_PER_MIN` | Global rate limit per IP (default: 100) |
| `MAX_UPLOAD_SIZE_MB` | Max file upload size in MB (default: 50) |

**`apps/api/.env.example`:**
```bash
# Database
DATABASE_URL=postgres://codrawithm:devpassword@localhost:5432/codrawithm_dev

# Cache
REDIS_URL=redis://localhost:6379

# Auth — CHANGE THIS IN PRODUCTION
JWT_SECRET=local-dev-secret-minimum-32-characters-long

# Server
PORT=3000
RUST_LOG=info

# Storage (local for development)
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./tmp/uploads

# AI (disabled by default)
AI_ENABLED=false
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=ant-...

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

---

## Secrets Management

### Development
- Use `.env` files (gitignored)
- Never commit `.env` files — only commit `.env.example` with placeholder values

### Production
- Use a secrets manager: AWS Secrets Manager, HashiCorp Vault, or your platform's native secrets (e.g. Railway, Fly.io secrets)
- Inject secrets as environment variables at runtime
- Rotate `JWT_SECRET` requires invalidating all existing sessions

### Validation at Startup

The backend validates required environment variables at startup and exits with a clear error if any are missing:

```rust
// On startup
fn validate_env() {
    let required = ["DATABASE_URL", "REDIS_URL", "JWT_SECRET"];
    for var in required {
        if std::env::var(var).is_err() {
            eprintln!("ERROR: Required environment variable {} is not set", var);
            std::process::exit(1);
        }
    }
}
```

---

## Environment Files by Context

| File | Committed | Purpose |
|------|-----------|---------|
| `.env.example` | ✅ Yes | Template with placeholder values |
| `.env` | ❌ No | Local development overrides |
| `.env.local` | ❌ No | Local frontend overrides |
| `.env.production` | ❌ No | Production values (use secrets manager instead) |
| `.env.test` | ✅ Yes (no secrets) | Test environment configuration |

---

## Related Documents

- [Local Development](./local-development.md)
- [Deployment](./deployment.md)
- [Security Engineering](../engineering/security.md)
