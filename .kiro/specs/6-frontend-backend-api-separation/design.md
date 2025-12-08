# Design Document: Frontend-Backend API Separation

## Overview

This design addresses the architectural concern of duplicated business logic between frontend and backend code. Currently, the frontend contains `src/frontend/utils/costCalculations.ts` which duplicates the backend's cost calculation logic to provide real-time cost feedback in the UI. This creates maintenance burden and potential for inconsistencies.

The solution centralizes all business logic in the backend while maintaining responsive real-time updates through:
1. **API-based cost calculations**: All cost calculations performed by backend
2. **Smart caching**: Frontend caches identical calculation results
3. **Request debouncing**: Delays API calls during rapid user input
4. **Optimistic UI updates**: Shows last known values while requests are in flight

### Current State

**Frontend duplicates backend logic:**
- `src/frontend/utils/costCalculations.ts` contains `calculateWeaponCost()`, `calculateEquipmentCost()`, `calculatePsychicPowerCost()`
- These functions mirror backend `CostModifierStrategy` logic
- Used by `WeaponSelector`, `EquipmentSelector`, `PsychicPowerSelector` components

**Backend provides API endpoint:**
- `/api/cost/calculate` endpoint exists and is optimized for <100ms response
- Handles all cost calculations with warband ability modifiers
- Returns detailed breakdown by category

### Target State

**Frontend uses API exclusively:**
- Remove `src/frontend/utils/costCalculations.ts`
- Components call backend API for cost calculations
- Caching layer prevents redundant API calls
- Debouncing reduces API load during rapid changes

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                                                              │
│  ┌──────────────────┐      ┌─────────────────────────────┐ │
│  │  UI Components   │      │   Cost Calculation Hook     │ │
│  │                  │─────▶│   (useCostCalculation)      │ │
│  │ - WeaponSelector │      │                             │ │
│  │ - EquipmentSel.  │      │  - Debouncing (300ms)       │ │
│  │ - PsychicPowerSel│      │  - Caching (LRU, 100 items) │ │
│  └──────────────────┘      │  - Optimistic updates       │ │
│                             └──────────┬──────────────────┘ │
│                                        │                     │
│                             ┌──────────▼──────────────────┐ │
│                             │      API Client             │ │
│                             │  (apiClient.ts)             │ │
│                             └──────────┬──────────────────┘ │
└─────────────────────────────────────────┼───────────────────┘
                                          │ HTTP
                              ┌───────────▼───────────────────┐
                              │         Backend               │
                              │                               │
                              │  POST /api/cost/calculate     │
                              │                               │
                              │  ┌─────────────────────────┐  │
                              │  │    CostEngine           │  │
                              │  │  - calculateWeirdoCost  │  │
                              │  │  - getWeaponCost        │  │
                              │  │  - getEquipmentCost     │  │
                              │  │  - getPsychicPowerCost  │  │
                              │  └─────────────────────────┘  │
                              │                               │
                              │  ┌─────────────────────────┐  │
                              │  │ CostModifierStrategy    │  │
                              │  │  - Warband ability mods │  │
                              │  └─────────────────────────┘  │
                              └───────────────────────────────┘
```

### Data Flow

**User selects weapon:**
1. User clicks weapon checkbox in `WeaponSelector`
2. Component calls `useCostCalculation` hook with updated weapon list
3. Hook checks cache for identical request
4. If cached: Return immediately
5. If not cached: Debounce and queue API request
6. Hook returns last known cost (optimistic update)
7. API request completes, cache updated, UI re-renders with accurate cost

## Components and Interfaces

### 1. Cost Calculation Hook (`useCostCalculation`)

**Purpose**: Centralized hook for cost calculations with caching and debouncing

**Interface**:
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

function useCostCalculation(
  params: CostCalculationParams
): CostCalculationResult;
```

**Behavior**:
- Debounces API calls by 300ms
- Caches results using params as key
- Returns last known value while loading
- Invalidates cache when warband ability changes

### 2. Item Cost Hook (`useItemCost`)

**Purpose**: Simplified hook for calculating individual item costs (weapons, equipment, psychic powers)

**Interface**:
```typescript
interface ItemCostParams {
  itemType: 'weapon' | 'equipment' | 'psychicPower';
  itemName: string;
  warbandAbility: WarbandAbility | null;
  // For weapons, need to know if close or ranged
  weaponType?: 'close' | 'ranged';
}

interface ItemCostResult {
  cost: number;
  isLoading: boolean;
  error: string | null;
}

function useItemCost(params: ItemCostParams): ItemCostResult;
```

**Behavior**:
- Uses same caching mechanism as `useCostCalculation`
- Optimized for displaying costs in selector components
- Batches multiple item cost requests into single API call

### 3. Cost Cache Service

**Purpose**: LRU cache for cost calculation results

**Interface**:
```typescript
interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
}

class CostCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttl: number = 5000);
  
  get(key: string): T | null;
  set(key: string, value: T): void;
  invalidate(predicate: (key: string) => boolean): void;
  clear(): void;
}
```

**Behavior**:
- Maximum 100 cached entries
- 5-second TTL for cached values
- LRU eviction when capacity reached
- Invalidation by predicate (e.g., when warband ability changes)

### 4. Updated API Client Methods

**Add batch cost calculation**:
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

async calculateBatchCosts(request: BatchCostRequest): Promise<BatchCostResponse>;
```

### 5. Component Updates

**WeaponSelector**:
- Remove `import { calculateWeaponCost }` 
- Add `const { cost } = useItemCost({ itemType: 'weapon', itemName: weapon.name, warbandAbility, weaponType: type })`
- Display cost from hook result

**EquipmentSelector**:
- Remove `import { calculateEquipmentCost }`
- Add `const { cost } = useItemCost({ itemType: 'equipment', itemName: equipment.name, warbandAbility })`
- Display cost from hook result

**PsychicPowerSelector**:
- Remove `import { calculatePsychicPowerCost }`
- Add `const { cost } = useItemCost({ itemType: 'psychicPower', itemName: power.name, warbandAbility })`
- Display cost from hook result

## Data Models

### Cache Key Generation

```typescript
function generateCacheKey(params: CostCalculationParams): string {
  // Create deterministic string representation
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

### Cache Entry Structure

```typescript
interface CostCacheEntry {
  key: string;
  value: CostCalculationResult;
  timestamp: number;
  accessCount: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, several properties were identified as redundant or overlapping:
- Requirements 1.1 and 2.1 both test that Frontend uses API calls
- Requirements 2.2 and 1.3 both test absence of business logic imports
- Requirements 5.1, 5.2, 5.3 can be combined (all selector components use API)
- Requirements 5.5 and 6.1 both test cache hits
- Requirements 3.5 and 6.2 both test debouncing
- Requirements 3.3 and 3.4 both test display of modified costs

The following consolidated properties eliminate redundancy while maintaining complete coverage.

### Correctness Properties

Property 1: Frontend uses API for all cost calculations
*For any* cost calculation request from the Frontend, the request SHALL result in an HTTP call to the Backend API endpoint rather than local calculation
**Validates: Requirements 1.1, 2.1, 5.4**

Property 2: Backend applies warband ability modifiers correctly
*For any* combination of items and warband ability, when the Backend calculates costs, the returned cost SHALL equal the base cost plus all applicable warband ability modifiers
**Validates: Requirements 1.2**

Property 3: Frontend contains no duplicate business logic
*For any* Frontend source file, the file SHALL NOT contain implementations of cost calculation algorithms, validation rules, or other business logic that exists in the Backend
**Validates: Requirements 1.3, 2.2**

Property 4: Frontend uses centralized API client
*For any* Backend communication from the Frontend, the communication SHALL use the API Client module rather than direct fetch calls
**Validates: Requirements 2.3**

Property 5: Frontend displays API-returned data without recalculation
*For any* cost value returned from the Backend API, the Frontend SHALL display the value directly without passing it through local calculation functions
**Validates: Requirements 2.4**

Property 6: Cost updates display within performance threshold
*For any* user modification to Weirdo attributes or equipment, the Frontend SHALL display updated costs within 200 milliseconds
**Validates: Requirements 3.1**

Property 7: Cost breakdown contains all categories
*For any* cost calculation result, the breakdown SHALL include values for attributes, weapons, equipment, and psychic powers categories
**Validates: Requirements 3.2**

Property 8: Frontend displays costs with warband ability modifiers
*For any* item displayed in the UI when a warband ability is active, the displayed cost SHALL reflect the warband ability modifier
**Validates: Requirements 3.3, 3.4**

Property 9: Debouncing reduces API calls during rapid changes
*For any* sequence of cost calculation requests within 300 milliseconds, the Frontend SHALL make at most one Backend API call after the debounce period
**Validates: Requirements 3.5, 6.2**

Property 10: Cache returns identical results for identical inputs
*For any* cost calculation request, if an identical request was made within 5 seconds, the Frontend SHALL return the cached result without making a Backend API call
**Validates: Requirements 3.6, 5.5, 6.1**

Property 11: Frontend imports only type definitions from Backend
*For any* import statement in Frontend code that references Backend modules, the import SHALL be a type-only import (TypeScript `import type` syntax)
**Validates: Requirements 1.4, 4.4**

Property 12: Selector components use API for cost display
*For any* selector component (WeaponSelector, EquipmentSelector, PsychicPowerSelector), when displaying item costs, the component SHALL retrieve costs from the Backend API with warband ability context
**Validates: Requirements 5.1, 5.2, 5.3**

Property 13: Frontend shows last known value during API requests
*For any* cost calculation request while a Backend API call is in flight, the Frontend SHALL display the most recent known cost value
**Validates: Requirements 5.6**

Property 14: Backend responds within performance threshold
*For any* cost calculation request to the Backend, the Backend SHALL respond within 100 milliseconds
**Validates: Requirements 6.3**

Property 15: Cache invalidation on warband ability change
*For any* change to the warband ability, the Frontend SHALL invalidate all cached cost calculations
**Validates: Requirements 6.4**

Property 16: LRU cache eviction at capacity
*For any* cache state at maximum capacity (100 entries), when a new entry is added, the Frontend SHALL evict the least-recently-used entry
**Validates: Requirements 6.5**

## Error Handling

### API Request Failures

**Network errors:**
- Display error message to user
- Retain last known cost value
- Provide retry button
- Log error details for debugging

**Timeout errors:**
- Timeout threshold: 5 seconds
- Display timeout message
- Offer manual retry
- Consider request failed for cache purposes

**Validation errors (400):**
- Display validation message from API
- Highlight problematic fields
- Prevent submission until resolved

**Server errors (500):**
- Display generic error message
- Log full error details
- Provide retry mechanism
- Fall back to last known values

### Cache Errors

**Cache corruption:**
- Clear entire cache
- Log error
- Continue with fresh API calls

**Memory pressure:**
- Reduce cache size dynamically
- Increase eviction frequency
- Log memory warnings

### Component Errors

**Missing warband ability context:**
- Default to null (no ability)
- Log warning
- Continue with calculation

**Invalid item data:**
- Skip invalid items
- Log validation error
- Display warning to user

## Testing Strategy

### Unit Tests

**Cost Calculation Hook:**
- Test debouncing behavior with rapid calls
- Test cache hits and misses
- Test cache invalidation on ability change
- Test error handling and retry logic
- Test optimistic updates during loading

**Cost Cache Service:**
- Test LRU eviction at capacity
- Test TTL expiration
- Test cache key generation
- Test invalidation by predicate
- Test clear operation

**Item Cost Hook:**
- Test individual item cost retrieval
- Test batch cost optimization
- Test loading states
- Test error states

**API Client:**
- Test batch cost calculation endpoint
- Test request/response format
- Test error handling

### Property-Based Tests

Property-based tests will use fast-check library with minimum 50 iterations per test.

**Property 1: API usage**
- Generate random cost calculation parameters
- Verify API client method is called
- Verify no local calculation functions are invoked

**Property 2: Warband ability modifiers**
- Generate random items and abilities
- Calculate costs via API
- Verify costs match expected values with modifiers

**Property 3: No duplicate logic**
- Scan frontend files for business logic patterns
- Verify no cost calculation implementations exist
- Verify no validation rule implementations exist

**Property 9: Debouncing**
- Generate rapid sequences of requests (< 300ms apart)
- Verify only one API call is made
- Verify final result is correct

**Property 10: Caching**
- Generate identical requests within 5 seconds
- Verify first request hits API
- Verify subsequent requests use cache
- Verify no additional API calls

**Property 15: Cache invalidation**
- Generate cost calculations with ability A
- Change to ability B
- Verify cache is cleared
- Verify new calculations use ability B

**Property 16: LRU eviction**
- Fill cache to capacity (100 entries)
- Add new entry
- Verify least-recently-used entry is evicted
- Verify cache size remains at 100

### Integration Tests

**End-to-end cost calculation flow:**
1. User selects weapon in WeaponSelector
2. Verify API call to /api/cost/calculate
3. Verify cost displayed in UI
4. Verify cost breakdown shown
5. User changes warband ability
6. Verify cache invalidated
7. Verify new cost calculated with new ability

**Performance tests:**
- Measure time from user action to cost display
- Verify < 200ms for typical operations
- Verify backend responds < 100ms
- Test under various network conditions

**Cache behavior tests:**
- Fill cache with 100 entries
- Verify LRU eviction works correctly
- Verify TTL expiration works correctly
- Verify invalidation works correctly

## Implementation Notes

### Migration Strategy

**Phase 1: Add new infrastructure (no breaking changes)**
1. Implement `CostCache` service
2. Implement `useCostCalculation` hook
3. Implement `useItemCost` hook
4. Add batch cost calculation to API client
5. Add comprehensive tests

**Phase 2: Update components (one at a time)**
1. Update `WeaponSelector` to use `useItemCost`
2. Update `EquipmentSelector` to use `useItemCost`
3. Update `PsychicPowerSelector` to use `useItemCost`
4. Update `WeirdoCostDisplay` to use `useCostCalculation`
5. Verify each component works before proceeding

**Phase 3: Remove old code**
1. Remove `src/frontend/utils/costCalculations.ts`
2. Remove any remaining imports
3. Run full test suite
4. Verify no regressions

### Performance Considerations

**Debounce timing:**
- 300ms provides good balance between responsiveness and API load
- Adjustable via configuration if needed

**Cache size:**
- 100 entries should handle typical usage patterns
- Each entry ~1KB, total ~100KB memory
- LRU ensures most relevant entries retained

**Cache TTL:**
- 5 seconds balances freshness with cache hits
- Warband ability changes invalidate immediately
- Adjustable via configuration

**API optimization:**
- Backend already optimized for <100ms response
- Batch requests reduce round trips
- Consider HTTP/2 multiplexing for parallel requests

### Backward Compatibility

**No breaking changes:**
- New hooks are additions, not replacements
- Components updated incrementally
- Old code removed only after full migration
- Feature flags could control rollout if needed

### Monitoring and Observability

**Metrics to track:**
- Cache hit rate
- API response times
- Debounce effectiveness (requests saved)
- Error rates
- User-perceived latency

**Logging:**
- Cache operations (hits, misses, evictions)
- API calls (timing, errors)
- Debounce operations
- Component updates

## Future Enhancements

### Potential Optimizations

**Predictive caching:**
- Pre-calculate costs for likely next selections
- Warm cache on component mount
- Background refresh of frequently accessed values

**WebSocket for real-time updates:**
- Push cost updates from server
- Eliminate polling
- Reduce latency further

**Service Worker caching:**
- Offline support
- Faster initial loads
- Background sync

**GraphQL migration:**
- More efficient data fetching
- Reduced over-fetching
- Better caching semantics

### Extensibility

**Plugin architecture for cost modifiers:**
- Allow custom warband abilities
- Support user-defined rules
- Enable A/B testing of rule changes

**Cost calculation versioning:**
- Support multiple rule versions
- Allow historical cost calculations
- Enable rule change impact analysis
