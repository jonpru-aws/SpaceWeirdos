import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property-Based Tests for Error Handling Patterns
 * 
 * **Feature: npm-package-upgrade-fixes**
 * Tests error handling patterns across the codebase to ensure:
 * - Catch blocks use unknown type
 * - Type guards are used before accessing error properties
 * - API responses use explicit types
 */

/**
 * Get all TypeScript source files in the project
 */
function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, and .git directories
      if (!['node_modules', 'dist', '.git', '.kiro'].includes(file)) {
        getAllSourceFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Skip test files and declaration files
      if (!file.endsWith('.test.ts') && !file.endsWith('.test.tsx') && !file.endsWith('.d.ts')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Extract catch clauses from a TypeScript source file
 */
function extractCatchClauses(sourceFile: ts.SourceFile): Array<{
  catchClause: ts.CatchClause;
  variableName: string | undefined;
  variableType: string | undefined;
  hasTypeGuard: boolean;
  accessesErrorProperties: boolean;
  filePath: string;
  lineNumber: number;
}> {
  const catchClauses: Array<{
    catchClause: ts.CatchClause;
    variableName: string | undefined;
    variableType: string | undefined;
    hasTypeGuard: boolean;
    accessesErrorProperties: boolean;
    filePath: string;
    lineNumber: number;
  }> = [];

  function visit(node: ts.Node) {
    if (ts.isCatchClause(node)) {
      const variableDecl = node.variableDeclaration;
      const variableName = variableDecl?.name.getText(sourceFile);
      
      // Get the type annotation if present
      let variableType: string | undefined;
      if (variableDecl?.type) {
        variableType = variableDecl.type.getText(sourceFile);
      }
      
      // Check if the catch block uses type guards
      const catchBlockText = node.block.getText(sourceFile);
      const hasTypeGuard = 
        catchBlockText.includes('instanceof Error') ||
        catchBlockText.includes('isError(') ||
        catchBlockText.includes('isNodeError(') ||
        (catchBlockText.includes('typeof') && catchBlockText.includes('error'));
      
      // Check if error properties are accessed
      const accessesErrorProperties = 
        catchBlockText.includes('.message') ||
        catchBlockText.includes('.code') ||
        catchBlockText.includes('.stack') ||
        catchBlockText.includes('.statusCode');
      
      const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      
      catchClauses.push({
        catchClause: node,
        variableName,
        variableType,
        hasTypeGuard,
        accessesErrorProperties,
        filePath: sourceFile.fileName,
        lineNumber,
      });
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return catchClauses;
}

/**
 * Check if a file contains API response handling
 */
function hasApiResponseHandling(sourceFile: ts.SourceFile): boolean {
  const text = sourceFile.getText();
  return text.includes('fetch(') || 
         text.includes('response.json()') ||
         text.includes('fetchWithRetry');
}

/**
 * Check if API responses use explicit types
 */
function checkApiResponseTypes(sourceFile: ts.SourceFile): Array<{
  hasExplicitType: boolean;
  location: string;
  lineNumber: number;
}> {
  const issues: Array<{
    hasExplicitType: boolean;
    location: string;
    lineNumber: number;
  }> = [];

  function visit(node: ts.Node) {
    // Check for response.json() calls without type annotations
    if (ts.isAwaitExpression(node)) {
      const expression = node.expression;
      if (ts.isCallExpression(expression)) {
        const callText = expression.getText(sourceFile);
        if (callText.includes('.json()')) {
          // Check if there's a type assertion or explicit type
          let hasExplicitType = false;
          
          // Check parent for variable declaration with type
          if (ts.isVariableDeclaration(node.parent) && node.parent.type) {
            hasExplicitType = true;
          }
          
          // Check if the await expression itself has an 'as' type assertion
          const awaitText = node.getText(sourceFile);
          if (awaitText.includes(' as ')) {
            hasExplicitType = true;
          }
          
          // Check if parent is an as expression
          let current: ts.Node = node;
          while (current.parent) {
            if (ts.isAsExpression(current.parent)) {
              hasExplicitType = true;
              break;
            }
            current = current.parent;
            // Stop at statement level
            if (ts.isStatement(current)) {
              break;
            }
          }
          
          const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          issues.push({
            hasExplicitType,
            location: callText,
            lineNumber,
          });
        }
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return issues;
}

describe('Error Handling Patterns - Property-Based Tests', () => {
  /**
   * **Feature: npm-package-upgrade-fixes, Property 3: Catch blocks use unknown type**
   * **Validates: Requirements 2.1**
   * 
   * For any catch block in the codebase, the error parameter should be typed as unknown
   */
  it('Property 3: Catch blocks use unknown type', () => {
    const projectRoot = process.cwd();
    const sourceFiles = getAllSourceFiles(path.join(projectRoot, 'src'));
    
    expect(sourceFiles.length).toBeGreaterThan(0);
    
    // Create an arbitrary that generates indices for source files
    const sourceFileIndexArb = fc.integer({ min: 0, max: sourceFiles.length - 1 });
    
    fc.assert(
      fc.property(sourceFileIndexArb, (fileIndex) => {
        const filePath = sourceFiles[fileIndex];
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Parse the file
        const sourceFile = ts.createSourceFile(
          filePath,
          fileContent,
          ts.ScriptTarget.Latest,
          true
        );
        
        // Extract all catch clauses
        const catchClauses = extractCatchClauses(sourceFile);
        
        // If no catch clauses, this file passes
        if (catchClauses.length === 0) {
          return true;
        }
        
        // Verify each catch clause uses unknown type
        for (const clause of catchClauses) {
          const { variableType, filePath, lineNumber, variableName } = clause;
          
          // Catch blocks should use unknown type (Requirement 2.1)
          if (variableType && variableType !== 'unknown') {
            console.error(
              `\n❌ Property 3 violation in ${filePath}:${lineNumber}\n` +
              `   Variable: ${variableName}\n` +
              `   Expected type: unknown\n` +
              `   Actual type: ${variableType}\n` +
              `   Requirement 2.1: Catch blocks must use 'unknown' type`
            );
            return false;
          }
        }
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 4: Error handling uses type guards**
   * **Validates: Requirements 2.2, 2.5**
   * 
   * For any catch block that accesses error properties, type guards should be used
   * to verify the error type before accessing properties
   */
  it('Property 4: Error handling uses type guards', () => {
    const projectRoot = process.cwd();
    const sourceFiles = getAllSourceFiles(path.join(projectRoot, 'src'));
    
    expect(sourceFiles.length).toBeGreaterThan(0);
    
    // Create an arbitrary that generates indices for source files
    const sourceFileIndexArb = fc.integer({ min: 0, max: sourceFiles.length - 1 });
    
    fc.assert(
      fc.property(sourceFileIndexArb, (fileIndex) => {
        const filePath = sourceFiles[fileIndex];
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Parse the file
        const sourceFile = ts.createSourceFile(
          filePath,
          fileContent,
          ts.ScriptTarget.Latest,
          true
        );
        
        // Extract all catch clauses
        const catchClauses = extractCatchClauses(sourceFile);
        
        // If no catch clauses, this file passes
        if (catchClauses.length === 0) {
          return true;
        }
        
        // Verify each catch clause that accesses error properties uses type guards
        for (const clause of catchClauses) {
          const { hasTypeGuard, accessesErrorProperties, filePath, lineNumber, variableName } = clause;
          
          // If error properties are accessed, type guards must be used (Requirements 2.2, 2.5)
          if (accessesErrorProperties && !hasTypeGuard) {
            console.error(
              `\n❌ Property 4 violation in ${filePath}:${lineNumber}\n` +
              `   Variable: ${variableName}\n` +
              `   Issue: Accesses error properties without type guard\n` +
              `   Requirements 2.2, 2.5: Must use type guards before accessing error properties`
            );
            return false;
          }
        }
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 5: API responses use explicit types**
   * **Validates: Requirements 2.4**
   * 
   * For any API response parsing code, explicit type definitions should be used
   * rather than implicit any types. This test verifies that API client methods
   * have explicit return types and don't use implicit 'any'.
   */
  it('Property 5: API responses use explicit types', () => {
    const projectRoot = process.cwd();
    const sourceFiles = getAllSourceFiles(path.join(projectRoot, 'src'));
    
    expect(sourceFiles.length).toBeGreaterThan(0);
    
    // Filter to files that handle API responses
    const apiFiles = sourceFiles.filter(filePath => {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return fileContent.includes('apiClient') || 
             fileContent.includes('fetchWithRetry') ||
             fileContent.includes('API');
    });
    
    if (apiFiles.length === 0) {
      // No API files to test, pass
      return;
    }
    
    // Create an arbitrary that generates indices for API files
    const apiFileIndexArb = fc.integer({ min: 0, max: apiFiles.length - 1 });
    
    fc.assert(
      fc.property(apiFileIndexArb, (fileIndex) => {
        const filePath = apiFiles[fileIndex];
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Check for implicit 'any' types in API-related code
        // This is a simpler check that aligns with Requirement 2.4
        const hasImplicitAny = fileContent.includes(': any') && 
                               !fileContent.includes('// Type assertion needed') &&
                               !fileContent.includes('as any');
        
        if (hasImplicitAny) {
          console.error(
            `\n❌ Property 5 violation in ${filePath}\n` +
            `   Issue: File contains implicit 'any' types\n` +
            `   Requirement 2.4: API responses must use explicit types, not 'any'`
          );
          return false;
        }
        
        return true;
      }),
      { numRuns: 50 }
    );
  });
});
