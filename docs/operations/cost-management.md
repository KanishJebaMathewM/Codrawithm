# Cost Management

**Status:** Proposed  
**Audience:** Founders, engineers, product team  
**Last Reviewed:** 2024-01-15

## Overview

Understanding cost drivers is essential before setting prices or evaluating whether the project is financially sustainable. This document identifies the key cost components and frameworks for tracking them.

> All cost figures below are illustrative estimates based on public pricing as of early 2024. Actual costs depend on usage patterns, vendor pricing changes, and infrastructure choices. Do not treat these as binding projections.

---

## Primary Cost Drivers

### 1. Compute (API Servers)

The Rust+Axum backend is highly efficient. A single 2-vCPU VPS handles moderate traffic well.

| Scenario | Estimated Infra | Approx Monthly Cost |
|----------|----------------|---------------------|
| MVP / early users (<100 MAU) | 1× VPS (4GB RAM) | $10–25 |
| Growing product (1k MAU) | 2× VPS + load balancer | $50–100 |
| Scaled (10k MAU) | Managed cluster | $200–500 |

WebSocket connections are memory-intensive. Each persistent connection uses ~100–200KB RAM. 1,000 concurrent connections ≈ 100–200MB RAM.

---

### 2. Database (PostgreSQL)

| Scenario | Option | Approx Monthly Cost |
|----------|--------|---------------------|
| MVP | Self-hosted PostgreSQL on VPS | ~$0 (included in VPS) |
| Growing | Supabase Pro / Neon | $25–50 |
| Production | RDS PostgreSQL (db.t4g.medium) | $50–100 |

Board document storage: Each board's Yjs state averages 50–500KB. 10,000 boards = 500MB–5GB, which is trivial for PostgreSQL.

---

### 3. Object Storage (User Assets)

| Storage | Cost (S3 standard pricing) |
|---------|--------------------------|
| Storage | ~$0.023/GB/month |
| Egress | ~$0.09/GB (first 10TB) |
| Requests | ~$0.0004 per 1,000 PUT/GET |

Typical user: 10 boards with images ≈ 20–50MB. 1,000 users ≈ 20–50GB storage = **~$1–2/month storage**.

Egress is the main wildcard. If users frequently export large boards as images, egress costs can spike. Use a CDN (Cloudflare R2 has zero egress fees) to mitigate this.

---

### 4. AI Inference (Largest Variable Cost)

AI inference is the most significant cost at scale and the hardest to predict.

| Model | Input cost | Output cost | 1,000 diagram generations |
|-------|-----------|-------------|--------------------------|
| GPT-4o-mini | $0.15/1M tokens | $0.60/1M tokens | ~$0.75 |
| GPT-4o | $5/1M tokens | $15/1M tokens | ~$10–20 |
| Claude 3 Haiku | $0.25/1M tokens | $1.25/1M tokens | ~$1.50 |

*Pricing as of early 2024 — check current pricing before making decisions.*

**Key insight:** AI costs scale directly with usage. A free tier with generous AI access could become a significant cost driver. Quota limits are essential.

**Mitigation strategies:**
- Default to cheaper models (GPT-4o-mini, Claude Haiku)
- Strict token limits per request (max 2,000 tokens output)
- Monthly quota per user (e.g. 10,000 tokens free, 100,000 tokens Pro)
- "Bring Your Own Key" option — users pay their own AI costs
- Cache AI responses for identical prompts (aggressive caching can save 20–40% of AI costs)

---

### 5. Bandwidth / Network

CDN traffic (frontend serving) via Cloudflare free tier: effectively $0 for most projects.

WebSocket traffic: Real-time collaboration is bandwidth-intensive.
- 1 active collaborator session ≈ 1–5KB/s of WebSocket traffic
- 100 concurrent sessions ≈ 500KB/s = ~1.8GB/hour
- Most VPS providers include 1–5TB/month — typically not a bottleneck at small scale

---

### 6. Email

Transactional email (invites, password reset, notifications):
- Resend / Postmark / AWS SES: ~$0.001 per email
- 10,000 emails/month ≈ $10

---

## Unit Economics Framework

To evaluate pricing viability, track cost per active user:

```
Monthly Cost per Active User = 
  (Compute + DB + Storage + Bandwidth) / MAU
  + (AI cost per user per month)
  + (Email cost per user per month)
  + (Observability, misc) / MAU
```

Target: Free tier cost per user should be < $0.50/month to be sustainable at scale.

---

## Cost Reduction Levers

| Lever | Potential Saving |
|-------|----------------|
| Cloudflare R2 for assets (zero egress) | High |
| Aggressive AI response caching | Medium–High |
| Move to cheaper AI models | High |
| BYOK (bring your own AI key) | High (shifts cost to user) |
| Lazy load expensive features | Medium |
| Compress Yjs snapshots | Low |
| Move DB to Neon (scale-to-zero) | Medium for early stage |

---

## Related Documents

- [Pricing and Monetization](../product/pricing-and-monetization.md)
- [Deployment](./deployment.md)
- [AI Integration](../architecture/ai-integration.md)
