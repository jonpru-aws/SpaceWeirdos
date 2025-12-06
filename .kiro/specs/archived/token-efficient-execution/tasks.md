# Implementation Plan

- [x] 1. Update efficient-testing.md steering file with comprehensive token-saving strategies





  - Add explicit test command examples with minimal reporters (--reporter=basic, --reporter=dot)
  - Document the 2-attempt verification limit with clear guidance
  - Include targeted test execution patterns with file-specific commands
  - Add token budget awareness section with consumption estimates
  - Specify test result summary format ("X/Y passing" with failures only)
  - Include examples of when to run full test suite vs targeted tests
  - _Requirements: 2.1, 2.2, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 6.1, 6.2, 6.3_

- [x] 2. Update project-standards.md steering file with task granularity guidelines





  - Add section on optimal task size (3-4 file modifications maximum)
  - Document task structure patterns with implementation/testing separation
  - Reference token-efficient execution practices
  - Include examples of well-structured vs poorly-structured tasks
  - Specify when to break tasks into smaller sub-tasks
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.4_

- [x] 3. Create task restructuring example demonstrating token savings





  - Select one existing large task from space-weirdos-warband or code-refactoring spec
  - Document the original task structure and estimated token usage
  - Restructure the task into smaller, focused sub-tasks
  - Document the new structure and estimated token savings
  - Include this as an example in efficient-testing.md
  - _Requirements: 1.1, 1.2, 1.3, 1.4_
