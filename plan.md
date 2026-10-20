# Codrawithm Phase 1 Local MVP Plan

## Scope

This implementation continues the existing `apps/web` React + TypeScript + Vite application as a plain-local, single-user Phase 1 MVP. The canvas is the primary home and workspace hub: switch boards, open algorithm visualizations, open AI Studio, use drawing/export controls, and reach settings without a separate dashboard. Keep data on this computer; do not enable Manus-managed services, create cloud infrastructure, add authentication, or publish the app. Show a sign-in entry point that clearly explains account/cloud sync is not connected. Keep AI Studio accessible but do not claim generation works until a provider is actually configured.

The existing Rust/Axum, PostgreSQL, Redis, Yjs collaboration, AI plugin, and 3D architecture documents describe later platform capabilities or separate Phase 1 deliverables. They remain future roadmap work and must not be implied to work in this offline MVP. Existing code and uncommitted user changes are preserved; edits stay focused on `apps/web` and this plan/TODO.

## Implementation approach

- **Runtime:** Reuse the pnpm workspace, React 18, TypeScript strict, Vite 5, Konva, Zustand, and installed dependencies. Run the frontend using its existing local Vite script and port.
- **Scene/document:** Strengthen the local board document format and validate imported JSON before adding it as a new board. Preserve shape, text, connector, frame, and metadata values supported by the current editor.
- **Canvas interaction:** Use Konva pointer events for drag-drawing and freehand input, and Konva's selection transformer for resize/rotation. Provide a scrollable, grouped tool rail with color controls on hover; support board background colors and settings for optional overview/minimap (off by default). Keep viewport pan/zoom, multi-select, connector endpoint handling where practical, and core tool keyboard shortcuts consistent with the docs.
- **History and save:** Keep up to 100 document snapshots for undo/redo. Persist each board independently in localStorage and save on document changes rather than using a timer that marks unsaved changes as saved.
- **Portability/templates:** Support canonical JSON export/import and PNG/SVG export for the current 2D scene. Provide blank, flowchart, and mind-map board templates without overwriting existing boards.
- **Testing:** Extend existing Vitest coverage around schema validation, JSON round-trip, history bounds, and canvas helpers. Use the existing TypeScript/build checks and run the app locally to confirm readiness.

## Design direction

Retain the established instrument-panel minimalism: light technical surfaces, calm dotted canvas, compact controls, indigo actions, violet collaboration accents, and visible keyboard focus. Maintain the canvas-first hierarchy and existing typography system. Avoid false collaborator/AI claims in a single-user local MVP; clearly label mock or future-facing affordances where they remain.

## Project structure

```text
apps/web/src/
├── features/canvas/                 # editor shell and Konva canvas interactions
├── features/dashboard/               # local board entry points and templates
├── lib/                              # board schema, import/export, canvas helpers
├── stores/                           # local board documents and bounded history
├── types.ts                          # document, object and tool types
└── styles.css                        # existing design tokens and responsive styling
apps/web/public/manus-routes.json     # static route manifest
apps/web/tests/ and src/**/*.test.ts  # automated tests
plan.md                               # implementation/design decisions
TODO.md                               # acceptance outcomes and progress
```

## Serving

Use `pnpm --filter @codrawithm/web dev` from the repository root (or the existing `apps/web` dev script) to run the local frontend. Use the existing `pnpm --filter @codrawithm/web test` and `pnpm --filter @codrawithm/web build` commands for validation. Do not start backend or database infrastructure for this local-only MVP.
