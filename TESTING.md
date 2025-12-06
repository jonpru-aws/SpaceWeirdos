# Testing Guide

This guide provides comprehensive documentation for testing in the Space Weirdos Warband Builder project.

## Overview

The project uses a dual testing approach:
- **Unit Tests**: Verify specific examples and edge cases
- **Property-Based Tests**: Verify universal properties across all inputs

Both test types complement each other for comprehensive coverage.

## Test Infrastructure

### Test Helper Utilities

The project provides reusable test helpers in `tests/testHelpers.tsx` for consistent test setup.

#### renderWithProviders

Renders a component wrapped with all required context providers (GameDataProvider).

**Usage:**

```typescript
import { renderWithProviders } from './testHelpers';
import { screen } from '@testing-library/react';
import { MyComponent } from '../src/frontend/components/MyComponent';

test('should render component with context', () => {
  renderWithProviders(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

**With Custom Game Data:**

```typescript
import { renderWithProviders, createMockGameData } from './testHelpers';

test('should render with custom game data', () => {
  const customGameData = createMockGameData();
  customGameData.closeCombatWeapons.push({
    id: 'custom-weapon',
    name: 'Custom Weapon',
    type: 'close',
    baseCost: 5,
    maxActions: 2,
    notes: 'Custom weapon for testing'
  });

  renderWithProviders(<MyComponent />, { gameData: customGameData });
  expect(screen.getByText('Custom Weapon')).toBeInTheDocument();
});
```

#### createMockGameData

Creates complete mock game data for testing.

**Usage:**

```typescript
import { createMockGameData } from './testHelpers';

test('should work with game data', () => {
  const gameData = createMockGameData();
  
  // Use mock data in your test
  expect(gameData.closeCombatWeapons).toHaveLength(2);
  expect(gameData.rangedWeapons).toHaveLength(2);
  expect(gameData.equipment).toHaveLength(2);
});
```

**Mock Data Structure:**

The mock game data includes:
- 2 close combat weapons (Unarmed, Melee Weapon)
- 2 ranged weapons (Auto Pistol, Auto Rifle)
- 2 equipment items (Cybernetics, Grenade)
- 2 psychic powers (Fear, Healing)
- 2 leader traits (Bounty Hunter, Healer)
- 2 warband abilities (Cyborgs, Soldiers)
- Complete attribute cost tables for all 5 attributes

#### createMockWarband

Creates a mock warband for testing.

**Usage:**

```typescript
import { createMockWarband } from './testHelpers';

test('should work with warband', () => {
  const warband = createMockWarband();
  
  expect(warband.name).toBe('Test Warband');
  expect(warband.ability).toBe('Cyborgs');
  expect(warband.pointLimit).toBe(75);
});
```

**With Overrides:**

```typescript
import { createMockWarband, createMockWeirdo } from './testHelpers';

test('should work with custom warband', () => {
  const warband = createMockWarband({
    name: 'Custom Warband',
    pointLimit: 125,
    weirdos: [
      createMockWeirdo('leader'),
      createMockWeirdo('trooper')
    ]
  });
  
  expect(warband.name).toBe('Custom Warband');
  expect(warband.pointLimit).toBe(125);
  expect(warband.weirdos).toHaveLength(2);
});
```

#### createMockWeirdo

Creates a mock weirdo (leader or trooper) for testing.

**Usage:**

```typescript
import { createMockWeirdo } from './testHelpers';

test('should work with leader', () => {
  const leader = createMockWeirdo('leader');
  
  expect(leader.type).toBe('leader');
  expect(leader.name).toBe('Test Leader');
});

test('should work with trooper', () => {
  const trooper = createMockWeirdo('trooper');
  
  expect(trooper.type).toBe('trooper');
  expect(trooper.name).toBe('Test Trooper');
});
```

**With Overrides:**

```typescript
import { createMockWeirdo } from './testHelpers';

test('should work with custom weirdo', () => {
  const weirdo = createMockWeirdo('leader', {
    name: 'Custom Leader',
    attributes: {
      speed: 3,
      defense: '2d10',
      firepower: '2d10',
      prowess: '2d10',
      willpower: '2d10'
    },
    closeCombatWeapons: ['melee-weapon'],
    rangedWeapons: ['auto-rifle'],
    equipment: ['cybernetics'],
    leaderTrait: 'Bounty Hunter'
  });
  
  expect(weirdo.name).toBe('Custom Leader');
  expect(weirdo.attributes.speed).toBe(3);
  expect(weirdo.leaderTrait).toBe('Bounty Hunter');
});
```

## Test Setup Patterns

### Testing React Components

**Basic Component Test:**

```typescript
import { describe, test, expect } from 'vitest';
import { renderWithProviders } from './testHelpers';
import { screen } from '@testing-library/react';
import { MyComponent } from '../src/frontend/components/MyComponent';

describe('MyComponent', () => {
  test('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
```

**Component with User Interactions:**

```typescript
import { describe, test, expect } from 'vitest';
import { renderWithProviders } from './testHelpers';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../src/frontend/components/MyComponent';

describe('MyComponent interactions', () => {
  test('should handle button click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyComponent />);
    
    const button = screen.getByRole('button', { name: 'Click Me' });
    await user.click(button);
    
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Testing Services

**Service Unit Test:**

```typescript
import { describe, test, expect } from 'vitest';
import { MyService } from '../src/backend/services/MyService';

describe('MyService', () => {
  test('should perform calculation', () => {
    const service = new MyService();
    const result = service.calculate(5, 10);
    expect(result).toBe(15);
  });
});
```

### Property-Based Testing

Property-based tests verify universal properties across many randomly generated inputs.

**Basic Property Test:**

```typescript
import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { MyService } from '../src/backend/services/MyService';

describe('MyService property tests', () => {
  /**
   * Feature: my-feature, Property 1: Addition is commutative
   * Validates: Requirements 2.1
   */
  test('addition should be commutative', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer(),
        (a, b) => {
          const service = new MyService();
          return service.add(a, b) === service.add(b, a);
        }
      ),
      { numRuns: 50 } // Minimum 50 iterations
    );
  });
});
```

**Property Test with Custom Generators:**

```typescript
import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { CostEngine } from '../src/backend/services/CostEngine';

describe('CostEngine property tests', () => {
  /**
   * Feature: space-weirdos-warband, Property 4: Attribute costs are calculated correctly
   * Validates: Requirements 2.3-2.17, 7.2, 8.2
   */
  test('attribute costs should match lookup table', () => {
    // Custom generator for valid attribute values
    const attributeGen = fc.record({
      speed: fc.integer({ min: 1, max: 3 }),
      defense: fc.constantFrom('2d6', '2d8', '2d10'),
      firepower: fc.constantFrom('None', '2d8', '2d10'),
      prowess: fc.constantFrom('2d6', '2d8', '2d10'),
      willpower: fc.constantFrom('2d6', '2d8', '2d10')
    });

    fc.assert(
      fc.property(attributeGen, (attributes) => {
        const costEngine = new CostEngine();
        const cost = costEngine.calculateAttributeCost(attributes);
        return cost >= 0; // Cost should never be negative
      }),
      { numRuns: 50 }
    );
  });
});
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- tests/MyComponent.test.tsx
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Only Property-Based Tests

```bash
npm run test:property
```

### Run Tests with Minimal Output

```bash
npm test -- tests/MyComponent.test.tsx --reporter=dot --silent
```

## Best Practices

### 1. Always Use Test Helpers for Components

❌ **Don't:**
```typescript
import { render } from '@testing-library/react';

test('should render', () => {
  render(<MyComponent />); // Missing context providers!
});
```

✅ **Do:**
```typescript
import { renderWithProviders } from './testHelpers';

test('should render', () => {
  renderWithProviders(<MyComponent />);
});
```

### 2. Use Mock Data Helpers for Consistency

❌ **Don't:**
```typescript
test('should work with warband', () => {
  const warband = {
    id: '1',
    name: 'Test',
    // Missing required fields...
  };
});
```

✅ **Do:**
```typescript
import { createMockWarband } from './testHelpers';

test('should work with warband', () => {
  const warband = createMockWarband({ name: 'Custom Name' });
});
```

### 3. Tag Property-Based Tests

Always include a comment linking property tests to the design document:

```typescript
/**
 * Feature: {feature_name}, Property {number}: {property_text}
 * Validates: Requirements {requirement_ids}
 */
test('property test name', () => {
  // Test implementation
});
```

### 4. Configure Sufficient Iterations

Property-based tests should run at least 50 iterations:

```typescript
fc.assert(
  fc.property(/* ... */),
  { numRuns: 50 } // Minimum 50 iterations
);
```

### 5. Use Descriptive Test Names

❌ **Don't:**
```typescript
test('test 1', () => { /* ... */ });
```

✅ **Do:**
```typescript
test('should calculate total cost including equipment modifiers', () => { /* ... */ });
```

### 6. Test One Thing Per Test

❌ **Don't:**
```typescript
test('should do everything', () => {
  // Test rendering
  // Test interactions
  // Test validation
  // Test cost calculation
});
```

✅ **Do:**
```typescript
test('should render correctly', () => { /* ... */ });
test('should handle user interactions', () => { /* ... */ });
test('should validate input', () => { /* ... */ });
test('should calculate cost', () => { /* ... */ });
```

## Common Testing Patterns

### Testing Validation

```typescript
import { describe, test, expect } from 'vitest';
import { ValidationService } from '../src/backend/services/ValidationService';
import { createMockWeirdo } from './testHelpers';

describe('ValidationService', () => {
  test('should validate weirdo has close combat weapon', () => {
    const service = new ValidationService();
    const weirdo = createMockWeirdo('trooper', {
      closeCombatWeapons: [] // Invalid: no weapons
    });
    
    const result = service.validateWeirdo(weirdo);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining('close combat weapon')
      })
    );
  });
});
```

### Testing Cost Calculations

```typescript
import { describe, test, expect } from 'vitest';
import { CostEngine } from '../src/backend/services/CostEngine';
import { createMockWeirdo } from './testHelpers';

describe('CostEngine', () => {
  test('should calculate weirdo total cost', () => {
    const costEngine = new CostEngine();
    const weirdo = createMockWeirdo('trooper', {
      attributes: {
        speed: 2,
        defense: '2d8',
        firepower: '2d8',
        prowess: '2d8',
        willpower: '2d8'
      }
    });
    
    const cost = costEngine.calculateWeirdoCost(weirdo, 'None');
    
    expect(cost).toBeGreaterThan(0);
    expect(typeof cost).toBe('number');
  });
});
```

### Testing UI Components with Context

```typescript
import { describe, test, expect } from 'vitest';
import { renderWithProviders, createMockWeirdo } from './testHelpers';
import { screen } from '@testing-library/react';
import { WeirdoEditor } from '../src/frontend/components/WeirdoEditor';

describe('WeirdoEditor', () => {
  test('should display weirdo name', () => {
    const weirdo = createMockWeirdo('leader', { name: 'Test Leader' });
    
    renderWithProviders(<WeirdoEditor weirdo={weirdo} />);
    
    expect(screen.getByDisplayValue('Test Leader')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Context Provider Errors

**Error:** "Cannot read property 'closeCombatWeapons' of undefined"

**Solution:** Use `renderWithProviders` instead of `render`:

```typescript
// Before
render(<MyComponent />);

// After
renderWithProviders(<MyComponent />);
```

### Property Test Failures

**Error:** Property test fails with counterexample

**Solution:** Analyze the counterexample to determine if:
1. The test has incorrect assumptions
2. The code has a bug
3. The specification needs clarification

### Mock Data Issues

**Error:** "Expected property X but got undefined"

**Solution:** Use helper functions with overrides:

```typescript
const weirdo = createMockWeirdo('leader', {
  // Add missing properties here
  leaderTrait: 'Bounty Hunter'
});
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [fast-check Documentation](https://fast-check.dev/)
- [Project Standards](.kiro/steering/project-standards.md)
- [Efficient Testing Practices](.kiro/steering/efficient-testing.md)

## Contributing

When adding new tests:

1. Use test helper utilities for consistency
2. Follow the dual testing approach (unit + property tests)
3. Tag property-based tests with design document references
4. Configure at least 50 iterations for property tests
5. Use descriptive test names
6. Test one thing per test
7. Keep tests maintainable and readable

For more details, see the project standards in `.kiro/steering/project-standards.md`.
