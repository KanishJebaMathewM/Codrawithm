# Scalability

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document describes how Codrawithm scales to support large canvases (many objects), many concurrent users (per board), and high board count.

---

## Large Canvas Scalability

### Target

- 10,000 objects per board without performance degradation (NFR-011).
- 30 fps at 5,000 objects (NFR-004).

### Techniques

**Viewport culling** (primary): Only objects in the visible viewport are rendered. With 10,000 objects but only 200 visible, the effective rendering load is 200 objects. See [Performance Engineering](performance-engineering.md#1-viewport-culling).

**Spatial index**: R-tree query for visible objects is O(log n), not O(n).

**Yjs CRDT memory**: A board with 10,000 objects in Yjs has a state size of approximately 5–10 MB (estimated). This is stored in the browser's memory. This is acceptable for modern devices (8 GB RAM).

**Serialized JSON size**: A board JSON with 10,000 objects is approximately 5–20 MB depending on object complexity. Stored as compressed BYTEA in PostgreSQL. The backend compresses the Yjs state with LZ4 before storage.

**Lazy loading for history**: Board history snapshots are not loaded until the user opens the history panel.

---

## Concurrent Users Per Board

### Target

50 concurrent editors on a single board (NFR-010).

### Architecture

Each user's browser holds a WebSocket connection to the collaboration server. The server fans out Yjs updates via Redis pub/sub.

**Per-connection resource usage (estimated):**
- Backend memory per WebSocket: ~50–100 KB (connection state, small Yjs client buffer).
- 50 connections = ~5 MB per board in the collaboration server.
- Redis pub/sub message rate: 50 users × 10 updates/second = 500 msg/sec per board.

**Horizontal scaling**: Multiple backend instances can handle different boards. Redis pub/sub routes messages across instances. A single backend instance can handle 500–2,000 concurrent WebSocket connections depending on hardware.

### Follow-Presenter Mode

Follow-presenter mode (1 presenter → many viewers) has a different message pattern:
- Only the presenter sends Yjs updates.
- 500 viewers receive the same update.
- The server fans out to 500 connections.
- Redis pub/sub handles this naturally — one message per board, received by all subscribed connections.

---

## Many Boards Scalability

### PostgreSQL

- Board state stored as BYTEA (Yjs binary) per board.
- Average board state: 100 KB.
- 100,000 boards = 10 GB.
- PostgreSQL handles this comfortably.
- Board metadata is indexed (owner, updated_at, is_deleted).

### Pagination

All list endpoints are paginated (cursor-based). Users never load all boards at once.

---

## Message Fan-out Architecture

```
Client A (send update)
    │
    ▼
Backend Instance 1
    │
    ├── Forward to Client B (direct, same instance)
    │
    └── PUBLISH to Redis channel: board:{id}
                │
                ▼
         Backend Instance 2
                │
                ├── Forward to Client C
                └── Forward to Client D
```

Redis Streams (future) could replace pub/sub for durability, but pub/sub is sufficient for Phase 1 where ephemeral message delivery is acceptable.

---

## Scaling Beyond Single Host

For larger deployments (Phase 3+):

1. **Move PostgreSQL to a managed service** (RDS, Supabase, Neon) with read replicas.
2. **Move Redis to a managed service** (ElastiCache, Upstash) with cluster mode.
3. **Run multiple backend instances** behind a load balancer. No sticky sessions required — Redis pub/sub handles cross-instance communication.
4. **CDN for static assets** (CloudFront, Cloudflare).
5. **Object storage** stays on S3 (or equivalent) — already horizontally scalable.

---

## Limitations and Known Ceilings

| Limitation | Current Ceiling | Mitigation |
|-----------|----------------|-----------|
| Objects per board | 10,000 (30 fps) | WebGL renderer for higher counts |
| Concurrent editors | 50 (target) | Untested beyond 50 — needs load test |
| WebSocket connections per instance | ~2,000 | Horizontal scaling |
| Board JSON size | ~20 MB (in-browser memory) | Object count limits; streaming load for large boards |
| Yjs CRDT state size | ~10 MB | Periodic GC (`ydoc.gc = true`) |

---

## Related Documents

- [Performance Engineering](performance-engineering.md)
- [Deployment Architecture](../architecture/deployment-architecture.md)
- [Collaboration Engine](../architecture/collaboration-engine.md)
