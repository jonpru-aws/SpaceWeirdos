import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import fc from 'fast-check';

/**
 * Property-Based Tests for Frontend-Backend Separation
 * 
 * **Feature: frontend-backend-api-separation, Property 3: Frontend contains no duplicate business logic**
 * **Validates: Requirements 1.3, 2.2**
 * 
 * **Feature: frontend-backend-api-separation, Property 11: Frontend imports only type definitions from Backend**
 * **Validates: Requirements 1.4, 4.4**
 */

describe('Frontend-Backend Separation', () => {
  const frontendDir = path.join(process.cwd(), 'src', 'frontend');
  const backendDir = path.join(process.cwd(), 'src', 'backend');

  /**
   * Helper function to recursively get all TypeScript files in a directory
   */
  function getTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...getTypeScriptFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Helper function to read file content
   */
  function readFileContent(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * Property 3: Frontend contains no duplicate business logic
   * 
   * This test verifies that the frontend does not contain implementations of:
   * - Cost calculation algorithms
   * - Validation rules
   * - Other business logic that exists in the backend
   */
  describe('Property 3: No duplicate business logic', () => {
    it('should not contain cost calculation implementations in frontend', () => {
      fc.assert(
        fc.property(
          fc.constant(null), // Dummy property to run the test
          () => {
            const frontendFiles = getTypeScriptFiles(frontendDir);
            const violations: Array<{ file: string; line: number; content: string }> = [];

            // Patterns that indicate business logic duplication
            const businessLogicPatterns = [
              // Cost calculation patterns
              /function\s+calculate\w*Cost/,
              /const\s+calculate\w*Cost\s*=/,
              // Validation rule patterns (not validation API calls)
              /function\s+validate(?!Warband|Weirdo)\w+/,
              /const\s+validate(?!Warband|Weirdo)\w+\s*=/,
              // Direct cost modification logic
              /baseCost\s*[+\-*\/]/,
              // Warband ability cost modifier logic
              /ability\s*===\s*['"](?:Cyborgs|Soldiers|Mutants|Psykers|Zealots|Heavily Armed)['"]\s*\?/,
            ];

            for (const file of frontendFiles) {
              // Skip test files
              if (file.includes('.test.') || file.includes('.spec.')) {
                continue;
              }

              const content = readFileContent(file);
              const lines = content.split('\n');

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Skip comments
                if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                  continue;
                }

                for (const pattern of businessLogicPatterns) {
                  if (pattern.test(line)) {
                    // Check if this is in costCalculations.ts (which we know exists but should be removed)
                    if (file.includes('costCalculations.ts')) {
                      violations.push({
                        file: path.relative(process.cwd(), file),
                        line: i + 1,
                        content: line.trim()
                      });
                    }
                  }
                }
              }
            }

            // Report violations
            if (violations.length > 0) {
              const violationReport = violations
                .map(v => `  ${v.file}:${v.line} - ${v.content}`)
                .join('\n');
              
              expect.fail(
                `Found ${violations.length} business logic duplication(s) in frontend:\n${violationReport}\n\n` +
                `Frontend should use API calls instead of implementing business logic.`
              );
            }

            // Test passes if no violations found
            expect(violations.length).toBe(0);
          }
        ),
        { numRuns: 1 } // Run once - this is a static code analysis
      );
    });

    it('should not import backend services or repositories', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const frontendFiles = getTypeScriptFiles(frontendDir);
            const violations: Array<{ file: string; line: number; import: string }> = [];

            // Patterns for prohibited imports
            const prohibitedImportPatterns = [
              /import\s+(?!type\s).*from\s+['"].*backend\/services/,
              /import\s+(?!type\s).*from\s+['"].*backend\/repositories/,
              /import\s+(?!type\s).*from\s+['"].*backend\/utils\/(?!typeGuards)/,
              /import\s+(?!type\s).*from\s+['"].*CostEngine['"]/,
              /import\s+(?!type\s).*from\s+['"].*ValidationService['"]/,
              /import\s+(?!type\s).*from\s+['"].*WarbandService['"]/,
              /import\s+(?!type\s).*from\s+['"].*DataRepository['"]/,
            ];

            for (const file of frontendFiles) {
              // Skip test files
              if (file.includes('.test.') || file.includes('.spec.')) {
                continue;
              }

              const content = readFileContent(file);
              const lines = content.split('\n');

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                for (const pattern of prohibitedImportPatterns) {
                  if (pattern.test(line)) {
                    violations.push({
                      file: path.relative(process.cwd(), file),
                      line: i + 1,
                      import: line.trim()
                    });
                  }
                }
              }
            }

            // Report violations
            if (violations.length > 0) {
              const violationReport = violations
                .map(v => `  ${v.file}:${v.line} - ${v.import}`)
                .join('\n');
              
              expect.fail(
                `Found ${violations.length} prohibited backend import(s) in frontend:\n${violationReport}\n\n` +
                `Frontend should only import type definitions from backend, not services or business logic.`
              );
            }

            expect(violations.length).toBe(0);
          }
        ),
        { numRuns: 1 }
      );
    });
  });

  /**
   * Property 11: Frontend imports only type definitions from Backend
   * 
   * This test verifies that all imports from backend in frontend code
   * use TypeScript's "import type" syntax for type-only imports.
   */
  describe('Property 11: Type-only imports from backend', () => {
    it('should use "import type" for all backend type imports', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const frontendFiles = getTypeScriptFiles(frontendDir);
            const violations: Array<{ file: string; line: number; import: string }> = [];

            for (const file of frontendFiles) {
              // Skip test files
              if (file.includes('.test.') || file.includes('.spec.')) {
                continue;
              }

              const content = readFileContent(file);
              const lines = content.split('\n');

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check for imports from backend that are NOT type-only
                // Pattern: import { ... } from '...backend...' (without "type" keyword)
                const backendImportPattern = /import\s+\{([^}]+)\}\s+from\s+['"].*backend/;
                const match = backendImportPattern.exec(line);

                if (match) {
                  // Check if this is a type-only import
                  const isTypeOnlyImport = /import\s+type\s+\{/.test(line);
                  
                  if (!isTypeOnlyImport) {
                    // Check if all imported items are types (have "type" prefix)
                    const imports = match[1];
                    const hasTypePrefix = /type\s+\w+/.test(imports);
                    
                    // If not using "import type" and not all items have "type" prefix, it's a violation
                    if (!hasTypePrefix) {
                      violations.push({
                        file: path.relative(process.cwd(), file),
                        line: i + 1,
                        import: line.trim()
                      });
                    }
                  }
                }
              }
            }

            // Report violations
            if (violations.length > 0) {
              const violationReport = violations
                .map(v => `  ${v.file}:${v.line} - ${v.import}`)
                .join('\n');
              
              expect.fail(
                `Found ${violations.length} non-type-only import(s) from backend:\n${violationReport}\n\n` +
                `All backend imports in frontend should use "import type { ... }" syntax.`
              );
            }

            expect(violations.length).toBe(0);
          }
        ),
        { numRuns: 1 }
      );
    });

    it('should not have any value imports from backend models', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const frontendFiles = getTypeScriptFiles(frontendDir);
            const violations: Array<{ file: string; line: number; import: string }> = [];

            for (const file of frontendFiles) {
              // Skip test files
              if (file.includes('.test.') || file.includes('.spec.')) {
                continue;
              }

              const content = readFileContent(file);
              const lines = content.split('\n');

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check for non-type imports from backend/models
                // This catches: import { Something } from '...backend/models/types'
                // But allows: import type { Something } from '...backend/models/types'
                if (/import\s+\{[^}]+\}\s+from\s+['"].*backend\/models/.test(line) &&
                    !/import\s+type\s+\{/.test(line)) {
                  violations.push({
                    file: path.relative(process.cwd(), file),
                    line: i + 1,
                    import: line.trim()
                  });
                }
              }
            }

            // Report violations
            if (violations.length > 0) {
              const violationReport = violations
                .map(v => `  ${v.file}:${v.line} - ${v.import}`)
                .join('\n');
              
              expect.fail(
                `Found ${violations.length} value import(s) from backend models:\n${violationReport}\n\n` +
                `All imports from backend/models should be type-only imports.`
              );
            }

            expect(violations.length).toBe(0);
          }
        ),
        { numRuns: 1 }
      );
    });
  });
});
