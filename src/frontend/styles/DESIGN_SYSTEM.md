# Design System Documentation

## Overview

This design system provides a centralized collection of design tokens, base styles, and utilities that ensure visual consistency, maintainability, and accessibility across the Space Weirdos Warband Builder application.

**Key Design Goals:**
- Establish a consistent visual language using CSS custom properties
- Create reusable design tokens for colors, spacing, typography, and more
- Provide base styles for common UI components
- Enable easy theming and future design updates
- Ensure accessibility compliance (WCAG AA minimum)
- Support responsive design patterns

**Design Philosophy:**
- **Token-based**: All design decisions are captured as named tokens
- **Semantic naming**: Use purpose-based names (e.g., `--color-error`) not literal names (e.g., `--color-red`)
- **Scalable**: Design system can grow without breaking existing implementations
- **Accessible**: All color combinations meet WCAG AA contrast requirements
- **Performant**: CSS-only solution with no JavaScript overhead

## File Structure

```
src/frontend/styles/
├── tokens/
│   ├── colors.css          # Color palette and semantic colors
│   ├── spacing.css         # Spacing scale and utilities
│   ├── typography.css      # Font sizes, weights, line heights
│   ├── shadows.css         # Shadow tokens for elevation
│   ├── borders.css         # Border radius and border colors
│   ├── transitions.css     # Animation timing and easing
│   ├── z-index.css         # Layering tokens
│   └── breakpoints.css     # Responsive breakpoints
├── base/
│   ├── reset.css           # CSS reset/normalize
│   ├── buttons.css         # Button base styles
│   ├── forms.css           # Form element base styles
│   ├── labels.css          # Label and fieldset styles
│   └── cards.css           # Card component styles
├── utilities/
│   ├── spacing.css         # Margin and padding utilities
│   ├── layout.css          # Flexbox and grid utilities
│   ├── text.css            # Text alignment and styling utilities
│   ├── typography.css      # Typography utility classes
│   └── display.css         # Display and visibility utilities
└── index.css               # Main entry point that imports all styles
```

---


## Design Tokens

### Color Palette

#### Primary Colors (Blue)
Used for interactive elements, links, and primary actions.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-50` | `#eff6ff` | Lightest shade, backgrounds |
| `--color-primary-100` | `#dbeafe` | Light backgrounds, hover states |
| `--color-primary-200` | `#bfdbfe` | Subtle accents |
| `--color-primary-300` | `#93c5fd` | Borders, dividers |
| `--color-primary-400` | `#60a5fa` | Hover states |
| `--color-primary-500` | `#3b82f6` | **Main primary color** |
| `--color-primary-600` | `#2563eb` | Active states |
| `--color-primary-700` | `#1d4ed8` | Darkest shade, pressed states |

**Visual Reference:**
```
████ --color-primary-50  (Lightest)
████ --color-primary-100
████ --color-primary-200
████ --color-primary-300
████ --color-primary-400
████ --color-primary-500 (Main)
████ --color-primary-600
████ --color-primary-700 (Darkest)
```

#### Neutral Colors (Gray)
Used for text, borders, backgrounds, and UI structure.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-neutral-50` | `#f9fafb` | Elevated backgrounds |
| `--color-neutral-100` | `#f3f4f6` | Subtle backgrounds |
| `--color-neutral-200` | `#e5e7eb` | Default borders |
| `--color-neutral-300` | `#d1d5db` | Hover borders, disabled text |
| `--color-neutral-400` | `#9ca3af` | Placeholder text |
| `--color-neutral-500` | `#6b7280` | Secondary text |
| `--color-neutral-600` | `#4b5563` | Body text (alternative) |
| `--color-neutral-700` | `#374151` | Headings |
| `--color-neutral-800` | `#1f2937` | Dark text |
| `--color-neutral-900` | `#111827` | Primary text |

**Visual Reference:**
```
████ --color-neutral-50  (Lightest)
████ --color-neutral-100
████ --color-neutral-200
████ --color-neutral-300
████ --color-neutral-400
████ --color-neutral-500
████ --color-neutral-600
████ --color-neutral-700
████ --color-neutral-800
████ --color-neutral-900 (Darkest)
```


#### Semantic Colors
Used for state and feedback (success, warning, error, info).

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#16a34a` | Success states, positive feedback |
| `--color-success-light` | `#dcfce7` | Success backgrounds |
| `--color-warning` | `#f59e0b` | Warning states, caution |
| `--color-warning-light` | `#fef3c7` | Warning backgrounds |
| `--color-error` | `#dc2626` | Error states, destructive actions |
| `--color-error-light` | `#fee2e2` | Error backgrounds |
| `--color-info` | `#0ea5e9` | Informational messages |
| `--color-info-light` | `#e0f2fe` | Info backgrounds |

**Usage Example:**
```css
.error-message {
  color: var(--color-error);
  background-color: var(--color-error-light);
}
```

#### Text Colors
Semantic tokens for text in different contexts.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `var(--color-neutral-900)` | Main body text, headings |
| `--color-text-secondary` | `var(--color-neutral-500)` | Secondary text, captions |
| `--color-text-disabled` | `var(--color-neutral-300)` | Disabled form elements |
| `--color-text-inverse` | `#ffffff` | Text on dark backgrounds |

**Usage Example:**
```css
.heading {
  color: var(--color-text-primary);
}

.caption {
  color: var(--color-text-secondary);
}
```

#### Background Colors
Semantic tokens for different surface levels.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-base` | `#ffffff` | Main page background |
| `--color-bg-elevated` | `var(--color-neutral-50)` | Cards, elevated surfaces |
| `--color-bg-overlay` | `rgba(0, 0, 0, 0.5)` | Modal overlays, backdrops |

#### Border Colors
Semantic tokens for borders in different states.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-border-default` | `var(--color-neutral-200)` | Default borders |
| `--color-border-hover` | `var(--color-neutral-300)` | Hover state borders |
| `--color-border-focus` | `var(--color-primary-500)` | Focus state borders |


---

### Spacing System

The spacing system uses a consistent 4px base unit with a multiplier-based scale.

#### Spacing Scale

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--spacing-0` | `0` | 0px | No spacing |
| `--spacing-1` | `0.25rem` | 4px | Minimal spacing |
| `--spacing-2` | `0.5rem` | 8px | Tight spacing |
| `--spacing-3` | `0.75rem` | 12px | Small spacing |
| `--spacing-4` | `1rem` | 16px | Base spacing |
| `--spacing-5` | `1.25rem` | 20px | Medium spacing |
| `--spacing-6` | `1.5rem` | 24px | Large spacing |
| `--spacing-7` | `1.75rem` | 28px | Extra spacing |
| `--spacing-8` | `2rem` | 32px | XL spacing |
| `--spacing-9` | `2.25rem` | 36px | 2XL spacing |
| `--spacing-10` | `2.5rem` | 40px | 3XL spacing |
| `--spacing-11` | `2.75rem` | 44px | 4XL spacing |
| `--spacing-12` | `3rem` | 48px | 5XL spacing |
| `--spacing-14` | `3.5rem` | 56px | 6XL spacing |
| `--spacing-16` | `4rem` | 64px | 7XL spacing |

#### Semantic Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | `var(--spacing-1)` | Extra small spacing |
| `--spacing-sm` | `var(--spacing-2)` | Small spacing |
| `--spacing-md` | `var(--spacing-4)` | Medium spacing (default) |
| `--spacing-lg` | `var(--spacing-6)` | Large spacing |
| `--spacing-xl` | `var(--spacing-8)` | Extra large spacing |

#### Gap Tokens (Flexbox/Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--gap-xs` | `var(--spacing-1)` | Minimal gap |
| `--gap-sm` | `var(--spacing-2)` | Small gap |
| `--gap-md` | `var(--spacing-4)` | Medium gap |
| `--gap-lg` | `var(--spacing-6)` | Large gap |
| `--gap-xl` | `var(--spacing-8)` | Extra large gap |

**Usage Example:**
```css
.card {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.flex-container {
  display: flex;
  gap: var(--gap-md);
}
```


---

### Typography System

#### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-family-base` | System font stack | Body text, UI elements |
| `--font-family-mono` | Monospace font stack | Code, technical content |

**System Font Stack:**
```
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
'Helvetica Neue', Arial, sans-serif
```

#### Font Size Scale

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--font-size-xs` | `0.75rem` | 12px | Fine print, captions |
| `--font-size-sm` | `0.875rem` | 14px | Small text, labels |
| `--font-size-base` | `1rem` | 16px | Body text (default) |
| `--font-size-lg` | `1.125rem` | 18px | Large body text |
| `--font-size-xl` | `1.25rem` | 20px | Subheadings |
| `--font-size-2xl` | `1.5rem` | 24px | H3 headings |
| `--font-size-3xl` | `1.875rem` | 30px | H2 headings |
| `--font-size-4xl` | `2.25rem` | 36px | H1 headings |

**Visual Reference:**
```
████████████████████████████████████ --font-size-4xl (36px) H1
██████████████████████████████ --font-size-3xl (30px) H2
████████████████████████ --font-size-2xl (24px) H3
██████████████████ --font-size-xl (20px) Subheading
████████████████ --font-size-lg (18px) Large text
██████████████ --font-size-base (16px) Body text
████████████ --font-size-sm (14px) Small text
██████████ --font-size-xs (12px) Caption
```

#### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Emphasized text, labels |
| `--font-weight-semibold` | `600` | Subheadings, buttons |
| `--font-weight-bold` | `700` | Headings, strong emphasis |

#### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--line-height-tight` | `1.25` | Headings, compact text |
| `--line-height-normal` | `1.5` | Body text (default) |
| `--line-height-relaxed` | `1.75` | Long-form content |

#### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--letter-spacing-tight` | `-0.025em` | Large headings |
| `--letter-spacing-normal` | `0` | Body text (default) |
| `--letter-spacing-wide` | `0.025em` | Uppercase text, labels |

**Usage Example:**
```css
h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}
```


---

### Shadow System

Shadows create depth and visual hierarchy through elevation levels.

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-none` | `none` | Flat elements |
| `--shadow-sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1), ...` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1), ...` | Modals, popovers |
| `--shadow-xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1), ...` | Large modals |

**Usage Example:**
```css
.card {
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

---

### Border System

#### Border Radius

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--border-radius-none` | `0` | 0px | Sharp corners |
| `--border-radius-sm` | `0.125rem` | 2px | Subtle rounding |
| `--border-radius-md` | `0.25rem` | 4px | Default rounding |
| `--border-radius-lg` | `0.5rem` | 8px | Cards, large elements |
| `--border-radius-xl` | `0.75rem` | 12px | Prominent rounding |
| `--border-radius-full` | `9999px` | Full | Circles, pills |

#### Border Width

| Token | Value | Usage |
|-------|-------|-------|
| `--border-width-thin` | `1px` | Default borders |
| `--border-width-medium` | `2px` | Emphasized borders |
| `--border-width-thick` | `4px` | Strong emphasis |

**Usage Example:**
```css
.button {
  border-radius: var(--border-radius-md);
  border: var(--border-width-thin) solid var(--color-border-default);
}
```

---

### Transition System

#### Duration

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms` | Quick interactions |
| `--transition-normal` | `250ms` | Standard transitions |
| `--transition-slow` | `350ms` | Deliberate animations |

#### Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `--easing-linear` | `linear` | Constant speed |
| `--easing-in` | `cubic-bezier(0.4, 0, 1, 1)` | Accelerating |
| `--easing-out` | `cubic-bezier(0, 0, 0.2, 1)` | Decelerating |
| `--easing-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth (default) |

**Usage Example:**
```css
.button {
  transition: all var(--transition-fast) var(--easing-in-out);
}
```

**Reduced Motion Support:**
The design system automatically respects user preferences for reduced motion by setting all transition durations to near-zero when `prefers-reduced-motion: reduce` is detected.


---

### Z-Index System

Ensures proper stacking of layered elements.

| Token | Value | Usage |
|-------|-------|-------|
| `--z-index-base` | `0` | Default layer |
| `--z-index-sticky` | `10` | Sticky headers |
| `--z-index-dropdown` | `100` | Dropdown menus |
| `--z-index-overlay` | `500` | Modal overlays |
| `--z-index-modal` | `1000` | Modal dialogs |
| `--z-index-tooltip` | `1500` | Tooltips (highest) |

**Usage Example:**
```css
.modal-overlay {
  z-index: var(--z-index-overlay);
}

.modal {
  z-index: var(--z-index-modal);
}
```

---

### Breakpoint System

Responsive breakpoints for different screen sizes.

| Token | Value | Device Type |
|-------|-------|-------------|
| `--breakpoint-sm` | `640px` | Large phones |
| `--breakpoint-md` | `768px` | Tablets |
| `--breakpoint-lg` | `1024px` | Desktops |
| `--breakpoint-xl` | `1280px` | Large desktops |

**Usage Pattern (Desktop-First):**
```css
/* Desktop styles (default) */
.container {
  max-width: 1280px;
}

/* Tablet and smaller */
@media (max-width: 1023px) {
  .container {
    max-width: 768px;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .container {
    max-width: 100%;
  }
}
```

**Usage Pattern (Mobile-First):**
```css
/* Mobile styles (default) */
.container {
  max-width: 100%;
}

/* Tablet and larger */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

/* Desktop and larger */
@media (min-width: 1024px) {
  .container {
    max-width: 1280px;
  }
}
```

---


## Component Base Styles

### Buttons

The design system provides three button variants with consistent styling.

#### Base Button Class

**Class:** `.btn`

**Properties:**
- Inline-flex display with centered content
- Padding: `var(--spacing-2) var(--spacing-4)` (8px 16px)
- Medium font weight
- Rounded corners (4px)
- Smooth transitions on all properties
- Visible focus indicators for accessibility
- Disabled state with 50% opacity

**Usage Example:**
```html
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-secondary">Secondary Action</button>
<button class="btn btn-danger">Delete</button>
<button class="btn btn-primary" disabled>Disabled</button>
```

#### Button Variants

| Variant | Class | Background | Text Color | Usage |
|---------|-------|------------|------------|-------|
| Primary | `.btn-primary` | Blue (`--color-primary-500`) | White | Main actions |
| Secondary | `.btn-secondary` | Transparent | Blue | Secondary actions |
| Danger | `.btn-danger` | Red (`--color-error`) | White | Destructive actions |

**States:**
- **Hover**: Darker background color
- **Active**: Even darker background color
- **Focus**: Blue outline with 2px offset
- **Disabled**: 50% opacity, no pointer events

**CSS Example:**
```css
.btn-primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-600);
}
```

---

### Form Elements

#### Input, Select, Textarea

**Classes:** `.input`, `.select`, `.textarea`

**Properties:**
- Full width by default
- Padding: `var(--spacing-2) var(--spacing-3)` (8px 12px)
- Border: 1px solid neutral-200
- Rounded corners (4px)
- Smooth border color transitions
- Focus state with blue border and subtle shadow

**States:**
- **Default**: Gray border
- **Hover**: Darker gray border
- **Focus**: Blue border with shadow
- **Disabled**: Gray background, reduced opacity
- **Error**: Red border (`.error` class)
- **Success**: Green border (`.success` class)
- **Warning**: Orange border (`.warning` class)

**Usage Example:**
```html
<input type="text" class="input" placeholder="Enter text">
<select class="select">
  <option>Option 1</option>
</select>
<textarea class="textarea" rows="4"></textarea>

<!-- With validation states -->
<input type="email" class="input error" placeholder="Email">
<input type="text" class="input success" placeholder="Username">
```


#### Checkbox and Radio

**Classes:** `.checkbox`, `.radio`

**Properties:**
- Size: 1.25rem (20px)
- Border: 2px solid
- Smooth transitions
- Visible focus indicators

**States:**
- **Default**: Gray border
- **Checked**: Blue background and border
- **Focus**: Blue outline with offset
- **Disabled**: 50% opacity

**Usage Example:**
```html
<input type="checkbox" class="checkbox" id="agree">
<label for="agree">I agree</label>

<input type="radio" class="radio" name="option" id="opt1">
<label for="opt1">Option 1</label>
```

---

### Labels and Fieldsets

#### Label

**Class:** `.label`

**Properties:**
- Block display
- Small font size (14px)
- Medium font weight
- Small bottom margin

**Required Indicator:**
Add `.required` class to show a red asterisk.

**Usage Example:**
```html
<label class="label required" for="email">Email Address</label>
<input type="email" class="input" id="email">
```

#### Fieldset and Legend

**Classes:** `.fieldset`, `.legend`

**Properties:**
- Fieldset: Border, rounded corners, padding
- Legend: Larger font, semibold weight

**Usage Example:**
```html
<fieldset class="fieldset">
  <legend class="legend">Personal Information</legend>
  <!-- Form fields here -->
</fieldset>
```

#### Helper Text

| Class | Color | Usage |
|-------|-------|-------|
| `.help-text` | Secondary gray | Helpful hints |
| `.error-text` | Red | Error messages |
| `.warning-text` | Orange | Warning messages |
| `.success-text` | Green | Success messages |

**Usage Example:**
```html
<input type="password" class="input" id="password">
<span class="help-text">Must be at least 8 characters</span>

<input type="email" class="input error" id="email">
<span class="error-text">Please enter a valid email address</span>
```

---

### Cards

**Classes:** `.card`, `.card-elevated`, `.card-header`, `.card-title`, `.card-body`, `.card-footer`

**Properties:**
- White background
- Border and rounded corners
- Small shadow (elevated variant has medium shadow)
- Padding: 16px
- Hover effect increases shadow

**Usage Example:**
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<!-- Elevated variant -->
<div class="card card-elevated">
  <p>This card has more prominent shadow.</p>
</div>
```

---


## Utility Classes

### Spacing Utilities

#### Margin Utilities

Apply margin in all directions using the spacing scale.

**Pattern:** `.m-{size}`, `.mt-{size}`, `.mr-{size}`, `.mb-{size}`, `.ml-{size}`, `.mx-{size}`, `.my-{size}`

**Available Sizes:** 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16

**Examples:**
```html
<div class="m-4">Margin on all sides (16px)</div>
<div class="mt-2">Margin top (8px)</div>
<div class="mb-6">Margin bottom (24px)</div>
<div class="mx-4">Margin left and right (16px)</div>
<div class="my-8">Margin top and bottom (32px)</div>
```

#### Padding Utilities

Apply padding in all directions using the spacing scale.

**Pattern:** `.p-{size}`, `.pt-{size}`, `.pr-{size}`, `.pb-{size}`, `.pl-{size}`, `.px-{size}`, `.py-{size}`

**Available Sizes:** 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16

**Examples:**
```html
<div class="p-4">Padding on all sides (16px)</div>
<div class="pt-2">Padding top (8px)</div>
<div class="pb-6">Padding bottom (24px)</div>
<div class="px-4">Padding left and right (16px)</div>
<div class="py-8">Padding top and bottom (32px)</div>
```

#### Gap Utilities

Apply gap for flexbox and grid layouts.

**Pattern:** `.gap-{size}`

**Available Sizes:** 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16

**Examples:**
```html
<div class="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div class="grid grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

### Layout Utilities

#### Container Utilities

**Classes:** `.container`, `.container-sm`, `.container-md`, `.container-lg`

**Properties:**
- Full width with max-width constraint
- Centered with auto margins
- Horizontal padding

| Class | Max Width |
|-------|-----------|
| `.container` | 1280px |
| `.container-sm` | 640px |
| `.container-md` | 768px |
| `.container-lg` | 1024px |

**Usage Example:**
```html
<div class="container">
  <h1>Page Content</h1>
</div>
```


#### Flexbox Utilities

**Display:**
- `.flex` - Display flex

**Direction:**
- `.flex-row` - Horizontal layout (default)
- `.flex-col` - Vertical layout
- `.flex-wrap` - Allow wrapping

**Alignment (align-items):**
- `.items-start` - Align to start
- `.items-center` - Center alignment
- `.items-end` - Align to end

**Justification (justify-content):**
- `.justify-start` - Justify to start
- `.justify-center` - Center justification
- `.justify-end` - Justify to end
- `.justify-between` - Space between items
- `.justify-around` - Space around items

**Usage Example:**
```html
<div class="flex items-center justify-between">
  <div>Left content</div>
  <div>Right content</div>
</div>

<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### Grid Utilities

**Display:**
- `.grid` - Display grid

**Columns:**
- `.grid-cols-1` - 1 column
- `.grid-cols-2` - 2 columns
- `.grid-cols-3` - 3 columns
- `.grid-cols-4` - 4 columns

**Usage Example:**
```html
<div class="grid grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

---

### Display Utilities

Control element display and visibility.

| Class | Property | Usage |
|-------|----------|-------|
| `.block` | `display: block` | Block-level element |
| `.inline-block` | `display: inline-block` | Inline block element |
| `.inline` | `display: inline` | Inline element |
| `.hidden` | `display: none` | Hide element |
| `.visible` | `visibility: visible` | Show element |
| `.invisible` | `visibility: hidden` | Hide but keep space |

**Usage Example:**
```html
<span class="block">This span is now block-level</span>
<div class="hidden">This div is hidden</div>
<div class="invisible">This div is invisible but takes up space</div>
```

---


### Text Utilities

#### Text Alignment

| Class | Property | Usage |
|-------|----------|-------|
| `.text-left` | `text-align: left` | Left-aligned text |
| `.text-center` | `text-align: center` | Center-aligned text |
| `.text-right` | `text-align: right` | Right-aligned text |

#### Text Weight

| Class | Weight | Usage |
|-------|--------|-------|
| `.text-normal` | 400 | Normal weight |
| `.text-medium` | 500 | Medium weight |
| `.text-semibold` | 600 | Semibold weight |
| `.text-bold` | 700 | Bold weight |

#### Text Color

| Class | Color | Usage |
|-------|-------|-------|
| `.text-primary` | Neutral-900 | Primary text |
| `.text-secondary` | Neutral-500 | Secondary text |
| `.text-disabled` | Neutral-300 | Disabled text |
| `.text-inverse` | White | Text on dark backgrounds |
| `.text-error` | Red | Error messages |
| `.text-success` | Green | Success messages |
| `.text-warning` | Orange | Warning messages |
| `.text-info` | Blue | Info messages |

**Usage Example:**
```html
<p class="text-center text-bold">Centered bold text</p>
<p class="text-secondary">Secondary text color</p>
<p class="text-error">Error message</p>
```

---

### Typography Utilities

Pre-defined text styles for common use cases.

#### Heading Utilities

| Class | Font Size | Weight | Usage |
|-------|-----------|--------|-------|
| `.text-h1` | 36px | Bold | Main page headings |
| `.text-h2` | 30px | Bold | Section headings |
| `.text-h3` | 24px | Semibold | Subsection headings |

#### Body Text Utilities

| Class | Font Size | Usage |
|-------|-----------|-------|
| `.text-body` | 16px | Standard body text |
| `.text-small` | 14px | Small text |
| `.text-caption` | 12px | Captions, fine print |

**Usage Example:**
```html
<h1 class="text-h1">Main Heading</h1>
<h2 class="text-h2">Section Heading</h2>
<p class="text-body">This is body text.</p>
<p class="text-small">This is small text.</p>
<p class="text-caption">This is caption text.</p>
```

---


## Usage Guidelines

### Getting Started

To use the design system in your application:

1. **Import the design system:**
   ```tsx
   // In your main entry point (e.g., main.tsx)
   import './styles/index.css';
   ```

2. **Use design tokens in custom CSS:**
   ```css
   .my-component {
     color: var(--color-text-primary);
     padding: var(--spacing-4);
     border-radius: var(--border-radius-md);
   }
   ```

3. **Apply utility classes in HTML/JSX:**
   ```tsx
   <div className="flex items-center gap-4 p-4">
     <button className="btn btn-primary">Click me</button>
   </div>
   ```

### Best Practices

#### Use Semantic Tokens

**Do:**
```css
.error-message {
  color: var(--color-error);
  background: var(--color-error-light);
}
```

**Don't:**
```css
.error-message {
  color: #dc2626;
  background: #fee2e2;
}
```

#### Use Spacing Scale

**Do:**
```css
.card {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}
```

**Don't:**
```css
.card {
  padding: 15px;
  margin-bottom: 23px;
}
```

#### Combine Utilities

**Do:**
```html
<div class="flex items-center justify-between p-4 mb-6">
  <h2 class="text-h2">Title</h2>
  <button class="btn btn-primary">Action</button>
</div>
```

**Don't:**
```html
<div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; margin-bottom: 24px;">
  <h2 style="font-size: 30px; font-weight: 700;">Title</h2>
  <button style="background: #3b82f6; color: white; padding: 8px 16px;">Action</button>
</div>
```

### Accessibility

The design system is built with accessibility in mind:

- **Color Contrast**: All text/background combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- **Focus Indicators**: All interactive elements have visible focus indicators for keyboard navigation
- **Reduced Motion**: Respects user preferences for reduced motion
- **Semantic HTML**: Use proper HTML elements with utility classes
- **Form Labels**: Always associate labels with form inputs

**Example:**
```html
<label class="label" for="username">Username</label>
<input type="text" class="input" id="username" aria-describedby="username-help">
<span class="help-text" id="username-help">Choose a unique username</span>
```


### Responsive Design

Use media queries with breakpoint tokens for responsive layouts:

```css
/* Mobile-first approach */
.sidebar {
  width: 100%;
}

@media (min-width: 768px) {
  .sidebar {
    width: 300px;
  }
}

@media (min-width: 1024px) {
  .sidebar {
    width: 400px;
  }
}
```

### Theming

To customize the design system, override CSS custom properties:

```css
/* Custom theme */
:root {
  --color-primary-500: #8b5cf6; /* Purple instead of blue */
  --font-family-base: 'Inter', sans-serif; /* Custom font */
  --border-radius-md: 0.5rem; /* More rounded corners */
}
```

---

## Common Patterns

### Form Layout

```html
<form class="p-6">
  <div class="mb-4">
    <label class="label required" for="name">Name</label>
    <input type="text" class="input" id="name" required>
  </div>
  
  <div class="mb-4">
    <label class="label" for="email">Email</label>
    <input type="email" class="input" id="email">
    <span class="help-text">We'll never share your email</span>
  </div>
  
  <div class="mb-4">
    <label class="label" for="message">Message</label>
    <textarea class="textarea" id="message" rows="4"></textarea>
  </div>
  
  <div class="flex justify-end gap-2">
    <button type="button" class="btn btn-secondary">Cancel</button>
    <button type="submit" class="btn btn-primary">Submit</button>
  </div>
</form>
```

### Card Grid

```html
<div class="grid grid-cols-1 gap-6">
  <!-- Mobile: 1 column -->
  <div class="card">
    <h3 class="card-title">Card 1</h3>
    <p class="text-secondary">Card content</p>
  </div>
  <div class="card">
    <h3 class="card-title">Card 2</h3>
    <p class="text-secondary">Card content</p>
  </div>
</div>

<!-- For responsive grid, use media queries -->
<style>
  @media (min-width: 768px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .card-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
```

### Navigation Bar

```html
<nav class="flex items-center justify-between p-4 bg-elevated">
  <div class="flex items-center gap-4">
    <h1 class="text-h3">App Name</h1>
  </div>
  
  <div class="flex items-center gap-2">
    <button class="btn btn-secondary">Login</button>
    <button class="btn btn-primary">Sign Up</button>
  </div>
</nav>
```


### Modal Dialog

```html
<div class="modal-overlay" style="z-index: var(--z-index-overlay);">
  <div class="modal card card-elevated" style="z-index: var(--z-index-modal); max-width: 500px;">
    <div class="card-header">
      <h2 class="card-title">Confirm Action</h2>
    </div>
    
    <div class="card-body">
      <p>Are you sure you want to proceed?</p>
    </div>
    
    <div class="card-footer flex justify-end gap-2">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-danger">Confirm</button>
    </div>
  </div>
</div>
```

### Alert Messages

```html
<!-- Error Alert -->
<div class="p-4 mb-4" style="background: var(--color-error-light); border-left: 4px solid var(--color-error);">
  <p class="text-error text-bold">Error</p>
  <p class="text-error">Something went wrong. Please try again.</p>
</div>

<!-- Success Alert -->
<div class="p-4 mb-4" style="background: var(--color-success-light); border-left: 4px solid var(--color-success);">
  <p class="text-success text-bold">Success</p>
  <p class="text-success">Your changes have been saved.</p>
</div>

<!-- Warning Alert -->
<div class="p-4 mb-4" style="background: var(--color-warning-light); border-left: 4px solid var(--color-warning);">
  <p class="text-warning text-bold">Warning</p>
  <p class="text-warning">This action cannot be undone.</p>
</div>
```

---

## Maintenance

### Adding New Tokens

1. Add the token to the appropriate file in `tokens/`
2. Use semantic naming (purpose, not appearance)
3. Document the token in this file
4. Update any related components

**Example:**
```css
/* In tokens/colors.css */
:root {
  --color-accent: #f59e0b;
  --color-accent-light: #fef3c7;
}
```

### Modifying Existing Tokens

1. Check for usage across the codebase
2. Update the token value
3. Test visual regression
4. Update documentation

### Creating New Components

1. Add component styles to `base/` directory
2. Use existing tokens for consistency
3. Follow naming conventions
4. Document usage in this file
5. Add examples

---

## Browser Support

The design system supports modern browsers:

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

**CSS Features Used:**
- CSS Custom Properties (widely supported)
- Flexbox and Grid (widely supported)
- Focus-visible (progressive enhancement)

No fallbacks are needed for target browsers.

---

## Resources

### Design System Files

- **Tokens**: `src/frontend/styles/tokens/`
- **Base Styles**: `src/frontend/styles/base/`
- **Utilities**: `src/frontend/styles/utilities/`
- **Entry Point**: `src/frontend/styles/index.css`

### Related Documentation

- [Requirements Document](.kiro/specs/1-ui-design-system/requirements.md)
- [Design Document](.kiro/specs/1-ui-design-system/design.md)
- [Implementation Tasks](.kiro/specs/1-ui-design-system/tasks.md)

### External Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

**Last Updated:** December 2024  
**Version:** 1.0.0
