# Collaboration

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document describes the user-facing collaboration features of Codrawithm. For technical implementation details, see [Collaboration Engine](../architecture/collaboration-engine.md), [Sync Protocol](../collaboration/sync-protocol.md), and [Presence & Cursors](../collaboration/presence-and-cursors.md).

---

## Real-Time Co-editing

Multiple users can edit the same board simultaneously. Changes made by any collaborator appear on all other users' screens in real time.

**What "real time" means in Codrawithm:**
- Change visibility latency target: < 200 ms on LAN, < 500 ms on standard broadband.
- There are no "locks" — any user can edit any object at any time.
- Conflicts are resolved automatically via CRDT semantics (last-write-wins per field, with no data loss).
- If two users move the same shape at the same time, both movements register and the shape ends up at the last position sent to the server.

**Supported operations for real-time co-editing:**
- Adding, moving, resizing, rotating, deleting objects.
- Editing text labels inline.
- Creating and deleting connectors.
- Adding/removing annotations.
- Stepping through algorithm visualizations (each user can have their own step position — step positions are per-user, not shared).

---

## Live Cursors

Every connected user's cursor is visible to all other users on the board.

**Cursor appearance:**
- A small arrow cursor shape.
- The user's display name shown in a pill label next to the cursor.
- A unique color assigned per user (consistent across sessions — stored in user profile).

**Cursor behavior:**
- Cursor position is broadcast on every `pointermove` event (throttled to 30 fps).
- Cursors fade out after 3 seconds of inactivity (mouse not moved).
- When the cursor is outside the visible viewport, a chevron indicator appears at the viewport edge pointing toward where that user's cursor is.

---

## Presence Indicators

The top toolbar shows who is currently on the board.

**Avatar stack:** Up to 5 user avatars are shown. If more than 5 are connected, a count badge appears (e.g., "+8").

**Tooltip:** Hovering over an avatar shows the user's name and their current role (Owner, Editor, Commenter, Viewer).

**Click to follow:** Clicking an avatar in the presence stack jumps your viewport to that user's current position (a one-time pan; does not lock you into following them permanently).

---

## Sharing and Access

### Share Link Types

| Link Type | Description | Requires Account? |
|-----------|-------------|------------------|
| View-only link | Recipient can view but not edit | No |
| Comment link | Recipient can view and comment | Optional |
| Edit link | Recipient can edit the board | Recommended (guest edit possible) |
| Follow-presenter link | Recipient joins in follow-presenter mode | No |

### Sharing Dialog

Access via: toolbar share button → "Share" panel.

Options:
- **Copy view link** — immediate, one click.
- **Copy edit link** — shows a confirmation if the board is set to private.
- **Invite by email** — sends an invitation email with a link.
- **Change access level** — sets the default access for anyone with the link: Can View / Can Comment / Can Edit.

---

## Comment Threads

Comment threads attach asynchronous discussion to specific canvas objects or locations.

### Creating a Comment

- Right-click any object → "Add Comment."
- Click the comment icon in the toolbar, then click anywhere on the canvas.
- Keyboard: `Ctrl+Shift+M` with an object selected.

### Comment Thread UI

```
┌─────────────────────────────────────────────────────┐
│ 👤 Alex Chen  · 2 hours ago                         │
│ "This service should probably have a circuit breaker │
│  in front of the DB call."                          │
│ [Reply]  [Resolve ✓]                                │
├─────────────────────────────────────────────────────┤
│ 👤 Maya Patel  · 1 hour ago                         │
│ "Agreed. I'll add it to the backlog."               │
│ [Reply]  [Resolve ✓]                                │
└─────────────────────────────────────────────────────┘
```

- **Resolve:** Marks the thread as resolved. Resolved threads are hidden by default (toggle "Show resolved" to view them).
- **Badge:** An unresolved thread shows a red dot badge on the object.
- **Notifications:** Comment authors receive in-app notifications (and optional email) when their thread receives a reply.

### Comment Search

Board sidebar → Comments panel shows all comment threads in order of recency. Each entry shows a preview and navigates to the thread on click.

---

## Offline Editing

If a user loses their connection, the canvas remains editable in a read-write degraded mode.

**What works offline:**
- All canvas operations (draw, move, resize, delete, type).
- Undo/redo.

**What does not work offline:**
- Seeing other users' changes.
- Saving to the server.
- Real-time collaboration features.

A banner is shown: "You are offline. Changes will sync when you reconnect."

**Reconnection:** When the connection is restored, all offline changes are merged with the server state via the Yjs CRDT sync protocol. See [Offline Mode](../collaboration/offline-mode.md) for details.

---

## Board Permission Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full access: edit, share, delete board, manage permissions. |
| **Editor** | Can edit all canvas content, add comments, invite others up to Editor level. |
| **Commenter** | Can view and add comments. Cannot edit canvas objects. |
| **Viewer** | Read-only. Cannot comment or edit. |

**Changing roles:**
- Owners can change any user's role.
- Editors can invite up to Editor level.
- Role changes take effect immediately.

**Guest access:**
- Users without an account can be granted view-only or comment access via a link.
- Guest edit access (unauthenticated users editing) is disabled by default and can be enabled per-board by the owner.

---

## Board History and Versioning

**Auto-save history:** The backend stores a snapshot of the board state every 10 minutes. Up to 30 days of history is retained on the free tier (90 days on Pro).

**Named versions:** Users can manually create a named snapshot: File → "Save Version As..." — useful for checkpointing before a major change.

**History browser:** Board Settings → History panel shows the timeline of snapshots. Each entry shows the date, time, and number of changes since the previous snapshot. Click to preview; click "Restore" to roll back.

---

## Related Documents

- [Collaboration Engine](../architecture/collaboration-engine.md)
- [Sync Protocol](../collaboration/sync-protocol.md)
- [Presence & Cursors](../collaboration/presence-and-cursors.md)
- [Permissions](../collaboration/permissions.md)
- [Offline Mode](../collaboration/offline-mode.md)
- [Teaching & Presentations — Follow-Presenter](teaching-and-presentations.md#follow-presenter-mode)
