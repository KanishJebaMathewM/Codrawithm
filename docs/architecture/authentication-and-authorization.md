# Authentication and Authorization

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm uses JWT-based authentication with refresh token rotation. Authorization is role-based (RBAC) at the board level.

See [ADR-013](architecture-decisions/ADR-013-authentication-approach.md).

---

## Authentication Flows

### Email / Password

```
1. User submits email + password to POST /auth/login
2. Backend looks up user by email
3. Backend verifies password with argon2id
4. Backend issues: access token (15 min TTL) + refresh token (30 day TTL)
5. Frontend stores access token in memory (not localStorage)
6. Frontend stores refresh token in httpOnly cookie
```

### OAuth 2.0 (GitHub / Google)

```
1. User clicks "Login with GitHub"
2. Frontend redirects to: GET /auth/github (backend redirects to GitHub OAuth)
3. User authorizes on GitHub
4. GitHub redirects to: GET /auth/callback/github?code=...
5. Backend exchanges code for access token
6. Backend creates or looks up user by OAuth identity
7. Backend issues Codrawithm tokens (same as email/password flow)
8. Backend redirects to frontend with tokens
```

### Guest Access

Guest users (no account) can view and comment on boards via share links. The backend issues a **guest token** — a short-lived JWT with:
- No `userId` field (or a guest-type claim).
- `boardId` and `role` claims.
- 24-hour TTL.

Guest tokens cannot be refreshed.

---

## JWT Token Structure

**Access token claims:**
```json
{
  "sub": "user-uuid",
  "email": "alex@example.com",
  "tier": "free",
  "type": "access",
  "iat": 1705315200,
  "exp": 1705316100
}
```

**Refresh token claims:**
```json
{
  "sub": "user-uuid",
  "jti": "refresh-token-id",
  "type": "refresh",
  "iat": 1705315200,
  "exp": 1707907200
}
```

Tokens are signed with HS256 (HMAC-SHA256) using `JWT_SECRET` from the environment. RS256 (asymmetric) is available for installations that require it (set `JWT_ALGORITHM=RS256`).

---

## Refresh Token Rotation

On every token refresh:
1. The old refresh token is invalidated (added to a Redis blocklist or deleted from DB).
2. A new refresh token is issued.
3. The new access token is returned.

If a refresh token is reused (replay attack), both the old and the new token are invalidated and the user is logged out.

**Refresh tokens are stored:**
- Optionally in PostgreSQL for revocation support.
- In a Redis set for fast blocklist lookup during token rotation.

---

## Token Storage (Frontend)

| Token | Storage | Rationale |
|-------|---------|-----------|
| Access token | In-memory (React state / Zustand) | Never persisted to disk; cleared on tab close |
| Refresh token | httpOnly cookie (SameSite=Strict) | Not accessible via JS; protected from XSS |

The access token is refreshed automatically 1 minute before expiry (background timer in the frontend).

---

## Authorization Model

Authorization is **role-based** at the board level.

### Roles

| Role | Read | Comment | Edit | Admin |
|------|------|---------|------|-------|
| Owner | ✓ | ✓ | ✓ | ✓ |
| Editor | ✓ | ✓ | ✓ | - |
| Commenter | ✓ | ✓ | - | - |
| Viewer | ✓ | - | - | - |

Admin permissions: rename board, delete board, manage members, change workspace type.

### Permission Check Pattern

```rust
pub fn check_board_permission(
    user_id: Uuid,
    board: &Board,
    members: &[BoardMember],
    required: Permission,
) -> Result<(), AppError> {
    // Owner always has full access
    if board.owner_id == user_id {
        return Ok(());
    }

    // Check member role
    let member = members.iter().find(|m| m.user_id == Some(user_id))
        .ok_or(AppError::Forbidden)?;

    let allowed = match required {
        Permission::Read    => true,   // All roles can read
        Permission::Comment => matches!(member.role, Role::Editor | Role::Commenter),
        Permission::Edit    => matches!(member.role, Role::Editor),
        Permission::Admin   => false,  // Only owner (handled above)
    };

    if allowed { Ok(()) } else { Err(AppError::Forbidden) }
}
```

---

## SAML SSO (Phase 2)

SAML 2.0 SSO is planned for enterprise self-hosted deployments. When configured:
- Users are authenticated via the configured SAML IdP (Okta, Azure AD, etc.).
- The backend acts as the SAML Service Provider.
- User provisioning is Just-In-Time (account created on first SAML login).
- User roles can be mapped from SAML group attributes.

Configuration: `SAML_IDP_METADATA_URL`, `SAML_SP_ENTITY_ID`, `SAML_SP_CERT`.

---

## Password Policy

| Rule | Value |
|------|-------|
| Minimum length | 12 characters |
| Maximum length | 128 characters |
| Complexity | No enforced complexity rules (entropy is preferred) |
| Common password check | Checked against a common-passwords list |
| Hashing | argon2id, memory: 64 MB, iterations: 3, parallelism: 4 |

---

## Related Documents

- [API Design — Authentication Endpoints](api-design.md#authentication-endpoints)
- [Security](../engineering/security.md)
- [ADR-013: Authentication Approach](architecture-decisions/ADR-013-authentication-approach.md)
