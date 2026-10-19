# Decision Making

**Status:** Proposed  
**Audience:** Contributors, maintainers  
**Last Reviewed:** 2024-01-15

## Overview

Clear, documented decision-making prevents confusion, reduces repeat debates, and builds contributor trust. This document describes how Codrawithm makes decisions at different scales.

---

## Decision Tiers

### Tier 1 — Small, Reversible Changes
*No process needed beyond a PR review*

Examples:
- Fixing a typo
- Improving an error message
- Adding a utility function
- Fixing a bug with a clear solution

**Process:** Open a PR. Any maintainer can merge.

---

### Tier 2 — Moderate Changes
*Needs an issue and PR with discussion*

Examples:
- Adding a new UI component to the design system
- Implementing a new canvas tool
- Adding a new API endpoint
- Improving performance of an existing feature

**Process:**
1. Open an issue describing the change and approach
2. Get a thumbs-up from a maintainer before investing significant time
3. Implement, open PR with explanation
4. One maintainer approves before merge

---

### Tier 3 — Significant Changes
*Needs a Discussion and possibly an ADR*

Examples:
- New workspace type
- Changes to the scene/document model
- Changes to the plugin API contract
- New infrastructure dependency
- Changing an accepted ADR

**Process:**
1. Open a GitHub Discussion explaining the problem and proposed solution
2. Allow at least 7 days for community input
3. Write or update an ADR with the decision
4. Two maintainer approvals before merge
5. Update relevant documentation

---

### Tier 4 — Major Architecture Decisions
*Requires an ADR and community vote*

Examples:
- Changing the backend language
- Changing the canvas rendering approach
- Changing the open-source license
- Adding or removing a core dependency (Yjs, Three.js)

**Process:**
1. Write an ADR with full context, alternatives, trade-offs
2. Open a Discussion referencing the ADR
3. Allow at least 14 days for community input
4. Maintainer summarizes feedback and announces the decision
5. ADR is updated to "Accepted" status
6. Superseded decisions update the original ADR to "Superseded"

---

## Lightweight RFC Process

For Tier 3 and Tier 4 decisions, we use a lightweight RFC (Request for Comments) process:

**RFC Template:**
```markdown
## RFC: [Title]

**Author:** [Name]
**Date:** YYYY-MM-DD
**Status:** Draft | Under Discussion | Accepted | Rejected

### Summary
[One paragraph describing what you're proposing]

### Motivation
[Why is this change needed? What problem does it solve?]

### Design
[Detailed description of the proposed change]

### Drawbacks
[Why should we NOT do this?]

### Alternatives
[What other approaches were considered?]

### Open Questions
[What needs more input or investigation?]
```

RFCs can be posted as GitHub Discussions or as documents in `docs/architecture/architecture-decisions/`.

---

## Who Makes Decisions

**Currently:** The project founder ([@KanishJebaMathewM](https://github.com/KanishJebaMathewM)) is the final decision-maker on all Tier 3 and Tier 4 decisions. Community input strongly influences decisions, but the founder retains final authority while the project is in early stage.

**As the project grows:** A core maintainer team will be formed from consistent contributors. Decisions move toward consensus-based governance. See [Project Governance](./project-governance.md) for the longer-term plan.

---

## Disagreeing With a Decision

If you disagree with a decision:
1. Re-read the ADR or discussion to understand the full reasoning
2. If you have new information not already considered, open a new Discussion with that evidence
3. "I prefer option A" without new evidence is unlikely to change an accepted decision
4. Accepted decisions can be revisited if circumstances change significantly

The goal is decisions that are well-reasoned and documented, not unanimous. Respectful disagreement is welcome; persistent argument after a final decision is not.

---

## Related Documents

- [Project Governance](./project-governance.md)
- [Contribution Guide](./contribution-guide.md)
- [Architecture Decisions](../architecture/architecture-decisions/README.md)
- [Discussions Guide](./discussions-guide.md)
