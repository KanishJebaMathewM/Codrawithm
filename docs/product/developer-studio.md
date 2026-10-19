# Developer Studio

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

The Developer Studio is Codrawithm's collection of tools and workspace configurations specifically designed for software developers. It is not a separate app — it is a set of workspace types, shape libraries, and canvas objects that are loaded when a user selects a developer-oriented workspace type.

Developer Studio tooling is available in: System Architecture, Flowchart, UML, and ER Diagram workspace types.

---

## Code Block Object

The code block is the most fundamental Developer Studio object. It places a formatted, syntax-highlighted code snippet directly on the canvas.

### Features

- **Language selector:** Dropdown with 20+ languages (TypeScript, JavaScript, Python, Rust, Go, Java, C++, C#, SQL, YAML, JSON, Shell, Dockerfile, GraphQL, and more) powered by Shiki.
- **Read-only on canvas:** The block displays code but does not execute it. Double-click opens a modal code editor with a full editing experience.
- **Copy button:** Top-right corner of the code block. Copies raw code to clipboard.
- **Auto-height:** Block height expands to fit the code content, up to a configurable maximum with a scrollbar.
- **Theming:** Follows the canvas theme (light/dark) and applies an appropriate Shiki theme.
- **Resize:** Horizontal resize changes the code block width (and thus line wrapping).

### Data Model

```typescript
interface CodeBlockObject {
  type: "code-block";
  x: number; y: number;
  width: number;
  language: string;         // e.g. "typescript", "rust", "python"
  code: string;
  theme: "auto" | string;   // "auto" follows canvas theme
  label: string | null;     // optional title above the block
}
```

---

## Flowchart Tools

Flowchart tools are activated in the Flowchart workspace type. They conform to the ANSI/ISO 5807 standard symbols.

### Shape Library

| Symbol Name | Visual Shape | Usage |
|-------------|-------------|-------|
| Terminal (Start/End) | Rounded rectangle | Marks beginning or end of flow |
| Process | Rectangle | A generic processing step |
| Decision | Diamond | Yes/No or conditional branch |
| Data (I/O) | Parallelogram | Input or output operation |
| Document | Rectangle with wavy bottom | A printed or digital document |
| Predefined Process | Rectangle with double vertical lines | A sub-process or subroutine |
| Manual Operation | Trapezoid | An operation performed manually |
| Connector | Small circle | Off-page connector reference |
| Database | Cylinder | Data storage |
| Delay | Rounded right end | A deliberate wait state |

### Auto-Layout

The flowchart workspace offers automatic layout in two orientations:
- **Top-to-bottom (TD):** Default for most flowcharts. Start node at top, end node at bottom.
- **Left-to-right (LR):** Useful for wide workflows.

Auto-layout uses a Sugiyama-style layered graph algorithm to minimize edge crossings.

### Branch Labels

Yes/No labels can be added to decision diamond connectors. The label floats above the connector line. Other conditional text can be manually typed on connectors.

---

## UML Tools

### Class Diagram

**Class Box Structure:**
```
┌──────────────────────┐
│   «stereotype»       │
│   ClassName          │
├──────────────────────┤
│ + publicAttr: Type   │
│ - privateAttr: Type  │
│ # protectedAttr: Type│
├──────────────────────┤
│ + publicMethod(): T  │
│ - privateMethod()    │
└──────────────────────┘
```

**Relationship Types:**

| Arrow Type | UML Meaning | Visual |
|-----------|------------|--------|
| Association | Has-a (general) | Solid line |
| Directed Association | Navigable has-a | Solid line with open arrowhead |
| Aggregation | Part-of (weak) | Solid line with hollow diamond |
| Composition | Part-of (strong) | Solid line with filled diamond |
| Inheritance / Generalization | Is-a | Solid line with hollow triangle |
| Realization / Implementation | Implements | Dashed line with hollow triangle |
| Dependency | Uses | Dashed line with open arrowhead |

**Multiplicity Labels:** Placed near each end of relationship lines. Supports: `1`, `0..1`, `1..*`, `0..*`, `n`.

### Sequence Diagram

**Elements:**
- **Lifelines:** Vertical dashed lines representing objects/actors. Labeled box at the top.
- **Activation Box:** Thin rectangle on a lifeline showing when an object is active.
- **Messages:**
  - Synchronous: solid line with filled arrowhead
  - Asynchronous: solid line with open arrowhead
  - Return: dashed line with open arrowhead
  - Create: dashed line with open arrowhead to new lifeline box
  - Destroy: X marker on lifeline
- **Notes:** Yellow sticky-style boxes attached to a lifeline or message.
- **Combined Fragments:** Alt (if/else), Loop, Par (parallel), Opt (optional), Ref (reference).

### Activity Diagram

Actions, decisions, forks, joins, swimlanes for parallel flows.

### Use Case Diagram

Actor (stick figure), use case (ellipse), system boundary (rectangle), include/extend/generalization relationships.

### Component Diagram

Component box with `<<component>>` stereotype, provided/required interface lollipops, dependency arrows.

### State Machine Diagram

States (rounded rectangles), initial pseudo-state (filled circle), final state (filled circle in circle), transitions (arrows with guard/trigger/action labels).

---

## Entity-Relationship Diagram Tools

### Entity Box

```
┌──────────────────┐
│   table_name     │
├──────────────────┤
│ 🔑 id: UUID PK   │
│ name: VARCHAR    │
│ created_at: TS   │
│ deleted_at?: TS  │
└──────────────────┘
```

Attributes display: name, type, nullable indicator (`?`), primary key marker (🔑), foreign key marker (FK).

### Relationship Lines and Notation

**Crow's Foot Notation** (default):

| Cardinality | Crow's Foot Symbol |
|------------|-------------------|
| One (exactly) | Single vertical bar |
| Zero or one | Circle + vertical bar |
| Many (one or more) | Crow's foot + vertical bar |
| Zero or many | Crow's foot + circle |

**Chen Notation** (alternative, selectable):
Diamonds for relationships, single/double lines for participation.

---

## Architecture Shape Library

When using the System Architecture workspace type, a curated shape library is available in the shapes panel.

**Generic Shapes:**
- Server / VM
- Container / Docker container
- Database (relational)
- Cache / Redis
- Message Queue / Kafka
- Load Balancer
- CDN Edge Node
- Client (Web Browser)
- Client (Mobile App)
- API Gateway
- Microservice

**Cloud Provider Shapes (Basic icon set):**
- AWS: EC2, S3, RDS, Lambda, SQS, SNS, CloudFront, VPC
- GCP: Cloud Run, Cloud SQL, Pub/Sub, GCS, Cloud CDN
- Azure: App Service, Azure SQL, Service Bus, Blob Storage, Azure CDN

All shapes are SVG icons with configurable fill color and label.

---

## System Diagram Patterns

The Developer Studio includes pre-built pattern templates that users can insert as a group:

| Pattern | Description |
|---------|-------------|
| 3-Tier Web App | Client → Load Balancer → App Server → Database |
| Event-Driven | Producer → Queue → Consumer |
| CQRS | Command side → Event Store → Read Model |
| API Gateway | Client → API Gateway → N Microservices |
| CDN + Origin | Client → CDN → Origin Server → Object Storage |

---

## Related Documents

- [Canvas Tools](canvas-tools.md)
- [Workspace Types](workspace-types.md)
- [Algorithm Visualization](algorithm-visualization.md)
- [Architecture — Canvas Engine](../architecture/canvas-engine.md)
