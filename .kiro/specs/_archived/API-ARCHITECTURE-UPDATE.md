# API Architecture Update Summary

## Overview

All 5 UI specs have been updated to mandate that **all frontend-backend communication must use API calls**. The frontend must NOT directly import or use backend service classes.

## Updated Specs

### ✅ Spec 1: UI Design System
**Status**: No changes needed
**Reason**: This spec is purely about CSS design tokens and styling - no backend communication involved.

### ✅ Spec 2: Warband List & Navigation

**Requirements Changes:**
- Added **Requirement 7**: API Communication Architecture
  - 7 acceptance criteria covering RESTful API endpoints for warband CRUD operations
  - Prohibits direct imports of backend services
  - Mandates HTTP requests for all data operations

**Design Changes:**
- Updated data flow diagram to show API layer
- Added API endpoints section with RESTful endpoint specifications
- Added API client integration examples
- Updated implementation notes to emphasize API-first approach
- Added error handling for network failures

**API Endpoints:**
```
GET    /api/warbands           - Fetch all warbands
GET    /api/warbands/:id       - Fetch single warband
POST   /api/warbands           - Create new warband
PUT    /api/warbands/:id       - Update warband
DELETE /api/warbands/:id       - Delete warband
```

### ✅ Spec 3: Warband Properties Editor

**Requirements Changes:**
- Added **Requirement 6**: API Communication Architecture
  - 6 acceptance criteria covering validation and save operations via API
  - Prohibits direct imports of ValidationService and DataRepository
  - Mandates HTTP requests for validation and persistence

**Design Changes:**
- Updated dependencies to reference backend API instead of direct services
- Added API endpoints section with validation and save endpoints
- Added request/response examples
- Updated implementation notes for API communication patterns

**API Endpoints:**
```
GET    /api/game-data/warband-abilities  - Fetch warband abilities
POST   /api/validation/warband            - Validate warband properties
PUT    /api/warbands/:id                  - Save warband changes
```

### ✅ Spec 4: Weirdo Editor

**Requirements Changes:**
- Added **Requirement 9**: API Communication Architecture
  - 7 acceptance criteria covering game data, cost calculations, and validation via API
  - Prohibits direct imports of CostEngine, ValidationService, and DataRepository
  - Mandates HTTP requests for all weirdo operations

**Design Changes:**
- Updated dependencies to reference backend API
- Added comprehensive API endpoints section with 8 endpoints
- Added detailed request/response examples for cost calculations
- Updated implementation notes to emphasize API-first approach
- Added caching strategy for game data

**API Endpoints:**
```
GET    /api/game-data/attributes          - Fetch attribute options
GET    /api/game-data/weapons/close       - Fetch close combat weapons
GET    /api/game-data/weapons/ranged      - Fetch ranged weapons
GET    /api/game-data/equipment           - Fetch equipment options
GET    /api/game-data/psychic-powers      - Fetch psychic powers
GET    /api/game-data/leader-traits       - Fetch leader traits
POST   /api/cost/calculate                - Calculate weirdo cost
POST   /api/validation/weirdo             - Validate weirdo configuration
```

### ✅ Spec 5: Real-time Feedback & Polish

**Requirements Changes:**
- Added **Requirement 6**: API Communication Architecture
  - 7 acceptance criteria covering real-time cost calculations and validation via API
  - Prohibits direct imports of CostEngine and ValidationService
  - Mandates HTTP requests with 100ms response time requirement
  - Requires cost breakdown responses from backend

**Design Changes:**
- Updated dependencies to reference backend API
- Added API endpoints section with performance requirements
- Added detailed real-time cost calculation request/response examples
- Updated implementation notes with debouncing and caching strategies
- Added performance optimization guidance for API calls

**API Endpoints:**
```
POST   /api/cost/calculate                - Calculate costs with breakdown
POST   /api/validation/warband            - Validate complete warband
POST   /api/validation/weirdo             - Validate individual weirdo
```

## Key Architectural Principles

### Frontend Responsibilities
- Use `apiClient` service for all HTTP requests
- NEVER directly import backend services (CostEngine, ValidationService, DataRepository, WarbandService)
- Handle API responses (success and error cases)
- Implement client-side caching where appropriate
- Debounce API calls to reduce network traffic
- Display user-friendly error messages for API failures

### Backend Responsibilities
- Expose RESTful API endpoints for all operations
- Handle validation and business logic server-side
- Return structured responses with consistent format
- Optimize endpoints for performance (< 100ms for cost calculations)
- Provide detailed error messages
- Return cost breakdowns and validation errors

### API Response Format
```typescript
// Success response
{
  success: true,
  data: T
}

// Error response
{
  success: false,
  error: {
    message: string,
    code: string
  }
}
```

## Benefits of This Architecture

1. **Separation of Concerns**: Frontend and backend are properly decoupled
2. **Maintainability**: Changes to backend services don't break frontend
3. **Testability**: Frontend can be tested with mocked API responses
4. **Scalability**: Backend can be scaled independently
5. **Type Safety**: API contracts can be defined with TypeScript interfaces
6. **Error Handling**: Centralized error handling for network failures
7. **Caching**: API responses can be cached to improve performance

## Implementation Impact

### Files That Need Updates
- Frontend components must use `apiClient` instead of direct service imports
- Backend must expose new API endpoints
- Existing direct service calls must be refactored to API calls

### Testing Impact
- Unit tests can mock API responses
- Integration tests should test API endpoints
- Property-based tests remain focused on business logic

## Next Steps

1. Review and approve these architectural changes
2. Update task lists to reflect API-first implementation
3. Implement backend API endpoints
4. Refactor frontend to use API calls
5. Update tests to work with API architecture
