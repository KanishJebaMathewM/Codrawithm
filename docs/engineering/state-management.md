# State Management

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

The frontend uses a two-library approach: **Zustand** for client state (canvas, UI, auth) and **TanStack Query** for server state (boards list, user profile, assets). The Yjs CRDT document is the source of truth for canvas object data; Zustand stores derived UI state from it.

See [ADR-007](../architecture/architecture-decisions/ADR-007-state-management.md) for the decision record.

---

## Zustand Stores

Zustand stores are in `apps/web/src/stores/`. Each store is a separate module with explicit TypeScript types.

### Canvas Store

```typescript
// stores/canvas.store.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface CanvasStore {
  // Yjs
  ydoc: Y.Doc | null;
  boardId: string | null;

  // Viewport
  viewport: { x: number; y: number; zoom: number };
  setViewport: (viewport: Partial<Viewport>) => void;

  // Selection
  selectedIds: Set<string>;
  selectObjects: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  clearSelection: () => void;

  // Active Tool
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
  toolSettings: Record<ToolId, unknown>;
  setToolSetting: <T>(tool: ToolId, key: string, value: T) => void;

  // Derived (read from Yjs, not stored separately)
  getSelectedObjects: () => CanvasObject[];
}

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    ydoc: null,
    boardId: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    setViewport: (update) => set(s => ({ viewport: { ...s.viewport, ...update } })),
    selectedIds: new Set(),
    selectObjects: (ids) => set({ selectedIds: new Set(ids) }),
    addToSelection: (id) => set(s => ({ selectedIds: new Set([...s.selectedIds, id]) })),
    clearSelection: () => set({ selectedIds: new Set() }),
    activeTool: 'select',
    setActiveTool: (tool) => set({ activeTool: tool }),
    toolSettings: {},
    setToolSetting: (tool, key, value) =>
      set(s => ({ toolSettings: { ...s.toolSettings, [tool]: { ...s.toolSettings[tool], [key]: value } } })),
    getSelectedObjects: () => {
      const { ydoc, selectedIds } = get();
      if (!ydoc) return [];
      const yObjects = ydoc.getArray<Y.Map<unknown>>('objects');
      return yObjects.toArray()
        .filter(obj => selectedIds.has(obj.get('id') as string))
        .map(obj => Object.fromEntries(obj) as CanvasObject);
    },
  }))
);
```

### Collaboration Store

```typescript
// stores/collab.store.ts
interface CollabStore {
  connected: boolean;
  isSynced: boolean;
  connectedUsers: ConnectedUser[];
  setConnected: (v: boolean) => void;
  setConnectedUsers: (users: ConnectedUser[]) => void;
}
```

### UI Store

```typescript
// stores/ui.store.ts
interface UiStore {
  theme: 'dark' | 'light' | 'high-contrast';
  rightPanelTab: RightPanelTab | null;
  isFramesPanelOpen: boolean;
  isPresentationMode: boolean;
  setTheme: (theme: UiStore['theme']) => void;
  setRightPanelTab: (tab: RightPanelTab | null) => void;
  toggleFramesPanel: () => void;
  setPresentationMode: (on: boolean) => void;
}
```

### Auth Store

```typescript
// stores/auth.store.ts
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}
```

---

## TanStack Query

TanStack Query manages all server-state: fetching, caching, background refetching, and mutations.

### Query Keys

```typescript
// api/query-keys.ts
export const queryKeys = {
  boards: {
    all: ['boards'] as const,
    list: () => [...queryKeys.boards.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.boards.all, 'detail', id] as const,
  },
  user: {
    me: ['user', 'me'] as const,
  },
} as const;
```

### Example Query

```typescript
// api/boards.ts
export function useBoard(boardId: string) {
  return useQuery({
    queryKey: queryKeys.boards.detail(boardId),
    queryFn: () => api.get<Board>(`/boards/${boardId}`),
    staleTime: 30_000,    // 30 seconds
    gcTime: 5 * 60_000,  // 5 minutes
  });
}
```

### Example Mutation with Optimistic Update

```typescript
export function useUpdateBoardTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, title }: { boardId: string; title: string }) =>
      api.patch(`/boards/${boardId}`, { title }),

    // Optimistic update
    onMutate: async ({ boardId, title }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.boards.detail(boardId) });
      const previous = queryClient.getQueryData<Board>(queryKeys.boards.detail(boardId));
      queryClient.setQueryData(queryKeys.boards.detail(boardId), (old: Board) => ({
        ...old,
        title,
      }));
      return { previous, boardId };
    },

    // Rollback on error
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.boards.detail(context.boardId), context.previous);
      }
    },

    onSettled: (_data, _err, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
    },
  });
}
```

---

## Yjs as Canvas State Source of Truth

Canvas objects are not stored in Zustand. They live in the Yjs document. React components subscribe to Yjs changes directly:

```typescript
function useCanvasObjects(): CanvasObject[] {
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const ydoc = useCanvasStore(s => s.ydoc);

  useEffect(() => {
    if (!ydoc) return;
    const yObjects = ydoc.getArray<Y.Map<unknown>>('objects');

    const updateObjects = () => {
      setObjects(yObjects.toArray().map(m => Object.fromEntries(m) as CanvasObject));
    };

    yObjects.observe(updateObjects);
    updateObjects();
    return () => yObjects.unobserve(updateObjects);
  }, [ydoc]);

  return objects;
}
```

This ensures remote updates (from other collaborators) automatically trigger a re-render.

---

## State Update Flow

```
User draws a rectangle
        │
        ▼
Canvas tool creates a new CanvasObject
        │
        ▼
Mutation dispatched to Yjs: yObjects.push([new Y.Map(objectFields)])
        │
        ├─────────────────────────────────────────────────────────┐
        ▼                                                          ▼
Yjs observe fires locally                           Yjs serializes binary update
(instant UI update)                                          │
        │                                                    ▼
React re-renders with                          y-websocket sends to backend
new object visible                                          │
                                                            ▼
                                                Backend broadcasts to other clients
                                                            │
                                                            ▼
                                               Other clients' Yjs observe fires
                                               (their canvas re-renders)
```

---

## Related Documents

- [Frontend Architecture](../architecture/frontend-architecture.md)
- [Collaboration Engine](../architecture/collaboration-engine.md)
- [ADR-007: State Management](../architecture/architecture-decisions/ADR-007-state-management.md)
