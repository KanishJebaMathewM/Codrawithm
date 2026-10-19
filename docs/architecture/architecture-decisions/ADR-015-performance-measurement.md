# ADR-015: Performance Measurement

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

Codrawithm has specific performance targets (see NFR-003 through NFR-009). To verify these targets are met and to catch regressions, a performance measurement strategy is needed. This ADR defines how performance is measured, not what the targets are.

---

## Requirements

- Must measure FPS for the canvas at defined object counts (500, 5,000).
- Must measure pan/zoom latency.
- Must measure initial page load and Time to Interactive.
- Must measure collaboration update latency.
- Must catch performance regressions in CI.

---

## Measurement Approach

### Canvas FPS (NFR-003, NFR-004)

**Tool:** Custom performance harness.

**Method:**
1. Create a Playwright E2E test that:
   - Opens a blank board.
   - Programmatically adds N objects via the Yjs document.
   - Pans the canvas for 5 seconds.
   - Records frame timestamps via `requestAnimationFrame` callback.
   - Calculates min, avg, max, and p10 FPS.
2. Run with N=500 and N=5,000.
3. Fail CI if p10 FPS drops below 55 (500 objects) or 30 (5,000 objects).

### Pan/Zoom Latency (NFR-005)

**Tool:** Frame Timing API + custom harness.

**Method:**
1. Playwright test simulates pointer drag events.
2. Measures time between `pointermove` event and next `requestAnimationFrame` commit.
3. Target: < 16 ms (one frame at 60 fps).

### Initial Load and TTI (NFR-001, NFR-002)

**Tool:** Lighthouse CI.

**Method:**
1. Run Lighthouse against the hosted app in CI.
2. Fail if LCP > 2 seconds or TTI > 3 seconds.
3. Use the "4G slow" Lighthouse throttling preset.

### Collaboration Update Latency (NFR-006)

**Tool:** Custom test harness.

**Method:**
1. Two Playwright browser instances connect to the same board.
2. Client A makes a canvas edit.
3. Measure time until Client B receives the update (via Yjs `observe` callback).
4. Target: < 100 ms on loopback (LAN simulation).

### Algorithm Step Playback (NFR-007)

**Tool:** Vitest benchmark.

**Method:**
1. Run algorithm step computation for merge sort on a 200-element array.
2. Measure time per step.
3. Target: < 50 ms per step.

### API Response Times (NFR-009)

**Tool:** Prometheus + custom benchmark (Rust `criterion` or k6).

**Method:**
1. Measure p99 response time for key API endpoints under load.
2. Target: < 500 ms p99.

---

## CI Integration

Performance benchmarks run in CI on every PR that touches:
- Canvas rendering code.
- CRDT synchronization code.
- Backend API handlers.
- Algorithm visualization engine.

Performance benchmarks do not block the PR merge by default — they report results as PR comments. Significant regressions (> 20% worse than baseline) trigger a warning label on the PR.

---

## Performance Budget Table

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Initial load (empty board) | < 2s on 4G | Lighthouse CI |
| Time to Interactive | < 3s | Core Web Vitals |
| Canvas FPS with 500 objects | ≥ 55 fps | Custom perf harness |
| Canvas FPS with 5,000 objects | ≥ 30 fps | Custom perf harness |
| Pan/zoom response | < 16 ms | Frame Timing API |
| Collab update latency (LAN) | < 100 ms | Custom test harness |
| Algorithm step playback | < 50 ms per step | Vitest benchmark |
| 3D scene load (10 MB) | < 5 s | Custom loader benchmark |

---

## Related ADRs

- [ADR-004: Canvas Rendering Approach](ADR-004-canvas-rendering-approach.md)
- [ADR-008: Real-Time Collaboration](ADR-008-real-time-collaboration.md)
