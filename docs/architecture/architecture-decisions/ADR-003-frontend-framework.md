# ADR-003: Frontend Framework

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

The frontend needs a framework for building a complex, interactive single-page application with: canvas rendering, real-time state updates, a large component library, and a plugin system. The choice of framework affects contributor onboarding, ecosystem availability, and long-term maintenance.

---

## Requirements

- Must have strong TypeScript support.
- Must have an ecosystem that includes canvas/WebGL libraries, CRDT integrations, and component libraries.
- Must enable performance optimizations (memoization, concurrent rendering) for the canvas use case.
- Must be familiar enough for community contributors to participate without learning a niche framework.

---

## Alternatives Considered

### Option A: React 18 + TypeScript

**Pros:**
- Largest frontend ecosystem; most contributors will be familiar.
- React 18 concurrent features (Suspense, transitions) useful for async canvas state.
- React-Konva provides a declarative Canvas 2D API.
- React Three Fiber provides a declarative Three.js API.
- Zustand, TanStack Query, TanStack Router all have first-class React support.
- shadcn/ui provides accessible components.
- y-react and Yjs both integrate easily.

**Cons:**
- React has more re-render complexity than some alternatives.
- Bundle size is larger than lighter alternatives.

### Option B: Svelte / SvelteKit

**Pros:**
- Very small bundle size.
- Compiler-based reactivity — no virtual DOM.
- Simple reactive stores.

**Cons:**
- Smaller ecosystem — fewer canvas/3D libraries.
- React-Konva and React Three Fiber have no Svelte equivalents.
- Community contributors less likely to be familiar.
- Plugin system would require a custom bridge to iframe plugins.

### Option C: Vue 3 + TypeScript

**Pros:**
- Large community.
- Composition API is clean and TypeScript-friendly.

**Cons:**
- No equivalent to React-Konva or React Three Fiber.
- shadcn/ui and most design system component libraries target React.
- Smaller pool of potential contributors than React.

---

## Decision

**Recommended:** Option A (React 18 + TypeScript).

The decisive factors are:
1. React-Konva and React Three Fiber have no comparable equivalents in other frameworks.
2. The largest contributor pool means faster community growth.
3. The ecosystem for state management, data fetching, routing, and component libraries is unmatched.

---

## Consequences

### Positive
- Access to the full React ecosystem.
- React 18 concurrent features improve rendering for the real-time canvas.
- Contributor onboarding is simpler for the large React developer community.

### Negative
- React's mental model (hooks, rendering lifecycle) has a learning curve.
- Bundle size is larger than Svelte/Solid alternatives.

### Risks
- React ecosystem churn (major API changes). Mitigation: use stable APIs; track React changelogs.

---

## Related ADRs

- [ADR-004: Canvas Rendering Approach](ADR-004-canvas-rendering-approach.md)
- [ADR-006: 3D Rendering Framework](ADR-006-3d-rendering-framework.md)
- [ADR-007: State Management](ADR-007-state-management.md)
