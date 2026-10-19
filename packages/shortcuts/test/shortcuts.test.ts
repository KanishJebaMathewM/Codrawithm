import { describe, expect, it, vi } from "vitest";
import { createShortcutRegistry, type Shortcut } from "../src/index.js";

function shortcut(id: string, keys: string, overrides: Partial<Shortcut> = {}): Shortcut {
  return { id, keys, description: id, ...overrides };
}

function press(key: string, modifiers: Partial<{ ctrl: boolean; meta: boolean; alt: boolean; shift: boolean }> = {}) {
  return {
    key,
    ctrlKey: modifiers.ctrl ?? false,
    metaKey: modifiers.meta ?? false,
    altKey: modifiers.alt ?? false,
    shiftKey: modifiers.shift ?? false,
  };
}

describe("modifier matching", () => {
  it("maps mod to control on other platforms", () => {
    const registry = createShortcutRegistry({ platform: "other" });
    registry.register(shortcut("undo", "mod+z"));
    expect(registry.handle(press("z", { ctrl: true }))?.id).toBe("undo");
    expect(registry.handle(press("z", { meta: true }))).toBeNull();
  });

  it("maps mod to meta on macOS", () => {
    const registry = createShortcutRegistry({ platform: "mac" });
    registry.register(shortcut("undo", "mod+z"));
    expect(registry.handle(press("z", { meta: true }))?.id).toBe("undo");
    expect(registry.handle(press("z", { ctrl: true }))).toBeNull();
  });

  it("requires exact modifiers", () => {
    const registry = createShortcutRegistry({ platform: "other" });
    registry.register(shortcut("redo", "ctrl+shift+z"));
    expect(registry.handle(press("z", { ctrl: true, shift: true }))?.id).toBe("redo");
    expect(registry.handle(press("z", { ctrl: true }))).toBeNull();
  });

  it("is case insensitive and normalises aliases", () => {
    const registry = createShortcutRegistry({ platform: "other" });
    registry.register(shortcut("escape", "ESC"));
    registry.register(shortcut("jump", "Space"));
    registry.register(shortcut("enter", "return"));
    expect(registry.handle(press("Escape"))?.id).toBe("escape");
    expect(registry.handle(press(" "))?.id).toBe("jump");
    expect(registry.handle(press("Enter"))?.id).toBe("enter");
  });

  it("does not treat a modifier key as a shortcut key", () => {
    const registry = createShortcutRegistry();
    expect(() => registry.register(shortcut("bad", "ctrl+shift"))).toThrow("missing a key");
    expect(() => registry.register(shortcut("bad", ""))).toThrow();
    expect(() => registry.register(shortcut("bad", "hyper+z"))).toThrow("unknown modifier");
  });
});

describe("scopes and guards", () => {
  it("limits scoped bindings to the active scope while keeping globals", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("undo", "ctrl+z"));
    registry.register(shortcut("delete", "delete", { scope: "canvas" }));
    expect(registry.handle(press("delete"), { scope: "canvas" })?.id).toBe("delete");
    expect(registry.handle(press("delete"), { scope: "panel" })).toBeNull();
    expect(registry.handle(press("z", { ctrl: true }), { scope: "panel" })?.id).toBe("undo");
  });

  it("ignores bindings while an input is focused unless allowed", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("tool", "v"));
    registry.register(shortcut("save", "ctrl+s", { allowInInput: true }));
    expect(registry.handle(press("v"), { editable: true })).toBeNull();
    expect(registry.handle(press("s", { ctrl: true }), { editable: true })?.id).toBe("save");
  });

  it("honours a when predicate and treats a throw as false", () => {
    const registry = createShortcutRegistry();
    let enabled = false;
    registry.register(shortcut("duplicate", "ctrl+d", { when: () => enabled }));
    expect(registry.handle(press("d", { ctrl: true }))).toBeNull();
    enabled = true;
    expect(registry.handle(press("d", { ctrl: true }))?.id).toBe("duplicate");
    registry.register(shortcut("broken", "ctrl+b", { when: () => { throw new Error("no"); } }));
    expect(registry.handle(press("b", { ctrl: true }))).toBeNull();
  });

  it("returns the first matching registration", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("first", "ctrl+k"));
    registry.register(shortcut("second", "ctrl+k"));
    expect(registry.handle(press("k", { ctrl: true }))?.id).toBe("first");
  });
});

describe("chords", () => {
  it("arms and completes a two-key chord", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("group", "g g", { scope: "canvas" }));
    expect(registry.handle(press("g"), { scope: "canvas" })).toBeNull();
    expect(registry.pending()).toBe("g g");
    expect(registry.handle(press("g"), { scope: "canvas" })?.id).toBe("group");
    expect(registry.pending()).toBeNull();
  });

  it("expires an armed chord", () => {
    let clock = 0;
    const registry = createShortcutRegistry({ now: () => clock, sequenceTimeoutMs: 500 });
    registry.register(shortcut("group", "g i"));
    registry.handle(press("g"));
    clock = 600;
    expect(registry.handle(press("i"))).toBeNull();
    expect(registry.pending()).toBeNull();
  });

  it("retries a mismatched second key as a fresh shortcut", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("group", "g i"));
    registry.register(shortcut("undo", "u"));
    registry.handle(press("g"));
    expect(registry.handle(press("u"))?.id).toBe("undo");
    expect(registry.pending()).toBeNull();
  });

  it("clears a pending chord on demand", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("group", "g i"));
    registry.handle(press("g"));
    registry.clearPending();
    expect(registry.pending()).toBeNull();
  });

  it("prefers a single-key binding over a conflicting chord prefix", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("single", "g"));
    registry.register(shortcut("group", "g i"));
    expect(registry.handle(press("g"))?.id).toBe("single");
    expect(registry.pending()).toBeNull();
  });
});

describe("registry management", () => {
  it("unregisters by returned function and by id", () => {
    const registry = createShortcutRegistry();
    const off = registry.register(shortcut("one", "1"));
    registry.register(shortcut("two", "2"));
    off();
    expect(registry.get("one")).toBeUndefined();
    expect(registry.handle(press("1"))).toBeNull();
    expect(registry.remove("two")).toBe(true);
    expect(registry.remove("two")).toBe(false);
  });

  it("rejects duplicate ids and empty descriptions", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("one", "1"));
    expect(() => registry.register(shortcut("one", "2"))).toThrow("already registered");
    expect(() => registry.register(shortcut("two", "2", { description: " " }))).toThrow(TypeError);
  });

  it("reports conflicts within the same scope only", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("a", "ctrl+k"));
    registry.register(shortcut("b", "ctrl+k"));
    registry.register(shortcut("c", "ctrl+k", { scope: "canvas" }));
    registry.register(shortcut("d", "mod+k", { scope: "canvas" }));
    const conflicts = registry.findConflicts();
    expect(conflicts).toHaveLength(2);
    expect(conflicts[0]).toEqual({ keys: "ctrl+k", scope: "*", ids: ["a", "b"] });
    expect(conflicts[1]).toEqual({ keys: "ctrl+k", scope: "canvas", ids: ["c", "d"] });
  });
});
