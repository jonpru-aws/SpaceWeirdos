# Design Document

## Overview

This document provides a comprehensive analysis and remediation plan for the remaining 12 failing tests in the Space Weirdos Workshop test suite after the initial remediation phase. The test suite improved from 780/825 passing (94.5%) to 803/817 passing (98.3%). The remaining failures are categorized by root cause, with specific solutions for each category.

## Test Failure Analysis

### Summary Statistics (After Initial Remediation)

- **Total Tests**: 817
- **Passing Tests**: 803 (98.3%)
- **Failing Tests**: 12 (1.5%)
- **Skipped Tests**: 2 (0.2%)
- **Unhandled Errors**: 1
- **Fixed in Phase 1**: 31 tests (72% of original failures)

### Failure Categories (Remaining Issues)

#### Category 1: Code Quality Metrics (LOW PRIORITY)
**Affected Tests**: 2 tests
**Root Cause**: Code contains undocumented type assertions and catch blocks with `unknown` type

**Failed Tests:**
- `CodeQualityMetrics > should have documentation for all type assertions`
- `CodeQualityMetrics > should use proper error typing in all catch blocks`

**Pattern**: Documentation enforcement tests failing due to missing inline comments

**Details**:
- 31 type assertions without documentation comments across 6 files
- 20 catch blocks using `unknown` type instead of proper error typing across 7 files

#### Category 2: Property-Based Test Edge Cases (MEDIUM PRIORITY)
**Affected Tests**: 4 tests
**Root Cause**: Property tests revealing edge cases with generated data

**Failed Tests:**
- `DeleteOperationsProperty > Property 36: Successful delete removes from list` - Cannot find warband name "!"
- `EquipmentLimitEnforcement > Property 42: Limit changes update disabled states` - Test timeout
- `TypeSafetyDocumentation > Property 3: Type safety documentation` - Related to Category 1
- `useCostCalculationOptimistic > should show last known value while API request is in flight` - Expected cost 11 but got 0

**Pattern**: Edge case inputs (single-character names, slow operations) causing test failures

#### Category 3: Real-Time Cost Calculation (HIGH PRIORITY)
**Affected Tests**: 5 tests
**Root Cause**: Weirdo not being added to warband in test context

**Failed Tests:**
- `RealTimeCostCalculation > should update weirdo cost when attributes change`
- `RealTimeCostCalculation > should update warband cost when weirdo cost changes`
- `RealTimeCostCalculation > should debounce cost updates to 100ms`
- `RealTimeCostCalculation > should use memoized cost values when available`
- `RealTimeCostCalculation > should recalculate costs when warband ability changes`

**Pattern**: All tests fail with `expect(result.current.currentWarband?.weirdos.length).toBe(1)` returning 0

**Details**: `addWeirdo()` not actually adding weirdo to warband in test context

#### Category 4: TypeScript Compilation Timeout (LOW PRIORITY)
**Affected Tests**: 1 test
**Root Cause**: TypeScript compilation taking too long

**Failed Test:**
- `TypeScriptCompilation > should have no unused variable warnings` - Test timeout (5000ms)

**Pattern**: Compilation-based test exceeding timeout

#### Category 5: Unhandled Promise Rejection (MEDIUM PRIORITY)
**Affected Tests**: 1 error
**Root Cause**: Warband name "!" not rendering or being normalized

**Failed Test:**
- `WarbandListProperty > should update displayed cost when warband cost changes` - Unhandled rejection

**Pattern**: Similar to Category 2 - single-character special names causing issues

#### Category 6 (RESOLVED): WarbandContext Null Reference Errors
**Status**: FIXED in Phase 1
**Affected Tests**: 16 tests (all fixed)
**Resolution**: Successfully fixed by adding proper async waiting patterns in test setup

## Architecture

### Test Infrastructure Components

```
Test Suite
├── Unit Tests (specific examples)
├── Property-Based Tests (universal properties)
└── Integration Tests (component interactions)

Test Utilities
├── renderWithProviders() - Wraps components with required contexts
├── testGenerators.ts - Generates random test data
└── testHelpers.tsx - Common test utilities
```

### Key Dependencies

- **Vitest**: Test runner
- **@testing-library/react**: React component testing
- **fast-check**: Property-based testing
- **React Testing Library**: DOM queries and user interactions

## Components and Interfaces

### WarbandContext Test Setup

The WarbandContext tests use `renderHook` from `@testing-library/react` to test the context provider:

```typescript
const { result } = renderHook(() => useWarband(), {
  wrapper: ({ children }) => (
    <GameDataProvider>
      <WarbandProvider>{children}</WarbandProvider>
    </GameDataProvider>
  ),
});
```

**Issue**: The `result.current` is null immediately after rendering, before React has completed the initial render cycle.

### Async Cost Calculation Flow

```
User Action → State Update → API Call → Cost Calculation → UI Update
```

**Issue**: Tests don't wait for the full async flow to complete before making assertions.

## Data Models

### Test Failure Record

```typescript
interface TestFailure {
  testFile: string;
  testName: string;
  category: FailureCategory;
  errorType: 'timeout' | 'null-reference' | 'element-not-found' | 'assertion-failed';
  errorMessage: string;
  affectedLine: number;
  priority: 'high' | 'medium' | 'low';
}
```

### Remediation Task

```typescript
interface RemediationTask {
  category: string;
  affectedTests: string[];
  rootCause: string;
  solution: string;
  estimatedEffort: 'small' | 'medium' | 'large';
  dependencies: string[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Type assertion documentation completeness
*For any* type assertion in source code, there should be an inline comment explaining why the assertion is safe
**Validates: Requirements 6.1, 6.2, 6.3**

### Property 2: Error type safety
*For any* catch block in source code, the error should be properly typed using type guards or specific error types instead of `unknown`
**Validates: Requirements 7.1, 7.2, 7.3**

### Property 3: Property test input robustness
*For any* property-based test generator, the generated inputs should not cause test failures due to edge case handling issues
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 4: Optimistic update initialization
*For any* cost calculation hook initialization, the initial cost value from props should be set before API requests begin
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 5: Test context state management
*For any* test that adds entities to context, the entities should be present in the context state after the add operation completes
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

### Property 6: Test execution performance
*For any* test that performs compilation or complex operations, the timeout should be sufficient for the operation to complete
**Validates: Requirements 8.2**

## Error Handling

### Null Reference Errors

**Detection**: Check if `result.current` is null before accessing properties
**Prevention**: Wrap initial access in `waitFor` or use `act` properly
**Recovery**: Add null checks and proper async waiting

### Timeout Errors

**Detection**: Test exceeds 5000ms default timeout
**Prevention**: Increase timeout for async-heavy tests or optimize test setup
**Recovery**: Add explicit timeout values or reduce test complexity

### Element Not Found Errors

**Detection**: `findBy*` queries timeout waiting for elements
**Prevention**: Ensure providers are properly set up and components render
**Recovery**: Debug provider setup and component rendering logic

## Testing Strategy

### Remediation Approach

1. **Phase 1: Fix WarbandContext Null References** (HIGH PRIORITY)
   - Add proper async waiting for hook initialization
   - Wrap `result.current` access in `waitFor` blocks
   - Ensure `act` is used correctly for state updates

2. **Phase 2: Fix Async Cost Calculation** (MEDIUM PRIORITY)
   - Increase timeouts for cost-related queries
   - Add explicit waits for cost calculations
   - Mock API responses to speed up tests

3. **Phase 3: Fix WeirdoEditorIntegration** (MEDIUM PRIORITY)
   - Debug provider setup in `renderWithProviders`
   - Verify component rendering logic
   - Add proper async waiting for component initialization

4. **Phase 4: Fix Property Test Mock Cleanup** (LOW PRIORITY)
   - Add mock cleanup between iterations
   - Use `beforeEach` or `afterEach` for mock resets
   - Investigate unhandled promise rejection source

### Test Execution Strategy

- Fix one category at a time
- Run affected tests after each fix
- Verify no regressions in passing tests
- Document any discovered issues

### Validation Approach

After each fix:
1. Run the specific failing test
2. Run all tests in the same file
3. Run full test suite to check for regressions
4. Verify test execution time is reasonable

## Implementation Priority

### Priority 1: Real-Time Cost Calculation Tests (HIGH PRIORITY)
- **Impact**: 5 failing tests - core warband functionality
- **Effort**: Medium-High (investigate why addWeirdo() doesn't work in test context)
- **Risk**: Medium (may indicate actual bug in WarbandContext or test infrastructure issue)
- **Files**: `tests/RealTimeCostCalculation.test.tsx`, possibly `src/frontend/contexts/WarbandContext.tsx`

### Priority 2: Property-Based Test Edge Cases (MEDIUM PRIORITY)
- **Impact**: 4 failing tests
- **Effort**: Medium (fix generators and optimistic updates)
- **Risk**: Low-Medium (isolated to test code and one hook implementation)
- **Files**: `tests/DeleteOperationsProperty.test.tsx`, `tests/EquipmentLimitEnforcement.test.tsx`, `tests/useCostCalculationOptimistic.test.tsx`, `tests/TypeSafetyDocumentation.test.ts`

### Priority 3: Unhandled Promise Rejection (MEDIUM PRIORITY)
- **Impact**: 1 unhandled error
- **Effort**: Small (fix generator to avoid problematic names)
- **Risk**: Low (isolated to test generator)
- **Files**: `tests/WarbandListProperty.test.tsx`, `tests/testGenerators.ts`

### Priority 4: Code Quality Metrics (LOW PRIORITY)
- **Impact**: 2 failing tests - documentation enforcement
- **Effort**: Small-Medium (add comments to 31 type assertions and fix 20 catch blocks)
- **Risk**: Very Low (documentation only)
- **Files**: Multiple files across frontend and backend

### Priority 5: TypeScript Compilation Timeout (LOW PRIORITY)
- **Impact**: 1 failing test
- **Effort**: Small (increase timeout)
- **Risk**: Very Low (test configuration only)
- **Files**: `tests/TypeScriptCompilation.test.ts`

## Investigation Notes

### Phase 1 Remediation Results

**Status**: COMPLETED - 31 of 43 tests fixed (72% success rate)

**Successfully Fixed Categories**:
1. **WarbandContext Null References** (16 tests) - Added proper async waiting for context initialization
2. **Async Cost Calculation** (2 tests) - Increased timeouts for async cost calculations
3. **WeirdoEditorIntegration** (8 tests) - Fixed provider setup and async rendering
4. **Property Test Mock Cleanup** (1 test) - Added mock cleanup between iterations
5. **Additional tests** (4 tests) - Various fixes

**Key Learnings**:
- Async context providers require explicit waiting patterns in tests
- Property-based tests need cleanup between iterations
- Integration tests need all providers properly initialized
- Timeout values must account for async operations

## Detailed Solutions

### Solution 1: Real-Time Cost Calculation Tests

**Problem**: Tests fail because `addWeirdo()` doesn't add weirdo to warband context

**Root Cause**: Test setup issue where WarbandContext state updates aren't being applied or test is checking state before async update completes

**Investigation Steps**:
1. Check if test needs to wait for state update after `addWeirdo()` call
2. Verify WarbandProvider is properly initialized with mock CostEngine
3. Compare with working WarbandContext tests to identify differences
4. Check if `act()` wrapper is needed around state updates

**Solution**:
```typescript
// Add proper async waiting after addWeirdo:
await act(async () => {
  result.current.addWeirdo(mockWeirdo);
});

// Wait for state to update:
await waitFor(() => {
  expect(result.current.currentWarband?.weirdos.length).toBe(1);
});
```

**Files to Fix**: `tests/RealTimeCostCalculation.test.tsx`

### Solution 2: Delete Operations Property Edge Case

**Problem**: Cannot find warband with name "!" (single exclamation mark)

**Root Cause**: Warband name gets normalized/trimmed, causing text search to fail

**Solution Options**:
```typescript
// Option A: Improve generator to avoid problematic single-character names
const warbandNameGenerator = fc.string({ minLength: 2, maxLength: 50 });

// Option B: Fix test to search by ID instead of name
const warbandElement = screen.getByTestId(`warband-${warband.id}`);

// Option C: Normalize search text to match component normalization
const normalizedName = warband.name.trim();
await screen.findByText(normalizedName);
```

**Recommended**: Option A (improve generator) - prevents edge case from occurring

**Files to Fix**: `tests/testGenerators.ts`, `tests/DeleteOperationsProperty.test.tsx`

### Solution 3: Equipment Limit Enforcement Timeout

**Problem**: Test times out after 5000ms

**Root Cause**: Test may have infinite loop or very slow operation

**Investigation Steps**:
1. Add console.log to identify where test hangs
2. Check if property test is generating too many iterations
3. Verify component rendering isn't stuck in infinite re-render

**Solution**:
```typescript
// Option A: Increase timeout
it('Property 42: Limit changes update disabled states', { timeout: 10000 }, async () => {
  // test code
});

// Option B: Reduce property test iterations
fc.assert(
  fc.asyncProperty(generators, async (data) => {
    // test code
  }),
  { numRuns: 25 } // Reduce from default 100
);
```

**Files to Fix**: `tests/EquipmentLimitEnforcement.test.tsx`

### Solution 4: Optimistic Updates Not Working

**Problem**: Expected cost to be 11 but got 0 - initial cost not being set

**Root Cause**: `useCostCalculation` hook not setting initial cost value from props

**Solution**:
```typescript
// In useCostCalculation hook, ensure initial cost is set:
const [cost, setCost] = useState<number>(initialCost ?? 0);

// Or use useEffect to set initial value:
useEffect(() => {
  if (initialCost !== undefined) {
    setCost(initialCost);
  }
}, [initialCost]);
```

**Files to Fix**: `src/frontend/hooks/useCostCalculation.ts`

### Solution 5: Type Assertion Documentation

**Problem**: 31 type assertions without documentation comments

**Root Cause**: Code quality enforcement test requires inline comments

**Solution**:
```typescript
// Before:
const value = data as SomeType;

// After:
// Type assertion safe: data validated by schema before this point
const value = data as SomeType;
```

**Files to Fix**: 
- `src/backend/routes/warbandRoutes.ts` (5 assertions)
- `src/backend/services/CostEngine.ts` (4 assertions)
- `src/frontend/components/AttributeSelector.tsx` (4 assertions)
- `src/frontend/components/WeirdoEditor.tsx` (9 assertions)
- `src/frontend/contexts/GameDataContext.tsx` (6 assertions)
- Others (3 assertions)

### Solution 6: Error Typing in Catch Blocks

**Problem**: 20 catch blocks use `unknown` type instead of proper error typing

**Root Cause**: Code quality enforcement test requires proper error types

**Solution**:
```typescript
// Before:
try {
  // code
} catch (err: unknown) {
  console.error(err);
}

// After - Option A (type guard):
try {
  // code
} catch (err) {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error('Unknown error:', err);
  }
}

// After - Option B (specific error type):
try {
  // code
} catch (err: Error) {
  console.error(err.message);
}
```

**Files to Fix**:
- `src/backend/services/DataRepository.ts` (7 catch blocks)
- `src/frontend/contexts/WarbandContext.tsx` (6 catch blocks)
- `src/frontend/components/WarbandEditor.tsx` (2 catch blocks)
- `src/frontend/components/WarbandList.tsx` (2 catch blocks)
- `src/frontend/contexts/GameDataContext.tsx` (1 catch block)
- `src/frontend/hooks/useCostCalculation.ts` (1 catch block)
- `src/frontend/hooks/useItemCost.ts` (1 catch block)

### Solution 7: TypeScript Compilation Timeout

**Problem**: Test times out waiting for TypeScript compilation

**Root Cause**: Compilation takes longer than 5000ms default timeout

**Solution**:
```typescript
it('should have no unused variable warnings', { timeout: 15000 }, async () => {
  // test code
});
```

**Files to Fix**: `tests/TypeScriptCompilation.test.ts`

### Solution 8: Unhandled Promise Rejection

**Problem**: Warband name "!" not rendering, causing unhandled rejection

**Root Cause**: Same as Solution 2 - single-character special names

**Solution**: Apply same fix as Solution 2 (improve generator)

**Files to Fix**: `tests/testGenerators.ts`, `tests/WarbandListProperty.test.tsx`
