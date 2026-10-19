# User Journeys

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document maps end-to-end user journeys for three key personas. Each journey covers the full sequence of steps from triggering event to outcome, including emotional state, friction points, and Codrawithm touchpoints.

---

## Journey 1: Alex Creates a System Architecture Diagram

**Persona:** [Alex — The Software Developer](user-personas.md#persona-1-alex--the-software-developer)  
**Trigger:** Alex is designing a new microservices feature and wants to sketch service interactions before writing code.  
**Goal:** Create a system architecture diagram, share with two teammates for async review.

| Step | Action | Emotion | Friction / Opportunity |
|------|--------|---------|----------------------|
| 1 | Googles "open source whiteboard tool for developers" | Curious | Codrawithm appears with "developer-first" messaging |
| 2 | Lands on Codrawithm home page or GitHub | Cautious | First impression of README matters; fast load essential |
| 3 | Clicks "Open Canvas" | Neutral | **Critical:** Any login wall here loses Alex. Guest mode is essential. |
| 4 | Sees blank canvas, draws a box | Engaged | Hit test must be immediate; keyboard shortcut `R` must work |
| 5 | Draws 4 service boxes, labels them | Productive | Label editing must be fast and inline |
| 6 | Draws arrows between services | Productive | Arrow snapping to box edges must be magnetic and obvious |
| 7 | Adds a code block with a sample request payload | Delighted | **Differentiator:** Code blocks with syntax highlighting on a whiteboard |
| 8 | Presses `Ctrl+S` | Anxious | Canvas must auto-save; explicit save is a nice fallback |
| 9 | Copies the share link | Satisfied | Share URL must be one click; recipients must view without account |
| 10 | Teammate leaves a comment on a service box | Pleased | Comment threads must notify Alex |
| 11 | Alex opens the diagram 2 days later | Confident | Canvas must look exactly the same; no data loss |

**Success State:** Alex creates a diagram in under 5 minutes, shares it with one click, returns 2 days later to find it unchanged.

**Failure Modes:** Login wall before editing; slow initial load; no keyboard shortcut for rectangle; share link requires recipient account creation.

---

## Journey 2: Priya Visualizes a Sorting Algorithm

**Persona:** [Priya — The DSA Learner](user-personas.md#persona-2-priya--the-dsa-learner)  
**Trigger:** Priya is struggling to understand merge sort's recursive divide phase after watching 3 YouTube videos.  
**Goal:** Create a custom merge sort visualization, step through it, annotate key steps, share with her tutor.

| Step | Action | Emotion | Friction / Opportunity |
|------|--------|---------|----------------------|
| 1 | Searches "merge sort visualizer custom input" | Frustrated | Codrawithm appears with "custom input, annotatable" messaging |
| 2 | Opens Codrawithm, sees workspace selector | Curious | "Algorithm Visualization" workspace type must be prominent |
| 3 | Types "5,3,8,1,9,2,7,4,6,0" as input | Hopeful | Input field must be clearly labeled; forgiving validation |
| 4 | Selects "Merge Sort", clicks "Generate" | Anticipating | Generation must be fast (< 1s); canvas populates with array |
| 5 | Presses "Step Forward" several times | Learning | Each step must clearly highlight what changed |
| 6 | Pauses at the divide phase | Confused | **Moment of confusion:** this is the hard part |
| 7 | Double-clicks to add an annotation | Engaged | Annotation creation must be discoverable |
| 8 | Types "This is where L and R halves split recursively" | Satisfied | Rich text annotation |
| 9 | Continues stepping through the merge phase | Understanding | Color coding must distinguish before/after elements |
| 10 | Reaches the final sorted state | Triumphant | Clear "Done!" feedback |
| 11 | Copies the share link | Excited | URL preserves algorithm, input, current step, annotations |
| 12 | Tutor opens link on mobile | Validated | Must render correctly on a phone |

**Success State:** Priya creates, annotates, and shares a custom merge sort visualization in one 30-minute study session.

**Failure Modes:** Algorithm workspace not prominent; input validation rejects her comma-separated input; steps not visually distinct; share link doesn't preserve annotations; mobile rendering broken.

---

## Journey 3: Dr. Rajan Runs a Live Lecture

**Persona:** [Dr. Rajan — The Educator](user-personas.md#persona-3-dr-rajan--the-educator)  
**Trigger:** 90-minute lecture on graph traversal (BFS and DFS) with 30 students.  
**Goal:** Deliver the full lecture in Codrawithm — whiteboard drawings + algorithm animations + follow-presenter mode.

### Pre-Class (Day Before)

| Step | Action | Outcome |
|------|--------|---------|
| 1 | Creates board "Graph Traversal — BFS and DFS" | Board created instantly |
| 2 | Draws a graph with 8 nodes and 10 edges | Shape tools support proper graph node circles |
| 3 | Sets up BFS visualization (new frame/section) | Frame concept separates lecture parts |
| 4 | Sets up DFS visualization adjacent to BFS | Spatial proximity of related content preserved |
| 5 | Switches to Presentation Mode to preview | UI chrome hidden; clean canvas view |
| 6 | Generates "Join as Follower" link | Link encodes follow-presenter mode |

### During Class

| Step | Action | Emotion | Friction / Opportunity |
|------|--------|---------|----------------------|
| 7 | Opens board on projector, switches to Presentation Mode | Professional | Starts without lag |
| 8 | Shares follow-presenter link in chat | Engaged | 30 students' screens mirror Dr. Rajan's viewport |
| 9 | Draws live edge labels on the graph | Focused | Drawing in follow-presenter must not lag for followers |
| 10 | Starts BFS animation, pauses, annotates | Teaching | Annotation propagates to followers immediately |
| 11 | Student asks a question; Dr. Rajan highlights a node | Responsive | Highlight tool must be fast and obvious |
| 12 | Ends lecture; gives students read-only board link | Satisfied | Students receive full board as-is at end of class |

### Post-Class

| Step | Action | Outcome |
|------|--------|---------|
| 13 | Reviews and adds reference links | Board remains editable post-session |
| 14 | Exports board as PDF | PDF faithfully renders all elements |
| 15 | Duplicates board template for next semester | Duplicate preserves structure without personal annotations |

**Success State:** Dr. Rajan delivers a full lecture using only Codrawithm, with students reporting visual demonstrations helped their understanding.

**Failure Modes:** Follow-presenter lags > 2 seconds; 30 concurrent connections destabilize server; presentation mode shows UI chrome; PDF export broken; board cannot be duplicated.

---

## Journey Cross-Reference

| Persona | Key Feature | Priority |
|---------|------------|---------|
| Alex | Guest mode, code blocks, keyboard shortcuts | P0 |
| Priya | Custom algorithm input, step annotations, mobile share | P0 |
| Dr. Rajan | Presentation mode, follow-presenter, 30+ concurrent viewers | P1 |

---

## Related Documents

- [User Personas](user-personas.md)
- [Feature Catalog](feature-catalog.md)
- [Teaching & Presentations](../product/teaching-and-presentations.md)
- [Algorithm Visualization](../product/algorithm-visualization.md)
