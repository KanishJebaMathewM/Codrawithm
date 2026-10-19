# Codrawithm Initial Frontend Plan

## Scope

This milestone turns the documentation-only Codrawithm proposal into a contributor-ready React frontend scaffold. It focuses on the first useful slice of the product: a dashboard for entering workspaces, a modular board editor shell, an interactive 2D canvas backed by Konva, a starter Algorithm Lab view, and local mock state that can be replaced by the future Rust/Axum API and Yjs collaboration layer.

The implementation deliberately keeps infrastructure off for now. There is no authentication, database, WebSocket provider, or AI credential in the browser. Those are extension points with typed seams and UI affordances. The app is still useful offline as a visual prototype: users can create/select basic objects, change their tool, pan/zoom the stage, open properties, use undo/redo, inspect a minimap, open the AI panel, export board JSON, and move between dashboard, board, and algorithm routes.

## Implementation approach

- **Framework and build:** React 18 + TypeScript strict + Vite 5, with a pnpm workspace root.
- **Styling:** Tailwind CSS 3 is configured for future utility composition; the initial UI uses a small owned token layer in `apps/web/src/styles.css` so the design remains readable without a generated component dependency.
- **Canvas:** `react-konva`/`konva` render a layered stage with a dotted background, objects, selection affordances, collaborator cursor cues, and an overlay minimap. The current object model is intentionally small but maps to the documented `CanvasObject` direction.
- **State:** Zustand owns active tool, objects, selection, viewport, history, panel visibility, save status, and algorithm state. The store exposes methods that can later become Yjs-backed mutations without rewriting view components.
- **Routing:** TanStack Router defines `/`, `/board/$boardId`, and `/algorithm`, keeping future lazy route boundaries obvious.
- **Feature-first structure:** `features/canvas`, `features/dashboard`, `features/algorithm-viz`, and `features/collaboration` own vertical slices. Shared UI primitives live in `components/ui` and cross-cutting types/utilities in `lib` and `stores`.
- **Backend seams:** `api/` holds future client modules; `features/collaboration` contains the local presence model and documents where `Y.Doc`, `WebsocketProvider`, and indexedDB persistence will attach later. No fake network calls are made.

## Design direction

Three possible design movements were considered:

1. **Instrument panel minimalism** — 0.06: a calm technical cockpit with tight labels and precise controls.
2. **Soft brutalist studio** — 0.05: generous canvas space, high-contrast panels, and direct, tactile controls.
3. **Editorial developer notebook** — 0.04: paper-like surfaces, mono accents, and narrative workspace metadata.

### Chosen direction: Instrument panel minimalism

- **Design Movement:** A light technical cockpit inspired by Figma/Linear tooling, with a quiet canvas and highly legible control surfaces.
- **Core Principles:** Canvas-first hierarchy; progressive complexity; precise feedback; accessible keyboard-friendly controls.
- **Color Philosophy:** White and mist surfaces keep visual thinking calm, while indigo marks action and violet marks collaboration/AI. Green is reserved for saved/connected state; amber calls attention without alarms.
- **Layout Paradigm:** A fixed top command rail, narrow left instrument strip, expansive central canvas, and optional right inspector. The canvas remains the largest uninterrupted plane.
- **Signature Elements:** Compact uppercase eyebrow labels; indigo-to-violet connection line; thin dotted-grid field with small collaborator cursor chips.
- **Interaction Philosophy:** Every control gives immediate visual feedback; tool changes are explicit and keyboard-visible; panels collapse rather than compete with the canvas.
- **Animation:** Use 100–200ms easing for panel/tool state changes, subtle object scale-in on creation, and no looping motion outside loading/AI generation. Respect reduced-motion preferences.
- **Typography System:** Inter for UI/body, JetBrains Mono for shortcuts, coordinates, and algorithm metadata. Use compact 11px/12px labels and 14px/18px working text.
- **Brand Essence:** One canvas for technical thinking, built for people who explain systems. Personality: precise, open, energetic.
- **Brand Voice:** Direct and encouraging. Examples: “Make the next idea visible.” and “Start with a shape. Leave with a system.”
- **Wordmark & Logo:** A small linked-node mark made from three rounded rectangles joined by a diagonal stroke, paired with a lowercase `codrawithm` wordmark.
- **Signature Brand Color:** `#4f46e5` indigo, used as the ownable action and focus color.

## Project structure

```text
apps/web/
├── src/
│   ├── main.tsx, app.tsx, router.tsx
│   ├── components/ui/                 # owned button, badge, tooltip-like primitives
│   ├── features/
│   │   ├── dashboard/                 # workspace cards and entry points
│   │   ├── canvas/                    # editor shell, Konva stage, palette, inspector
│   │   ├── algorithm-viz/             # algorithm lab starter view
│   │   └── collaboration/             # local presence model and future Yjs seam
│   ├── stores/                        # Zustand canvas and UI state
│   ├── lib/                           # ids, export helpers, canvas math
│   ├── api/                           # future API client seams
│   ├── types.ts
│   └── styles.css
├── public/manus-routes.json
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
packages/
├── ui/                                # future shared shadcn/ui package boundary
├── canvas-core/                       # future renderer/math package boundary
└── shared-types/                      # future API/shared type package boundary
```

## Serving and delivery

The app listens on port 3000 for Preview. `public/manus-routes.json` declares the three page routes. `pnpm build` outputs `apps/web/dist`, and the root build script delegates to the workspace package. The project remains static-only for this milestone; the future backend can be added without changing the frontend route structure.
