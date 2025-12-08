# UI Design System Spec

## Overview

This spec defines the foundational design system for the Space Weirdos Warband Builder. It establishes the visual design language including colors, typography, spacing, and reusable component styles.

## Core Spec Files

- **[requirements.md](requirements.md)** - EARS-compliant requirements with acceptance criteria
- **[design.md](design.md)** - Design tokens, component styles, and correctness properties
- **[tasks.md](tasks.md)** - Implementation task list (✅ Complete)

## Documentation

For detailed implementation documentation, see:

- **[UI Design System Guide](../../../docs/UI-DESIGN-SYSTEM.md)** - Complete technical implementation guide
  - Architecture and file organization
  - Design tokens (CSS custom properties)
  - Base component styles
  - Utility classes
  - Integration and usage patterns
  - Testing strategy
  - Performance characteristics
  - Troubleshooting guide

## Status

✅ **Complete** - All tasks implemented and tested

### Key Deliverables

- Design token system using CSS custom properties
- Color palette with semantic naming
- Spacing scale (0-16) with utilities
- Typography system with type scale
- Button, form, and card base styles
- Layout utilities (flexbox, grid, containers)
- Accessibility compliance (WCAG AA)
- Responsive breakpoints

### Implementation Location

```
src/frontend/styles/
├── index.css                    # Main entry point
├── tokens/                      # Design tokens
│   ├── colors.css
│   ├── spacing.css
│   ├── typography.css
│   └── ...
├── base/                        # Component base styles
│   ├── buttons.css
│   ├── forms.css
│   └── ...
└── utilities/                   # Utility classes
    ├── spacing.css
    ├── layout.css
    └── ...
```

## Quick Start

### Using Design Tokens

```css
.custom-component {
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
}
```

### Using Base Styles

```tsx
<button className="btn btn-primary">Save</button>
<input className="input" type="text" />
<div className="card">...</div>
```

### Using Utility Classes

```tsx
<div className="flex items-center gap-4 p-4">
  <h1 className="text-h1">Title</h1>
  <p className="text-body text-secondary">Description</p>
</div>
```

## Related Specs

This design system is used by all other UI specs:
- Spec 2: Warband List & Navigation
- Spec 3: Warband Properties Editor
- Spec 4: Weirdo Editor
- Spec 5: Real-time Feedback Polish

## Testing

- **Unit Tests**: Token definitions and style application
- **Property-Based Tests**: Universal design system properties
- **Visual Regression Tests**: Component rendering consistency
- **Accessibility Tests**: WCAG AA compliance

See [UI Design System Guide](../../../docs/UI-DESIGN-SYSTEM.md#testing-strategy) for complete testing documentation.
