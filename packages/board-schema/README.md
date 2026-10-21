# @codrawithm/board-schema

The persisted document format for Codrawithm boards. It validates untrusted JSON, rejects ambiguous documents, and migrates the older `shapes`/`links` layout to the current `nodes`/`edges` layout.

## Install

```
npm install
```

## Use

```ts
import { createEmptyBoard, validateBoard, migrateToCurrent } from "@codrawithm/board-schema";

const board = createEmptyBoard("architecture", "Service map");
const checked = validateBoard(board);
if (!checked.ok) {
  console.error(checked.issues);
}

const migrated = migrateToCurrent(legacyPayload);
```

`validateBoard` returns a discriminated union: `{ ok: true, board }` or `{ ok: false, issues }`. Issues carry a stable `code`, a JSON-style `path`, and a human readable message. Validation never throws, never mutates its input, and never repairs a document silently.

## Current format

A board has `schemaVersion: 2`, an id, a title, an array of nodes and an array of edges. Nodes carry geometry, rotation, a label and a style. Edges reference node ids and carry their own paint style. Edge endpoints must resolve to a node in the same document.

## Migration

Version 1 stored `shapes` and `links`, used `type` instead of `kind`, `w`/`h` instead of `width`/`height`, and had no style block. `migrateToCurrent` validates the legacy payload first, then produces a version 2 document with defaults filled in. Unknown top-level keys are reported as `unknown_field` errors rather than ignored, because a silent drop can destroy data written by a newer client.

## Test

```
npm test
npm run typecheck
```
