# Space Weirdos Warband Builder

**Version 1.9.0**

A complete web application for creating and managing warbands for the Space Weirdos tabletop game. Built with TypeScript, React, and Express using spec-driven development with formal correctness guarantees.

## Features

- **Complete Warband Management:** Create, edit, save, load, and delete warbands
- **Import/Export System:** Export warbands as JSON files for backup and sharing, import warbands with comprehensive validation
- **Real-Time Cost Calculation:** Automatic point cost calculation with warband ability modifiers
- **Context-Aware Validation:** Smart warning system that adapts to your warband composition
- **Intelligent Warning System:** Warns when approaching point limits (within 3 points) with context-specific messaging
- **25-Point Weirdo Management:** Automatic detection and appropriate limit enforcement for premium weirdos
- **Comprehensive Validation:** Enforces all game rules including point limits, equipment restrictions, and weapon requirements
- **Persistent Storage:** In-memory database with JSON file persistence
- **Intuitive UI:** Three main components for warband list, warband editing, and weirdo customization
- **RESTful API:** Full Express backend with comprehensive endpoints
- **Code Duplication Analysis:** Advanced static analysis system for identifying and optimizing code duplication across TypeScript/JavaScript codebases

## Import/Export System

### Quick Start

**Exporting Warbands:**
1. Navigate to the warband list
2. Click "Export" next to any warband
3. JSON file downloads automatically with sanitized filename

**Importing Warbands:**
1. Click "Import" in the warband list
2. Select a JSON warband file
3. Resolve any name conflicts if they occur
4. Warband is added to your collection

### Features

- **Complete Data Export:** All warband data, weirdos, equipment, and metadata included
- **Comprehensive Validation:** Checks file structure, game data references, and business rules
- **Error Categorization:** Clear error messages grouped by type (structure, game data, business logic)
- **Name Conflict Resolution:** Automatic handling with rename and replace options
- **Security:** Input sanitization and file validation for safe imports
- **Cross-Platform:** Sanitized filenames work across different operating systems

For detailed troubleshooting, see [Import/Export Troubleshooting Guide](docs/IMPORT-EXPORT-TROUBLESHOOTING.md).

## Game Rules Implemented

- Warband creation with 75 or 125 point limits
- Leader and trooper customization with 5 attributes (Speed, Defense, Firepower, Prowess, Willpower)
- Close combat and ranged weapon selection
- Equipment limits (2 for leaders, 1 for troopers, +1 with Cyborgs ability)
- Psychic powers (unlimited)
- Leader traits (optional, leader only)
- Warband abilities with cost modifiers (Heavily Armed, Mutants, Soldiers, Cyborgs, etc.)
- Point limit enforcement (20 points for troopers, one 25-point weirdo allowed)

## Code Quality & Analysis

### Code Duplication Analysis System

Version 1.9.0 introduces a comprehensive code duplication analysis system that provides:

- **Advanced Static Analysis:** Multi-algorithm detection of exact, functional, pattern, and configuration duplications
- **Specialized Analyzers:** Domain-specific analysis for singletons, services, caches, validation, and configuration management
- **Intelligent Recommendations:** Impact analysis, complexity estimation, and step-by-step optimization strategies
- **Quality Metrics:** Duplication percentage, maintainability index, and technical debt ratio calculations

**Analysis Results:**
- **101 source files** analyzed containing **36,162 lines of code**
- **73 duplication patterns** identified with potential savings of **3,840 lines of code**
- **Optimization roadmap** with 4-phase implementation plan over 26 weeks

**Usage:**
```bash
# Run comprehensive analysis
npm run analyze:codebase

# Run Space Weirdos specific analysis
npm run analyze:space-weirdos

# Generate detailed HTML report
npm run analyze:space-weirdos -- --detailed-report --output-format="html"
```

For detailed analysis documentation, see:
- [Code Duplication Analysis Architecture](docs/CODE-DUPLICATION-ANALYSIS-ARCHITECTURE.md)
- [Code Duplication Analysis Usage Guide](docs/CODE-DUPLICATION-ANALYSIS-USAGE.md)
- [Analysis Findings Report](docs/implementation-notes/code-duplication-analysis-findings.md)

## Testing

- **160+ Tests:** Comprehensive test coverage including unit, integration, and property-based tests
- **Import/Export Testing:** Full test coverage for import/export functionality with validation
- **Property-Based Testing:** 25+ correctness properties with minimum 50 iterations each
- **Unit Tests:** All services, components, and API endpoints
- **Integration Tests:** Complete workflows and error handling scenarios
- **Analysis Testing:** Property-based testing for code duplication analysis accuracy

TypeScript/React/Express application with property-based testing and spec-driven development.

**For detailed testing documentation, see [TESTING.md](TESTING.md)**

## Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Express + TypeScript + Node.js
- **Testing:** Vitest + fast-check
- **Data:** In-memory database with JSON file persistence
- **Configuration:** Centralized configuration system with environment-specific settings

## Project Structure

```
├── src/
│   ├── backend/          # Express server (ValidationService, CostEngine)
│   └── frontend/         # React application (WeirdoCostDisplay, etc.)
├── tests/                # Test files (including WarningLogic.test.ts)
├── data/                 # JSON configuration files
├── docs/                 # Documentation (API, Architecture, Warning System)
└── .kiro/               # Kiro specs and steering
```

## Configuration

The application uses a centralized configuration system that supports environment-specific settings and can be customized via environment variables.

### Environment Variables

| Variable | Description | Default | Environments |
|----------|-------------|---------|--------------|
| `NODE_ENV` | Environment type | `development` | `development`, `production`, `test` |
| `PORT` | Server port | `3001` | All |
| `HOST` | Server host | `localhost` | All |
| `VITE_API_URL` | API base URL | `http://localhost:3001/api` | All |
| `CORS_ORIGINS` | Allowed CORS origins | `*` | All |
| `CACHE_DEFAULT_MAX_SIZE` | Default cache size | `100` | All |
| `CACHE_DEFAULT_TTL_MS` | Default cache TTL | `5000` | All |
| `POINT_LIMIT_STANDARD` | Standard point limit | `75` | All |
| `POINT_LIMIT_EXTENDED` | Extended point limit | `125` | All |
| `VALIDATION_COST_WARNING_THRESHOLD` | Cost warning threshold | `0.9` | All |
| `FILE_MAX_SIZE_BYTES` | Maximum import file size | `10485760` (10MB) | All |
| `FILE_ALLOWED_TYPES` | Allowed import file types | `application/json,.json` | All |
| `FILE_MAX_FILENAME_LENGTH` | Maximum filename length | `255` | All |

### Environment-Specific Behavior

- **Development**: Debug logging enabled, shorter cache TTLs
- **Production**: Performance optimizations, longer cache TTLs, error logging only
- **Test**: Minimal logging, very short cache TTLs, random ports

### Configuration Files

Example configuration files are provided in `docs/examples/configuration/`:
- `development.env.example`
- `production.env.example`
- `test.env.example`

## Getting Started

### Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### Deployment Options

For comprehensive deployment instructions including local development, cloud deployment (Vercel, Render), and configuration options, see:

**[Deployment Options Guide](.kiro/steering/deployment-options.md)**

This guide covers:
- **Local Development:** Detailed setup with troubleshooting
- **Vercel Deployment:** Serverless deployment with database integration options
- **Render Deployment:** Full-stack deployment with persistent storage
- **Configuration System:** Complete environment variable reference
- **Multi-App Deployment:** Best practices for multiple applications

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

### Warband Management
- `POST /api/warbands` - Create new warband
- `GET /api/warbands` - Get all warbands
- `GET /api/warbands/:id` - Get specific warband
- `PUT /api/warbands/:id` - Update warband
- `DELETE /api/warbands/:id` - Delete warband
- `POST /api/warbands/:id/weirdos` - Add weirdo to warband
- `PUT /api/warbands/:id/weirdos/:weirdoId` - Update weirdo
- `DELETE /api/warbands/:id/weirdos/:weirdoId` - Remove weirdo

### Import/Export Operations
- `GET /api/warbands/:id/export` - Export warband as JSON file
- `POST /api/warbands/import` - Import warband from JSON data
- `POST /api/warbands/validate-import` - Validate import data without importing

### Calculation & Validation
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

## Documentation

For detailed information about the project:

### Core Documentation
- **Configuration Guide:** [docs/CONFIGURATION.md](docs/CONFIGURATION.md) - Comprehensive configuration management system guide
- **Features Guide:** [docs/FEATURES.md](docs/FEATURES.md) - Complete feature overview including import/export system
- **API Documentation:** [docs/API-DOCUMENTATION.md](docs/API-DOCUMENTATION.md) - Backend API endpoints and data structures
- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture and design patterns
- **Warning System:** [docs/WARNING-SYSTEM.md](docs/WARNING-SYSTEM.md) - Context-aware warning system guide

### Code Quality & Analysis
- **Code Duplication Analysis Architecture:** [docs/CODE-DUPLICATION-ANALYSIS-ARCHITECTURE.md](docs/CODE-DUPLICATION-ANALYSIS-ARCHITECTURE.md) - Complete analysis system architecture
- **Code Duplication Analysis Usage:** [docs/CODE-DUPLICATION-ANALYSIS-USAGE.md](docs/CODE-DUPLICATION-ANALYSIS-USAGE.md) - Comprehensive usage guide and CLI reference
- **Analysis Findings:** [docs/implementation-notes/code-duplication-analysis-findings.md](docs/implementation-notes/code-duplication-analysis-findings.md) - Detailed analysis results and recommendations
- **Optimization Summary:** [docs/implementation-notes/code-duplication-optimization-summary.md](docs/implementation-notes/code-duplication-optimization-summary.md) - Executive summary of optimization opportunities
- **Implementation Roadmap:** [docs/implementation-notes/code-duplication-optimization-roadmap.md](docs/implementation-notes/code-duplication-optimization-roadmap.md) - Detailed implementation plan

### Troubleshooting & Support
- **Import/Export Troubleshooting:** [docs/IMPORT-EXPORT-TROUBLESHOOTING.md](docs/IMPORT-EXPORT-TROUBLESHOOTING.md) - Comprehensive troubleshooting guide
- **Testing:** [TESTING.md](TESTING.md) - Testing guidelines and strategies
- **Changelog:** [CHANGELOG.md](CHANGELOG.md) - Recent updates and changes
- **Specifications:** `.kiro/specs/` - Detailed feature specifications

## Code Standards

See the steering files in `.kiro/steering/` for detailed standards:
- [Core Project Info](.kiro/steering/core-project-info.md) - Technology stack, libraries, and code style
- [Task Execution Standards](.kiro/steering/task-execution-standards.md) - Testing and execution guidelines

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

**Centralized Configuration:**
- All configuration values managed by ConfigurationManager
- Environment variable support for all settings
- Type-safe configuration access with validation

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

## Recent Updates

### Version 1.9.0 - Code Duplication Analysis System

**Major Quality Enhancement:**
- **Comprehensive Static Analysis:** Advanced code duplication detection across 101 source files
- **Multi-Type Detection:** Exact match, functional, pattern, configuration, validation, cache, and error handling analysis
- **Specialized Analyzers:** Domain-specific analysis for singletons, services, caches, validation, and configuration management
- **Intelligent Recommendations:** Impact analysis, complexity estimation, risk assessment, and optimization strategies
- **Quality Metrics:** Detailed analysis revealing 10.6% duplication with path to <5% through systematic optimization

**Analysis Capabilities:**
- Command-line interface with configurable analysis options
- Multiple output formats (JSON, HTML, Markdown, Console)
- Integration with CI/CD pipelines and development workflow
- Real-time quality monitoring and threshold-based quality gates
- Comprehensive documentation and implementation roadmap

**Key Findings:**
- 73 duplication patterns identified across 36,162 lines of code
- 3,840 lines of potential savings through optimization
- 2 critical issues requiring immediate attention (configuration fragmentation, validation proliferation)
- 4-phase optimization roadmap with 458 hours estimated effort over 26 weeks

### Version 1.8.0 - Centralized Configuration Management System

**Major Architectural Improvement:**
- **ConfigurationManager:** Complete centralized configuration management for the entire application
- **Environment-Specific Configuration:** Automatic environment detection with optimized settings for development, production, and test
- **Comprehensive Validation:** Type-safe configuration with detailed error messages and fallback recovery
- **Environment Variable Support:** All configuration values can be overridden via environment variables
- **Migration from Legacy Constants:** Replaced hardcoded constants with centralized configuration system

**Configuration Features:**
- Server, API, Cache, Cost, Validation, Environment, and File Operations configuration sections
- Environment-specific performance optimizations (cache TTLs, logging levels, debug settings)
- Comprehensive validation with detailed error messages and actionable suggestions
- Graceful degradation with fallback recovery for critical failures
- Configuration examples for all environments (development, production, test)

### Previous Major Updates

**Version 1.7.0 - Import/Export System:**
- Warband import/export with JSON files for backup and sharing
- Comprehensive validation with categorized error reporting
- Name conflict resolution and security features
- Cross-platform filename sanitization

**Context-Aware Warning System:**
- Intelligent warnings that adapt to warband composition
- Warnings trigger within 3 points of applicable limits
- Context-aware logic based on 25-point weirdo existence
- Backend ValidationService integration for consistency

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

## License

ISC
