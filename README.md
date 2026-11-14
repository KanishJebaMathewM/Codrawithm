# Codrawithm

<div align="center">

**The Unified Open-Source Visual Workspace for Developers, Learners, and Educators.**

Draw architectures, map systems, explore algorithms step-by-step, annotate technical workflows, and collaborate in real-time on one flexible canvas.

[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?logo=discord&logoColor=white)](https://discord.gg/7MhyE48Au)
[![License](https://img.shields.io/badge/License-Apache%202.0%20%2F%20MIT-blue.svg)](LICENSE-DECISION.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](apps/web)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)](apps/web)
[![Rust](https://img.shields.io/badge/Rust-Axum%200.7-DEA584?logo=rust&logoColor=black)](apps/api)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Join Discord](https://discord.gg/7MhyE48Au) · [Documentation](docs/README.md) · [Contributing Guide](CONTRIBUTING.md) · [Discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions) · [Issues](https://github.com/KanishJebaMathewM/Codrawithm/issues)

</div>

---

> 💬 **Join our Discord Community!**
> 
> We have an active Discord server dedicated to **Codrawithm** and the wider open-source ecosystem:  
> 👉 **[https://discord.gg/7MhyE48Au](https://discord.gg/7MhyE48Au)**  
> 
> Jump in to:
> - Discuss project features, UX ideas, and technical architecture.
> - Share and brainstorm ideas about **Codrawithm and other open-source projects**.
> - Get help with local development and environment setup.
> - Find issues to contribute to and collaborate with fellow builders.

---

## Table of Contents

- [What is Codrawithm?](#what-is-codrawithm)
- [Key Features](#key-features)
- [Monorepo Architecture](#monorepo-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend & Database Setup](#backend--database-setup)
  - [Verification & Testing](#verification--testing)
- [Documentation Hub](#documentation-hub)
- [Community & Communication](#community--communication)
- [Contributing](#contributing)
- [License](#license)

---

## What is Codrawithm?

Today, developers, educators, and learners constantly switch between disjointed tools:
- Freehand whiteboard tools for sketching rough concepts
- Flowchart or diagram editors for architecture diagrams
- Scratchpads and note apps for pseudocode and meeting minutes
- Standalone DSA visualizers or slides to explain algorithms

**Codrawithm unites these workflows onto a single, high-performance canvas.** 

Whether you are sketching a system design, breaking down an algorithmic problem step by step, teaching a technical workshop, or brainstorming with a remote team, Codrawithm gives you the visual and programmatic tools to express complex ideas seamlessly.

---

## Key Features

- 🎨 **Infinite Interactive Canvas:** Konva-powered vector canvas supporting freehand drawing, geometric shapes, dynamic arrow connectors, sticky notes, frames, and minimap navigation.
- ⚡ **Algorithm Lab (`/algorithm`):** Interactive, step-by-step visualizer for data structures and algorithms (sorting, tree traversals, graph algorithms, array manipulation).
- 👥 **Real-Time Multiplayer Collaboration:** WebSocket communication with CRDT-based state synchronization, member presence indicators, and live cursor tracking.
- 🦀 **Robust Rust & Axum Backend:** Fast, memory-safe backend API managing board state, persistence, snapshots, comments, and authentication.
- 🧩 **Modular Monorepo Structure:** Clear architectural separation between the web frontend, backend services, core canvas engine, schemas, diffing, and plugin SDKs.
- 📖 **Comprehensive Architecture & Specs:** Over 60 Architecture Decision Records (ADRs), system context models, and engineering specifications in [`docs/`](docs/README.md).

---

## Monorepo Architecture

Codrawithm is organized as a workspace monorepo:

```text
Codrawithm/
├── apps/
│   ├── web/                    # React 18 + Vite + Konva + Zustand + Tailwind CSS frontend
│   └── api/                    # Rust + Axum + Tokio + SQLx real-time backend service
├── packages/
│   ├── canvas-core/            # Core canvas rendering engine, tools, viewport, and hit-testing
│   ├── board-schema/           # Zod schemas, data contracts, and validation for board objects
│   ├── board-diff/             # Structural diffing, patching, and version comparison utilities
│   ├── shortcuts/              # Configurable keyboard shortcuts engine
│   ├── a11y-outline/           # Accessibility tree and canvas navigation helpers
│   ├── shared-types/           # Cross-package shared types and models
│   ├── plugin-sdk/             # Extensible plugin interfaces and manifest definitions
│   └── ui/                     # Shared UI components and primitives
├── docs/                       # Complete product vision, ADRs, and engineering specifications
└── docker-compose.yml          # Local infrastructure (PostgreSQL 16 & Redis 7)
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Konva / React-Konva, Zustand, TanStack Router, Tailwind CSS, Lucide Icons |
| **Backend** | Rust (stable >= 1.75), Axum 0.7, Tokio, WebSockets (`tower-http`), SQLx, Argon2id, JWT |
| **Data & Cache** | PostgreSQL 16 (JSONB CRDT storage), Redis 7 (pub/sub & caching) |
| **Testing** | Vitest, Playwright (E2E), Cargo test |
| **Package Management** | pnpm workspaces |

---

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- **Node.js:** v18.0.0 or higher
- **pnpm:** v9.0.0 or higher (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker Desktop:** Required for running local PostgreSQL and Redis services
- **Rust (optional, for backend development):** Stable 1.75+ via [rustup.rs](https://rustup.rs/)

---

### Frontend Setup

To get the web application running locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KanishJebaMathewM/Codrawithm.git
   cd Codrawithm
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**  
   Navigate to [`http://localhost:3000`](http://localhost:3000).
   - `/` — Workspace dashboard and board management
   - `/board/:boardId` — Interactive canvas workspace
   - `/algorithm` — Algorithm Lab visualization playground

---

### Backend & Database Setup

If you are developing or testing the backend API and real-time collaboration service:

1. **Start PostgreSQL and Redis via Docker Compose:**
   ```bash
   docker compose up -d
   ```

2. **Navigate to the API service:**
   ```bash
   cd apps/api
   ```

3. **Configure environment variables:**
   Copy the sample environment file if not already present:
   ```bash
   cp .env.example .env
   ```

4. **Run the backend server:**
   ```bash
   cargo run
   ```
   The backend service starts at `http://127.0.0.1:3002`. Migrations are applied automatically on boot.

---

### Verification & Testing

Run the automated checks across the workspace:

```bash
# Typecheck TypeScript code
pnpm typecheck

# Run frontend unit tests
pnpm test

# Build production bundles
pnpm build

# Run Rust API tests (from repo root)
cargo test --manifest-path apps/api/Cargo.toml
```

---

## Documentation Hub

Detailed documentation is available in the [`docs/`](docs/README.md) directory:

- 🎯 **[Product Vision & Personas](docs/vision/product-vision.md):** Target audience, problem space, and product roadmap.
- 🏛️ **[System Architecture](docs/architecture/overview.md):** High-level design, C4 diagrams, and tech evaluations.
- 📝 **[Architecture Decision Records (ADRs)](docs/architecture/architecture-decisions/):** 15+ documented decisions on stack, licensing, rendering, and database design.
- 🤝 **[Collaboration Engine](docs/collaboration/sync-protocol.md):** CRDT synchronization, conflict resolution, and WebSocket transport.
- 🔌 **[Plugin System](docs/plugins/plugin-api.md):** APIs and sandboxing for third-party extensions.
- 🛠️ **[Local Development & Operations](docs/operations/local-development.md):** Detailed environment configuration and deployment instructions.

---

## Community & Communication

We believe in building and learning together in public.

- 💬 **Discord:** [Join the Codrawithm Discord Server](https://discord.gg/7MhyE48Au)  
  Our Discord is the central hub for:
  - Discussions on Codrawithm roadmap, design, and implementation
  - Brainstorming, feedback, and collaboration on **other open-source projects**
  - Q&A, setup assistance, and direct chats with contributors
- 💡 **GitHub Discussions:** [Join GitHub Discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions) to propose major ideas or share use cases.
- 🐛 **Issue Tracker:** [Browse open issues](https://github.com/KanishJebaMathewM/Codrawithm/issues) to report bugs or request features.

---

## Contributing

Contributions of all kinds are warmly welcomed! Whether you are interested in:
- Building UI components or canvas tools
- Adding new algorithm visualizers to the Algorithm Lab
- Improving backend endpoints or collaboration protocols
- Writing documentation, tutorials, or sharing real-world use cases

Please review our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

---

## License

Codrawithm is an open-source project. Licensing decisions and dual-licensing evaluation (MIT / Apache 2.0) are documented in [LICENSE-DECISION.md](LICENSE-DECISION.md).
