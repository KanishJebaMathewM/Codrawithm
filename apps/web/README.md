# Codrawithm Web

The first Codrawithm frontend milestone lives here. It is a React 18 + TypeScript + Vite SPA with a Konva canvas, Zustand local state, TanStack Router routes, and owned CSS tokens aligned to `docs/design/`.

## Run locally

From the repository root:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @codrawithm/web exec playwright test --list
```

The current routes are `/` for the workspace dashboard, `/board/:boardId` for the editor shell, and `/algorithm` for Algorithm Lab. The board uses localStorage to keep mock canvas state per board. Backend, Yjs collaboration, plugin sandboxing, full media export, and the lazy 3D workspace are intentionally documented as follow-up work in the root `TODO.md`.
