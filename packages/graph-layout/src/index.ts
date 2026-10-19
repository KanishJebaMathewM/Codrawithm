export interface LayoutNode {
  id: string;
  width: number;
  height: number;
}

export interface LayoutEdge {
  from: string;
  to: string;
}

export type LayoutDirection = "down" | "right";

export interface LayoutOptions {
  direction?: LayoutDirection;
  nodeGap?: number;
  layerGap?: number;
}

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  order: number;
}

export interface LayoutResult {
  nodes: PositionedNode[];
  layers: string[][];
  width: number;
  height: number;
}

export class LayoutCycleError extends Error {
  readonly cycle: readonly string[];

  constructor(cycle: readonly string[]) {
    super(`graph contains a cycle: ${cycle.join(" -> ")}`);
    this.name = "LayoutCycleError";
    this.cycle = cycle;
  }
}

const DEFAULT_NODE_GAP = 40;
const DEFAULT_LAYER_GAP = 80;

function validateOptions(options: LayoutOptions): { direction: LayoutDirection; nodeGap: number; layerGap: number } {
  const direction = options.direction ?? "down";
  if (direction !== "down" && direction !== "right") {
    throw new RangeError("direction must be down or right");
  }
  const nodeGap = options.nodeGap ?? DEFAULT_NODE_GAP;
  const layerGap = options.layerGap ?? DEFAULT_LAYER_GAP;
  if (!Number.isFinite(nodeGap) || nodeGap < 0) {
    throw new RangeError("nodeGap must be a non-negative number");
  }
  if (!Number.isFinite(layerGap) || layerGap < 0) {
    throw new RangeError("layerGap must be a non-negative number");
  }
  return { direction, nodeGap, layerGap };
}

function findCycle(ids: readonly string[], adjacency: ReadonlyMap<string, readonly string[]>): string[] {
  const state = new Map<string, "visiting" | "done">();
  const stack: string[] = [];

  const visit = (id: string): string[] | null => {
    const current = state.get(id);
    if (current === "visiting") {
      const index = stack.indexOf(id);
      return [...stack.slice(index), id];
    }
    if (current === "done") {
      return null;
    }
    state.set(id, "visiting");
    stack.push(id);
    for (const next of adjacency.get(id) ?? []) {
      const cycle = visit(next);
      if (cycle !== null) {
        return cycle;
      }
    }
    stack.pop();
    state.set(id, "done");
    return null;
  };

  for (const id of ids) {
    const cycle = visit(id);
    if (cycle !== null) {
      return cycle;
    }
  }
  return [];
}

function barycenterOrder(
  layers: string[][],
  incoming: ReadonlyMap<string, readonly string[]>,
  outgoing: ReadonlyMap<string, readonly string[]>,
): string[][] {
  const result = layers.map((layer) => [...layer]);
  const positions = new Map<string, number>();
  const updatePositions = (): void => {
    result.forEach((layer) => {
      layer.forEach((id, index) => positions.set(id, index));
    });
  };
  updatePositions();

  const sortLayer = (index: number, neighbors: ReadonlyMap<string, readonly string[]>, usePredecessors: boolean): void => {
    const layer = result[index];
    if (layer === undefined) {
      return;
    }
    const candidates = layer.map((id, order) => {
      const related = (neighbors.get(id) ?? []).filter((other) => positions.has(other));
      const source = usePredecessors ? related : related;
      const barycenter =
        source.length === 0
          ? order
          : source.reduce((total, other) => total + (positions.get(other) ?? 0), 0) / source.length;
      return { id, order, barycenter };
    });
    candidates.sort((a, b) => {
      if (a.barycenter !== b.barycenter) {
        return a.barycenter - b.barycenter;
      }
      return a.order - b.order;
    });
    result[index] = candidates.map((candidate) => candidate.id);
    updatePositions();
  };

  for (let pass = 0; pass < 4; pass += 1) {
    for (let index = 1; index < result.length; index += 1) {
      sortLayer(index, incoming, true);
    }
    for (let index = result.length - 2; index >= 0; index -= 1) {
      sortLayer(index, outgoing, false);
    }
  }

  return result;
}

export function layoutGraph(
  nodes: readonly LayoutNode[],
  edges: readonly LayoutEdge[],
  options: LayoutOptions = {},
): LayoutResult {
  const { direction, nodeGap, layerGap } = validateOptions(options);
  const ids: string[] = [];
  const byId = new Map<string, LayoutNode>();
  const inputIndex = new Map<string, number>();
  for (const node of nodes) {
    if (typeof node.id !== "string" || node.id.trim().length === 0) {
      throw new TypeError("node id must be a non-empty string");
    }
    if (byId.has(node.id)) {
      throw new Error(`duplicate node id: ${node.id}`);
    }
    if (
      !Number.isFinite(node.width) ||
      !Number.isFinite(node.height) ||
      node.width <= 0 ||
      node.height <= 0
    ) {
      throw new RangeError(`node ${node.id} must have a positive finite size`);
    }
    ids.push(node.id);
    byId.set(node.id, node);
    inputIndex.set(node.id, ids.length - 1);
  }

  const adjacency = new Map<string, string[]>(ids.map((id) => [id, []]));
  const incoming = new Map<string, string[]>(ids.map((id) => [id, []]));
  const outgoing = new Map<string, string[]>(ids.map((id) => [id, []]));
  const indegree = new Map<string, number>(ids.map((id) => [id, 0]));

  for (const edge of edges) {
    if (!byId.has(edge.from)) {
      throw new Error(`edge references unknown node: ${edge.from}`);
    }
    if (!byId.has(edge.to)) {
      throw new Error(`edge references unknown node: ${edge.to}`);
    }
    adjacency.get(edge.from)!.push(edge.to);
    incoming.get(edge.to)!.push(edge.from);
    outgoing.get(edge.from)!.push(edge.to);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  const queue = ids.filter((id) => (indegree.get(id) ?? 0) === 0);
  queue.sort((a, b) => (inputIndex.get(a) ?? 0) - (inputIndex.get(b) ?? 0));
  const layerOf = new Map<string, number>(ids.map((id) => [id, 0]));
  const processed: string[] = [];

  while (queue.length > 0) {
    queue.sort((a, b) => (inputIndex.get(a) ?? 0) - (inputIndex.get(b) ?? 0));
    const current = queue.shift()!;
    processed.push(current);
    for (const next of adjacency.get(current) ?? []) {
      layerOf.set(next, Math.max(layerOf.get(next) ?? 0, (layerOf.get(current) ?? 0) + 1));
      const remaining = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, remaining);
      if (remaining === 0) {
        queue.push(next);
      }
    }
  }

  if (processed.length !== ids.length) {
    const cycle = findCycle(ids, adjacency);
    throw new LayoutCycleError(cycle);
  }

  const layerCount = ids.length === 0 ? 0 : Math.max(...ids.map((id) => layerOf.get(id) ?? 0)) + 1;
  const layers: string[][] = Array.from({ length: layerCount }, () => []);
  for (const id of ids) {
    layers[layerOf.get(id) ?? 0]!.push(id);
  }

  const ordered = barycenterOrder(layers, incoming, outgoing);
  const layerIndex = new Map<string, number>();
  const orderIndex = new Map<string, number>();
  ordered.forEach((layer, index) => {
    layer.forEach((id, order) => {
      layerIndex.set(id, index);
      orderIndex.set(id, order);
    });
  });

  const positioned = new Map<string, PositionedNode>();
  let totalWidth = 0;
  let totalHeight = 0;

  if (direction === "down") {
    const layerSizes = ordered.map((layer) => {
      const nodeWidths = layer.reduce((total, id) => total + (byId.get(id)?.width ?? 0), 0);
      const width = nodeWidths + Math.max(0, layer.length - 1) * nodeGap;
      const height = layer.reduce((maximum, id) => Math.max(maximum, byId.get(id)?.height ?? 0), 0);
      return { width, height };
    });
    totalWidth = layerSizes.reduce((maximum, size) => Math.max(maximum, size.width), 0);
    totalHeight =
      layerSizes.reduce((total, size) => total + size.height, 0) +
      Math.max(0, layerSizes.length - 1) * layerGap;
    let y = 0;
    ordered.forEach((layer, layerPosition) => {
      const size = layerSizes[layerPosition]!;
      let x = (totalWidth - size.width) / 2;
      for (const id of layer) {
        const node = byId.get(id)!;
        positioned.set(id, {
          id,
          x,
          y: y + (size.height - node.height) / 2,
          width: node.width,
          height: node.height,
          layer: layerPosition,
          order: orderIndex.get(id) ?? 0,
        });
        x += node.width + nodeGap;
      }
      y += size.height + layerGap;
    });
  } else {
    const layerSizes = ordered.map((layer) => {
      const nodeHeights = layer.reduce((total, id) => total + (byId.get(id)?.height ?? 0), 0);
      const height = nodeHeights + Math.max(0, layer.length - 1) * nodeGap;
      const width = layer.reduce((maximum, id) => Math.max(maximum, byId.get(id)?.width ?? 0), 0);
      return { width, height };
    });
    totalHeight = layerSizes.reduce((maximum, size) => Math.max(maximum, size.height), 0);
    totalWidth =
      layerSizes.reduce((total, size) => total + size.width, 0) +
      Math.max(0, layerSizes.length - 1) * layerGap;
    let x = 0;
    ordered.forEach((layer, layerPosition) => {
      const size = layerSizes[layerPosition]!;
      let y = (totalHeight - size.height) / 2;
      for (const id of layer) {
        const node = byId.get(id)!;
        positioned.set(id, {
          id,
          x: x + (size.width - node.width) / 2,
          y,
          width: node.width,
          height: node.height,
          layer: layerPosition,
          order: orderIndex.get(id) ?? 0,
        });
        y += node.height + nodeGap;
      }
      x += size.width + layerGap;
    });
  }

  return {
    nodes: ids.map((id) => positioned.get(id)!),
    layers: ordered,
    width: totalWidth,
    height: totalHeight,
  };
}
