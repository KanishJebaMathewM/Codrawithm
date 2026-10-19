# Presence and Cursors

**Status:** Proposed  
**Audience:** Frontend engineers, collaboration engineers  
**Last Reviewed:** 2024-01-15

## Overview

Presence is the system that makes collaborators visible to each other. It includes live cursors, selection awareness, user identity display, and viewport indicators. Presence data is ephemeral — it is never persisted to the database.

---

## Yjs Awareness Protocol

Presence is managed through the [y-protocols/awareness](https://github.com/yjs/y-protocols) module (MIT license), which is separate from the Y.Doc document state.

Each connected client maintains an awareness state object:

```typescript
interface AwarenessState {
  user: {
    id: string
    name: string
    color: string      // Assigned collaboration cursor color
    avatar?: string    // URL to avatar image
  }
  cursor: {
    x: number          // Canvas coordinate (not screen)
    y: number
    pageId: string     // Which page the cursor is on
  } | null             // null when cursor is off-canvas
  selection: {
    objectIds: string[]
    pageId: string
  } | null
  viewport: {
    x: number          // Top-left canvas coordinate visible
    y: number
    width: number
    height: number
    zoom: number
  }
  lastActive: number   // Unix timestamp ms
}
```

---

## Cursor Display

### Visual Design

Each collaborator's cursor is rendered as:
```
  ↖  ← Mouse pointer SVG in collaborator's assigned color
  ┌──────────────┐
  │  User Name   │  ← Name label in same color, white text
  └──────────────┘
```

- Cursor is a standard arrow pointer shape filled with the user's color
- Name label appears below-right of the pointer
- Label fades out after 3 seconds of inactivity, reappears on movement
- Maximum 10 cursors rendered simultaneously (overflow hidden, not critical)

### Cursor Position Handling

Cursors use **canvas coordinates**, not screen/viewport coordinates. This means:
- Cursors appear in the correct position regardless of each user's zoom level
- A user at 50% zoom and a user at 200% zoom both see the cursor at the same logical canvas position
- The rendering layer converts canvas → screen coordinates on each frame

### Cursor Throttling

To avoid flooding the WebSocket with mousemove events:
- Cursor position updates are throttled to **max 20 updates/second** (50ms intervals)
- Updates below a movement threshold of **2px** are suppressed
- Cursor disappears from others' views after **5 seconds** of no updates (user left canvas)

---

## Selection Awareness

When a user selects objects, other collaborators see a subtle selection highlight:

- A translucent border in the user's color around selected objects
- A small avatar or initial badge at the top-right corner of the selection
- Prevents accidental double-editing of the same object (visual signal, not a lock)

```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  ← Dashed border (user's color, 40% opacity)
│                       │
│    Selected Object    │
│                       │  
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
                        🅐  ← User's initial badge (their color)
```

---

## Viewport Awareness

The minimap shows other users' viewports as colored rectangles:

```
┌──────────────────────────┐
│     Minimap              │
│  ┌──────┐                │
│  │  A   │  ← User A's   │
│  └──────┘    viewport    │
│         ┌────────┐       │
│         │   B    │  ← B  │
│         └────────┘       │
└──────────────────────────┘
```

- Each active collaborator's viewport shown as a labeled rectangle
- Clicking on a viewport rectangle jumps to that user's view
- "Follow presenter" mode pins your viewport to another user's

---

## Follow Mode

Activated via `Ctrl/Cmd + Shift + F` or clicking a collaborator's avatar in the top bar.

**In follow mode:**
- Your viewport automatically mirrors the followed user's viewport
- Pan and zoom updates from the followed user are applied to your view in real-time
- Your own pan/zoom is disabled
- A banner shows: "Following [User Name] — press Esc to stop"
- The followed user sees a small indicator that someone is following them

**Exiting follow mode:**
- `Escape`
- Any manual pan or zoom action
- The followed user disconnects

---

## Collaborator List

The top bar shows connected collaborators as avatar circles (up to 5, then "+N more"):

```
  [ Avatar A ][ Avatar B ][ Avatar C ][ +3 ]    Share ▼
```

- Clicking an avatar shows: name, role (editor/viewer), "Follow" button, "Remove" (if owner)
- Hovering shows user name tooltip
- Offline/disconnected users shown with dimmed avatar + offline indicator

---

## Presence Privacy Controls

Users can control their own presence visibility:

| Setting | Effect |
|---------|--------|
| Hide cursor | Cursor not shown to others |
| Hide selection | Selection highlights not shown to others |
| Hide viewport | Viewport not shown in others' minimaps |
| Appear offline | All presence hidden; user appears disconnected |

These settings persist per-session (not per-board) and reset on reconnect.

---

## Implementation Notes

### Awareness State Updates

```typescript
// Setting local awareness state
awareness.setLocalStateField('cursor', {
  x: canvasX,
  y: canvasY,
  pageId: currentPageId
})

// Reading all users' awareness states
awareness.on('change', ({ added, updated, removed }) => {
  // Re-render cursors for changed users
  renderCursors(Array.from(awareness.getStates().entries()))
})
```

### Performance

- Awareness updates do NOT go through the Y.Doc CRDT — they use a separate lightweight protocol
- Awareness state is broadcast to all room members via the WebSocket server
- Server does not store awareness state; it only relays it
- If a client disconnects, their awareness state is removed after a 30-second grace period (to handle brief disconnects)

---

## Related Documents

- [Sync Protocol](./sync-protocol.md)
- [Conflict Resolution](./conflict-resolution.md)
- [Permissions](./permissions.md)
- [Collaboration](../product/collaboration.md)
