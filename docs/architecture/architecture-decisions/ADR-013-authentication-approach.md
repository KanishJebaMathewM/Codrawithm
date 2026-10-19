# ADR-013: Authentication Approach

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

Users need to authenticate to Codrawithm to save boards, collaborate, and manage permissions. The authentication system must support email/password, OAuth 2.0 social login, and future enterprise SAML SSO. Guest access (no account, view-only) must also be supported.

---

## Requirements

- Must support email/password authentication.
- Must support OAuth 2.0 social login (GitHub, Google).
- Must support guest access (no account, view-only via share link).
- Must be stateless (no server-side session, scales horizontally).
- Must support SAML SSO in Phase 2.
- Must support refresh token rotation to detect token theft.

---

## Alternatives Considered

### Option A: JWT + Refresh Tokens

Short-lived access tokens (15 min JWT) + long-lived refresh tokens (30 days, stored in httpOnly cookie).

**Pros:**
- Stateless access tokens — backend doesn't need to look up sessions on every request.
- Refresh token rotation detects replay attacks.
- httpOnly cookie for refresh token prevents XSS access.
- Industry standard; well-understood.

**Cons:**
- Revoking access tokens requires a blocklist (Redis) or waiting for expiry.

### Option B: Session-Based Authentication

Server-side sessions stored in Redis. Session ID in cookie.

**Pros:**
- Instant session revocation.
- Simpler to implement.

**Cons:**
- Every request requires a Redis lookup — adds latency.
- Does not scale as cleanly without sticky sessions or shared Redis.

### Option C: Auth0 / Clerk (External Auth Service)

Delegate all authentication to an external SaaS provider.

**Pros:**
- Instant feature support: MFA, social login, enterprise SSO.
- No auth code to maintain.

**Cons:**
- External dependency — breaks self-hosting without internet.
- SaaS cost.
- User data leaving the deployment.

---

## Decision

**Recommended:** Option A (JWT + Refresh Tokens).

Stateless JWT access tokens are the right choice for a horizontally-scalable backend. Refresh token rotation in an httpOnly cookie provides security against token theft. This approach works entirely without external dependencies — critical for self-hosting.

SAML SSO is added in Phase 2 as an additional authentication module.

---

## Consequences

### Positive
- Access tokens require no server-side lookup — fast authentication check.
- Scales horizontally without sticky sessions.
- Works fully offline in self-hosted air-gapped deployments.

### Negative
- Access tokens cannot be instantly revoked (within 15 minutes, the token is valid even after logout).
- Mitigation: 15-minute TTL is short enough for most practical scenarios. A short-lived Redis blocklist can be added if instant revocation is required.

### Risks
- JWT secret compromise exposes all tokens.
- Mitigation: Rotate JWT_SECRET periodically; use RS256 for deployments that require public key verification.

---

## Related ADRs

- [ADR-009: Backend Language & Framework](ADR-009-backend-language-framework.md)
