# Design Document: Space Weirdos Game Rules

## Overview

This design document specifies the architecture and implementation approach for the Space Weirdos game rules engine. The system provides business logic for character creation, cost calculations, and validation rules that enforce the Space Weirdos tabletop game mechanics.

The game rules engine is designed as a standalone business logic layer that can be consumed by any user interface or persistence layer. It focuses on three core responsibilities:

1. **Cost Calculation**: Computing point costs for attributes, weapons, equipment, and psychic powers with faction-specific modifiers
2. **Validation**: Enforcing game rules and constraints for individual weirdos and complete warbands
3. **Rule Application**: Applying warband abilities that modify costs and limits

This design is UI-agnostic and can be implemented independently of frontend or persistence concerns.

## Architecture

The system follows a service-oriented architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│              (UI, API, Persistence)                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Business Logic Layer                    │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  CostEngine      │  │  ValidationService       │    │
│  │  - Calculates    │  │  - Validates weirdos     │    │
│  │    costs         │  │  - Validates warbands    │    │
│  │  - Applies       │  │  - Enforces constraints  │    │
│  │    modifiers     │  │                          │    │
│  └──────────────────┘  └──────────────────────────┘    │
│           │                        │                     │
│           └────────────┬───────────┘                     │
│                        ▼                                 │
│           ┌─────────────────────────┐                   │
│           │  CostModifierStrategy   │                   │
│           │  - Warband abilities    │                   │
│           │  - Cost adjustments     │                   │
│           └─────────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│                  (Types & Models)                        │
└─────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Immutability**: Cost calculations and validations do not modify input data
2. **Statelessness**: Services operate on provided data without maintaining state
3. **Single Responsibility**: Each service has one clear purpose
4. **Testability**: Pure functions and dependency injection enable comprehensive testing
5. **Extensibility**: Strategy pattern allows easy addition of new warband abilities

## Components and Interfaces

### Data Models

All data models are defined as TypeScript interfaces to ensure type safety:

```typescript
// Core attribute types
type SpeedLevel = 1 | 2 | 3;
type DiceLevel = '2d6' | '2d8' | '2d10';
type FirepowerLevel = 'None' | '2d8' | '2d10';

interface Attributes {
  speed: SpeedLevel;
  defense: DiceLevel;
  firepower: FirepowerLevel;
  prowess: DiceLevel;
  willpower: DiceLevel;
}

// Equipment and weapons
interface Weapon {
  id: string;
  name: string;
  type: 'close-combat' | 'ranged';
  cost: number;
}

interface Equipment {
  id: string;
  name: string;
  cost: number;
}

interface PsychicPower {
  id: string;
  name: string;
  cost: number;
}

interface LeaderTrait {
  id: string;
  name: string;
  cost: number;
}

// Character model
interface Weirdo {
  id: string;
  name: string;
  type: 'leader' | 'trooper';
  attributes: Attributes;
  closeCombatWeapons: Weapon[];
  rangedWeapons: Weapon[];
  equipment: Equipment[];
  psychicPowers: PsychicPower[];
  leaderTrait?: LeaderTrait;
}

// Warband model
type WarbandAbility = 'Heavily Armed' | 'Mutants' | 'Soldiers' | 'Cyborgs';
type PointLimit = 75 | 125;

interface Warband {
  id: string;
  name: string;
  pointLimit: PointLimit;
  ability?: WarbandAbility;
  leader: Weirdo;
  troopers: Weirdo[];
}

// Validation results
interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Cost breakdown for transparency
interface CostBreakdown {
  attributes: number;
  weapons: number;
  equipment: number;
  psychicPowers: number;
  leaderTrait: number;
  total: number;
}
```

### CostEngine Service

The `CostEngine` is responsible for all point cost calculations with warband ability modifiers applied.

```typescript
interface CostEngine {
  // Calculate individual component costs
  calculateAttributeCost(attribute: keyof Attributes, level: SpeedLevel | DiceLevel | FirepowerLevel): number;
  calculateWeaponCost(weapon: Weapon, ability?: WarbandAbility): number;
  calculateEquipmentCost(equipment: Equipment, ability?: WarbandAbility): number;
  calculatePsychicPowerCost(power: PsychicPower): number;
  calculateLeaderTraitCost(trait: LeaderTrait): number;
  
  // Calculate aggregate costs
  calculateWeirdoCost(weirdo: Weirdo, ability?: WarbandAbility): number;
  calculateWarbandCost(warband: Warband): number;
  
  // Get detailed breakdown
  getWeirdoCostBreakdown(weirdo: Weirdo, ability?: WarbandAbility): CostBreakdown;
}
```

**Implementation Details:**

- **Attribute Costs**: Uses lookup tables for each attribute type
- **Modifier Application**: Delegates to `CostModifierStrategy` for warband ability adjustments
- **Cost Clamping**: Ensures no cost goes below zero after modifiers
- **Transparency**: Provides detailed breakdowns for UI display

### CostModifierStrategy

The `CostModifierStrategy` encapsulates warband ability logic using the strategy pattern.

```typescript
interface CostModifierStrategy {
  applyWeaponModifier(weapon: Weapon, baseCost: number, ability?: WarbandAbility): number;
  applyEquipmentModifier(equipment: Equipment, baseCost: number, ability?: WarbandAbility): number;
  applyAttributeModifier(attribute: keyof Attributes, level: any, baseCost: number, ability?: WarbandAbility): number;
}
```

**Modifier Rules:**

- **Heavily Armed**: Reduces ranged weapon costs by 1 (minimum 0)
- **Mutants**: Reduces Speed costs by 1 and specific close combat weapons (Claws & Teeth, Horrible Claws & Teeth, Whip/Tail) by 1
- **Soldiers**: Sets specific equipment costs to 0 (Grenade, Heavy Armor, Medkit)
- **Cyborgs**: No cost modifiers (affects equipment limits only)

### ValidationService

The `ValidationService` enforces all game rules and constraints.

```typescript
interface ValidationService {
  // Weirdo validation
  validateWeirdo(weirdo: Weirdo, warband?: Warband): ValidationResult;
  validateWeirdoBasics(weirdo: Weirdo): ValidationResult;
  validateWeirdoWeapons(weirdo: Weirdo): ValidationResult;
  validateWeirdoEquipment(weirdo: Weirdo, ability?: WarbandAbility): ValidationResult;
  validateWeirdoCost(weirdo: Weirdo, warband: Warband): ValidationResult;
  
  // Warband validation
  validateWarband(warband: Warband): ValidationResult;
  validateWarbandStructure(warband: Warband): ValidationResult;
  validateWarbandCost(warband: Warband): ValidationResult;
}
```

**Validation Rules:**

1. **Basic Validation**: Name, attributes, weirdo type
2. **Weapon Validation**: Required weapons based on Firepower level
3. **Equipment Validation**: Limits based on weirdo type and Cyborgs ability
4. **Cost Validation**: Individual weirdo limits (20/25 points) and warband total
5. **Structural Validation**: Warband composition and point limit

## Data Models

### Attribute Cost Tables

The system uses fixed lookup tables for attribute costs:

| Speed | Cost |
|-------|------|
| 1     | 0    |
| 2     | 1    |
| 3     | 3    |

| Defense/Prowess/Willpower | Cost |
|---------------------------|------|
| 2d6                       | 2    |
| 2d8                       | 4    |
| 2d10                      | 6/8* |

*Defense 2d10 costs 8 points; Prowess and Willpower 2d10 cost 6 points

| Firepower | Cost |
|-----------|------|
| None      | 0    |
| 2d8       | 2    |
| 2d10      | 4    |

### Equipment Limits

Equipment limits depend on weirdo type and warband ability:

| Weirdo Type | No Cyborgs | With Cyborgs |
|-------------|------------|--------------|
| Leader      | 2          | 3            |
| Trooper     | 1          | 2            |

### 25-Point Weirdo Rule

Exactly one weirdo in a warband may have a cost between 21-25 points. All other weirdos must be 20 points or less. This applies to both leaders and troopers.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining the correctness properties, let me analyze each acceptance criterion for testability:

### Acceptance Criteria Testing Prework

**Requirement 1: Attribute Costs**
1.1-1.15: WHEN a weirdo has [attribute] level [value] THEN the Cost Engine SHALL calculate [X] points
- Thoughts: These are specific examples of attribute cost calculations. While they could be tested as individual examples, they represent a general rule about attribute cost lookup. We can test this as a property that validates the entire cost table.
- Testable: yes - property

**Requirement 2: Weapon Requirements**
2.1: WHEN validating a weirdo THEN the Validation Service SHALL require at least one close combat weapon
- Thoughts: This is a universal rule that applies to all weirdos. We can generate random weirdos and verify this constraint.
- Testable: yes - property

2.2: WHEN a weirdo has Firepower level 2d8 or 2d10 THEN the Validation Service SHALL require at least one ranged weapon
- Thoughts: This is a conditional rule that applies to all weirdos with certain Firepower levels.
- Testable: yes - property

2.3: WHEN a weirdo has Firepower level None THEN the Validation Service SHALL NOT require a ranged weapon
- Thoughts: This is the inverse of 2.2 and tests the same underlying logic.
- Testable: edge case (covered by property 2)

2.4: WHEN a weirdo has a ranged weapon selected THEN the Validation Service SHALL require Firepower level 2d8 or 2d10
- Thoughts: This is the reverse implication of 2.2, ensuring consistency.
- Testable: yes - property

2.5: WHEN calculating weapon costs THEN the Cost Engine SHALL sum all weapon point costs
- Thoughts: This is a general rule about cost accumulation that applies to all weapon combinations.
- Testable: yes - property

**Requirement 3: Equipment Limits**
3.1-3.4: Equipment limits based on type and ability
- Thoughts: These are rules about maximum equipment counts that apply universally.
- Testable: yes - property

3.5: WHEN a weirdo attempts to exceed equipment limits THEN the Validation Service SHALL reject the addition
- Thoughts: This is the enforcement of 3.1-3.4, tested by the same property.
- Testable: edge case (covered by property 4)

3.6: WHEN calculating equipment costs THEN the Cost Engine SHALL sum all equipment point costs
- Thoughts: General rule about cost accumulation.
- Testable: yes - property

**Requirement 4: Psychic Powers**
4.1: WHEN a weirdo selects psychic powers THEN the Validation Service SHALL allow zero or more powers without limit
- Thoughts: This is about the absence of a constraint, which is difficult to test directly.
- Testable: no

4.2: WHEN calculating psychic power costs THEN the Cost Engine SHALL sum all psychic power point costs
- Thoughts: General rule about cost accumulation.
- Testable: yes - property

**Requirement 5: Leader Traits**
5.1: WHEN a leader is validated THEN the Validation Service SHALL allow zero or one leader trait
- Thoughts: Universal rule for all leaders.
- Testable: yes - property

5.2: WHEN a trooper is validated THEN the Validation Service SHALL reject any leader trait assignment
- Thoughts: Universal rule for all troopers.
- Testable: yes - property

**Requirement 6: Warband Ability Modifiers**
6.1-6.9: Cost modifier rules
- Thoughts: These are specific examples of modifier application. We can test the general principle that modifiers are applied correctly.
- Testable: yes - property

**Requirement 7: Individual Weirdo Limits**
7.1-7.4: 25-point weirdo rule
- Thoughts: This is a complex constraint involving warband state. We can test this as a property about warband composition.
- Testable: yes - property

**Requirement 8: Warband Total Limits**
8.1: WHEN calculating warband total cost THEN the Cost Engine SHALL sum all weirdo costs
- Thoughts: General rule about cost accumulation.
- Testable: yes - property

8.2-8.3: Warband point limit validation
- Thoughts: Universal rule for all warbands.
- Testable: yes - property

**Requirement 9: Total Weirdo Cost Calculation**
9.1-9.3: Component cost aggregation
- Thoughts: These describe how total cost is computed, which is a general rule.
- Testable: yes - property

**Requirement 10: Required Weirdo Fields**
10.1-10.7: Field presence and validity
- Thoughts: These are validation rules that apply to all weirdos.
- Testable: yes - property

**Requirement 11: Warband Structure**
11.1-11.4: Warband composition rules
- Thoughts: Universal rules for all warbands.
- Testable: yes - property

### Property Reflection

After reviewing all properties, I've identified the following consolidations:

- **Weapon validation properties** (2.1, 2.2, 2.4) can be combined into a single comprehensive property about weapon-firepower consistency
- **Cost accumulation properties** (2.5, 3.6, 4.2, 8.1, 9.1) all test the same principle and can be consolidated
- **Equipment limit properties** (3.1-3.5) can be combined into one property
- **Leader trait properties** (5.1, 5.2) can be combined into one property about trait-type consistency

### Correctness Properties

**Property 1: Attribute cost lookup correctness**
*For any* weirdo with valid attribute levels, the calculated cost for each attribute must match the defined cost table for that attribute type and level.
**Validates: Requirements 1.1-1.15**

**Property 2: Weapon-Firepower consistency**
*For any* weirdo, the following must hold: (1) at least one close combat weapon is present, (2) if Firepower is 2d8 or 2d10, at least one ranged weapon is present, and (3) if a ranged weapon is present, Firepower must be 2d8 or 2d10.
**Validates: Requirements 2.1, 2.2, 2.4**

**Property 3: Cost accumulation correctness**
*For any* weirdo, the total cost must equal the sum of attribute costs, weapon costs, equipment costs, psychic power costs, and leader trait cost (if present), with all warband ability modifiers applied.
**Validates: Requirements 2.5, 3.6, 4.2, 8.1, 9.1, 9.2**

**Property 4: Equipment limit enforcement**
*For any* weirdo with type T and warband ability A, the number of equipment items must not exceed the limit defined for that combination (Leader without Cyborgs: 2, Leader with Cyborgs: 3, Trooper without Cyborgs: 1, Trooper with Cyborgs: 2).
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

**Property 5: Leader trait type consistency**
*For any* weirdo, if the weirdo is a leader, it may have zero or one leader trait; if the weirdo is a trooper, it must have no leader trait.
**Validates: Requirements 5.1, 5.2**

**Property 6: Warband ability modifier application**
*For any* weirdo with warband ability A, when calculating costs: (1) Heavily Armed reduces ranged weapon costs by 1, (2) Mutants reduces Speed costs by 1 and specific close combat weapons by 1, (3) Soldiers sets specific equipment costs to 0, and (4) all cost reductions clamp at 0.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9**

**Property 7: 25-point weirdo uniqueness**
*For any* warband, at most one weirdo may have a cost between 21-25 points, and all other weirdos must have a cost of 20 points or less.
**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

**Property 8: Warband point limit enforcement**
*For any* warband with point limit L, the sum of all weirdo costs must not exceed L for the warband to be valid.
**Validates: Requirements 8.2, 8.3**

**Property 9: Cost non-negativity**
*For any* cost calculation (attribute, weapon, equipment, psychic power, or total), the result must never be negative.
**Validates: Requirements 9.3**

**Property 10: Required weirdo fields**
*For any* weirdo, validation must require: (1) a non-empty name, (2) all five attributes with valid levels, (3) Speed in {1, 2, 3}, (4) Defense in {2d6, 2d8, 2d10}, (5) Firepower in {None, 2d8, 2d10}, (6) Prowess in {2d6, 2d8, 2d10}, and (7) Willpower in {2d6, 2d8, 2d10}.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**

**Property 11: Warband structure validity**
*For any* warband, validation must require: (1) a non-empty warband name, (2) a point limit of either 75 or 125, (3) exactly one leader, and (4) zero or more troopers.
**Validates: Requirements 11.1, 11.2**

## Error Handling

The system uses a structured approach to error handling:

### Validation Errors

Validation errors are collected and returned as structured objects:

```typescript
interface ValidationError {
  field: string;      // e.g., "weirdo.weapons.ranged"
  message: string;    // Human-readable error message
  code: string;       // Machine-readable error code
}
```

**Error Codes:**

- `REQUIRED_FIELD`: Missing required field
- `INVALID_VALUE`: Value outside allowed range
- `WEAPON_REQUIRED`: Missing required weapon
- `EQUIPMENT_LIMIT`: Too many equipment items
- `COST_EXCEEDED`: Point cost too high
- `INVALID_TRAIT`: Leader trait on trooper
- `WARBAND_INVALID`: Warband structure violation

### Cost Calculation Errors

Cost calculations never throw errors. Instead:

- Invalid inputs return 0 cost
- Negative costs are clamped to 0
- Missing data is treated as 0 cost

This fail-safe approach ensures the UI remains functional even with incomplete data.

## Testing Strategy

The testing strategy employs a dual approach combining unit tests and property-based tests.

### Unit Testing

Unit tests verify specific examples and edge cases:

- **Attribute cost lookups**: Test each attribute level returns correct cost
- **Modifier edge cases**: Test cost reductions don't go negative
- **Validation messages**: Test error messages are clear and consistent
- **Equipment limits**: Test boundary conditions (exactly at limit, one over limit)
- **25-point rule**: Test specific scenarios (one at 25, two at 21, etc.)

**Testing Framework**: Vitest
**Test Location**: Co-located with source files using `.test.ts` suffix

### Property-Based Testing

Property-based tests verify universal properties across all inputs:

- **Framework**: fast-check
- **Minimum Iterations**: 50 per test
- **Tagging Format**: `**Feature: space-weirdos-game-rules, Property {number}: {property_text}**`

Each correctness property defined above must be implemented as a property-based test.

**Generator Strategy:**

- **Smart Generators**: Constrain inputs to valid ranges (e.g., Speed in {1, 2, 3})
- **Warband Generators**: Create valid warbands with random compositions
- **Ability Generators**: Test all warband ability combinations
- **Edge Case Coverage**: Generators include boundary values (0 cost items, maximum equipment, etc.)

### Test Organization

```
tests/
├── CostEngine.test.ts           # Unit tests for cost calculations
├── CostModifierStrategy.test.ts # Unit tests for modifiers
├── ValidationService.test.ts    # Unit tests for validation
├── CostEngine.property.test.ts  # Property tests for costs
└── ValidationService.property.test.ts # Property tests for validation
```

### Testing Priorities

1. **Critical Path**: Cost calculation and validation logic (highest priority)
2. **Modifier Logic**: Warband ability applications
3. **Edge Cases**: Boundary conditions and error states
4. **Integration**: Service interactions

## Implementation Notes

### Performance Considerations

- **Lookup Tables**: Use Maps for O(1) attribute cost lookups
- **Caching**: Consider memoizing weirdo costs if recalculated frequently
- **Validation**: Short-circuit validation on first error for performance

### Extensibility Points

- **New Warband Abilities**: Add to `CostModifierStrategy` without changing core logic
- **New Attributes**: Extend attribute types and cost tables
- **Custom Validation Rules**: Add new validators to `ValidationService`

### Dependencies

- **TypeScript**: Type safety and interfaces
- **fast-check**: Property-based testing library
- **Vitest**: Unit testing framework

### Integration Points

This business logic layer provides a clean interface for:

- **UI Layer**: Call validation before enabling save/submit buttons
- **Persistence Layer**: Validate before saving to database
- **API Layer**: Validate incoming requests
- **Import/Export**: Validate loaded data

The services are stateless and can be instantiated as singletons or injected as dependencies.
