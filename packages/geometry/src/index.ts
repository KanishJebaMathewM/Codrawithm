export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export function point(x: number, y: number): Point {
  return { x, y };
}

export function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(vector: Point, factor: number): Point {
  return { x: vector.x * factor, y: vector.y * factor };
}

export function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

export function cross(a: Point, b: Point): number {
  return a.x * b.y - a.y * b.x;
}

export function magnitude(vector: Point): number {
  return Math.hypot(vector.x, vector.y);
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(vector: Point): Point {
  const length = magnitude(vector);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: vector.x / length, y: vector.y / length };
}

export function angleBetween(a: Point, b: Point): number {
  const denominator = magnitude(a) * magnitude(b);
  if (denominator === 0) {
    return 0;
  }
  const cosine = Math.max(-1, Math.min(1, dot(a, b) / denominator));
  return Math.acos(cosine);
}

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function normalizeAngle(radians: number): number {
  const turn = Math.PI * 2;
  let value = radians % turn;
  if (value <= -Math.PI) {
    value += turn;
  } else if (value > Math.PI) {
    value -= turn;
  }
  return value;
}

export function rotatePoint(target: Point, origin: Point, radians: number): Point {
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  return {
    x: origin.x + dx * cosine - dy * sine,
    y: origin.y + dx * sine + dy * cosine,
  };
}

export function normalizeRect(rect: Rect): Rect {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;
  return {
    x,
    y,
    width: Math.abs(rect.width),
    height: Math.abs(rect.height),
  };
}

export function rectFromPoints(a: Point, b: Point): Rect {
  return normalizeRect({
    x: a.x,
    y: a.y,
    width: b.x - a.x,
    height: b.y - a.y,
  });
}

export function rectCenter(rect: Rect): Point {
  const normalized = normalizeRect(rect);
  return {
    x: normalized.x + normalized.width / 2,
    y: normalized.y + normalized.height / 2,
  };
}

export function rectContainsPoint(rect: Rect, target: Point): boolean {
  const normalized = normalizeRect(rect);
  return (
    target.x >= normalized.x &&
    target.x <= normalized.x + normalized.width &&
    target.y >= normalized.y &&
    target.y <= normalized.y + normalized.height
  );
}

export function rectContainsRect(outer: Rect, inner: Rect): boolean {
  const a = normalizeRect(outer);
  const b = normalizeRect(inner);
  return (
    b.x >= a.x &&
    b.y >= a.y &&
    b.x + b.width <= a.x + a.width &&
    b.y + b.height <= a.y + a.height
  );
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  const first = normalizeRect(a);
  const second = normalizeRect(b);
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

export function rectUnion(a: Rect, b: Rect): Rect {
  const first = normalizeRect(a);
  const second = normalizeRect(b);
  const x = Math.min(first.x, second.x);
  const y = Math.min(first.y, second.y);
  return {
    x,
    y,
    width: Math.max(first.x + first.width, second.x + second.width) - x,
    height: Math.max(first.y + first.height, second.y + second.height) - y,
  };
}

export function inflateRect(rect: Rect, amount: number): Rect {
  const normalized = normalizeRect(rect);
  return {
    x: normalized.x - amount,
    y: normalized.y - amount,
    width: Math.max(0, normalized.width + amount * 2),
    height: Math.max(0, normalized.height + amount * 2),
  };
}

export function translateRect(rect: Rect, offset: Point): Rect {
  return { ...rect, x: rect.x + offset.x, y: rect.y + offset.y };
}

export function rectCorners(rect: Rect, radians = 0): [Point, Point, Point, Point] {
  const normalized = normalizeRect(rect);
  const center = rectCenter(normalized);
  const corners: Point[] = [
    { x: normalized.x, y: normalized.y },
    { x: normalized.x + normalized.width, y: normalized.y },
    { x: normalized.x + normalized.width, y: normalized.y + normalized.height },
    { x: normalized.x, y: normalized.y + normalized.height },
  ];
  const [topLeft, topRight, bottomRight, bottomLeft] = corners;
  if (radians === 0) {
    return [topLeft!, topRight!, bottomRight!, bottomLeft!];
  }
  return [
    rotatePoint(topLeft!, center, radians),
    rotatePoint(topRight!, center, radians),
    rotatePoint(bottomRight!, center, radians),
    rotatePoint(bottomLeft!, center, radians),
  ];
}

export function boundsOfPoints(points: readonly Point[]): Rect {
  const first = points[0];
  if (first === undefined) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  let minX = first.x;
  let minY = first.y;
  let maxX = first.x;
  let maxY = first.y;
  for (const current of points) {
    minX = Math.min(minX, current.x);
    minY = Math.min(minY, current.y);
    maxX = Math.max(maxX, current.x);
    maxY = Math.max(maxY, current.y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function pointToSegmentDistance(target: Point, start: Point, end: Point): number {
  return distance(target, closestPointOnSegment(target, start, end));
}

export function closestPointOnSegment(target: Point, start: Point, end: Point): Point {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return { ...start };
  }
  const projection = ((target.x - start.x) * dx + (target.y - start.y) * dy) / lengthSquared;
  const t = Math.max(0, Math.min(1, projection));
  return { x: start.x + t * dx, y: start.y + t * dy };
}

export function segmentsIntersect(a1: Point, a2: Point, b1: Point, b2: Point): Point | null {
  const r = subtract(a2, a1);
  const s = subtract(b2, b1);
  const denominator = cross(r, s);
  if (denominator === 0) {
    return null;
  }
  const delta = subtract(b1, a1);
  const t = cross(delta, s) / denominator;
  const u = cross(delta, r) / denominator;
  if (t < 0 || t > 1 || u < 0 || u > 1) {
    return null;
  }
  return { x: a1.x + t * r.x, y: a1.y + t * r.y };
}

export function clipSegmentToRect(start: Point, end: Point, rect: Rect): [Point, Point] | null {
  const bounds = normalizeRect(rect);
  if (bounds.width <= 0 || bounds.height <= 0) {
    return null;
  }
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const p = [-dx, dx, -dy, dy];
  const q = [
    start.x - bounds.x,
    bounds.x + bounds.width - start.x,
    start.y - bounds.y,
    bounds.y + bounds.height - start.y,
  ];
  let near = 0;
  let far = 1;

  for (let index = 0; index < 4; index += 1) {
    const direction = p[index]!;
    const distanceToEdge = q[index]!;
    if (direction === 0) {
      if (distanceToEdge < 0) {
        return null;
      }
      continue;
    }
    const ratio = distanceToEdge / direction;
    if (direction < 0) {
      near = Math.max(near, ratio);
    } else {
      far = Math.min(far, ratio);
    }
    if (near > far) {
      return null;
    }
  }

  return [
    { x: start.x + near * dx, y: start.y + near * dy },
    { x: start.x + far * dx, y: start.y + far * dy },
  ];
}

export function segmentIntersectsRect(start: Point, end: Point, rect: Rect): boolean {
  return clipSegmentToRect(start, end, rect) !== null;
}

export function polygonArea(points: readonly Point[]): number {
  if (points.length < 3) {
    return 0;
  }
  let total = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]!;
    const next = points[(index + 1) % points.length]!;
    total += current.x * next.y - next.x * current.y;
  }
  return Math.abs(total) / 2;
}

export function polylineLength(points: readonly Point[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += distance(points[index - 1]!, points[index]!);
  }
  return total;
}
