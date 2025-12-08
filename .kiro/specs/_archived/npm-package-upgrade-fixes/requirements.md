# Requirements Document

## Introduction

This specification addresses critical test failures that emerged after npm package upgrades in the Space Weirdos warband builder application. The failures span TypeScript compilation errors, React component rendering issues, state management problems, and API integration breakages. The system must restore full functionality while maintaining type safety and code quality standards.

## Glossary

- **System**: The Space Weirdos warband builder application (frontend and backend)
- **WarbandContext**: React context provider managing warband state and operations
- **WeirdoEditor**: React component for editing individual weirdo (character) properties
- **WeirdosList**: React component displaying the list of weirdos in a warband
- **CostDisplay**: React component showing cost breakdown for weirdos and warbands
- **ValidationService**: Backend service validating warband and weirdo data
- **APIClient**: Frontend service layer for HTTP communication with backend
- **Property-Based Test**: Automated test verifying universal properties across generated inputs

## Requirements

### Requirement 1

**User Story:** As a developer, I want the TypeScript codebase to compile without errors, so that the application can be built and deployed successfully.

#### Acceptance Criteria

1. WHEN the TypeScript compiler runs THEN the System SHALL complete compilation without type errors
2. WHEN the build process executes THEN the System SHALL produce valid JavaScript output without compilation failures
3. WHEN TypeScript strict mode is enabled THEN the System SHALL satisfy all type constraints without using type assertions
4. WHEN unused variables exist in the codebase THEN the System SHALL either remove them or mark them as intentionally unused
5. WHEN the System compiles THEN the System SHALL exit with status code 0

### Requirement 2

**User Story:** As a developer, I want proper error handling patterns throughout the codebase, so that errors are caught and typed correctly without unsafe type assertions.

#### Acceptance Criteria

1. WHEN an error is caught in a catch block THEN the System SHALL type the error parameter as unknown
2. WHEN an error is accessed in a catch block THEN the System SHALL use type guards to verify error type before accessing properties
3. WHEN a type assertion is used THEN the System SHALL include a documentation comment explaining why the assertion is safe
4. WHEN API responses are parsed THEN the System SHALL use explicit type definitions rather than implicit any types
5. WHEN error messages are constructed THEN the System SHALL safely extract error information using type guards

### Requirement 3

**User Story:** As a user, I want the WarbandContext to manage warband state correctly, so that I can add, remove, and modify weirdos in my warband.

#### Acceptance Criteria

1. WHEN a leader weirdo is added THEN the WarbandContext SHALL add the weirdo to the warband with isLeader set to true
2. WHEN a trooper weirdo is added THEN the WarbandContext SHALL add the weirdo to the warband with isLeader set to false
3. WHEN a weirdo is added THEN the WarbandContext SHALL automatically select the newly added weirdo
4. WHEN a second leader is added to a warband that already has a leader THEN the WarbandContext SHALL throw an error preventing the addition
5. WHEN a weirdo is removed THEN the WarbandContext SHALL remove the weirdo from the warband array
6. WHEN the selected weirdo is removed THEN the WarbandContext SHALL clear the current selection
7. WHEN a weirdo is added or removed THEN the WarbandContext SHALL recalculate the warband total cost
8. WHEN weirdo attributes are updated THEN the WarbandContext SHALL recalculate both weirdo cost and warband total cost

### Requirement 4

**User Story:** As a user, I want the WeirdoEditor to display all editing sections when a weirdo is selected, so that I can modify all aspects of my weirdo.

#### Acceptance Criteria

1. WHEN a weirdo is selected THEN the WeirdoEditor SHALL display the basic information section
2. WHEN a weirdo is selected THEN the WeirdoEditor SHALL display the attributes section
3. WHEN a weirdo is selected THEN the WeirdoEditor SHALL display the close combat weapons section
4. WHEN a weirdo is selected THEN the WeirdoEditor SHALL display the ranged weapons section
5. WHEN a weirdo is selected THEN the WeirdoEditor SHALL display the equipment section
6. WHEN a weirdo is selected THEN the WeirdoEditor SHALL display the psychic powers section
7. WHEN a leader weirdo is selected THEN the WeirdoEditor SHALL display the leader trait section
8. WHEN no weirdo is selected THEN the WeirdoEditor SHALL display an empty state message

### Requirement 5

**User Story:** As a user, I want to see detailed cost breakdowns for my weirdos, so that I understand how points are allocated.

#### Acceptance Criteria

1. WHEN the cost breakdown toggle is clicked THEN the CostDisplay SHALL expand to show detailed cost components
2. WHEN the cost breakdown is expanded THEN the CostDisplay SHALL display attributes cost
3. WHEN the cost breakdown is expanded THEN the CostDisplay SHALL display weapons cost
4. WHEN the cost breakdown is expanded THEN the CostDisplay SHALL display equipment cost
5. WHEN the cost breakdown is expanded THEN the CostDisplay SHALL display psychic powers cost
6. WHEN the cost breakdown is expanded THEN the CostDisplay SHALL display leader trait cost
7. WHEN the cost breakdown toggle is clicked while expanded THEN the CostDisplay SHALL collapse to hide the breakdown
8. WHEN cost data is loading THEN the CostDisplay SHALL display a loading indicator

### Requirement 6

**User Story:** As a user, I want the weirdos list to accurately reflect the current warband state, so that I can see all my weirdos and their status.

#### Acceptance Criteria

1. WHEN weirdos are added to the warband THEN the WeirdosList SHALL display all weirdos in the list
2. WHEN a warband has a leader THEN the WeirdosList SHALL disable the Add Leader button
3. WHEN a warband has no leader THEN the WeirdosList SHALL enable the Add Leader button
4. WHEN the Add Leader button is clicked THEN the WeirdosList SHALL create a new leader weirdo with default properties
5. WHEN the Add Trooper button is clicked THEN the WeirdosList SHALL create a new trooper weirdo with default properties

### Requirement 7

**User Story:** As a user, I want real-time cost calculations as I modify my warband, so that I always know my current point total.

#### Acceptance Criteria

1. WHEN weirdo attributes change THEN the System SHALL recalculate the weirdo cost within 100ms
2. WHEN weirdo cost changes THEN the System SHALL recalculate the warband total cost
3. WHEN warband ability changes THEN the System SHALL recalculate all affected costs
4. WHEN cost calculations are triggered rapidly THEN the System SHALL debounce updates to prevent excessive recalculation
5. WHEN cost values are unchanged THEN the System SHALL use memoized values to avoid unnecessary recalculation

### Requirement 8

**User Story:** As a user, I want to save my warband with validation, so that I cannot save invalid warband configurations.

#### Acceptance Criteria

1. WHEN the save button is clicked THEN the System SHALL call the validation API before attempting to save
2. WHEN validation fails THEN the System SHALL prevent the save API call from executing
3. WHEN validation fails THEN the System SHALL display validation errors inline near the relevant fields
4. WHEN validation succeeds and save succeeds THEN the System SHALL call the success callback
5. WHEN validation succeeds but save fails THEN the System SHALL call the error callback
6. WHEN an existing warband is saved THEN the System SHALL call the update API endpoint with the warband ID

### Requirement 9

**User Story:** As a user, I want to delete warbands with confirmation, so that I don't accidentally lose my work.

#### Acceptance Criteria

1. WHEN the delete button is clicked THEN the System SHALL display a confirmation dialog
2. WHEN the confirmation dialog is confirmed THEN the System SHALL call the delete API endpoint
3. WHEN the delete API succeeds THEN the System SHALL remove the warband from the displayed list
4. WHEN the delete API succeeds THEN the System SHALL display a success notification
5. WHEN the confirmation dialog is cancelled THEN the System SHALL not call the delete API endpoint

### Requirement 10

**User Story:** As a developer, I want property-based tests to use valid test data generators, so that tests verify actual business logic rather than validation rules.

#### Acceptance Criteria

1. WHEN property-based tests generate warband data THEN the System SHALL ensure warband names are non-empty strings
2. WHEN property-based tests generate weirdo data THEN the System SHALL ensure weirdo names are non-empty strings
3. WHEN property-based tests generate attribute values THEN the System SHALL ensure values are within valid ranges
4. WHEN property-based tests generate equipment selections THEN the System SHALL respect equipment limit constraints
5. WHEN property-based tests fail THEN the System SHALL provide clear counterexamples showing the failing input

### Requirement 11

**User Story:** As a user, I want equipment selection to be disabled when limits are reached, so that I cannot exceed equipment constraints.

#### Acceptance Criteria

1. WHEN the equipment limit is reached THEN the System SHALL disable unselected equipment options
2. WHEN equipment is deselected THEN the System SHALL re-enable equipment options if under the limit
3. WHEN the equipment limit is reached THEN the System SHALL allow deselecting currently selected equipment
4. WHEN the equipment limit changes THEN the System SHALL update the disabled state of equipment options

### Requirement 12

**User Story:** As a user, I want to see the total cost displayed in the warband list, so that I can quickly compare warband point totals.

#### Acceptance Criteria

1. WHEN viewing the warband list THEN the System SHALL display the total cost for each warband
2. WHEN a warband cost changes THEN the System SHALL update the displayed total cost
3. WHEN a warband has no weirdos THEN the System SHALL display a cost of 0
