# Implementation Plan: Warband Ability Cost Display Fix

- [x] 1. Create frontend cost calculation utility




- [x] 1.1 Create `src/frontend/utils/costCalculations.ts` file


  - Implement `calculateWeaponCost` function with Heavily Armed and Mutants modifiers
  - Implement `calculateEquipmentCost` function with Soldiers modifier
  - Implement `calculatePsychicPowerCost` function (no current modifiers, but pattern established)
  - Ensure all cost reductions clamp at 0 (never negative)
  - Mirror the exact logic from backend CostModifierStrategy
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 2.1, 2.2, 2.3_

- [ ]* 1.2 Write unit tests for cost calculation utility
  - Test Heavily Armed reduces ranged weapon costs by 1
  - Test Mutants reduces specific close combat weapon costs by 1
  - Test Soldiers sets specific equipment costs to 0
  - Test null ability returns base costs
  - Test cost clamping at 0 minimum
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.4_
-

- [x] 2. Update WeaponSelector component



- [x] 2.1 Import `calculateWeaponCost` from cost calculations utility

  - Update `formatCostDisplay` function to use `calculateWeaponCost`
  - Pass `weapon` and `warbandAbility` to the calculation function
  - Verify component still receives `warbandAbility` prop
  - _Requirements: 1.1, 1.3, 1.4, 2.1_

- [ ]* 2.2 Write unit tests for WeaponSelector cost display
  - Test Mutants ability displays reduced costs for Claws & Teeth, Horrible Claws & Teeth, Whip/Tail
  - Test Heavily Armed ability displays reduced costs for ranged weapons
  - Test null ability displays base costs
  - Test cost display updates when warbandAbility prop changes
  - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.4_
- [x] 3. Update EquipmentSelector component



- [ ] 3. Update EquipmentSelector component

- [x] 3.1 Import `calculateEquipmentCost` from cost calculations utility

  - Update `formatCostDisplay` function to use `calculateEquipmentCost`
  - Pass `equipment` and `warbandAbility` to the calculation function
  - Verify component still receives `warbandAbility` prop
  - _Requirements: 1.2, 1.4, 2.2_

- [ ]* 3.2 Write unit tests for EquipmentSelector cost display
  - Test Soldiers ability displays 0 cost for Grenade, Heavy Armor, Medkit
  - Test null ability displays base costs
  - Test cost display updates when warbandAbility prop changes
  - _Requirements: 1.2, 1.4, 2.2, 2.4_

- [x] 4. Update PsychicPowerSelector component




- [x] 4.1 Check if PsychicPowerSelector exists and displays costs

  - If component exists, import `calculatePsychicPowerCost` from cost calculations utility
  - Update cost display function to use `calculatePsychicPowerCost`
  - Pass `power` and `warbandAbility` to the calculation function
  - Establish pattern for future warband abilities that modify psychic power costs
  - _Requirements: 1.6, 2.3_

- [ ]* 4.2 Write unit tests for PsychicPowerSelector cost display
  - Test null ability displays base costs
  - Test pattern is established for future abilities
  - _Requirements: 1.6, 2.3, 2.4_
-

- [x] 5. Write integration tests for frontend-backend consistency




- [x] 5.1 Create integration test that verifies frontend calculations match backend API



  - For each warband ability (Mutants, Soldiers, Heavily Armed, null)
  - Test sample weapons, equipment, and psychic powers
  - Call backend API `/cost/calculate` endpoint
  - Compare frontend utility results with backend API results
  - Ensure they match exactly
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 6. Manual testing and verification




- [x] 6.1 Test in browser with different warband abilities


  - Create a warband and select Mutants ability
  - Verify close combat weapon costs display correctly (Claws & Teeth, etc. reduced by 1)
  - Change to Soldiers ability
  - Verify equipment costs display correctly (Grenade, Heavy Armor, Medkit show 0)
  - Change to Heavily Armed ability
  - Verify ranged weapon costs display correctly (all reduced by 1)
  - Change to no ability
  - Verify all costs display base values
  - Verify total weirdo cost matches sum of displayed item costs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.4, 2.5_

- [x] 7. Final cleanup and verification






- [x] 7.1 Clean up any temporary code or console logs

  - Verify all tests pass
  - Verify no TypeScript errors
  - Confirm all acceptance criteria are met
  - Review implementation against design document
  - _Requirements: All requirements_
