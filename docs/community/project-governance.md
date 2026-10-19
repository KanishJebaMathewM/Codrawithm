# Project Governance

**Status:** Proposed  
**Audience:** Contributors, community  
**Last Reviewed:** 2024-01-15

> This is a governance proposal for an early-stage project. It describes the current state honestly and a path toward more mature governance as the community grows. No maintainer team, steering committee, or formal organization exists yet beyond the project founder.

---

## Current State (Phase 0)

Codrawithm is a one-person project in early ideation. The founder:
- Makes all final technical and product decisions
- Reviews and merges pull requests
- Manages the repository and community channels
- Represents the project publicly

This is appropriate for the current stage. As contributors join consistently, governance should evolve.

---

## Roles

### Contributor
Anyone who participates in the project — through discussions, issues, pull requests, or documentation. Contributors have no special permissions but are recognized and valued.

### Committer
A contributor who has demonstrated consistent, high-quality contributions and has been granted write access to the repository. Committers can:
- Review and approve pull requests from contributors
- Triage and label issues
- Merge Tier 1 and Tier 2 changes (see [Decision Making](./decision-making.md))

Committer access is granted by the maintainer team after observing consistent quality contributions over at least 2 months.

### Maintainer
A core decision-maker for the project. Maintainers can:
- Make final decisions on Tier 3 changes
- Vote on Tier 4 decisions
- Grant Committer access
- Manage releases

Initially, the project founder is the sole maintainer. New maintainers are added by unanimous agreement of existing maintainers.

### Project Lead
Currently the project founder. Responsible for the overall direction, resolves deadlocks, and has final authority on Tier 4 decisions. The role of Project Lead can be transferred if the founder chooses to step back.

---

## How Decisions Are Made

See [Decision Making](./decision-making.md) for the tier system.

Summary:
- Tier 1–2: Any committer can merge after review
- Tier 3: Requires maintainer approval after community discussion
- Tier 4: Requires community Discussion (14 days), ADR, maintainer vote

---

## Code of Conduct Enforcement

Violations of the [Code of Conduct](../../CODE_OF_CONDUCT.md) are handled by the maintainer team:

1. **Warning:** Private message to the person explaining the issue
2. **Temporary ban:** Temporary suspension from community channels
3. **Permanent ban:** Permanent removal from the community

Reports are sent to the maintainer team privately. The reporter's identity is kept confidential when investigating.

---

## Becoming a Committer

There is no formal application process. Maintainers proactively invite contributors who have:
- Merged at least 5 high-quality pull requests
- Participated constructively in discussions
- Demonstrated understanding of the project's goals and standards
- Been active in the community for at least 2 months

If you believe you meet these criteria and haven't been invited, you may reach out to a maintainer.

---

## Governance Evolution

As the project grows, governance should evolve to:

1. **Phase 0–1:** Founder-led, contributor input through Discussions
2. **Phase 2–3:** Small maintainer team (3–5 people) with consensus decision-making
3. **Phase 4+:** Consider a formal Technical Steering Committee or a foundation model if warranted by growth

Any change to the governance model itself requires a Tier 4 decision.

---

## Transparency Commitments

- All significant decisions are documented in ADRs or GitHub Discussions
- The project roadmap is public
- Finances (once they exist) will be reported annually if the project accepts donations or revenue
- Conflicts of interest are disclosed by maintainers before participating in related decisions

---

## Related Documents

- [Code of Conduct](../../CODE_OF_CONDUCT.md)
- [Decision Making](./decision-making.md)
- [Contribution Guide](./contribution-guide.md)
