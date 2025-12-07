# Contributing to Space Weirdos Warband Builder

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Process

This project follows **spec-driven development** methodology with formal correctness guarantees.

### Workflow

1. **Requirements**: Define requirements using EARS patterns and INCOSE quality rules
2. **Design**: Create design with correctness properties for property-based testing
3. **Tasks**: Break down implementation into actionable tasks
4. **Implementation**: Implement features incrementally with continuous testing
5. **Validation**: Verify all tests pass and requirements are met

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd space-weirdos-warband
```

2. Install dependencies:
```bash
npm install
```

3. Run tests to verify setup:
```bash
npm test
```

4. Start development servers:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## Code Standards

### TypeScript

- Use TypeScript for all code (no JavaScript files)
- Avoid `any` type - use proper types
- Define interfaces for all data structures
- Use async/await for asynchronous operations

### Code Style

- Follow ESLint and Prettier configurations
- Use clear, descriptive variable and function names
- Keep functions focused and single-purpose
- Add comments for complex logic
- Prefer functional programming patterns where appropriate

### File Organization

```
src/
├── backend/
│   ├── constants/      # Constants and configuration
│   ├── errors/         # Error classes
│   ├── models/         # TypeScript interfaces and types
│   ├── routes/         # Express routes
│   └── services/       # Business logic services
└── frontend/
    ├── components/     # React components
    ├── contexts/       # React contexts
    └── services/       # Frontend services (API client)
```

## Testing Requirements

### Dual Testing Approach

All new features must include both:

1. **Unit Tests**: Verify specific examples and edge cases
2. **Property-Based Tests**: Verify universal properties across all inputs

### Test Standards

- Use test helper utilities from `tests/testHelpers.tsx`
- Always wrap components with `renderWithProviders`
- Configure property-based tests with minimum 50 iterations
- Tag property tests with design document references
- Use descriptive test names
- Test one thing per test

### Example Test Structure

```typescript
import { describe, test, expect } from 'vitest';
import { renderWithProviders, createMockWeirdo } from './testHelpers';
import * as fc from 'fast-check';

describe('MyComponent', () => {
  // Unit test
  test('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  // Property-based test
  /**
   * Feature: my-feature, Property 1: Description
   * Validates: Requirements 1.1
   */
  test('should maintain invariant', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (value) => {
          // Test property
          return value >= 0;
        }
      ),
      { numRuns: 50 }
    );
  });
});
```

For detailed testing documentation, see [TESTING.md](TESTING.md).

## Making Changes

### Branch Naming

- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`

### Commit Messages

Write clear, descriptive commit messages:

```
Add validation for weirdo equipment limits

- Implement equipment count validation
- Add tests for equipment limits
- Update ValidationService with new rules
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following code standards
3. Write tests for new functionality
4. Ensure all tests pass: `npm test`
5. Update documentation if needed
6. Submit pull request with clear description

### Pull Request Checklist

- [ ] Code follows project standards
- [ ] All tests pass
- [ ] New features have unit tests
- [ ] New features have property-based tests
- [ ] Documentation updated if needed
- [ ] No TypeScript errors
- [ ] No ESLint warnings

## Spec-Driven Development

### Creating New Features

For significant new features, follow the spec-driven development process:

1. **Create Requirements Document** (`.kiro/specs/{feature-name}/requirements.md`)
   - Use EARS patterns for requirements
   - Follow INCOSE quality rules
   - Define acceptance criteria

2. **Create Design Document** (`.kiro/specs/{feature-name}/design.md`)
   - Define architecture and components
   - Specify correctness properties
   - Plan error handling and testing strategy

3. **Create Task List** (`.kiro/specs/{feature-name}/tasks.md`)
   - Break down implementation into tasks
   - Reference specific requirements
   - Include property-based test tasks

4. **Implement Tasks**
   - Complete tasks incrementally
   - Write tests alongside implementation
   - Verify requirements are met

### Requirements Standards

All requirements must follow EARS patterns:

- **Ubiquitous**: THE <system> SHALL <response>
- **Event-driven**: WHEN <trigger>, THE <system> SHALL <response>
- **State-driven**: WHILE <condition>, THE <system> SHALL <response>
- **Unwanted event**: IF <condition>, THEN THE <system> SHALL <response>
- **Optional feature**: WHERE <option>, THE <system> SHALL <response>

Requirements must also comply with INCOSE quality rules:
- Use active voice
- Avoid vague terms
- Be measurable and testable
- Use consistent terminology
- Focus on what, not how

### Design Standards

Designs must include:
- Clear architecture and component boundaries
- Correctness properties for property-based testing
- Each property must start with "For any..." (universal quantification)
- Properties must reference specific requirements they validate

## Project Structure

### Backend Services

- **WarbandService**: Orchestrates warband CRUD operations
- **CostEngine**: Calculates point costs using Strategy pattern for ability modifiers
- **ValidationService**: Enforces all game rules with centralized error messages
- **DataRepository**: In-memory storage with JSON file persistence

**Backend Directory Structure:**
```
src/backend/
├── constants/          # Centralized constants and magic numbers
│   ├── costs.ts       # Cost calculation constants
│   └── validationMessages.ts  # Validation error messages
├── errors/            # Custom error classes
│   └── AppError.ts    # Base error class and subclasses
├── models/            # TypeScript interfaces and types
│   └── types.ts       # All data model definitions
├── routes/            # Express route handlers
│   └── warbandRoutes.ts
└── services/          # Business logic services
    ├── CostEngine.ts
    ├── CostModifierStrategy.ts  # Strategy pattern for cost modifiers
    ├── DataRepository.ts
    ├── ValidationService.ts
    └── WarbandService.ts
```

### Frontend Components

- **WarbandList**: Displays all saved warbands with load/delete actions
- **WarbandEditor**: Orchestrates warband editing with sub-components
- **WeirdoEditor**: Orchestrates weirdo editing with sub-components

**Frontend Directory Structure:**
```
src/frontend/
├── components/
│   ├── common/        # Reusable UI components
│   │   ├── ItemList.tsx
│   │   ├── SelectWithCost.tsx
│   │   └── ValidationErrorDisplay.tsx
│   ├── WarbandEditor.tsx
│   ├── WarbandProperties.tsx
│   ├── WarbandCostDisplay.tsx
│   ├── WeirdosList.tsx
│   ├── WeirdoCard.tsx
│   ├── WeirdoEditor.tsx
│   ├── WeirdoBasicInfo.tsx
│   ├── WeirdoCostDisplay.tsx
│   ├── AttributeSelector.tsx
│   ├── WeaponSelector.tsx
│   ├── EquipmentSelector.tsx
│   ├── PsychicPowerSelector.tsx
│   └── LeaderTraitSelector.tsx
├── contexts/          # React Context providers
│   ├── GameDataContext.tsx
│   └── WarbandContext.tsx
└── services/          # Frontend services
    └── apiClient.ts
```

### Data Flow

1. User interacts with React components
2. Components use Context API for shared state (GameDataContext, WarbandContext)
3. API client makes requests to Express backend
4. Backend services process requests using Strategy pattern for cost modifiers
5. DataRepository manages in-memory data
6. JSON files provide persistence

## Common Tasks

### Adding a New Component

1. Create component file in `src/frontend/components/`
2. Define TypeScript interfaces for props
3. Implement component with proper types
4. Create test file with `renderWithProviders`
5. Write unit tests and property tests
6. Update parent components to use new component

### Adding a New Service

1. Create service file in `src/backend/services/`
2. Define service class with methods
3. Add proper TypeScript types
4. Create test file
5. Write unit tests for methods
6. Write property tests for invariants
7. Update dependent services

### Adding a New API Endpoint

1. Create route handler in `src/backend/routes/`
2. Implement request validation
3. Call appropriate service methods
4. Return proper response format
5. Add error handling
6. Create integration tests
7. Update API documentation

## Documentation

### Code Documentation

- Document public APIs and interfaces
- Add JSDoc comments for functions
- Include examples where helpful
- Keep comments up to date

### Project Documentation

- Update README.md for user-facing changes
- Update TESTING.md for test-related changes
- Update this file for process changes
- Keep spec documents synchronized

## Migration Guide for Refactored Code

If you're working with code that was written before the refactoring, here's how to migrate:

### Backend Migration

#### 1. Replace Magic Numbers with Constants

**Before:**
```typescript
if (weapon.type === 'ranged') {
  cost -= 1;  // Magic number
}
```

**After:**
```typescript
import { DISCOUNT_VALUES } from '../constants/costs';

if (weapon.type === 'ranged') {
  cost -= DISCOUNT_VALUES.HEAVILY_ARMED_DISCOUNT;
}
```

#### 2. Use Centralized Validation Messages

**Before:**
```typescript
errors.push({
  field: 'name',
  message: 'Warband name is required',  // Hardcoded string
  code: 'WARBAND_NAME_REQUIRED'
});
```

**After:**
```typescript
import { VALIDATION_MESSAGES, ValidationErrorCode } from '../constants/validationMessages';

errors.push({
  field: 'name',
  message: VALIDATION_MESSAGES.WARBAND_NAME_REQUIRED,
  code: 'WARBAND_NAME_REQUIRED' as ValidationErrorCode
});
```

#### 3. Use Strategy Pattern for Cost Modifiers

**Before:**
```typescript
let cost = weapon.baseCost;
if (warband.ability === 'Mutants' && isMutantWeapon(weapon)) {
  cost -= 1;
} else if (warband.ability === 'Heavily Armed' && weapon.type === 'ranged') {
  cost -= 1;
}
```

**After:**
```typescript
import { createCostModifierStrategy } from './CostModifierStrategy';

const strategy = createCostModifierStrategy(warband.ability);
const cost = strategy.applyWeaponDiscount(weapon);
```

### Frontend Migration

#### 1. Replace Prop Drilling with Context

**Before:**
```typescript
function App() {
  const [gameData, setGameData] = useState(null);
  return <WarbandEditor gameData={gameData} />;
}

function WarbandEditor({ gameData }) {
  return <WeirdoEditor gameData={gameData} />;
}

function WeirdoEditor({ gameData }) {
  // Use gameData
}
```

**After:**
```typescript
function App() {
  return (
    <GameDataProvider>
      <WarbandEditor />
    </GameDataProvider>
  );
}

function WarbandEditor() {
  return <WeirdoEditor />;
}

function WeirdoEditor() {
  const { data } = useGameData();
  // Use data
}
```

#### 2. Split Large Components

**Before:**
```typescript
function WarbandEditor() {
  // 500+ lines of code handling:
  // - Warband properties
  // - Cost display
  // - Weirdos list
  // - Validation
}
```

**After:**
```typescript
function WarbandEditor() {
  return (
    <>
      <WarbandProperties />
      <WarbandCostDisplay />
      <WeirdosList />
      <ValidationErrorDisplay />
    </>
  );
}

// Each sub-component in separate file
function WarbandProperties() { /* ... */ }
function WarbandCostDisplay() { /* ... */ }
function WeirdosList() { /* ... */ }
```

#### 3. Use Reusable Components

**Before:**
```typescript
<select value={weapon} onChange={handleChange}>
  {weapons.map(w => (
    <option key={w.id} value={w.name}>
      {w.name} ({w.baseCost} pts)
    </option>
  ))}
</select>
```

**After:**
```typescript
<SelectWithCost
  id="weapon"
  label="Weapon"
  value={weapon}
  options={weapons.map(w => ({
    value: w.name,
    label: w.name,
    baseCost: w.baseCost
  }))}
  onChange={handleChange}
/>
```

#### 4. Add Performance Optimizations

**Before:**
```typescript
function WeirdoEditor({ weirdo, onUpdate }) {
  const totalCost = calculateTotalCost(weirdo);  // Recalculated every render
  
  const handleUpdate = (field, value) => {  // New function every render
    onUpdate({ ...weirdo, [field]: value });
  };
  
  return <AttributeSelector onChange={handleUpdate} />;
}
```

**After:**
```typescript
function WeirdoEditor({ weirdo, onUpdate }) {
  const totalCost = useMemo(() => 
    calculateTotalCost(weirdo), 
    [weirdo]
  );
  
  const handleUpdate = useCallback((field, value) => {
    onUpdate({ ...weirdo, [field]: value });
  }, [weirdo, onUpdate]);
  
  return <AttributeSelector onChange={handleUpdate} />;
}
```

### Testing Migration

#### Update Test Imports

**Before:**
```typescript
import { render } from '@testing-library/react';

test('renders component', () => {
  render(<MyComponent />);
});
```

**After:**
```typescript
import { renderWithProviders } from './testHelpers';

test('renders component', () => {
  renderWithProviders(<MyComponent />);
});
```

### Common Migration Issues

**Issue: Component breaks after removing props**
- Solution: Wrap component tree with appropriate Context providers

**Issue: Tests fail after refactoring**
- Solution: Use `renderWithProviders` instead of `render`
- Ensure test mocks include Context values

**Issue: TypeScript errors with constants**
- Solution: Use `as const` assertion for constant objects
- Import types from centralized locations

**Issue: Performance regressions**
- Solution: Add `useMemo` for expensive calculations
- Add `useCallback` for callback props
- Use `React.memo` for frequently re-rendered components

## Getting Help

### Resources

- [Core Project Info](.kiro/steering/core-project-info.md) - Technology stack and code style
- [Task Execution Standards](.kiro/steering/task-execution-standards.md) - Testing and execution guidelines
- [Spec Creation Standards](.kiro/steering/spec-creation-standards.md) - Requirements and design methodology
- [Efficient Testing Practices](.kiro/steering/efficient-testing.md) - Token-efficient testing strategies
- [Testing Guide](TESTING.md) - Comprehensive testing documentation
- [Spec Documentation](.kiro/specs/) - Feature specifications
- [Working with Specs](.kiro/specs/WORKING-WITH-SPECS.md) - Guide to creating and executing specs

### Questions

If you have questions:

1. Check existing documentation
2. Review similar code in the project
3. Look at test examples
4. Open an issue for discussion

## Refactoring Guidelines

### When to Refactor

Refactor code when you encounter:

- **Code Duplication**: Similar logic repeated in multiple places
- **Magic Numbers**: Hardcoded values without clear meaning
- **Large Functions/Components**: Functions over 50 lines or components over 300 lines
- **Deep Prop Drilling**: Props passed through 3+ component levels
- **Complex Conditionals**: Nested if/else statements that are hard to follow
- **Poor Type Safety**: Use of `any` type or loose type definitions

### Design Patterns Used

This project uses several design patterns to improve code quality:

#### Strategy Pattern (Backend)

Used for cost calculation with warband ability modifiers.

**When to use:**
- Multiple algorithms for the same operation
- Behavior varies based on configuration
- Need to add new behaviors without modifying existing code

**Example:**
```typescript
// Define strategy interface
interface CostModifierStrategy {
  applyWeaponDiscount(weapon: Weapon): number;
  applyEquipmentDiscount(equipment: Equipment): number;
}

// Implement concrete strategies
class MutantsCostStrategy implements CostModifierStrategy {
  applyWeaponDiscount(weapon: Weapon): number {
    // Mutants-specific logic
  }
}

// Use factory to create strategy
const strategy = createCostModifierStrategy(warband.ability);
const cost = strategy.applyWeaponDiscount(weapon);
```

#### Context Pattern (Frontend)

Used for sharing state across components without prop drilling.

**When to use:**
- Data needed by many components at different nesting levels
- Avoid passing props through intermediate components
- Centralize state management

**Example:**
```typescript
// Create context and provider
export function GameDataProvider({ children }) {
  const [data, setData] = useState(null);
  return (
    <GameDataContext.Provider value={{ data }}>
      {children}
    </GameDataContext.Provider>
  );
}

// Use custom hook to access context
export function useGameData() {
  const context = useContext(GameDataContext);
  if (!context) throw new Error('Must be used within provider');
  return context;
}

// Consume in components
function MyComponent() {
  const { data } = useGameData();
  // Use data without prop drilling
}
```

#### Component Composition (Frontend)

Used for breaking large components into smaller, focused sub-components.

**When to use:**
- Component exceeds 300 lines
- Component has multiple distinct responsibilities
- Need to improve testability

**Example:**
```typescript
// Before: Large monolithic component
function WarbandEditor() {
  // 500+ lines of code
}

// After: Composed from sub-components
function WarbandEditor() {
  return (
    <>
      <WarbandProperties />
      <WarbandCostDisplay />
      <WeirdosList />
    </>
  );
}
```

### Centralized Constants

All magic numbers and repeated strings should be extracted to constants.

**Guidelines:**
- Create constants in `src/backend/constants/` or at module level
- Use `as const` for type safety
- Group related constants together
- Export with descriptive names

**Example:**
```typescript
// Bad: Magic numbers in code
if (cost >= 18 && cost <= 19) {
  showWarning();
}

// Good: Named constants
export const TROOPER_LIMITS = {
  WARNING_THRESHOLD: 18,
  STANDARD_LIMIT: 20,
} as const;

if (cost >= TROOPER_LIMITS.WARNING_THRESHOLD && 
    cost < TROOPER_LIMITS.STANDARD_LIMIT) {
  showWarning();
}
```

### Type Safety Best Practices

**Use Discriminated Unions:**
```typescript
// Derive types from constants
export const VALIDATION_MESSAGES = {
  WARBAND_NAME_REQUIRED: 'Warband name is required',
  INVALID_POINT_LIMIT: 'Point limit must be 75 or 125',
} as const;

export type ValidationErrorCode = keyof typeof VALIDATION_MESSAGES;
```

**Avoid `any` Type:**
```typescript
// Bad
function processData(data: any) { }

// Good
function processData(data: Warband | Weirdo) { }
```

**Use Strict Interfaces:**
```typescript
interface ComponentProps {
  id: string;
  name: string;
  onUpdate: (value: string) => void;
  disabled?: boolean;  // Optional props marked explicitly
}
```

### Performance Optimization Guidelines

**Use `useMemo` for Expensive Calculations:**
```typescript
const totalCost = useMemo(() => {
  return weirdos.reduce((sum, w) => sum + w.totalCost, 0);
}, [weirdos]);
```

**Use `useCallback` for Callback Props:**
```typescript
const handleUpdate = useCallback((id: string, value: string) => {
  updateWeirdo(id, { name: value });
}, [updateWeirdo]);
```

**Use `React.memo` for Frequently Re-rendered Components:**
```typescript
export const SelectWithCost = React.memo(function SelectWithCost(props) {
  // Component implementation
});
```

### Refactoring Checklist

Before submitting refactored code, verify:

- [ ] All magic numbers extracted to constants
- [ ] No code duplication (DRY principle)
- [ ] Functions are single-purpose and focused
- [ ] Components are under 300 lines
- [ ] No prop drilling beyond 2 levels
- [ ] Proper TypeScript types (no `any`)
- [ ] JSDoc comments on public functions
- [ ] All existing tests still pass
- [ ] New tests added for refactored code
- [ ] Performance optimizations applied where appropriate

## Code Review

### Review Criteria

Code reviews focus on:

- Correctness and functionality
- Code quality and maintainability
- Test coverage and quality
- Documentation completeness
- Adherence to project standards

### Review Process

1. Reviewer checks code against standards
2. Reviewer runs tests locally
3. Reviewer provides constructive feedback
4. Author addresses feedback
5. Reviewer approves when satisfied

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

## Thank You!

Your contributions help make this project better. We appreciate your time and effort!
