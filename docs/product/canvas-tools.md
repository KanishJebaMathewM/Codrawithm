# Canvas Tools

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document specifies every drawing and annotation tool available on the Codrawithm canvas. Tools are grouped by category. Each entry includes purpose, activation method, behavior, and state properties.

---

## Tool Architecture

All canvas tools implement a common interface:

```typescript
interface CanvasTool {
  id: string;
  name: string;
  shortcut: string | null;
  cursor: CursorType;
  onPointerDown(event: CanvasPointerEvent, state: CanvasState): void;
  onPointerMove(event: CanvasPointerEvent, state: CanvasState): void;
  onPointerUp(event: CanvasPointerEvent, state: CanvasState): void;
  onKeyDown?(event: KeyboardEvent, state: CanvasState): void;
}
```

The active tool is stored in the canvas store. All tool interactions dispatch mutations through the CRDT-backed canvas document.

---

## Selection Tools

### Select Tool — `V` or `Escape`
- Click object to select; shows resize handles, rotation handle, bounding box.
- Click empty canvas to deselect.
- Shift+Click adds to selection.
- Drag on empty canvas starts marquee selection.
- Drag selected object to move. Snap to grid if enabled.
- Drag resize handles to resize (Shift = constrain aspect ratio; Alt = resize from center).
- Drag rotation handle (above top edge) to rotate.
- Multi-select: combined bounding box; drag to move all; resize scales proportionally; Delete removes all.

### Direct Select Tool — `A`
- Selects individual vertices within a path or individual cells within a connector.
- Used for editing bezier handles on freehand paths and adjusting connector waypoints.

---

## Shape Tools

### Rectangle Tool — `R`
Crosshair cursor. Click-drag to define. Shift = square. Alt = from center. Commits on pointer-up and enters label edit mode.

```typescript
interface RectangleObject {
  type: "rectangle";
  x: number; y: number; width: number; height: number;
  borderRadius: number;
  fill: Color; stroke: Color; strokeWidth: number;
  label: TextContent; rotation: number;
}
```

### Ellipse Tool — `O`
Same as Rectangle. Shift = circle.

### Diamond Tool — `D`
Draws a diamond (rotated square). Used for decision nodes in flowcharts.

### Line Tool — `L`
Click start, click end. Shift constrains to 45° increments. Produces `LineObject` (no arrowheads by default).

### Arrow Tool — toolbar button
Same as Line, but end point has an arrowhead by default. Double-click on connector creates a waypoint. Start/end snaps to shape connection ports. Re-routes when connected shapes move.

```typescript
interface ArrowObject {
  type: "arrow";
  startPoint: Point | ShapeRef; endPoint: Point | ShapeRef;
  waypoints: Point[];
  routingStyle: "straight" | "orthogonal" | "curved";
  startArrowhead: ArrowheadStyle; endArrowhead: ArrowheadStyle;
  label: TextContent | null;
  stroke: Color; strokeWidth: number;
}
```

Arrowhead styles: `none`, `open`, `filled`, `diamond`, `circle`, `double`.

### Connector Tool — `X`
Like Arrow but specifically for connecting shapes. Hover over a shape to see connection ports highlight at N, S, E, W edges and corners. Connectors maintain their connection when shapes are moved. Routing: `straight`, `orthogonal`, or `curved`.

---

## Drawing Tools

### Freehand Pen Tool — `P`
Pointer-down begins a path; pointer-up commits. Applies bezier smoothing to reduce noise. Supports pressure sensitivity via `PointerEvent.pressure` (stylus users).

### Marker Tool — `M`
Same as freehand but with thick, semi-transparent stroke (simulates highlighter). Default opacity: 50%.

### Eraser Tool — `E`
Pointer-drag erases freehand strokes it passes over. Does not erase shapes or connectors. Configurable eraser size.

---

## Text Tools

### Text Tool — `T`
Click on empty canvas places a standalone text object and immediately enters edit mode. Double-click existing text to edit. Supports: **bold** (Ctrl+B), *italic* (Ctrl+I), `code` (backtick). Text wraps at the object boundary. Font family, size, weight, color configurable from properties panel.

### Code Block Tool — toolbar button
Places a code block object. Language selector dropdown (20+ languages via Shiki). Monospace font, syntax-highlighted. Read-only on canvas; double-click opens modal code editor. Copy button in top-right corner.

---

## Annotation Tools

### Sticky Note Tool — `N`
Click to place a sticky note. Six color options: yellow, green, blue, pink, orange, purple. Markdown text inside (bold, italic, bullets, links). Auto-size to content; fixed width.

### Comment Tool — right-click context menu
Attaches a comment thread to a specific canvas object or a canvas point. Comment threads show avatars, timestamps, resolved/unresolved status. Unresolved comments show a badge on the object.

### Laser Pointer — hold `L`
Glowing dot follows cursor while held. Visible to all collaborators in real time. Ephemeral — not persisted to canvas document. Fades out 2 seconds after key release.

---

## Media Tools

### Image Embed Tool — toolbar or drag-drop
Drag-and-drop image files (PNG, JPG, GIF, WebP, SVG). Paste from clipboard (Ctrl+V). URL embed dialog for external images. Resize handles; Shift to constrain aspect ratio. Alt text field for accessibility. Maximum upload size: 20 MB (validated by backend).

### Frame Tool — `F`
Click-drag to define a named frame (rectangular region). Frames appear in the frame panel as a list of named sections. Objects placed inside a frame move with the frame. Frames act as slides in presentation mode. Objects can overflow by default (not a clipping region).

---

## Utility Tools

### Hand Tool (Pan) — `H` or hold `Space`
Drag to pan the canvas. Space held = temporary switch to Hand Tool; releasing space restores the previous tool.

### Zoom Tool — `Z`
Click to zoom in. Alt+Click to zoom out. Drag a rectangle to zoom to that region. Zoom controls also in the bottom toolbar (percentage display, zoom-in, zoom-out, zoom-to-fit).

---

## Tool Settings Panel

All tools show a settings panel when active. Common settings:

| Setting | Applies To | Options |
|---------|-----------|---------|
| Fill color | Shapes | Color picker, none (transparent) |
| Stroke color | All drawing | Color picker |
| Stroke width | All drawing | 1px, 2px, 4px, 8px, custom |
| Stroke style | All drawing | Solid, dashed, dotted |
| Opacity | All objects | 0–100% |
| Font family | Text | sans, mono, serif |
| Font size | Text | 10–96 px |
| Text align | Text | Left, center, right, justify |

---

## Related Documents

- [Interaction Patterns](../design/interaction-patterns.md)
- [Keyboard Shortcuts](../design/keyboard-shortcuts.md)
- [Workspace Types](workspace-types.md)
- [Canvas Engine](../architecture/canvas-engine.md)
