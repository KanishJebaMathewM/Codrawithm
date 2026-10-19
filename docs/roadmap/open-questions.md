# Open Questions

**Status:** Active  
**Audience:** Community, contributors, maintainers  
**Last Reviewed:** 2024-01-15

These are unresolved questions that need community discussion or technical investigation before a decision can be made. If you have input on any of these, please open a GitHub Discussion.

---

## Product and Strategy

### OQ-001: What is the primary target audience for the first release?

**Why it matters:** A general-purpose whiteboard competes with Excalidraw, Miro, and FigJam. An algorithm visualization tool occupies a more specific niche. The initial audience shapes every product decision.

**Options:**
1. DSA learners and developers (algorithm-first)
2. General visual thinkers (whiteboard-first)
3. Developers doing system design and architecture (diagram-first)

**How to decide:** Community survey, usage data from a limited alpha, discussions with target users.

---

### OQ-002: Should the first version be local-first (no account required)?

**Why it matters:** Local-first removes the barrier of account creation and eliminates backend costs. However, it makes collaboration harder to add later and reduces our ability to understand usage.

**Options:**
1. Local-first Phase 1, cloud sync in Phase 3
2. Account required from day one (enables collaboration earlier)
3. Local storage default with optional sync

**Current thinking:** Local-first for Phase 1 preserves optionality and reduces early complexity.

---

### OQ-003: How does Codrawithm differentiate from Excalidraw?

**Why it matters:** Excalidraw is excellent, MIT-licensed, and has a large community. We need a clear answer to "why Codrawithm instead of Excalidraw?"

**Potential differentiators:**
- Step-by-step algorithm visualization (Excalidraw doesn't have this)
- Multiple specialized workspace types
- 3D workspace
- AI plugin ecosystem
- Richer developer-specific tooling

**Action:** This question should be answered in the product vision before Phase 1 begins.

---

## Technical

### OQ-004: Should the canvas use Konva.js or a custom Canvas 2D renderer?

**Why it matters:** Konva.js provides a high-level API and handles hit testing, but adds a dependency. A custom renderer gives full control but is significantly more work.

**Prototype needed:** A Canvas 2D PoC with 5,000 objects, viewport culling, and basic selection to measure whether Konva meets performance requirements.

See [ADR-004](../architecture/architecture-decisions/ADR-004-canvas-rendering-approach.md).

---

### OQ-005: How should multi-page boards be represented in Yjs?

**Options:**
1. One Y.Doc per board, pages as Y.Arrays within it
2. One Y.Doc per page (simpler isolation, but harder cross-page references)

**Implication:** Option 1 allows cross-page connectors and references. Option 2 simplifies sync and reduces memory per active connection.

---

### OQ-006: Should Rust be required for contributors, or is TypeScript a valid alternative?

**Why it matters:** Requiring Rust may deter contributors who don't know the language. But splitting backend between TypeScript and Rust creates two maintenance surfaces.

See [ADR-009](../architecture/architecture-decisions/ADR-009-backend-language-framework.md).

---

### OQ-007: What is the plan for mobile?

**Options:**
1. Responsive web only — no native apps
2. Progressive Web App (PWA) for installability
3. React Native / Flutter apps (much later)
4. Tauri for desktop (later)

**Current thinking:** Responsive web first. PWA features (installability, offline) can be added to the web app without a separate codebase.

---

### OQ-008: How should algorithm execution state be stored and replayed?

**The problem:** Algorithm visualizations need to be deterministic and replayable. Should the execution engine:
1. Pre-compute all steps and store them as a state array
2. Re-run the algorithm from scratch on each backward step
3. Store a snapshot at each step

**Implication:** Pre-computed steps are simple and fast but memory-intensive for long algorithms. Re-running from scratch requires the algorithm to be pure/deterministic.

---

### OQ-009: Should the plugin registry be curated or open?

**Options:**
1. Curated — every plugin reviewed before listing (safe, slow to grow)
2. Open — any developer can publish (fast growth, higher risk)
3. Hybrid — open publishing, curated "featured" section

**Security implication:** Open registries require strong sandbox security. A curated registry with limited initial plugins reduces attack surface during early phases.

---

### OQ-010: What should the business model look like?

**The question:** Is a Pro subscription right? Are there better models (donations, hosted services only, consulting, enterprise)?

**Context:** The core must remain open-source and self-hostable. The business model should not lock users into the hosted version.

See [Pricing and Monetization](../product/pricing-and-monetization.md).

---

## Community Process

### OQ-011: How should ADRs be approved?

**Options:**
1. Maintainer decides (fast, centralized)
2. Community vote via GitHub Discussion (democratic, slower)
3. Consensus-seeking with maintainer veto

**Current thinking:** Early stage uses consensus-seeking with the founder as final decision-maker. As the community grows, a more formal governance model becomes appropriate.

---

## How to Contribute to These Questions

1. Open or find the relevant [GitHub Discussion](https://github.com/KanishJebaMathewM/Codrawithm/discussions)
2. Share your perspective, evidence, or prototype
3. When consensus is reached, update the relevant ADR or document
4. Remove the question from this list once resolved

---

## Related Documents

- [Research Spikes](./research-spikes.md)
- [Product Roadmap](./product-roadmap.md)
- [Architecture Decisions](../architecture/architecture-decisions/README.md)
