# Requirements Document

## Introduction

This document specifies the game rules and business logic for the Space Weirdos Warband Builder. It defines the core mechanics for character creation, cost calculations, validation rules, and warband ability modifiers that enforce the Space Weirdos tabletop game rules.

This spec focuses exclusively on business logic and can be implemented independently of any user interface. The rules defined here form the foundation that other components (UI, persistence) will build upon.

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
- **Cost Engine**: The system component that calculates point costs with modifiers
- **Validation Service**: The system component that enforces game rules and constraints
- **Validation Warning**: A non-blocking notification that alerts users when approaching limits without preventing the action
- **Applicable Limit**: The point cost limit that applies to a specific weirdo (20 points for most weirdos, 25 points for the one allowed premium weirdo)

## Requirements

### Requirement 1

**User Story:** As a game system, I want to define valid attribute levels and their costs, so that character attributes can be calculated correctly.

#### Acceptance Criteria

1. WHEN a weirdo has Speed level 1 THEN the Cost Engine SHALL calculate 0 points for Speed
2. WHEN a weirdo has Speed level 2 THEN the Cost Engine SHALL calculate 1 point for Speed
3. WHEN a weirdo has Speed level 3 THEN the Cost Engine SHALL calculate 3 points for Speed
4. WHEN a weirdo has Defense level 2d6 THEN the Cost Engine SHALL calculate 2 points for Defense
5. WHEN a weirdo has Defense level 2d8 THEN the Cost Engine SHALL calculate 4 points for Defense
6. WHEN a weirdo has Defense level 2d10 THEN the Cost Engine SHALL calculate 8 points for Defense
7. WHEN a weirdo has Firepower level None THEN the Cost Engine SHALL calculate 0 points for Firepower
8. WHEN a weirdo has Firepower level 2d8 THEN the Cost Engine SHALL calculate 2 points for Firepower
9. WHEN a weirdo has Firepower level 2d10 THEN the Cost Engine SHALL calculate 4 points for Firepower
10. WHEN a weirdo has Prowess level 2d6 THEN the Cost Engine SHALL calculate 2 points for Prowess
11. WHEN a weirdo has Prowess level 2d8 THEN the Cost Engine SHALL calculate 4 points for Prowess
12. WHEN a weirdo has Prowess level 2d10 THEN the Cost Engine SHALL calculate 6 points for Prowess
13. WHEN a weirdo has Willpower level 2d6 THEN the Cost Engine SHALL calculate 2 points for Willpower
14. WHEN a weirdo has Willpower level 2d8 THEN the Cost Engine SHALL calculate 4 points for Willpower
15. WHEN a weirdo has Willpower level 2d10 THEN the Cost Engine SHALL calculate 6 points for Willpower

### Requirement 2

**User Story:** As a game system, I want to enforce weapon requirements based on character attributes, so that game rules are followed correctly.

#### Acceptance Criteria

1. WHEN validating a weirdo THEN the Validation Service SHALL require at least one close combat weapon
2. WHEN a weirdo has Firepower level 2d8 or 2d10 THEN the Validation Service SHALL require at least one ranged weapon
3. WHEN a weirdo has Firepower level None THEN the Validation Service SHALL NOT require a ranged weapon
4. WHEN a weirdo has a ranged weapon selected THEN the Validation Service SHALL require Firepower level 2d8 or 2d10
5. WHEN calculating weapon costs THEN the Cost Engine SHALL sum all weapon point costs

### Requirement 3

**User Story:** As a game system, I want to enforce equipment limits based on weirdo type and warband abilities, so that equipment rules are followed correctly.

#### Acceptance Criteria

1. WHEN a leader has no Cyborgs ability THEN the Validation Service SHALL allow up to 2 equipment items
2. WHEN a leader has Cyborgs ability THEN the Validation Service SHALL allow up to 3 equipment items
3. WHEN a trooper has no Cyborgs ability THEN the Validation Service SHALL allow up to 1 equipment item
4. WHEN a trooper has Cyborgs ability THEN the Validation Service SHALL allow up to 2 equipment items
5. WHEN a weirdo attempts to exceed equipment limits THEN the Validation Service SHALL reject the addition
6. WHEN calculating equipment costs THEN the Cost Engine SHALL sum all equipment point costs

### Requirement 4

**User Story:** As a game system, I want to allow unlimited psychic powers within point constraints, so that players can customize their characters.

#### Acceptance Criteria

1. WHEN a weirdo selects psychic powers THEN the Validation Service SHALL allow zero or more powers without limit
2. WHEN calculating psychic power costs THEN the Cost Engine SHALL sum all psychic power point costs

### Requirement 5

**User Story:** As a game system, I want to enforce leader trait rules, so that only leaders can have traits.

#### Acceptance Criteria

1. WHEN a leader is validated THEN the Validation Service SHALL allow zero or one leader trait
2. WHEN a trooper is validated THEN the Validation Service SHALL reject any leader trait assignment

### Requirement 6

**User Story:** As a game system, I want to apply warband ability cost modifiers, so that faction-specific rules affect point calculations.

#### Acceptance Criteria

1. WHEN the warband has Heavily Armed ability AND calculating ranged weapon cost THEN the Cost Engine SHALL reduce the weapon cost by 1
2. WHEN the warband has Mutants ability AND calculating Speed cost THEN the Cost Engine SHALL reduce the Speed cost by 1
3. WHEN the warband has Mutants ability AND calculating Claws & Teeth weapon cost THEN the Cost Engine SHALL reduce the weapon cost by 1
4. WHEN the warband has Mutants ability AND calculating Horrible Claws & Teeth weapon cost THEN the Cost Engine SHALL reduce the weapon cost by 1
5. WHEN the warband has Mutants ability AND calculating Whip/Tail weapon cost THEN the Cost Engine SHALL reduce the weapon cost by 1
6. WHEN the warband has Soldiers ability AND calculating Grenade equipment cost THEN the Cost Engine SHALL set the equipment cost to 0
7. WHEN the warband has Soldiers ability AND calculating Heavy Armor equipment cost THEN the Cost Engine SHALL set the equipment cost to 0
8. WHEN the warband has Soldiers ability AND calculating Medkit equipment cost THEN the Cost Engine SHALL set the equipment cost to 0
9. WHEN any cost reduction would result in negative cost THEN the Cost Engine SHALL set the cost to 0

### Requirement 7

**User Story:** As a game system, I want to enforce individual weirdo point limits, so that overpowered characters cannot be created.

#### Acceptance Criteria

1. WHEN a warband contains zero weirdos with cost exceeding 20 points THEN the Validation Service SHALL allow one weirdo to have cost up to 25 points
2. WHEN a warband already contains one weirdo with cost between 21 and 25 points THEN the Validation Service SHALL prevent any other weirdo from exceeding 20 points
3. WHEN validating a trooper with cost exceeding 20 points AND no 25-point weirdo exists THEN the Validation Service SHALL allow it if cost is 25 or less
4. WHEN validating a trooper with cost exceeding 20 points AND a 25-point weirdo exists THEN the Validation Service SHALL reject it
5. WHEN a weirdo cost is within 3 points of the applicable limit THEN the Validation Service SHALL generate a warning
6. WHEN no 25-point weirdo exists in the warband AND a weirdo cost is between 18 and 20 points THEN the Validation Service SHALL generate a warning for approaching the 20-point limit
7. WHEN no 25-point weirdo exists in the warband AND a weirdo cost is between 23 and 25 points THEN the Validation Service SHALL generate a warning for approaching the 25-point limit
8. WHEN a 25-point weirdo exists in the warband AND another weirdo cost is between 18 and 20 points THEN the Validation Service SHALL generate a warning for approaching the 20-point limit
9. WHEN a 25-point weirdo exists in the warband AND that same weirdo cost is between 23 and 25 points THEN the Validation Service SHALL generate a warning for approaching the 25-point limit

### Requirement 8

**User Story:** As a game system, I want to enforce warband total point limits, so that warbands adhere to game balance rules.

#### Acceptance Criteria

1. WHEN calculating warband total cost THEN the Cost Engine SHALL sum all weirdo costs
2. WHEN validating a warband with total cost exceeding the point limit THEN the Validation Service SHALL reject finalization
3. WHEN validating a warband with total cost at or below the point limit THEN the Validation Service SHALL allow finalization

### Requirement 9

**User Story:** As a game system, I want to calculate total weirdo costs from all components, so that accurate point totals are maintained.

#### Acceptance Criteria

1. WHEN calculating weirdo total cost THEN the Cost Engine SHALL sum attribute costs, weapon costs, equipment costs, and psychic power costs
2. WHEN calculating weirdo total cost THEN the Cost Engine SHALL apply all warband ability modifiers
3. WHEN calculating weirdo total cost THEN the Cost Engine SHALL ensure no component cost is negative

### Requirement 10

**User Story:** As a game system, I want to validate that all required weirdo fields are present, so that incomplete characters are rejected.

#### Acceptance Criteria

1. WHEN validating a weirdo THEN the Validation Service SHALL require a non-empty name
2. WHEN validating a weirdo THEN the Validation Service SHALL require all five attributes to be selected with valid levels
3. WHEN validating a weirdo THEN the Validation Service SHALL require Speed to be 1, 2, or 3
4. WHEN validating a weirdo THEN the Validation Service SHALL require Defense to be 2d6, 2d8, or 2d10
5. WHEN validating a weirdo THEN the Validation Service SHALL require Firepower to be None, 2d8, or 2d10
6. WHEN validating a weirdo THEN the Validation Service SHALL require Prowess to be 2d6, 2d8, or 2d10
7. WHEN validating a weirdo THEN the Validation Service SHALL require Willpower to be 2d6, 2d8, or 2d10

### Requirement 11

**User Story:** As a game system, I want to validate warband structure, so that warbands follow composition rules.

#### Acceptance Criteria

1. WHEN validating a warband THEN the Validation Service SHALL require a non-empty warband name
2. WHEN validating a warband THEN the Validation Service SHALL require a point limit of either 75 or 125
3. WHEN validating a warband THEN the Validation Service SHALL allow an optional warband ability
4. WHEN no warband ability is selected THEN the Cost Engine SHALL apply no cost modifiers

## Items Requiring Clarification

### 1. Warband Size Constraints
**Question:** What are the minimum and maximum number of troopers allowed in a warband?

**Current Assumption:** A warband must have exactly 1 leader and may have 0 or more troopers with no upper limit except the point constraint.

### 2. 25-Point Weirdo Rule Clarification
**Question:** Can a non-leader trooper be the 25-point weirdo, or must it be the leader?

**Current Assumption:** Exactly one weirdo in the warband (leader or trooper) may have a point cost between 21-25 points. All other weirdos must be 20 points or less.

### 3. Unarmed Weapon Interpretation
**Question:** Does selecting "Unarmed" (0 points) satisfy the requirement to "purchase at least one close combat weapon"?

**Current Assumption:** Yes, "Unarmed" is a valid close combat weapon selection that satisfies the requirement.

### 4. Multiple Weapon Selection
**Question:** Can a weirdo select multiple close combat weapons or multiple ranged weapons?

**Current Assumption:** Yes, a weirdo may select multiple weapons of each type, and all costs are summed.

### 5. Psychic Power Limits
**Question:** Is there a maximum number of psychic powers a single weirdo can have?

**Current Assumption:** No maximum limit. A weirdo may have any number of psychic powers as long as they can afford the point costs.
