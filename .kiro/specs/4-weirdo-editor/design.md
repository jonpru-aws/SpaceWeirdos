# Design Document: Weirdo Editor

## Overview

This design document specifies the weirdo (character) editing interface as a modal dialog. The system provides comprehensive controls for creating and customizing weirdos including attributes, weapons, equipment, psychic powers, and leader traits.

**Key Design Goals:**
- Modal dialog for focused weirdo editing without scrolling
- Intuitive multi-select interfaces for weapons, equipment, and powers
- Clear display of costs and descriptions
- Conditional rendering based on weirdo type and attributes
- Overlay prevents interaction with warband editor while modal is open
- Integration with cost calculation system
- Keyboard accessibility (Escape to close, focus trap)

**Dependencies:**
- Spec 1: UI Design System (modal styles, z-index tokens)
- Spec 2: Warband List & Navigation (WarbandContext)
- Spec 3: Warband Properties Editor (warband context)
- Game Rules Spec (backend API for cost calculations, validation, and game data)

## Architecture

### Modal Structure

The weirdo editor is a modal dialog that overlays the warband editor. The modal:
- Opens when clicking a weirdo in the list or "Add Leader"/"Add Trooper" buttons
- Displays on top of the warband editor with a semi-transparent backdrop
- Prevents scrolling of the underlying page
- Closes via close button, clicking outside, or pressing Escape

### Component Hierarchy

```
App
└── WarbandEditor
    ├── WarbandProperties
    ├── WeirdosList (clickable items open modal)
    ├── WarbandCostDisplay
    └── WeirdoEditorModal (conditional)
        ├── ModalOverlay (backdrop)
        └── ModalContent
            ├── ModalHeader
            │   ├── WeirdoTitle (name + type)
            │   ├── CloseButton
            │   └── DeleteButton
            ├── ModalBody (scrollable)
            │   ├── WeirdoCostDisplay
            │   ├── WeirdoBasicInfo (name input)
            │   ├── AttributeSelector (x5)
            │   ├── WeaponSelector (close combat)
            │   ├── WeaponSelector (ranged)
            │   ├── EquipmentSelector
            │   ├── PsychicPowerSelector
            │   └── LeaderTraitSelector (conditional)
            └── ModalFooter (optional)
```

## Components

### WeirdoEditorModal
Main modal container for the weirdo editor with overlay and content.

```typescript
interface WeirdoEditorModalProps {
  isOpen: boolean;
  weirdoId: string | null;
  onClose: () => void;
  onDelete: () => void;
}
```

**Features:**
- Semi-transparent overlay (backdrop)
- Centered modal content
- Focus trap (keyboard navigation contained within modal)
- Escape key closes modal
- Click outside closes modal
- Prevents body scroll when open
- Uses `--z-index-modal` from design system

### WeirdosList (in Warband Editor)
Displays all weirdos with add/remove controls. Clicking a weirdo opens the modal.

### WeirdoCard
Compact display of weirdo in list with name, type, cost, and error indicator. Clickable to open modal.

### WeirdoEditor
Comprehensive editor with all weirdo customization options. Used within modal body.

### AttributeSelector
Dropdown for each attribute with cost display.

### WeaponSelector
Multi-select checkbox list for weapons with costs and notes.

### EquipmentSelector
Multi-select checkbox list for equipment with limit enforcement.

### PsychicPowerSelector
Multi-select checkbox list for psychic powers.

### LeaderTraitSelector
Dropdown for leader trait (only shown for leaders).

### Shared Components

**SelectWithCost**: Reusable dropdown with cost display
**ItemList**: Reusable checkbox list with descriptions and costs

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property 1: Add leader button disabled when leader exists**
*For any* warband state, the "Add Leader" button should be disabled when the warband already has a leader.
**Validates: Requirements 1.3**

**Property 2: Equipment selections disabled at limit**
*For any* weirdo with equipment at the limit, additional equipment checkboxes should be disabled.
**Validates: Requirements 5.4**

**Property 3: Ranged weapons disabled when Firepower is None**
*For any* weirdo with Firepower level None, the ranged weapon selector should be disabled.
**Validates: Requirements 4.4**

**Property 4: Modal opens with correct weirdo**
*For any* weirdo selection from the warband editor, opening the modal should load that specific weirdo's data.
**Validates: Requirements 8.1**

**Property 5: Leader trait selector only shown for leaders**
*For any* weirdo, the leader trait selector should only be visible when the weirdo type is "leader".
**Validates: Requirements 7.2**

**Property 6: Modal close preserves weirdo changes**
*For any* changes made in the weirdo editor modal, closing the modal should preserve those changes.
**Validates: Requirements 8.4, 8.5, 8.6**

**Property 7: Modal prevents background interaction**
*For any* open modal state, the underlying warband editor should not be scrollable and clicks should not interact with background elements.
**Validates: Requirements 8.7, 8.8**

**Property 8: Frontend-backend cost consistency**
*For any* weapon, equipment, or psychic power with a given warband ability, the cost displayed in the selector component must equal the cost calculated by the backend CostEngine for the same item and ability.
**Validates: Requirements 10.1, 10.2, 10.3**

**Property 9: Cost display reactivity**
*For any* warband ability change, all displayed costs in selector components must update to reflect the new ability's modifiers.
**Validates: Requirements 10.6**

## Testing Strategy

### Unit Testing
- Unit tests for all selector components
- Test cost display with different warband abilities
- Test conditional rendering based on weirdo type and attributes
- Test equipment limit enforcement
- Test form controls and accessibility

### Property-Based Testing
- Property tests for conditional rendering and limits
- Property test for frontend-backend cost consistency (Property 8)
- Property test for cost display reactivity (Property 9)

### Integration Testing
- Integration tests for weirdo creation and editing flows
- Integration tests verifying frontend cost calculations match backend API results
- Test that total weirdo cost equals sum of displayed item costs
- Test cost updates when warband ability changes in WarbandContext

### Critical Test
**Frontend-Backend Cost Consistency**: Verify that `costCalculations.ts` produces the same results as backend `CostModifierStrategy` for all warband abilities and item types. This test ensures the frontend utility stays in sync with backend logic.

## API Endpoints

**Backend must expose these RESTful endpoints:**

```
GET    /api/game-data/attributes          - Fetch attribute options
GET    /api/game-data/weapons/close       - Fetch close combat weapons
GET    /api/game-data/weapons/ranged      - Fetch ranged weapons
GET    /api/game-data/equipment           - Fetch equipment options
GET    /api/game-data/psychic-powers      - Fetch psychic powers
GET    /api/game-data/leader-traits       - Fetch leader traits
POST   /api/cost/calculate                - Calculate weirdo cost
POST   /api/validation/weirdo             - Validate weirdo configuration
```

**Request/Response Examples:**
```typescript
// Cost calculation request
POST /api/cost/calculate
{
  weirdoType: 'leader' | 'trooper',
  attributes: { speed: number, defense: number, ... },
  weapons: string[],
  equipment: string[],
  psychicPowers: string[],
  warbandAbility: string | null
}

// Cost calculation response
{
  success: true,
  data: {
    totalCost: number,
    breakdown: {
      attributes: number,
      weapons: number,
      equipment: number,
      psychicPowers: number
    }
  }
}
```

## Implementation Notes

### Modal Behavior

- **Open Trigger**: Clicking weirdo in list or "Add Leader"/"Add Trooper" buttons
- **Close Triggers**: Close button, click outside modal, Escape key
- **State Management**: Use WarbandContext to maintain weirdo data
- **Body Scroll**: Prevent scrolling of underlying page when modal is open
- **Focus Management**: Trap focus within modal, restore focus on close
- **Z-Index**: Use `--z-index-modal` from design system (typically 1000)

### Modal Styling

- **Overlay**: Semi-transparent backdrop (e.g., `rgba(0, 0, 0, 0.5)`)
- **Content**: Centered, max-width for readability, white background
- **Header**: Fixed at top with weirdo name, type, and close button
- **Body**: Scrollable content area for all weirdo properties
- **Footer**: Optional, for action buttons if needed
- **Animation**: Fade in/out for smooth appearance

### API Communication

- **Frontend**: Use `apiClient` for all HTTP requests
- **Frontend**: NEVER directly import CostEngine, ValidationService, or DataRepository
- **Backend**: Expose game data and calculation endpoints
- **Backend**: Handle cost calculations server-side
- **Backend**: Return structured cost breakdowns

### Component Behavior

- Use shared SelectWithCost and ItemList components for consistency
- Call cost calculation API when weirdo properties change
- Apply design system styles throughout
- Implement conditional rendering based on weirdo type
- Cache game data API responses to reduce network calls
- Auto-save weirdo changes when modal closes
- Show weirdo name and type prominently in modal header
- Ensure modal content is scrollable if it exceeds viewport height

### Cost Display Implementation

**Frontend Cost Utility** (`src/frontend/utils/costCalculations.ts`):

For displaying individual item costs in selector components, create a frontend utility that mirrors the backend CostModifierStrategy logic. This approach:
- Provides fast, synchronous cost display updates without API calls
- Maintains frontend/backend separation (API used for total cost calculations)
- Requires integration tests to ensure frontend and backend calculations stay in sync

**Key Functions:**
```typescript
// Calculate modified weapon cost based on warband ability
calculateWeaponCost(weapon: Weapon, ability: WarbandAbility | null): number

// Calculate modified equipment cost based on warband ability
calculateEquipmentCost(equipment: Equipment, ability: WarbandAbility | null): number

// Calculate psychic power cost (no current modifiers, but pattern established)
calculatePsychicPowerCost(power: PsychicPower, ability: WarbandAbility | null): number
```

**Cost Modifier Rules:**
- **Heavily Armed**: All ranged weapons cost 1 less
- **Mutants**: Claws & Teeth, Horrible Claws & Teeth, Whip/Tail cost 1 less
- **Soldiers**: Grenade, Heavy Armor, Medkit are free (0 cost)
- **Cyborgs**: No cost modifiers (affects limits only)
- All costs clamp to minimum of 0 (never negative)

**Integration:**
- WeaponSelector, EquipmentSelector, and PsychicPowerSelector import and use these functions
- Components receive `warbandAbility` prop from WarbandContext
- Costs update reactively when warband ability changes
- Integration tests verify frontend calculations match backend API results
