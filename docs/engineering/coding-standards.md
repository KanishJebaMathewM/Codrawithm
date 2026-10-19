# Coding Standards

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Consistent coding standards reduce cognitive load for contributors. Standards are enforced by automated tools in CI — not just described in documentation.

---

## TypeScript (Frontend)

### TypeScript Configuration

All TypeScript code uses strict mode:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### No `any`

Do not use `any`. Use `unknown` when the type is genuinely unknown and narrow it with type guards. `// @ts-ignore` and `// @ts-expect-error` require a comment explaining why.

```typescript
// Bad
const obj: any = getObject();

// Good
const obj: unknown = getObject();
if (isCanvasObject(obj)) {
  // obj is narrowed here
}
```

### Prefer Explicit Return Types

Public functions and component props should have explicit types:

```typescript
// Preferred
export function computeBoundingBox(obj: CanvasObject): Rect {
  ...
}

// Acceptable for small private helpers where inference is clear
const double = (n: number) => n * 2;
```

### Naming

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `activeToolId` |
| Functions | camelCase | `computeHitTarget()` |
| React components | PascalCase | `RectangleRenderer` |
| Types / Interfaces | PascalCase | `CanvasObject` |
| Enums | PascalCase enum, SCREAMING_SNAKE values | `ToolId.SELECT` |
| Constants | SCREAMING_SNAKE | `MAX_OBJECT_COUNT` |
| Files (TS) | kebab-case | `canvas-store.ts` |
| Files (React) | PascalCase | `RectangleRenderer.tsx` |

### File Organization

Each file should have a single primary export. Co-locate tests with the file they test: `canvas-store.test.ts` next to `canvas-store.ts`.

### Imports

- Use absolute imports via path aliases: `@/features/canvas/...`.
- Do not use relative `../../..` imports that go more than 2 levels up.
- Group imports: (1) external libraries, (2) internal packages, (3) local files. Separated by blank lines.

### ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## Rust (Backend)

### Rust Edition

All Rust code uses `edition = "2021"`.

### Clippy

All Rust code passes `cargo clippy -- -D warnings`. The `-D warnings` flag treats all warnings as errors.

Allowed exceptions (must be justified with a comment):
- `#[allow(dead_code)]` — for intentionally unused public API items.
- `#[allow(clippy::too_many_arguments)]` — rare; prefer refactoring to a struct.

### Formatting

All Rust code is formatted with `rustfmt`. Configuration in `.rustfmt.toml`:

```toml
edition = "2021"
max_width = 100
use_field_init_shorthand = true
```

CI runs `cargo fmt --check` and fails if the code is not formatted.

### Naming

| Type | Convention | Example |
|------|-----------|---------|
| Variables | snake_case | `board_id` |
| Functions | snake_case | `load_board_state()` |
| Structs / Enums | PascalCase | `AppError` |
| Constants | SCREAMING_SNAKE | `MAX_UPLOAD_SIZE` |
| Modules | snake_case | `mod boards` |
| Files | snake_case | `board_service.rs` |

### Error Handling

- Library code: use `thiserror` for typed errors.
- Application code: use `anyhow` for error context propagation.
- Never use `unwrap()` in production code paths. Use `expect()` only where a panic is truly impossible and document why.
- Propagate errors with `?`. Avoid matching on `Err` unless specific handling is needed.

See [Error Handling](error-handling.md) for patterns.

### No Unsafe

`unsafe` blocks are prohibited unless there is a compelling, documented reason. Any `unsafe` block requires:
- A `SAFETY:` comment explaining why the unsafe operation is correct.
- A reviewer who understands the unsafe code.

---

## Commit Messages

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.

**Examples:**
```
feat(canvas): add ellipse tool with aspect-ratio lock
fix(collaboration): reconnect after WebSocket close code 1006
docs(engineering): add coding standards document
perf(canvas): add spatial index for viewport culling
```

Commit messages are enforced by `commitlint` in the Git pre-commit hook.

---

## Code Review Standards

- PRs must have at least 1 approving review from a maintainer before merge.
- PR description must link to the relevant issue or ADR.
- All CI checks must pass.
- Large PRs (> 500 lines changed) should be broken into smaller PRs where possible.
- Comments starting with `nit:` are optional style preferences. Others are required changes.

---

## Related Documents

- [Error Handling](error-handling.md)
- [Testing Strategy](testing-strategy.md)
- [Repository Structure](repository-structure.md)
- [Contribution Guide](../community/contribution-guide.md)
