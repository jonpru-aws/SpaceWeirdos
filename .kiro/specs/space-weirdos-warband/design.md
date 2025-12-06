# Design Document

## Overview

The Space Weirdos Warband Builder is a web-based application that enables players to create, manage, and persist warbands for the Space Weirdos tabletop game. The application enforces all game rules, calculates point costs automatically with warband ability modifiers, validates constraints in real-time, and provides an intuitive interface for warband construction.

The system follows a client-server architecture with a React frontend for user interaction and an Express backend for business logic and data persistence. All game data (attributes, weapons, equipment, psychic powers, abilities, and traits) is stored in-memory with JSON file persistence for saved warbands.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │  Warband List  │  │ Warband Editor │  │ Weirdo Editor │ │
│  │   Component    │  │   Component    │  │   Component   │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
│           │                   │                   │          │
│           └───────────────────┴───────────────────┘          │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │   API Client      │                    │
│                    └─────────┬─────────┘                    │
└──────────────────────────────┼──────────────────────────────┘
                               │ HTTP/JSON
┌──────────────────────────────┼──────────────────────────────┐
│                    ┌─────────▼─────────┐                    │
│                    │  Express Router   │                    │
│                    └─────────┬─────────┘                    │
│                              │                               │
│              ┌───────────────┼───────────────┐              │
│              │               │               │              │
│     ┌────────▼────────┐ ┌───▼────┐ ┌────────▼────────┐    │
│     │ Warband Service │ │ Cost   │ │ Validation      │    │
│     │                 │ │ Engine │ │ Service         │    │
│     └────────┬────────┘ └───┬────┘ └────────┬────────┘    │
│              │              │               │              │
│              └──────────────┼───────────────┘              │
│                             │                               │
│                    ┌────────▼────────┐                     │
│                    │  Data Repository│                     │
│                    │  (In-Memory DB) │                     │
│                    └────────┬────────┘                     │
│                             │                               │
│                    ┌────────▼────────┐                     │
│                    │ JSON File I/O   │                     │
│                    └─────────────────┘                     │
│                      Backend (Node.js/Express)             │
└────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend Components:**
- **Warband List Component**: Displays all saved warbands, handles load/delete operations
- **Warband Editor Component**: Manages warband-level properties (name, ability, point limit), displays total cost
- **Weirdo Editor Component**: Handles creation and editing of individual weirdos (leader or trooper)

**Backend Services:**
- **Warband Service**: Orchestrates warband CRUD operations, coordinates between cost engine and validation
- **Cost Engine**: Calculates point costs for weirdos and warbands, applies warband ability modifiers
- **Validation Service**: Enforces all game rules and constraints
- **Data Repository**: In-memory storage using Maps and objects, handles JSON serialization/deserialization

## Components and Interfaces

### Frontend Components

#### WarbandListComponent

**Purpose**: Display and manage the list of saved warbands

**Props**: None (fetches data on mount)

**State**:
- `warbands: Warband[]` - List of all saved warbands
- `loading: boolean` - Loading state indicator
- `error: string | null` - Error message if fetch fails

**Methods**:
- `loadWarbands()` - Fetches all warbands from backend
- `handleLoadWarband(id: string)` - Navigates to warband editor with loaded warband
- `handleDeleteWarband(id: string)` - Prompts for confirmation and deletes warband

#### WarbandEditorComponent

**Purpose**: Edit warband-level properties and manage weirdos

**Props**:
- `warbandId?: string` - Optional ID for editing existing warband

**State**:
- `warband: Warband` - Current warband being edited
- `selectedWeirdoId: string | null` - ID of weirdo being edited
- `validationErrors: ValidationError[]` - Current validation errors

**Methods**:
- `handleNameChange(name: string)` - Updates warband name (defaults to "New Warband" for new warbands)
- `handleAbilityChange(ability: WarbandAbility)` - Updates warband ability, triggers cost recalculation
- `handlePointLimitChange(limit: 75 | 125)` - Updates point limit
- `handleAddWeirdo(type: 'leader' | 'trooper')` - Creates new weirdo
- `handleRemoveWeirdo(id: string)` - Removes weirdo from warband
- `handleSaveWarband()` - Validates and saves warband to backend
- `calculateTotalCost()` - Sums all weirdo costs
- `weirdoHasErrors(weirdoId: string)` - Checks if a specific weirdo has validation errors

**UI Behavior**:
- New warbands initialize with name "New Warband" (Requirements 1.1, 1.2)
- Weirdos with validation errors receive visual highlighting via error CSS class (Requirements 15.6, 15.7)
- Hovering over weirdos with errors displays tooltip with specific validation error messages (Requirements 15.8, 15.9)
- Real-time validation runs whenever weirdos are added, removed, or modified

#### WeirdoEditorComponent

**Purpose**: Edit individual weirdo attributes, weapons, equipment, and powers

**Props**:
- `weirdo: Weirdo` - The weirdo being edited
- `warbandAbility: WarbandAbility | null` - Current warband ability for cost calculations (optional)
- `onChange: (weirdo: Weirdo) => void` - Callback when weirdo changes

**State**:
- `localWeirdo: Weirdo` - Local copy of weirdo for editing
- `pointCost: number` - Calculated point cost
- `validationErrors: ValidationError[]` - Validation errors for this weirdo

**Methods**:
- `handleAttributeChange(attribute: AttributeType, level: AttributeLevel)` - Updates attribute
- `handleAddWeapon(weapon: Weapon, type: 'close' | 'ranged')` - Adds weapon
- `handleRemoveWeapon(weaponId: string)` - Removes weapon
- `handleAddEquipment(equipment: Equipment)` - Adds equipment if under limit
- `handleRemoveEquipment(equipmentId: string)` - Removes equipment
- `handleAddPsychicPower(power: PsychicPower)` - Adds psychic power
- `handleRemovePsychicPower(powerId: string)` - Removes psychic power
- `handleLeaderTraitChange(trait: LeaderTrait | null)` - Sets leader trait (leader only)
- `recalculateCost()` - Triggers cost recalculation via backend

### Backend Services

#### WarbandService

**Purpose**: Orchestrate warband operations

**Interface**:
```typescript
interface WarbandService {
  createWarband(data: CreateWarbandDTO): Warband;
  getWarband(id: string): Warband | null;
  getAllWarbands(): Warband[];
  updateWarband(id: string, data: UpdateWarbandDTO): Warband;
  deleteWarband(id: string): boolean;
  validateWarband(warband: Warband): ValidationResult;
}
```

**Methods**:
- `createWarband()` - Creates new warband with unique ID, initializes empty weirdo list
- `getWarband()` - Retrieves warband by ID from repository
- `getAllWarbands()` - Returns all warbands from repository
- `updateWarband()` - Updates warband, recalculates costs, validates, persists
- `deleteWarband()` - Removes warband from repository and deletes from storage
- `validateWarband()` - Runs all validation rules, returns errors if any

#### CostEngine

**Purpose**: Calculate point costs with warband ability modifiers

**Interface**:
```typescript
interface CostEngine {
  calculateWeirdoCost(weirdo: Weirdo, warbandAbility: WarbandAbility | null): number;
  calculateWarbandCost(warband: Warband): number;
  getAttributeCost(attribute: AttributeType, level: AttributeLevel, warbandAbility: WarbandAbility | null): number;
  getWeaponCost(weapon: Weapon, warbandAbility: WarbandAbility | null): number;
  getEquipmentCost(equipment: Equipment, warbandAbility: WarbandAbility | null): number;
  getPsychicPowerCost(power: PsychicPower): number;
}
```

**Methods**:
- `calculateWeirdoCost()` - Sums all component costs for a weirdo
- `calculateWarbandCost()` - Sums all weirdo costs in warband
- `getAttributeCost()` - Returns attribute cost with warband ability modifiers
- `getWeaponCost()` - Returns weapon cost with warband ability modifiers
- `getEquipmentCost()` - Returns equipment cost with warband ability modifiers
- `getPsychicPowerCost()` - Returns psychic power cost (no modifiers)

**Cost Calculation Logic**:
1. Look up base cost from game data tables
2. Apply warband ability modifiers if applicable
3. Ensure cost does not go below 0
4. Return final cost

#### ValidationService

**Purpose**: Enforce all game rules and constraints

**Interface**:
```typescript
interface ValidationService {
  validateWeirdo(weirdo: Weirdo, warband: Warband): ValidationError[];
  validateWarband(warband: Warband): ValidationError[];
  validateWeirdoPointLimit(weirdo: Weirdo, warband: Warband): ValidationError | null;
  validateWarbandPointLimit(warband: Warband): ValidationError | null;
  validateWeaponRequirements(weirdo: Weirdo): ValidationError[];
  validateEquipmentLimits(weirdo: Weirdo, warbandAbility: WarbandAbility | null): ValidationError | null;
}
```

**Validation Rules**:
- Weirdo must have name
- All five attributes must be selected with valid levels
- At least one close combat weapon required
- Ranged weapon required if Firepower is 2d8 or 2d10
- Firepower level 2d8 or 2d10 required if ranged weapon is selected
- Equipment count must not exceed limit (2 for leader, 1 for trooper, +1 if Cyborgs)
- Trooper point cost must not exceed 20 (unless it's the one 25-point weirdo)
- Only one weirdo in warband may have cost between 21-25
- Warband total cost must not exceed point limit
- Warband must have exactly one leader
- Leader trait only allowed on leader

#### DataRepository

**Purpose**: In-memory storage and JSON persistence

**Interface**:
```typescript
interface DataRepository {
  saveWarband(warband: Warband): void;
  loadWarband(id: string): Warband | null;
  loadAllWarbands(): Warband[];
  deleteWarband(id: string): boolean;
  persistToFile(): Promise<void>;
  loadFromFile(): Promise<void>;
}
```

**Storage Structure**:
- In-memory: `Map<string, Warband>` for O(1) lookups
- File: JSON array of warband objects in `data/warbands.json`

**Methods**:
- `saveWarband()` - Stores warband in Map, triggers async file persist
- `loadWarband()` - Retrieves warband from Map by ID
- `loadAllWarbands()` - Returns array of all warbands from Map
- `deleteWarband()` - Removes from Map, triggers async file persist
- `persistToFile()` - Serializes Map to JSON and writes to file
- `loadFromFile()` - Reads JSON file and populates Map on startup

### API Endpoints

**POST /api/warbands**
- Creates new warband
- Body: `{ name: string, pointLimit: 75 | 125, ability?: WarbandAbility | null }`
- Returns: `Warband` with generated ID

**GET /api/warbands**
- Returns all saved warbands
- Returns: `Warband[]`

**GET /api/warbands/:id**
- Returns specific warband by ID
- Returns: `Warband` or 404

**PUT /api/warbands/:id**
- Updates existing warband
- Body: `Warband` object
- Returns: Updated `Warband` with recalculated costs

**DELETE /api/warbands/:id**
- Deletes warband
- Returns: 204 No Content

**POST /api/warbands/:id/weirdos**
- Adds weirdo to warband
- Body: `Weirdo` object
- Returns: Updated `Warband`

**PUT /api/warbands/:id/weirdos/:weirdoId**
- Updates weirdo in warband
- Body: `Weirdo` object
- Returns: Updated `Warband`

**DELETE /api/warbands/:id/weirdos/:weirdoId**
- Removes weirdo from warband
- Returns: Updated `Warband`

**POST /api/calculate-cost**
- Calculates cost for weirdo or warband
- Body: `{ weirdo?: Weirdo, warband?: Warband, warbandAbility?: WarbandAbility | null }`
- Returns: `{ cost: number }`

**POST /api/validate**
- Validates weirdo or warband
- Body: `{ weirdo?: Weirdo, warband?: Warband }`
- Returns: `{ valid: boolean, errors: ValidationError[] }`

## UI/UX Design

### Validation Feedback

The application provides real-time visual feedback for validation errors to help users identify and resolve issues quickly.

**Visual Highlighting** (Requirements 15.6, 15.7):
- Weirdos with validation errors receive an `error` CSS class
- The error class applies visual styling (e.g., red border, background tint) to distinguish invalid weirdos
- Visual feedback updates immediately when validation state changes

**Error Tooltips** (Requirements 15.8, 15.9):
- Hovering over a weirdo with the error CSS class displays a tooltip
- Tooltip contains the specific validation error message(s) for that weirdo
- Multiple errors are displayed as a list within the tooltip
- Tooltip positioning ensures it doesn't obscure other UI elements

**Implementation Details**:
- `weirdoHasErrors(weirdoId: string)` method checks if a weirdo has validation errors
- Method examines `validationErrors` array for errors specific to the weirdo
- Handles both field-specific errors and rule violations (e.g., MULTIPLE_25_POINT_WEIRDOS)
- CSS class application: `className={`weirdo-card ${hasErrors ? 'error' : ''}`}`
- Tooltip implementation uses HTML `title` attribute or custom tooltip component

### Default Values

**New Warband Initialization** (Requirements 1.1, 1.2):
- New warbands initialize with name "New Warband" instead of empty string
- Provides better UX by giving users a starting point
- Users can modify the default name as needed
- Prevents accidental submission with empty name

## Data Models

### Core Types

```typescript
type SpeedLevel = 1 | 2 | 3;
type DiceLevel = '2d6' | '2d8' | '2d10';
type FirepowerLevel = 'None' | '2d8' | '2d10';

type AttributeType = 'speed' | 'defense' | 'firepower' | 'prowess' | 'willpower';
type AttributeLevel = SpeedLevel | DiceLevel | FirepowerLevel;

type WarbandAbility = 
  | 'Cyborgs' 
  | 'Fanatics' 
  | 'Living Weapons' 
  | 'Heavily Armed' 
  | 'Mutants' 
  | 'Soldiers' 
  | 'Undead';

type LeaderTrait = 
  | 'Bounty Hunter' 
  | 'Healer' 
  | 'Majestic' 
  | 'Monstrous' 
  | 'Political Officer' 
  | 'Sorcerer' 
  | 'Tactician';
```

### Warband Model

```typescript
interface Warband {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // Warband name
  ability: WarbandAbility | null; // Warband faction ability (optional)
  pointLimit: 75 | 125;          // Maximum allowed points
  totalCost: number;             // Calculated total cost (sum of all weirdos)
  weirdos: Weirdo[];            // Array of all weirdos (leader + troopers)
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last modification timestamp
}
```

### Weirdo Model

```typescript
interface Weirdo {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // Weirdo name
  type: 'leader' | 'trooper';    // Weirdo type
  attributes: Attributes;        // Five core attributes
  closeCombatWeapons: Weapon[];  // Array of close combat weapons
  rangedWeapons: Weapon[];       // Array of ranged weapons
  equipment: Equipment[];        // Array of equipment items
  psychicPowers: PsychicPower[]; // Array of psychic powers
  leaderTrait: LeaderTrait | null; // Leader trait (null for troopers)
  notes: string;                 // Free-text notes
  totalCost: number;             // Calculated total cost
}
```

### Attributes Model

```typescript
interface Attributes {
  speed: SpeedLevel;
  defense: DiceLevel;
  firepower: FirepowerLevel;
  prowess: DiceLevel;
  willpower: DiceLevel;
}
```

### Weapon Model

```typescript
interface Weapon {
  id: string;                    // Weapon identifier
  name: string;                  // Weapon name
  type: 'close' | 'ranged';      // Weapon type
  baseCost: number;              // Base point cost
  maxActions: number;            // Max Fight/Shoot actions
  notes: string;                 // Special rules and effects
}
```

### Equipment Model

```typescript
interface Equipment {
  id: string;                    // Equipment identifier
  name: string;                  // Equipment name
  type: 'Passive' | 'Action';    // Equipment type
  baseCost: number;              // Base point cost
  effect: string;                // Description of effect
}
```

### Psychic Power Model

```typescript
interface PsychicPower {
  id: string;                    // Power identifier
  name: string;                  // Power name
  type: 'Attack' | 'Effect' | 'Either'; // Power type
  cost: number;                  // Point cost
  effect: string;                // Description of effect
}
```

### Validation Models

```typescript
interface ValidationError {
  field: string;                 // Field that failed validation
  message: string;               // Human-readable error message
  code: string;                  // Error code for programmatic handling
}

interface ValidationResult {
  valid: boolean;                // Overall validation status
  errors: ValidationError[];     // Array of validation errors
}
```

### Game Data Tables

The following static data will be stored in JSON files and loaded into memory on startup:

**attributes.json**: Attribute levels and costs
**closeCombatWeapons.json**: All close combat weapons with stats
**rangedWeapons.json**: All ranged weapons with stats
**equipment.json**: All equipment items with effects
**psychicPowers.json**: All psychic powers with effects
**warbandAbilities.json**: Warband abilities with descriptions
**leaderTraits.json**: Leader traits with descriptions


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Warband creation requires all mandatory fields

*For any* warband creation attempt, the system should reject the creation if any of the following are missing: name (non-empty string) or point limit (75 or 125). Warband ability is optional.

**Validates: Requirements 1.1, 1.2, 1.4, 1.5**

### Property 2: New warbands initialize with zero cost

*For any* newly created warband, the total point cost should equal zero before any weirdos are added.

**Validates: Requirements 1.3**

### Property 3: Weirdo creation requires name and all attributes

*For any* weirdo (leader or trooper) creation attempt, the system should reject the creation if the name is missing or if any of the five attributes (Speed, Defense, Firepower, Prowess, Willpower) are not selected with valid levels.

**Validates: Requirements 2.1, 2.2, 7.1, 7.2**

### Property 4: Attribute costs are calculated correctly

*For any* weirdo with selected attributes, the sum of attribute costs should match the expected total based on the attribute cost table, with warband ability modifiers applied (Mutants reduces Speed cost by 1, minimum 0).

**Validates: Requirements 2.3-2.17, 7.2, 8.2**

### Property 5: Close combat weapon requirement is enforced

*For any* weirdo, the system should reject finalization if the weirdo has zero close combat weapons selected.

**Validates: Requirements 3.1, 7.3**

### Property 6: Ranged weapon requirement depends on Firepower level

*For any* weirdo with Firepower level 2d8 or 2d10, the system should reject finalization if no ranged weapon is selected. For any weirdo with Firepower level None, the system should allow finalization without ranged weapons.

**Validates: Requirements 3.2, 3.3, 7.4**

### Property 6a: Ranged weapon selection requires non-zero Firepower

*For any* weirdo with one or more ranged weapons selected, the system should reject finalization if the weirdo has Firepower level None. The weirdo must have Firepower level 2d8 or 2d10 to use ranged weapons.

**Validates: Requirements 3.4, 7.5**

### Property 7: Weapon costs accumulate correctly

*For any* weirdo with selected weapons, the total weapon cost should equal the sum of all weapon base costs with warband ability modifiers applied (Heavily Armed reduces ranged weapon costs by 1, Mutants reduces Claws & Teeth, Horrible Claws & Teeth, and Whip/Tail costs by 1, minimum 0 for all).

**Validates: Requirements 3.5, 3.6, 8.1, 8.3, 8.4, 8.5**

### Property 8: Equipment limits are enforced based on type and ability

*For any* leader without Cyborgs ability, the system should reject selection of more than 2 equipment items. For any leader with Cyborgs ability, the system should reject selection of more than 3 equipment items. For any trooper without Cyborgs ability, the system should reject selection of more than 1 equipment item. For any trooper with Cyborgs ability, the system should reject selection of more than 2 equipment items.

**Validates: Requirements 4.1, 4.2, 4.4, 7.6, 7.7**

### Property 9: Equipment costs accumulate correctly

*For any* weirdo with selected equipment, the total equipment cost should equal the sum of all equipment base costs with warband ability modifiers applied (Soldiers sets Grenade, Heavy Armor, and Medkit costs to 0).

**Validates: Requirements 4.3, 8.6, 8.7, 8.8**

### Property 10: Psychic powers are unlimited and costs accumulate

*For any* weirdo, the system should allow selection of zero or more psychic powers without limit, and the total psychic power cost should equal the sum of all selected power costs.

**Validates: Requirements 5.1, 5.2, 5.3, 7.8**

### Property 11: Leader traits are optional and singular

*For any* leader, the system should allow zero or one leader trait to be selected. For any trooper, the system should reject leader trait selection.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 12: Weirdo total cost equals sum of all components

*For any* weirdo, the total point cost should equal the sum of attribute costs, weapon costs, equipment costs, and psychic power costs, with all warband ability modifiers applied.

**Validates: Requirements 7.9**

### Property 13: Cost reductions never go below zero

*For any* item (attribute, weapon, or equipment) with a cost reduction applied from warband abilities, the final cost should never be negative—it should be clamped to a minimum of 0.

**Validates: Requirements 8.9**

### Property 14: Trooper point limit is enforced

*For any* trooper in a warband that does not have a 21-25 point weirdo, the system should reject finalization if the trooper's total cost exceeds 20 points. For any trooper in a warband that already has a 21-25 point weirdo, the system should reject finalization if the trooper's total cost exceeds 20 points.

**Validates: Requirements 9.1, 9.3, 9.4**

### Property 15: Exactly one weirdo may cost 21-25 points

*For any* warband, the system should allow exactly one weirdo (leader or trooper) to have a total cost between 21 and 25 points (inclusive). All other weirdos must have a total cost of 20 points or less.

**Validates: Requirements 9.2, 9.3**

### Property 16: Warband total cost equals sum of weirdo costs

*For any* warband, the total point cost should equal the sum of all weirdo total costs.

**Validates: Requirements 10.1**

### Property 17: Warband point limit is enforced

*For any* warband, the system should reject finalization if the total point cost exceeds the selected point limit (75 or 125). The system should allow finalization if the total point cost is at or below the limit.

**Validates: Requirements 10.2, 10.3, 10.4**

### Property 18: Warband persistence preserves all data

*For any* valid warband that is saved and then loaded, all fields (name, ability, point limit, weirdos with all their attributes, weapons, equipment, psychic powers, traits, and notes) should match the original values.

**Validates: Requirements 11.1, 11.2, 12.1, 12.2**

### Property 19: Warband IDs are unique

*For any* set of saved warbands, all warband IDs should be unique—no two warbands should have the same ID.

**Validates: Requirements 11.3**

### Property 20: Loaded warbands recalculate costs correctly

*For any* warband loaded from storage, the recalculated total cost should match the sum of all weirdo costs based on current game rules and warband ability modifiers.

**Validates: Requirements 12.3**

### Property 21: Loaded warbands are validated like new warbands

*For any* loaded warband that is modified, the system should apply all validation rules (weapon requirements, equipment limits, point limits) as if the warband were being created new.

**Validates: Requirements 12.4**

### Property 22: Warband list contains all saved warbands

*For any* set of saved warbands, requesting the warband list should return all warbands with their name, ability, point limit, total cost, and weirdo count.

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 23: Warband deletion removes from storage

*For any* saved warband that is deleted (with confirmation), subsequent attempts to load that warband should fail, and the warband should not appear in the warband list.

**Validates: Requirements 14.2**

### Property 24: Deletion cancellation preserves warband

*For any* saved warband where deletion is cancelled, the warband should remain in storage unchanged and continue to appear in the warband list.

**Validates: Requirements 14.4**

### Property 25: Cost changes cascade through the system

*For any* weirdo in a warband, when attributes, weapons, equipment, or psychic powers are added or removed, the weirdo's total cost should immediately update, and the warband's total cost should immediately update to reflect the change.

**Validates: Requirements 15.1, 15.2**

### Property 26: Selection options display descriptive information

*For any* selection interface (abilities, attributes, weapons, equipment, psychic powers, leader traits), the system should display relevant descriptive information (descriptions, notes, effects) and point costs for each available option.

**Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7**

### Property 27: Cost displays remain visible during scrolling

*For any* editor interface (weirdo editor or warband editor), when the user scrolls through selection options, the total point cost display should remain visible at the top of the interface without obscuring controls.

**Validates: Requirements 17.1, 17.2, 17.3, 17.4**

## Error Handling

### Validation Errors

The system will provide clear, actionable error messages for all validation failures:

**Warband-Level Errors:**
- "Warband name is required"
- "Point limit must be 75 or 125"
- "Warband ability must be selected"
- "Warband total cost ({current}) exceeds point limit ({limit})"
- "Warband must have exactly one leader"
- "Cannot add weirdo: would exceed warband point limit"

**Weirdo-Level Errors:**
- "Weirdo name is required"
- "All five attributes must be selected"
- "At least one close combat weapon is required"
- "Ranged weapon required when Firepower is 2d8 or 2d10"
- "Firepower level 2d8 or 2d10 required to use ranged weapons"
- "Equipment limit exceeded: {type} can have {max} items"
- "Trooper cost ({cost}) exceeds 20-point limit"
- "Only one weirdo may cost 21-25 points"
- "Cannot add selection: would exceed weirdo point limit"
- "Leader trait can only be assigned to leaders"

### Storage Errors

**File I/O Errors:**
- "Failed to save warband: {error details}"
- "Failed to load warband: {error details}"
- "Failed to delete warband: {error details}"
- "Warband not found: {id}"

**Data Integrity Errors:**
- "Invalid warband data: {validation errors}"
- "Cost recalculation mismatch: expected {expected}, got {actual}"

### Error Recovery

- All validation errors are non-fatal and allow the user to correct the issue
- Storage errors are logged and reported to the user with retry options
- Data integrity errors trigger automatic recalculation and validation
- Failed save operations do not modify existing stored data
- Failed load operations do not affect other warbands

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

**Warband Creation:**
- Creating warband with valid data succeeds
- Creating warband with missing name fails
- Creating warband with invalid point limit fails
- Creating warband with missing ability fails

**Weirdo Creation:**
- Creating weirdo with all required fields succeeds
- Creating weirdo with missing name fails
- Creating weirdo with incomplete attributes fails
- Creating weirdo without close combat weapon fails

**Cost Calculations:**
- Attribute costs match lookup table
- Weapon costs match lookup table
- Equipment costs match lookup table
- Psychic power costs match lookup table
- Warband ability modifiers apply correctly
- Cost reductions clamp at 0

**Validation:**
- Equipment limits enforced correctly
- Weapon requirements enforced correctly
- 20-point trooper limit enforced
- 25-point weirdo limit enforced
- Warband point limit enforced

**Persistence:**
- Save operation creates file
- Load operation retrieves data
- Delete operation removes file
- List operation returns all warbands

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using the **fast-check** library with a minimum of **50 iterations** per test.

**Test Configuration:**
```typescript
import fc from 'fast-check';

// Configure all property tests to run minimum 50 iterations
const testConfig = { numRuns: 50 };
```

**Generators:**

Smart generators will constrain inputs to valid ranges:

```typescript
// Generate valid Speed levels
const speedLevelGen = fc.constantFrom(1, 2, 3);

// Generate valid dice levels
const diceLevelGen = fc.constantFrom('2d6', '2d8', '2d10');

// Generate valid Firepower levels
const firepowerLevelGen = fc.constantFrom('None', '2d8', '2d10');

// Generate valid warband abilities
const warbandAbilityGen = fc.constantFrom(
  'Cyborgs', 'Fanatics', 'Living Weapons', 
  'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
);

// Generate valid attributes
const attributesGen = fc.record({
  speed: speedLevelGen,
  defense: diceLevelGen,
  firepower: firepowerLevelGen,
  prowess: diceLevelGen,
  willpower: diceLevelGen
});

// Generate valid weirdos
const weirdoGen = (type: 'leader' | 'trooper', warbandAbility: WarbandAbility) => 
  fc.record({
    name: fc.string({ minLength: 1 }),
    type: fc.constant(type),
    attributes: attributesGen,
    closeCombatWeapons: fc.array(closeCombatWeaponGen, { minLength: 1 }),
    rangedWeapons: fc.array(rangedWeaponGen),
    equipment: fc.array(equipmentGen, { 
      maxLength: type === 'leader' ? 
        (warbandAbility === 'Cyborgs' ? 3 : 2) : 
        (warbandAbility === 'Cyborgs' ? 2 : 1)
    }),
    psychicPowers: fc.array(psychicPowerGen),
    leaderTrait: type === 'leader' ? fc.option(leaderTraitGen) : fc.constant(null),
    notes: fc.string()
  });

// Generate valid warbands
const warbandGen = fc.record({
  name: fc.string({ minLength: 1 }),
  ability: warbandAbilityGen,
  pointLimit: fc.constantFrom(75, 125),
  weirdos: fc.array(weirdoGen('trooper', ability), { minLength: 0, maxLength: 10 })
}).chain(warband => 
  weirdoGen('leader', warband.ability).map(leader => ({
    ...warband,
    weirdos: [leader, ...warband.weirdos]
  }))
);
```

**Property Test Examples:**

Each property-based test will be tagged with a comment linking to the design document:

```typescript
// **Feature: space-weirdos-warband, Property 1: Warband creation requires all mandatory fields**
fc.assert(
  fc.property(warbandGen, (warband) => {
    const result = createWarband(warband);
    return result.name !== '' && 
           (result.pointLimit === 75 || result.pointLimit === 125) &&
           result.ability !== null;
  }),
  testConfig
);

// **Feature: space-weirdos-warband, Property 12: Weirdo total cost equals sum of all components**
fc.assert(
  fc.property(weirdoGen('leader', 'Cyborgs'), warbandAbilityGen, (weirdo, ability) => {
    const calculatedCost = calculateWeirdoCost(weirdo, ability);
    const expectedCost = 
      calculateAttributeCosts(weirdo.attributes, ability) +
      calculateWeaponCosts(weirdo.closeCombatWeapons, weirdo.rangedWeapons, ability) +
      calculateEquipmentCosts(weirdo.equipment, ability) +
      calculatePsychicPowerCosts(weirdo.psychicPowers);
    return calculatedCost === expectedCost;
  }),
  testConfig
);

// **Feature: space-weirdos-warband, Property 18: Warband persistence preserves all data**
fc.assert(
  fc.property(warbandGen, async (warband) => {
    const saved = await saveWarband(warband);
    const loaded = await loadWarband(saved.id);
    return deepEqual(saved, loaded);
  }),
  testConfig
);
```

**Property Test Coverage:**

Each of the 25 correctness properties will be implemented as a single property-based test. The tests will:
- Use smart generators to create valid test data
- Run a minimum of 50 iterations per property
- Tag each test with the property number and description
- Verify the property holds across all generated inputs
- Report counterexamples when properties fail

### Integration Testing

Integration tests will verify end-to-end workflows:

- Create warband → Add leader → Add troopers → Save → Load → Verify
- Create warband → Exceed point limit → Verify rejection
- Create warband → Change ability → Verify cost recalculation
- Load warband → Modify → Save → Load → Verify changes
- Create multiple warbands → List → Verify all present
- Create warband → Delete → Verify removal

### Test Execution

Tests will be run using Vitest:

```bash
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode
npm run test:property    # Run only property-based tests
```

All tests must pass before code is considered complete.
