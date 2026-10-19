# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for Codrawithm. ADRs document significant technical decisions, their context, the alternatives considered, and the rationale for the chosen approach.

**Status values:** Proposed · Under Review · Accepted · Superseded · Deprecated

---

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-web-first-architecture.md) | Web-First Architecture | Proposed | 2024-01-15 |
| [ADR-002](ADR-002-modular-monolith.md) | Modular Monolith Backend | Proposed | 2024-01-15 |
| [ADR-003](ADR-003-frontend-framework.md) | Frontend Framework | Proposed | 2024-01-15 |
| [ADR-004](ADR-004-canvas-rendering-approach.md) | Canvas Rendering Approach | Proposed | 2024-01-15 |
| [ADR-005](ADR-005-scene-document-model.md) | Scene Document Model | Proposed | 2024-01-15 |
| [ADR-006](ADR-006-3d-rendering-framework.md) | 3D Rendering Framework | Proposed | 2024-01-15 |
| [ADR-007](ADR-007-state-management.md) | State Management | Proposed | 2024-01-15 |
| [ADR-008](ADR-008-real-time-collaboration.md) | Real-Time Collaboration | Proposed | 2024-01-15 |
| [ADR-009](ADR-009-backend-language-framework.md) | Backend Language & Framework | Proposed | 2024-01-15 |
| [ADR-010](ADR-010-database-and-storage.md) | Database and Storage | Proposed | 2024-01-15 |
| [ADR-011](ADR-011-ai-provider-integration.md) | AI Provider Integration | Proposed | 2024-01-15 |
| [ADR-012](ADR-012-plugin-sandboxing.md) | Plugin Sandboxing | Proposed | 2024-01-15 |
| [ADR-013](ADR-013-authentication-approach.md) | Authentication Approach | Proposed | 2024-01-15 |
| [ADR-014](ADR-014-open-source-license.md) | Open-Source License | Proposed | 2024-01-15 |
| [ADR-015](ADR-015-performance-measurement.md) | Performance Measurement | Proposed | 2024-01-15 |

---

## How to Write an ADR

Copy the template below. File name: `ADR-NNN-short-title.md`.

```markdown
# ADR-NNN: Title

**Status:** Proposed
**Date:** YYYY-MM-DD
**Deciders:** Community (awaiting maintainer review)

## Context
## Requirements
## Alternatives Considered
### Option A
### Option B
## Decision
**Recommended:** Option X
## Consequences
### Positive
### Negative
### Risks
## Evidence / Proof-of-Concept Needed
## Related ADRs
```

## Process

1. Open a PR with the new ADR file.
2. Community discussion happens in the PR.
3. A maintainer updates the status to **Accepted** and merges, or **Superseded** with a reference to the newer ADR.
