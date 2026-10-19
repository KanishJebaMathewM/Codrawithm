# ADR-011: AI Provider Integration

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

Codrawithm wants to offer AI-assisted diagram generation. The system must support multiple providers (OpenAI, Anthropic, local LLMs via Ollama) and must not expose API keys to the browser.

---

## Requirements

- API keys must never be accessible to the browser or to plugins.
- Must support swapping AI providers without frontend changes.
- Must support self-hosted AI (Ollama) for air-gapped deployments.
- Must rate-limit AI requests per user.

---

## Alternatives Considered

### Option A: Backend Proxy (All AI via Backend)

All AI requests go through the Codrawithm backend. The frontend sends a prompt; the backend adds credentials and forwards to the provider.

**Pros:**
- API keys stored only in backend environment variables — never in browser.
- Rate limiting enforced server-side.
- Provider switching is transparent to frontend.
- Audit logging is comprehensive.

**Cons:**
- Adds latency (one extra hop: browser → backend → AI provider).
- Backend must handle streaming responses if used.

### Option B: Frontend Direct (Keys in Browser)

Frontend makes API calls directly to OpenAI/Anthropic with keys stored in environment variables.

**Pros:**
- Simpler architecture.
- Lower latency.

**Cons:**
- API keys exposed in browser network requests, DevTools, and source maps.
- XSS attack can steal API keys.
- Rate limiting cannot be enforced.
- **Rejected categorically** — this is a security requirement, not a trade-off.

### Option C: Plugin-Side AI (Plugin Manages Its Own Keys)

Plugins manage their own AI provider connections.

**Pros:**
- Decentralized.

**Cons:**
- Plugin iframe cannot securely store API keys — still exposed to the plugin's origin.
- No central audit log.
- Rate limiting per-user impossible.

---

## Decision

**Recommended:** Option A (Backend Proxy).

Option B is rejected on security grounds. Option A is the only approach that keeps API keys out of the browser. The latency overhead (one extra hop) is acceptable — AI generation is not a low-latency operation.

---

## Consequences

### Positive
- API keys are fully protected from browser exposure.
- Rate limiting and audit logging are comprehensive.
- Provider switching requires only a backend environment variable change.

### Negative
- All AI requests must go through the backend, even for self-hosted instances.
- Backend must be configured with AI provider credentials before AI features work.

### Risks
- If the backend is compromised, AI provider keys are exposed.
- Mitigation: Store keys in secure secrets management (Docker secrets, Vault); rotate keys regularly.

---

## Related ADRs

- [ADR-012: Plugin Sandboxing](ADR-012-plugin-sandboxing.md)
- [ADR-002: Modular Monolith](ADR-002-modular-monolith.md)
