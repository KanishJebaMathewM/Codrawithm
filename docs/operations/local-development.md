# Local Development

**Status:** Proposed  
**Audience:** All contributors  
**Last Reviewed:** 2024-01-15

> The application is not yet implemented. This document describes the intended local development setup for when implementation begins.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20 LTS | Frontend build, tooling |
| pnpm | ≥ 8 | Package manager (preferred over npm/yarn) |
| Rust | ≥ 1.75 (stable) | Backend API |
| Docker Desktop | Latest | PostgreSQL + Redis via Docker Compose |
| Git | ≥ 2.40 | Version control |

**Optional but recommended:**
- `cargo-watch` — auto-rebuild Rust on file changes (`cargo install cargo-watch`)
- `sqlx-cli` — database migrations (`cargo install sqlx-cli`)
- VS Code with extensions: Rust Analyzer, ESLint, Prettier, Tailwind CSS IntelliSense

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/KanishJebaMathewM/Codrawithm.git
cd Codrawithm

# 2. Install Node dependencies
pnpm install

# 3. Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# 4. Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# 5. Run database migrations
cd apps/api && sqlx migrate run

# 6. Start the backend (in one terminal)
cd apps/api && cargo watch -x run

# 7. Start the frontend (in another terminal)
cd apps/web && pnpm dev
```

Open http://localhost:5173 in your browser.

---

## Repository Structure

```
Codrawithm/
├── apps/
│   ├── web/                 # React + TypeScript frontend (Vite)
│   └── api/                 # Rust + Axum backend
├── packages/
│   ├── canvas-core/         # Canvas engine (shared library)
│   ├── plugin-sdk/          # Plugin SDK (shipped to plugin developers)
│   └── shared-types/        # Shared TypeScript types
├── docs/                    # All documentation (you are here)
├── docker-compose.yml       # Local infrastructure
├── docker-compose.prod.yml  # Production compose (reference)
└── Makefile                 # Common development commands
```

See [repository-structure.md](../engineering/repository-structure.md) for full details.

---

## Docker Compose Services

```yaml
# docker-compose.yml (planned)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: codrawithm_dev
      POSTGRES_USER: codrawithm
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

Start: `docker compose up -d`  
Stop: `docker compose down`  
Reset data: `docker compose down -v`

---

## Environment Variables

See [environment-configuration.md](./environment-configuration.md) for the full reference.

Minimum required for local development:

**`apps/web/.env.local`**
```bash
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

**`apps/api/.env`**
```bash
DATABASE_URL=postgres://codrawithm:devpassword@localhost:5432/codrawithm_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=local-dev-secret-change-in-production
PORT=3000
RUST_LOG=debug
```

---

## Running Tests

```bash
# Frontend unit tests
cd apps/web && pnpm test

# Frontend e2e tests (requires running dev server)
cd apps/web && pnpm test:e2e

# Backend unit + integration tests
cd apps/api && cargo test

# All tests from root
make test
```

---

## Common Makefile Commands

```makefile
make dev          # Start frontend + backend in watch mode
make test         # Run all tests
make lint         # Lint frontend (ESLint) + backend (clippy)
make format       # Format frontend (Prettier) + backend (rustfmt)
make db-migrate   # Run pending database migrations
make db-reset     # Drop and recreate database, run migrations
make build        # Production build (frontend + backend)
```

---

## Troubleshooting

**Port already in use:**
```bash
# Find what's on port 5432
netstat -ano | findstr :5432   # Windows
lsof -i :5432                  # macOS/Linux
```

**Database connection refused:**
- Ensure Docker Desktop is running
- Run `docker compose ps` to check container status
- Run `docker compose logs postgres` for database errors

**Rust build fails:**
- Ensure Rust stable is installed: `rustup show`
- Update Rust: `rustup update stable`
- Clear build cache: `cargo clean`

**pnpm not found:**
```bash
npm install -g pnpm
```

---

## Related Documents

- [Environment Configuration](./environment-configuration.md)
- [Database Migrations](./database-migrations.md)
- [Repository Structure](../engineering/repository-structure.md)
- [Coding Standards](../engineering/coding-standards.md)
- [Contributing Guide](../community/contribution-guide.md)
