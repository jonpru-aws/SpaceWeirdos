# Requirements Document

## Introduction

This document specifies the requirements for a Space Weirdos Warband Builder application. The application enables users to create and manage warbands for the Space Weirdos tabletop game by selecting leaders, troopers, attributes, weapons, equipment, psychic powers, and special abilities while adhering to point cost constraints and game rules.

The system will provide a user interface for warband creation, validate all selections against game rules, calculate point costs automatically, and persist warband data for later retrieval and modification.

## Glossary

- **Warband**: A collection of Space Weirdos consisting of one Leader and zero or more Troopers
- **Space Weirdo**: An individual character unit within a warband (either a Leader or Trooper)
- **Leader**: The primary character in a warband with special traits and abilities
- **Trooper**: A non-leader member of a warband
- **Point Cost**: The numerical value assigned to attributes, weapons, equipment, and powers
- **Total Point Cost**: The sum of all point costs for a Space Weirdo or Warband
- **Attribute**: A character statistic (Speed, Defense, Firepower, Prowess, or Willpower)
- **Attribute Level**: The value of an attribute (e.g., 1, 2, 3 for Speed; 2d6, 2d8, 2d10 for others)
- **Close Combat Weapon**: A melee weapon used in hand-to-hand combat
- **Ranged Weapon**: A weapon used to attack from a distance
- **Equipment**: Special items that provide passive or active abilities
- **Psychic Power**: Supernatural abilities that can be purchased for weirdos
- **Leader Trait**: A special ability unique to the warband leader
- **Warband Ability**: A faction-wide ability that applies to all members of the warband
- **Warband Builder**: The application system that creates and validates warbands

## Requirements

### Requirement 1

**User Story:** As a player, I want to create a new warband with a name and point limit, so that I can begin building my team within the game's constraints.

#### Acceptance Criteria

1. WHEN a user creates a new warband THEN the Warband Builder SHALL initialize the warband name with the default value "New Warband"
2. WHEN a user creates a new warband THEN the Warband Builder SHALL allow the user to modify the default warband name
3. WHEN a user creates a new warband THEN the Warband Builder SHALL require the user to select a point limit of either 75 or 125 points
4. WHEN a warband is created THEN the Warband Builder SHALL initialize the warband with a total point cost of zero
5. WHEN a warband is created THEN the Warband Builder SHALL allow the user to optionally select one warband ability from the available options
6. WHEN a warband name is provided THEN the Warband Builder SHALL accept any non-empty string as a valid name
7. WHEN no warband ability is selected THEN the Warband Builder SHALL apply no cost modifiers to any selections

### Requirement 2

**User Story:** As a player, I want the system to require warband creation before showing character options, so that I establish the warband context before building my team.

#### Acceptance Criteria

1. WHEN the application starts with no warband selected THEN the Warband Builder SHALL display only the warband creation interface
2. WHEN no warband has been created or selected THEN the Warband Builder SHALL hide all leader and trooper creation options
3. WHEN a user creates a new warband THEN the Warband Builder SHALL display the leader and trooper creation options
4. WHEN a user loads an existing warband THEN the Warband Builder SHALL display the leader and trooper creation options
5. WHEN a user closes or deselects the current warband THEN the Warband Builder SHALL hide the leader and trooper creation options

### Requirement 3

**User Story:** As a player, I want to add a leader to my warband with customized attributes, so that I have a primary character leading my team.

#### Acceptance Criteria

1. WHEN a user adds a leader to a warband THEN the Warband Builder SHALL require the user to provide a name for the leader
2. WHEN a leader is created THEN the Warband Builder SHALL require the user to select a level for each of the five attributes: Speed, Defense, Firepower, Prowess, and Willpower
3. WHEN a user selects Speed level 1 THEN the Warband Builder SHALL add 0 points to the leader's cost
4. WHEN a user selects Speed level 2 THEN the Warband Builder SHALL add 1 point to the leader's cost
5. WHEN a user selects Speed level 3 THEN the Warband Builder SHALL add 3 points to the leader's cost
6. WHEN a user selects Defense level 2d6 THEN the Warband Builder SHALL add 2 points to the leader's cost
7. WHEN a user selects Defense level 2d8 THEN the Warband Builder SHALL add 4 points to the leader's cost
8. WHEN a user selects Defense level 2d10 THEN the Warband Builder SHALL add 8 points to the leader's cost
9. WHEN a user selects Firepower level None THEN the Warband Builder SHALL add 0 points to the leader's cost
10. WHEN a user selects Firepower level 2d8 THEN the Warband Builder SHALL add 2 points to the leader's cost
11. WHEN a user selects Firepower level 2d10 THEN the Warband Builder SHALL add 4 points to the leader's cost
12. WHEN a user selects Prowess level 2d6 THEN the Warband Builder SHALL add 2 points to the leader's cost
13. WHEN a user selects Prowess level 2d8 THEN the Warband Builder SHALL add 4 points to the leader's cost
14. WHEN a user selects Prowess level 2d10 THEN the Warband Builder SHALL add 6 points to the leader's cost
15. WHEN a user selects Willpower level 2d6 THEN the Warband Builder SHALL add 2 points to the leader's cost
16. WHEN a user selects Willpower level 2d8 THEN the Warband Builder SHALL add 4 points to the leader's cost
17. WHEN a user selects Willpower level 2d10 THEN the Warband Builder SHALL add 6 points to the leader's cost

### Requirement 4

**User Story:** As a player, I want to equip my leader with weapons, so that they can engage in combat during the game.

#### Acceptance Criteria

1. WHEN a leader is created THEN the Warband Builder SHALL require the user to select at least one close combat weapon
2. WHEN a leader has Firepower level 2d8 or 2d10 THEN the Warband Builder SHALL require the user to select at least one ranged weapon
3. WHEN a leader has Firepower level None THEN the Warband Builder SHALL NOT require the user to select a ranged weapon
4. WHEN a leader selects a ranged weapon THEN the Warband Builder SHALL require the leader to have Firepower level 2d8 or 2d10
5. WHEN a user selects a weapon THEN the Warband Builder SHALL add the weapon's point cost to the leader's total cost
6. WHEN a user selects multiple weapons THEN the Warband Builder SHALL add all weapon point costs to the leader's total cost

### Requirement 5

**User Story:** As a player, I want to equip my leader with equipment items, so that they have special abilities and advantages.

#### Acceptance Criteria

1. WHEN a leader is created THEN the Warband Builder SHALL allow the user to select up to 2 equipment items
2. WHEN the warband has the Cyborgs ability THEN the Warband Builder SHALL allow the leader to select up to 3 equipment items
3. WHEN a user selects equipment THEN the Warband Builder SHALL add the equipment's point cost to the leader's total cost
4. WHEN a user attempts to select more equipment than allowed THEN the Warband Builder SHALL prevent the selection and maintain the current equipment list

### Requirement 6

**User Story:** As a player, I want to give my leader psychic powers, so that they can use supernatural abilities during the game.

#### Acceptance Criteria

1. WHEN a leader is created THEN the Warband Builder SHALL allow the user to select zero or more psychic powers
2. WHEN a user selects a psychic power THEN the Warband Builder SHALL add the power's point cost to the leader's total cost
3. WHEN a user selects multiple psychic powers THEN the Warband Builder SHALL add all psychic power point costs to the leader's total cost

### Requirement 7

**User Story:** As a player, I want to assign a leader trait to my leader, so that they have unique leadership abilities.

#### Acceptance Criteria

1. WHEN a leader is created THEN the Warband Builder SHALL allow the user to optionally select one leader trait
2. WHEN a user selects a leader trait THEN the Warband Builder SHALL associate that trait with the leader
3. WHEN a user does not select a leader trait THEN the Warband Builder SHALL allow the leader to have no trait

### Requirement 8

**User Story:** As a player, I want to add troopers to my warband with customized attributes and equipment, so that I can build a complete team.

#### Acceptance Criteria

1. WHEN a user adds a trooper to a warband THEN the Warband Builder SHALL require the user to provide a name for the trooper
2. WHEN a trooper is created THEN the Warband Builder SHALL require the user to select a level for each of the five attributes using the same point costs as leaders
3. WHEN a trooper is created THEN the Warband Builder SHALL require the user to select at least one close combat weapon
4. WHEN a trooper has Firepower level 2d8 or 2d10 THEN the Warband Builder SHALL require the user to select at least one ranged weapon
5. WHEN a trooper selects a ranged weapon THEN the Warband Builder SHALL require the trooper to have Firepower level 2d8 or 2d10
6. WHEN a trooper is created THEN the Warband Builder SHALL allow the user to select up to 1 equipment item
7. WHEN the warband has the Cyborgs ability THEN the Warband Builder SHALL allow troopers to select up to 2 equipment items
8. WHEN a trooper is created THEN the Warband Builder SHALL allow the user to select zero or more psychic powers
9. WHEN a trooper's total point cost is calculated THEN the Warband Builder SHALL sum all attribute, weapon, equipment, and psychic power costs

### Requirement 9

**User Story:** As a player, I want the system to apply warband ability cost modifiers, so that my faction's special rules are automatically reflected in point costs.

#### Acceptance Criteria

1. WHEN the warband has the Heavily Armed ability AND a user selects a ranged weapon THEN the Warband Builder SHALL reduce the weapon's point cost by 1
2. WHEN the warband has the Mutants ability AND a user selects Speed attribute THEN the Warband Builder SHALL reduce the Speed point cost by 1
3. WHEN the warband has the Mutants ability AND a user selects Claws & Teeth weapon THEN the Warband Builder SHALL reduce the weapon's point cost by 1
4. WHEN the warband has the Mutants ability AND a user selects Horrible Claws & Teeth weapon THEN the Warband Builder SHALL reduce the weapon's point cost by 1
5. WHEN the warband has the Mutants ability AND a user selects Whip/Tail weapon THEN the Warband Builder SHALL reduce the weapon's point cost by 1
6. WHEN the warband has the Soldiers ability AND a user selects Grenade equipment THEN the Warband Builder SHALL set the equipment's point cost to 0
7. WHEN the warband has the Soldiers ability AND a user selects Heavy Armor equipment THEN the Warband Builder SHALL set the equipment's point cost to 0
8. WHEN the warband has the Soldiers ability AND a user selects Medkit equipment THEN the Warband Builder SHALL set the equipment's point cost to 0
9. WHEN a cost reduction would result in a negative point cost THEN the Warband Builder SHALL set the point cost to 0

### Requirement 10

**User Story:** As a player, I want the system to enforce point cost limits for individual weirdos, so that I cannot create overpowered characters.

#### Acceptance Criteria

1. WHEN a user attempts to finalize a trooper with a total point cost exceeding 20 points THEN the Warband Builder SHALL prevent finalization and display an error message
2. WHEN a warband contains zero weirdos with point cost exceeding 20 points THEN the Warband Builder SHALL allow one weirdo to have a total point cost up to 25 points
3. WHEN a warband already contains one weirdo with point cost between 21 and 25 points THEN the Warband Builder SHALL prevent any other weirdo from exceeding 20 points
4. WHEN a user attempts to add selections that would cause a weirdo to exceed their point limit THEN the Warband Builder SHALL prevent the addition and display the current point total

### Requirement 11

**User Story:** As a player, I want the system to enforce the warband's total point limit, so that my warband adheres to game balance rules.

#### Acceptance Criteria

1. WHEN a warband's total point cost is calculated THEN the Warband Builder SHALL sum the point costs of all weirdos in the warband
2. WHEN a warband's total point cost exceeds the selected point limit THEN the Warband Builder SHALL prevent the user from finalizing the warband
3. WHEN a user attempts to add a weirdo that would cause the warband to exceed its point limit THEN the Warband Builder SHALL prevent the addition and display the current total
4. WHEN a warband's total point cost is at or below the selected point limit THEN the Warband Builder SHALL allow the warband to be finalized

### Requirement 12

**User Story:** As a player, I want to save my completed warband, so that I can use it in games and modify it later.

#### Acceptance Criteria

1. WHEN a user finalizes a valid warband THEN the Warband Builder SHALL persist the warband data to storage
2. WHEN warband data is persisted THEN the Warband Builder SHALL store the warband name, ability, point limit, and all weirdo details
3. WHEN warband data is persisted THEN the Warband Builder SHALL assign a unique identifier to the warband
4. WHEN a warband is saved THEN the Warband Builder SHALL confirm successful save to the user

### Requirement 13

**User Story:** As a player, I want to load a previously saved warband, so that I can view, modify, or use it in games.

#### Acceptance Criteria

1. WHEN a user requests to load a warband THEN the Warband Builder SHALL retrieve the warband data from storage
2. WHEN warband data is retrieved THEN the Warband Builder SHALL populate all warband and weirdo fields with the stored values
3. WHEN a warband is loaded THEN the Warband Builder SHALL recalculate all point costs to ensure data integrity
4. WHEN a loaded warband is modified THEN the Warband Builder SHALL apply all validation rules as if creating a new warband

### Requirement 14

**User Story:** As a player, I want to view a list of all my saved warbands, so that I can choose which one to load or manage.

#### Acceptance Criteria

1. WHEN a user requests the warband list THEN the Warband Builder SHALL display all saved warbands
2. WHEN displaying a warband in the list THEN the Warband Builder SHALL show the warband name, ability, point limit, and total point cost
3. WHEN displaying a warband in the list THEN the Warband Builder SHALL show the number of weirdos in the warband
4. WHEN no warbands exist THEN the Warband Builder SHALL display a message indicating no warbands are available

### Requirement 15

**User Story:** As a player, I want to delete a saved warband, so that I can remove warbands I no longer need.

#### Acceptance Criteria

1. WHEN a user requests to delete a warband THEN the Warband Builder SHALL prompt for confirmation
2. WHEN a user confirms deletion THEN the Warband Builder SHALL remove the warband data from storage
3. WHEN a warband is deleted THEN the Warband Builder SHALL confirm successful deletion to the user
4. WHEN a user cancels deletion THEN the Warband Builder SHALL retain the warband data unchanged

### Requirement 16

**User Story:** As a player, I want to see real-time point cost calculations as I build my warband, so that I can make informed decisions about my selections.

#### Acceptance Criteria

1. WHEN a user adds or removes an attribute, weapon, equipment, or psychic power THEN the Warband Builder SHALL immediately recalculate the weirdo's total point cost
2. WHEN a weirdo's point cost changes THEN the Warband Builder SHALL immediately recalculate the warband's total point cost
3. WHEN point costs are displayed THEN the Warband Builder SHALL show both the individual weirdo costs and the warband total cost
4. WHEN a weirdo approaches their point limit THEN the Warband Builder SHALL display a warning indicator
5. WHEN the warband approaches its point limit THEN the Warband Builder SHALL display a warning indicator
6. WHEN a weirdo fails validation checks THEN the Warband Builder SHALL apply visual highlighting to that weirdo in the warband editor
7. WHEN a weirdo has validation errors THEN the Warband Builder SHALL distinguish the weirdo from valid weirdos through visual styling
8. WHEN a weirdo has the error CSS class applied THEN the Warband Builder SHALL display the specific validation error message in a tooltip
9. WHEN a user hovers over a weirdo with validation errors THEN the Warband Builder SHALL show a tooltip containing the validation error details

### Requirement 17

**User Story:** As a player, I want to see descriptions and point costs for all available selections, so that I can make informed decisions about what to add to my warband.

#### Acceptance Criteria

1. WHEN a user views available warband abilities THEN the Warband Builder SHALL display the description for each ability option
2. WHEN a user views available attributes THEN the Warband Builder SHALL display the point cost for each attribute level option
3. WHEN a user views available weapons THEN the Warband Builder SHALL display the name, point cost, and notes for each weapon option
4. WHEN a user views available equipment THEN the Warband Builder SHALL display the name, point cost, and effect description for each equipment option
5. WHEN a user views available psychic powers THEN the Warband Builder SHALL display the name, point cost, and effect description for each psychic power option
6. WHEN a user views available leader traits THEN the Warband Builder SHALL display the description for each leader trait option
7. WHEN warband abilities modify costs THEN the Warband Builder SHALL display the modified cost alongside the base cost

### Requirement 18

**User Story:** As a player, I want the total point costs for my leader and troopers to remain visible while scrolling through selection options, so that I can always see how my choices affect the total cost.

#### Acceptance Criteria

1. WHEN a user scrolls within the weirdo editor THEN the Warband Builder SHALL keep the weirdo's total point cost visible at the top of the editor
2. WHEN a user scrolls within the warband editor THEN the Warband Builder SHALL keep the warband's total point cost visible at the top of the editor
3. WHEN the weirdo total cost display is fixed THEN the Warband Builder SHALL ensure it does not obscure selection controls
4. WHEN the warband total cost display is fixed THEN the Warband Builder SHALL ensure it does not obscure weirdo management controls

## Items Requiring Clarification

The following items from the source document require clarification before implementation:

### 1. Warband Size Constraints
**Question:** What are the minimum and maximum number of troopers allowed in a warband?
- Minimum: Can a warband consist of only a leader with no troopers?
- Maximum: Is there a cap on the number of troopers (e.g., 10 troopers maximum)?

**Current Assumption:** A warband must have exactly 1 leader and may have 0 or more troopers with no upper limit except the point constraint.

### 2. 25-Point Weirdo Rule Clarification
**Question:** How does the "one weirdo may cost up to 25 points" rule interact with the "troopers may cost up to 20 points" rule?
- Can a non-leader trooper be the 25-point weirdo, or must it be the leader?
- If a trooper can be 25 points, does this override the 20-point trooper limit for that specific trooper?

**Current Assumption:** Exactly one weirdo in the warband (leader or trooper) may have a point cost between 21-25 points. All other weirdos must be 20 points or less.

### 3. Firepower "None" and Ranged Weapons
**Question:** Does Firepower level "None" count as "having a Firepower score" for the purpose of requiring ranged weapon selection?

**Current Assumption:** Firepower level "None" means the weirdo does NOT have a Firepower score and therefore is NOT required to select a ranged weapon.

### 4. Unarmed Weapon Interpretation
**Question:** Does selecting "Unarmed" (0 points) satisfy the requirement to "purchase at least one close combat weapon"?

**Current Assumption:** Yes, "Unarmed" is a valid close combat weapon selection that satisfies the requirement.

### 5. Multiple Weapon Selection
**Question:** Can a weirdo select multiple close combat weapons or multiple ranged weapons?

**Current Assumption:** Yes, a weirdo may select multiple weapons of each type, and all costs are summed.

### 6. Attribute Default Values
**Question:** Are there default or minimum values for attributes, or must the user explicitly select a level for each attribute?

**Current Assumption:** All attributes must be explicitly selected. There are no default values. Speed must be 1, 2, or 3. Other attributes must be 2d6, 2d8, or 2d10 (or None for Firepower).

### 7. Warband Ability Selection Timing
**Question:** Must the warband ability be selected before adding weirdos, or can it be changed after weirdos are added?

**Current Assumption:** The warband ability is optional. If selected, it affects all subsequent cost calculations. Changing the ability after weirdos are added will recalculate all costs. If no ability is selected, no cost modifiers are applied.

### 8. Leader Trait Requirement
**Question:** Is a leader trait optional (can be none) or must one be selected?

**Current Assumption:** Leader traits are optional. A leader may have zero or one leader trait.

### 9. Cost Reduction Minimum
**Question:** When warband abilities reduce costs (e.g., Heavily Armed reduces ranged weapon costs by 1), can the cost go negative or does it stop at 0?

**Current Assumption:** Costs cannot go negative. The minimum cost for any item is 0 points.

### 10. Psychic Power Limits
**Question:** Is there a maximum number of psychic powers a single weirdo can have?

**Current Assumption:** No maximum limit. A weirdo may have any number of psychic powers as long as they can afford the point costs.

### 11. Warband "Max Point Cost" Field
**Question:** The source document mentions warbands have a "Max Point Cost" and "Total Point Cost". What is the difference?

**Current Assumption:** "Max Point Cost" is the selected limit (75 or 125). "Total Point Cost" is the sum of all weirdo costs. These will be labeled as "Point Limit" and "Total Cost" respectively in the application.

### 12. Notes Field Usage
**Question:** The source document mentions weirdos have a "Notes" field. What is this used for?

**Current Assumption:** The Notes field is a free-text field for players to add custom notes about the weirdo (e.g., backstory, tactical notes, painting reminders).
