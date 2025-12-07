---
inclusion: always
---

# Core Project Information

## Technology Stack

### Frontend
- **Language:** TypeScript
- **Framework:** React
- **Purpose:** Web interface for user interaction

### Backend
- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express
- **Purpose:** Business logic, in-memory database, JSON file I/O

### Data Storage
- **In-Memory Database:** JavaScript objects, Maps, and Sets
- **Persistence:** JSON files on local filesystem
- **Configuration:** JSON files for user settings and application parameters

### Testing
- **Unit Testing:** Vitest
- **Property-Based Testing:** fast-check (minimum 50 iterations per test)
- **Test Location:** Co-located with source files using `.test.ts` suffix

### Key Libraries
- **File I/O:** Node.js `fs` module (promises API)
- **JSON Handling:** Native `JSON.parse()` and `JSON.stringify()`
- **HTTP Server:** Express.js

## Code Style

- Use clear, descriptive variable and function names
- Follow TypeScript and React best practices
- Keep functions focused and single-purpose
- Add comments for complex logic
- Use async/await for asynchronous operations
- Prefer functional programming patterns where appropriate
- Use proper TypeScript types (avoid `any`)
- Follow ESLint and Prettier configurations

## Documentation

- Document public APIs and interfaces
- Keep README files up to date
- Include examples where helpful
