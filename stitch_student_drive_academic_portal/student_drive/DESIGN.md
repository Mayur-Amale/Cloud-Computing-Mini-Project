---
name: Student Drive
colors:
  surface: '#fcf9f9'
  surface-dim: '#e8dada'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf3f4'
  surface-container: '#f4ebec'
  surface-container-high: '#eee2e3'
  surface-container-highest: '#e6d7d9'
  on-surface: '#1f1617'
  on-surface-variant: '#544648'
  inverse-surface: '#2d1a1d'
  inverse-on-surface: '#faeef0'
  outline: '#7d6e70'
  outline-variant: '#cfc0c2'
  surface-tint: '#800020'
  primary: '#800020'
  on-primary: '#ffffff'
  primary-container: '#941b31'
  on-primary-container: '#fff0f2'
  inverse-primary: '#f8c7d0'
  secondary: '#5c5052'
  on-secondary: '#ffffff'
  secondary-container: '#f4e8ea'
  on-secondary-container: '#4a3e40'
  tertiary: '#845e17'
  on-tertiary: '#ffffff'
  tertiary-container: '#c59b27'
  on-tertiary-container: '#291800'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fce4e7'
  primary-fixed-dim: '#f8c7d0'
  on-primary-fixed: '#3d000d'
  on-primary-fixed-variant: '#68051e'
  secondary-fixed: '#f4e8ea'
  secondary-fixed-dim: '#ddced0'
  on-secondary-fixed: '#251d1e'
  on-secondary-fixed-variant: '#43383a'
  tertiary-fixed: '#fbf3db'
  tertiary-fixed-dim: '#edd084'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#5a3e18'
  background: '#fcf9f9'
  on-background: '#1f1617'
  surface-variant: '#ebdcdc'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an authoritative, accessible, and structured digital campus environment tailored for higher education. Designed specifically for university workflows, thesis progression, document submissions, and evaluation portals, it eliminates superfluous visual ornament in favor of utilitarian clarity, high information density, and unambiguous task guidance.

### Design Movement
The visual identity draws from **Corporate / Modern** principles rooted in administrative rigor and WCAG AAA accessibility. Surfaces rely on disciplined grid alignment, explicit 1px architectural borders, and deliberate contrast to minimize cognitive friction for students, faculty, and administrators navigating complex deadlines and review cycles.

### Personality & Tone
- **Institutional & Trustworthy:** Anchored by deep college maroon and warm slate tones that convey stability, academic rigor, and structural authority.
- **Utilitarian & Clear:** Action points and primary workflows are unmistakably highlighted using vivid institutional maroon (`#800020`), supported by restrained gold accents (`#C59B27`), preventing ambiguity in status tracking and submission flows.
- **Calm & Focused:** Soft, balanced warm off-white canvases (`#FCF9F9`) reduce visual fatigue during extended periods of grading, reading, and document revision.

## Colors

The color architecture is built around high-contrast structural text, deep institutional maroon accents, restrained college gold highlights, and an unambiguous semantic status matrix. Every color role conforms strictly to accessibility requirements across standard data density displays.

### Role Allocations
- **Primary (`#800020`):** Applied exclusively to actionable elements—primary buttons, active tab indicators, selected states, and key interactive signifiers.
- **Secondary (`#5C5052`):** The structural authority color. Used for headings, heavy navigation containers, dense table headers, and high-emphasis labels.
- **Tertiary (`#845E17` / Gold `#C59B27`):** Applied to secondary indicators, verified credential badges, and complementary metric data.
- **Neutral (`#7D6E70`):** Governs secondary body copy, passive borders, helper text, and inactive metadata.
- **Canvas & Backgrounds:** The base app canvas rests on `#FCF9F9`, layered containers and cards use `#FFFFFF`, and resting row or input states leverage `#FAF3F4`.

### Status & Academic Workflow Semantics
- **Not Submitted / Inactive:** Background `#F1F5F9`, border `#CBD5E1`, text `#475569`.
- **Submitted / Awaiting Review:** Background `#FEF3C7`, border `#FDE68A`, text `#92400E`.
- **Needs Changes / Critical:** Background `#FFE4E6`, border `#FECDD3`, text `#9F1239`.
- **Approved / Complete:** Background `#D1FAE5`, border `#A7F3D0`, text `#065F46`.

## Typography

The typographic hierarchy uses Inter exclusively across all scales to maintain consistent character anatomy and exceptional legibility across varied device resolutions.

### Implementation Guidelines
- **Tabular Lining Numbers:** All numerical interfaces—such as timestamps, submission file sizes, GPAs, and pagination metrics—must employ tabular numerals (`font-feature-settings: "tnum"` enabled) to ensure vertical alignment across data rows.
- **Hierarchy Rules:** Section titles and assignment titles utilize `headline-lg` and `headline-md` rendered in deep slate (`#0F172A`) with negative letter tracking to retain density. Data grids and metadata callouts primarily rely on `body-md` and `label-md`.
- **Vertical Rhythm:** Generous relative line heights on body text ensure dense rubric descriptions, instructions, and feedback text can be scanned without fatigue.

## Layout & Spacing

The layout is built upon an 8px modular baseline system utilizing a responsive 12-column fluid grid on desktop viewports and collapsible column models across smaller devices.

### Form Factor Behavior
- **Desktop (1024px and above):** 12-column grid with a standard `2rem` margin and `1.5rem` gutter. Uses a persistent `260px` left sidebar for university navigation and core portal functions, reserving the central canvas for responsive content cards, document lists, and tables.
- **Tablet (768px - 1023px):** 8-column layout with `1.5rem` margins and `1rem` gutters. The sidebar collapses to an icon rail or toggleable sheet.
- **Mobile (< 768px):** 4-column layout with `1rem` margins and `1rem` gutters. Content stacks into single full-width container units; action buttons stretch across the base of modal sheets or persistent footer bars.

### Density Principles
Use tighter spacing (`space-xs` and `space-sm`) inside individual form groups, badge containers, and table cells to retain information density. Reserve wider intervals (`space-lg` and `space-xl`) for structural separations between document metadata, submission dropzones, and grade rubrics.

## Elevation & Depth

Visual hierarchy is maintained through precise border definition and subtle, cool-toned ambient shadows. Surfaces do not rely on pronounced drop shadows; instead, layered structural planes create order.

### Elevation Levels
- **Level 0 (Flat Canvas):** `#F8FAFC`. Used as the base backdrop for the entire application workspace.
- **Level 1 (Card & Content Blocks):** `#FFFFFF` fill with a crisp `1px solid #E2E8F0` border and an ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Dropdowns, Floating Palettes & Popovers):** `#FFFFFF` fill with a `1px solid #CBD5E1` border and a soft ambient shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)`.
- **Level 3 (Modals & Submission Dialogs):** `#FFFFFF` fill with a `1px solid #CBD5E1` border and deep focus shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`. Accompanied by a semi-transparent slate scrim (`rgba(15, 23, 42, 0.45)`).

## Shapes

The design uses a clean, controlled rounding system (`roundedness: 2`) that balances modern software aesthetics with institutional structure.

### Token Map
- **Base Components (`0.5rem` / `8px`):** Input fields, standard cards, file upload dropzones, buttons, modals, and panel headers.
- **Large Surfaces (`1rem` / `16px`):** Major workflow containers, parent dashboard cards, and multi-stage submission wrappers.
- **Extra Large Containers (`1.5rem` / `24px`):** Root application shells and broad hero banner panels.
- **Full Pill (`9999px`):** Strictly reserved for status badges, role indicators, and round icon avatars to establish an immediate distinction between clickable cards and informational tags.

## Components

### Buttons
- **Primary:** Solid `#800020` fill, white text, 8px corner radius, padding `0.625rem 1.25rem`. Hover: `#660019`. Active: `#4d0013`. Focus: Visible 2px outline offset with `rgba(128, 0, 32, 0.35)`.
- **Secondary / Outline:** Background `#FFFFFF`, 1px solid `#CBD5E1`, text `#1F1617`. Hover: `#FAF3F4` and border `#94A3B8`.
- **Destructive:** Background `#FFE4E6`, 1px solid `#FECDD3`, text `#9F1239`. Hover: `#FEE2E2`.

### Status Badges (Pills)
Pill-shaped (`rounded-full`), padding `0.25rem 0.75rem`, font `label-sm` with tabular numerals.
- *Submitted / Reviewing:* `#FEF3C7` background, `#854D0E` text, `#FDE68A` 1px border.
- *Changes Requested:* `#FFE4E6` background, `#9F1239` text, `#FECDD3` 1px border.
- *Approved:* `#D1FAE5` background, `#065F46` text, `#A7F3D0` 1px border.
- *Draft / Idle:* `#F4E8EA` background, `#5C5052` text, `#CBD5E1` 1px border.

### Input Fields & Controls
- **Inputs & Selects:** Height `2.5rem`, padding `0 0.75rem`, background `#FFFFFF`, border `1px solid #CBD5E1`, border-radius `0.5rem`. Focus: `#800020` border with `0 0 0 3px rgba(128, 0, 32, 0.15)`.
- **Checkboxes & Radios:** Size `1rem`, border `1.5px solid #94A3B8`, checking fills with `#800020`.

### File Upload Dropzones
- Dashed border (`2px dashed #CBD5E1`), background `#FAF3F4`, radius `0.5rem`, padding `2rem`.
- Drag-hover transition shifts border to `#800020` and background to `rgba(128, 0, 32, 0.04)`.
- Center alignment featuring an institutional maroon upload icon, supported by primary text in `label-lg` and format/size restrictions in `body-sm` (`#7D6E70`).

### Data Tables & Lists
- Table headers use `#FAF3F4` background with `1px solid #E2E8F0`, uppercase `label-xs` text (`#5C5052`), and explicit column dividers.
- Alternating or hoverable table rows use `#FFFFFF` base transitioning to `#FAF3F4` on cursor hover. Borders strictly `1px solid #FAF3F4`.

### Timeline & Version History
- Vertical connected rail using a `2px solid #E2E8F0` track.
- Version nodes rendered as 12px circles (`#FFFFFF` fill, `2px solid #800020`).
- Content cards display submission author, file hash/name, timestamp (tabular numerals), and contextual change-log tags.