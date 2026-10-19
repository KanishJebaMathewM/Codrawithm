# @codrawithm/svg-export

Renders a structural board document to SVG with no browser, no canvas and no timestamps. The same input always produces the same bytes, which makes thumbnails cacheable and export snapshots stable.

## Install

```
npm install
```

## Use

```ts
import { renderBoardToSvg } from "@codrawithm/svg-export";

const svg = renderBoardToSvg(
  {
    id: "checkout",
    title: "Checkout flow",
    nodes: [
      { id: "cart", kind: "rectangle", x: 0, y: 0, width: 140, height: 70, label: "Cart" },
      { id: "paid", kind: "diamond", x: 240, y: 0, width: 140, height: 70, label: "Paid?" },
    ],
    edges: [{ id: "e1", from: "cart", to: "paid", label: "submit", arrow: "target" }],
  },
  { padding: 24, background: "#ffffff" },
);
```

## Supported content

- Rectangles, ellipses, diamonds, text nodes and freehand paths
- Rotation around the node centre
- Word-wrapped labels using tspan lines
- Edges clipped to node borders, with optional side anchors
- Arrow heads on the target, the source or both ends
- Dashed strokes, edge labels, an optional background and a document title
- A viewBox derived from rotated content bounds plus padding

## Safety and determinism

Labels and all text-derived attributes pass through XML escaping. Paint values pass through a strict allow list for hex, named, rgb and hsl colours; anything else falls back to a safe default, which blocks attribute injection through style values. No timestamps, random ids or environment data are emitted, so two renders of the same input are byte-identical.

## Test

```
npm test
npm run typecheck
```
