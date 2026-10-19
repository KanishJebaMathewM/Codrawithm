# Codrawithm Documentation

Welcome to the Codrawithm documentation hub. This index covers every section of the project's documentation — from the original product vision through architecture decisions and operational guides.

> **Status:** Pre-development / Early Ideation. Nothing described here is implemented yet. All features are proposed.

---

## Quick Navigation

| Section | Description |
|---------|-------------|
| [Vision](#vision) | Why Codrawithm exists, who it's for, what success looks like |
| [Product](#product) | Workspace types, tools, and feature specifications |
| [Design](#design) | UI/UX principles, layout, design system, interactions |
| [Architecture](#architecture) | System design, tech stack, ADRs |
| [Engineering](#engineering) | Coding standards, testing, performance, security |
| [Collaboration](#collaboration) | Real-time sync, conflict resolution, presence |
| [Plugins](#plugins) | Plugin system, API, security, examples |
| [Operations](#operations) | Local dev, deployment, migrations, incident response |
| [Roadmap](#roadmap) | Phased roadmap, milestones, risks, open questions |
| [Community](#community) | Contributing, governance, discussions |
| [Glossary](#glossary) | Terms and definitions |

---

## Vision

| Document | Description |
|----------|-------------|
| [Product Vision](vision/product-vision.md) | Mission statement, guiding philosophy, long-term vision |
| [Problem Statement](vision/problem-statement.md) | The fragmented visual-tooling problem for developers |
| [Target Audiences](vision/target-audiences.md) | Six audience segments with needs analysis |
| [User Personas](vision/user-personas.md) | Five detailed user personas |
| [User Journeys](vision/user-journeys.md) | End-to-end journeys for three key personas |
| [Feature Catalog](vision/feature-catalog.md) | Full feature list with priorities and acceptance criteria |
| [Requirements](vision/requirements.md) | Functional and non-functional requirements |
| [Non-Goals](vision/non-goals.md) | Explicit out-of-scope items |
| [Success Metrics](vision/success-metrics.md) | KPIs, engagement metrics, performance targets |

---

## Product

| Document | Description |
|----------|-------------|
| [Workspace Types](product/workspace-types.md) | All 14 workspace types |
| [Canvas Tools](product/canvas-tools.md) | Drawing and annotation tools |
| [Developer Studio](product/developer-studio.md) | Code editor, UML, flowchart tools |
| [Algorithm Visualization](product/algorithm-visualization.md) | DSA step-by-step visualization |
| [AI Studio](product/ai-studio.md) | AI integration and plugin platform |
| [3D Workspace](product/3d-workspace.md) | 3D editing and viewing |
| [Simulation Engine](product/simulation-engine.md) | Simulation workspace concept |
| [Teaching & Presentations](product/teaching-and-presentations.md) | Presentation mode, follow-presenter |
| [Collaboration](product/collaboration.md) | Collaboration features from user perspective |
| [Import / Export](product/import-export.md) | Supported formats and data portability |
| [Accessibility](product/accessibility.md) | WCAG 2.1 AA requirements |
| [Pricing & Monetization](product/pricing-and-monetization.md) | Free/Pro tiers, contributor perks |

---

## Design

| Document | Description |
|----------|-------------|
| [Design Principles](design/design-principles.md) | Core design philosophy |
| [Interface Layout](design/interface-layout.md) | Application layout zones and panels |
| [Workspace Navigation](design/workspace-navigation.md) | Navigation patterns and minimap |
| [Design System](design/design-system.md) | Design tokens, shadcn/ui, theming |
| [Colors & Themes](design/colors-and-themes.md) | Color palette and dark mode |
| [Keyboard Shortcuts](design/keyboard-shortcuts.md) | Complete keyboard shortcut reference |
| [Interaction Patterns](design/interaction-patterns.md) | Selection, drag, resize, touch |

---

## Architecture

| Document | Description |
|----------|-------------|
| [Overview](architecture/overview.md) | High-level architecture with system context diagram |
| [Technology Stack](architecture/technology-stack.md) | Full tech stack evaluation |
| [System Context (C4 L1)](architecture/system-context.md) | C4 Level 1 diagram |
| [Application Architecture (C4 L2)](architecture/application-architecture.md) | C4 Level 2 diagram |
| [Frontend Architecture](architecture/frontend-architecture.md) | Module structure, state, routing |
| [Backend Architecture](architecture/backend-architecture.md) | Rust+Axum modular monolith |
| [Canvas Engine](architecture/canvas-engine.md) | Scene model, hit testing, rendering |
| [Rendering Pipeline](architecture/rendering-pipeline.md) | Canvas 2D vs SVG vs WebGL |
| [3D Rendering](architecture/3d-rendering.md) | Three.js vs React Three Fiber |
| [Collaboration Engine](architecture/collaboration-engine.md) | Yjs CRDT, WebSocket transport |
| [Plugin System](architecture/plugin-system.md) | Manifests, sandboxing, lifecycle |
| [AI Integration](architecture/ai-integration.md) | Backend proxy, provider abstraction |
| [Data Model](architecture/data-model.md) | Domain model and JSON schemas |
| [Database Design](architecture/database-design.md) | PostgreSQL schema, JSONB |
| [API Design](architecture/api-design.md) | REST conventions and error handling |
| [Storage & Assets](architecture/storage-and-assets.md) | Object storage, upload validation |
| [Authentication & Authorization](architecture/authentication-and-authorization.md) | JWT, RBAC |
| [Deployment Architecture](architecture/deployment-architecture.md) | Docker Compose topology |

### Architecture Decision Records

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](architecture/architecture-decisions/ADR-001-web-first-architecture.md) | Web-First Architecture | Proposed |
| [ADR-002](architecture/architecture-decisions/ADR-002-modular-monolith.md) | Modular Monolith Backend | Proposed |
| [ADR-003](architecture/architecture-decisions/ADR-003-frontend-framework.md) | Frontend Framework | Proposed |
| [ADR-004](architecture/architecture-decisions/ADR-004-canvas-rendering-approach.md) | Canvas Rendering Approach | Proposed |
| [ADR-005](architecture/architecture-decisions/ADR-005-scene-document-model.md) | Scene Document Model | Proposed |
| [ADR-006](architecture/architecture-decisions/ADR-006-3d-rendering-framework.md) | 3D Rendering Framework | Proposed |
| [ADR-007](architecture/architecture-decisions/ADR-007-state-management.md) | State Management | Proposed |
| [ADR-008](architecture/architecture-decisions/ADR-008-real-time-collaboration.md) | Real-Time Collaboration | Proposed |
| [ADR-009](architecture/architecture-decisions/ADR-009-backend-language-framework.md) | Backend Language & Framework | Proposed |
| [ADR-010](architecture/architecture-decisions/ADR-010-database-and-storage.md) | Database and Storage | Proposed |
| [ADR-011](architecture/architecture-decisions/ADR-011-ai-provider-integration.md) | AI Provider Integration | Proposed |
| [ADR-012](architecture/architecture-decisions/ADR-012-plugin-sandboxing.md) | Plugin Sandboxing | Proposed |
| [ADR-013](architecture/architecture-decisions/ADR-013-authentication-approach.md) | Authentication Approach | Proposed |
| [ADR-014](architecture/architecture-decisions/ADR-014-open-source-license.md) | Open-Source License | Proposed |
| [ADR-015](architecture/architecture-decisions/ADR-015-performance-measurement.md) | Performance Measurement | Proposed |

Full index: [architecture/architecture-decisions/README.md](architecture/architecture-decisions/README.md)

---

## Engineering

| Document | Description |
|----------|-------------|
| [Repository Structure](engineering/repository-structure.md) | Monorepo layout |
| [Coding Standards](engineering/coding-standards.md) | TypeScript strict, Rust clippy, formatting |
| [Error Handling](engineering/error-handling.md) | Error patterns for TS and Rust |
| [State Management](engineering/state-management.md) | Zustand stores, TanStack Query |
| [Testing Strategy](engineering/testing-strategy.md) | Unit, integration, e2e, visual regression |
| [Performance Engineering](engineering/performance-engineering.md) | Culling, Web Workers, budgets |
| [Scalability](engineering/scalability.md) | Large canvases, concurrent users |
| [Security](engineering/security.md) | XSS, CSRF, plugin isolation, threat model |
| [Observability](engineering/observability.md) | Logging, metrics, tracing |
| [Browser Compatibility](engineering/browser-compatibility.md) | Target browsers, WebGL matrix |
| [Dependency Management](engineering/dependency-management.md) | Pinned versions, license scanning |
| [Release Process](engineering/release-process.md) | Semver, changelog, CI/CD |

---

## Collaboration

| Document | Description |
|----------|-------------|
| [Sync Protocol](collaboration/sync-protocol.md) | Yjs sync with sequence diagram |
| [Conflict Resolution](collaboration/conflict-resolution.md) | CRDT conflict handling |
| [Presence & Cursors](collaboration/presence-and-cursors.md) | Awareness protocol |
| [Offline Mode](collaboration/offline-mode.md) | Offline editing and resync |
| [Permissions](collaboration/permissions.md) | Board permission model |

---

## Plugins

| Document | Description |
|----------|-------------|
| [Plugin Manifest](plugins/plugin-manifest.md) | Manifest schema |
| [Plugin API](plugins/plugin-api.md) | API surface: canvas, events |
| [Plugin Permissions](plugins/plugin-permissions.md) | What plugins can and cannot do |
| [Plugin Lifecycle](plugins/plugin-lifecycle.md) | Install/activate/uninstall |
| [AI Provider Interface](plugins/ai-provider-interface.md) | AI provider contract |
| [Example Plugin Spec](plugins/example-plugin-spec.md) | Text-to-Flowchart plugin |
| [Plugin Security](plugins/plugin-security.md) | iframe isolation, CSP, postMessage |

---

## Operations

| Document | Description |
|----------|-------------|
| [Local Development](operations/local-development.md) | Dev setup: Node.js, Rust, Docker |
| [Environment Configuration](operations/environment-configuration.md) | Env vars, secrets, .env.example |
| [Database Migrations](operations/database-migrations.md) | Migration strategy with sqlx |
| [Deployment](operations/deployment.md) | Docker Compose production guide |
| [Backups & Recovery](operations/backups-and-recovery.md) | DB and asset backup |
| [Cost Management](operations/cost-management.md) | Infrastructure cost drivers |
| [Incident Response](operations/incident-response.md) | Severity levels, playbook, postmortem |

---

## Roadmap

| Document | Description |
|----------|-------------|
| [Product Roadmap](roadmap/product-roadmap.md) | Phase 0–6 with exit criteria |
| [Milestones](roadmap/milestones.md) | Milestone deliverables |
| [Technical Risks](roadmap/technical-risks.md) | Risk register |
| [Open Questions](roadmap/open-questions.md) | Unresolved decisions |
| [Research Spikes](roadmap/research-spikes.md) | Proposed technical investigations |

---

## Community

| Document | Description |
|----------|-------------|
| [Contribution Guide](community/contribution-guide.md) | Setup, workflow, PR process |
| [Good First Issues](community/good-first-issues.md) | Guidance for new contributors |
| [Discussions Guide](community/discussions-guide.md) | How to use GitHub Discussions |
| [Decision Making](community/decision-making.md) | RFC process |
| [Project Governance](community/project-governance.md) | Governance model |

---

## Glossary

[docs/glossary.md](glossary.md) — terms and definitions for the entire project.

---

## Contributing to Documentation

Documentation lives in `docs/`. To update a document, match the existing style (factual, concise, no marketing language), mark anything not yet decided as **Proposed**, then open a PR. See [community/contribution-guide.md](community/contribution-guide.md) for the full workflow.
