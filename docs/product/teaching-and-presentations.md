# Teaching and Presentations

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm's presentation and teaching features let users deliver live visual lectures, run follow-along sessions, and export polished materials — all without leaving the canvas.

The key personas for this feature area are [Dr. Rajan (Educator)](../vision/user-personas.md#persona-3-dr-rajan--the-educator) and [Maya (Designer)](../vision/user-personas.md#persona-4-maya--the-product-designer).

Priority: **P1** — planned for Phase 2.

---

## Presentation Mode

Presentation mode hides all application UI chrome and shows only the canvas content, giving a clean, distraction-free view suitable for projectors, screen sharing, and recording.

### Entering Presentation Mode

- Toolbar button: **Present** (play icon).
- Keyboard shortcut: `Ctrl+Shift+P`.
- Available in all workspace types.

### What Is Hidden in Presentation Mode

| Element | Hidden? |
|---------|---------|
| Top navigation bar | Yes |
| Left tool panel | Yes |
| Right properties panel | Yes |
| Bottom status bar | Minimized to tiny control strip |
| Collaborator cursor labels | No (remain visible) |
| Share / collaboration controls | Hidden |

### Minimal Control Strip

A thin strip at the bottom of the screen (auto-hides on inactivity, reappears on mouse hover) shows:
```
[⬅ Prev Frame]  [Frame 3 / 7]  [Next Frame ➡]  [Exit Presentation]  [Follow-Presenter: ON]
```

### Keyboard Navigation in Presentation Mode

| Key | Action |
|-----|--------|
| → or Space | Next frame |
| ← | Previous frame |
| Esc | Exit presentation mode |
| F | Fit all objects in view |
| 0 | Zoom to 100% |
| L (hold) | Laser pointer |

---

## Frame-Based Navigation (Slides)

Frames created with the [Frame Tool](canvas-tools.md#frame-tool--f) act as slides during presentation mode.

### Frame Behavior

- Frames are ordered by their position on the canvas: left-to-right, top-to-bottom.
- Users can reorder frames manually by dragging them in the Frames Panel (right sidebar).
- Each frame has a name visible in the Frames Panel.
- Navigating to a frame pans and zooms the canvas so the frame fills the viewport.
- Transition animation: smooth pan+zoom (configurable: instant or 400 ms ease).

### Frames Panel

The Frames Panel (accessible via the sidebar when outside presentation mode) shows:
- Thumbnail of each frame's content.
- Frame name (editable inline).
- Frame number in the sequence.
- Drag handle for reordering.
- Eye icon to include/exclude frame from the presentation sequence.

---

## Follow-Presenter Mode

Follow-presenter mode lets a presenter control what all connected viewers see. It is designed for live lectures, team demos, and classroom sessions.

### How It Works

1. **Presenter enables Follow-Presenter mode** via the collaboration panel: "Start Presentation."
2. **A sharing link is generated** that includes `?mode=follow` in the URL.
3. **Followers open the link.** They join the board in "follow" mode.
4. **Presenter's viewport is mirrored** to all followers' screens in real time (< 200 ms latency target).
5. **Followers can temporarily break free** by scrolling or clicking "View Freely." They re-sync when they click "Follow Again."

### What Followers See

- The canvas exactly as the presenter sees it — same zoom, same pan position.
- The presenter's cursor (shown as a named cursor with a distinctive presenter color).
- If the presenter is drawing, annotations appear on followers' screens in real time.
- If the presenter steps through an algorithm, followers see each step.

### Presenter View Extras

When follow-presenter mode is active, the presenter sees:
- A follower count badge: "👥 18 following."
- A warning if follower latency exceeds 500 ms.
- Option to take a "snapshot" — saves the current canvas state as a read-only link for followers to keep after the session.

---

## Laser Pointer

The laser pointer is an ephemeral highlight tool — it draws attention to an area without leaving permanent marks.

**Activation:** Hold the `L` key.  
**Appearance:** A glowing red dot (16–24 px) that follows the cursor.  
**Visibility:** Visible to all collaborators and followers in real time.  
**Persistence:** Not saved to the canvas document. Fades 2 seconds after the key is released.  
**In follow-presenter mode:** The presenter's laser pointer is displayed prominently on all follower screens.

---

## Timer

A session timer can be displayed as an overlay in the corner of the canvas (presentation mode only).

**Features:**
- Countdown or count-up modes.
- Visible to all collaborators.
- Warning color change at last 5 minutes.
- Start, pause, reset controls.

Useful for timed exercises ("You have 5 minutes to annotate this diagram with your team").

---

## Voting Dots

Voting dots are a real-time dot-voting mechanism for retrospectives and prioritization exercises.

**How it works:**
1. Presenter enables dot voting mode.
2. Each participant gets a configurable number of dots (default: 5).
3. Participants click anywhere on the canvas (or on sticky notes) to place a dot.
4. Results aggregate in real time — dots stack visually.
5. Presenter ends voting; results are preserved as annotations.

---

## Export for Teaching

### Export as PDF

**What it exports:** Each named frame is one PDF page.  
**Quality:** Vector rendering where possible (text, shapes, connectors as PDF paths). Raster fallback for images and complex canvas operations.  
**Page size:** A4 or Letter (configurable).  
**Filename:** Board name + date.

**Trigger:** File → Export → PDF.

### Export as PNG

**What it exports:** Current viewport or all objects (configurable).  
**Resolution:** 1x, 2x, or 4x (for print quality).  
**Background:** White or transparent.

### Export as SVG

**What it exports:** All visible canvas objects (excluding 3D workspace, which exports as PNG).  
**Use case:** Embedding in course materials, blog posts, or presentations.

---

## Board Templates for Teaching

Codrawithm ships with a set of teaching-specific board templates:

| Template | Description |
|---------|-------------|
| Blank Lecture Canvas | Empty canvas with two example frames |
| Algorithm Lecture (Sort) | Pre-configured sorting visualization + explanation frames |
| Algorithm Lecture (Graph) | BFS/DFS frames with a sample graph |
| System Design Review | Architecture diagram frame + Q&A sticky note section |
| Retrospective | 3-column sticky note board (What went well / What didn't / Actions) |

Templates are created via **New Board → From Template**.

---

## Accessibility in Presentation Mode

- All annotation text must have sufficient contrast against the canvas background.
- Laser pointer is supplemented with a visible ring (not just color) for color-blind accessibility.
- Keyboard navigation works fully in presentation mode without a mouse.
- Screen reader: frame transitions announce the frame name via `aria-live`.

---

## Related Documents

- [Collaboration](collaboration.md)
- [Canvas Tools — Frame Tool](canvas-tools.md#frame-tool--f)
- [Algorithm Visualization](algorithm-visualization.md)
- [Feature Catalog — PRESENT](../vision/feature-catalog.md#presentation--teaching-present)
