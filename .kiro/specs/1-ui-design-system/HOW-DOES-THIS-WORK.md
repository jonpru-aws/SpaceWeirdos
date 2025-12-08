# How Does This Work? UI Design System

## Overview

The UI Design System is a foundational CSS-based design system that provides consistent visual styling across the Space Weirdos Warband Builder application. It uses CSS custom properties (CSS variables) to define reusable design tokens and provides utility classes for rapid UI development.

**Key Characteristics:**
- Pure CSS implementation (no JavaScript overhead)
- Token-based architecture using CSS custom properties
- Utility-first approach with semantic base styles
- Accessibility-compliant (WCAG AA)
- Responsive and mobile-friendly
- ~15-20KB uncompressed CSS

## Architecture

### High-Level Structure

```
Design System
├── Design Tokens (CSS Custom Properties)
│   ├── Colors (primary, neutral, semantic)
│   ├── Spacing (scale from 0-16)
│   ├── Typography (sizes, weights, line heights)
│   ├── Shadows (elevation levels)
│   ├── Borders (radius, widths)
│   ├── Transitions (durations, easing)
│   ├── Z-Index (layering)
│   └── Breakpoints (responsive)
├── Base Styles (Component defaults)
│   ├── Reset/Normalize
│   ├── Buttons
│   ├── Forms
│   ├── Labels
│   └── Cards
└── Utility Classes (Single-purpose helpers)
    ├── Spacing (margin, padding, gap)
    ├── Layout (flexbox, grid, containers)
    ├── Display (block, inline, hidden)
    ├── Text (alignment, color, weight)
    └── Typography (heading styles)
```

### File Organization

```
src/frontend/styles/
├── index.css                    # Main entry point (imports all files)
├── tokens/                      # Design token definitions
│   ├── colors.css              # Color palette and semantic colors
│   ├── spacing.css             # Spacing scale (0-16)
│   ├── typography.css          # Font sizes, weights, line heights
│   ├── shadows.css             # Shadow tokens for elevation
│   ├── borders.css             # Border radius and widths
│   ├── transitions.css         # Animation timing and easing
│   ├── z-index.css             # Layering tokens
│   └── breakpoints.css         # Responsive breakpoints
├── base/                        # Component base styles
│   ├── reset.css               # CSS reset/normalize
│   ├── buttons.css             # Button variants
│   ├── forms.css               # Input, select, textarea
│   ├── labels.css              # Labels and fieldsets
│   └── cards.css               # Card component
└── utilities/                   # Utility classes
    ├── spacing.css             # Margin, padding, gap utilities
    ├── layout.css              # Flexbox, grid, containers
    ├── display.css             # Display and visibility
    ├── text.css                # Text alignment and color
    └── typography.css          # Typography utilities
```

## Technical Implementation

### 1. Design Tokens (CSS Custom Properties)

Design tokens are defined as CSS custom properties in the `:root` selector, making them globally available throughout the application.

**Example: Color Tokens**
```css
:root {
  /* Primary Colors */
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  
  /* Semantic Colors */
  --color-success: #16a34a;
  --color-error: #dc2626;
  
  /* Text Colors */
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-500);
}
```

**Example: Spacing Tokens**
```css
:root {
  /* Base unit: 0.25rem (4px) */
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-8: 2rem;      /* 32px */
  
  /* Semantic spacing */
  --spacing-xs: var(--spacing-1);
  --spacing-sm: var(--spacing-2);
  --spacing-md: var(--spacing-4);
}
```

**Why CSS Custom Properties?**
- Runtime theming capability (can be changed dynamically)
- No build step required
- Native browser feature (excellent performance)
- Cascade and inheritance work naturally
- Easy to override for specific contexts

### 2. Base Component Styles

Base styles provide default styling for common HTML elements and component patterns.

**Example: Button Base Styles**
```css
.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-base);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast) var(--easing-in-out);
}

.btn-primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-600);
}
```

**Key Features:**
- Uses design tokens for all values
- Includes interactive states (hover, focus, active, disabled)
- Accessible focus indicators
- Consistent transitions

### 3. Utility Classes

Utility classes provide single-purpose styling that can be composed to build UIs quickly.

**Example: Spacing Utilities**
```css
/* Margin utilities */
.m-2 { margin: var(--spacing-2); }
.mt-4 { margin-top: var(--spacing-4); }
.mx-6 { margin-left: var(--spacing-6); margin-right: var(--spacing-6); }

/* Padding utilities */
.p-4 { padding: var(--spacing-4); }
.px-2 { padding-left: var(--spacing-2); padding-right: var(--spacing-2); }

/* Gap utilities */
.gap-4 { gap: var(--spacing-4); }
```

**Example: Layout Utilities**
```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-4 { gap: var(--spacing-4); }
```

**Usage in Components:**
```tsx
<div className="flex items-center gap-4 p-4">
  <button className="btn btn-primary">Save</button>
  <button className="btn btn-secondary">Cancel</button>
</div>
```

### 4. Import Order and Cascade

The import order in `index.css` is critical for proper CSS cascade:

```css
/* 1. Tokens first - defines CSS variables */
@import './tokens/colors.css';
@import './tokens/spacing.css';
/* ... other tokens */

/* 2. Base styles - uses tokens */
@import './base/reset.css';
@import './base/buttons.css';
/* ... other base styles */

/* 3. Utilities last - can override base styles */
@import './utilities/spacing.css';
@import './utilities/layout.css';
/* ... other utilities */
```

**Why This Order?**
1. **Tokens first**: CSS variables must be defined before they're used
2. **Base styles second**: Provides default component styling
3. **Utilities last**: Single-purpose classes can override base styles

### 5. Accessibility Features

**Focus Indicators:**
```css
.btn:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

**Reduced Motion Support:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Color Contrast:**
- All text/background combinations meet WCAG AA standards
- Primary text on white: 4.5:1 minimum
- Large text: 3:1 minimum

## Dependencies

### Runtime Dependencies
- **None** - Pure CSS, no JavaScript required
- Works with any modern browser supporting CSS custom properties

### Build Dependencies
- **Vite**: Bundles and processes CSS files
- **PostCSS** (optional): Can be added for autoprefixer or other transformations

### Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- CSS Custom Properties support required (IE11 not supported)

## Integration and Usage

### 1. Application Integration

The design system is imported in the main application entry point:

```tsx
// src/frontend/main.tsx
import './styles/index.css';  // Design system
import './index.css';         // App-specific styles
```

### 2. Using Design Tokens in Custom CSS

```css
.custom-component {
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}
```

### 3. Using Base Styles in Components

```tsx
function MyComponent() {
  return (
    <div className="card">
      <h2 className="card-title">Title</h2>
      <div className="card-body">
        <button className="btn btn-primary">Action</button>
      </div>
    </div>
  );
}
```

### 4. Using Utility Classes

```tsx
function MyComponent() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-h1 text-primary">Heading</h1>
      <p className="text-body text-secondary">Description</p>
      <div className="flex justify-between items-center mt-4">
        <button className="btn btn-primary">Save</button>
        <button className="btn btn-secondary">Cancel</button>
      </div>
    </div>
  );
}
```

### 5. Combining Approaches

```tsx
function WarbandCard({ warband }) {
  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-h3">{warband.name}</h3>
        <span className="text-small text-secondary">
          {warband.points} pts
        </span>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary">Edit</button>
        <button className="btn btn-danger">Delete</button>
      </div>
    </div>
  );
}
```

## Execution Flow

### 1. Build Time

```
1. Vite processes src/frontend/main.tsx
2. Encounters import './styles/index.css'
3. Processes index.css and all @import statements
4. Bundles all CSS into single file
5. Outputs to dist/assets/index-[hash].css
```

### 2. Runtime (Browser)

```
1. Browser loads HTML
2. Parses CSS and creates CSSOM
3. Evaluates :root selector, defines CSS custom properties
4. Applies base styles to elements
5. Applies utility classes where used
6. Renders page with computed styles
```

### 3. Style Application Order

```
1. Browser default styles
2. CSS reset (removes/normalizes defaults)
3. Design tokens (defines variables)
4. Base component styles (default styling)
5. Utility classes (overrides)
6. Inline styles (highest specificity)
```

## Testing Strategy

### Unit Tests

Tests verify that design tokens and styles are correctly defined:

```typescript
// tests/ColorTokens.test.ts
describe('Color Tokens', () => {
  it('should define all primary color tokens', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    
    expect(styles.getPropertyValue('--color-primary-500')).toBe('#3b82f6');
    expect(styles.getPropertyValue('--color-error')).toBe('#dc2626');
  });
});
```

```typescript
// tests/SpacingUtilities.test.ts
describe('Spacing Utilities', () => {
  it('should apply correct margin values', () => {
    const element = document.createElement('div');
    element.className = 'mt-4';
    document.body.appendChild(element);
    
    const styles = getComputedStyle(element);
    expect(styles.marginTop).toBe('16px'); // 1rem = 16px
  });
});
```

### Property-Based Tests

Tests verify universal properties across the design system:

```typescript
// tests/CostBadgeProperty.test.tsx
describe('Property: Spacing utilities apply correct values', () => {
  it('should apply spacing tokens correctly for any utility class', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('m', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'),
        fc.constantFrom('0', '1', '2', '3', '4', '6', '8'),
        (prefix, size) => {
          const element = document.createElement('div');
          element.className = `${prefix}-${size}`;
          document.body.appendChild(element);
          
          const styles = getComputedStyle(element);
          const expectedValue = getSpacingValue(size);
          
          // Verify computed value matches token
          // ... assertion logic
        }
      ),
      { numRuns: 50 }
    );
  });
});
```

### Visual Regression Tests

Tests verify that styles render correctly:

```typescript
// tests/DesignSystemIntegration.test.ts
describe('Design System Integration', () => {
  it('should render button variants correctly', () => {
    render(
      <div>
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-danger">Danger</button>
      </div>
    );
    
    // Visual assertions or screenshot comparison
  });
});
```

## Performance Characteristics

### CSS File Size
- **Uncompressed**: ~15-20KB
- **Gzipped**: ~5KB
- **Brotli**: ~4KB

### Load Time Impact
- **First Load**: ~10-20ms to parse CSS
- **Subsequent Loads**: Cached by browser
- **Runtime**: Zero JavaScript overhead

### Rendering Performance
- **CSS Custom Properties**: Native browser feature, excellent performance
- **Utility Classes**: No runtime computation, pure CSS
- **Transitions**: Hardware-accelerated where possible

## Common Patterns and Best Practices

### 1. Prefer Utility Classes for Layout

```tsx
// Good: Composable utilities
<div className="flex items-center gap-4 p-4">

// Avoid: Custom CSS for simple layouts
<div className="custom-flex-container">
```

### 2. Use Base Styles for Components

```tsx
// Good: Semantic component classes
<button className="btn btn-primary">

// Avoid: Utility-only buttons (harder to maintain)
<button className="px-4 py-2 bg-blue-500 text-white rounded">
```

### 3. Reference Tokens in Custom CSS

```css
/* Good: Uses design tokens */
.custom-component {
  color: var(--color-text-primary);
  padding: var(--spacing-4);
}

/* Avoid: Hard-coded values */
.custom-component {
  color: #111827;
  padding: 16px;
}
```

### 4. Combine Approaches Appropriately

```tsx
// Good: Base class + utility modifiers
<div className="card p-6 mb-4">

// Good: Utilities for one-off layouts
<div className="flex justify-between items-center">
```

## Maintenance and Extension

### Adding New Tokens

1. Add token to appropriate file in `tokens/` directory
2. Use semantic naming (purpose, not appearance)
3. Update tests to verify token exists
4. Document in DESIGN_SYSTEM.md

```css
/* tokens/colors.css */
:root {
  --color-accent: #8b5cf6;  /* New accent color */
}
```

### Adding New Utilities

1. Add utility class to appropriate file in `utilities/` directory
2. Follow existing naming conventions
3. Add tests for new utility
4. Document usage

```css
/* utilities/spacing.css */
.gap-20 { gap: var(--spacing-20); }
```

### Modifying Existing Tokens

1. Check for usage across codebase (search for token name)
2. Update token value
3. Run visual regression tests
4. Update documentation

## Future Enhancements

### Dark Mode Support
- Add dark mode color tokens
- Use `prefers-color-scheme` media query
- Override color tokens for dark theme

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-base: #111827;
    --color-text-primary: #f9fafb;
  }
}
```

### Custom Themes
- Allow overriding tokens via CSS variables
- Provide theme configuration API
- Support multiple theme presets

### Animation Library
- Add keyframe animations for common patterns
- Fade, slide, scale, rotate animations
- Respect `prefers-reduced-motion`

## Troubleshooting

### Styles Not Applying

**Problem**: Utility classes or base styles not working

**Solutions**:
1. Verify `index.css` is imported in `main.tsx`
2. Check browser DevTools for CSS loading errors
3. Verify class names are spelled correctly
4. Check CSS specificity (inline styles override everything)

### Token Values Not Updating

**Problem**: Changing token value doesn't affect components

**Solutions**:
1. Clear browser cache and hard reload
2. Verify token is defined in `:root` selector
3. Check if value is being overridden elsewhere
4. Restart development server

### Focus Indicators Not Visible

**Problem**: Focus outlines not showing on interactive elements

**Solutions**:
1. Check if `:focus-visible` is supported (modern browsers only)
2. Verify focus styles aren't being overridden
3. Test with keyboard navigation (Tab key)
4. Check if `outline: none` is being applied elsewhere

## Conclusion

The UI Design System provides a solid, maintainable foundation for building consistent user interfaces. By centralizing design decisions into reusable tokens and providing both base styles and utility classes, it enables rapid development while ensuring visual consistency and accessibility compliance.

The pure CSS approach ensures excellent performance with zero JavaScript overhead, while CSS custom properties enable future theming capabilities without requiring a rebuild.
