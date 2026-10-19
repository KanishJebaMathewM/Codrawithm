# @codrawithm/graph-layout

Layered layout for flowcharts, dependency maps and architecture sketches. Input must be a directed acyclic graph. Nodes are placed in layers by longest path, ordered with barycenter sweeps, and centred within each layer.

## Install

```
npm install
```

## Use

```ts
import { layoutGraph } from "@codrawithm/graph-layout";

const layout = layoutGraph(
  [
    { id: "cart", width: 140, height: 70 },
    { id: "pay", width: 140, height: 70 },
    { id: "ship", width: 160, height: 70 },
  ],
  [
    { from: "cart", to: "pay" },
    { from: "pay", to: "ship" },
  ],
  { direction: "down", nodeGap: 32, layerGap: 72 },
);
```

## Behaviour

- Layers come from the longest path from any source, so an edge always points to a later layer.
- Isolated nodes share layer zero without affecting the rest of the graph.
- Four barycenter sweeps, alternating downward and upward, reduce edge crossings. Ties fall back to the previous order, which keeps the output deterministic.
- `direction: "down"` stacks layers vertically; `direction: "right"` stacks them horizontally.
- Nodes of different sizes are centred inside their layer, and the returned `width` and `height` cover the full layout.
- Duplicate ids, unknown edge endpoints, non-positive sizes and invalid gaps are rejected.
- Cycles raise `LayoutCycleError` with a concrete cycle path instead of producing a broken drawing.

## Test

```
npm test
npm run typecheck
```
