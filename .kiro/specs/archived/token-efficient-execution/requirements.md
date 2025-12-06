# Requirements Document

## Introduction

This feature improves the token efficiency of spec task execution by implementing strategies to reduce context consumption during implementation sessions. The goal is to prevent sessions from running out of token budget by optimizing test execution, output verbosity, and task granularity.

## Glossary

- **Token Budget**: The maximum number of tokens available in a single execution session
- **Test Output**: The console output generated when running test suites
- **Task Granularity**: The size and scope of individual tasks in a task list
- **Test Reporter**: The formatting mechanism that controls how test results are displayed
- **Verification Attempt**: A single execution of tests to validate implementation correctness

## Requirements

### Requirement 1

**User Story:** As a developer using specs, I want task lists broken into smaller segments, so that each task execution consumes fewer tokens and completes within session limits.

#### Acceptance Criteria

1. WHEN reviewing existing task lists THEN the system SHALL identify tasks that can be broken into smaller sub-tasks
2. WHEN a task involves multiple distinct implementation steps THEN the system SHALL separate each step into its own sub-task
3. WHEN a task list is created THEN the system SHALL ensure no single task requires more than 3-4 file modifications
4. WHEN a task includes both implementation and testing THEN the system SHALL separate these into distinct sub-tasks

### Requirement 2

**User Story:** As a developer executing spec tasks, I want minimal test output during execution, so that test verification doesn't consume excessive tokens.

#### Acceptance Criteria

1. WHEN running tests during task execution THEN the system SHALL use minimal output reporters
2. WHEN tests pass THEN the system SHALL display only a summary count without detailed output
3. WHEN tests fail THEN the system SHALL display only the failure messages and error descriptions
4. WHEN running tests THEN the system SHALL suppress console logs and stack traces unless failures occur
5. WHEN displaying test results THEN the system SHALL format output as "X/Y passing" with failure details only

### Requirement 3

**User Story:** As a developer executing spec tasks, I want targeted test execution, so that only relevant tests run and consume tokens.

#### Acceptance Criteria

1. WHEN implementing a task THEN the system SHALL run only test files directly related to that task
2. WHEN a task specifies a component or module THEN the system SHALL identify and run only the corresponding test file
3. WHEN running tests THEN the system SHALL use file-specific test commands rather than full suite execution
4. WHEN a checkpoint task requires full suite validation THEN the system SHALL explicitly run all tests

### Requirement 4

**User Story:** As a developer executing spec tasks, I want limited verification attempts, so that failed tests don't cause infinite retry loops.

#### Acceptance Criteria

1. WHEN tests fail after implementation THEN the system SHALL attempt fixes a maximum of 2 times
2. WHEN the retry limit is reached THEN the system SHALL summarize the current status and request user guidance
3. WHEN requesting user guidance THEN the system SHALL provide distinct options for proceeding
4. WHEN tests fail THEN the system SHALL not create new tests during fix attempts

### Requirement 5

**User Story:** As a developer executing spec tasks, I want strategic test file reading, so that understanding test context doesn't consume excessive tokens.

#### Acceptance Criteria

1. WHEN needing to understand test structure THEN the system SHALL use grep or search before reading entire files
2. WHEN test failures occur THEN the system SHALL read only the specific failing test cases
3. WHEN reading test files THEN the system SHALL use line ranges to read only relevant sections
4. WHEN implementing new functionality THEN the system SHALL search for existing test coverage before reading test files

### Requirement 6

**User Story:** As a developer, I want updated steering files that enforce token-efficient practices, so that all future task executions follow these optimizations.

#### Acceptance Criteria

1. WHEN the efficient-testing steering file is updated THEN it SHALL include specific test command examples with minimal reporters
2. WHEN the efficient-testing steering file is updated THEN it SHALL specify the 2-attempt verification limit
3. WHEN the efficient-testing steering file is updated THEN it SHALL include guidelines for targeted test runs
4. WHEN the project-standards steering file is updated THEN it SHALL reference token-efficient execution practices
