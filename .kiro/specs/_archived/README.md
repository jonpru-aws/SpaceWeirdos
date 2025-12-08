# Archived Specifications

This directory contains specifications that have been superseded, completed, or are no longer active.

**Note**: Historical implementation notes and update summaries have been moved to `docs/implementation-notes/` for better organization. This directory now contains only archived spec folders.

## space-weirdos-ui (Archived: December 6, 2025)

**Reason for archiving**: This monolithic UI spec was split into 5 focused specs for better organization and maintainability.

**Replaced by**:
1. `1-ui-design-system` - Design tokens and base styles
2. `2-warband-list-navigation` - List view and CRUD operations
3. `3-warband-properties-editor` - Warband settings editing
4. `4-weirdo-editor` - Character editing
5. `5-realtime-feedback-polish` - UX enhancements

**Original spec stats**:
- 12 requirements
- 14 correctness properties
- 60+ tasks
- Estimated 15-20 sessions

**New 5-spec approach**:
- 34 requirements (more granular)
- 24 correctness properties (more focused)
- ~155 tasks (better organized)
- Estimated 11-15 sessions (more efficient)

See `UI-SPECS-SUMMARY.md` in the specs directory for complete details on the new approach.

---

## space-weirdos-warband (Archived)

**Reason for archiving**: Original warband spec that was superseded by more focused specs.

**Status**: Completed or superseded by game rules and data persistence specs.

---

## code-refactoring (Archived)

**Reason for archiving**: Code refactoring spec completed or no longer needed.

**Status**: Completed.

---

## test-context-fixes (Archived)

**Reason for archiving**: Test context fixes spec completed.

**Status**: Completed.

---

## token-efficient-execution (Archived)

**Reason for archiving**: Token efficiency improvements spec completed or integrated into project standards.

**Status**: Completed. Principles integrated into `project-standards.md` and `efficient-testing.md` steering files.

---

## Notes

Archived specs are kept for reference but should not be used for new implementation. Always refer to the active specs in the main `.kiro/specs/` directory.
