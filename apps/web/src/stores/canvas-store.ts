import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { starterObjects } from '../lib/mock-data';
import type { CanvasObject, ToolId, Viewport } from '../types';

interface CanvasState {
  boardId: string;
  boardName: string;
  objects: CanvasObject[];
  boardDocuments: Record<string, CanvasObject[]>;
  selectedIds: string[];
  activeTool: ToolId;
  viewport: Viewport;
  showProperties: boolean;
  showMinimap: boolean;
  showAiPanel: boolean;
  gridVisible: boolean;
  saveState: 'saved' | 'saving' | 'unsaved';
  lastSaved: string;
  past: CanvasObject[][];
  future: CanvasObject[][];
  setBoard: (boardId: string, boardName?: string) => void;
  setTool: (tool: ToolId) => void;
  toggleProperties: () => void;
  toggleMinimap: () => void;
  toggleAiPanel: () => void;
  toggleGrid: () => void;
  setViewport: (viewport: Viewport) => void;
  zoomBy: (factor: number, anchor?: { x: number; y: number }) => void;
  select: (id: string | null, additive?: boolean) => void;
  selectMany: (ids: string[]) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
}

const clone = (objects: CanvasObject[]) => objects.map((object) => ({ ...object }));

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      boardId: 'system-map',
      boardName: 'Distributed system map',
      objects: clone(starterObjects),
      boardDocuments: { 'system-map': clone(starterObjects) },
      selectedIds: [],
      activeTool: 'select',
      viewport: { x: 0, y: 0, zoom: 0.86 },
      showProperties: true,
      showMinimap: true,
      showAiPanel: false,
      gridVisible: true,
      saveState: 'saved',
      lastSaved: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      past: [],
      future: [],
      setBoard: (boardId, boardName = 'Untitled board') => set((state) => {
        const boardDocuments = { ...state.boardDocuments, [state.boardId]: clone(state.objects) };
        const nextObjects = boardDocuments[boardId] ?? (boardId === 'new' ? [] : clone(starterObjects));
        return { boardId, boardName, boardDocuments, objects: clone(nextObjects), selectedIds: [], past: [], future: [], saveState: 'saved', lastSaved: 'just now' };
      }),
      setTool: (activeTool) => set({ activeTool }),
      toggleProperties: () => set((state) => ({ showProperties: !state.showProperties })),
      toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
      toggleAiPanel: () => set((state) => ({ showAiPanel: !state.showAiPanel })),
      toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),
      setViewport: (viewport) => set({ viewport }),
      zoomBy: (factor, anchor) => set((state) => {
        const nextZoom = Math.min(2.4, Math.max(0.35, state.viewport.zoom * factor));
        if (!anchor) return { viewport: { ...state.viewport, zoom: nextZoom } };
        const worldX = (anchor.x - state.viewport.x) / state.viewport.zoom;
        const worldY = (anchor.y - state.viewport.y) / state.viewport.zoom;
        return { viewport: { x: anchor.x - worldX * nextZoom, y: anchor.y - worldY * nextZoom, zoom: nextZoom } };
      }),
      select: (id, additive = false) => set((state) => ({
        selectedIds: id === null ? [] : additive
          ? state.selectedIds.includes(id) ? state.selectedIds.filter((selectedId) => selectedId !== id) : [...state.selectedIds, id]
          : [id],
      })),
      selectMany: (selectedIds) => set({ selectedIds }),
      addObject: (object) => set((state) => ({
        objects: [...state.objects, object],
        past: [...state.past, clone(state.objects)],
        future: [],
        selectedIds: [object.id],
        saveState: 'unsaved',
      })),
      updateObject: (id, patch) => set((state) => ({
        objects: state.objects.map((object) => object.id === id ? { ...object, ...patch } : object),
        past: [...state.past, clone(state.objects)],
        future: [],
        saveState: 'unsaved',
      })),
      deleteSelected: () => set((state) => ({
        objects: state.objects.filter((object) => !state.selectedIds.includes(object.id)),
        past: [...state.past, clone(state.objects)],
        future: [],
        selectedIds: [],
        saveState: 'unsaved',
      })),
      duplicateSelected: () => set((state) => {
        const duplicates = state.objects.filter((object) => state.selectedIds.includes(object.id)).map((object) => ({ ...object, id: `${object.id}-copy-${Date.now()}-${Math.random().toString(16).slice(2)}`, x: object.x + 24, y: object.y + 24 }));
        return { objects: [...state.objects, ...duplicates], past: [...state.past, clone(state.objects)], future: [], selectedIds: duplicates.map((object) => object.id), saveState: 'unsaved' };
      }),
      undo: () => set((state) => {
        const previous = state.past.at(-1);
        if (!previous) return state;
        return { objects: clone(previous), past: state.past.slice(0, -1), future: [clone(state.objects), ...state.future], selectedIds: [], saveState: 'unsaved' };
      }),
      redo: () => set((state) => {
        const next = state.future[0];
        if (!next) return state;
        return { objects: clone(next), past: [...state.past, clone(state.objects)], future: state.future.slice(1), selectedIds: [], saveState: 'unsaved' };
      }),
      markSaved: () => set({ saveState: 'saved', lastSaved: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }),
    }),
    { name: 'codrawithm-canvas-v1', partialize: (state) => ({ objects: state.objects, boardDocuments: state.boardDocuments, boardId: state.boardId, boardName: state.boardName, lastSaved: state.lastSaved }) },
  ),
);
