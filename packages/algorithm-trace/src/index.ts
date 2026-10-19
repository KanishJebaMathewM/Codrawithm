export interface TraceFrame<T> {
  step: number;
  values: readonly T[];
  highlights: readonly number[];
  line?: number;
  note?: string;
}

export interface Trace<T> {
  initial: readonly T[];
  frames: readonly TraceFrame<T>[];
  final: readonly T[];
}

export interface TraceOptions {
  maxFrames?: number;
}

export interface TraceRecorder<T> {
  readonly values: readonly T[];
  readonly stepCount: number;
  set(index: number, value: T): void;
  swap(a: number, b: number): void;
  compare(a: number, b: number): [T, T];
  highlight(...indices: number[]): void;
  line(line: number): void;
  note(text: string): void;
  commit(): boolean;
  finish(): Trace<T>;
}

export class TraceLimitError extends Error {
  readonly limit: number;

  constructor(limit: number) {
    super(`trace limit of ${limit} frames reached`);
    this.name = "TraceLimitError";
    this.limit = limit;
  }
}

const DEFAULT_MAX_FRAMES = 1_000;

interface MutableFrame<T> {
  step: number;
  values: T[];
  highlights: number[];
  line?: number;
  note?: string;
}

function assertIndex(index: number, length: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= length) {
    throw new RangeError(`index ${index} is outside the array`);
  }
}

export function createTrace<T>(initial: readonly T[], options: TraceOptions = {}): TraceRecorder<T> {
  const maxFrames = options.maxFrames ?? DEFAULT_MAX_FRAMES;
  if (!Number.isInteger(maxFrames) || maxFrames < 1) {
    throw new RangeError("maxFrames must be a positive integer");
  }

  const source = initial.slice();
  let working = source.slice();
  let frames: MutableFrame<T>[] = [
    { step: 0, values: source.slice(), highlights: [] },
  ];
  let highlightIndices: number[] = [];
  let currentLine: number | undefined;
  let currentNote: string | undefined;
  let pending = false;
  let finished = false;
  let cached: Trace<T> | undefined;

  function assertActive(): void {
    if (finished) {
      throw new Error("trace is already finished");
    }
  }

  function mark(): void {
    pending = true;
  }

  function build(): Trace<T> {
    const copy = frames.map((frame) => {
      const result: TraceFrame<T> = {
        step: frame.step,
        values: Object.freeze(frame.values.slice()),
        highlights: Object.freeze(frame.highlights.slice()),
      };
      if (frame.line !== undefined) {
        result.line = frame.line;
      }
      if (frame.note !== undefined) {
        result.note = frame.note;
      }
      return result;
    });
    return Object.freeze({
      initial: Object.freeze(source.slice()),
      frames: Object.freeze(copy.map((frame) => Object.freeze(frame))),
      final: Object.freeze((frames[frames.length - 1]?.values ?? source).slice()),
    });
  }

  function commitInternal(): boolean {
    if (!pending) {
      return false;
    }
    if (frames.length >= maxFrames) {
      throw new TraceLimitError(maxFrames);
    }
    const frame: MutableFrame<T> = {
      step: frames.length,
      values: working.slice(),
      highlights: highlightIndices.slice(),
    };
    if (currentLine !== undefined) {
      frame.line = currentLine;
    }
    if (currentNote !== undefined) {
      frame.note = currentNote;
    }
    frames.push(frame);
    pending = false;
    highlightIndices = [];
    currentNote = undefined;
    return true;
  }

  return {
    get values() {
      return working.slice();
    },
    get stepCount() {
      return frames.length - 1;
    },
    set(index, value) {
      assertActive();
      assertIndex(index, working.length);
      if (Object.is(working[index], value)) {
        return;
      }
      working[index] = value;
      mark();
    },
    swap(a, b) {
      assertActive();
      assertIndex(a, working.length);
      assertIndex(b, working.length);
      if (a === b) {
        return;
      }
      const first = working[a]!;
      working[a] = working[b]!;
      working[b] = first;
      mark();
    },
    compare(a, b) {
      assertActive();
      assertIndex(a, working.length);
      assertIndex(b, working.length);
      highlightIndices = a <= b ? [a, b] : [b, a];
      mark();
      return [working[a]!, working[b]!];
    },
    highlight(...indices) {
      assertActive();
      for (const index of indices) {
        assertIndex(index, working.length);
      }
      highlightIndices = Array.from(new Set(indices)).sort((a, b) => a - b);
      mark();
    },
    line(line) {
      assertActive();
      if (!Number.isInteger(line) || line < 1) {
        throw new RangeError("line must be a positive integer");
      }
      currentLine = line;
      mark();
    },
    note(text) {
      assertActive();
      currentNote = text;
      mark();
    },
    commit() {
      assertActive();
      return commitInternal();
    },
    finish() {
      if (finished && cached !== undefined) {
        return cached;
      }
      commitInternal();
      finished = true;
      cached = build();
      return cached;
    },
  };
}
