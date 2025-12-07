# Requirements Document

## Introduction

This specification defines requirements for fixing pre-existing test failures in the Space Weirdos Warband Builder test suite. The failures are caused by missing context providers in test setups and unimplemented UI features that are tested but not yet implemented.

## Glossary

- **System**: The Space Weirdos Warband Builder test suite
- **GameDataProvider**: React Context provider that supplies game data to components
- **WarbandEditor**: Frontend React component for editing warbands
- **WeirdoEditor**: Frontend React component for editing individual weirdos
- **Test Wrapper**: A helper component that wraps test subjects with required context providers
- **ValidationErrorDisplay**: Component for displaying validation errors in the UI
- **WeirdoCostDisplay**: Component for displaying weirdo cost with warnings

## Requirements

### Requirement 1: Fix Missing Context Providers in Tests

**User Story:** As a developer, I want all tests to properly wrap components with required context providers, so that tests run without context errors.

#### Acceptance Criteria

1. WHEN WarbandEditor tests render the component, THE System SHALL wrap it with GameDataProvider
2. WHEN WeirdoEditor tests render the component, THE System SHALL wrap it with GameDataProvider
3. WHEN property-based tests render components, THE System SHALL wrap them with GameDataProvider
4. WHEN test wrappers are created, THE System SHALL provide mock game data to the context

### Requirement 2: Implement Validation Error Display in WeirdoEditor

**User Story:** As a user, I want to see validation errors in the WeirdoEditor, so that I know what needs to be fixed.

#### Acceptance Criteria

1. WHEN a weirdo has validation errors, THE System SHALL display error messages in the WeirdoEditor
2. WHEN validation errors include "At least one close combat weapon required", THE System SHALL display this message
3. WHEN validation state changes, THE System SHALL update error display in real-time
4. WHEN no validation errors exist, THE System SHALL not display the error section

### Requirement 3: Implement Cost Warning Display in WeirdoCostDisplay

**User Story:** As a user, I want to see cost warnings when approaching or exceeding limits, so that I can manage my weirdo costs effectively.

#### Acceptance Criteria

1. WHEN a weirdo cost is 18-19 points, THE System SHALL display "Approaching limit" warning
2. WHEN a weirdo cost exceeds 20 points, THE System SHALL display "Exceeds 20 point limit" error
3. WHEN cost changes, THE System SHALL update warning/error display in real-time
4. WHEN cost display is rendered, THE System SHALL apply appropriate CSS classes for warning and error states

### Requirement 4: Implement Leader Trait Description Display

**User Story:** As a user, I want to see leader trait descriptions when selecting traits, so that I understand what each trait does.

#### Acceptance Criteria

1. WHEN a leader trait is selected, THE System SHALL display the trait description
2. WHEN the trait description is displayed, THE System SHALL show ability details from game data
3. WHEN no trait is selected, THE System SHALL not display a description
4. WHEN trait selection changes, THE System SHALL update the description display

### Requirement 5: Create Test Helper Utilities

**User Story:** As a developer, I want reusable test helper utilities, so that test setup is consistent and maintainable.

#### Acceptance Criteria

1. WHEN tests need to render components with context, THE System SHALL provide a renderWithProviders helper
2. WHEN tests need mock game data, THE System SHALL provide a createMockGameData helper
3. WHEN tests need mock warbands, THE System SHALL provide a createMockWarband helper
4. WHEN test helpers are used, THE System SHALL maintain consistent mock data structure

### Requirement 6: Fix Test Selector Specificity Issues

**User Story:** As a developer, I want tests to use specific selectors that target unique elements, so that tests are reliable and don't match multiple elements.

#### Acceptance Criteria

1. WHEN tests query for cost display, THE System SHALL use specific selectors like data-testid or CSS classes
2. WHEN tests query for equipment max count, THE System SHALL use specific selectors that match the exact element
3. WHEN multiple elements contain similar text, THE System SHALL use more specific query methods
4. WHEN test selectors are updated, THE System SHALL maintain test readability and maintainability

### Requirement 7: Implement Warband-Level Cost Warning Display

**User Story:** As a user, I want to see warnings when my warband approaches or exceeds its point limit, so that I can manage my warband costs effectively.

#### Acceptance Criteria

1. WHEN a warband total cost reaches 90% of the point limit, THE System SHALL display "Approaching point limit" warning in WarbandEditor
2. WHEN a warband total cost exceeds the point limit, THE System SHALL display "Exceeds point limit!" error in WarbandEditor
3. WHEN warband cost changes, THE System SHALL update warning/error display in real-time
4. WHEN cost warnings are displayed, THE System SHALL apply appropriate CSS classes for visual styling

### Requirement 8: Implement Warband-Level Validation Error Banner

**User Story:** As a user, I want to see warband-level validation errors prominently displayed, so that I understand what rules are being violated.

#### Acceptance Criteria

1. WHEN a warband has validation errors that apply to the warband as a whole, THE System SHALL display an error banner in WarbandEditor
2. WHEN the 25-point rule is violated, THE System SHALL display "Only one weirdo may cost 21-25 points" in the error banner
3. WHEN validation errors are resolved, THE System SHALL hide the error banner
4. WHEN the error banner is displayed, THE System SHALL use the CSS class "error-banner" for styling
