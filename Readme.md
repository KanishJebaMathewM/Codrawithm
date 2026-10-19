<div align="center">

<img src="docs/assets/banner-placeholder.png" alt="Codrawithm Banner" width="100%" />

# Codrawithm

**One canvas for drawing, diagramming, visualizing algorithms, and thinking together.**

[![Status](https://img.shields.io/badge/status-early%20ideation-orange)](https://github.com/KanishJebaMathewM/Codrawithm/discussions)
[![License](https://img.shields.io/badge/license-TBD-lightgrey)](./LICENSE-DECISION.md)
[![Discussions](https://img.shields.io/github/discussions/KanishJebaMathewM/Codrawithm)](https://github.com/KanishJebaMathewM/Codrawithm/discussions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](./CONTRIBUTING.md)

[**Discuss Ideas**](https://github.com/KanishJebaMathewM/Codrawithm/discussions) · [**Browse Issues**](https://github.com/KanishJebaMathewM/Codrawithm/issues) · [**Read the Docs**](./docs/README.md) · [**Contribute**](./CONTRIBUTING.md)

</div>

---

> **⚠ Pre-development notice.** Codrawithm is a proposal and design, not a finished application. Every feature described here is planned, not built. Join the discussion and help shape what it becomes.

---

## What is Codrawithm?

Codrawithm is an open-source interactive visual workspace — think whiteboard, diagramming tool, algorithm visualizer, and collaborative canvas rolled into one.

Developers, learners, and educators constantly switch between tools: one app for diagrams, another for notes, another to visualize an algorithm, another to collaborate. Codrawithm explores whether a single, well-designed canvas can replace all of that.

```
Draw a binary tree → step through BFS → annotate with pseudocode → share with a teammate.
All in one place. No switching apps.
```

---

## The Problem

When thinking through a technical problem, you might need to:

- sketch a data structure before implementing it
- trace an algorithm step by step
- draw a system architecture or API flow
- explain a concept to a teammate live
- build a mind map while brainstorming

Today this means juggling 4–5 different tools. Codrawithm is exploring whether one flexible canvas, purpose-built for visual thinking, can do all of it well.

---

## Planned Capabilities

> These are design goals, not shipped features.

| Capability | Description |
|-----------|-------------|
| 🎨 **Infinite Canvas** | Pan, zoom, draw, annotate freely with shapes, text, connectors, and freehand tools |
| 🔁 **Algorithm Visualization** | Step-by-step BFS, DFS, sorting, trees, graphs with play/pause/rewind controls |
| 📐 **Diagram Workspaces** | Specialized modes for flowcharts, system architecture, ER diagrams, and mind maps |
| 🤝 **Real-time Collaboration** | Live cursors, shared editing, presence indicators, and role-based permissions |
| 🤖 **AI Plugin Platform** | Generate diagrams from text prompts via a secure, extensible plugin system |
| 🧊 **3D Workspace** | Optional three-dimensional scene editor for data structures and spatial layouts |
| 🎓 **Teaching & Presentations** | Presentation mode, follow-presenter, guided walkthroughs, and classroom boards |
| 📦 **Import / Export** | PNG, SVG, JSON, and more — your boards, your data |

---

## Who Is It For?

- **DSA learners** who want to visualize algorithms, not just read about them
- **Developers** sketching system designs, API flows, or debugging logic
- **Educators and mentors** explaining concepts visually in real time
- **Interview candidates** practicing system design and algorithm communication
- **Teams** brainstorming, planning, and working through problems together
- **Technical content creators** building diagrams and explainers

---

## Technology Direction

No stack is finalized. Here's what's under serious consideration:

| Layer | Candidate | Notes |
|-------|-----------|-------|
| Frontend | React + TypeScript + Vite | Type-safe, fast HMR, great ecosystem |
| Styling | Tailwind CSS + shadcn/ui | Accessible components, design tokens |
| Canvas | Konva.js | MIT license, Canvas 2D, good hit-testing |
| 3D | Three.js (lazy-loaded) | Kept separate from 2D bundle |
| Collaboration | Yjs (CRDT) + WebSockets | MIT, proven, offline-capable |
| Backend | Rust + Axum + Tokio | Performance, memory safety, yrs (Rust Yjs) |
| Database | PostgreSQL + JSONB | Relational + flexible board document storage |
| Cache / RT | Redis | Rate limiting, pub/sub for WS fan-out |

See [Architecture Overview](./docs/architecture/overview.md) and all [Architecture Decision Records](./docs/architecture/architecture-decisions/README.md) for the full reasoning.

---

## Project Status

| Area | Status |
|------|--------|
| Product vision & documentation | ✅ Complete |
| Architecture decisions (ADRs) | 🔄 In progress / community discussion |
| License selection | ⏳ Pending community vote |
| Canvas rendering prototype | ⏳ Not started |
| Collaboration prototype | ⏳ Not started |
| Application implementation | ❌ Not started |

---

## Roadmap (Phases)

```
Phase 0 → Requirements & validation (← we are here)
Phase 1 → Core 2D canvas (shapes, text, connectors, undo/redo, export)
Phase 2 → Developer tools (Algorithm Lab, DSA visualization, diagram workspaces)
Phase 3 → Real-time collaboration (Yjs sync, cursors, permissions)
Phase 4 → AI plugin platform (secure prompts, diagram generation)
Phase 5 → 3D workspace + advanced creative tools
Phase 6 → Production hardening (security audit, accessibility, launch)
```

Full roadmap: [docs/roadmap/product-roadmap.md](./docs/roadmap/product-roadmap.md)

---

## Documentation

All design and technical documentation lives in [`docs/`](./docs/README.md).

| Section | What's Inside |
|---------|--------------|
| [Vision](./docs/vision/product-vision.md) | Why this exists, who it's for, what success looks like |
| [Feature Catalog](./docs/vision/feature-catalog.md) | Every planned feature with priority and acceptance criteria |
| [Architecture](./docs/architecture/overview.md) | System design, tech stack, canvas engine, collaboration engine |
| [ADRs](./docs/architecture/architecture-decisions/README.md) | 15 Architecture Decision Records with trade-off analysis |
| [Design System](./docs/design/design-system.md) | UI components, tokens, interaction patterns |
| [Engineering](./docs/engineering/testing-strategy.md) | Testing, performance, security, release process |
| [Roadmap](./docs/roadmap/product-roadmap.md) | Phased plan with milestones and exit criteria |
| [Contributing](./docs/community/contribution-guide.md) | How to get involved from day one |

---

## How to Contribute Right Now

You don't need to wait for code to exist. The most valuable early contributions are:

### 💬 Join the Discussion
Share a use case, compare tools, debate an architecture choice — [GitHub Discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions)

### 🔬 Run a Research Spike
Time-boxed technical experiments that reduce uncertainty. See [research-spikes.md](./docs/roadmap/research-spikes.md) for open investigations.

### 📝 Improve Documentation
Find something unclear, missing, or wrong? Fix it. Every doc file is fair game.

### 🎨 Design Contributions
Wireframes, interaction proposals, icon sets, design critiques — all valuable at this stage.

### 🏗 Prototype
Build a small standalone experiment. Open a discussion with your findings. No PR required.

See the full [Contribution Guide](./docs/community/contribution-guide.md) and [Good First Issues](./docs/community/good-first-issues.md).

---

## Repository Structure

```
Codrawithm/
├── apps/
│   ├── web/                    # React + TypeScript frontend
│   └── api/                    # Rust + Axum backend
├── packages/
│   ├── canvas-core/            # Canvas engine (shared library)
│   ├── plugin-sdk/             # Plugin SDK for third-party developers
│   └── shared-types/           # Shared TypeScript types
├── docs/                       # All documentation (see docs/README.md)
├── .github/                    # Issue templates, PR template
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── LICENSE-DECISION.md
```

---

## Community

- **Discussions:** [github.com/KanishJebaMathewM/Codrawithm/discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions)
- **Issues:** [github.com/KanishJebaMathewM/Codrawithm/issues](https://github.com/KanishJebaMathewM/Codrawithm/issues)
- **Code of Conduct:** [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

---

## License

The project license has not yet been selected. See [LICENSE-DECISION.md](./LICENSE-DECISION.md) for the evaluation of AGPL-3.0, Apache-2.0, and MIT — and how to weigh in on the community vote.

---

<div align="center">

**Codrawithm is shaped by everyone who discusses, questions, prototypes, and builds.**  
Start with a conversation. The code will follow.

</div>
