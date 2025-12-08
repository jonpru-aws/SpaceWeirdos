import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property-Based Tests for Error Handling Pattern
 * 
 * **Feature: code-quality-improvements, Property 2: Error handling consistency**
 * **Validates: Requirements 3.1, 4.1, 4.2, 4.3, 4.4, 4.5**
 * 
 * For any catch block in the codebase, the caught error should be typed as `unknown` 
 * and type narrowing should be used before accessing error properties.
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
  filePath: string;
  lineNumber: number;
}> {
  const catchClauses: Array<{
    catchClause: ts.CatchClause;
    variableName: string | undefined;
    variableType: string | undefined;
    hasTypeGuard: boolean;
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
        catchBlockText.includes('typeof') && catchBlockText.includes('error');
      
      const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      
      catchClauses.push({
        catchClause: node,
        variableName,
        variableType,
        hasTypeGuard,
        filePath: sourceFile.fileName,
        lineNumber,
      });
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return catchClauses;
}

describe('ErrorHandlingPattern Property-Based Tests', () => {
  /**
   * Property 2: Error handling consistency
   * 
   * For any catch block in the codebase, the caught error should be typed as `unknown` 
   * and type narrowing should be used before accessing error properties.
   */
  describe('Property 2: Error handling consistency', () => {
    it('should verify all catch blocks use unknown type and type guards', () => {
      const projectRoot = process.cwd();
      const sourceFiles = getAllSourceFiles(path.join(projectRoot, 'src'));
      
      // Create an arbitrary that generates indices for source files
      const sourceFileIndexArb = fc.integer({ min: 0, max: Math.max(0, sourceFiles.length - 1) });
      
      fc.assert(
        fc.property(sourceFileIndexArb, (fileIndex) => {
          if (sourceFiles.length === 0) {
            // No source files to test
            return true;
          }
          
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
          
          // Verify each catch clause
          for (const clause of catchClauses) {
            const { variableType, hasTypeGuard, filePath, lineNumber, variableName } = clause;
            
            // Requirement 3.1, 4.1, 4.4: Catch blocks should use unknown type
            if (variableType && variableType !== 'unknown') {
              console.error(
                `\n❌ Error handling violation in ${filePath}:${lineNumber}\n` +
                `   Variable: ${variableName}\n` +
                `   Expected type: unknown\n` +
                `   Actual type: ${variableType}\n` +
                `   Requirement: Catch blocks must use 'unknown' type (Requirements 3.1, 4.1, 4.4)`
              );
              return false;
            }
            
            // Requirement 4.2, 4.3, 4.5: Type guards should be used before accessing properties
            if (!hasTypeGuard) {
              // Check if the catch block actually accesses error properties
              const catchBlockText = clause.catchClause.block.getText(sourceFile);
              const accessesErrorProperties = 
                catchBlockText.includes('.message') ||
                catchBlockText.includes('.code') ||
                catchBlockText.includes('.stack');
              
              if (accessesErrorProperties) {
                console.error(
                  `\n❌ Error handling violation in ${filePath}:${lineNumber}\n` +
                  `   Variable: ${variableName}\n` +
                  `   Issue: Accesses error properties without type guard\n` +
                  `   Requirement: Must use type guards before accessing error properties (Requirements 4.2, 4.3, 4.5)`
                );
                return false;
              }
            }
          }
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });
});
