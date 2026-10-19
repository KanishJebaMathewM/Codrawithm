# User Personas

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Five detailed personas represent the core user types for Codrawithm. Each is a composite based on the audience segments defined in [target-audiences.md](target-audiences.md). Personas ground feature decisions and prioritization in real human needs.

---

## Persona 1: Alex — The Software Developer

> "I just need to sketch this out quickly before I forget the mental model."

**Demographics:** Age 28, Backend Engineer at a 40-person startup, remote, uses Neovim.  
**Stack:** Go + PostgreSQL + Kubernetes. OS: Linux (Arch).  
**Tools today:** GitHub, Slack, Notion, draw.io (reluctantly), Excalidraw.

**Goals:**
- Quickly sketch service interaction diagrams before writing code.
- Document microservices architecture in a way that stays alive — not a stale PNG.
- Occasionally visualize an algorithm when debugging a complex data structure.
- Share diagrams with teammates without requiring them to create an account.

**Pain Points:**
- draw.io is slow to load and clunky to export.
- Excalidraw lacks structured diagramming (swimlanes, entity boxes, correct arrow types).
- Diagram tools don't understand code — manual syncing is required.
- Miro is expensive and designed for product managers.

**Behaviors:** Opens a tool, tries to get something done in 2 minutes, closes it if he can't. Uses keyboard shortcuts exclusively. Prefers dark mode. Shares work via URL, not file download.

**Codrawithm Use Cases:** System architecture scratch pad, API flow diagrams, algorithm visualization, onboarding diagrams.

**Success Metric:** First diagram created in under 3 minutes from first open.

---

## Persona 2: Priya — The DSA Learner

> "I understand it when I watch it, but I can't explain it to anyone else. I need to make it mine."

**Demographics:** Age 22, CS Junior at a state university preparing for software internship interviews. Chennai, India.  
**Tools today:** LeetCode, GeeksForGeeks, YouTube, VisuAlgo occasionally, OneNote, WhatsApp.

**Goals:**
- Build intuitive understanding of algorithms through custom visualizations.
- Step through BSTs, DFS/BFS, and sorting algorithms at her own pace.
- Annotate specific steps with her own explanations.
- Share visualizations with her study group and tutor for feedback.
- Prepare whiteboard-style explanations for internship interviews.

**Pain Points:**
- VisuAlgo only has pre-built examples — can't input her own data.
- No tool lets her build her own binary search tree and watch it rebalance.
- YouTube videos move too fast; she can't pause at a specific step and add notes.

**Behaviors:** Studies in 2-hour evening sessions. Uses laptop for serious studying. Shares links in WhatsApp groups. Likes color-coded visualizations.

**Codrawithm Use Cases:** Custom array sorting visualization, binary tree construction, graph BFS/DFS, step annotation, shareable link to tutor.

**Success Metric:** Creates a custom merge sort visualization on a 10-element array and shares it within one study session.

---

## Persona 3: Dr. Rajan — The Educator

> "I spend more time fighting the tools than teaching the concepts."

**Demographics:** Age 45, Associate Professor of Computer Science. Bangalore, India.  
**Tools today:** PowerPoint, VisuAlgo screen captures, Miro (university license), Zoom.

**Goals:**
- Deliver live interactive lectures where algorithm visualizations animate on a shared canvas.
- Create reusable course materials updatable each semester without redoing screenshots.
- Have students follow along on their own devices and receive a shareable link after class.
- Reduce the cost of classroom tool licensing; needs self-hostable option for university IT.

**Pain Points:**
- Every semester he rebuilds slides because algorithm tool screenshots go stale.
- Miro has no algorithm visualization — he alt-tabs to VisuAlgo and shares screen, losing quality.
- Students on mobile can't interact with VisuAlgo.
- No tool supports follow-presenter mode across both whiteboard and algorithm steps.

**Behaviors:** Prepares materials in advance, improvises annotations during lecture. Wants a clean presentation mode with no UI chrome. Shares a read-only link with students at the start of class.

**Codrawithm Use Cases:** Live lecture canvas with whiteboard + algorithm animations, follow-presenter mode, reusable lecture templates, PDF export.

**Success Metric:** Runs a 90-minute algorithm lecture using only Codrawithm with 30 students following along.

---

## Persona 4: Maya — The Product Designer

> "The engineers and I are always working in different tools, so we're always out of sync."

**Demographics:** Age 31, Senior Product Designer at a Series B fintech startup. London, UK.  
**Tools today:** Figma, Notion, Miro (for workshops), Linear.  
**Reads TypeScript but doesn't code daily.**

**Goals:**
- Run design workshops where engineers and designers collaborate on the same canvas.
- Create user journey maps that live next to the system architecture diagrams engineers draw.
- Leave comments and markup on technical diagrams.
- Export high-quality SVGs for documentation and blog posts.

**Pain Points:**
- Figma is great for design but engineers find it intimidating for architecture work.
- Miro is a lowest-common-denominator tool — good for sticky notes, not precise diagrams.
- There's a constant "design lives in Figma, architecture lives in draw.io" split that creates miscommunication.

**Behaviors:** Prefers visual, spatial communication over text-heavy documents. Expects comment threads on individual elements. Uses keyboard shortcuts in Figma and will learn Codrawithm shortcuts if they're consistent.

**Codrawithm Use Cases:** Cross-functional design/engineering workshops, user journey maps alongside system architecture, annotated wireframes, artifact exports for documentation.

**Success Metric:** Runs a workshop where 3 designers and 4 engineers collaborate simultaneously without anyone switching tools.

---

## Persona 5: James — The Engineering Team Lead

> "I need a source of truth for how our system works, not 15 different stale diagrams."

**Demographics:** Age 38, Staff Engineer / Tech Lead at a 150-person e-commerce company. Austin, TX.  
**Stack:** React frontend, Node.js microservices, AWS.  
**Tools today:** Confluence, draw.io, GitHub, Slack, DataDog, Miro.

**Goals:**
- Maintain a living, collaborative system architecture diagram the whole team can update.
- Run architecture review sessions with multiple engineers annotating simultaneously.
- Onboard new engineers with an interactive tour of the system.
- Self-host to comply with company security policies; needs SAML SSO.
- Reduce the number of SaaS subscriptions.

**Pain Points:**
- Confluence diagrams become stale immediately — nobody updates them.
- draw.io is fine for one person but terrible for real-time collaboration.
- Every tool requires a separate login and billing.

**Behaviors:** Cares deeply about maintainability and sustainability of documentation. Evaluates tools by total cost of ownership. Champions tools that other engineers will actually use.

**Codrawithm Use Cases:** Living system architecture diagram, architecture review sessions, onboarding tours, self-hosted deployment with SSO.

**Success Metric:** Team's primary architecture documentation moves to Codrawithm and is updated at least monthly without James having to nag anyone.

---

## Persona Summary

| Name | Segment | Primary Use Case | Priority Phase |
|------|---------|-----------------|---------------|
| Alex | Individual Developer | Architecture sketching | Phase 1 |
| Priya | DSA Learner | Algorithm visualization | Phase 1 |
| Dr. Rajan | Educator | Live lecture canvas | Phase 2 |
| Maya | Designer | Cross-functional workshops | Phase 2 |
| James | Team Lead | Living architecture docs | Phase 2–3 |

---

## Related Documents

- [Target Audiences](target-audiences.md)
- [User Journeys](user-journeys.md)
- [Feature Catalog](feature-catalog.md)
