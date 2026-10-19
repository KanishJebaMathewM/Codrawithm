# Canvas Engine

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

The canvas engine is responsible for maintaining the scene model, managing the coordinate system, performing hit testing, and orchestrating rendering. It sits between the Yjs CRDT document (source of truth) and the Konva.js rendering layer.

---

## Scene Model

The canvas scene is a flat array of typed objects. There is no nested scene graph — all objects are at the same level. Z-order (layer ordering) is determined by the order of objects in the array.

```typescript
type CanvasObjectType =
  | 'rectangle' | 'ellipse' | 'diamond' | 'triangle'
  | 'line' | 'arrow' | 'connector'
  | 'text' | 'code-block'
  | 'freehand' | 'marker'
  | 'sticky-note' | 'frame' | 'image'
  | 'algorithm-array' | 'algorithm-graph' | 'algorithm-tree'
  | 'group';

interface BaseObject {
  id: string;                    // nanoid — unique, URL-safe
  type: CanvasObjectType;
  x: number; y: number;          // Position in canvas coordinates
  width: number; height: number; // Bounding box dimensions
  rotation: number;              // Degrees; 0 = no rotation
  opacity: number;               // 0.0 – 1.0
  locked: boolean;               // Prevents selection/editing
  visible: boolean;
  groupId: string | null;        // Parent group ID if grouped
  version: number;               // Monotonically increasing; used for dirty-checking
}
```

All specific object types extend `BaseObject` with type-specific fields. See [Data Model](data-model.md) for full type definitions.

---

## Coordinate System

The canvas uses a 2D Cartesian coordinate system with the origin at the top-left:
- **X increases to the right.**
- **Y increases downward** (screen convention, not mathematical convention).
- Units are **virtual pixels** — independent of the device pixel ratio and the viewport zoom level.

### Coordinate Transforms

The canvas applies a viewport transform to convert between world coordinates (where objects live) and screen coordinates (where pixels are drawn):

```typescript
interface Viewport {
  x: number;       // Canvas x offset in screen pixels
  y: number;       // Canvas y offset in screen pixels
  zoom: number;    // Scale factor (1.0 = 100%)
}

// World-to-screen transform
const worldToScreen = (worldPoint: Point, viewport: Viewport): Point => ({
  x: worldPoint.x * viewport.zoom + viewport.x,
  y: worldPoint.y * viewport.zoom + viewport.y,
});

// Screen-to-world transform
const screenToWorld = (screenPoint: Point, viewport: Viewport): Point => ({
  x: (screenPoint.x - viewport.x) / viewport.zoom,
  y: (screenPoint.y - viewport.y) / viewport.zoom,
});
```

All pointer events are converted to world coordinates before being handled by tools.

---

## Hit Testing

Hit testing determines which canvas object (if any) is under the cursor for selection, hover, and connection snapping.

### Algorithm

The engine uses a **spatial index** (R-tree, implemented via `rbush`) to efficiently find candidates:

```typescript
class SpatialIndex {
  private tree: RBush<IndexedObject>;

  // Called on every object add/move/resize
  update(object: CanvasObject): void {
    this.tree.remove({ id: object.id });
    this.tree.insert({
      id: object.id,
      minX: object.x,
      minY: object.y,
      maxX: object.x + object.width,
      maxY: object.y + object.height,
    });
  }

  // Returns objects whose bounding box contains the point
  query(point: Point): string[] {
    return this.tree
      .search({ minX: point.x, minY: point.y, maxX: point.x, maxY: point.y })
      .map(item => item.id);
  }

  // Returns objects that intersect a rectangle (marquee select)
  queryRect(rect: Rect): string[] {
    return this.tree
      .search({ minX: rect.x, minY: rect.y, maxX: rect.x + rect.width, maxY: rect.y + rect.height })
      .filter(item => item fully inside rect)
      .map(item => item.id);
  }
}
```

After bounding box candidates are found, precise hit testing is applied:
- **Rectangles/ellipses/diamonds:** Geometric hit test (point-in-shape check).
- **Text objects:** Bounding box hit test.
- **Lines/arrows:** Distance from point to line segment (threshold: 8 virtual pixels).
- **Freehand paths:** Distance from point to any segment of the bezier path.
- **Images/frames:** Bounding box hit test.

### Z-Order Hit Priority

The top-most object (highest z-order) wins. The objects array is iterated in reverse order for hit testing.

---

## Rendering Adapters

The canvas engine is designed to be independent of the rendering backend. It communicates with the renderer via a `RenderAdapter` interface:

```typescript
interface RenderAdapter {
  beginFrame(): void;
  endFrame(): void;
  drawRect(params: DrawRectParams): void;
  drawEllipse(params: DrawEllipseParams): void;
  drawPath(points: Point[], style: PathStyle): void;
  drawText(text: string, x: number, y: number, style: TextStyle): void;
  drawImage(image: HTMLImageElement, x: number, y: number, w: number, h: number): void;
  drawSelection(objects: CanvasObject[]): void;
  drawGrid(viewport: Viewport): void;
}
```

**Current implementation:** `KonvaAdapter` — wraps Konva.js nodes. Objects are rendered as Konva shapes inside React components.

**Future implementation:** `WebGLAdapter` — for scenes with > 5,000 objects where Canvas 2D throughput becomes a bottleneck. This adapter renders all objects to a single WebGL texture using instanced rendering.

---

## Dirty Tracking and Re-render Strategy

The canvas does not re-render on every animation frame (that would be 60 draws/second even when nothing changes). Instead:

1. When a CRDT update arrives (from local user action or remote collaborator), the affected objects are marked dirty.
2. A `requestAnimationFrame` is scheduled (debounced — only one per frame).
3. On the next animation frame, only dirty objects are re-rendered.
4. The collaborator cursor layer is always re-rendered on cursor move events (separate layer, cheap).

This reduces unnecessary work on idle boards while maintaining smooth animation for collaboration.

---

## Object ID Generation

Object IDs are generated using `nanoid` with a custom alphabet:

```typescript
import { customAlphabet } from 'nanoid';
const generateId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);
// Example: "A3bX9kP2mQrL"
```

IDs are:
- 12 characters long (sufficient collision resistance for canvas object counts).
- URL-safe (used in deep links).
- Prefixed by type in the data model for debugging: `rect_A3bX9kP2mQrL`.

---

## Bounding Box Computation

Every object maintains a `boundingBox` that is recomputed when position, size, or rotation changes:

```typescript
const computeBoundingBox = (object: CanvasObject): Rect => {
  if (object.rotation === 0) {
    return { x: object.x, y: object.y, width: object.width, height: object.height };
  }
  // For rotated objects, compute the axis-aligned bounding box of the rotated rectangle
  const corners = getRotatedCorners(object);
  return axisAlignedBBox(corners);
};
```

The bounding box is used by the spatial index, selection handles, and connector routing.

---

## Related Documents

- [Frontend Architecture](frontend-architecture.md)
- [Rendering Pipeline](rendering-pipeline.md)
- [Data Model](data-model.md)
- [Interaction Patterns](../design/interaction-patterns.md)
- [ADR-004: Canvas Rendering Approach](architecture-decisions/ADR-004-canvas-rendering-approach.md)
- [ADR-005: Scene Document Model](architecture-decisions/ADR-005-scene-document-model.md)
