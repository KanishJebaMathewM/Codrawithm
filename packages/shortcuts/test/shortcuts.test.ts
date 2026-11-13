import { describe, expect, it } from "vitest";
import {
  createShortcutRegistry,
  type KeyEventLike,
  type Shortcut,
} from "../src/index.js";

function shortcut(id: string, keys: string, overrides: Partial<Shortcut> = {}): Shortcut {
  return { id, keys, description: `Description for ${id}`, ...overrides };
}

function press(
  key: string,
  modifiers: Partial<{ ctrl: boolean; meta: boolean; alt: boolean; shift: boolean }> = {},
): KeyEventLike {
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
    expect(registry.handle(press("z", { ctrl: true, shift: true, alt: true }))).toBeNull();
  });

  it("is case insensitive and normalises aliases", () => {
    const registry = createShortcutRegistry({ platform: "other" });
    registry.register(shortcut("escape", "ESC"));
    registry.register(shortcut("jump", "Space"));
    registry.register(shortcut("enter", "return"));
    registry.register(shortcut("delete", "del"));
    registry.register(shortcut("up", "up"));
    registry.register(shortcut("down", "down"));
    registry.register(shortcut("left", "left"));
    registry.register(shortcut("right", "right"));

    expect(registry.handle(press("Escape"))?.id).toBe("escape");
    expect(registry.handle(press(" "))?.id).toBe("jump");
    expect(registry.handle(press("Spacebar"))?.id).toBe("jump");
    expect(registry.handle(press("Enter"))?.id).toBe("enter");
    expect(registry.handle(press("Delete"))?.id).toBe("delete");
    expect(registry.handle(press("ArrowUp"))?.id).toBe("up");
    expect(registry.handle(press("ArrowDown"))?.id).toBe("down");
    expect(registry.handle(press("ArrowLeft"))?.id).toBe("left");
    expect(registry.handle(press("ArrowRight"))?.id).toBe("right");
  });

  it("supports zoom and symbol shortcuts with plus, minus, and brackets", () => {
    const registry = createShortcutRegistry({ platform: "other" });
    registry.register(shortcut("zoom-in-symbol", "ctrl++"));
    registry.register(shortcut("zoom-in-alias", "mod+plus"));
    registry.register(shortcut("zoom-out", "ctrl+-"));
    registry.register(shortcut("send-back", "ctrl+["));
    registry.register(shortcut("bring-front", "ctrl+]"));

    expect(registry.handle(press("+", { ctrl: true }))?.id).toBe("zoom-in-symbol");
    expect(registry.handle(press("-", { ctrl: true }))?.id).toBe("zoom-out");
    expect(registry.handle(press("[", { ctrl: true }))?.id).toBe("send-back");
    expect(registry.handle(press("]", { ctrl: true }))?.id).toBe("bring-front");
  });

  it("supports modifier aliases cmd, command, control, ctl, option, opt", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("c1", "control+a"));
    registry.register(shortcut("c2", "command+b"));
    registry.register(shortcut("c3", "option+c"));

    expect(registry.handle(press("a", { ctrl: true }))?.id).toBe("c1");
    expect(registry.handle(press("b", { meta: true }))?.id).toBe("c2");
    expect(registry.handle(press("c", { alt: true }))?.id).toBe("c3");
  });

  it("does not treat a modifier key as a shortcut key", () => {
    const registry = createShortcutRegistry();
    expect(() => registry.register(shortcut("bad", "ctrl+shift"))).toThrow("missing a key");
    expect(() => registry.register(shortcut("bad", ""))).toThrow();
    expect(() => registry.register(shortcut("bad", "   "))).toThrow();
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
    expect(registry.handle(press("delete"))).toBeNull();
    expect(registry.handle(press("z", { ctrl: true }), { scope: "panel" })?.id).toBe("undo");
    expect(registry.handle(press("z", { ctrl: true }))?.id).toBe("undo");
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

    registry.register(
      shortcut("broken", "ctrl+b", {
        when: () => {
          throw new Error("unexpected error");
        },
      }),
    );
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

  it("arms multiple chords sharing the same prefix and completes the matching one", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("go-inbox", "g i"));
    registry.register(shortcut("go-group", "g g"));
    registry.register(shortcut("go-settings", "g s"));

    // First key: arms all candidate chords
    expect(registry.handle(press("g"))).toBeNull();
    expect(registry.pending()).toBe("g i");

    // Second key 'g': completes go-group
    expect(registry.handle(press("g"))?.id).toBe("go-group");
    expect(registry.pending()).toBeNull();

    // Re-arm and complete go-settings
    expect(registry.handle(press("g"))).toBeNull();
    expect(registry.handle(press("s"))?.id).toBe("go-settings");
    expect(registry.pending()).toBeNull();
  });

  it("expires an armed chord based on sequenceTimeoutMs", () => {
    let clock = 0;
    const registry = createShortcutRegistry({
      now: () => clock,
      sequenceTimeoutMs: 500,
    });
    registry.register(shortcut("group", "g i"));
    registry.handle(press("g"));
    expect(registry.pending()).toBe("g i");

    // Advance clock past timeout
    clock = 600;
    expect(registry.pending()).toBeNull();
    expect(registry.handle(press("i"))).toBeNull();
    expect(registry.pending()).toBeNull();
  });

  it("retries a mismatched second key as a fresh shortcut", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("group", "g i"));
    registry.register(shortcut("undo", "u"));

    registry.handle(press("g"));
    expect(registry.pending()).toBe("g i");
    expect(registry.handle(press("u"))?.id).toBe("undo");
    expect(registry.pending()).toBeNull();
  });

  it("clears a pending chord on demand", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("group", "g i"));

    registry.handle(press("g"));
    expect(registry.pending()).toBe("g i");
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

  it("re-evaluates scope and input eligibility on chord completion", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("canvas-chord", "g i", { scope: "canvas" }));

    // Armed in canvas scope
    expect(registry.handle(press("g"), { scope: "canvas" })).toBeNull();
    expect(registry.pending()).toBe("g i");

    // Next key arrives in different scope: should not fire canvas shortcut
    expect(registry.handle(press("i"), { scope: "settings" })).toBeNull();
  });
});

describe("registry management and validation", () => {
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

  it("clears pending candidate when that shortcut is removed", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("group", "g i"));
    registry.handle(press("g"));
    expect(registry.pending()).toBe("g i");

    registry.remove("group");
    expect(registry.pending()).toBeNull();
  });

  it("rejects duplicate ids and empty descriptions or keys", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("one", "1"));

    expect(() => registry.register(shortcut("one", "2"))).toThrow("already registered");
    expect(() => registry.register(shortcut("two", "2", { description: " " }))).toThrow(TypeError);
    expect(() => registry.register(shortcut("three", " ", { description: "valid" }))).toThrow();
    expect(() => registry.register(null as unknown as Shortcut)).toThrow(TypeError);
  });

  it("rejects invalid constructor options", () => {
    expect(() =>
      createShortcutRegistry({ platform: "windows" as unknown as "mac" }),
    ).toThrow(RangeError);
    expect(() => createShortcutRegistry({ sequenceTimeoutMs: 0 })).toThrow(RangeError);
    expect(() => createShortcutRegistry({ sequenceTimeoutMs: -100 })).toThrow(RangeError);
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

  it("resets all registrations and clears pending state", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("a", "ctrl+a"));
    registry.register(shortcut("chord", "g i"));
    registry.handle(press("g"));
    expect(registry.pending()).toBe("g i");

    registry.reset();
    expect(registry.all()).toHaveLength(0);
    expect(registry.pending()).toBeNull();
    expect(registry.handle(press("a", { ctrl: true }))).toBeNull();
  });

  it("gracefully handles null or invalid key events", () => {
    const registry = createShortcutRegistry();
    registry.register(shortcut("a", "a"));

    expect(registry.handle(null as unknown as KeyEventLike)).toBeNull();
    expect(registry.handle({} as KeyEventLike)).toBeNull();
  });
});
