# Glossary

**Status:** Living document  
**Audience:** All contributors  
**Last Reviewed:** 2024-01-15

Definitions of terms used throughout Codrawithm's documentation and codebase.

---

## A

**ADR (Architecture Decision Record)**  
A document that records a significant architectural decision, its context, alternatives considered, and the rationale for the chosen approach. Stored in `docs/architecture/architecture-decisions/`.

**Algorithm Lab**  
A specialized Codrawithm workspace type designed for visualizing data structures and algorithms step by step. Provides nodes, edges, playback controls, and state inspection.

**Awareness (Yjs)**  
The Yjs protocol for sharing ephemeral, non-persisted state between collaborators — cursors, selections, and viewport information. Separate from the Y.Doc document state.

---

## B

**Board**  
A single visual canvas in Codrawithm. A board can have multiple pages, objects, and collaborators. Analogous to a "file" in other applications.

**Board Document**  
The Yjs-encoded binary representation of a board's complete state, stored in PostgreSQL as a BYTEA field.

---

## C

**Canvas**  
The drawing surface where objects are placed, moved, and edited. Codrawithm uses an infinite canvas model — there are no fixed edges.

**Canvas Coordinate**  
A position measured in the canvas's own coordinate system, independent of screen pixels. The viewport transformation converts canvas coordinates to screen coordinates for rendering.

**CRDT (Conflict-free Replicated Data Type)**  
A data structure that can be replicated across multiple nodes and updated independently, with guaranteed eventual consistency without requiring coordination. Codrawithm uses Yjs, a CRDT framework, for real-time collaboration.

**Canvas Object**  
Any visual element on the canvas: shapes, text, connectors, images, frames, sticky notes, etc. Every object has a unique ID, position, size, style, and optional label.

---

## D

**DSA (Data Structures and Algorithms)**  
The category of computer science topics — arrays, linked lists, trees, graphs, sorting, searching, etc. — that Codrawithm's Algorithm Lab workspace is designed to help visualize and explain.

**Dirty Region**  
The area of the canvas that needs to be redrawn in the next render frame, because objects within it have changed. Tracking dirty regions avoids full-canvas redraws.

---

## E

**Edge (graph)**  
A connection between two nodes in a graph data structure. In Codrawithm's Algorithm Lab, edges are visual connectors between node objects, optionally with weights and direction.

---

## F

**Frame**  
A rectangular region on the canvas used to group and organize content. Frames are used in presentation mode as "slides" and can contain any canvas objects.

---

## H

**Hit Testing**  
The process of determining which canvas object(s) are at a given screen position — used to handle click, hover, and drag events.

---

## I

**Infinite Canvas**  
A canvas with no fixed boundaries. Users can pan in any direction indefinitely. Objects exist at arbitrary coordinates, and the viewport shows a window into this infinite space.

---

## J

**JSONB**  
A PostgreSQL column type that stores JSON data in a binary format optimized for querying and indexing. Used for structured metadata in the database.

---

## K

**Konva.js**  
The recommended canvas library for Codrawithm Phase 1. An MIT-licensed 2D canvas engine built on HTML Canvas that provides a scene graph, hit testing, and event handling. See [ADR-004](architecture/architecture-decisions/ADR-004-canvas-rendering-approach.md).

---

## L

**Lamport Timestamp**  
A logical clock used by Yjs to order operations deterministically across distributed clients, enabling conflict-free merge of concurrent edits.

**Layer**  
A grouping mechanism for canvas objects that controls rendering order (z-index) and can be locked or hidden independently.

---

## M

**Minimap**  
A small overview panel showing the full canvas at reduced scale, with the current viewport highlighted. Allows quick navigation on large canvases.

---

## N

**Node (graph)**  
A vertex in a graph data structure. In Codrawithm's Algorithm Lab, a node is a visual circle or box representing a value, with an ID and optional label.

---

## O

**Object Storage**  
A storage system for binary files (images, assets) that are too large for a relational database. Codrawithm uses S3-compatible object storage for user-uploaded media.

---

## P

**Page**  
A named canvas within a board. A board can have multiple pages, each with independent objects and viewport state. Similar to slides in a presentation or tabs in a spreadsheet.

**Plugin**  
A sandboxed extension that adds capabilities to Codrawithm. Plugins run in isolated iframes and communicate with the host platform via a postMessage API.

**Plugin Manifest**  
A `manifest.json` file at the root of every plugin package that declares the plugin's identity, permissions, entry points, and contribution points.

**Presence**  
Real-time information about collaborators on a board: their cursor positions, selections, and viewport locations. Presence data is ephemeral and never persisted to the database.

---

## R

**Refresh Token**  
A long-lived token used to obtain a new JWT access token without requiring the user to log in again. Stored server-side in a secure, httpOnly cookie.

**Renderer**  
The subsystem responsible for drawing canvas objects to the screen. Codrawithm uses Konva.js (Canvas 2D) for Phase 1, with a path to WebGL for Phase 3+ when performance requires it.

---

## S

**Scene Graph**  
A hierarchical data structure representing all objects on a canvas and their spatial relationships. The scene graph is the source of truth for what is displayed.

**Scene Model / Document Model**  
The internal data representation of a board's contents — objects, pages, styles, metadata — independent of how they are rendered. The canonical format is serialized as JSON (or Yjs binary for collaborative boards).

**Spatial Index**  
A data structure (e.g. quadtree, R-tree) that organizes objects by their spatial position, enabling fast queries like "which objects are in this viewport?" Used for hit testing and viewport culling.

**Spike (Research Spike)**  
A time-boxed technical investigation (1–5 days) designed to reduce uncertainty on a key question, producing a written findings report rather than production code.

---

## T

**Three.js**  
An MIT-licensed WebGL-based 3D graphics library. Recommended for Codrawithm's 3D workspace module, loaded lazily so it doesn't affect 2D workspace performance.

---

## V

**Viewport**  
The visible portion of the canvas — defined by its top-left corner position in canvas coordinates and the current zoom level. The viewport is transformed as users pan and zoom.

**Viewport Culling**  
The optimization technique of skipping rendering for objects that lie entirely outside the current viewport. Essential for large canvases with many objects.

---

## W

**WebSocket**  
A protocol providing full-duplex communication between client and server over a persistent connection. Used by Codrawithm for real-time collaboration sync and presence updates.

**Workspace**  
In Codrawithm, "workspace" can refer to:
1. A named collection of boards belonging to a user or organization (the account-level workspace)
2. A workspace *type* — the mode/configuration of a board (e.g. Algorithm Lab, 3D Workspace, Whiteboard)

Context determines which meaning is intended.

**Workspace Type**  
The configured mode of a board that determines which specialized tools, templates, and rendering modes are available. Examples: Whiteboard, Algorithm Lab, Flowchart Editor, 3D Workspace.

---

## Y

**Y.Doc**  
The root Yjs document type. Every collaborative Codrawithm board is represented as a Y.Doc on both client and server.

**Y.Map**  
A Yjs shared type that behaves like a JavaScript Map. Used to represent canvas objects (each object is a Y.Map of its properties).

**Y.Text**  
A Yjs shared type that enables collaborative text editing with character-level conflict resolution.

**Yjs**  
An MIT-licensed CRDT framework for building collaborative applications. Codrawithm uses Yjs for real-time board synchronization. The Rust port is called `yrs`.

**yrs**  
The Rust port of Yjs (`y-crdt/y-crdt`), used in the Codrawithm backend to maintain board state and process WebSocket sync messages without a Node.js process.

---

## Z

**Z-Index**  
The rendering order of canvas objects. Higher z-index objects appear in front of lower z-index objects. Also called "layer order".
