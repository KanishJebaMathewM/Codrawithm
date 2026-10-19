# ADR-010: Database and Storage

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

Codrawithm needs persistent storage for: user accounts, board metadata, CRDT state (binary), comments, assets metadata, and versioned history. It also needs ephemeral storage for real-time presence and pub/sub, and object storage for uploaded images.

---

## Requirements

- Must store structured relational data (users, boards, members, comments).
- Must store binary CRDT state efficiently.
- Must support JSONB for flexible board settings/metadata.
- Must support a self-hosted object storage option.
- Must be deployable via Docker Compose on a single host.

---

## Alternatives Considered

### PostgreSQL + Redis + S3-compatible (MinIO)

**PostgreSQL** for primary relational data and binary CRDT state.  
**Redis** for pub/sub and ephemeral presence.  
**MinIO** for object storage (self-hosted S3-compatible).

**Pros:**
- PostgreSQL's JSONB and BYTEA handle the data model well.
- PostgreSQL is the most robust open-source relational DB.
- Redis pub/sub is the standard approach for WebSocket fan-out.
- MinIO provides full S3 API compatibility for self-hosted.
- All three are well-supported in Rust (sqlx, redis-rs, aws-sdk-s3).

**Cons:**
- Three separate storage systems to operate.

### SQLite + LiteFS

A single SQLite database with LiteFS for replication.

**Pros:**
- Simpler deployment.
- No separate database process.

**Cons:**
- Write scalability is limited.
- LiteFS adds complexity for replication.
- Not as well-suited for concurrent WebSocket writes.

### MongoDB

Document database; JSONB replacement.

**Pros:**
- Flexible document model.

**Cons:**
- Less strong consistency guarantees.
- Heavier resource usage.
- Fewer Rust ODM options.

---

## Decision

**Recommended:** PostgreSQL + Redis + S3-compatible (MinIO for self-hosted, AWS S3 for cloud).

This is the industry-standard stack for a real-time collaborative web application. All three are mature, well-documented, and have strong Rust library support.

---

## Consequences

### Positive
- PostgreSQL ACID guarantees for board state.
- JSONB for flexible board settings without schema migrations.
- BYTEA for efficient binary CRDT state storage.
- Redis pub/sub scales WebSocket fan-out across multiple backend instances.
- MinIO gives self-hosters a full S3-compatible store without AWS.

### Negative
- Three storage systems to monitor and back up.

### Risks
- MinIO version upgrades may have breaking changes. Mitigation: pin MinIO version; test upgrades before deploying.

---

## Related ADRs

- [ADR-002: Modular Monolith](ADR-002-modular-monolith.md)
- [ADR-008: Real-Time Collaboration](ADR-008-real-time-collaboration.md)
- [ADR-009: Backend Language & Framework](ADR-009-backend-language-framework.md)
