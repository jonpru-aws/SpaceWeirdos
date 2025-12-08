# Design Document: Real-time Feedback & Polish

## Overview

This design document specifies the real-time feedback and polish features that enhance the user experience. The system provides immediate cost calculations, warning indicators, sticky displays, validation feedback, and cost breakdowns.

**Key Design Goals:**
- Real-time cost updates within 100ms
- Clear warning and error indicators
- Sticky cost displays that don't obscure content
- Helpful validation tooltips
- Detailed cost breakdowns
- Smooth animations and transitions

**Dependencies:**
- Spec 1: UI Design System
- Spec 2: Warband List & Navigation
- Spec 3: Warband Properties Editor
- Spec 4: Weirdo Editor
- Game Rules Spec (backend API for cost calculations and validation)

## Components

### WarbandCostDisplay
Shows total warband cost with sticky positioning and warning/error indicators.

```typescript
interface WarbandCostDisplayProps {
  totalCost: number;
  pointLimit: number;
  isApproachingLimit: boolean;
  isOverLimit: boolean;
}
```

### WeirdoCostDisplay
Shows individual weirdo cost with sticky positioning, warning/error indicators, and expandable breakdown.

```typescript
interface WeirdoCostDisplayProps {
  cost: number;
  breakdown: CostBreakdown;
  limit: number;
  isApproachingLimit: boolean;
  isOverLimit: boolean;
}

interface CostBreakdown {
  attributes: number;
  weapons: number;
  equipment: number;
  psychicPowers: number;
  leaderTrait: number;
}
```

### CostBadge
Displays base cost and modified cost with strikethrough styling.

```typescript
interface CostBadgeProps {
  baseCost: number;
  modifiedCost?: number;
  showModifier?: boolean;
}
```

### ValidationErrorDisplay
Shows validation errors with tooltips.

```typescript
interface ValidationErrorDisplayProps {
  errors: ValidationError[];
  inline?: boolean;
}
```

## Correctness Properties

**Property 1: Real-time cost synchronization**
*For any* change to weirdo attributes, weapons, equipment, or psychic powers, the displayed weirdo cost and warband total cost should update within 100 milliseconds.
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

**Property 2: Cost warning indicators appear correctly**
*For any* weirdo or warband, when the cost approaches the limit, a warning indicator should be displayed; when the cost exceeds the limit, an error indicator should be displayed.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

**Property 3: Modified costs are visually indicated**
*For any* weapon or equipment with a warband ability modifier applied, the display should show both the base cost and modified cost with strikethrough styling on the base cost.
**Validates: Requirements 1.5**

**Property 4: Sticky cost displays remain visible during scroll**
*For any* scroll position within the weirdo editor or warband editor, the respective cost display should remain visible at the top without obscuring controls.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

**Property 5: Validation errors are visually highlighted**
*For any* weirdo with validation errors, the weirdo card should have error styling applied, and hovering should display a tooltip containing all validation error messages.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

## Testing Strategy

- Unit tests for cost displays and indicators
- Property-based tests for cost synchronization and warning thresholds
- Visual regression tests for sticky positioning
- Performance tests for cost calculation timing
- Accessibility tests for tooltips and indicators

## API Endpoints

**Backend must expose these RESTful endpoints:**

```
POST   /api/cost/calculate                - Calculate costs with breakdown
POST   /api/validation/warband            - Validate complete warband
POST   /api/validation/weirdo             - Validate individual weirdo
```

**Real-time Cost Calculation:**
```typescript
// Request (debounced to 100ms)
POST /api/cost/calculate
{
  weirdoType: 'leader' | 'trooper',
  attributes: AttributeSet,
  weapons: string[],
  equipment: string[],
  psychicPowers: string[],
  warbandAbility: string | null
}

// Response (must return within 100ms)
{
  success: true,
  data: {
    totalCost: number,
    breakdown: {
      attributes: number,
      weapons: number,
      equipment: number,
      psychicPowers: number
    },
    warnings: string[],
    isApproachingLimit: boolean,
    isOverLimit: boolean
  }
}
```

## Implementation Notes

### API Communication

- **Frontend**: Use `apiClient` for all HTTP requests
- **Frontend**: NEVER directly import CostEngine or ValidationService
- **Frontend**: Debounce API calls to 100ms to reduce network traffic
- **Backend**: Optimize cost calculation endpoints for < 100ms response time
- **Backend**: Return cost breakdowns and warning indicators

### Performance Optimization
- Debounce cost calculation API calls to 100ms
- Use React.memo for expensive components
- Memoize computed values (costs, validation results)
- Use CSS containment for sticky elements
- Cache validation results when weirdo hasn't changed
- Batch multiple cost calculations when possible

### CSS Strategy
```css
.cost-display-sticky {
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
}

.cost-display-warning {
  border-color: var(--color-warning);
}

.cost-display-error {
  border-color: var(--color-error);
}
```

### Animation
- Use CSS transitions for smooth state changes
- Respect prefers-reduced-motion
- Animate cost breakdown expand/collapse

## Conclusion

This spec adds the polish and real-time feedback that makes the application feel responsive and professional. It completes the UI implementation with performance optimizations and helpful visual cues.
