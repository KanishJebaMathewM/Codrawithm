# ADR-012: Plugin Sandboxing

**Status:** Proposed  
**Date:** 2024-01-15  
**Deciders:** Community (awaiting maintainer review)

---

## Context

The plugin system allows third-party code to run in the context of a user's Codrawithm session. This code must not be able to steal user data, access authentication tokens, or manipulate the host page DOM.

---

## Requirements

- Plugins must not have access to user authentication tokens or cookies.
- Plugins must not have access to the host page DOM.
- Plugins must only make network requests to explicitly declared domains.
- The security model must be enforceable by the browser without custom runtime.

---

## Alternatives Considered

### Option A: iframe with `sandbox` Attribute + postMessage

Plugins load in cross-origin iframes with `sandbox="allow-scripts allow-forms"`. Communication via `window.postMessage`. The host validates message origins.

**Pros:**
- Cross-origin by default — iframe cannot access parent DOM or cookies.
- `sandbox` attribute prevents dangerous features (top navigation, same-origin).
- Browser-enforced — no custom runtime needed.
- Well-understood model (used by Figma, Notion, Miro for plugins).

**Cons:**
- Plugin UI is limited to the iframe's dimensions.
- Richer plugin interactions require a more complex postMessage API.

### Option B: Web Workers

Plugins run in a Web Worker (no DOM access).

**Pros:**
- Fully isolated from the DOM.
- Good for compute-heavy plugins.

**Cons:**
- Web Workers cannot render UI.
- Most useful plugins need to display a panel — Workers cannot do this.
- Limited to non-UI plugins only.

### Option C: Realm / ShadowRealm

Use the JavaScript ShadowRealm API for code isolation.

**Pros:**
- Isolates JS execution environment.

**Cons:**
- ShadowRealm is not yet widely available across all target browsers.
- Does not prevent network requests.
- Does not isolate DOM access.

---

## Decision

**Recommended:** Option A (iframe + sandbox + postMessage).

This is the standard approach used by all major plugin systems in the browser (Figma, Miro, Notion, Google Workspace Add-ons). It provides strong isolation enforced by the browser, supports plugin UI, and is well-understood by plugin developers.

---

## Consequences

### Positive
- Browser-enforced isolation — no runtime security dependency.
- Plugins can render full UI inside the iframe.
- Origin validation in postMessage prevents spoofed messages.

### Negative
- All plugin-canvas communication is asynchronous (postMessage round-trips).
- Complex real-time plugin interactions (e.g., cursor-tracking) require careful API design.

### Risks
- If the host's postMessage handler has a vulnerability, a malicious plugin could exploit it.
- Mitigation: Strict origin validation; whitelist allowed message types; validate all payloads.

---

## Related ADRs

- [ADR-011: AI Provider Integration](ADR-011-ai-provider-integration.md)
