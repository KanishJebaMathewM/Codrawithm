# Data Model

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document describes the domain model for Codrawithm — the key entities and their relationships — and provides sample JSON schemas for the core board and canvas object types.

---

## Domain Model

```
User ───────────────── BoardMember ─────────────────── Board
 │                       (role)                          │
 │                                                       ├── CanvasObject (many)
 └── OAuthIdentity (0..n)                                ├── Connector (many)
                                                         ├── Frame (many)
                                                         ├── AlgorithmState (0..1)
                                                         ├── ThreeDScene (0..1)
                                                         ├── Comment (many)
                                                         ├── Asset (many)
                                                         └── BoardSnapshot (many)
```

---

## Board

```typescript
interface Board {
  id: string;               // UUID
  title: string;
  workspaceType: WorkspaceType;
  ownerId: string;          // User ID
  isPublic: boolean;
  shareToken: string;       // Random token for share links
  settings: BoardSettings;
  createdAt: string;        // ISO 8601
  updatedAt: string;
}

interface BoardSettings {
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;         // Virtual pixels per grid cell (default: 20)
  background: CanvasBackground;
  defaultConnectorStyle: 'straight' | 'orthogonal' | 'curved';
}

type CanvasBackground =
  | { type: 'color'; color: string }
  | { type: 'dotted-grid'; dotColor: string; spacing: number }
  | { type: 'line-grid'; lineColor: string; spacing: number };
```

---

## Canvas Object (Base)

All canvas objects share these base fields:

```typescript
interface CanvasObject {
  id: string;               // "rect_A3bX9kP2mQrL"
  type: CanvasObjectType;
  boardId: string;

  // Position and geometry
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;         // Degrees

  // Style
  fill: string | null;      // CSS color or "none"
  stroke: string | null;
  strokeWidth: number;
  opacity: number;          // 0.0 – 1.0
  strokeDashArray: number[] | null;  // e.g. [5, 5] for dashed

  // Text
  label: string | null;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  textColor: string;

  // Metadata
  groupId: string | null;
  locked: boolean;
  visible: boolean;
  version: number;
  createdBy: string;        // User ID
  updatedAt: string;
}
```

---

## Specific Object Types

### Rectangle

```json
{
  "id": "rect_A3bX9k",
  "type": "rectangle",
  "x": 100, "y": 50,
  "width": 200, "height": 80,
  "rotation": 0,
  "fill": "#1e293b",
  "stroke": "#6366f1",
  "strokeWidth": 2,
  "opacity": 1.0,
  "strokeDashArray": null,
  "label": "API Server",
  "fontSize": 14,
  "fontFamily": "Inter",
  "fontWeight": 500,
  "fontStyle": "normal",
  "textAlign": "center",
  "textColor": "#f1f5f9",
  "borderRadius": 6,
  "groupId": null,
  "locked": false,
  "visible": true,
  "version": 1
}
```

### Arrow / Connector

```json
{
  "id": "arrow_B4cY10",
  "type": "arrow",
  "startPoint": { "x": 300, "y": 90 },
  "endPoint": { "x": 500, "y": 90 },
  "startObjectId": "rect_A3bX9k",
  "endObjectId": "rect_C5dZ11",
  "startPortSide": "east",
  "endPortSide": "west",
  "waypoints": [],
  "routingStyle": "orthogonal",
  "startArrowhead": "none",
  "endArrowhead": "filled",
  "stroke": "#94a3b8",
  "strokeWidth": 2,
  "label": "HTTPS",
  "version": 1
}
```

### Code Block

```json
{
  "id": "code_D6eA12",
  "type": "code-block",
  "x": 100, "y": 200,
  "width": 350,
  "height": 120,
  "language": "typescript",
  "code": "const response = await fetch('/api/users');\nconst users = await response.json();",
  "theme": "auto",
  "label": "Fetch Users",
  "version": 1
}
```

### Sticky Note

```json
{
  "id": "note_E7fB13",
  "type": "sticky-note",
  "x": 50, "y": 400,
  "width": 200, "height": 150,
  "backgroundColor": "#fef08a",
  "textColor": "#1e293b",
  "text": "**TODO:** Add circuit breaker\n- Use hystrix\n- 5s timeout",
  "version": 1
}
```

### Frame

```json
{
  "id": "frame_F8gC14",
  "type": "frame",
  "x": 0, "y": 0,
  "width": 1200, "height": 800,
  "name": "1. System Overview",
  "frameIndex": 1,
  "background": null,
  "showInPresentation": true,
  "version": 1
}
```

### Image Embed

```json
{
  "id": "img_G9hD15",
  "type": "image",
  "x": 600, "y": 100,
  "width": 300, "height": 200,
  "assetId": "asset_abc123",
  "src": "https://storage.codrawithm.app/assets/asset_abc123.png",
  "altText": "AWS architecture diagram",
  "version": 1
}
```

---

## Algorithm State

```typescript
interface AlgorithmState {
  boardId: string;
  algorithmType: 'sort' | 'graph' | 'tree';
  algorithmName: string;    // e.g. "mergeSort", "bfs", "avlInsert"
  input: unknown;           // Array (sort), graph (graph algo), values (tree)
  steps: AlgorithmStep[];   // Pre-computed step sequence
  currentStep: number;
  annotations: Record<number, Annotation[]>;
}
```

---

## User

```typescript
interface User {
  id: string;               // UUID
  email: string;
  displayName: string;
  avatarUrl: string | null;
  cursorColor: string;      // From the collaborator color palette
  tier: 'free' | 'pro';
  createdAt: string;
}

interface OAuthIdentity {
  userId: string;
  provider: 'github' | 'google';
  providerUserId: string;
  email: string;
  accessToken: string;      // Encrypted at rest
}
```

---

## BoardMember (Permission)

```typescript
interface BoardMember {
  boardId: string;
  userId: string | null;      // null for link-based access
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  invitedBy: string;          // User ID
  joinedAt: string;
}
```

---

## Comment

```typescript
interface Comment {
  id: string;
  boardId: string;
  objectId: string | null;    // null = canvas-level comment (at a point)
  canvasX: number | null;     // For canvas-level comments
  canvasY: number | null;
  thread: CommentMessage[];
  resolved: boolean;
  createdAt: string;
}

interface CommentMessage {
  id: string;
  authorId: string;
  text: string;               // Markdown
  createdAt: string;
}
```

---

## Related Documents

- [Database Design](database-design.md)
- [Canvas Engine](canvas-engine.md)
- [Collaboration Engine](collaboration-engine.md)
- [ADR-005: Scene Document Model](architecture-decisions/ADR-005-scene-document-model.md)
