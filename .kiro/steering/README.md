# Steering Files Organization

This directory contains context-specific steering files optimized for token efficiency.

## File Structure

### Always Included (Automatic)

**core-project-info.md**
- Technology stack overview
- Key libraries and frameworks
- Basic code style guidelines
- ~450 tokens

**task-execution-standards.md**
- Task execution guidelines
- Testing strategy and limits
- Token-efficient practices
- File modification limits
- Test commands and alternatives
- ~1,800 tokens

**Total Always-Included: ~2,250 tokens**

### Manual Inclusion (Use `#spec-methodology` or `#spec-task-planning`)

**spec-methodology.md**
- EARS and INCOSE requirements standards
- Design principles and correctness properties
- Common correctness patterns
- Property-based testing requirements
- ~1,200 tokens

**spec-task-planning.md**
- Task granularity and structure
- Task breakdown criteria
- Implementation/testing separation
- ~800 tokens

## Usage Guidelines

### When Creating or Updating Specs

**For requirements and design:**
```
#spec-methodology

I want to create a new feature for user authentication...
```

**For task planning:**
```
#spec-task-planning

Help me break down the implementation tasks...
```

**For complete spec creation:**
```
#spec-methodology #spec-task-planning

I want to create a complete spec for...
```

### When Executing Tasks
The task execution standards are automatically included. No action needed.

### When Asking General Questions
Only core project info is included automatically, keeping token usage minimal.

## Token Savings

**Before Optimization:**
- Spec creation: ~4,500 tokens (core + task + testing + spec standards)
- Task execution: ~2,500 tokens (core + task + testing)
- General questions: ~500 tokens (core only)

**After Optimization:**
- Spec creation (full): ~4,250 tokens (core + task + methodology + planning)
- Spec creation (requirements/design): ~3,450 tokens (core + task + methodology)
- Spec creation (tasks only): ~3,050 tokens (core + task + planning)
- Task execution: ~2,250 tokens (core + task)
- General questions: ~450 tokens (core only)

**Savings:**
- Task execution: **10% additional reduction** (250 tokens saved per task)
- Spec creation: **Granular control** (save 800 tokens when only methodology needed)
- Over 10 tasks: **2,500+ additional tokens saved**

## Maintenance

When updating standards:
- **Technology changes**: Update `core-project-info.md`
- **Testing practices**: Update `task-execution-standards.md`
- **Requirements/design methodology**: Update `spec-methodology.md`
- **Task planning patterns**: Update `spec-task-planning.md`
- Keep files focused and avoid duplication
