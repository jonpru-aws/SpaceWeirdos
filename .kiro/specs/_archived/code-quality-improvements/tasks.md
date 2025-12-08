# Implementation Plan: Code Quality Improvements

- [x] 1. Fix TypeScript errors in backend services





- [x] 1.1 Fix CostModifierStrategy unused parameters


  - Prefix unused parameters with underscore in strategy methods
  - Parameters required by interface but not used in specific implementations
  - _Requirements: 2.1, 2.4_

- [x] 1.2 Fix validationMessages type error


  - Resolve string literal type assignment issue
  - Ensure message constants match expected types
  - _Requirements: 1.1, 1.2_

- [x] 1.3 Fix warbandRoutes missing properties and error handling


  - Ensure warband creation includes all required properties (createdAt, updatedAt)
  - Update error handling to use unknown type with type guards
  - Fix null type issues in method calls
  - _Requirements: 1.1, 1.2, 3.1, 4.1, 4.4_

- [x] 2. Fix TypeScript errors in frontend components




- [x] 2.1 Fix WeirdoCostDisplay method call signature


  - Call getAttributeCost separately for each attribute type
  - Ensure correct parameters for each call
  - _Requirements: 1.2, 1.3_

- [x] 2.2 Fix WeirdoEditor type mismatches


  - Resolve Partial<Weirdo | undefined> type issue
  - Fix attribute selector type incompatibilities (SpeedLevel, DiceLevel, FirepowerLevel)
  - Add type assertions with documentation where necessary
  - _Requirements: 1.1, 1.2, 3.3, 8.1_

- [x] 2.3 Fix CostBadge unused imports and props


  - Remove unused React import if not needed for JSX transform
  - Remove or utilize showLabel prop
  - _Requirements: 2.1, 2.2, 5.1, 6.2_

- [x] 2.4 Fix ItemList unused imports and variables


  - Remove unused React import if not needed
  - Remove or utilize formatCost variable
  - _Requirements: 2.1, 2.4, 5.1_

- [x] 2.5 Fix WarbandContext unused imports


  - Remove unused useMemo import
  - _Requirements: 2.1, 5.1_

- [x] 3. Fix TypeScript errors in test files





- [x] 3.1 Fix test file unused imports


  - Remove unused imports from AttributeSelector.test.tsx (WarbandAbility)
  - Remove unused imports from CostEngineRefactoring.test.ts (expect)
  - Remove unused imports from DataRepository.test.ts (PersistenceError, PersistenceErrorCode)
  - _Requirements: 2.1, 5.1_

- [x] 3.2 Fix ColorTokens.test.ts missing beforeAll


  - Add beforeAll import from vitest or remove usage
  - _Requirements: 1.1, 5.3_

- [x] 3.3 Fix test null type issues


  - Fix CostEngine.test.ts null assignments to WarbandAbility
  - Fix DataRepository.test.ts null assignments to WarbandAbility
  - Use proper null handling or type assertions
  - _Requirements: 1.1, 1.2_

- [x] 4. Enhance type safety across codebase




- [x] 4.1 Replace 'any' with explicit types in error handling


  - Update all catch blocks to use unknown type
  - Add type guard functions (isError, isNodeError)
  - Apply type narrowing before accessing error properties
  - _Requirements: 3.1, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.2 Add documentation for type assertions


  - Document all type assertions with explanatory comments
  - Document any remaining 'any' usage with justification
  - _Requirements: 3.3, 8.1, 8.2_

- [x] 4.3 Define explicit API response interfaces


  - Create interfaces for API response types
  - Replace any types in API client with explicit interfaces
  - _Requirements: 3.2_

- [x] 5. Write unit tests for code quality verification






- [x] 5.1 Write TypeScript compilation test

  - Test that TypeScript compiler exits with code 0
  - Test that no compilation errors are produced
  - Test that no unused variable warnings are produced
  - _Requirements: 1.1, 1.4, 2.1_

- [x] 5.2 Write code quality metrics test


  - Test that 'any' usage count is fewer than 5 instances
  - Test that all type assertions have documentation
  - Test that all catch blocks use proper error typing
  - _Requirements: 3.5, 3.3, 3.1_
-

- [x] 6. Write property-based tests for pattern verification




- [x] 6.1 Write property test for error handling pattern

  - **Property 2: Error handling consistency**
  - **Validates: Requirements 3.1, 4.1, 4.2, 4.3, 4.4, 4.5**
  - Generate list of all source files
  - Parse each file's catch blocks using TypeScript Compiler API
  - Verify all catch blocks use unknown type and type guards
  - Run minimum 50 iterations

- [x] 6.2 Write property test for type safety documentation



  - **Property 3: Type safety documentation**
  - **Validates: Requirements 3.3, 8.1, 8.2**
  - Generate list of all source files
  - Parse each file for type assertions and 'any' usage
  - Verify documentation exists within 2 lines
  - Run minimum 50 iterations

- [x] 6.3 Write property test for import usage



  - **Property 5: Explicit API response types**
  - **Validates: Requirements 3.2**
  - Generate list of all source files
  - Parse each file for API response parsing
  - Verify explicit interfaces are used instead of 'any'
  - Run minimum 50 iterations
-

- [x] 7. Final verification and cleanup





- [x] 7.1 Run full TypeScript compilation

  - Verify zero errors and zero warnings
  - Ensure build process completes successfully
  - _Requirements: 1.1, 1.4, 2.1_

- [x] 7.2 Run existing test suite


  - Verify all existing tests still pass
  - Ensure no functionality regressions
  - _Requirements: All_


- [x] 7.3 Verify code quality metrics

  - Confirm fewer than 5 'any' instances
  - Confirm all type assertions documented
  - Confirm all catch blocks use proper typing
  - _Requirements: 3.5, 3.3, 3.1_
