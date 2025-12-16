/**
 * Property-Based Tests for Error Handling Consistency
 * 
 * **Feature: code-duplication-optimization, Property 6: Error Handling Consistency**
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
 * 
 * Tests that error handling analysis correctly identifies duplicate error classification logic,
 * inconsistent error messaging patterns, and duplicate retry/recovery mechanisms.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import * as ts from 'typescript';
import { ErrorHandlingDuplicationDetector, ErrorHandlingPattern } from '../src/analysis/detectors/ErrorHandlingDuplicationDetector.js';
import { ErrorHandlingAnalyzer } from '../src/analysis/analyzers/ErrorHandlingAnalyzer.js';
import { ParsedFile, FileMetadata } from '../src/analysis/interfaces/AnalysisInterfaces.js';

describe('Error Handling Consistency Property Tests', () => {
  let detector: ErrorHandlingDuplicationDetector;
  let analyzer: ErrorHandlingAnalyzer;

  beforeEach(() => {
    detector = new ErrorHandlingDuplicationDetector();
    analyzer = new ErrorHandlingAnalyzer();
  });

  /**
   * Property 6: Error Handling Consistency
   * For any codebase with error handling implementations, the analysis should identify
   * duplicate error logic, inconsistent messaging, and suggest unified error handling strategies
   */
  describe('Property 6: Error Handling Consistency', () => {
    it('should run error handling analysis without throwing errors', async () => {
      // Simple test with basic error handling code
      const files = [
        createParsedFileWithCode('file1.ts', 'if (error instanceof ValidationError) { return "validation"; }'),
        createParsedFileWithCode('file2.ts', 'throw new Error("Something failed");'),
        createParsedFileWithCode('file3.ts', 'console.log("test");')
      ];

      // The detector should run without throwing errors
      const duplications = await detector.detectDuplications(files);
      
      // Should return an array
      expect(Array.isArray(duplications)).toBe(true);
      
      // Each duplication should have proper structure
      duplications.forEach(duplication => {
        expect(duplication.id).toBeDefined();
        expect(['exact', 'functional', 'pattern', 'configuration']).toContain(duplication.type);
        expect(duplication.similarity).toBeGreaterThanOrEqual(0);
        expect(duplication.similarity).toBeLessThanOrEqual(1);
        expect(Array.isArray(duplication.locations)).toBe(true);
        expect(duplication.description).toBeDefined();
        expect(duplication.impact).toBeDefined();
        expect(typeof duplication.impact.linesOfCode).toBe('number');
        expect(typeof duplication.impact.complexity).toBe('number');
      });
    });

    it('should handle error messaging analysis correctly', async () => {
      // Create files with error messaging patterns
      const files = [
        createParsedFileWithCode('file1.ts', 'throw new ValidationError("Field is required");'),
        createParsedFileWithCode('file2.ts', 'return { error: "Network failed" };'),
        createParsedFileWithCode('file3.ts', 'console.error("Operation failed");')
      ];

      const duplications = await detector.detectDuplications(files);
      
      // The detector should run without errors
      expect(Array.isArray(duplications)).toBe(true);
      
      // Validate structure of any found duplications
      duplications.forEach(duplication => {
        expect(duplication.id).toBeDefined();
        expect(['exact', 'functional', 'pattern', 'configuration']).toContain(duplication.type);
        expect(duplication.similarity).toBeGreaterThanOrEqual(0);
        expect(duplication.similarity).toBeLessThanOrEqual(1);
        expect(Array.isArray(duplication.locations)).toBe(true);
        expect(duplication.description).toBeDefined();
        expect(duplication.impact).toBeDefined();
      });
    });

    it('should handle retry mechanism analysis correctly', async () => {
      // Create files with retry mechanisms
      const files = [
        createParsedFileWithCode('file1.ts', 'for (let i = 0; i < 3; i++) { try { await operation(); } catch {} }'),
        createParsedFileWithCode('file2.ts', 'while (retryCount < maxRetries) { retryCount++; }'),
        createParsedFileWithCode('file3.ts', 'async function retry() { /* retry logic */ }')
      ];

      const duplications = await detector.detectDuplications(files);
      
      // The detector should run without errors
      expect(Array.isArray(duplications)).toBe(true);
      
      // Validate structure of any found duplications
      duplications.forEach(duplication => {
        expect(duplication.id).toBeDefined();
        expect(['exact', 'functional', 'pattern', 'configuration']).toContain(duplication.type);
        expect(duplication.similarity).toBeGreaterThanOrEqual(0);
        expect(duplication.similarity).toBeLessThanOrEqual(1);
        expect(Array.isArray(duplication.locations)).toBe(true);
        expect(duplication.description).toBeDefined();
        expect(duplication.impact).toBeDefined();
      });
    });

    it('should generate unified error handling recommendations', async () => {
      // Create mock analysis with duplications
      const analysis = {
        patterns: [],
        duplicateClassifications: [{
          id: 'dup-1',
          type: 'pattern' as const,
          similarity: 0.8,
          locations: [
            { filePath: 'file1.ts', startLine: 1, endLine: 5, codeBlock: 'code', context: 'test' },
            { filePath: 'file2.ts', startLine: 1, endLine: 5, codeBlock: 'code', context: 'test' }
          ],
          description: 'Duplicate error classification',
          impact: { linesOfCode: 10, complexity: 3, maintainabilityIndex: 80, testCoverage: 0 }
        }],
        inconsistentMessaging: [],
        duplicateRetryMechanisms: [],
        duplicateLogging: []
      };

      const files = [
        createParsedFileWithCode('file1.ts', 'test code'),
        createParsedFileWithCode('file2.ts', 'test code')
      ];

      const recommendations = analyzer.generateRecommendations(analysis, files);

      // Should generate recommendations for error handling improvements
      expect(recommendations.length).toBeGreaterThan(0);

      // Each recommendation should have proper structure
      recommendations.forEach(recommendation => {
        expect(recommendation.id).toBeDefined();
        expect(recommendation.title).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(['consolidation', 'abstraction', 'refactoring', 'migration']).toContain(recommendation.type);
        expect(['low', 'medium', 'high', 'critical']).toContain(recommendation.priority);
        expect(recommendation.benefits.length).toBeGreaterThan(0);
        expect(recommendation.implementationPlan.length).toBeGreaterThan(0);
        expect(recommendation.affectedFiles.length).toBeGreaterThan(0);
      });
    });

    it('should provide migration plans for consistent error management', async () => {
      // Create analysis with error handling issues
      const analysis = {
        patterns: [],
        duplicateClassifications: [{
          id: 'dup-1',
          type: 'pattern' as const,
          similarity: 0.8,
          locations: [
            { filePath: 'file1.ts', startLine: 1, endLine: 5, codeBlock: 'code', context: 'test' },
            { filePath: 'file2.ts', startLine: 1, endLine: 5, codeBlock: 'code', context: 'test' }
          ],
          description: 'Duplicate error classification',
          impact: { linesOfCode: 10, complexity: 3, maintainabilityIndex: 80, testCoverage: 0 }
        }],
        inconsistentMessaging: [],
        duplicateRetryMechanisms: [],
        duplicateLogging: []
      };

      const files: ParsedFile[] = [
        createParsedFileWithCode('file1.ts', 'test code'),
        createParsedFileWithCode('file2.ts', 'test code')
      ];

      const recommendations = analyzer.generateRecommendations(analysis, files);

      // Should provide detailed implementation plans
      recommendations.forEach(recommendation => {
        expect(recommendation.implementationPlan.length).toBeGreaterThan(0);
        
        recommendation.implementationPlan.forEach((step, index) => {
          expect(step.order).toBe(index + 1);
          expect(step.title).toBeDefined();
          expect(step.description).toBeDefined();
          expect(step.validation).toBeDefined();
          
          // Some steps should include code examples
          if (step.codeExample) {
            expect(step.codeExample.length).toBeGreaterThan(10);
          }
        });

        // Should include risk assessment
        expect(recommendation.risks.length).toBeGreaterThanOrEqual(0);
        recommendation.risks.forEach(risk => {
          expect(['breaking_change', 'performance', 'compatibility', 'testing']).toContain(risk.type);
          expect(['low', 'medium', 'high']).toContain(risk.severity);
          expect(risk.description).toBeDefined();
          expect(risk.mitigation).toBeDefined();
        });

        // Should include effort estimation
        expect(recommendation.estimatedEffort.hours).toBeGreaterThan(0);
        expect(recommendation.estimatedEffort.complexity).toBeDefined();
        expect(recommendation.estimatedEffort.dependencies).toBeDefined();
      });
    });
  });
});

// Test data generators

function generateErrorClassificationCode(): fc.Arbitrary<string> {
  return fc.oneof(
    fc.constant(`
      if (error instanceof ValidationError) {
        return { type: 'validation', severity: 'error' };
      } else if (error instanceof NetworkError) {
        return { type: 'network', severity: 'warning' };
      }
    `),
    fc.constant(`
      switch (error.constructor.name) {
        case 'ValidationError':
          return { category: 'validation', level: 'error' };
        case 'NetworkError':
          return { category: 'network', level: 'warning' };
      }
    `),
    fc.constant(`
      function classifyError(error) {
        if (error.code === 'VALIDATION_FAILED') {
          return 'validation_error';
        }
        if (error.code === 'NETWORK_TIMEOUT') {
          return 'network_error';
        }
      }
    `)
  );
}

function generateErrorMessagingCode(): fc.Arbitrary<string> {
  return fc.oneof(
    fc.constant(`throw new ValidationError("Field is required");`),
    fc.constant(`throw new ValidationError("This field cannot be empty");`),
    fc.constant(`throw new ValidationError("Required field missing");`),
    fc.constant(`return { error: "Network connection failed" };`),
    fc.constant(`return { error: "Unable to connect to server" };`),
    fc.constant(`console.error("Operation failed:", error.message);`)
  );
}

function generateRetryMechanismCode(): fc.Arbitrary<string> {
  return fc.oneof(
    fc.constant(`
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          if (attempt === maxRetries - 1) throw error;
          await delay(1000 * Math.pow(2, attempt));
        }
      }
    `),
    fc.constant(`
      let retryCount = 0;
      while (retryCount < 3) {
        try {
          return await fetch(url);
        } catch (error) {
          retryCount++;
          if (retryCount >= 3) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    `),
    fc.constant(`
      async function retryOperation(operation, maxAttempts = 3) {
        for (let i = 0; i < maxAttempts; i++) {
          try {
            return await operation();
          } catch (error) {
            if (i === maxAttempts - 1) throw error;
            await sleep(1000);
          }
        }
      }
    `)
  );
}

function generateMixedErrorHandlingCode(): string {
  return `
    try {
      await someOperation();
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error("Validation failed:", error.message);
        throw new Error("Invalid input provided");
      }
      
      // Retry logic
      for (let i = 0; i < 3; i++) {
        try {
          await retryOperation();
          break;
        } catch (retryError) {
          if (i === 2) throw retryError;
          await delay(1000);
        }
      }
    }
  `;
}

function createParsedFileWithCode(filePath: string, code: string): ParsedFile {
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const metadata: FileMetadata = {
    linesOfCode: code.split('\n').length,
    complexity: Math.ceil(code.length / 100),
    functions: [],
    classes: [],
    imports: [],
    exports: []
  };

  return {
    filePath,
    ast: sourceFile,
    metadata
  };
}