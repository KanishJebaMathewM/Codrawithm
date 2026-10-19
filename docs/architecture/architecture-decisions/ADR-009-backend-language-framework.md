# ADR-009: Backend Language and Framework

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

The backend must handle high-throughput WebSocket connections for real-time collaboration, REST API requests, and background tasks. The language and framework choice affects performance, safety, contributor accessibility, and long-term maintenance.

---

## Requirements

- Must handle thousands of concurrent WebSocket connections efficiently.
- Must be memory-safe by default.
- Must have async support for non-blocking I/O.
- Must have libraries for PostgreSQL, Redis, S3, WebSocket, JWT.
- Must compile to a single self-contained binary for simple deployment.

---

## Alternatives Considered

### Option A: Rust + Axum

Rust is a systems language with memory safety guarantees. Axum is a Tokio-based web framework.

**Pros:**
- Memory safety without garbage collection — no GC pauses, predictable latency.
- Tokio async runtime handles millions of concurrent connections efficiently.
- Axum + Tower middleware composability.
- Single binary deployment.
- `sqlx` for async PostgreSQL with compile-time query checking.
- Growing open-source backend community.

**Cons:**
- Steeper learning curve than Node.js or Go.
- Slower initial development velocity.
- Smaller pool of contributors familiar with Rust.

### Option B: Node.js + Fastify (or Express)

**Pros:**
- Largest contributor pool.
- Excellent WebSocket libraries.
- Fastest initial development.
- Easy JSON handling (same language as frontend).

**Cons:**
- Single-threaded with GC pauses.
- Memory usage per connection is higher than Rust.
- Type safety requires TypeScript everywhere and is still less strict than Rust.
- Large `node_modules` in Docker images.

### Option C: Go + Gin (or Fiber)

**Pros:**
- Excellent concurrency model (goroutines).
- Simple deployment (single binary).
- Good performance.
- Growing community.

**Cons:**
- No compile-time query checking equivalent to sqlx.
- Error handling is more verbose.
- Less familiarity in the frontend/full-stack contributor community.

---

## Decision

**Recommended:** Option A (Rust + Axum).

The collaboration server handles potentially thousands of long-lived WebSocket connections. Rust's async performance and predictable latency (no GC) are significant advantages here. While the learning curve is higher, the collaboration server is a relatively contained module — contributors can work on the REST API modules without needing deep Rust expertise for the WS layer.

---

## Consequences

### Positive
- Predictable latency for WebSocket message fan-out.
- Single binary deployment reduces Docker image size.
- Memory safety eliminates a class of runtime bugs.

### Negative
- Higher barrier to entry for contributors.
- Mitigation: Detailed contributor documentation; REST API modules use straightforward patterns.

### Risks
- Rust compile times can be slow in CI. Mitigation: sccache for build caching.

---

## Evidence / Proof-of-Concept Needed

- Benchmark Axum WebSocket handler at 1,000 concurrent connections.

---

## Related ADRs

- [ADR-002: Modular Monolith](ADR-002-modular-monolith.md)
- [ADR-010: Database and Storage](ADR-010-database-and-storage.md)
