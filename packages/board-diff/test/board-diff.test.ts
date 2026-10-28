import { describe, expect, it } from "vitest";
import type { BoardDocument, BoardEdge, BoardNode } from "@codrawithm/board-schema";
import {
  BoardDiffError,
  applyBoardDiff,
  applyCollectionDiff,
  changedPaths,
  createBoardSnapshot,
  deepEqual,
  diffBoards,
  diffById,
  diffCollection,
  hasBoardChanges,
  isPlainObject,
  type BoardDiff,
  type CollectionDiff,
} from "../src/index.js";

function sampleBoard(): BoardDocument {
  return {
    schemaVersion: 2,
    id: "board-main",
    title: "System Architecture",
    nodes: [
      {
        id: "n1",
        kind: "rectangle",
        x: 0,
        y: 0,
        width: 100,
        height: 60,
        rotation: 0,
        label: "Client",
        style: {
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 2,
          fontSize: 14,
          textColor: "#000000",
        },
      },
      {
        id: "n2",
        kind: "rectangle",
        x: 200,
        y: 0,
        width: 100,
        height: 60,
        rotation: 0,
        label: "API Gateway",
        style: {
          fill: "#eef6ff",
          stroke: "#000000",
          strokeWidth: 2,
          fontSize: 14,
          textColor: "#000000",
        },
      },
      {
        id: "n3",
        kind: "diamond",
        x: 400,
        y: 0,
        width: 80,
        height: 80,
        rotation: 0,
        label: "Auth?",
        style: {
          fill: "#fffbeb",
          stroke: "#b45309",
          strokeWidth: 2,
          fontSize: 12,
          textColor: "#b45309",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        from: "n1",
        to: "n2",
        label: "request",
        style: {
          stroke: "#000000",
          strokeWidth: 2,
          dashed: false,
        },
      },
      {
        id: "e2",
        from: "n2",
        to: "n3",
        label: "verify",
        style: {
          stroke: "#555555",
          strokeWidth: 2,
          dashed: true,
        },
      },
    ],
  };
}

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const val = (obj as Record<string, unknown>)[key];
    if (val !== null && typeof val === "object" && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

describe("deepEqual", () => {
  it("compares primitive types", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual("abc", "abc")).toBe(true);
    expect(deepEqual("abc", "abd")).toBe(false);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(true, false)).toBe(false);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual(0, -0)).toBe(true);
  });

  it("handles NaN equality correctly", () => {
    expect(deepEqual(NaN, NaN)).toBe(true);
    expect(deepEqual(NaN, 0)).toBe(false);
    expect(deepEqual({ val: NaN }, { val: NaN })).toBe(true);
    expect(deepEqual([NaN], [NaN])).toBe(true);
    expect(deepEqual([NaN], [0])).toBe(false);
  });

  it("compares plain objects recursively", () => {
    expect(deepEqual({ a: 1, b: "x" }, { b: "x", a: 1 })).toBe(true);
    expect(deepEqual({ a: 1, b: "x" }, { a: 1, b: "y" })).toBe(false);
    expect(deepEqual({ a: { b: { c: 2 } } }, { a: { b: { c: 2 } } })).toBe(true);
    expect(deepEqual({ a: { b: { c: 2 } } }, { a: { b: { c: 3 } } })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });

  it("compares arrays", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(deepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
  });

  it("distinguishes plain objects from arrays and null", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(42)).toBe(false);
    expect(deepEqual({}, [])).toBe(false);
    expect(deepEqual([], {})).toBe(false);
  });
});

describe("changedPaths", () => {
  it("returns empty array when objects are deeply equal", () => {
    const a = { x: 10, y: 20, style: { fill: "#fff" } };
    const b = { x: 10, y: 20, style: { fill: "#fff" } };
    expect(changedPaths(a, b)).toEqual([]);
  });

  it("reports dotted paths for nested objects", () => {
    const before = {
      x: 0,
      y: 10,
      style: {
        fill: "#ffffff",
        stroke: "#000000",
      },
    };
    const after = {
      x: 20,
      y: 10,
      style: {
        fill: "#ff0000",
        stroke: "#000000",
      },
    };
    expect(changedPaths(before, after)).toEqual(["style.fill", "x"]);
  });

  it("treats arrays as atomic values without index recursion", () => {
    const before = {
      id: "n1",
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      style: { strokeWidth: 1 },
    };
    const after = {
      id: "n1",
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 25 },
      ],
      style: { strokeWidth: 1 },
    };
    expect(changedPaths(before, after)).toEqual(["points"]);
  });

  it("reports added and removed properties", () => {
    const before = {
      a: 1,
      sub: { keep: true, drop: "old" },
    };
    const after = {
      a: 1,
      b: 2,
      sub: { keep: true, add: "new" },
    };
    expect(changedPaths(before, after)).toEqual(["b", "sub.add", "sub.drop"]);
  });

  it("handles NaN comparison in changedPaths", () => {
    const before = { num: NaN, style: { fill: "#000" } };
    const after = { num: NaN, style: { fill: "#000" } };
    expect(changedPaths(before, after)).toEqual([]);

    const afterDiff = { num: 42, style: { fill: "#000" } };
    expect(changedPaths(before, afterDiff)).toEqual(["num"]);
  });
});

describe("diffById", () => {
  it("emits removals and updates in previous array order, then additions in next array order", () => {
    const prev = [
      { id: "1", val: "a" },
      { id: "2", val: "b" },
      { id: "3", val: "c" },
      { id: "4", val: "d" },
    ];
    const next = [
      { id: "2", val: "b-modified" },
      { id: "5", val: "e-new" },
      { id: "4", val: "d" },
      { id: "6", val: "f-new" },
    ];

    const changes = diffById(prev, next);

    expect(changes).toEqual([
      {
        type: "remove",
        id: "1",
        item: prev[0],
        before: prev[0],
      },
      {
        type: "update",
        id: "2",
        before: prev[1],
        after: next[0],
        paths: ["val"],
      },
      {
        type: "remove",
        id: "3",
        item: prev[2],
        before: prev[2],
      },
      {
        type: "add",
        id: "5",
        item: next[1],
        after: next[1],
      },
      {
        type: "add",
        id: "6",
        item: next[3],
        after: next[3],
      },
    ]);
  });

  it("rejects duplicate ids in previous or next arrays", () => {
    const duplicatePrev = [
      { id: "item1", val: 1 },
      { id: "item1", val: 2 },
    ];
    const normal = [{ id: "item1", val: 1 }];
    const duplicateNext = [
      { id: "item2", val: 1 },
      { id: "item2", val: 2 },
    ];

    expect(() => diffById(duplicatePrev, normal)).toThrowError(BoardDiffError);
    expect(() => diffById(normal, duplicateNext)).toThrowError(BoardDiffError);
  });

  it("rejects items without valid ids", () => {
    expect(() => diffById([{ id: "" }], [{ id: "valid" }])).toThrowError(BoardDiffError);
    expect(() => diffById([{ id: "valid" }], [{} as any])).toThrowError(BoardDiffError);
  });
});

describe("diffBoards and hasBoardChanges", () => {
  it("returns no changes for identical boards", () => {
    const b1 = sampleBoard();
    const b2 = sampleBoard();
    const diff = diffBoards(b1, b2);

    expect(diff.nodes.changes).toHaveLength(0);
    expect(diff.nodes.orderChanged).toBe(false);
    expect(diff.edges.changes).toHaveLength(0);
    expect(diff.edges.orderChanged).toBe(false);
    expect(hasBoardChanges(diff)).toBe(false);
  });

  it("detects node updates and edge changes independently", () => {
    const b1 = sampleBoard();
    const b2 = sampleBoard();
    b2.nodes[0]!.x = 20;
    b2.nodes[0]!.style.fill = "#ffeedd";
    b2.edges[1]!.style.dashed = false;

    const diff = diffBoards(b1, b2);

    expect(hasBoardChanges(diff)).toBe(true);
    expect(diff.nodes.changes).toHaveLength(1);
    expect(diff.nodes.changes[0]).toMatchObject({
      type: "update",
      id: "n1",
      paths: ["style.fill", "x"],
    });
    expect(diff.edges.changes).toHaveLength(1);
    expect(diff.edges.changes[0]).toMatchObject({
      type: "update",
      id: "e2",
      paths: ["style.dashed"],
    });
  });

  it("flags order-only changes (z-order edits) and reports hasBoardChanges as true", () => {
    const b1 = sampleBoard();
    const b2 = sampleBoard();
    // Reorder nodes: n2, n3, n1 (same items, different z-order)
    b2.nodes = [b1.nodes[1]!, b1.nodes[2]!, b1.nodes[0]!];

    const diff = diffBoards(b1, b2);

    expect(diff.nodes.changes).toHaveLength(0);
    expect(diff.nodes.orderChanged).toBe(true);
    expect(diff.nodes.targetOrder).toEqual(["n2", "n3", "n1"]);
    expect(hasBoardChanges(diff)).toBe(true);
  });

  it("records board title changes", () => {
    const b1 = sampleBoard();
    const b2 = sampleBoard();
    b2.title = "Updated System Map";

    const diff = diffBoards(b1, b2);
    expect(diff.title).toBe("Updated System Map");
    expect(hasBoardChanges(diff)).toBe(true);
  });
});

describe("applyBoardDiff and applyCollectionDiff", () => {
  it("performs full round trips without mutating either input", () => {
    const before = sampleBoard();
    const after = sampleBoard();

    // Make various changes
    after.title = "Production Architecture v2";
    // Remove n3
    after.nodes = after.nodes.filter((n) => n.id !== "n3");
    // Update n1
    after.nodes[0]!.label = "React Frontend";
    after.nodes[0]!.style.fill = "#61dafb";
    // Add n4
    const n4: BoardNode = {
      id: "n4",
      kind: "rectangle",
      x: 350,
      y: 100,
      width: 120,
      height: 70,
      rotation: 0,
      label: "Database",
      style: {
        fill: "#e2e8f0",
        stroke: "#334155",
        strokeWidth: 2,
        fontSize: 14,
        textColor: "#0f172a",
      },
    };
    after.nodes.push(n4);
    // Reorder nodes
    after.nodes = [after.nodes[1]!, after.nodes[2]!, after.nodes[0]!];

    // Edge changes: update e1, remove e2, add e3
    after.edges[0]!.label = "HTTPS";
    after.edges = [
      after.edges[0]!,
      {
        id: "e3",
        from: "n2",
        to: "n4",
        label: "SQL query",
        style: { stroke: "#000000", strokeWidth: 2, dashed: false },
      },
    ];

    const diff = diffBoards(before, after);

    // Deep freeze inputs to assert immutability
    deepFreeze(before);
    deepFreeze(diff);

    const result = applyBoardDiff(before, diff);

    expect(deepEqual(result, after)).toBe(true);
    expect(result.nodes.map((n) => n.id)).toEqual(after.nodes.map((n) => n.id));
    expect(result.edges.map((e) => e.id)).toEqual(after.edges.map((e) => e.id));
  });

  it("applies order-only diffs correctly", () => {
    const before = sampleBoard();
    const targetOrder = ["n3", "n1", "n2"];
    const diff: BoardDiff = {
      nodes: {
        changes: [],
        targetOrder,
        orderChanged: true,
      },
      edges: {
        changes: [],
        targetOrder: before.edges.map((e) => e.id),
        orderChanged: false,
      },
    };

    const result = applyBoardDiff(before, diff);
    expect(result.nodes.map((n) => n.id)).toEqual(["n3", "n1", "n2"]);
    expect(result.nodes[0]!.id).toBe("n3");
    expect(result.nodes[1]!.id).toBe("n1");
    expect(result.nodes[2]!.id).toBe("n2");
  });
});

describe("applyBoardDiff validation and rejection of invalid patches", () => {
  it("rejects duplicate changes in the patch", () => {
    const before = sampleBoard();
    const diff: BoardDiff = {
      nodes: {
        changes: [
          {
            type: "update",
            id: "n1",
            before: before.nodes[0]!,
            after: { ...before.nodes[0]!, label: "V1" },
            paths: ["label"],
          },
          {
            type: "update",
            id: "n1",
            before: before.nodes[0]!,
            after: { ...before.nodes[0]!, label: "V2" },
            paths: ["label"],
          },
        ],
        targetOrder: before.nodes.map((n) => n.id),
        orderChanged: false,
      },
      edges: {
        changes: [],
        targetOrder: before.edges.map((e) => e.id),
        orderChanged: false,
      },
    };

    expect(() => applyBoardDiff(before, diff)).toThrowError(
      /Duplicate change detected for id "n1"/,
    );
  });

  it("rejects adding an existing id", () => {
    const before = sampleBoard();
    const diff: BoardDiff = {
      nodes: {
        changes: [
          {
            type: "add",
            id: "n1", // already exists!
            item: { ...before.nodes[0]!, label: "New" },
            after: { ...before.nodes[0]!, label: "New" },
          },
        ],
        targetOrder: [...before.nodes.map((n) => n.id)],
        orderChanged: false,
      },
      edges: {
        changes: [],
        targetOrder: before.edges.map((e) => e.id),
        orderChanged: false,
      },
    };

    expect(() => applyBoardDiff(before, diff)).toThrowError(
      /Cannot add existing id "n1"/,
    );
  });

  it("rejects updating an unknown id", () => {
    const before = sampleBoard();
    const diff: BoardDiff = {
      nodes: {
        changes: [
          {
            type: "update",
            id: "unknown-id",
            before: {} as any,
            after: { id: "unknown-id", label: "Ghost" } as any,
            paths: ["label"],
          },
        ],
        targetOrder: [...before.nodes.map((n) => n.id)],
        orderChanged: false,
      },
      edges: {
        changes: [],
        targetOrder: before.edges.map((e) => e.id),
        orderChanged: false,
      },
    };

    expect(() => applyBoardDiff(before, diff)).toThrowError(
      /Cannot update unknown id "unknown-id"/,
    );
  });

  it("rejects removing an unknown id", () => {
    const before = sampleBoard();
    const diff: BoardDiff = {
      nodes: {
        changes: [
          {
            type: "remove",
            id: "non-existent-node",
            item: {} as any,
            before: {} as any,
          },
        ],
        targetOrder: before.nodes.map((n) => n.id),
        orderChanged: false,
      },
      edges: {
        changes: [],
        targetOrder: before.edges.map((e) => e.id),
        orderChanged: false,
      },
    };

    expect(() => applyBoardDiff(before, diff)).toThrowError(
      /Cannot remove unknown id "non-existent-node"/,
    );
  });

  it("rejects duplicate ids in targetOrder", () => {
    const before = sampleBoard();
    const diff: BoardDiff = {
      nodes: {
        changes: [],
        targetOrder: ["n1", "n1", "n2"],
        orderChanged: true,
      },
      edges: {
        changes: [],
        targetOrder: before.edges.map((e) => e.id),
        orderChanged: false,
      },
    };

    expect(() => applyBoardDiff(before, diff)).toThrowError(
      /Duplicate id in target order: "n1"/,
    );
  });

  it("rejects target order that does not contain every final item exactly once", () => {
    const before = sampleBoard();
    // Missing n3 in targetOrder
    const diffMissing: BoardDiff = {
      nodes: {
        changes: [],
        targetOrder: ["n1", "n2"],
        orderChanged: true,
      },
      edges: {
        changes: [],
        targetOrder: before.edges.map((e) => e.id),
        orderChanged: false,
      },
    };

    expect(() => applyBoardDiff(before, diffMissing)).toThrowError(
      /Target order length \(2\) does not match final item count \(3\)/,
    );

    // Extra unknown item in targetOrder with matching length
    const diffExtra: BoardDiff = {
      nodes: {
        changes: [],
        targetOrder: ["n1", "n2", "ghost-item"],
        orderChanged: true,
      },
      edges: {
        changes: [],
        targetOrder: before.edges.map((e) => e.id),
        orderChanged: false,
      },
    };

    expect(() => applyBoardDiff(before, diffExtra)).toThrowError(
      /Target order contains unexpected id "ghost-item"/,
    );
  });

  it("rejects base documents with duplicate ids", () => {
    const corruptBoard = sampleBoard();
    corruptBoard.nodes.push({ ...corruptBoard.nodes[0]! }); // duplicate n1
    const diff: BoardDiff = {
      nodes: {
        changes: [],
        targetOrder: corruptBoard.nodes.map((n) => n.id),
        orderChanged: false,
      },
      edges: {
        changes: [],
        targetOrder: corruptBoard.edges.map((e) => e.id),
        orderChanged: false,
      },
    };

    expect(() => applyBoardDiff(corruptBoard, diff)).toThrowError(
      /Duplicate id found in base collection: "n1"/,
    );
  });

  it("rejects invalid diff arguments", () => {
    const before = sampleBoard();
    expect(() => applyBoardDiff(null as any, {} as any)).toThrowError(BoardDiffError);
    expect(() => applyBoardDiff(before, null as any)).toThrowError(BoardDiffError);
    expect(() => applyBoardDiff(before, {} as any)).toThrowError(BoardDiffError);
    expect(() => applyCollectionDiff([] as any, { changes: null as any, targetOrder: [], orderChanged: false })).toThrowError(
      BoardDiffError,
    );
  });
});

describe("createBoardSnapshot", () => {
  it("creates an independent deep clone of the board document", () => {
    const original = sampleBoard();
    const snapshot = createBoardSnapshot(original);

    expect(deepEqual(original, snapshot)).toBe(true);
    snapshot.nodes[0]!.x = 999;
    expect(original.nodes[0]!.x).toBe(0);
  });
});
