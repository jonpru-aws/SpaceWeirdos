# Frontend-Backend API Separation Guide

## Overview

This guide documents the architectural separation between frontend and backend code in the Space Weirdos Warband Builder. All business logic resides in the backend, with the frontend communicating exclusively through API calls.

## Table of Contents

1. [Acceptable vs Prohibited Imports](#acceptable-vs-prohibited-imports)
2. [API Client Usage](#api-client-usage)
3. [Cost Calculation Hooks](#cost-calculation-hooks)
4. [Caching Strategy](#caching-strategy)
5. [Debouncing Strategy](#debouncing-strategy)
6. [Architecture Diagrams](#architecture-diagrams)
7. [Migration Guide](#migration-guide)

## Acceptable vs Prohibited Imports

### ✅ Acceptable Backend Imports (Frontend)

Frontend code MAY import **type definitions only** from backend modules:

```typescript
// ✅ CORRECT: Type-only imports
import type { Warband, Weirdo, WarbandAbility } from '../../backend/models/types';
import type { ValidationError } from '../../backend/errors/AppError';
import type { CostBreakdown } from '../../backend/services/CostEngine';

// ✅ CORRECT: Using TypeScript import type syntax
import { type Warband, type Weirdo } from '../../backend/models/types';
```

**Why allowed:** Type definitions provide TypeScript type safety without including runtime code.

### ❌ Prohibited Backend Imports (Frontend)

Frontend code MUST NOT import business logic, services, or repositories:

```typescript
// ❌ WRONG: Importing services
import { CostEngine } from '../../backend/services/CostEngine';
import { ValidationService } from '../../backend/services/ValidationService';
import { WarbandService } from '../../backend/services/WarbandService';

// ❌ WRONG: Importing repositories
import { DataRepository } from '../../backend/services/DataRepository';

// ❌ WRONG: Importing business logic
import { CostModifierStrategy } from '../../backend/services/CostModifierStrategy';

// ❌ WRONG: Importing constants (use API instead)
import { TROOPER_LIMITS } from '../../backend/constants/costs';
```

**Why prohibited:** These imports duplicate business logic in the frontend, creating maintenance burden and potential inconsistencies.

### Rule Enforcement

Use ESLint rules to enforce import restrictions:

```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["**/backend/services/*", "**/backend/constants/*"],
        "message": "Frontend must not import backend services or constants. Use API client instead."
      }]
    }]
  }
}
```

## API Client Usage

### Overview

The API client (`src/frontend/services/apiClient.ts`) is the **single point of communication** between frontend and backend.

### Basic Usage Pattern

```typescript
import { apiClient } from '../services/apiClient';

// Calculate weirdo cost
const result = await apiClient.calculateCost({
  weirdoType: 'leader',
  attributes: { speed: 5, defense: '4+', firepower: '5+', prowess: '4+', willpower: '5+' },
  weapons: { close: ['Sword'], ranged: ['Pistol'] },
  equipment: ['Shield'],
  psychicPowers: [],
  warbandAbility: null
});

console.log(result.totalCost);        // 25
console.log(result.breakdown);        // { attributes: 15, weapons: 8, equipment: 2, psychicPowers: 0 }
console.log(result.warnings);         // ['Approaching point limit']
```

### Available API Methods

#### 1. Calculate Cost


**Endpoint:** `POST /api/cost/calculate`

**Purpose:** Calculate total cost and breakdown for a weirdo configuration

```typescript
interface CostCalculationRequest {
  weirdoType: 'leader' | 'trooper';
  attributes: {
    speed: number;
    defense: string;
    firepower: string;
    prowess: string;
    willpower: string;
  };
  weapons?: {
    close?: string[];
    ranged?: string[];
  };
  equipment?: string[];
  psychicPowers?: string[];
  warbandAbility?: WarbandAbility | null;
}

interface CostCalculationResponse {
  totalCost: number;
  breakdown: {
    attributes: number;
    weapons: number;
    equipment: number;
    psychicPowers: number;
  };
  warnings: string[];
  isApproachingLimit: boolean;
  isOverLimit: boolean;
}

// Usage
const response = await apiClient.calculateCost(request);
```

#### 2. Batch Cost Calculation

**Endpoint:** `POST /api/cost/calculate-batch`

**Purpose:** Calculate costs for multiple items in a single request (optimized for selectors)

```typescript
interface BatchCostRequest {
  items: Array<{
    id: string;
    type: 'weapon' | 'equipment' | 'psychicPower';
    name: string;
    weaponType?: 'close' | 'ranged';
  }>;
  warbandAbility: WarbandAbility | null;
}

interface BatchCostResponse {
  costs: Record<string, number>; // id -> cost mapping
}

// Usage
const response = await apiClient.calculateBatchCosts({
  items: [
    { id: 'sword', type: 'weapon', name: 'Sword', weaponType: 'close' },
    { id: 'pistol', type: 'weapon', name: 'Pistol', weaponType: 'ranged' },
    { id: 'shield', type: 'equipment', name: 'Shield' }
  ],
  warbandAbility: { name: 'Heavily Armed', description: '...' }
});

console.log(response.costs.sword);   // 3
console.log(response.costs.pistol);  // 4 (with discount)
console.log(response.costs.shield);  // 2
```

### Error Handling

```typescript
try {
  const result = await apiClient.calculateCost(request);
  // Use result
} catch (error) {
  if (error.response?.status === 400) {
    // Validation error
    console.error('Invalid request:', error.response.data.message);
  } else if (error.response?.status === 500) {
    // Server error
    console.error('Server error:', error.response.data.message);
  } else {
    // Network error
    console.error('Network error:', error.message);
  }
}
```

### Best Practices

1. **Always use the API client** - Never make direct `fetch()` calls to backend
2. **Handle errors gracefully** - Display user-friendly messages
3. **Use TypeScript types** - Import types from backend for type safety
4. **Don't recalculate** - Use API-returned values directly
5. **Batch when possible** - Use batch endpoints for multiple items

## Cost Calculation Hooks

### useCostCalculation Hook

**Purpose:** Calculate complete weirdo cost with caching and debouncing

**Location:** `src/frontend/hooks/useCostCalculation.ts`

#### Interface

```typescript
interface CostCalculationParams {
  weirdoType: 'leader' | 'trooper';
  attributes: {
    speed: number;
    defense: string;
    firepower: string;
    prowess: string;
    willpower: string;
  };
  weapons?: {
    close?: string[];
    ranged?: string[];
  };
  equipment?: string[];
  psychicPowers?: string[];
  warbandAbility?: WarbandAbility | null;
}

interface CostCalculationResult {
  totalCost: number;
  breakdown: {
    attributes: number;
    weapons: number;
    equipment: number;
    psychicPowers: number;
  };
  warnings: string[];
  isApproachingLimit: boolean;
  isOverLimit: boolean;
  isLoading: boolean;
  error: string | null;
}

function useCostCalculation(params: CostCalculationParams): CostCalculationResult;
```

#### Usage Example

```typescript
import { useCostCalculation } from '../hooks/useCostCalculation';

function WeirdoCostDisplay({ weirdo, warbandAbility }) {
  const costResult = useCostCalculation({
    weirdoType: weirdo.type,
    attributes: weirdo.attributes,
    weapons: weirdo.weapons,
    equipment: weirdo.equipment,
    psychicPowers: weirdo.psychicPowers,
    warbandAbility
  });

  if (costResult.isLoading) {
    return <div>Calculating...</div>;
  }

  if (costResult.error) {
    return <div>Error: {costResult.error}</div>;
  }

  return (
    <div>
      <h3>Total Cost: {costResult.totalCost} pts</h3>
      <div>Attributes: {costResult.breakdown.attributes} pts</div>
      <div>Weapons: {costResult.breakdown.weapons} pts</div>
      <div>Equipment: {costResult.breakdown.equipment} pts</div>
      <div>Psychic Powers: {costResult.breakdown.psychicPowers} pts</div>
      {costResult.warnings.map(w => <div key={w}>{w}</div>)}
    </div>
  );
}
```

#### Features


- **Automatic debouncing** (300ms) - Reduces API calls during rapid changes
- **Automatic caching** (5 seconds) - Returns cached results for identical requests
- **Optimistic updates** - Shows last known value while loading
- **Error handling** - Provides error state for display
- **Loading state** - Indicates when calculation is in progress

### useItemCost Hook

**Purpose:** Calculate individual item costs (optimized for selector components)

**Location:** `src/frontend/hooks/useItemCost.ts`

#### Interface

```typescript
interface ItemCostParams {
  itemType: 'weapon' | 'equipment' | 'psychicPower';
  itemName: string;
  warbandAbility: WarbandAbility | null;
  weaponType?: 'close' | 'ranged'; // Required for weapons
}

interface ItemCostResult {
  cost: number;
  isLoading: boolean;
  error: string | null;
}

function useItemCost(params: ItemCostParams): ItemCostResult;
```

#### Usage Example

```typescript
import { useItemCost } from '../hooks/useItemCost';

function WeaponOption({ weapon, warbandAbility, weaponType }) {
  const { cost, isLoading, error } = useItemCost({
    itemType: 'weapon',
    itemName: weapon.name,
    warbandAbility,
    weaponType
  });

  return (
    <option value={weapon.name}>
      {weapon.name} ({isLoading ? '...' : `${cost} pts`})
    </option>
  );
}
```

#### Features

- **Batch optimization** - Multiple calls are batched into single API request
- **Automatic caching** - Shares cache with `useCostCalculation`
- **Lightweight** - Optimized for rendering many items in selectors
- **Warband ability aware** - Automatically applies ability modifiers

## Caching Strategy

### Overview

The frontend implements an LRU (Least Recently Used) cache to minimize redundant API calls while ensuring data freshness.


### Cache Configuration

```typescript
// src/frontend/services/CostCache.ts
const cache = new CostCache<CostCalculationResponse>({
  maxSize: 100,      // Maximum 100 cached entries
  ttl: 5000          // 5-second time-to-live
});
```

### Cache Behavior

#### 1. Cache Hit (Identical Request Within TTL)

```
User Action → Check Cache → Cache Hit → Return Cached Result
                                      ↓
                              No API Call Made
```

**Example:**
```typescript
// First call - cache miss, makes API call
const result1 = useCostCalculation({ weirdoType: 'leader', ... });

// Second call (within 5 seconds, identical params) - cache hit, no API call
const result2 = useCostCalculation({ weirdoType: 'leader', ... });
```

#### 2. Cache Miss (New Request or Expired)

```
User Action → Check Cache → Cache Miss → Make API Call → Cache Result → Return
```

#### 3. Cache Invalidation (Warband Ability Change)

```
Ability Change → Invalidate All Cached Entries → Next Request Makes API Call
```

**Example:**
```typescript
// Cached results exist for "Heavily Armed" ability
const result1 = useCostCalculation({ ..., warbandAbility: heavilyArmed });

// User changes to "Mutants" ability - cache is cleared
setWarbandAbility(mutants);

// Next call makes fresh API request
const result2 = useCostCalculation({ ..., warbandAbility: mutants });
```

#### 4. LRU Eviction (Cache at Capacity)

When cache reaches 100 entries, least recently used entry is evicted:

```
Cache Full (100 entries) → New Entry Added → Evict LRU Entry → Cache Size = 100
```

### Cache Key Generation

Cache keys are generated from request parameters:

```typescript
function generateCacheKey(params: CostCalculationParams): string {
  return JSON.stringify({
    type: params.weirdoType,
    attrs: params.attributes,
    weapons: {
      close: params.weapons?.close?.sort() || [],
      ranged: params.weapons?.ranged?.sort() || []
    },
    equipment: params.equipment?.sort() || [],
    powers: params.psychicPowers?.sort() || [],
    ability: params.warbandAbility
  });
}
```

**Note:** Arrays are sorted to ensure consistent keys regardless of order.


### Cache Performance Metrics

**Expected cache hit rate:** >50% for typical usage

**Scenarios with high cache hit rate:**
- User reviewing different weirdos without changes
- User navigating between warbands
- Multiple components displaying same weirdo

**Scenarios with low cache hit rate:**
- User actively editing weirdo attributes
- Frequent warband ability changes
- First-time page loads

## Debouncing Strategy

### Overview

Debouncing delays API calls during rapid user input to reduce backend load and improve performance.

### Configuration

```typescript
const DEBOUNCE_DELAY = 300; // milliseconds
```

### Behavior

#### Without Debouncing (❌ Bad)

```
User types "S" → API Call 1
User types "w" → API Call 2
User types "o" → API Call 3
User types "r" → API Call 4
User types "d" → API Call 5

Result: 5 API calls for typing "Sword"
```

#### With Debouncing (✅ Good)

```
User types "S" → Start Timer (300ms)
User types "w" → Reset Timer (300ms)
User types "o" → Reset Timer (300ms)
User types "r" → Reset Timer (300ms)
User types "d" → Reset Timer (300ms)
[300ms passes] → API Call 1

Result: 1 API call for typing "Sword"
```

### Implementation

The `useCostCalculation` hook automatically debounces API calls:

```typescript
import { useMemo, useEffect, useState } from 'react';
import { debounce } from 'lodash';

function useCostCalculation(params: CostCalculationParams) {
  const [result, setResult] = useState<CostCalculationResult>(initialState);

  const debouncedCalculate = useMemo(
    () => debounce(async (params) => {
      const response = await apiClient.calculateCost(params);
      setResult(response);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedCalculate(params);
  }, [params, debouncedCalculate]);

  return result;
}
```


### Optimistic Updates

While debounced API call is pending, the hook returns the **last known value**:

```typescript
// User has Sword selected (cost: 3 pts)
const result1 = useCostCalculation({ weapons: { close: ['Sword'] } });
console.log(result1.totalCost); // 15 (includes sword)
console.log(result1.isLoading); // false

// User adds Pistol - debounce timer starts
const result2 = useCostCalculation({ weapons: { close: ['Sword'], ranged: ['Pistol'] } });
console.log(result2.totalCost); // 15 (still showing old value)
console.log(result2.isLoading); // true

// After 300ms, API call completes
const result3 = useCostCalculation({ weapons: { close: ['Sword'], ranged: ['Pistol'] } });
console.log(result3.totalCost); // 19 (updated with pistol)
console.log(result3.isLoading); // false
```

This provides immediate feedback to users while minimizing API calls.

### Performance Impact

**Without debouncing:**
- 10 rapid changes = 10 API calls
- Backend load: High
- Network usage: High
- User experience: Potential lag from too many requests

**With debouncing (300ms):**
- 10 rapid changes = 1 API call
- Backend load: Low
- Network usage: Low
- User experience: Smooth, responsive

## Architecture Diagrams

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    UI Components                            │ │
│  │  - WeaponSelector                                           │ │
│  │  - EquipmentSelector                                        │ │
│  │  - PsychicPowerSelector                                     │ │
│  │  - WeirdoCostDisplay                                        │ │
│  └────────────────┬───────────────────────────────────────────┘ │
│                   │                                              │
│                   │ uses                                         │
│                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Cost Calculation Hooks                         │ │
│  │  - useCostCalculation (complete weirdo cost)                │ │
│  │  - useItemCost (individual item costs)                      │ │
│  │                                                              │ │
│  │  Features:                                                   │ │
│  │  • Debouncing (300ms)                                       │ │
│  │  • Caching (5s TTL, 100 entries)                            │ │
│  │  • Optimistic updates                                       │ │
│  └────────────────┬───────────────────────────────────────────┘ │
│                   │                                              │
│                   │ uses                                         │
│                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   API Client                                │ │
│  │  (src/frontend/services/apiClient.ts)                       │ │
│  │                                                              │ │
│  │  Methods:                                                    │ │
│  │  • calculateCost(params)                                    │ │
│  │  • calculateBatchCosts(items)                               │ │
│  └────────────────┬───────────────────────────────────────────┘ │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    │ HTTP POST
                    │
┌───────────────────▼──────────────────────────────────────────────┐
│                    Backend (Express)                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   API Routes                                │  │
│  │  POST /api/cost/calculate                                   │  │
│  │  POST /api/cost/calculate-batch                             │  │
│  └────────────────┬───────────────────────────────────────────┘  │
│                   │                                               │
│                   │ calls                                         │
│                   ▼                                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  CostEngine                                 │  │
│  │  - calculateWeirdoCost()                                    │  │
│  │  - getWeaponCost()                                          │  │
│  │  - getEquipmentCost()                                       │  │
│  │  - getPsychicPowerCost()                                    │  │
│  └────────────────┬───────────────────────────────────────────┘  │
│                   │                                               │
│                   │ uses                                          │
│                   ▼                                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │            CostModifierStrategy                             │  │
│  │  - applyWeaponDiscount()                                    │  │
│  │  - applyEquipmentDiscount()                                 │  │
│  │  - applyPsychicPowerDiscount()                              │  │
│  │                                                              │  │
│  │  Implementations:                                            │  │
│  │  • DefaultCostStrategy                                      │  │
│  │  • MutantsCostStrategy                                      │  │
│  │  • HeavilyArmedCostStrategy                                 │  │
│  │  • PsychicCostStrategy                                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow: User Selects Weapon

```
┌──────────────┐
│ User clicks  │
│ weapon       │
│ checkbox     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ WeaponSelector Component                                 │
│ - Updates local state                                    │
│ - Calls useCostCalculation with new weapon list          │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ useCostCalculation Hook                                  │
│ 1. Generate cache key from params                        │
│ 2. Check cache for existing result                       │
└──────┬───────────────────────────────────────────────────┘
       │
       ├─── Cache Hit ────────────────────────────────────┐
       │                                                   │
       │   ┌───────────────────────────────────────────┐  │
       │   │ Return cached result immediately          │  │
       │   │ No API call made                          │  │
       │   └───────────────────────────────────────────┘  │
       │                                                   │
       └─── Cache Miss ───────────────────────────────────┤
                                                           │
           ┌───────────────────────────────────────────┐  │
           │ Start debounce timer (300ms)              │  │
           │ Return last known value (optimistic)      │  │
           └───────┬───────────────────────────────────┘  │
                   │                                       │
                   ▼                                       │
           ┌───────────────────────────────────────────┐  │
           │ Timer expires                             │  │
           │ Make API call to /api/cost/calculate      │  │
           └───────┬───────────────────────────────────┘  │
                   │                                       │
                   ▼                                       │
           ┌───────────────────────────────────────────┐  │
           │ Backend: CostEngine.calculateWeirdoCost() │  │
           │ - Apply warband ability modifiers         │  │
           │ - Calculate breakdown by category         │  │
           │ - Generate warnings                       │  │
           └───────┬───────────────────────────────────┘  │
                   │                                       │
                   ▼                                       │
           ┌───────────────────────────────────────────┐  │
           │ Response returned to frontend             │  │
           │ - totalCost: 25                           │  │
           │ - breakdown: { ... }                      │  │
           │ - warnings: [ ... ]                       │  │
           └───────┬───────────────────────────────────┘  │
                   │                                       │
                   ▼                                       │
           ┌───────────────────────────────────────────┐  │
           │ Cache result with 5s TTL                  │  │
           │ Update component state                    │  │
           └───────┬───────────────────────────────────┘  │
                   │                                       │
                   ▼                                       │
           ┌───────────────────────────────────────────┐  │
           │ UI re-renders with updated cost           │  │
           │ User sees new total: 25 pts               │  │
           └───────────────────────────────────────────┘  │
                                                           │
───────────────────────────────────────────────────────────┘
```

### Cache Invalidation Flow

```
┌──────────────────┐
│ User changes     │
│ warband ability  │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ WarbandContext                                         │
│ - Updates warbandAbility state                         │
│ - Triggers cache invalidation                          │
└────────┬───────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ CostCache.invalidate()                                 │
│ - Clears all cached entries                            │
│ - Cache size: 100 → 0                                  │
└────────┬───────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ All components using useCostCalculation                │
│ - Next call will be cache miss                         │
│ - Fresh API calls made with new ability                │
│ - Results cached with new ability context              │
└────────────────────────────────────────────────────────┘
```


## Migration Guide

### Migrating from Local Calculations to API

#### Before: Local Cost Calculation (❌ Old Way)

```typescript
// src/frontend/utils/costCalculations.ts (DELETED)
export function calculateWeaponCost(
  weapon: Weapon,
  warbandAbility: WarbandAbility | null
): number {
  let cost = weapon.baseCost;
  
  // Duplicate business logic in frontend
  if (warbandAbility?.name === 'Heavily Armed' && weapon.type === 'ranged') {
    cost -= 1;
  } else if (warbandAbility?.name === 'Mutants' && isMutantWeapon(weapon)) {
    cost -= 1;
  }
  
  return cost;
}

// Component using local calculation
function WeaponSelector({ weapons, warbandAbility }) {
  return weapons.map(weapon => {
    const cost = calculateWeaponCost(weapon, warbandAbility); // ❌ Local calculation
    return (
      <option key={weapon.name} value={weapon.name}>
        {weapon.name} ({cost} pts)
      </option>
    );
  });
}
```

**Problems:**
- Duplicates backend business logic
- Must be updated when backend rules change
- No single source of truth
- Potential for inconsistencies

#### After: API-Based Calculation (✅ New Way)

```typescript
// Component using API via hook
import { useItemCost } from '../hooks/useItemCost';

function WeaponOption({ weapon, warbandAbility, weaponType }) {
  const { cost, isLoading } = useItemCost({
    itemType: 'weapon',
    itemName: weapon.name,
    warbandAbility,
    weaponType
  });

  return (
    <option value={weapon.name}>
      {weapon.name} ({isLoading ? '...' : `${cost} pts`})
    </option>
  );
}

function WeaponSelector({ weapons, warbandAbility, weaponType }) {
  return weapons.map(weapon => (
    <WeaponOption 
      key={weapon.name}
      weapon={weapon}
      warbandAbility={warbandAbility}
      weaponType={weaponType}
    />
  ));
}
```

**Benefits:**
- Single source of truth (backend)
- Automatic caching and debouncing
- Always consistent with backend rules
- No frontend code changes when rules change


### Migration Checklist

When migrating a component from local calculations to API:

- [ ] **Remove local calculation imports**
  ```typescript
  // ❌ Remove this
  import { calculateWeaponCost } from '../utils/costCalculations';
  ```

- [ ] **Add hook import**
  ```typescript
  // ✅ Add this
  import { useItemCost } from '../hooks/useItemCost';
  ```

- [ ] **Replace calculation calls with hook**
  ```typescript
  // ❌ Remove this
  const cost = calculateWeaponCost(weapon, warbandAbility);
  
  // ✅ Add this
  const { cost, isLoading } = useItemCost({
    itemType: 'weapon',
    itemName: weapon.name,
    warbandAbility,
    weaponType: 'close'
  });
  ```

- [ ] **Handle loading state**
  ```typescript
  // ✅ Add loading indicator
  {isLoading ? 'Calculating...' : `${cost} pts`}
  ```

- [ ] **Handle error state (optional)**
  ```typescript
  // ✅ Add error handling
  const { cost, isLoading, error } = useItemCost(...);
  if (error) return <div>Error: {error}</div>;
  ```

- [ ] **Test the component**
  - Verify costs display correctly
  - Verify loading states work
  - Verify warband ability modifiers apply
  - Verify caching works (no duplicate API calls)

- [ ] **Remove old utility file** (after all components migrated)
  ```bash
  # Only after ALL components are migrated
  rm src/frontend/utils/costCalculations.ts
  ```

### Common Migration Patterns

#### Pattern 1: Simple Item Cost Display

**Before:**
```typescript
function ItemDisplay({ item, ability }) {
  const cost = calculateItemCost(item, ability);
  return <span>{item.name} ({cost} pts)</span>;
}
```

**After:**
```typescript
function ItemDisplay({ item, ability }) {
  const { cost, isLoading } = useItemCost({
    itemType: 'equipment',
    itemName: item.name,
    warbandAbility: ability
  });
  return <span>{item.name} ({isLoading ? '...' : `${cost} pts`})</span>;
}
```


#### Pattern 2: Complete Weirdo Cost

**Before:**
```typescript
function WeirdoCostDisplay({ weirdo, ability }) {
  const attributeCost = calculateAttributeCost(weirdo.attributes);
  const weaponCost = calculateWeaponsCost(weirdo.weapons, ability);
  const equipmentCost = calculateEquipmentCost(weirdo.equipment, ability);
  const totalCost = attributeCost + weaponCost + equipmentCost;
  
  return (
    <div>
      <div>Total: {totalCost} pts</div>
      <div>Attributes: {attributeCost} pts</div>
      <div>Weapons: {weaponCost} pts</div>
      <div>Equipment: {equipmentCost} pts</div>
    </div>
  );
}
```

**After:**
```typescript
function WeirdoCostDisplay({ weirdo, ability }) {
  const { totalCost, breakdown, isLoading } = useCostCalculation({
    weirdoType: weirdo.type,
    attributes: weirdo.attributes,
    weapons: weirdo.weapons,
    equipment: weirdo.equipment,
    psychicPowers: weirdo.psychicPowers,
    warbandAbility: ability
  });
  
  if (isLoading) return <div>Calculating...</div>;
  
  return (
    <div>
      <div>Total: {totalCost} pts</div>
      <div>Attributes: {breakdown.attributes} pts</div>
      <div>Weapons: {breakdown.weapons} pts</div>
      <div>Equipment: {breakdown.equipment} pts</div>
      <div>Psychic Powers: {breakdown.psychicPowers} pts</div>
    </div>
  );
}
```

#### Pattern 3: Selector with Multiple Items

**Before:**
```typescript
function WeaponSelector({ weapons, ability, selected, onChange }) {
  return (
    <select value={selected} onChange={onChange}>
      {weapons.map(weapon => {
        const cost = calculateWeaponCost(weapon, ability);
        return (
          <option key={weapon.name} value={weapon.name}>
            {weapon.name} ({cost} pts)
          </option>
        );
      })}
    </select>
  );
}
```

**After:**
```typescript
function WeaponOption({ weapon, ability, weaponType }) {
  const { cost, isLoading } = useItemCost({
    itemType: 'weapon',
    itemName: weapon.name,
    warbandAbility: ability,
    weaponType
  });
  
  return (
    <option value={weapon.name}>
      {weapon.name} ({isLoading ? '...' : `${cost} pts`})
    </option>
  );
}

function WeaponSelector({ weapons, ability, weaponType, selected, onChange }) {
  return (
    <select value={selected} onChange={onChange}>
      {weapons.map(weapon => (
        <WeaponOption
          key={weapon.name}
          weapon={weapon}
          ability={ability}
          weaponType={weaponType}
        />
      ))}
    </select>
  );
}
```

**Note:** The `useItemCost` hook automatically batches multiple calls, so this pattern is efficient.


### Troubleshooting Migration Issues

#### Issue: "Too many API calls"

**Symptom:** Network tab shows many duplicate API calls

**Cause:** Not using hooks correctly, or cache not working

**Solution:**
```typescript
// ❌ Wrong: Creating new hook instance in render
function MyComponent() {
  return items.map(item => {
    // This creates a new hook for each item on every render
    const { cost } = useItemCost({ itemType: 'weapon', itemName: item.name, ... });
    return <div>{cost}</div>;
  });
}

// ✅ Correct: Extract to separate component
function ItemWithCost({ item, ... }) {
  const { cost } = useItemCost({ itemType: 'weapon', itemName: item.name, ... });
  return <div>{cost}</div>;
}

function MyComponent() {
  return items.map(item => <ItemWithCost key={item.name} item={item} ... />);
}
```

#### Issue: "Costs not updating when warband ability changes"

**Symptom:** Old costs still displayed after changing ability

**Cause:** Cache not invalidated properly

**Solution:**
```typescript
// Ensure WarbandContext properly invalidates cache
function WarbandProvider({ children }) {
  const [ability, setAbility] = useState(null);
  
  const updateAbility = useCallback((newAbility) => {
    setAbility(newAbility);
    // Invalidate cache when ability changes
    costCache.invalidate((key) => true); // Clear all entries
  }, []);
  
  return (
    <WarbandContext.Provider value={{ ability, updateAbility }}>
      {children}
    </WarbandContext.Provider>
  );
}
```

#### Issue: "Loading state never ends"

**Symptom:** Component stuck showing "Calculating..."

**Cause:** API error not handled, or infinite loop

**Solution:**
```typescript
// ✅ Always handle error state
const { cost, isLoading, error } = useItemCost(...);

if (error) {
  return <div>Error loading cost: {error}</div>;
}

if (isLoading) {
  return <div>Calculating...</div>;
}

return <div>{cost} pts</div>;
```

#### Issue: "TypeScript errors with backend types"

**Symptom:** Type errors when using backend types

**Cause:** Not using type-only imports

**Solution:**
```typescript
// ❌ Wrong: Regular import (includes runtime code)
import { Warband } from '../../backend/models/types';

// ✅ Correct: Type-only import
import type { Warband } from '../../backend/models/types';
```


## Performance Considerations

### Target Performance Metrics

- **Backend API response time:** <100ms
- **Frontend cost update latency:** <200ms (including debounce)
- **Cache hit rate:** >50% for typical usage
- **Debounce effectiveness:** >80% reduction in API calls during rapid input

### Optimization Strategies

#### 1. Use Batch Endpoints for Multiple Items

**Inefficient:**
```typescript
// Makes N separate API calls
weapons.forEach(weapon => {
  const { cost } = useItemCost({ itemType: 'weapon', itemName: weapon.name, ... });
});
```

**Efficient:**
```typescript
// useItemCost automatically batches these into a single API call
// No code changes needed - batching is automatic
weapons.map(weapon => (
  <WeaponOption weapon={weapon} ... />
));
```

#### 2. Memoize Expensive Calculations

```typescript
function WeirdoCostDisplay({ weirdo, ability }) {
  // ✅ useCostCalculation already memoizes based on params
  const costResult = useCostCalculation({
    weirdoType: weirdo.type,
    attributes: weirdo.attributes,
    weapons: weirdo.weapons,
    equipment: weirdo.equipment,
    psychicPowers: weirdo.psychicPowers,
    warbandAbility: ability
  });
  
  // No need for additional useMemo - hook handles it
  return <div>{costResult.totalCost} pts</div>;
}
```

#### 3. Avoid Unnecessary Re-renders

```typescript
// ✅ Use React.memo for components that render many items
export const WeaponOption = React.memo(function WeaponOption({ weapon, ability, weaponType }) {
  const { cost, isLoading } = useItemCost({
    itemType: 'weapon',
    itemName: weapon.name,
    warbandAbility: ability,
    weaponType
  });
  
  return (
    <option value={weapon.name}>
      {weapon.name} ({isLoading ? '...' : `${cost} pts`})
    </option>
  );
});
```

#### 4. Tune Debounce Delay

```typescript
// Default: 300ms (good for most cases)
const DEBOUNCE_DELAY = 300;

// For slower networks: increase delay
const DEBOUNCE_DELAY = 500;

// For very fast typing: decrease delay
const DEBOUNCE_DELAY = 200;
```

### Monitoring Performance

#### Measure Cache Hit Rate

```typescript
// Add to CostCache class
class CostCache<T> {
  private hits = 0;
  private misses = 0;
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && !this.isExpired(entry)) {
      this.hits++;
      return entry.value;
    }
    this.misses++;
    return null;
  }
  
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }
}

// Log cache performance
console.log(`Cache hit rate: ${(costCache.getHitRate() * 100).toFixed(1)}%`);
```


#### Measure API Response Time

```typescript
// Add timing to API client
async calculateCost(params: CostCalculationParams): Promise<CostCalculationResponse> {
  const startTime = performance.now();
  
  try {
    const response = await fetch('/api/cost/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`API response time: ${duration.toFixed(1)}ms`);
    
    if (duration > 100) {
      console.warn(`Slow API response: ${duration.toFixed(1)}ms (target: <100ms)`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}
```

#### Measure Debounce Effectiveness

```typescript
// Track API calls saved by debouncing
let totalRequests = 0;
let debouncedRequests = 0;

function useCostCalculation(params: CostCalculationParams) {
  const debouncedCalculate = useMemo(
    () => debounce(async (params) => {
      totalRequests++;
      console.log(`API calls saved by debouncing: ${debouncedRequests - totalRequests}`);
      // Make API call
    }, 300),
    []
  );
  
  useEffect(() => {
    debouncedRequests++;
    debouncedCalculate(params);
  }, [params, debouncedCalculate]);
}
```

## Best Practices Summary

### DO ✅

1. **Use type-only imports** from backend
   ```typescript
   import type { Warband } from '../../backend/models/types';
   ```

2. **Use API client for all backend communication**
   ```typescript
   const result = await apiClient.calculateCost(params);
   ```

3. **Use cost calculation hooks** in components
   ```typescript
   const { cost, isLoading } = useItemCost({ ... });
   ```

4. **Handle loading and error states**
   ```typescript
   if (isLoading) return <div>Loading...</div>;
   if (error) return <div>Error: {error}</div>;
   ```

5. **Trust the cache and debouncing** - they're automatic

6. **Extract item rendering to separate components** for better hook usage

7. **Use React.memo** for components that render many items

8. **Monitor performance metrics** in development

### DON'T ❌

1. **Don't import backend services or business logic**
   ```typescript
   // ❌ Never do this
   import { CostEngine } from '../../backend/services/CostEngine';
   ```

2. **Don't duplicate cost calculations in frontend**
   ```typescript
   // ❌ Never do this
   const cost = weapon.baseCost - (ability === 'Heavily Armed' ? 1 : 0);
   ```

3. **Don't make direct fetch calls** - use API client
   ```typescript
   // ❌ Never do this
   const response = await fetch('/api/cost/calculate', ...);
   ```

4. **Don't recalculate API-returned values**
   ```typescript
   // ❌ Never do this
   const adjustedCost = apiResult.totalCost * modifier;
   ```

5. **Don't create hooks inside loops or conditionals**
   ```typescript
   // ❌ Never do this
   items.map(item => {
     const { cost } = useItemCost({ ... }); // Wrong!
   });
   ```

6. **Don't bypass the cache** - let hooks manage it

7. **Don't implement custom debouncing** - hooks handle it

8. **Don't ignore loading/error states** - always handle them


## Testing the Separation

### Unit Tests

Test that components use API correctly:

```typescript
import { describe, test, expect, vi } from 'vitest';
import { renderWithProviders } from './testHelpers';
import { apiClient } from '../services/apiClient';

describe('WeaponSelector', () => {
  test('should use API for cost calculation', async () => {
    const calculateCostSpy = vi.spyOn(apiClient, 'calculateCost');
    
    renderWithProviders(<WeaponSelector weapons={mockWeapons} />);
    
    // Wait for hook to make API call
    await waitFor(() => {
      expect(calculateCostSpy).toHaveBeenCalled();
    });
  });
});
```

### Integration Tests

Test complete flow from user action to API call:

```typescript
test('should update cost when weapon selected', async () => {
  const { user } = renderWithProviders(<WeirdoEditor />);
  
  // Select weapon
  await user.click(screen.getByLabelText('Sword'));
  
  // Wait for debounce and API call
  await waitFor(() => {
    expect(screen.getByText(/25 pts/)).toBeInTheDocument();
  }, { timeout: 500 });
});
```

### Property-Based Tests

Test that frontend never duplicates backend logic:

```typescript
import * as fc from 'fast-check';

/**
 * Feature: frontend-backend-separation, Property 3: No duplicate business logic
 * Validates: Requirements 1.3, 2.2
 */
test('frontend contains no duplicate business logic', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...frontendFiles),
      (filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Should not contain cost calculation logic
        expect(content).not.toMatch(/baseCost\s*[-+]\s*\d/);
        expect(content).not.toMatch(/HEAVILY_ARMED_DISCOUNT/);
        expect(content).not.toMatch(/MUTANTS_DISCOUNT/);
        
        // Should not import backend services
        expect(content).not.toMatch(/from.*backend\/services/);
        
        return true;
      }
    ),
    { numRuns: 50 }
  );
});
```

## Conclusion

This architecture ensures:

- **Single source of truth:** All business logic in backend
- **Maintainability:** Changes only needed in one place
- **Performance:** Caching and debouncing optimize API usage
- **Type safety:** TypeScript types shared between frontend and backend
- **Testability:** Clear separation enables focused testing

By following this guide, you'll maintain clean separation between frontend and backend while providing responsive, real-time cost feedback to users.

## Additional Resources

- [Design Document](./design.md) - Complete architectural design
- [Requirements Document](./requirements.md) - Formal requirements specification
- [Task List](./tasks.md) - Implementation task breakdown
- [API Client Source](../../src/frontend/services/apiClient.ts) - API client implementation
- [useCostCalculation Hook](../../src/frontend/hooks/useCostCalculation.ts) - Cost calculation hook
- [useItemCost Hook](../../src/frontend/hooks/useItemCost.ts) - Item cost hook
- [CostCache Service](../../src/frontend/services/CostCache.ts) - Cache implementation
- [CONTRIBUTING.md](../../../CONTRIBUTING.md) - General contribution guidelines

