export type AutosaveStatus = "idle" | "scheduled" | "saving" | "saved" | "error";

export interface AutosaveOptions<T> {
  save: (snapshot: T) => Promise<void>;
  delayMs?: number;
  maxRetries?: number;
  retryBaseDelayMs?: number;
  retryDelaysMs?: readonly number[];
  onStatusChange?: (status: AutosaveStatus, error?: unknown) => void;
}

export interface Autosave<T> {
  schedule(snapshot: T): void;
  flush(): Promise<void>;
  retry(): Promise<void>;
  cancel(): void;
  dispose(): void;
  readonly status: AutosaveStatus;
  readonly pending: boolean;
  readonly lastSaved: T | undefined;
  readonly error: unknown;
}

interface Snapshot<T> {
  value: T;
}

const DEFAULT_DELAY_MS = 800;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_BASE_DELAY_MS = 1_000;

export function createAutosave<T>(options: AutosaveOptions<T>): Autosave<T> {
  if (typeof options.save !== "function") {
    throw new TypeError("save must be a function");
  }
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  if (!Number.isFinite(delayMs) || delayMs < 0) {
    throw new RangeError("delayMs must be a non-negative number");
  }
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  if (!Number.isInteger(maxRetries) || maxRetries < 0) {
    throw new RangeError("maxRetries must be a non-negative integer");
  }
  const retryBaseDelayMs = options.retryBaseDelayMs ?? DEFAULT_RETRY_BASE_DELAY_MS;
  if (!Number.isFinite(retryBaseDelayMs) || retryBaseDelayMs < 0) {
    throw new RangeError("retryBaseDelayMs must be a non-negative number");
  }
  const retryDelaysMs = options.retryDelaysMs ?? [];
  if (retryDelaysMs.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new RangeError("retryDelaysMs must contain non-negative numbers");
  }

  let pending: Snapshot<T> | null = null;
  let failed: Snapshot<T> | null = null;
  let lastSaved: T | undefined;
  let status: AutosaveStatus = "idle";
  let attempt = 0;
  let lastError: unknown;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let saving: Promise<void> | null = null;
  let disposed = false;

  function notify(next: AutosaveStatus, error?: unknown): void {
    status = next;
    if (options.onStatusChange === undefined) {
      return;
    }
    try {
      options.onStatusChange(next, error);
    } catch {
      // Status listeners are observers and must not break saving.
    }
  }

  function clearTimers(): void {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (retryTimer !== null) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  }

  function armDebounce(): void {
    if (disposed) {
      return;
    }
    clearTimers();
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void runSave();
    }, delayMs);
  }

  function retryDelay(nextAttempt: number): number {
    const configured = retryDelaysMs[nextAttempt - 1];
    if (configured !== undefined) {
      return configured;
    }
    return retryBaseDelayMs * 2 ** (nextAttempt - 1);
  }

  function armRetry(nextAttempt: number): void {
    if (disposed) {
      return;
    }
    clearTimers();
    retryTimer = setTimeout(() => {
      retryTimer = null;
      void runSave();
    }, retryDelay(nextAttempt));
  }

  function runSave(): Promise<void> {
    if (saving !== null) {
      return saving;
    }
    const snapshot = pending ?? failed;
    if (snapshot === null) {
      return Promise.resolve();
    }
    pending = null;
    failed = null;
    lastError = undefined;
    notify("saving");

    const promise = Promise.resolve()
      .then(() => options.save(snapshot.value))
      .then(() => {
        lastSaved = snapshot.value;
        attempt = 0;
        if (pending !== null) {
          notify("scheduled");
          armDebounce();
        } else {
          notify("saved");
        }
      })
      .catch((error: unknown) => {
        failed = pending ?? snapshot;
        pending = null;
        if (attempt < maxRetries) {
          attempt += 1;
          notify("scheduled");
          armRetry(attempt);
        } else {
          lastError = error;
          notify("error", error);
        }
      })
      .finally(() => {
        saving = null;
      });

    saving = promise;
    return promise;
  }

  function schedule(snapshot: T): void {
    if (disposed) {
      return;
    }
    pending = { value: snapshot };
    failed = null;
    lastError = undefined;
    attempt = 0;
    if (saving !== null) {
      return;
    }
    clearTimers();
    notify("scheduled");
    armDebounce();
  }

  async function flush(): Promise<void> {
    if (disposed) {
      throw new Error("autosave is disposed");
    }
    clearTimers();
    if (saving !== null) {
      await saving;
    }
    if (pending !== null || failed !== null) {
      clearTimers();
      attempt = maxRetries;
      await runSave();
      if (status === "error") {
        throw lastError;
      }
    }
    if (status === "error") {
      throw lastError;
    }
  }

  async function retry(): Promise<void> {
    if (disposed) {
      throw new Error("autosave is disposed");
    }
    clearTimers();
    if (saving !== null) {
      await saving;
    }
    if (pending === null && failed !== null) {
      pending = failed;
      failed = null;
    }
    if (pending === null) {
      if (status === "error") {
        notify("idle");
      }
      return;
    }
    attempt = 0;
    lastError = undefined;
    notify("scheduled");
    await runSave();
  }

  function cancel(): void {
    clearTimers();
    pending = null;
    failed = null;
    attempt = 0;
    lastError = undefined;
    if (saving === null) {
      notify("idle");
    }
  }

  function dispose(): void {
    disposed = true;
    cancel();
  }

  return {
    schedule,
    flush,
    retry,
    cancel,
    dispose,
    get status() {
      return status;
    },
    get pending() {
      return pending !== null;
    },
    get lastSaved() {
      return lastSaved;
    },
    get error() {
      return lastError;
    },
  };
}
