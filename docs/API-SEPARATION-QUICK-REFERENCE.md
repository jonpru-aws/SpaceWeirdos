# Frontend-Backend API Separation - Quick Reference

## Import Rules

### ✅ Allowed
```typescript
// Type-only imports
import type { Warband, Weirdo, WarbandAbility } from '../../backend/models/types';
```

### ❌ Prohibited
```typescript
// Backend services, repositories, or business logic
import { CostEngine } from '../../backend/services/CostEngine';
import { ValidationService } from '../../backend/services/ValidationService';
import { TROOPER_LIMITS } from '../../backend/constants/costs';
```

## Cost Calculation Hooks

### Complete Weirdo Cost
```typescript
import { useCostCalculation } from '../hooks/useCostCalculation';

const { totalCost, breakdown, warnings, isLoading, error } = useCostCalculation({
  weirdoType: 'leader',
  attributes: { speed: 5, defense: '4+', ... },
  weapons: { close: ['Sword'], ranged: ['Pistol'] },
  equipment: ['Shield'],
  psychicPowers: [],
  warbandAbility: null
});
```

### Individual Item Cost
```typescript
import { useItemCost } from '../hooks/useItemCost';

const { cost, isLoading, error } = useItemCost({
  itemType: 'weapon',
  itemName: 'Sword',
  warbandAbility: null,
  weaponType: 'close'
});
```

## API Client

```typescript
import { apiClient } from '../services/apiClient';

// Single cost calculation
const result = await apiClient.calculateCost({
  weirdoType: 'leader',
  attributes: { ... },
  weapons: { ... },
  equipment: [ ... ],
  psychicPowers: [ ... ],
  warbandAbility: null
});

// Batch cost calculation
const batchResult = await apiClient.calculateBatchCosts({
  items: [
    { id: 'sword', type: 'weapon', name: 'Sword', weaponType: 'close' },
    { id: 'shield', type: 'equipment', name: 'Shield' }
  ],
  warbandAbility: null
});
```

## Performance Settings

- **Cache TTL:** 5 seconds
- **Cache Size:** 100 entries (LRU eviction)
- **Debounce Delay:** 300ms
- **Target API Response:** <100ms
- **Target UI Update:** <200ms

## Common Patterns

### Selector Component
```typescript
function WeaponOption({ weapon, warbandAbility, weaponType }) {
  const { cost, isLoading } = useItemCost({
    itemType: 'weapon',
    itemName: weapon.name,
    warbandAbility,
    weaponType
  });
  
  return (
    <option value={weapon.name}>
      {weapon.name} ({isLoading ? '...' : `${cost} pts`})
    </option>
  );
}
```

### Cost Display Component
```typescript
function WeirdoCostDisplay({ weirdo, warbandAbility }) {
  const { totalCost, breakdown, isLoading, error } = useCostCalculation({
    weirdoType: weirdo.type,
    attributes: weirdo.attributes,
    weapons: weirdo.weapons,
    equipment: weirdo.equipment,
    psychicPowers: weirdo.psychicPowers,
    warbandAbility
  });
  
  if (isLoading) return <div>Calculating...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <div>Total: {totalCost} pts</div>
      <div>Attributes: {breakdown.attributes} pts</div>
      <div>Weapons: {breakdown.weapons} pts</div>
      <div>Equipment: {breakdown.equipment} pts</div>
      <div>Psychic Powers: {breakdown.psychicPowers} pts</div>
    </div>
  );
}
```

## Error Handling

```typescript
const { cost, isLoading, error } = useItemCost({ ... });

if (error) {
  // Display user-friendly error message
  return <div className="error">Unable to calculate cost</div>;
}

if (isLoading) {
  // Show loading indicator
  return <div>Calculating...</div>;
}

// Display cost
return <div>{cost} pts</div>;
```

## Cache Invalidation

Cache is automatically invalidated when warband ability changes. No manual intervention needed.

```typescript
// WarbandContext handles this automatically
const updateAbility = (newAbility) => {
  setAbility(newAbility);
  // Cache is automatically cleared
};
```

## Testing

```typescript
import { describe, test, expect, vi } from 'vitest';
import { renderWithProviders } from './testHelpers';
import { apiClient } from '../services/apiClient';

test('should use API for cost calculation', async () => {
  const spy = vi.spyOn(apiClient, 'calculateCost');
  
  renderWithProviders(<MyComponent />);
  
  await waitFor(() => {
    expect(spy).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Too many API calls
- Extract item rendering to separate component
- Ensure hooks are not created in loops
- Check that cache is working

### Costs not updating
- Verify cache invalidation on ability change
- Check that params are changing correctly
- Ensure hooks are receiving updated props

### Loading state stuck
- Check for API errors
- Verify error handling is implemented
- Check network tab for failed requests

### TypeScript errors
- Use `import type` for backend types
- Don't import backend services
- Check that types are exported correctly

## Resources

- [Complete Guide](./API_SEPARATION_GUIDE.md)
- [Requirements](./requirements.md)
- [Design](./design.md)
- [Tasks](./tasks.md)
