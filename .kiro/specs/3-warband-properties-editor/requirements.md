# Requirements Document

## Introduction

This document specifies the warband properties editor for the Space Weirdos Warband Builder. It defines how users edit warband-level settings including name, point limit, and warband ability, with real-time validation and visual organization.

This spec focuses on the warband properties section of the editor. It depends on the design system spec (for styling), the warband list spec (for WarbandContext), and the game rules spec (for validation).

## Glossary

- **Warband Properties**: The warband-level settings (name, point limit, ability)
- **Warband Editor**: The main editing interface containing warband properties and weirdo management
- **Point Limit**: The maximum points allowed for the warband (75 or 125)
- **Warband Ability**: An optional special ability that modifies costs or rules
- **Validation**: Checking that warband properties meet requirements
- **Visual Organization**: Clear separation and layout of editor sections

## Requirements

### Requirement 1

**User Story:** As a player, I want to edit my warband's name, so that I can give it a meaningful identifier.

#### Acceptance Criteria

1. WHEN the warband editor is displayed THEN the Warband Builder SHALL provide a text input for the warband name
2. WHEN a user types in the warband name input THEN the Warband Builder SHALL update the warband name in real-time
3. WHEN the warband name input is empty THEN the Warband Builder SHALL display a validation error
4. WHEN the warband name is valid THEN the Warband Builder SHALL remove any validation error styling
5. WHEN the warband name input has focus THEN the Warband Builder SHALL display a focus indicator

### Requirement 2

**User Story:** As a player, I want to select my warband's point limit, so that I can build within the game's constraints.

#### Acceptance Criteria

1. WHEN the warband editor is displayed THEN the Warband Builder SHALL provide radio buttons for point limit selection (75 or 125)
2. WHEN a user selects a point limit THEN the Warband Builder SHALL update the warband point limit immediately
3. WHEN a point limit is selected THEN the Warband Builder SHALL visually indicate the selected option
4. WHEN the point limit changes THEN the Warband Builder SHALL recalculate whether the warband exceeds the new limit

### Requirement 3

**User Story:** As a player, I want to select an optional warband ability, so that I can customize my warband's special rules.

#### Acceptance Criteria

1. WHEN the warband editor is displayed THEN the Warband Builder SHALL provide a dropdown for warband ability selection
2. WHEN the warband ability dropdown is opened THEN the Warband Builder SHALL display all available warband abilities with descriptions
3. WHEN a user selects a warband ability THEN the Warband Builder SHALL update the warband ability immediately
4. WHEN a warband ability is selected THEN the Warband Builder SHALL recalculate all weirdo costs with the ability modifiers
5. WHEN no warband ability is selected THEN the Warband Builder SHALL display costs without modifiers
6. WHEN the warband ability dropdown includes a "None" option THEN the Warband Builder SHALL allow deselecting the ability

### Requirement 4

**User Story:** As a player, I want clear visual organization of the warband editor, so that I can easily find and edit warband properties.

#### Acceptance Criteria

1. WHEN the warband editor is displayed THEN the Warband Builder SHALL show warband properties in a distinct section at the top
2. WHEN the warband editor is displayed THEN the Warband Builder SHALL use a card or panel layout for the properties section
3. WHEN the warband editor is displayed THEN the Warband Builder SHALL label the properties section clearly (e.g., "Warband Properties")
4. WHEN the warband editor is displayed THEN the Warband Builder SHALL use consistent spacing between form fields
5. WHEN the warband editor is displayed THEN the Warband Builder SHALL group related fields together (name and point limit, ability separately)

### Requirement 5

**User Story:** As a player, I want to save my warband changes, so that my edits are persisted.

#### Acceptance Criteria

1. WHEN the warband editor is displayed THEN the Warband Builder SHALL provide a save button
2. WHEN a user clicks the save button THEN the Warband Builder SHALL validate the warband before saving
3. WHEN validation passes THEN the Warband Builder SHALL save the warband to storage
4. WHEN validation fails THEN the Warband Builder SHALL display validation errors and prevent saving
5. WHEN a warband is successfully saved THEN the Warband Builder SHALL display a success notification
6. WHEN a warband save fails THEN the Warband Builder SHALL display an error notification

### Requirement 6

**User Story:** As a developer, I want all frontend-backend communication to use API calls, so that the frontend and backend remain properly decoupled and maintainable.

#### Acceptance Criteria

1. WHEN the frontend needs to validate warband properties THEN the Frontend SHALL make HTTP requests to backend validation API endpoints
2. WHEN the frontend needs to save warband changes THEN the Frontend SHALL send HTTP PUT requests to the backend API
3. WHEN the frontend needs warband ability data THEN the Frontend SHALL fetch it via HTTP GET requests to the backend API
4. WHEN the frontend receives API responses THEN the Frontend SHALL handle both success and error responses appropriately
5. WHEN making API calls THEN the Frontend SHALL NOT directly import or use backend service classes
6. WHEN the backend provides validation THEN the Backend SHALL expose RESTful API endpoints for validation operations

## Items Requiring Clarification

### 1. Auto-save
**Question:** Should changes auto-save as the user edits, or require explicit save action?

**Current Assumption:** Explicit save action required, no auto-save.

### 2. Dirty State Indicator
**Question:** Should the UI indicate when there are unsaved changes?

**Current Assumption:** No dirty state indicator initially, can be added as enhancement.

### 3. Warband Ability Descriptions
**Question:** Should ability descriptions be displayed inline or in a tooltip?

**Current Assumption:** Descriptions displayed inline in the dropdown for clarity.

### 4. Validation Timing
**Question:** Should validation occur on blur, on change, or only on save?

**Current Assumption:** Validation on blur for individual fields, full validation on save.

### 5. Cancel/Revert Changes
**Question:** Should there be a way to cancel/revert unsaved changes?

**Current Assumption:** No cancel/revert initially, users can reload from list.
