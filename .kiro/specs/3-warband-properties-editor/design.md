# Design Document: Warband Properties Editor

## Overview

This design document specifies the warband properties editing interface. The system provides form controls for editing warband name, point limit, and ability, with real-time validation and clear visual organization.

**Key Design Goals:**
- Intuitive form controls for warband properties
- Real-time validation feedback
- Clear visual organization
- Integration with cost calculation system

**Dependencies:**
- Spec 1: UI Design System
- Spec 2: Warband List & Navigation (WarbandContext)
- Game Rules Spec (ValidationService, warband abilities data)

## Components

### WarbandEditor (Shell)
Container for entire editor with three sections: properties, weirdo list, weirdo editor.

### WarbandProperties
Form for editing warband-level settings.

```typescript
interface WarbandPropertiesProps {
  warband: Warband;
  onUpdate: (updates: Partial<Warband>) => void;
  validationErrors: ValidationError[];
}
```

### WarbandAbilitySelector
Dropdown for selecting warband ability with descriptions.

```typescript
interface WarbandAbilitySelectorProps {
  selected: string | null;
  abilities: WarbandAbility[];
  onChange: (ability: string | null) => void;
}
```

## Correctness Properties

**Property 1: Warband name validation prevents empty names**
*For any* warband, when the name is empty or whitespace-only, a validation error should be displayed.
**Validates: Requirements 1.3**

**Property 2: Point limit selection updates immediately**
*For any* point limit change, the warband point limit should update immediately and trigger cost recalculation.
**Validates: Requirements 2.2, 2.4**

**Property 3: Warband ability selection triggers cost recalculation**
*For any* warband ability change, all weirdo costs should be recalculated with the new ability modifiers.
**Validates: Requirements 3.4, 3.5**

**Property 4: Save validates before persisting**
*For any* save attempt, validation should run first; if validation fails, the warband should not be saved and errors should be displayed.
**Validates: Requirements 5.2, 5.3, 5.4**

## Testing Strategy

- Unit tests for form controls and validation
- Property-based tests for validation rules
- Integration tests for save flow
- Accessibility tests for form labels and focus management

## Implementation Notes

- Use design system form styles
- Integrate with WarbandContext from Spec 2
- Validate on blur for individual fields
- Full validation on save attempt
