# Space Weirdos Warband Builder - Features

## Core Features

### Warband Management
- **Create Warbands**: Start new warbands with customizable names and settings
- **Save & Load**: Persistent storage with JSON file persistence
- **Delete Warbands**: Remove unwanted warbands with confirmation
- **Download & Import**: Export warbands as JSON files for sharing and backup
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
- **Import/Export Actions**: Download warbands as JSON files or import from files
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

### Code Duplication Analysis System

The Space Weirdos Warband Builder includes a comprehensive code duplication analysis system for maintaining high code quality and identifying optimization opportunities.

#### Advanced Static Analysis Engine
- **Multi-Algorithm Detection**: Exact match, functional, pattern, and configuration duplication detection
- **AST-Based Parsing**: Uses TypeScript Compiler API for accurate code analysis
- **Configurable Thresholds**: Adjustable similarity thresholds and analysis scope
- **Cross-Platform Support**: Analyzes both frontend (React/TSX) and backend (Node.js) code

#### Specialized Detection Types

**Exact Match Detection:**
- Identifies identical or near-identical code blocks
- Handles whitespace and comment variations
- Provides line-by-line comparison results

**Functional Duplication Detection:**
- Analyzes method signatures and behavior patterns
- Identifies different implementations of the same functionality
- Uses semantic analysis to detect equivalent business logic

**Pattern Duplication Detection:**
- Identifies repeated implementation patterns
- Detects opportunities for abstraction and generalization
- Analyzes structural similarities across components

**Configuration Duplication Detection:**
- Identifies hardcoded values scattered across files
- Detects inconsistent configuration access patterns
- Analyzes environment variable usage and conflicts

#### Specialized Analyzers

**Singleton Pattern Analyzer:**
- Identifies all classes using the singleton pattern
- Compares singleton implementations for consistency
- Evaluates singleton necessity and dependency injection alternatives

**Service Consolidation Analyzer:**
- Identifies services with overlapping responsibilities
- Detects duplicate business logic implementations
- Suggests service refactoring and consolidation strategies

**Cache Consolidation Analyzer:**
- Analyzes cache implementations across the application
- Identifies opportunities for unified caching strategies
- Suggests shared caching utilities and standardization

**Validation Consolidation Analyzer:**
- Analyzes validation logic duplication
- Identifies opportunities for centralized validation utilities
- Suggests shared validation rules and error handling

#### Analysis Results & Metrics

**Space Weirdos Codebase Analysis:**
- **101 source files** analyzed containing **36,162 lines of code**
- **73 duplication patterns** identified with potential savings of **3,840 lines of code**
- **2 high-severity issues** requiring immediate attention
- **71 medium-severity optimization opportunities**
- **10.6% duplication percentage** with path to <5% through optimization

**Quality Metrics:**
- **Maintainability Index**: Current 65/100, projected 85/100 after optimization
- **Technical Debt Ratio**: Current 0.21, projected <0.10 after optimization
- **Configuration Consistency**: Current 65%, projected 95% after consolidation

#### Command Line Interface

**Basic Analysis Commands:**
```bash
# Run comprehensive codebase analysis
npm run analyze:codebase

# Run Space Weirdos specific analysis
npm run analyze:space-weirdos

# Generate detailed HTML report
npm run analyze:space-weirdos -- --detailed-report --output-format="html"
```

**Advanced Options:**
```bash
# Custom similarity threshold
npm run analyze:codebase -- --similarity-threshold=0.8

# Analyze specific directories
npm run analyze:codebase -- --include="src/frontend/**" --include="src/backend/**"

# Focus on specific detector types
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --detectors="exact-match,functional"
```

#### Optimization Recommendations

**Intelligent Recommendation Engine:**
- **Impact Analysis**: Assesses potential benefits of refactoring changes
- **Complexity Estimation**: Estimates effort required for each optimization
- **Risk Assessment**: Identifies potential risks and mitigation strategies
- **Strategy Generation**: Creates step-by-step implementation plans

**4-Phase Optimization Roadmap:**
1. **Critical Infrastructure** (32 hours, Weeks 1-4): Configuration and validation consolidation
2. **Service Layer Optimization** (120 hours, Weeks 5-12): Service consolidation and architecture improvement
3. **Quality Improvements** (36 hours, Weeks 13-16): Error handling and quality assurance
4. **UI Component Optimization** (270 hours, Weeks 17-26): Component consolidation and design system enhancement

#### Integration & Workflow

**Development Workflow Integration:**
- Pre-commit analysis hooks for quality gates
- CI/CD pipeline integration with threshold-based build failures
- Code review integration with duplication reports
- Real-time quality monitoring and progress tracking

**Configuration Support:**
```json
{
  "analysis": {
    "similarityThreshold": 0.85,
    "minDuplicationSize": 5,
    "complexityThreshold": "medium"
  },
  "scope": {
    "include": ["src/**/*.ts", "src/**/*.tsx"],
    "exclude": ["**/*.test.ts", "node_modules/**"]
  }
}
```

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
- **Data Portability**: Export/import functionality for warband sharing and backup
- **Type-Safe Models**: Shared TypeScript types between frontend and backend
- **Validation**: All data validated before persistence and import

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

## Import/Export System

### Warband Sharing & Backup

The Space Weirdos Warband Builder includes comprehensive import/export functionality for sharing warbands and creating backups.

#### Exporting Warbands

**How to Export:**
1. Navigate to the warband list
2. Find the warband you want to export
3. Click the "Export" button next to the warband name
4. Your browser will automatically download a JSON file

**Export Features:**
- **Automatic Download**: Files download immediately with sanitized filenames
- **Complete Data**: Includes all warband data, weirdos, equipment, and metadata
- **Metadata Included**: Export timestamp, version information, and source application
- **Safe Filenames**: Automatically sanitizes filenames for cross-platform compatibility
- **JSON Format**: Human-readable format that can be shared easily

**Export File Structure:**
```json
{
  "name": "My Warband",
  "ability": "Heavily Armed",
  "pointLimit": 75,
  "totalCost": 65,
  "weirdos": [...],
  "exportVersion": "1.0",
  "exportedAt": "2023-12-15T10:30:00.000Z",
  "exportedBy": "Space Weirdos Warband Builder"
}
```

#### Importing Warbands

**How to Import:**
1. Navigate to the warband list
2. Click the "Import" button
3. Select a JSON warband file from your computer
4. The system will validate the file and show any issues
5. Resolve any name conflicts if they occur
6. Your warband will be added to your collection

**Import Features:**
- **Comprehensive Validation**: Checks file structure, game data references, and business rules
- **Error Reporting**: Clear, categorized error messages with specific field information
- **Name Conflict Resolution**: Handles duplicate warband names gracefully
- **Data Sanitization**: Cleans imported data for security and compatibility
- **Unique ID Generation**: Assigns new IDs to prevent conflicts with existing warbands

#### Validation System

**Validation Categories:**

1. **Structure Validation**
   - Checks for required fields (name, weirdos, point limit)
   - Validates data types and formats
   - Ensures JSON structure matches expected schema

2. **Game Data Validation**
   - Verifies all weapons exist in current game data
   - Checks equipment and psychic power references
   - Validates warband abilities and leader traits

3. **Business Rule Validation**
   - Enforces point limits (20/25 per weirdo, 75/125 per warband)
   - Validates weapon requirements based on Firepower
   - Checks equipment limits and warband ability effects

**Error Handling:**
- **Clear Messages**: User-friendly error descriptions with specific field references
- **Categorized Issues**: Errors grouped by type for easier understanding
- **Actionable Suggestions**: Specific recommendations for fixing validation issues
- **Retry Support**: Automatic retry for recoverable errors like network issues

#### Name Conflict Resolution

When importing a warband with a name that already exists:

**Options Available:**
1. **Rename**: Choose a new name for the imported warband
2. **Replace**: Overwrite the existing warband (with confirmation)
3. **Cancel**: Abort the import operation

**Automatic Suggestions:**
- System suggests unique names based on the original
- Validates new names to ensure uniqueness
- Preserves original naming intent when possible

#### Troubleshooting Common Issues

**File Format Issues:**
- **Problem**: "Invalid JSON data" error
- **Solution**: Ensure file is a valid JSON warband export, not corrupted or modified
- **Prevention**: Only import files exported from the Space Weirdos Warband Builder

**Missing Game Data:**
- **Problem**: "Missing weapon/equipment reference" warnings
- **Solution**: Update your game data or remove invalid references
- **Note**: Warnings don't prevent import but may affect warband functionality

**Point Limit Violations:**
- **Problem**: "Cost exceeded" validation errors
- **Solution**: Edit the warband to comply with current point limits
- **Note**: Game rules may have changed since the warband was exported

**Name Conflicts:**
- **Problem**: "Warband name already exists" error
- **Solution**: Choose rename option or replace existing warband
- **Tip**: Use descriptive names to avoid conflicts

**Large File Issues:**
- **Problem**: Import fails with timeout or size errors
- **Solution**: Check file size (max 10MB) and network connection
- **Alternative**: Try importing on a faster network connection

#### Best Practices

**For Sharing:**
- Export warbands with descriptive names
- Include version information in shared files
- Test imported warbands before sharing with others
- Document any custom rules or modifications

**For Backup:**
- Export warbands regularly to prevent data loss
- Store backup files in multiple locations
- Include export date in filename for version tracking
- Test restore process periodically

**File Management:**
- Use consistent naming conventions for exported files
- Organize exports by date, campaign, or warband type
- Keep original exports separate from modified versions
- Document any manual changes made to exported files

### Additional Future Enhancements

Potential features for continued development:
- Print-friendly warband sheets with formatted layouts
- Campaign tracking and progression systems
- Custom equipment and weapons creation
- Multiplayer warband sharing platform
- Mobile app version for iOS and Android
- Dark mode theme option
- Undo/redo functionality for editing actions
- Warband templates and presets for quick setup
- Advanced search and filtering for large warband collections
- Warband comparison tools
- Integration with online gaming platforms

This feature set provides a complete, polished experience for building Space Weirdos warbands with intelligent validation and real-time feedback!
