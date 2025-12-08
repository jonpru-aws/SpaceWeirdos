import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property-Based Tests for Type Safety Documentation
 * 
 * **Feature: code-quality-improvements, Property 3: Type safety documentation**
 * **Validates: Requirements 3.3, 8.1, 8.2**
 * 
 * For any type assertion or 'any' type usage in the codebase, there should be 
 * a comment within 2 lines explaining why it is necessary.
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
 * Check if there's a comment within N lines before a given position
 * For type assertions, we need to look for comments before the containing statement
 */
function hasCommentNearby(sourceFile: ts.SourceFile, node: ts.Node, linesBefore: number = 6): boolean {
  let position = node.getStart();
  let checkNode: ts.Node | undefined = node;
  
  if (ts.isAsExpression(node)) {
    // For 'as' expressions, we need to find the containing statement/declaration
    // and check for comments before that, not just before the expression itself
    let parent = node.parent;
    
    // Walk up to find the statement or declaration that contains this assertion
    // For property assignments in object literals, walk up to the variable declaration
    while (parent) {
      if (ts.isStatement(parent) || ts.isVariableDeclaration(parent)) {
        checkNode = parent;
        // Use getFullStart() to include leading trivia (comments)
        position = parent.getFullStart();
        break;
      }
      // For property assignments, continue walking up to find the containing declaration
      if (ts.isPropertyAssignment(parent)) {
        parent = parent.parent; // Go to object literal
        if (parent) parent = parent.parent; // Go to variable declaration or statement
        continue;
      }
      parent = parent.parent;
    }
  }
  
  // Use TypeScript's built-in comment detection
  // Get all comments in the range before the node
  const fullText = sourceFile.getFullText();
  const commentRanges = ts.getLeadingCommentRanges(fullText, position);
  
  if (commentRanges && commentRanges.length > 0) {
    // Check if any comment is within linesBefore lines of the node
    const { line: nodeLine } = sourceFile.getLineAndCharacterOfPosition(position);
    
    for (const range of commentRanges) {
      const { line: commentLine } = sourceFile.getLineAndCharacterOfPosition(range.end);
      if (nodeLine - commentLine <= linesBefore) {
        return true;
      }
    }
  }
  
  // For 'as' expressions, also check for trailing comments on the same line as the 'as' keyword
  if (ts.isAsExpression(node)) {
    const nodeEnd = node.getEnd();
    const { line: nodeLine } = sourceFile.getLineAndCharacterOfPosition(nodeEnd);
    const lineEnd = sourceFile.getPositionOfLineAndCharacter(nodeLine + 1, 0);
    const lineText = sourceFile.text.substring(nodeEnd, lineEnd);
    
    if (lineText.includes('//') || lineText.includes('/*')) {
      return true;
    }
  }
  
  // Fallback: check for comments in text before position
  const { line } = sourceFile.getLineAndCharacterOfPosition(position);
  const startLine = Math.max(0, line - linesBefore);
  const startPos = sourceFile.getPositionOfLineAndCharacter(startLine, 0);
  const textBefore = sourceFile.text.substring(startPos, position + 200);
  
  return textBefore.includes('//') || textBefore.includes('/*');
}

/**
 * Extract type assertions and 'any' usage from a TypeScript source file
 */
function extractTypeIssues(sourceFile: ts.SourceFile): Array<{
  type: 'assertion' | 'any';
  text: string;
  hasDocumentation: boolean;
  filePath: string;
  lineNumber: number;
}> {
  const issues: Array<{
    type: 'assertion' | 'any';
    text: string;
    hasDocumentation: boolean;
    filePath: string;
    lineNumber: number;
  }> = [];

  function visit(node: ts.Node) {
    // Check for type assertions (as Type)
    if (ts.isAsExpression(node)) {
      const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      const hasDocumentation = hasCommentNearby(sourceFile, node, 2);
      
      issues.push({
        type: 'assertion',
        text: node.getText(sourceFile),
        hasDocumentation,
        filePath: sourceFile.fileName,
        lineNumber,
      });
    }
    
    // Check for 'any' type usage
    if (ts.isTypeReferenceNode(node) && node.typeName.getText(sourceFile) === 'any') {
      const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      const hasDocumentation = hasCommentNearby(sourceFile, node, 2);
      
      issues.push({
        type: 'any',
        text: node.getText(sourceFile),
        hasDocumentation,
        filePath: sourceFile.fileName,
        lineNumber,
      });
    }
    
    // Check for 'any' in parameter types and variable declarations
    if (ts.isParameter(node) || ts.isVariableDeclaration(node)) {
      if (node.type && node.type.kind === ts.SyntaxKind.AnyKeyword) {
        const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const hasDocumentation = hasCommentNearby(sourceFile, node, 2);
        
        issues.push({
          type: 'any',
          text: node.getText(sourceFile),
          hasDocumentation,
          filePath: sourceFile.fileName,
          lineNumber,
        });
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return issues;
}

describe('TypeSafetyDocumentation Property-Based Tests', () => {
  /**
   * Property 3: Type safety documentation
   * 
   * For any type assertion or 'any' type usage in the codebase, there should be 
   * a comment within 2 lines explaining why it is necessary.
   */
  describe('Property 3: Type safety documentation', () => {
    it('should verify all type assertions and any usage have documentation', () => {
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
          
          // Extract all type issues
          const issues = extractTypeIssues(sourceFile);
          
          // If no issues, this file passes
          if (issues.length === 0) {
            return true;
          }
          
          // Verify each issue has documentation
          for (const issue of issues) {
            const { type, hasDocumentation, filePath, lineNumber, text } = issue;
            
            // Requirement 3.3, 8.1, 8.2: Type assertions and 'any' usage must be documented
            if (!hasDocumentation) {
              console.error(
                `\n❌ Type safety documentation violation in ${filePath}:${lineNumber}\n` +
                `   Type: ${type}\n` +
                `   Code: ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}\n` +
                `   Issue: Missing documentation comment within 2 lines\n` +
                `   Requirement: Type assertions and 'any' usage must be documented (Requirements 3.3, 8.1, 8.2)`
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
