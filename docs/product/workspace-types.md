# Workspace Types

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

A Codrawithm board uses a **workspace type** to configure which tools, panels, and capabilities are active. Users select a workspace type when creating a new board; it can be changed at any time (with a warning dialog for incompatible objects).

All workspace types share the same infinite canvas and real-time collaboration infrastructure. The workspace type affects the tool palette, right-click context menus, available AI plugins, and default shape library.

---

## Workspace Type 1: General Whiteboard

**Purpose:** Free-form brainstorming, meeting facilitation, retrospectives, quick sketches.  
**Primary Audience:** All users; teams in meetings.

**Tools Available:** Freehand pen, marker, highlighter, shapes (rectangle, ellipse, arrow, line, text), sticky notes, image embed, voting dots, timer.

**Data Model:**
```json
{
  "workspaceType": "whiteboard",
  "settings": { "gridEnabled": false, "snapToGrid": false, "defaultStrokeStyle": "freehand" }
}
```

---

## Workspace Type 2: System Architecture

**Purpose:** Drawing software system architecture diagrams — services, databases, queues, clients, APIs.  
**Primary Audience:** Developers, architects, team leads.

**Tools Available:** All general whiteboard tools plus architecture shape library (server, database, queue, client, load balancer, CDN, cloud provider icons), connector with labels and cardinality, swimlane container, code block, legend box.

**Data Model:**
```json
{
  "workspaceType": "system-architecture",
  "settings": { "gridEnabled": true, "snapToGrid": true, "defaultConnectorStyle": "orthogonal" }
}
```

---

## Workspace Type 3: Flowchart

**Purpose:** Decision flowcharts, process flows, and BPMN-style workflow diagrams.  
**Primary Audience:** Developers, business analysts, product managers.

**Tools Available:** ANSI/ISO flowchart shape set (process, decision, start/end, I/O, connector, data, document, predefined process, delay, manual operation), auto-layout (top-to-bottom, left-to-right), flow numbering, conditional branch labeling.

---

## Workspace Type 4: UML

**Purpose:** Drawing all standard UML diagram types.  
**Primary Audience:** Developers, software architects, students.

**Supported Subtypes:** Class, Sequence, Use Case, State Machine, Component, Deployment, Activity, Object.

**Tools Available:** Full UML shape library per subtype, note and constraint boxes, stereotype labels, visibility markers.

---

## Workspace Type 5: Algorithm Visualization

**Purpose:** Step-by-step visualization of data structures and algorithms with custom inputs.  
**Primary Audience:** DSA learners, students, interview prep, educators.

**Tools Available:** Algorithm selector, custom input field, step playback controls (forward/backward/auto-play/speed slider), step annotation tool, complexity info panel, array/graph/tree visualization primitives.

**Data Model:**
```json
{
  "workspaceType": "algorithm-visualization",
  "algorithm": {
    "type": "sort",
    "name": "mergeSort",
    "input": [5, 3, 8, 1, 9, 2],
    "currentStep": 4,
    "totalSteps": 28,
    "annotations": { "4": "Recursive split of left half" }
  }
}
```

---

## Workspace Type 6: Database / ER Diagram

**Purpose:** Entity-relationship diagrams, database schema design, normalization diagrams.  
**Primary Audience:** Backend developers, DBAs, data engineers.

**Tools Available:** ER entity box (with primary key marker, attribute types, nullable indicators), relationship lines (one-to-one, one-to-many, many-to-many), crow's foot notation, cardinality labels.

---

## Workspace Type 7: Kanban / Process Board

**Purpose:** Visual process flows and Kanban-style boards for workflow visualization (not project management).  
**Note:** This is a visual workspace only — no task state or ticket management. See [Non-Goals](../vision/non-goals.md).

**Tools Available:** Kanban column container, card shape (title, description, color label), arrow connectors for flow visualization.

---

## Workspace Type 8: Mind Map

**Purpose:** Hierarchical brainstorming, concept mapping, and idea organization.  
**Primary Audience:** All users, particularly learners and researchers.

**Tools Available:** Central node with radial branch expansion, auto-layout (radial, horizontal tree), node collapsing/expanding, color-coded branches.

---

## Workspace Type 9: Network Diagram

**Purpose:** IT network topology, infrastructure diagrams, security architecture.  
**Primary Audience:** DevOps engineers, network engineers, security teams.

**Tools Available:** Network device icons (router, switch, firewall, server, workstation, cloud), network connection lines with protocol/bandwidth labels, VLAN/subnet container, security zone overlay.

---

## Workspace Type 10: 3D Workspace

**Purpose:** Sketching and visualizing 3D concepts collaboratively in the browser.  
**Primary Audience:** Game developers, hardware engineers, AR/VR teams.

**Note:** This is a conceptual sketching tool, not a CAD replacement. See [Non-Goals](../vision/non-goals.md).

**Tools Available:** Three.js/React Three Fiber scene, 3D primitives (box, sphere, cylinder, cone, torus), camera orbit/pan/zoom controls, light source placement, basic material picker, scene hierarchy panel.

**Data Model:**
```json
{
  "workspaceType": "3d-workspace",
  "scene": {
    "objects": [],
    "lights": [{ "type": "ambient", "intensity": 0.6 }],
    "camera": { "position": [5, 5, 5], "target": [0, 0, 0] }
  }
}
```

---

## Workspace Type 11: AI Studio

**Purpose:** Building and experimenting with AI-assisted diagram generation and content creation.  
**Primary Audience:** Power users, plugin developers, researchers.

**Tools Available:** AI prompt input panel, AI result preview, plugin slot for AI provider, history of AI-generated objects, manual editing overlay on AI output.

---

## Workspace Type 12: Simulation

**Purpose:** Visualizing system simulations, traffic flows, state machines in motion, and other dynamic systems.  
**Primary Audience:** Educators, researchers, system designers.

**Tools Available:** Simulation object with state properties, timeline/step control, state transition trigger definitions, replay and frame capture.

---

## Workspace Type 13: Presentation Canvas

**Purpose:** Building and delivering visual presentations directly on the canvas.  
**Primary Audience:** Educators, speakers, team leads.

**Tools Available:** Frame tool with automatic slide numbering, presentation mode toggle, slide navigator panel, follow-presenter mode activation, laser pointer, timer overlay.

---

## Workspace Type 14: Plugin Workspace

**Purpose:** A blank canvas pre-configured for a specific plugin's workflow.  
**Primary Audience:** Plugin developers and plugin users.

When a plugin declares that it provides its own workspace type, users can create a board with that plugin's workspace pre-loaded. The plugin controls the tool palette, canvas objects, and interaction model.

---

## Workspace Switching

Users can switch workspace types from the board settings panel. Codrawithm will:
1. Check whether any current objects are incompatible with the new type.
2. Show a warning dialog listing incompatible objects.
3. Allow the user to confirm or cancel.
4. Incompatible objects remain as generic `UnknownObject` shapes.

---

## Related Documents

- [Canvas Tools](canvas-tools.md)
- [Algorithm Visualization](algorithm-visualization.md)
- [3D Workspace](3d-workspace.md)
- [AI Studio](ai-studio.md)
- [Data Model](../architecture/data-model.md)
