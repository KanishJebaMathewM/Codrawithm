import { describe, expect, it } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_EDGE_STYLE,
  DEFAULT_NODE_STYLE,
  createEmptyBoard,
  migrateToCurrent,
  validateBoard,
  type BoardDocument,
} from "../src/index.js";

function validBoard(): BoardDocument {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: "board-1",
    title: "Checkout flow",
    nodes: [
      {
        id: "n1",
        kind: "rectangle",
        x: 10,
        y: 20,
        width: 160,
        height: 80,
        rotation: 0,
        label: "Cart",
        style: { ...DEFAULT_NODE_STYLE },
      },
      {
        id: "n2",
        kind: "diamond",
        x: 240,
        y: 20,
        width: 120,
        height: 80,
        rotation: 15,
        label: "Paid?",
        style: { ...DEFAULT_NODE_STYLE, fill: "#eef6ff" },
      },
    ],
    edges: [
      {
        id: "e1",
        from: "n1",
        to: "n2",
        label: "checkout",
        style: { ...DEFAULT_EDGE_STYLE },
      },
    ],
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("createEmptyBoard", () => {
  it("creates a current version document with empty collections", () => {
    const board = createEmptyBoard("b1", "Untitled");
    expect(board.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(board.nodes).toEqual([]);
    expect(board.edges).toEqual([]);
    expect(board.title).toBe("Untitled");
  });

  it("validates a freshly created board", () => {
    expect(validateBoard(createEmptyBoard("b1")).ok).toBe(true);
  });
});

describe("validateBoard", () => {
  it("accepts a complete board without changing it", () => {
    const board = validBoard();
    const snapshot = clone(board);
    const result = validateBoard(board);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.board).toEqual(snapshot);
    }
    expect(board).toEqual(snapshot);
  });

  it("rejects non-object payloads", () => {
    const result = validateBoard("not a board");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("invalid_type");
    }
  });

  it("reports every missing top-level field", () => {
    const result = validateBoard({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const missing = result.issues.filter((entry) => entry.code === "missing_field").map((entry) => entry.path);
      expect(missing).toEqual(["schemaVersion", "id", "title", "nodes", "edges"]);
    }
  });

  it("rejects unknown top-level fields instead of dropping data", () => {
    const board = { ...validBoard(), theme: "dark" };
    const result = validateBoard(board);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toContainEqual({
        code: "unknown_field",
        path: "theme",
        message: "unknown top-level field: theme",
      });
    }
  });

  it("rejects documents from a newer schema", () => {
    const result = validateBoard({ ...validBoard(), schemaVersion: CURRENT_SCHEMA_VERSION + 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((entry) => entry.code === "unsupported_version")).toBe(true);
    }
  });

  it("asks for migration on older documents", () => {
    const result = validateBoard({ ...validBoard(), schemaVersion: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("requires migration");
    }
  });

  it("rejects non-integer versions", () => {
    const result = validateBoard({ ...validBoard(), schemaVersion: 1.5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((entry) => entry.path === "schemaVersion")).toBe(true);
    }
  });

  it("reports duplicate node ids", () => {
    const board = validBoard();
    board.nodes.push({ ...board.nodes[0]! });
    const result = validateBoard(board);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((entry) => entry.code === "duplicate_id")).toBe(true);
    }
  });

  it("reports duplicate edge ids", () => {
    const board = validBoard();
    board.edges.push({ ...board.edges[0]! });
    const result = validateBoard(board);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((entry) => entry.code === "duplicate_id" && entry.path.startsWith("edges"))).toBe(true);
    }
  });

  it("rejects an unknown node kind", () => {
    const board = validBoard();
    (board.nodes[0] as unknown as { kind: string }).kind = "hexagon";
    const result = validateBoard(board);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((entry) => entry.path === "nodes[0].kind")).toBe(true);
    }
  });

  it("rejects non-finite geometry and non-positive sizes", () => {
    const board = validBoard();
    board.nodes[0]!.x = Number.NaN;
    board.nodes[1]!.width = 0;
    const result = validateBoard(board);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.issues.map((entry) => entry.path);
      expect(paths).toContain("nodes[0].x");
      expect(paths).toContain("nodes[1].width");
    }
  });

  it("rejects invalid node paint values", () => {
    const board = validBoard();
    board.nodes[0]!.style.fill = "url(javascript:alert(1))";
    board.nodes[0]!.style.fontSize = -2;
    const result = validateBoard(board);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.issues.map((entry) => entry.path);
      expect(paths).toContain("nodes[0].style.fill");
      expect(paths).toContain("nodes[0].style.fontSize");
    }
  });

  it("rejects an edge pointing at a missing node", () => {
    const board = validBoard();
    board.edges[0]!.to = "missing";
    const result = validateBoard(board);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toContainEqual({
        code: "dangling_edge",
        path: "edges[0].to",
        message: "edge endpoint does not resolve to a node: missing",
      });
    }
  });

  it("reports malformed nodes and edges rather than throwing", () => {
    const result = validateBoard({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: "b1",
      title: "",
      nodes: [null, 42],
      edges: ["nope"],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.filter((entry) => entry.code === "invalid_type").length).toBeGreaterThanOrEqual(3);
    }
  });

  it("requires nodes and edges to be arrays", () => {
    const result = validateBoard({ schemaVersion: CURRENT_SCHEMA_VERSION, id: "b1", title: "", nodes: {}, edges: "x" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.issues.map((entry) => entry.path);
      expect(paths).toContain("nodes");
      expect(paths).toContain("edges");
    }
  });

  it("accepts zero width edges and negative rotation", () => {
    const board = validBoard();
    board.nodes[0]!.rotation = -45;
    board.edges[0]!.style.strokeWidth = 0;
    const result = validateBoard(board);
    expect(result.ok).toBe(true);
  });

  it("accepts an edge whose endpoints are the same node", () => {
    const board = validBoard();
    board.edges[0]!.to = "n1";
    expect(validateBoard(board).ok).toBe(true);
  });
});

describe("migrateToCurrent", () => {
  const legacy = {
    version: 1,
    id: "legacy-1",
    title: "Old board",
    shapes: [
      { id: "s1", type: "rect", x: 0, y: 0, w: 100, h: 50, text: "Start", color: "#223344" },
      { id: "s2", type: "diamond", x: 150, y: 0, w: 90, h: 90 },
    ],
    links: [{ id: "l1", from: "s1", to: "s2", label: "next" }],
  };

  it("converts shapes and links to nodes and edges", () => {
    const result = migrateToCurrent(clone(legacy));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.board.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(result.board.nodes).toHaveLength(2);
      expect(result.board.nodes[0]).toMatchObject({
        id: "s1",
        kind: "rectangle",
        width: 100,
        height: 50,
        label: "Start",
        rotation: 0,
      });
      expect(result.board.nodes[0]?.style.stroke).toBe("#223344");
      expect(result.board.nodes[1]?.kind).toBe("diamond");
      expect(result.board.edges[0]).toMatchObject({ id: "l1", from: "s1", to: "s2", label: "next" });
      expect(result.board.edges[0]?.style).toEqual(DEFAULT_EDGE_STYLE);
    }
  });

  it("does not mutate the legacy payload", () => {
    const payload = clone(legacy);
    migrateToCurrent(payload);
    expect(payload).toEqual(legacy);
  });

  it("rejects dangling legacy links", () => {
    const payload = clone(legacy);
    payload.links[0]!.to = "ghost";
    const result = migrateToCurrent(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((entry) => entry.code === "dangling_edge")).toBe(true);
    }
  });

  it("rejects duplicate legacy shape ids", () => {
    const payload = clone(legacy);
    payload.shapes.push({ ...payload.shapes[0]! });
    const result = migrateToCurrent(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((entry) => entry.code === "duplicate_id")).toBe(true);
    }
  });

  it("rejects unsupported legacy shape types", () => {
    const payload = clone(legacy);
    payload.shapes[0]!.type = "hexagon";
    const result = migrateToCurrent(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((entry) => entry.path === "shapes[0].type")).toBe(true);
    }
  });

  it("rejects invalid legacy sizes and colours", () => {
    const payload = clone(legacy);
    payload.shapes[0]!.w = -5;
    payload.shapes[0]!.color = "not a colour";
    const result = migrateToCurrent(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.issues.map((entry) => entry.path);
      expect(paths).toContain("shapes[0].w");
      expect(paths).toContain("shapes[0].color");
    }
  });

  it("passes current documents through normal validation", () => {
    const current = validBoard();
    expect(migrateToCurrent(current)).toEqual(validateBoard(current));
  });

  it("rejects non-object legacy payloads", () => {
    const result = migrateToCurrent(null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.path).toBe("$");
    }
  });
});
