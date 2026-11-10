# @codrawithm/geometry

Small, dependency-free 2D geometry helpers shared by selection, connector routing, layout and export. Every function is pure and works on plain objects, so results can be compared in tests without custom matchers.

## Install

```
npm install
```

## Use

```ts
import { rectFromPoints, clipSegmentToRect, rotatePoint, rectCorners } from "@codrawithm/geometry";

const marquee = rectFromPoints({ x: 180, y: 90 }, { x: 20, y: 10 });
const clipped = clipSegmentToRect({ x: -50, y: 0 }, { x: 150, y: 0 }, marquee);
const corners = rectCorners({ x: 0, y: 0, width: 100, height: 60 }, Math.PI / 6);
```

## Contents

- Vector arithmetic, length, dot and cross products
- Degrees and radians, angle normalisation, point rotation
- Rectangle normalisation, union, inflation, containment and overlap
- Rotated corners and point bounds
- Segment clipping against a rectangle using Liang-Barsky
- Distance from a point to a segment and segment intersection
- Polygon area and polyline length

## Conventions

Angles are radians unless a function name says otherwise. Rotation is clockwise in screen coordinates because the y axis points down. Rectangles are normalised before use, so a drag from bottom-right to top-left produces the same result as the reverse drag. Zero-sized rectangles are accepted by predicates and rejected by clipping, which has no meaningful result for them.

## Test

```
npm test
npm run typecheck
```
