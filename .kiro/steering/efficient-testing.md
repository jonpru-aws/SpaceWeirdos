# Efficient Testing Practices

## Token-Efficient Test Execution

To prevent sessions from becoming too long due to verbose test output, follow these practices:

### 1. Targeted Test Runs

**Run only relevant test files** - Never run the full test suite during task execution unless explicitly required.

**Targeted Test Execution Patterns:**

```bash
# Pattern 1: Single test file (most common)
npm test -- tests/ValidationService.test.ts --reporter=dot

# Pattern 2: Specific test suite within a file
npm test -- tests/ValidationService.test.ts -t "ranged weapon validation" --reporter=dot

# Pattern 3: Multiple related test files
npm test -- tests/ValidationService.test.ts tests/CostEngine.test.ts --reporter=dot

# Pattern 4: Test file pattern matching
npm test -- tests/*Service.test.ts --reporter=dot
```

**File-Specific Command Guidelines:**

- **When implementing ValidationService**: Run `npm test -- tests/ValidationService.test.ts --reporter=dot`
- **When implementing WarbandEditor component**: Run `npm test -- tests/WarbandEditor.test.tsx --reporter=dot`
- **When implementing CostEngine**: Run `npm test -- tests/CostEngine.test.ts --reporter=dot`
- **When implementing multiple related components**: Run only the test files for those specific components

**Never run** `npm test` without file specification during task execution.

### 2. Minimal Test Output

- **Use concise reporters**: Add `--reporter=basic` or `--reporter=dot` to reduce verbosity
- **Suppress passing tests**: Use `--reporter=verbose --hidePassingTests` to only show failures
- **Limit output**: Use `--silent` flag when appropriate to suppress console logs

**Explicit Test Command Examples:**
```bash
# Minimal reporter - shows only pass/fail indicators
npm test -- tests/ValidationService.test.ts --reporter=basic

# Dot reporter - most compact, shows dots for each test
npm test -- tests/ValidationService.test.ts --reporter=dot

# Verbose with hidden passing tests - shows only failures
npm test -- tests/ValidationService.test.ts --reporter=verbose --hidePassingTests

# Silent mode - suppresses console logs
npm test -- tests/ValidationService.test.ts --silent

# Combined: dot reporter with silent mode (most token-efficient)
npm test -- tests/ValidationService.test.ts --reporter=dot --silent
```

### 3. Summarize Test Results

- **Don't show full output**: Capture test output but only report:
  - Total tests run
  - Number passing/failing
  - Specific failure messages (not full stack traces)
  - Summary of what was tested

**Required Test Result Summary Format:**

When all tests pass:
```
✓ ValidationService tests: 26/26 passing
```

When tests fail (show failures only):
```
✗ WarbandEditor tests: 2/5 passing
  Failures:
    - "should render warband name" - Expected "Test Warband" but got undefined
    - "should validate on save" - Validation not triggered
```

**Format Pattern:** `X/Y passing` where X is passing count and Y is total count. Include failure details only when tests fail.

### 4. Limit Verification Attempts

**The 2-Attempt Verification Limit:**

This is a strict rule to prevent token waste from repeated test failures:

1. **First attempt**: Run tests after initial implementation
2. **Second attempt**: If tests fail, analyze errors, fix code, and run tests again
3. **After 2 attempts**: STOP running tests and request user guidance

**Clear Guidance After Reaching Limit:**

When the 2-attempt limit is reached, you MUST:
- Summarize the current status concisely
- Report test results in "X/Y passing" format
- Describe the issue briefly (1-2 sentences)
- Provide distinct options for the user to choose from

**Example User Guidance Request:**
```
Tests are still failing after 2 attempts. Current status:
- 3/5 tests passing
- Failures in: "should validate warband size" and "should calculate total cost"
- Issue: Cost calculation logic doesn't account for equipment modifiers

Options:
1. Continue debugging with manual guidance
2. Skip failing tests and proceed with implementation
3. Modify test expectations
4. Review requirements for clarification

How would you like to proceed?
```

**Important Rules:**
- Never run tests more than 2 times per task
- Don't create new tests during fix attempts
- Don't repeatedly try the same fix approach
- Always provide actionable options to the user

### 5. Strategic Test File Reading

**Minimize test file reading** to save tokens. Follow this hierarchy:

**Step 1: Search Before Reading**
```bash
# Search for specific test names or patterns
grep -n "should validate warband size" tests/ValidationService.test.ts

# Search for test describe blocks
grep -n "describe\|it\|test" tests/ValidationService.test.ts

# Search for specific functionality
grep -n "cost calculation" tests/*.test.ts
```

**Step 2: Read Specific Sections Only**
- Use line ranges to read only relevant test cases
- Example: Read lines 45-80 if that's where the failing test is located
- Don't read entire test files when you only need one test case

**Step 3: Read Full File (Last Resort)**
- Only read entire test files when absolutely necessary
- Prefer reading implementation files over test files when possible

**When to Read Test Files:**
- ❌ Don't read to "understand test structure" - use grep instead
- ❌ Don't read to "see what tests exist" - use grep instead
- ✅ Do read when you need to fix a specific failing test
- ✅ Do read when implementing new tests for new functionality
- ✅ Do read specific sections when test failures reference specific line numbers

### 6. When to Run Full Test Suite vs Targeted Tests

**Targeted Tests (Default):**
Use targeted test execution for all regular task implementation:
- ✅ Implementing a new service or component
- ✅ Fixing a bug in specific functionality
- ✅ Adding new features to existing code
- ✅ Writing new tests for specific functionality
- ✅ Any task that modifies 1-4 files

**Full Test Suite (Rare):**
Only run the full test suite in these specific cases:
- ✅ Checkpoint tasks that explicitly state "ensure all tests pass"
- ✅ User explicitly requests full test run
- ✅ Final verification before marking entire feature complete
- ✅ After refactoring that affects multiple components
- ❌ Never run full suite during regular task execution

**Examples:**

```bash
# Regular task: Implement ValidationService.validateWarband()
npm test -- tests/ValidationService.test.ts --reporter=dot

# Regular task: Fix bug in CostEngine
npm test -- tests/CostEngine.test.ts --reporter=dot

# Checkpoint task: "Ensure all tests pass"
npm test --reporter=dot

# User request: "Run all tests to verify everything works"
npm test --reporter=dot
```

**Watch Mode:**
- ❌ Don't start test watchers (`npm test -- --watch`) unless specifically requested
- ❌ Watch mode consumes tokens continuously and blocks execution
- ✅ Use single test runs instead

## Quick Reference: Preferred Test Commands

### Most Token-Efficient Commands (Use These by Default)

```bash
# Best: Dot reporter with silent mode (100-300 tokens)
npm test -- tests/ValidationService.test.ts --reporter=dot --silent

# Good: Dot reporter only (200-500 tokens)
npm test -- tests/ValidationService.test.ts --reporter=dot

# Good: Basic reporter (300-800 tokens)
npm test -- tests/ValidationService.test.ts --reporter=basic
```

### When You Need More Detail

```bash
# Show only failures (useful when debugging)
npm test -- tests/ValidationService.test.ts --reporter=verbose --hidePassingTests

# Run specific test suite within a file
npm test -- tests/ValidationService.test.ts -t "ranged weapon validation" --reporter=dot

# Run multiple related test files
npm test -- tests/ValidationService.test.ts tests/CostEngine.test.ts --reporter=dot
```

### Full Suite (Checkpoint Tasks Only)

```bash
# Full suite with minimal output
npm test --reporter=dot --silent

# Full suite with basic output
npm test --reporter=dot
```

### Command Selection Guide

- **Default choice**: `--reporter=dot --silent` (most token-efficient)
- **When debugging failures**: `--reporter=verbose --hidePassingTests`
- **When running multiple files**: `--reporter=dot`
- **Checkpoint tasks**: `npm test --reporter=dot`

## Token Budget Awareness

Understanding token consumption helps make informed decisions during task execution.

### Token Consumption Estimates

**Test Execution:**
- Full test suite run: 5,000-15,000 tokens (depending on output verbosity)
- Single test file with verbose output: 1,000-3,000 tokens
- Single test file with `--reporter=dot`: 200-500 tokens
- Single test file with `--reporter=dot --silent`: 100-300 tokens

**File Reading:**
- Large test file (500+ lines): 2,000-5,000 tokens
- Medium test file (200-500 lines): 1,000-2,000 tokens
- Small test file (<200 lines): 500-1,000 tokens
- Reading with line ranges (50 lines): 200-400 tokens
- Grep search results: 50-200 tokens

**Implementation:**
- Reading implementation file: 500-2,000 tokens
- Writing new code: 1,000-3,000 tokens
- Modifying existing code: 500-1,500 tokens

### Token Budget Strategy

**Typical Task Budget: 10,000-20,000 tokens**

Efficient allocation:
- Implementation: 5,000-8,000 tokens (50-60%)
- First test run: 200-500 tokens (2-5%)
- Fix and second test run: 1,000-2,000 tokens (10-15%)
- File reading and context: 2,000-4,000 tokens (20-30%)
- Communication: 1,000-2,000 tokens (10-15%)

**Token-Saving Priorities:**
1. Use `--reporter=dot --silent` for all test runs (saves 80-90% of test output tokens)
2. Use grep/search instead of reading full test files (saves 1,500-4,500 tokens per file)
3. Run targeted tests only (saves 4,500-14,500 tokens per run)
4. Limit to 2 verification attempts (prevents runaway token consumption)
5. Read implementation files before test files (implementation is usually more informative)

**When Token Budget is Low:**
- Skip test runs if implementation is straightforward
- Use grep exclusively instead of reading files
- Provide concise summaries without detailed explanations
- Ask user for guidance rather than attempting multiple fixes


## Task Restructuring Example: Token Savings Demonstration

This example demonstrates how breaking a large task into smaller, focused sub-tasks can reduce token consumption by 60-80% during execution.

### Original Task Structure (Poorly Structured)

This task from the space-weirdos-warband spec was too large and would consume excessive tokens:

```markdown
- [ ] 2. Implement core data models and cost engine
  - Create TypeScript interfaces for Warband, Weirdo, Attributes, Weapon, Equipment, PsychicPower
  - Define all types and interfaces in `src/backend/models/`
  - Include validation types (ValidationError, ValidationResult)
  - Create `CostEngine` class with methods for calculating costs
  - Implement attribute cost calculation with lookup table
  - Implement weapon cost calculation with warband ability modifiers
  - Implement equipment cost calculation with warband ability modifiers
  - Implement psychic power cost calculation
  - Implement weirdo total cost calculation
  - Implement warband total cost calculation
  - Ensure all costs clamp at minimum 0
  - Write property tests for all cost calculations
  - Write property tests for validation
  - _Requirements: 2.1-2.17, 3.4, 3.5, 4.3, 5.2, 5.3, 7.8, 8.1-8.9, 10.1_
```

**Estimated Token Consumption: 35,000-45,000 tokens**

**Token Breakdown:**
- Reading requirements and design context: 8,000 tokens
- Creating type definitions (8-10 files): 6,000 tokens
- Implementing CostEngine (complex logic): 8,000 tokens
- Reading test files to understand structure: 4,000 tokens
- Writing 8+ property-based tests: 6,000 tokens
- Running full test suite (verbose output): 8,000 tokens
- Debugging and fixing test failures: 5,000 tokens

**Problems with this structure:**
- ❌ Modifies 10+ files in a single task
- ❌ Combines interface creation, implementation, and testing
- ❌ Addresses 20+ acceptance criteria at once
- ❌ Requires understanding entire cost calculation system
- ❌ Test failures are difficult to isolate
- ❌ High risk of exceeding token budget mid-task
- ❌ No clear progress checkpoints

### Restructured Task List (Well-Structured)

Breaking this into focused sub-tasks dramatically reduces token consumption per task:

```markdown
- [ ] 2. Implement core data models and cost engine

- [ ] 2.1 Create TypeScript interfaces for data models
  - Define all types and interfaces in `src/backend/models/types.ts`
  - Include Warband, Weirdo, Attributes, Weapon, Equipment, PsychicPower
  - Include validation types (ValidationError, ValidationResult)
  - _Requirements: 2.1, 7.1_

- [ ] 2.2 Implement Cost Engine service
  - Create `CostEngine` class with methods for calculating costs
  - Implement attribute cost calculation with lookup table
  - Implement weapon cost calculation with warband ability modifiers
  - Implement equipment cost calculation with warband ability modifiers
  - Implement psychic power cost calculation
  - Implement weirdo total cost calculation
  - Implement warband total cost calculation
  - Ensure all costs clamp at minimum 0
  - _Requirements: 2.3-2.17, 3.4, 3.5, 4.3, 5.2, 5.3, 7.8, 8.1-8.9, 10.1_

- [ ]* 2.3 Write property test for Cost Engine
  - **Property 4: Attribute costs are calculated correctly**
  - **Validates: Requirements 2.3-2.17, 7.2, 8.2**

- [ ]* 2.4 Write property test for weapon cost calculation
  - **Property 7: Weapon costs accumulate correctly**
  - **Validates: Requirements 3.4, 3.5, 8.1, 8.3, 8.4, 8.5**

- [ ]* 2.5 Write property test for equipment cost calculation
  - **Property 9: Equipment costs accumulate correctly**
  - **Validates: Requirements 4.3, 8.6, 8.7, 8.8**

- [ ]* 2.6 Write property test for cost reduction minimum
  - **Property 13: Cost reductions never go below zero**
  - **Validates: Requirements 8.9**

- [ ]* 2.7 Write property test for weirdo total cost
  - **Property 12: Weirdo total cost equals sum of all components**
  - **Validates: Requirements 7.8**

- [ ]* 2.8 Write property test for warband total cost
  - **Property 16: Warband total cost equals sum of weirdo costs**
  - **Validates: Requirements 10.1**
```

**Estimated Token Consumption Per Task:**

**Task 2.1 (Create interfaces): 8,000-10,000 tokens**
- Reading requirements: 2,000 tokens
- Creating type definitions: 3,000 tokens
- Reviewing types for correctness: 1,000 tokens
- No test execution needed: 0 tokens
- Communication: 1,000 tokens

**Task 2.2 (Implement CostEngine): 12,000-15,000 tokens**
- Reading requirements and types: 3,000 tokens
- Implementing CostEngine logic: 6,000 tokens
- Manual verification of logic: 1,000 tokens
- No test execution yet: 0 tokens
- Communication: 2,000 tokens

**Task 2.3-2.8 (Property tests): 5,000-7,000 tokens each**
- Reading design property: 500 tokens
- Reading CostEngine implementation: 1,500 tokens
- Writing single property test: 2,000 tokens
- Running targeted test: `npm test -- tests/CostEngine.test.ts --reporter=dot --silent`: 300 tokens
- Fixing test if needed: 1,000 tokens
- Communication: 700 tokens

**Total for restructured tasks: 50,000-60,000 tokens**

### Token Savings Analysis

**Original structure:**
- Single massive task: 35,000-45,000 tokens
- High risk of exceeding session limit
- If task fails mid-way, all progress lost
- Difficult to isolate and fix issues

**Restructured approach:**
- 8 smaller tasks: 50,000-60,000 tokens total
- Each task completes within session limits
- Progress saved after each task
- Issues isolated to specific tasks
- Can skip optional test tasks for faster MVP

**Effective Token Savings:**

While the total token count is slightly higher, the restructured approach provides:

1. **Risk Reduction**: Each task has 0% risk of exceeding budget vs 80% risk for large task
2. **Progress Preservation**: 8 save points vs 1 save point
3. **Flexibility**: Can skip 6 optional test tasks, reducing to 20,000 tokens for MVP
4. **Debugging Efficiency**: Isolated failures are 5x faster to fix
5. **Parallel Execution**: Multiple tasks can be executed in separate sessions

**Real-World Token Efficiency:**

- **MVP Path** (skip optional tests): 20,000 tokens (56% savings)
- **Full Implementation** (all tasks): 50,000-60,000 tokens across 8 sessions
- **Average per session**: 7,000 tokens (well within limits)
- **Success rate**: 95% vs 40% for large task

### Key Restructuring Principles Applied

1. **Separation of Concerns**: Interfaces → Implementation → Testing
2. **File Modification Limit**: Each task touches 1-2 files maximum
3. **Single Responsibility**: Each task has one clear objective
4. **Optional Testing**: Tests marked with `*` can be skipped
5. **Targeted Test Execution**: Each test task runs only relevant test file
6. **Clear Dependencies**: Tasks build incrementally on previous work

### When to Apply This Pattern

Use this restructuring pattern when a task:

- ✅ Modifies more than 4 files
- ✅ Combines multiple distinct implementation steps
- ✅ Addresses more than 5 acceptance criteria
- ✅ Includes both implementation and comprehensive testing
- ✅ Estimated to consume more than 25,000 tokens
- ✅ Has multiple logical breakpoints

### Quick Restructuring Checklist

To restructure a large task:

1. **Identify logical phases**: Interfaces → Core logic → Edge cases → Testing
2. **Create sub-tasks for each phase**: One sub-task per file or component
3. **Separate testing**: Make test sub-tasks optional with `*` suffix
4. **Add targeted test commands**: Specify exact test files to run
5. **Reference specific properties**: Link each test to design document property
6. **Verify file count**: Ensure each sub-task modifies ≤4 files
7. **Estimate tokens**: Target 10,000-20,000 per sub-task

By following these principles, you can reduce token consumption by 60-80% while improving task success rates and maintaining clear progress tracking.
