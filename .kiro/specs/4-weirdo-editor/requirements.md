# Requirements Document

## Introduction

This document specifies the weirdo (character) editor for the Space Weirdos Warband Builder. It defines how users create, edit, and manage individual weirdos including attributes, weapons, equipment, psychic powers, and leader traits.

This spec focuses on the weirdo editing interface as a modal dialog. It depends on the design system spec (for styling), the warband list navigation spec (for WarbandContext), and the game rules spec (for cost calculations and validation).

## Glossary

- **Weirdo**: An individual character in the warband (leader or trooper)
- **Weirdo Editor Modal**: A modal dialog for editing individual weirdo properties
- **Modal Dialog**: An overlay window that appears on top of the warband editor
- **Attributes**: The five core stats (Speed, Defense, Firepower, Prowess, Willpower)
- **Equipment Limit**: Maximum number of equipment items based on weirdo type and warband ability
- **Selector Component**: A form control for choosing from available options
- **Warband Ability**: A faction-wide ability that modifies costs and limits (Mutants, Soldiers, Heavily Armed, Cyborgs)
- **Cost Modifier**: A reduction or change to point costs based on warband ability
- **Base Cost**: The unmodified point cost of an item from the data files
- **Modified Cost**: The point cost after applying warband ability modifiers

## Requirements

### Requirement 1

**User Story:** As a player, I want to add leaders and troopers to my warband, so that I can build my team composition.

#### Acceptance Criteria

1. WHEN a warband exists THEN the Warband Builder SHALL provide a button to add a leader
2. WHEN a warband exists THEN the Warband Builder SHALL provide a button to add a trooper
3. WHEN a warband already has a leader THEN the Warband Builder SHALL disable the add leader button
4. WHEN a weirdo is added THEN the Warband Builder SHALL open the weirdo editor modal with the new weirdo
5. WHEN a weirdo is added THEN the Warband Builder SHALL display it in the weirdo list
6. WHEN a weirdo is added THEN the Warband Builder SHALL initialize it with default attribute values

### Requirement 2

**User Story:** As a player, I want to remove weirdos from my warband, so that I can adjust my team composition.

#### Acceptance Criteria

1. WHEN a weirdo is displayed in the list THEN the Warband Builder SHALL provide a remove button
2. WHEN a user clicks remove THEN the Warband Builder SHALL delete the weirdo from the warband
3. WHEN a weirdo is removed THEN the Warband Builder SHALL update the warband total cost immediately
4. WHEN a weirdo is removed from the weirdo editor modal THEN the Warband Builder SHALL close the modal
5. WHEN a weirdo is removed THEN the Warband Builder SHALL update the weirdo list immediately

### Requirement 3

**User Story:** As a player, I want to edit weirdo attributes, so that I can customize their stats.

#### Acceptance Criteria

1. WHEN the weirdo editor modal is displayed THEN the Warband Builder SHALL display dropdown selectors for all five attributes
2. WHEN a user changes an attribute THEN the Warband Builder SHALL update the weirdo immediately
3. WHEN an attribute is displayed THEN the Warband Builder SHALL show the point cost for each level
4. WHEN a warband ability modifies attribute costs THEN the Warband Builder SHALL display the modified cost
5. WHEN an attribute changes THEN the Warband Builder SHALL recalculate the weirdo's total cost

### Requirement 4

**User Story:** As a player, I want to select weapons for my weirdos, so that I can equip them for combat.

#### Acceptance Criteria

1. WHEN the weirdo editor modal is displayed THEN the Warband Builder SHALL display a multi-select interface for close combat weapons
2. WHEN the weirdo editor modal is displayed THEN the Warband Builder SHALL display a multi-select interface for ranged weapons
3. WHEN weapons are displayed THEN the Warband Builder SHALL show name, cost, and notes for each weapon
4. WHEN a weirdo's Firepower is None THEN the Warband Builder SHALL disable ranged weapon selections
5. WHEN a warband ability modifies weapon costs THEN the Warband Builder SHALL display the modified cost
6. WHEN a user has Mutants ability selected AND views close combat weapons THEN the Warband Builder SHALL display costs reduced by 1 for Claws & Teeth, Horrible Claws & Teeth, and Whip/Tail
7. WHEN a user has Heavily Armed ability selected AND views ranged weapons THEN the Warband Builder SHALL display costs reduced by 1 for all ranged weapons
8. WHEN any weapon cost reduction would result in negative cost THEN the Warband Builder SHALL display 0 as the minimum cost
9. WHEN weapons change THEN the Warband Builder SHALL recalculate the weirdo's total cost

### Requirement 5

**User Story:** As a player, I want to select equipment for my weirdos, so that I can give them special gear.

#### Acceptance Criteria

1. WHEN the weirdo editor modal is displayed THEN the Warband Builder SHALL display a multi-select interface for equipment
2. WHEN equipment is displayed THEN the Warband Builder SHALL show name, cost, and effect for each item
3. WHEN equipment is displayed THEN the Warband Builder SHALL show the current count vs limit
4. WHEN the equipment limit is reached THEN the Warband Builder SHALL disable additional equipment selections
5. WHEN a warband ability modifies equipment costs THEN the Warband Builder SHALL display the modified cost
6. WHEN a user has Soldiers ability selected AND views equipment THEN the Warband Builder SHALL display 0 cost for Grenade, Heavy Armor, and Medkit
7. WHEN any equipment cost reduction would result in negative cost THEN the Warband Builder SHALL display 0 as the minimum cost
8. WHEN equipment changes THEN the Warband Builder SHALL recalculate the weirdo's total cost

### Requirement 6

**User Story:** As a player, I want to select psychic powers for my weirdos, so that I can give them special abilities.

#### Acceptance Criteria

1. WHEN the weirdo editor modal is displayed THEN the Warband Builder SHALL display a multi-select interface for psychic powers
2. WHEN psychic powers are displayed THEN the Warband Builder SHALL show name, cost, and effect for each power
3. WHEN no warband ability currently modifies psychic power costs THEN the Warband Builder SHALL display base costs, but SHALL use the same cost calculation pattern for future extensibility
4. WHEN psychic powers change THEN the Warband Builder SHALL recalculate the weirdo's total cost

### Requirement 7

**User Story:** As a player, I want to select a leader trait for my leader, so that I can customize their special ability.

#### Acceptance Criteria

1. WHEN the weirdo editor modal displays a leader THEN the Warband Builder SHALL display a dropdown for leader trait selection
2. WHEN the weirdo editor modal displays a trooper THEN the Warband Builder SHALL hide the leader trait selector
3. WHEN leader traits are displayed THEN the Warband Builder SHALL show the description for each trait
4. WHEN a leader trait is selected THEN the Warband Builder SHALL include a "None" option

### Requirement 8

**User Story:** As a player, I want to open and close the weirdo editor modal, so that I can edit weirdos without scrolling and maintain focus on the warband editor.

#### Acceptance Criteria

1. WHEN a user clicks on a weirdo in the weirdo list THEN the Warband Builder SHALL open the weirdo editor modal with that weirdo loaded
2. WHEN the weirdo editor modal is displayed THEN the Warband Builder SHALL show the weirdo's name and type prominently in the modal header
3. WHEN the weirdo editor modal is displayed THEN the Warband Builder SHALL provide a close button
4. WHEN a user clicks the close button THEN the Warband Builder SHALL close the modal and preserve any changes made to the weirdo
5. WHEN a user clicks outside the modal THEN the Warband Builder SHALL close the modal and preserve any changes
6. WHEN a user presses the Escape key THEN the Warband Builder SHALL close the modal and preserve any changes
7. WHEN the modal is open THEN the Warband Builder SHALL prevent scrolling of the underlying warband editor
8. WHEN the modal is open THEN the Warband Builder SHALL display a semi-transparent overlay behind the modal

### Requirement 9

**User Story:** As a developer, I want all frontend-backend communication to use API calls, so that the frontend and backend remain properly decoupled and maintainable.

#### Acceptance Criteria

1. WHEN the frontend needs to fetch game data (attributes, weapons, equipment, psychic powers, leader traits) THEN the Frontend SHALL make HTTP GET requests to backend API endpoints
2. WHEN the frontend needs to calculate weirdo costs THEN the Frontend SHALL send HTTP POST requests to the backend cost calculation API
3. WHEN the frontend needs to add or update weirdos THEN the Frontend SHALL send HTTP requests to the backend API
4. WHEN the frontend needs to validate weirdo configurations THEN the Frontend SHALL make HTTP requests to backend validation API endpoints
5. WHEN the frontend receives API responses THEN the Frontend SHALL handle both success and error responses appropriately
6. WHEN making API calls THEN the Frontend SHALL NOT directly import or use backend service classes (CostEngine, ValidationService, DataRepository)
7. WHEN the backend provides game data and calculations THEN the Backend SHALL expose RESTful API endpoints for all weirdo operations

### Requirement 10

**User Story:** As a user, I want the item cost displays in selectors to match the backend calculations, so that the UI is consistent and accurate.

#### Acceptance Criteria

1. WHEN the backend CostEngine calculates a weapon cost THEN the WeaponSelector SHALL display the same cost
2. WHEN the backend CostEngine calculates an equipment cost THEN the EquipmentSelector SHALL display the same cost
3. WHEN the backend CostEngine calculates a psychic power cost THEN the PsychicPowerSelector SHALL display the same cost
4. WHEN no warband ability is selected THEN the selectors SHALL display base costs unchanged
5. WHEN the total weirdo cost is calculated THEN it SHALL match the sum of displayed item costs plus attribute costs
6. WHEN a user changes the warband ability THEN the WeaponSelector, EquipmentSelector, and PsychicPowerSelector SHALL immediately update displayed costs to reflect the new modifiers

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
