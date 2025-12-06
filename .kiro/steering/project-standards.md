# Project Standards

This steering file contains standards and conventions for this project.

## Overview

This project follows spec-driven development methodology to build features systematically with formal correctness guarantees.

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
- **Unit Testing:** Jest or Vitest
- **Property-Based Testing:** fast-check (minimum 50 iterations per test)
- **Test Location:** Co-located with source files using `.test.ts` suffix

### Key Libraries
- **File I/O:** Node.js `fs` module (promises API)
- **JSON Handling:** Native `JSON.parse()` and `JSON.stringify()`
- **HTTP Server:** Express.js

## Documentation

- Document public APIs and interfaces
- Keep README files up to date
- Include examples where helpful

## Requirements Standards

All requirements must follow EARS (Easy Approach to Requirements Syntax) patterns:
- **Ubiquitous**: THE <system> SHALL <response>
- **Event-driven**: WHEN <trigger>, THE <system> SHALL <response>
- **State-driven**: WHILE <condition>, THE <system> SHALL <response>
- **Unwanted event**: IF <condition>, THEN THE <system> SHALL <response>
- **Optional feature**: WHERE <option>, THE <system> SHALL <response>

Requirements must also comply with INCOSE quality rules:
- Use active voice
- Avoid vague terms
- Be measurable and testable
- Use consistent terminology
- Focus on what, not how

## Design Principles

Designs must include:
- Clear architecture and component boundaries
- Correctness properties for property-based testing
- Each property must start with "For any..." (universal quantification)
- Properties must reference specific requirements they validate

## Code Style

- Use clear, descriptive variable and function names
- Follow TypeScript and React best practices
- Keep functions focused and single-purpose
- Add comments for complex logic
- Use async/await for asynchronous operations
- Prefer functional programming patterns where appropriate
- Use proper TypeScript types (avoid `any`)
- Follow ESLint and Prettier configurations

## Version Control

- Write clear, descriptive commit messages
- Keep commits focused on single changes
- Review changes before committing

## Testing Strategy

- Write tests for new functionality
- Ensure tests are maintainable and readable

Use dual testing approach:
- **Unit tests**: Verify specific examples and edge cases
- **Property-based tests**: Verify universal properties across all inputs

Both test types complement each other and are required for comprehensive coverage.

### Property-Based Testing Requirements

- Configure each property-based test to run a minimum of **50 iterations**
- Tag each property-based test with a comment linking it to the design document
- Use this exact format: `**Feature: {feature_name}, Property {number}: {property_text}**`
- Example: `**Feature: user-auth, Property 1: Round trip consistency**`
- Each correctness property from the design document must be implemented by a single property-based test
- Property tests should use smart generators that constrain inputs to valid ranges

## Implementation

Tasks should:
- Build incrementally on previous work
- Reference specific requirements
- Include property-based tests alongside implementation
- Focus only on coding activities (no deployment, user testing, etc.)

## Task Granularity and Structure

Proper task granularity is essential for token-efficient execution and successful task completion. Follow these guidelines when creating or reviewing task lists.

### Optimal Task Size

Each task should be scoped to minimize token consumption while maintaining clear progress:

- **Maximum 3-4 file modifications per task**
- **Target 10,000-20,000 tokens per task execution**
- **Single, focused objective per task**
- **Estimated completion time: 15-30 minutes**

Tasks that exceed these limits should be broken into smaller sub-tasks.

### Task Structure Patterns

Use a clear hierarchy with implementation and testing separated:

**Well-Structured Pattern:**
```markdown
- [ ] 1. Implement feature X
- [ ] 1.1 Create core interface/type definitions
  - Define TypeScript interfaces
  - _Requirements: 2.1_
- [ ] 1.2 Implement main business logic
  - Write core functions
  - _Requirements: 2.2, 2.3_
- [ ]* 1.3 Write unit tests
  - Test core functionality
  - _Requirements: 2.1, 2.2, 2.3_
- [ ]* 1.4 Write property-based tests
  - **Property 1: Round trip consistency**
  - **Validates: Requirements 2.4**
```

**Key Pattern Elements:**
- Top-level task describes the feature/component
- Sub-tasks break down implementation steps
- Testing tasks are marked optional with `*` suffix
- Each task references specific requirements
- Property tests explicitly reference design properties

### Implementation/Testing Separation

Always separate implementation from testing into distinct sub-tasks:

**Implementation Sub-tasks:**
- Creating interfaces and types
- Writing business logic
- Implementing UI components
- Setting up data structures

**Testing Sub-tasks (marked optional with `*`):**
- Unit tests for specific examples
- Property-based tests for universal properties
- Integration tests for component interaction

This separation allows:
- Focused implementation without test overhead
- Flexibility to skip tests when needed
- Clear progress tracking
- Token-efficient execution

### When to Break Tasks into Smaller Sub-tasks

Break a task down if it meets any of these criteria:

**File Modification Count:**
- Task requires modifying more than 4 files
- Task creates more than 3 new files
- Task touches multiple unrelated components

**Complexity Indicators:**
- Task description contains "and" multiple times
- Task involves multiple distinct algorithms or patterns
- Task requires understanding multiple existing components
- Estimated token usage exceeds 25,000

**Scope Indicators:**
- Task combines multiple user stories
- Task addresses more than 3 acceptance criteria
- Task description is longer than 2-3 sentences
- Task has more than 5 bullet points of details

**Example of Breaking Down a Large Task:**

❌ **Poorly-Structured (Too Large):**
```markdown
- [ ] 1. Implement user authentication system
  - Create User model with validation
  - Implement password hashing
  - Create authentication service
  - Add login/logout endpoints
  - Create JWT token management
  - Add authentication middleware
  - Create login UI component
  - Create registration UI component
  - Write all tests
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2_
```

✅ **Well-Structured (Properly Broken Down):**
```markdown
- [ ] 1. Implement user data model and validation
- [ ] 1.1 Create User interface and types
  - Define User type with required fields
  - _Requirements: 1.1_
- [ ] 1.2 Implement password hashing utilities
  - Create hash and verify functions
  - _Requirements: 1.2_
- [ ]* 1.3 Write unit tests for User model
  - Test validation rules
  - _Requirements: 1.1, 1.2_

- [ ] 2. Implement authentication service
- [ ] 2.1 Create authentication service class
  - Implement login/logout methods
  - _Requirements: 1.3, 1.4_
- [ ] 2.2 Implement JWT token management
  - Create token generation and verification
  - _Requirements: 1.5_
- [ ]* 2.3 Write property-based tests for auth service
  - **Property 1: Token round trip consistency**
  - **Validates: Requirements 1.5**

- [ ] 3. Implement authentication API endpoints
- [ ] 3.1 Create login and logout routes
  - Add Express routes with handlers
  - _Requirements: 2.1, 2.2_
- [ ] 3.2 Add authentication middleware
  - Implement JWT verification middleware
  - _Requirements: 2.2_
- [ ]* 3.3 Write integration tests for auth endpoints
  - Test login/logout flows
  - _Requirements: 2.1, 2.2_

- [ ] 4. Implement authentication UI components
- [ ] 4.1 Create login form component
  - Build React component with form handling
  - _Requirements: 3.1_
- [ ] 4.2 Create registration form component
  - Build React component with validation
  - _Requirements: 3.2_
- [ ]* 4.3 Write component tests
  - Test form submission and validation
  - _Requirements: 3.1, 3.2_
```

### Additional Examples

**Example: Simple Feature (Good Size)**
```markdown
- [ ] 1. Add cost calculation for equipment
- [ ] 1.1 Extend CostEngine with equipment cost method
  - Add calculateEquipmentCost function
  - _Requirements: 4.1_
- [ ] 1.2 Update total cost calculation to include equipment
  - Modify calculateTotalCost to sum equipment costs
  - _Requirements: 4.2_
- [ ]* 1.3 Write property-based test for equipment costs
  - **Property 3: Equipment cost is always non-negative**
  - **Validates: Requirements 4.1**
```

**Example: Refactoring Task (Good Size)**
```markdown
- [ ] 1. Extract validation logic into ValidationService
- [ ] 1.1 Create ValidationService class
  - Move validation methods from WarbandService
  - _Requirements: 5.1_
- [ ] 1.2 Update WarbandService to use ValidationService
  - Replace inline validation with service calls
  - _Requirements: 5.2_
- [ ]* 1.3 Verify existing tests still pass
  - Run validation and warband service tests
  - _Requirements: 5.1, 5.2_
```

### Token-Efficient Execution Practices

When executing tasks, follow token-efficient practices (see `efficient-testing.md` for details):

- **Run targeted tests only**: Test only files modified in the current task
- **Use minimal test reporters**: Add `--reporter=dot --silent` to test commands
- **Limit verification attempts**: Maximum 2 test runs per task
- **Strategic file reading**: Use grep/search before reading entire files
- **Summarize test results**: Report "X/Y passing" format with failures only

These practices reduce token consumption by 60-80% during typical task execution.

### Task Review Checklist

Before finalizing a task list, verify:

- [ ] No single task modifies more than 4 files
- [ ] Implementation and testing are separated into distinct sub-tasks
- [ ] Each task has a clear, single-purpose objective
- [ ] Testing sub-tasks are marked optional with `*`
- [ ] Each task references specific requirements
- [ ] Property-based test tasks reference design properties
- [ ] Complex tasks are broken into focused sub-tasks
- [ ] Task descriptions are concise (2-3 sentences maximum)

### Final Task: Cleanup

The final task in every `tasks.md` file should include cleanup of temporary build artifacts:

```markdown
- [ ] X. Final cleanup and verification
- [ ] X.1 Clean up temporary build artifacts
  - Remove `*.timestamp-*.mjs` files from workspace root
  - Verify all tests pass
- [ ] X.2 Verify feature completeness
  - Confirm all acceptance criteria are met
  - Review implementation against design document
```

**Common temporary artifacts to clean:**
- Vitest timestamp files: `vitest.config.ts.timestamp-*.mjs`
- Build cache files
- Temporary test output files
- Any `.tmp` or `.cache` files created during development

These files should not be committed to version control and can cause TypeScript compilation errors if left in the workspace.