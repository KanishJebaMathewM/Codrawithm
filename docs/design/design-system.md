# Design System

**Status:** Proposed  
**Audience:** Designers, frontend engineers  
**Last Reviewed:** 2024-01-15

## Overview

Codrawithm's design system provides the tokens, components, and conventions that ensure a consistent interface across the application. It is built on top of [shadcn/ui](https://ui.shadcn.com/) (MIT-licensed, accessible, unstyled-by-default component primitives built on Radix UI) with a custom token layer.

---

## Technology Foundation

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Component primitives | shadcn/ui + Radix UI | Accessible, unstyled, composable, MIT license |
| Styling | Tailwind CSS | Utility-first, design-token-friendly, tree-shakeable |
| Icons | Lucide React | MIT license, consistent style, tree-shakeable |
| Typography | Inter (Google Fonts) | Excellent legibility at small sizes, open license |
| Monospace | JetBrains Mono | Code blocks and algorithm labels |

---

## Design Tokens

Tokens are defined as CSS custom properties and mapped to Tailwind's theme config.

### Spacing Scale

```css
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

### Border Radius

```css
--radius-sm:   4px   /* Small elements: badges, chips */
--radius-md:   8px   /* Buttons, inputs, cards */
--radius-lg:   12px  /* Panels, dialogs */
--radius-xl:   16px  /* Large cards */
--radius-full: 9999px /* Pills, avatars */
```

### Shadows

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.1)
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.1)
--shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.1)
```

### Typography Scale

```css
--text-xs:   12px / 16px
--text-sm:   13px / 18px
--text-base: 14px / 20px   /* Default UI text */
--text-md:   15px / 22px
--text-lg:   18px / 28px
--text-xl:   20px / 30px
--text-2xl:  24px / 32px
--text-3xl:  30px / 38px
```

### Font Weights

```css
--font-normal:   400
--font-medium:   500
--font-semibold: 600
--font-bold:     700
```

---

## Color System

See [colors-and-themes.md](./colors-and-themes.md) for the full palette.

Key semantic tokens:

```css
/* Backgrounds */
--bg-canvas:     #FFFFFF   /* Canvas surface */
--bg-app:        #F8F9FA   /* App shell background */
--bg-panel:      #FFFFFF   /* Sidebar, panels */
--bg-overlay:    rgba(0,0,0,0.4)  /* Modal overlays */

/* Text */
--text-primary:   #111827
--text-secondary: #6B7280
--text-disabled:  #9CA3AF
--text-inverse:   #FFFFFF

/* Brand */
--brand-primary:    #4F46E5   /* Indigo-600 */
--brand-secondary:  #7C3AED   /* Violet-600 */

/* Status */
--color-success:  #059669
--color-warning:  #D97706
--color-error:    #DC2626
--color-info:     #2563EB
```

---

## Core Components

All components are built on shadcn/ui primitives with custom token application.

### Buttons

```
Variants: default, secondary, outline, ghost, destructive, link
Sizes:    sm (28px), md (36px, default), lg (44px), icon (36×36px)
```

**Usage rules:**
- One primary action per view
- Destructive actions use `variant="destructive"` with confirmation dialog
- Icon-only buttons must have an `aria-label`

### Inputs

```
Text input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider, ColorPicker
```

All inputs:
- Have visible focus rings (3px offset, brand color)
- Show error state with red border + helper text
- Disabled state reduces opacity to 50%

### Panels and Containers

```
Card          — surface with border and shadow
Sheet         — slide-in panel (right/left/bottom)
Dialog        — modal overlay
Popover       — anchored floating content
Tooltip       — hover label (max 200ms delay)
ContextMenu   — right-click menu
DropdownMenu  — triggered menu
Tabs          — horizontal tab navigation
Accordion     — collapsible sections
```

### Canvas-Specific Components

```
SelectionBox        — dashed border around selected objects
ResizeHandle        — 8-point handles on selection corners/edges
RotationHandle      — curved arrow above selection box
Tooltip (canvas)    — appears near cursor, not anchored to element
ContextToolbar      — floating toolbar above selected object
ColorSwatch         — small circle showing current fill/stroke color
```

---

## Component States

Every interactive component must implement:

| State | Visual Treatment |
|-------|-----------------|
| Default | As designed |
| Hover | Background lightens or border appears |
| Focus | 2px ring in `--brand-primary` color |
| Active/Pressed | Background darkens slightly |
| Disabled | 50% opacity, no cursor change |
| Error | Red border, error icon, helper text |
| Loading | Skeleton or spinner replaces content |
| Empty | Empty state illustration + CTA |

---

## Icon Usage

Using Lucide React (MIT license).

**Rules:**
- Default icon size: 16px in UI, 20px in toolbars, 24px in prominent positions
- Icons always pair with a visible label OR an `aria-label`
- Use `strokeWidth={1.5}` for a lighter feel in toolbars
- Never resize icons with CSS transforms; use the `size` prop

---

## Motion and Animation

```css
--duration-fast:   100ms
--duration-normal: 200ms
--duration-slow:   300ms

--easing-default:  cubic-bezier(0.4, 0, 0.2, 1)   /* Material standard */
--easing-enter:    cubic-bezier(0, 0, 0.2, 1)
--easing-exit:     cubic-bezier(0.4, 0, 1, 1)
```

**Rules:**
- Panels slide in/out: `--duration-normal` with `--easing-enter/exit`
- Object creation on canvas: 150ms scale-up from 0.95
- Deletion: 100ms fade-out
- All animations respect `prefers-reduced-motion: reduce` — reduce to instant or minimal
- No looping animations except explicit loading states

---

## Empty States

Every view with dynamic content must have a designed empty state:

- **New board:** "Your canvas is blank. Start drawing or pick a template."
- **No search results:** "No matches for '[query]'. Try different keywords."
- **No shared boards:** "Nothing shared with you yet."
- **Algorithm lab with no nodes:** "Add a node to start visualising."

Empty states include: illustration (simple SVG), heading, body text, primary CTA button.

---

## Loading States

| Context | Treatment |
|---------|-----------|
| Page load | Full-screen skeleton matching layout zones |
| Panel content | Skeleton rows |
| Canvas objects loading | Placeholder shapes with shimmer |
| Button action in progress | Spinner replaces icon, button disabled |
| AI generation in progress | Pulsing indicator in AI panel |

---

## Related Documents

- [Colors and Themes](./colors-and-themes.md)
- [Design Principles](./design-principles.md)
- [Interface Layout](./interface-layout.md)
- [Interaction Patterns](./interaction-patterns.md)
- [Accessibility](../product/accessibility.md)
