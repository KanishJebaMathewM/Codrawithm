# ADR-014: Open-Source License

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

Codrawithm is open-source. The license determines: who can use the code, whether companies can build commercial products on top of it without contributing back, and whether a hosted SaaS service can be built on the code.

---

## Requirements

- Must allow individuals and teams to self-host without restriction.
- Must allow community contributions without legal barriers.
- Should prevent large companies from offering Codrawithm as a hosted service without contributing.
- Must not prevent legitimate commercial use (e.g., a company using Codrawithm internally).

---

## Alternatives Considered

### Option A: AGPL-3.0

GNU Affero General Public License v3. A copyleft license that requires anyone who modifies and deploys the software as a network service to release their modifications as open source.

**Pros:**
- Prevents SaaS companies from building a competing hosted Codrawithm without contributing back.
- Allows individuals and companies to self-host without any restriction.
- Well-understood by the open-source community.
- Used by: Plausible Analytics, Gitea, Sentry (server-side).

**Cons:**
- Some companies have blanket bans on AGPL software due to legal caution.
- Contributions to plugins from companies may require their plugin code to be AGPL too.

### Option B: Apache-2.0

Permissive license. Anyone can use, modify, and distribute, including in commercial products.

**Pros:**
- Broad adoption — no legal barriers for any company.
- Compatible with many other licenses.
- No copyleft requirements.

**Cons:**
- Large companies can fork and offer a competing hosted service without contributing back.
- Does not protect against "open-core appropriation."

### Option C: Business Source License (BSL / BUSL)

A source-available license that converts to Apache-2.0 after a set time period (e.g., 4 years). Commercial use requires a license from the copyright holder.

**Pros:**
- Prevents commercial competition in the short term.
- Converts to a permissive license over time.

**Cons:**
- Not an OSI-approved open-source license — restricts what the community can do.
- May discourage contributions.
- Complex legal terms confuse contributors.

---

## Decision

**Under Discussion — Community input needed.**

This is a product and community decision, not purely a technical one. The current recommendation leans toward **AGPL-3.0** because:
- It protects against SaaS appropriation.
- Self-hosting is completely unrestricted.
- It aligns with the project's "open by default" philosophy.

However, this requires community consensus. A vote or RFC process is recommended.

For plugins: plugins can be licensed independently. The Codrawithm plugin API will be clearly documented as a separate interface layer, potentially with a note that plugins under different licenses are permitted.

---

## Consequences

### Positive (AGPL-3.0)
- Prevents large companies from building competing SaaS without contributing.
- Aligns with the project's sustainability model.

### Negative (AGPL-3.0)
- Some enterprise contributors may be blocked by company legal policies.

### Risks
- License disputes if the license is not clearly applied to all source files.
- Mitigation: Add SPDX headers to all source files; document license in README.

---

## Evidence / Proof-of-Concept Needed

- Community discussion in GitHub Discussions.
- Legal review of AGPL-3.0 implications for plugins.

---

## Related ADRs

- None
