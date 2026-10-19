# Pricing and Monetization

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm is an open-source project first. The monetization model is designed to sustain the project's infrastructure and development without compromising the open-source mission. The model is inspired by projects like GitLab CE/EE and Plausible Analytics.

**Core principle:** The product must be genuinely useful on the free tier. Features that create diagramming or collaboration lock-in are never paywalled.

---

## Tiers

### Free Tier

Available to everyone, always.

| Feature | Free |
|---------|------|
| Boards | Unlimited |
| Collaborators per board | Up to 10 |
| Board history retention | 30 days |
| File storage (images, assets) | 1 GB |
| Export (PNG, SVG, PDF, JSON) | ✓ |
| Algorithm visualization | ✓ |
| Collaboration (real-time co-editing) | ✓ |
| Plugins (community plugins) | ✓ |
| Self-hosting | ✓ (all features available) |
| Public boards | ✓ |
| AI provider plugin (bring your own key) | ✓ |
| Guest access (view + comment) | ✓ |

### Pro Tier

For power users and teams who need higher limits.

Pricing model is TBD. The following table represents the intended differentiation, not a firm pricing commitment.

| Feature | Pro |
|---------|-----|
| All Free features | ✓ |
| Collaborators per board | Unlimited |
| Board history retention | 90 days |
| File storage | 20 GB |
| Priority support | ✓ |
| Private boards (hidden from public search) | ✓ |
| Analytics dashboard (board views, engagement) | ✓ |
| Custom board domains | ✓ |
| SAML SSO | ✓ |
| Guest edit access (unauthenticated users editing) | ✓ |
| AI provider credits (hosted instance) | ✓ (limited monthly credits) |
| Advanced comment features (threaded, reactions) | ✓ |

### Self-Hosted

All Codrawithm features are available in the self-hosted version without restriction. The self-hosted version is the unmodified open-source code and does not require a license key.

Self-hosted operators are encouraged (but not required) to:
- Contribute improvements back to the open-source project.
- Report issues and bugs.
- Support the project via GitHub Sponsors or similar.

Self-hosted instances do not phone home and do not require an internet connection to function.

---

## Contributor Perks

Active contributors to the Codrawithm open-source project receive Pro tier access on the hosted service at no cost. This is a recognition of their contribution, not a financial incentive that creates conflicts.

**Qualifying contributions:**
- Merged pull requests with significant code changes (community-defined threshold).
- Maintained community plugins in the official plugin registry.
- Substantial documentation contributions.
- Long-term community leadership (moderation, issue triage, community support).

**Process:** Contributors submit a request linking to their contributions. A maintainer reviews and grants Pro access.

---

## What Will Never Be Paywalled

Codrawithm commits to keeping the following features free forever:

1. Unlimited boards.
2. Full export (PNG, SVG, PDF, JSON) — complete data portability.
3. Real-time collaboration (up to 10 users).
4. Algorithm visualization.
5. The ability to self-host the full product.
6. All existing features on the free tier at the time a user signed up (no retroactive downgrade).

These commitments are intended to be incorporated into the project governance documentation as binding community commitments.

---

## Cost Framework

The hosted service's primary infrastructure costs:

| Cost Driver | Notes |
|-------------|-------|
| Compute (backend, WebSocket server) | Scales with concurrent users. Variable. |
| Database (PostgreSQL) | Scales with board count and history retention. |
| Object storage (images, assets) | Scales with storage usage. |
| AI proxy (if hosting an AI provider) | Per-request cost. Controlled by rate limiting. |
| Bandwidth | Scales with collaboration message volume and asset delivery. |
| CDN | Amortized across all users. |

For self-hosted operators, see [Cost Management](../operations/cost-management.md) for infrastructure cost estimates.

---

## Plugin Marketplace (Future)

In a later phase, a plugin marketplace will allow community plugin developers to offer premium plugins. The model:
- **Free plugins:** Community-developed, no charge.
- **Premium plugins:** Plugin developer sets a price. Codrawithm takes a percentage (exact percentage TBD, likely 20–30%).
- **Revenue sharing:** Plugin developers receive the remainder.
- **Core never competes:** Codrawithm core team will not create commercial plugins that compete with community plugins.

---

## Sustainability Philosophy

The pricing model is designed for **sustainability, not scale-up**:
- The goal is to cover infrastructure costs and fund a small team of maintainers, not achieve venture-scale growth.
- If the project's costs are covered by Pro subscriptions, pricing will not increase.
- Financial reporting will be published annually (revenue, costs, surplus/deficit) to maintain community trust.

---

## Related Documents

- [Non-Goals](../vision/non-goals.md)
- [Product Vision — No Dark Patterns](../vision/product-vision.md#6-no-dark-patterns)
- [Project Governance](../community/project-governance.md)
- [Cost Management](../operations/cost-management.md)
