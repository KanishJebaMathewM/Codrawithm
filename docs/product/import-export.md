# Import / Export

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm supports open data portability — users can export their boards in multiple formats and import from common external tools. No vendor lock-in.

---

## Export Formats

### PNG Export (P0)

**Access:** File → Export → PNG, or right-click selection → Export as PNG.

**Options:**
- **Scope:** Current viewport, all objects, or selected objects.
- **Scale:** 1×, 2× (default), or 4× (print quality).
- **Background:** White, transparent, or canvas background color.
- **DPI metadata:** 72 (screen) or 300 (print).

**Limitations:**
- 3D workspace exports as a rasterized PNG of the Three.js viewport.
- Maximum output image size: 8192 × 8192 px (at 2×; scales down automatically for very large canvases).

---

### SVG Export (P1)

**Access:** File → Export → SVG.

**What is included:**
- All 2D shapes, connectors, text, code blocks, images (embedded as base64).
- Correct font embedding for system fonts.

**What is not included:**
- 3D workspace objects (rendered as PNG and embedded).
- Algorithm visualization animations (static snapshot of current step).

**SVG compliance:** SVG 1.1. Tested in Chrome, Firefox, Safari, and Inkscape.

---

### PDF Export (P1)

**Access:** File → Export → PDF (available when board has at least one frame).

**Behavior:**
- One PDF page per named frame.
- Page size: A4 (default), Letter, or auto-fit to frame dimensions.
- Vector rendering for shapes and text.
- Raster fallback for images and code blocks with complex backgrounds.

**Use case:** Exporting lecture notes, presentation handouts, documentation snapshots.

---

### Codrawithm JSON Export (P0)

**Access:** File → Export → JSON.

**Format:** A machine-readable JSON document conforming to the [Codrawithm data model](../architecture/data-model.md). This is the canonical format — all internal state is preserved.

```json
{
  "version": "1.0",
  "boardId": "brd_abc123",
  "title": "My Architecture Diagram",
  "workspaceType": "system-architecture",
  "objects": [...],
  "connectors": [...],
  "frames": [...],
  "algorithm": null,
  "metadata": {
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

The JSON export is the recommended format for:
- Backing up a board.
- Moving a board between Codrawithm instances.
- Programmatic generation of boards.
- Version control integration (board JSON checked into a Git repository).

---

### Mermaid / PlantUML Export (P3)

**Access:** File → Export → Mermaid (available for Flowchart and Sequence Diagram workspace types only).

**Supported output:**
- Flowchart workspace → Mermaid `graph TD` or `flowchart TD`.
- Sequence Diagram workspace → Mermaid `sequenceDiagram`.

**Limitations:** Only for diagram types with a clear 1:1 mapping to Mermaid syntax. System Architecture, UML Class Diagram, and custom canvases cannot be exported to Mermaid.

---

## Import Formats

### Codrawithm JSON Import (P0)

**Access:** File → Import → From JSON file.

**Behavior:**
1. File picker opens. User selects a `.json` file.
2. Schema validation runs. Invalid files show a descriptive error.
3. Preview dialog shows the board title and object count.
4. User confirms. Board is created as a new board in their workspace.
5. Existing boards are never overwritten by import.

---

### Excalidraw Import (P2)

**Access:** File → Import → From Excalidraw.

**Supported:** `.excalidraw` JSON files.

**Conversion mapping:**

| Excalidraw Element | Codrawithm Object |
|-------------------|------------------|
| `rectangle` | Rectangle |
| `ellipse` | Ellipse |
| `diamond` | Diamond |
| `line` | Line or Arrow |
| `arrow` | Arrow |
| `text` | Text |
| `freedraw` | Freehand Path |
| `image` | Image Embed |
| `frame` | Frame |

**Not supported:** Excalidraw binding (connector to shape) — connectors are imported as non-connected arrows.

---

### draw.io (XML) Import (P2)

**Access:** File → Import → From draw.io.

**Supported:** `.drawio` and `.xml` files exported from draw.io or diagrams.net.

**Conversion mapping:**

| draw.io Shape | Codrawithm Object |
|--------------|------------------|
| `mxCell` (rectangle/ellipse) | Shape |
| `mxCell` (edge) | Connector or Arrow |
| Text label on cell | Inline label |
| Image | Image Embed |

**Known limitations:**
- Complex draw.io custom shapes (stencils) fall back to a labeled rectangle.
- draw.io swimlanes are imported as groups, not Codrawithm swimlane containers.
- Freehand paths may not convert with full fidelity.

---

## Clipboard Operations

### Copy as Image

Right-click selected objects → "Copy as Image" places a PNG of the selection onto the system clipboard. This allows pasting into Slack, Notion, email, etc.

### Copy as SVG

Right-click selected objects → "Copy as SVG" places the SVG markup onto the clipboard. Useful for pasting into Figma or Inkscape.

### Paste Image from Clipboard

If the clipboard contains an image (copied from a browser, screenshot tool, etc.), pressing `Ctrl+V` on the canvas places it as an Image Embed object at the center of the viewport.

---

## File Size and Safety Limits

| Export | Limit | Notes |
|--------|-------|-------|
| PNG export | Max 8192 × 8192 px output | Auto-downscaled for very large canvases |
| SVG export | Max 100 MB file size | Large embedded images will increase file size |
| JSON export | No limit | Large boards with many high-res images may produce large files |
| Image import | 20 MB per image | Validated by backend |
| JSON import | 50 MB per file | |
| draw.io import | 10 MB per file | |

---

## Data Portability Commitment

Codrawithm commits to:
- Maintaining backwards compatibility for Codrawithm JSON exports across versions.
- Documenting breaking changes in JSON schema in the changelog.
- Never removing the JSON export feature, even on the free tier.
- Publishing the JSON schema as part of this documentation.

---

## Related Documents

- [Data Model](../architecture/data-model.md)
- [Storage & Assets](../architecture/storage-and-assets.md)
- [Feature Catalog — IO](../vision/feature-catalog.md#import--export-io)
