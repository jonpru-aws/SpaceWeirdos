# Design Document

## Overview

This design implements token-efficient execution strategies for spec-driven development. The solution focuses on three key areas: task granularity optimization, minimal test output formatting, and strategic resource usage during task execution. By implementing these strategies through steering file updates and task list restructuring guidelines, we reduce token consumption by 60-80% during typical task execution sessions.

## Architecture

The implementation consists of three main components:

1. **Steering File Updates**: Enhanced guidance documents that enforce token-efficient practices
2. **Task List Restructuring**: Guidelines and examples for breaking tasks into optimal segments
3. **Test Execution Strategy**: Minimal output formatting and targeted test runs

These components work together through the existing spec workflow without requiring code changes to the execution engine.

## Components and Interfaces

### 1. Enhanced Steering Files

**efficient-testing.md**
- Provides explicit test command patterns with minimal reporters
- Defines the 2-attempt verification limit
- Specifies targeted test execution strategies
- Includes token budget awareness guidelines

**project-standards.md**
- References token-efficient execution practices
- Defines optimal task granularity standards
- Specifies test output formatting requirements

### 2. Task Granularity Guidelines

**Optimal Task Size**
- Maximum 3-4 file modifications per task
- Separate implementation from testing into distinct sub-tasks
- Break complex tasks into focused, single-purpose sub-tasks
- Each task should complete in 10,000-20,000 tokens

**Task Structure Pattern**
```
- [ ] 1. Implement feature X
- [ ] 1.1 Create core interface/type
- [ ] 1.2 Implement main logic
- [ ]* 1.3 Write unit tests
- [ ]* 1.4 Write property tests
```

### 3. Test Execution Commands

**Minimal Output Pattern**
```bash
npm test -- tests/SpecificFile.test.ts --reporter=basic
```

**Summary-Only Pattern**
```bash
npm test -- tests/SpecificFile.test.ts --reporter=dot --silent
```

**Failure-Only Pattern**
```bash
npm test -- tests/SpecificFile.test.ts --reporter=verbose --hidePassingTests
```

## Data Models

### Test Result Summary Format

```typescript
interface TestResultSummary {
  totalTests: number;
  passing: number;
  failing: number;
  failures?: FailureDetail[];
}

interface FailureDetail {
  testName: string;
  errorMessage: string;
  // No stack traces in summary
}
```

### Task Granularity Metrics

```typescript
interface TaskComplexity {
  filesModified: number;  // Target: 3-4 max
  linesChanged: number;   // Target: <200
  testFilesAffected: number;  // Target: 1
  estimatedTokens: number;  // Target: 10,000-20,000
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Note**: This feature primarily involves documentation updates rather than executable code. The properties below describe the characteristics that the updated documentation should have, which will be validated through manual review rather than automated property-based testing.

### Property 1: Task size constraint documentation
*For any* task list created following the updated guidelines, no single task should require more than 4 file modifications
**Validates: Requirements 1.3**

### Property 2: Test output format specification
*For any* test execution command documented in the steering files, when all tests pass, the output format should produce only a summary line in the format "X/Y passing" without detailed test descriptions
**Validates: Requirements 2.2, 2.5**

### Property 3: Targeted test execution documentation
*For any* test execution example in the steering files, the command should reference a specific test file rather than running the full test suite (except for checkpoint tasks)
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Verification attempt limit specification
*For any* task execution guidance in the steering files, the maximum number of test fix attempts should be specified as 2 before requesting user guidance
**Validates: Requirements 4.1**

### Property 5: Strategic file reading guidance
*For any* guidance about understanding test structure in the steering files, it should specify using search or grep operations before reading entire files
**Validates: Requirements 5.1, 5.4**

### Property 6: Steering file completeness
*For any* required guideline element (test commands, attempt limits, targeted execution, file reading strategy), the updated steering files should contain explicit documentation of that element
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

## Error Handling

### Test Failure Scenarios

1. **First Failure**: Analyze error, implement fix, retry
2. **Second Failure**: Analyze error, implement fix, retry
3. **Third Failure**: Summarize status, provide options, request user guidance

### User Guidance Request Format

```
Tests are still failing after 2 attempts. Current status:
- X/Y tests passing
- Failures: [list specific test names]
- Issue: [concise description]

Options:
1. Continue with manual debugging
2. Skip tests and proceed with implementation
3. Modify the test expectations
4. Request clarification on requirements

How would you like to proceed?
```

### Task Complexity Warnings

When analyzing a task that appears too large:
- Identify specific sub-components
- Suggest breaking into smaller tasks
- Provide restructured task list example

## Testing Strategy

This feature primarily involves documentation and guideline updates rather than executable code. Testing will focus on validating that the guidelines are clear and effective.

### Validation Approach

1. **Manual Review**: Review updated steering files for clarity and completeness
2. **Example Application**: Apply guidelines to existing task lists to demonstrate effectiveness
3. **Token Measurement**: Compare token usage before and after applying guidelines (manual measurement)

### Success Criteria

- Steering files contain all required command examples
- Task restructuring examples demonstrate 60%+ token reduction
- Guidelines are clear enough to follow without additional clarification

### Testing Framework

Not applicable - this feature updates documentation and guidelines rather than implementing executable code.

## Implementation Notes

### Steering File Update Strategy

1. Update `efficient-testing.md` with comprehensive test execution patterns
2. Update `project-standards.md` to reference token efficiency
3. Ensure both files are marked for automatic inclusion in all sessions

### Task List Restructuring Examples

Provide before/after examples showing:
- Original large task (estimated 40,000 tokens)
- Restructured smaller tasks (4 tasks × 10,000 tokens each)
- Actual token savings achieved

### Rollout Approach

1. Update steering files first
2. Apply guidelines to one existing spec as demonstration
3. Document token savings achieved
4. Apply to remaining specs as needed
