# Working with Specs

This guide explains how to work with specification documents in this project.

## When Creating or Updating Specs

Always include the spec creation standards in your chat message:

```
#spec-creation-standards

I want to create a new feature for [feature description]...
```

or

```
#spec-creation-standards

I want to update the requirements for [feature name] to add...
```

This ensures the AI has access to:
- EARS and INCOSE requirements standards
- Design principles and correctness properties
- Task granularity and structure guidelines
- Property-based testing requirements

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

The steering file separation saves tokens:
- **Spec creation**: ~6,200 tokens (with `#spec-creation-standards`)
- **Task execution**: ~4,200 tokens (automatic)
- **General questions**: ~500 tokens (automatic)

This 30-92% reduction allows for longer sessions and more complex features.

## Example Workflows

### Creating a New Spec
```
#spec-creation-standards

I want to create a spec for a user authentication feature that includes:
- Login with username/password
- Session management
- Password reset functionality
```

### Updating an Existing Spec
```
#spec-creation-standards

Update the weirdo-editor spec to add a requirement for bulk editing multiple weirdos at once
```

### Executing Tasks
```
Execute task 2.1 from the ui-design-system spec
```

### Reviewing Specs
```
Review the requirements for the realtime-feedback-polish spec and suggest improvements
```

Note: For review, you may want to include `#spec-creation-standards` to get spec-specific guidance.
