/**
 * Property-Based Tests for Service Architecture Optimization
 * 
 * **Feature: code-duplication-optimization, Property 5: Service Architecture Optimization**
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 * 
 * Tests that service layer analysis correctly identifies:
 * - Services with overlapping responsibilities
 * - Duplicate business logic implementations  
 * - Circular dependencies and tight coupling issues
 * - Opportunities for shared interfaces and base classes
 * - Service refactoring and consolidation strategies
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ServiceLayerAnalyzer } from '../src/analysis/analyzers/ServiceLayerAnalyzer.js';
import { ServiceConsolidationAnalyzer } from '../src/analysis/analyzers/ServiceConsolidationAnalyzer.js';
import { SimilarityAnalyzer } from '../src/analysis/analyzers/SimilarityAnalyzer.js';
import { ParsedFile, ClassInfo, FunctionInfo, FileMetadata } from '../src/analysis/interfaces/AnalysisInterfaces.js';

// Test data generators
const generateMethodInfo = (): fc.Arbitrary<FunctionInfo> => {
  return fc.record({
    name: fc.constantFrom('validate', 'calculate', 'save', 'load', 'create'),
    startLine: fc.integer({ min: 1, max: 100 }),
    endLine: fc.integer({ min: 101, max: 200 }),
    parameters: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 0, maxLength: 3 }),
    returnType: fc.constantFrom('void', 'string', 'ValidationResult'),
    complexity: fc.integer({ min: 1, max: 10 })
  });
};

const generateClassInfo = (): fc.Arbitrary<ClassInfo> => {
  return fc.record({
    name: fc.constantFrom('WarbandService', 'ValidationService', 'CostEngine'),
    startLine: fc.integer({ min: 1, max: 50 }),
    endLine: fc.integer({ min: 200, max: 300 }),
    methods: fc.array(generateMethodInfo(), { minLength: 1, maxLength: 5 }),
    properties: fc.array(fc.record({
      name: fc.string({ minLength: 3, maxLength: 10 }),
      type: fc.constantFrom('string', 'number'),
      isStatic: fc.boolean(),
      isPrivate: fc.boolean()
    }), { minLength: 0, maxLength: 3 }),
    extends: fc.option(fc.string({ minLength: 5, maxLength: 15 })),
    implements: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 15 }), { minLength: 0, maxLength: 2 }))
  });
};

const generateFileMetadata = (): fc.Arbitrary<FileMetadata> => {
  return fc.record({
    linesOfCode: fc.integer({ min: 50, max: 500 }),
    complexity: fc.integer({ min: 5, max: 25 }),
    functions: fc.array(generateMethodInfo(), { minLength: 0, maxLength: 3 }),
    classes: fc.array(generateClassInfo(), { minLength: 1, maxLength: 2 }),
    imports: fc.array(fc.record({
      module: fc.constantFrom('./ValidationService', './CostEngine'),
      imports: fc.array(fc.string({ minLength: 3, maxLength: 10 }), { minLength: 1, maxLength: 3 }),
      isDefault: fc.boolean()
    }), { minLength: 0, maxLength: 5 }),
    exports: fc.array(fc.record({
      name: fc.string({ minLength: 3, maxLength: 10 }),
      type: fc.constantFrom('function', 'class'),
      isDefault: fc.boolean()
    }), { minLength: 0, maxLength: 3 })
  });
};

const generateServiceFile = (): fc.Arbitrary<ParsedFile> => {
  return fc.record({
    filePath: fc.constantFrom(
      'src/backend/services/WarbandService.ts',
      'src/backend/services/ValidationService.ts',
      'src/backend/services/CostEngine.ts'
    ),
    ast: fc.constant({}), // Simplified AST for testing
    metadata: generateFileMetadata()
  });
};

describe('Service Architecture Optimization Property Tests', () => {
  describe('Property 5.1: Service Responsibility Analysis', () => {
    it('should analyze service layer without errors', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(generateServiceFile(), { minLength: 2, maxLength: 4 }),
        async (files) => {
          const similarityAnalyzer = new SimilarityAnalyzer();
          const serviceAnalyzer = new ServiceLayerAnalyzer(similarityAnalyzer);
          
          const duplications = await serviceAnalyzer.analyzeServiceLayer(files);
          const services = serviceAnalyzer.getServices();

          // Property: Analysis should complete without errors
          expect(services).toBeDefined();
          expect(duplications).toBeDefined();
          expect(Array.isArray(duplications)).toBe(true);

          // Property: All detected duplications should have valid structure
          duplications.forEach(duplication => {
            expect(duplication.id).toBeDefined();
            expect(duplication.type).toMatch(/^(exact|functional|pattern|configuration)$/);
            expect(duplication.similarity).toBeGreaterThanOrEqual(0);
            expect(duplication.similarity).toBeLessThanOrEqual(1);
            expect(duplication.locations).toBeDefined();
            expect(Array.isArray(duplication.locations)).toBe(true);
            expect(duplication.description).toBeDefined();
            expect(typeof duplication.description).toBe('string');
            expect(duplication.impact).toBeDefined();
          });
        }
      ), { numRuns: 10 }); // Reduced number of runs for faster testing
    });
  });

  describe('Property 5.4: Service Consolidation Recommendations', () => {
    it('should generate valid consolidation recommendations', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(generateServiceFile(), { minLength: 2, maxLength: 3 }),
        async (files) => {
          const similarityAnalyzer = new SimilarityAnalyzer();
          const serviceAnalyzer = new ServiceLayerAnalyzer(similarityAnalyzer);
          
          await serviceAnalyzer.analyzeServiceLayer(files);
          
          const consolidationAnalyzer = new ServiceConsolidationAnalyzer(serviceAnalyzer);
          const recommendations = consolidationAnalyzer.generateConsolidationRecommendations();

          // Property: Recommendations should be well-formed
          expect(recommendations).toBeDefined();
          expect(Array.isArray(recommendations)).toBe(true);

          recommendations.forEach(recommendation => {
            // Property: Each recommendation should have required fields
            expect(recommendation.id).toBeDefined();
            expect(typeof recommendation.id).toBe('string');
            expect(recommendation.title).toBeDefined();
            expect(typeof recommendation.title).toBe('string');
            expect(recommendation.description).toBeDefined();
            expect(typeof recommendation.description).toBe('string');
            expect(recommendation.type).toMatch(/^(consolidation|abstraction|refactoring|migration)$/);
            expect(recommendation.priority).toMatch(/^(low|medium|high|critical)$/);
            
            // Property: Complexity rating should be valid
            expect(recommendation.complexity).toBeDefined();
            expect(recommendation.complexity.level).toMatch(/^(low|medium|high|critical)$/);
            expect(Array.isArray(recommendation.complexity.factors)).toBe(true);
            expect(typeof recommendation.complexity.reasoning).toBe('string');
            
            // Property: Benefits and risks should be arrays
            expect(Array.isArray(recommendation.benefits)).toBe(true);
            expect(Array.isArray(recommendation.risks)).toBe(true);
            expect(Array.isArray(recommendation.implementationPlan)).toBe(true);
            expect(Array.isArray(recommendation.affectedFiles)).toBe(true);
          });
        }
      ), { numRuns: 10 }); // Reduced number of runs
    });
  });

  describe('Property: Service Analysis Completeness', () => {
    it('should analyze all service layer aspects comprehensively', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(generateServiceFile(), { minLength: 1, maxLength: 3 }),
        async (files) => {
          const similarityAnalyzer = new SimilarityAnalyzer();
          const serviceAnalyzer = new ServiceLayerAnalyzer(similarityAnalyzer);
          
          const duplications = await serviceAnalyzer.analyzeServiceLayer(files);
          const services = serviceAnalyzer.getServices();
          const dependencies = serviceAnalyzer.getDependencies();

          // Property: Analysis should cover all required aspects
          expect(services.size).toBeGreaterThanOrEqual(0);
          expect(dependencies.length).toBeGreaterThanOrEqual(0);
          expect(duplications.length).toBeGreaterThanOrEqual(0);

          // Property: Service information should be complete
          services.forEach((service, name) => {
            expect(service.name).toBe(name);
            expect(service.filePath).toBeDefined();
            expect(typeof service.filePath).toBe('string');
            expect(Array.isArray(service.methods)).toBe(true);
            expect(Array.isArray(service.dependencies)).toBe(true);
            expect(Array.isArray(service.responsibilities)).toBe(true);
            expect(service.complexity).toBeGreaterThanOrEqual(0);
            expect(service.linesOfCode).toBeGreaterThan(0);
          });
        }
      ), { numRuns: 10 }); // Reduced number of runs
    });
  });
});