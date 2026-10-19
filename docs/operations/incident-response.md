# Incident Response

**Status:** Proposed  
**Audience:** Engineers, on-call team  
**Last Reviewed:** 2024-01-15

## Overview

This document defines how to detect, respond to, and learn from production incidents. In the early stage, "on-call" means the core maintainers. As the team grows, this process should evolve.

---

## Severity Levels

| Severity | Definition | Response Time | Examples |
|----------|-----------|---------------|---------|
| **P0 — Critical** | Complete service outage or data loss | Immediate (< 15 min) | Database down, all users unable to access boards, data corruption |
| **P1 — High** | Major feature broken for all users | < 1 hour | Collaboration sync broken, login failing, all exports failing |
| **P2 — Medium** | Feature broken for some users or degraded performance | < 4 hours | Slow canvas loading, AI features down, image uploads failing |
| **P3 — Low** | Minor issue, workaround available | Next business day | UI glitch, non-critical API error, cosmetic bug |

---

## Detection

Incidents are detected through:
- **Uptime monitoring:** UptimeRobot or Better Uptime pinging `/health` every 60 seconds
- **Error tracking:** Sentry alerting on error rate spikes
- **User reports:** GitHub Issues, Discord, email
- **Metrics dashboards:** CPU, memory, DB connection pool, WebSocket connections

---

## Response Playbook

### Step 1: Acknowledge (< 5 minutes)
- Confirm the incident is real (not a false alarm)
- Post in the team channel: "🔴 Investigating [issue]. [Your name] is on it."
- For P0/P1: Update the status page immediately

### Step 2: Assess (< 15 minutes)
Answer these questions:
- What is broken? (feature, data, performance?)
- Who is affected? (all users, some users, specific feature?)
- When did it start? (check metrics, logs, recent deployments)
- Was there a recent deployment?

```bash
# Quick diagnostic commands
docker compose ps                          # Are all services running?
docker compose logs api --tail=100         # Recent API logs
curl https://api.codrawithm.dev/health/ready  # Readiness check
# Check PostgreSQL connections
# Check Redis connectivity
```

### Step 3: Mitigate (minimize impact)
- If caused by a recent deployment: **roll back immediately**, investigate later
- If database issue: check connections, run queries to diagnose
- If memory/CPU spike: check for runaway processes, scale if possible
- Communicate to users if P0/P1: "We're aware of an issue affecting [feature] and are working on a fix."

### Step 4: Resolve
- Apply the fix (or confirm rollback is stable)
- Verify with health checks and manual testing
- Update status page: "Resolved"
- Notify affected users if necessary

### Step 5: Post-Mortem (within 48 hours for P0/P1)
Write a post-mortem document (see template below).

---

## Rollback Procedure

```bash
# On the server

# 1. Get the previous image tag from GHCR
# (Note the tag from the last working deployment)

# 2. Update docker-compose.prod.yml to use previous tag
# Or use Docker directly:
docker pull ghcr.io/kanishjebamathewm/codrawithm-api:v0.4.1

# 3. Restart with previous image
docker compose -f docker-compose.prod.yml up -d api

# 4. Verify
curl https://api.codrawithm.dev/health
```

---

## Post-Mortem Template

```markdown
# Incident Post-Mortem: [Title]

**Date:** YYYY-MM-DD  
**Severity:** P0 / P1 / P2  
**Duration:** X hours Y minutes  
**Author:** [Name]

## Summary
[1-2 sentence description of what happened and its impact]

## Timeline
- HH:MM — [Event]
- HH:MM — [Event]
- HH:MM — [Resolved]

## Root Cause
[What actually caused the incident]

## Contributing Factors
[What made it worse or harder to detect]

## Impact
- Users affected: [estimate]
- Data lost: [none / description]
- Features unavailable: [list]

## What Went Well
[Things that helped the response]

## What Could Be Improved
[Things that slowed response or made it worse]

## Action Items
| Action | Owner | Due Date |
|--------|-------|---------|
| [Action] | [Name] | [Date] |
```

---

## Communication Templates

**Status page update (during incident):**
> We are investigating reports of [issue]. Our team is working to resolve this. We will provide updates every 30 minutes.

**Resolution update:**
> The issue affecting [feature] has been resolved as of [time UTC]. All services are operating normally. We apologize for the disruption.

**Post-incident summary (for significant incidents):**
> On [date], some users experienced [issue] for approximately [duration]. The root cause was [brief explanation]. We have implemented [fix] to prevent recurrence.

---

## Related Documents

- [Deployment](./deployment.md)
- [Backups and Recovery](./backups-and-recovery.md)
- [Observability](../engineering/observability.md)
