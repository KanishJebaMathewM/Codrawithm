# ADR-004: Canvas Rendering Approach

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

The canvas must render potentially thousands of objects at 60 fps with smooth pan and zoom. The rendering approach determines performance ceiling, text quality, accessibility strategy, and developer experience.

---

## Requirements

- Must achieve ≥ 55 fps at 500 objects (NFR-003).
- Must achieve ≥ 30 fps at 5,000 objects (NFR-004).
- Must support zoom levels from 5% to 3200% without pixelation.
- Must support hit testing for selection, hover, and connection snapping.
- Must support SVG export (via object data reconstruction, not DOM serialization).

---

## Alternatives Considered

### Option A: DOM + SVG

Each object is an SVG element. Browser renders natively.

**Performance:** ~40–50 fps at 500 objects; breaks down at 5,000+.  
**Assessment:** Does not meet NFR-004.

### Option B: Canvas 2D (Konva.js)

Objects drawn to `<canvas>` via Canvas 2D API. React-Konva provides declarative API.

**Performance:** ~60 fps at 500 objects; ~30–40 fps at 5,000 objects with viewport culling.  
**Assessment:** Meets both NFR-003 and NFR-004.

### Option C: WebGL

Objects rendered via GPU shaders. Maximum performance.

**Performance:** 60 fps at 50,000+ objects.  
**Assessment:** Meets targets but adds significant complexity.

---

## Decision

**Recommended:** Option B (Canvas 2D via Konva.js) for Phase 1–2. Evaluate WebGL upgrade for Phase 3+ if performance targets are missed.

---

## Consequences

### Positive
- Konva.js provides hit testing and event handling, reducing custom code.
- React-Konva integrates naturally with the React architecture.
- Viewport culling with R-tree spatial index achieves the 5,000-object target.

### Negative
- Canvas 2D text rendering is slightly less crisp than DOM text at 100% zoom.
- Accessibility requires a separate ARIA tree supplement.

### Risks
- If object count targets are exceeded (10,000+ objects/board), Canvas 2D may not meet NFR-004.
- Mitigation: Konva has a WebGL rendering mode that can be enabled without changing the scene model.

---

## Evidence / Proof-of-Concept Needed

- Benchmark Konva.js with 500 and 5,000 rectangles + viewport culling.
- Measure FPS on mid-range hardware (Intel i5, 8 GB RAM, integrated GPU).

---

## Related ADRs

- [ADR-003: Frontend Framework](ADR-003-frontend-framework.md)
- [ADR-005: Scene Document Model](ADR-005-scene-document-model.md)
