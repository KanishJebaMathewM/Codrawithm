# @codrawithm/spatial-index

A uniform grid index for the broad phase of culling, marquee selection and nearby-obstacle lookups. The grid narrows the candidate set; exact bounds checks decide the result, so the index never reports a false hit.

## Install

```
npm install
```

## Use

```ts
import { createSpatialIndex } from "@codrawithm/spatial-index";

const index = createSpatialIndex<{ label: string }>({ cellSize: 256 });
index.insert("n1", { x: 10, y: 20, width: 120, height: 80 }, { label: "Cart" });
index.update("n1", { x: 200, y: 20, width: 120, height: 80 });

const visible = index.search({ x: 0, y: 0, width: 800, height: 600 });
```

## Behaviour

- `insert` rejects duplicate ids. `update` preserves the payload and detaches the id from every cell it used to occupy. `remove` returns false for an unknown id.
- Bounds with negative width or height are normalised on the way in.
- `search` and `searchIds` normalise the query area and return results sorted by id for deterministic diffs.
- Overlap is inclusive, so a rectangle that only touches the query edge is included.
- `size` reports the number of indexed objects and `clear` empties the index for reuse.
- A query covering more cells than the fallback threshold scans the records directly instead of iterating a huge grid range.

## Test

```
npm test
npm run typecheck
```

The suite compares the index against a brute force scan on a seeded board of four thousand rectangles and sixty random queries, in addition to targeted tests for moves, duplicates and boundary cases.
