# Requirements Document

## Introduction

This document specifies a bug fix for the warband ability cost modifier display issue in weapon and equipment selectors. The backend cost calculations are working correctly and the total weirdo cost displays correctly, but the individual weapon and equipment costs shown in the selector components display base costs without applying warband ability modifiers.

## Glossary

- **Warband Ability**: A faction-wide ability that modifies costs and limits (Mutants, Soldiers, Heavily Armed, Cyborgs)
- **Cost Modifier**: A reduction or change to point costs based on warband ability
- **Base Cost**: The unmodified point cost of an item from the data files
- **Modified Cost**: The point cost after applying warband ability modifiers
- **WeaponSelector**: The UI component for selecting close combat and ranged weapons
- **EquipmentSelector**: The UI component for selecting equipment items
- **PsychicPowerSelector**: The UI component for selecting psychic powers
- **Total Cost Display**: The overall weirdo cost shown at the top of the editor (working correctly)
- **Item Cost Display**: The individual cost shown next to each weapon/equipment/power option (currently broken)

## Requirements

### Requirement 1

**User Story:** As a user, I want to see the modified point costs next to each weapon, equipment, and psychic power option, so that I can understand how warband abilities affect individual item costs.

#### Acceptance Criteria

1. WHEN a user has Mutants ability selected AND views close combat weapons THEN the WeaponSelector SHALL display costs reduced by 1 for Claws & Teeth, Horrible Claws & Teeth, and Whip/Tail
2. WHEN a user has Soldiers ability selected AND views equipment THEN the EquipmentSelector SHALL display 0 cost for Grenade, Heavy Armor, and Medkit
3. WHEN a user has Heavily Armed ability selected AND views ranged weapons THEN the WeaponSelector SHALL display costs reduced by 1 for all ranged weapons
4. WHEN a user changes the warband ability THEN the WeaponSelector, EquipmentSelector, and PsychicPowerSelector SHALL immediately update displayed costs to reflect the new modifiers
5. WHEN any cost reduction would result in negative cost THEN the selector SHALL display 0 as the minimum cost
6. WHEN no warband ability currently modifies psychic power costs THEN the PsychicPowerSelector SHALL display base costs, but SHALL use the same cost calculation pattern for future extensibility

### Requirement 2

**User Story:** As a user, I want the item cost displays to match the backend calculations, so that the UI is consistent and accurate.

#### Acceptance Criteria

1. WHEN the backend CostEngine calculates a weapon cost THEN the WeaponSelector SHALL display the same cost
2. WHEN the backend CostEngine calculates an equipment cost THEN the EquipmentSelector SHALL display the same cost
3. WHEN the backend CostEngine calculates a psychic power cost THEN the PsychicPowerSelector SHALL display the same cost
4. WHEN no warband ability is selected THEN the selectors SHALL display base costs unchanged
5. WHEN the total weirdo cost is calculated THEN it SHALL match the sum of displayed item costs plus attribute costs
