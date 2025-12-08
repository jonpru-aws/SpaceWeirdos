# UI Architecture Update: Weirdo Editor as Modal Dialog

## Summary

Updated the UI specs to change the weirdo editor from an embedded component within the warband properties editor to a modal dialog overlay. This prevents poor user experience from excessive scrolling while maintaining focus on the warband editor context.

## Changes Made

### 1. Spec 4: Weirdo Editor (`.kiro/specs/4-weirdo-editor/`)

**requirements.md:**
- Updated introduction to describe weirdo editor as a "separate screen" instead of a component
- Changed glossary to define "Weirdo Editor Screen" as a dedicated UI screen
- Updated Requirement 1.4: Changed from "automatically select it for editing" to "navigate to the weirdo editor screen"
- Updated Requirement 2.4-2.5: Changed to navigate back to warband editor when weirdo is removed
- Updated Requirements 3-7: Changed "WHEN a weirdo is selected" to "WHEN the weirdo editor screen is displayed"
- Added new Requirement 8: Navigation between warband editor and weirdo editor screens
  - Navigate to weirdo editor when clicking weirdo in list
  - Back button to return to warband editor
  - URL updates to reflect current weirdo
  - Changes are preserved when navigating back
  - Weirdo name and type shown prominently

**design.md:**
- Updated overview to emphasize "separate screen" and "dedicated screen for focused weirdo editing"
- Added Architecture section with screen structure and URL patterns:
  - Warband Editor: `/warband/:warbandId`
  - Weirdo Editor: `/warband/:warbandId/weirdo/:weirdoId`
- Added component hierarchy showing separate screens
- Added WeirdoEditorScreen component with navigation controls
- Updated WeirdosList description to note clicking navigates to weirdo editor
- Updated Property 4: Changed from "progressive disclosure" to "navigation loads correct weirdo"
- Added Property 6: "Navigation back preserves weirdo changes"
- Added Navigation section to implementation notes with URL patterns and state management

### 2. Spec 3: Warband Properties Editor (`.kiro/specs/3-warband-properties-editor/`)

**design.md:**
- Updated WarbandEditor description from "three sections" to "two main sections"
- Removed reference to weirdo editor section

**tasks.md:**
- Updated task 2.1: Changed from "three-section layout" to "two-section layout"
- Updated task 2.2: Changed test description to match two-section layout

### 3. Spec 2: Warband List Navigation (`.kiro/specs/2-warband-list-navigation/`)

**requirements.md:**
- Added new Requirement 8: Navigation to dedicated weirdo editor screen
  - Click weirdo to navigate to weirdo editor screen
  - Show only weirdo editing interface
  - Back button to return to warband editor
  - URL includes weirdo identifier

**design.md:**
- Added URL Structure section documenting all three navigation levels
- Updated component hierarchy to show all three screens with routes
- Added Property 6: "Weirdo editor navigation updates URL"
- Added Navigation Flow section to implementation notes:
  - Three-level navigation pattern
  - URL patterns for each level
  - Navigation triggers
  - Browser back/forward support

## New Modal Architecture

### URL Structure
```
/                    → Warband List
/warband/:warbandId  → Warband Editor (with optional modal overlay)
```

### Modal Flow
```
Warband List
    ↓ (click warband)
Warband Editor (properties + weirdo list)
    ↓ (click weirdo or add button)
Weirdo Editor Modal (overlay on warband editor)
    ↓ (close button / click outside / Escape)
Warband Editor (modal closes, no navigation)
    ↓ (back button)
Warband List
```

### Component Responsibilities

**Warband List:**
- Display all saved warbands
- Create new warband
- Delete warband with confirmation
- Navigate to warband editor

**Warband Editor:**
- Edit warband properties (name, point limit, ability)
- Display weirdo list
- Add leader/trooper buttons (open modal)
- Save warband
- Delete warband
- Host weirdo editor modal

**Weirdo Editor Modal:**
- Overlay on top of warband editor
- Edit single weirdo in focused view
- Edit attributes, weapons, equipment, psychic powers, leader traits
- Display weirdo cost
- Delete weirdo (closes modal)
- Close via button, click outside, or Escape key
- Prevent background scrolling
- Auto-save changes on close

## Benefits of Modal Architecture

1. **No Scrolling**: Modal prevents need to scroll through long forms
2. **Context Preservation**: Warband editor remains visible in background
3. **Faster Interaction**: No page navigation, instant open/close
4. **Better UX**: Modal clearly indicates temporary editing state
5. **Simpler Navigation**: Only two URL levels instead of three
6. **Mobile Friendly**: Full-screen modal works well on small screens
7. **Keyboard Accessible**: Escape key provides quick exit

## Implementation Considerations

- Use modal overlay with semi-transparent backdrop
- Implement focus trap to keep keyboard navigation within modal
- Prevent body scroll when modal is open
- Use z-index from design system (--z-index-modal)
- Auto-save weirdo changes when modal closes
- Restore focus to trigger element when modal closes
- Ensure modal content is scrollable if it exceeds viewport height
- Support closing via close button, click outside, and Escape key


---

## Update: Frontend-Backend API Separation (December 2025)

### Summary

Updated the UI specs to eliminate duplicated cost calculation logic in the frontend. All cost calculations now go through the backend API with intelligent caching and debouncing to maintain real-time responsiveness.

### Changes Made

#### Spec 5: Real-time Feedback & Polish (`.kiro/specs/5-realtime-feedback-polish/`)

**design.md:**
- Updated API Communication section to reference new `useCostCalculation` and `useItemCost` hooks
- Changed debounce timing from 100ms to 300ms (better balance for API calls)
- Added caching strategy: 5-second TTL, LRU eviction, 100 entry capacity
- Added cache invalidation on warband ability changes
- Added optimistic updates (display last known values during API requests)
- Added reference to `.kiro/specs/frontend-backend-api-separation/` for detailed design

**Performance Optimization section:**
- Added caching details (5-second TTL, LRU, 100 entries)
- Added cache invalidation strategy
- Added optimistic update strategy
- Added batch cost calculation via `useItemCost` hook
- Referenced new hooks for automatic caching and debouncing

### New Spec: Frontend-Backend API Separation

**Location**: `.kiro/specs/frontend-backend-api-separation/`

**Purpose**: Centralize all business logic in the backend while maintaining responsive real-time UI updates

**Key Deliverables**:
- `useCostCalculation` hook: Centralized cost calculation with caching and debouncing
- `useItemCost` hook: Individual item cost display for selector components
- `CostCache` service: LRU cache with TTL and invalidation
- Remove `src/frontend/utils/costCalculations.ts` (duplicated backend logic)
- Update `WeaponSelector`, `EquipmentSelector`, `PsychicPowerSelector` to use new hooks

**Architecture**:
```
Frontend Components
    ↓
useCostCalculation / useItemCost hooks
    ↓ (with caching & debouncing)
API Client
    ↓ (HTTP)
Backend /api/cost/calculate endpoint
    ↓
CostEngine (single source of truth)
```

**Benefits**:
1. **Single Source of Truth**: All cost calculation logic in backend only
2. **No Code Duplication**: Frontend doesn't mirror backend logic
3. **Easier Maintenance**: Cost rule changes only require backend updates
4. **Consistent Results**: Frontend and backend always agree on costs
5. **Responsive UI**: Caching and debouncing maintain <200ms updates
6. **Reduced API Load**: Cache prevents redundant calculations

**Implementation Strategy**:
- Phase 1: Add new hooks and cache infrastructure (no breaking changes)
- Phase 2: Update components one at a time to use new hooks
- Phase 3: Remove old `costCalculations.ts` file after full migration

**Status**: ✅ Spec complete - Ready for implementation after UI specs 1-5

### Impact on Existing Specs

**No breaking changes to existing specs:**
- Spec 1-4: No changes needed (design system, navigation, editors work as-is)
- Spec 5: Enhanced with caching and API-based cost calculations
- Components updated to use hooks instead of local calculation functions
- User experience remains the same (still <200ms updates)
- Backend API already exists and is optimized (<100ms response)

### Migration Path

1. Implement Specs 1-5 as originally designed (with `costCalculations.ts`)
2. Implement frontend-backend-api-separation spec
3. Components automatically benefit from caching and centralized logic
4. Remove `costCalculations.ts` after migration complete
5. Archive frontend-backend-api-separation spec

This approach allows incremental migration without blocking UI implementation.
