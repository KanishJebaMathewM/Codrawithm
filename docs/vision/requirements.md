# Requirements

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Functional and non-functional requirements derived from the [Problem Statement](problem-statement.md), [User Personas](user-personas.md), and [Feature Catalog](feature-catalog.md). IDs: `FR-NNN` for functional, `NFR-NNN` for non-functional.

---

## Functional Requirements

### Canvas Core

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | The system shall provide an infinite, pannable, and zoomable canvas. | P0 |
| FR-002 | The system shall provide rectangle, ellipse, diamond, line, arrow, and freehand path primitives. | P0 |
| FR-003 | The system shall support inline text editing on any shape. | P0 |
| FR-004 | The system shall provide a connector tool that auto-routes arrows between shapes and updates routes when shapes move. | P0 |
| FR-005 | The system shall support selecting multiple objects via Shift+click and drag-marquee. | P0 |
| FR-006 | The system shall support unlimited undo/redo for all canvas operations. | P0 |
| FR-007 | The system shall auto-save the canvas state at least every 5 seconds. | P0 |
| FR-008 | The system shall provide a minimap navigation overlay for large canvases. | P1 |
| FR-009 | The system shall support creating named frames that act as sections of the canvas. | P1 |
| FR-010 | The system shall provide a code block object with syntax highlighting for 20+ languages. | P0 |

### Collaboration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011 | The system shall support real-time concurrent editing by multiple users on the same canvas. | P0 |
| FR-012 | The system shall display live cursors with user name labels for all connected collaborators. | P0 |
| FR-013 | The system shall generate shareable read-only view links that do not require account creation to access. | P0 |
| FR-014 | The system shall support comment threads attached to specific canvas objects. | P1 |
| FR-015 | The system shall support a follow-presenter mode where one user's viewport is mirrored to all followers. | P1 |
| FR-016 | The system shall support four permission levels per board: Owner, Editor, Commenter, Viewer. | P1 |
| FR-017 | The system shall queue edits made while offline and merge them on reconnection via CRDT. | P2 |

### Algorithm Visualization

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-018 | The system shall provide an Algorithm Visualization workspace type. | P0 |
| FR-019 | The system shall accept user-provided input arrays for sorting algorithm visualization. | P0 |
| FR-020 | The system shall visualize at minimum: bubble sort, selection sort, insertion sort, merge sort, quicksort, and heap sort. | P0 |
| FR-021 | The system shall support step-forward and step-backward navigation through algorithm execution. | P0 |
| FR-022 | The system shall allow users to annotate any step in an algorithm visualization with freeform text. | P0 |
| FR-023 | Share URLs for algorithm visualizations shall preserve algorithm type, input, current step, and annotations. | P0 |
| FR-024 | The system shall support BFS, DFS, Dijkstra, and A* graph algorithm visualizations with custom graphs. | P1 |

### Developer Tools

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-025 | The system shall provide standard flowchart shape symbols. | P1 |
| FR-026 | The system shall provide UML class diagram tooling. | P1 |
| FR-027 | The system shall provide a sequence diagram tool. | P1 |
| FR-028 | The system shall provide an entity-relationship (ER) diagram tool. | P1 |
| FR-029 | The system shall include an architecture-oriented shape library (cloud services, servers, databases). | P1 |

### Import / Export

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-030 | The system shall export the canvas as PNG. | P0 |
| FR-031 | The system shall export the full board as SVG. | P1 |
| FR-032 | The system shall export board data as Codrawithm JSON. | P0 |
| FR-033 | The system shall import a board from Codrawithm JSON. | P0 |
| FR-034 | The system shall export frames as a PDF (one frame per page). | P1 |

### Authentication & User Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-038 | The system shall support email/password authentication. | P0 |
| FR-039 | The system shall support OAuth 2.0 login (GitHub, Google at minimum). | P1 |
| FR-040 | The system shall support guest editing (unauthenticated users with edit links). | P1 |
| FR-041 | The system shall support SAML SSO for self-hosted enterprise deployments. | P2 |

### Plugin System

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-042 | The system shall support a plugin system allowing third-party extensions. | P1 |
| FR-043 | Plugins shall be sandboxed in isolated iframes with postMessage communication. | P1 |
| FR-044 | Plugins shall declare required permissions in a manifest file. | P1 |
| FR-045 | The system shall support an AI provider plugin interface for connecting external AI services. | P1 |

---

## Non-Functional Requirements

### Performance

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-001 | Initial page load (empty board) | < 2 seconds on 4G | Lighthouse |
| NFR-002 | Time to Interactive | < 3 seconds | Core Web Vitals |
| NFR-003 | Canvas render FPS with 500 objects | ≥ 55 fps | Custom perf harness |
| NFR-004 | Canvas render FPS with 5,000 objects | ≥ 30 fps | Custom perf harness |
| NFR-005 | Pan/zoom response latency | < 16 ms | Frame Timing API |
| NFR-006 | Collaboration update round-trip (LAN) | < 100 ms | Custom test harness |
| NFR-007 | Algorithm step playback | < 50 ms per step | Jest benchmark |
| NFR-008 | 3D scene load (10 MB model) | < 5 seconds | Custom loader benchmark |
| NFR-009 | API endpoint p99 response time | < 500 ms | Prometheus histogram |

### Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-010 | Concurrent editors per board | 50 concurrent editors |
| NFR-011 | Max objects per board | 10,000 objects without performance degradation |
| NFR-013 | Horizontal scaling | Backend must scale horizontally; no per-node state |

### Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-014 | Service availability | 99.5% uptime for hosted service |
| NFR-015 | Data durability | No data loss from server-side failure; WAL + daily backups |
| NFR-016 | Graceful degradation | Canvas must be usable read-only if collaboration server is unavailable |

### Security

| ID | Requirement |
|----|-------------|
| NFR-017 | All data in transit must use TLS 1.2 or higher. |
| NFR-018 | No AI provider API keys may be stored in the browser or accessible to untrusted code. |
| NFR-019 | File uploads must be validated for MIME type and size before storage. |
| NFR-020 | Plugins must not have access to the host page DOM outside their sandbox iframe. |
| NFR-021 | All authentication tokens must be short-lived JWT with refresh token rotation. |

### Accessibility

| ID | Requirement |
|----|-------------|
| NFR-022 | The application UI (outside the canvas) shall meet WCAG 2.1 Level AA. |
| NFR-023 | All interactive elements outside the canvas shall be keyboard navigable. |
| NFR-024 | Focus indicators shall meet WCAG 2.1 contrast requirements. |
| NFR-025 | All images and icons shall have alt text or aria-label attributes. |

### Compatibility

| ID | Requirement |
|----|-------------|
| NFR-026 | The application shall function in the latest two major versions of Chrome, Firefox, Safari, and Edge. |
| NFR-027 | The canvas must render correctly on screens from 1280 px wide and above. |
| NFR-028 | Touch gestures (pan, pinch-to-zoom, tap-to-select) must work on iOS Safari and Android Chrome. |

### Maintainability

| ID | Requirement |
|----|-------------|
| NFR-029 | Code coverage for unit tests shall be ≥ 80% for business logic modules. |
| NFR-030 | All public APIs shall have OpenAPI documentation. |
| NFR-031 | The project must be self-hostable via Docker Compose with a single command. |

---

## Related Documents

- [Feature Catalog](feature-catalog.md)
- [Non-Goals](non-goals.md)
- [Success Metrics](success-metrics.md)
- [Performance Engineering](../engineering/performance-engineering.md)
- [Security](../engineering/security.md)
- [Accessibility](../product/accessibility.md)
