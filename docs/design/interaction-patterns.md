# Interaction Patterns

**Status:** Proposed  
**Audience:** Designers, frontend engineers  
**Last Reviewed:** 2024-01-15

## Overview

This document defines the standard interaction patterns used across Codrawithm's canvas. Consistency in these patterns is critical — users should be able to apply knowledge from one context to another without relearning.

---

## Selection

### Single Selection
- Click on any object to select it
- Selection shows a bounding box with 8 resize handles and a rotation handle
- Properties panel updates immediately to reflect the selected object
- Click on empty canvas to deselect

### Multi-Selection
- `Shift + Click` adds or removes an object from the selection
- Drag on empty canvas creates a lasso selection rectangle — all objects fully within (or intersecting, configurable) the rectangle are selected
- `Ctrl/Cmd + A` selects all objects on the current page
- Multi-selection shows a combined bounding box

### Selection Visual Feedback
```
┌─────────────────────────┐   ← Selection box (dashed border, 1.5px, brand color)
│                         │
│    Selected Object      │   ← 8 resize handles (filled white circle, 8px)
│                         │        at corners and edge midpoints
└─────────────────────────┘
           ↑
    Rotation handle (curved arrow, 24px above top edge)
```

### Locked Objects
- Locked objects are selectable but not movable or resizable
- Selection shows a different visual: lock icon overlay
- Properties panel shows a "Locked" badge with unlock button

---

## Drag and Move

### Moving Objects
- Click and drag a selected object to move it
- If multiple objects are selected, they all move together maintaining relative positions
- Movement respects snap settings (grid snap, object snap)
- Visual: cursor changes to `move` (four-arrow)

### Snap Behaviour
- **Grid snap:** Objects snap to the nearest grid intersection (configurable grid size, default 8px)
- **Object snap:** Objects snap to edges, centres, and corners of other objects (when within 6px)
- **Snap indicators:** Dashed lines and small diamonds appear at snap points
- **Override snap:** Hold `Alt/Option` to disable snap temporarily

### Drag From Outside Selection
- Dragging an unselected object automatically selects it before moving
- Starting a drag on empty canvas starts a lasso selection

---

## Resize

### Resize Handles
- 8 handles: 4 corners + 4 edge midpoints
- Drag corner handles to resize freely
- Drag edge midpoint handles to resize in one axis only
- Hold `Shift` to maintain aspect ratio
- Hold `Alt/Option` to resize from the centre

### Minimum Size
- Objects have a minimum size of 8×8px to prevent invisible objects
- Text boxes have a minimum width driven by the minimum font size

### Resize with Keyboard
- Not supported directly (use position/size inputs in the properties panel)

---

## Rotation

- Drag the rotation handle (circle above the top edge of selection) to rotate
- Rotation is relative to the object's centre
- Hold `Shift` to snap rotation to 15° increments
- Current angle shown in properties panel, editable by typing

---

## Object Creation

### Shape / Frame Tools
1. Select tool from palette
2. Click on canvas: creates object at default size (e.g. 100×100px rectangle)
3. Click and drag on canvas: creates object sized to the drawn area
4. After creation, object is immediately selected and editable

### Text Tool
1. Select Text tool (`T`)
2. Click on canvas: creates a text box with auto-expanding width
3. Click and drag: creates a fixed-width text box (wraps to the given width)
4. Immediately enters text edit mode

### Freehand Pen Tool
1. Select Pen tool (`P`)
2. Click and drag to draw a path
3. Release to end the path (open path) or click the start point to close it
4. After completion, path is converted to an object and selected

### Connector Tool
1. Select Connector tool (`C`)
2. Hover over a source object — connection points appear (small circles on edges/corners)
3. Click a connection point to start the connector
4. Hover over a target object — connection points appear
5. Click to complete the connection
6. Connectors remain attached and update when either endpoint object is moved

---

## Text Editing

### Entering Edit Mode
- Double-click a text object to enter edit mode
- Press `Enter` on a selected text object to enter edit mode
- Directly start typing when a text object is selected (auto-enters edit mode)

### Exiting Edit Mode
- `Escape` or `Ctrl/Cmd + Enter` exits edit mode and returns to selection
- Clicking outside the text object exits edit mode
- Empty text objects are deleted on exit

### Text Edit Cursor
- Standard text insertion cursor
- Selection highlight uses brand color at 30% opacity

---

## Context Menus

### Canvas Right-Click
Shows: Paste, Select All, Paste in Place, Add Frame, Set Background, Board Settings

### Object Right-Click  
Shows: Cut, Copy, Paste, Duplicate, Group/Ungroup, Lock/Unlock, Bring to Front, Send to Back, Bring Forward, Send Backward, Edit Style, Add Link, Delete

### Multi-Selection Right-Click
Shows: Cut, Copy, Group, Align submenu, Delete

### Context Menu Behaviour
- Opens at cursor position, shifts if it would overflow the viewport
- Closes on click outside, `Escape`, or after an action
- Keyboard navigable with Arrow keys, `Enter` to activate, `Escape` to close
- Submenus open on hover with 200ms delay or arrow key

---

## Contextual Toolbar

A floating toolbar appears above a selected object. Contains the most common actions for that object type.

**For shapes:**
Fill color swatch | Stroke color swatch | Stroke width | Opacity | Edit text | Link

**For text:**
Font family | Font size | Bold | Italic | Underline | Text color | Alignment

**For connectors:**
Line style | Arrow type | Color | Label

**Positioning:**
- Appears 12px above the selection bounding box
- Shifts down if it would overlap the top bar
- Disappears during active drag/resize

---

## Touch and Stylus Input

### Touch Gestures
| Gesture | Action |
|---------|--------|
| Single tap | Select |
| Double tap | Edit (text), or zoom in (empty canvas) |
| Tap and hold | Context menu |
| Two-finger drag | Pan |
| Pinch | Zoom |
| Single-finger drag (on object) | Move |
| Single-finger drag (on canvas) | Lasso select (when select tool active) |

### Stylus Support
- Stylus pressure maps to pen tool brush size (when pen tool active)
- Stylus hover shows cursor without selecting
- Palm rejection: touches from large areas (palm) ignored when stylus is detected
- Eraser end of stylus activates eraser tool

---

## Drag and Drop

### From File System
- Drag image files (PNG, JPEG, SVG, WebP, GIF) onto canvas to embed them
- Drag SVG files: option to embed as image or import as editable shapes (if supported)
- Drag JSON board files: import and merge with current board

### Within Canvas
- Drag objects between pages using the page panel
- Drag to reorder in the layers panel

---

## Pointer Cursor States

| Context | Cursor |
|---------|--------|
| Default (empty canvas) | `crosshair` |
| Selection tool on empty canvas | `default` |
| Hovering over a selectable object | `pointer` |
| Moving a selected object | `move` |
| Hovering a resize handle | `nw-resize`, `ne-resize`, etc. |
| Hovering a rotation handle | `grab` (curved arrow icon) |
| Dragging rotation | `grabbing` |
| Pan tool | `grab` |
| Panning (active) | `grabbing` |
| Text tool | `text` |
| Pen tool drawing | `crosshair` |
| Eraser tool | Custom eraser circle cursor |

---

## Related Documents

- [Interface Layout](./interface-layout.md)
- [Keyboard Shortcuts](./keyboard-shortcuts.md)
- [Canvas Tools](../product/canvas-tools.md)
- [Design Principles](./design-principles.md)
