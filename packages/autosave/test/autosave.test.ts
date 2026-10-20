import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAutosave, type AutosaveStatus } from "../src/index.js";

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("debouncing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("saves the latest snapshot once after the debounce delay", async () => {
    const save = vi.fn(async () => undefined);
    const autosave = createAutosave({ save, delayMs: 100 });
    autosave.schedule({ version: 1 });
    autosave.schedule({ version: 2 });
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(99);
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ version: 2 });
    await vi.runAllTimersAsync();
    expect(autosave.lastSaved).toEqual({ version: 2 });
    expect(autosave.pending).toBe(false);
  });

  it("restarts the timer when a new snapshot arrives", async () => {
    const save = vi.fn(async () => undefined);
    const autosave = createAutosave({ save, delayMs: 100 });
    autosave.schedule("first");
    await vi.advanceTimersByTimeAsync(80);
    autosave.schedule("second");
    await vi.advanceTimersByTimeAsync(80);
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(20);
    expect(save).toHaveBeenCalledWith("second");
  });

  it("reports the status sequence", async () => {
    const statuses: AutosaveStatus[] = [];
    const autosave = createAutosave({
      save: async () => undefined,
      delayMs: 50,
      onStatusChange: (status) => statuses.push(status),
    });
    autosave.schedule("payload");
    expect(statuses).toEqual(["scheduled"]);
    await vi.advanceTimersByTimeAsync(50);
    expect(statuses).toEqual(["scheduled", "saving", "saved"]);
  });

  it("does not start a timer with delay zero before a microtask", async () => {
    const save = vi.fn(async () => undefined);
    const autosave = createAutosave({ save, delayMs: 0 });
    autosave.schedule("now");
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(0);
    expect(save).toHaveBeenCalledTimes(1);
  });
});

describe("serialisation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("saves the newest snapshot after an in-flight save finishes", async () => {
    const gate = deferred();
    const save = vi.fn(async (value: string) => {
      if (value === "first") {
        await gate.promise;
      }
    });
    const autosave = createAutosave({ save, delayMs: 20 });
    autosave.schedule("first");
    await vi.advanceTimersByTimeAsync(20);
    expect(save).toHaveBeenCalledWith("first");
    autosave.schedule("second");
    expect(autosave.pending).toBe(true);
    gate.resolve();
    await vi.runAllTimersAsync();
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith("second");
    expect(autosave.lastSaved).toBe("second");
  });

  it("never runs two saves at once", async () => {
    const first = deferred();
    let active = 0;
    let maximum = 0;
    const save = vi.fn(async () => {
      active += 1;
      maximum = Math.max(maximum, active);
      if (save.mock.calls.length === 1) {
        await first.promise;
      }
      active -= 1;
    });
    const autosave = createAutosave({ save, delayMs: 10 });
    autosave.schedule("a");
    await vi.advanceTimersByTimeAsync(10);
    autosave.schedule("b");
    await vi.advanceTimersByTimeAsync(100);
    first.resolve();
    await vi.runAllTimersAsync();
    expect(maximum).toBe(1);
    expect(save).toHaveBeenCalledTimes(2);
  });
});

describe("failures", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("retries with the configured delays and then succeeds", async () => {
    const save = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    const autosave = createAutosave({
      save,
      delayMs: 10,
      maxRetries: 2,
      retryDelaysMs: [50, 100],
    });
    autosave.schedule("board");
    await vi.advanceTimersByTimeAsync(10);
    expect(save).toHaveBeenCalledTimes(1);
    expect(autosave.status).toBe("scheduled");
    await vi.advanceTimersByTimeAsync(49);
    expect(save).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(99);
    expect(save).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledTimes(3);
    await vi.runAllTimersAsync();
    expect(autosave.status).toBe("saved");
    expect(autosave.lastSaved).toBe("board");
  });

  it("falls back to exponential backoff", async () => {
    const save = vi.fn<() => Promise<void>>().mockRejectedValue(new Error("no"));
    const autosave = createAutosave({
      save,
      delayMs: 0,
      maxRetries: 2,
      retryBaseDelayMs: 30,
    });
    autosave.schedule(1);
    await vi.advanceTimersByTimeAsync(0);
    expect(save).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(30);
    expect(save).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(60);
    expect(save).toHaveBeenCalledTimes(3);
    expect(autosave.status).toBe("error");
    expect(autosave.error).toBeInstanceOf(Error);
  });

  it("reports an error after the last retry", async () => {
    const failure = new Error("server down");
    const statuses: Array<{ status: AutosaveStatus; error?: unknown }> = [];
    const autosave = createAutosave({
      save: async () => {
        throw failure;
      },
      delayMs: 0,
      maxRetries: 0,
      onStatusChange: (status, error) => statuses.push({ status, error }),
    });
    autosave.schedule("x");
    await vi.advanceTimersByTimeAsync(0);
    expect(autosave.status).toBe("error");
    expect(autosave.error).toBe(failure);
    expect(statuses.at(-1)).toEqual({ status: "error", error: failure });
  });

  it("tries the newest pending snapshot on a retry", async () => {
    const save = vi
      .fn<(value: string) => Promise<void>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    const autosave = createAutosave({ save, delayMs: 10, maxRetries: 1, retryDelaysMs: [20] });
    autosave.schedule("old");
    await vi.advanceTimersByTimeAsync(10);
    autosave.schedule("new");
    await vi.advanceTimersByTimeAsync(20);
    expect(save).toHaveBeenLastCalledWith("new");
    expect(autosave.lastSaved).toBe("new");
  });

  it("recovers through retry after an error", async () => {
    const save = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce(undefined);
    const autosave = createAutosave({ save, delayMs: 10, maxRetries: 0 });
    autosave.schedule("retry me");
    await vi.advanceTimersByTimeAsync(10);
    expect(autosave.status).toBe("error");
    const promise = autosave.retry();
    await vi.runAllTimersAsync();
    await promise;
    expect(autosave.status).toBe("saved");
    expect(autosave.lastSaved).toBe("retry me");
  });
});

describe("flush, cancel and disposal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("flushes pending work immediately", async () => {
    const save = vi.fn(async () => undefined);
    const autosave = createAutosave({ save, delayMs: 5_000 });
    autosave.schedule("urgent");
    await autosave.flush();
    expect(save).toHaveBeenCalledWith("urgent");
    expect(autosave.status).toBe("saved");
    expect(autosave.pending).toBe(false);
  });

  it("rejects a flush that cannot save, without waiting for backoff", async () => {
    const failure = new Error("nope");
    const autosave = createAutosave({
      save: async () => {
        throw failure;
      },
      delayMs: 10,
      maxRetries: 5,
      retryDelaysMs: [10_000],
    });
    autosave.schedule("data");
    await expect(autosave.flush()).rejects.toBe(failure);
    expect(autosave.status).toBe("error");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("resolves a flush with nothing to do", async () => {
    const autosave = createAutosave({ save: async () => undefined });
    await expect(autosave.flush()).resolves.toBeUndefined();
    expect(autosave.status).toBe("idle");
  });

  it("cancels pending work", async () => {
    const save = vi.fn(async () => undefined);
    const autosave = createAutosave({ save, delayMs: 100 });
    autosave.schedule("discard");
    autosave.cancel();
    await vi.advanceTimersByTimeAsync(200);
    expect(save).not.toHaveBeenCalled();
    expect(autosave.status).toBe("idle");
    expect(autosave.pending).toBe(false);
  });

  it("ignores schedules after disposal", async () => {
    const save = vi.fn(async () => undefined);
    const autosave = createAutosave({ save, delayMs: 10 });
    autosave.dispose();
    autosave.schedule("late");
    await vi.advanceTimersByTimeAsync(100);
    expect(save).not.toHaveBeenCalled();
    await expect(autosave.flush()).rejects.toThrow("disposed");
  });

  it("survives a throwing status listener and catches a synchronous save throw", async () => {
    const save = vi.fn(() => {
      throw new Error("sync failure");
    });
    const autosave = createAutosave({
      save,
      delayMs: 0,
      maxRetries: 0,
      onStatusChange: () => {
        throw new Error("listener failure");
      },
    });
    expect(() => autosave.schedule("x")).not.toThrow();
    await vi.advanceTimersByTimeAsync(0);
    expect(autosave.status).toBe("error");
  });

  it("validates options", () => {
    expect(() => createAutosave({ save: async () => undefined, delayMs: -1 })).toThrow(RangeError);
    expect(() => createAutosave({ save: async () => undefined, maxRetries: 1.5 })).toThrow(RangeError);
    expect(() => createAutosave({ save: async () => undefined, retryDelaysMs: [-5] })).toThrow(RangeError);
    expect(() => createAutosave({ save: undefined as never })).toThrow(TypeError);
  });
});
