import { describe, expect, it } from "vitest";
import {
  add,
  angleBetween,
  boundsOfPoints,
  clipSegmentToRect,
  closestPointOnSegment,
  cross,
  distance,
  dot,
  inflateRect,
  magnitude,
  normalize,
  normalizeAngle,
  normalizeRect,
  point,
  pointToSegmentDistance,
  polygonArea,
  polylineLength,
  rectCenter,
  rectContainsPoint,
  rectContainsRect,
  rectCorners,
  rectFromPoints,
  rectUnion,
  rectsIntersect,
  rotatePoint,
  scale,
  segmentIntersectsRect,
  segmentsIntersect,
  subtract,
  toDegrees,
  toRadians,
  translateRect,
  type Rect,
} from "../src/index.js";

function expectPoint(actual: { x: number; y: number }, expected: { x: number; y: number }, precision = 10): void {
  expect(actual.x).toBeCloseTo(expected.x, precision);
  expect(actual.y).toBeCloseTo(expected.y, precision);
}

describe("vectors", () => {
  it("adds, subtracts and scales without mutating inputs", () => {
    const a = point(3, 4);
    const b = point(-1, 2);
    expect(add(a, b)).toEqual({ x: 2, y: 6 });
    expect(subtract(a, b)).toEqual({ x: 4, y: 2 });
    expect(scale(a, 2)).toEqual({ x: 6, y: 8 });
    expect(a).toEqual({ x: 3, y: 4 });
  });

  it("computes dot and cross products", () => {
    expect(dot(point(3, 4), point(2, -1))).toBe(2);
    expect(cross(point(1, 0), point(0, 1))).toBe(1);
    expect(cross(point(0, 1), point(1, 0))).toBe(-1);
  });

  it("computes length and distance", () => {
    expect(magnitude(point(3, 4))).toBe(5);
    expect(distance(point(1, 1), point(4, 5))).toBe(5);
  });

  it("normalises a vector and handles the zero vector", () => {
    expectPoint(normalize(point(0, 9)), { x: 0, y: 1 });
    expect(normalize(point(0, 0))).toEqual({ x: 0, y: 0 });
  });

  it("measures the angle between vectors in radians", () => {
    expect(angleBetween(point(1, 0), point(0, 1))).toBeCloseTo(Math.PI / 2, 10);
    expect(angleBetween(point(0, 0), point(1, 1))).toBe(0);
  });

  it("converts angles and normalises them into a half turn", () => {
    expect(toRadians(180)).toBeCloseTo(Math.PI, 10);
    expect(toDegrees(Math.PI / 2)).toBeCloseTo(90, 10);
    expect(normalizeAngle(Math.PI * 3)).toBeCloseTo(Math.PI, 10);
    expect(normalizeAngle(-Math.PI * 1.5)).toBeCloseTo(Math.PI / 2, 10);
    expect(normalizeAngle(0)).toBe(0);
  });

  it("rotates around an origin", () => {
    expectPoint(rotatePoint(point(2, 1), point(1, 1), Math.PI / 2), { x: 1, y: 2 });
    expectPoint(rotatePoint(point(2, 1), point(1, 1), 0), { x: 2, y: 1 });
  });
});

describe("rectangles", () => {
  it("normalises negative extents", () => {
    expect(normalizeRect({ x: 10, y: 20, width: -5, height: -8 })).toEqual({
      x: 5,
      y: 12,
      width: 5,
      height: 8,
    });
  });

  it("builds the same rectangle from either drag direction", () => {
    expect(rectFromPoints(point(10, 20), point(30, 50))).toEqual({
      x: 10,
      y: 20,
      width: 20,
      height: 30,
    });
    expect(rectFromPoints(point(30, 50), point(10, 20))).toEqual({
      x: 10,
      y: 20,
      width: 20,
      height: 30,
    });
  });

  it("finds the centre of a rectangle", () => {
    expect(rectCenter({ x: 10, y: 20, width: 40, height: 10 })).toEqual({ x: 30, y: 25 });
  });

  it("tests point containment including the border", () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };
    expect(rectContainsPoint(rect, point(0, 0))).toBe(true);
    expect(rectContainsPoint(rect, point(10, 10))).toBe(true);
    expect(rectContainsPoint(rect, point(10.1, 5))).toBe(false);
  });

  it("tests rectangle containment", () => {
    const outer = { x: 0, y: 0, width: 100, height: 100 };
    expect(rectContainsRect(outer, { x: 10, y: 10, width: 20, height: 20 })).toBe(true);
    expect(rectContainsRect(outer, { x: 90, y: 90, width: 20, height: 20 })).toBe(false);
  });

  it("treats touching edges as non-overlapping", () => {
    const left = { x: 0, y: 0, width: 10, height: 10 };
    const right = { x: 10, y: 0, width: 10, height: 10 };
    expect(rectsIntersect(left, right)).toBe(false);
    expect(rectsIntersect(left, { x: 9.9, y: 0, width: 10, height: 10 })).toBe(true);
  });

  it("unions rectangles", () => {
    expect(rectUnion({ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 5, width: 5, height: 20 })).toEqual({
      x: 0,
      y: 0,
      width: 25,
      height: 25,
    });
  });

  it("inflates without producing negative sizes and translates", () => {
    expect(inflateRect({ x: 10, y: 10, width: 10, height: 10 }, 5)).toEqual({
      x: 5,
      y: 5,
      width: 20,
      height: 20,
    });
    expect(inflateRect({ x: 0, y: 0, width: 2, height: 2 }, -3)).toEqual({
      x: 3,
      y: 3,
      width: 0,
      height: 0,
    });
    expect(translateRect({ x: 1, y: 2, width: 3, height: 4 }, point(5, -1))).toEqual({
      x: 6,
      y: 1,
      width: 3,
      height: 4,
    });
  });

  it("returns unrotated corners in screen order", () => {
    expect(rectCorners({ x: 0, y: 0, width: 10, height: 6 })).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 6 },
      { x: 0, y: 6 },
    ]);
  });

  it("rotates corners around the centre", () => {
    const corners = rectCorners({ x: 0, y: 0, width: 2, height: 2 }, Math.PI / 2);
    expectPoint(corners[0], { x: 2, y: 0 });
    expectPoint(corners[1], { x: 2, y: 2 });
    expectPoint(corners[2], { x: 0, y: 2 });
    expectPoint(corners[3], { x: 0, y: 0 });
  });

  it("computes bounds for points and handles an empty list", () => {
    expect(boundsOfPoints([point(2, 5), point(-1, 3), point(4, -2)])).toEqual({
      x: -1,
      y: -2,
      width: 5,
      height: 7,
    });
    expect(boundsOfPoints([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});

describe("segments", () => {
  const rect: Rect = { x: 0, y: 0, width: 100, height: 50 };

  it("clips a segment that crosses a rectangle", () => {
    const clipped = clipSegmentToRect(point(-50, 25), point(150, 25), rect);
    expect(clipped).not.toBeNull();
    expectPoint(clipped![0], { x: 0, y: 25 });
    expectPoint(clipped![1], { x: 100, y: 25 });
  });

  it("keeps the section of a segment already inside", () => {
    const clipped = clipSegmentToRect(point(10, 10), point(40, 20), rect);
    expectPoint(clipped![0], { x: 10, y: 10 });
    expectPoint(clipped![1], { x: 40, y: 20 });
  });

  it("returns null when a segment misses the rectangle", () => {
    expect(clipSegmentToRect(point(-50, -50), point(-10, -10), rect)).toBeNull();
    expect(segmentIntersectsRect(point(0, 60), point(100, 60), rect)).toBe(false);
  });

  it("supports negative rectangle extents", () => {
    const clipped = clipSegmentToRect(point(-10, -10), point(10, 10), { x: 0, y: 0, width: -5, height: -5 });
    expectPoint(clipped![0], { x: -5, y: -5 });
    expectPoint(clipped![1], { x: 0, y: 0 });
  });

  it("rejects degenerate rectangles", () => {
    expect(clipSegmentToRect(point(0, 0), point(10, 10), { x: 0, y: 0, width: 0, height: 10 })).toBeNull();
  });

  it("finds the closest point on a segment and the distance to it", () => {
    expect(closestPointOnSegment(point(5, 5), point(0, 0), point(10, 0))).toEqual({ x: 5, y: 0 });
    expect(closestPointOnSegment(point(-5, 0), point(0, 0), point(10, 0))).toEqual({ x: 0, y: 0 });
    expect(closestPointOnSegment(point(4, 7), point(4, 2), point(4, 2))).toEqual({ x: 4, y: 2 });
    expect(pointToSegmentDistance(point(0, 3), point(-4, 0), point(4, 0))).toBe(3);
  });

  it("intersects crossing segments at the expected point", () => {
    expect(segmentsIntersect(point(0, 0), point(10, 10), point(0, 10), point(10, 0))).toEqual({ x: 5, y: 5 });
    expect(segmentsIntersect(point(0, 0), point(1, 1), point(2, 2), point(3, 3))).toBeNull();
    expect(segmentsIntersect(point(0, 0), point(4, 0), point(5, -1), point(5, 1))).toBeNull();
  });
});

describe("polygons", () => {
  it("computes area for convex and concave polygons", () => {
    expect(polygonArea([point(0, 0), point(10, 0), point(10, 10), point(0, 10)])).toBe(100);
    expect(polygonArea([point(0, 0), point(4, 0), point(4, 4), point(2, 2), point(0, 4)])).toBe(12);
    expect(polygonArea([point(0, 0), point(1, 0)])).toBe(0);
  });

  it("sums polyline length", () => {
    expect(polylineLength([point(0, 0), point(3, 4), point(3, 10)])).toBe(11);
    expect(polylineLength([point(1, 1)])).toBe(0);
  });
});
