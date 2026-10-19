# Success Metrics

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Success metrics define what "working" looks like for Codrawithm — for the product and the community around it. Initial targets are conservative estimates for an early-stage open-source project and will be revised as the product matures.

---

## Acquisition Metrics

| Metric | Phase 1 Target | Phase 2 Target | Measurement Method |
|--------|---------------|---------------|-------------------|
| GitHub Stars | 500 | 2,000 | GitHub API |
| Monthly unique visitors (docs/site) | 1,000 | 10,000 | Privacy-respecting analytics |
| New registered users / month | 100 | 1,000 | Auth DB |
| Self-hosted instances deployed | 20 | 200 | Opt-in telemetry |
| Monthly active contributors | 5 | 20 | GitHub insights |

---

## Activation Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Time to first canvas action (create a shape) | < 30 seconds from first open | Session analytics |
| % of new visitors who create ≥ 1 shape | > 40% | Funnel analytics |
| % of new users who complete a tutorial / example board | > 30% | Completion event |

---

## Engagement Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| WAU / MAU ratio | > 40% | User session DB |
| Average session duration | > 15 minutes | Session analytics |
| Boards created per active user per month | ≥ 3 | DB aggregate |
| Algorithm visualizations created per month | 500 (Phase 1) | Event tracking |
| Collaborative sessions (≥ 2 users on same board simultaneously) | > 15% of boards | Session analytics |
| Returning users after 30 days | > 35% | Cohort analysis |

---

## Algorithm Visualization Specific Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Algorithm visualizations created per day | 50 (Phase 1), 500 (Phase 2) | Event tracking |
| Visualizations with ≥ 1 annotation added | > 25% | Annotation event |
| Shared algorithm visualization links | > 30% of created visualizations | Share event |
| Mobile views of shared links | > 20% of opens | User agent tracking |

---

## Performance Targets (Technical KPIs)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Initial page load (empty board) | < 2 seconds on 4G | Lighthouse / CrUX |
| Time to Interactive | < 3 seconds | Core Web Vitals |
| Canvas FPS with 500 objects | ≥ 55 fps | Custom perf harness |
| Canvas FPS with 5,000 objects | ≥ 30 fps | Custom perf harness |
| Pan/zoom response latency | < 16 ms | Frame Timing API |
| Collaboration update latency (LAN) | < 100 ms | Custom test harness |
| Algorithm step playback time | < 50 ms | Jest benchmark |

Full performance budget in [performance-engineering.md](../engineering/performance-engineering.md).

---

## Community & Contribution Metrics

| Metric | Phase 1 Target | Phase 2 Target | Measurement Method |
|--------|---------------|---------------|-------------------|
| Open Issues resolved per month | ≥ 10 | ≥ 30 | GitHub insights |
| Pull Requests merged per month | ≥ 5 | ≥ 20 | GitHub insights |
| Time to first response on new issues | < 72 hours (≥ 95%) | Ongoing | GitHub bot tracking |
| Community-contributed plugins | 0 (Phase 1) | 5 (Phase 2) | Plugin registry |
| Docs pages with recent updates (< 6 months) | > 80% | Ongoing | Git log |

---

## Self-Hosting Adoption Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Docker Compose setup success rate | > 90% | Guided by opt-in telemetry from setup scripts |
| Time from `docker compose up` to working canvas | < 5 minutes | Internal benchmark |
| Self-hosted instances reporting opt-in version pings | 20 (Phase 1) | Opt-in only, anonymized |

---

## Anti-Metrics (What We Are Not Optimizing For)

| Anti-Metric | Why We Avoid It |
|-------------|----------------|
| Raw page views | Can be inflated by bots; engagement matters more |
| Number of features shipped | Features without user adoption are waste |
| GitHub Stars as primary success metric | Stars are vanity; WAU and contribution health matter more |
| AI usage % of sessions | AI should assist power users, not be a crutch |

---

## Metric Collection Principles

1. **Privacy first.** No individual tracking without explicit opt-in. Aggregate analytics only by default.
2. **Self-hosted instances choose.** Deployments default to no telemetry. Operators can opt in.
3. **Open metrics.** Aggregate dashboards are public where feasible to build community trust.
4. **Avoid dark patterns.** Notifications and engagement prompts must not be designed to manipulate usage.

---

## Related Documents

- [Product Vision](product-vision.md)
- [Requirements](requirements.md)
- [Performance Engineering](../engineering/performance-engineering.md)
- [Product Roadmap](../roadmap/product-roadmap.md)
