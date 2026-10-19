# API Design

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

The Codrawithm REST API follows standard conventions for a modern JSON API. All endpoints are under `/api/v1/`. The API is documented with OpenAPI 3.1 (generated via `utoipa`).

---

## Conventions

### Base URL

```
https://{host}/api/v1/
```

### Request Format

- All request bodies are `application/json`.
- All timestamps are ISO 8601 in UTC: `"2024-01-15T10:30:00Z"`.
- IDs are UUIDs (lowercase hyphenated): `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`.
- Booleans are JSON booleans (`true` / `false`), not strings.

### Response Format

All responses are `application/json`.

**Success response:**
```json
{
  "data": { ... },
  "meta": { "requestId": "req_abc123", "timestamp": "2024-01-15T10:30:00Z" }
}
```

**List response:**
```json
{
  "data": [ ... ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

**Error response:**
```json
{
  "error": {
    "code": "BOARD_NOT_FOUND",
    "message": "Board with ID a1b2c3d4 was not found.",
    "details": null
  }
}
```

---

## Authentication

All protected endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens are issued by `POST /auth/login` or `POST /auth/refresh`. Token lifetime: 15 minutes. Refresh token lifetime: 30 days.

---

## Authentication Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | Email + password login. Returns access + refresh token. |
| `POST` | `/auth/signup` | Create a new account. |
| `POST` | `/auth/refresh` | Exchange a refresh token for a new access token. |
| `POST` | `/auth/logout` | Revoke the refresh token. |
| `GET` | `/auth/callback/github` | OAuth 2.0 callback for GitHub. |
| `GET` | `/auth/callback/google` | OAuth 2.0 callback for Google. |

**Login request:**
```json
POST /auth/login
{ "email": "alex@example.com", "password": "correct-horse-battery-staple" }
```

**Login response:**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "rt_...",
    "expiresIn": 900,
    "user": { "id": "...", "email": "alex@example.com", "displayName": "Alex" }
  }
}
```

---

## User Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users/me` | Get the current user's profile. |
| `PATCH` | `/users/me` | Update display name, avatar, preferences. |
| `DELETE` | `/users/me` | Delete the account (soft delete, 30-day grace period). |

---

## Board Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/boards` | List boards (owned + shared). Paginated. |
| `POST` | `/boards` | Create a new board. |
| `GET` | `/boards/:id` | Get board metadata + initial CRDT state (for non-WS load). |
| `PATCH` | `/boards/:id` | Update board title, settings, workspace type. |
| `DELETE` | `/boards/:id` | Delete a board (soft delete). |
| `GET` | `/boards/:id/members` | List board members and roles. |
| `POST` | `/boards/:id/members` | Add a member (invite by email or set role). |
| `PATCH` | `/boards/:id/members/:userId` | Update a member's role. |
| `DELETE` | `/boards/:id/members/:userId` | Remove a member. |
| `GET` | `/boards/:id/snapshots` | List version history snapshots. |
| `POST` | `/boards/:id/snapshots` | Create a named snapshot. |
| `POST` | `/boards/:id/snapshots/:snapshotId/restore` | Restore to a snapshot. |
| `POST` | `/boards/:id/duplicate` | Duplicate a board. |
| `GET` | `/boards/share/:shareToken` | Load board via share token (no auth required for view). |

**Create board:**
```json
POST /boards
{
  "title": "My Architecture Diagram",
  "workspaceType": "system-architecture",
  "isPublic": false
}
```

---

## Asset Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/boards/:id/assets/upload-url` | Get a pre-signed S3 upload URL. |
| `POST` | `/boards/:id/assets/confirm` | Confirm upload completed; register asset. |
| `GET` | `/boards/:id/assets` | List assets for a board. |
| `DELETE` | `/boards/:id/assets/:assetId` | Delete an asset. |

**Upload flow:**
1. `POST /boards/:id/assets/upload-url` → receives `{ uploadUrl, assetId, fields }`.
2. Browser PUTs file to `uploadUrl` with `fields` as form data.
3. `POST /boards/:id/assets/confirm` → asset is registered.

---

## Plugin Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/plugins` | List all installed plugins. |
| `GET` | `/plugins/:id` | Get plugin manifest. |
| `POST` | `/plugins` | Install a plugin (admin only). |
| `DELETE` | `/plugins/:id` | Uninstall a plugin (admin only). |

---

## AI Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/ai/generate` | Generate canvas objects from a prompt. |

**Request:**
```json
POST /ai/generate
{
  "prompt": "A 3-tier web app with React frontend, Node API, PostgreSQL",
  "mode": "generate",
  "outputFormat": "diagram",
  "boardId": "optional-for-context"
}
```

---

## Health Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness probe. Returns 200 if the process is alive. |
| `GET` | `/ready` | Readiness probe. Returns 200 if DB and Redis are connected. |

---

## Pagination

List endpoints use cursor-based pagination:

```
GET /boards?cursor=eyJpZCI6IjEyMyJ9&limit=20
```

Response includes a `nextCursor` field:
```json
{
  "data": [...],
  "meta": { "nextCursor": "eyJpZCI6IjE0MyJ9", "hasMore": true }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions |
| `BOARD_NOT_FOUND` | 404 | Board does not exist or is deleted |
| `USER_NOT_FOUND` | 404 | User does not exist |
| `VALIDATION_ERROR` | 422 | Request body fails validation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many AI requests |
| `CONFLICT` | 409 | Resource already exists (e.g., duplicate email) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Related Documents

- [Backend Architecture](backend-architecture.md)
- [Authentication & Authorization](authentication-and-authorization.md)
- [Database Design](database-design.md)
