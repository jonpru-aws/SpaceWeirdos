# Task Updates Summary - API Architecture

## Overview

All 4 UI spec task files have been updated to reflect the new API-first architecture. Tasks have been added for implementing API endpoints, refactoring direct service calls to use API clients, and testing API integration.

## Updated Task Files

### ✅ Spec 2: Warband List & Navigation

**New Tasks Added:**
- **Task 1**: Set up API client for backend communication
  - 1.1: Create apiClient service with HTTP wrapper
  - 1.2: Define API response types

- **Task 3**: Refactor WarbandContext to use API calls
  - 3.1: Replace DataRepository calls with API endpoints
  - 3.2: Add API error handling

**Modified Tasks:**
- Updated all existing tasks to reference API calls instead of direct service imports
- Added API integration verification to final testing tasks
- Renumbered tasks to accommodate new API tasks

**Key Changes:**
- All warband CRUD operations now use RESTful API endpoints
- Added error handling for network failures
- Updated test requirements to verify API integration

---

### ✅ Spec 3: Warband Properties Editor

**New Tasks Added:**
- **Task 1**: Set up API integration for warband properties
  - 1.1: Add GET /api/game-data/warband-abilities endpoint
  - 1.2: Add POST /api/validation/warband endpoint
  - 1.3: Add PUT /api/warbands/:id endpoint

- **Task 4**: Refactor to use API for warband abilities
  - 4.1: Fetch warband abilities via API
  - 4.2: Write unit tests for API integration

- **Task 8**: Refactor save functionality to use API
  - 8.1: Replace ValidationService and DataRepository with API calls
  - 8.2: Update save functionality with API validation

**Modified Tasks:**
- Renumbered all existing tasks to accommodate new API tasks
- Updated save functionality to use API validation
- Added API error handling tests

**Key Changes:**
- Warband abilities fetched via API instead of direct DataRepository
- Validation performed via API before saving
- Save operations use PUT /api/warbands/:id endpoint

---

### ✅ Spec 4: Weirdo Editor

**New Tasks Added:**
- **Task 1**: Set up API integration for weirdo editor
  - 1.1: Add 6 game data API endpoints (attributes, weapons, equipment, powers, traits)
  - 1.2: Add POST /api/cost/calculate endpoint
  - 1.3: Add POST /api/validation/weirdo endpoint

- **Task 2**: Create GameDataContext for API integration
  - 2.1: Create context to fetch and cache game data
  - 2.2: Write unit tests for GameDataContext

- **Task 6**: Refactor to use API for cost calculations
  - 6.1: Replace CostEngine with API calls
  - 6.2: Write unit tests for cost calculation API integration

**Modified Tasks:**
- Renumbered all existing tasks (3-14 instead of 1-11)
- Updated all selectors to use GameDataContext instead of direct imports
- Updated cost calculation to use API instead of CostEngine
- Added API integration tests throughout

**Key Changes:**
- All game data fetched via API and cached in GameDataContext
- Cost calculations performed via POST /api/cost/calculate
- Validation performed via POST /api/validation/weirdo
- Debouncing added to reduce API call frequency

---

### ✅ Spec 5: Real-time Feedback & Polish

**New Tasks Added:**
- **Task 1**: Set up API integration for real-time feedback
  - 1.1: Add optimized cost calculation API (< 100ms response time)
  - 1.2: Add validation API endpoints
  - 1.3: Write unit tests for API performance

- **Task 5**: Refactor cost calculation to use API
  - 5.1: Replace CostEngine with API calls
  - 5.2: Write unit tests for API cost calculation

- **Task 7**: Refactor validation to use API
  - 7.1: Replace ValidationService with API calls
  - 7.2: Write unit tests for validation API integration

**Modified Tasks:**
- Renumbered all existing tasks (2-12 instead of 1-10)
- Updated cost displays to use API responses
- Updated validation displays to use API responses
- Added performance requirements (< 100ms for cost calculations)
- Added debouncing and caching strategies

**Key Changes:**
- Real-time cost calculations via API with 100ms debouncing
- Cost breakdowns returned from API
- Warning/error indicators use API response data
- Validation errors fetched from API
- Performance optimization for API calls

---

## Common Patterns Across All Specs

### API Client Usage
All specs now use a centralized `apiClient` service instead of direct backend imports:
```typescript
// OLD (Direct import)
import { DataRepository } from '@/backend/services/DataRepository';
const warbands = await DataRepository.getAllWarbands();

// NEW (API call)
import { apiClient } from '@/services/apiClient';
const response = await apiClient.get('/api/warbands');
const warbands = response.data;
```

### Error Handling
All API calls include error handling:
- Network failure handling
- User-friendly error messages
- Retry logic for transient failures
- Graceful degradation

### Performance Optimization
- Debouncing API calls (100ms for cost calculations)
- Caching API responses (game data, validation results)
- Memoization to prevent unnecessary API calls
- React.memo for expensive components

### Testing Requirements
All specs include:
- Unit tests for API integration
- Error handling tests for failed API calls
- Performance tests for API response times
- Verification that direct service imports are removed

---

## Implementation Priority

### Phase 1: Backend API Endpoints
1. Implement all RESTful API endpoints
2. Optimize cost calculation endpoint for < 100ms response
3. Add structured error responses
4. Test API endpoints independently

### Phase 2: Frontend API Client
1. Create apiClient service
2. Define TypeScript interfaces for API responses
3. Add request/response interceptors
4. Implement error handling

### Phase 3: Refactor Frontend Components
1. Replace direct service imports with API calls
2. Update state management to use API responses
3. Add loading and error states
4. Implement debouncing and caching

### Phase 4: Testing & Verification
1. Update unit tests for API integration
2. Add API error handling tests
3. Verify performance requirements met
4. Test complete user workflows with API

---

## Benefits of These Changes

1. **Proper Separation of Concerns**: Frontend and backend are fully decoupled
2. **Maintainability**: Backend changes don't break frontend
3. **Testability**: Frontend can be tested with mocked API responses
4. **Scalability**: Backend can be scaled independently
5. **Type Safety**: API contracts defined with TypeScript interfaces
6. **Error Handling**: Centralized handling for network failures
7. **Performance**: Caching and debouncing reduce unnecessary calls

---

## Next Steps

1. ✅ Requirements updated with API communication requirements
2. ✅ Design documents updated with API architecture
3. ✅ Task files updated with API implementation tasks
4. ⏳ Begin implementing backend API endpoints
5. ⏳ Create frontend API client service
6. ⏳ Refactor components to use API calls
7. ⏳ Update tests for API integration
