# Good First Issues

**Status:** Active  
**Audience:** New contributors  
**Last Reviewed:** 2024-01-15

New to Codrawithm? Here are the best places to start based on your skills and interests.

---

## Before the Code Exists (Phase 0)

Since the application isn't built yet, the best first contributions are non-code:

### Discussion Contributions
- Share your use case in [GitHub Discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions)
- Answer the open questions in [open-questions.md](../roadmap/open-questions.md)
- Compare an existing tool (Excalidraw, Miro, etc.) and share what it does well and what's missing

### Documentation Contributions
- Fix a typo or unclear sentence in any doc
- Add an example to an existing document
- Translate documentation (if you're bilingual)
- Improve the README clarity

### Research Contributions
- Run one of the [research spikes](../roadmap/research-spikes.md) and post findings
- Compare canvas libraries (Konva.js vs Fabric.js vs custom) with a small benchmark
- Prototype the Yjs collaboration PoC

---

## When the Code Exists (Phase 1+)

### Good for: JavaScript/TypeScript beginners

- Add a missing keyboard shortcut
- Improve an error message to be more helpful
- Fix a layout issue on small screens
- Add a tooltip to a toolbar button
- Write a test for an existing utility function
- Add a new canvas template (JSON file)

### Good for: React developers

- Build a new UI component following the design system
- Add loading skeleton for a slow-loading view
- Improve empty state for a panel or view
- Add a missing accessibility attribute (`aria-label`, `role`, etc.)
- Fix a focus management issue in a dialog

### Good for: TypeScript/architecture enthusiasts

- Add a missing type to the canvas object schema
- Improve a type that uses `any` with a proper type
- Write missing JSDoc comments for exported functions
- Add input validation to an API call

### Good for: Rust beginners

- Add a missing test for an existing API endpoint
- Improve an error message in an API response
- Add a missing field to a database query
- Fix a Clippy warning

### Good for: Algorithm/DSA enthusiasts

- Implement a new algorithm visualization (propose the algorithm first)
- Add a new data structure node type (e.g. heap, trie)
- Improve the layout algorithm for tree visualization
- Write tests for an existing visualization

### Good for: Designers / UX contributors

- Propose a better empty state for a feature
- Suggest improvements to keyboard shortcut discoverability
- Create a template for a common workflow (system design, interview prep)
- Audit the interface against WCAG 2.1 AA and file issues

### Good for: Technical writers

- Improve a confusing document section
- Add a diagram to a document that lacks one
- Write an example for the plugin API
- Translate the README

---

## How to Find Real Issues

Once the project has issues, look for these labels:

| Label | Meaning |
|-------|---------|
| `good first issue` | Well-scoped, clear requirements, mentorship available |
| `help wanted` | Any contributor can pick this up |
| `documentation` | Documentation improvement |
| `design` | Needs design/UX input |
| `spike` | Research investigation |
| `discussion` | Needs community input before implementation |

---

## Tips for Your First PR

1. **Start small.** A one-line fix merged is better than a 500-line PR stuck in review.
2. **Comment before starting.** "I'd like to work on this" on the issue prevents duplicate work.
3. **Ask early.** If you're unsure, ask in the issue before spending hours on the wrong approach.
4. **Write tests.** A PR with tests is much easier to review and merge.
5. **Follow the style.** Read the [Coding Standards](../engineering/coding-standards.md) before writing a lot of code.

---

## Related Documents

- [Contribution Guide](./contribution-guide.md)
- [Research Spikes](../roadmap/research-spikes.md)
- [Open Questions](../roadmap/open-questions.md)
