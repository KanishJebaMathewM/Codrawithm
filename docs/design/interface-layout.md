# Interface Layout

**Status:** Proposed  
**Audience:** Designers, frontend engineers  
**Last Reviewed:** 2024-01-15

## Overview

Codrawithm's interface is organized into named zones. Each zone has a defined purpose, default visibility, and collapse behaviour. The canvas zone is always primary.

---

## Layout Zones

```
┌─────────────────────────────────────────────────────────────┐
│                        TOP BAR                              │
├──────┬──────────────────────────────────────────┬───────────┤
│      │                                          │           │
│ TOOL │              CANVAS                      │ PROPERTIES│
│ PAL  │                                          │  PANEL    │
│ ETTE │                                          │           │
│      │                                          │           │
│      │                                          │           │
│      │                                          │           │
├──────┴──────────────────────────────────────────┴───────────┤
│                      STATUS BAR                             │
└─────────────────────────────────────────────────────────────┘
```

### Zone Specifications

| Zone | Default Width/Height | Collapsible | Keyboard Toggle |
|------|---------------------|-------------|-----------------|
| Top Bar | 48px height | No | — |
| Tool Palette | 56px width | Yes | `\` |
| Canvas | Remaining space | No (primary) | — |
| Properties Panel | 280px width | Yes | `E` |
| Status Bar | 28px height | Yes | — |
| AI Panel (optional) | 320px width | Yes | `Ctrl+/` |
| Minimap (optional) | 180×120px overlay | Yes | `M` |

---

## Top Bar

The top bar contains global actions and navigation. It stays visible at all times.

**Left section:**
- Codrawithm logo / home link
- Workspace breadcrumb: `[Workspace Name] / [Board Name]`
- Board title (editable inline, click to rename)

**Centre section:**
- Workspace type indicator (e.g. "Whiteboard", "Algorithm Lab")
- Share status indicator (Private / Shared link / Collaborative)

**Right section:**
- Collaborator avatars (up to 5, then "+N more")
- Share button
- Export button (dropdown: PNG, SVG, PDF, JSON)
- User avatar / account menu
- Settings gear

---

## Tool Palette

A vertical strip on the left edge. Organised into logical groups separated by dividers.

**Group 1 — Selection & Navigation**
- `V` — Select / Move
- `H` — Pan (Hand tool)
- `Z` — Zoom

**Group 2 — Drawing**
- `P` — Pen / Freehand
- `L` — Line
- `A` — Arrow
- `C` — Connector (smart routing)

**Group 3 — Shapes**
- `R` — Rectangle
- `O` — Ellipse / Circle
- `D` — Diamond
- More shapes via long-press or shape picker overlay

**Group 4 — Content**
- `T` — Text box
- `S` — Sticky note
- `I` — Image / media embed
- `F` — Frame / section

**Group 5 — Annotations**
- Highlighter
- Laser pointer (ephemeral, collaboration mode)
- Eraser

**Group 6 — Workspace-Specific Tools**
- Shown only when relevant workspace type is active
- Example: Graph node tool in Algorithm Lab
- Example: 3D object tool in 3D Workspace

**Bottom of Palette:**
- Color swatch (current stroke + fill)
- Stroke width indicator

---

## Canvas Zone

The central, primary zone. Occupies all remaining space after other panels.

**Canvas Overlay Elements (non-blocking):**
- Ruler (top and left edges, toggleable)
- Grid/dot overlay (behind objects)
- Minimap (bottom-right corner, toggleable)
- Zoom level indicator (bottom-left)
- Selection bounds and handles (appear on selection)
- Collaborator cursors and labels (real-time)

**Canvas Context Menu (right-click on canvas):**
- Paste
- Select All
- Paste in Place
- Add Frame
- Set Background
- Board Settings

**Object Context Menu (right-click on selected object):**
- Cut / Copy / Paste / Duplicate
- Group / Ungroup
- Lock / Unlock
- Bring Forward / Send Backward / Bring to Front / Send to Back
- Edit Style
- Add Link
- Delete

---

## Properties Panel

Right-side panel. Content is entirely driven by the current selection.

**No selection (canvas selected):**
- Board name
- Background style
- Grid settings
- Board dimensions (if fixed)

**Single object selected:**
- Position (X, Y)
- Size (W, H) with aspect-ratio lock toggle
- Rotation
- Style section (fill color, stroke color, stroke width, opacity)
- Text section (if object has text: font, size, weight, alignment)
- Layer section (z-index, group membership)
- Object-type-specific properties (e.g. connector routing for arrows)

**Multiple objects selected:**
- Alignment tools (align left, center, right, top, middle, bottom)
- Distribution tools (horizontal, vertical)
- Group action
- Shared style overrides

**Algorithm node selected (Algorithm Lab workspace):**
- Node value
- Node state (visited, active, queued)
- Edge weight (if applicable)
- Animation step indicator

---

## Status Bar

A thin bar at the bottom showing contextual information.

**Left:**
- Current tool name
- Selection summary (e.g. "3 objects selected")

**Centre:**
- Autosave status ("Saved", "Saving...", "Unsaved changes")

**Right:**
- Zoom controls (− level +, fit-to-content button)
- Cursor coordinates (X, Y on canvas)

---

## AI Panel (Optional, Collapsible)

Slides in from the right, overlapping the properties panel when open.

**Contents:**
- Prompt input field
- Recent AI actions history
- Provider indicator
- Usage quota indicator
- Generated result preview (before inserting to canvas)

Triggered by: `Ctrl+/`, or clicking the AI wand icon in the top bar.

---

## Minimap

A small overview of the full canvas in the bottom-right corner.

- Shows all objects at reduced scale
- Highlights the current viewport as a rectangle
- Click or drag the viewport rectangle to pan
- Toggle with `M`
- Auto-hides on very small screens

---

## Responsive Behaviour

| Viewport Width | Behaviour |
|---------------|-----------|
| > 1280px | Full layout, all panels available |
| 1024–1280px | Properties panel collapses by default |
| 768–1024px | Tool palette collapses to icon strip; properties panel hidden |
| < 768px | Mobile layout: bottom tool tray, no properties panel, canvas full-screen |

**Mobile / Touch:**
- Bottom tool tray replaces left palette
- Long-press on canvas opens context menu
- Pinch-to-zoom and two-finger pan
- Properties accessible via floating action button

---

## Related Documents

- [Design Principles](./design-principles.md)
- [Workspace Navigation](./workspace-navigation.md)
- [Interaction Patterns](./interaction-patterns.md)
- [Keyboard Shortcuts](./keyboard-shortcuts.md)
- [Canvas Tools](../product/canvas-tools.md)
