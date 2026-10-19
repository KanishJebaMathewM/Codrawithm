# Deployment Architecture

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm is designed to be self-hosted via Docker Compose with a single command. This document describes the Docker Compose topology for both local development and production deployment.

---

## Docker Compose Topology

```mermaid
graph TD
    User["User Browser"] -->|HTTPS :443| Caddy

    subgraph Docker Compose Stack
        Caddy["Caddy\n(Reverse Proxy + TLS)"]
        API["API Server\n(Rust + Axum)\n:8080"]
        PG["PostgreSQL\n:5432"]
        Redis["Redis\n:6379"]
        Minio["MinIO\n(Object Storage)\n:9000"]
    end

    Caddy -->|HTTP| API
    API -->|SQL| PG
    API -->|Redis Protocol| Redis
    API -->|S3 API| Minio
```

---

## Service Definitions

### `docker-compose.yml`

```yaml
version: "3.9"

services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
      - ./apps/web/dist:/srv/web:ro
    depends_on:
      - api

  api:
    build:
      context: .
      dockerfile: crates/api/Dockerfile
    environment:
      DATABASE_URL: postgres://codrawithm:${DB_PASSWORD}@postgres:5432/codrawithm
      REDIS_URL: redis://redis:6379
      STORAGE_ENDPOINT: http://minio:9000
      STORAGE_BUCKET_NAME: codrawithm-assets
      STORAGE_ACCESS_KEY: ${MINIO_ROOT_USER}
      STORAGE_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      AI_PROVIDER: ${AI_PROVIDER:-none}
      OPENAI_API_KEY: ${OPENAI_API_KEY:-}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: codrawithm
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: codrawithm
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U codrawithm"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  minio_data:
  caddy_data:
  caddy_config:
```

---

## Caddyfile

```
{domain} {
    encode gzip

    # Frontend static files
    handle /assets/* {
        root * /srv/web
        file_server
    }

    handle / {
        root * /srv/web
        file_server
        try_files {path} /index.html
    }

    # API and WebSocket
    handle /api/* {
        reverse_proxy api:8080
    }

    handle /ws/* {
        reverse_proxy api:8080 {
            header_up Connection {header.Connection}
            header_up Upgrade {header.Upgrade}
        }
    }

    handle /auth/* {
        reverse_proxy api:8080
    }

    handle /health {
        reverse_proxy api:8080
    }
}
```

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/KanishJebaMathewM/Codrawithm.git
cd Codrawithm

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env with your values (JWT_SECRET, DB_PASSWORD, etc.)

# 3. Build the frontend
cd apps/web && pnpm install && pnpm build && cd ../..

# 4. Start all services
docker compose up -d

# 5. Run database migrations
docker compose exec api ./migrate

# 6. Open the app
open https://localhost
```

---

## Environment Variables

See [Environment Configuration](../operations/environment-configuration.md) for the full list.

Required for basic operation:
- `JWT_SECRET` — Random string, at least 32 characters.
- `DB_PASSWORD` — PostgreSQL password.
- `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` — MinIO admin credentials.

---

## Production Deployment Checklist

- [ ] Set a strong `JWT_SECRET` (min 32 chars, randomly generated).
- [ ] Set a strong `DB_PASSWORD`.
- [ ] Configure a real domain in `Caddyfile` (not `localhost`).
- [ ] Caddy obtains TLS certificates automatically (ACME/Let's Encrypt).
- [ ] Configure backups for `postgres_data` and `minio_data` volumes.
- [ ] Set `AI_PROVIDER` if AI features are wanted.
- [ ] Review and tighten `CORS_ALLOWED_ORIGINS` to your domain only.
- [ ] Set `LOG_LEVEL=info` (not `debug`) in production.
- [ ] Enable alerting on the `/health` and `/ready` endpoints.

---

## Scaling Beyond Single Host

For larger deployments:
1. Move PostgreSQL and Redis to managed services (RDS, ElastiCache, etc.).
2. Run multiple `api` container replicas behind a load balancer.
3. Use AWS S3 / GCP GCS instead of MinIO.
4. Use a CDN for frontend static assets.

See [Scalability](../engineering/scalability.md) for details.

---

## Related Documents

- [Local Development](../operations/local-development.md)
- [Environment Configuration](../operations/environment-configuration.md)
- [Backups & Recovery](../operations/backups-and-recovery.md)
- [Scalability](../engineering/scalability.md)
