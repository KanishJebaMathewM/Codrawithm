# Contribution Guide

**Status:** Proposed  
**Audience:** All contributors  
**Last Reviewed:** 2024-01-15

Welcome to Codrawithm! This guide explains how to contribute effectively, from your first discussion to your first merged pull request.

---

## Before You Write Code

Codrawithm is in early ideation. The most valuable early contributions are:

- **Discussions:** Share use cases, compare tools, discuss architecture
- **Research spikes:** Short technical investigations (see [research-spikes.md](../roadmap/research-spikes.md))
- **Design proposals:** Sketches, wireframes, UX feedback
- **Documentation improvements:** Fix unclear sections, add examples
- **Issue triage:** Help categorize and clarify reported issues

Implementation work is valuable but only once the relevant decisions are made and documented. Avoid building something large before the architecture for that area is agreed upon.

---

## Contribution Workflow

```
1. Find or create a Discussion
        ↓
2. Propose approach (for non-trivial changes)
        ↓
3. Create or claim an Issue
        ↓
4. Fork and implement
        ↓
5. Open a Pull Request
        ↓
6. Code review
        ↓
7. Merge
```

### Step 1: Find a Discussion or Issue

- Browse [GitHub Discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions) for open topics
- Browse [GitHub Issues](https://github.com/KanishJebaMathewM/Codrawithm/issues) for actionable tasks
- Check [Good First Issues](./good-first-issues.md) if you're new

### Step 2: For Non-Trivial Changes — Propose First

If your contribution would:
- Change the architecture or a major design decision
- Add a new workspace type or major feature
- Modify shared APIs or data models
- Affect performance significantly

...then open a Discussion or comment on the relevant ADR before writing code. Getting alignment early saves everyone time.

### Step 3: Create or Claim an Issue

- Comment "I'd like to work on this" to claim an issue
- If creating a new issue, use the appropriate template
- Issues prevent duplicate work

### Step 4: Fork and Implement

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/Codrawithm.git
cd Codrawithm

# Create a branch
git checkout -b feat/algorithm-visualization-bfs

# Make your changes
# ... write code, add tests ...

# Commit using Conventional Commits format
git commit -m "feat(algorithm-lab): add BFS step-by-step visualization"
```

**Branch naming:**
- `feat/short-description` — new features
- `fix/short-description` — bug fixes
- `docs/short-description` — documentation
- `refactor/short-description` — refactoring
- `spike/SPIKE-NNN-short-description` — research spikes
- `chore/short-description` — tooling, config

**Commit message format** ([Conventional Commits](https://www.conventionalcommits.org/)):
```
type(scope): short description

Optional longer body explaining why, not what.

Closes #123
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`

### Step 5: Open a Pull Request

Use the [pull request template](../../.github/PULL_REQUEST_TEMPLATE.md). Include:
- What the PR does
- Screenshots or screen recordings for visual changes
- How you tested it
- Whether it updates documentation

### Step 6: Code Review

- A maintainer or reviewer will be assigned
- Address all review comments
- Don't force-push to the PR branch after review starts (use new commits)
- Mark conversations as resolved when addressed

### Step 7: Merge

Once approved, a maintainer will merge your PR. Squash merge is the default for feature branches to keep history clean.

---

## Code Standards

### TypeScript (Frontend)

- Strict mode enabled — no `any` without justification
- ESLint + Prettier for formatting (run `pnpm lint` before committing)
- React functional components only, no class components
- Prefer named exports over default exports for better IDE support
- Write JSDoc comments for exported functions and types

```typescript
// Good
export function calculateBoundingBox(objects: CanvasObject[]): BoundingBox {
  // ...
}

// Avoid
export default (objects) => { /* ... */ }
```

### Rust (Backend)

- Stable Rust only
- `cargo clippy -- -D warnings` must pass
- `rustfmt` for formatting
- Document all public functions with `///` doc comments
- Handle all `Result` types — no `unwrap()` in production code

```rust
/// Validates that a board exists and the user has the required role.
pub async fn check_board_access(
    pool: &PgPool,
    board_id: Uuid,
    user_id: Uuid,
    required_role: Role,
) -> Result<(), AppError> {
    // ...
}
```

See [Coding Standards](../engineering/coding-standards.md) for full details.

---

## Testing Requirements

- New features require tests
- Bug fixes require a regression test
- Canvas logic requires unit tests
- API endpoints require integration tests
- Run `pnpm test` (frontend) and `cargo test` (backend) before opening a PR

See [Testing Strategy](../engineering/testing-strategy.md).

---

## Documentation Requirements

- New features require documentation (in `docs/product/` or relevant section)
- New APIs require inline code comments
- New ADR topics require a discussion first
- Update the relevant feature doc when behavior changes

---

## What Not To Do

- Don't open a large PR without prior discussion on an architectural change
- Don't add dependencies without justification and license verification
- Don't use `any` types, `unwrap()`, or TODO comments in production code
- Don't modify existing migrations — add new ones
- Don't commit `.env` files, credentials, or secrets

---

## Getting Help

- **GitHub Discussions** — best place for questions and ideas
- **Issue comments** — for questions about a specific issue
- **PR comments** — for questions about your implementation

---

## Related Documents

- [Good First Issues](./good-first-issues.md)
- [Decision Making](./decision-making.md)
- [Project Governance](./project-governance.md)
- [Coding Standards](../engineering/coding-standards.md)
- [Testing Strategy](../engineering/testing-strategy.md)
