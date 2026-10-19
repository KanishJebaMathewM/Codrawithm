# Codrawithm Initial Frontend TODO

## Delivered outcomes

- [x] **Contributor-ready workspace scaffold**
  - The codebase uses React 18, TypeScript 5 strict, Vite 5, Tailwind CSS 3, Konva/react-konva, Zustand, TanStack Router, Lucide React, Vitest-ready scripts, and Playwright-ready scripts.
  - The frontend is organized feature-first under `apps/web`, with explicit seams for future Rust/Axum backend, Yjs collaboration, plugins, algorithm visualizations, import/export, and 3D.
  - The supplied documentation remains available in `docs/` and the project includes `plan.md` describing how the parts fit together.

- [x] **Canvas-first editor shell**
  - The app provides a persistent top bar, collapsible left tool palette, central canvas, collapsible properties panel, minimap overlay, optional AI panel, and bottom status bar.
  - Controls use accessible labels, visible focus states, keyboard shortcuts, responsive collapse behavior, and the documented Inter/JetBrains Mono typography direction.

- [x] **Interactive 2D canvas milestone**
  - The canvas is pannable and zoomable with a dotted-grid background and a viewport that can be reset to fit the board.
  - Rectangle, ellipse, diamond, line, arrow, text, sticky note, frame, pen, connector, hand, zoom, and eraser tool affordances are present; shape/text/sticky/frame tools create local mock objects on the canvas.
  - Users can click to select objects, Shift+click to multi-select, drag selected shapes, delete selected objects, duplicate selected objects, and use undo/redo controls and keyboard shortcuts.
  - The object inspector exposes position, size, rotation, fill, stroke, opacity, and text controls for the selected object.
  - A minimap, collaborator cursor cues, autosave status, selection summary, coordinates, and zoom controls are visible in the editor shell.

- [x] **Workspace entry points**
  - The dashboard presents workspace cards for Whiteboard, Algorithm Lab, Developer Studio, and 3D Workspace with a clear entry CTA.
  - The Algorithm Lab route provides a starter sorting visualization view with array input, algorithm selection, step controls, speed control, complexity metadata, and step notes using local state.
  - The AI panel affordance opens a focused prompt surface with provider/usage status and a mock “insert to canvas” action.

- [x] **Local export and persistence seams**
  - Board JSON can be downloaded locally from the export menu and board state is persisted to local storage with a visible saved timestamp.
  - The project contains clearly named API/collaboration extension points without storing external credentials in the browser.

## Open follow-up outcomes

- [ ] Connect board state to Yjs + y-websocket + y-indexeddb and replace local history with CRDT-aware transactions.
- [ ] Implement full pointer gesture tool contracts, marquee selection, resize/rotation handles, connector routing, freehand smoothing, and PNG/SVG/PDF export.
- [ ] Add Rust/Axum API, PostgreSQL/Redis infrastructure, authentication, permissions, comments, and durable board storage.
- [ ] Add Shiki-backed code blocks, plugin sandbox/manifest permissions, lazy Three.js workspace, and production observability/performance harnesses.
