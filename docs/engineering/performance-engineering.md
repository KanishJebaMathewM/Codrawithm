# Performance Engineering

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document describes the performance engineering approach for Codrawithm — including the performance budget, key optimizations, and measurement methodology.

---

## Performance Budget

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Initial load (empty board) | < 2s on 4G | Lighthouse |
| Time to Interactive | < 3s | Core Web Vitals |
| Canvas FPS with 500 objects | ≥ 55 fps | Custom perf harness |
| Canvas FPS with 5000 objects | ≥ 30 fps | Custom perf harness |
| Pan/zoom response | < 16ms | Frame Timing API |
| Collab update latency (LAN) | < 100ms | Custom test harness |
| Algorithm step playback | < 50ms per step | Jest benchmark |
| 3D scene load (10MB) | < 5s | Custom loader benchmark |

---

## Canvas Performance Optimizations

### 1. Viewport Culling

The most impactful optimization. Objects outside the viewport are not rendered.

```typescript
// In the canvas render loop
const visibleObjects = spatialIndex.queryRect({
  x: viewport.x / viewport.zoom - BUFFER,
  y: viewport.y / viewport.zoom - BUFFER,
  width: screenWidth / viewport.zoom + BUFFER * 2,
  height: screenHeight / viewport.zoom + BUFFER * 2,
});
// Only render visibleObjects
```

`BUFFER` = 200 virtual pixels prevents pop-in at viewport edges.

**Expected impact:** 5,000-object board with only 100 objects visible → renders 100 objects, not 5,000.

### 2. Spatial Index (R-tree)

An R-tree spatial index (`rbush` library) enables O(log n) bounding-box queries for viewport culling and hit testing, instead of O(n) linear scan.

```typescript
// Update spatial index on object move
spatialIndex.update({
  id: object.id,
  minX: object.x, minY: object.y,
  maxX: object.x + object.width, maxY: object.y + object.height,
});
```

### 3. Dirty Tracking

Re-render only when something changes, not every animation frame:

```typescript
let dirtyObjects = new Set<string>();
let rafScheduled = false;

const markDirty = (objectId: string) => {
  dirtyObjects.add(objectId);
  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      render(dirtyObjects);
      dirtyObjects.clear();
      rafScheduled = false;
    });
  }
};
```

### 4. Canvas Layer Separation

- Objects layer: re-renders on CRDT updates (which may be batched).
- Selection layer: re-renders only on selection change.
- Collaboration layer: re-renders only on cursor move.
- Background layer: re-renders only on grid setting change.

Separate `<canvas>` elements for each layer prevent full redraws.

### 5. Object Memoization

React-Konva components are wrapped in `React.memo` with custom comparison:

```typescript
const RectangleRenderer = React.memo(
  ({ object }: { object: Rectangle }) => (
    <Rect x={object.x} y={object.y} ... />
  ),
  (prev, next) => prev.object.version === next.object.version
);
```

Only re-renders when the `version` field (incremented on every edit) changes.

### 6. Web Workers for Algorithm Computation

Large algorithm step sequences (n > 200 elements) are computed in a Web Worker to avoid blocking the main thread:

```typescript
// algorithm-worker.ts (runs in a Web Worker)
self.onmessage = (e: MessageEvent<AlgorithmRequest>) => {
  const steps = generateSteps(e.data.algorithm, e.data.input);
  self.postMessage({ steps });
};
```

### 7. Image Lazy Loading

Canvas images are not loaded until they are within the viewport:

```typescript
if (isInViewport(imageObject, viewport)) {
  loadAndRenderImage(imageObject);
} else {
  renderPlaceholderRect(imageObject);
}
```

---

## Bundle Size Optimization

### Code Splitting

All route-level components use `React.lazy()`:

```typescript
const BoardPage = React.lazy(() => import('./features/canvas/board-page'));
const ThreeDWorkspace = React.lazy(() => import('./features/three-d/workspace'));
```

The 3D workspace (~650 KB) only loads when the user opens a 3D board.

### Tree Shaking

- Import icons individually: `import { Pencil } from 'lucide-react'` (not the entire bundle).
- Three.js tree shaking: `import { BoxGeometry } from 'three'` (not `import * from 'three'`).
- shadcn/ui components are copied into the repo — unused components do not add to the bundle.

### Bundle Analysis

CI runs `vite-bundle-visualizer` on every PR touching frontend dependencies. Bundle size report is posted as a PR comment.

**Bundle size targets:**

| Chunk | Target Size (gzipped) |
|-------|----------------------|
| Main app (initial load) | < 200 KB |
| Canvas (lazy) | < 150 KB |
| 3D workspace (lazy) | < 700 KB (Three.js is large) |
| Total first load | < 400 KB |

---

## Backend Performance

### Connection Pool Sizing

```
sqlx PgPool max_connections = max(10, cpu_count * 2)
```

### Query Optimization

- All frequently queried columns are indexed (see [Database Design](../architecture/database-design.md)).
- `EXPLAIN ANALYZE` is run on all new queries before merge.
- Queries returning more than 100 rows must be paginated.

### WebSocket Fan-out

Redis pub/sub fan-out latency: typically < 5 ms on localhost. Expected LAN latency: < 20 ms. The 100 ms target includes browser-to-browser round-trip.

---

## Monitoring

Performance metrics in production:

- **Lighthouse CI** on every deployment.
- **Core Web Vitals** collected via the browser's `web-vitals` library, sent to backend.
- **Canvas FPS** sampled via `requestAnimationFrame` timing, reported as a histogram.
- **API p99 latency** via Prometheus histograms on all HTTP handlers.

See [Observability](observability.md) for the full monitoring setup.

---

## Related Documents

- [Canvas Engine](../architecture/canvas-engine.md)
- [Rendering Pipeline](../architecture/rendering-pipeline.md)
- [Testing Strategy — Performance Benchmarks](testing-strategy.md#performance-benchmarks)
- [ADR-015: Performance Measurement](../architecture/architecture-decisions/ADR-015-performance-measurement.md)
