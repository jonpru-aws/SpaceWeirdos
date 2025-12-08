# Space Weirdos Warband Builder - Documentation

Welcome to the documentation for the Space Weirdos Warband Builder! This directory contains comprehensive guides for understanding, using, and developing the application.

## Quick Links

### For Users
- **[Features Guide](FEATURES.md)** - Complete feature overview and capabilities
- **[Warning System Guide](WARNING-SYSTEM.md)** - Understanding the context-aware warning system

### For Developers
- **[Architecture Overview](ARCHITECTURE.md)** - System design and architectural patterns
- **[API Documentation](API-DOCUMENTATION.md)** - Backend API endpoints and usage
- **[Frontend-Backend API Separation](FRONTEND-BACKEND-API-SEPARATION.md)** - API-based architecture guide
  - [Quick Reference](API-SEPARATION-QUICK-REFERENCE.md) - Common patterns and usage
- **[UI Design System](UI-DESIGN-SYSTEM.md)** - CSS design tokens, base styles, and utilities
- **[Implementation Notes](implementation-notes/)** - Feature implementation details and summaries
- **[Testing Guide](../TESTING.md)** - Testing strategies and guidelines
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute to the project

### Project Information
- **[Changelog](../CHANGELOG.md)** - Version history and recent updates
- **[Release Notes](release-notes/)** - Detailed release notes by version
- **[Main README](../README.md)** - Project overview and getting started
- **[Specifications](../.kiro/specs/README.md)** - Detailed feature specifications

## Documentation Overview

### Features Guide
Comprehensive overview of all features including:
- Warband management and customization
- Real-time cost calculation
- Context-aware validation and warnings
- User interface components
- Game rules implementation

### Warning System Guide
Detailed explanation of the intelligent warning system:
- How context-aware warnings work
- Warning scenarios and examples
- Visual indicators and messaging
- Game rules reference

### Architecture Overview
System design and technical architecture:
- Layered architecture with API-first design
- Component structure and organization
- Data flow and state management
- Error handling and testing strategy
- Performance considerations

### API Documentation
Complete API reference:
- Endpoint descriptions and usage
- Request/response formats
- Error codes and handling
- Context-aware warning integration
- Type definitions and examples

## Key Concepts

### Context-Aware Validation

The warband builder features an intelligent validation system that adapts to your warband composition:

**What It Does:**
- Analyzes your warband to determine which limits apply to each weirdo
- Generates warnings when approaching applicable limits (within 3 points)
- Provides clear messaging about why warnings appear
- Ensures consistency with Space Weirdos game rules

**Why It Matters:**
- No confusing warnings for limits that don't apply
- Better understanding of point allocation options
- Improved user experience with relevant feedback
- Confidence that your warband follows the rules

### API-First Design

All frontend-backend communication goes through HTTP API endpoints:

**Benefits:**
- Clear separation of concerns
- Easier testing through API mocking
- Type safety across the boundary
- Independent frontend/backend development

### Real-Time Feedback

The UI provides immediate visual feedback:

**Features:**
- Sub-100ms cost calculations with caching
- Context-aware warning indicators
- Sticky displays that remain visible
- Smooth animations and transitions

## Getting Started

### For Users
1. Read the [Main README](../README.md) for installation and setup
2. Review the [Features Guide](FEATURES.md) to understand capabilities
3. Check the [Warning System Guide](WARNING-SYSTEM.md) to understand validation

### For Developers
1. Read the [Architecture Overview](ARCHITECTURE.md) to understand the system
2. Review the [API Documentation](API-DOCUMENTATION.md) for backend integration
3. Check the [Testing Guide](../TESTING.md) for testing strategies
4. See the [Contributing Guide](../CONTRIBUTING.md) for development workflow

### For Spec-Driven Development
1. Review [Specifications](../.kiro/specs/README.md) for the development methodology
2. Check [Working with Specs](../.kiro/specs/WORKING-WITH-SPECS.md) for guidance
3. See individual spec directories for detailed requirements and design

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + TypeScript + Node.js
- **Testing**: Vitest + fast-check (property-based testing)
- **Data**: In-memory database with JSON file persistence

## Project Status

**Current Version**: 1.0.0

**Recent Updates**:
- ✅ Context-aware warning system implemented
- ✅ Frontend-backend API separation complete
- ✅ Real-time feedback polish complete
- ✅ 140+ tests passing (100% success rate)
- ✅ Comprehensive documentation complete

## Support and Contribution

### Getting Help
- Check the relevant documentation guide
- Review the [Main README](../README.md) for common issues
- See the [Testing Guide](../TESTING.md) for test-related questions

### Contributing
- Read the [Contributing Guide](../CONTRIBUTING.md)
- Follow the spec-driven development methodology
- Ensure all tests pass before submitting changes
- Update documentation for new features

## License

ISC - See [LICENSE](../LICENSE) for details

---

**Happy warband building!** 🚀
