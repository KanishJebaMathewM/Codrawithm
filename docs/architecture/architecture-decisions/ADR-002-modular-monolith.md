# ADR-002: Modular Monolith Backend

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

The backend architecture must handle: REST API requests, WebSocket connections for real-time collaboration, file uploads, and AI proxying. The question is whether to build these as a single monolith, a modular monolith, or a microservices architecture.

---

## Requirements

- Must be deployable as a single Docker container for self-hosted simplicity.
- Must allow future extraction of high-load components (WebSocket server) into separate services.
- Must have clear module boundaries to support community contributions without deep architectural knowledge.
- Must handle WebSocket + REST in the same process (for simplicity of initial deployment).

---

## Alternatives Considered

### Option A: Modular Monolith

A single Rust binary with well-defined internal modules (auth, boards, collaboration, AI proxy, assets). All modules share the same process but are organized as distinct Rust modules with explicit trait-based interfaces between them.

**Pros:**
- Simple deployment: one Docker container to run.
- Shared database connection pool (no cross-service network calls).
- Low operational complexity for self-hosters.
- Clear module boundaries make future extraction to microservices feasible.
- Easy contributor onboarding — one repo, one binary.

**Cons:**
- Modules cannot be scaled independently.
- A bug in one module could crash the entire process.

### Option B: Microservices

Separate services: `auth-service`, `board-service`, `collab-service`, `ai-proxy`, `asset-service`.

**Pros:**
- Each service scales independently.
- Technology diversity possible (e.g., Node.js for one service, Rust for another).
- Fault isolation — a crash in one service doesn't affect others.

**Cons:**
- Dramatically increases operational complexity for self-hosters.
- Multiple containers, service discovery, inter-service auth, distributed tracing.
- Network latency between services.
- Overkill for an early-stage project with one active developer.
- Harder for community contributors to navigate.

### Option C: Serverless Functions

Backend logic deployed as serverless functions (AWS Lambda, Cloudflare Workers).

**Pros:**
- No server management.
- Auto-scaling.

**Cons:**
- WebSocket long-lived connections are incompatible with the stateless function model.
- Cold start latency is unacceptable for a collaborative real-time tool.
- Self-hosting is not possible.

---

## Decision

**Recommended:** Option A (Modular Monolith).

For an early-stage open-source project with self-hosting as a first-class requirement, a modular monolith is the right balance. The internal module structure mirrors how a microservices architecture would look — making future extraction feasible — but deployment and contribution remain simple.

---

## Consequences

### Positive
- `docker compose up` starts the entire backend.
- Contributors modify a single codebase.
- No inter-service communication complexity.

### Negative
- Cannot scale the collaboration server independently of the REST API (both run in the same process).
- Mitigation: Redis pub/sub enables horizontal scaling by running multiple instances of the whole binary.

### Risks
- If one module has a critical bug causing a panic, it crashes the whole process.
- Mitigation: Rust's `catch_unwind` and Tokio's task isolation prevent panics in one task from killing others; health checks restart the container.

---

## Evidence / Proof-of-Concept Needed

- Verify that running 2 instances of the monolith with shared Redis correctly fans out WebSocket messages.

---

## Related ADRs

- [ADR-009: Backend Language & Framework](ADR-009-backend-language-framework.md)
- [ADR-008: Real-Time Collaboration](ADR-008-real-time-collaboration.md)
