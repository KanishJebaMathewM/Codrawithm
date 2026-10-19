import { describe, expect, it } from "vitest";
import {
  applyBoardDiff,
  changedPaths,
  deepEqual,
  diffBoards,
  hasBoardChanges,
  type BoardSnapshot,
  type ItemChange,
} from "../src/index.js";

interface TestNode {
  id: string;
  x?: number;
  label?: string;
  style?: { fill?: string; stroke?: string };
  points?: Array<{ x: number; y: number }>;
}

interface TestEdge {
  id: string;
  from?: string;
  to?: string;
  label?: string;
}

function snapshot(nodes: TestNode[] = [], edges: TestEdge[] = []): BoardSnapshot<TestNode, TestEdge> {
  return { nodes, edges };
}

function nodeChanges(diff: ReturnType<typeof diffBoards<TestNode, TestEdge>>): readonly ItemChange<TestNode>[] {
  return diff.nodes;
}

describe("values", () => {
  it("compares primitives, arrays, objects and NaN", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(deepEqual([1, { a: 2 }], [1, { a: 2 }])).toBe(true);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });

  it("reports dotted paths for nested objects and a single path for arrays", () => {
    expect(
      changedPaths(
        { x: 0, style: { fill: "#fff", stroke: "#000" }, points: [{ x: 0, y: 0 }] },
        { x: 10, style: { fill: "#eee", stroke: "#000" }, points: [{ x: 0, y: 1 }] },
      ),
    ).toEqual(["points", "style.fill", "x"]);
    expect(changedPaths("a", "b")).toEqual([""]);
  });
});

describe("diffing", () => {
  it("returns an empty diff for identical boards", () => {
    const board = snapshot([{ id: "a", x: 1 }], [{ id: "e", from: "a", to: "a" }]);
    const diff = diffBoards(board, board);
    expect(diff.nodes).toEqual([]);
    expect(diff.edges).toEqual([]);
    expect(diff.nodeOrderChanged).toBe(false);
    expect(diff.edgeOrderChanged).toBe(false);
    expect(hasBoardChanges(diff)).toBe(false);
  });

  it("detects added, removed and updated nodes in previous order", () => {
    const before = snapshot([
      { id: "a", x: 0 },
      { id: "b", x: 10 },
      { id: "c", x: 20 },
    ]);
    const after = snapshot([
      { id: "a", x: 5 },
      { id: "c", x: 20 },
      { id: "d", x: 30 },
    ]);
    const changes = nodeChanges(diffBoards(before, after));
    expect(changes.map((change) => [change.type, change.id])).toEqual([
      ["updated", "a"],
      ["removed", "b"],
      ["added", "d"],
    ]);
    expect(changes[0]).toMatchObject({ fields: ["x"], before: { x: 0 }, after: { x: 5 } });
  });

  it("reports nested field paths on an update", () => {
    const diff = diffBoards(
      snapshot([{ id: "a", style: { fill: "#fff", stroke: "#000" } }]),
      snapshot([{ id: "a", style: { fill: "#fee", stroke: "#000" } }]),
    );
    const change = diff.nodes[0]!;
    expect(change.type).toBe("updated");
    if (change.type === "updated") {
      expect(change.fields).toEqual(["style.fill"]);
    }
  });

  it("diffs edges independently from nodes", () => {
    const diff = diffBoards(
      snapshot([], [{ id: "e1", from: "a", to: "b" }, { id: "e2", from: "b", to: "c" }]),
      snapshot([], [{ id: "e1", from: "a", to: "b", label: "next" }, { id: "e3", from: "c", to: "a" }]),
    );
    expect(diff.nodes).toEqual([]);
    expect(diff.edges.map((change) => [change.type, change.id])).toEqual([
      ["updated", "e1"],
      ["removed", "e2"],
      ["added", "e3"],
    ]);
    expect(diff.edges[0]).toMatchObject({ fields: ["label"] });
  });

  it("tracks order-only changes", () => {
    const before = snapshot([{ id: "a" }, { id: "b" }]);
    const after = snapshot([{ id: "b" }, { id: "a" }]);
    const diff = diffBoards(before, after);
    expect(diff.nodes).toEqual([]);
    expect(diff.nodeOrderChanged).toBe(true);
    expect(diff.nodeOrder).toEqual(["b", "a"]);
    expect(hasBoardChanges(diff)).toBe(true);
  });

  it("rejects duplicate ids in either snapshot", () => {
    expect(() => diffBoards(snapshot([{ id: "a" }, { id: "a" }]), snapshot())).toThrow("duplicate node id");
    expect(() => diffBoards(snapshot(), snapshot([], [{ id: "e" }, { id: "e" }]))).toThrow("duplicate edge id");
  });

  it("does not mutate either snapshot", () => {
    const before = snapshot([{ id: "a", style: { fill: "#fff" } }]);
    const after = snapshot([{ id: "a", style: { fill: "#000" } }]);
    const beforeCopy = JSON.parse(JSON.stringify(before));
    const afterCopy = JSON.parse(JSON.stringify(after));
    diffBoards(before, after);
    expect(before).toEqual(beforeCopy);
    expect(after).toEqual(afterCopy);
  });

  it("is deterministic", () => {
    const before = snapshot([{ id: "a", x: 1 }, { id: "b", x: 2 }], [{ id: "e", from: "a", to: "b" }]);
    const after = snapshot([{ id: "b", x: 2 }, { id: "c", x: 3 }], [{ id: "e", from: "a", to: "c" }]);
    expect(diffBoards(before, after)).toEqual(diffBoards(before, after));
  });
});

describe("applying", () => {
  it("round-trips a full board through diff and apply", () => {
    const before = snapshot(
      [{ id: "a", x: 0 }, { id: "b", x: 10 }],
      [{ id: "e1", from: "a", to: "b" }],
    );
    const after = snapshot(
      [{ id: "b", x: 12 }, { id: "c", x: 30 }],
      [{ id: "e1", from: "b", to: "c", label: "next" }, { id: "e2", from: "a", to: "c" }],
    );
    const patched = applyBoardDiff(before, diffBoards(before, after));
    expect(patched).toEqual(after);
  });

  it("applies an order-only patch", () => {
    const before = snapshot([{ id: "a" }, { id: "b" }, { id: "c" }]);
    const after = snapshot([{ id: "c" }, { id: "a" }, { id: "b" }]);
    expect(applyBoardDiff(before, diffBoards(before, after))).toEqual(after);
  });

  it("adds and removes edges while keeping node arrays independent", () => {
    const before = snapshot([{ id: "a" }], [{ id: "e1", from: "a", to: "a" }]);
    const after = snapshot([{ id: "a" }], [{ id: "e2", from: "a", to: "a" }]);
    expect(applyBoardDiff(before, diffBoards(before, after))).toEqual(after);
  });

  it("rejects updates and removals of unknown ids", () => {
    const before = snapshot([{ id: "a" }]);
    const update: ItemChange<TestNode> = {
      type: "updated",
      id: "ghost",
      before: { id: "ghost" },
      after: { id: "ghost", x: 1 },
      fields: ["x"],
    };
    const remove: ItemChange<TestNode> = { type: "removed", id: "ghost", item: { id: "ghost" } };
    const base = {
      nodes: [],
      edges: [],
      nodeOrder: ["a"],
      edgeOrder: [],
      nodeOrderChanged: false,
      edgeOrderChanged: false,
    };
    expect(() => applyBoardDiff(before, { ...base, nodes: [update] })).toThrow("unknown node");
    expect(() => applyBoardDiff(before, { ...base, nodes: [remove] })).toThrow("unknown node");
  });

  it("rejects inconsistent target orders and duplicate changes", () => {
    const before = snapshot([{ id: "a" }]);
    const add: ItemChange<TestNode> = { type: "added", id: "b", item: { id: "b" } };
    const base = {
      nodes: [],
      edges: [],
      nodeOrder: ["a"],
      edgeOrder: [],
      nodeOrderChanged: false,
      edgeOrderChanged: false,
    };
    expect(() => applyBoardDiff(before, { ...base, nodes: [add] })).toThrow("target order is missing");
    expect(() => applyBoardDiff(before, { ...base, nodes: [add, add], nodeOrder: ["a", "b"] }))
      .toThrow("duplicate node change");
    expect(() => applyBoardDiff(before, { ...base, nodeOrder: ["a", "a"] })).toThrow("duplicate node in target order");
    expect(() => applyBoardDiff(before, { ...base, nodeOrder: ["ghost"] })).toThrow("missing node");
  });

  it("rejects adding an id that already exists", () => {
    const before = snapshot([{ id: "a" }]);
    const add: ItemChange<TestNode> = { type: "added", id: "a", item: { id: "a" } };
    expect(() =>
      applyBoardDiff(before, {
        nodes: [add],
        edges: [],
        nodeOrder: ["a"],
        edgeOrder: [],
        nodeOrderChanged: false,
        edgeOrderChanged: false,
      }),
    ).toThrow("cannot add existing node");
  });
});
