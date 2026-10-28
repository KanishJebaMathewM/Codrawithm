import { describe, expect, it } from "vitest";
import {
  buildAccessibilityOutline,
  outlineToText,
  type OutlineBoard,
  type OutlineNode,
} from "../src/index.js";

function node(overrides: Partial<OutlineNode> & Pick<OutlineNode, "id">): OutlineNode {
  return { kind: "rectangle", x: 0, y: 0, width: 100, height: 50, ...overrides };
}

function board(overrides: Partial<OutlineBoard> = {}): OutlineBoard {
  return { title: "Checkout", nodes: [], edges: [], groups: [], ...overrides };
}

describe("reading order", () => {
  it("reads rows from top to bottom and each row left to right", () => {
    const outline = buildAccessibilityOutline(
      board({
        nodes: [
          node({ id: "bottom", x: 0, y: 200 }),
          node({ id: "right", x: 300, y: 10 }),
          node({ id: "left", x: 0, y: 5 }),
        ],
      }),
    );
    expect(outline.readingOrder).toEqual(["left", "right", "bottom"]);
  });

  it("uses the row tolerance to merge slightly misaligned nodes", () => {
    const outline = buildAccessibilityOutline(
      board({
        nodes: [node({ id: "a", x: 50, y: 0 }), node({ id: "b", x: 0, y: 20 })],
      }),
      { rowTolerance: 24 },
    );
    expect(outline.readingOrder).toEqual(["b", "a"]);
  });

  it("starts a new row when the tolerance is exceeded", () => {
    const outline = buildAccessibilityOutline(
      board({
        nodes: [node({ id: "a", x: 50, y: 0 }), node({ id: "b", x: 0, y: 40 })],
      }),
      { rowTolerance: 10 },
    );
    expect(outline.readingOrder).toEqual(["a", "b"]);
  });

  it("is stable for nodes at the same position", () => {
    const outline = buildAccessibilityOutline(
      board({ nodes: [node({ id: "b" }), node({ id: "a" })] }),
    );
    expect(outline.readingOrder).toEqual(["a", "b"]);
  });
});

describe("groups and labels", () => {
  it("builds named groups in visual order", () => {
    const outline = buildAccessibilityOutline(
      board({
        nodes: [
          node({ id: "later", groupId: "second", y: 200 }),
          node({ id: "first", groupId: "first", y: 0 }),
        ],
        groups: [
          { id: "second", label: "Later stage" },
          { id: "first", label: "Entry" },
        ],
      }),
    );
    expect(outline.groups.map((group) => group.label)).toEqual(["Entry", "Later stage"]);
    expect(outline.groups[0]?.items[0]?.label).toBe("rectangle first");
  });

  it("keeps ungrouped nodes separate", () => {
    const outline = buildAccessibilityOutline(
      board({
        nodes: [node({ id: "free" }), node({ id: "grouped", groupId: "g" })],
        groups: [{ id: "g", label: "Grouped" }],
      }),
    );
    expect(outline.ungrouped.map((item) => item.id)).toEqual(["free"]);
    expect(outline.groups[0]?.items.map((item) => item.id)).toEqual(["grouped"]);
  });

  it("falls back to generated names for missing labels", () => {
    const outline = buildAccessibilityOutline(
      board({
        nodes: [node({ id: "n1", kind: "diamond", label: "   " })],
        groups: [{ id: "g" }],
      }),
    );
    expect(outline.ungrouped[0]?.label).toBe("diamond n1");
    expect(outline.ungrouped[0]?.detail).toBe("diamond at 0, 0, 100 by 50");
    expect(outline.groups).toHaveLength(0);
  });

  it("skips declared groups without members", () => {
    const outline = buildAccessibilityOutline(
      board({ nodes: [node({ id: "n1" })], groups: [{ id: "empty", label: "Empty" }] }),
    );
    expect(outline.groups).toHaveLength(0);
  });
});

describe("connections", () => {
  it("describes edges with endpoint labels", () => {
    const outline = buildAccessibilityOutline(
      board({
        nodes: [
          node({ id: "a", label: "Cart" }),
          node({ id: "b", label: "Payment", x: 200 }),
        ],
        edges: [{ id: "e1", from: "a", to: "b", label: "checkout" }],
      }),
    );
    expect(outline.connections).toEqual([
      {
        id: "e1",
        role: "edge",
        label: "checkout",
        detail: "from Cart to Payment",
      },
    ]);
  });

  it("generates an edge label when none is provided", () => {
    const outline = buildAccessibilityOutline(
      board({
        nodes: [node({ id: "a", label: "A" }), node({ id: "b", label: "B", x: 200 })],
        edges: [{ id: "e1", from: "a", to: "b" }],
      }),
    );
    expect(outline.connections[0]?.label).toBe("A to B");
  });

  it("skips edges with missing endpoints", () => {
    const outline = buildAccessibilityOutline(
      board({
        nodes: [node({ id: "a" })],
        edges: [{ id: "e1", from: "a", to: "ghost" }],
      }),
    );
    expect(outline.connections).toHaveLength(0);
  });
});

describe("description and text output", () => {
  it("describes an empty board", () => {
    const outline = buildAccessibilityOutline({});
    expect(outline.title).toBe("Untitled board");
    expect(outline.description).toBe("Untitled board has no shapes and no connections.");
    expect(outlineToText(outline)).toBe("Untitled board\nUntitled board has no shapes and no connections.");
  });

  it("uses correct singular and plural forms", () => {
    const one = buildAccessibilityOutline(
      board({ nodes: [node({ id: "a" })], edges: [{ id: "e", from: "a", to: "a" }] }),
    );
    expect(one.description).toBe("Checkout has 1 shape and 1 connection.");
    const many = buildAccessibilityOutline(
      board({
        nodes: [node({ id: "a" }), node({ id: "b", x: 200 })],
        edges: [
          { id: "e1", from: "a", to: "b" },
          { id: "e2", from: "b", to: "a" },
        ],
        groups: [{ id: "g", label: "Pair" }],
      }),
    );
    expect(many.description).toBe("Checkout has 2 shapes and 2 connections.");
  });

  it("renders an indented text outline", () => {
    const outline = buildAccessibilityOutline(
      board({
        nodes: [node({ id: "a", label: "Cart", groupId: "g" }), node({ id: "b", label: "Free", x: 300 })],
        groups: [{ id: "g", label: "Entry" }],
        edges: [{ id: "e1", from: "a", to: "b", label: "next" }],
      }),
    );
    const text = outlineToText(outline);
    expect(text).toContain("Groups:\n- Entry\n  - Cart (rectangle at 0, 0, 100 by 50)");
    expect(text).toContain("Ungrouped shapes:\n- Free");
    expect(text).toContain("Connections:\n- next (from Cart to Free)");
  });
});

describe("validation", () => {
  it("rejects duplicate and unknown ids", () => {
    expect(() => buildAccessibilityOutline(board({ nodes: [node({ id: "a" }), node({ id: "a" })] }))).toThrow("duplicate node id");
    expect(() => buildAccessibilityOutline(board({ nodes: [node({ id: "a", groupId: "missing" })] }))).toThrow("unknown group");
    expect(() =>
      buildAccessibilityOutline(
        board({
          nodes: [node({ id: "a" })],
          groups: [{ id: "g" }, { id: "g" }],
        }),
      ),
    ).toThrow("duplicate group id");
    expect(() => buildAccessibilityOutline(board({ edges: [{ id: "e", from: "a", to: "b" }, { id: "e", from: "a", to: "b" }] }))).toThrow("duplicate edge id");
  });

  it("rejects invalid bounds and tolerance", () => {
    expect(() => buildAccessibilityOutline(board({ nodes: [node({ id: "a", width: 0 })] }))).toThrow(RangeError);
    expect(() => buildAccessibilityOutline(board({ nodes: [node({ id: "a", x: Number.NaN })] }))).toThrow(TypeError);
    expect(() => buildAccessibilityOutline(board(), { rowTolerance: -1 })).toThrow(RangeError);
  });
});
