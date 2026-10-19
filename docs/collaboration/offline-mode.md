# Offline Mode

**Status:** Proposed (Phase 3+)  
**Audience:** Frontend engineers, backend engineers  
**Last Reviewed:** 2024-01-15

## Overview

Offline editing support allows users to continue working on a board when their network connection is interrupted. Changes made offline are automatically synchronized when the connection is restored. This document defines the planned approach and known limitations.

> **Note:** Full offline mode is not planned for the initial MVP (Phase 1) or Phase 2. This document describes the intended architecture for Phase 3 and beyond.

---

## Offline Strategy

Codrawithm uses Yjs's built-in offline resilience. Because all edits are represented as CRDT operations, they can be:
1. Applied locally without network access
2. Stored in the browser
3. Merged with the server's state when reconnected — guaranteed to converge

### Local Storage Backend

Yjs updates are persisted locally using [y-indexeddb](https://github.com/yjs/y-indexeddb) (MIT license), which stores the Y.Doc state in the browser's IndexedDB.

```typescript
import { IndexeddbPersistence } from 'y-indexeddb'

const persistence = new IndexeddbPersistence(`board-${boardId}`, doc)

persistence.on('synced', () => {
  // Local state restored from IndexedDB
  console.log('Local board state loaded')
})
```

**Storage limits:** IndexedDB has generous quotas (typically GBs), but large boards with many assets need care. Asset binaries (images) are stored in object storage, not in the Y.Doc — only references are stored locally.

---

## Offline Edit Flow

```
User opens board
       │
       ├─ Online: Load from server, sync Y.Doc
       │          IndexedDB updated with server state
       │
       └─ Offline: Load from IndexedDB
                   Show "Working offline" banner
                   Continue editing locally
                          │
                    Connection restored
                          │
                    WebSocket reconnects
                    Client sends offline updates
                    Server merges (CRDT)
                    Server sends missing server-side updates
                    Both sides converge
                    Banner dismissed
```

---

## Reconnection Handling

On reconnect, the client and server exchange Yjs sync messages:

1. **Client → Server:** `syncStep1` message containing client's current state vector
2. **Server → Client:** Missing updates the client hasn't seen
3. **Client → Server:** Missing updates the server hasn't seen (offline edits)
4. Both apply the other's updates — CRDT guarantees convergence

This is handled automatically by `y-websocket` / the Yrs WebSocket provider.

### Reconnection with Exponential Backoff

```typescript
// Reconnect configuration
const wsProvider = new WebsocketProvider(serverUrl, boardId, doc, {
  connect: true,
  params: { token: authToken },
  WebSocketPolyfill: WebSocket,
  resyncInterval: 5000,  // re-sync every 5s even if connected (catches drift)
  maxBackoffTime: 30000, // max 30s between reconnect attempts
})

wsProvider.on('status', ({ status }) => {
  if (status === 'disconnected') {
    showOfflineBanner()
  } else if (status === 'connected') {
    hideOfflineBanner()
  }
})
```

---

## Offline Limitations

| Feature | Offline Behaviour |
|---------|------------------|
| Drawing, editing, deleting | ✅ Works offline (CRDT) |
| Undo/redo | ✅ Works offline |
| Asset upload (images) | ❌ Queued, uploaded on reconnect |
| AI features | ❌ Requires server connection |
| Collaboration cursors | ❌ Not visible offline |
| Comments and mentions | ❌ Queued, sent on reconnect |
| Permission changes | ❌ Stale until reconnect |
| Sharing and exports | ❌ Requires server connection |
| New boards (creation) | ❌ Requires server connection |

---

## Offline Indicator

When offline, the UI shows:
- A persistent top banner: "⚠ Working offline — changes will sync when reconnected"
- Autosave indicator shows "Saved locally"
- Share button is disabled
- AI panel shows "Requires internet connection"
- A reconnection status with animated spinner and retry button

---

## Conflict Resolution After Reconnect

CRDT semantics handle merge automatically. However, users should be informed of significant changes:

**After reconnect, if the server state has significant divergence:**
- Show a brief notification: "Board updated by collaborators while you were offline"
- The board reflects the merged state automatically
- No manual conflict resolution is required

**Edge case — permission revoked offline:**
- If a user's access was revoked while they were offline, the reconnect handshake will fail auth validation
- The user is shown: "Your access to this board has been revoked"
- Local IndexedDB state is cleared

---

## Local-First Boards (Planned Feature)

A future feature is fully local boards that never require a server:

- Board stored only in IndexedDB + optional file export
- No account required
- No collaboration
- Export to JSON/PNG/SVG
- Import back from JSON

This enables Codrawithm to work as a fully local tool for users who don't need cloud features.

---

## Related Documents

- [Sync Protocol](./sync-protocol.md)
- [Conflict Resolution](./conflict-resolution.md)
- [Permissions](./permissions.md)
