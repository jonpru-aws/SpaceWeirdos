import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property-Based Tests for API Response Types
 * 
 * **Feature: code-quality-improvements, Property 5: Explicit API response types**
 * **Validates: Requirements 3.2**
 * 
 * For any API response parsing operation, the response should be typed with 
 * an explicit interface rather than 'any'.
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
 * Extract API response parsing operations from a TypeScript source file
 */
function extractApiResponseParsing(sourceFile: ts.SourceFile): Array<{
  expression: string;
  hasExplicitType: boolean;
  typeAnnotation: string | undefined;
  filePath: string;
  lineNumber: number;
}> {
  const apiCalls: Array<{
    expression: string;
    hasExplicitType: boolean;
    typeAnnotation: string | undefined;
    filePath: string;
    lineNumber: number;
  }> = [];

  function visit(node: ts.Node) {
    // Look for .json() calls that are parsing responses (not sending them)
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      
      // Check if this is a .json() call
      if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'json') {
        // Skip if this is a response.json() call for sending (e.g., res.json(...))
        // These have arguments, while parsing calls don't
        if (node.arguments.length > 0) {
          // This is likely res.json(data) for sending, not response.json() for parsing
          ts.forEachChild(node, visit);
          return;
        }
        
        // Check if the object being called is 'response' or similar
        const objectText = expression.expression.getText(sourceFile);
        if (objectText.includes('res') && !objectText.includes('response')) {
          // This is likely an Express response object (res.json()), not a fetch response
          ts.forEachChild(node, visit);
          return;
        }
        
        const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        
        // Check the parent context to determine typing
        let parent = node.parent;
        let hasExplicitType = false;
        let typeAnnotation: string | undefined;
        
        // Check if wrapped in await
        if (ts.isAwaitExpression(parent)) {
          parent = parent.parent;
        }
        
        // Check if there's a type assertion (as Type)
        if (ts.isAsExpression(parent)) {
          const assertedType = parent.type.getText(sourceFile);
          hasExplicitType = assertedType !== 'any';
          typeAnnotation = assertedType;
          parent = parent.parent;
        }
        
        // Check if assigned to a variable with type annotation
        if (ts.isVariableDeclaration(parent)) {
          if (parent.type) {
            const declaredType = parent.type.getText(sourceFile);
            hasExplicitType = declaredType !== 'any';
            typeAnnotation = declaredType;
          }
        }
        
        // Only report if there's no explicit type at all, or if it's 'any'
        apiCalls.push({
          expression: node.getText(sourceFile),
          hasExplicitType,
          typeAnnotation,
          filePath: sourceFile.fileName,
          lineNumber,
        });
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return apiCalls;
}

describe('ApiResponseTypes Property-Based Tests', () => {
  /**
   * Property 5: Explicit API response types
   * 
   * For any API response parsing operation, the response should be typed with 
   * an explicit interface rather than 'any'.
   */
  describe('Property 5: Explicit API response types', () => {
    it('should verify all API response parsing uses explicit types', () => {
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
          
          // Extract all API response parsing operations
          const apiCalls = extractApiResponseParsing(sourceFile);
          
          // If no API calls, this file passes
          if (apiCalls.length === 0) {
            return true;
          }
          
          // Verify each API call has explicit typing
          for (const call of apiCalls) {
            const { hasExplicitType, typeAnnotation, filePath, lineNumber, expression } = call;
            
            // Requirement 3.2: API responses must use explicit interfaces
            if (!hasExplicitType) {
              console.error(
                `\n❌ API response type violation in ${filePath}:${lineNumber}\n` +
                `   Expression: ${expression.substring(0, 60)}${expression.length > 60 ? '...' : ''}\n` +
                `   Issue: Missing explicit type annotation\n` +
                `   Requirement: API responses must use explicit interfaces instead of 'any' (Requirement 3.2)`
              );
              return false;
            }
            
            // Also check if the type is 'any'
            if (typeAnnotation === 'any') {
              console.error(
                `\n❌ API response type violation in ${filePath}:${lineNumber}\n` +
                `   Expression: ${expression.substring(0, 60)}${expression.length > 60 ? '...' : ''}\n` +
                `   Type: ${typeAnnotation}\n` +
                `   Issue: Using 'any' type instead of explicit interface\n` +
                `   Requirement: API responses must use explicit interfaces instead of 'any' (Requirement 3.2)`
              );
              return false;
            }
          }
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });
});
