export interface HistoryEntry<T> {
  label: string;
  before: T;
  after: T;
  mergeKey?: string;
  timestamp: number;
}

export interface HistorySnapshot<T> {
  state: T;
  canUndo: boolean;
  canRedo: boolean;
  entries: readonly HistoryEntry<T>[];
  redoEntries: readonly HistoryEntry<T>[];
}

export interface ApplyOptions {
  mergeKey?: string;
}

export interface Transaction<T> {
  apply(label: string, change: (state: T) => T, options?: ApplyOptions): boolean;
}

export interface HistoryOptions<T> {
  limit?: number;
  mergeWindowMs?: number;
  now?: () => number;
}

export interface History<T> {
  readonly state: T;
  apply(label: string, change: (state: T) => T, options?: ApplyOptions): boolean;
  transaction(label: string, work: (tx: Transaction<T>) => void): boolean;
  undo(): T | undefined;
  redo(): T | undefined;
  canUndo(): boolean;
  canRedo(): boolean;
  entries(): readonly HistoryEntry<T>[];
  redoEntries(): readonly HistoryEntry<T>[];
  clear(): void;
  subscribe(listener: (snapshot: HistorySnapshot<T>) => void): () => void;
}

const DEFAULT_LIMIT = 200;
const DEFAULT_MERGE_WINDOW_MS = 400;

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

export function createHistory<T>(initialState: T, options: HistoryOptions<T> = {}): History<T> {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const mergeWindowMs = options.mergeWindowMs ?? DEFAULT_MERGE_WINDOW_MS;
  const now = options.now ?? (() => Date.now());
  assertPositiveInteger(limit, "limit");
  if (!Number.isFinite(mergeWindowMs) || mergeWindowMs < 0) {
    throw new RangeError("mergeWindowMs must be a non-negative number");
  }

  let current = initialState;
  let undoStack: HistoryEntry<T>[] = [];
  let redoStack: HistoryEntry<T>[] = [];
  let inTransaction = false;
  const listeners = new Set<(snapshot: HistorySnapshot<T>) => void>();

  function snapshot(): HistorySnapshot<T> {
    return {
      state: current,
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
      entries: undoStack.slice(),
      redoEntries: redoStack.slice(),
    };
  }

  function notify(): void {
    const currentSnapshot = snapshot();
    for (const listener of Array.from(listeners)) {
      listener(currentSnapshot);
    }
  }

  function pushEntry(entry: HistoryEntry<T>): void {
    undoStack.push(entry);
    if (undoStack.length > limit) {
      undoStack.shift();
    }
    redoStack = [];
    notify();
  }

  function apply(label: string, change: (state: T) => T, applyOptions: ApplyOptions = {}): boolean {
    if (inTransaction) {
      throw new Error("apply must be called through the transaction handle");
    }
    const next = change(current);
    if (Object.is(next, current)) {
      return false;
    }
    const timestamp = now();
    const newest = undoStack[undoStack.length - 1];
    const mergeKey = applyOptions.mergeKey;
    if (
      newest !== undefined &&
      mergeKey !== undefined &&
      newest.mergeKey === mergeKey &&
      timestamp - newest.timestamp <= mergeWindowMs
    ) {
      newest.after = next;
      newest.timestamp = timestamp;
      newest.label = label;
      current = next;
      redoStack = [];
      notify();
      return true;
    }
    const entry: HistoryEntry<T> = { label, before: current, after: next, timestamp };
    if (mergeKey !== undefined) {
      entry.mergeKey = mergeKey;
    }
    current = next;
    pushEntry(entry);
    return true;
  }

  function transaction(label: string, work: (tx: Transaction<T>) => void): boolean {
    if (inTransaction) {
      throw new Error("transactions cannot be nested");
    }
    inTransaction = true;
    const base = current;
    let cursor = current;
    const tx: Transaction<T> = {
      apply(innerLabel, change, applyOptions = {}) {
        const next = change(cursor);
        if (Object.is(next, cursor)) {
          return false;
        }
        cursor = next;
        void innerLabel;
        void applyOptions;
        return true;
      },
    };
    try {
      work(tx);
    } catch (error) {
      cursor = base;
      throw error;
    } finally {
      inTransaction = false;
    }
    if (Object.is(cursor, base)) {
      return false;
    }
    const entry: HistoryEntry<T> = {
      label,
      before: base,
      after: cursor,
      timestamp: now(),
    };
    current = cursor;
    pushEntry(entry);
    return true;
  }

  function undo(): T | undefined {
    const entry = undoStack.pop();
    if (entry === undefined) {
      return undefined;
    }
    redoStack.push(entry);
    current = entry.before;
    notify();
    return current;
  }

  function redo(): T | undefined {
    const entry = redoStack.pop();
    if (entry === undefined) {
      return undefined;
    }
    undoStack.push(entry);
    if (undoStack.length > limit) {
      undoStack.shift();
    }
    current = entry.after;
    notify();
    return current;
  }

  function clear(): void {
    undoStack = [];
    redoStack = [];
    notify();
  }

  function subscribe(listener: (value: HistorySnapshot<T>) => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    get state() {
      return current;
    },
    apply,
    transaction,
    undo,
    redo,
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    entries: () => undoStack.slice(),
    redoEntries: () => redoStack.slice(),
    clear,
    subscribe,
  };
}
