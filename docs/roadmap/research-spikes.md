# Research Spikes

**Status:** Proposed  
**Audience:** Engineers, contributors  
**Last Reviewed:** 2024-01-15

Research spikes are time-boxed investigations (typically 1–5 days) that produce a written report, not production code. They are used to reduce uncertainty before committing to an architectural decision.

---

## Active Spikes

### SPIKE-001: Canvas Rendering Performance Baseline

**Question:** Can Konva.js handle 5,000 objects on a 2D canvas at ≥ 30fps with viewport culling?

**Time box:** 3 days

**What to build:**
- A minimal Konva.js canvas with 5,000 rectangles and text labels
- Implement basic viewport culling (don't render off-screen objects)
- Measure FPS at 500, 1,000, 2,000, and 5,000 objects
- Measure pan/zoom performance
- Test on: high-end desktop, mid-range laptop (2019-era), low-end device (4GB RAM)

**What to report:**
- FPS measurements at each object count (with and without culling)
- Memory usage at each count
- Whether Konva's hit detection scales acceptably
- Any Konva limitations discovered
- Recommendation: proceed with Konva, investigate alternatives, or build custom

**Feeds into:** [ADR-004](../architecture/architecture-decisions/ADR-004-canvas-rendering-approach.md)

---

### SPIKE-002: Yjs Collaboration Proof of Concept

**Question:** Can two browser tabs sync a simple shared canvas using Yjs + y-websocket within one week?

**Time box:** 4 days

**What to build:**
- A minimal Express + y-websocket server
- Two browser tabs sharing a Y.Map of objects (positions only)
- Drag an object in Tab A → it moves in Tab B
- Disconnect Tab A for 10 seconds, make edits, reconnect → verify sync

**What to report:**
- Did sync work? How quickly?
- What was the latency on localhost?
- Any gotchas with Yjs setup?
- Does the Rust yrs crate need to be evaluated in parallel?
- Recommendation: proceed with Yjs, evaluate alternatives

**Feeds into:** [ADR-008](../architecture/architecture-decisions/ADR-008-real-time-collaboration.md)

---

### SPIKE-003: Algorithm Execution Model

**Question:** What is the cleanest way to make a sorting algorithm "step-by-step" inspectable without coupling the algorithm to the renderer?

**Time box:** 2 days

**What to explore:**
- Generator function approach: algorithm as a JavaScript generator that `yield`s state after each step
- Snapshot array: run algorithm fully, record state at each step, replay from array
- Event log: algorithm emits events, renderer subscribes

**What to build:** A bubble sort that works with all three approaches. Measure: simplicity, memory usage for 1,000-element arrays, support for backward stepping.

**What to report:**
- Comparison of the three approaches
- Which approach handles backward stepping most cleanly
- Recommendation with code example

**Feeds into:** [Algorithm Visualization](../product/algorithm-visualization.md), [Developer Studio](../product/developer-studio.md)

---

### SPIKE-004: Three.js Lazy Loading

**Question:** Can Three.js be reliably lazy-loaded so that a user opening a 2D whiteboard pays zero Three.js cost?

**Time box:** 2 days

**What to build:**
- A Vite + React app with a 2D whiteboard route and a 3D workspace route
- Three.js imported only in the 3D route using dynamic `import()`
- Measure: main bundle size (should not include Three.js), 3D chunk size, time to load 3D route

**What to report:**
- Main bundle size with and without lazy loading
- 3D chunk size
- Any issues with dynamic import of Three.js
- Recommendation: how to structure the lazy loading boundary

**Feeds into:** [ADR-006](../architecture/architecture-decisions/ADR-006-3d-rendering-framework.md), [3D Rendering](../architecture/3d-rendering.md)

---

### SPIKE-005: Plugin Sandbox Security Verification

**Question:** Does the iframe sandbox we've designed actually prevent a malicious plugin from accessing the host page?

**Time box:** 3 days

**What to build:**
- A test harness with a sandboxed iframe (our production sandbox config)
- A "malicious plugin" that attempts to:
  - Access `window.parent.document`
  - Read cookies via `document.cookie`
  - Make a fetch request to an external URL
  - Access localStorage of the host
  - Inject a script into the parent page

**What to report:**
- Which attacks succeeded and which were blocked
- Any unexpected bypass mechanisms
- CSP header configuration that blocks remaining attacks
- Recommendation: confirm the sandbox design or propose changes

**Feeds into:** [Plugin Security](../plugins/plugin-security.md), [ADR-012](../architecture/architecture-decisions/ADR-012-plugin-sandboxing.md)

---

## Completed Spikes

None yet — the project is in Phase 0.

---

## How to Run a Spike

1. Pick a spike from the list above (or propose a new one in GitHub Discussions)
2. Create a branch: `spike/SPIKE-NNN-short-description`
3. Build the minimal prototype — don't write production code
4. Write the findings report in a `FINDINGS.md` in your branch
5. Open a PR with the findings (prototype code optional, not required to be production quality)
6. Tag the relevant ADR or document maintainer for review
7. Decision is recorded in the relevant ADR

---

## Related Documents

- [Open Questions](./open-questions.md)
- [Product Roadmap](./product-roadmap.md)
- [Architecture Decisions](../architecture/architecture-decisions/README.md)
