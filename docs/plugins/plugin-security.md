# Plugin Security

**Status:** Proposed  
**Audience:** Security engineers, platform engineers, plugin developers  
**Last Reviewed:** 2024-01-15

## Overview

Plugins run third-party code inside Codrawithm. This document defines the security model that prevents malicious or buggy plugins from harming users, stealing data, or compromising the platform.

---

## Threat Model

| Threat | Attack Vector | Mitigation |
|--------|--------------|------------|
| Data exfiltration | Plugin reads board content, sends to attacker | `network:fetch` requires declared allowlist + review |
| Credential theft | Plugin accesses auth tokens or API keys | Plugins run in sandboxed iframe with no host DOM access |
| XSS via plugin | Plugin injects malicious HTML into host | Strict iframe sandbox, no `allow-same-origin` |
| Malicious canvas writes | Plugin creates harmful objects | Canvas API validates all inputs server-side |
| Quota abuse | Plugin makes excessive AI requests | Per-user rate limits enforced server-side |
| Supply chain attack | Plugin dependency is compromised | Plugins are bundled; no CDN imports allowed |
| Persistent malware | Plugin survives uninstall | Storage cleared on uninstall; no filesystem access |

---

## Iframe Sandboxing

Plugin UIs run in an `<iframe>` with strict sandboxing:

```html
<iframe
  src="blob:..."
  sandbox="allow-scripts allow-forms allow-popups"
  allow=""
  referrerpolicy="no-referrer"
  csp="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'"
>
```

**What `sandbox` prevents:**
- `allow-same-origin` is NOT set → plugin cannot access host page's DOM, cookies, localStorage, sessionStorage
- `allow-top-navigation` is NOT set → plugin cannot redirect the parent page
- `allow-downloads` is NOT set → plugin cannot trigger file downloads without explicit user action

**What is allowed:**
- `allow-scripts` → plugin JavaScript runs
- `allow-forms` → plugin can submit forms within its own iframe
- `allow-popups` → plugin can open documentation links in new tabs

---

## Content Security Policy

The plugin iframe's CSP prevents unauthorized network requests:

```
default-src 'none';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'none';
```

`connect-src 'none'` means the plugin **cannot make any direct network requests**. All external communication must go through the postMessage API bridge, which enforces:
1. Authentication (user must be logged in)
2. Permission checks (plugin must have declared the permission)
3. Rate limiting
4. Allowlist validation (for `network:fetch`)

---

## postMessage Protocol Security

All messages between the plugin iframe and the host are validated:

```typescript
// Host-side message handler
window.addEventListener('message', (event) => {
  // 1. Verify origin matches the expected plugin blob URL
  if (!isAllowedPluginOrigin(event.origin, pluginId)) return

  // 2. Validate message structure
  const message = parsePluginMessage(event.data)
  if (!message) return

  // 3. Check the plugin has the permission required for this API call
  if (!pluginHasPermission(pluginId, requiredPermissionFor(message.type))) {
    replyWithError(event.source, 'PERMISSION_DENIED')
    return
  }

  // 4. Dispatch to the appropriate handler
  handlePluginMessage(pluginId, message, event.source)
})
```

---

## Plugin Registry Review

Before a plugin is listed in the official registry:

1. **Automated checks:** Manifest validation, known vulnerability scan of bundled dependencies, CSP verification
2. **Manual review:** Code review for obvious malicious patterns (obfuscation, eval, suspicious network patterns)
3. **Permission justification:** Developer must explain why each permission is needed
4. **Privacy policy:** Required for plugins that handle user data or use `network:fetch`

> Note: The plugin registry and review process are planned features. In early phases, plugins will be developer-only (manual install only) until the review infrastructure is in place.

---

## No Direct AI Key Access

AI provider API keys are never sent to the browser or plugin. The flow:

```
Plugin → postMessage → Host Bridge → Backend API (authenticated) → AI Provider
                                          ↑
                                    API key lives here only
                                    (environment variable, never in DB)
```

Even if a plugin is compromised, it cannot extract API credentials.

---

## Storage Isolation

Each plugin's storage is isolated:

```
storage:plugin scope:  user_id + plugin_id + key
storage:board scope:   user_id + plugin_id + board_id + key
```

A plugin cannot read another plugin's storage, and cannot read the platform's own storage.

---

## Input Validation

All canvas API inputs are validated before being applied:

| Field | Validation |
|-------|-----------|
| Object coordinates | Numbers within canvas bounds (-10M to 10M) |
| Object dimensions | Positive numbers, max 100,000px |
| Label text | Max 10,000 characters, HTML-escaped |
| Style properties | CSS color validation, numeric range checks |
| Object count per batch | Max 500 per `createObjects` call |
| Metadata | Max 10KB, JSON-serializable only |

---

## Reporting Vulnerabilities

Security issues in the plugin system should be reported via the [security policy](../../SECURITY.md). Do not disclose plugin security vulnerabilities publicly before they are patched.

---

## Related Documents

- [Plugin Manifest](./plugin-manifest.md)
- [Plugin Permissions](./plugin-permissions.md)
- [Plugin API](./plugin-api.md)
- [Plugin Lifecycle](./plugin-lifecycle.md)
- [Security Engineering](../engineering/security.md)
- [SECURITY.md](../../SECURITY.md)
