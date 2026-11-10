# @codrawithm/algorithm-trace

Records the states an array algorithm passes through so a board can replay them. The recorder owns a working copy, takes shallow snapshots at commit points, and keeps visual metadata separate from the data.

## Install

```
npm install
```

## Use

```ts
import { createTrace } from "@codrawithm/algorithm-trace";

const trace = createTrace([5, 3, 8, 1], { maxFrames: 200 });

for (let i = 1; i < trace.values.length; i += 1) {
  trace.line(4);
  for (let j = i; j > 0; j -= 1) {
    const [left, right] = trace.compare(j - 1, j);
    if (left <= right) {
      break;
    }
    trace.swap(j - 1, j);
    trace.commit();
  }
}

const result = trace.finish();
```

## Frames

A trace starts with frame zero, which holds the initial values. `set`, `swap`, `compare`, `highlight`, `line` and `note` mark the recorder dirty; `commit` writes one frame and returns false when there is nothing pending. Highlights and notes reset after a commit, while the current line number persists like a debugger cursor.

`finish` commits any pending work and returns:

- `initial`: a copy of the starting array
- `frames`: steps with values, highlights, line and note
- `final`: the values in the last frame

Every frame stores its own shallow copy of the array, so later mutations cannot rewrite history. `maxFrames` bounds memory and raises `TraceLimitError` instead of silently dropping steps.

## Test

```
npm test
npm run typecheck
```
