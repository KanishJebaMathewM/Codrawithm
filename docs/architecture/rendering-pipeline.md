# Rendering Pipeline

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document evaluates the three main approaches to canvas rendering for a collaborative visual workspace and records the recommended approach with trade-off analysis.

See [ADR-004](architecture-decisions/ADR-004-canvas-rendering-approach.md) for the formal decision record.

---

## Rendering Approaches Compared

### Option 1: DOM + SVG

**How it works:** Each canvas object is a DOM element (typically an SVG element). The browser handles rendering via its layout engine.

**Examples:** tldraw (early versions), draw.io.

| Aspect | Assessment |
|--------|-----------|
| Text rendering | Excellent — native browser text rendering |
| Accessibility | Best — each shape can have ARIA attributes |
| Scalability | Poor — DOM gets slow with > 1,000 elements |
| FPS at 500 objects | ~40–50 fps (browser dependent) |
| FPS at 5,000 objects | ~5–15 fps (unusable) |
| Hit testing | Native browser hit testing |
| Coordinate system | CSS transform-based; manageable |
| Zoom quality | Perfect vector quality at all zoom levels |
| Export (SVG) | Native — just serialize the DOM |
| Print quality | Excellent |
| Touch support | Good |
| Dev experience | Familiar HTML/CSS/SVG |

**Verdict for Codrawithm:** Acceptable for Phase 1 with small canvases. Breaks down at the 5,000-object target (NFR-004).

---

### Option 2: Canvas 2D API

**How it works:** Objects are drawn onto an HTML `<canvas>` element using the imperative Canvas 2D drawing API. The browser renders the canvas as a bitmap.

**Examples:** Excalidraw, FigJam (partially), Konva.js.

| Aspect | Assessment |
|--------|-----------|
| Text rendering | Good — canvas text with custom rendering |
| Accessibility | Requires separate accessibility tree |
| Scalability | Good — 2,000–5,000 objects at 60 fps with culling |
| FPS at 500 objects | ~60 fps |
| FPS at 5,000 objects | ~30–40 fps with viewport culling |
| Hit testing | Manual (must implement) |
| Coordinate system | Custom transform matrix |
| Zoom quality | Vector quality via transform scaling |
| Export (PNG) | Native — `canvas.toDataURL()` |
| Export (SVG) | Requires reconstruction from object data |
| Print quality | Depends on resolution |
| Touch support | Manual PointerEvent handling |
| Dev experience | More complex; requires custom rendering code |

**Verdict for Codrawithm:** Meets performance targets with viewport culling. Accessible via a separate ARIA tree supplement. **Recommended for Phase 1 and Phase 2.**

---

### Option 3: WebGL

**How it works:** Objects are rendered via the WebGL API using GPU shaders. Maximum performance.

**Examples:** Figma, Pixi.js, PixiJS, custom game engines.

| Aspect | Assessment |
|--------|-----------|
| Text rendering | Hard — requires custom text rendering (SDF fonts) |
| Accessibility | Same as Canvas 2D (requires separate tree) |
| Scalability | Excellent — 50,000+ objects at 60 fps |
| FPS at 500 objects | 60 fps |
| FPS at 5,000 objects | 60 fps |
| Hit testing | GPU-assisted or custom; complex |
| Coordinate system | Custom matrix (same as Canvas 2D) |
| Export (PNG) | `gl.readPixels()` — works |
| Export (SVG) | Requires reconstruction |
| Dev experience | Significantly more complex; shader language |
| Browser support | WebGL 2 — excellent (Chrome, Firefox, Safari 15+, Edge) |

**Verdict for Codrawithm:** Necessary for Phase 3+ when canvas object counts exceed 5,000. Not justified for initial development given the added complexity. Konva.js has a WebGL-based rendering backend that could be adopted without rewriting the scene model.

---

## Recommended Approach

**Phase 1–2:** Canvas 2D via Konva.js (React-Konva).

Rationale:
- Meets all performance targets with viewport culling (NFR-003: 55 fps at 500 objects; NFR-004: 30 fps at 5,000 objects).
- React-Konva provides a declarative API that integrates naturally with React state.
- Accessible via supplementary ARIA tree.
- Hit testing and coordinate transforms are handled by Konva.
- Well-documented; active community.
- Migration path to WebGL via Konva's `canvas: webgl` mode when needed.

**Phase 3+:** Evaluate WebGL upgrade if:
- Canvas object counts consistently exceed 5,000 per board.
- Pan/zoom FPS drops below target on mid-range hardware.
- Community demand for a "maximum performance" mode.

---

## Rendering Pipeline Detail (Canvas 2D)

```
Frame Start
     │
     ▼
Check dirty objects list
     │
     ├─ Empty? → Skip frame (no rAF work)
     │
     ▼
Viewport culling: query spatial index for objects in viewport + buffer
     │
     ▼
For each visible object (z-order):
     ├─ Look up renderer for object type
     ├─ Apply viewport transform (pan + zoom)
     ├─ Draw object to Canvas 2D context
     │   ├─ Background fills
     │   ├─ Borders / strokes
     │   └─ Text labels
     │
     ▼
Selection layer:
     ├─ For each selected object: draw bounding box + handles
     │
     ▼
Collaboration layer (separate canvas element):
     ├─ For each remote cursor: draw cursor arrow + name label
     │
     ▼
Frame End
```

---

## Viewport Culling

Objects outside the visible viewport are not drawn. Culling uses the R-tree spatial index:

```typescript
const visibleObjects = spatialIndex.queryRect({
  x: viewport.x / viewport.zoom - BUFFER,
  y: viewport.y / viewport.zoom - BUFFER,
  width: screenWidth / viewport.zoom + BUFFER * 2,
  height: screenHeight / viewport.zoom + BUFFER * 2,
});
```

`BUFFER` is a padding factor (default: 200 virtual pixels) to avoid pop-in when objects appear at the viewport edge during panning.

---

## Text Rendering

Canvas 2D text rendering uses the browser's font rendering. Key considerations:

- **Sub-pixel rendering:** Canvas 2D does not use sub-pixel rendering. Text may appear slightly less crisp than DOM text at 100% zoom.
- **Font loading:** Custom fonts (JetBrains Mono for code blocks) must be loaded before first render. Font loading uses the `FontFace` API with a loading promise.
- **HiDPI:** The canvas is sized at `devicePixelRatio` × CSS pixel size to render crisp text on retina displays.
- **Code blocks:** Code blocks with syntax highlighting render HTML content inside a `foreignObject` SVG element (or a separate DOM overlay) for best text quality.

---

## Related Documents

- [Canvas Engine](canvas-engine.md)
- [Frontend Architecture](frontend-architecture.md)
- [3D Rendering](3d-rendering.md)
- [ADR-004: Canvas Rendering Approach](architecture-decisions/ADR-004-canvas-rendering-approach.md)
