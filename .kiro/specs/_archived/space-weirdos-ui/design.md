# Design Document: Space Weirdos UI

## Overview

This design document specifies the user interface and user experience architecture for the Space Weirdos Warband Builder. The system provides an intuitive, responsive interface for creating and managing warbands with real-time feedback, validation, and cost calculations.

The UI layer is built as a React application that consumes the game rules engine (for validation and cost calculations) and the data persistence layer (for storage operations). It focuses on providing clear visual feedback, efficient workflows, and an organized editing experience.

**Key Design Goals:**
- Real-time cost calculations and validation feedback
- Clear visual organization of warband and weirdo editing
- Sticky cost displays that remain visible during scrolling
- Intuitive controls for managing warband composition
- Responsive form controls with cost and description displays
- Confirmation dialogs for destructive operations
- Success/error messaging for user actions

## Architecture

### Component Hierarchy

```
App
├── WarbandList
│   ├── WarbandListItem (multiple)
│   └── DeleteConfirmationDialog
│
└── WarbandEditor
    ├── WarbandProperties
    │   ├── WarbandBasicInfo
    │   ├── WarbandAbilitySelector
    │   └── WarbandCostDisplay (sticky)
    │
    ├── WeirdosList
    │   ├── WeirdoCard (multiple)
    │   └── AddWeirdoButtons
    │
    └── WeirdoEditor
        ├── WeirdoCostDisplay (sticky)
        ├── WeirdoBasicInfo
        ├── AttributeSelector
        ├── WeaponSelector
        ├── EquipmentSelector
        ├── PsychicPowerSelector
        ├── LeaderTraitSelector
        └── ValidationErrorDisplay
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │         WarbandContext (State Management)        │  │
│  │  - Current warband                               │  │
│  │  - Selected weirdo                               │  │
│  │  - Validation errors                             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                   │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  CostEngine      │  │  ValidationService       │    │
│  └──────────────────┘  └──────────────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Data Persistence Layer                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │            DataRepository                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```


**User Interaction Flow:**

1. **Initial Load**: User sees WarbandList or empty state
2. **Create Warband**: User creates warband → WarbandEditor appears with warband properties
3. **Add Weirdo**: User adds leader/trooper → WeirdoEditor appears
4. **Edit Weirdo**: User modifies attributes/weapons/equipment → Real-time cost updates → Validation feedback
5. **Save Warband**: User saves → Confirmation message → Data persisted
6. **Load Warband**: User selects from list → WarbandEditor loads with data
7. **Delete Warband**: User deletes → Confirmation dialog → Data removed

### Key Design Principles

1. **Progressive Disclosure**: Show warband creation first, then reveal weirdo editing options
2. **Real-time Feedback**: Update costs and validation immediately on user input
3. **Visual Hierarchy**: Clear separation between warband properties, weirdo list, and weirdo editor
4. **Sticky Information**: Keep critical cost information visible during scrolling
5. **Defensive UX**: Confirm destructive actions, show clear error messages
6. **Accessibility**: Use semantic HTML, ARIA labels, and keyboard navigation

## Components and Interfaces

### State Management

**WarbandContext** provides global state for the editing session:

```typescript
interface WarbandContextValue {
  // Current state
  currentWarband: Warband | null;
  selectedWeirdoId: string | null;
  validationErrors: Map<string, ValidationError[]>;
  
  // Warband operations
  createWarband: (name: string, pointLimit: PointLimit) => void;
  updateWarband: (updates: Partial<Warband>) => void;
  saveWarband: () => Promise<void>;
  loadWarband: (id: string) => Promise<void>;
  deleteWarband: (id: string) => Promise<void>;
  
  // Weirdo operations
  addWeirdo: (type: 'leader' | 'trooper') => void;
  removeWeirdo: (id: string) => void;
  updateWeirdo: (id: string, updates: Partial<Weirdo>) => void;
  selectWeirdo: (id: string) => void;
  
  // Computed values
  getWeirdoCost: (id: string) => number;
  getWarbandCost: () => number;
  validateWarband: () => ValidationResult;
  validateWeirdo: (id: string) => ValidationResult;
}
```

**Design Rationale:**
- Context provides single source of truth for warband state
- All mutations go through context methods for consistency
- Validation is computed on-demand for real-time feedback
- Cost calculations use CostEngine from game rules layer

### Core Components

#### WarbandList

Displays all saved warbands with summary information.

```typescript
interface WarbandListProps {
  onSelectWarband: (id: string) => void;
  onDeleteWarband: (id: string) => void;
  onCreateNew: () => void;
}

interface WarbandListItemProps {
  warband: WarbandSummary;
  onSelect: () => void;
  onDelete: () => void;
}
```

**Features:**
- Shows warband name, ability, point limit, total cost, weirdo count
- Loading indicator while fetching data
- Empty state message when no warbands exist
- Click to load, delete button with confirmation

#### WarbandEditor

Main editing interface for warband and weirdos.

```typescript
interface WarbandEditorProps {
  warband: Warband;
}
```

**Layout:**
- Top section: Warband properties (name, ability, point limit)
- Middle section: List of weirdos with add buttons
- Bottom section: Selected weirdo editor

**Conditional Rendering:**
- Hide weirdo management until warband is created
- Show message prompting warband creation when needed
- Highlight selected weirdo in list


#### WarbandProperties

Edits warband-level settings.

```typescript
interface WarbandPropertiesProps {
  warband: Warband;
  onUpdate: (updates: Partial<Warband>) => void;
  validationErrors: ValidationError[];
}
```

**Fields:**
- Warband name (text input with validation)
- Point limit (radio buttons: 75 or 125)
- Warband ability (dropdown with descriptions)

**Validation:**
- Show error styling on invalid fields
- Display validation messages below fields

#### WarbandCostDisplay

Shows total warband cost with sticky positioning.

```typescript
interface WarbandCostDisplayProps {
  totalCost: number;
  pointLimit: number;
  isApproachingLimit: boolean;
}
```

**Features:**
- Sticky positioning at top of editor
- Warning indicator when approaching limit (within 10 points)
- Error styling when exceeding limit
- Semi-transparent background for readability

**CSS Strategy:**
```css
.warband-cost-display {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 2px solid #ccc;
  padding: 1rem;
}

.warband-cost-display.warning {
  border-color: orange;
}

.warband-cost-display.error {
  border-color: red;
}
```

#### WeirdosList

Displays all weirdos in the warband with management controls.

```typescript
interface WeirdosListProps {
  weirdos: Weirdo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddLeader: () => void;
  onAddTrooper: () => void;
  canAddLeader: boolean;
}
```

**Features:**
- List of WeirdoCard components
- Add Leader button (disabled if leader exists)
- Add Trooper button
- Visual highlight for selected weirdo
- Remove button for each weirdo

#### WeirdoCard

Compact display of weirdo information in the list.

```typescript
interface WeirdoCardProps {
  weirdo: Weirdo;
  cost: number;
  isSelected: boolean;
  hasErrors: boolean;
  onClick: () => void;
  onRemove: () => void;
}
```

**Display:**
- Weirdo name and type (Leader/Trooper)
- Point cost
- Error indicator if validation fails
- Selected state styling

**CSS Strategy:**
```css
.weirdo-card {
  border: 2px solid #ccc;
  padding: 0.5rem;
  cursor: pointer;
}

.weirdo-card.selected {
  border-color: blue;
  background: #e3f2fd;
}

.weirdo-card.error {
  border-color: red;
}
```

#### WeirdoEditor

Comprehensive editor for weirdo attributes, weapons, and equipment.

```typescript
interface WeirdoEditorProps {
  weirdo: Weirdo;
  warbandAbility?: WarbandAbility;
  onUpdate: (updates: Partial<Weirdo>) => void;
  validationErrors: ValidationError[];
}
```

**Sections:**
1. Sticky cost display at top
2. Basic info (name, type)
3. Attributes (5 selectors)
4. Weapons (close combat and ranged)
5. Equipment (multi-select with limit)
6. Psychic powers (multi-select)
7. Leader trait (if leader)

**Conditional Rendering:**
- Hide ranged weapons if Firepower is None
- Hide leader trait if trooper
- Disable equipment selections when limit reached


#### WeirdoCostDisplay

Shows individual weirdo cost with sticky positioning.

```typescript
interface WeirdoCostDisplayProps {
  cost: number;
  breakdown: CostBreakdown;
  isApproachingLimit: boolean;
  isOverLimit: boolean;
}
```

**Features:**
- Sticky positioning at top of weirdo editor
- Expandable breakdown showing component costs
- Warning indicator when approaching 20/25 point limits
- Error styling when exceeding limits

#### AttributeSelector

Dropdown selector for each attribute with cost display.

```typescript
interface AttributeSelectorProps {
  attribute: keyof Attributes;
  value: SpeedLevel | DiceLevel | FirepowerLevel;
  onChange: (value: any) => void;
  warbandAbility?: WarbandAbility;
}
```

**Features:**
- Label with attribute name
- Dropdown with all valid levels
- Cost display for each option
- Modified cost indication if warband ability applies

**Example Rendering:**
```
Speed: [Dropdown: 1 (0 pts) | 2 (1 pt) | 3 (3 pts)]
```

#### WeaponSelector

Multi-select interface for weapons with cost and notes.

```typescript
interface WeaponSelectorProps {
  type: 'close-combat' | 'ranged';
  selected: Weapon[];
  available: Weapon[];
  onChange: (weapons: Weapon[]) => void;
  warbandAbility?: WarbandAbility;
  disabled?: boolean;
}
```

**Features:**
- Checkbox list of available weapons
- Display name, cost, and notes for each weapon
- Modified cost indication if warband ability applies
- Disabled state when Firepower is None (for ranged)

**Example Rendering:**
```
Close Combat Weapons:
☑ Sword (2 pts) - Standard melee weapon
☐ Axe (3 pts) - Heavy melee weapon
☐ Claws & Teeth (1 pt → 0 pts) - Natural weapons [Modified by Mutants]
```

#### EquipmentSelector

Multi-select interface for equipment with limit enforcement.

```typescript
interface EquipmentSelectorProps {
  selected: Equipment[];
  available: Equipment[];
  limit: number;
  onChange: (equipment: Equipment[]) => void;
  warbandAbility?: WarbandAbility;
}
```

**Features:**
- Checkbox list of available equipment
- Display name, cost, and effect for each item
- Disable checkboxes when limit reached
- Show current count vs limit
- Modified cost indication if warband ability applies

**Example Rendering:**
```
Equipment (2/2):
☑ Heavy Armor (3 pts → 0 pts) - +1 Defense [Modified by Soldiers]
☑ Medkit (2 pts → 0 pts) - Heal wounds [Modified by Soldiers]
☐ Scanner (1 pt) - Detect enemies [Disabled - limit reached]
```

#### PsychicPowerSelector

Multi-select interface for psychic powers.

```typescript
interface PsychicPowerSelectorProps {
  selected: PsychicPower[];
  available: PsychicPower[];
  onChange: (powers: PsychicPower[]) => void;
}
```

**Features:**
- Checkbox list of available powers
- Display name, cost, and effect for each power
- No limit on selections

#### LeaderTraitSelector

Dropdown selector for leader trait.

```typescript
interface LeaderTraitSelectorProps {
  selected: LeaderTrait | null;
  available: LeaderTrait[];
  onChange: (trait: LeaderTrait | null) => void;
}
```

**Features:**
- Dropdown with "None" option
- Display description for each trait
- Only shown for leaders


#### ValidationErrorDisplay

Shows validation errors with tooltips.

```typescript
interface ValidationErrorDisplayProps {
  errors: ValidationError[];
  inline?: boolean;
}
```

**Features:**
- Display errors as list or inline message
- Tooltip on hover for detailed information
- Error icon with count badge
- Clear, actionable error messages

**CSS Strategy:**
```css
.validation-error {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.validation-tooltip {
  position: absolute;
  background: #333;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  z-index: 1000;
}
```

#### DeleteConfirmationDialog

Modal dialog for confirming warband deletion.

```typescript
interface DeleteConfirmationDialogProps {
  warbandName: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Features:**
- Modal overlay with focus trap
- Display warband name being deleted
- Confirm and Cancel buttons
- Escape key to cancel

#### ToastNotification

Temporary notification for success/error messages.

```typescript
interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onDismiss: () => void;
}
```

**Features:**
- Auto-dismiss after 3-5 seconds
- Manual dismiss button
- Success (green) and error (red) styling
- Positioned at top-right of viewport

## Data Models

### UI State Models

```typescript
interface UIState {
  // Navigation
  currentView: 'list' | 'editor';
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Notifications
  notification: {
    message: string;
    type: 'success' | 'error';
  } | null;
  
  // Dialogs
  deleteConfirmation: {
    warbandId: string;
    warbandName: string;
  } | null;
}
```

### Form State

```typescript
interface FormState {
  // Dirty tracking
  isDirty: boolean;
  
  // Field-level validation
  fieldErrors: Map<string, string>;
  
  // Submission state
  isSubmitting: boolean;
  submitError: string | null;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

**Requirement 1: Warband Creation**
1.1-1.7: Warband initialization and validation
- Thoughts: These are UI behaviors that can be tested by simulating user interactions and checking DOM state
- Testable: yes - example

**Requirement 2: Progressive Disclosure**
2.1-2.7: Conditional rendering of weirdo options
- Thoughts: These are UI state transitions that can be tested by checking component visibility
- Testable: yes - property

**Requirement 3: Real-time Cost Calculations**
3.1-3.7: Cost updates and display
- Thoughts: These are UI updates triggered by state changes, testable by checking displayed values
- Testable: yes - property

**Requirement 4: Validation Feedback**
4.1-4.7: Visual error indicators
- Thoughts: These are UI styling and tooltip behaviors, testable by checking CSS classes and DOM content
- Testable: yes - property

**Requirement 5: Selection Displays**
5.1-5.8: Information display for options
- Thoughts: These are rendering behaviors that can be tested by checking displayed content
- Testable: yes - property

**Requirement 6: Sticky Cost Displays**
6.1-6.6: Sticky positioning behavior
- Thoughts: These are CSS positioning behaviors, testable by checking computed styles
- Testable: yes - property

**Requirement 7: Warband List Display**
7.1-7.9: List rendering and navigation
- Thoughts: These are UI rendering and interaction behaviors
- Testable: yes - property

**Requirement 8: Delete Confirmation**
8.1-8.6: Confirmation dialog flow
- Thoughts: These are UI interaction flows, testable by simulating user actions
- Testable: yes - example

**Requirement 9: Notification Messages**
9.1-9.6: Success/error messaging
- Thoughts: These are UI feedback behaviors, testable by checking displayed messages
- Testable: yes - property

**Requirement 10: Visual Organization**
10.1-10.6: Layout and section organization
- Thoughts: These are structural rendering behaviors, testable by checking DOM structure
- Testable: yes - example

**Requirement 11: Weirdo Management Controls**
11.1-11.6: Add/remove controls and state
- Thoughts: These are UI interaction behaviors, testable by simulating actions
- Testable: yes - property

**Requirement 12: Form Controls**
12.1-12.7: Input control behavior
- Thoughts: These are UI control behaviors, testable by checking enabled/disabled states
- Testable: yes - property


### Property Reflection

After reviewing all properties, I've identified the following consolidations:

- **Progressive disclosure properties** (2.1-2.7) can be combined into one property about conditional rendering based on warband state
- **Real-time cost update properties** (3.1-3.7) can be consolidated into one property about cost synchronization
- **Validation feedback properties** (4.1-4.7) can be combined into one property about error display consistency
- **Selection display properties** (5.1-5.8) can be consolidated into one property about information completeness
- **Sticky display properties** (6.1-6.6) can be combined into one property about sticky positioning behavior
- **Warband list properties** (7.1-7.9) can be consolidated into one property about list completeness
- **Notification properties** (9.1-9.6) can be combined into one property about message lifecycle
- **Control state properties** (11.1-11.6, 12.1-12.7) can be consolidated into properties about control availability

### Correctness Properties

**Property 1: Warband creation initializes correctly**
*For any* new warband creation, the warband name should default to "New Warband", point limit should be selectable as 75 or 125, total cost should display as zero, and warband ability should be optional.
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.7**

**Property 2: Progressive disclosure based on warband state**
*For any* application state, weirdo creation options should be hidden when no warband exists or is selected, and should be visible when a warband is created or loaded.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

**Property 3: Real-time cost synchronization**
*For any* change to weirdo attributes, weapons, equipment, or psychic powers, the displayed weirdo cost and warband total cost should update within 100 milliseconds to reflect the new calculated values.
**Validates: Requirements 3.1, 3.2, 3.3, 3.6**

**Property 4: Cost warning indicators appear correctly**
*For any* weirdo or warband, when the cost approaches the limit (within 10 points for weirdo, within 15 points for warband), a warning indicator should be displayed; when the cost exceeds the limit, an error indicator should be displayed.
**Validates: Requirements 3.4, 3.5**

**Property 5: Modified costs are visually indicated**
*For any* weapon or equipment with a warband ability modifier applied, the display should show both the base cost and modified cost with visual styling (e.g., strikethrough on base cost).
**Validates: Requirements 3.7, 5.7, 5.8**

**Property 6: Validation errors are visually highlighted**
*For any* weirdo with validation errors, the weirdo card should have error styling applied, and hovering over the card should display a tooltip containing all validation error messages.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

**Property 7: Selection options display complete information**
*For any* selectable item (warband ability, attribute, weapon, equipment, psychic power, leader trait), the display should include all relevant information: name, cost (if applicable), and description/effect/notes.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**

**Property 8: Sticky cost displays remain visible during scroll**
*For any* scroll position within the weirdo editor or warband editor, the respective cost display should remain visible at the top of the scrollable area without obscuring controls.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

**Property 9: Warband list displays complete information**
*For any* saved warband, the list display should show the warband name, ability, point limit, total cost, and weirdo count; when no warbands exist, an empty state message should be shown.
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

**Property 10: Delete confirmation prevents accidental deletion**
*For any* delete request, a confirmation dialog should appear displaying the warband name; the warband should only be deleted if the user confirms, and should be retained if the user cancels.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

**Property 11: Notifications provide feedback and auto-dismiss**
*For any* save or delete operation, a success or error message should be displayed; the message should auto-dismiss after 3-5 seconds and should be manually dismissible.
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

**Property 12: Add leader button is disabled when leader exists**
*For any* warband state, the "Add Leader" button should be disabled when the warband already has a leader, and enabled when no leader exists.
**Validates: Requirements 11.3**

**Property 13: Equipment selections are disabled at limit**
*For any* weirdo with equipment at the limit (based on type and Cyborgs ability), additional equipment checkboxes should be disabled.
**Validates: Requirements 12.6**

**Property 14: Ranged weapon selections are disabled when Firepower is None**
*For any* weirdo with Firepower level None, the ranged weapon selector should be disabled.
**Validates: Requirements 12.7**

## Error Handling

### Error Types

```typescript
enum UIErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SAVE_ERROR = 'SAVE_ERROR',
  LOAD_ERROR = 'LOAD_ERROR',
  DELETE_ERROR = 'DELETE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

interface UIError {
  type: UIErrorType;
  message: string;
  details?: any;
}
```

### Error Handling Strategy

**Validation Errors:**
- Display inline with form fields
- Show in tooltips on weirdo cards
- Prevent save until resolved
- Clear when user corrects input

**Save Errors:**
- Display toast notification with error message
- Keep form data intact for retry
- Log error details for debugging
- Suggest checking permissions or disk space

**Load Errors:**
- Display toast notification
- Return to warband list
- Suggest checking data integrity

**Delete Errors:**
- Display toast notification
- Keep warband in list
- Allow retry

**Network Errors:**
- Display toast notification
- Suggest checking connection
- Provide retry option


## Testing Strategy

The testing strategy employs a dual approach combining unit tests and property-based tests, with a focus on component behavior and user interactions.

### Unit Testing

Unit tests verify specific UI behaviors and edge cases:

**Component Rendering Tests:**
- WarbandList renders empty state correctly
- WarbandEditor shows warband properties section
- WeirdoEditor displays all attribute selectors
- ValidationErrorDisplay shows error messages
- ToastNotification auto-dismisses after timeout

**Interaction Tests:**
- Clicking "Add Leader" creates a leader weirdo
- Clicking "Add Trooper" creates a trooper weirdo
- Selecting a weirdo highlights it in the list
- Removing a weirdo updates the warband cost
- Confirming delete removes warband from list

**Conditional Rendering Tests:**
- Weirdo options hidden when no warband exists
- Ranged weapons disabled when Firepower is None
- Equipment checkboxes disabled at limit
- Add Leader button disabled when leader exists
- Leader trait selector only shown for leaders

**Validation Display Tests:**
- Error styling applied to invalid weirdos
- Tooltip shows validation messages on hover
- Validation errors clear when corrected
- Multiple errors displayed in tooltip

**Cost Display Tests:**
- Weirdo cost updates when attributes change
- Warband cost updates when weirdo added/removed
- Warning indicator appears near limit
- Modified costs show strikethrough styling

**Testing Framework**: Vitest with React Testing Library
**Test Location**: Co-located with components using `.test.tsx` suffix

### Property-Based Testing

Property-based tests verify universal UI properties across many inputs:

- **Framework**: fast-check
- **Minimum Iterations**: 50 per test
- **Tagging Format**: `**Feature: space-weirdos-ui, Property {number}: {property_text}**`

Each correctness property defined above should be implemented as a property-based test where applicable. Note that some UI properties are better suited to example-based testing (e.g., specific layout checks), while others benefit from property-based testing (e.g., cost synchronization across random inputs).

**Generator Strategy:**

```typescript
// Generate random warband states
const warbandArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  pointLimit: fc.constantFrom(75, 125),
  ability: fc.option(fc.constantFrom('Heavily Armed', 'Mutants', 'Soldiers', 'Cyborgs')),
  weirdos: fc.array(weirdoArbitrary, { minLength: 0, maxLength: 10 })
});

// Generate random weirdo configurations
const weirdoArbitrary = fc.record({
  type: fc.constantFrom('leader', 'trooper'),
  attributes: attributesArbitrary,
  weapons: fc.array(weaponArbitrary, { minLength: 1, maxLength: 5 }),
  equipment: fc.array(equipmentArbitrary, { minLength: 0, maxLength: 3 })
});
```

**Property Test Implementations:**

1. **Property 3**: Generate random weirdo modifications, verify cost updates within 100ms
2. **Property 4**: Generate random costs, verify warning/error indicators appear correctly
3. **Property 5**: Generate random warband abilities, verify modified costs display correctly
4. **Property 6**: Generate random validation errors, verify all errors appear in tooltip
5. **Property 7**: Generate random selection options, verify all information is displayed
6. **Property 9**: Generate random warband sets, verify list displays all information
7. **Property 11**: Generate random save/delete operations, verify notifications appear and dismiss

### Integration Testing

Integration tests verify complete user workflows:

**Warband Creation Flow:**
1. User creates new warband
2. Verifies warband properties are editable
3. Adds leader and trooper
4. Modifies attributes and equipment
5. Verifies costs update correctly
6. Saves warband
7. Verifies success notification

**Warband Loading Flow:**
1. User selects warband from list
2. Verifies warband data loads correctly
3. Verifies weirdos display in list
4. Selects weirdo for editing
5. Verifies weirdo data populates editor

**Validation Flow:**
1. User creates invalid weirdo (no weapons)
2. Verifies error styling appears
3. Verifies tooltip shows error message
4. User adds required weapon
5. Verifies error clears

**Delete Flow:**
1. User clicks delete on warband
2. Verifies confirmation dialog appears
3. User cancels
4. Verifies warband remains
5. User deletes again and confirms
6. Verifies warband removed from list

### Accessibility Testing

**Keyboard Navigation:**
- Tab through all form controls
- Enter to submit forms
- Escape to close dialogs
- Arrow keys for dropdowns

**Screen Reader:**
- ARIA labels on all inputs
- ARIA live regions for notifications
- ARIA descriptions for validation errors
- Semantic HTML elements

**Visual:**
- Sufficient color contrast
- Focus indicators visible
- Error states clearly marked
- Text readable at 200% zoom

### Testing Priorities

1. **Critical Path**: Warband creation, weirdo editing, cost calculations (highest priority)
2. **Validation**: Error display, validation feedback
3. **Navigation**: List view, editor view, weirdo selection
4. **Edge Cases**: Empty states, limits, disabled controls
5. **Accessibility**: Keyboard navigation, screen reader support

## Implementation Notes

### Performance Considerations

**Real-time Updates:**
- Debounce cost calculations (100ms) to avoid excessive recalculation
- Use React.memo for expensive components (WeirdoCard, AttributeSelector)
- Memoize computed values (costs, validation results)

**Rendering Optimization:**
- Virtualize warband list if > 50 warbands
- Lazy load weirdo editor sections
- Use CSS containment for sticky elements

**State Management:**
- Use Context for global state (warband, selected weirdo)
- Use local state for UI-only state (tooltips, dialogs)
- Avoid prop drilling with composition

### CSS Architecture

**Styling Approach:**
- CSS Modules for component-specific styles
- Global styles for theme and layout
- CSS custom properties for theming
- BEM naming convention for clarity

**Responsive Design:**
- Desktop-first approach (per requirements)
- Flexible layouts with CSS Grid and Flexbox
- Breakpoints for tablet and mobile (future enhancement)

**Sticky Positioning:**
```css
.cost-display {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
}
```

### Accessibility Implementation

**Semantic HTML:**
```tsx
<form onSubmit={handleSave}>
  <fieldset>
    <legend>Warband Properties</legend>
    <label htmlFor="warband-name">Name</label>
    <input id="warband-name" type="text" />
  </fieldset>
</form>
```

**ARIA Attributes:**
```tsx
<button
  aria-label="Add Leader"
  aria-disabled={hasLeader}
  disabled={hasLeader}
>
  Add Leader
</button>

<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>
  {notification.message}
</div>
```

**Focus Management:**
```typescript
// Focus first error field on validation failure
const firstErrorField = document.querySelector('[aria-invalid="true"]');
firstErrorField?.focus();

// Trap focus in modal dialog
const dialog = dialogRef.current;
const focusableElements = dialog.querySelectorAll(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);
```


### Dependencies

**External Dependencies:**
- **React**: UI framework (v18+)
- **React Router**: Navigation (if multi-page)
- **fast-check**: Property-based testing
- **Vitest**: Unit testing framework
- **React Testing Library**: Component testing utilities

**Internal Dependencies:**
- **Game Rules Spec**: CostEngine, ValidationService, data models
- **Data Persistence Spec**: DataRepository, save/load operations

**No Dependencies On:**
- Backend API (uses DataRepository abstraction)
- Specific styling framework (uses vanilla CSS/CSS Modules)

### Component Reusability

**Shared Components:**

```typescript
// SelectWithCost: Reusable dropdown with cost display
interface SelectWithCostProps {
  label: string;
  options: Array<{ value: any; label: string; cost: number }>;
  value: any;
  onChange: (value: any) => void;
  modifiedCost?: number;
}

// ItemList: Reusable checkbox list with descriptions
interface ItemListProps {
  items: Array<{ id: string; name: string; description: string; cost: number }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  limit?: number;
  disabled?: boolean;
}

// CostBadge: Reusable cost display with modifier indication
interface CostBadgeProps {
  baseCost: number;
  modifiedCost?: number;
  showModifier?: boolean;
}
```

**Design Rationale:**
- Shared components reduce duplication
- Props interfaces enable type safety
- Composition over inheritance
- Single responsibility per component

### State Synchronization

**Cost Calculation Flow:**
```typescript
// User changes attribute
onChange={(value) => {
  // 1. Update weirdo in context
  updateWeirdo(weirdoId, { attributes: { ...attributes, speed: value } });
  
  // 2. Context triggers cost recalculation
  const newCost = costEngine.calculateWeirdoCost(updatedWeirdo, warbandAbility);
  
  // 3. React re-renders with new cost
  // WeirdoCostDisplay and WarbandCostDisplay update automatically
}}
```

**Validation Flow:**
```typescript
// User saves warband
const handleSave = async () => {
  // 1. Validate warband
  const validation = validationService.validateWarband(warband);
  
  // 2. If invalid, show errors and prevent save
  if (!validation.valid) {
    setValidationErrors(validation.errors);
    return;
  }
  
  // 3. If valid, save and show success
  try {
    await dataRepository.saveWarband(warband);
    showNotification('Warband saved successfully', 'success');
  } catch (error) {
    showNotification('Failed to save warband', 'error');
  }
};
```

### Error Boundaries

Implement error boundaries to catch rendering errors:

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
    this.setState({ hasError: true, error });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Future Enhancements

### Potential Improvements

1. **Undo/Redo**: Implement command pattern for edit history
2. **Auto-save**: Periodic saves to prevent data loss
3. **Keyboard Shortcuts**: Power user features (Ctrl+S to save, etc.)
4. **Dark Mode**: Theme switching support
5. **Mobile Responsive**: Optimize for touch interfaces
6. **Drag and Drop**: Reorder weirdos in list
7. **Export/Import**: Share warbands as JSON files
8. **Print View**: Printer-friendly warband sheets
9. **Search/Filter**: Find warbands by name or ability
10. **Duplicate Warband**: Clone existing warbands

### Extensibility Points

**Theme System:**
```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    error: string;
    warning: string;
    success: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
}
```

**Plugin System:**
```typescript
interface UIPlugin {
  name: string;
  version: string;
  initialize: (context: WarbandContext) => void;
  renderAdditionalControls?: () => React.ReactNode;
  onWarbandSave?: (warband: Warband) => void;
}
```

### Migration Path

**Moving to Backend API:**
- Replace DataRepository calls with API client
- Add loading states for async operations
- Implement optimistic updates for better UX
- Add retry logic for failed requests

**Adding Routing:**
- Install React Router
- Define routes: `/`, `/warband/:id`, `/warband/new`
- Update navigation to use `<Link>` components
- Add route guards for unsaved changes

**Design Rationale:**
- Current design is simple and sufficient for local-first app
- Clear extension points enable future enhancements
- Interface-based design allows swapping implementations
- Progressive enhancement approach

## Design Decisions and Rationales

### Decision 1: Context API vs Redux

**Decision**: Use React Context API for state management

**Rationale:**
- Warband editing is a single-user, single-session activity
- State is not deeply nested or complex
- Context API is simpler and has no external dependencies
- No need for time-travel debugging or middleware
- Performance is adequate for expected data size

### Decision 2: Sticky Positioning vs Fixed Positioning

**Decision**: Use CSS `position: sticky` for cost displays

**Rationale:**
- Sticky positioning is more semantic and accessible
- Automatically handles scroll boundaries
- No JavaScript required for positioning logic
- Better performance than scroll event listeners
- Degrades gracefully in older browsers

### Decision 3: Inline Validation vs Submit Validation

**Decision**: Show validation errors inline as user edits

**Rationale:**
- Immediate feedback helps users correct errors quickly
- Reduces frustration of discovering errors after save attempt
- Aligns with modern UX best practices
- Still validate on save as final check

### Decision 4: Component Co-location vs Separate Test Files

**Decision**: Co-locate tests with components using `.test.tsx` suffix

**Rationale:**
- Easier to find tests for specific components
- Encourages writing tests alongside implementation
- Simplifies imports and relative paths
- Follows project standards

### Decision 5: CSS Modules vs Styled Components

**Decision**: Use CSS Modules for component styling

**Rationale:**
- No runtime overhead (styles are static)
- Familiar CSS syntax
- Scoped styles prevent conflicts
- Easy to extract to separate files
- No additional dependencies

### Decision 6: Optimistic Updates vs Pessimistic Updates

**Decision**: Use pessimistic updates (wait for save confirmation)

**Rationale:**
- File I/O is fast enough that waiting is acceptable
- Reduces complexity of rollback logic
- Prevents showing success when save actually failed
- Clearer error handling

### Decision 7: Tooltip vs Inline Error Messages

**Decision**: Use tooltips for validation errors on weirdo cards, inline for form fields

**Rationale:**
- Tooltips save space in compact weirdo cards
- Inline messages are more accessible for form fields
- Hybrid approach balances space and usability
- Tooltips on hover provide details without cluttering UI

## Conclusion

This design provides a comprehensive UI architecture for the Space Weirdos Warband Builder that prioritizes:

- **Usability**: Clear workflows, real-time feedback, intuitive controls
- **Reliability**: Validation, error handling, confirmation dialogs
- **Performance**: Optimized rendering, efficient state management
- **Maintainability**: Component composition, clear interfaces, testability
- **Accessibility**: Semantic HTML, ARIA attributes, keyboard navigation

The design integrates cleanly with the game rules engine and data persistence layer while maintaining clear separation of concerns. It provides a solid foundation for implementation and future enhancements.
