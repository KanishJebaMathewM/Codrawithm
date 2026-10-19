# Technology Stack

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document describes the full recommended technology stack for Codrawithm with rationale and trade-off notes. All choices are linked to their respective ADRs where a decision record exists.

---

## Frontend

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | React | 18.x | Largest ecosystem, concurrent features for canvas rendering, team familiarity |
| Language | TypeScript | 5.x (strict) | Type safety for complex canvas state; required for plugin API contracts |
| Build tool | Vite | 5.x | Fast HMR, ES module-first, excellent TypeScript support |
| Styling | Tailwind CSS | 3.x | Utility-first; consistent with shadcn/ui; low specificity conflicts |
| Component library | shadcn/ui | latest | Accessible Radix UI primitives; owned in repo (not a dependency lock) |
| Canvas library | Konva.js | 9.x | React-Konva bridge; hardware-accelerated Canvas 2D; excellent for 2D scenes |
| 3D rendering | React Three Fiber | 8.x | Declarative Three.js; idiomatic React API |
| 3D library | Three.js | 0.160+ | Industry standard; broad community; GLTF support |
| State management | Zustand | 4.x | Minimal boilerplate; excellent TypeScript support; no context re-renders |
| Data fetching | TanStack Query | 5.x | Caching, pagination, optimistic updates; REST + future GraphQL |
| Routing | TanStack Router | 1.x | Type-safe routing; file-based routes |
| Real-time (CRDT) | Yjs | 13.x | Industry-standard CRDT; providers for WebSocket and IndexedDB |
| WebSocket client | y-websocket | latest | Yjs provider for WebSocket transport |
| Offline storage | y-indexeddb | latest | Yjs provider for offline persistence in IndexedDB |
| Form validation | Zod | 3.x | Schema-first validation; TypeScript inference |
| Syntax highlighting | Shiki | 1.x | Server-side and client-side highlighting; 100+ languages |
| Icons | Lucide React | latest | MIT-licensed; consistent; tree-shakeable |
| Animation | CSS transitions + Framer Motion (select cases) | 10.x | CSS transitions for canvas; Framer Motion for UI micro-interactions |
| Testing | Vitest | 1.x | Vite-native; fast; Jest-compatible API |
| E2E testing | Playwright | 1.x | Cross-browser; reliable canvas testing via screenshot diff |

---

## Backend

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Language | Rust | 1.75+ (stable) | Memory safety; zero-cost abstractions; excellent async performance |
| Web framework | Axum | 0.7.x | Tower-based; excellent WebSocket support; modular; type-safe extractors |
| Async runtime | Tokio | 1.x | Industry standard Rust async runtime |
| HTTP client | reqwest | 0.11+ | Async HTTP client for proxying AI requests |
| WebSocket | axum-ws / tokio-tungstenite | — | WebSocket upgrade within Axum |
| ORM / Query builder | sqlx | 0.7.x | Async-native; compile-time query checking; no magic macros |
| Migration tool | sqlx-migrate (via sqlx CLI) | — | SQL migration files; rollback support |
| Serialization | serde + serde_json | 1.x | Standard Rust serialization |
| Validation | validator | 0.16+ | Derive-based field validation |
| Authentication | JWT (jsonwebtoken crate) | 9.x | Standard JWT creation and verification |
| Password hashing | argon2 | 0.5+ | Argon2id; OWASP recommended |
| Error handling | thiserror + anyhow | — | Structured errors for library code; anyhow for application code |
| Logging | tracing + tracing-subscriber | — | Structured async-aware logging |
| Metrics | prometheus (via metrics crate) | — | Prometheus-compatible metrics |
| Configuration | config + dotenvy | — | Layered config: files + env vars |
| Testing | Rust built-in + testcontainers | — | Integration tests with real PostgreSQL in Docker |

---

## Data Layer

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Primary database | PostgreSQL | 16.x | JSONB for board state; full ACID; proven at scale |
| In-memory / pub-sub | Redis | 7.x | Pub/sub for WebSocket fan-out; ephemeral presence data; session cache |
| Object storage | S3-compatible (MinIO for self-hosted) | MinIO latest | Standard API; self-hostable; image and asset storage |
| Backups | pg_dump + WAL archiving | — | Daily dumps + continuous WAL |

---

## Infrastructure and Operations

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Container runtime | Docker | Standard; multi-platform |
| Local dev orchestration | Docker Compose | Single command local dev: `docker compose up` |
| Production orchestration | Docker Compose (small) / Kubernetes (large) | Simplicity first; Kubernetes for enterprise deployments |
| CI/CD | GitHub Actions | Free for open source; good ecosystem |
| Reverse proxy | Caddy (self-hosted) | Automatic HTTPS; simple config; Caddyfile is readable |
| Secret management | Environment variables + `.env` (dev), Docker secrets (prod) | Simple; no additional dependency |
| Health checks | `/health` and `/ready` endpoints on backend | Standard liveness/readiness probes |

---

## Development Tooling

| Tool | Usage |
|------|-------|
| pnpm | Frontend package manager (workspace-aware) |
| cargo | Rust package manager and build tool |
| rustfmt | Rust code formatter |
| clippy | Rust linter |
| ESLint | TypeScript/React linting |
| Prettier | Frontend code formatting |
| Husky | Git hooks (lint + test before commit) |
| changesets | Version management and CHANGELOG generation |

---

## Trade-Off Summary

### Why Rust for the Backend?

**Pros:** Memory safety, zero-cost abstractions, excellent async performance (Tokio), compiled binary for deployment, no garbage collection pauses.  
**Cons:** Steeper learning curve for contributors; slower initial development velocity than Node.js; smaller talent pool.  
**Decision:** The performance-critical nature of the collaboration server (WebSocket message fan-out, CRDT merging) justifies Rust. The trade-off is acceptable because contributor onboarding is explicitly documented and the plugin system does not require contributors to modify the core backend.

See [ADR-009](architecture-decisions/ADR-009-backend-language-framework.md).

### Why Konva.js for Canvas?

**Pros:** React-Konva provides a declarative API; hardware-accelerated Canvas 2D; good performance for 2D scenes; active community.  
**Cons:** Canvas 2D has a ceiling at very high object counts (5,000+); SVG-based approaches have better scaling for small-to-medium diagrams.  
**Decision:** Canvas 2D with Konva is sufficient for the initial object count targets. WebGL acceleration via Konva's WebGL renderer or a custom layer is a future option for exceeding 5,000 objects.

See [ADR-004](architecture-decisions/ADR-004-canvas-rendering-approach.md).

### Why Yjs for CRDTs?

**Pros:** Industry-standard; battle-tested in production (used by TipTap, Hocuspocus); WebSocket and offline providers available; good TypeScript support.  
**Cons:** Binary format is hard to debug; merge semantics can surprise users (concurrent deletions); Yjs updates must not be lost.  
**Decision:** Yjs is the most mature and production-ready CRDT library available for the web platform.

See [ADR-008](architecture-decisions/ADR-008-real-time-collaboration.md).

---

## Related Documents

- [Architecture Overview](overview.md)
- [Architecture Decision Records](architecture-decisions/README.md)
- [Frontend Architecture](frontend-architecture.md)
- [Backend Architecture](backend-architecture.md)
