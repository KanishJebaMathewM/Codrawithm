# ADR-005: Scene Document Model

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

The scene document model determines how canvas objects are structured in memory and in the CRDT. The model must support efficient rendering, CRDT conflict resolution, and serialization to JSON and binary Yjs formats.

---

## Requirements

- Must be CRDT-compatible — individual fields must be updatable independently.
- Must support undo/redo at the field level.
- Must serialize to human-readable JSON for export.
- Must support efficient spatial indexing for hit testing and viewport culling.

---

## Alternatives Considered

### Option A: Flat Array of Typed Objects

The canvas is a flat array of objects. Each object has a `type` discriminator and type-specific fields. Z-order is array index. No nested scene graph.

```json
{
  "objects": [
    { "id": "rect_1", "type": "rectangle", "x": 100, ... },
    { "id": "arrow_2", "type": "arrow", "startObjectId": "rect_1", ... }
  ]
}
```

**Pros:**
- Simple. Easy to iterate, serialize, and index.
- CRDT-friendly: each object is a `Y.Map`; fields are independent CRDT entries.
- Easy to build a spatial index over a flat list.

**Cons:**
- Groups are expressed as a `groupId` field, not as nested children — requires explicit handling.
- Z-order is array position — reordering requires array mutations.

### Option B: Nested Scene Graph (Tree)

Objects can be children of other objects. Groups are containers.

**Pros:**
- Natural for deeply nested diagrams.
- Inherits transforms (a group's rotation applies to all children).

**Cons:**
- CRDT conflict resolution is much harder for tree structures.
- Spatial indexing requires recursive traversal.
- Serialization and deserialization are more complex.
- Yjs `Y.Array` + `Y.Map` nesting adds complexity.

---

## Decision

**Recommended:** Option A (Flat Array of Typed Objects).

The simplicity and CRDT-compatibility of the flat model outweigh the benefits of a scene graph for Codrawithm's use case. Groups are expressed via a `groupId` reference. Z-order is managed via a separate order array (allowing reordering without shuffling the main objects array).

---

## Consequences

### Positive
- Simple to serialize, iterate, and index.
- CRDT conflicts are field-level (e.g., two users move the same object — one position wins per axis).
- Easy to build the spatial index.

### Negative
- Inherited transforms (e.g., group rotation applying to children) require explicit computation.
- Deep hierarchies are awkward (but Codrawithm does not need them).

### Risks
- Performance of flat array iteration at 10,000+ objects without spatial indexing.
- Mitigation: R-tree spatial index added in Phase 1.

---

## Related ADRs

- [ADR-004: Canvas Rendering Approach](ADR-004-canvas-rendering-approach.md)
- [ADR-008: Real-Time Collaboration](ADR-008-real-time-collaboration.md)
