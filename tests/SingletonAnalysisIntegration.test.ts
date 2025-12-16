/**
 * Integration test for singleton pattern analysis
 * Tests the complete singleton analysis workflow
 */

import { describe, it, expect } from 'vitest';
import { SingletonPatternAnalyzer } from '../src/analysis/analyzers/SingletonPatternAnalyzer.js';
import { DependencyInjectionAnalyzer } from '../src/analysis/analyzers/DependencyInjectionAnalyzer.js';
import { ParsedFile } from '../src/analysis/interfaces/AnalysisInterfaces.js';

describe('Singleton Analysis Integration Tests', () => {
  it('should analyze a complete singleton pattern workflow', async () => {
    const analyzer = new SingletonPatternAnalyzer({
      detectInconsistencies: true,
      analyzeConsolidationOpportunities: true,
      evaluateDependencyInjectionOpportunities: true
    });

    const diAnalyzer = new DependencyInjectionAnalyzer();

    // Create test files with singleton patterns
    const files: ParsedFile[] = [
      {
        filePath: 'src/ConfigManager.ts',
        ast: null as any,
        metadata: {
          linesOfCode: 15,
          complexity: 3,
          functions: [],
          classes: [{
            name: 'ConfigManager',
            startLine: 1,
            endLine: 15,
            methods: [{
              name: 'getInstance',
              startLine: 5,
              endLine: 10,
              parameters: [],
              returnType: 'ConfigManager',
              complexity: 2
            }],
            properties: [{
              name: 'instance',
              type: 'ConfigManager',
              isStatic: true,
              isPrivate: true
            }],
            extends: undefined,
            implements: []
          }],
          imports: [],
          exports: [{
            name: 'ConfigManager',
            type: 'class',
            isDefault: false
          }]
        }
      },
      {
        filePath: 'src/CacheManager.ts',
        ast: null as any,
        metadata: {
          linesOfCode: 20,
          complexity: 4,
          functions: [],
          classes: [{
            name: 'CacheManager',
            startLine: 1,
            endLine: 20,
            methods: [{
              name: 'getInstance',
              startLine: 5,
              endLine: 10,
              parameters: [],
              returnType: 'CacheManager',
              complexity: 2
            }],
            properties: [{
              name: 'instance',
              type: 'CacheManager',
              isStatic: true,
              isPrivate: true
            }],
            extends: undefined,
            implements: []
          }],
          imports: [],
          exports: [{
            name: 'CacheManager',
            type: 'class',
            isDefault: false
          }]
        }
      }
    ];

    // Analyze singleton patterns
    const result = await analyzer.analyzeSingletonPatterns(files);

    // Verify singleton detection
    expect(result.singletons.length).toBeGreaterThan(0);
    expect(result.singletons.every(s => s.className)).toBe(true);
    expect(result.singletons.every(s => s.implementation)).toBeTruthy();
    expect(result.singletons.every(s => s.characteristics)).toBeTruthy();

    // Analyze dependency injection opportunities
    const diResult = await diAnalyzer.analyzeDependencyInjectionOpportunities(
      result.singletons,
      files
    );

    // Verify DI analysis
    expect(Array.isArray(diResult.opportunities)).toBe(true);
    expect(Array.isArray(diResult.recommendations)).toBe(true);

    // Verify recommendations structure
    const allRecommendations = [...result.recommendations, ...diResult.recommendations];
    allRecommendations.forEach(rec => {
      expect(rec.id).toBeTruthy();
      expect(rec.title).toBeTruthy();
      expect(rec.description).toBeTruthy();
      expect(['consolidation', 'abstraction', 'refactoring', 'migration']).toContain(rec.type);
      expect(['low', 'medium', 'high', 'critical']).toContain(rec.priority);
      expect(Array.isArray(rec.implementationPlan)).toBe(true);
      expect(Array.isArray(rec.affectedFiles)).toBe(true);
    });
  });

  it('should handle edge cases gracefully', async () => {
    const analyzer = new SingletonPatternAnalyzer();

    // Test with empty files
    const emptyResult = await analyzer.analyzeSingletonPatterns([]);
    expect(emptyResult.singletons).toEqual([]);
    expect(emptyResult.duplications).toEqual([]);
    expect(emptyResult.recommendations).toEqual([]);

    // Test with non-singleton files
    const nonSingletonFiles: ParsedFile[] = [{
      filePath: 'src/RegularClass.ts',
      ast: null as any,
      metadata: {
        linesOfCode: 10,
        complexity: 2,
        functions: [],
        classes: [{
          name: 'RegularClass',
          startLine: 1,
          endLine: 10,
          methods: [{
            name: 'doSomething',
            startLine: 3,
            endLine: 5,
            parameters: [],
            returnType: 'void',
            complexity: 1
          }],
          properties: [],
          extends: undefined,
          implements: []
        }],
        imports: [],
        exports: []
      }
    }];

    const nonSingletonResult = await analyzer.analyzeSingletonPatterns(nonSingletonFiles);
    expect(nonSingletonResult.singletons).toEqual([]);
  });
});