# Design Document: UI Design System

## Overview

This design document specifies the foundational design system for the Space Weirdos Warband Builder. The design system provides a centralized collection of design tokens, base styles, and utilities that ensure visual consistency, maintainability, and accessibility across the entire application.

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

## Architecture

### File Structure

```
src/frontend/styles/
├── tokens/
│   ├── colors.css          # Color palette and semantic colors
│   ├── spacing.css         # Spacing scale and utilities
│   ├── typography.css      # Font sizes, weights, line heights
│   ├── shadows.css         # Shadow tokens for elevation
│   ├── borders.css         # Border radius and border colors
│   ├── transitions.css     # Animation timing and easing
│   └── z-index.css         # Layering tokens
├── base/
│   ├── reset.css           # CSS reset/normalize
│   ├── buttons.css         # Button base styles
│   ├── forms.css           # Form element base styles
│   └── typography.css      # Typography base styles
├── utilities/
│   ├── spacing.css         # Margin and padding utilities
│   ├── layout.css          # Flexbox and grid utilities
│   ├── text.css            # Text alignment and styling utilities
│   └── display.css         # Display and visibility utilities
└── index.css               # Main entry point that imports all styles
```

### Design Token Categories

1. **Colors**: Primary, secondary, semantic, text, background, border
2. **Spacing**: Scale from xs to xl, margin/padding utilities
3. **Typography**: Font sizes, weights, line heights, families
4. **Shadows**: Elevation levels for depth
5. **Borders**: Radius tokens for rounded corners
6. **Transitions**: Duration and easing for animations
7. **Z-index**: Layering for overlays and modals
8. **Breakpoints**: Responsive design thresholds



## Design Tokens

### Color System

**Color Palette Structure:**

```css
:root {
  /* Primary Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;  /* Main primary */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  /* Neutral Colors */
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-500: #6b7280;
  --color-neutral-700: #374151;
  --color-neutral-900: #111827;
  
  /* Semantic Colors */
  --color-success: #16a34a;
  --color-success-light: #dcfce7;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-error: #dc2626;
  --color-error-light: #fee2e2;
  --color-info: #0ea5e9;
  --color-info-light: #e0f2fe;
  
  /* Text Colors */
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-500);
  --color-text-disabled: var(--color-neutral-300);
  --color-text-inverse: #ffffff;
  
  /* Background Colors */
  --color-bg-base: #ffffff;
  --color-bg-elevated: var(--color-neutral-50);
  --color-bg-overlay: rgba(0, 0, 0, 0.5);
  
  /* Border Colors */
  --color-border-default: var(--color-neutral-200);
  --color-border-hover: var(--color-neutral-300);
  --color-border-focus: var(--color-primary-500);
}
```

**Design Rationale:**
- Uses blue as primary color (common for interactive elements)
- Neutral grays for text and borders
- Semantic colors follow standard conventions (green=success, red=error)
- Text colors ensure WCAG AA contrast on white backgrounds
- Border colors provide subtle separation without harsh lines



### Spacing System

**Spacing Scale:**

```css
:root {
  /* Base unit: 0.25rem (4px) */
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  
  /* Semantic spacing */
  --spacing-xs: var(--spacing-1);
  --spacing-sm: var(--spacing-2);
  --spacing-md: var(--spacing-4);
  --spacing-lg: var(--spacing-6);
  --spacing-xl: var(--spacing-8);
}
```

**Utility Classes:**

```css
/* Margin utilities */
.m-0 { margin: var(--spacing-0); }
.m-1 { margin: var(--spacing-1); }
.m-2 { margin: var(--spacing-2); }
/* ... up to m-16 */

.mt-2 { margin-top: var(--spacing-2); }
.mr-2 { margin-right: var(--spacing-2); }
.mb-2 { margin-bottom: var(--spacing-2); }
.ml-2 { margin-left: var(--spacing-2); }
.mx-2 { margin-left: var(--spacing-2); margin-right: var(--spacing-2); }
.my-2 { margin-top: var(--spacing-2); margin-bottom: var(--spacing-2); }

/* Padding utilities */
.p-0 { padding: var(--spacing-0); }
.p-2 { padding: var(--spacing-2); }
/* ... similar pattern for padding */

/* Gap utilities for flexbox/grid */
.gap-2 { gap: var(--spacing-2); }
.gap-4 { gap: var(--spacing-4); }
```

**Design Rationale:**
- 4px base unit provides fine-grained control
- Scale follows 4px increments for consistency
- Semantic names (xs, sm, md, lg, xl) for common use cases
- Utility classes follow Tailwind-like naming for familiarity



### Typography System

**Type Scale:**

```css
:root {
  /* Font families */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
  
  /* Font sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  
  /* Font weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Letter spacing */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
}
```

**Typography Utilities:**

```css
/* Heading styles */
.text-h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.text-h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.text-h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

/* Body text styles */
.text-body {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

.text-small {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.text-caption {
  font-size: var(--font-size-xs);
  line-height: var(--line-height-normal);
  color: var(--color-text-secondary);
}
```

**Design Rationale:**
- System font stack for performance and native feel
- 16px base font size for readability
- Modular scale with clear hierarchy
- Line heights optimized for readability
- Weights provide sufficient contrast for hierarchy



### Shadow System

```css
:root {
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

### Border System

```css
:root {
  --border-radius-none: 0;
  --border-radius-sm: 0.125rem;   /* 2px */
  --border-radius-md: 0.25rem;    /* 4px */
  --border-radius-lg: 0.5rem;     /* 8px */
  --border-radius-xl: 0.75rem;    /* 12px */
  --border-radius-full: 9999px;
  
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 4px;
}
```

### Transition System

```css
:root {
  --transition-fast: 150ms;
  --transition-normal: 250ms;
  --transition-slow: 350ms;
  
  --easing-linear: linear;
  --easing-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Z-Index System

```css
:root {
  --z-index-base: 0;
  --z-index-sticky: 10;
  --z-index-dropdown: 100;
  --z-index-overlay: 500;
  --z-index-modal: 1000;
  --z-index-tooltip: 1500;
}
```

### Breakpoint System

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* Media query mixins (documented for use) */
/* @media (min-width: 768px) { ... } for desktop-first */
```



## Component Base Styles

### Button Styles

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  border-radius: var(--border-radius-md);
  border: var(--border-width-thin) solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast) var(--easing-in-out);
}

.btn:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-600);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-primary-50);
}

.btn-danger {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}
```

### Form Element Styles

```css
.input,
.select,
.textarea {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-base);
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--border-radius-md);
  transition: border-color var(--transition-fast) var(--easing-in-out);
}

.input:hover,
.select:hover,
.textarea:hover {
  border-color: var(--color-border-hover);
}

.input:focus,
.select:focus,
.textarea:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:disabled,
.select:disabled,
.textarea:disabled {
  background-color: var(--color-neutral-50);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

/* Validation states */
.input.error,
.select.error,
.textarea.error {
  border-color: var(--color-error);
}

.input.error:focus,
.select.error:focus,
.textarea.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.input.success {
  border-color: var(--color-success);
}

.input.warning {
  border-color: var(--color-warning);
}
```



### Checkbox and Radio Styles

```css
.checkbox,
.radio {
  width: 1.25rem;
  height: 1.25rem;
  border: var(--border-width-medium) solid var(--color-border-default);
  cursor: pointer;
  transition: all var(--transition-fast) var(--easing-in-out);
}

.checkbox {
  border-radius: var(--border-radius-sm);
}

.radio {
  border-radius: var(--border-radius-full);
}

.checkbox:checked,
.radio:checked {
  background-color: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.checkbox:focus,
.radio:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.checkbox:disabled,
.radio:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Label and Fieldset Styles

```css
.label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
}

.label.required::after {
  content: ' *';
  color: var(--color-error);
}

.fieldset {
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.legend {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  padding: 0 var(--spacing-2);
}

.help-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

.error-text {
  font-size: var(--font-size-sm);
  color: var(--color-error);
  margin-top: var(--spacing-1);
}
```

### Card Styles

```css
.card {
  background-color: var(--color-bg-base);
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-sm);
}

.card-elevated {
  box-shadow: var(--shadow-md);
}

.card-header {
  padding-bottom: var(--spacing-3);
  border-bottom: var(--border-width-thin) solid var(--color-border-default);
  margin-bottom: var(--spacing-3);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.card-body {
  padding: var(--spacing-3) 0;
}

.card-footer {
  padding-top: var(--spacing-3);
  border-top: var(--border-width-thin) solid var(--color-border-default);
  margin-top: var(--spacing-3);
}
```



## Layout Utilities

### Container Utilities

```css
.container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
}

.container-sm {
  max-width: 640px;
}

.container-md {
  max-width: 768px;
}

.container-lg {
  max-width: 1024px;
}
```

### Flexbox Utilities

```css
.flex {
  display: flex;
}

.flex-row {
  flex-direction: row;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.items-end {
  align-items: flex-end;
}

.justify-start {
  justify-content: flex-start;
}

.justify-center {
  justify-content: center;
}

.justify-end {
  justify-content: flex-end;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}
```

### Grid Utilities

```css
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
```

### Display Utilities

```css
.block {
  display: block;
}

.inline-block {
  display: inline-block;
}

.inline {
  display: inline;
}

.hidden {
  display: none;
}

.visible {
  visibility: visible;
}

.invisible {
  visibility: hidden;
}
```

### Text Utilities

```css
.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-bold {
  font-weight: var(--font-weight-bold);
}

.text-semibold {
  font-weight: var(--font-weight-semibold);
}

.text-medium {
  font-weight: var(--font-weight-medium);
}

.text-primary {
  color: var(--color-text-primary);
}

.text-secondary {
  color: var(--color-text-secondary);
}

.text-error {
  color: var(--color-error);
}

.text-success {
  color: var(--color-success);
}

.text-warning {
  color: var(--color-warning);
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

**Requirement 1: Color System**
1.1-1.7: Color token definitions and accessibility
- Thoughts: These are CSS variable definitions that can be verified by checking computed styles and contrast ratios
- Testable: yes - example

**Requirement 2: Spacing System**
2.1-2.6: Spacing scale and utilities
- Thoughts: These are CSS definitions that can be verified by checking computed values
- Testable: yes - example

**Requirement 3: Typography System**
3.1-3.7: Font sizes, weights, and utilities
- Thoughts: These are CSS definitions that can be verified by checking computed styles
- Testable: yes - example

**Requirement 4: Component Base Styles**
4.1-4.7: Button, input, and form styles
- Thoughts: These are CSS class definitions that can be verified by checking applied styles
- Testable: yes - example

**Requirement 5: Layout Utilities**
5.1-5.6: Container and layout classes
- Thoughts: These are CSS utility classes that can be verified by checking computed layout
- Testable: yes - example

**Requirement 6: Shadow and Border Radius**
6.1-6.4: Shadow and border radius tokens
- Thoughts: These are CSS variable definitions that can be verified
- Testable: yes - example

**Requirement 7: Transition and Animation**
7.1-7.4: Transition timing and easing
- Thoughts: These are CSS definitions that can be verified, including reduced motion support
- Testable: yes - example

**Requirement 8: Z-Index System**
8.1-8.4: Layering tokens
- Thoughts: These are CSS variable definitions that can be verified for correct stacking
- Testable: yes - example

**Requirement 9: Responsive Breakpoints**
9.1-9.4: Breakpoint tokens and utilities
- Thoughts: These are CSS definitions that can be verified at different viewport sizes
- Testable: yes - example

**Requirement 10: Validation State Styles**
10.1-10.6: Error, warning, and success states
- Thoughts: These are CSS class definitions that can be verified by checking applied styles
- Testable: yes - example

### Property Reflection

After reviewing all properties, most are example-based tests since we're verifying specific CSS definitions exist and have correct values. However, we can create a few properties:

- **Color contrast property**: For any text/background combination, contrast ratio should meet WCAG AA
- **Spacing consistency property**: For any spacing utility class, the computed value should match the token
- **Focus indicator property**: For any interactive element, focus state should have visible outline

### Correctness Properties

**Property 1: Color contrast meets accessibility standards**
*For any* text color and background color combination used in the design system, the contrast ratio should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
**Validates: Requirements 1.6**

**Property 2: Spacing utilities apply correct values**
*For any* spacing utility class (margin or padding), the computed CSS value should exactly match the corresponding spacing token value.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

**Property 3: Interactive elements have visible focus indicators**
*For any* interactive element (button, input, checkbox, radio), when focused, the element should have a visible outline or border with sufficient contrast.
**Validates: Requirements 4.5**

**Property 4: Disabled elements have consistent styling**
*For any* interactive element in disabled state, the element should have reduced opacity and cursor set to not-allowed.
**Validates: Requirements 4.7**

**Property 5: Validation states apply correct colors**
*For any* form element with validation state (error, warning, success), the border color should match the corresponding semantic color token.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4**



## Testing Strategy

### Unit Testing

Unit tests verify that design tokens and styles are correctly defined:

**Token Definition Tests:**
- Verify all color tokens are defined with valid hex/rgb values
- Verify spacing scale follows consistent multiplier pattern
- Verify font size tokens are defined in rem units
- Verify shadow tokens have valid CSS shadow syntax
- Verify z-index tokens follow ascending order

**Style Application Tests:**
- Verify button classes apply correct background colors
- Verify input classes apply correct border styles
- Verify utility classes apply correct spacing values
- Verify validation state classes apply correct colors
- Verify focus states apply visible outlines

**Accessibility Tests:**
- Verify text/background color combinations meet WCAG AA contrast
- Verify focus indicators are visible (not outline: none without alternative)
- Verify disabled states are distinguishable
- Verify form labels are associated with inputs

**Testing Framework**: Vitest with JSDOM for CSS testing
**Test Location**: Co-located with style files using `.test.ts` suffix

### Visual Regression Testing

Visual tests verify that styles render correctly:

**Component Rendering:**
- Capture screenshots of button variants (primary, secondary, danger)
- Capture screenshots of form elements in different states
- Capture screenshots of cards with different elevations
- Compare against baseline images to detect unintended changes

**Responsive Testing:**
- Verify layout utilities work at different viewport sizes
- Verify breakpoint-based styles apply correctly
- Verify text remains readable at 200% zoom

**Testing Framework**: Playwright or Storybook with Chromatic
**Test Location**: Separate visual test suite

### Property-Based Testing

Property-based tests verify universal design system properties:

- **Framework**: fast-check
- **Minimum Iterations**: 50 per test
- **Tagging Format**: `**Feature: 1-ui-design-system, Property {number}: {property_text}**`

**Property Test Implementations:**

1. **Property 1**: Generate random text/background color pairs from design system, verify all meet WCAG AA contrast
2. **Property 2**: Generate random spacing utility classes, verify computed values match tokens
3. **Property 3**: Generate random interactive elements, verify all have visible focus indicators
4. **Property 4**: Generate random disabled elements, verify all have consistent disabled styling
5. **Property 5**: Generate random validation states, verify all apply correct semantic colors

### Manual Testing

Manual verification for subjective design qualities:

**Visual Harmony:**
- Verify color palette feels cohesive
- Verify spacing creates good visual rhythm
- Verify typography hierarchy is clear
- Verify shadows create appropriate depth

**Usability:**
- Verify buttons are easy to click
- Verify form inputs are easy to interact with
- Verify focus indicators are noticeable
- Verify error states are attention-grabbing

### Testing Priorities

1. **Accessibility**: Color contrast, focus indicators (highest priority)
2. **Token Definitions**: All tokens defined correctly
3. **Component Styles**: Base styles apply correctly
4. **Utilities**: Spacing and layout utilities work
5. **Visual Regression**: Styles render consistently



## Implementation Notes

### CSS Architecture

**Import Order:**
```css
/* index.css */
@import './tokens/colors.css';
@import './tokens/spacing.css';
@import './tokens/typography.css';
@import './tokens/shadows.css';
@import './tokens/borders.css';
@import './tokens/transitions.css';
@import './tokens/z-index.css';

@import './base/reset.css';
@import './base/typography.css';
@import './base/buttons.css';
@import './base/forms.css';

@import './utilities/spacing.css';
@import './utilities/layout.css';
@import './utilities/text.css';
@import './utilities/display.css';
```

**Design Rationale:**
- Tokens first so they're available for base styles
- Base styles before utilities so utilities can override
- Each file is focused and maintainable

### Performance Considerations

**CSS Custom Properties:**
- Use CSS variables for runtime theming capability
- Minimal performance impact (native browser feature)
- Fallback values not needed for modern browsers

**Utility Classes:**
- Generate only commonly-used utilities to keep CSS size small
- Consider PurgeCSS for production builds
- Avoid generating every possible combination

**File Size:**
- Estimated total CSS: 15-20KB uncompressed
- Gzip compression reduces to ~5KB
- Acceptable for web application

### Browser Support

**Target Browsers:**
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

**CSS Features Used:**
- CSS Custom Properties (widely supported)
- Flexbox and Grid (widely supported)
- Focus-visible (progressive enhancement)

**Fallbacks:**
- No fallbacks needed for target browsers
- Graceful degradation for older browsers

### Accessibility Compliance

**WCAG AA Requirements:**
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: Visible and high contrast
- Form labels: Associated with inputs
- Error messages: Clear and descriptive

**Testing Tools:**
- axe DevTools for automated accessibility testing
- Manual keyboard navigation testing
- Screen reader testing (NVDA/JAWS)

### Maintenance Guidelines

**Adding New Tokens:**
1. Add token to appropriate file in `tokens/` directory
2. Document token purpose and usage
3. Update tests to verify token exists
4. Use semantic naming (purpose, not appearance)

**Modifying Existing Tokens:**
1. Check for usage across codebase
2. Update token value
3. Verify visual regression tests pass
4. Update documentation if needed

**Adding New Utilities:**
1. Add utility class to appropriate file in `utilities/` directory
2. Follow existing naming conventions
3. Add tests for new utility
4. Document usage examples

### Future Enhancements

**Dark Mode:**
- Add dark mode color tokens
- Use `prefers-color-scheme` media query
- Override color tokens for dark theme
- Maintain same contrast ratios

**Custom Themes:**
- Allow overriding tokens via CSS variables
- Provide theme configuration API
- Support multiple theme presets

**Animation Library:**
- Add keyframe animations for common patterns
- Fade, slide, scale, rotate animations
- Respect `prefers-reduced-motion`

**Icon System:**
- Add icon sizing tokens
- Define icon color utilities
- Support SVG sprite or icon font

## Conclusion

This design system provides a solid foundation for building consistent, accessible, and maintainable user interfaces. By centralizing design decisions into reusable tokens and utilities, we ensure visual consistency while enabling easy updates and theming in the future.

The token-based approach allows all other UI specs to reference these design decisions without duplicating code, reducing maintenance burden and ensuring consistency across the entire application.
