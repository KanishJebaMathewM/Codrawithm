# Repository Structure

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm uses a **monorepo** managed with pnpm workspaces (frontend) and Cargo workspaces (Rust). Both are in the same Git repository.

---

## Top-Level Layout

```
Codrawithm/
├── apps/
│   └── web/                   # React frontend SPA
│
├── packages/                  # Shared frontend packages
│   ├── ui/                    # Design system, shadcn/ui components, icons
│   ├── canvas-core/           # Canvas engine (shared, testable independently)
│   └── shared-types/          # TypeScript types shared between packages
│
├── crates/                    # Rust workspace
│   └── api/                   # Backend API server (Axum)
│       ├── src/
│       ├── migrations/
│       ├── Cargo.toml
│       └── Cargo.lock
│
├── docs/                      # Project documentation
│   ├── README.md
│   ├── vision/
│   ├── product/
│   ├── design/
│   ├── architecture/
│   ├── engineering/
│   ├── collaboration/
│   ├── plugins/
│   ├── operations/
│   ├── roadmap/
│   ├── community/
│   └── glossary.md
│
├── .github/
│   ├── workflows/             # GitHub Actions CI/CD
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docker-compose.yml         # Local development + production compose
├── Caddyfile                  # Caddy reverse proxy config
├── .env.example               # Environment variable template
├── pnpm-workspace.yaml        # pnpm workspace config
├── package.json               # Root package.json (workspace scripts)
├── turbo.json                 # Turborepo task pipeline
├── Cargo.toml                 # Rust workspace root
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── SECURITY.md
```

---

## `apps/web/` — React Frontend

```
apps/web/
├── src/
│   ├── main.tsx
│   ├── router.tsx
│   ├── app.tsx
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── canvas/
│   │   │   ├── engine/
│   │   │   ├── tools/
│   │   │   └── objects/
│   │   ├── collaboration/
│   │   ├── algorithm-viz/
│   │   ├── three-d/
│   │   ├── ai-studio/
│   │   ├── plugins/
│   │   ├── presentation/
│   │   └── export/
│   ├── stores/
│   ├── api/
│   ├── lib/
│   └── components/
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## `packages/ui/` — Design System

```
packages/ui/
├── src/
│   ├── components/            # shadcn/ui components (copied in)
│   ├── tokens/                # CSS custom properties, Tailwind config
│   ├── icons/                 # Tool icons (SVG)
│   └── index.ts               # Re-exports
├── package.json
└── tsconfig.json
```

---

## `crates/api/` — Rust Backend

```
crates/api/
├── src/
│   ├── main.rs
│   ├── config.rs
│   ├── errors.rs
│   ├── modules/
│   │   ├── auth/
│   │   ├── boards/
│   │   ├── collaboration/
│   │   ├── assets/
│   │   ├── ai/
│   │   ├── plugins/
│   │   └── health/
│   └── infra/
│       ├── db.rs
│       ├── redis.rs
│       ├── s3.rs
│       └── email.rs
├── migrations/
├── tests/
│   ├── integration/
│   └── fixtures/
├── Cargo.toml
└── Cargo.lock
```

---

## CI/CD Workflows

```
.github/workflows/
├── ci.yml                     # On every PR: lint, test, build
├── release.yml                # On tag push: build Docker image, publish changelog
└── docs-deploy.yml            # On main push: deploy docs site (optional)
```

### `ci.yml` Pipeline

```yaml
jobs:
  frontend:
    - pnpm install
    - pnpm turbo lint
    - pnpm turbo test
    - pnpm turbo build

  backend:
    - cargo fmt --check
    - cargo clippy -- -D warnings
    - cargo test

  e2e:
    - pnpm playwright test (runs after frontend + backend build)

  perf:
    - canvas-fps-benchmark (optional, reports to PR)
```

---

## Package Manager and Tooling

| Tool | Usage |
|------|-------|
| pnpm | Frontend package manager; workspace support |
| Turborepo | Task pipeline (cache, parallel execution) |
| Cargo | Rust package manager and build system |
| Docker Compose | Local dev and production deployment |
| changesets | Versioning and CHANGELOG generation |
| Husky | Git hooks (lint + test before commit) |
| lint-staged | Run linters only on changed files |

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Package names | `@codrawithm/package-name` | `@codrawithm/ui` |
| Crate names | `codrawithm-module` | `codrawithm-api` |
| Directory names | `kebab-case` | `canvas-core/` |
| TypeScript files | `kebab-case.ts` | `canvas-store.ts` |
| React components | `PascalCase.tsx` | `RectangleRenderer.tsx` |
| Rust files | `snake_case.rs` | `board_service.rs` |

---

## Related Documents

- [Coding Standards](coding-standards.md)
- [Engineering — Local Development](../operations/local-development.md)
- [Contribution Guide](../community/contribution-guide.md)
