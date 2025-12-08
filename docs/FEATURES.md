# Space Weirdos Warband Builder - Features

## Core Features

### Warband Management
- **Create Warbands**: Start new warbands with customizable names and settings
- **Save & Load**: Persistent storage with JSON file persistence
- **Delete Warbands**: Remove unwanted warbands with confirmation
- **Point Limits**: Support for 75-point and 125-point games
- **Warband Abilities**: Heavily Armed, Mutants, Soldiers, Cyborgs with cost modifiers

### Weirdo Customization
- **Leader & Trooper Types**: Different capabilities and point limits
- **5 Attributes**: Speed, Defense, Firepower, Prowess, Willpower
- **Weapon Selection**: Close combat and ranged weapons with automatic requirements
- **Equipment**: Limited by weirdo type and warband abilities
- **Psychic Powers**: Unlimited selection for psychic weirdos
- **Leader Traits**: Special abilities for leader-type weirdos

### Real-Time Cost Calculation
- **Instant Feedback**: Sub-100ms cost calculations
- **Cost Breakdown**: Expandable view showing attribute, weapon, equipment, and power costs
- **Warband Totals**: Live tracking of total warband cost
- **Ability Modifiers**: Automatic application of warband ability cost changes
- **Performance Optimized**: Caching and memoization for smooth experience

### Context-Aware Validation

#### Intelligent Warning System
The warband builder features a smart warning system that adapts to your warband composition:

**How It Works:**
- Warnings appear when a weirdo's cost is within 3 points of their applicable limit
- The system analyzes your warband to determine which limits actually apply
- Clear messaging explains why warnings appear and what limits are relevant

**Warning Scenarios:**

1. **No 25-Point Weirdo Exists**
   - Warns at 18-20 points: "Cost is within X points of the 20-point limit"
   - Also warns at 23-25 points: "Cost is within X points of the 25-point limit (premium weirdo slot)"
   - Your weirdo could use either limit, so both warnings help you decide

2. **25-Point Weirdo Already Exists (Different Weirdo)**
   - Warns at 18-20 points only: "Cost is within X points of the 20-point limit"
   - No 25-point warnings (premium slot is taken)
   - Other weirdos are limited to 20 points maximum

3. **Editing the 25-Point Weirdo**
   - Warns at 23-25 points only: "Cost is within X points of the 25-point limit"
   - No 20-point warnings (already past that limit)
   - This weirdo can go up to 25 points

**Benefits:**
- No confusing warnings for limits that don't apply
- Understand which limits are relevant to each weirdo
- Make informed decisions about point allocation
- Backend-generated warnings ensure consistency with game rules

#### Comprehensive Rule Enforcement
- **Weapon Requirements**: Ensures proper weapon selection based on Firepower levels
- **Equipment Limits**: 2 for leaders, 1 for troopers, +1 with Cyborgs ability
- **Point Limits**: 20 points for most weirdos, one 25-point weirdo allowed per warband
- **Leader Traits**: Restricted to leader-type weirdos only
- **Warband Totals**: Enforces 75 or 125 point limits based on game type

### User Interface

#### Warband List View
- **Overview**: See all saved warbands at a glance
- **Summary Info**: Name, point limit, total cost, weirdo count
- **Quick Actions**: Load, delete, or create new warbands
- **Empty State**: Helpful guidance when no warbands exist

#### Warband Editor
- **Properties Panel**: Edit name, point limit, and warband ability
- **Cost Display**: Sticky display showing total cost and warnings
- **Weirdo Management**: Add, edit, or remove weirdos
- **Save Functionality**: Persist changes with validation

#### Weirdo Editor
- **Progressive Disclosure**: Options appear as you build your weirdo
- **Attribute Selection**: Clear dropdowns for all 5 attributes
- **Weapon Selectors**: Separate sections for close combat and ranged weapons
- **Equipment List**: Add/remove equipment with limit enforcement
- **Psychic Powers**: Unlimited selection with clear costs
- **Leader Traits**: Optional trait selection for leaders with descriptions
- **Cost Display**: Sticky display showing individual weirdo cost and warnings

### Design System
- **Consistent Styling**: Design tokens for colors, spacing, typography
- **Accessibility**: WCAG AA compliant with proper contrast and focus states
- **Responsive**: Works on desktop and mobile devices
- **Smooth Animations**: Transitions for expand/collapse and state changes
- **Visual Feedback**: Clear indicators for warnings, errors, and success states

## Technical Features

### Architecture
- **API-First Design**: All frontend-backend communication through HTTP endpoints
- **Type Safety**: Full TypeScript implementation with strict typing
- **Separation of Concerns**: Clear boundaries between frontend, backend, and data layers
- **Stateless Services**: Backend services operate on provided data without side effects

### Performance
- **Caching**: Cost calculation results cached for performance
- **Memoization**: React.memo and useMemo for expensive operations
- **Debouncing**: API calls debounced for rapid user input
- **Optimistic Updates**: Immediate UI feedback before backend confirmation

### Testing
- **140+ Tests**: Comprehensive test coverage
- **Property-Based Testing**: 25 properties validating universal correctness
- **Unit Tests**: Individual component and service testing
- **Integration Tests**: API endpoint and component interaction testing
- **100% Pass Rate**: All tests passing

### Data Management
- **In-Memory Database**: Fast access with JavaScript objects, Maps, and Sets
- **JSON Persistence**: Automatic saving to local filesystem
- **Type-Safe Models**: Shared TypeScript types between frontend and backend
- **Validation**: All data validated before persistence

## Game Rules Implemented

### Individual Weirdo Rules
- Speed: 1, 2, or 3 (costs: 0, 3, 6 points)
- Defense: 2d6, 2d8, or 2d10 (costs: 0, 3, 6 points)
- Firepower: None, 2d8, or 2d10 (costs: 0, 3, 6 points)
- Prowess: 2d6, 2d8, or 2d10 (costs: 0, 3, 6 points)
- Willpower: 2d6, 2d8, or 2d10 (costs: 0, 3, 6 points)

### Weapon Rules
- Firepower None: No ranged weapons allowed
- Firepower 2d8: One ranged weapon required
- Firepower 2d10: Two ranged weapons required
- Close combat weapons: Optional, multiple allowed
- Unarmed: Automatically included if no close combat weapons

### Equipment Rules
- Leaders: Up to 2 equipment items
- Troopers: Up to 1 equipment item
- Cyborgs ability: +1 equipment slot for all weirdos

### Point Limit Rules
- Standard limit: 20 points per weirdo
- Premium limit: One weirdo may be 21-25 points
- Warband limits: 75 or 125 points total
- Warning threshold: Within 3 points of applicable limit

### Warband Ability Modifiers
- **Heavily Armed**: Ranged weapons cost -1 point (minimum 0)
- **Mutants**: Psychic powers cost -1 point (minimum 0)
- **Soldiers**: Prowess upgrades cost -1 point (minimum 0)
- **Cyborgs**: +1 equipment slot for all weirdos

## Future Enhancements

Potential features for future development:
- Export/import warbands as JSON
- Print-friendly warband sheets
- Campaign tracking and progression
- Custom equipment and weapons
- Multiplayer warband sharing
- Mobile app version
- Dark mode theme
- Undo/redo functionality
- Warband templates and presets

This feature set provides a complete, polished experience for building Space Weirdos warbands with intelligent validation and real-time feedback!
