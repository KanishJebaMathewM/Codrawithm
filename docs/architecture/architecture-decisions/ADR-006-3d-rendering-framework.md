# ADR-006: 3D Rendering Framework

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

The 3D workspace requires a WebGL-based 3D rendering library. The choice affects developer experience, bundle size, and the available ecosystem of helpers and controls.

---

## Requirements

- Must run in the browser via WebGL.
- Must integrate with the React architecture.
- Must support: orbit camera controls, transform gizmos, GLTF model loading (future).
- Bundle size must be acceptable (< 1 MB for the 3D module, tree-shakeable).

---

## Alternatives Considered

### Option A: Three.js (Imperative)

Direct Three.js usage in React via `useEffect` + `useRef`.

**Pros:** Maximum control; largest 3D web community.  
**Cons:** Imperative API in React creates friction. Manual lifecycle management.

### Option B: React Three Fiber (R3F) + `@react-three/drei`

Declarative React renderer for Three.js. JSX components map to Three.js objects.

**Pros:** Idiomatic React; `@react-three/drei` provides orbit controls, transform gizmos, model loaders out of the box; same Three.js performance.  
**Cons:** Additional abstraction layer; debugging requires understanding both R3F and Three.js.

### Option C: Babylon.js

Full-featured alternative to Three.js.

**Pros:** Excellent documentation; built-in physics engine.  
**Cons:** ~2 MB bundle; weaker React integration; overkill for conceptual sketching.

---

## Decision

**Recommended:** Option B (React Three Fiber + Three.js + @react-three/drei).

The declarative API reduces boilerplate and integrates naturally with the React codebase. `@react-three/drei` eliminates the need to build orbit controls and transform gizmos from scratch.

---

## Consequences

### Positive
- 3D workspace code looks like the rest of the React codebase.
- `@react-three/drei` helpers reduce implementation time significantly.
- Same Three.js performance as raw Three.js.

### Negative
- Adds R3F abstraction layer; some Three.js docs must be translated to R3F patterns.
- Bundle: Three.js (~580 KB) + R3F (~60 KB) + drei (selected helpers, ~100 KB). Acceptable.

### Risks
- R3F major version upgrades may have breaking changes.
- Mitigation: Pin R3F version; update in a separate PR.

---

## Related ADRs

- [ADR-003: Frontend Framework](ADR-003-frontend-framework.md)
- [ADR-004: Canvas Rendering Approach](ADR-004-canvas-rendering-approach.md)
