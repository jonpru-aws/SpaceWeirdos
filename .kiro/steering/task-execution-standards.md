---
inclusion: always
---

# Task Execution Standards

This file contains standards for executing implementation tasks efficiently.

## Execution Guidelines

- Only focus on ONE task at a time
- Write all required code changes before executing tests
- Verify implementation against requirements specified in the task
- Once you complete the requested task, stop and let the user review
- Do NOT automatically proceed to the next task

## Testing Strategy

Use dual testing approach:
- **Unit tests**: Verify specific examples and edge cases (REQUIRED)
- **Property-based tests**: Verify universal properties across all inputs (OPTIONAL)

Unit tests are required for all new functionality. Property-based tests are optional but recommended for comprehensive coverage.

### When to Write Tests

- Write unit tests for all new functionality (REQUIRED)
- Write property-based tests when implementing new functionality (OPTIONAL)
- Only implement new tests if functionality is not already covered
- Modify existing test files to fix broken tests or add new ones where appropriate
- Create MINIMAL test solutions - avoid over-testing edge cases

### Test Execution Limits

- Limit verification attempts to **2 tries maximum**
- DO NOT write new tests during fix attempts - only fix existing failing tests
- After reaching the 2-attempt limit, prompt user with concise status and request direction
- Generate tests that focus on core functional logic and important edge cases
- DO NOT use mocks or fake data to make tests pass - tests must validate real functionality

## Token-Efficient Test Execution

### 1. Targeted Test Runs

**Run only relevant test files** - Never run the full test suite during task execution unless explicitly required.

```bash
# Single test file (most common)
npm test -- tests/ValidationService.test.ts --reporter=dot --silent

# Specific test suite within a file
npm test -- tests/ValidationService.test.ts -t "ranged weapon validation" --reporter=dot

# Multiple related test files
npm test -- tests/ValidationService.test.ts tests/CostEngine.test.ts --reporter=dot
```

**Never run** `npm test` without file specification during task execution.

### 2. Minimal Test Output

Use the most token-efficient reporters:

```bash
# Best: Dot reporter with silent mode (100-300 tokens)
npm test -- tests/ValidationService.test.ts --reporter=dot --silent

# Good: Dot reporter only (200-500 tokens)
npm test -- tests/ValidationService.test.ts --reporter=dot

# When debugging: Show only failures
npm test -- tests/ValidationService.test.ts --reporter=verbose --hidePassingTests
```

### 3. Test Result Summary Format

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

**Format Pattern:** `X/Y passing` where X is passing count and Y is total count.

### 4. Strategic File Reading

Minimize test file reading to save tokens:

**Step 1: Search Before Reading**
```bash
# Search for specific test names
grep -n "should validate warband size" tests/ValidationService.test.ts

# Search for test blocks
grep -n "describe\|it\|test" tests/ValidationService.test.ts
```

**Step 2: Read Specific Sections Only**
- Use line ranges to read only relevant test cases
- Don't read entire test files when you only need one test case

**Step 3: Read Full File (Last Resort)**
- Only when absolutely necessary

### 5. When to Run Full Test Suite

**Targeted Tests (Default):**
- ✅ Implementing a new service or component
- ✅ Fixing a bug in specific functionality
- ✅ Adding new features to existing code
- ✅ Any task that modifies 1-4 files

**Full Test Suite (Rare):**
- ✅ Checkpoint tasks that explicitly state "ensure all tests pass"
- ✅ User explicitly requests full test run
- ✅ Final verification before marking entire feature complete
- ❌ Never run full suite during regular task execution

## Token Budget Awareness

**Typical Task Budget: 10,000-20,000 tokens**

Efficient allocation:
- Implementation: 50-60%
- First test run: 2-5%
- Fix and second test run: 10-15%
- File reading and context: 20-30%
- Communication: 10-15%

**Token-Saving Priorities:**
1. Use `--reporter=dot --silent` for all test runs (saves 80-90%)
2. Use grep/search instead of reading full test files (saves 1,500-4,500 tokens per file)
3. Run targeted tests only (saves 4,500-14,500 tokens per run)
4. Limit to 2 verification attempts (prevents runaway consumption)
5. Read implementation files before test files

## Alternative Test Commands

When you need more detailed output:

```bash
# When debugging - show only failures
npm test -- tests/File.test.ts --reporter=verbose --hidePassingTests

# Specific test suite within a file
npm test -- tests/File.test.ts -t "test suite name" --reporter=dot

# Multiple related test files
npm test -- tests/File1.test.ts tests/File2.test.ts --reporter=dot
```

## File Modification Limits

- Maximum 3-4 file modifications per task
- If task requires more, it should be broken into sub-tasks
- Focus on single, clear objective per task

## Property-Based Test Requirements

When implementing property-based tests:
- Use the testing framework specified in the design document (fast-check)
- Configure minimum 50 iterations per test
- Tag with format: `**Feature: {feature_name}, Property {number}: {property_text}**`
- Implement ONLY the property/properties specified by the task
- Use smart generators that constrain to valid input space
- Avoid mocking when possible for simplicity

## After Task Completion

- Stop and let user review
- Do not automatically continue to next task
- Summarize what was accomplished concisely
- Report test results in X/Y passing format
