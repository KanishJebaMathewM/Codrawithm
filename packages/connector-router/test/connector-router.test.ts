import { describe, expect, it } from "vitest";
import {
  routeConnector,
  type ConnectorEndpoint,
  type Obstacle,
  type Point,
  type Route,
} from "../src/index.js";

function endpoint(id: string, x: number, y: number, width: number, height: number, side: ConnectorEndpoint["side"]): ConnectorEndpoint {
  return { id, bounds: { x, y, width, height }, side };
}

function isOrthogonal(points: readonly Point[]): boolean {
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]!;
    const current = points[index]!;
    if (previous.x !== current.x && previous.y !== current.y) {
      return false;
    }
  }
  return true;
}

function segmentCrossesRect(a: Point, b: Point, rect: Obstacle["bounds"]): boolean {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  if (a.y === b.y) {
    return a.y > rect.y && a.y < rect.y + rect.height && Math.max(minX, rect.x) < Math.min(maxX, rect.x + rect.width);
  }
  return a.x > rect.x && a.x < rect.x + rect.width && Math.max(minY, rect.y) < Math.min(maxY, rect.y + rect.height);
}

function routeCrossesObstacle(route: Route, obstacle: Obstacle): boolean {
  for (let index = 1; index < route.points.length; index += 1) {
    if (segmentCrossesRect(route.points[index - 1]!, route.points[index]!, obstacle.bounds)) {
      return true;
    }
  }
  return false;
}

describe("basic routes", () => {
  it("connects facing sides with a straight horizontal line", () => {
    const route = routeConnector(endpoint("a", 0, 0, 100, 60, "right"), endpoint("b", 300, 0, 100, 60, "left"));
    expect(route).not.toBeNull();
    expect(route!.points).toEqual([
      { x: 100, y: 30 },
      { x: 300, y: 30 },
    ]);
    expect(route!.length).toBe(200);
    expect(isOrthogonal(route!.points)).toBe(true);
  });

  it("connects facing sides with a straight vertical line", () => {
    const route = routeConnector(endpoint("a", 0, 0, 100, 60, "bottom"), endpoint("b", 0, 300, 100, 60, "top"));
    expect(route!.points).toEqual([
      { x: 50, y: 60 },
      { x: 50, y: 300 },
    ]);
    expect(route!.length).toBe(240);
  });

  it("uses the requested side anchors", () => {
    const route = routeConnector(
      endpoint("a", 0, 0, 100, 60, "top"),
      endpoint("b", 300, 0, 100, 60, "bottom"),
    );
    expect(route!.points[0]).toEqual({ x: 50, y: 0 });
    expect(route!.points[route!.points.length - 1]).toEqual({ x: 350, y: 60 });
    expect(isOrthogonal(route!.points)).toBe(true);
  });

  it("removes collinear intermediate points", () => {
    const route = routeConnector(endpoint("a", 0, 0, 100, 60, "right"), endpoint("b", 300, 200, 100, 60, "left"));
    expect(route!.points).toHaveLength(4);
  });

  it("is deterministic", () => {
    const input = {
      obstacles: [{ id: "wall", bounds: { x: 200, y: -50, width: 40, height: 160 } }],
    };
    const first = routeConnector(
      endpoint("a", 0, 0, 100, 60, "right"),
      endpoint("b", 400, 0, 100, 60, "left"),
      input,
    );
    const second = routeConnector(
      endpoint("a", 0, 0, 100, 60, "right"),
      endpoint("b", 400, 0, 100, 60, "left"),
      input,
    );
    expect(first).toEqual(second);
  });
});

describe("obstacle avoidance", () => {
  const wall: Obstacle = { id: "wall", bounds: { x: 180, y: -40, width: 80, height: 140 } };

  it("detours around a blocking rectangle", () => {
    const route = routeConnector(
      endpoint("a", 0, 0, 100, 60, "right"),
      endpoint("b", 400, 0, 100, 60, "left"),
      { obstacles: [wall], margin: 20 },
    );
    expect(route).not.toBeNull();
    expect(route!.points.length).toBeGreaterThan(4);
    expect(route!.length).toBeGreaterThan(300);
    expect(isOrthogonal(route!.points)).toBe(true);
    expect(routeCrossesObstacle(route!, wall)).toBe(false);
  });

  it("keeps the requested clearance from the obstacle", () => {
    const route = routeConnector(
      endpoint("a", 0, 0, 100, 60, "right"),
      endpoint("b", 400, 0, 100, 60, "left"),
      { obstacles: [wall], margin: 30 },
    );
    const horizontalSegments = route!.points.slice(1).map((point, index) => ({
      from: route!.points[index]!,
      to: point,
    }));
    for (const segment of horizontalSegments) {
      if (segment.from.y === segment.to.y) {
        expect(segment.from.y <= wall.bounds.y - 30 + 1e-6 || segment.from.y >= wall.bounds.y + wall.bounds.height + 30 - 1e-6 || segment.from.x >= wall.bounds.x + wall.bounds.width + 30 - 1e-6 || segment.to.x <= wall.bounds.x - 30 + 1e-6).toBe(true);
      }
    }
    expect(routeCrossesObstacle(route!, wall)).toBe(false);
  });

  it("navigates between two obstacles", () => {
    const upper: Obstacle = { id: "upper", bounds: { x: 180, y: -200, width: 80, height: 180 } };
    const lower: Obstacle = { id: "lower", bounds: { x: 180, y: 60, width: 80, height: 180 } };
    const route = routeConnector(
      endpoint("a", 0, 0, 100, 60, "right"),
      endpoint("b", 400, 0, 100, 60, "left"),
      { obstacles: [upper, lower], margin: 10 },
    );
    expect(route).not.toBeNull();
    expect(routeCrossesObstacle(route!, upper)).toBe(false);
    expect(routeCrossesObstacle(route!, lower)).toBe(false);
    expect(isOrthogonal(route!.points)).toBe(true);
  });

  it("ignores obstacles that belong to the endpoints", () => {
    const route = routeConnector(
      endpoint("a", 0, 0, 100, 60, "right"),
      endpoint("b", 300, 0, 100, 60, "left"),
      {
        obstacles: [
          { id: "a", bounds: { x: 0, y: 0, width: 100, height: 60 } },
          { id: "b", bounds: { x: 300, y: 0, width: 100, height: 60 } },
        ],
      },
    );
    expect(route!.points).toHaveLength(2);
  });

  it("does not cut through the source or target", () => {
    const route = routeConnector(
      endpoint("a", 0, 0, 100, 60, "top"),
      endpoint("b", 0, 300, 100, 60, "left"),
      { margin: 20 },
    );
    expect(route).not.toBeNull();
    expect(routeCrossesObstacle(route!, { id: "a", bounds: { x: 0, y: 0, width: 100, height: 60 } })).toBe(false);
    expect(routeCrossesObstacle(route!, { id: "b", bounds: { x: 0, y: 300, width: 100, height: 60 } })).toBe(false);
  });

  it("handles negative obstacle extents", () => {
    const route = routeConnector(
      endpoint("a", 0, 0, 100, 60, "right"),
      endpoint("b", 400, 0, 100, 60, "left"),
      { obstacles: [{ id: "wall", bounds: { x: 260, y: 100, width: -80, height: -140 } }], margin: 10 },
    );
    expect(route).not.toBeNull();
    expect(routeCrossesObstacle(route!, { id: "wall", bounds: { x: 180, y: -40, width: 80, height: 140 } })).toBe(false);
  });
});

describe("validation", () => {
  it("returns null for the same node", () => {
    expect(routeConnector(endpoint("a", 0, 0, 100, 60, "right"), endpoint("a", 0, 0, 100, 60, "left"))).toBeNull();
  });

  it("rejects negative margins", () => {
    expect(() =>
      routeConnector(endpoint("a", 0, 0, 100, 60, "right"), endpoint("b", 300, 0, 100, 60, "left"), { margin: -1 }),
    ).toThrow(RangeError);
  });

  it("rejects non-finite and zero-sized endpoints", () => {
    expect(() =>
      routeConnector(
        endpoint("a", 0, 0, Number.NaN, 60, "right"),
        endpoint("b", 300, 0, 100, 60, "left"),
      ),
    ).toThrow(TypeError);
    expect(() =>
      routeConnector(endpoint("a", 0, 0, 0, 60, "right"), endpoint("b", 300, 0, 100, 60, "left")),
    ).toThrow(RangeError);
  });

  it("returns null when the target stub is inside another obstacle", () => {
    const route = routeConnector(
      endpoint("a", 0, 0, 100, 60, "right"),
      endpoint("b", 400, 0, 100, 60, "left"),
      { obstacles: [{ id: "block", bounds: { x: 360, y: -50, width: 180, height: 160 } }], margin: 20 },
    );
    expect(route).toBeNull();
  });
});
