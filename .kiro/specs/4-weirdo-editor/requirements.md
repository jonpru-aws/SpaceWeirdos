# Requirements Document

## Introduction

This document specifies the weirdo (character) editor for the Space Weirdos Warband Builder. It defines how users create, edit, and manage individual weirdos including attributes, weapons, equipment, psychic powers, and leader traits.

This spec focuses on the weirdo editing interface. It depends on the design system spec (for styling), the warband properties spec (for WarbandEditor shell), and the game rules spec (for cost calculations and validation).

## Glossary

- **Weirdo**: An individual character in the warband (leader or trooper)
- **Weirdo Editor**: The UI component for editing individual weirdo properties
- **Attributes**: The five core stats (Speed, Defense, Firepower, Prowess, Willpower)
- **Equipment Limit**: Maximum number of equipment items based on weirdo type and warband ability
- **Progressive Disclosure**: Showing weirdo editing options only after warband is created
- **Selector Component**: A form control for choosing from available options

## Requirements

### Requirement 1

**User Story:** As a player, I want to add leaders and troopers to my warband, so that I can build my team composition.

#### Acceptance Criteria

1. WHEN a warband exists THEN the Warband Builder SHALL provide a button to add a leader
2. WHEN a warband exists THEN the Warband Builder SHALL provide a button to add a trooper
3. WHEN a warband already has a leader THEN the Warband Builder SHALL disable the add leader button
4. WHEN a weirdo is added THEN the Warband Builder SHALL automatically select it for editing
5. WHEN a weirdo is added THEN the Warband Builder SHALL display it in the weirdo list
6. WHEN a weirdo is added THEN the Warband Builder SHALL initialize it with default attribute values

### Requirement 2

**User Story:** As a player, I want to remove weirdos from my warband, so that I can adjust my team composition.

#### Acceptance Criteria

1. WHEN a weirdo is displayed in the list THEN the Warband Builder SHALL provide a remove button
2. WHEN a user clicks remove THEN the Warband Builder SHALL delete the weirdo from the warband
3. WHEN a weirdo is removed THEN the Warband Builder SHALL update the warband total cost immediately
4. WHEN the last weirdo is removed THEN the Warband Builder SHALL clear the weirdo editor section
5. WHEN a selected weirdo is removed THEN the Warband Builder SHALL deselect it

### Requirement 3

**User Story:** As a player, I want to edit weirdo attributes, so that I can customize their stats.

#### Acceptance Criteria

1. WHEN a weirdo is selected THEN the Warband Builder SHALL display dropdown selectors for all five attributes
2. WHEN a user changes an attribute THEN the Warband Builder SHALL update the weirdo immediately
3. WHEN an attribute is displayed THEN the Warband Builder SHALL show the point cost for each level
4. WHEN a warband ability modifies attribute costs THEN the Warband Builder SHALL display the modified cost
5. WHEN an attribute changes THEN the Warband Builder SHALL recalculate the weirdo's total cost

### Requirement 4

**User Story:** As a player, I want to select weapons for my weirdos, so that I can equip them for combat.

#### Acceptance Criteria

1. WHEN a weirdo is selected THEN the Warband Builder SHALL display a multi-select interface for close combat weapons
2. WHEN a weirdo is selected THEN the Warband Builder SHALL display a multi-select interface for ranged weapons
3. WHEN weapons are displayed THEN the Warband Builder SHALL show name, cost, and notes for each weapon
4. WHEN a weirdo's Firepower is None THEN the Warband Builder SHALL disable ranged weapon selections
5. WHEN a warband ability modifies weapon costs THEN the Warband Builder SHALL display the modified cost
6. WHEN weapons change THEN the Warband Builder SHALL recalculate the weirdo's total cost

### Requirement 5

**User Story:** As a player, I want to select equipment for my weirdos, so that I can give them special gear.

#### Acceptance Criteria

1. WHEN a weirdo is selected THEN the Warband Builder SHALL display a multi-select interface for equipment
2. WHEN equipment is displayed THEN the Warband Builder SHALL show name, cost, and effect for each item
3. WHEN equipment is displayed THEN the Warband Builder SHALL show the current count vs limit
4. WHEN the equipment limit is reached THEN the Warband Builder SHALL disable additional equipment selections
5. WHEN a warband ability modifies equipment costs THEN the Warband Builder SHALL display the modified cost
6. WHEN equipment changes THEN the Warband Builder SHALL recalculate the weirdo's total cost

### Requirement 6

**User Story:** As a player, I want to select psychic powers for my weirdos, so that I can give them special abilities.

#### Acceptance Criteria

1. WHEN a weirdo is selected THEN the Warband Builder SHALL display a multi-select interface for psychic powers
2. WHEN psychic powers are displayed THEN the Warband Builder SHALL show name, cost, and effect for each power
3. WHEN psychic powers change THEN the Warband Builder SHALL recalculate the weirdo's total cost

### Requirement 7

**User Story:** As a player, I want to select a leader trait for my leader, so that I can customize their special ability.

#### Acceptance Criteria

1. WHEN a leader is selected THEN the Warband Builder SHALL display a dropdown for leader trait selection
2. WHEN a trooper is selected THEN the Warband Builder SHALL hide the leader trait selector
3. WHEN leader traits are displayed THEN the Warband Builder SHALL show the description for each trait
4. WHEN a leader trait is selected THEN the Warband Builder SHALL include a "None" option

### Requirement 8

**User Story:** As a player, I want the system to require warband creation before showing weirdo options, so that I establish the warband context first.

#### Acceptance Criteria

1. WHEN no warband exists THEN the Warband Builder SHALL hide all weirdo creation options
2. WHEN a warband is created THEN the Warband Builder SHALL display the weirdo creation options
3. WHEN weirdo options are hidden THEN the Warband Builder SHALL display a message indicating warband creation is required
4. WHEN weirdo options are revealed THEN the Warband Builder SHALL provide clear visual indication

## Items Requiring Clarification

### 1. Weirdo Names
**Question:** Should weirdos have editable names, or use default names (Leader, Trooper 1, etc.)?

**Current Assumption:** Weirdos have editable names for personalization.

### 2. Weirdo Duplication
**Question:** Should users be able to duplicate a weirdo to quickly create similar characters?

**Current Assumption:** No duplication feature initially.

### 3. Weapon Requirements
**Question:** Should the system enforce minimum weapon requirements (e.g., at least one close combat weapon)?

**Current Assumption:** Validation enforces weapon requirements per game rules.

### 4. Equipment Categories
**Question:** Are there equipment categories or restrictions beyond the count limit?

**Current Assumption:** Only count limit enforced, no categories.
