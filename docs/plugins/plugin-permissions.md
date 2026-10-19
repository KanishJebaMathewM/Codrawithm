# Plugin Permissions

**Status:** Proposed  
**Audience:** Plugin developers, security engineers  
**Last Reviewed:** 2024-01-15

## Overview

Plugins must declare all permissions they need in their manifest. The platform enforces these permissions at runtime. Users are shown a permission summary before installing a plugin.

---

## Available Permissions

### Canvas Permissions

| Permission | What it allows | User-visible description |
|------------|----------------|--------------------------|
| `canvas:read` | Read objects, selection, pages, viewport | "Read the board's content" |
| `canvas:write` | Create, update, delete, move objects | "Add and modify content on your board" |
| `canvas:write-metadata` | Update object metadata only (no visual changes) | "Store data on board objects" |

### AI Permissions

| Permission | What it allows | User-visible description |
|------------|----------------|--------------------------|
| `ai:request` | Send prompts via the platform AI proxy | "Use AI features (routed through Codrawithm)" |

### Storage Permissions

| Permission | What it allows | User-visible description |
|------------|----------------|--------------------------|
| `storage:plugin` | Read/write plugin-scoped key-value store | "Store plugin settings and data" |
| `storage:board` | Read/write board-scoped key-value store | "Store data attached to this board" |

### User Permissions

| Permission | What it allows | User-visible description |
|------------|----------------|--------------------------|
| `user:read` | Read current user's ID, name, and role | "Know who is using the plugin" |
| `user:email` | Read current user's email address | "Read your email address" |

### Network Permissions (Restricted)

| Permission | What it allows | User-visible description |
|------------|----------------|--------------------------|
| `network:fetch` | Make HTTP requests to a declared allowlist of URLs | "Connect to specific external services" |

> `network:fetch` requires an explicit `allowedOrigins` list in the manifest and review before listing in the plugin registry. Plugins using this permission are subject to additional security review.

---

## What Plugins Can NEVER Do

Regardless of permissions, plugins are permanently restricted from:

- Accessing other users' data or boards they don't have permission for
- Reading or exporting the user's authentication tokens or credentials
- Accessing AI provider API keys (always proxied by the backend)
- Making arbitrary network requests (must declare allowlist with `network:fetch`)
- Accessing the host page's DOM outside the plugin iframe
- Reading browser cookies, localStorage, or sessionStorage of the host
- Executing code outside the sandboxed iframe
- Accessing the camera, microphone, geolocation, or clipboard without explicit user interaction
- Persisting data beyond the declared storage quota (5MB default per plugin per user)

---

## Permission Request Flow

### Installation

When a user installs a plugin, they see a permission summary:

```
Installing "Text to Flowchart" by Example Developer

This plugin needs permission to:
  ✦ Read the board's content
  ✦ Add and modify content on your board
  ✦ Use AI features (routed through Codrawithm)
  ✦ Store plugin settings and data

[Cancel]  [Install Plugin]
```

### Runtime Permission Prompts

For sensitive operations, the platform may prompt for additional confirmation even after installation:

- First use of `ai:request` — "This plugin wants to send content to an AI provider. Continue?"
- First use of `network:fetch` — "This plugin wants to connect to [domain]. Allow?"

These prompts can be permanently allowed per plugin.

---

## Dangerous Permission Combinations

The platform warns users about combinations that could expose sensitive information:

| Combination | Risk | Warning |
|-------------|------|---------|
| `canvas:read` + `network:fetch` | Board content could be sent to external server | "This plugin can read your board and send data externally" |
| `user:email` + `network:fetch` | Email could be sent to external server | "This plugin can read your email and send data externally" |
| `ai:request` + `canvas:read` | Board content will be sent to AI provider | "AI features may send board content to an AI provider" |

---

## Quota Limits

| Resource | Default Limit | Adjustable |
|----------|--------------|------------|
| Plugin storage | 5 MB per plugin per user | No (MVP) |
| AI requests | Shared with user's AI quota | Yes (user setting) |
| Canvas API calls/minute | 300 | No |
| Network requests/minute | 60 | No |

---

## Related Documents

- [Plugin Manifest](./plugin-manifest.md)
- [Plugin API](./plugin-api.md)
- [Plugin Security](./plugin-security.md)
- [Plugin Lifecycle](./plugin-lifecycle.md)
