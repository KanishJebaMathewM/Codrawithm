# Feature Catalog

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Every proposed feature for Codrawithm is tracked here. Each entry has a unique ID, priority tier, the user story it serves, and acceptance criteria.

Priority tiers: **P0** = launch-blocking core · **P1** = Phase 1–2 high value · **P2** = Phase 3–4 medium value · **P3** = post-MVP / community-driven.

---

## Canvas Core (CANVAS)

| ID | Feature | Priority | User Story | Acceptance Criteria |
|----|---------|----------|------------|---------------------|
| CANVAS-001 | Infinite pan/zoom canvas | P0 | As a user I want to pan and zoom freely so I can work at any scale. | Pan with middle-mouse or Space+drag. Zoom with scroll wheel. No hard boundaries. |
| CANVAS-002 | Rectangle / ellipse / diamond shape tools | P0 | As a user I want basic shape primitives for quick diagrams. | Shapes created by click-drag. Resize handles on select. Shift constrains aspect ratio. |
| CANVAS-003 | Text tool | P0 | As a user I want to add text labels directly on the canvas. | Click to place, type to enter. Inline editing. Font size / weight / color configurable. |
| CANVAS-004 | Arrow / connector tool | P0 | As a user I want connected arrows that follow shape edges when shapes move. | Connectors snap to shape edge midpoints. Re-route on shape move. Multiple arrowhead styles. |
| CANVAS-005 | Freehand drawing tool | P0 | As a user I want to draw freehand lines for quick sketching. | Smooth bezier curves from raw pointer input. Pressure sensitivity optional. |
| CANVAS-006 | Selection tool (marquee + click) | P0 | As a user I want to select one or multiple objects to move, resize, or delete. | Click = single select. Shift+click = multi-select. Drag = marquee select. |
| CANVAS-007 | Undo / redo (unlimited) | P0 | As a user I want unlimited undo/redo for all canvas operations. | Ctrl+Z / Ctrl+Y. History persists across sessions. |
| CANVAS-008 | Copy / paste / duplicate | P0 | As a user I want to copy and paste objects on the canvas. | Ctrl+C / Ctrl+V places copy offset by (10, 10). Ctrl+D duplicates in-place. |
| CANVAS-009 | Group / ungroup | P1 | As a user I want to group objects to move and scale them together. | Ctrl+G groups. Ctrl+Shift+G ungroups. Group shows combined bounding box. |
| CANVAS-010 | Layer ordering | P1 | As a user I want to control which objects appear in front. | Right-click context menu: bring-to-front, send-to-back, bring-forward, send-backward. |
| CANVAS-011 | Grid and snapping | P1 | As a user I want grid lines and snapping for aligned diagrams. | Toggle grid. Snap to grid and to other objects' edges and centers. |
| CANVAS-012 | Minimap | P1 | As a user I want a minimap to navigate large canvases. | Minimap in bottom-right corner. Click to jump. Drag to pan. Shows viewport rectangle. |
| CANVAS-013 | Zoom to fit / selection | P0 | As a user I want to fit all objects in view with one action. | Ctrl+Shift+H fits all. Ctrl+Shift+F fits selection. |
| CANVAS-014 | Object properties panel | P1 | As a user I want to set fill, stroke, opacity, and font properties. | Right panel shows properties for current selection. Changes apply live. |
| CANVAS-015 | Sticky notes | P1 | As a user I want sticky notes for contextual annotations. | Six color options. Markdown text inside. |
| CANVAS-016 | Image embed | P1 | As a user I want to embed images in the canvas. | Drag-and-drop, paste from clipboard, URL embed. Resize handles. |
| CANVAS-017 | Frame / container | P1 | As a user I want named frames to organize content into sections and slides. | Frame tool creates named boundary. Objects inside move with frame. Frames act as slides in presentation mode. |
| CANVAS-018 | Canvas auto-save | P0 | As a user I want my work saved automatically. | State persists every 5 seconds or on every change. Last-saved timestamp visible. |
| CANVAS-019 | Keyboard shortcuts for all major tools | P0 | As a developer-user I want keyboard shortcuts for every common action. | Full shortcut reference in [keyboard-shortcuts.md](../design/keyboard-shortcuts.md). All tools accessible without mouse. |

---

## Collaboration (COLLAB)

| ID | Feature | Priority | User Story | Acceptance Criteria |
|----|---------|----------|------------|---------------------|
| COLLAB-001 | Real-time multiplayer editing | P0 | As a team member I want to edit simultaneously with colleagues. | Changes visible within 200 ms on LAN. No conflicting writes. |
| COLLAB-002 | Live cursors with user identity | P0 | As a user I want to see where my collaborators are. | Named cursors with user color float in real time. |
| COLLAB-003 | Share link (view-only) | P0 | As a user I want to share a read-only link with anyone. | One-click "Copy Link". Recipients view without account. |
| COLLAB-004 | Share link (edit) | P1 | As a user I want to invite collaborators by sending them an edit link. | Edit link requires auth or optional guest editing. |
| COLLAB-005 | Comment threads on objects | P1 | As a reviewer I want to leave comments on specific canvas elements. | Right-click → "Add Comment". Thread attached to object. Resolved/unresolved states. |
| COLLAB-006 | Follow-presenter mode | P1 | As a student I want my view to follow the presenter's viewport. | Presenter enables mode. Followers' viewports mirror presenter's within 200 ms. |
| COLLAB-007 | Board permission roles | P1 | As a board owner I want to control who can view, comment, or edit. | Four roles: Owner, Editor, Commenter, Viewer. |
| COLLAB-008 | Presence indicators | P1 | As a user I want to see who is on the board. | Avatar stack in top bar. Click to follow. |
| COLLAB-009 | Offline editing with sync on reconnect | P2 | As a user on an unreliable connection I want my edits to sync when I reconnect. | Offline changes queue. On reconnect they merge via CRDT. |

---

## Algorithm Visualization (ALGO)

| ID | Feature | Priority | User Story | Acceptance Criteria |
|----|---------|----------|------------|---------------------|
| ALGO-001 | Algorithm workspace type | P0 | As a learner I want a dedicated workspace for algorithm visualization. | Workspace type "Algorithm Visualization" available with clear entry point. |
| ALGO-002 | Custom array input | P0 | As a learner I want to input my own array for sorting algorithms. | Text field accepts comma-separated integers. Validates and shows error for invalid input. |
| ALGO-003 | Sorting algorithms: bubble, selection, insertion, merge, quick, heap | P0 | As a learner I want to visualize the most common sorting algorithms. | All six available. Each step shows comparisons and swaps with color coding. |
| ALGO-004 | Graph algorithms: BFS, DFS, Dijkstra, A* | P1 | As a learner I want to visualize graph traversal and shortest-path algorithms. | Custom graph editor. Step-by-step traversal with visited/frontier highlighting. |
| ALGO-005 | Tree algorithms: BST insert/delete, AVL rotation, heap ops | P1 | As a learner I want to visualize binary tree operations. | Build BST by inserting values. Step-by-step node insert/delete. Rotation animation for AVL. |
| ALGO-006 | Step forward / backward playback | P0 | As a learner I want to step through one step at a time. | Previous / Next step buttons. Step counter. Arrow key support. |
| ALGO-007 | Auto-play with speed control | P1 | As a learner I want the algorithm to play automatically at my chosen speed. | Play/pause button. Speed slider 0.5x–10x. |
| ALGO-008 | Step annotations | P0 | As a learner I want to annotate specific steps with my own notes. | Double-click or right-click on step marker to add text annotation. Annotations persist. |
| ALGO-009 | Shareable visualization link | P0 | As a learner I want to share my visualization at a specific step. | URL encodes algorithm, input, step, and annotations. Opens to same state. |
| ALGO-010 | Complexity display | P1 | As a learner I want to see time and space complexity. | Info panel shows O(n) notation. Updates per algorithm. |

---

## Developer Studio (DEV)

| ID | Feature | Priority | User Story | Acceptance Criteria |
|----|---------|----------|------------|---------------------|
| DEV-001 | Code block with syntax highlighting | P0 | As a developer I want code snippets directly on the canvas. | Language selector. Syntax highlighting for 20+ languages via Shiki. |
| DEV-002 | Flowchart shapes | P1 | As a developer I want standard flowchart shapes. | Shape library includes all standard ANSI/ISO flowchart symbols. |
| DEV-003 | UML class diagram tool | P1 | As a developer I want to draw UML class diagrams. | Class box with name, attributes, methods. Association, inheritance, composition arrows. |
| DEV-004 | Sequence diagram tool | P1 | As a developer I want to draw sequence diagrams. | Lifelines, messages (sync/async), activation boxes, notes, fragments. |
| DEV-005 | Entity-relationship (ER) diagram tool | P1 | As a developer I want to draw database ER diagrams. | Entity boxes with attributes. Relationship lines with cardinality. Crow's foot notation. |
| DEV-006 | System architecture shapes library | P1 | As a developer I want icons for cloud services and architectural patterns. | Shape library with AWS/GCP/Azure service icons, server, database, client, load balancer icons. |
| DEV-007 | State machine diagram | P2 | As a developer I want to draw finite state machine diagrams. | State circles, transition arrows with labels, initial/final states. |
| DEV-008 | Git graph visualization | P3 | As a developer I want to sketch git branching strategies. | Git graph shapes: commit nodes, branch lines, merge arrows. |

---

## AI Studio (AI)

| ID | Feature | Priority | User Story | Acceptance Criteria |
|----|---------|----------|------------|---------------------|
| AI-001 | AI plugin slot | P1 | As a user I want to invoke AI features through a plugin slot on the canvas. | AI toolbar button opens plugin panel. Plugins listed. Selected plugin launches in sidebar. |
| AI-002 | Text-to-diagram generation | P1 | As a user I want to describe a diagram in text and have it generated. | Text input → structured diagram placed on canvas. User can edit result. |
| AI-003 | Text-to-flowchart | P1 | As a developer I want to describe a process in plain English and get a flowchart. | Natural language input produces a correct flowchart on the canvas. |
| AI-004 | Diagram explanation | P2 | As a user I want AI to explain what a selected diagram represents. | Select objects → "Explain with AI" → natural language explanation in panel. |
| AI-005 | AI provider plugin interface | P1 | As a plugin developer I want to connect any AI provider. | Provider plugin interface defined in [ai-provider-interface.md](../plugins/ai-provider-interface.md). |

---

## 3D Workspace (THREED)

| ID | Feature | Priority | User Story | Acceptance Criteria |
|----|---------|----------|------------|---------------------|
| THREED-001 | 3D workspace type | P2 | As a user I want a workspace for sketching 3D structures. | Workspace type "3D Editor" available. Scene with default lighting. |
| THREED-002 | Primitive shapes (box, sphere, cylinder, cone) | P2 | As a user I want basic 3D primitives. | Toolbar with 3D primitives. Click to place. Drag to resize. |
| THREED-003 | Camera orbit, pan, zoom | P2 | As a user I want to navigate a 3D scene. | Left-drag to orbit, right-drag to pan, scroll to zoom. |
| THREED-004 | Material and color properties | P3 | As a user I want to set colors and materials on 3D objects. | Color picker + basic material types (flat, phong, wireframe). |

---

## Presentation & Teaching (PRESENT)

| ID | Feature | Priority | User Story | Acceptance Criteria |
|----|---------|----------|------------|---------------------|
| PRESENT-001 | Presentation mode | P1 | As an educator I want a distraction-free full-screen view. | Full-screen. Hides all UI chrome. Esc to exit. |
| PRESENT-002 | Follow-presenter mode | P1 | As a student I want my view to follow the presenter's. | Presenter's viewport propagates to followers within 200 ms. |
| PRESENT-003 | Frame-based slide navigation | P1 | As an educator I want frames as slides. | Arrow keys navigate frames in order during presentation mode. |
| PRESENT-004 | Laser pointer tool | P1 | As a presenter I want a laser pointer visible to all collaborators. | Hold `L` key shows glowing dot. Visible to all. Fades 2s after release. |
| PRESENT-005 | Export to PDF | P1 | As an educator I want to export my board as PDF. | Each frame = one PDF page. Preserves text, shapes, images. |

---

## Import / Export (IO)

| ID | Feature | Priority | User Story | Acceptance Criteria |
|----|---------|----------|------------|---------------------|
| IO-001 | Export as PNG | P0 | As a user I want to export my canvas as a PNG image. | DPI selection. Transparent background option. |
| IO-002 | Export as SVG | P1 | As a user I want to export as scalable vector. | SVG output correctly represents all shapes, text, and connectors. |
| IO-003 | Export as JSON | P0 | As a developer I want full board data as JSON. | Board JSON follows documented [data model](../architecture/data-model.md). |
| IO-004 | Import from JSON | P0 | As a developer I want to import a board from JSON. | Validates schema before import. Clear error for invalid files. |
| IO-005 | Import from Excalidraw | P2 | As a user I want to migrate from Excalidraw. | Import .excalidraw files. Convert to Codrawithm objects. |
| IO-006 | Import from draw.io (XML) | P2 | As a user I want to migrate from draw.io. | Import .drawio XML, best-effort conversion. |
| IO-007 | Export as Mermaid / PlantUML | P3 | As a developer I want to export diagrams as text-based code. | Flowchart and sequence diagram types export as Mermaid or PlantUML text. |

---

## Related Documents

- [Requirements](requirements.md)
- [Product Roadmap](../roadmap/product-roadmap.md)
- [Workspace Types](../product/workspace-types.md)
