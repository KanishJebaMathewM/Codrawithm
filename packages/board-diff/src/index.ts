export interface Identified {
  id: string;
}

export type ItemChange<T extends Identified> =
  | { type: "added"; id: string; item: T }
  | { type: "removed"; id: string; item: T }
  | { type: "updated"; id: string; before: T; after: T; fields: readonly string[] };

export interface BoardSnapshot<TNode extends Identified, TEdge extends Identified> {
  nodes: readonly TNode[];
  edges: readonly TEdge[];
}

export interface BoardDiff<TNode extends Identified, TEdge extends Identified> {
  nodes: readonly ItemChange<TNode>[];
  edges: readonly ItemChange<TEdge>[];
  nodeOrder: readonly string[];
  edgeOrder: readonly string[];
  nodeOrderChanged: boolean;
  edgeOrderChanged: boolean;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let index = 0; index < a.length; index += 1) {
      if (!deepEqual(a[index], b[index])) {
        return false;
      }
    }
    return true;
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

export function changedPaths(before: unknown, after: unknown, prefix = ""): string[] {
  if (deepEqual(before, after)) {
    return [];
  }
  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).sort();
    const result: string[] = [];
    for (const key of keys) {
      const path = prefix.length === 0 ? key : `${prefix}.${key}`;
      result.push(...changedPaths(before[key], after[key], path));
    }
    return result;
  }
  return [prefix];
}

function validateItems<T extends Identified>(items: readonly T[], label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (typeof item.id !== "string" || item.id.trim().length === 0) {
      throw new TypeError(`${label} id must be a non-empty string`);
    }
    if (seen.has(item.id)) {
      throw new Error(`duplicate ${label} id: ${item.id}`);
    }
    seen.add(item.id);
  }
}

export function diffById<T extends Identified>(
  before: readonly T[],
  after: readonly T[],
): readonly ItemChange<T>[] {
  validateItems(before, "item");
  validateItems(after, "item");
  const beforeById = new Map(before.map((item) => [item.id, item]));
  const afterById = new Map(after.map((item) => [item.id, item]));
  const changes: ItemChange<T>[] = [];

  for (const item of before) {
    const next = afterById.get(item.id);
    if (next === undefined) {
      changes.push({ type: "removed", id: item.id, item });
      continue;
    }
    if (!deepEqual(item, next)) {
      changes.push({
        type: "updated",
        id: item.id,
        before: item,
        after: next,
        fields: changedPaths(item, next),
      });
    }
  }
  for (const item of after) {
    if (!beforeById.has(item.id)) {
      changes.push({ type: "added", id: item.id, item });
    }
  }
  return changes;
}

function orderChanged(before: readonly Identified[], after: readonly Identified[]): boolean {
  if (before.length !== after.length) {
    return true;
  }
  for (let index = 0; index < before.length; index += 1) {
    if (before[index]?.id !== after[index]?.id) {
      return true;
    }
  }
  return false;
}

export function diffBoards<TNode extends Identified, TEdge extends Identified>(
  before: BoardSnapshot<TNode, TEdge>,
  after: BoardSnapshot<TNode, TEdge>,
): BoardDiff<TNode, TEdge> {
  validateItems(before.nodes, "node");
  validateItems(after.nodes, "node");
  validateItems(before.edges, "edge");
  validateItems(after.edges, "edge");
  return {
    nodes: diffById(before.nodes, after.nodes),
    edges: diffById(before.edges, after.edges),
    nodeOrder: after.nodes.map((item) => item.id),
    edgeOrder: after.edges.map((item) => item.id),
    nodeOrderChanged: orderChanged(before.nodes, after.nodes),
    edgeOrderChanged: orderChanged(before.edges, after.edges),
  };
}

export function hasBoardChanges<TNode extends Identified, TEdge extends Identified>(
  diff: BoardDiff<TNode, TEdge>,
): boolean {
  return (
    diff.nodes.length > 0 ||
    diff.edges.length > 0 ||
    diff.nodeOrderChanged ||
    diff.edgeOrderChanged
  );
}

function applyItems<T extends Identified>(
  before: readonly T[],
  changes: readonly ItemChange<T>[],
  targetOrder: readonly string[],
  label: string,
): T[] {
  const items = new Map(before.map((item) => [item.id, item]));
  const seenChanges = new Set<string>();
  for (const change of changes) {
    if (seenChanges.has(change.id)) {
      throw new Error(`duplicate ${label} change: ${change.id}`);
    }
    seenChanges.add(change.id);
    switch (change.type) {
      case "added":
        if (items.has(change.id)) {
          throw new Error(`cannot add existing ${label}: ${change.id}`);
        }
        items.set(change.id, change.item);
        break;
      case "removed":
        if (!items.has(change.id)) {
          throw new Error(`cannot remove unknown ${label}: ${change.id}`);
        }
        items.delete(change.id);
        break;
      case "updated":
        if (!items.has(change.id)) {
          throw new Error(`cannot update unknown ${label}: ${change.id}`);
        }
        items.set(change.id, change.after);
        break;
    }
  }

  const ordered: T[] = [];
  const seenOrder = new Set<string>();
  for (const id of targetOrder) {
    if (seenOrder.has(id)) {
      throw new Error(`duplicate ${label} in target order: ${id}`);
    }
    const item = items.get(id);
    if (item === undefined) {
      throw new Error(`target order references missing ${label}: ${id}`);
    }
    seenOrder.add(id);
    ordered.push(item);
  }
  if (ordered.length !== items.size) {
    throw new Error(`target order is missing ${label} ids`);
  }
  return ordered;
}

export function applyBoardDiff<TNode extends Identified, TEdge extends Identified>(
  before: BoardSnapshot<TNode, TEdge>,
  diff: BoardDiff<TNode, TEdge>,
): BoardSnapshot<TNode, TEdge> {
  return {
    nodes: applyItems(before.nodes, diff.nodes, diff.nodeOrder, "node"),
    edges: applyItems(before.edges, diff.edges, diff.edgeOrder, "edge"),
  };
}
