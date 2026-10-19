import { describe, expect, it, vi } from "vitest";
import { createHistory, type HistorySnapshot } from "../src/index.js";

interface BoardState {
  nodes: readonly string[];
  title: string;
}

function state(nodes: readonly string[] = [], title = "Board"): BoardState {
  return { nodes, title };
}

function addNode(value: BoardState, id: string): BoardState {
  return { ...value, nodes: [...value.nodes, id] };
}

function removeNode(value: BoardState, id: string): BoardState {
  return { ...value, nodes: value.nodes.filter((entry) => entry !== id) };
}

describe("apply and navigation", () => {
  it("starts with the provided state and no entries", () => {
    const initial = state(["a"]);
    const history = createHistory(initial);
    expect(history.state).toBe(initial);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
    expect(history.undo()).toBeUndefined();
    expect(history.redo()).toBeUndefined();
  });

  it("records a change and moves between snapshots", () => {
    const first = state();
    const second = addNode(first, "a");
    const third = addNode(second, "b");
    const history = createHistory(first);
    expect(history.apply("add a", () => second)).toBe(true);
    expect(history.apply("add b", () => third)).toBe(true);
    expect(history.state).toBe(third);
    expect(history.undo()).toBe(second);
    expect(history.undo()).toBe(first);
    expect(history.undo()).toBeUndefined();
    expect(history.state).toBe(first);
    expect(history.redo()).toBe(second);
    expect(history.redo()).toBe(third);
    expect(history.redo()).toBeUndefined();
  });

  it("is symmetric across repeated undo and redo", () => {
    const initial = state();
    const history = createHistory(initial);
    history.apply("one", (value) => addNode(value, "1"));
    history.apply("two", (value) => addNode(value, "2"));
    const final = history.state;
    for (let index = 0; index < 5; index += 1) {
      history.undo();
      history.undo();
      expect(history.state).toBe(initial);
      history.redo();
      history.redo();
      expect(history.state).toBe(final);
    }
  });

  it("ignores a change that returns the same reference", () => {
    const initial = state();
    const history = createHistory(initial);
    const listener = vi.fn();
    history.subscribe(listener);
    expect(history.apply("nothing", (value) => value)).toBe(false);
    expect(history.entries()).toHaveLength(0);
    expect(listener).not.toHaveBeenCalled();
  });

  it("clears the redo branch after a new change", () => {
    const history = createHistory(state());
    history.apply("a", (value) => addNode(value, "a"));
    history.apply("b", (value) => addNode(value, "b"));
    history.undo();
    expect(history.canRedo()).toBe(true);
    history.apply("c", (value) => addNode(value, "c"));
    expect(history.canRedo()).toBe(false);
    expect(history.redoEntries()).toHaveLength(0);
    expect(history.state.nodes).toEqual(["a", "c"]);
  });

  it("keeps labels and order in entry snapshots", () => {
    const history = createHistory(state());
    history.apply("first", (value) => addNode(value, "a"));
    history.apply("second", (value) => addNode(value, "b"));
    expect(history.entries().map((entry) => entry.label)).toEqual(["first", "second"]);
    history.undo();
    expect(history.redoEntries().map((entry) => entry.label)).toEqual(["second"]);
  });

  it("does not expose its internal arrays", () => {
    const history = createHistory(state());
    history.apply("a", (value) => addNode(value, "a"));
    const entries = history.entries() as unknown as unknown[];
    entries.length = 0;
    expect(history.entries()).toHaveLength(1);
  });
});

describe("coalescing", () => {
  it("merges commands with the same key inside the window", () => {
    let clock = 1_000;
    const history = createHistory(state(), { now: () => clock, mergeWindowMs: 400 });
    history.apply("move", (value) => ({ ...value, title: "one" }), { mergeKey: "move:n1" });
    clock = 1_200;
    history.apply("move", (value) => ({ ...value, title: "two" }), { mergeKey: "move:n1" });
    clock = 1_350;
    history.apply("move", (value) => ({ ...value, title: "three" }), { mergeKey: "move:n1" });
    expect(history.entries()).toHaveLength(1);
    expect(history.state.title).toBe("three");
    expect(history.undo()).toEqual(state([], "Board"));
    expect(history.redo()).toEqual(state([], "three"));
  });

  it("does not merge across different keys", () => {
    let clock = 0;
    const history = createHistory(state(), { now: () => clock, mergeWindowMs: 400 });
    history.apply("move a", (value) => ({ ...value, title: "a" }), { mergeKey: "move:a" });
    history.apply("move b", (value) => ({ ...value, title: "b" }), { mergeKey: "move:b" });
    expect(history.entries()).toHaveLength(2);
  });

  it("starts a new entry after the merge window expires", () => {
    let clock = 0;
    const history = createHistory(state(), { now: () => clock, mergeWindowMs: 400 });
    history.apply("move", (value) => ({ ...value, title: "a" }), { mergeKey: "move:a" });
    clock = 401;
    history.apply("move", (value) => ({ ...value, title: "b" }), { mergeKey: "move:a" });
    expect(history.entries()).toHaveLength(2);
  });

  it("does not merge a command without a key into a keyed entry", () => {
    let clock = 0;
    const history = createHistory(state(), { now: () => clock });
    history.apply("move", (value) => ({ ...value, title: "a" }), { mergeKey: "move:a" });
    history.apply("rename", (value) => ({ ...value, title: "b" }));
    expect(history.entries()).toHaveLength(2);
  });

  it("keeps the earliest before state while merging", () => {
    let clock = 0;
    const history = createHistory(state([], "start"), { now: () => clock });
    history.apply("one", (value) => ({ ...value, title: "one" }), { mergeKey: "k" });
    clock = 100;
    history.apply("two", (value) => ({ ...value, title: "two" }), { mergeKey: "k" });
    const entry = history.entries()[0]!;
    expect(entry.before.title).toBe("start");
    expect(entry.after.title).toBe("two");
    expect(entry.label).toBe("two");
  });
});

describe("transactions", () => {
  it("groups several changes into one entry", () => {
    const history = createHistory(state(["a", "b", "c"]));
    const changed = history.transaction("delete selection", (tx) => {
      tx.apply("remove a", (value) => removeNode(value, "a"));
      tx.apply("remove c", (value) => removeNode(value, "c"));
    });
    expect(changed).toBe(true);
    expect(history.entries()).toHaveLength(1);
    expect(history.entries()[0]?.label).toBe("delete selection");
    expect(history.state.nodes).toEqual(["b"]);
    expect(history.undo()).toEqual(state(["a", "b", "c"]));
  });

  it("returns false and records nothing for an empty transaction", () => {
    const history = createHistory(state());
    const changed = history.transaction("nothing", (tx) => {
      tx.apply("same", (value) => value);
    });
    expect(changed).toBe(false);
    expect(history.entries()).toHaveLength(0);
  });

  it("rolls back when the callback throws", () => {
    const initial = state([], "safe");
    const history = createHistory(initial);
    expect(() =>
      history.transaction("broken", (tx) => {
        tx.apply("change", (value) => ({ ...value, title: "half" }));
        throw new Error("boom");
      }),
    ).toThrow("boom");
    expect(history.state).toBe(initial);
    expect(history.entries()).toHaveLength(0);
  });

  it("rejects nested transactions", () => {
    const history = createHistory(state());
    expect(() =>
      history.transaction("outer", () => {
        history.transaction("inner", () => undefined);
      }),
    ).toThrow("transactions cannot be nested");
  });

  it("rejects direct applies inside a transaction", () => {
    const history = createHistory(state());
    expect(() =>
      history.transaction("outer", () => {
        history.apply("direct", (value) => addNode(value, "x"));
      }),
    ).toThrow("transaction handle");
  });
});

describe("bounds and listeners", () => {
  it("drops the oldest entries at the limit and undoes to the oldest retained state", () => {
    const history = createHistory(state(), { limit: 3 });
    for (let index = 1; index <= 5; index += 1) {
      history.apply(`step ${index}`, (value) => addNode(value, String(index)));
    }
    expect(history.entries()).toHaveLength(3);
    expect(history.entries().map((entry) => entry.label)).toEqual(["step 3", "step 4", "step 5"]);
    history.undo();
    history.undo();
    history.undo();
    expect(history.undo()).toBeUndefined();
    expect(history.state.nodes).toEqual(["1", "2"]);
  });

  it("validates option ranges", () => {
    expect(() => createHistory(state(), { limit: 0 })).toThrow(RangeError);
    expect(() => createHistory(state(), { limit: 2.5 })).toThrow(RangeError);
    expect(() => createHistory(state(), { mergeWindowMs: -1 })).toThrow(RangeError);
  });

  it("notifies once per accepted change and supports unsubscribing", () => {
    const history = createHistory(state());
    const seen: HistorySnapshot<BoardState>[] = [];
    const unsubscribe = history.subscribe((value) => seen.push(value));
    history.apply("a", (value) => addNode(value, "a"));
    history.apply("same", (value) => value);
    history.undo();
    history.redo();
    expect(seen).toHaveLength(3);
    expect(seen[0]?.canUndo).toBe(true);
    expect(seen[1]?.canRedo).toBe(true);
    expect(seen[2]?.state.nodes).toEqual(["a"]);
    unsubscribe();
    history.apply("b", (value) => addNode(value, "b"));
    expect(seen).toHaveLength(3);
  });

  it("notifies on clear even when there is nothing to remove", () => {
    const history = createHistory(state());
    const listener = vi.fn();
    history.subscribe(listener);
    history.clear();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(history.canUndo()).toBe(false);
  });
});
