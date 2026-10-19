# ADR-001: Web-First Architecture

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

Codrawithm needs to decide whether to build a native desktop application (Electron, Tauri, Swift, etc.) or a web-first application. This decision affects the distribution model, collaboration infrastructure, and long-term maintenance burden.

---

## Requirements

- Must support real-time multi-user collaboration without requiring peer-to-peer networking setup.
- Must be self-hostable by engineering teams with a single command.
- Must support the target audience (developers on all major OSes) without a platform-specific distribution.
- Must be accessible to users without installing software.

---

## Alternatives Considered

### Option A: Web-First (Browser Application)

The application runs entirely in the browser. A backend server hosts the collaboration infrastructure and data persistence. Users access via URL — no installation required.

**Pros:**
- Zero installation friction. Any device with a modern browser works.
- Real-time collaboration is natural (server mediates WebSocket connections).
- Cross-platform by default.
- Self-hosting means deploying a web server + database — familiar to developers.
- Updates deploy instantly without user action.

**Cons:**
- No offline-first capability by default (mitigated by IndexedDB + Yjs offline support).
- Browser API limitations (file system access, native OS integrations).
- Tab/window management is more cumbersome than native windows.

### Option B: Desktop Native (Electron / Tauri)

A native desktop application wrapping a web view, distributed as a binary.

**Pros:**
- Deeper OS integration (native file system, menu bar, notifications).
- Better offline support by default.
- Perceived performance advantage (no browser overhead, though mostly negligible).

**Cons:**
- Distribution complexity: separate builds for macOS (Intel + ARM), Windows, Linux.
- Auto-update infrastructure required.
- Real-time collaboration requires either a central server anyway or complex P2P setup.
- Larger maintenance burden (OS-specific bugs, code signing, notarization).
- Installation barrier reduces casual adoption.

### Option C: Progressive Web App (PWA)

A web application with PWA features: service worker for offline, installable to home screen.

**Pros:**
- Best of both worlds: web accessibility + some offline and installable features.
- Works in browsers without installation.
- Installable for users who want the native-like experience.

**Cons:**
- PWA offline sync + Yjs CRDT conflict resolution is complex but solvable.
- PWA installation prompts have inconsistent browser support.

---

## Decision

**Recommended:** Option A (Web-First) with PWA features added incrementally.

The primary audience (developers, learners, educators) all have modern browsers. The collaboration requirement makes a central server necessary regardless of platform. Web-first minimizes distribution complexity and removes the installation barrier — critical for adoption.

PWA features (offline cache, installability) can be added in Phase 2 without changing the fundamental architecture.

---

## Consequences

### Positive
- No download friction for new users.
- Collaboration infrastructure is straightforward (WebSocket server).
- Self-hosting is a familiar `docker compose up` workflow.
- Single codebase for all platforms.

### Negative
- Canvas performance is bounded by browser rendering capabilities (not a concern for targets in NFR-003/NFR-004).
- No native OS integrations (file system, menu bar) without extensions.

### Risks
- Browser API deprecations could affect specific features (WebGL, IndexedDB).
- Mitigation: track browser compatibility via [browser-compatibility.md](../../engineering/browser-compatibility.md).

---

## Evidence / Proof-of-Concept Needed

- Benchmark Canvas 2D + Konva at 500 and 5,000 objects in target browsers.
- Verify y-indexeddb offline sync round-trip.

---

## Related ADRs

- [ADR-003: Frontend Framework](ADR-003-frontend-framework.md)
- [ADR-004: Canvas Rendering Approach](ADR-004-canvas-rendering-approach.md)
- [ADR-008: Real-Time Collaboration](ADR-008-real-time-collaboration.md)
