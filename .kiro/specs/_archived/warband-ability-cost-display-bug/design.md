# Design Document: Warband Ability Cost Display Fix

## Overview

This design document specifies the fix for displaying warband ability-modified costs in the WeaponSelector, EquipmentSelector, and PsychicPowerSelector components. Currently, these components display base costs directly from the data files, but they should display costs after applying warband ability modifiers to match the backend calculations.

The fix involves adding cost calculation logic to each selector component that applies the same modifier rules used by the backend CostEngine.

## Architecture

The current architecture has a gap where selector components display base costs without considering warband abilities:

**Current (Broken) Flow:**
```
Data Files (baseCost) → Selector Components → Display baseCost
                                                    ↓
                                              (Wrong: no modifiers)
```

**Fixed Flow:**
```
Data Files (baseCost) → Selector Components → Apply Modifiers → Display modified cost
                              ↑                      ↑
                              |                      |
                        warbandAbility         CostModifierStrategy
                                                    ↓
                                            (Correct: matches backend)
```

### Key Design Principles

1. **Consistency**: Frontend cost display must match backend cost calculations
2. **DRY (Don't Repeat Yourself)**: Reuse the existing CostModifierStrategy logic
3. **Reactivity**: Costs update immediately when warband ability changes
4. **Extensibility**: Pattern supports future warband abilities that modify costs

## Components and Interfaces

### Affected Components

1. **WeaponSelector** (`src/frontend/components/WeaponSelector.tsx`)
   - Currently displays `weapon.baseCost`
   - Needs to apply warband ability modifiers
   - Handles both close combat and ranged weapons

2. **EquipmentSelector** (`src/frontend/components/EquipmentSelector.tsx`)
   - Currently displays `equipment.baseCost`
   - Needs to apply warband ability modifiers

3. **PsychicPowerSelector** (`src/frontend/components/PsychicPowerSelector.tsx`)
   - Likely displays `power.cost` directly
   - Should use same pattern for consistency and future extensibility

### Solution Approach

Per the project's API architecture requirements, all frontend-backend communication must go through the API layer. However, for simple cost display calculations that don't require server state, we have two options:

#### Approach 1: Create Frontend Cost Utility (Recommended)

Create a frontend utility (`src/frontend/utils/costCalculations.ts`) that mirrors the backend CostModifierStrategy logic:

**Pros:**
- Maintains strict frontend/backend separation via API
- No additional API calls for simple display calculations
- Fast, synchronous cost display updates
- Follows project architecture standards

**Cons:**
- Code duplication between frontend and backend
- Must keep frontend utility in sync with backend logic
- Risk of divergence if not carefully maintained

**Mitigation:**
- Add integration tests that verify frontend calculations match backend API results
- Document that both implementations must be updated together
- Use shared constants from data files

#### Approach 2: API Endpoint for Individual Item Costs

Create a new API endpoint that calculates individual item costs:

**Pros:**
- Single source of truth (backend only)
- No code duplication

**Cons:**
- Requires API call for every item display
- Significant performance overhead (dozens of items × multiple selectors)
- Poor user experience (loading states, delays)
- Overkill for simple calculation logic

**Decision: Use Approach 1** - Create a frontend cost utility that mirrors the backend logic. This provides the best user experience while maintaining architectural separation. We'll add integration tests to ensure frontend and backend calculations stay in sync.

### Implementation Details

#### New Frontend Cost Utility

Create `src/frontend/utils/costCalculations.ts`:

```typescript
import { Weapon, Equipment, PsychicPower, WarbandAbility } from '../../backend/models/types';

/**
 * Calculate modified weapon cost based on warband ability
 * Mirrors backend CostModifierStrategy logic
 */
export function calculateWeaponCost(weapon: Weapon, ability: WarbandAbility | null): number {
  let cost = weapon.baseCost;
  
  // Heavily Armed: All ranged weapons cost 1 less
  if (ability === 'Heavily Armed' && weapon.type === 'ranged') {
    cost -= 1;
  }
  
  // Mutants: Specific close combat weapons cost 1 less
  if (ability === 'Mutants' && weapon.type === 'close') {
    const mutantWeapons = ['Claws & Teeth', 'Horrible Claws & Teeth', 'Whip/Tail'];
    if (mutantWeapons.includes(weapon.name)) {
      cost -= 1;
    }
  }
  
  // Clamp to minimum of 0
  return Math.max(0, cost);
}

/**
 * Calculate modified equipment cost based on warband ability
 * Mirrors backend CostModifierStrategy logic
 */
export function calculateEquipmentCost(equipment: Equipment, ability: WarbandAbility | null): number {
  // Soldiers: Specific equipment is free
  if (ability === 'Soldiers') {
    const freeEquipment = ['Grenade', 'Heavy Armor', 'Medkit'];
    if (freeEquipment.includes(equipment.name)) {
      return 0;
    }
  }
  
  return equipment.baseCost;
}

/**
 * Calculate psychic power cost based on warband ability
 * Currently no abilities modify psychic power costs, but pattern is established
 */
export function calculatePsychicPowerCost(power: PsychicPower, ability: WarbandAbility | null): number {
  // No current modifiers, but pattern is ready for future abilities
  return power.cost;
}
```

#### WeaponSelector Changes

```typescript
import { calculateWeaponCost } from '../utils/costCalculations';

const formatCostDisplay = (weapon: Weapon): string => {
  // Apply warband ability modifiers
  const modifiedCost = calculateWeaponCost(weapon, warbandAbility);
  return `${modifiedCost} pts`;
};
```

#### EquipmentSelector Changes

```typescript
import { calculateEquipmentCost } from '../utils/costCalculations';

const formatCostDisplay = (equipment: Equipment): string => {
  // Apply warband ability modifiers
  const modifiedCost = calculateEquipmentCost(equipment, warbandAbility);
  return `${modifiedCost} pts`;
};
```

#### PsychicPowerSelector Changes

```typescript
import { calculatePsychicPowerCost } from '../utils/costCalculations';

const formatCostDisplay = (power: PsychicPower): string => {
  // Apply warband ability modifiers (currently none, but pattern established)
  const modifiedCost = calculatePsychicPowerCost(power, warbandAbility);
  return `${modifiedCost} pts`;
};
```

## Data Models

No changes to data models are required. The existing types already support this:

```typescript
interface Weapon {
  id: string;
  name: string;
  type: 'close' | 'ranged';
  baseCost: number;
  // ... other fields
}

interface Equipment {
  id: string;
  name: string;
  baseCost: number;
  // ... other fields
}

interface PsychicPower {
  id: string;
  name: string;
  cost: number;
  // ... other fields
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

**Requirement 1: Modified cost display**
1.1: WHEN a user has Mutants ability selected AND views close combat weapons THEN the WeaponSelector SHALL display costs reduced by 1 for specific weapons
- Thoughts: This is testing that the UI displays the correct modified cost for specific weapons. We can test this by checking the rendered output.
- Testable: yes - example

1.2: WHEN a user has Soldiers ability selected AND views equipment THEN the EquipmentSelector SHALL display 0 cost for specific equipment
- Thoughts: This is testing that the UI displays 0 for specific equipment items.
- Testable: yes - example

1.3: WHEN a user has Heavily Armed ability selected AND views ranged weapons THEN the WeaponSelector SHALL display costs reduced by 1
- Thoughts: This is testing that the UI displays reduced costs for all ranged weapons.
- Testable: yes - example

1.4: WHEN a user changes the warband ability THEN the selectors SHALL immediately update displayed costs
- Thoughts: This is testing reactivity - that the UI updates when props change. This is a React behavior test.
- Testable: yes - example

1.5: WHEN any cost reduction would result in negative cost THEN the selector SHALL display 0
- Thoughts: This is an edge case that should be handled by the CostModifierStrategy (already tested there).
- Testable: edge case

1.6: WHEN no warband ability currently modifies psychic power costs THEN the PsychicPowerSelector SHALL display base costs
- Thoughts: This is testing the current behavior for psychic powers.
- Testable: yes - example

**Requirement 2: Consistency with backend**
2.1-2.3: WHEN the backend CostEngine calculates costs THEN the selectors SHALL display the same cost
- Thoughts: This is testing that frontend and backend calculations match. Since we're using the same CostModifierStrategy, this is guaranteed by design.
- Testable: yes - property

2.4: WHEN no warband ability is selected THEN the selectors SHALL display base costs unchanged
- Thoughts: This is testing the null/default case.
- Testable: yes - example

2.5: WHEN the total weirdo cost is calculated THEN it SHALL match the sum of displayed item costs
- Thoughts: This is testing overall consistency of the cost system.
- Testable: yes - property

### Property Reflection

After reviewing all properties, the key insight is:
- Most of these are UI rendering tests (examples) rather than universal properties
- The main property is that frontend and backend calculations must match
- Since we're using the same CostModifierStrategy, this is guaranteed by design

### Correctness Properties

**Property 1: Frontend-backend cost consistency**
*For any* weapon, equipment, or psychic power with a given warband ability, the cost displayed in the selector component must equal the cost calculated by the backend CostEngine for the same item and ability.
**Validates: Requirements 2.1, 2.2, 2.3**

**Property 2: Cost display reactivity**
*For any* warband ability change, all displayed costs in selector components must update to reflect the new ability's modifiers.
**Validates: Requirements 1.4**

## Error Handling

No new error handling is required. The CostModifierStrategy already handles:
- Null warband abilities (returns base cost)
- Cost clamping to minimum of 0
- Unknown items (returns base cost)

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples:

**WeaponSelector Tests:**
- Mutants ability reduces Claws & Teeth cost by 1
- Heavily Armed ability reduces ranged weapon costs by 1
- Null ability displays base costs
- Cost updates when warbandAbility prop changes

**EquipmentSelector Tests:**
- Soldiers ability sets Grenade, Heavy Armor, Medkit to 0 cost
- Null ability displays base costs
- Cost updates when warbandAbility prop changes

**PsychicPowerSelector Tests:**
- Displays base costs (no modifiers currently)
- Pattern is established for future abilities

**Testing Framework**: Vitest with React Testing Library
**Test Location**: Co-located with component files

### Integration Testing

Integration tests will verify:
- Frontend cost calculations match backend API calculations
- Selector components display costs that match backend calculations
- Total weirdo cost equals sum of displayed item costs
- Costs update correctly when warband ability changes in WarbandContext

**Critical Test**: Verify frontend `costCalculations.ts` produces same results as backend `CostModifierStrategy` for all warband abilities and item types.

## Implementation Notes

### Performance Considerations

- **Strategy Creation**: Creating a new strategy instance for each item is lightweight (no state, just logic)
- **Memoization**: Components are already memoized with `memo()`, so they only re-render when props change
- **No Additional API Calls**: This fix uses local calculation, no network overhead

### Migration Path

1. Update WeaponSelector to use CostModifierStrategy
2. Update EquipmentSelector to use CostModifierStrategy
3. Update PsychicPowerSelector to establish the pattern
4. Add unit tests for each component
5. Verify integration with existing cost calculation flow

### Dependencies

- New frontend utility: `src/frontend/utils/costCalculations.ts`
- Shared type definitions from `src/backend/models/types.ts`
- No new external dependencies required

### Integration Points

This fix integrates with:
- **WarbandContext**: Receives `warbandAbility` prop
- **CostModifierStrategy**: Uses same logic as backend
- **WeirdoEditor**: Parent component that passes warbandAbility to selectors
