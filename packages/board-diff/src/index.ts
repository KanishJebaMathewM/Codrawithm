import type {
  BoardDocument,
  BoardEdge,
  BoardNode,
} from "@codrawithm/board-schema";

export type { BoardDocument, BoardEdge, BoardNode };

export interface IdentifiedItem {
  readonly id: string;
}

export interface ItemAddition<T extends IdentifiedItem = IdentifiedItem> {
  readonly type: "add";
  readonly id: string;
  readonly item: T;
  readonly after: T;
}

export interface ItemRemoval<T extends IdentifiedItem = IdentifiedItem> {
  readonly type: "remove";
  readonly id: string;
  readonly item: T;
  readonly before: T;
}

export interface ItemUpdate<T extends IdentifiedItem = IdentifiedItem> {
  readonly type: "update";
  readonly id: string;
  readonly before: T;
  readonly after: T;
  readonly paths: readonly string[];
}

export type ItemAdd<T extends IdentifiedItem = IdentifiedItem> = ItemAddition<T>;
export type ItemRemove<T extends IdentifiedItem = IdentifiedItem> = ItemRemoval<T>;

export type ItemChange<T extends IdentifiedItem = IdentifiedItem> =
  | ItemAddition<T>
  | ItemRemoval<T>
  | ItemUpdate<T>;

export interface CollectionDiff<T extends IdentifiedItem = IdentifiedItem> {
  readonly changes: readonly ItemChange<T>[];
  readonly targetOrder: readonly string[];
  readonly orderChanged: boolean;
}

export interface BoardDiff {
  readonly nodes: CollectionDiff<BoardNode>;
  readonly edges: CollectionDiff<BoardEdge>;
  readonly title?: string;
  readonly schemaVersion?: number;
}

export type BoardSnapshot = BoardDocument;

export class BoardDiffError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BoardDiffError";
    Object.setPrototypeOf(this, BoardDiffError.prototype);
  }
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (typeof a === "number" && typeof b === "number") {
    if (Number.isNaN(a) && Number.isNaN(b)) {
      return true;
    }
    return a === b;
  }

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (Array.isArray(b)) {
    return false;
  }

  if (!isPlainObject(a) || !isPlainObject(b)) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

export function changedPaths(before: unknown, after: unknown, prefix = ""): string[] {
  if (deepEqual(before, after)) {
    return [];
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const result: string[] = [];

    for (const key of keys) {
      const path = prefix ? `${prefix}.${key}` : key;
      const hasBefore = Object.prototype.hasOwnProperty.call(before, key);
      const hasAfter = Object.prototype.hasOwnProperty.call(after, key);

      if (!hasBefore || !hasAfter) {
        result.push(path);
      } else {
        const valBefore = before[key];
        const valAfter = after[key];
        if (!deepEqual(valBefore, valAfter)) {
          if (isPlainObject(valBefore) && isPlainObject(valAfter)) {
            result.push(...changedPaths(valBefore, valAfter, path));
          } else {
            result.push(path);
          }
        }
      }
    }

    result.sort();
    return result;
  }

  return prefix ? [prefix] : [""];
}

export function diffById<T extends IdentifiedItem>(
  previous: readonly T[],
  next: readonly T[],
): ItemChange<T>[] {
  const prevMap = new Map<string, T>();
  for (const item of previous) {
    if (!item || typeof item.id !== "string" || item.id === "") {
      throw new BoardDiffError("Item in previous collection is missing a valid id");
    }
    if (prevMap.has(item.id)) {
      throw new BoardDiffError(`Duplicate id found in previous collection: "${item.id}"`);
    }
    prevMap.set(item.id, item);
  }

  const nextMap = new Map<string, T>();
  for (const item of next) {
    if (!item || typeof item.id !== "string" || item.id === "") {
      throw new BoardDiffError("Item in next collection is missing a valid id");
    }
    if (nextMap.has(item.id)) {
      throw new BoardDiffError(`Duplicate id found in next collection: "${item.id}"`);
    }
    nextMap.set(item.id, item);
  }

  const changes: ItemChange<T>[] = [];

  // Emit removals and updates in the previous array order
  for (const prev of previous) {
    const nextItem = nextMap.get(prev.id);
    if (!nextItem) {
      changes.push({
        type: "remove",
        id: prev.id,
        item: prev,
        before: prev,
      });
    } else if (!deepEqual(prev, nextItem)) {
      changes.push({
        type: "update",
        id: prev.id,
        before: prev,
        after: nextItem,
        paths: changedPaths(prev, nextItem),
      });
    }
  }

  // Emit additions in the next array order
  for (const nextItem of next) {
    if (!prevMap.has(nextItem.id)) {
      changes.push({
        type: "add",
        id: nextItem.id,
        item: nextItem,
        after: nextItem,
      });
    }
  }

  return changes;
}

export function diffCollection<T extends IdentifiedItem>(
  previous: readonly T[],
  next: readonly T[],
): CollectionDiff<T> {
  const changes = diffById(previous, next);
  const targetOrder = next.map((item) => item.id);
  const orderChanged =
    previous.length !== next.length ||
    previous.some((item, i) => item.id !== next[i]?.id);

  return {
    changes,
    targetOrder,
    orderChanged,
  };
}

export function diffBoards(
  before: BoardDocument,
  after: BoardDocument,
): BoardDiff {
  if (!before || typeof before !== "object" || !Array.isArray(before.nodes) || !Array.isArray(before.edges)) {
    throw new BoardDiffError("Invalid before document: must have nodes and edges arrays");
  }
  if (!after || typeof after !== "object" || !Array.isArray(after.nodes) || !Array.isArray(after.edges)) {
    throw new BoardDiffError("Invalid after document: must have nodes and edges arrays");
  }

  const nodes = diffCollection<BoardNode>(before.nodes, after.nodes);
  const edges = diffCollection<BoardEdge>(before.edges, after.edges);

  const diff: BoardDiff = {
    nodes,
    edges,
    ...(before.title !== after.title ? { title: after.title } : {}),
    ...(before.schemaVersion !== after.schemaVersion ? { schemaVersion: after.schemaVersion } : {}),
  };

  return diff;
}

export function applyCollectionDiff<T extends IdentifiedItem>(
  previous: readonly T[],
  diff: CollectionDiff<T>,
): T[] {
  if (!Array.isArray(previous)) {
    throw new BoardDiffError("Invalid input: previous collection must be an array");
  }
  if (!diff || typeof diff !== "object") {
    throw new BoardDiffError("Invalid diff: collection diff must be an object");
  }
  if (!Array.isArray(diff.changes)) {
    throw new BoardDiffError("Invalid diff: changes must be an array");
  }
  if (!Array.isArray(diff.targetOrder)) {
    throw new BoardDiffError("Invalid diff: targetOrder must be an array");
  }

  const prevMap = new Map<string, T>();
  for (const item of previous) {
    if (!item || typeof item.id !== "string") {
      throw new BoardDiffError("Item in base collection has invalid id");
    }
    if (prevMap.has(item.id)) {
      throw new BoardDiffError(`Duplicate id found in base collection: "${item.id}"`);
    }
    prevMap.set(item.id, item);
  }

  const seenChangeIds = new Set<string>();
  for (const change of diff.changes) {
    if (!change || typeof change !== "object" || typeof change.id !== "string") {
      throw new BoardDiffError("Invalid change object: missing or invalid id");
    }
    if (seenChangeIds.has(change.id)) {
      throw new BoardDiffError(`Duplicate change detected for id "${change.id}"`);
    }
    seenChangeIds.add(change.id);

    if (change.type === "add") {
      if (prevMap.has(change.id)) {
        throw new BoardDiffError(`Cannot add existing id "${change.id}"`);
      }
      const item = change.item ?? change.after;
      if (!item || typeof item !== "object" || item.id !== change.id) {
        throw new BoardDiffError(`Invalid add change for id "${change.id}": missing or invalid item`);
      }
    } else if (change.type === "update") {
      if (!prevMap.has(change.id)) {
        throw new BoardDiffError(`Cannot update unknown id "${change.id}"`);
      }
      if (!change.after || typeof change.after !== "object" || change.after.id !== change.id) {
        throw new BoardDiffError(`Invalid update change for id "${change.id}": missing or invalid after item`);
      }
    } else if (change.type === "remove") {
      if (!prevMap.has(change.id)) {
        throw new BoardDiffError(`Cannot remove unknown id "${change.id}"`);
      }
    } else {
      throw new BoardDiffError(`Unknown change type "${(change as { type: string }).type}"`);
    }
  }

  const finalItemsMap = new Map<string, T>();
  for (const [id, item] of prevMap) {
    finalItemsMap.set(id, item);
  }

  for (const change of diff.changes) {
    if (change.type === "remove") {
      finalItemsMap.delete(change.id);
    } else if (change.type === "add") {
      finalItemsMap.set(change.id, change.item ?? change.after);
    } else if (change.type === "update") {
      finalItemsMap.set(change.id, change.after);
    }
  }

  const seenTargetIds = new Set<string>();
  for (const id of diff.targetOrder) {
    if (typeof id !== "string") {
      throw new BoardDiffError("Invalid id in target order: must be a string");
    }
    if (seenTargetIds.has(id)) {
      throw new BoardDiffError(`Duplicate id in target order: "${id}"`);
    }
    seenTargetIds.add(id);
  }

  if (diff.targetOrder.length !== finalItemsMap.size) {
    throw new BoardDiffError(
      `Target order length (${diff.targetOrder.length}) does not match final item count (${finalItemsMap.size})`
    );
  }

  for (const id of diff.targetOrder) {
    if (!finalItemsMap.has(id)) {
      throw new BoardDiffError(`Target order contains unexpected id "${id}"`);
    }
  }

  const result: T[] = [];
  for (const id of diff.targetOrder) {
    result.push(finalItemsMap.get(id)!);
  }
  return result;
}

export function applyBoardDiff(
  board: BoardDocument,
  diff: BoardDiff,
): BoardDocument {
  if (!board || typeof board !== "object") {
    throw new BoardDiffError("Invalid board: board must be an object");
  }
  if (!Array.isArray(board.nodes) || !Array.isArray(board.edges)) {
    throw new BoardDiffError("Invalid board: board must have nodes and edges arrays");
  }
  if (!diff || typeof diff !== "object") {
    throw new BoardDiffError("Invalid diff: diff must be an object");
  }
  if (!diff.nodes || typeof diff.nodes !== "object") {
    throw new BoardDiffError("Invalid diff: missing nodes diff");
  }
  if (!diff.edges || typeof diff.edges !== "object") {
    throw new BoardDiffError("Invalid diff: missing edges diff");
  }

  const nodes = applyCollectionDiff<BoardNode>(board.nodes, diff.nodes);
  const edges = applyCollectionDiff<BoardEdge>(board.edges, diff.edges);

  return {
    schemaVersion: diff.schemaVersion ?? board.schemaVersion,
    id: board.id,
    title: diff.title !== undefined ? diff.title : board.title,
    nodes,
    edges,
  };
}

export function hasBoardChanges(diff: BoardDiff): boolean {
  if (!diff || typeof diff !== "object") {
    return false;
  }
  if (diff.title !== undefined || diff.schemaVersion !== undefined) {
    return true;
  }
  const nodesHasChanges =
    Boolean(diff.nodes?.changes && diff.nodes.changes.length > 0) ||
    Boolean(diff.nodes?.orderChanged);
  const edgesHasChanges =
    Boolean(diff.edges?.changes && diff.edges.changes.length > 0) ||
    Boolean(diff.edges?.orderChanged);

  return nodesHasChanges || edgesHasChanges;
}

export function createBoardSnapshot(board: BoardDocument): BoardDocument {
  return JSON.parse(JSON.stringify(board)) as BoardDocument;
}
