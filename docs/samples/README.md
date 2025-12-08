# Documentation Samples

This directory contains example templates and samples for creating documentation and specifications.

## Contents

### example-spec/

Template files for creating a new feature specification following the spec-driven development methodology:

- **requirements.md** - Template for EARS-compliant requirements with user stories and acceptance criteria
- **design.md** - Template for design document with correctness properties
- **tasks.md** - Template for implementation task list

## Usage

When creating a new spec:

1. Copy the `example-spec/` directory to `.kiro/specs/[your-feature-name]/`
2. Replace the template content with your actual feature details
3. Follow the EARS patterns for requirements
4. Define correctness properties in the design
5. Break down implementation into actionable tasks

See [.kiro/specs/WORKING-WITH-SPECS.md](../../.kiro/specs/WORKING-WITH-SPECS.md) for detailed guidance on working with specs.

## Related Documentation

- [Specs Directory](../../.kiro/specs/README.md) - Overview of all specifications
- [Working with Specs](../../.kiro/specs/WORKING-WITH-SPECS.md) - Detailed spec guidance
- [Core Project Info](../../.kiro/steering/core-project-info.md) - Documentation structure guidelines
