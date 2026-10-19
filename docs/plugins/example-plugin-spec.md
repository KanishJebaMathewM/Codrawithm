# Example Plugin Spec: Text to Flowchart

**Status:** Proposed (Example)  
**Audience:** Plugin developers  
**Last Reviewed:** 2024-01-15

## Overview

This document specifies a complete example plugin: **Text to Flowchart**. It takes a natural-language description of a process and generates an editable flowchart on the canvas using AI.

This is a reference implementation spec, not a real published plugin.

---

## Plugin Identity

```json
{
  "id": "com.example.text-to-flowchart",
  "name": "Text to Flowchart",
  "version": "1.0.0",
  "description": "Describe a process in plain text and get an editable flowchart.",
  "permissions": ["canvas:write", "ai:request", "storage:plugin"]
}
```

---

## User Flow

1. User opens a board (any workspace type)
2. User opens the "Text to Flowchart" panel from the toolbar
3. User types: *"User logs in, enters credentials, system validates, if valid show dashboard, if invalid show error and retry"*
4. User clicks "Generate"
5. Plugin sends the prompt to the AI via `codrawithm.ai.request()`
6. AI returns a JSON description of the flowchart
7. Plugin validates the JSON
8. Plugin shows a preview of the flowchart in the panel
9. User clicks "Insert to Board"
10. Plugin calls `codrawithm.canvas.createObjects()` with the validated spec
11. Flowchart appears on the canvas, fully editable

---

## AI Prompt Design

### System Prompt

```
You are a diagram assistant. When given a process description, 
respond with ONLY a valid JSON object representing a flowchart.
Do not include any explanation or markdown.

JSON structure:
{
  "nodes": [
    { "id": "n1", "type": "start|end|process|decision|io", "label": "text", "x": number, "y": number }
  ],
  "edges": [
    { "from": "n1", "to": "n2", "label": "optional label" }
  ]
}

Layout guidelines:
- Start at y=0, space nodes 120px apart vertically
- Decision nodes branch: yes-path goes right (+200px x), no-path continues down
- Keep x positions between -400 and 400
- All node ids must be unique strings
```

### User Prompt Template

```
Create a flowchart for this process:

{USER_INPUT}

Respond only with JSON. No explanation.
```

---

## AI Response Parsing

### Expected Response

```json
{
  "nodes": [
    { "id": "n1", "type": "start", "label": "Start", "x": 0, "y": 0 },
    { "id": "n2", "type": "io", "label": "Enter Credentials", "x": 0, "y": 120 },
    { "id": "n3", "type": "process", "label": "Validate Credentials", "x": 0, "y": 240 },
    { "id": "n4", "type": "decision", "label": "Valid?", "x": 0, "y": 360 },
    { "id": "n5", "type": "process", "label": "Show Dashboard", "x": 200, "y": 480 },
    { "id": "n6", "type": "process", "label": "Show Error", "x": -200, "y": 480 },
    { "id": "n7", "type": "end", "label": "End", "x": 200, "y": 600 }
  ],
  "edges": [
    { "from": "n1", "to": "n2" },
    { "from": "n2", "to": "n3" },
    { "from": "n3", "to": "n4" },
    { "from": "n4", "to": "n5", "label": "Yes" },
    { "from": "n4", "to": "n6", "label": "No" },
    { "from": "n6", "to": "n2", "label": "Retry" },
    { "from": "n5", "to": "n7" }
  ]
}
```

### Validation Logic

```typescript
function validateFlowchartSpec(data: unknown): data is FlowchartSpec {
  if (!data || typeof data !== 'object') return false
  const spec = data as FlowchartSpec

  if (!Array.isArray(spec.nodes) || spec.nodes.length === 0) return false
  if (!Array.isArray(spec.edges)) return false
  if (spec.nodes.length > 100) return false  // Sanity limit

  const nodeIds = new Set<string>()
  for (const node of spec.nodes) {
    if (!node.id || !node.type || !node.label) return false
    if (!['start', 'end', 'process', 'decision', 'io'].includes(node.type)) return false
    if (typeof node.x !== 'number' || typeof node.y !== 'number') return false
    nodeIds.add(node.id)
  }

  for (const edge of spec.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) return false
  }

  return true
}
```

---

## Canvas Object Mapping

Flowchart node types map to canvas objects:

| Node Type | Canvas Shape | Style |
|-----------|-------------|-------|
| `start` | Ellipse | Fill: `#34D399`, Stroke: `#059669` |
| `end` | Ellipse | Fill: `#F87171`, Stroke: `#DC2626` |
| `process` | Rectangle | Fill: `#60A5FA`, Stroke: `#2563EB` |
| `decision` | Diamond | Fill: `#FBBF24`, Stroke: `#D97706` |
| `io` | Parallelogram (rectangle for MVP) | Fill: `#A78BFA`, Stroke: `#7C3AED` |

Edges map to connectors with labels.

### Object Creation Code

```typescript
async function insertFlowchart(spec: FlowchartSpec, offsetX: number, offsetY: number) {
  // Calculate centroid for placement
  const specs: CreateObjectSpec[] = []
  const nodeIdToObjId: Record<string, string> = {}

  // Create node objects
  for (const node of spec.nodes) {
    const objSpec = nodeToCanvasSpec(node, offsetX, offsetY)
    specs.push(objSpec)
  }

  const created = await codrawithm.canvas.createObjects(specs)

  // Map node IDs to created object IDs
  spec.nodes.forEach((node, i) => {
    nodeIdToObjId[node.id] = created[i].id
  })

  // Create edge connectors
  const edgeSpecs: CreateObjectSpec[] = spec.edges.map(edge => ({
    type: 'connector',
    subtype: 'arrow',
    sourceObjectId: nodeIdToObjId[edge.from],
    targetObjectId: nodeIdToObjId[edge.to],
    label: edge.label,
    style: { stroke: '#6B7280', strokeWidth: 2 }
  }))

  await codrawithm.canvas.createObjects(edgeSpecs)
}
```

---

## Plugin UI

A simple panel with:

```
┌─────────────────────────────┐
│  🤖 Text to Flowchart       │
├─────────────────────────────┤
│ Describe your process:      │
│ ┌───────────────────────┐   │
│ │ User logs in, enters  │   │
│ │ credentials...        │   │
│ └───────────────────────┘   │
│                             │
│ [Generate Flowchart]        │
│                             │
│ ── Preview ──               │
│ [Flowchart preview image]   │
│                             │
│ [Insert to Board]           │
│ [Regenerate]                │
│                             │
│ Using: OpenAI GPT-4o-mini   │
│ Tokens used: 357 / 10,000   │
└─────────────────────────────┘
```

---

## Error Handling

| Error | User-Facing Message |
|-------|---------------------|
| AI quota exceeded | "You've used your monthly AI quota. Upgrade to Pro for more." |
| AI returns invalid JSON | "Couldn't parse the AI response. Try rephrasing your description." |
| Network error | "Couldn't reach the AI service. Check your connection and try again." |
| Empty description | "Please describe the process you want to visualize." |
| Too many nodes (>100) | "That process is too complex. Try breaking it into smaller parts." |

---

## Related Documents

- [Plugin Manifest](./plugin-manifest.md)
- [Plugin API](./plugin-api.md)
- [AI Provider Interface](./ai-provider-interface.md)
- [Plugin Security](./plugin-security.md)
