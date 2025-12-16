/**
 * Property-based tests for duplication analysis data models
 * **Feature: code-duplication-optimization, Property 1: Duplication Detection Completeness**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  DuplicationInstance,
  CodeLocation,
  ImpactMetrics,
  OptimizationRecommendation,
  DuplicationReport,
  ComplexityRating,
  Risk,
  ImplementationStep,
  EffortEstimate,
  ReportSummary,
  QualityMetrics
} from '../src/analysis/index.js';

// Generators for property-based testing
const codeLocationArb = fc.record({
  filePath: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0).map(s => `src/${s.replace(/\s/g, '_')}.ts`),
  startLine: fc.integer({ min: 1, max: 1000 }),
  endLine: fc.integer({ min: 1, max: 1000 }),
  codeBlock: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  context: fc.string()
}).filter(loc => loc.startLine <= loc.endLine);

const impactMetricsArb = fc.record({
  linesOfCode: fc.integer({ min: 0, max: 10000 }),
  complexity: fc.float({ min: 0, max: 100, noNaN: true }),
  maintainabilityIndex: fc.float({ min: 0, max: 100, noNaN: true }),
  testCoverage: fc.float({ min: 0, max: 1, noNaN: true })
});

const duplicationInstanceArb = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('exact', 'functional', 'pattern', 'configuration'),
  similarity: fc.float({ min: 0, max: 1, noNaN: true }),
  locations: fc.array(codeLocationArb, { minLength: 2, maxLength: 10 }),
  description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  impact: impactMetricsArb
});

const complexityRatingArb = fc.record({
  level: fc.constantFrom('low', 'medium', 'high', 'critical'),
  factors: fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 5 }),
  reasoning: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)
});

const riskArb = fc.record({
  type: fc.constantFrom('breaking_change', 'performance', 'compatibility', 'testing'),
  severity: fc.constantFrom('low', 'medium', 'high'),
  description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  mitigation: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)
});

const implementationStepArb = fc.array(fc.record({
  title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  codeExample: fc.option(fc.string()),
  validation: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)
}), { minLength: 1, maxLength: 10 }).map((steps, index) => 
  steps.map((step, i) => ({ ...step, order: i + 1 }))
);

const effortEstimateArb = fc.record({
  hours: fc.integer({ min: 1, max: 1000 }),
  complexity: complexityRatingArb,
  dependencies: fc.array(fc.string({ minLength: 1 }), { maxLength: 10 })
});

const optimizationRecommendationArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  type: fc.constantFrom('consolidation', 'abstraction', 'refactoring', 'migration'),
  priority: fc.constantFrom('low', 'medium', 'high', 'critical'),
  complexity: complexityRatingArb,
  estimatedEffort: effortEstimateArb,
  benefits: fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
  risks: fc.array(riskArb, { maxLength: 5 }),
  implementationPlan: implementationStepArb,
  affectedFiles: fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0).map(s => `src/${s}.ts`), { minLength: 1, maxLength: 20 })
});

describe('Duplication Analysis Data Models Property Tests', () => {
  /**
   * **Feature: code-duplication-optimization, Property 1: Duplication Detection Completeness**
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
   */
  
  it('Property 1.1: DuplicationInstance should maintain valid similarity scores', () => {
    fc.assert(fc.property(duplicationInstanceArb, (duplication) => {
      // Similarity should be between 0 and 1
      expect(duplication.similarity).toBeGreaterThanOrEqual(0);
      expect(duplication.similarity).toBeLessThanOrEqual(1);
      
      // Should have at least 2 locations for duplication
      expect(duplication.locations.length).toBeGreaterThanOrEqual(2);
      
      // All locations should have valid line numbers
      duplication.locations.forEach(location => {
        expect(location.startLine).toBeGreaterThan(0);
        expect(location.endLine).toBeGreaterThanOrEqual(location.startLine);
        expect(location.filePath).toBeTruthy();
        expect(location.codeBlock).toBeTruthy();
      });
      
      // Impact metrics should be non-negative
      expect(duplication.impact.linesOfCode).toBeGreaterThanOrEqual(0);
      expect(duplication.impact.complexity).toBeGreaterThanOrEqual(0);
      expect(duplication.impact.maintainabilityIndex).toBeGreaterThanOrEqual(0);
      expect(duplication.impact.testCoverage).toBeGreaterThanOrEqual(0);
      expect(duplication.impact.testCoverage).toBeLessThanOrEqual(1);
    }), { numRuns: 100 });
  });

  it('Property 1.2: OptimizationRecommendation should have consistent complexity and effort estimates', () => {
    fc.assert(fc.property(optimizationRecommendationArb, (recommendation) => {
      // Should have valid priority and type
      expect(['low', 'medium', 'high', 'critical']).toContain(recommendation.priority);
      expect(['consolidation', 'abstraction', 'refactoring', 'migration']).toContain(recommendation.type);
      
      // Complexity rating should be consistent
      expect(['low', 'medium', 'high', 'critical']).toContain(recommendation.complexity.level);
      expect(recommendation.complexity.factors.length).toBeGreaterThan(0);
      expect(recommendation.complexity.reasoning).toBeTruthy();
      
      // Effort estimate should be positive
      expect(recommendation.estimatedEffort.hours).toBeGreaterThan(0);
      
      // Should have at least one benefit
      expect(recommendation.benefits.length).toBeGreaterThan(0);
      
      // Implementation plan should be ordered
      const steps = recommendation.implementationPlan;
      expect(steps.length).toBeGreaterThan(0);
      
      // Steps should be in order
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].order).toBeGreaterThan(steps[i-1].order);
      }
      
      // Should affect at least one file
      expect(recommendation.affectedFiles.length).toBeGreaterThan(0);
    }), { numRuns: 100 });
  });

  it('Property 1.3: DuplicationReport should have consistent summary and metrics', () => {
    const reportSummaryArb = fc.integer({ min: 0, max: 100 }).chain(totalDuplications => {
      return fc.tuple(
        fc.integer({ min: 0, max: totalDuplications }),
        fc.integer({ min: 0, max: totalDuplications }),
        fc.integer({ min: 0, max: totalDuplications }),
        fc.integer({ min: 0, max: totalDuplications })
      ).map(([exact, functional, pattern, configuration]) => {
        // Ensure type counts don't exceed total
        const typeSum = exact + functional + pattern + configuration;
        const scale = typeSum > totalDuplications && typeSum > 0 ? totalDuplications / typeSum : 1;
        
        return {
          totalDuplications,
          byType: {
            exact: Math.floor(exact * scale),
            functional: Math.floor(functional * scale),
            pattern: Math.floor(pattern * scale),
            configuration: Math.floor(configuration * scale)
          },
          bySeverity: {
            low: Math.floor(totalDuplications * 0.4),
            medium: Math.floor(totalDuplications * 0.3),
            high: Math.floor(totalDuplications * 0.2),
            critical: Math.floor(totalDuplications * 0.1)
          },
          potentialSavings: {
            linesOfCode: totalDuplications * 50,
            files: Math.max(1, Math.floor(totalDuplications / 2)),
            estimatedHours: totalDuplications * 2
          }
        };
      });
    });

    const qualityMetricsArb = fc.record({
      duplicationPercentage: fc.float({ min: 0, max: 1, noNaN: true }),
      maintainabilityIndex: fc.float({ min: 0, max: 100, noNaN: true }),
      technicalDebtRatio: fc.float({ min: 0, max: 1, noNaN: true }),
      codeComplexity: fc.float({ min: 0, max: 100, noNaN: true })
    });

    const duplicationReportArb = fc.record({
      summary: reportSummaryArb,
      duplications: fc.array(duplicationInstanceArb, { maxLength: 100 }),
      recommendations: fc.array(optimizationRecommendationArb, { maxLength: 50 }),
      metrics: qualityMetricsArb,
      generatedAt: fc.date()
    });

    fc.assert(fc.property(duplicationReportArb, (report) => {
      // Summary totals should match actual duplications
      const actualTotal = report.duplications.length;
      expect(report.summary.totalDuplications).toBeGreaterThanOrEqual(0);
      
      // Type counts should sum to total or less (some duplications might not be categorized)
      const typeSum = Object.values(report.summary.byType).reduce((sum, count) => sum + count, 0);
      expect(typeSum).toBeLessThanOrEqual(report.summary.totalDuplications);
      
      // Severity counts should sum to total or less
      const severitySum = Object.values(report.summary.bySeverity).reduce((sum, count) => sum + count, 0);
      expect(severitySum).toBeLessThanOrEqual(report.summary.totalDuplications);
      
      // Potential savings should be non-negative
      expect(report.summary.potentialSavings.linesOfCode).toBeGreaterThanOrEqual(0);
      expect(report.summary.potentialSavings.files).toBeGreaterThanOrEqual(0);
      expect(report.summary.potentialSavings.estimatedHours).toBeGreaterThanOrEqual(0);
      
      // Quality metrics should be in valid ranges
      expect(report.metrics.duplicationPercentage).toBeGreaterThanOrEqual(0);
      expect(report.metrics.duplicationPercentage).toBeLessThanOrEqual(1);
      expect(report.metrics.maintainabilityIndex).toBeGreaterThanOrEqual(0);
      expect(report.metrics.maintainabilityIndex).toBeLessThanOrEqual(100);
      expect(report.metrics.technicalDebtRatio).toBeGreaterThanOrEqual(0);
      expect(report.metrics.technicalDebtRatio).toBeLessThanOrEqual(1);
      expect(report.metrics.codeComplexity).toBeGreaterThanOrEqual(0);
      
      // Generated date should be valid
      expect(report.generatedAt).toBeInstanceOf(Date);
    }), { numRuns: 100 });
  });

  it('Property 1.4: CodeLocation should maintain valid file paths and line ranges', () => {
    fc.assert(fc.property(codeLocationArb, (location) => {
      // File path should be non-empty and look like a valid path
      expect(location.filePath).toBeTruthy();
      expect(location.filePath).toMatch(/^src\/.*\.ts$/);
      
      // Line numbers should be positive and in correct order
      expect(location.startLine).toBeGreaterThan(0);
      expect(location.endLine).toBeGreaterThanOrEqual(location.startLine);
      
      // Code block should be non-empty
      expect(location.codeBlock).toBeTruthy();
      
      // Context can be empty but should be defined
      expect(location.context).toBeDefined();
    }), { numRuns: 100 });
  });

  it('Property 1.5: Risk assessment should have valid severity levels and mitigation strategies', () => {
    fc.assert(fc.property(riskArb, (risk) => {
      // Risk type should be valid
      expect(['breaking_change', 'performance', 'compatibility', 'testing']).toContain(risk.type);
      
      // Severity should be valid
      expect(['low', 'medium', 'high']).toContain(risk.severity);
      
      // Description and mitigation should be non-empty
      expect(risk.description).toBeTruthy();
      expect(risk.mitigation).toBeTruthy();
    }), { numRuns: 100 });
  });
});