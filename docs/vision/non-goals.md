# Non-Goals

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document explicitly captures what Codrawithm is **not** trying to do. Non-goals help maintainers make faster decisions, help contributors understand scope boundaries, and prevent feature creep that dilutes the core value proposition.

A feature appearing here is not necessarily "bad" — it simply means Codrawithm is not the right tool for it, or it is deferred beyond the current planning horizon.

---

## Explicit Non-Goals

### 1. Full IDE or Code Editor

Codrawithm includes code blocks on the canvas for displaying code snippets. It does **not** aim to replace a full code editor or IDE.

**What this means:**
- No code execution (running code inside the canvas is not planned).
- No LSP integration, autocomplete, or linting for code blocks.
- Code blocks are display artifacts, not editable development environments.
- No file system integration or project tree.

**Why:** The problem being solved is visual communication of code concepts, not code editing.

---

### 2. General-Purpose Document Editor

Codrawithm is a canvas-based visual tool. It is **not** a document editor like Notion, Google Docs, or Confluence.

**What this means:**
- No rich text documents with headings, paragraphs, tables, and footnotes.
- No structured content management (pages, databases, wikis).
- Text on the canvas is attached to spatial objects, not a flowing document.

**Why:** Document-centric tools solve a different problem. Mixing paradigms creates a confused UX.

---

### 3. Project Management Tool

Codrawithm is **not** Jira, Linear, Asana, or Trello.

**What this means:**
- No tickets, sprints, backlogs, or kanban boards as first-class project features.
- No due dates, assignees, or status workflows.
- A Kanban board can be *drawn* on the canvas for visualization, but the canvas does not drive task status.

**Why:** Project management is a deep domain. Building it properly would distract from the visual workspace mission.

---

### 4. Video Conferencing or Audio Calling

**What this means:**
- No WebRTC audio/video calls embedded in the canvas.
- No integrated voice chat.
- Users are expected to use Zoom, Google Meet, or Discord alongside Codrawithm.

**Why:** A-quality video conferencing is a hard engineering problem on its own. Embedding a mediocre video call would make Codrawithm worse, not better.

---

### 5. Pixel-Perfect Design Tool

Codrawithm is a diagramming and visual workspace tool. It is **not** Figma, Sketch, or Adobe XD.

**What this means:**
- No component libraries, variants, or design system management.
- No pixel-precise auto-layout or design constraints.
- No design-to-code handoff workflow.
- No prototype interaction linking.

**Why:** Professional design tools require specialized workflows. Codrawithm adds value to the design-engineering conversation, not as a Figma replacement.

---

### 6. Social Network

**What this means:**
- No follower/following system for users.
- No newsfeed, likes, or social interactions on boards.
- No viral sharing mechanics built into the product.

**Why:** Social features require moderation infrastructure and community management at scale that are out of scope for an early-stage project.

---

### 7. Full CAD / Professional 3D Modeling

Codrawithm's 3D workspace is for sketching and conceptual modeling. It is **not** AutoCAD, Blender, SolidWorks, or Tinkercad for serious 3D work.

**What this means:**
- No NURBS, parametric constraints, or precise mechanical engineering modeling.
- No professional rendering (ray tracing, full PBR pipeline).
- No animation rigging or mesh editing.

**Why:** Professional 3D tools have decade-long development histories. Codrawithm serves the "sketch the idea in 3D" use case, not "build a production asset."

---

### 8. Desktop Native Application (Near-Term)

Codrawithm is web-first. No native desktop application is planned in the near term.

**What this means:**
- No Electron application.
- No native macOS, Windows, or Linux app.

**Why:** A web-first architecture serves the broadest audience, minimizes maintenance overhead, and enables real-time collaboration via standard web technologies. Self-hosting lets teams deploy on an internal domain, providing many benefits of a "desktop app."

---

### 9. Fully AI-Generated Canvas

**What this means:**
- AI is a tool to assist, not replace, human drawing and diagramming.
- No "generate entire board from one prompt" as a primary workflow.
- AI outputs always land on the canvas as editable objects.

**Why:** Full AI-generation creates correctness and trust problems. AI assists; humans decide.

---

### 10. LMS (Learning Management System)

Codrawithm supports educational use cases but is **not** Canvas, Moodle, or Blackboard.

**What this means:**
- No student roster management.
- No assignment submission or grading workflow.
- No progress tracking or learning analytics.
- No certification or credentialing.

**Why:** LMS is a deeply specialized, compliance-sensitive domain.

---

## Things That Could Be Revisited

| Item | Trigger for Revisit |
|------|---------------------|
| Desktop native app | Sustained community demand + offline-first use cases |
| Basic voice chat overlay | Simple "spatial audio" plugin once plugin system matures |
| Plugin as task board | Community builds it as a plugin (not core) |

---

## Related Documents

- [Product Vision](product-vision.md)
- [Feature Catalog](feature-catalog.md)
- [Roadmap](../roadmap/product-roadmap.md)
