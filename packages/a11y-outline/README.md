# @codrawithm/a11y-outline

Builds a reading-order outline for a board so a screen reader or a keyboard user can understand the diagram without seeing it. The output is plain data plus an ASCII text renderer, which makes it easy to put behind a live region or a side panel.

## Install

```
npm install
```

## Use

```ts
import { buildAccessibilityOutline, outlineToText } from "@codrawithm/a11y-outline";

const outline = buildAccessibilityOutline({
  title: "Checkout flow",
  nodes: [
    { id: "cart", kind: "rectangle", label: "Cart", x: 0, y: 0, width: 140, height: 70, groupId: "entry" },
    { id: "pay", kind: "diamond", label: "Paid?", x: 240, y: 0, width: 140, height: 70 },
  ],
  groups: [{ id: "entry", label: "Customer actions" }],
  edges: [{ id: "e1", from: "cart", to: "pay", label: "checkout" }],
});

console.log(outlineToText(outline));
```

## Reading order

Nodes are grouped into visual rows using `rowTolerance` (24 units by default). Within a row they are read left to right. Groups are ordered by the top-left corner of their contents. Connections come after shapes so the listener first learns what exists and then how it relates.

## Output

- `title` falls back to `Untitled board` when the document has no title.
- `description` is one sentence suitable for a live region.
- `groups` contains named groups with their node items.
- `ungrouped` contains nodes that do not belong to a group.
- `connections` contains edges whose endpoints resolve.
- `readingOrder` lists every node id in visual order.

Malformed documents are rejected: duplicate ids, unknown group references, non-finite bounds and dangling group ids raise an error instead of producing a misleading outline.

## Test

```
npm test
npm run typecheck
```
