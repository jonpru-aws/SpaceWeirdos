import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Feature: code-quality-improvements
 * Tests code quality metrics across the codebase
 */
describe('Code Quality Metrics', () => {
  /**
   * Validates: Requirements 3.5
   * Tests that 'any' usage count is fewer than 5 instances
   */
  it('should have fewer than 5 instances of any type', () => {
    const srcDir = path.join(process.cwd(), 'src');
    const anyCount = countAnyUsage(srcDir);
    
    expect(anyCount).toBeLessThan(5);
  });

  /**
   * Validates: Requirements 3.3
   * Tests that all type assertions have documentation
   */
  it('should have documentation for all type assertions', () => {
    const srcDir = path.join(process.cwd(), 'src');
    const undocumentedAssertions = findUndocumentedTypeAssertions(srcDir);
    
    if (undocumentedAssertions.length > 0) {
      const errorMessage = 'Found type assertions without documentation:\n' +
        undocumentedAssertions.map(a => `  ${a.file}:${a.line} - ${a.code}`).join('\n');
      throw new Error(errorMessage);
    }
    
    expect(undocumentedAssertions).toHaveLength(0);
  });

  /**
   * Validates: Requirements 3.1
   * Tests that all catch blocks use proper error typing
   */
  it('should use proper error typing in all catch blocks', () => {
    const srcDir = path.join(process.cwd(), 'src');
    const improperCatchBlocks = findImproperCatchBlocks(srcDir);
    
    if (improperCatchBlocks.length > 0) {
      const errorMessage = 'Found catch blocks without proper error typing:\n' +
        improperCatchBlocks.map(c => `  ${c.file}:${c.line} - ${c.code}`).join('\n');
      throw new Error(errorMessage);
    }
    
    expect(improperCatchBlocks).toHaveLength(0);
  });
});

/**
 * Count instances of 'any' type in source files
 */
function countAnyUsage(dir: string): number {
  let count = 0;
  const files = getAllTypeScriptFiles(dir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }
      
      // Match 'any' type usage (: any, <any>, any[], etc.)
      // Exclude 'any' in strings and comments
      const anyMatches = line.match(/:\s*any\b|<any>|any\[\]|any\s*\|/g);
      if (anyMatches) {
        count += anyMatches.length;
      }
    }
  }
  
  return count;
}

/**
 * Find type assertions without documentation
 */
function findUndocumentedTypeAssertions(dir: string): Array<{ file: string; line: number; code: string }> {
  const undocumented: Array<{ file: string; line: number; code: string }> = [];
  const files = getAllTypeScriptFiles(dir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip comments
      if (line.trim().startsWith('//')) {
        continue;
      }
      
      // Check for type assertions (as keyword)
      // Exclude 'as const' which is a common pattern that doesn't need documentation
      // Exclude 'as fs' which is an import alias
      // Exclude 'as summary' and similar which are just comments
      if (line.includes(' as ') && 
          !line.includes(' as const') && 
          !line.includes('import {') &&
          !line.includes('* Returns') &&
          !line.includes('*')) {
        // Check if there's a comment within 2 lines before
        const hasDocumentation = 
          (i > 0 && lines[i - 1].trim().startsWith('//')) ||
          (i > 1 && lines[i - 2].trim().startsWith('//'));
        
        if (!hasDocumentation) {
          undocumented.push({
            file: path.relative(process.cwd(), file),
            line: i + 1,
            code: line.trim()
          });
        }
      }
    }
  }
  
  return undocumented;
}

/**
 * Find catch blocks without proper error typing
 */
function findImproperCatchBlocks(dir: string): Array<{ file: string; line: number; code: string }> {
  const improper: Array<{ file: string; line: number; code: string }> = [];
  const files = getAllTypeScriptFiles(dir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for catch blocks
      if (line.includes('catch')) {
        // Check if it uses 'any' type or no type annotation
        if (line.includes('catch (error: any)') || 
            (line.includes('catch (') && !line.includes('catch (error: unknown)'))) {
          improper.push({
            file: path.relative(process.cwd(), file),
            line: i + 1,
            code: line.trim()
          });
        }
      }
    }
  }
  
  return improper;
}

/**
 * Get all TypeScript files in a directory recursively
 */
function getAllTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other non-source directories
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'build') {
          traverse(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}
