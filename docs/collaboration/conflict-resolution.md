# Conflict Resolution

**Status:** Proposed  
**Audience:** Backend engineers, collaboration engineers  
**Last Reviewed:** 2024-01-15

## Overview

Codrawithm uses Yjs CRDTs for conflict-free collaborative editing. This document explains what "conflict-free" actually means in practice, covers edge cases, and defines the collaborative undo/redo semantics.

---

## What "Conflict-Free" Means

In a CRDT-based system, there are no conflicts in the traditional sense — every concurrent edit is valid and will be merged. The question is not "who wins?" but "what is the deterministic merge result?"

Yjs guarantees:
- **Strong eventual consistency**: all clients that receive the same set of updates converge to the same state, regardless of the order they received them
- **Commutativity**: applying updates A then B gives the same result as B then A
- **Idempotency**: applying the same update multiple times has no extra effect

---

## Merge Scenarios

### Scenario 1: Concurrent Property Changes on Different Objects

**Setup:** User A moves shape S1. User B simultaneously moves shape S2.

**Result:** Both moves are applied. No conflict. Each object's position updates independently.

---

### Scenario 2: Concurrent Property Changes on the Same Object

**Setup:** User A changes shape S1's fill color to red. User B simultaneously changes S1's fill color to blue.

**Yjs behaviour:** Each `Y.Map` key is independently versioned. Last-writer-wins per key, determined by Yjs's logical clock (Lamport timestamp + client ID).

**Result:** One color wins deterministically. Both users will see the same final color. The losing user's change is overwritten (not an error — this is intentional last-write-wins semantics for properties).

**Design implication:** For properties where last-write-wins is unacceptable (e.g. object position during simultaneous drag), consider operational throttling (send updates only on pointerup, not every pointermove).

---

### Scenario 3: Concurrent Text Editing

**Setup:** User A types "Hello" and User B types "World" at the same position in a text object.

**Yjs behaviour:** `Y.Text` uses CRDT character insertion. Characters from both users are preserved and interleaved by insertion position and client ID.

**Result:** Something like "HWeolllrod" or a similar interleaving. Not ideal for prose, but correct for collaborative text. In practice, users tend to edit different positions and conflicts are rare.

---

### Scenario 4: Concurrent Object Creation

**Setup:** User A creates shape S1 at position (100, 100). User B simultaneously creates shape S2 at the same position.

**Result:** Both shapes are created. They are overlapping but distinct objects with unique IDs. Users can manually separate them.

---

### Scenario 5: Delete While Editing

**Setup:** User A is editing the text in shape S1. User B deletes S1.

**Yjs behaviour:** Deletion wins. S1 is removed from the document.

**Result:** User A's text edits are lost. The object no longer exists. User A's UI shows the object disappearing mid-edit.

**Mitigation:** Show a toast notification: "An object you were editing was deleted by another collaborator."

---

### Scenario 6: Concurrent Group/Ungroup

**Setup:** User A groups objects [S1, S2, S3]. User B simultaneously ungroups the same objects.

**Result:** CRDT semantics apply to the group membership array. The result may be unexpected. 

**Mitigation (planned):** Group operations should be treated as atomic transactions. If the outcome is ambiguous, surface a notification: "A grouping conflict occurred. Please review the result."

---

### Scenario 7: Move Object Into/Out of Frame

**Setup:** User A moves shape S1 into Frame F1. User B simultaneously deletes Frame F1.

**Result:** S1 still exists (deletion of frame doesn't delete its children by default). F1 is removed. S1 is now a top-level object.

---

## Undo/Redo in Collaborative Mode

Standard undo is not straightforward in a multi-user environment. Yjs provides `UndoManager` which handles this correctly.

### Yjs UndoManager Behaviour

- Each client has its own `UndoManager` instance
- `UndoManager` only tracks **the local client's own changes**
- Undoing does not affect other users' edits
- Undoing restores the document to what it was before the local user's last edit, while preserving all other users' changes

### Example

1. User A creates Shape S1
2. User B moves Shape S1 to position (200, 200)
3. User A presses Ctrl+Z (undo)

**Result:** S1 is deleted (User A's creation is undone). User B's move is already incorporated but moot since the object is deleted.

### Undo Scope

```typescript
const undoManager = new Y.UndoManager(
  [objects, pages, pageMeta, pageObjects], // types to track
  {
    captureTimeout: 500,  // group changes within 500ms into one undo step
    trackedOrigins: new Set([clientId])  // only track this client's changes
  }
)
```

### Known Limitation

In complex collaborative scenarios, undo can produce surprising results because the document state has diverged from what the undoing user "remembers". This is a fundamental property of collaborative undo and is documented as expected behaviour, not a bug.

---

## Version History

Beyond undo/redo, Codrawithm will maintain explicit version snapshots:

- Automatic snapshot every 5 minutes of active collaboration
- Named checkpoints (user-created)
- Restore from snapshot replaces the current Y.Doc state

Snapshots are independent of the CRDT update log. Restoring a snapshot is a destructive operation that must be confirmed (and creates a new snapshot of the pre-restore state).

---

## Related Documents

- [Sync Protocol](./sync-protocol.md)
- [Presence and Cursors](./presence-and-cursors.md)
- [Permissions](./permissions.md)
- [Collaboration Engine Architecture](../architecture/collaboration-engine.md)
