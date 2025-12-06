# Design Document

## Overview

This design outlines the refactoring strategy for improving code quality in the Space Weirdos Warband Builder. The refactoring focuses on reducing duplication, improving type safety, optimizing performance, and enhancing maintainability while preserving all existing functionality.

## Architecture

### Current Architecture
- Backend: Express.js with TypeScript services (ValidationService, CostEngine, WarbandService, DataRepository)
- Frontend: React with TypeScript components (WarbandEditor, WeirdoEditor)
- Data Flow: Props-based state management with API calls

### Refactored Architecture
- Backend: Same structure with improved patterns (Strategy pattern for costs, factory pattern for validators)
- Frontend: Component composition with Context API for shared state
- Data Flow: Context-based for global data, props for component-specific data

## Components and Interfaces

### Backend Refactoring

#### 1. ValidationService Improvements

```typescript
// Generic validator factory
interface ValidatorFactory {
  createValidator<T>(
    field: string,
    condition: (value: T) => boolean,
    message: string,
    code: ValidationErrorCode
  ): (value: T) => ValidationError | null;
}

// Attribute validator using iteration
interface AttributeValidator {
  validateAll(weirdo: Weirdo): ValidationError | null;
}
```

#### 2. CostEngine Improvements

```typescript
// Cost modifier strategy
interface CostModifierStrategy {
  applyWeaponDiscount(weapon: Weapon): number;
  applyEquipmentDiscount(equipment: Equipment): number;
  applyAttributeDiscount(attribute: AttributeType, level: AttributeLevel): number;
}

// Ability-specific strategies
class MutantsCostStrategy implements CostModifierStrategy { }
class HeavilyArmedCostStrategy implements CostModifierStrategy { }
class SoldiersCostStrategy implements CostModifierStrategy { }
```

#### 3. Constants Module

```typescript
// src/backend/constants/costs.ts
export const COST_CONSTANTS = {
  MUTANT_DISCOUNT: 1,
  HEAVILY_ARMED_DISCOUNT: 1,
  MUTANT_WEAPONS: ['Claws & Teeth', 'Horrible Claws & Teeth', 'Whip/Tail'],
  SOLDIER_FREE_EQUIPMENT: ['Grenade', 'Heavy Armor', 'Medkit'],
  POINT_LIMIT_WARNING_THRESHOLD: 0.9,
  TROOPER_STANDARD_LIMIT: 20,
  TROOPER_MAXIMUM_LIMIT: 25,
} as const;

// src/backend/constants/validationMessages.ts
export const VALIDATION_MESSAGES = {
  WARBAND_NAME_REQUIRED: 'Warband name is required',
  WEIRDO_NAME_REQUIRED: 'Weirdo name is required',
  INVALID_POINT_LIMIT: 'Point limit must be 75 or 125',
  ATTRIBUTES_INCOMPLETE: 'All five attributes must be selected',
  CLOSE_COMBAT_WEAPON_REQUIRED: 'At least one close combat weapon is required',
  RANGED_WEAPON_REQUIRED: 'Ranged weapon required when Firepower is 2d8 or 2d10',
  FIREPOWER_REQUIRED_FOR_RANGED_WEAPON: 'Firepower level 2d8 or 2d10 required to use ranged weapons',
  EQUIPMENT_LIMIT_EXCEEDED: 'Equipment limit exceeded',
  TROOPER_POINT_LIMIT_EXCEEDED: 'Trooper cost exceeds point limit',
  MULTIPLE_25_POINT_WEIRDOS: 'Only one weirdo may cost 21-25 points',
  WARBAND_POINT_LIMIT_EXCEEDED: 'Warband total cost exceeds point limit',
  LEADER_TRAIT_INVALID: 'Leader trait can only be assigned to leaders',
} as const;

export type ValidationErrorCode = keyof typeof VALIDATION_MESSAGES;

// Helper function to get formatted error messages with dynamic values
export function getValidationMessage(
  code: ValidationErrorCode,
  params?: Record<string, string | number>
): string {
  let message = VALIDATION_MESSAGES[code];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
  }
  
  return message;
}
```

### Frontend Refactoring

#### 1. Component Decomposition

```typescript
// WarbandEditor split into:
- WarbandEditor (orchestrator)
  - WarbandProperties (name, ability, point limit)
  - WarbandCostDisplay (cost tracking and warnings)
  - WeirdosList (list of weirdos)
    - WeirdoCard (individual weirdo display)
  - ValidationErrorDisplay (error messages)

// WeirdoEditor split into:
- WeirdoEditor (orchestrator)
  - WeirdoBasicInfo (name, type)
  - WeirdoCostDisplay (cost tracking)
  - AttributeSelector (all 5 attributes)
  - WeaponSelector (close combat and ranged)
  - EquipmentSelector (equipment list)
  - PsychicPowerSelector (psychic powers)
  - LeaderTraitSelector (leader trait)
```

#### 2. Reusable Components

```typescript
// SelectWithCost component
interface SelectWithCostProps {
  id: string;
  label: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
    baseCost: number;
    modifiedCost?: number;
  }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// ItemList component
interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onRemove: (item: T) => void;
  emptyMessage: string;
}

// ValidationErrorDisplay component
interface ValidationErrorDisplayProps {
  errors: ValidationError[];
  filterByField?: string;
}
```

#### 3. Context Providers

```typescript
// GameDataContext
interface GameData {
  closeCombatWeapons: Weapon[];
  rangedWeapons: Weapon[];
  equipment: Equipment[];
  psychicPowers: PsychicPower[];
  leaderTraits: LeaderTrait[];
  warbandAbilities: WarbandAbility[];
}

interface GameDataContextValue {
  data: GameData | null;
  loading: boolean;
  error: Error | null;
}

// WarbandContext
interface WarbandContextValue {
  warband: Warband;
  updateWarband: (updates: Partial<Warband>) => Promise<void>;
  addWeirdo: (type: 'leader' | 'trooper') => Promise<void>;
  removeWeirdo: (id: string) => Promise<void>;
  updateWeirdo: (id: string, updates: Partial<Weirdo>) => Promise<void>;
}
```

## Data Models

No changes to existing data models. All refactoring maintains the current type definitions in `types.ts`.

## Missing UI Features (Pre-existing Issues)

The following UI features are tested but not yet implemented. These are pre-existing gaps that need to be addressed:

### 1. Validation Error Display in WeirdoEditor

**Current State:** Validation errors are returned from the API but not displayed in the UI.

**Required Implementation:**
- Add a ValidationErrorDisplay component to WeirdoEditor
- Display validation errors below the relevant form sections
- Show specific error messages like "At least one close combat weapon required"
- Update errors in real-time as user makes changes

**Component Structure:**
```typescript
// Add to WeirdoEditor
<ValidationErrorDisplay 
  errors={validationErrors}
  filterByField={currentField}
/>
```

### 2. Cost Warning and Limit Display

**Current State:** Cost is displayed but warnings/errors for approaching or exceeding limits are not shown.

**Required Implementation:**
- Enhance WeirdoCostDisplay component to show warning states
- Display "Approaching limit" when trooper cost is 18-19 points
- Display "Exceeds 20 point limit" error when trooper cost > 20 points
- Use distinct visual styling (warning vs error colors)

**Component Enhancement:**
```typescript
interface WeirdoCostDisplayProps {
  cost: number;
  type: 'leader' | 'trooper';
  showWarnings?: boolean;
}

// Logic:
// - If trooper and cost >= 18 && cost <= 20: show warning
// - If trooper and cost > 20: show error
```

### 3. Leader Trait Description Display

**Current State:** Leader traits can be selected but descriptions are not shown.

**Required Implementation:**
- Add description display area in LeaderTraitSelector component
- Fetch trait descriptions from GameDataContext
- Display trait description when a trait is selected
- Clear description when no trait is selected

**Component Enhancement:**
```typescript
// Add to LeaderTraitSelector
{selectedTrait && (
  <div className="trait-description">
    {gameData.leaderTraits.find(t => t.name === selectedTrait)?.description}
  </div>
)}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Refactoring preserves validation behavior
*For any* warband and weirdo combination, validation results before and after refactoring should be identical
**Validates: Requirements 1.4**

### Property 2: Refactoring preserves cost calculation
*For any* weirdo with any warband ability, cost calculations before and after refactoring should be identical
**Validates: Requirements 3.4**

### Property 3: Component splitting renders all warband data correctly
*For any* valid warband with any combination of name, ability, point limit, total cost, and weirdos, the refactored WarbandEditor component should correctly render all warband properties, cost display, and weirdos list
**Validates: Requirements 4.3**

### Property 4: Context introduction preserves data flow
*For any* state update, the data flow before and after Context introduction should produce identical results
**Validates: Requirements 11.4**

### Property 5: Performance optimizations preserve functionality
*For any* component render, the output before and after performance optimizations should be identical
**Validates: Requirements 9.4**

### Property 6: Centralized error messages maintain consistency
*For any* validation error code, all references to that error code across the codebase should produce the same base error message
**Validates: Requirements 2.5, 2.6, 8.5**

### Property 7: Validation errors are displayed in UI
*For any* weirdo with validation errors, the WeirdoEditor should display all error messages from the validation response
**Validates: Requirements 13.1, 13.2, 13.4**

### Property 8: Cost warnings display correctly
*For any* trooper with cost between 18-20 points, the WeirdoCostDisplay should show "Approaching limit" warning, and for any trooper with cost > 20 points, it should show "Exceeds 20 point limit" error
**Validates: Requirements 14.1, 14.2, 14.4**

### Property 9: Leader trait descriptions are shown
*For any* selected leader trait, the LeaderTraitSelector should display the corresponding trait description from game data
**Validates: Requirements 15.1, 15.2, 15.4**

### Property 10: Equipment limits are calculated correctly
*For any* weirdo type and warband ability combination, the equipment limit should be: 2 for troopers with Cyborgs ability, 1 for troopers with other abilities, 3 for leaders with Cyborgs ability, and 2 for leaders with any other ability
**Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5**

## Error Handling

### Custom Error Classes

```typescript
// src/backend/errors/AppError.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: ValidationErrorCode | string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: ValidationErrorCode, context?: Record<string, any>) {
    super(message, code, 400, context);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404, { resource, id });
    this.name = 'NotFoundError';
  }
}
```

### Error Handling Strategy

1. Backend services throw typed errors
2. API routes catch and format errors consistently
3. Frontend displays user-friendly error messages
4. All errors are logged with context

## Testing Strategy

### Unit Testing
- Test each refactored function independently
- Verify behavior matches original implementation
- Test edge cases and error conditions
- Use existing test data for consistency

### Property-Based Testing
- Use fast-check library (minimum 50 iterations)
- Generate random warbands and weirdos
- Compare refactored vs original behavior
- Verify all correctness properties

### Integration Testing
- Test component interactions after splitting
- Verify Context providers work correctly
- Test data flow through new architecture
- Ensure UI behavior is unchanged

### Regression Testing
- Run all existing tests after each refactoring step
- Verify no functionality is broken
- Check performance metrics
- Validate error handling

## Implementation Strategy

### Phase 1: Backend Refactoring
1. Extract constants
2. Refactor ValidationService
3. Refactor CostEngine
4. Add error classes
5. Run all tests

### Phase 2: Frontend Infrastructure
1. Create GameDataContext
2. Create WarbandContext
3. Create reusable components
4. Run all tests

### Phase 3: Component Refactoring
1. Split WarbandEditor
2. Split WeirdoEditor
3. Add performance optimizations
4. Run all tests

### Phase 4: Type Safety & Documentation
1. Improve type definitions
2. Add JSDoc comments
3. Update documentation
4. Final testing

## Migration Path

All refactoring will be done incrementally:
1. Create new implementations alongside old ones
2. Test new implementations thoroughly
3. Switch to new implementations
4. Remove old implementations
5. Verify no regressions

This ensures the application remains functional throughout the refactoring process.
