# Product Vision

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Mission Statement

Codrawithm exists to give developers, learners, educators, and creative teams a single open-source visual workspace where ideas, code, diagrams, algorithms, and 3D models live side by side — without context-switching between six different tools.

> "One canvas. Every dimension of your thinking."

---

## The Core Problem

Developers draw architecture diagrams in one app, visualize algorithms in another, sketch UI flows in a third, and collaborate in a fourth. Each tool has its own file format, its own sharing model, and its own steep learning curve. The result is fragmented knowledge, lost context, and hours spent copying screenshots between apps.

Codrawithm rejects that fragmentation. It treats all visual thinking as a first-class citizen and puts it in one place — on a canvas that understands code, data structures, 3D space, and real-time collaboration.

---

## Guiding Philosophy

### 1. Developer-First, Not Developer-Only
The primary lens is the developer experience. Keyboard shortcuts, code blocks, algorithm playback, and integration with developer mental models (graphs, trees, state machines) are not afterthoughts — they are core features. But the workspace must also be accessible to non-developers who collaborate with engineering teams.

### 2. Open by Default
The project is fully open-source (AGPL-3.0 or Apache-2.0 — see [ADR-014](../architecture/architecture-decisions/ADR-014-open-source-license.md)). The data format is open and self-hostable. No vendor lock-in. Community plugins extend the platform.

### 3. Progressive Complexity
A new user should be able to draw a box and connect it to another box in under 10 seconds. An expert user should be able to build a complex multi-layer architecture diagram with live algorithm animations without hitting any ceiling. Complexity is earned, not imposed.

### 4. Real-Time First
Collaboration is not a feature to be added later. The canvas is designed from the ground up around Conflict-free Replicated Data Types (CRDTs), so multiple users can edit simultaneously without explicit locking or data loss.

### 5. Extensible at Every Layer
Users can extend the platform through plugins — from simple shape libraries to full AI-powered code generators — without forking the core. The plugin system is sandboxed, permissioned, and community-governed.

### 6. No Dark Patterns
Codrawithm will never lock content behind a paywall retroactively. Self-hosting is always a first-class option. Free-tier users retain full export rights over their own data.

---

## Long-Term Vision

### 3–5 Years: Unified Developer Visual OS
Codrawithm becomes the default open-source visual workspace for engineering teams the way VS Code became the default editor. Teams run it self-hosted, integrate it with their CI/CD pipelines, and use it for everything from system design interviews to live architecture reviews.

Key milestones on this path:
- Algorithm visualization becomes the go-to tool for CS educators and interview prep.
- The plugin ecosystem has 50+ community-contributed tools.
- Large-scale canvases (10,000+ objects) run smoothly in the browser.
- Self-hosted deployments support 100+ concurrent editors on a single board.

### 5–10 Years: Living Documentation
Diagrams in Codrawithm become connected to the codebases they describe. A system architecture diagram updates automatically when a service is added. An algorithm visualization can be generated from real code. The canvas becomes a living technical document, not a stale PNG.

---

## What Codrawithm Is Not

See [non-goals.md](non-goals.md) for the full list. In short:
- Not a replacement for a full IDE or code editor.
- Not a general-purpose video conferencing tool.
- Not a document editor (Google Docs / Notion alternative).
- Not a project management tool (Jira / Linear alternative).

---

## Related Documents

- [Problem Statement](problem-statement.md)
- [Target Audiences](target-audiences.md)
- [Non-Goals](non-goals.md)
- [Feature Catalog](feature-catalog.md)
- [Product Roadmap](../roadmap/product-roadmap.md)
