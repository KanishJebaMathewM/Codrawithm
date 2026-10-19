# Frontend Architecture

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

The frontend is a React 18 single-page application written in TypeScript. It is organized as a feature-first monorepo package (`apps/web`) within the Codrawithm monorepo.

---

## Module Structure

```
apps/web/
├── src/
│   ├── main.tsx                   # App entry point
│   ├── router.tsx                 # TanStack Router route definitions
│   ├── app.tsx                    # Root component, providers
│   │
│   ├── features/                  # Feature modules (vertical slices)
│   │   ├── auth/                  # Login, signup, OAuth flow
│   │   ├── dashboard/             # Board grid, search, sidebar
│   │   ├── canvas/                # Canvas engine and tools
│   │   │   ├── engine/            # Scene model, coordinate transform
│   │   │   ├── tools/             # Tool implementations (select, rect, etc.)
│   │   │   ├── objects/           # Shape renderers (Rectangle, Arrow, etc.)
│   │   │   └── canvas-root.tsx    # Root canvas component (Konva Stage)
│   │   ├── collaboration/         # Yjs setup, awareness, sync
│   │   ├── algorithm-viz/         # Algorithm visualization workspace
│   │   ├── three-d/               # 3D workspace (React Three Fiber)
│   │   ├── ai-studio/             # AI Studio panel and prompt
│   │   ├── plugins/               # Plugin loader, iframe sandbox, bridge
│   │   ├── presentation/          # Presentation mode, frames panel
│   │   └── export/                # PNG, SVG, PDF, JSON export
│   │
│   ├── stores/                    # Zustand stores
│   │   ├── canvas.store.ts        # Canvas state (selected objects, active tool, zoom)
│   │   ├── collab.store.ts        # Collaboration state (connected users, awareness)
│   │   ├── ui.store.ts            # UI state (panels open/closed, theme)
│   │   └── auth.store.ts          # Auth state (current user, tokens)
│   │
│   ├── api/                       # TanStack Query hooks + API client
│   │   ├── client.ts              # Axios/fetch client with auth headers
│   │   ├── boards.ts              # Board CRUD queries and mutations
│   │   ├── assets.ts              # Asset upload hooks
│   │   └── ai.ts                  # AI generation mutations
│   │
│   ├── lib/                       # Shared utilities
│   │   ├── canvas-math.ts         # Coordinate transforms, hit testing
│   │   ├── crdt.ts                # Yjs document helpers
│   │   └── shortcuts.ts           # Keyboard shortcut registry
│   │
│   └── components/                # Shared UI components (not feature-specific)
│       ├── toolbar/
│       ├── panels/
│       └── overlays/
│
├── public/                        # Static assets
├── index.html
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

---

## Routing

**Library:** TanStack Router (file-based routes).

```
/                        → Dashboard (board grid)
/board/:boardId          → Canvas editor
/board/:boardId/present  → Presentation mode
/board/:boardId/share    → Shared view (read-only or follow-presenter)
/auth/login              → Login page
/auth/signup             → Sign-up page
/auth/callback           → OAuth callback handler
/settings                → User settings
/settings/profile
/settings/security
```

All canvas routes use a code-split `lazy()` import to keep the initial bundle small.

---

## State Management

### Zustand Stores

Three primary stores manage global state:

**`canvas.store.ts`**
```typescript
interface CanvasState {
  // Document
  ydoc: Y.Doc | null;
  boardId: string | null;

  // Viewport
  viewport: { x: number; y: number; zoom: number };

  // Selection
  selectedIds: Set<string>;
  selectionRect: Rect | null;

  // Active tool
  activeTool: ToolId;
  toolSettings: Record<ToolId, ToolSettings>;

  // Derived (computed, not persisted)
  selectedObjects: CanvasObject[];
}
```

**`collab.store.ts`**
```typescript
interface CollabState {
  connected: boolean;
  connectedUsers: ConnectedUser[];
  awareness: Map<number, UserAwareness>;
  isSynced: boolean;
}
```

**`ui.store.ts`**
```typescript
interface UiState {
  theme: 'dark' | 'light' | 'high-contrast';
  rightPanelTab: RightPanelTab | null;
  isFramesPanelOpen: boolean;
  isPresentationMode: boolean;
}
```

### TanStack Query

Used for all server-state (data that lives on the backend):
- `useBoards()` — fetch user's boards list.
- `useBoard(boardId)` — fetch a single board's metadata and initial state.
- `useCreateBoard()` — create board mutation.
- `useUpdateBoard()` — board settings mutation.
- `useUploadAsset()` — image upload workflow.
- `useAiGenerate()` — AI generation mutation.

**Pattern:** Mutations use optimistic updates. The local state is updated immediately, and the server response reconciles any differences.

---

## Canvas Architecture

The canvas is implemented as a layered Konva Stage:

```typescript
<Stage width={window.innerWidth} height={window.innerHeight}>
  {/* Layer 1: Background (grid, canvas color) */}
  <Layer name="background" listening={false} />

  {/* Layer 2: Objects (shapes, text, connectors, images) */}
  <Layer name="objects">
    {objects.map(obj => <ObjectRenderer key={obj.id} object={obj} />)}
  </Layer>

  {/* Layer 3: Selection (bounding boxes, handles) */}
  <Layer name="selection" listening={false} />

  {/* Layer 4: Interaction (hit testing, tool previews) */}
  <Layer name="interaction" />

  {/* Layer 5: Collaboration (remote cursors) */}
  <Layer name="collaboration" listening={false} />
</Stage>
```

**Object rendering:** Each canvas object type has a renderer component:
- `RectangleRenderer` → `Konva.Rect`
- `EllipseRenderer` → `Konva.Ellipse`
- `TextRenderer` → `Konva.Text`
- `ArrowRenderer` → `Konva.Arrow` or `Konva.Line`
- `FreehandRenderer` → `Konva.Line` (bezier)
- `ImageRenderer` → `Konva.Image`
- `CodeBlockRenderer` → `Konva.Group` + foreign object (HTML)
- `FrameRenderer` → `Konva.Group` + `Konva.Rect` + `Konva.Text` (label)

See [Canvas Engine](canvas-engine.md) for scene model and coordinate system details.

---

## Collaboration Integration

The collaboration system is based on Yjs.

```typescript
// In canvas feature bootstrap
const ydoc = new Y.Doc();
const provider = new WebsocketProvider(
  `wss://${backendHost}/ws/board/${boardId}`,
  boardId,
  ydoc
);

// The canvas object array is a Yjs shared type
const yObjects = ydoc.getArray<Y.Map<unknown>>('objects');

// Awareness (cursor positions)
const awareness = provider.awareness;
awareness.setLocalStateField('cursor', { x, y });
awareness.setLocalStateField('user', { name, color });
```

**Rendering from CRDT:** The canvas subscribes to `yObjects.observe()` and re-renders when the CRDT changes. All mutations go through Yjs (not directly to React state), so remote changes automatically trigger re-renders.

---

## Plugin Integration

Plugins load as sandboxed iframes. The plugin loader:

1. Fetches the plugin manifest from the plugin registry API.
2. Creates a hidden `<iframe sandbox="allow-scripts allow-forms" src="...">` element.
3. Establishes a `postMessage` channel with the iframe.
4. Exposes a limited `PluginAPI` over the postMessage bridge.
5. Renders the plugin's UI in the right panel (Plugins tab).

See [Plugin System Architecture](plugin-system.md) for details.

---

## Performance Considerations

- **Virtual rendering:** Objects outside the viewport are not rendered. The canvas engine maintains a spatial index (R-tree) for efficient viewport culling.
- **Canvas layer separation:** The `objects` layer re-renders on every canvas change. The `collaboration` layer re-renders only on cursor moves. The `selection` layer re-renders only on selection change.
- **Memoization:** Object renderers are wrapped in `React.memo` with custom equality (comparing object ID and version number).
- **Web Workers:** Large algorithm step computations (> 1,000 steps) are offloaded to a Web Worker.
- **Image caching:** Canvas images are loaded once and cached in a `Map<string, HTMLImageElement>`.

---

## Related Documents

- [Architecture Overview](overview.md)
- [Canvas Engine](canvas-engine.md)
- [State Management (Engineering)](../engineering/state-management.md)
- [Rendering Pipeline](rendering-pipeline.md)
- [Collaboration Engine](collaboration-engine.md)
- [Plugin System](plugin-system.md)
