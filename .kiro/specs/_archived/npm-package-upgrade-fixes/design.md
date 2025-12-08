# Design Document

## Overview

This design addresses systematic test failures that emerged after npm package upgrades in the Space Weirdos warband builder application. The failures indicate breaking changes in React Testing Library, TypeScript compiler strictness, and potentially Vitest test runner behavior. The solution focuses on fixing TypeScript compilation errors, updating component implementations to work with new package versions, correcting error handling patterns, and fixing test data generators.

The root causes fall into several categories:
1. **TypeScript Compilation**: Strict type checking revealing previously hidden type errors
2. **Component Rendering**: React components not rendering due to missing props or broken state management
3. **State Management**: WarbandContext methods not functioning correctly
4. **API Integration**: Cost breakdown API calls failing or not being mocked properly in tests
5. **Test Infrastructure**: Property-based test generators producing invalid data
6. **Error Handling**: Unsafe type assertions and improper error typing patterns

## Architecture

### Component Layer
- **WeirdoEditor**: Main editing interface for weirdo properties
- **WeirdosList**: List view with add/remove controls
- **WeirdoCostDisplay**: Cost display with expandable breakdown
- **WarbandEditor**: Warband-level editing and save/delete operations

### State Management Layer
- **WarbandContext**: Centralized state management using React Context API
- Manages warband data, selected weirdo, validation errors
- Provides CRUD operations for warbands and weirdos
- Handles debounced cost calculations and validation

### API Layer
- **apiClient**: HTTP client for backend communication
- Handles all data persistence, cost calculations, and validation
- Implements retry logic and error handling
- Type-safe request/response interfaces

### Testing Layer
- **Unit Tests**: Verify specific component behaviors and edge cases
- **Property-Based Tests**: Verify universal properties across generated inputs
- **Test Generators**: Produce valid test data for property-based tests

## Components and Interfaces

### WarbandContext Interface
```typescript
interface WarbandContextValue {
  // State
  currentWarband: Warband | null;
  selectedWeirdoId: string | null;
  validationErrors: Map<string, ValidationError[]>;
  
  // Warband operations
  createWarband: (name: string, pointLimit: 75 | 125) => void;
  updateWarband: (updates: Partial<Warband>) => void;
  saveWarband: () => Promise<void>;
  loadWarband: (id: string) => Promise<void>;
  deleteWarband: (id: string) => Promise<void>;
  
  // Weirdo operations
  addWeirdo: (type: 'leader' | 'trooper') => Promise<void>;
  removeWeirdo: (id: string) => void;
  updateWeirdo: (id: string, updates: Partial<Weirdo>) => void;
  selectWeirdo: (id: string) => void;
  
  // Computed values
  getWeirdoCost: (id: string) => number;
  getWarbandCost: () => number;
  validateWarband: () => Promise<ValidationResult>;
  validateWeirdo: (id: string) => Promise<ValidationResult>;
}
```

### Component Props Interfaces
```typescript
interface WeirdoEditorProps {
  // No props - uses context
}

interface WeirdosListProps {
  // No props - uses context
}

interface WeirdoCostDisplayProps {
  weirdo: Weirdo;
  warbandAbility: WarbandAbility | null;
}
```

### Error Handling Pattern
```typescript
// Correct pattern
try {
  // operation
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Error message:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Data Models

### Warband Model
```typescript
interface Warband {
  id: string;
  name: string;
  ability: WarbandAbility | null;
  pointLimit: 75 | 125;
  totalCost: number;
  weirdos: Weirdo[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Weirdo Model
```typescript
interface Weirdo {
  id: string;
  name: string;
  type: 'leader' | 'trooper';
  attributes: Attributes;
  closeCombatWeapons: Weapon[];
  rangedWeapons: Weapon[];
  equipment: Equipment[];
  psychicPowers: PsychicPower[];
  leaderTrait: LeaderTrait | null;
  notes: string;
  totalCost: number;
}
```

### Test Data Generator Constraints
```typescript
interface ValidWarbandGenerator {
  name: string; // non-empty, 1-50 characters
  pointLimit: 75 | 125;
  weirdos: ValidWeirdoGenerator[]; // 0-10 weirdos, max 1 leader
}

interface ValidWeirdoGenerator {
  name: string; // non-empty, 1-30 characters
  type: 'leader' | 'trooper';
  attributes: {
    speed: 1 | 2 | 3 | 4 | 5 | 6;
    defense: '2d6' | '3d6' | '4d6' | '5d6';
    firepower: 'None' | '2d6' | '3d6' | '4d6' | '5d6';
    prowess: '2d6' | '3d6' | '4d6' | '5d6';
    willpower: '2d6' | '3d6' | '4d6' | '5d6';
  };
  equipment: Equipment[]; // 0-3 items for leaders, 0-2 for troopers
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all properties from the prework, several can be consolidated:

**Redundancies Identified:**
- Properties 1.1, 1.2, and 1.5 all test compilation success - can be combined into one
- Properties 2.2 and 2.5 both test type guard usage in error handling - can be combined
- Properties 3.7 and 7.2 both test that warband total cost equals sum of weirdo costs - can be combined
- Properties 4.1-4.6 all test that sections are visible for any weirdo - can be combined into one comprehensive property
- Properties 5.2-5.6 all test that cost components are visible in breakdown - can be combined
- Properties 6.2 and 6.3 test opposite states of the same button - can be combined into one property

**Consolidated Properties:**
- Compilation success (1.1, 1.2, 1.5) → Single property
- Type guard usage (2.2, 2.5) → Single property  
- Cost consistency (3.7, 7.2) → Single property
- Editor sections visibility (4.1-4.6) → Single property
- Cost breakdown components (5.2-5.6) → Single property
- Add Leader button state (6.2, 6.3) → Single property

### Correctness Properties

Property 1: TypeScript compilation succeeds
*For any* codebase state, running the TypeScript compiler should complete with exit code 0 and produce valid JavaScript output
**Validates: Requirements 1.1, 1.2, 1.5**

Property 2: Type assertions have documentation
*For any* type assertion in the codebase, there should be a documentation comment explaining why the assertion is safe
**Validates: Requirements 1.3, 2.3**

Property 3: Catch blocks use unknown type
*For any* catch block in the codebase, the error parameter should be typed as unknown
**Validates: Requirements 2.1**

Property 4: Error handling uses type guards
*For any* catch block that accesses error properties, type guards should be used to verify the error type before accessing properties
**Validates: Requirements 2.2, 2.5**

Property 5: API responses use explicit types
*For any* API response parsing code, explicit type definitions should be used rather than implicit any types
**Validates: Requirements 2.4**

Property 6: Adding leader creates leader weirdo
*For any* warband without a leader, adding a leader should result in a weirdo with type 'leader' being added to the warband
**Validates: Requirements 3.1**

Property 7: Adding trooper creates trooper weirdo
*For any* warband, adding a trooper should result in a weirdo with type 'trooper' being added to the warband
**Validates: Requirements 3.2**

Property 8: Added weirdo is auto-selected
*For any* warband and any weirdo type, adding a weirdo should result in that weirdo being selected (selectedWeirdoId equals the new weirdo's id)
**Validates: Requirements 3.3**

Property 9: Second leader addition throws error
*For any* warband that already has a leader, attempting to add another leader should throw an error and not modify the warband
**Validates: Requirements 3.4**

Property 10: Removing weirdo removes from array
*For any* warband with at least one weirdo, removing a weirdo should decrease the weirdos array length by 1 and the removed weirdo should not be in the array
**Validates: Requirements 3.5**

Property 11: Removing selected weirdo clears selection
*For any* warband with a selected weirdo, removing that weirdo should result in selectedWeirdoId being null
**Validates: Requirements 3.6**

Property 12: Warband cost equals sum of weirdo costs
*For any* warband, the totalCost should equal the sum of all weirdo totalCost values
**Validates: Requirements 3.7, 7.2**

Property 13: Attribute updates trigger cost recalculation
*For any* weirdo, updating attributes should result in the weirdo's totalCost being recalculated (cost value changes or API is called)
**Validates: Requirements 3.8**

Property 14: Selected weirdo shows all editor sections
*For any* selected weirdo, the WeirdoEditor should display basic information, attributes, close combat weapons, equipment, and psychic powers sections
**Validates: Requirements 4.1, 4.2, 4.3, 4.5, 4.6**

Property 15: Ranged weapons section visibility depends on firepower
*For any* selected weirdo, the ranged weapons section should be visible if and only if firepower is not 'None'
**Validates: Requirements 4.4**

Property 16: Leader shows leader trait section
*For any* selected leader weirdo, the WeirdoEditor should display the leader trait section
**Validates: Requirements 4.7**

Property 17: Cost breakdown toggle expands breakdown
*For any* weirdo, clicking the cost breakdown toggle when collapsed should expand the breakdown to show cost components
**Validates: Requirements 5.1**

Property 18: Expanded breakdown shows all cost components
*For any* weirdo with expanded cost breakdown, the display should show attributes, weapons, equipment, and psychic powers cost values
**Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6**

Property 19: Cost breakdown toggle collapses breakdown
*For any* weirdo with expanded breakdown, clicking the toggle should collapse the breakdown to hide cost components
**Validates: Requirements 5.7**

Property 20: WeirdosList displays all weirdos
*For any* warband with weirdos, the WeirdosList should render a card for each weirdo in the warband
**Validates: Requirements 6.1**

Property 21: Add Leader button state depends on leader existence
*For any* warband, the Add Leader button should be disabled if and only if the warband has a leader
**Validates: Requirements 6.2, 6.3**

Property 22: Add Leader creates leader weirdo
*For any* warband without a leader, clicking Add Leader should create a new weirdo with type 'leader' and default properties
**Validates: Requirements 6.4**

Property 23: Add Trooper creates trooper weirdo
*For any* warband, clicking Add Trooper should create a new weirdo with type 'trooper' and default properties
**Validates: Requirements 6.5**

Property 24: Cost updates complete within 100ms
*For any* weirdo attribute change, the cost recalculation should complete within 100ms (debounced)
**Validates: Requirements 7.1**

Property 25: Ability changes trigger cost recalculation
*For any* warband, changing the warband ability should trigger cost recalculation for all weirdos
**Validates: Requirements 7.3**

Property 26: Rapid updates are debounced
*For any* sequence of rapid attribute changes, the system should debounce cost calculations to prevent excessive API calls (only one calculation after changes stop)
**Validates: Requirements 7.4**

Property 27: Unchanged values use memoization
*For any* weirdo with unchanged attributes, requesting the cost should return the cached value without triggering a new calculation
**Validates: Requirements 7.5**

Property 28: Save validates before saving
*For any* warband, clicking save should call the validation API before calling the save API
**Validates: Requirements 8.1**

Property 29: Invalid warband prevents save
*For any* warband that fails validation, the save API should not be called
**Validates: Requirements 8.2**

Property 30: Validation errors are displayed
*For any* warband that fails validation, validation errors should be displayed in the UI
**Validates: Requirements 8.3**

Property 31: Successful save calls success callback
*For any* valid warband, when save succeeds, the success callback should be called
**Validates: Requirements 8.4**

Property 32: Failed save calls error callback
*For any* valid warband, when save fails, the error callback should be called
**Validates: Requirements 8.5**

Property 33: Existing warband uses update endpoint
*For any* warband with a non-empty id, saving should call the update API endpoint with the warband ID
**Validates: Requirements 8.6**

Property 34: Delete shows confirmation dialog
*For any* warband, clicking delete should display a confirmation dialog before calling the API
**Validates: Requirements 9.1**

Property 35: Confirmed delete calls API
*For any* warband, confirming the delete dialog should call the delete API endpoint
**Validates: Requirements 9.2**

Property 36: Successful delete removes from list
*For any* warband, when delete succeeds, the warband should be removed from the displayed list
**Validates: Requirements 9.3**

Property 37: Successful delete shows notification
*For any* warband, when delete succeeds, a success notification should be displayed
**Validates: Requirements 9.4**

Property 38: Cancelled delete prevents API call
*For any* warband, cancelling the delete dialog should not call the delete API endpoint
**Validates: Requirements 9.5**

Property 39: Equipment limit disables unselected options
*For any* weirdo at equipment limit, unselected equipment options should be disabled
**Validates: Requirements 11.1**

Property 40: Under limit enables equipment options
*For any* weirdo under equipment limit, equipment options should be enabled
**Validates: Requirements 11.2**

Property 41: At limit allows deselecting equipment
*For any* weirdo at equipment limit, currently selected equipment should remain clickable for deselection
**Validates: Requirements 11.3**

Property 42: Limit changes update disabled states
*For any* weirdo, changing the equipment limit should update the disabled state of equipment options accordingly
**Validates: Requirements 11.4**

Property 43: Warband list displays total cost
*For any* warband in the list view, the total cost should be displayed
**Validates: Requirements 12.1**

Property 44: Cost changes update display
*For any* warband, when the cost changes, the displayed total cost should update to reflect the new value
**Validates: Requirements 12.2**

## Error Handling

### TypeScript Compilation Errors
- Run `tsc --noEmit` to identify all type errors
- Fix type errors by adding proper type annotations
- Remove or document type assertions
- Ensure all imports have correct types

### Catch Block Error Handling
- Type all catch block parameters as `unknown`
- Use type guards before accessing error properties:
  ```typescript
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }
  ```

### Component Rendering Errors
- Ensure all required props are passed to components
- Verify context providers wrap components that use context
- Check conditional rendering logic for edge cases
- Ensure state updates trigger re-renders correctly

### API Integration Errors
- Mock API calls properly in tests
- Handle API errors gracefully with try-catch
- Provide fallback values when API calls fail
- Test both success and failure paths

### Test Data Generation Errors
- Constrain generators to produce only valid data
- Ensure generated names are non-empty
- Respect equipment limits in generators
- Validate generated data before using in tests

## Testing Strategy

### Unit Testing Approach

Unit tests will verify specific behaviors and edge cases:

**TypeScript Compilation Tests:**
- Test that `tsc --noEmit` exits with code 0
- Test that `npm run build` completes successfully
- Test that no unused variable warnings exist

**Component Rendering Tests:**
- Test empty state rendering when no weirdo selected
- Test loading state rendering in cost breakdown
- Test error state rendering for validation errors

**State Management Tests:**
- Test initial state of WarbandContext
- Test error thrown when adding second leader
- Test selection cleared when removing selected weirdo

**API Integration Tests:**
- Test API client error handling
- Test retry logic for failed requests
- Test proper error types returned

### Property-Based Testing Approach

Property-based tests will verify universal properties across generated inputs using fast-check library. Each test will run a minimum of 50 iterations.

**Test Data Generators:**

```typescript
// Valid warband generator
const validWarbandArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  pointLimit: fc.constantFrom(75, 125),
  ability: fc.option(fc.constantFrom('Mutants', 'Robots', 'Psykers', 'Zealots'), { nil: null }),
  weirdos: fc.array(validWeirdoArb, { maxLength: 10 })
});

// Valid weirdo generator
const validWeirdoArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 30 }),
  type: fc.constantFrom('leader', 'trooper'),
  attributes: fc.record({
    speed: fc.integer({ min: 1, max: 6 }),
    defense: fc.constantFrom('2d6', '3d6', '4d6', '5d6'),
    firepower: fc.constantFrom('None', '2d6', '3d6', '4d6', '5d6'),
    prowess: fc.constantFrom('2d6', '3d6', '4d6', '5d6'),
    willpower: fc.constantFrom('2d6', '3d6', '4d6', '5d6')
  }),
  equipment: fc.array(equipmentArb, { maxLength: 3 })
});
```

**Property Test Structure:**

Each property-based test will:
1. Generate valid test data using constrained generators
2. Execute the operation being tested
3. Assert the property holds
4. Use fast-check's built-in shrinking to find minimal failing examples

**Property Test Tags:**

Each property-based test will include a comment tag linking it to the design document:
```typescript
// **Feature: npm-package-upgrade-fixes, Property 6: Adding leader creates leader weirdo**
// **Validates: Requirements 3.1**
```

**Coverage Strategy:**

- Unit tests cover specific examples and edge cases (20% of tests)
- Property-based tests cover universal properties (80% of tests)
- Together they provide comprehensive coverage of all requirements

### Test Execution

- Run targeted tests during development: `npm test -- tests/WarbandContext.test.tsx --reporter=dot`
- Run full suite at checkpoints: `npm test`
- Use `--reporter=dot --silent` for minimal output during development
- Property-based tests configured for 50 iterations minimum

## Implementation Notes

### Fix Priority

1. **TypeScript Compilation** - Must fix first as it blocks everything
2. **WarbandContext Methods** - Core functionality that many components depend on
3. **Component Rendering** - Fix props and conditional logic
4. **Cost Breakdown API** - Fix API mocking in tests
5. **Test Generators** - Fix to produce valid data
6. **Code Quality** - Fix error handling patterns and documentation

### Breaking Changes from Package Upgrades

**React Testing Library:**
- May have stricter async handling requirements
- May require explicit `waitFor` for state updates
- May have changed query behavior

**TypeScript:**
- Stricter type checking enabled
- More aggressive unused variable detection
- Better type inference may reveal hidden errors

**Vitest:**
- May have changed test isolation behavior
- May have different mocking requirements
- May have stricter async test handling

### Migration Strategy

1. Fix TypeScript errors first to enable compilation
2. Update component implementations to fix rendering
3. Fix WarbandContext to restore state management
4. Update test mocks to work with new package versions
5. Fix test generators to produce valid data
6. Improve code quality (error handling, documentation)

### API Layer Compliance

All fixes must maintain the API layer architecture:
- Frontend components use only apiClient for backend communication
- No direct imports of backend services or repositories
- All API calls go through HTTP endpoints
- Type-safe request/response interfaces maintained
