import { describe, expect, it } from "vitest";
import { LayoutCycleError, layoutGraph, type LayoutEdge, type LayoutNode } from "../src/index.js";

function node(id: string, width = 100, height = 50): LayoutNode {
  return { id, width, height };
}

function edges(...pairs: Array<[string, string]>): LayoutEdge[] {
  return pairs.map(([from, to]) => ({ from, to }));
}

function byId(result: ReturnType<typeof layoutGraph>, id: string) {
  const found = result.nodes.find((entry) => entry.id === id);
  if (found === undefined) {
    throw new Error(`missing node ${id}`);
  }
  return found;
}

describe("layer assignment", () => {
  it("places a chain in consecutive layers", () => {
    const result = layoutGraph([node("a"), node("b"), node("c")], edges(["a", "b"], ["b", "c"]));
    expect(result.layers).toEqual([["a"], ["b"], ["c"]]);
    expect(byId(result, "a").layer).toBe(0);
    expect(byId(result, "b").layer).toBe(1);
    expect(byId(result, "c").layer).toBe(2);
  });

  it("uses the longest path when a node has multiple predecessors", () => {
    const result = layoutGraph(
      [node("a"), node("b"), node("c"), node("d")],
      edges(["a", "b"], ["b", "d"], ["a", "c"], ["c", "d"]),
    );
    expect(byId(result, "d").layer).toBe(2);
    expect(result.layers[2]).toContain("d");
  });

  it("puts isolated nodes in layer zero", () => {
    const result = layoutGraph([node("a"), node("b"), node("c")], edges(["a", "b"]));
    expect(result.layers[0]).toEqual(expect.arrayContaining(["a", "c"]));
    expect(byId(result, "c").layer).toBe(0);
  });

  it("returns an empty layout for an empty graph", () => {
    const result = layoutGraph([], []);
    expect(result).toEqual({ nodes: [], layers: [], width: 0, height: 0 });
  });
});

describe("coordinates", () => {
  it("centres shorter layers and applies both gaps", () => {
    const result = layoutGraph(
      [node("a", 100, 50), node("b", 100, 50), node("c", 60, 30)],
      edges(["a", "c"], ["b", "c"]),
      { nodeGap: 20, layerGap: 40 },
    );
    expect(result.width).toBe(220);
    expect(result.height).toBe(50 + 40 + 30);
    expect(byId(result, "a").x).toBe(0);
    expect(byId(result, "b").x).toBe(120);
    expect(byId(result, "c").x).toBe(80);
    expect(byId(result, "a").y).toBe(0);
    expect(byId(result, "c").y).toBe(90);
  });

  it("centres nodes vertically inside a layer with mixed heights", () => {
    const result = layoutGraph([node("a", 100, 60), node("b", 100, 20)], [], { nodeGap: 10 });
    expect(result.height).toBe(60);
    expect(byId(result, "a").y).toBe(0);
    expect(byId(result, "b").y).toBe(20);
  });

  it("supports a horizontal direction", () => {
    const result = layoutGraph([node("a", 80, 40), node("b", 60, 30)], edges(["a", "b"]), {
      direction: "right",
      nodeGap: 10,
      layerGap: 30,
    });
    expect(result.width).toBe(80 + 30 + 60);
    expect(result.height).toBe(40);
    expect(byId(result, "a").x).toBe(0);
    expect(byId(result, "b").x).toBe(110);
    expect(byId(result, "b").y).toBe(5);
  });

  it("spreads unconnected nodes without overlap", () => {
    const result = layoutGraph([node("a"), node("b"), node("c")], [], { nodeGap: 25 });
    expect(result.nodes.map((entry) => entry.x)).toEqual([0, 125, 250]);
    expect(result.width).toBe(350);
  });

  it("is deterministic", () => {
    const nodes = [node("a"), node("b"), node("c"), node("d")];
    const links = edges(["a", "b"], ["a", "c"], ["b", "d"], ["c", "d"]);
    expect(layoutGraph(nodes, links)).toEqual(layoutGraph(nodes, links));
  });
});

describe("crossing reduction", () => {
  it("orders a child near its parent instead of using input order", () => {
    const result = layoutGraph(
      [node("p1"), node("p2"), node("c1"), node("c2")],
      edges(["p1", "c2"], ["p2", "c1"]),
    );
    const layerZero = result.layers[0]!;
    const layerOne = result.layers[1]!;
    const p1 = layerZero.indexOf("p1");
    const p2 = layerZero.indexOf("p2");
    const c1 = layerOne.indexOf("c1");
    const c2 = layerOne.indexOf("c2");
    expect((p1 - p2) * (c2 - c1)).toBeGreaterThan(0);
  });
});

describe("validation", () => {
  it("rejects duplicate ids", () => {
    expect(() => layoutGraph([node("a"), node("a")], [])).toThrow("duplicate node id");
  });

  it("rejects unknown edge endpoints", () => {
    expect(() => layoutGraph([node("a")], edges(["a", "b"]))).toThrow("unknown node");
    expect(() => layoutGraph([node("a")], edges(["b", "a"]))).toThrow("unknown node");
  });

  it("rejects invalid node sizes and gaps", () => {
    expect(() => layoutGraph([node("a", 0, 10)], [])).toThrow(RangeError);
    expect(() => layoutGraph([node("a", Number.NaN, 10)], [])).toThrow(RangeError);
    expect(() => layoutGraph([node("a")], [], { nodeGap: -1 })).toThrow(RangeError);
    expect(() => layoutGraph([node("a")], [], { layerGap: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  it("reports the nodes involved in a cycle", () => {
    let captured: LayoutCycleError | undefined;
    try {
      layoutGraph([node("a"), node("b"), node("c")], edges(["a", "b"], ["b", "c"], ["c", "a"]));
    } catch (error) {
      captured = error as LayoutCycleError;
    }
    expect(captured).toBeInstanceOf(LayoutCycleError);
    expect(captured?.name).toBe("LayoutCycleError");
    expect(captured?.cycle[0]).toBe(captured?.cycle[captured.cycle.length - 1]);
    expect(captured?.cycle.length).toBe(4);
  });

  it("treats a self loop as a cycle", () => {
    expect(() => layoutGraph([node("a")], edges(["a", "a"]))).toThrow(LayoutCycleError);
  });
});
