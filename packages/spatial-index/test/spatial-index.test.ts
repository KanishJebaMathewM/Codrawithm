import { describe, expect, it } from "vitest";
import { createSpatialIndex, type Bounds } from "../src/index.js";

function rect(x: number, y: number, width: number, height: number): Bounds {
  return { x, y, width, height };
}

describe("insert and lookup", () => {
  it("stores bounds and payload", () => {
    const index = createSpatialIndex<{ label: string }>({ cellSize: 100 });
    index.insert("n1", rect(10, 20, 30, 40), { label: "Cart" });
    expect(index.size).toBe(1);
    expect(index.get("n1")).toEqual({
      id: "n1",
      bounds: rect(10, 20, 30, 40),
      data: { label: "Cart" },
    });
    expect(index.get("missing")).toBeUndefined();
  });

  it("rejects duplicate ids", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    index.insert("n1", rect(0, 0, 10, 10));
    expect(() => index.insert("n1", rect(20, 20, 10, 10))).toThrow("already indexed");
  });

  it("rejects empty ids and invalid cell sizes", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    expect(() => index.insert("", rect(0, 0, 10, 10))).toThrow(TypeError);
    expect(() => createSpatialIndex({ cellSize: 0 })).toThrow(RangeError);
    expect(() => createSpatialIndex({ cellSize: Number.NaN })).toThrow(RangeError);
  });

  it("rejects non-finite bounds", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    expect(() => index.insert("n1", rect(0, 0, Number.POSITIVE_INFINITY, 10))).toThrow(TypeError);
  });
});

describe("queries", () => {
  it("returns only real overlaps, not just shared cells", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    index.insert("a", rect(10, 10, 20, 20));
    index.insert("b", rect(120, 120, 20, 20));
    index.insert("c", rect(15, 15, 10, 10));
    expect(index.searchIds(rect(0, 0, 30, 30))).toEqual(["a", "c"]);
  });

  it("includes rectangles that touch the query edge", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    index.insert("edge", rect(100, 0, 20, 20));
    expect(index.searchIds(rect(0, 0, 100, 100))).toEqual(["edge"]);
  });

  it("normalises a reversed query area", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    index.insert("n1", rect(500, 500, 20, 20));
    expect(index.searchIds(rect(600, 600, -200, -200))).toEqual(["n1"]);
  });

  it("normalises objects with negative extents", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    index.insert("n1", rect(100, 100, -40, -40));
    expect(index.get("n1")?.bounds).toEqual(rect(60, 60, 40, 40));
    expect(index.searchIds(rect(70, 70, 10, 10))).toEqual(["n1"]);
  });

  it("returns an empty list for an empty or distant query", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    expect(index.searchIds(rect(0, 0, 10, 10))).toEqual([]);
    index.insert("n1", rect(0, 0, 10, 10));
    expect(index.searchIds(rect(500, 500, 10, 10))).toEqual([]);
  });

  it("returns results sorted by id", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    index.insert("z", rect(0, 0, 10, 10));
    index.insert("a", rect(5, 5, 10, 10));
    index.insert("m", rect(2, 2, 10, 10));
    expect(index.searchIds(rect(0, 0, 50, 50))).toEqual(["a", "m", "z"]);
  });

  it("handles objects spanning many cells exactly once", () => {
    const index = createSpatialIndex({ cellSize: 50 });
    index.insert("wide", rect(0, 0, 500, 20));
    expect(index.searchIds(rect(0, 0, 200, 50))).toEqual(["wide"]);
    expect(index.searchIds(rect(100, 0, 10, 10))).toEqual(["wide"]);
  });
});

describe("updates and removal", () => {
  it("detaches an object from its old cells when moved", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    index.insert("n1", rect(10, 10, 20, 20));
    index.update("n1", rect(1010, 1010, 20, 20));
    expect(index.searchIds(rect(0, 0, 50, 50))).toEqual([]);
    expect(index.searchIds(rect(1000, 1000, 50, 50))).toEqual(["n1"]);
  });

  it("preserves the payload when only geometry changes", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    index.insert("n1", rect(0, 0, 10, 10), { label: "keep" });
    index.update("n1", rect(300, 300, 10, 10));
    expect(index.get("n1")?.data).toEqual({ label: "keep" });
  });

  it("rejects updates to unknown ids", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    expect(() => index.update("ghost", rect(0, 0, 10, 10))).toThrow("not indexed");
  });

  it("removes objects and reports unknown ids", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    index.insert("n1", rect(0, 0, 10, 10));
    expect(index.remove("n1")).toBe(true);
    expect(index.remove("n1")).toBe(false);
    expect(index.size).toBe(0);
    expect(index.searchIds(rect(0, 0, 100, 100))).toEqual([]);
  });

  it("clears every bucket", () => {
    const index = createSpatialIndex({ cellSize: 100 });
    index.insert("a", rect(0, 0, 10, 10));
    index.insert("b", rect(200, 200, 10, 10));
    index.clear();
    expect(index.size).toBe(0);
    expect(index.searchIds(rect(-1000, -1000, 3000, 3000))).toEqual([]);
  });
});

describe("brute force comparison", () => {
  it("matches a linear scan for a seeded board and sixty queries", () => {
    const random = (() => {
      let seed = 0x2f6e2b1;
      return () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0x100000000;
      };
    })();

    const index = createSpatialIndex<number>({ cellSize: 128 });
    const all: Array<{ id: string; bounds: Bounds }> = [];
    for (let cursor = 0; cursor < 4000; cursor += 1) {
      const bounds = rect(
        Math.floor(random() * 4000) - 2000,
        Math.floor(random() * 4000) - 2000,
        1 + Math.floor(random() * 240),
        1 + Math.floor(random() * 180),
      );
      const id = `n${cursor}`;
      index.insert(id, bounds, cursor);
      all.push({ id, bounds });
    }

    for (let query = 0; query < 60; query += 1) {
      const area = rect(
        Math.floor(random() * 4400) - 2200,
        Math.floor(random() * 4400) - 2200,
        Math.floor(random() * 900),
        Math.floor(random() * 700),
      );
      const expected = all
        .filter(
          (item) =>
            item.bounds.x <= area.x + area.width &&
            item.bounds.x + item.bounds.width >= area.x &&
            item.bounds.y <= area.y + area.height &&
            item.bounds.y + item.bounds.height >= area.y,
        )
        .map((item) => item.id)
        .sort();
      expect(index.searchIds(area)).toEqual(expected);
    }
  });
});
