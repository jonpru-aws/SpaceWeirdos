# API Documentation

## Overview

The Space Weirdos Warband Builder uses a RESTful API for all frontend-backend communication. The API provides endpoints for cost calculation, validation, and warband management with comprehensive error handling and type safety.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required for API endpoints.

## Response Format

All API responses follow a consistent structure:

```typescript
// Success Response
{
  success: true,
  data: T // Response data
}

// Error Response
{
  success: false,
  error: {
    message: string,
    code?: string,
    details?: any
  }
}
```

## Endpoints

### Cost Calculation

#### POST /api/cost/calculate

Calculates real-time cost for a weirdo with context-aware warnings.

**Request Body:**
```typescript
{
  weirdoType: 'leader' | 'trooper',
  attributes: {
    speed: 1 | 2 | 3,
    defense: '2d6' | '2d8' | '2d10',
    firepower: 'None' | '2d8' | '2d10',
    prowess: '2d6' | '2d8' | '2d10',
    willpower: '2d6' | '2d8' | '2d10'
  },
  weapons: {
    close: Weapon[],
    ranged: Weapon[]
  },
  equipment: Equipment[],
  psychicPowers: PsychicPower[],
  warbandAbility?: 'Heavily Armed' | 'Mutants' | 'Soldiers' | 'Cyborgs'
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    totalCost: number,
    breakdown: {
      attributes: number,
      weapons: number,
      equipment: number,
      psychicPowers: number
    },
    warnings: string[], // Context-aware warnings from ValidationService
    isApproachingLimit: boolean, // Derived from warnings
    isOverLimit: boolean
  }
}
```

**Warning Logic:**
- Uses backend ValidationService for context-aware warnings
- Considers warband composition (25-point weirdo existence)
- Warns within 3 points of applicable limits
- Provides clear messaging about which limits apply

### Validation

#### POST /api/validation/weirdo

Validates a weirdo with comprehensive rule checking and context-aware warnings.

**Request Body:**
```typescript
{
  weirdo: Weirdo,
  warband?: Warband // Optional warband context for full validation
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    valid: boolean,
    errors: ValidationError[],
    warnings: ValidationWarning[] // Context-aware warnings
  }
}
```

**Validation Types:**
```typescript
interface ValidationError {
  field: string,
  message: string,
  code: string
}

interface ValidationWarning {
  field: string,
  message: string,
  code: string
}
```

#### POST /api/validation/warband

Validates a complete warband with all rules and constraints.

**Request Body:**
```typescript
{
  warband: Warband
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    valid: boolean,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  }
}
```

### Warband Management

#### GET /api/warbands

Retrieve all saved warbands.

**Response:**
```typescript
{
  success: true,
  data: {
    warbands: WarbandSummary[]
  }
}
```

#### GET /api/warbands/:id

Retrieve a specific warband by ID.

**Response:**
```typescript
{
  success: true,
  data: {
    warband: Warband
  }
}
```

#### POST /api/warbands

Create a new warband.

**Request Body:**
```typescript
{
  warband: Omit<Warband, 'id' | 'createdAt' | 'updatedAt'>
}
```

#### PUT /api/warbands/:id

Update an existing warband.

**Request Body:**
```typescript
{
  warband: Warband
}
```

#### DELETE /api/warbands/:id

Delete a warband.

**Response:**
```typescript
{
  success: true,
  data: {
    message: 'Warband deleted successfully'
  }
}
```

## Error Codes

### Validation Error Codes
- `REQUIRED_FIELD`: Missing required field
- `INVALID_VALUE`: Value outside allowed range
- `WEAPON_REQUIRED`: Missing required weapon
- `EQUIPMENT_LIMIT`: Too many equipment items
- `COST_EXCEEDED`: Point cost too high
- `INVALID_TRAIT`: Leader trait on trooper
- `WARBAND_INVALID`: Warband structure violation

### Warning Codes
- `COST_APPROACHING_LIMIT`: Weirdo cost within 3 points of applicable limit

### HTTP Error Codes
- `400`: Bad Request - Invalid request data
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

## Context-Aware Warning System

### Warning Generation Logic

The API uses the backend `ValidationService` to generate context-aware warnings:

1. **No 25-point weirdo exists**: Warns at 18-20 (20-limit) and 23-25 (25-limit)
2. **25-point weirdo exists (different weirdo)**: Warns at 18-20 only
3. **25-point weirdo exists (same weirdo)**: Warns at 23-25 only

### Warning Messages

- `"Cost is within X points of the 20-point limit"`
- `"Cost is within X points of the 25-point limit (premium weirdo slot)"`
- `"Cost is within X points of the 25-point limit"`

### Integration Notes

- Frontend should use `isApproachingLimit` flag for UI state
- Display `warnings` array for user feedback
- Warnings don't block actions (unlike errors)
- Real-time endpoints provide immediate feedback

## Performance

### Caching
- Cost calculations are cached for performance
- Cache invalidation on warband changes
- Sub-100ms response times for real-time endpoints

### Rate Limiting
- Currently no rate limiting implemented
- Consider implementing for production use

## Type Definitions

Full TypeScript type definitions are available in:
- `src/backend/models/types.ts` - Backend types
- `src/frontend/services/apiTypes.ts` - API request/response types

## Examples

### Real-time Cost Calculation

```javascript
// Calculate cost for a 19-point trooper
const response = await fetch('/api/cost/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    weirdoType: 'trooper',
    attributes: {
      speed: 3,
      defense: '2d8',
      firepower: '2d8',
      prowess: '2d8',
      willpower: '2d8'
    },
    weapons: { close: [unarmedWeapon], ranged: [] },
    equipment: [],
    psychicPowers: [],
    warbandAbility: null
  })
});

const result = await response.json();
// result.data.totalCost = 19
// result.data.warnings = ["Cost is within 1 point of the 20-point limit"]
// result.data.isApproachingLimit = true
```

### Weirdo Validation

```javascript
// Validate a weirdo with warband context
const response = await fetch('/api/validation/weirdo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    weirdo: myWeirdo,
    warband: myWarband
  })
});

const result = await response.json();
// result.data.valid = true
// result.data.errors = []
// result.data.warnings = ["Cost is within 2 points of the 25-point limit"]
```

This API provides a robust foundation for building Space Weirdos warbands with intelligent validation and context-aware feedback!
