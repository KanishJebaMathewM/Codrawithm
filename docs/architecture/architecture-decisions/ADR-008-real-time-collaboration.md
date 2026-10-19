# ADR-008: Real-Time Collaboration

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

Real-time multi-user editing is a core feature. The collaboration system must handle concurrent edits, offline editing, and presence (cursor sharing). The key question is whether to use a CRDT-based approach, an OT (Operational Transformation) approach, or a simpler last-write-wins model.

---

## Requirements

- Must support concurrent editing by ≥ 50 users on a single board without conflicts.
- Must converge to the same state on all clients without data loss.
- Must support offline editing and merge on reconnect.
- Must transmit presence (cursor positions) in real time.
- Must be implementable with available open-source libraries.

---

## Alternatives Considered

### Option A: Yjs CRDT

Yjs is an open-source CRDT library. Board state is a Yjs document. Clients sync binary state updates over WebSocket.

**Pros:**
- Proven in production (TipTap, Hocuspocus, Liveblocks uses CRDT internally).
- Offline support via y-indexeddb.
- Awareness protocol for presence built in.
- Binary encoding is efficient.
- No server-side merge logic — the backend is a dumb relay.
- React hooks available.

**Cons:**
- Binary format is hard to debug.
- Merge semantics can surprise users (concurrent deletions).
- Yjs update must not be lost (requires durable delivery or recompute from snapshot).

### Option B: ShareDB (Operational Transformation)

ShareDB is an OT-based collaboration library (used by Quill, CodeMirror 5).

**Pros:**
- Well-established; used in Google Docs-style collaboration.
- Operations are JSON — easier to debug.

**Cons:**
- OT requires a central server to sequence operations.
- Server cannot be scaled horizontally without complex coordination.
- Less suitable for spatial canvas data than text documents.
- No built-in awareness/presence protocol.

### Option C: Last-Write-Wins with WebSocket Broadcast

Each edit is broadcast to all clients. No conflict resolution — last write wins on the server.

**Pros:**
- Simplest implementation.

**Cons:**
- Data loss on concurrent edits to the same field.
- No offline support.
- Not acceptable for a collaborative tool.

---

## Decision

**Recommended:** Option A (Yjs CRDT).

Yjs is the clear choice for a browser-native collaborative canvas tool. Its conflict-free merge semantics, offline support, and awareness protocol align perfectly with Codrawithm's requirements. The backend collaboration server is a simple WebSocket relay + Redis pub/sub fan-out, with periodic CRDT snapshot persistence.

---

## Consequences

### Positive
- Concurrent edits converge automatically.
- Offline edits sync seamlessly on reconnect.
- Presence (cursors) is handled by the awareness protocol.
- Backend is a stateless relay — scales horizontally.

### Negative
- CRDT overhead: binary Yjs state is larger than plain JSON.
- Yjs merge semantics for array insertions (object creation order on concurrent add) may be non-intuitive.

### Risks
- CRDT state can grow unbounded if not compacted. Mitigation: periodic GC via `ydoc.gc = true`.
- Lost WebSocket updates must be recovered from snapshot. Mitigation: SyncStep2 on reconnect resyncs from last known state.

---

## Evidence / Proof-of-Concept Needed

- Verify Yjs sync round-trip with 50 concurrent clients on a single board.
- Measure binary Yjs state size for a board with 1,000 objects.

---

## Related ADRs

- [ADR-002: Modular Monolith](ADR-002-modular-monolith.md)
- [ADR-005: Scene Document Model](ADR-005-scene-document-model.md)
- [ADR-007: State Management](ADR-007-state-management.md)
