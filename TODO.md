# Codrawithm Phase 1 Local MVP TODO

## Delivered outcomes

- [x] **Existing local application foundation**
  - The existing app uses React + TypeScript + Vite, Konva, Zustand, a pnpm workspace, a feature-first frontend structure, and local-only state seams; this work reuses those foundations rather than adding a hosted service.
  - The initial contributor scaffold, dashboard, canvas shell, algorithm route, local storage, and JSON download pre-exist this MVP scope.

## In progress / MVP outcomes

- [ ] **Canvas-first workspace navigation**
  - The canvas is the primary entry screen; there is no separate dashboard workflow. Users can switch/create boards and open the algorithm visualization from the canvas top bar.
  - A Sign in entry point is visible at the top right and explains that authentication/cloud sync are not yet connected; local-only storage behavior is clear.
  - AI Studio is reachable from the canvas; it accurately indicates that no provider is connected and does not imply offline generation works.

- [ ] **Expanded canvas controls and board appearance**
  - The left tool rail is grouped, scrollable, and contains additional shape/content tools. Hovering or focusing a tool exposes stroke-color choices.
  - Users can choose a board background color. The overview/minimap is off by default and can be enabled in settings; the preference is saved locally.

- [ ] **Canvas drawing and object manipulation**
  - Users can draw shapes, lines/arrows, text, sticky notes, and frames by dragging on the canvas; users can create freehand strokes with the pen and erase strokes with the eraser.
  - Users can select one or multiple objects, move them, resize and rotate them, delete them, and duplicate them. Shift-click adds or toggles items in a multi-selection; clicking empty canvas clears selection.
  - Users can pan and zoom the canvas and use the documented core tool-selection and undo/redo keyboard shortcuts without shortcuts hijacking text-entry controls.

- [ ] **Board state, autosave, and bounded history**
  - A board has a serializable document and distinct object list. Board edits autosave locally and survive reload; multiple boards are stored independently and switching boards does not overwrite another board.
  - Undo and redo restore document edits, including completed drawing/manipulation operations, and the undo history is capped at 100 operations.
  - Save status reflects pending and completed persistence rather than declaring unsaved work saved solely because time elapsed.

- [ ] **JSON portability and local image/vector export**
  - Users can download a Codrawithm JSON board containing format/version, board identity/title, workspace type, objects, connectors, frames, algorithm state, and export metadata.
  - Users can import a `.json` Codrawithm board. Validation rejects malformed/unsupported documents with a descriptive error; the user can review the board title and object count and confirm import as a new board. Import never overwrites an existing board.
  - Users can export the current 2D board as PNG and SVG, in addition to JSON; export is local and does not send board contents to a server.

- [ ] **Starter board templates**
  - Users can start a blank board, a flowchart board, or a mind-map board. Creating a board from a template creates a distinct board and does not replace existing boards.

- [x] **Local build and run**
  - Automated tests cover board schema/round-trip and bounded history; all six frontend unit tests pass, the TypeScript production build passes, and the Vite production build completes.
  - The local Vite app starts on `127.0.0.1:3000` and responds with HTTP 200; its development server is left running.

- [ ] **Accessibility and responsive acceptance**
  - Existing instrument-panel styling, canvas-first layout, readable labels, focus visibility, reduced-motion behavior, and responsive behavior are preserved or improved.

## Deferred roadmap outcomes

- [ ] **Phase 1 platform backend** — Rust + Axum health/API scaffold, PostgreSQL schema/migrations, and backend integration tests remain deferred from this plain-local browser MVP.
- [ ] **Later phases** — Yjs collaboration and offline sync, accounts/permissions/comments, AI plugin platform, 3D workspace, advanced algorithm visualizations, production observability, and production deployment remain roadmap work and are not represented as implemented here.
