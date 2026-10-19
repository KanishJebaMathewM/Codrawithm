# Security

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

This document describes the security model, threat vectors, and mitigations for Codrawithm.

---

## Threat Model

| Threat | Impact | Mitigation |
|--------|--------|-----------|
| XSS via user-generated canvas content | High | Content sanitization; CSP |
| AI provider API key exposure | High | Backend-proxy pattern; keys never in browser |
| Plugin running malicious code | High | iframe sandbox; postMessage origin validation |
| CSRF on state-changing API requests | Medium | SameSite=Strict cookie; CORS policy |
| Unauthorized board access | High | JWT authentication; RBAC permission checks |
| File upload with malicious content | High | MIME type validation; virus scan (future) |
| JWT token theft | High | httpOnly cookie for refresh token; short access token TTL |
| SQL injection | High | Parameterized queries via sqlx; no raw string interpolation |
| Denial of Service (AI endpoint abuse) | Medium | Per-user rate limiting |

---

## XSS Prevention

### Canvas Content

User-generated text rendered on the canvas is never injected as raw HTML. Text is rendered to the Canvas 2D API as a string — no HTML parsing occurs:

```typescript
// Safe: Canvas 2D text rendering
ctx.fillText(object.label, x, y);

// Dangerous (not done): innerHTML injection
element.innerHTML = object.label; // NEVER do this
```

### Code Block Content

Code blocks display syntax-highlighted code. The syntax highlighter (Shiki) renders to sanitized HTML. The output is rendered inside a controlled `<pre>` element — no `dangerouslySetInnerHTML` is used without sanitization.

### Comment Text

Comment text is Markdown. Markdown is rendered via a library that sanitizes HTML (no raw HTML allowed in Markdown input).

### Content Security Policy (CSP)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.codrawithm.app;
  connect-src 'self' wss://*.codrawithm.app;
  frame-src 'none';   /* Overridden per plugin origin */
  object-src 'none';
  base-uri 'self';
```

Plugins require a per-plugin CSP `frame-src` exception for their origin URL.

---

## CSRF Prevention

- All API requests use `Content-Type: application/json` — browser forms cannot send JSON CSRF requests.
- The refresh token cookie uses `SameSite=Strict` — it is not sent on cross-origin requests.
- CORS is configured to allow only the Codrawithm frontend origin.

---

## File Upload Validation

Before issuing a pre-signed upload URL, the backend validates:

1. **MIME type**: Only `image/png`, `image/jpeg`, `image/gif`, `image/webp`, `image/svg+xml` are allowed.
2. **File size**: Maximum 20 MB.
3. **Filename**: Sanitized to alphanumeric + `-.` characters.

After upload, the backend verifies the uploaded object:
1. Fetches object metadata from S3 (size, content-type).
2. Verifies content-type matches the declared MIME type (prevents content-type spoofing).
3. SVG files are further sanitized to remove `<script>` tags and event handlers.

---

## Plugin Security

See [Plugin Security](../plugins/plugin-security.md) for the full plugin security model.

Summary:
- Plugins run in cross-origin iframes with `sandbox="allow-scripts allow-forms"`.
- The host validates `postMessage` origins.
- Plugin network requests are restricted to declared domains via CSP.
- Plugins cannot access user authentication tokens or the host page DOM.

---

## Authentication Security

See [Authentication & Authorization](../architecture/authentication-and-authorization.md).

Key points:
- Access tokens: short-lived (15 min), stored in memory (not localStorage).
- Refresh tokens: long-lived (30 days), stored in httpOnly SameSite=Strict cookie.
- Passwords hashed with argon2id (OWASP recommended).
- Refresh token rotation detects replay attacks.

---

## SQL Injection Prevention

All database queries use parameterized queries via sqlx:

```rust
// Safe: parameterized query
sqlx::query_as!(Board, "SELECT * FROM boards WHERE id = $1", board_id)
    .fetch_one(&pool)
    .await?;

// Never: string interpolation in queries
let query = format!("SELECT * FROM boards WHERE id = '{}'", board_id); // NEVER
```

sqlx's compile-time query checking (`query!` macro) verifies query syntax and types at compile time.

---

## Secrets Management

| Secret | Storage | Notes |
|--------|---------|-------|
| JWT_SECRET | Environment variable | Minimum 32 characters; rotate periodically |
| DB_PASSWORD | Environment variable / Docker secret | |
| AI provider API keys | Environment variable | Backend only; never sent to browser |
| MinIO credentials | Environment variable | |
| OAuth client secrets | Environment variable | |

In production, Docker secrets or a secrets manager (Vault, AWS Secrets Manager) is recommended over plain environment variables.

---

## Security Headers

The following HTTP security headers are set by Caddy:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Dependency Security

- Frontend dependencies are pinned with exact versions in `package.json`.
- `pnpm audit` runs in CI. PRs with high/critical vulnerabilities are blocked.
- Backend dependencies are pinned in `Cargo.lock`.
- `cargo audit` runs in CI.
- See [Dependency Management](dependency-management.md).

---

## Reporting Vulnerabilities

See [SECURITY.md](../../SECURITY.md) in the repository root for the vulnerability disclosure policy.

---

## Related Documents

- [Authentication & Authorization](../architecture/authentication-and-authorization.md)
- [Plugin Security](../plugins/plugin-security.md)
- [Dependency Management](dependency-management.md)
- [Observability](observability.md)
