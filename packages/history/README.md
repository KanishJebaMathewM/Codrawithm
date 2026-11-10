# @codrawithm/history

Undo and redo for immutable state. The engine stores snapshots, folds gestures with merge keys, groups multi-object work into transactions, and keeps a hard bound on retained entries.

## Install

```
npm install
```

## Use

```ts
import { createHistory } from "@codrawithm/history";

const history = createHistory({ nodes: [] as string[] });
const unsubscribe = history.subscribe((snapshot) => render(snapshot.state));

history.apply("add node", (state) => ({ nodes: [...state.nodes, "n1"] }), {
  mergeKey: "add:n1",
});

history.transaction("delete selection", (tx) => {
  tx.apply("remove n1", (state) => ({ nodes: state.nodes.filter((id) => id !== "n1") }));
});

history.undo();
history.redo();
```

## Design

- A change function returning the same reference is a no-op. Nothing is recorded and no listener fires.
- A merge key folds consecutive commands into the newest entry while they stay inside `mergeWindowMs`. This turns sixty pointer moves into one undo step without hiding a second drag.
- `transaction` applies its changes to a local cursor and commits one entry. If the callback throws, the state is untouched.
- `limit` bounds the undo stack from the oldest side. The default is 200 entries.
- `subscribe` fires once per accepted change, including merged changes, and returns an unsubscribe function.
- The clock is injectable, which keeps merge-window tests deterministic.

State is held by reference and is never cloned by the engine, so immutable updates keep structural sharing.

## Test

```
npm test
npm run typecheck
```
