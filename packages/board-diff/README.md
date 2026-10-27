# @codrawithm/board-diff

Computes semantic differences between two board snapshots and applies them without touching the input. Changes are grouped by node and edge id, nested values report dotted paths, and array order is tracked separately so z-order changes are not lost.

## Install

```
npm install
```

## Use

```ts
import { applyBoardDiff, diffBoards, hasBoardChanges } from "@codrawithm/board-diff";

const before = { nodes: [{ id: "a", x: 0, style: { fill: "#fff" } }], edges: [] };
const after = { nodes: [{ id: "a", x: 20, style: { fill: "#fee" } }], edges: [] };

const diff = diffBoards(before, after);
if (hasBoardChanges(diff)) {
  const patched = applyBoardDiff(before, diff);
}
```

## Change shape

- `added` carries the new item.
- `removed` carries the old item.
- `updated` carries both items and a sorted list of changed paths such as `x` or `style.fill`.

Arrays are compared as values, so replacing `points` reports `points` rather than every index. Objects are compared key by key. `NaN` equals `NaN`, which keeps geometry diffs stable.

## Ordering

Node arrays often represent z-order, so the diff records the full target order and whether it changed. `hasBoardChanges` returns true for an order-only diff. Applying a diff validates that the target order contains every resulting item exactly once.

## Guarantees

- Inputs are never mutated.
- Duplicate ids in either snapshot are rejected.
- Updating or removing an unknown id during patch application throws.
- Ids are matched by value, so renaming an id is a removal plus an addition.
- Output order is deterministic: removals and updates follow the previous array, additions follow the next array.

## Test

```
npm test
npm run typecheck
```
