# Requirements Document

## Introduction

This document specifies requirements for ensuring proper separation between frontend and backend code in the Space Weirdos Warband Builder application. The system currently has frontend code that duplicates backend business logic for cost calculations, creating maintenance burden and potential inconsistencies. This feature will eliminate code duplication and ensure all business logic resides in the backend, with the frontend communicating exclusively through API calls.

## Glossary

- **Frontend**: The React-based user interface running in the browser
- **Backend**: The Express-based Node.js server handling business logic and data persistence
- **API Client**: The frontend service module that communicates with backend endpoints
- **Business Logic**: Code that implements game rules, calculations, and validations
- **Cost Calculation**: The process of determining point costs for weirdos and warbands based on game rules
- **Type Definitions**: TypeScript interfaces and types that define data structures
- **Warband Ability**: Special rules that modify costs or capabilities of a warband

## Requirements

### Requirement 1

**User Story:** As a developer, I want all business logic to reside in the backend, so that I have a single source of truth and avoid code duplication.

#### Acceptance Criteria

1. WHEN the Frontend requests cost calculations, THE Frontend SHALL invoke Backend API endpoints
2. WHEN the Backend calculates costs with Warband Ability modifiers, THE Backend SHALL apply all cost modifications
3. THE Frontend SHALL NOT contain duplicate implementations of Backend business logic
4. THE Frontend SHALL import Backend type definitions for TypeScript type safety
5. WHEN Backend cost calculation logic changes, THE Backend SHALL be the only component requiring updates

### Requirement 2

**User Story:** As a developer, I want the frontend to communicate with the backend exclusively through API calls, so that the architecture remains clean and maintainable.

#### Acceptance Criteria

1. WHEN the Frontend requires data or calculations, THE Frontend SHALL make HTTP requests to Backend API endpoints
2. THE Frontend SHALL NOT import Backend services, repositories, or business logic modules
3. THE Frontend SHALL use the API Client module for all Backend communication
4. WHEN the Frontend receives API responses, THE Frontend SHALL use the returned data without recalculation

### Requirement 3

**User Story:** As a user, I want real-time cost feedback when building weirdos, so that I can make informed decisions about my warband composition.

#### Acceptance Criteria

1. WHEN a user modifies Weirdo attributes or equipment, THE Frontend SHALL display updated costs within 200 milliseconds
2. WHEN the Frontend displays calculated costs, THE Frontend SHALL show a breakdown by category including attributes, weapons, equipment, and psychic powers
3. WHEN Warband Abilities affect costs, THE Frontend SHALL display the modified costs
4. WHEN a user selects items, THE Frontend SHALL display individual item costs with Warband Ability modifiers applied
5. WHEN the Frontend receives multiple cost calculation requests within 300 milliseconds, THE Frontend SHALL debounce requests to minimize Backend API calls
6. WHEN the Backend API returns cost calculation results, THE Frontend SHALL cache results for identical inputs

### Requirement 4

**User Story:** As a developer, I want to identify all instances of duplicated business logic, so that I can eliminate them systematically.

#### Acceptance Criteria

1. THE System SHALL document all Frontend files that contain duplicated Backend logic
2. THE System SHALL identify which Backend services provide equivalent functionality
3. THE System SHALL document all Backend API endpoints that replace local Frontend calculations
4. WHEN Frontend code imports Backend modules, THE System SHALL distinguish between type imports and logic imports

### Requirement 5

**User Story:** As a developer, I want to refactor cost calculation display components to use API calls, so that they show accurate costs without duplicating logic.

#### Acceptance Criteria

1. WHEN Weapon Selectors display costs, THE Frontend SHALL retrieve costs from the Backend API with Warband Ability context
2. WHEN Equipment Selectors display costs, THE Frontend SHALL retrieve costs from the Backend API with Warband Ability context
3. WHEN Psychic Power Selectors display costs, THE Frontend SHALL retrieve costs from the Backend API
4. WHEN Frontend components require cost calculations, THE Frontend SHALL invoke the `/api/cost/calculate` endpoint
5. WHEN the Frontend requests identical cost calculations, THE Frontend SHALL return cached results
6. WHILE Backend API requests are in flight, THE Frontend SHALL display the last known cost value
7. THE System SHALL remove the `src/frontend/utils/costCalculations.ts` file after refactoring completion

### Requirement 6

**User Story:** As a developer, I want an optimized caching and request strategy for cost calculations, so that real-time updates remain responsive without duplicating business logic.

#### Acceptance Criteria

1. WHEN the Frontend receives identical cost calculation requests within 5 seconds, THE Frontend SHALL return cached results without invoking Backend API calls
2. WHEN a user changes selections within 300 milliseconds of a previous change, THE Frontend SHALL debounce Backend API requests
3. WHEN the Backend cost calculation endpoint processes requests, THE Backend SHALL respond within 100 milliseconds
4. WHEN Warband Ability changes, THE Frontend SHALL invalidate all cached cost calculations
5. THE Frontend SHALL implement a least-recently-used cache eviction strategy with a maximum capacity of 100 cached calculations

### Requirement 7

**User Story:** As a developer, I want comprehensive documentation of the API-based architecture, so that future developers understand the separation of concerns.

#### Acceptance Criteria

1. THE System SHALL document which Backend imports are acceptable for Frontend code (type definitions only)
2. THE System SHALL document which Backend imports are prohibited for Frontend code (services, repositories, business logic)
3. THE System SHALL provide examples of proper API Client usage patterns
4. THE System SHALL document the real-time cost calculation API endpoint including request and response formats
5. THE System SHALL include architectural diagrams showing Frontend-Backend communication patterns
6. THE System SHALL document the caching and debouncing strategies used for real-time cost updates
