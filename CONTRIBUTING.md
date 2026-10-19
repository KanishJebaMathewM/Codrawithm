# Contributing to Codrawithm

Thank you for your interest in contributing to Codrawithm. This project is at the **early ideation stage** — there is no runnable codebase yet, which means the most valuable contributions right now are not code. They are use cases, design thinking, technical comparisons, and constructive discussion.

This document explains how to contribute at every stage of the project's development. The full contribution guide lives at [`docs/community/contribution-guide.md`](docs/community/contribution-guide.md) and will be expanded as the project matures.

Please also read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating. All contributors are expected to follow it.

---

## Table of contents

- [Ways to contribute before code exists](#ways-to-contribute-before-code-exists)
- [Contribution workflow](#contribution-workflow)
- [Code contributions (once the stack is chosen)](#code-contributions-once-the-stack-is-chosen)
  - [Prerequisites](#prerequisites)
  - [Forking and branching](#forking-and-branching)
  - [Branch naming](#branch-naming)
  - [Commit messages](#commit-messages)
- [Pull request process](#pull-request-process)
- [Coding standards](#coding-standards)
- [Testing expectations](#testing-expectations)
- [Documentation contributions](#documentation-contributions)
- [Behavior expectations](#behavior-expectations)
- [Contact and getting help](#contact-and-getting-help)

---

## Ways to contribute before code exists

Codrawithm is still defining its problem, audience, and architecture. At this stage, non-code contributions have an outsized impact on the project's direction. You do not need to write a single line of code to make a meaningful contribution.

### Share a use case

The most actionable thing you can do right now is describe a real workflow. For example: "When I'm preparing for a coding interview, I sketch the tree on paper, then write pseudocode in a notes app, then look up the algorithm online — I'm switching between three tools for a single problem." Concrete descriptions like this help the team understand which workflows to prioritize.

Share use cases in [GitHub Discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions).

### Join a design discussion

Several open questions need community input before implementation can begin:

- What does "multidimensional" mean in practice?
- Should the MVP focus on general canvas tools or algorithm visualization?
- Which rendering approach (Canvas 2D, SVG, WebGL, or hybrid) fits the performance requirements?
- Should collaboration be local-first, server-first, or peer-to-peer?
- What license should the project use?

Browse open discussions and share your perspective. Adding a well-reasoned comment to an existing thread is as valuable as opening a new one.

### Conduct and share research

- Test an existing open-source canvas or diagram library and report what works and what breaks.
- Write a comparison of tools like Excalidraw, tldraw, Miro, or others—what they do well and where they fall short.
- Sketch a proposed interaction for a canvas feature, algorithm visualizer, or toolbar layout.
- Research how other projects handle undo/redo, board serialization, or accessibility on a canvas.
- Identify open-source projects whose architecture Codrawithm could learn from.

### Improve early documentation

Documentation at this stage means shaping the project's thinking, not writing API docs. This includes:

- improving the README's clarity or accuracy;
- drafting or refining sections in the `docs/` directory;
- writing a short Architecture Decision Record (ADR) proposal; and
- identifying gaps in the existing documentation.

---

## Contribution workflow

This is the proposed process for all contributions, regardless of type. It mirrors the process described in the README.

1. **Discuss** — Open or join a GitHub Discussion to explain the problem or opportunity. Describe the user need, not just the solution.
2. **Clarify** — Work with maintainers and the community to agree on the intended behavior, scope, and boundaries of the change.
3. **Compare** — Evaluate more than one approach. Explain the trade-offs, costs, and benefits of each option.
4. **Decide** — For significant changes, record the decision in an Architecture Decision Record (ADR) or a pinned discussion. Small, obvious fixes can skip this step.
5. **Build** — Once there is consensus, implement the change in a focused branch. Keep changes small and reviewable.
6. **Review** — Open a pull request, respond to feedback, update the implementation, and improve any affected documentation.

Not every contribution needs to go through every step. A typo fix does not need a decision record. A new canvas rendering strategy does.

---

## Code contributions (once the stack is chosen)

> **Note:** The implementation stack has not yet been selected. The guidelines below describe the expected workflow once a stack is finalized and a runnable codebase exists. Do not invest significant time in a large implementation before the architecture is agreed upon — a small prototype proposed in a discussion is a better starting point.

### Prerequisites

Before contributing code, make sure you have:

- read and agreed to the [Code of Conduct](CODE_OF_CONDUCT.md);
- reviewed any open discussions or issues related to your intended change;
- confirmed that the feature or fix is aligned with the project's current priorities; and
- set up the development environment as described in [`docs/operations/local-development.md`](docs/operations/local-development.md).

### Forking and branching

1. Fork the repository to your own GitHub account.
2. Clone your fork locally.
3. Add the upstream repository as a remote: `git remote add upstream https://github.com/KanishJebaMathewM/Codrawithm.git`
4. Before starting work, sync your fork: `git fetch upstream && git rebase upstream/main`
5. Create a new branch from `main` for your change.

Never commit directly to `main`. All changes go through pull requests.

### Branch naming

Use the following prefixes to make the purpose of a branch immediately clear:

| Prefix | Use for |
|--------|---------|
| `feat/` | New features or capabilities |
| `fix/` | Bug fixes |
| `docs/` | Documentation-only changes |
| `chore/` | Build scripts, tooling, dependency updates, refactoring without behavior change |
| `test/` | Adding or updating tests without changing production code |
| `perf/` | Performance improvements |

Examples: `feat/canvas-pan-zoom`, `fix/undo-redo-state-leak`, `docs/adr-rendering-approach`

Keep branch names lowercase, hyphen-separated, and descriptive enough to understand at a glance.

### Commit messages

Codrawithm follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Every commit message should have the format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | Use for |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace — no logic change |
| `refactor` | Code restructuring without behavior change |
| `test` | Adding or correcting tests |
| `chore` | Build process, tooling, dependency updates |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

**Scope** is optional but useful — it identifies the part of the codebase affected: `canvas`, `board-model`, `visualizer`, `persistence`, `ui`, `docs`, etc.

**Examples:**

```
feat(canvas): add pan and zoom with pointer events
fix(board-model): correct serialization of connector endpoints
docs(adr): record decision on Canvas 2D vs SVG rendering
chore(deps): pin TypeScript to 5.4.5
```

Keep the short description under 72 characters, written in the imperative mood ("add", "fix", "update" — not "added", "fixed", "updates"). The body can explain the *why* when the commit is not self-explanatory.

---

## Pull request process

When your branch is ready for review, open a pull request against `main`. A good pull request:

- **Has a clear title** following the Conventional Commits format.
- **Includes a description** that explains what changed, why, and any context a reviewer needs to evaluate it.
- **Links to the related issue or discussion** using `Closes #123` or `Relates to #456` in the description.
- **Includes screenshots or recordings** for any visible UI change. A before/after comparison is ideal.
- **Passes all automated checks** — CI, linting, formatting, and tests should be green before requesting review.
- **Has a self-review checklist** so reviewers know you have already verified the basics:

```
- [ ] I have read the contributing guide and code of conduct.
- [ ] My branch is up to date with main and has no merge conflicts.
- [ ] I have added or updated tests that cover my change.
- [ ] I have updated documentation that is affected by my change.
- [ ] I have run the linter and formatter and fixed all issues.
- [ ] I have tested my change locally.
- [ ] Screenshots or recordings are included for UI changes.
```

**Review process:**

- A maintainer or community reviewer will be assigned within a few business days.
- Reviews may request changes, ask clarifying questions, or suggest alternative approaches.
- Respond to all comments. If you disagree with a suggestion, explain your reasoning — do not silently ignore feedback.
- Once all required changes are addressed and the PR is approved, a maintainer will merge it.
- Squash merging is preferred to keep the main branch history clean.

---

## Coding standards

The following standards are proposed based on the expected technology directions. They will be finalized once the stack is chosen.

### TypeScript

- **Strict mode** is required. The `tsconfig.json` will include `"strict": true`. No `any` types without an explicit comment explaining why.
- All public functions, classes, and modules should have JSDoc comments.
- Use named exports rather than default exports except for top-level page/route components.
- Prefer `const` over `let`. Avoid `var`.
- Format code with [Prettier](https://prettier.io/). The project configuration is in `.prettierrc`.
- Lint with [ESLint](https://eslint.org/) using the project's `.eslintrc` configuration.

### Rust (if used)

- All code must pass `cargo clippy -- -D warnings` with zero warnings.
- Format code with `rustfmt` (`cargo fmt`). CI will reject unformatted code.
- Write `#[doc]` comments for all public items.
- Prefer explicit error handling over `unwrap()` and `expect()` in library code. Use `expect()` only where a panic indicates a programming error, and provide a descriptive message.
- Mark `unsafe` blocks with a comment explaining why the unsafe code is necessary and why it is sound.

### General

- Keep functions and modules small and focused.
- Avoid premature abstractions — build for the current requirement, not the imagined future one.
- Prefer descriptive variable names over abbreviations.
- Delete dead code rather than commenting it out.
- Keep files under 400 lines where practical; split larger files by responsibility.

---

## Testing expectations

All code contributions should include tests. The specific test frameworks will be confirmed once the stack is finalized, but the general expectations are:

- **Unit tests** for pure functions, data model logic, serialization, and algorithm implementations.
- **Integration tests** for interactions between modules (e.g., canvas event handling + board model updates).
- **Snapshot or visual tests** for UI components where visual regressions would be hard to catch manually.
- **Performance benchmarks** for canvas rendering or board operations that have latency requirements.

Test files should live alongside the code they test (e.g., `board-model.ts` → `board-model.test.ts`) or in a sibling `__tests__/` directory, following the convention established by the project.

A pull request that reduces test coverage without a clear reason is unlikely to be merged. If your change is difficult to test, explain why in the PR description.

---

## Documentation contributions

Documentation is a first-class contribution. The `docs/` directory contains the project's specifications, architecture records, engineering guides, and roadmap. Good documentation:

- uses plain, direct language;
- explains the *why* behind decisions, not just the *what*;
- includes examples wherever a concept might be abstract;
- stays current — if code changes, the related docs should change in the same PR; and
- follows the existing structure and headings in `docs/README.md`.

For substantial documentation changes (new guides, restructuring a section, adding an ADR), open a discussion first to confirm the approach. For smaller fixes (typos, broken links, outdated information), a PR is fine without a prior discussion.

---

## Behavior expectations

All contributors are expected to follow the project's [Code of Conduct](CODE_OF_CONDUCT.md). In short:

- Be respectful and constructive.
- Critique ideas and implementations, not people.
- Welcome contributors of all experience levels.
- Be patient with questions — the community benefits from making it easy to get started.
- If something feels wrong, report it as described in the Code of Conduct rather than escalating publicly.

Violations of the Code of Conduct may result in removal from the project's spaces.

---

## Contact and getting help

The primary venue for discussion is [GitHub Discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions). Whether you have a question about the project direction, want to propose a feature, or need help getting started, Discussions is the right place.

For private concerns, security issues, or Code of Conduct reports, contact the maintainers directly as described in [SECURITY.md](SECURITY.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

The full contribution guide — including more detailed setup instructions, architecture documentation, and contribution patterns as the project develops — is maintained at [`docs/community/contribution-guide.md`](docs/community/contribution-guide.md).

---

*This document will evolve as the project grows. Check back as the architecture is finalized and the codebase takes shape.*
