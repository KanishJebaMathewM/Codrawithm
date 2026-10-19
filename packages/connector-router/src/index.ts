export type Side = "top" | "right" | "bottom" | "left";

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConnectorEndpoint {
  id: string;
  bounds: Rect;
  side: Side;
}

export interface Obstacle {
  id: string;
  bounds: Rect;
}

export interface RouteOptions {
  obstacles?: readonly Obstacle[];
  margin?: number;
}

export interface Route {
  points: Point[];
  length: number;
}

const DEFAULT_MARGIN = 20;
const MAX_GRID_POINTS = 250_000;
const EPSILON = 1e-9;

function normalizeRect(rect: Rect): Rect {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;
  return { x, y, width: Math.abs(rect.width), height: Math.abs(rect.height) };
}

function round(value: number): number {
  const result = Math.round(value * 1e6) / 1e6;
  return Object.is(result, -0) ? 0 : result;
}

function anchorPoint(endpoint: ConnectorEndpoint): Point {
  const bounds = normalizeRect(endpoint.bounds);
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  switch (endpoint.side) {
    case "top":
      return { x: centerX, y: bounds.y };
    case "right":
      return { x: bounds.x + bounds.width, y: centerY };
    case "bottom":
      return { x: centerX, y: bounds.y + bounds.height };
    case "left":
      return { x: bounds.x, y: centerY };
  }
}

function stubPoint(endpoint: ConnectorEndpoint, margin: number): Point {
  const anchor = anchorPoint(endpoint);
  switch (endpoint.side) {
    case "top":
      return { x: anchor.x, y: anchor.y - margin };
    case "right":
      return { x: anchor.x + margin, y: anchor.y };
    case "bottom":
      return { x: anchor.x, y: anchor.y + margin };
    case "left":
      return { x: anchor.x - margin, y: anchor.y };
  }
}

function inflate(rect: Rect, amount: number): Rect {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2,
  };
}

function containsPoint(rect: Rect, point: Point): boolean {
  return (
    point.x > rect.x + EPSILON &&
    point.x < rect.x + rect.width - EPSILON &&
    point.y > rect.y + EPSILON &&
    point.y < rect.y + rect.height - EPSILON
  );
}

function segmentBlocked(start: Point, end: Point, obstacles: readonly Rect[]): boolean {
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);
  for (const obstacle of obstacles) {
    if (Math.abs(start.y - end.y) <= EPSILON) {
      if (start.y > obstacle.y + EPSILON && start.y < obstacle.y + obstacle.height - EPSILON) {
        if (Math.max(minX, obstacle.x) < Math.min(maxX, obstacle.x + obstacle.width) - EPSILON) {
          return true;
        }
      }
    } else if (Math.abs(start.x - end.x) <= EPSILON) {
      if (start.x > obstacle.x + EPSILON && start.x < obstacle.x + obstacle.width - EPSILON) {
        if (Math.max(minY, obstacle.y) < Math.min(maxY, obstacle.y + obstacle.height) - EPSILON) {
          return true;
        }
      }
    }
  }
  return false;
}

function uniqueSorted(values: readonly number[]): number[] {
  const sorted = Array.from(new Set(values.map(round))).sort((a, b) => a - b);
  return sorted;
}

function compress(points: readonly Point[]): Point[] {
  const result: Point[] = [];
  for (const point of points) {
    const last = result[result.length - 1];
    if (last !== undefined && Math.abs(last.x - point.x) <= EPSILON && Math.abs(last.y - point.y) <= EPSILON) {
      continue;
    }
    while (result.length >= 2) {
      const second = result[result.length - 1]!;
      const first = result[result.length - 2]!;
      const collinearX = Math.abs(first.x - second.x) <= EPSILON && Math.abs(second.x - point.x) <= EPSILON;
      const collinearY = Math.abs(first.y - second.y) <= EPSILON && Math.abs(second.y - point.y) <= EPSILON;
      if (!collinearX && !collinearY) {
        break;
      }
      result.pop();
    }
    result.push(point);
  }
  return result;
}

function routeLength(points: readonly Point[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]!;
    const current = points[index]!;
    total += Math.abs(current.x - previous.x) + Math.abs(current.y - previous.y);
  }
  return round(total);
}

export function routeConnector(
  from: ConnectorEndpoint,
  to: ConnectorEndpoint,
  options: RouteOptions = {},
): Route | null {
  const margin = options.margin ?? DEFAULT_MARGIN;
  if (!Number.isFinite(margin) || margin < 0) {
    throw new RangeError("margin must be a non-negative number");
  }
  for (const endpoint of [from, to]) {
    const bounds = normalizeRect(endpoint.bounds);
    for (const value of [bounds.x, bounds.y, bounds.width, bounds.height]) {
      if (!Number.isFinite(value)) {
        throw new TypeError("endpoint bounds must be finite");
      }
    }
    if (bounds.width <= 0 || bounds.height <= 0) {
      throw new RangeError("endpoint bounds must have a positive size");
    }
  }
  if (from.id === to.id) {
    return null;
  }

  const fromAnchor = anchorPoint(from);
  const toAnchor = anchorPoint(to);
  const start = stubPoint(from, margin);
  const end = stubPoint(to, margin);

  const others = (options.obstacles ?? []).filter(
    (obstacle) => obstacle.id !== from.id && obstacle.id !== to.id,
  );
  const inflated: Rect[] = others.map((obstacle) => inflate(normalizeRect(obstacle.bounds), margin));
  const endpoints: Rect[] = [inflate(normalizeRect(from.bounds), margin), inflate(normalizeRect(to.bounds), margin)];
  const blockedRects = [...inflated, ...endpoints];

  if (containsPoint(endpoints[0]!, start) || containsPoint(endpoints[1]!, end)) {
    return null;
  }

  const xs = uniqueSorted([
    fromAnchor.x,
    start.x,
    toAnchor.x,
    end.x,
    ...inflated.flatMap((rect) => [rect.x, rect.x + rect.width]),
    ...endpoints.flatMap((rect) => [rect.x, rect.x + rect.width]),
  ]);
  const ys = uniqueSorted([
    fromAnchor.y,
    start.y,
    toAnchor.y,
    end.y,
    ...inflated.flatMap((rect) => [rect.y, rect.y + rect.height]),
    ...endpoints.flatMap((rect) => [rect.y, rect.y + rect.height]),
  ]);

  if (xs.length * ys.length > MAX_GRID_POINTS) {
    throw new RangeError("routing area is too large; reduce the number of obstacles");
  }

  const startX = xs.indexOf(round(start.x));
  const startY = ys.indexOf(round(start.y));
  const endX = xs.indexOf(round(end.x));
  const endY = ys.indexOf(round(end.y));
  if (startX < 0 || startY < 0 || endX < 0 || endY < 0) {
    return null;
  }

  const width = xs.length;
  const startIndex = startY * width + startX;
  const endIndex = endY * width + endX;
  const pointAt = (index: number): Point => {
    const xIndex = index % width;
    const yIndex = Math.floor(index / width);
    return { x: xs[xIndex]!, y: ys[yIndex]! };
  };

  const open = new Set<number>([startIndex]);
  const closed = new Set<number>();
  const gScore = new Map<number, number>([[startIndex, 0]]);
  const fScore = new Map<number, number>([[startIndex, Math.abs(start.x - end.x) + Math.abs(start.y - end.y)]]);
  const cameFrom = new Map<number, number>();

  while (open.size > 0) {
    let current: number | null = null;
    let currentScore = Number.POSITIVE_INFINITY;
    for (const candidate of open) {
      const score = fScore.get(candidate) ?? Number.POSITIVE_INFINITY;
      if (score < currentScore || (score === currentScore && (current === null || candidate < current))) {
        current = candidate;
        currentScore = score;
      }
    }
    if (current === null) {
      break;
    }
    if (current === endIndex) {
      const indices: number[] = [current];
      let cursor = current;
      while (cursor !== startIndex) {
        const previous = cameFrom.get(cursor);
        if (previous === undefined) {
          return null;
        }
        indices.push(previous);
        cursor = previous;
      }
      indices.reverse();
      const gridPoints = indices.map(pointAt);
      const points = compress([fromAnchor, ...gridPoints, toAnchor]);
      return { points, length: routeLength(points) };
    }
    open.delete(current);
    closed.add(current);
    const currentPoint = pointAt(current);
    const neighbors = [current + 1, current - 1, current + width, current - width];
    const indexes = [current % width, current % width, Math.floor(current / width), Math.floor(current / width)];
    const valid = [
      indexes[0]! + 1 < width,
      indexes[1]! - 1 >= 0,
      indexes[2]! + 1 < ys.length,
      indexes[3]! - 1 >= 0,
    ];
    for (let index = 0; index < neighbors.length; index += 1) {
      if (!valid[index]) {
        continue;
      }
      const neighbor = neighbors[index]!;
      if (closed.has(neighbor)) {
        continue;
      }
      const neighborPoint = pointAt(neighbor);
      if (containsPoint(blockedRects[0]!, neighborPoint) || containsPoint(blockedRects[1]!, neighborPoint)) {
        continue;
      }
      let blocked = false;
      for (const rect of inflated) {
        if (containsPoint(rect, neighborPoint)) {
          blocked = true;
          break;
        }
      }
      if (blocked || segmentBlocked(currentPoint, neighborPoint, blockedRects)) {
        continue;
      }
      const step = Math.abs(neighborPoint.x - currentPoint.x) + Math.abs(neighborPoint.y - currentPoint.y);
      const tentative = (gScore.get(current) ?? Number.POSITIVE_INFINITY) + step;
      if (tentative >= (gScore.get(neighbor) ?? Number.POSITIVE_INFINITY)) {
        continue;
      }
      cameFrom.set(neighbor, current);
      gScore.set(neighbor, tentative);
      fScore.set(
        neighbor,
        tentative + Math.abs(neighborPoint.x - end.x) + Math.abs(neighborPoint.y - end.y),
      );
      open.add(neighbor);
    }
  }

  return null;
}
