# Changelog

All notable changes to the Space Weirdos Warband Builder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Context-aware warning system that adapts to warband composition
- Intelligent warning thresholds (within 3 points of applicable limits)
- Backend ValidationService integration for consistent warning generation
- Premium weirdo slot messaging for 25-point limit warnings
- Comprehensive test suite for warning logic scenarios

### Changed
- Warning threshold reduced from 10 points to 3 points for more precise feedback
- Warning logic now considers whether a 25-point weirdo already exists in the warband
- Frontend now uses backend-generated warnings instead of hardcoded calculations
- ValidationService now returns ValidationResult with both errors and warnings
- Updated all documentation to reflect new warning system functionality

### Technical Details
- Updated `ValidationService.generateWeirdoCostWarnings()` with context-aware logic
- Modified `ValidationResult` interface to include `warnings: ValidationWarning[]`
- Enhanced API endpoints to return warning information
- Added comprehensive test coverage for all warning scenarios
- Updated 89 existing tests to work with new ValidationResult structure

## Previous Releases

### Frontend-Backend API Separation
- Implemented clean separation between frontend and backend
- Added dedicated API layer with type-safe client
- Consistent error handling and response structures

### Real-time Feedback Polish
- Sub-100ms cost calculations with caching
- Sticky cost displays that remain visible while scrolling
- Optimistic updates for seamless user interaction
- Warning indicators for approaching limits

### Core Features
- Comprehensive Space Weirdos game rule validation
- Real-time cost calculation with faction modifiers
- Warband management with 75/125 point limits
- Equipment, weapon, and psychic power selection
- Leader trait system
- Responsive design for desktop and mobile
