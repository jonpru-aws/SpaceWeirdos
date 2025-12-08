# Working with Specs

This guide explains how to work with specification documents in this project.

## When Creating or Updating Specs

Include the appropriate steering files based on what you're working on:

### For Requirements and Design Work

```
#spec-methodology

I want to create a new feature for [feature description]...
```

This provides:
- EARS and INCOSE requirements standards
- Design principles and correctness properties
- Common correctness patterns
- Property-based testing requirements

### For Task Planning

```
#spec-task-planning

Help me break down the implementation tasks for [feature name]...
```

This provides:
- Task granularity and structure guidelines
- Task breakdown criteria
- Implementation/testing separation patterns

### For Complete Spec Creation

```
#spec-methodology #spec-task-planning

I want to create a complete spec for [feature description]...
```

This provides all spec-related guidance for the full workflow.

## Current Architecture Patterns

### API-First Design
All frontend-backend communication uses dedicated HTTP API endpoints:
- Frontend components never directly access backend services
- Consistent request/response structures with proper error handling
- Type-safe API client layer (`src/frontend/services/apiClient.ts`)
- Clear separation enables independent testing and development

### Context-Aware Validation
Intelligent validation system that adapts to warband state:
- Backend ValidationService generates warnings based on game rules
- Context-aware logic considers existing 25-point weirdos
- Warnings trigger within 3 points of applicable limits
- Clear messaging helps users understand which limits apply

### Real-time Feedback
User interface provides immediate visual feedback:
- Cost calculations complete in <100ms with caching
- Context-aware warning indicators appear when approaching limits
- Sticky displays remain visible during scrolling
- Optimistic updates provide seamless interaction

## When Executing Tasks from Specs

No special inclusion needed! The task execution standards are automatically loaded:
- Task execution guidelines
- Testing strategy and limits
- Token-efficient practices
- File modification limits

Simply reference the task you want to execute:

```
Execute task 2.1 from the ui-design-system spec
```

or

```
Continue with the next task in the weirdo-editor spec
```

## Spec Document Structure

Each spec should have three documents:

### 1. requirements.md
- Introduction and glossary
- User stories with EARS-compliant acceptance criteria
- Must follow INCOSE quality rules

### 2. design.md
- Architecture and component design
- Correctness properties (starting with "For any...")
- Each property references specific requirements
- Testing strategy

### 3. tasks.md
- Implementation plan broken into focused tasks
- Each task modifies 3-4 files maximum
- Testing tasks marked optional with `*` suffix
- Property-based test tasks reference design properties

## Best Practices

### Creating Requirements
- Use EARS patterns (WHEN/THEN, WHILE, IF/THEN, WHERE)
- Follow INCOSE rules (active voice, measurable, no vague terms)
- Define all terms in glossary
- Focus on what, not how

### Creating Design
- Include correctness properties for property-based testing
- Use "For any..." universal quantification
- Reference specific requirements each property validates
- Consider common patterns: invariants, round-trip, idempotence

### Creating Tasks
- Keep tasks small (3-4 files, <15,000 tokens)
- Separate implementation from testing
- Mark test tasks optional with `*`
- Reference specific requirements
- Include cleanup task at the end

## Token Efficiency

The steering file separation provides granular control:
- **Complete spec creation**: ~4,250 tokens (with `#spec-methodology #spec-task-planning`)
- **Requirements/design only**: ~3,450 tokens (with `#spec-methodology`)
- **Task planning only**: ~3,050 tokens (with `#spec-task-planning`)
- **Task execution**: ~2,250 tokens (automatic)
- **General questions**: ~450 tokens (automatic)

This granular approach saves 800+ tokens when you only need methodology or planning guidance, allowing for longer sessions and more complex features.

## Example Workflows

### Creating a New Spec (Full Workflow)
```
#spec-methodology #spec-task-planning

I want to create a spec for a user authentication feature that includes:
- Login with username/password
- Session management
- Password reset functionality
```

### Writing Requirements and Design
```
#spec-methodology

I want to create requirements and design for a bulk editing feature
```

### Planning Implementation Tasks
```
#spec-task-planning

Help me break down the implementation tasks for the authentication feature
```

### Updating Requirements
```
#spec-methodology

Update the weirdo-editor spec to add a requirement for bulk editing multiple weirdos at once
```

### Executing Tasks
```
Execute task 2.1 from the ui-design-system spec
```

No steering files needed - task execution standards are automatically included.

### Reviewing Specs
```
#spec-methodology

Review the requirements for the realtime-feedback-polish spec and suggest improvements
```
