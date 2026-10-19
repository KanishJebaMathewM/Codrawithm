# ADR-007: State Management

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

The frontend has two distinct categories of state:
1. **Server state** — data that lives on the backend (boards list, user profile, board metadata). Needs caching, background refetch, optimistic updates.
2. **Client state** — ephemeral UI state and the canvas state that is synchronized via Yjs (selected objects, active tool, viewport, UI panel open/closed).

A state management approach that handles both poorly creates complexity. The right approach may use different tools for each category.

---

## Requirements

- Must handle server state with caching and optimistic updates.
- Must handle canvas UI state (active tool, selection, viewport) with minimal re-renders.
- Must integrate with Yjs for CRDT-backed canvas object state.
- Must have strong TypeScript support.
- Must not require excessive boilerplate.

---

## Alternatives Considered

### Option A: Zustand (client state) + TanStack Query (server state)

Separate tools for separate concerns:
- **Zustand**: minimal, non-opinionated state management for client state.
- **TanStack Query**: server state caching, background sync, optimistic mutations.

**Pros:**
- Right tool for each job.
- Zustand has minimal boilerplate; slice pattern for modular stores.
- TanStack Query is the community standard for server state in React.
- Both have excellent TypeScript support.

**Cons:**
- Two libraries to learn.

### Option B: Redux Toolkit + RTK Query

Redux Toolkit for global state; RTK Query for API calls.

**Pros:**
- Battle-tested; used at scale.
- RTK Query handles caching well.
- Redux DevTools for time-travel debugging.

**Cons:**
- Higher boilerplate than Zustand.
- Redux's serializable state constraint conflicts with canvas objects (which contain non-serializable functions).
- Redux performance with large canvas state (10,000+ objects) is a concern.

### Option C: Jotai / Recoil (Atomic State)

Atom-based state where each piece of state is an independent atom.

**Pros:**
- Fine-grained reactivity.
- Easy to reason about individual state pieces.

**Cons:**
- Atom proliferation — managing hundreds of atoms for canvas state becomes complex.
- Less idiomatic for the canvas use case.

---

## Decision

**Recommended:** Option A (Zustand + TanStack Query).

The dual-library approach cleanly separates server state from client state. Zustand's minimal API is ideal for canvas state where performance matters. TanStack Query handles all the complexity of server state lifecycle.

---

## Consequences

### Positive
- Canvas state updates are efficient — Zustand notifies only subscribers to changed slices.
- Server state is handled declaratively with caching, background refetch, and optimistic updates.
- Minimal boilerplate.

### Negative
- Two different mental models for state management.
- Mitigation: Canvas state (Zustand) and server state (TanStack Query) have clear, non-overlapping responsibilities.

### Risks
- Large Zustand stores may cause unnecessary re-renders if not structured carefully.
- Mitigation: Use selector functions to subscribe only to needed state slices.

---

## Related ADRs

- [ADR-003: Frontend Framework](ADR-003-frontend-framework.md)
- [ADR-008: Real-Time Collaboration](ADR-008-real-time-collaboration.md)
