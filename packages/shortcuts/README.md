# @codrawithm/shortcuts

A keyboard registry for a canvas editor: platform-aware `mod`, scoped bindings, input-field guards, two-key chords and conflict reporting. Matching is pure; the package never touches the DOM or calls `preventDefault`.

## Install

```
npm install
```

## Use

```ts
import { createShortcutRegistry } from "@codrawithm/shortcuts";

const shortcuts = createShortcutRegistry({ platform: "other" });

shortcuts.register({ id: "undo", keys: "mod+z", description: "Undo" });
shortcuts.register({ id: "delete", keys: "delete", description: "Delete selection", scope: "canvas" });
shortcuts.register({ id: "group", keys: "g g", description: "Group selection", scope: "canvas" });

const match = shortcuts.handle(
  { key: "z", ctrlKey: true },
  { scope: "canvas", editable: false },
);
if (match !== null) {
  run(match.id);
}
```

## Matching rules

- `mod` means Command on macOS and Control elsewhere. All other modifiers are exact: a binding without Shift does not fire when Shift is held.
- Bindings with no scope are global. A binding with a scope only fires when the caller passes that scope.
- While `editable` is true, bindings are skipped unless they set `allowInInput`.
- `when` is an optional predicate. A throwing predicate counts as false rather than breaking typing.
- Chords are written with spaces, for example `g i`. The first key arms the chord; the next key must arrive within `sequenceTimeoutMs`. A mismatch clears the chord and the event is retried against single-key bindings.
- `handle` returns the matched binding or `null`. `pending()` reports the armed chord so a status bar can show it.
- `findConflicts` reports two bindings with the same keys in the same scope, which is usually an accident. Different scopes are allowed.

## Test

```
npm test
npm run typecheck
```
