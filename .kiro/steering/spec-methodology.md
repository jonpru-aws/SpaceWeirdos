---
inclusion: manual
---

# Spec Methodology Standards

This file contains methodology standards for creating requirements and design documents following spec-driven development.

## Requirements Standards

All requirements must follow EARS (Easy Approach to Requirements Syntax) patterns:
- **Ubiquitous**: THE <system> SHALL <response>
- **Event-driven**: WHEN <trigger>, THE <system> SHALL <response>
- **State-driven**: WHILE <condition>, THE <system> SHALL <response>
- **Unwanted event**: IF <condition>, THEN THE <system> SHALL <response>
- **Optional feature**: WHERE <option>, THE <system> SHALL <response>

Requirements must also comply with INCOSE quality rules:
- Use active voice
- Avoid vague terms ("quickly", "adequate")
- No escape clauses ("where possible")
- No negative statements ("SHALL not...")
- One thought per requirement
- Explicit and measurable conditions and criteria
- Consistent, defined terminology throughout
- No pronouns ("it", "them")
- No absolutes ("never", "always", "100%")
- Solution-free (focus on what, not how)
- Realistic tolerances for timing and performance

## Design Principles

Designs must include:
- Clear architecture and component boundaries
- Correctness properties for property-based testing
- Each property must start with "For any..." (universal quantification)
- Properties must reference specific requirements they validate

### Common Correctness Patterns

1. **Invariants**: Properties that remain constant despite changes
   - Examples: `obj.start <= obj.end`, `tree.is_balanced()`

2. **Round Trip Properties**: Combining an operation with its inverse
   - Examples: `decode(encode(x)) == x`, `parse(format(x)) == x`
   - Always test these for serializers and parsers

3. **Idempotence**: Operations where doing it twice = doing it once
   - Examples: `distinct(distinct(x)) == distinct(x)`

4. **Metamorphic Properties**: Relationships between components
   - Examples: `len(filter(x)) < len(x)`

5. **Model Based Testing**: Optimized vs standard implementation

6. **Confluence**: Order of operations doesn't matter

7. **Error Conditions**: Generate bad inputs and ensure proper error handling

## Property-Based Testing Requirements

- Configure each property-based test to run a minimum of **50 iterations**
- Tag each property-based test with a comment linking it to the design document
- Use this exact format: `**Feature: {feature_name}, Property {number}: {property_text}**`
- Example: `**Feature: user-auth, Property 1: Round trip consistency**`
- Each correctness property from the design document must be implemented by a single property-based test
- Property tests should use smart generators that constrain inputs to valid ranges
