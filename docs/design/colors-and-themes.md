# Colors and Themes

**Status:** Proposed  
**Audience:** Designers, frontend engineers  
**Last Reviewed:** 2024-01-15

## Overview

Codrawithm launches with a light theme. A dark theme is planned for a later phase once the design system is stable. All colors are defined as CSS custom properties to enable theming.

---

## Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Brand Primary | `#4F46E5` | Primary buttons, links, active states, focus rings |
| Brand Secondary | `#7C3AED` | Accents, highlights, gradients |
| Brand Light | `#EEF2FF` | Brand-tinted backgrounds, hover states |

The brand palette is based on Indigo (primary) and Violet (secondary) from the Tailwind CSS color scale.

---

## Light Theme Palette

### Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-canvas` | `#FFFFFF` | Main canvas surface |
| `--bg-app` | `#F9FAFB` | App shell background (gray-50) |
| `--bg-panel` | `#FFFFFF` | Sidebars, panels, cards |
| `--bg-panel-secondary` | `#F3F4F6` | Nested panel sections (gray-100) |
| `--bg-hover` | `#F3F4F6` | Button/item hover state |
| `--bg-active` | `#E5E7EB` | Button/item active/pressed state |
| `--bg-selected` | `#EEF2FF` | Selected item background |
| `--bg-overlay` | `rgba(0,0,0,0.4)` | Modal backdrop |

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#111827` | Body text, headings (gray-900) |
| `--text-secondary` | `#6B7280` | Labels, captions, descriptions (gray-500) |
| `--text-tertiary` | `#9CA3AF` | Placeholders, disabled hints (gray-400) |
| `--text-disabled` | `#D1D5DB` | Disabled text (gray-300) |
| `--text-inverse` | `#FFFFFF` | Text on dark backgrounds |
| `--text-brand` | `#4F46E5` | Links, brand text |

### Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `--border-default` | `#E5E7EB` | Default borders (gray-200) |
| `--border-strong` | `#D1D5DB` | Emphasized borders (gray-300) |
| `--border-focus` | `#4F46E5` | Focus ring color |
| `--border-error` | `#DC2626` | Error state borders |

### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#059669` | Success states, valid indicators |
| `--color-success-light` | `#D1FAE5` | Success backgrounds |
| `--color-warning` | `#D97706` | Warning states |
| `--color-warning-light` | `#FEF3C7` | Warning backgrounds |
| `--color-error` | `#DC2626` | Error states, destructive actions |
| `--color-error-light` | `#FEE2E2` | Error backgrounds |
| `--color-info` | `#2563EB` | Info states |
| `--color-info-light` | `#DBEAFE` | Info backgrounds |

---

## Canvas Object Colors

Canvas objects use a separate palette from the UI chrome. These are the default colors available in the color picker:

### Default Color Palette (20 colors)

```
Row 1 (Neutrals):
#000000  #374151  #6B7280  #D1D5DB  #FFFFFF

Row 2 (Warm):
#DC2626  #EA580C  #D97706  #CA8A04  #65A30D

Row 3 (Cool):
#059669  #0891B2  #2563EB  #4F46E5  #7C3AED

Row 4 (Pastel):
#FCA5A5  #FDE68A  #A7F3D0  #BAE6FD  #C4B5FD
```

**Color picker features (planned):**
- 20-color default palette
- Recent colors (last 8 used)
- Hex input field
- Opacity/alpha slider
- Eyedropper (where browser API supports it)
- Saved custom palettes (Pro feature, planned)

---

## Collaboration Cursor Colors

Each collaborator is assigned a distinct color for their cursor and selection highlights. Colors are drawn from a fixed set to ensure visibility on white backgrounds:

```
#EF4444  (Red)
#F97316  (Orange)
#EAB308  (Yellow)
#22C55E  (Green)
#06B6D4  (Cyan)
#3B82F6  (Blue)
#8B5CF6  (Purple)
#EC4899  (Pink)
#14B8A6  (Teal)
#F59E0B  (Amber)
```

---

## Algorithm Visualization State Colors

Special semantic colors used in the Algorithm Lab workspace:

| State | Color | Hex |
|-------|-------|-----|
| Unvisited node | Gray | `#E5E7EB` |
| Current / Active node | Yellow | `#FCD34D` |
| Visited node | Green | `#34D399` |
| In queue / stack | Blue | `#60A5FA` |
| Path found | Purple | `#A78BFA` |
| Rejected / pruned | Red | `#FCA5A5` |
| Edge (default) | Dark gray | `#6B7280` |
| Edge (traversed) | Green | `#059669` |
| Edge (active) | Orange | `#F97316` |

---

## Dark Theme (Planned — Phase 2)

Dark theme is not in scope for Phase 1 but should be designed with it in mind. All colors are defined as CSS custom properties from day one to make the dark theme implementation straightforward.

**Planned dark theme tokens:**

| Light | Dark |
|-------|------|
| `--bg-canvas: #FFFFFF` | `--bg-canvas: #1F2937` |
| `--bg-app: #F9FAFB` | `--bg-app: #111827` |
| `--bg-panel: #FFFFFF` | `--bg-panel: #1F2937` |
| `--text-primary: #111827` | `--text-primary: #F9FAFB` |
| `--text-secondary: #6B7280` | `--text-secondary: #9CA3AF` |
| `--border-default: #E5E7EB` | `--border-default: #374151` |

Dark theme activation: `data-theme="dark"` on the `<html>` element, togglable in user preferences. Respects `prefers-color-scheme` media query by default.

---

## Accessibility — Contrast Requirements

All text/background combinations must meet WCAG 2.1 AA:

| Combination | Ratio Required | Status |
|-------------|---------------|--------|
| `--text-primary` on `--bg-app` | ≥ 4.5:1 | ✅ 16:1 |
| `--text-secondary` on `--bg-panel` | ≥ 4.5:1 | ✅ 5.9:1 |
| White text on `--brand-primary` | ≥ 4.5:1 | ✅ 7.2:1 |
| `--text-brand` on `--bg-panel` | ≥ 4.5:1 | ✅ 6.8:1 |
| `--text-tertiary` on `--bg-panel` | ≥ 3:1 (large text) | ⚠️ Verify |

Note: Contrast values above are estimates. All production combinations must be verified with a contrast checker before shipping.

---

## Related Documents

- [Design System](./design-system.md)
- [Design Principles](./design-principles.md)
- [Accessibility](../product/accessibility.md)
