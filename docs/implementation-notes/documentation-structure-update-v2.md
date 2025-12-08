# Spec Documentation Structure Update

## Summary

Updated the spec directory structure to follow the new documentation guidelines established in the steering files. This includes updating Spec 6 (Frontend-Backend API Separation) and the main `.kiro/specs` directory.

## Changes Made

### Files Moved to docs/

1. **API_SEPARATION_GUIDE.md** → **docs/FRONTEND-BACKEND-API-SEPARATION.md**
   - Complete architecture and usage guide
   - Acceptable vs prohibited imports
   - API client usage patterns
   - Hook documentation with examples
   - Caching and debouncing strategies
   - Architecture diagrams
   - Migration guide from local calculations
   - Performance optimization tips
   - Testing strategies

2. **QUICK_REFERENCE.md** → **docs/API-SEPARATION-QUICK-REFERENCE.md**
   - Quick reference for common patterns
   - Import rules
   - Hook usage examples
   - Performance settings
   - Troubleshooting guide

### Files Updated

1. **.kiro/specs/6-frontend-backend-api-separation/README.md**
   - Restructured to match new spec README format
   - Added links to documentation in docs/ folder
   - Simplified content to focus on spec overview
   - Removed detailed implementation content (now in docs/)
   - Added "Core Spec Files" section
   - Added "Documentation" section with links

2. **docs/README.md**
   - Added links to new API separation documentation
   - Organized under "For Developers" section

### Files Removed from Spec Directory

- `.kiro/specs/6-frontend-backend-api-separation/API_SEPARATION_GUIDE.md` (moved to docs/)
- `.kiro/specs/6-frontend-backend-api-separation/QUICK_REFERENCE.md` (moved to docs/)

### Final Spec Directory Structure

```
.kiro/specs/6-frontend-backend-api-separation/
├── README.md                    # Spec overview with links to docs/
├── requirements.md              # EARS-compliant requirements (CORE)
├── design.md                    # Design with correctness properties (CORE)
└── tasks.md                     # Implementation task list (CORE)
```

## Documentation Structure Guidelines Followed

✅ **Core spec files remain in spec directory:**
- requirements.md
- design.md
- tasks.md
- README.md (with links to detailed docs)

✅ **Detailed documentation moved to docs/ folder:**
- Implementation guides
- Architecture documentation
- Quick references
- Usage examples

✅ **Spec README updated to:**
- Link to detailed documentation in docs/
- Provide spec overview
- List core spec files
- Show status and key features

✅ **docs/README.md updated to:**
- Include links to new documentation
- Organize documentation by audience

## Benefits

1. **Centralized Documentation**: All detailed technical documentation in one place (docs/)
2. **Cleaner Spec Directory**: Only core spec files remain
3. **Better Navigation**: Clear links from spec to detailed docs
4. **Consistent Structure**: Matches pattern established for other specs
5. **Easier Maintenance**: Single location for implementation documentation

## Main Specs Directory Updates

### Files Updated

1. **.kiro/specs/README.md**
   - Restructured to provide clear overview of all specs
   - Added "Spec Directory Structure" section
   - Added "Active Specs" section with status and purpose for each spec
   - Updated "Documentation" section with links to docs/ folder
   - Removed detailed "Recent Updates" content (now in docs/)
   - Simplified "Getting Started" section

2. **.kiro/specs/WORKING-WITH-SPECS.md**
   - No changes needed (appropriate for specs directory)
   - Provides guidance on working with specs
   - References steering files correctly

### Files Archived

1. **UI-ARCHITECTURE-UPDATE.md** → **_archived/UI-ARCHITECTURE-UPDATE.md**
   - Historical update document
   - Moved to _archived directory for reference

### Files Removed

1. **UI-SPECS-SUMMARY.md**
   - Content consolidated into README.md
   - Removed to avoid duplication

### Final .kiro/specs Directory Structure

```
.kiro/specs/
├── _archived/                   # Historical documents
│   └── UI-ARCHITECTURE-UPDATE.md
├── 1-ui-design-system/          # Spec directories
├── 2-warband-list-navigation/
├── 3-warband-properties-editor/
├── 4-weirdo-editor/
├── 5-realtime-feedback-polish/
├── 6-frontend-backend-api-separation/
├── space-weirdos-data-persistence/
├── space-weirdos-game-rules/
├── README.md                    # Specs directory overview
└── WORKING-WITH-SPECS.md        # Guidance for working with specs
```

## Documentation Structure Guidelines Followed

✅ **Detailed documentation in docs/ folder:**
- Implementation guides
- Architecture documentation
- API documentation
- Feature guides
- System guides

✅ **Spec directory contains:**
- README.md (overview and index)
- WORKING-WITH-SPECS.md (spec-specific guidance)
- Individual spec directories with core files
- _archived/ for historical documents

✅ **Each spec directory contains:**
- README.md (overview with links to docs/)
- requirements.md (CORE)
- design.md (CORE)
- tasks.md (CORE)

## Benefits

1. **Centralized Documentation**: All detailed technical documentation in docs/
2. **Cleaner Spec Directory**: Only essential spec files and guidance
3. **Better Navigation**: Clear index in README.md
4. **Consistent Structure**: All specs follow same pattern
5. **Easier Maintenance**: Single location for implementation documentation
6. **Historical Preservation**: Archived documents preserved for reference

## Release Notes Organization

### Changes Made

1. **Updated core-project-info.md steering documentation:**
   - Added requirement for release notes to be in `docs/release-notes/` directory
   - Added release notes to required docs/ folder content
   - Added release notes directory to docs/ structure example
   - Added "Release Notes Standards" section with naming and content guidelines

2. **Created release-notes directory:**
   - Created `docs/release-notes/` directory

3. **Moved existing release notes:**
   - `.kiro/docs/RELEASE_NOTES_v1.0.0.md` → `docs/release-notes/v1.0.0.md`

4. **Updated docs/README.md:**
   - Added link to release notes directory

### Release Notes Standards

- **Location**: `docs/release-notes/`
- **Naming**: `v{major}.{minor}.{patch}.md` (e.g., `v1.0.0.md`)
- **Content**: Features, bug fixes, breaking changes, upgrade instructions
- **Linking**: Link from CHANGELOG.md to detailed release notes

## Implementation Notes Organization

### Changes Made

1. **Updated core-project-info.md steering documentation:**
   - Added requirement for implementation summaries to be in `docs/implementation-notes/` directory
   - Updated docs/ structure example to include implementation-notes directory
   - Added "Implementation Notes Standards" section with naming and content guidelines

2. **Created implementation-notes directory:**
   - Created `docs/implementation-notes/` directory

3. **Moved existing implementation summaries:**
   - `docs/IMPLEMENTATION-SUMMARY.md` → `docs/implementation-notes/context-aware-warnings.md`
   - `docs/SPEC-UPDATE-SUMMARY.md` → `docs/implementation-notes/warning-threshold-update.md`

4. **Updated docs/README.md:**
   - Replaced individual implementation summary links with link to implementation-notes directory

5. **Updated .kiro/specs/README.md:**
   - Updated documentation links to point to implementation-notes directory

### Implementation Notes Standards

- **Location**: `docs/implementation-notes/`
- **Naming**: Descriptive kebab-case: `feature-name.md` (e.g., `context-aware-warnings.md`)
- **Content**: Implementation details, design decisions, technical approach, lessons learned
- **Purpose**: Document how features were implemented, not just what they do
- **Organization**: One file per major feature or implementation effort

## Sample Templates Organization

### Changes Made

1. **Created samples directory:**
   - Created `docs/samples/` directory for example templates

2. **Moved example spec templates:**
   - `.kiro/docs/example-feature/` → `docs/samples/example-spec/`
   - Renamed for clarity (example-feature → example-spec)

3. **Created samples README:**
   - Added `docs/samples/README.md` explaining the purpose and usage of templates
   - Included links to spec guidance documentation

4. **Updated core-project-info.md:**
   - Added samples directory to docs/ structure example

### Sample Templates Purpose

The `docs/samples/example-spec/` directory contains template files for creating new specifications:
- `requirements.md` - EARS-compliant requirements template
- `design.md` - Design document with correctness properties template
- `tasks.md` - Implementation task list template

These templates help maintain consistency when creating new feature specifications.

## Related Documentation

- [Core Project Info](.kiro/steering/core-project-info.md) - Documentation structure guidelines
- [Specs README](.kiro/specs/README.md) - Specs directory overview
- [Working with Specs](.kiro/specs/WORKING-WITH-SPECS.md) - Spec guidance
- [Frontend-Backend API Separation Guide](docs/FRONTEND-BACKEND-API-SEPARATION.md) - Complete implementation guide
- [API Separation Quick Reference](docs/API-SEPARATION-QUICK-REFERENCE.md) - Quick reference guide
- [Release Notes](docs/release-notes/) - Version release notes
- [Implementation Notes](docs/implementation-notes/) - Feature implementation details
- [Sample Templates](docs/samples/) - Example spec templates
