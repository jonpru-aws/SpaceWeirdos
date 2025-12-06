# Design Document

## Overview

This design outlines the approach for fixing pre-existing test failures in the Space Weirdos Warband Builder. The fixes address two main categories: (1) missing context providers in test setups, and (2) unimplemented UI features that are tested but not yet built.

## Architecture

### Test Infrastructure Changes
- Create test helper utilities for consistent test setup
- Wrap all component tests with required context providers
- Provide mock game data for isolated testing

### UI Feature Implementation
- Add validation error display to WeirdoEditor
- Enhance WeirdoCostDisplay with warning/error states
- Add leader trait description display to LeaderTraitSelector

## Components and Interfaces

### Test Helper Utilities

```typescript
// tests/testHelpers.ts

interface RenderWithProvidersOptions {
  gameData?: GameData;
  initialGameDataLoading?: boolean;
  initialGameDataError?: Error | null;
}

/**
 * Renders a component wrapped with all required context providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderWithProvidersOptions
): RenderResult;

/**
 * Creates mock game data for testing
 */
export function createMockGameData(): GameData;

/**
 * Creates a mock warband for testing
 */
export function createMockWarband(overrides?: Partial<Warband>): Warband;

/**
 * Creates a mock weirdo for testing
 */
export function createMockWeirdo(
  type: 'leader' | 'trooper',
  overrides?: Partial<Weirdo>
): Weirdo;
```

### WeirdoEditor Validation Display

```typescript
// Add to WeirdoEditor component

interface WeirdoEditorProps {
  // ... existing props
  validationErrors?: ValidationError[]; // Add this prop
}

// In component:
{validationErrors && validationErrors.length > 0 && (
  <ValidationErrorDisplay 
    errors={validationErrors}
    className="weirdo-validation-errors"
  />
)}
```

### WeirdoCostDisplay Enhancement

```typescript
// Component needs to display warnings/errors based on cost

interface WeirdoCostDisplayProps {
  pointCost: number;
  // ... other props
}

// Component should display:
// - "Approaching limit" when cost is 18-19 points
// - "Exceeds 20 point limit" when cost > 20 points
// - Apply CSS class "warning" when approaching limit
// - Apply CSS class "error" when exceeding limit

// Implementation approach:
const isApproaching = pointCost >= 18 && pointCost <= 19;
const exceedsLimit = pointCost > 20;

{isApproaching && (
  <div className="cost-warning">⚠ Approaching limit</div>
)}
{exceedsLimit && (
  <div className="cost-error">❌ Exceeds 20 point limit</div>
)}
```

### LeaderTraitSelector Enhancement

```typescript
// Component needs to display trait descriptions from game data

// Implementation approach:
// 1. Get leader trait descriptions from GameDataContext
// 2. Display description when a trait is selected

const { leaderTraits } = useGameData();

// After trait selector:
{selectedTrait && leaderTraits[selectedTrait] && (
  <div className="trait-description">
    <p>{leaderTraits[selectedTrait].description}</p>
  </div>
)}

// Example trait data structure:
interface LeaderTrait {
  name: string;
  description: string; // e.g., "Bounty hunter ability"
}
```

## Data Models

No changes to existing data models required.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Test context providers supply required data
*For any* component test that uses GameDataContext, the test wrapper should provide valid game data without throwing context errors
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Validation errors are displayed when present
*For any* weirdo with validation errors, the WeirdoEditor should display all error messages from the validation response
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Cost warnings display at correct thresholds
*For any* weirdo with cost between 18-19 points, the WeirdoCostDisplay should show "Approaching limit" warning, and for any weirdo with cost > 20 points, it should show "Exceeds 20 point limit" error message
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Leader trait descriptions are shown when selected
*For any* selected leader trait with a description in game data, the LeaderTraitSelector should display the corresponding trait description
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 5: Test helpers produce consistent mock data
*For any* call to createMockGameData, the returned data structure should match the GameData interface and contain valid test data
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 6: Test selectors target unique elements
*For any* test query that could match multiple elements, the test should use specific selectors (data-testid, CSS classes, or getAllBy methods) to target the intended element uniquely
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 7: Warband cost warnings display at correct thresholds
*For any* warband with total cost at or above 90% of the point limit (but not exceeding it), the WarbandEditor should show "Approaching point limit" warning, and for any warband with total cost exceeding the point limit, it should show "Exceeds point limit!" error message
**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 8: Warband validation error banner displays for warband-level errors
*For any* warband with validation errors that have a field of "weirdos" or apply to the warband as a whole, the WarbandEditor should display an error banner with the CSS class "error-banner" containing the validation error message
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

## Error Handling

### Test Error Handling
- Tests should fail gracefully with clear error messages
- Mock data should be validated before use
- Context provider errors should be caught and reported clearly

### UI Error Handling
- Validation errors should be displayed in user-friendly format
- Cost warnings should use distinct visual styling
- Missing trait descriptions should not cause errors

## Testing Strategy

### Unit Testing
- Test each helper utility independently
- Test validation error display with various error types
- Test cost warning display at different cost levels
- Test trait description display with and without descriptions

### Integration Testing
- Test components with context providers
- Test data flow from context to components
- Test user interactions with new UI features

### Regression Testing
- Run all existing tests after fixes
- Verify no new failures are introduced
- Check that previously failing tests now pass

## Implementation Strategy

### Phase 1: Test Infrastructure
1. Create test helper utilities
2. Update test setup to use helpers
3. Wrap all component tests with providers
4. Verify context errors are resolved

### Phase 2: UI Feature Implementation
1. Add validation error display to WeirdoEditor
2. Verify cost warning logic in WeirdoCostDisplay
3. Verify trait description display in LeaderTraitSelector
4. Update tests to verify new features

### Phase 3: Verification
1. Run full test suite
2. Fix any remaining failures
3. Document test patterns for future use
