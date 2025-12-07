# Design Document: Warband List & Navigation

## Overview

This design document specifies the warband list view and navigation system for the Space Weirdos Warband Builder. The system provides an intuitive interface for viewing all saved warbands, creating new warbands, deleting existing warbands with confirmation, and navigating between the list and editor views.

**Key Design Goals:**
- Clear visual presentation of warband summary information
- Easy navigation between list and editor views
- Safe deletion with confirmation dialogs
- Clear user feedback through notifications
- Responsive and accessible interface

**Dependencies:**
- Spec 1: UI Design System (for styling tokens and base styles)
- Data Persistence Spec (for DataRepository)
- Game Rules Spec (for Warband and Weirdo types)

## Architecture

### Component Hierarchy

```
App
├── WarbandList
│   ├── WarbandListHeader
│   │   └── CreateNewButton
│   ├── WarbandListContent
│   │   ├── LoadingIndicator
│   │   ├── EmptyState
│   │   └── WarbandListItem (multiple)
│   │       ├── WarbandInfo
│   │       ├── WarbandStats
│   │       └── DeleteButton
│   └── DeleteConfirmationDialog
│       ├── DialogOverlay
│       ├── DialogContent
│       └── DialogActions
└── ToastNotification
    ├── NotificationIcon
    ├── NotificationMessage
    └── DismissButton
```

### Data Flow

```
User Action → Component → Context/Service → DataRepository → Storage
                ↓
         UI Update ← Notification ← Result
```

### State Management

**WarbandListContext:**

```typescript
interface WarbandListContextValue {
  // State
  warbands: WarbandSummary[];
  isLoading: boolean;
  error: Error | null;
  
  // Operations
  loadWarbands: () => Promise<void>;
  createWarband: () => void;
  deleteWarband: (id: string) => Promise<void>;
  selectWarband: (id: string) => void;
  
  // Notifications
  showNotification: (message: string, type: 'success' | 'error') => void;
}

interface WarbandSummary {
  id: string;
  name: string;
  ability: string | null;
  pointLimit: 75 | 125;
  totalCost: number;
  weirdoCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```



## Components and Interfaces

### WarbandList

Main container component for the list view.

```typescript
interface WarbandListProps {
  onSelectWarband: (id: string) => void;
  onCreateNew: () => void;
}
```

**Features:**
- Fetches warbands on mount
- Displays loading state while fetching
- Displays empty state when no warbands
- Renders list of warband items
- Manages delete confirmation dialog

### WarbandListItem

Individual warband card in the list.

```typescript
interface WarbandListItemProps {
  warband: WarbandSummary;
  onSelect: () => void;
  onDelete: () => void;
}
```

**Display:**
- Warband name (prominent heading)
- Warband ability (with icon if available)
- Point limit and total cost (e.g., "45/75 points")
- Weirdo count (e.g., "3 weirdos")
- Delete button (danger styling)

**Styling:**
- Uses `.card` base style from design system
- Hover state for interactivity
- Click anywhere on card to select
- Delete button with confirmation

### DeleteConfirmationDialog

Modal dialog for confirming warband deletion.

```typescript
interface DeleteConfirmationDialogProps {
  warbandName: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Features:**
- Modal overlay (uses `--z-index-modal`)
- Focus trap (keyboard navigation contained)
- Escape key to cancel
- Click outside to cancel
- Prominent warband name display
- Danger-styled confirm button

### ToastNotification

Temporary notification for user feedback.

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
- Positioned at top-right (uses `--z-index-tooltip`)
- Slide-in animation
- Multiple notifications stack vertically

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

**Requirement 1: Warband List Display**
1.1-1.9: List rendering and information display
- Thoughts: These are UI rendering behaviors that can be tested by checking displayed content
- Testable: yes - property

**Requirement 2: Warband Creation**
2.1-2.5: Creating new warbands
- Thoughts: These are specific initialization behaviors that can be tested
- Testable: yes - example

**Requirement 3: Warband Deletion**
3.1-3.7: Delete confirmation flow
- Thoughts: These are UI interaction flows that can be tested by simulating user actions
- Testable: yes - property

**Requirement 4: Notifications**
4.1-4.6: Success/error messaging
- Thoughts: These are UI feedback behaviors that can be tested
- Testable: yes - property

**Requirement 5: Visual Organization**
5.1-5.6: Layout and styling
- Thoughts: These are visual presentation behaviors
- Testable: yes - example

**Requirement 6: Navigation**
6.1-6.5: View transitions
- Thoughts: These are navigation behaviors that can be tested
- Testable: yes - property

### Property Reflection

After reviewing all properties:
- **List display properties** (1.1-1.9) can be combined into one property about information completeness
- **Deletion properties** (3.1-3.7) can be combined into one property about confirmation flow
- **Notification properties** (4.1-4.6) can be combined into one property about message lifecycle
- **Navigation properties** (6.1-6.5) can be combined into one property about view transitions

### Correctness Properties

**Property 1: Warband list displays complete information**
*For any* saved warband, the list display should show the warband name, ability, point limit, total cost, and weirdo count; when no warbands exist, an empty state message should be shown.
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**

**Property 2: New warband initializes with defaults**
*For any* new warband creation, the warband should initialize with name "New Warband", point limit 75, and ability set to none.
**Validates: Requirements 2.3, 2.4, 2.5**

**Property 3: Delete confirmation prevents accidental deletion**
*For any* delete request, a confirmation dialog should appear displaying the warband name; the warband should only be deleted if the user confirms, and should be retained if the user cancels.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

**Property 4: Notifications provide feedback and auto-dismiss**
*For any* save or delete operation, a success or error notification should be displayed; the notification should auto-dismiss after 3-5 seconds and should be manually dismissible.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

**Property 5: Navigation preserves or loads warband data**
*For any* navigation from list to editor, the selected warband data should be loaded; for any navigation from editor to list, the list should refresh to show current warbands.
**Validates: Requirements 6.2, 6.4**

## Testing Strategy

### Unit Testing

- WarbandList renders loading state correctly
- WarbandList renders empty state when no warbands
- WarbandListItem displays all warband information
- DeleteConfirmationDialog shows warband name
- ToastNotification auto-dismisses after timeout
- Navigation updates URL correctly

### Property-Based Testing

- **Framework**: fast-check
- **Minimum Iterations**: 50 per test
- **Tagging Format**: `**Feature: 2-warband-list-navigation, Property {number}: {property_text}**`

**Property Test Implementations:**
1. **Property 1**: Generate random warband sets, verify all information displayed
2. **Property 3**: Generate random delete requests, verify confirmation flow
3. **Property 4**: Generate random operations, verify notifications appear and dismiss
4. **Property 5**: Generate random navigation sequences, verify data loads correctly

### Integration Testing

- Complete warband creation flow
- Complete warband deletion flow with confirmation
- Navigation between list and editor
- Error handling for failed operations

## Implementation Notes

### Performance Considerations

- Virtualize list if > 50 warbands
- Debounce search/filter (future enhancement)
- Memoize warband summary calculations

### Accessibility

- Keyboard navigation for list items
- Focus management for dialogs
- ARIA labels for buttons and actions
- Screen reader announcements for notifications

### Error Handling

- Display error notifications for failed operations
- Retry logic for transient failures
- Graceful degradation if DataRepository unavailable

## Conclusion

This spec provides a complete warband list and navigation system with clear user feedback, safe deletion, and intuitive navigation. It establishes the foundation for warband management that other specs will build upon.
