import { describe, expect, it } from "vitest";
import { TraceLimitError, createTrace } from "../src/index.js";

describe("frames", () => {
  it("starts with an initial frame", () => {
    const trace = createTrace([3, 1, 2]);
    const result = trace.finish();
    expect(result.initial).toEqual([3, 1, 2]);
    expect(result.frames).toHaveLength(1);
    expect(result.frames[0]).toEqual({ step: 0, values: [3, 1, 2], highlights: [] });
    expect(result.final).toEqual([3, 1, 2]);
    expect(trace.stepCount).toBe(0);
  });

  it("records a set after commit", () => {
    const trace = createTrace(["a", "b"]);
    trace.set(1, "c");
    expect(trace.values).toEqual(["a", "c"]);
    expect(trace.commit()).toBe(true);
    expect(trace.stepCount).toBe(1);
    expect(trace.finish().frames[1]).toEqual({ step: 1, values: ["a", "c"], highlights: [] });
  });

  it("does not mark an identical set", () => {
    const trace = createTrace([1, 2]);
    trace.set(0, 1);
    expect(trace.commit()).toBe(false);
    expect(trace.stepCount).toBe(0);
  });

  it("swaps values and ignores a swap with itself", () => {
    const trace = createTrace([1, 2, 3]);
    trace.swap(0, 2);
    expect(trace.values).toEqual([3, 2, 1]);
    trace.commit();
    trace.swap(1, 1);
    expect(trace.commit()).toBe(false);
    expect(trace.finish().final).toEqual([3, 2, 1]);
  });

  it("records multiple committed states in order", () => {
    const trace = createTrace([3, 2, 1]);
    trace.swap(0, 1);
    trace.commit();
    trace.swap(1, 2);
    trace.commit();
    const result = trace.finish();
    expect(result.frames.map((frame) => frame.values)).toEqual([
      [3, 2, 1],
      [2, 3, 1],
      [2, 1, 3],
    ]);
  });
});

describe("comparison and metadata", () => {
  it("returns compared values and highlights both indexes", () => {
    const trace = createTrace([10, 20, 30]);
    expect(trace.compare(2, 0)).toEqual([30, 10]);
    trace.commit();
    expect(trace.finish().frames[1]?.highlights).toEqual([0, 2]);
  });

  it("normalises highlight order and removes duplicates", () => {
    const trace = createTrace([0, 1, 2, 3]);
    trace.highlight(3, 1, 3, 0);
    trace.commit();
    expect(trace.finish().frames[1]?.highlights).toEqual([0, 1, 3]);
  });

  it("persists the line but clears highlights and notes after a commit", () => {
    const trace = createTrace([0, 1]);
    trace.line(7);
    trace.highlight(0);
    trace.note("outer loop");
    trace.commit();
    trace.swap(0, 1);
    trace.commit();
    const frames = trace.finish().frames;
    expect(frames[1]?.line).toBe(7);
    expect(frames[1]?.note).toBe("outer loop");
    expect(frames[1]?.highlights).toEqual([0]);
    expect(frames[2]?.line).toBe(7);
    expect(frames[2]?.note).toBeUndefined();
    expect(frames[2]?.highlights).toEqual([]);
  });

  it("records a metadata-only frame", () => {
    const trace = createTrace([1, 2]);
    trace.note("inspect");
    expect(trace.commit()).toBe(true);
    expect(trace.finish().frames[1]?.note).toBe("inspect");
  });

  it("returns false when there is nothing pending", () => {
    const trace = createTrace([1]);
    expect(trace.commit()).toBe(false);
    trace.line(2);
    expect(trace.commit()).toBe(true);
    expect(trace.commit()).toBe(false);
  });
});

describe("snapshots and limits", () => {
  it("stores defensive copies of values and highlights", () => {
    const input = [1, 2];
    const trace = createTrace(input);
    input[0] = 99;
    trace.highlight(0, 1);
    trace.commit();
    const result = trace.finish();
    const values = result.frames[1]!.values as unknown as number[];
    const highlights = result.frames[1]!.highlights as unknown as number[];
    expect(() => values.push(42)).toThrow(TypeError);
    expect(() => highlights.push(9)).toThrow(TypeError);
    expect(result.frames[1]?.values).toEqual([1, 2]);
    expect(result.frames[1]?.highlights).toEqual([0, 1]);
    expect(result.initial).toEqual([1, 2]);
  });

  it("throws when the frame limit is reached", () => {
    const trace = createTrace([1], { maxFrames: 3 });
    trace.set(0, 2);
    trace.commit();
    trace.set(0, 3);
    trace.commit();
    trace.set(0, 4);
    expect(() => trace.commit()).toThrow(TraceLimitError);
    try {
      trace.commit();
    } catch (error) {
      expect((error as TraceLimitError).limit).toBe(3);
      expect((error as TraceLimitError).name).toBe("TraceLimitError");
    }
  });

  it("validates maxFrames", () => {
    expect(() => createTrace([1], { maxFrames: 0 })).toThrow(RangeError);
    expect(() => createTrace([1], { maxFrames: 1.5 })).toThrow(RangeError);
  });

  it("rejects out-of-range indexes", () => {
    const trace = createTrace([1, 2]);
    expect(() => trace.set(-1, 3)).toThrow(RangeError);
    expect(() => trace.set(2, 3)).toThrow(RangeError);
    expect(() => trace.swap(0, 2)).toThrow(RangeError);
    expect(() => trace.compare(0, 2)).toThrow(RangeError);
    expect(() => trace.highlight(5)).toThrow(RangeError);
    expect(() => trace.line(0)).toThrow(RangeError);
  });

  it("finishes idempotently and rejects further work", () => {
    const trace = createTrace([1]);
    trace.set(0, 2);
    const first = trace.finish();
    const second = trace.finish();
    expect(first).toBe(second);
    expect(first.final).toEqual([2]);
    expect(() => trace.set(0, 3)).toThrow("finished");
    expect(() => trace.commit()).toThrow("finished");
  });

  it("commits pending work when finishing", () => {
    const trace = createTrace([1]);
    trace.set(0, 2);
    const result = trace.finish();
    expect(result.frames).toHaveLength(2);
    expect(result.final).toEqual([2]);
  });
});
