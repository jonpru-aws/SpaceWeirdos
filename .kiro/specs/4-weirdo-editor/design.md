# Design Document: Weirdo Editor

## Overview

This design document specifies the weirdo (character) editing interface. The system provides comprehensive controls for creating and customizing weirdos including attributes, weapons, equipment, psychic powers, and leader traits.

**Key Design Goals:**
- Intuitive multi-select interfaces for weapons, equipment, and powers
- Clear display of costs and descriptions
- Conditional rendering based on weirdo type and attributes
- Progressive disclosure of weirdo options
- Integration with cost calculation system

**Dependencies:**
- Spec 1: UI Design System
- Spec 2: Warband List & Navigation (WarbandContext)
- Spec 3: Warband Properties Editor (WarbandEditor shell)
- Game Rules Spec (CostEngine, ValidationService, game data)

## Components

### WeirdosList
Displays all weirdos with add/remove controls.

### WeirdoCard
Compact display of weirdo in list with name, type, cost, and error indicator.

### WeirdoEditor
Comprehensive editor with all weirdo customization options.

### AttributeSelector
Dropdown for each attribute with cost display.

### WeaponSelector
Multi-select checkbox list for weapons with costs and notes.

### EquipmentSelector
Multi-select checkbox list for equipment with limit enforcement.

### PsychicPowerSelector
Multi-select checkbox list for psychic powers.

### LeaderTraitSelector
Dropdown for leader trait (only shown for leaders).

### Shared Components

**SelectWithCost**: Reusable dropdown with cost display
**ItemList**: Reusable checkbox list with descriptions and costs

## Correctness Properties

**Property 1: Add leader button disabled when leader exists**
*For any* warband state, the "Add Leader" button should be disabled when the warband already has a leader.
**Validates: Requirements 1.3**

**Property 2: Equipment selections disabled at limit**
*For any* weirdo with equipment at the limit, additional equipment checkboxes should be disabled.
**Validates: Requirements 5.4**

**Property 3: Ranged weapons disabled when Firepower is None**
*For any* weirdo with Firepower level None, the ranged weapon selector should be disabled.
**Validates: Requirements 4.4**

**Property 4: Progressive disclosure based on warband state**
*For any* application state, weirdo creation options should be hidden when no warband exists, and visible when a warband is created.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

**Property 5: Leader trait selector only shown for leaders**
*For any* weirdo, the leader trait selector should only be visible when the weirdo type is "leader".
**Validates: Requirements 7.2**

## Testing Strategy

- Unit tests for all selector components
- Property-based tests for conditional rendering and limits
- Integration tests for weirdo creation and editing flows
- Accessibility tests for form controls

## Implementation Notes

- Use shared SelectWithCost and ItemList components for consistency
- Integrate with CostEngine for real-time cost calculations
- Apply design system styles throughout
- Implement progressive disclosure with conditional rendering
