import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

/**
 * Feature: npm-package-upgrade-fixes, Property 1: TypeScript compilation succeeds
 * Validates: Requirements 1.1, 1.2, 1.5
 * 
 * Tests that the TypeScript compiler produces zero errors and zero unused variable warnings
 */
describe('TypeScript Compilation', () => {
  it('should compile without errors', () => {
    try {
      // Run TypeScript compiler for backend (source files only)
      const output = execSync('npx tsc -p tsconfig.backend.json --noEmit', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      // If we get here, compilation succeeded
      expect(output).toBeDefined();
    } catch (error) {
      // If tsc exits with non-zero code, it will throw
      const err = error as { stdout?: string; stderr?: string; status?: number };
      
      // Fail the test with the compilation errors
      throw new Error(
        `TypeScript compilation failed with exit code ${err.status}\n` +
        `Output: ${err.stdout || err.stderr || 'No output'}`
      );
    }
  }, 30000); // 30 second timeout for TypeScript compilation

  it('should have no unused variable warnings', () => {
    try {
      // Run TypeScript compiler for backend with noUnusedLocals and noUnusedParameters
      const output = execSync('npx tsc -p tsconfig.backend.json --noEmit --noUnusedLocals --noUnusedParameters', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      // If we get here, no unused variables were found
      expect(output).toBeDefined();
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string; status?: number };
      
      // Fail the test with the unused variable warnings
      throw new Error(
        `TypeScript found unused variables (exit code ${err.status})\n` +
        `Output: ${err.stdout || err.stderr || 'No output'}`
      );
    }
  }, 30000); // 30 second timeout for TypeScript compilation with unused variable checks

  it('should complete build process successfully', () => {
    try {
      // Run the actual build command with increased timeout
      const output = execSync('npm run build', {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 30000 // 30 second timeout
      });
      
      // Build succeeded
      expect(output).toBeDefined();
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string; status?: number };
      
      throw new Error(
        `Build process failed with exit code ${err.status}\n` +
        `Output: ${err.stdout || err.stderr || 'No output'}`
      );
    }
  }, 35000); // 35 second test timeout
});
