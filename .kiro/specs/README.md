# Specifications

This directory contains feature specifications following the spec-driven development methodology.

## Spec Directory Structure

Each feature has its own subdirectory containing:
- **README.md**: Spec overview with links to detailed documentation
- **requirements.md**: User stories and acceptance criteria (EARS format)
- **design.md**: Detailed design with correctness properties
- **tasks.md**: Implementation task list

## Workflow

1. **Requirements**: Define what the feature should do
2. **Design**: Plan how it will work, including correctness properties
3. **Tasks**: Break down implementation into actionable steps
4. **Execute**: Implement tasks one at a time

See [WORKING-WITH-SPECS.md](WORKING-WITH-SPECS.md) for detailed guidance on creating and working with specs.

## Documentation

Detailed implementation documentation is located in the [docs/](../../docs/) directory:

- **[Architecture Overview](../../docs/ARCHITECTURE.md)** - System design and architectural patterns
- **[API Documentation](../../docs/API-DOCUMENTATION.md)** - Backend API endpoints and usage
- **[Frontend-Backend API Separation](../../docs/FRONTEND-BACKEND-API-SEPARATION.md)** - API-based architecture guide
- **[UI Design System](../../docs/UI-DESIGN-SYSTEM.md)** - CSS design tokens, base styles, and utilities
- **[Features Guide](../../docs/FEATURES.md)** - Complete feature overview
- **[Warning System Guide](../../docs/WARNING-SYSTEM.md)** - Context-aware warning system
- **[Implementation Notes](../../docs/implementation-notes/)** - Feature implementation details
- **[Testing Guide](../../TESTING.md)** - Testing strategies and guidelines

## Active Specs

### 1. UI Design System
**Status**: ✅ Complete  
**Location**: `1-ui-design-system/`  
**Purpose**: Foundational design tokens, base styles, and utilities

### 2. Warband List & Navigation
**Status**: ✅ Complete  
**Location**: `2-warband-list-navigation/`  
**Purpose**: Warband list view, CRUD operations, and navigation

### 3. Warband Properties Editor
**Status**: ✅ Complete  
**Location**: `3-warband-properties-editor/`  
**Purpose**: Warband-level settings (name, point limit, ability)

### 4. Weirdo Editor
**Status**: ✅ Complete  
**Location**: `4-weirdo-editor/`  
**Purpose**: Character editing (attributes, weapons, equipment, powers)

### 5. Real-time Feedback Polish
**Status**: ✅ Complete  
**Location**: `5-realtime-feedback-polish/`  
**Purpose**: Real-time feedback, context-aware warnings, sticky displays

### 6. Frontend-Backend API Separation
**Status**: ✅ Complete  
**Location**: `6-frontend-backend-api-separation/`  
**Purpose**: Clean separation with dedicated API layer

### Space Weirdos Game Rules
**Status**: ✅ Complete  
**Location**: `space-weirdos-game-rules/`  
**Purpose**: Backend game logic and validation

### Space Weirdos Data Persistence
**Status**: ✅ Complete  
**Location**: `space-weirdos-data-persistence/`  
**Purpose**: Data storage and retrieval

## Getting Started

### Creating a New Spec
Ask Kiro to help you develop requirements for your feature idea. Include the appropriate steering files:

```
#spec-methodology #spec-task-planning

I want to create a spec for [feature description]...
```

Kiro will guide you through the requirements → design → tasks workflow.

### Executing Tasks
Open the tasks.md file in any spec directory and click "Start task" next to any task item, or ask Kiro:

```
Execute task 2.1 from the ui-design-system spec
```

See [WORKING-WITH-SPECS.md](WORKING-WITH-SPECS.md) for complete guidance.
