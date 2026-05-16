---
name: Modern Financial Interface
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#005ac2'
  on-tertiary: '#ffffff'
  tertiary-container: '#71a1ff'
  on-tertiary-container: '#00367a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 16px
  container-padding-desktop: 40px
  gutter: 24px
  card-gap: 24px
  section-gap: 48px
---

## Brand & Style

The design system is engineered for a premium fintech experience that balances institutional trust with modern digital agility. Drawing inspiration from the precision of high-end productivity tools and the airy aesthetics of contemporary consumer electronics, the style is defined as **Corporate Modern with Glassmorphic accents**.

The UI focuses on clarity and "financial breathing room," using generous whitespace to reduce cognitive load during complex budgeting tasks. Visual interest is maintained through smooth, high-fidelity gradients and subtle translucency, evoking a sense of depth and technical sophistication. The target audience expects a professional tool that feels like a high-end personal assistant—reliable, clean, and effortlessly organized.

## Colors

This design system utilizes a palette centered on **Emerald Green** to represent growth and financial health, paired with **Deep Navy** for stability and authority. 

- **Primary:** Emerald Green is used for growth-oriented actions and positive financial indicators.
- **Secondary:** Deep Navy provides the structural foundation for navigation and high-level headers.
- **Accents:** A secondary Sky Blue is used for informative links and interactive secondary states.
- **Feedback:** Standard semantic colors (Success/Warning/Danger) are slightly desaturated to maintain a professional, rather than aggressive, tone.
- **Surface Strategy:** In light mode, surfaces use pure white with very soft gray borders (#F1F5F9). In dark mode, the system transitions to deep charcoal and black, utilizing subtle gradients to differentiate between background layers and elevated cards.

## Typography

The design system relies exclusively on **Inter** to ensure maximum legibility for numerical data. The type scale is optimized for data density without sacrificing elegance.

- **Balances & Amounts:** Use `display-lg` for total balances to create an immediate focal point.
- **Numeric Data:** Tabular figures should be enabled for all transaction lists to ensure columns of numbers align vertically for easier scanning.
- **Hierarchy:** Use `label-sm` in all-caps for metadata such as "DUE DATE" or "CATEGORY" to provide a clear contrast against body text and headlines.

## Layout & Spacing

The layout follows a **12-column fixed-width grid** for desktop environments, centered with generous outer margins. A 4px/8px baseline grid governs all internal component spacing to maintain mathematical harmony.

- **Dashboard Layout:** Utilizes a persistent left-hand sidebar (280px) and a fluid main content area.
- **Responsive Reflow:** On mobile, the sidebar collapses into a bottom navigation bar or a hamburger menu. The 12-column grid transitions to a 4-column layout with 16px margins.
- **Density:** High-level dashboard views use "Relaxed" spacing (24px+ gaps) to feel premium, while transaction tables use "Compact" spacing (12px padding) to maximize information density.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layers** and **Ambient Shadows**. 

1.  **Level 0 (Background):** Solid surface color (#F8FAFC in light, #0F172A in dark).
2.  **Level 1 (Cards/Sidebar):** Pure white or deep navy with a 1px border (#E2E8F0) and a very soft, large-radius shadow (Y: 4, Blur: 20, Opacity: 0.05).
3.  **Level 2 (Modals/Popovers):** Higher elevation with a more pronounced shadow (Y: 10, Blur: 30, Opacity: 0.1). These elements utilize **Glassmorphism**, applying a 20px backdrop blur and 80% opacity to the background fill.
4.  **Glassmorphic Accents:** Sidebars and header bars should use a subtle translucency when scrolling over content to maintain context and depth.

## Shapes

The shape language is modern and approachable. The system uses a tiered rounding logic to create a "nested" aesthetic:

- **Primary Containers (Cards/Modals):** 16px (`rounded-xl`) to provide a soft, friendly silhouette.
- **Input Fields/Buttons:** 8px (`rounded-md`) to maintain a sense of precision and utility.
- **Tags/Chips:** Fully pill-shaped for easy differentiation from buttons.
- **Nested Elements:** Elements inside a 16px card should use 8px or 12px corners to maintain visual alignment of the corner curves.

## Components

### Financial Metric Cards
The centerpiece of the dashboard. Use a 16px corner radius. Feature a subtle linear gradient top-to-bottom (e.g., White to #F9FAFB). Include a sparkline chart in the background with 10% opacity using the primary color.

### Progress Bars
Used for budget tracking. Use a height of 8px with fully rounded ends. The track color should be a 10% opacity version of the fill color. For "Over Budget" states, the bar should pulse or change to the Danger color.

### Transaction Tables
Minimalist approach. Remove all vertical borders. Use 1px horizontal dividers. The header row should use `label-sm` typography with a subtle background tint. Every other row can have a faint zebra-stripe for long lists.

### Sidebar Navigation
The active state should use a "pill" highlight with the primary color at 10% opacity and a 2px vertical stroke on the leading edge. Icons should be "Outlined" style with a 1.5px stroke weight.

### Input Fields
Inputs should have a 1px border that thickens and changes to the primary color on focus. Use a soft primary-colored outer glow (4px spread) to indicate active typing.

### Modals
Modals should animate from the bottom on mobile and fade-in/scale-up on desktop. Use a dark, 40% opaque backdrop with a heavy blur (10px) to pull focus entirely to the transaction entry form.