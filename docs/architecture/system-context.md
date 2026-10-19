# System Context (C4 Level 1)

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

The C4 Level 1 diagram shows Codrawithm in the context of its users and external systems. It does not show internal structure.

---

## System Context Diagram

```mermaid
C4Context
    title System Context — Codrawithm

    Person(developer, "Developer / Architect", "Uses Codrawithm to create system architecture diagrams, flowcharts, and code diagrams")
    Person(learner, "DSA Learner / Student", "Uses algorithm visualization workspace to understand data structures and algorithms")
    Person(educator, "Educator", "Delivers live visual lectures with follow-presenter mode")
    Person(designer, "Designer", "Participates in cross-functional workshops with developers")
    Person(guest, "Guest / Viewer", "Views and comments on shared boards without an account")

    System(codrawithm, "Codrawithm", "Open-source collaborative visual workspace. Provides: infinite canvas, real-time co-editing, algorithm visualization, UML/flowchart/ER tools, 3D sketching, AI-assisted generation, plugin system.")

    System_Ext(github_oauth, "GitHub OAuth", "Social login provider (OAuth 2.0)")
    System_Ext(google_oauth, "Google OAuth", "Social login provider (OAuth 2.0 / OIDC)")
    System_Ext(object_storage, "Object Storage", "S3-compatible storage for uploaded images and board assets. MinIO (self-hosted) or AWS S3 (cloud).")
    System_Ext(ai_backend, "AI Provider", "Large language model API. OpenAI GPT-4, Anthropic Claude, or Ollama (local). Accessed via backend proxy only.")
    System_Ext(smtp, "Email / SMTP", "Sends invitation emails, notification emails, and password reset emails. Optional for self-hosted.")
    System_Ext(cdn, "CDN", "Optional. Delivers frontend static assets (JS, CSS, images) from an edge network. Not required for self-hosted.")

    Rel(developer, codrawithm, "Creates and shares diagrams", "HTTPS browser / WebSocket")
    Rel(learner, codrawithm, "Creates algorithm visualizations, annotates, shares", "HTTPS browser")
    Rel(educator, codrawithm, "Delivers lectures; uses follow-presenter mode", "HTTPS browser / WebSocket")
    Rel(designer, codrawithm, "Participates in collaborative workshops", "HTTPS browser / WebSocket")
    Rel(guest, codrawithm, "Views shared board via link", "HTTPS browser")

    Rel(codrawithm, github_oauth, "Authenticates users", "HTTPS, OAuth 2.0")
    Rel(codrawithm, google_oauth, "Authenticates users", "HTTPS, OAuth 2.0 / OIDC")
    Rel(codrawithm, object_storage, "Reads and writes uploaded assets", "HTTPS, S3 API")
    Rel(codrawithm, ai_backend, "Proxies AI generation requests (backend only)", "HTTPS, REST API")
    Rel(codrawithm, smtp, "Sends emails", "SMTP or HTTPS API")
    Rel(codrawithm, cdn, "Frontend assets served via CDN", "HTTPS")
```

---

## Key Boundary: Browser vs. Backend

A critical security boundary in the system context is that **AI provider communication only occurs from the backend, never from the browser**. This prevents API keys from being exposed in browser developer tools or network requests.

```
Browser (User) ──────────────► Codrawithm Backend ──────────────► AI Provider API
                (WebSocket/REST)                    (HTTPS, backend only)
```

---

## External Dependencies and Self-Hosting Alternatives

| External System | Cloud Option | Self-Hosted Alternative | Required? |
|----------------|-------------|------------------------|-----------|
| Object Storage | AWS S3, GCP GCS, Azure Blob | MinIO | Yes (for image uploads) |
| OAuth Provider | GitHub, Google | None — email/password auth is always available | No (email auth works without OAuth) |
| AI Provider | OpenAI, Anthropic | Ollama (local LLM) | No (AI features are optional plugins) |
| Email | SendGrid, AWS SES, Postmark | Any SMTP server (Gmail, local Postfix) | No (invites and notifications disabled if not configured) |
| CDN | CloudFront, Cloudflare | None — backend serves static assets directly | No |

**Full offline operation:** For air-gapped environments, Codrawithm can operate with MinIO for object storage, no OAuth (email/password only), Ollama for AI, and a local SMTP server. No internet connectivity is required.

---

## User Count Assumptions

| User Type | Expected Concurrent | Notes |
|-----------|--------------------|-|
| Registered users (total) | 0 (Phase 1) | Pre-development |
| Concurrent board editors (per board) | 50 (target) | See NFR-010 |
| Concurrent boards | 100 (Phase 1) | Scales with backend instances |
| Guest viewers per board | 500 (Phase 2) | Follow-presenter mode: read-only WebSocket fan-out |

---

## Related Documents

- [Architecture Overview](overview.md)
- [Application Architecture (C4 Level 2)](application-architecture.md)
- [Deployment Architecture](deployment-architecture.md)
