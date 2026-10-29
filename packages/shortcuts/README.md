# @codrawithm/shortcuts

A scoped keyboard shortcut registry for canvas editors and web applications. Provides platform-aware modifier resolution (`mod` → `Cmd` on macOS, `Ctrl` elsewhere), exact modifier matching, text input guards, multi-key chord sequences with fallback retry, and conflict detection.

Matching logic is completely pure and decoupled from the DOM. It does not bind event listeners or call `preventDefault`, leaving DOM lifecycle to UI controllers.

## Features

- **Platform-Aware Modifiers**: `mod` automatically expands to `meta` (Command) on macOS and `ctrl` on other operating systems.
- **Exact Modifier Matching**: Modifiers (`ctrl`, `meta`, `alt`, `shift`) must match precisely, preventing unintended triggers when additional modifier keys are held.
- **Key Aliases & Symbols**: Recognises standard aliases (`esc`, `space`, `return`, `enter`, `del`, `delete`, arrow keys, `plus`, `minus`, symbol keys like `+`, `-`, `[`, `]`, `=`).
- **Scoped Bindings**: Supports global shortcuts (`scope: undefined`) and context-scoped shortcuts (e.g., `canvas`, `layers`, `modal`).
- **Input Field Protection**: Ignores tool shortcuts when `editable: true` (e.g., editing a text label) unless explicitly allowed with `allowInInput: true`.
- **Conditional Predicates**: Evaluates runtime `when` predicates safely; errors in predicates fail closed without crashing event handlers.
- **Two-Key and Multi-Key Chords**: Supports space-separated chord sequences (e.g., `g i`, `g g`). Tracks candidate sequences simultaneously, exposes `pending()` chords for status bars, and auto-expires based on `sequenceTimeoutMs`.
- **Mismatch Fallback**: If the second key in a chord sequence does not complete the chord, pending state is cleared and the key is immediately retried as a fresh single-key or new sequence start.
- **Conflict Detection**: `findConflicts()` detects duplicated key combinations registered within the same scope.

## Installation

```bash
pnpm install
```

## Quick Start

```ts
import { createShortcutRegistry } from "@codrawithm/shortcuts";

// Initialize registry (defaults to "other" platform, or pass "mac")
const shortcuts = createShortcutRegistry({ platform: "other" });

// Register shortcuts
shortcuts.register({
  id: "undo",
  keys: "mod+z",
  description: "Undo last canvas change",
});

shortcuts.register({
  id: "delete",
  keys: "delete",
  description: "Delete selected elements",
  scope: "canvas",
});

shortcuts.register({
  id: "group",
  keys: "g g",
  description: "Group selected shapes",
  scope: "canvas",
});

// Handle incoming key events (pure, DOM-independent)
const match = shortcuts.handle(
  { key: "z", ctrlKey: true },
  { scope: "canvas", editable: false },
);

if (match !== null) {
  console.log(`Triggered action: ${match.id}`);
}
```

## Running Tests

```bash
pnpm --filter @codrawithm/shortcuts test
pnpm --filter @codrawithm/shortcuts typecheck
```
