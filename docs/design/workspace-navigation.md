# Workspace Navigation

**Status:** Proposed  
**Audience:** Designers, frontend engineers  
**Last Reviewed:** 2024-01-15

## Overview

Navigation in Codrawithm operates at two levels: between workspaces/boards (macro navigation) and within the canvas (micro navigation). Both must feel fast and disorienting-free.

---

## Macro Navigation — Between Boards

### Dashboard

The entry point after login. Shows:
- Recent boards (grid or list view, toggleable)
- Starred / pinned boards
- Boards shared with me
- Workspace folders
- New board button (prominent, top-right)
- Workspace type filter tabs: All / Whiteboard / Algorithm Lab / 3D / etc.

### Board Creation Flow

1. Click "New Board"
2. Choose workspace type (or blank)
3. Optionally select a template
4. Board opens immediately — name can be set later

### Workspace Switcher

The workspace type can be switched after creation from a dropdown in the Top Bar centre section.

Switching workspace type:
- Preserves all existing objects
- Loads the specialist tool palette and properties for the new type
- May show a confirmation if the switch removes incompatible tools from the UI

### Board URL Structure

```
/board/{boardId}                    — default view
/board/{boardId}/page/{pageId}      — specific page
/board/{boardId}?share={token}      — shared link view
/board/{boardId}/present            — presentation mode
```

---

## Micro Navigation — Within the Canvas

### Pan

| Method | Action |
|--------|--------|
| Middle mouse button drag | Pan |
| Space + left mouse drag | Pan (temporary hand tool) |
| H key (hand tool active) + drag | Pan |
| Two-finger trackpad drag | Pan |
| Scroll wheel (vertical) | Pan vertically |
| Shift + scroll wheel | Pan horizontally |

### Zoom

| Method | Action |
|--------|--------|
| Ctrl/Cmd + scroll wheel | Zoom in/out at cursor |
| Ctrl/Cmd + `+` / `-` | Zoom in/out at centre |
| Ctrl/Cmd + `0` | Reset to 100% |
| Ctrl/Cmd + `1` | Fit all objects in view |
| Ctrl/Cmd + `2` | Fit selection in view |
| Pinch gesture (trackpad/touch) | Zoom in/out |
| Z key (zoom tool active) + click | Zoom in at click point |
| Z key + Alt + click | Zoom out |

**Zoom Range:** 5% – 3200% (hard limits to prevent disorientation)

### Viewport Reset

- `Ctrl/Cmd + Shift + H` — Fit all content in view
- `Ctrl/Cmd + 0` — Return to 100% zoom at origin
- Double-click minimap — Fit all in view

---

## Multi-Page Navigation

Boards can have multiple pages (similar to slides or artboards).

**Page Panel:**
- Located at the bottom of the screen (toggleable)
- Shows page thumbnails in order
- Drag to reorder
- Right-click for: rename, duplicate, delete, move to position

**Page Navigation:**
- `Ctrl/Cmd + Page Up/Down` — Previous/next page
- Click thumbnail to jump to page
- Pages maintain independent viewport state (zoom/pan position remembered per page)

---

## Presentation Mode

Activated via `Ctrl/Cmd + Shift + P` or the Present button in the top bar.

In presentation mode:
- UI chrome hides completely
- Frames on the current board become "slides"
- Navigation: arrow keys or click to advance
- Laser pointer available (`L`)
- Exit: `Esc`
- Viewer link shows presentation mode by default for read-only shares

See [Teaching and Presentations](../product/teaching-and-presentations.md) for full specification.

---

## Minimap

A compact overview panel (default: bottom-right, 180×120px).

**Behaviour:**
- Renders a scaled-down view of all objects
- Current viewport shown as a semi-transparent rectangle
- Click anywhere on minimap to centre viewport on that point
- Drag the viewport rectangle to pan
- Toggle: `M` key or minimap toggle in status bar
- Auto-hides on screens narrower than 768px

---

## Object Focus and Navigation

Keyboard navigation within the canvas for accessibility:

- `Tab` — Select next object (z-order)
- `Shift + Tab` — Select previous object
- Arrow keys (object selected) — Move object 1px (or snap increment)
- Arrow keys (no selection) — Pan canvas
- `Enter` — Enter text editing mode on selected text object
- `Escape` — Deselect / exit current mode
- `Delete` / `Backspace` — Delete selected objects

---

## History Navigation (Undo/Redo)

- `Ctrl/Cmd + Z` — Undo
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` — Redo
- Undo history: minimum 100 steps
- In collaborative mode: undo affects only the local user's actions

---

## Related Documents

- [Interface Layout](./interface-layout.md)
- [Keyboard Shortcuts](./keyboard-shortcuts.md)
- [Interaction Patterns](./interaction-patterns.md)
- [Teaching and Presentations](../product/teaching-and-presentations.md)
- [Collaboration](../product/collaboration.md)
