# @codrawithm/board-diff

Semantic change computation and patch application for Codrawithm board documents. It computes identity-aware changes by element ID, tracks nested dotted field mutations, flags z-order and array reordering, and safely applies validated patches without mutating either document input.

## Motivation

Standard serialized JSON diffing fails when comparing canvas boards:
- Element identity is obscured: shifting a node from `x: 0` to `x: 20` looks like an arbitrary string diff rather than a positional edit.
- Nested style modifications lose semantics: changing `style.fill` should report `"style.fill"` rather than replacing the entire node object.
- Array order represents z-order: reordering elements to bring a node forward or send it backward is a meaningful visual change even when no element attributes are altered.

`@codrawithm/board-diff` separates element identity, nested property mutations, and target array order into explicit semantic structures.

## Install

```bash
pnpm add @codrawithm/board-diff
```

## Usage

```ts
import { diffBoards, applyBoardDiff, hasBoardChanges } from "@codrawithm/board-diff";
import type { BoardDocument } from "@codrawithm/board-schema";

// Compute semantic diff between two board states
const diff = diffBoards(previousBoard, nextBoard);

if (hasBoardChanges(diff)) {
  console.log("Nodes changed:", diff.nodes.changes);
  console.log("Nodes reordered:", diff.nodes.orderChanged);

  // Apply diff to base document (immutably)
  const updatedBoard = applyBoardDiff(previousBoard, diff);
}
```

## Features

### Dotted Nested Field Paths

Nested object changes are isolated to their exact dotted property path (e.g. `style.fill`, `style.strokeWidth`). Arrays (such as polyline points) are treated as atomic values so that geometric modifications are reported as `points` rather than per-index mutations.

```ts
import { changedPaths } from "@codrawithm/board-diff";

const paths = changedPaths(
  { x: 0, style: { fill: "#fff", stroke: "#000" } },
  { x: 20, style: { fill: "#f00", stroke: "#000" } }
);
// paths => ["style.fill", "x"]
```

### Deterministic Change Ordering

`diffById` emits changes in a predictable, stable sequence:
1. Removals in the previous array order.
2. Updates in the previous array order (each containing `id`, `before`, `after`, and sorted `paths`).
3. Additions in the next array order.

### Target Order & Z-Order Edits

`diffBoards` diffs nodes and edges independently, captures the `targetOrder` array of element IDs, and flags `orderChanged: true` if the sequence was modified. `hasBoardChanges` returns `true` for order-only edits, ensuring z-order adjustments are preserved during autosave and version history checkpoints.

### Patch Validation & Safety

`applyBoardDiff` validates every patch prior to building the resulting document. It throws a `BoardDiffError` if:
- Duplicate changes exist for the same item ID.
- An addition specifies an ID that already exists in the base document.
- An update or removal targets an unknown ID.
- The `targetOrder` array contains duplicate IDs.
- The `targetOrder` array does not contain every final item ID exactly once.
- The base document contains duplicate item IDs.

Patch application is strictly immutable and never alters the base document or diff object.

## Test & Typecheck

```bash
pnpm test
pnpm run typecheck
```
