# Target Audiences

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm serves six primary audience segments. Each has distinct needs, workflows, and success criteria that drive feature prioritization and design decisions.

---

## Segment 1: Software Developers (Individual)

**Profile:** Solo developers, freelancers, and open-source contributors who need to think through system designs, document architectures, and visualize algorithms — often working alone.

**Core Needs:**
- Fast scratch pad for sketching service interactions and data flows.
- Algorithm explanation for their own understanding or to share with others.
- Code-adjacent diagramming (flowcharts, state machines, ER diagrams) that lives close to their code.
- Keyboard-first experience — pointer-heavy UIs feel slow.

**Frustrations with Current Tools:**
- Excalidraw is too sparse for structured diagrams.
- Lucidchart is too expensive and heavy for personal use.
- VisuAlgo doesn't allow custom input or collaboration.
- PlantUML requires learning a DSL and produces poor layout for complex diagrams.

**Success Criteria:** A developer can open Codrawithm, create a system architecture diagram with a code block, and share a read-only link in under 5 minutes.

---

## Segment 2: Engineering Teams

**Profile:** Small-to-medium engineering teams (3–50 engineers) doing architecture reviews, sprint retrospectives, and onboarding documentation.

**Core Needs:**
- Real-time collaboration with no write conflicts.
- Persistent shared workspace with versioned diagrams.
- Role-based access (view-only for stakeholders, edit for the team).
- Self-hosting for data residency or compliance requirements.

**Frustrations with Current Tools:**
- Miro is expensive and has no developer-specific features.
- Confluence diagrams are hard to edit and have no real-time collaboration.
- draw.io is fine for one person but breaks down in multiplayer.

**Success Criteria:** A team of 10 engineers can hold a live architecture review with 5 simultaneous editors and the resulting diagram is persisted and searchable.

---

## Segment 3: DSA Learners and Interview Candidates

**Profile:** CS students, bootcamp graduates, and professionals preparing for technical interviews who need to deeply understand data structures and algorithms.

**Core Needs:**
- Step-by-step visualization of exactly what changes at each algorithm step.
- Custom input — run an algorithm on their own dataset, not a fixed example.
- Annotations on specific steps.
- Shareable links to send to a tutor, peer, or interviewer.
- Mobile-friendly for study on a phone.

**Frustrations with Current Tools:**
- VisuAlgo has fixed inputs and no customization.
- Algorithm Visualizer requires reading source code to understand.
- No tool allows annotation or sharing of a specific step.

**Success Criteria:** A learner can visualize a custom merge sort, step through it, annotate the critical step, and share the link with their tutor.

---

## Segment 4: Educators and Content Creators

**Profile:** University professors, online course instructors, YouTube educators, and technical bloggers who create visual explanations of technical concepts.

**Core Needs:**
- Presentation mode — clean, distraction-free view for live lecture or recording.
- Follow-presenter mode — students' views follow the educator's pointer in real time.
- Embeddable widgets for blog posts or LMS platforms.
- Export as SVG, PNG, or PDF for course materials.

**Frustrations with Current Tools:**
- Building algorithm animations in After Effects is prohibitively time-consuming.
- No tool combines whiteboard + algorithm visualization + slide presentation in one.
- Miro is expensive for classroom use.

**Success Criteria:** An educator can build and deliver a full graph-traversal lecture from start to finish without switching tools.

---

## Segment 5: UI/UX Designers Working with Engineering Teams

**Profile:** Product designers who collaborate closely with developers and need a tool bridging visual design and technical architecture.

**Core Needs:**
- Flexible visual primitives — freeform, sticky notes, images, and design mockups.
- Real-time collaboration with developers.
- Comment threads on specific canvas elements.
- Export specs or copy CSS values from design tokens.

**Frustrations with Current Tools:**
- Figma is design-centric and hard for developers to use for architecture work.
- Miro lacks structured diagramming precision.
- No single tool bridges design and architecture.

**Success Criteria:** A designer can create a user journey map on the same canvas where a developer has already drawn the system architecture, with both working simultaneously.

---

## Segment 6: Open-Source Contributors and Plugin Developers

**Profile:** Developers who want to contribute to Codrawithm itself — either core contributions or building plugins.

**Core Needs:**
- Clean, well-documented codebase with clear module boundaries.
- Stable, well-documented plugin API.
- Clear contributor onboarding with good-first-issues.
- Transparent decision-making via ADRs, RFCs, and governance model.

**Success Criteria:** A new contributor can set up the dev environment, find a good-first-issue, and submit a passing PR within their first weekend.

---

## Audience Priority Matrix

| Segment | Phase 0–1 Priority | Phase 2–3 Priority | Notes |
|---------|-------------------|--------------------|-------|
| Individual Developers | **P0** | P0 | Core audience, drives initial adoption |
| Engineering Teams | P1 | **P0** | Drives retention and self-hosting |
| DSA Learners | **P0** | P0 | Key differentiator vs. Miro/Excalidraw |
| Educators | P1 | P1 | High-visibility use case |
| Designers | P2 | P1 | Collaboration value-add |
| Plugin Developers | P1 | **P0** | Needed to grow ecosystem |

---

## Related Documents

- [User Personas](user-personas.md)
- [User Journeys](user-journeys.md)
- [Feature Catalog](feature-catalog.md)
- [Product Vision](product-vision.md)
