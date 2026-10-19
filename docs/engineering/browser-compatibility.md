# Browser Compatibility

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm targets modern browsers that support the required Web APIs. Older browsers and Internet Explorer are not supported.

---

## Target Browsers

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome / Chromium | Latest 2 major versions | Primary development browser |
| Firefox | Latest 2 major versions | |
| Safari | Latest 2 major versions (macOS + iOS) | |
| Edge (Chromium) | Latest 2 major versions | |
| Chrome for Android | Latest 2 major versions | Mobile canvas (touch) |
| Safari (iOS) | iOS 15+ | Mobile canvas (touch) |

**Not supported:** Internet Explorer, Opera Mini, UC Browser.

---

## Required Web APIs

| API | Minimum Support | Usage | Fallback |
|-----|----------------|-------|---------|
| Canvas 2D API | All target browsers | Primary canvas rendering | None (required) |
| WebSocket | All target browsers | Real-time collaboration | None (required) |
| IndexedDB | All target browsers | Yjs offline persistence | None (required) |
| PointerEvents | All target browsers | Stylus pressure sensitivity, touch | Mouse events fallback |
| ResizeObserver | All target browsers | Canvas resize | Polling fallback |
| IntersectionObserver | All target browsers | Image lazy loading | Immediate load fallback |
| CSS Custom Properties | All target browsers | Design tokens | None (required) |
| Web Workers | All target browsers | Algorithm computation | Main thread computation |
| `requestAnimationFrame` | All target browsers | Canvas render loop | `setTimeout` fallback |
| Clipboard API | Modern browsers | Copy as image | Fallback to link copy |
| File API + drag-drop | All target browsers | Image file upload | File picker only |

### WebGL Requirements (3D Workspace)

| Feature | Support | Notes |
|---------|---------|-------|
| WebGL 2 | Chrome 56+, Firefox 51+, Safari 15+ | Required for 3D workspace |
| OffscreenCanvas | Chrome 69+, Firefox 105+, Safari 16.4+ | Used for Web Worker rendering |

**Graceful degradation for WebGL:** If WebGL 2 is not available, the 3D workspace shows an "Unsupported" message with a list of supported browsers. The 2D canvas is not affected.

---

## Feature Detection

Features are detected at runtime, not user-agent sniffed:

```typescript
const isWebGL2Available = (() => {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
})();

const isClipboardWriteAvailable = 'clipboard' in navigator &&
  'writeText' in navigator.clipboard;
```

---

## Transpilation and Polyfills

**Vite build target:** `es2020` (Chrome 80+, Firefox 74+, Safari 13.1+).

Polyfills are loaded only if the feature is not natively available (via feature detection). No blanket polyfill bundle.

---

## Mobile Considerations

The canvas supports touch on iOS Safari and Android Chrome:

| Gesture | Behavior |
|---------|---------|
| Single finger drag | Draw (when a drawing tool is active) / pan (when Hand tool is active) |
| Two-finger drag | Pan canvas |
| Pinch | Zoom canvas |
| Single tap | Select object |
| Long press | Open context menu |

**Touch-specific limitations:**
- Stylus tools (pressure sensitivity) require an Apple Pencil or Android Stylus with `PointerEvent.pressure > 0`.
- Drag handles for resize/rotate are larger on touch (44 × 44 px minimum).
- The right-click context menu is triggered by long press.
- The keyboard shortcuts are unavailable on touch-only devices — all common actions are accessible via the UI.

---

## Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

`user-scalable=no` prevents browser pinch-to-zoom from conflicting with canvas zoom.

---

## Testing

Browser compatibility testing uses Playwright with the following browser targets in CI:

```typescript
// playwright.config.ts
export default {
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'safari',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
};
```

---

## Related Documents

- [Testing Strategy](testing-strategy.md)
- [Performance Engineering](performance-engineering.md)
- [Accessibility](../product/accessibility.md)
