---
inclusion: manual
---

# Steering Files

Steering files provide context and instructions that guide Kiro's behavior in this workspace.

## What are Steering Files?

Steering files allow you to:
- Define project standards and conventions
- Provide useful information about the project
- Include instructions for common tasks (build, test, deploy)

## Inclusion Modes

Steering files can be:
- **Always included** (default): Included in all interactions
- **Conditionally included**: Included when specific files are read (using front-matter)
- **Manually included**: Included only when referenced with '#' in chat (using front-matter)

## Example Front-Matter

```markdown
---
inclusion: fileMatch
fileMatchPattern: 'src/**/*.ts'
---
```

or

```markdown
---
inclusion: manual
---
```

## File References

You can reference other files using: `#[[file:relative_file_name]]`
