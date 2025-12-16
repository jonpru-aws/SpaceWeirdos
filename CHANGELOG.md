# Changelog

All notable changes to the Space Weirdos Warband Builder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.9.0] - 2025-12-16

### Added
- **Comprehensive Code Duplication Analysis System** with advanced static analysis capabilities
- **Multi-Type Duplication Detection** including exact match, functional, pattern, configuration, validation, cache, and error handling analysis
- **Specialized Analysis Components** for singleton patterns, service consolidation, cache consolidation, validation consolidation, configuration management, and dependency injection
- **Intelligent Recommendation Engine** with impact analysis, complexity estimation, risk assessment, and strategy generation
- **Command Line Interface** with configurable analysis options and multiple output formats
- **Space Weirdos Codebase Analysis** revealing 73 duplication patterns across 101 files with 3,840 lines of potential savings
- **Comprehensive Documentation** including architecture guide, usage guide, detailed findings, and implementation roadmap
- **Quality Metrics & Projections** showing path from 10.6% duplication to <5% with improved maintainability

### Changed
- **Analysis Architecture** with modular, extensible design supporting multiple detection algorithms
- **Configuration Support** for analysis scope, similarity thresholds, and detector selection
- **Performance Optimizations** with efficient AST parsing, parallel analysis, and memory-efficient processing
- **Integration Capabilities** for CI/CD pipelines, development workflow, and quality monitoring

### Technical Details
- **Analysis Engine**: Comprehensive static analysis with TypeScript Compiler API integration
- **Detection Algorithms**: Exact matching, structural similarity, semantic similarity, and configuration pattern analysis
- **Specialized Analyzers**: Domain-specific analysis for singletons, services, caches, validation, configuration, and dependency injection
- **Quality Metrics**: Duplication percentage, maintainability index, technical debt ratio calculations
- **Optimization Roadmap**: 4-phase implementation plan over 26 weeks with 458 hours estimated effort

### Analysis Results Summary
- **Total Files Analyzed**: 101 source files containing 36,162 lines of code
- **Duplication Patterns Found**: 73 (2 high-severity, 71 medium-severity)
- **Potential Savings**: 3,840 lines of code (10.6% of codebase)
- **Critical Issues**: Configuration management fragmentation (26 files), validation logic proliferation (27 files)
- **Optimization Opportunities**: Service layer duplications (70 instances), UI component patterns (50+ instances)

## [1.8.0] - 2024-12-15

### Added
- **Centralized Configuration Management System** with ConfigurationManager singleton
- **Environment-Specific Configuration** with automatic detection and optimization
- **Comprehensive Configuration Validation** with detailed error messages and fallback recovery
- **Environment Variable Support** for all configuration values with automatic type conversion
- **Configuration Sections** for Server, API, Cache, Cost, Validation, Environment, and File Operations
- **Advanced Error Handling** with configuration-specific error classes and detailed validation
- **Performance Optimizations** with environment-specific cache TTLs and settings
- **Configuration Examples** for development, production, and test environments

### Changed
- **Migrated from Legacy Constants** to centralized configuration system
- **Replaced hardcoded values** with ConfigurationManager-managed configuration
- **Enhanced cache management** with configuration-driven cache factory
- **Improved environment detection** with intelligent fallback behavior
- **Updated all services** to use centralized configuration instead of constants
- **Modernized configuration architecture** with type-safe access patterns

### Removed
- **Legacy constant files**: `src/backend/constants/costs.ts` and `src/backend/constants/validationMessages.ts`
- **Hardcoded configuration values** throughout the application
- **Manual cache configuration** in favor of configuration-managed caches

### Technical Details
- **ConfigurationManager**: Singleton class providing centralized, type-safe configuration access
- **Environment-Specific Overrides**: Automatic configuration optimization based on NODE_ENV
- **Comprehensive Validation**: Type checking, range validation, and format validation for all configuration values
- **Fallback Recovery**: Graceful degradation with fallback mechanisms for critical configuration failures
- **Migration Support**: Backward compatibility during transition from legacy constants
- **Performance Tuning**: Environment-specific cache TTLs and performance optimizations

### Breaking Changes
- **Configuration System Migration**: All direct constant imports must be replaced with ConfigurationManager usage
- **Environment Variables**: New required environment variables for production deployment
- **Service Constructors**: Updated to use configuration-managed values instead of hardcoded constants

## [1.7.0] - 2024-12-10

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
