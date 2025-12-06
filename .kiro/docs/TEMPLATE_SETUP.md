# Template Setup Guide

This project is a template for TypeScript/React/Express applications with property-based testing and spec-driven development.

## 🚀 Quick Start for New Projects

### 1. Copy Template

Copy this entire directory to your new project location:

```bash
# Example
cp -r "Space Weirdos" "my-new-project"
cd "my-new-project"
```

### 2. Customize Project Identity

Update the following files with your project-specific information:

#### package.json
```json
{
  "name": "your-project-name",           // Change this
  "version": "1.0.0",
  "description": "Your project description",  // Change this
  "author": "Your Name",                 // Change this
  "license": "MIT"                       // Change if needed
}
```

#### README.md
- Replace the title (line 1) with your project name
- Update the description to match your project
- Keep the structure and instructions

#### data/config.json
```json
{
  "appName": "Your App Name",            // Change this
  "version": "1.0.0",
  "settings": {
    // Add your project-specific settings
  }
}
```

#### src/frontend/index.html
```html
<title>Your App Name</title>             <!-- Change this -->
```

### 3. Initialize Git Repository

```bash
# Remove existing git history (if any)
rm -rf .git

# Initialize new repository
git init
git add .
git commit -m "Initial commit from template"
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Verify Setup

```bash
# Run tests
npm test

# Start development servers
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
```

## 📋 Template Checklist

Use this checklist when setting up a new project:

- [ ] Copy template to new directory
- [ ] Update `package.json` (name, description, author)
- [ ] Update `README.md` title and description
- [ ] Update `data/config.json` with project settings
- [ ] Update `src/frontend/index.html` title
- [ ] Initialize new git repository
- [ ] Run `npm install`
- [ ] Run `npm test` to verify setup
- [ ] Delete or update `.kiro/steering/setup-complete.md` (project-specific)
- [ ] Remove or update this `TEMPLATE_SETUP.md` file

## 🏗️ Template Structure

This template provides:

### Core Infrastructure
- **TypeScript** configuration for frontend and backend
- **React** with Vite for fast development
- **Express** server with JSON file I/O
- **Vitest** + **fast-check** for testing
- **ESLint** + **Prettier** for code quality

### Spec-Driven Development
- `.kiro/specs/` - Feature specifications directory
- `.kiro/steering/` - Project standards and guidelines
- Example spec structure in `example-feature/`

### Project Organization
```
your-project/
├── src/
│   ├── backend/          # Express server
│   │   └── server.ts     # Main server with in-memory DB
│   └── frontend/         # React application
│       ├── App.tsx       # Main component
│       ├── main.tsx      # Entry point
│       ├── index.html    # HTML template
│       └── index.css     # Global styles
├── tests/                # Test files
│   └── example.test.ts   # Example tests (unit + property)
├── data/                 # JSON configuration files
│   └── config.json       # Runtime configuration
├── .kiro/
│   ├── specs/            # Feature specifications
│   │   └── example-feature/  # Template spec
│   └── steering/         # Project standards
│       └── project-standards.md
├── dist/                 # Build output (generated)
├── node_modules/         # Dependencies (generated)
└── [config files]        # TypeScript, Vite, ESLint, etc.
```

## 🎯 Development Workflow

### 1. Create Feature Spec
```bash
# Create new feature directory
mkdir -p .kiro/specs/my-feature

# Create spec files
touch .kiro/specs/my-feature/requirements.md
touch .kiro/specs/my-feature/design.md
touch .kiro/specs/my-feature/tasks.md
```

### 2. Define Requirements
Follow EARS format in `requirements.md`:
- User stories
- Acceptance criteria
- Glossary of terms

### 3. Create Design
In `design.md`:
- Architecture overview
- Component interfaces
- Correctness properties (for property-based testing)
- Testing strategy

### 4. Break Down Tasks
In `tasks.md`:
- Implementation tasks
- Property-based test tasks
- Integration tasks

### 5. Execute Tasks
Implement one task at a time, following the spec.

## 🧪 Testing Philosophy

This template uses **dual testing approach**:

### Unit Tests
- Test specific examples
- Test edge cases
- Test error conditions
- Fast and focused

### Property-Based Tests
- Test universal properties
- Generate random inputs (minimum 50 iterations)
- Catch edge cases you didn't think of
- Tag with: `**Feature: {name}, Property {n}: {description}**`

Example:
```typescript
it('Property 1: Addition is commutative', () => {
  // **Feature: calculator, Property 1: Addition is commutative**
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (a, b) => {
      return a + b === b + a;
    }),
    { numRuns: 50 }
  );
});
```

## 🔧 Customization Options

### Change Ports
Edit these files:
- Backend port: `src/backend/server.ts` (line 6: `const PORT = 3001`)
- Frontend port: `vite.config.ts` (line 10: `port: 3000`)

### Add Dependencies
```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name
```

### Modify Build Output
Edit `tsconfig.backend.json` and `tsconfig.frontend.json`:
```json
{
  "compilerOptions": {
    "outDir": "./your-custom-path"
  }
}
```

### Change Test Framework
Currently uses Vitest. To switch to Jest:
1. Replace Vitest with Jest in `package.json`
2. Update `vitest.config.ts` to `jest.config.ts`
3. Update test scripts in `package.json`

## 📚 Key Features

### In-Memory Database
- Data stored in JavaScript objects/Maps/Sets
- Fast access for development
- Easy to test

### JSON Persistence
- Loads from `data/config.json` on startup
- Saves on data changes
- Simple file-based storage

### Hot Reload
- Backend: `tsx watch` restarts on changes
- Frontend: Vite HMR updates instantly

### Type Safety
- Full TypeScript coverage
- Separate configs for frontend/backend
- Strict mode enabled

### Code Quality
- ESLint for linting
- Prettier for formatting
- Pre-configured rules

## 🆘 Troubleshooting

### Tests Failing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Port Already in Use
Change ports in:
- `src/backend/server.ts`
- `vite.config.ts`

### TypeScript Errors
```bash
# Check TypeScript version
npx tsc --version

# Rebuild
npm run build
```

### Module Not Found
```bash
# Ensure all dependencies installed
npm install

# Check import paths are relative
```

## 📖 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Vitest Documentation](https://vitest.dev/)
- [fast-check Documentation](https://fast-check.dev/)
- [EARS Requirements](https://alistairmavin.com/ears/)

## 🤝 Contributing to Template

If you improve this template, consider:
1. Documenting changes in this file
2. Updating example code
3. Adding new features to `.kiro/steering/project-standards.md`
4. Keeping it minimal and focused

## 📝 License

This template is provided as-is. Customize the license in `package.json` for your project.

---

**Ready to build?** Follow the Quick Start steps above and start creating your application!
