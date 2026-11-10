# @codrawithm/autosave

A debounced save scheduler for a canvas document. It coalesces rapid edits, never runs two saves at once, retries failures with backoff, and reports enough state for a status indicator.

## Install

```
npm install
```

## Use

```ts
import { createAutosave } from "@codrawithm/autosave";

const autosave = createAutosave({
  save: async (board) => {
    await fetch("/api/boards/current", {
      method: "PUT",
      body: JSON.stringify(board),
    });
  },
  delayMs: 800,
  maxRetries: 3,
  onStatusChange: (status, error) => renderBadge(status, error),
});

autosave.schedule({ nodes: [], edges: [] });

await autosave.flush();
```

## Behaviour

- `schedule` replaces the pending snapshot and restarts the debounce timer. A newer snapshot always wins.
- Only one save runs at a time. If edits arrive during a save, the newest snapshot is saved after the current attempt finishes.
- Failures are retried with `retryDelaysMs`, falling back to `retryBaseDelayMs` doubled per attempt. After `maxRetries` the status becomes `error`.
- `flush` clears the debounce, waits for an in-flight save and performs one immediate attempt. It rejects if that attempt fails, without waiting for backoff.
- `retry` clears an error and tries the failed snapshot again.
- `cancel` drops pending work but cannot abort a request that is already in flight.
- `dispose` makes later `schedule` calls inert.
- A listener that throws cannot break the scheduler.

Statuses are `idle`, `scheduled`, `saving`, `saved` and `error`.

## Test

```
npm test
npm run typecheck
```
