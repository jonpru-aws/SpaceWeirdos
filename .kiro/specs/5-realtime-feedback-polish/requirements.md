# Requirements Document

## Introduction

This document specifies the real-time feedback and polish features for the Space Weirdos Warband Builder. It defines how the system provides immediate visual feedback for cost calculations, validation errors, warning indicators, and sticky cost displays.

This spec focuses on the UX enhancements that make the application feel responsive and polished. It depends on all previous UI specs and the game rules spec for cost calculations and validation.

## Glossary

- **Real-time Feedback**: Immediate visual updates in response to user actions
- **Sticky Display**: UI elements that remain visible while scrolling
- **Warning Indicator**: Visual cue that a limit is being approached
- **Cost Badge**: Component displaying base and modified costs
- **Validation Tooltip**: Contextual error information displayed on hover
- **Cost Breakdown**: Detailed breakdown of cost components

## Requirements

### Requirement 1

**User Story:** As a player, I want to see real-time point cost calculations as I build my warband, so that I can make informed decisions about my selections.

#### Acceptance Criteria

1. WHEN a user adds or removes an attribute, weapon, equipment, or psychic power THEN the Warband Builder SHALL immediately recalculate the weirdo's total point cost
2. WHEN a weirdo's point cost changes THEN the Warband Builder SHALL immediately recalculate the warband's total point cost
3. WHEN point costs are displayed THEN the Warband Builder SHALL show both the individual weirdo costs and the warband total cost
4. WHEN costs are recalculated THEN the Warband Builder SHALL update the display within 100 milliseconds
5. WHEN warband ability modifiers apply THEN the Warband Builder SHALL visually indicate modified costs with strikethrough styling

### Requirement 2

**User Story:** As a player, I want to see warning indicators when approaching point limits, so that I know when I'm close to exceeding my budget.

#### Acceptance Criteria

1. WHEN a weirdo cost is within 10 points of their limit (20 for troopers, 25 for leaders) THEN the Warband Builder SHALL display a warning indicator
2. WHEN a weirdo cost exceeds their limit THEN the Warband Builder SHALL display an error indicator
3. WHEN the warband cost is within 15 points of the point limit THEN the Warband Builder SHALL display a warning indicator
4. WHEN the warband cost exceeds the point limit THEN the Warband Builder SHALL display an error indicator
5. WHEN warning indicators are displayed THEN the Warband Builder SHALL use orange/yellow color
6. WHEN error indicators are displayed THEN the Warband Builder SHALL use red color

### Requirement 3

**User Story:** As a player, I want the total point costs to remain visible while scrolling, so that I can always see how my choices affect the total cost.

#### Acceptance Criteria

1. WHEN a user scrolls within the weirdo editor THEN the Warband Builder SHALL keep the weirdo's total point cost visible at the top of the editor
2. WHEN a user scrolls within the warband editor THEN the Warband Builder SHALL keep the warband's total point cost visible at the top of the editor
3. WHEN the weirdo total cost display is fixed THEN the Warband Builder SHALL ensure it does not obscure selection controls
4. WHEN the warband total cost display is fixed THEN the Warband Builder SHALL ensure it does not obscure weirdo management controls
5. WHEN the sticky cost display is shown THEN the Warband Builder SHALL use a semi-transparent or bordered background to maintain readability
6. WHEN scrolling stops THEN the Warband Builder SHALL maintain the sticky display position

### Requirement 4

**User Story:** As a player, I want to see visual feedback for validation errors, so that I can quickly identify and fix issues with my warband.

#### Acceptance Criteria

1. WHEN a weirdo fails validation checks THEN the Warband Builder SHALL apply visual highlighting to that weirdo in the warband editor
2. WHEN a weirdo has validation errors THEN the Warband Builder SHALL distinguish the weirdo from valid weirdos through visual styling
3. WHEN a weirdo has the error CSS class applied THEN the Warband Builder SHALL display the specific validation error message in a tooltip
4. WHEN a user hovers over a weirdo with validation errors THEN the Warband Builder SHALL show a tooltip containing the validation error details
5. WHEN validation errors are resolved THEN the Warband Builder SHALL immediately remove the error styling
6. WHEN multiple validation errors exist THEN the Warband Builder SHALL display all errors in the tooltip
7. WHEN a weirdo exceeds point limits THEN the Warband Builder SHALL display the error with the current point total

### Requirement 5

**User Story:** As a player, I want to see a detailed cost breakdown for my weirdos, so that I understand how the total cost is calculated.

#### Acceptance Criteria

1. WHEN a weirdo cost display is shown THEN the Warband Builder SHALL provide an option to expand the cost breakdown
2. WHEN the cost breakdown is expanded THEN the Warband Builder SHALL show costs for attributes, weapons, equipment, and psychic powers separately
3. WHEN the cost breakdown is expanded THEN the Warband Builder SHALL show the base cost and any modifiers applied
4. WHEN the cost breakdown is collapsed THEN the Warband Builder SHALL show only the total cost
5. WHEN the cost breakdown is toggled THEN the Warband Builder SHALL animate the transition smoothly

## Items Requiring Clarification

### 1. Cost Update Debouncing
**Question:** Should cost updates be debounced to avoid excessive recalculation, or update immediately?

**Current Assumption:** Debounce to 100ms for performance, as specified in requirements.

### 2. Sticky Display Behavior
**Question:** Should sticky displays use CSS position: sticky or JavaScript scroll listeners?

**Current Assumption:** Use CSS position: sticky for better performance and simpler implementation.

### 3. Validation Tooltip Positioning
**Question:** Should tooltips appear above, below, or to the side of the element?

**Current Assumption:** Tooltips appear above by default, adjust if insufficient space.

### 4. Cost Breakdown Persistence
**Question:** Should the expanded/collapsed state of cost breakdown persist across sessions?

**Current Assumption:** No persistence, always starts collapsed.

### 5. Performance Optimization
**Question:** Should expensive components be memoized or use React.memo?

**Current Assumption:** Yes, use React.memo for WeirdoCard, AttributeSelector, and cost displays.
