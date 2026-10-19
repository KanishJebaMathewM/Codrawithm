export type ShortcutPlatform = "mac" | "other";

export interface KeyEventLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export interface ShortcutContext {
  scope?: string;
  editable?: boolean;
}

export interface Shortcut {
  id: string;
  keys: string;
  description: string;
  scope?: string;
  allowInInput?: boolean;
  when?: () => boolean;
}

export interface ShortcutMatch {
  id: string;
  shortcut: Shortcut;
}

export interface ShortcutConflict {
  keys: string;
  scope: string;
  ids: readonly [string, string];
}

export interface ShortcutRegistryOptions {
  platform?: ShortcutPlatform;
  sequenceTimeoutMs?: number;
  now?: () => number;
}

export interface ShortcutRegistry {
  register(shortcut: Shortcut): () => void;
  remove(id: string): boolean;
  get(id: string): Shortcut | undefined;
  all(): readonly Shortcut[];
  handle(event: KeyEventLike, context?: ShortcutContext): ShortcutMatch | null;
  pending(): string | null;
  clearPending(): void;
  findConflicts(): readonly ShortcutConflict[];
  reset(): void;
}

interface Combo {
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

interface ParsedShortcut {
  steps: Combo[];
  canonical: string;
}

interface PendingChord {
  shortcut: Shortcut;
  parsed: ParsedShortcut;
  index: number;
  expiresAt: number;
}

const MODIFIER_ORDER = ["ctrl", "meta", "alt", "shift"] as const;

function normalizeKey(key: string): string {
  const lower = key.toLowerCase();
  switch (lower) {
    case " ":
    case "spacebar":
      return "space";
    case "esc":
      return "escape";
    case "del":
      return "delete";
    case "return":
      return "enter";
    case "control":
      return "ctrl";
    case "cmd":
    case "command":
      return "meta";
    case "option":
      return "alt";
    case "up":
      return "arrowup";
    case "down":
      return "arrowdown";
    case "left":
      return "arrowleft";
    case "right":
      return "arrowright";
    default:
      return lower;
  }
}

function parseCombo(spec: string, platform: ShortcutPlatform): Combo {
  const tokens = spec
    .trim()
    .toLowerCase()
    .split("+")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  if (tokens.length === 0) {
    throw new Error("shortcut contains an empty key combination");
  }
  const keyToken = tokens.pop()!;
  const key = normalizeKey(keyToken);
  if (["ctrl", "meta", "alt", "shift", "mod"].includes(key)) {
    throw new Error(`shortcut is missing a key: ${spec}`);
  }
  const combo: Combo = { ctrl: false, meta: false, alt: false, shift: false, key };
  for (const token of tokens) {
    switch (token) {
      case "ctrl":
      case "control":
        combo.ctrl = true;
        break;
      case "meta":
      case "cmd":
      case "command":
        combo.meta = true;
        break;
      case "alt":
      case "option":
        combo.alt = true;
        break;
      case "shift":
        combo.shift = true;
        break;
      case "mod":
        if (platform === "mac") {
          combo.meta = true;
        } else {
          combo.ctrl = true;
        }
        break;
      default:
        throw new Error(`unknown modifier: ${token}`);
    }
  }
  return combo;
}

function canonicalCombo(combo: Combo): string {
  const parts: string[] = [];
  for (const modifier of MODIFIER_ORDER) {
    if (combo[modifier]) {
      parts.push(modifier);
    }
  }
  parts.push(combo.key);
  return parts.join("+");
}

function parseShortcut(spec: string, platform: ShortcutPlatform): ParsedShortcut {
  const parts = spec.trim().split(/\s+/).filter((part) => part.length > 0);
  if (parts.length === 0) {
    throw new Error("shortcut keys must not be empty");
  }
  const steps = parts.map((part) => parseCombo(part, platform));
  return { steps, canonical: steps.map(canonicalCombo).join(" ") };
}

function combosEqual(a: Combo, b: Combo): boolean {
  return canonicalCombo(a) === canonicalCombo(b);
}

function eventCombo(event: KeyEventLike): Combo {
  return {
    ctrl: event.ctrlKey === true,
    meta: event.metaKey === true,
    alt: event.altKey === true,
    shift: event.shiftKey === true,
    key: normalizeKey(event.key),
  };
}

export function createShortcutRegistry(options: ShortcutRegistryOptions = {}): ShortcutRegistry {
  const platform = options.platform ?? "other";
  if (platform !== "mac" && platform !== "other") {
    throw new RangeError("platform must be mac or other");
  }
  const sequenceTimeoutMs = options.sequenceTimeoutMs ?? 1_000;
  if (!Number.isFinite(sequenceTimeoutMs) || sequenceTimeoutMs <= 0) {
    throw new RangeError("sequenceTimeoutMs must be a positive number");
  }
  const now = options.now ?? (() => Date.now());

  const registered: Array<{ shortcut: Shortcut; parsed: ParsedShortcut }> = [];
  let pendingChord: PendingChord | null = null;

  function clearPending(): void {
    pendingChord = null;
  }

  function eligible(
    shortcut: Shortcut,
    context: ShortcutContext,
  ): boolean {
    if (context.editable === true && shortcut.allowInInput !== true) {
      return false;
    }
    if (shortcut.scope !== undefined && shortcut.scope !== context.scope) {
      return false;
    }
    if (shortcut.when !== undefined) {
      try {
        if (!shortcut.when()) {
          return false;
        }
      } catch {
        return false;
      }
    }
    return true;
  }

  function findSingle(combo: Combo, context: ShortcutContext): { shortcut: Shortcut; parsed: ParsedShortcut } | null {
    for (const entry of registered) {
      if (entry.parsed.steps.length !== 1) {
        continue;
      }
      if (combosEqual(entry.parsed.steps[0]!, combo) && eligible(entry.shortcut, context)) {
        return entry;
      }
    }
    return null;
  }

  function findSequenceStart(combo: Combo, context: ShortcutContext): { shortcut: Shortcut; parsed: ParsedShortcut } | null {
    for (const entry of registered) {
      if (entry.parsed.steps.length < 2) {
        continue;
      }
      if (combosEqual(entry.parsed.steps[0]!, combo) && eligible(entry.shortcut, context)) {
        return entry;
      }
    }
    return null;
  }

  function register(shortcut: Shortcut): () => void {
    if (typeof shortcut.id !== "string" || shortcut.id.trim().length === 0) {
      throw new TypeError("shortcut id must be a non-empty string");
    }
    if (registered.some((entry) => entry.shortcut.id === shortcut.id)) {
      throw new Error(`shortcut id already registered: ${shortcut.id}`);
    }
    if (typeof shortcut.description !== "string" || shortcut.description.trim().length === 0) {
      throw new TypeError("shortcut description must be a non-empty string");
    }
    const parsed = parseShortcut(shortcut.keys, platform);
    registered.push({ shortcut, parsed });
    return () => {
      remove(shortcut.id);
    };
  }

  function remove(id: string): boolean {
    const index = registered.findIndex((entry) => entry.shortcut.id === id);
    if (index < 0) {
      return false;
    }
    registered.splice(index, 1);
    if (pendingChord?.shortcut.id === id) {
      clearPending();
    }
    return true;
  }

  function handle(event: KeyEventLike, context: ShortcutContext = {}): ShortcutMatch | null {
    const combo = eventCombo(event);
    const currentTime = now();

    if (pendingChord !== null) {
      if (currentTime > pendingChord.expiresAt) {
        clearPending();
      } else if (context.editable === true && pendingChord.shortcut.allowInInput !== true) {
        clearPending();
      } else {
        const expected = pendingChord.parsed.steps[pendingChord.index];
        if (expected !== undefined && combosEqual(expected, combo)) {
          const shortcut = pendingChord.shortcut;
          const nextIndex = pendingChord.index + 1;
          if (nextIndex === pendingChord.parsed.steps.length) {
            clearPending();
            return { id: shortcut.id, shortcut };
          }
          pendingChord.index = nextIndex;
          pendingChord.expiresAt = currentTime + sequenceTimeoutMs;
          return null;
        }
        clearPending();
      }
    }

    const single = findSingle(combo, context);
    if (single !== null) {
      return { id: single.shortcut.id, shortcut: single.shortcut };
    }

    const sequence = findSequenceStart(combo, context);
    if (sequence !== null) {
      pendingChord = {
        shortcut: sequence.shortcut,
        parsed: sequence.parsed,
        index: 1,
        expiresAt: currentTime + sequenceTimeoutMs,
      };
      return null;
    }

    return null;
  }

  function findConflicts(): readonly ShortcutConflict[] {
    const conflicts: ShortcutConflict[] = [];
    for (let first = 0; first < registered.length; first += 1) {
      for (let second = first + 1; second < registered.length; second += 1) {
        const a = registered[first]!;
        const b = registered[second]!;
        if (a.parsed.canonical !== b.parsed.canonical) {
          continue;
        }
        const scopeA = a.shortcut.scope ?? "*";
        const scopeB = b.shortcut.scope ?? "*";
        if (scopeA !== scopeB) {
          continue;
        }
        conflicts.push({
          keys: a.shortcut.keys,
          scope: scopeA,
          ids: [a.shortcut.id, b.shortcut.id],
        });
      }
    }
    return conflicts;
  }

  function reset(): void {
    registered.length = 0;
    clearPending();
  }

  return {
    register,
    remove,
    get: (id) => registered.find((entry) => entry.shortcut.id === id)?.shortcut,
    all: () => registered.map((entry) => entry.shortcut),
    handle,
    pending: () => pendingChord?.shortcut.keys ?? null,
    clearPending,
    findConflicts,
    reset,
  };
}
