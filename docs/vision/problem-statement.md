# Problem Statement

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Summary

Developers and engineering teams rely on visual thinking — diagrams, sketches, flowcharts, data structure animations — throughout every phase of building software. Yet the tooling for this visual work is fragmented across many incompatible products, each solving one narrow slice of the problem.

---

## The Fragmentation Problem

A typical senior developer's visual tooling stack looks something like this:

| Task | Tool(s) |
|------|---------|
| System architecture diagrams | draw.io, Lucidchart, or Excalidraw |
| UML diagrams | PlantUML, StarUML, or Visual Paradigm |
| Algorithm visualization | VisuAlgo, Algorithm Visualizer, or custom-built |
| Whiteboard / brainstorming | Miro, FigJam, or physical whiteboard |
| 3D model sketching | Blender, Tinkercad, or nothing |
| Presentation of diagrams | PowerPoint, Notion embed, or screenshot |
| Collaborative design review | Figma, Miro, or Loom |

That is six to eight different applications for work that is all fundamentally the same: creating and communicating ideas through spatial representations.

### Consequences

**Lost context.** When a diagram lives in Lucidchart, the algorithm explanation is in a VisuAlgo browser tab, and the whiteboard session is a Miro export — the relationship between them disappears. A new team member cannot reconstruct the reasoning.

**Format incompatibility.** SVG from draw.io does not import cleanly into Miro. A Figma prototype cannot reference an algorithm animation. Assets must be exported as raster images, losing all interactivity and editability.

**Steep per-tool learning curves.** Teams spend time onboarding to each tool rather than thinking about the problem.

**Collaboration friction.** Each tool has its own access model, sharing link, and real-time editing capability. Running a multi-tool design session requires juggling multiple browser tabs with different permission models.

**Cost fragmentation.** Organizations pay four or five separate SaaS subscriptions for work that could be unified.

**No developer-specific features.** General-purpose whiteboard tools lack code blocks, algorithm playback, data structure visualization, and integration with developer mental models. Developer-specific tools lack collaboration, theming, and embedding.

---

## The Open-Source Gap

Most developer-focused visual tools are either closed-source SaaS or small academic projects that are not maintained. The open-source alternatives (Excalidraw, tldraw) are excellent for general whiteboarding but do not include algorithm visualization, 3D editing, AI integration, or extensible plugin systems.

There is no open-source, self-hostable, extensible visual workspace that specifically targets the developer and engineering team use case.

---

## The Learning Context Problem

DSA (Data Structures and Algorithms) education is a specific and important case of this problem:

- Students need to visualize how a binary search tree rotates, how Dijkstra's algorithm explores a graph, or how quicksort partitions an array.
- Existing tools (VisuAlgo, Algorithm Visualizer) are web-based but read-only — users cannot construct custom inputs, annotate steps, or share their visualization with classmates.
- Educators cannot integrate these tools into a broader lesson plan that includes diagrams, slides, and collaborative exercises.
- Interview preparation requires being able to explain algorithms visually in real time, which no single tool supports.

---

## The 3D Collaboration Gap

As engineering teams work on AR/VR applications, game prototypes, hardware products, and spatial computing experiences, they need to sketch 3D ideas collaboratively. No tool combines basic 3D editing with whiteboarding, annotation, and real-time collaboration in a browser-native environment.

---

## Problem Scope for v1

Codrawithm does not attempt to solve all of these problems on day one. The prioritized problem scope for Phase 0–2 is:

1. **Unified canvas:** Replace separate whiteboard and diagramming tools for engineering teams.
2. **Algorithm visualization:** Provide an interactive, collaborative DSA visualization workspace.
3. **Developer tooling:** Bring code blocks, UML, flowcharts, and system diagrams into the same canvas.
4. **Open-source + self-hostable:** Give teams a tool they control, not a vendor.

3D and full AI integration are in scope for later phases.

---

## Related Documents

- [Product Vision](product-vision.md)
- [Target Audiences](target-audiences.md)
- [Non-Goals](non-goals.md)
- [Feature Catalog](feature-catalog.md)
