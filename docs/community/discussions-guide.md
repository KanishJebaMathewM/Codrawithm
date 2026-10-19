# Discussions Guide

**Status:** Proposed  
**Audience:** Community members  
**Last Reviewed:** 2024-01-15

## Overview

GitHub Discussions is the primary venue for open-ended conversations about Codrawithm — ideas, questions, architecture debates, and feedback. This guide explains how to use Discussions effectively.

---

## When to Use Discussions vs Issues

| Use Discussions for | Use Issues for |
|--------------------|----------------|
| Proposing a new feature idea | Reporting a confirmed bug |
| Asking "should we do X?" | Creating a specific task: "Implement X" |
| Architecture debates | Filing a well-defined feature request |
| Sharing use cases and feedback | Tracking work that has been agreed upon |
| Questions ("how does X work?") | Reporting a documentation error |
| Early exploration of a topic | Anything with clear acceptance criteria |

A Discussion can be converted to an Issue once the idea is clearly defined.

---

## Discussion Categories

| Category | Purpose |
|----------|---------|
| **💡 Ideas** | Feature proposals and product ideas |
| **🏗 Architecture** | Technical design discussions |
| **❓ Q&A** | Questions about the project |
| **📣 Announcements** | Maintainer announcements (read-only for community) |
| **🔬 Research** | Sharing findings from research spikes |
| **🌍 Community** | Introductions, meta-discussions |

---

## Writing a Good Discussion Post

### For Feature Ideas

Include:
- **Problem:** What are you trying to do that's currently not possible or awkward?
- **Current workaround:** How do you solve it today?
- **Proposed solution:** What should Codrawithm do?
- **Example:** A concrete workflow or use case
- **Trade-offs:** What could make this hard or undesirable?

Example:
> **Problem:** I want to step backward through a BFS visualization but currently can only go forward.
> **Current workaround:** Reset to the beginning and replay to the step before.
> **Proposed solution:** A "Previous Step" button that moves the algorithm state one step back.
> **Example:** I'm at step 7 of a BFS. I press ← and I'm at step 6, with the node state correctly reversed.
> **Trade-offs:** Requires storing all states or a reversible execution model.

### For Architecture Discussions

Include:
- **Context:** What problem needs solving?
- **Options considered:** At least two alternatives
- **Your recommendation:** Which option and why
- **Open questions:** What do you need input on?

### For Questions

Be specific. "How does collaboration work?" gets a less useful answer than "Does Yjs handle the case where two users delete the same object simultaneously?"

---

## Etiquette

- Search before posting — your question may already be answered
- Stay on topic within a thread
- Be constructive when critiquing ideas — explain why, not just "I don't like this"
- Welcome new contributors — they often bring valuable outside perspectives
- Mark answers as helpful when your question is resolved
- Maintainers may close discussions that are resolved, duplicates, or out of scope

---

## How Discussions Become Decisions

1. Discussion explores options and gathers community input
2. Maintainer summarizes the consensus (or explains the decision if not unanimous)
3. Decision is recorded in the relevant ADR or document
4. Related issues or tasks are created if implementation is approved
5. Discussion is marked as resolved

Not every Discussion results in action. "We discussed this and decided not to do it" is a valid outcome and equally valuable.

---

## Related Documents

- [Contribution Guide](./contribution-guide.md)
- [Decision Making](./decision-making.md)
- [Open Questions](../roadmap/open-questions.md)
