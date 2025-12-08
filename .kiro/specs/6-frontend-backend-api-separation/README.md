# Frontend-Backend API Separation Spec

## Overview

This spec documents the architectural separation between frontend and backend code in the Space Weirdos Warband Builder. All business logic resides in the backend, with the frontend communicating exclusively through API calls.

## Core Spec Files

- **[requirements.md](requirements.md)** - EARS-compliant requirements with acceptance criteria
- **[design.md](design.md)** - Detailed design with correctness properties
- **[tasks.md](tasks.md)** - Implementation task list (✅ Complete)

## Documentation

For detailed implementation documentation, see:

- **[Frontend-Backend API Separation Guide](../../../docs/FRONTEND-BACKEND-API-SEPARATION.md)** - Complete architecture and usage guide
  - Acceptable vs prohibited imports
  - API client usage patterns
  - Hook documentation with examples
  - Caching and debouncing strategies
  - Architecture diagrams
  - Migration guide from local calculations
  - Performance optimization tips
  - Testing strategies

- **[Quick Reference](../../../docs/API-SEPARATION-QUICK-REFERENCE.md)** - Quick reference for common patterns

## Status

✅ **Complete** - All tasks implemented and tested

### Problem Statement

The frontend previously contained `src/frontend/utils/costCalculations.ts` which duplicated backend cost calculation logic. This created:
- Maintenance burden (changes needed in two places)
- Potential for inconsistencies
- No single source of truth
- Violation of separation of concerns

### Solution

Centralize all business logic in the backend while maintaining responsive real-time updates through:
1. **API-based cost calculations** - All calculations performed by backend
2. **Smart caching** - Frontend caches identical calculation results (5s TTL, 100 entries max)
3. **Request debouncing** - Delays API calls during rapid user input (300ms)
4. **Optimistic UI updates** - Shows last known values while requests are in flight

### Key Features

**Cost Calculation Hooks:**
- `useCostCalculation` - Complete weirdo cost with breakdown
- `useItemCost` - Individual item costs (weapons, equipment, psychic powers)

Both hooks provide automatic caching, debouncing, loading/error states, and warband ability modifier support.

**Performance Targets:**
- Backend API response: <100ms ✅
- Frontend cost update: <200ms ✅
- Cache hit rate: >50% ✅
- Debounce effectiveness: >80% reduction in API calls ✅

## Quick Start

See the [Frontend-Backend API Separation Guide](../../../docs/FRONTEND-BACKEND-API-SEPARATION.md) for complete usage examples and patterns.

### Basic Hook Usage

```typescript
// Complete weirdo cost
import { useCostCalculation } from '../hooks/useCostCalculation';
const { totalCost, breakdown, isLoading, error } = useCostCalculation({ ... });

// Individual item cost
import { useItemCost } from '../hooks/useItemCost';
const { cost, isLoading, error } = useItemCost({ ... });
```

## Architecture

```
Frontend Components → Cost Calculation Hooks (caching + debouncing) 
  → API Client → Backend API Endpoints → CostEngine + CostModifierStrategy
```

## Rules

### ✅ DO
- Use type-only imports from backend
- Use API client for all backend communication
- Use cost calculation hooks in components
- Handle loading and error states

### ❌ DON'T
- Import backend services or business logic
- Duplicate cost calculations in frontend
- Make direct fetch calls
- Bypass the cache or implement custom debouncing

## Testing

- **Unit tests** - Verify API usage and component behavior
- **Property-based tests** - Verify no duplicate business logic
- **Integration tests** - Verify complete user flows

Run tests:
```bash
npm test -- tests/FrontendBackendSeparation.test.ts --reporter=dot
```

See [Frontend-Backend API Separation Guide](../../../docs/FRONTEND-BACKEND-API-SEPARATION.md#testing-the-separation) for complete testing documentation.

## Related Specs

- Spec 1: UI Design System
- Spec 2: Warband List & Navigation
- Spec 4: Weirdo Editor
- Spec 5: Real-time Feedback Polish
