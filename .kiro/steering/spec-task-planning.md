---
inclusion: manual
---

# Spec Task Planning Standards

This file contains standards for creating task lists and breaking down implementation work.

## Optimal Task Size

Each task should be scoped to minimize token consumption:

- **Maximum 3-4 file modifications per task**
- **Target less than 15,000 tokens per task execution**
- **Single, focused objective per task**
- **Estimated completion time: less than 15 minutes**

## Task Structure Pattern

```markdown
- [ ] 1. Implement feature X
- [ ] 1.1 Create core interface/type definitions
  - Define TypeScript interfaces
  - _Requirements: 2.1_
- [ ] 1.2 Implement main business logic
  - Write core functions
  - _Requirements: 2.2, 2.3_
- [ ] 1.3 Write unit tests
  - Test core functionality
  - _Requirements: 2.1, 2.2, 2.3_
- [ ]* 1.4 Write property-based tests
  - **Property 1: Round trip consistency**
  - **Validates: Requirements 2.4**
```

## Key Pattern Elements

- Top-level task describes the feature/component
- Sub-tasks break down implementation steps
- Testing tasks are marked optional with `*` suffix
- Each task references specific requirements
- Property tests explicitly reference design properties

## Implementation/Testing Separation

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

## When to Break Tasks Down

Break a task down if it meets any of these criteria:

**File Modification Count:**
- Task requires modifying more than 4 files
- Task creates more than 3 new files
- Task touches multiple unrelated components

**Complexity Indicators:**
- Task description contains "and" multiple times
- Task involves multiple distinct algorithms or patterns
- Task requires understanding multiple existing components
- Estimated token usage exceeds 15,000

**Scope Indicators:**
- Task combines multiple user stories
- Task addresses more than 3 acceptance criteria
- Task description is longer than 2-3 sentences
- Task has more than 5 bullet points of details

## Final Task: Cleanup

The final task in every `tasks.md` file should include cleanup:

```markdown
- [ ] X. Final cleanup and verification
- [ ] X.1 Clean up temporary build artifacts
  - Remove `*.timestamp-*.mjs` files from workspace root
  - Verify all tests pass
- [ ] X.2 Verify feature completeness
  - Confirm all acceptance criteria are met
  - Review implementation against design document
```

## Task Requirements

Tasks should:
- Build incrementally on previous work
- Reference specific requirements
- Include property-based tests alongside implementation
- Focus only on coding activities (no deployment, user testing, etc.)
- Never include tasks for user acceptance testing, deployment, or performance metrics gathering
