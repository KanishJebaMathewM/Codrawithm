# 3D Rendering

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document evaluates the options for 3D rendering in the Codrawithm 3D workspace and records the recommended approach.

See [ADR-006](architecture-decisions/ADR-006-3d-rendering-framework.md) for the formal decision record and [3D Workspace](../product/3d-workspace.md) for the product specification.

---

## Options Evaluated

### Option A: Three.js (Imperative)

**How it works:** Use Three.js directly with its imperative scene graph API. Create a `WebGLRenderer`, manage the `Scene`, `Camera`, and animation loop manually.

| Aspect | Assessment |
|--------|-----------|
| Maturity | Excellent — 12+ years; largest 3D web community |
| Documentation | Extensive official docs + community |
| Bundle size | ~580 KB minified (tree-shakeable) |
| React integration | Manual — requires refs and imperative code in useEffect |
| Performance | Excellent — direct WebGL |
| TypeScript support | Good (@types/three) |
| GLTF / model loading | Excellent (GLTFLoader) |
| Physics integration | Easy (cannon.js, rapier) |
| Learning curve | High — OpenGL-style concepts |
| Community | Largest 3D web library community |

**Concern:** Manually managing the Three.js scene inside React creates friction — the lifecycle of Three.js objects does not map cleanly to React's reconciler.

---

### Option B: React Three Fiber (R3F)

**How it works:** React Three Fiber is a React renderer for Three.js. It maps Three.js objects to React components, allowing declarative 3D scenes.

```tsx
<Canvas>
  <ambientLight intensity={0.6} />
  <directionalLight position={[5, 5, 5]} intensity={0.8} />
  <mesh position={[0, 0, 0]}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#6366f1" />
  </mesh>
  <OrbitControls />
</Canvas>
```

| Aspect | Assessment |
|--------|-----------|
| Maturity | Good — actively maintained by Poimandres |
| Documentation | Good (docs.pmnd.rs) + many examples |
| Bundle size | ~60 KB + Three.js |
| React integration | Native — declarative, hooks, Suspense for model loading |
| Performance | Same as Three.js (R3F renders to the same WebGL renderer) |
| TypeScript support | Excellent |
| GLTF / model loading | `useGLTF` hook from `@react-three/drei` |
| Physics integration | `@react-three/rapier` |
| Learning curve | Lower than raw Three.js for React developers |
| Ecosystem (`drei`) | `@react-three/drei` provides 100+ ready helpers |
| Community | Very active; aligned with React ecosystem |

---

### Option C: Babylon.js

**How it works:** A full-featured alternative to Three.js with its own renderer, physics engine, and GUI.

| Aspect | Assessment |
|--------|-----------|
| Maturity | Excellent — backed by Microsoft |
| Documentation | Excellent |
| Bundle size | ~2MB+ (much heavier) |
| React integration | Manual or via unofficial wrappers |
| Performance | Excellent — often competitive with Three.js |
| TypeScript support | First-class (written in TypeScript) |
| Ecosystem | Strong but smaller than Three.js |

**Concern:** Too heavy for Codrawithm's use case (conceptual sketching, not AAA game rendering). The bundle size penalty is not justified.

---

## Recommended Approach

**React Three Fiber (R3F) + Three.js + `@react-three/drei`**

Rationale:
- R3F fits Codrawithm's React architecture — 3D scenes are declared as JSX components, consistent with the rest of the codebase.
- `@react-three/drei` provides out-of-the-box helpers: `OrbitControls`, `TransformControls` (gizmo), `useGLTF`, `Html` (for overlaying DOM in 3D), `Stats`.
- Performance is identical to raw Three.js.
- TypeScript support is first-class.
- Learning curve is lower for React developers than raw Three.js.
- Babylon.js is excluded due to bundle size and weaker React integration.

---

## Integration with the Canvas

The 3D workspace occupies the same `<main>` area as the 2D canvas. When the workspace type is `3d-workspace`, the 2D Konva canvas is unmounted and the R3F `<Canvas>` is mounted in its place.

This is not a "3D overlay on the 2D canvas" — they are mutually exclusive views. Switching back to a 2D workspace type unmounts the 3D renderer.

```tsx
const WorkspaceRenderer: React.FC = () => {
  const workspaceType = useCanvasStore(s => s.board?.workspaceType);

  if (workspaceType === '3d-workspace') {
    return <ThreeDWorkspace />;
  }
  return <TwoDCanvas />;
};
```

---

## Performance Targets for 3D

| Metric | Target | Notes |
|--------|--------|-------|
| FPS with 100 primitive objects | ≥ 60 fps | Typical scene |
| FPS with 1,000 primitive objects | ≥ 30 fps | Heavy scene |
| GLTF model load (10 MB) | < 5 seconds | See NFR-008 |
| WebXR (VR/AR) support | Not planned | Future research spike |

---

## 3D Collaboration

3D object transforms are stored in the Yjs CRDT document alongside 2D canvas objects. The data model key is `threeDScene`:

```typescript
// In the Yjs document
const ydoc = new Y.Doc();
const yThreeDObjects = ydoc.getArray<Y.Map<unknown>>('threeDObjects');
```

Each 3D object's `position`, `rotation`, `scale`, and `material` fields are CRDT-backed. Concurrent edits are resolved field-by-field (last-write-wins per field).

---

## Related Documents

- [3D Workspace (Product)](../product/3d-workspace.md)
- [ADR-006: 3D Rendering Framework](architecture-decisions/ADR-006-3d-rendering-framework.md)
- [Rendering Pipeline](rendering-pipeline.md)
- [Frontend Architecture](frontend-architecture.md)
