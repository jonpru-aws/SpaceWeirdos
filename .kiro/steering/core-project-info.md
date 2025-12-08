---
inclusion: always
---

# Core Project Information

## Technology Stack

### Frontend
- **Language:** TypeScript
- **Framework:** React
- **Purpose:** Web interface for user interaction

### Backend
- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express
- **Purpose:** Business logic, in-memory database, JSON file I/O

### Data Storage
- **In-Memory Database:** JavaScript objects, Maps, and Sets
- **Persistence:** JSON files on local filesystem
- **Configuration:** JSON files for user settings and application parameters

### Testing
- **Unit Testing:** Vitest
- **Property-Based Testing:** fast-check (minimum 50 iterations per test)
- **Test Location:** Co-located with source files using `.test.ts` suffix

### Key Libraries
- **File I/O:** Node.js `fs` module (promises API)
- **JSON Handling:** Native `JSON.parse()` and `JSON.stringify()`
- **HTTP Server:** Express.js

## Code Style

- Use clear, descriptive variable and function names
- Follow TypeScript and React best practices
- Keep functions focused and single-purpose
- Add comments for complex logic
- Use async/await for asynchronous operations
- Prefer functional programming patterns where appropriate
- Use proper TypeScript types (avoid `any`)
- Follow ESLint and Prettier configurations

## Documentation Structure

### Central Documentation Location

All documentation files (except core spec documents) MUST be located in the `docs/` directory:

**Required in docs/ folder:**
- Implementation summaries (in `docs/implementation-notes/` subdirectory)
- Architecture documentation
- API documentation
- Feature guides
- System design documents
- Technical guides
- User guides
- Release notes (in `docs/release-notes/` subdirectory)
- Any other detailed documentation

**Allowed outside docs/ folder:**
- Core spec files: `requirements.md`, `design.md`, `tasks.md` (in `.kiro/specs/[feature-name]/`)
- README.md files (in root, `.kiro/specs/`, `.kiro/steering/`, and other directories)
- CHANGELOG.md (in root)
- CONTRIBUTING.md (in root)
- TESTING.md (in root)
- LICENSE (in root)

### Documentation Organization

**docs/ Structure:**
```
docs/
├── README.md                    # Documentation hub with navigation
├── FEATURES.md                  # Feature overview and capabilities
├── ARCHITECTURE.md              # System architecture and patterns
├── API-DOCUMENTATION.md         # API reference
├── WARNING-SYSTEM.md            # Context-aware warning system guide
├── implementation-notes/        # Implementation summaries directory
│   ├── context-aware-warnings.md    # Context-aware warning system implementation
│   ├── api-separation.md            # API separation implementation notes
│   └── ...                          # Additional implementation notes
├── release-notes/               # Release notes directory
│   ├── v1.0.0.md               # Version 1.0.0 release notes
│   ├── v1.1.0.md               # Version 1.1.0 release notes
│   └── ...                     # Additional version release notes
├── samples/                     # Example templates and samples
│   ├── README.md               # Samples directory overview
│   └── example-spec/           # Example spec template files
└── [other-guides].md           # Additional guides as needed
```

**Spec Directory Structure:**
```
.kiro/specs/[feature-name]/
├── requirements.md              # EARS-compliant requirements (CORE)
├── design.md                    # Design with correctness properties (CORE)
├── tasks.md                     # Implementation task list (CORE)
└── README.md                    # Feature overview with links to docs/
```

**Steering Directory Structure:**
```
.kiro/steering/
├── README.md                    # Steering overview
├── core-project-info.md         # This file
├── task-execution-standards.md  # Task execution guidelines
└── [other-standards].md         # Additional standards
```

### Documentation Linking

**From Spec READMEs:**
- Link to detailed documentation in `docs/` folder
- Example: "See [docs/IMPLEMENTATION-SUMMARY.md](../../docs/IMPLEMENTATION-SUMMARY.md) for implementation details"

**From Steering READMEs:**
- Link to relevant documentation in `docs/` folder
- Example: "See [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) for system architecture"

**From Root README:**
- Link to `docs/README.md` as the documentation hub
- Provide quick links to key documentation files

### Documentation Standards

- Document public APIs and interfaces
- Keep README files up to date with links to detailed docs
- Include examples where helpful
- Use consistent formatting and structure
- Cross-reference related documentation
- Update CHANGELOG.md for significant changes
- Maintain documentation hub (docs/README.md) with current links

### Release Notes Standards

- **Location**: All release notes MUST be in `docs/release-notes/` directory
- **Naming**: Use version number format: `v{major}.{minor}.{patch}.md` (e.g., `v1.0.0.md`)
- **Content**: Include features, bug fixes, breaking changes, and upgrade instructions
- **Linking**: Link from CHANGELOG.md to detailed release notes in docs/release-notes/
- **Organization**: One file per version for easy navigation and reference

### Implementation Notes Standards

- **Location**: All implementation summaries MUST be in `docs/implementation-notes/` directory
- **Naming**: Use descriptive kebab-case names: `feature-name.md` (e.g., `context-aware-warnings.md`)
- **Content**: Include implementation details, design decisions, technical approach, and lessons learned
- **Purpose**: Document how features were implemented, not just what they do
- **Linking**: Link from feature guides and architecture docs to relevant implementation notes
- **Organization**: One file per major feature or implementation effort
