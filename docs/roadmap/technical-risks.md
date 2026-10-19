# Technical Risks

**Status:** Proposed  
**Audience:** Engineers, contributors, project maintainers  
**Last Reviewed:** 2024-01-15

## Risk Register

| ID | Risk | Likelihood | Impact | Phase | Mitigation |
|----|------|-----------|--------|-------|-----------|
| R01 | Canvas performance degrades with large object counts | Medium | High | 1 | Viewport culling, spatial indexing PoC in Phase 0 |
| R02 | Chosen canvas library license incompatible with hosted SaaS | Low | Critical | 0 | License review before any implementation |
| R03 | Yjs + Rust yrs crate has production bugs or API gaps | Medium | High | 3 | PoC in Phase 0, evaluate alternatives early |
| R04 | WebSocket scaling bottleneck at 100+ concurrent boards | Low | Medium | 3 | Redis pub/sub fan-out design ready before Phase 3 |
| R05 | AI inference costs exceed revenue at scale | High | High | 4 | Strict quotas, BYOK option, cheap model defaults |
| R06 | Plugin sandbox security vulnerability | Medium | Critical | 4 | External security review before Phase 4 launch |
| R07 | Three.js bundle size increases load time for all users | High | Medium | 5 | Strict lazy-loading enforced in Phase 5 |
| R08 | 3D rendering complexity derails other features | Medium | Medium | 5 | 3D is a separate, optional module; can be cut |
| R09 | Collaborative undo/redo confuses users | Medium | Medium | 3 | User testing, clear UX communication |
| R10 | Rust backend learning curve slows contributors | Medium | Medium | 1+ | TypeScript fallback option documented in ADR-009 |
| R11 | CRDT document size grows unbounded | Low | High | 3 | Snapshot + compaction strategy in place before launch |
| R12 | Algorithm visualization execution model tightly coupled to renderer | Medium | Medium | 2 | Design execution model independently, renderer is separate |
| R13 | Mobile/touch UX is poor due to desktop-first focus | Medium | Low | 1 | Design touch interactions early; don't bolt on later |
| R14 | Dependency supply chain attack | Low | High | All | Pinned versions, automated vuln scanning in CI |
| R15 | Open-source license prevents desired business model | Low | High | 0 | License decision in Phase 0, community vote |

---

## Detailed Risk Analysis

### R01 — Canvas Performance with Large Object Counts

**Description:** The canvas becomes sluggish when users create hundreds or thousands of objects. Pan/zoom drops below 30fps.

**Why it matters:** A slow canvas makes the product frustrating for power users and disqualifies it for system architecture diagrams with many components.

**Mitigation:**
1. Implement viewport culling — don't render objects outside the visible area
2. Use a quadtree or R-tree for spatial indexing to make culling fast
3. Benchmark in Phase 0 with 500, 1,000, and 5,000 objects before committing to the canvas library
4. If Konva.js can't meet targets, evaluate a custom WebGL renderer

**Trigger:** < 55fps with 500 objects on a mid-range laptop (measured, not assumed)

---

### R05 — AI Inference Cost at Scale

**Description:** If free-tier users heavily use AI features, AI API costs can exceed revenue.

**Why it matters:** A free user generating 100 flowcharts/month at GPT-4o pricing could cost $10–20/month per user — completely unsustainable.

**Mitigation:**
1. Default to cheapest capable model (GPT-4o-mini or Claude Haiku)
2. Free tier: 10,000 tokens/month (approximately 20–30 diagram generations)
3. BYOK option from day one of Phase 4
4. Aggressive prompt caching (same prompt → cache the response for 24 hours)
5. Monitor cost-per-active-user weekly from first AI user

**Trigger:** AI cost per free user > $0.50/month

---

### R06 — Plugin Sandbox Security Vulnerability

**Description:** A malicious or buggy plugin escapes the iframe sandbox and accesses user data or credentials.

**Why it matters:** This is a critical trust failure. One security incident with plugins could destroy the project's credibility.

**Mitigation:**
1. `allow-same-origin` is never set on plugin iframes
2. All plugin communication goes through validated postMessage
3. CSP on plugin iframes prevents unauthorized network requests
4. External security review of the plugin system before opening the marketplace
5. Plugin registry review process before listing any plugin

**Trigger:** Any escape from sandbox, any unauthorized data access

---

### R11 — CRDT Document Size Growth

**Description:** Yjs documents grow over time as update history accumulates. A heavily edited board could reach hundreds of MB.

**Why it matters:** Large documents slow sync, increase bandwidth costs, and cause memory pressure.

**Mitigation:**
1. Periodic snapshot compaction: store a clean snapshot, discard old update log
2. Maximum document size limit (50MB uncompressed) with user warning at 40MB
3. Monitor document sizes from first collaboration user

**Trigger:** Any board document exceeding 10MB; P95 document size > 5MB

---

## Risk Review Process

Risks should be reviewed at the end of each phase:
- New risks identified during the phase are added
- Mitigated risks are marked resolved
- Changed likelihoods or impacts are updated
- Phase exit criteria require that all Critical-impact risks have active mitigations

---

## Related Documents

- [Product Roadmap](./product-roadmap.md)
- [Open Questions](./open-questions.md)
- [Research Spikes](./research-spikes.md)
- [Technical Risks — Architecture](../architecture/overview.md)
