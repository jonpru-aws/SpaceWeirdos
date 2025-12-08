# Spec Update Summary: Weirdo Cost Warning Threshold Change

## Overview

Updated the Space Weirdos specs to change the weirdo cost warning threshold from "within 10 points" to "within 3 points of applicable limit". This aligns the frontend UI behavior with the backend game rules validation service.

## Changes Made

### 1. Game Rules Spec (space-weirdos-game-rules)

**File: requirements.md**
- Added 5 new acceptance criteria (7.5-7.9) to Requirement 7
- Added glossary terms: "Validation Warning" and "Applicable Limit"
- Warning triggers when cost is within 3 points of applicable limit:
  - 18-20 points: warning for approaching 20-point limit
  - 23-25 points: warning for approaching 25-point limit (when no other 25-point weirdo exists)
- Clarified that once a 25-point weirdo exists, other weirdos warn at 18-20 points (20-point limit)

**File: design.md**
- Updated `ValidationResult` interface to include `warnings: ValidationWarning[]`
- Added `ValidationWarning` interface
- Added warning code: `COST_APPROACHING_LIMIT`
- Added prework analysis for new warning criteria (7.5-7.9)
- Added **Property 7a: Cost approaching limit warnings** with detailed logic for determining applicable limits based on warband context
- Clarified distinction between errors (blocking) and warnings (non-blocking)

**File: tasks.md**
- Added task 6.2: Implement warning generation in `validateWeirdoCost` method
- Added task 6.3: Write property test for warning generation (Property 7a)

### 2. Real-time Feedback Polish Spec (5-realtime-feedback-polish)

**File: requirements.md**
- Updated Requirement 2 acceptance criteria to reflect 3-point threshold
- Added criteria 2.1-2.4 for specific warning scenarios
- Added criterion 2.10 requiring use of backend ValidationService warnings
- Added glossary term: "Applicable Limit"

**File: design.md**
- Updated Property 2 to specify 3-point threshold for weirdos
- Added note in API response documentation about backend ValidationService warnings
- Clarified that frontend should use backend warnings for isApproachingLimit flag

**File: tasks.md**
- Added task 6.4: Update weirdo warning logic to use backend ValidationService
- Added task 6.5: Write unit tests for updated warning logic

## Key Behavioral Changes

### Before
- **Weirdo warnings**: Triggered when within 10 points of limit
- **Implementation**: Frontend calculated warnings independently
- **Threshold**: Fixed 10-point buffer for all weirdos

### After
- **Weirdo warnings**: Triggered when within 3 points of applicable limit
- **Implementation**: Backend ValidationService generates warnings, frontend displays them
- **Threshold**: Dynamic based on warband context:
  - No 25-point weirdo exists: warn at 18-20 (for 20-limit) or 23-25 (for 25-limit)
  - 25-point weirdo exists: other weirdos warn at 18-20 (20-limit only)
  - The 25-point weirdo itself: warns at 23-25 (25-limit)
- **Warband warnings**: Still use 15-point threshold (unchanged)

## Implementation Impact

### Backend (Game Rules)
1. Implement warning generation in `ValidationService.validateWeirdoCost()`
2. Return warnings in `ValidationResult` alongside errors
3. Warnings do not block validation (valid remains true)

### Frontend (UI)
1. Remove hardcoded 10-point threshold calculation
2. Use `warnings` array from backend API response
3. Set `isApproachingLimit` flag based on backend warnings
4. Update `WeirdoCostDisplay` to display backend warnings
5. Keep `WarbandCostDisplay` using 15-point threshold (unchanged)

### Files to Update
- `src/backend/services/ValidationService.ts` - Add warning generation
- `src/backend/routes/warbandRoutes.ts` - Update cost calculation endpoint to use backend warnings
- `src/frontend/components/WeirdoCostDisplay.tsx` - Remove hardcoded threshold, use backend warnings
- `src/frontend/hooks/useCostCalculation.ts` - Pass through backend warnings
- `tests/ValidationService.test.ts` - Add tests for warning generation
- `tests/WeirdoCostDisplay.test.tsx` - Update tests for new threshold

## Testing Requirements

### Backend Tests
- Property test for warning generation (Property 7a)
- Unit tests for 3-point threshold scenarios
- Verify warnings don't block validation

### Frontend Tests
- Unit tests for displaying backend warnings
- Integration tests for API warning flow
- Visual tests for warning indicators

## Migration Notes

This is a **breaking change** for the warning behavior:
- Users will see warnings later (at 3 points instead of 10 points)
- More precise warning system aligned with game rules
- Better separation of concerns (backend handles game logic)

## Next Steps

1. Implement backend warning generation (task 6.2 in game rules spec)
2. Write property test for warnings (task 6.3 in game rules spec)
3. Update frontend to use backend warnings (task 6.4 in realtime feedback spec)
4. Update frontend tests (task 6.5 in realtime feedback spec)
5. Verify end-to-end warning flow works correctly

## Related Specs

- `.kiro/specs/space-weirdos-game-rules/` - Backend game logic
- `.kiro/specs/5-realtime-feedback-polish/` - Frontend warning display
- `.kiro/specs/6-frontend-backend-api-separation/` - API communication layer
