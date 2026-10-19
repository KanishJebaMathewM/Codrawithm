# Accessibility

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm is committed to making the application accessible. The target standard is **WCAG 2.1 Level AA** for all application UI outside the canvas. The canvas itself presents unique challenges that require creative approaches rather than a direct WCAG mapping.

> **Note:** Full WCAG compliance requires manual testing with assistive technologies and expert accessibility review. The requirements in this document are design goals, not verified compliance claims.

---

## Scope

### In Scope for WCAG 2.1 AA

- Navigation bars, menus, toolbars.
- Dialog boxes, modal windows.
- Property panels and settings forms.
- Authentication flows (login, signup).
- Share dialog.
- Notification toasts and banners.
- Onboarding screens.

### Canvas Accessibility (Best Effort)

The infinite canvas is an inherently visual interface. Achieving full WCAG compliance for all canvas interactions is not feasible in the near term. Instead, Codrawithm adopts a "best effort" approach for the canvas:

- Keyboard navigation for the canvas tool palette.
- Keyboard-accessible alternatives for all canvas operations (create, move, delete, connect shapes).
- Screen reader announcements for key state changes.
- High-contrast mode support.

---

## Color and Contrast

| Requirement | Target | WCAG Criterion |
|-------------|--------|----------------|
| Normal text contrast | ≥ 4.5:1 | 1.4.3 Contrast (Minimum) |
| Large text contrast (18pt+ or 14pt bold) | ≥ 3:1 | 1.4.3 |
| UI components and focus indicators | ≥ 3:1 | 1.4.11 Non-text Contrast |
| Algorithm visualization color coding | Color plus shape/label encoding | 1.4.1 Use of Color |

**Color is never the only encoding.** In algorithm visualization, every state (comparing, swapping, sorted) has both a color and a text label or icon. This ensures the visualization is usable for color-blind users.

---

## Keyboard Accessibility

### Navigation (Outside Canvas)

- All interactive elements reachable via `Tab` and `Shift+Tab`.
- `Enter` or `Space` activates buttons and links.
- `Escape` dismisses dialogs and menus.
- Focus order follows visual reading order (left-to-right, top-to-bottom).
- No keyboard traps — focus always has an escape route.

### Canvas Keyboard Controls

| Action | Keyboard |
|--------|----------|
| Activate Select tool | `V` or `Escape` |
| Create rectangle | `R`, then arrow keys to size, Enter to confirm |
| Create text | `T`, then type, Escape to finish |
| Move selected object | Arrow keys (1px increments; 10px with Shift) |
| Delete selected | `Delete` or `Backspace` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` or `Ctrl+Shift+Z` |
| Select all | `Ctrl+A` |
| Copy / Paste | `Ctrl+C` / `Ctrl+V` |
| Zoom in / out | `+` / `-` |
| Zoom to fit | `Ctrl+Shift+H` |
| Next algorithm step | Right arrow key |
| Previous algorithm step | Left arrow key |

Full reference in [keyboard-shortcuts.md](../design/keyboard-shortcuts.md).

---

## Focus Indicators

Focus indicators must be visible on all interactive elements:
- Focus ring style: 2 px solid outline with 2 px offset.
- Focus ring color: The canvas theme's `focus` color (blue by default; high-contrast-mode uses a bright color).
- Focus indicators must not be hidden or overridden by component styles without a replacement.
- shadcn/ui components are used throughout the UI; they provide accessible focus styles by default. Customizations must not reduce focus visibility.

---

## Screen Reader Support

### ARIA Landmarks

The application shell uses semantic HTML and ARIA landmarks:
- `<nav aria-label="Main navigation">`
- `<main>` for the canvas area.
- `<aside aria-label="Properties panel">`
- `<aside aria-label="Frames panel">`

### Live Regions

Dynamic UI changes are announced via `aria-live` regions:
- Auto-save status ("Saved" / "Saving...").
- Algorithm step changes ("Step 4 of 28: Comparing elements at index 2 and 3").
- Error messages and form validation feedback.
- Notification toasts.
- Collaboration events ("Alex Chen joined the board").

### Canvas Accessibility Tree

An accessibility tree for the canvas is maintained separately from the visual rendering. This tree lists all shapes as named, selectable items that screen reader users can navigate.

```html
<ul aria-label="Canvas objects" role="list">
  <li role="listitem" aria-label="Rectangle labeled 'API Server'" tabindex="0"></li>
  <li role="listitem" aria-label="Arrow from 'Client' to 'API Server'" tabindex="0"></li>
</ul>
```

This tree is a supplement, not a replacement for, the visual canvas. It enables screen reader users to navigate and understand the diagram structure.

---

## Text and Typography

| Requirement | Target |
|-------------|--------|
| Minimum font size (app UI) | 14 px |
| Line height (body text) | ≥ 1.5 |
| Letter spacing | Not reduced below normal |
| Text not presented as images | Always use real text in UI |

Text on the canvas is real text (DOM or canvas text rendering with accessible fallback), not images.

---

## Responsive and Zoom

- The application UI must be functional at browser zoom levels of 100%, 150%, and 200%.
- No horizontal scrolling at 200% zoom for the main UI (canvas excluded).
- Touch target minimum size: 44 × 44 CSS px for all interactive elements.

---

## Animation and Motion

- All animations respect `prefers-reduced-motion`. If set, transitions are instant (0 ms).
- Algorithm visualizations: swap animations are disabled when `prefers-reduced-motion` is set.
- Auto-playing animations must have a pause control.
- No content that flashes more than 3 times per second (prevents seizure risk).

---

## Forms and Error Handling

- All form fields have associated `<label>` elements.
- Required fields are marked with `aria-required="true"`.
- Validation errors are announced via `role="alert"` or `aria-describedby`.
- Error messages are in plain language and suggest how to fix the issue.
- Password fields have a "show/hide" toggle.

---

## Images and Media

- All images in the UI have descriptive `alt` text.
- Decorative images have `alt=""`.
- User-uploaded images on the canvas have an editable alt text field in the properties panel.
- SVG icons have `aria-label` or are aria-hidden when decorative.

---

## Testing Plan

| Method | Tools |
|--------|-------|
| Automated accessibility scan | Axe DevTools, Lighthouse |
| Screen reader testing | NVDA + Chrome (Windows), VoiceOver + Safari (macOS) |
| Keyboard-only navigation test | Manual, per feature |
| Color contrast check | Stark (Figma plugin), Colour Contrast Analyser |
| Reduced motion test | Browser DevTools emulation |

Automated scans are run in CI as part of the test suite. Manual screen reader testing is performed for each major feature before release.

---

## Known Limitations (Phase 1)

| Limitation | Mitigation |
|-----------|-----------|
| Infinite canvas cannot be fully navigated by screen reader | Accessibility tree supplement (as described above) |
| Drag-and-drop operations | Keyboard alternatives provided for all drag operations |
| Complex algorithm animations | Step descriptions via `aria-live`; reduced motion mode disables animations |
| 3D workspace | Not screen-reader-accessible in Phase 1; documented limitation |

---

## Related Documents

- [Design Principles](../design/design-principles.md)
- [Keyboard Shortcuts](../design/keyboard-shortcuts.md)
- [Colors & Themes](../design/colors-and-themes.md)
- [Requirements — NFR-022 to NFR-025](../vision/requirements.md#accessibility)
