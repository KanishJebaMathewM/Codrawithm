# Milestones

**Status:** Proposed  
**Audience:** Contributors, community  
**Last Reviewed:** 2024-01-15

> Milestones are not release dates. They are collections of deliverables with clear acceptance criteria. The project moves to the next milestone when all criteria are met.

---

## M0 — Foundation

**Description:** The documentation, tooling, and technical validation needed before any production code is written.

**Deliverables:**
- Complete documentation system (this repository)
- Open-source license selected and committed
- ADRs reviewed by community
- Canvas rendering PoC achieving performance targets
- Yjs collaboration PoC working locally
- Repository structure, CI, and contributing guide established

**Acceptance Criteria:**
- [ ] `LICENSE` file exists in repository
- [ ] All critical ADRs have status "Accepted" or "Under Review" with community discussion
- [ ] Canvas PoC renders 500 objects at ≥ 55fps (measured, documented)
- [ ] Yjs PoC: two browser tabs stay in sync after concurrent edits
- [ ] GitHub Actions CI runs on every pull request
- [ ] `CONTRIBUTING.md` guides a new contributor to their first PR

---

## M1 — Alpha Canvas

**Description:** A working single-user drawing application that can be shared publicly for feedback.

**Deliverables:**
- Web app deployed to a public URL
- Core drawing tools (shapes, text, connectors, pen)
- Pan/zoom, selection, undo/redo
- Save to localStorage, export PNG/SVG

**Acceptance Criteria:**
- [ ] Public URL accessible without login
- [ ] User can complete the "draw a binary tree" workflow from the README example
- [ ] Canvas renders 500 objects at ≥ 55fps on a 2020-era mid-range laptop
- [ ] Passes Lighthouse performance score ≥ 75, accessibility score ≥ 80
- [ ] No critical or high Sentry errors in first 48 hours of public access
- [ ] Export produces valid PNG and SVG files

---

## M2 — Developer Preview

**Description:** Specialist workspaces that are distinctly useful for developers and DSA learners.

**Deliverables:**
- Algorithm Lab workspace with step-by-step playback
- At least 5 DSA visualizations (BFS, DFS, binary search, array ops, linked list)
- Flowchart and mind map workspace types
- 10+ templates

**Acceptance Criteria:**
- [ ] BFS step-by-step is deterministic: given the same graph and start node, always produces the same step sequence
- [ ] A user unfamiliar with the product can start a BFS visualization within 5 minutes of opening the app (usability test)
- [ ] All algorithm visualizations have automated regression tests
- [ ] Templates load correctly and are immediately editable

---

## M3 — Collaborative Beta

**Description:** Multiple users can work on the same board in real time.

**Deliverables:**
- User accounts and authentication
- Real-time board sync (Yjs + WebSocket)
- Shared cursors and presence
- Board permissions (owner, editor, viewer)
- Share links
- Version history

**Acceptance Criteria:**
- [ ] Two users on different networks can edit the same board without data loss
- [ ] Disconnecting for 60 seconds and reconnecting recovers all offline edits
- [ ] Concurrent edits converge to the same state (measured with automated concurrent edit test)
- [ ] Share link generates a working URL within 2 seconds
- [ ] Version restore recovers board to within 5 minutes of the selected snapshot time
- [ ] Board with 20 concurrent editors maintains < 500ms sync latency (P95)

---

## M4 — AI Plugin Release

**Description:** Extensible plugin platform with AI-assisted diagram generation.

**Deliverables:**
- Plugin sandbox and SDK
- AI proxy backend
- Text-to-flowchart reference plugin
- Plugin marketplace (basic listing)

**Acceptance Criteria:**
- [ ] A plugin cannot read the host page's DOM or cookies (iframe sandbox verified)
- [ ] AI API keys never appear in browser network traffic (verified via DevTools inspection)
- [ ] Free tier quota is enforced: > 10,000 tokens triggers quota error
- [ ] Reference plugin generates a correct, editable flowchart for 9/10 test prompts
- [ ] External developer can publish a plugin following public documentation (dogfooded)

---

## M5 — 3D and Advanced Features

**Description:** Optional 3D workspace and specialist creative tools.

**Deliverables:**
- 3D workspace (lazy-loaded)
- Simulations and data visualization

**Acceptance Criteria:**
- [ ] Opening a 2D board does NOT load Three.js (verified via bundle analysis)
- [ ] 3D workspace with 1,000 objects renders at ≥ 30fps
- [ ] GPU context loss is recovered gracefully (no crash, user is prompted to reload scene)
- [ ] GLTF file import works for files up to 50MB

---

## M6 — Production Launch

**Description:** Fully audited, accessible, and operationally hardened for public launch.

**Acceptance Criteria:**
- [ ] WCAG 2.1 AA compliance verified
- [ ] No critical or high security findings from external audit
- [ ] Backup tested: database restored from backup successfully in staging
- [ ] 99.5% uptime over 30-day rolling window
- [ ] Complete self-hosting guide tested by an external contributor

---

## Related Documents

- [Product Roadmap](./product-roadmap.md)
- [Technical Risks](./technical-risks.md)
- [Open Questions](./open-questions.md)
