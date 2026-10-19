# License Decision

**Status: Undecided — community input requested**

Codrawithm has not yet selected a license. This document explains why the decision matters, evaluates the most relevant options, and makes a recommendation for community discussion. No code should be merged into the repository until a license is in place.

---

## Why This Decision Matters

The license an open-source project chooses shapes everything downstream: who can use the software, how it can be modified, whether a company can build a proprietary product on top of it, and whether a future maintainer can offer a hosted version commercially. Getting this wrong is expensive to fix — relicensing requires consent from every contributor.

For Codrawithm specifically, the license decision is complicated by two competing goals:

1. **Maximize community adoption and contribution.** A permissive license lowers the barrier for individuals, students, educators, and companies to use and contribute to the project.
2. **Protect the project from proprietary forks.** A permissive license also allows a well-resourced company to take the code, improve it privately, and offer a competing hosted service without giving anything back — the "cloud provider problem" that has affected many open-source projects.

A hosted SaaS model — where Codrawithm is offered as a service — is a realistic possibility if the project grows. The license choice determines whether that model is viable for the maintainers versus just for third parties.

---

## Options Evaluated

### Option 1: MIT License

**Summary:** The most permissive widely-used license. Anyone can use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software with minimal restrictions. The only requirement is that the license notice and copyright be preserved.

**Advantages:**
- Maximum adoption — developers, companies, and institutions can use it with no friction.
- No compatibility issues with other open-source dependencies.
- No CLA required, which lowers the barrier for contributors.
- Strong positive signal for enterprise adoption.
- The simplest, best-understood license in the ecosystem.

**Disadvantages:**
- Provides no protection against proprietary forks. A company can take Codrawithm, add features, run it as a hosted service, and never contribute back.
- No patent grant beyond what is implied — contributors do not explicitly license their patents.
- If the project later wants to offer a dual-license commercial model, relicensing requires every contributor's consent.

**Best for:** Maximum-adoption, fully permissive projects where the maintainers have no interest in a commercial model and are comfortable with proprietary forks.

---

### Option 2: Apache License 2.0

**Summary:** A permissive license with an explicit patent grant. Users can freely use, modify, and distribute the software, including in proprietary products. Changes must be documented, but the source of modifications does not need to be released.

**Advantages:**
- Permissive like MIT, but with an explicit patent grant — contributors license their patents to users, which matters for avoiding patent litigation.
- Widely accepted by enterprises and legal teams.
- Compatible with GPL v3 (but not GPL v2).
- No copyleft, so no obligation to release modifications or hosted versions.
- Preferred by some large foundations (Apache, CNCF projects).

**Disadvantages:**
- Like MIT, provides no protection against proprietary forks or competing hosted services.
- Slightly more complex than MIT — the NOTICE file requirement and patent termination clause add a small administrative overhead for users.
- Does not prevent the hosted service problem.

**Best for:** Projects that want permissive licensing with patent protection but are not concerned about proprietary use of the code.

---

### Option 3: GNU Affero General Public License v3.0 (AGPL-3.0)

**Summary:** A strong copyleft license that extends the GPL's requirements to cover network use. If a modified version of AGPL-licensed software is used to provide a service over a network (e.g., a hosted web application), the source code of that modified version must be made available to users of the service.

**Advantages:**
- Prevents the "cloud loophole" — any company that hosts a modified version of Codrawithm must release the modified source. This protects the project from being taken proprietary by a well-resourced third party.
- Encourages contributions back to the upstream project. A company that improves Codrawithm to run their service must share those improvements.
- Allows maintainers to offer a **commercial license** to enterprises that cannot comply with AGPL — this is the dual-licensing model used by projects like MongoDB, Elasticsearch (historically), and Akka.
- Signals strong commitment to open-source values.
- Widely understood and legally tested.

**Disadvantages:**
- Reduces adoption in enterprise environments that have policies against AGPL software.
- Requires a **Contributor License Agreement (CLA)** to enable dual-licensing — without a CLA, the maintainers cannot grant commercial licenses because they do not hold all copyright.
- Incompatible with some permissive licenses in certain configurations.
- Some developers philosophically prefer permissive licenses and may choose not to contribute.
- Increases the legal complexity of using Codrawithm as a dependency.

**Best for:** Projects that want to remain fully open-source while protecting against proprietary hosting forks and retaining the option to offer commercial licenses.

---

## Evaluation Criteria

| Criterion | MIT | Apache-2.0 | AGPL-3.0 |
|-----------|-----|------------|----------|
| Contributor friction | Very low | Low | Medium (CLA required) |
| Enterprise adoption | High | High | Low–Medium |
| Fork protection | None | None | Strong |
| Proprietary hosting protection | None | None | Strong |
| Patent grant | Implied | Explicit | Explicit |
| Dual-licensing possible | Yes (with CLA) | Yes (with CLA) | Yes (with CLA) |
| CLA required for dual-licensing | Yes | Yes | Yes |
| GPL/AGPL dependency compatibility | Compatible | Compatible | N/A (is the copyleft license) |
| Ecosystem fit (web/Rust) | Excellent | Excellent | Good |
| Complexity for contributors | Low | Low | Medium |
| Complexity for users | Low | Low | Medium–High |

---

## Recommendation

**Recommended license: AGPL-3.0 for the core platform, with a Contributor License Agreement (CLA).**

The reasoning:

1. **The hosted service problem is real for Codrawithm.** A collaborative visual workspace is exactly the kind of software that a large company could take, host at scale, and never contribute back. AGPL is the most effective defense against this outcome while keeping the software fully open-source.

2. **Dual-licensing preserves a commercial path.** AGPL + CLA allows the maintainers to offer a commercial license to enterprises that cannot use AGPL software (common in large corporations with legal policies against copyleft). This is how projects like HashiCorp (before the BSL switch), Akka, and many others fund continued development. It does not mean Codrawithm will go commercial — it means the option exists without requiring a painful relicensing process later.

3. **The contributor community is likely ideologically aligned with copyleft.** Codrawithm is positioned as a community-shaped, open-source-first tool for developers and learners. This audience is more likely to be comfortable with AGPL than an enterprise-tooling project would be.

4. **MIT and Apache-2.0 cannot be reversed.** Once code is released under a permissive license, you cannot make it more restrictive. Choosing AGPL now and later relaxing it (by releasing a more permissive version) is possible. The reverse is not.

If the community strongly prefers a permissive license, **Apache-2.0** is the recommended alternative over plain MIT, because the explicit patent grant reduces legal risk as the project and its contributors grow.

---

## CLA Rationale

A Contributor License Agreement is a legal agreement between contributors and the project maintainers. It gives the maintainers the right to relicense contributions — for example, to offer a commercial license to an enterprise customer.

Without a CLA, every contributor retains copyright over their contribution. Relicensing (including offering a commercial license) would require tracking down every contributor and getting their consent. For a project with hundreds of contributors, this is effectively impossible.

With a CLA:
- Contributors still hold their copyright.
- The maintainers also receive a license to the contribution that allows them to offer it under alternative terms (e.g., a proprietary commercial license).
- The contributor's code remains open-source and available under AGPL for everyone else.

The CLA does not prevent contributors from licensing their code elsewhere or prevent the code from remaining open-source. It only gives the maintainers the additional right to sublicense for commercial purposes.

**Recommended CLA automation:** [cla-assistant](https://cla-assistant.io/) integrates with GitHub and automatically asks contributors to sign the CLA when they open a pull request. It records signatures in a GitHub Gist, making the process lightweight for both contributors and maintainers.

---

## Dependency License Compatibility

Codrawithm's current dependency landscape is not yet finalized, but the most likely scenario involves MIT and Apache-2.0 licensed npm packages and Rust crates. Both are compatible with AGPL-3.0:

- **MIT → AGPL-3.0:** Compatible. MIT-licensed code can be used in AGPL projects.
- **Apache-2.0 → AGPL-3.0:** Compatible with AGPL v3 (but not v2). Since we are considering AGPL-3.0, this is fine.
- **GPL-2.0 → AGPL-3.0:** Incompatible. GPL v2 code cannot be combined with AGPL code. This means the project must avoid any GPL v2-only dependencies.
- **LGPL-2.1 or LGPL-3.0 → AGPL-3.0:** Generally compatible if used as a library (dynamic linking). Verify on a case-by-case basis.

When adding any new dependency, check its license and confirm compatibility before merging. The [TLDR Legal](https://tldrlegal.com/) and [SPDX License List](https://spdx.org/licenses/) are useful references.

---

## Trade-Offs Summary

| Factor | AGPL-3.0 (recommended) | MIT (most permissive) | Apache-2.0 (balanced) |
|--------|----------------------|----------------------|----------------------|
| Keeps code open forever | ✅ Yes | ❌ Allows proprietary forks | ❌ Allows proprietary forks |
| Protects against hosted forks | ✅ Yes | ❌ No | ❌ No |
| Enterprise adoption | ⚠️ Limited | ✅ Broad | ✅ Broad |
| Contributor CLA needed | ✅ Yes (for dual licensing) | ⚠️ Only if dual-licensing | ⚠️ Only if dual-licensing |
| Dual-license commercial model | ✅ Yes (with CLA) | ✅ Yes (with CLA) | ✅ Yes (with CLA) |
| Patent grant | ✅ Explicit | ⚠️ Implied only | ✅ Explicit |
| Dependency compatibility | ✅ MIT, Apache-2.0 | ✅ Everything | ✅ GPL v3, AGPL |
| Contributor friction | ⚠️ Medium (CLA) | ✅ Minimal | ✅ Low |
| Ecosystem precedent | ⚠️ Less common | ✅ Most common | ✅ Common |

---

## Next Steps

1. **Community vote or discussion:** Share this document in [GitHub Discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions) and invite feedback from early contributors and interested community members. A decision of this importance should not be made unilaterally.

2. **Draft the CLA:** If AGPL-3.0 is selected, draft a CLA before the first code contribution is accepted. A lawyer review is strongly recommended. Several open-source projects publish their CLAs publicly — the [Harmony Agreements](https://www.harmonyagreements.org/) project provides templates as a starting point.

3. **Add the LICENSE file:** Once a license is selected, add the full license text as `LICENSE` in the repository root. GitHub will recognize it automatically.

4. **Add SPDX identifiers:** Add `SPDX-License-Identifier: AGPL-3.0-only` (or the chosen license) to source files as the project develops.

5. **Set up CLA automation:** Configure [cla-assistant](https://cla-assistant.io/) to prompt contributors to sign the CLA when they open a pull request. This ensures no contribution is accepted without a signed CLA.

6. **Update the README:** Once the license is selected, update the License section in `README.md` to reflect the chosen license and link to the `LICENSE` file.

---

*This document represents a proposal and recommendation, not a final decision. The license decision belongs to the project community. All input is welcome in [GitHub Discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions).*
