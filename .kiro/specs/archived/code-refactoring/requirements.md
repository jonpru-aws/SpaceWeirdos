# Requirements Document

## Introduction

This specification defines requirements for refactoring the Space Weirdos Warband Builder codebase to improve readability, maintainability, and performance. The refactoring will reduce code duplication, enhance type safety, optimize performance, and improve component organization without changing external functionality.

## Glossary

- **System**: The Space Weirdos Warband Builder application
- **ValidationService**: Backend service responsible for validating warband and weirdo data
- **CostEngine**: Backend service responsible for calculating point costs
- **WarbandEditor**: Frontend React component for editing warbands
- **WeirdoEditor**: Frontend React component for editing individual weirdos
- **Component**: A React functional component
- **Hook**: A React hook for managing state or side effects
- **Context**: React Context API for sharing state across components

## Requirements

### Requirement 1: Reduce Validation Code Duplication

**User Story:** As a developer, I want validation logic to be DRY (Don't Repeat Yourself), so that the codebase is easier to maintain and less prone to bugs.

#### Acceptance Criteria

1. WHEN implementing validation helpers, THE System SHALL provide reusable validator factory functions
2. WHEN validating attributes, THE System SHALL use iteration instead of repetitive conditional checks
3. WHEN validation patterns are similar, THE System SHALL extract common logic into shared functions
4. WHEN validation code is refactored, THE System SHALL maintain identical validation behavior

### Requirement 2: Extract Magic Numbers to Named Constants

**User Story:** As a developer, I want magic numbers replaced with named constants, so that the code is more readable and easier to modify.

#### Acceptance Criteria

1. WHEN calculating costs, THE System SHALL use named constants for discount values
2. WHEN applying ability modifiers, THE System SHALL use named constants for weapon and equipment lists
3. WHEN defining thresholds, THE System SHALL use named constants for percentage values
4. WHEN constants are defined, THE System SHALL place them at the class or module level
5. WHEN validation errors occur, THE System SHALL use named constants for error messages
6. WHEN error codes are referenced, THE System SHALL use a centralized type definition

### Requirement 3: Consolidate Cost Calculation Logic

**User Story:** As a developer, I want cost calculation logic to be consolidated, so that ability modifiers are easier to understand and extend.

#### Acceptance Criteria

1. WHEN calculating weapon costs, THE System SHALL use a strategy pattern for ability-based discounts
2. WHEN calculating equipment costs, THE System SHALL use a strategy pattern for ability-based modifiers
3. WHEN adding new warband abilities, THE System SHALL require minimal code changes to cost calculation
4. WHEN refactoring cost logic, THE System SHALL maintain identical calculation results

### Requirement 4: Split Large Components into Smaller Ones

**User Story:** As a developer, I want large React components split into smaller, focused components, so that the code is easier to understand and test.

#### Acceptance Criteria

1. WHEN WarbandEditor exceeds 300 lines, THE System SHALL extract sub-components for distinct UI sections
2. WHEN WeirdoEditor exceeds 300 lines, THE System SHALL extract sub-components for distinct UI sections
3. WHEN components are split, THE System SHALL render all warband data correctly for any valid warband input
4. WHEN components are split, THE System SHALL use clear prop interfaces

### Requirement 5: Create Reusable UI Components

**User Story:** As a developer, I want reusable UI components for common patterns, so that UI code is consistent and maintainable.

#### Acceptance Criteria

1. WHEN rendering select dropdowns with costs, THE System SHALL use a shared SelectWithCost component
2. WHEN displaying item lists with add/remove actions, THE System SHALL use a shared ItemList component
3. WHEN showing validation errors, THE System SHALL use a shared ValidationErrorDisplay component
4. WHEN reusable components are created, THE System SHALL maintain identical visual appearance

### Requirement 6: Centralize Game Data Loading

**User Story:** As a developer, I want game data loaded once at the application level, so that performance is improved and data loading is consistent.

#### Acceptance Criteria

1. WHEN the application starts, THE System SHALL load all game data once
2. WHEN components need game data, THE System SHALL provide it via React Context
3. WHEN game data is loading, THE System SHALL show appropriate loading states
4. WHEN game data fails to load, THE System SHALL handle errors gracefully

### Requirement 7: Centralize Cost Recalculation

**User Story:** As a developer, I want cost recalculation logic centralized, so that it's consistent across the application.

#### Acceptance Criteria

1. WHEN warband data changes, THE System SHALL use a single method to recalculate all costs
2. WHEN weirdo data changes, THE System SHALL automatically update warband total cost
3. WHEN ability changes, THE System SHALL recalculate all affected costs
4. WHEN costs are recalculated, THE System SHALL maintain calculation accuracy

### Requirement 8: Improve Type Safety

**User Story:** As a developer, I want improved TypeScript type safety, so that bugs are caught at compile time.

#### Acceptance Criteria

1. WHEN defining validation error codes, THE System SHALL use discriminated union types derived from a centralized constant
2. WHEN defining component props, THE System SHALL use strict TypeScript interfaces
3. WHEN using enums or constants, THE System SHALL use TypeScript const assertions
4. WHEN type definitions are improved, THE System SHALL eliminate use of 'any' type
5. WHEN validation error messages are needed, THE System SHALL reference a single source of truth

### Requirement 9: Optimize React Performance

**User Story:** As a user, I want the UI to be responsive, so that editing warbands feels smooth and fast.

#### Acceptance Criteria

1. WHEN expensive calculations occur, THE System SHALL use React.useMemo to cache results
2. WHEN callback functions are passed to child components, THE System SHALL use React.useCallback
3. WHEN lists are rendered, THE System SHALL use stable keys for list items
4. WHEN performance optimizations are applied, THE System SHALL maintain identical UI behavior

### Requirement 10: Standardize Error Handling

**User Story:** As a developer, I want consistent error handling, so that errors are predictable and easy to debug.

#### Acceptance Criteria

1. WHEN errors occur, THE System SHALL use custom error classes with error codes
2. WHEN API errors occur, THE System SHALL provide consistent error messages
3. WHEN errors are logged, THE System SHALL include relevant context information
4. WHEN error handling is standardized, THE System SHALL maintain existing error behavior

### Requirement 11: Reduce Prop Drilling

**User Story:** As a developer, I want to reduce prop drilling, so that component hierarchies are simpler.

#### Acceptance Criteria

1. WHEN warband data is needed by nested components, THE System SHALL provide it via Context
2. WHEN update functions are needed by nested components, THE System SHALL provide them via Context
3. WHEN Context is introduced, THE System SHALL maintain component reusability
4. WHEN prop drilling is reduced, THE System SHALL maintain identical component behavior

### Requirement 12: Add Code Documentation

**User Story:** As a developer, I want clear code documentation, so that the codebase is easier to understand.

#### Acceptance Criteria

1. WHEN refactoring code, THE System SHALL add JSDoc comments to public functions
2. WHEN creating new patterns, THE System SHALL document the pattern and its purpose
3. WHEN complex logic exists, THE System SHALL add inline comments explaining the approach
4. WHEN documentation is added, THE System SHALL follow consistent formatting

### Requirement 13: Display Validation Errors in UI

**User Story:** As a user, I want to see validation errors in the UI, so that I know what needs to be fixed in my warband.

#### Acceptance Criteria

1. WHEN a weirdo has validation errors, THE System SHALL display error messages in the WeirdoEditor
2. WHEN validation errors are displayed, THE System SHALL show specific error text from the validation response
3. WHEN a weirdo is missing required weapons, THE System SHALL display "At least one close combat weapon required"
4. WHEN validation state changes, THE System SHALL update error display in real-time

### Requirement 14: Display Cost Warnings and Limits

**User Story:** As a user, I want to see warnings when approaching point limits, so that I can manage my warband costs effectively.

#### Acceptance Criteria

1. WHEN a trooper cost is 18-19 points, THE System SHALL display "Approaching limit" warning
2. WHEN a trooper cost exceeds 20 points, THE System SHALL display "Exceeds 20 point limit" error
3. WHEN cost warnings are displayed, THE System SHALL use distinct visual styling for warnings vs errors
4. WHEN cost changes, THE System SHALL update warning/error display in real-time

### Requirement 15: Display Leader Trait Descriptions

**User Story:** As a user, I want to see trait descriptions when selecting leader traits, so that I understand what each trait does.

#### Acceptance Criteria

1. WHEN a leader trait is selected, THE System SHALL display the trait description
2. WHEN the trait description is displayed, THE System SHALL show ability details from game data
3. WHEN no trait is selected, THE System SHALL not display a description
4. WHEN trait selection changes, THE System SHALL update the description display

### Requirement 16: Calculate Equipment Limits Correctly

**User Story:** As a developer, I want equipment limits calculated correctly for all weirdo types and warband abilities, so that the UI displays accurate constraints.

#### Acceptance Criteria

1. WHEN a trooper has Cyborgs warband ability, THE System SHALL set equipment limit to 2
2. WHEN a trooper has any other warband ability, THE System SHALL set equipment limit to 1
3. WHEN a leader has Cyborgs warband ability, THE System SHALL set equipment limit to 3
4. WHEN a leader has any other warband ability, THE System SHALL set equipment limit to 2
5. WHEN equipment limit is calculated, THE System SHALL use memoized computation for performance
