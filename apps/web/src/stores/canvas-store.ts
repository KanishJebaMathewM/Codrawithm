import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { starterObjects } from '../lib/mock-data';
import type { CanvasObject, ToolId, Viewport } from '../types';

const HISTORY_LIMIT = 100;

interface CanvasState {
  boardId: string;
  boardName: string;
  objects: CanvasObject[];
  boardDocuments: Record<string, CanvasObject[]>;
  boardNames: Record<string, string>;
  selectedIds: string[];
  activeTool: ToolId;
  viewport: Viewport;
  showProperties: boolean;
  showMinimap: boolean;
  showAiPanel: boolean;
  gridVisible: boolean;
  boardBackground: string;
  saveState: 'saved' | 'saving' | 'unsaved';
  lastSaved: string;
  currentColor: string;
  currentFill: string;
  currentStrokeWidth: number;
  past: CanvasObject[][];
  future: CanvasObject[][];
  setBoard: (boardId: string, boardName?: string) => void;
  createBoard: (boardName: string, objects?: CanvasObject[]) => string;
  setBoardName: (boardName: string) => void;
  setTool: (tool: ToolId) => void;
  setCurrentColor: (color: string) => void;
  setCurrentFill: (fill: string) => void;
  setCurrentStrokeWidth: (width: number) => void;
  toggleProperties: () => void;
  toggleMinimap: () => void;
  toggleAiPanel: () => void;
  toggleGrid: () => void;
  setBoardBackground: (color: string) => void;
  setViewport: (viewport: Viewport) => void;
  zoomBy: (factor: number, anchor?: { x: number; y: number }) => void;
  select: (id: string | null, additive?: boolean) => void;
  selectMany: (ids: string[]) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  updateObjects: (updates: { id: string; patch: Partial<CanvasObject> }[]) => void;
  deleteObject: (id: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  clearBoard: () => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
}

const clone = (objects: CanvasObject[]) => objects.map((object) => ({ ...object, ...(object.points ? { points: [...object.points] } : {}) }));
const snapshot = (objects: CanvasObject[][], current: CanvasObject[]) => [...objects, clone(current)].slice(-HISTORY_LIMIT);
const newId = () => globalThis.crypto?.randomUUID?.() ?? `board-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      boardId: 'system-map',
      boardName: 'Distributed system map',
      objects: clone(starterObjects),
      boardDocuments: { 'system-map': clone(starterObjects) },
      boardNames: { 'system-map': 'Distributed system map' },
      selectedIds: [],
      activeTool: 'select',
      viewport: { x: 0, y: 0, zoom: 0.86 },
      showProperties: true,
      showMinimap: false,
      showAiPanel: false,
      gridVisible: true,
      boardBackground: '#fbfcff',
      currentColor: '#4f46e5',
      currentFill: '#eef2ff',
      currentStrokeWidth: 2,
      saveState: 'saved',
      lastSaved: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      past: [],
      future: [],
      setBoard: (boardId, requestedName) => set((state) => {
        const boardDocuments = { ...state.boardDocuments, [state.boardId]: clone(state.objects) };
        const boardNames = { ...state.boardNames, [state.boardId]: state.boardName };
        const known = Object.hasOwn(boardDocuments, boardId);
        const nextObjects = known ? boardDocuments[boardId] : boardId === 'system-map' ? starterObjects : [];
        const nextName = requestedName ?? boardNames[boardId] ?? (boardId === 'new' ? 'Untitled board' : boardId === 'system-map' ? 'Distributed system map' : 'Untitled board');
        boardDocuments[boardId] = clone(nextObjects);
        boardNames[boardId] = nextName;
        return { boardId, boardName: nextName, boardDocuments, boardNames, objects: clone(nextObjects), selectedIds: [], past: [], future: [], saveState: 'saved' };
      }),
      createBoard: (boardName, objects = []) => {
        const id = newId();
        set((state) => ({
          boardId: id,
          boardName,
          objects: clone(objects),
          boardDocuments: { ...state.boardDocuments, [state.boardId]: clone(state.objects), [id]: clone(objects) },
          boardNames: { ...state.boardNames, [state.boardId]: state.boardName, [id]: boardName },
          selectedIds: [],
          activeTool: 'select',
          past: [],
          future: [],
          saveState: 'saved',
        }));
        return id;
      },
      setBoardName: (boardName) => set((state) => ({ boardName, boardNames: { ...state.boardNames, [state.boardId]: boardName }, saveState: 'unsaved' })),
      setTool: (activeTool) => set({ activeTool }),
      setCurrentColor: (currentColor) => set({ currentColor }),
      setCurrentFill: (currentFill) => set({ currentFill }),
      setCurrentStrokeWidth: (currentStrokeWidth) => set({ currentStrokeWidth }),
      toggleProperties: () => set((state) => ({ showProperties: !state.showProperties })),
      toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
      toggleAiPanel: () => set((state) => ({ showAiPanel: !state.showAiPanel })),
      toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),
      setBoardBackground: (boardBackground) => set({ boardBackground }),
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
      addObject: (object) => set((state) => {
        const objects = [...state.objects, object];
        return { objects, boardDocuments: { ...state.boardDocuments, [state.boardId]: clone(objects) }, past: snapshot(state.past, state.objects), future: [], selectedIds: [object.id], saveState: 'unsaved' };
      }),
      updateObject: (id, patch) => get().updateObjects([{ id, patch }]),
      updateObjects: (updates) => set((state) => {
        const objects = state.objects.map((object) => {
          const update = updates.find((candidate) => candidate.id === object.id);
          return update ? { ...object, ...update.patch } : object;
        });
        return { objects, boardDocuments: { ...state.boardDocuments, [state.boardId]: clone(objects) }, past: snapshot(state.past, state.objects), future: [], saveState: 'unsaved' };
      }),
      deleteObject: (id) => set((state) => {
        const objects = state.objects.filter((object) => object.id !== id);
        return { objects, boardDocuments: { ...state.boardDocuments, [state.boardId]: clone(objects) }, past: snapshot(state.past, state.objects), future: [], selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id), saveState: 'unsaved' };
      }),
      deleteSelected: () => set((state) => {
        if (!state.selectedIds.length) return state;
        const objects = state.objects.filter((object) => !state.selectedIds.includes(object.id));
        return { objects, boardDocuments: { ...state.boardDocuments, [state.boardId]: clone(objects) }, past: snapshot(state.past, state.objects), future: [], selectedIds: [], saveState: 'unsaved' };
      }),
      duplicateSelected: () => set((state) => {
        const duplicates = state.objects.filter((object) => state.selectedIds.includes(object.id)).map((object) => ({ ...object, id: `${object.id}-copy-${newId()}`, x: object.x + 24, y: object.y + 24 }));
        if (!duplicates.length) return state;
        const objects = [...state.objects, ...duplicates];
        return { objects, boardDocuments: { ...state.boardDocuments, [state.boardId]: clone(objects) }, past: snapshot(state.past, state.objects), future: [], selectedIds: duplicates.map((object) => object.id), saveState: 'unsaved' };
      }),
      bringForward: () => set((state) => {
        const index = state.objects.findIndex((object) => state.selectedIds.includes(object.id));
        if (index < 0 || index === state.objects.length - 1) return state;
        const objects = [...state.objects];
        [objects[index], objects[index + 1]] = [objects[index + 1], objects[index]];
        return { objects, boardDocuments: { ...state.boardDocuments, [state.boardId]: clone(objects) }, past: snapshot(state.past, state.objects), future: [], saveState: 'unsaved' };
      }),
      sendBackward: () => set((state) => {
        const index = state.objects.findIndex((object) => state.selectedIds.includes(object.id));
        if (index <= 0) return state;
        const objects = [...state.objects];
        [objects[index - 1], objects[index]] = [objects[index], objects[index - 1]];
        return { objects, boardDocuments: { ...state.boardDocuments, [state.boardId]: clone(objects) }, past: snapshot(state.past, state.objects), future: [], saveState: 'unsaved' };
      }),
      clearBoard: () => set((state) => {
        if (!state.objects.length) return state;
        const objects: CanvasObject[] = [];
        return { objects, boardDocuments: { ...state.boardDocuments, [state.boardId]: objects }, past: snapshot(state.past, state.objects), future: [], selectedIds: [], saveState: 'unsaved' };
      }),
      undo: () => set((state) => {
        const previous = state.past.at(-1);
        if (!previous) return state;
        const objects = clone(previous);
        return { objects, boardDocuments: { ...state.boardDocuments, [state.boardId]: clone(objects) }, past: state.past.slice(0, -1), future: [clone(state.objects), ...state.future].slice(0, HISTORY_LIMIT), selectedIds: [], saveState: 'unsaved' };
      }),
      redo: () => set((state) => {
        const next = state.future[0];
        if (!next) return state;
        const objects = clone(next);
        return { objects, boardDocuments: { ...state.boardDocuments, [state.boardId]: clone(objects) }, past: snapshot(state.past, state.objects), future: state.future.slice(1), selectedIds: [], saveState: 'unsaved' };
      }),
      markSaved: () => set({ saveState: 'saved', lastSaved: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }),
    }),
    { name: 'codrawithm-canvas-v1', version: 2, migrate: (persisted) => { const old = persisted as Partial<CanvasState>; return { objects: old.objects ?? [], boardDocuments: old.boardDocuments ?? {}, boardNames: old.boardNames ?? {}, boardId: old.boardId ?? 'new', boardName: old.boardName ?? 'Untitled board', lastSaved: old.lastSaved ?? '', showMinimap: false, gridVisible: old.gridVisible ?? true, boardBackground: old.boardBackground ?? '#fbfcff', currentColor: old.currentColor ?? '#4f46e5', currentFill: old.currentFill ?? '#eef2ff' }; }, partialize: (state) => ({ objects: state.objects, boardDocuments: state.boardDocuments, boardNames: state.boardNames, boardId: state.boardId, boardName: state.boardName, lastSaved: state.lastSaved, showMinimap: state.showMinimap, gridVisible: state.gridVisible, boardBackground: state.boardBackground, currentColor: state.currentColor, currentFill: state.currentFill }) },
  ),
);
