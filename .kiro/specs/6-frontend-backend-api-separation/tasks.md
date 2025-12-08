# Implementation Plan

- [x] 1. Create cost cache infrastructure





  - Implement `CostCache` class with LRU eviction and TTL
  - Support get, set, invalidate, and clear operations
  - Maximum 100 entries, 5-second TTL
  - Invalidation by predicate function
  - _Requirements: 6.1, 6.4, 6.5_

- [x] 1.1 Write property test for LRU cache eviction


  - **Property 16: LRU cache eviction at capacity**
  - **Validates: Requirements 6.5**

- [x] 1.2 Write property test for cache TTL expiration

  - **Property 10: Cache returns identical results for identical inputs**
  - **Validates: Requirements 6.1**

- [x] 1.3 Write property test for cache invalidation

  - **Property 15: Cache invalidation on warband ability change**
  - **Validates: Requirements 6.4**

- [x] 2. Create useCostCalculation hook




  - Accept cost calculation parameters (weirdo type, attributes, weapons, equipment, psychic powers, warband ability)
  - Return cost result with breakdown, warnings, loading state, and error state
  - Implement debouncing (300ms delay)
  - Integrate with CostCache for caching
  - Generate cache keys from parameters
  - Return last known value while loading (optimistic updates)
  - Call `/api/cost/calculate` endpoint
  - _Requirements: 1.1, 2.1, 3.1, 3.5, 3.6, 5.4, 5.6, 6.1, 6.2_

- [x] 2.1 Write property test for debouncing behavior


  - **Property 9: Debouncing reduces API calls during rapid changes**
  - **Validates: Requirements 3.5, 6.2**

- [x] 2.2 Write property test for cache hits


  - **Property 10: Cache returns identical results for identical inputs**
  - **Validates: Requirements 3.6, 5.5, 6.1**

- [x] 2.3 Write property test for optimistic updates


  - **Property 13: Frontend shows last known value during API requests**
  - **Validates: Requirements 5.6**

- [x] 3. Create useItemCost hook





  - Accept item parameters (type, name, warband ability, weapon type)
  - Return cost, loading state, and error state
  - Use same caching mechanism as useCostCalculation
  - Optimize for displaying costs in selector components
  - Batch multiple item cost requests when possible
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 3.1 Write property test for item cost caching


  - **Property 10: Cache returns identical results for identical inputs**
  - **Validates: Requirements 5.5, 6.1**

- [x] 4. Add batch cost calculation to API client




  - Add `calculateBatchCosts` method to apiClient
  - Accept array of items with types and names
  - Return map of item IDs to costs
  - Use existing `/api/cost/calculate` endpoint (may need backend enhancement)
  - _Requirements: 2.1, 2.3_
-

- [x] 5. Update WeaponSelector component




  - Remove import of `calculateWeaponCost` from `costCalculations.ts`
  - Add `useItemCost` hook for each weapon
  - Pass weapon name, warband ability, and weapon type to hook
  - Display cost from hook result
  - Handle loading and error states
  - _Requirements: 5.1, 5.4_

- [x] 5.1 Write property test for weapon selector API usage


  - **Property 12: Selector components use API for cost display**
  - **Validates: Requirements 5.1**

- [x] 6. Update EquipmentSelector component



  - Remove import of `calculateEquipmentCost` from `costCalculations.ts`
  - Add `useItemCost` hook for each equipment item
  - Pass equipment name and warband ability to hook
  - Display cost from hook result
  - Handle loading and error states
  - _Requirements: 5.2, 5.4_

- [x] 6.1 Write property test for equipment selector API usage

  - **Property 12: Selector components use API for cost display**
  - **Validates: Requirements 5.2**
-

- [x] 7. Update PsychicPowerSelector component



  - Remove import of `calculatePsychicPowerCost` from `costCalculations.ts`
  - Add `useItemCost` hook for each psychic power
  - Pass power name and warband ability to hook
  - Display cost from hook result
  - Handle loading and error states
  - _Requirements: 5.3, 5.4_

- [x] 7.1 Write property test for psychic power selector API usage

  - **Property 12: Selector components use API for cost display**
  - **Validates: Requirements 5.3**

- [x] 8. Update WeirdoCostDisplay component




  - Use `useCostCalculation` hook instead of local calculations
  - Pass complete weirdo configuration to hook
  - Display cost breakdown from hook result
  - Handle loading and error states
  - Show warnings and limit indicators from API response
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 3.3_

- [x] 8.1 Write property test for cost display updates


  - **Property 6: Cost updates display within performance threshold**
  - **Validates: Requirements 3.1**

- [x] 8.2 Write property test for cost breakdown


  - **Property 7: Cost breakdown contains all categories**
  - **Validates: Requirements 3.2**

- [x] 9. Verify no duplicate business logic in frontend




  - Scan frontend files for cost calculation implementations
  - Scan frontend files for validation rule implementations
  - Verify no imports of backend services or repositories
  - Verify only type imports from backend
  - _Requirements: 1.3, 2.2, 4.1, 4.2, 4.3, 4.4_

- [x] 9.1 Write property test for no duplicate logic


  - **Property 3: Frontend contains no duplicate business logic**
  - **Validates: Requirements 1.3, 2.2**

- [x] 9.2 Write property test for type-only imports


  - **Property 11: Frontend imports only type definitions from Backend**
  - **Validates: Requirements 1.4, 4.4**
-

- [x] 10. Remove src/frontend/utils/costCalculations.ts



  - Delete the file containing duplicated cost calculation logic
  - Verify no remaining imports of this file
  - Run full test suite to ensure no regressions
  - _Requirements: 5.7_

- [x] 11. Checkpoint - Ensure all tests pass








  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Update documentation





  - Document acceptable backend imports (type definitions only)
  - Document prohibited backend imports (services, repositories, business logic)
  - Provide examples of proper API client usage
  - Document useCostCalculation and useItemCost hooks
  - Document caching and debouncing strategies
  - Add architectural diagrams showing frontend-backend communication
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
-

- [x] 13. Performance verification



  - Measure cost update latency (should be <200ms)
  - Measure backend API response time (should be <100ms)
  - Verify cache hit rate is reasonable (>50% for typical usage)
  - Verify debouncing reduces API calls effectively
  - _Requirements: 3.1, 6.3_

- [x] 13.1 Write property test for backend performance


  - **Property 14: Backend responds within performance threshold**
  - **Validates: Requirements 6.3**


- [x] 14. Final checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
