# Space Weirdos Warband Builder

**Version 1.0.0**

A complete web application for creating and managing warbands for the Space Weirdos tabletop game. Built with TypeScript, React, and Express using spec-driven development with formal correctness guarantees.

## Features

- **Complete Warband Management:** Create, edit, save, load, and delete warbands
- **Real-Time Cost Calculation:** Automatic point cost calculation with warband ability modifiers
- **Comprehensive Validation:** Enforces all game rules including point limits, equipment restrictions, and weapon requirements
- **Persistent Storage:** In-memory database with JSON file persistence
- **Intuitive UI:** Three main components for warband list, warband editing, and weirdo customization
- **RESTful API:** Full Express backend with comprehensive endpoints

## Game Rules Implemented

- Warband creation with 75 or 125 point limits
- Leader and trooper customization with 5 attributes (Speed, Defense, Firepower, Prowess, Willpower)
- Close combat and ranged weapon selection
- Equipment limits (2 for leaders, 1 for troopers, +1 with Cyborgs ability)
- Psychic powers (unlimited)
- Leader traits (optional, leader only)
- Warband abilities with cost modifiers (Heavily Armed, Mutants, Soldiers, Cyborgs, etc.)
- Point limit enforcement (20 points for troopers, one 25-point weirdo allowed)

## Testing

**140 tests passing (100% success rate)**

- 25 property-based tests validating correctness properties
- Unit tests for all services and components
- Integration tests for API endpoints
- Frontend component tests with React Testing Library

TypeScript/React/Express application with property-based testing and spec-driven development.

**For detailed testing documentation, see [TESTING.md](TESTING.md)**

## Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Express + TypeScript + Node.js
- **Testing:** Vitest + fast-check
- **Data:** In-memory database with JSON file persistence

## Project Structure

```
├── src/
│   ├── backend/          # Express server
│   └── frontend/         # React application
├── tests/                # Test files
├── data/                 # JSON configuration files
└── .kiro/               # Kiro specs and steering
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run backend and frontend in separate terminals:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only property-based tests
npm run test:property
```

### Build

```bash
npm run build
```

## API Endpoints

- `POST /api/warbands` - Create new warband
- `GET /api/warbands` - Get all warbands
- `GET /api/warbands/:id` - Get specific warband
- `PUT /api/warbands/:id` - Update warband
- `DELETE /api/warbands/:id` - Delete warband
- `POST /api/warbands/:id/weirdos` - Add weirdo to warband
- `PUT /api/warbands/:id/weirdos/:weirdoId` - Update weirdo
- `DELETE /api/warbands/:id/weirdos/:weirdoId` - Remove weirdo
- `POST /api/calculate-cost` - Calculate cost for weirdo/warband
- `POST /api/validate` - Validate weirdo/warband

## Spec-Driven Development

This project was built using spec-driven development methodology with formal correctness guarantees.

**Specification Location:** `.kiro/specs/space-weirdos-warband/`

- **requirements.md:** EARS-compliant requirements with INCOSE quality rules (15 requirements, 89 acceptance criteria)
- **design.md:** Complete architecture and design with 25 correctness properties for property-based testing
- **tasks.md:** 14 major tasks with 50+ sub-tasks (all completed)

### Development Process

1. Requirements gathering using EARS patterns
2. Design with correctness properties
3. Task breakdown with property-based test integration
4. Incremental implementation with continuous testing
5. Final validation with 100% test pass rate

## Testing Strategy

- **Unit Tests:** Verify specific examples and edge cases
- **Property-Based Tests:** Verify universal properties across all inputs (minimum 50 iterations)
- Both test types complement each other for comprehensive coverage

## Code Standards

See `.kiro/steering/project-standards.md` for detailed coding standards and conventions.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Development process and workflow
- Code standards and testing requirements
- Spec-driven development methodology
- Pull request process

For testing guidelines, see [TESTING.md](TESTING.md).


## Architecture

### Backend Services

The backend follows a layered service architecture with clear separation of concerns:

- **WarbandService:** Orchestrates warband CRUD operations and coordinates between services
- **CostEngine:** Calculates point costs using Strategy pattern for warband ability modifiers
- **ValidationService:** Enforces all game rules and constraints with centralized error messages
- **DataRepository:** In-memory storage with JSON file persistence

**Design Patterns:**
- **Strategy Pattern:** `CostModifierStrategy` interface with ability-specific implementations (Mutants, Heavily Armed, Soldiers)
- **Factory Pattern:** `createCostModifierStrategy()` for creating appropriate cost strategies
- **Centralized Constants:** All magic numbers extracted to `constants/` directory

### Frontend Architecture

The frontend uses React with Context API for state management and component composition:

**Context Providers:**
- **GameDataContext:** Centralized game data loading (loads once at startup, shared across all components)
- **WarbandContext:** Warband state management with update functions (reduces prop drilling)

**Component Structure:**
- **WarbandList:** Displays all saved warbands with load/delete actions
- **WarbandEditor:** Orchestrates warband editing with sub-components:
  - `WarbandProperties`: Name, ability, point limit selection
  - `WarbandCostDisplay`: Cost tracking and warnings
  - `WeirdosList`: List of weirdos with add/remove actions
  - `WeirdoCard`: Individual weirdo display card
- **WeirdoEditor:** Orchestrates weirdo editing with sub-components:
  - `WeirdoBasicInfo`: Name and type
  - `WeirdoCostDisplay`: Cost tracking with warnings
  - `AttributeSelector`: All 5 attributes
  - `WeaponSelector`: Close combat and ranged weapons
  - `EquipmentSelector`: Equipment list
  - `PsychicPowerSelector`: Psychic powers
  - `LeaderTraitSelector`: Leader trait with description

**Reusable Components:**
- **SelectWithCost:** Dropdown with cost display and ability modifiers
- **ItemList:** Generic list with add/remove functionality
- **ValidationErrorDisplay:** Centralized error message display

**Performance Optimizations:**
- `useMemo` for expensive calculations (cost calculations, validation checks)
- `useCallback` for callback functions passed to child components
- `React.memo` for reusable components
- Stable keys for list rendering

## Refactoring and Code Quality

This codebase has undergone comprehensive refactoring to improve maintainability, readability, and performance:

### Backend Improvements

**Centralized Constants:**
- All magic numbers extracted to `src/backend/constants/costs.ts`
- Validation messages centralized in `src/backend/constants/validationMessages.ts`
- Type-safe error codes derived from constant keys

**Strategy Pattern for Cost Calculation:**
- `CostModifierStrategy` interface for warband ability modifiers
- Separate strategy classes: `MutantsCostStrategy`, `HeavilyArmedCostStrategy`, `SoldiersCostStrategy`
- Easy to extend with new warband abilities

**Custom Error Classes:**
- `AppError` base class with error codes and context
- `ValidationError` for validation failures
- `NotFoundError` for missing resources

**Reduced Code Duplication:**
- Generic validator factory functions
- Attribute validation using iteration
- Common validation patterns extracted

### Frontend Improvements

**Context API Integration:**
- `GameDataContext` eliminates prop drilling for game data
- `WarbandContext` manages warband state centrally
- Improved component reusability

**Component Composition:**
- Large components split into focused sub-components
- Clear prop interfaces and single responsibilities
- Easier to test and maintain

**Reusable UI Components:**
- `SelectWithCost` for consistent dropdown styling
- `ItemList` for generic list rendering
- `ValidationErrorDisplay` for error messages

**Performance Optimizations:**
- Strategic use of `useMemo` and `useCallback`
- Optimized list rendering with stable keys
- `React.memo` for frequently re-rendered components

### Type Safety

- Strict TypeScript interfaces throughout
- Discriminated union types for error codes
- `as const` assertions for type safety
- Eliminated use of `any` type

### Documentation

- JSDoc comments on all public functions
- Inline comments for complex logic
- Design pattern documentation
- Migration guides for refactored code

## Changelog

### v1.0.0 (2024-12-03)

**Initial Release**

Complete implementation of the Space Weirdos Warband Builder with all features, comprehensive testing, and formal correctness guarantees.

**Features:**
- Complete warband creation and management system
- Real-time cost calculation with warband ability modifiers
- Comprehensive validation of all game rules
- In-memory database with JSON file persistence
- Full React frontend with three main components
- Express backend with RESTful API

**Testing:**
- 140 tests passing (100% success rate)
- 25 property-based tests validating correctness properties
- Unit tests for all services and components
- Integration tests for API endpoints

**Implementation:**
- Spec-driven development with formal requirements
- EARS-compliant requirements with INCOSE quality rules
- Design with correctness properties for PBT
- Complete task list with all items completed

## License

ISC
