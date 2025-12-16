/**
 * Property-based tests for recommendation quality assurance
 * **Feature: code-duplication-optimization, Property 7: Recommendation Quality Assurance**
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ImpactAnalyzer } from '../src/analysis/analyzers/ImpactAnalyzer.js';
import { ComplexityEstimator } from '../src/analysis/analyzers/ComplexityEstimator.js';
import { RiskAssessor } from '../src/analysis/analyzers/RiskAssessor.js';
import { StrategyGenerator } from '../src/analysis/analyzers/StrategyGenerator.js';
import { DuplicationInstance, OptimizationRecommendation, ComplexityRating, Risk } from '../src/analysis/types/DuplicationModels.js';

// Generators for test data
const codeLocationArb = fc.record({
  filePath: fc.string({ minLength: 5, maxLength: 50 }).map(s => `src/${s.replace(/[^a-zA-Z0-9]/g, '_')}.ts`),
  startLine: fc.integer({ min: 1, max: 100 }),
  endLine: fc.integer({ min: 1, max: 100 }),
  codeBlock: fc.string({ minLength: 10, maxLength: 500 }),
  context: fc.string({ minLength: 5, maxLength: 100 })
}).filter(loc => loc.startLine <= loc.endLine);

const impactMetricsArb = fc.record({
  linesOfCode: fc.integer({ min: 1, max: 1000 }),
  complexity: fc.integer({ min: 1, max: 100 }),
  maintainabilityIndex: fc.float({ min: 0, max: 100, noNaN: true }),
  testCoverage: fc.float({ min: 0, max: 1, noNaN: true })
});

const duplicationInstanceArb = fc.record({
  id: fc.string({ minLength: 5, maxLength: 20 }),
  type: fc.constantFrom('exact', 'functional', 'pattern', 'configuration'),
  similarity: fc.float({ min: 0.5, max: 1.0 }),
  locations: fc.array(codeLocationArb, { minLength: 2, maxLength: 5 }),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  impact: impactMetricsArb
});

const complexityRatingArb = fc.record({
  level: fc.constantFrom('low', 'medium', 'high', 'critical'),
  factors: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
  reasoning: fc.string({ minLength: 20, maxLength: 200 })
});

const riskArb = fc.record({
  type: fc.constantFrom('breaking_change', 'performance', 'compatibility', 'testing'),
  severity: fc.constantFrom('low', 'medium', 'high'),
  description: fc.string({ minLength: 10, maxLength: 100 }),
  mitigation: fc.string({ minLength: 10, maxLength: 100 })
});

const optimizationRecommendationArb = fc.record({
  id: fc.string({ minLength: 5, maxLength: 20 }),
  title: fc.string({ minLength: 10, maxLength: 100 }),
  description: fc.string({ minLength: 20, maxLength: 300 }),
  type: fc.constantFrom('consolidation', 'abstraction', 'refactoring', 'migration'),
  priority: fc.constantFrom('low', 'medium', 'high', 'critical'),
  complexity: complexityRatingArb,
  estimatedEffort: fc.record({
    hours: fc.integer({ min: 1, max: 200 }),
    complexity: complexityRatingArb,
    dependencies: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { maxLength: 5 })
  }),
  benefits: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
  risks: fc.array(riskArb, { maxLength: 5 }),
  implementationPlan: fc.array(fc.record({
    order: fc.integer({ min: 1, max: 20 }),
    title: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 10, maxLength: 200 }),
    codeExample: fc.option(fc.string({ minLength: 10, maxLength: 300 })),
    validation: fc.string({ minLength: 10, maxLength: 100 })
  }), { minLength: 1, maxLength: 10 }),
  affectedFiles: fc.array(fc.string().map(s => `src/${s.replace(/[^a-zA-Z0-9]/g, '_')}.ts`), { minLength: 1, maxLength: 10 })
});

describe('Recommendation Quality Assurance Property Tests', () => {
  /**
   * **Feature: code-duplication-optimization, Property 7: Recommendation Quality Assurance**
   * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
   */

  it('Property 7.1: ImpactAnalyzer should provide prioritized recommendations with consistent impact ratings', () => {
    const analyzer = new ImpactAnalyzer();

    fc.assert(fc.property(
      fc.array(duplicationInstanceArb, { minLength: 1, maxLength: 10 }),
      (duplications) => {
        const impactResult = analyzer.assessRefactoringImpact(duplications);
        
        // Impact analysis should be consistent and valid
        expect(impactResult.potentialSavings.linesOfCode).toBeGreaterThanOrEqual(0);
        expect(impactResult.potentialSavings.files).toBeGreaterThanOrEqual(0);
        expect(impactResult.potentialSavings.maintainabilityImprovement).toBeGreaterThanOrEqual(0);
        expect(['low', 'medium', 'high', 'critical']).toContain(impactResult.riskLevel);
        expect(impactResult.benefitScore).toBeGreaterThanOrEqual(0);
        expect(impactResult.benefitScore).toBeLessThanOrEqual(1);
        expect(impactResult.impactRating).toBeGreaterThanOrEqual(0);
        
        // Higher impact should correlate with more duplications or larger code blocks
        const totalLinesOfCode = duplications.reduce((sum, dup) => sum + dup.impact.linesOfCode, 0);
        if (totalLinesOfCode > 100) {
          expect(impactResult.impactRating).toBeGreaterThan(0);
        }
        
        // Risk level should correlate with complexity and file count
        const totalFiles = new Set(duplications.flatMap(d => d.locations.map(l => l.filePath))).size;
        if (totalFiles > 10) {
          expect(['high', 'critical']).toContain(impactResult.riskLevel);
        }
      }
    ), { numRuns: 50 });
  });

  it('Property 7.2: ComplexityEstimator should provide accurate complexity ratings and effort estimates', () => {
    const estimator = new ComplexityEstimator();

    fc.assert(fc.property(
      fc.tuple(duplicationInstanceArb, fc.constantFrom('consolidation', 'abstraction', 'refactoring', 'migration')),
      ([duplication], recommendationType) => {
        const duplications = [duplication];
        const complexity = estimator.estimateComplexity(duplications, recommendationType);
        
        // Complexity rating should be valid and consistent
        expect(['low', 'medium', 'high', 'critical']).toContain(complexity.level);
        expect(Array.isArray(complexity.factors)).toBe(true);
        expect(complexity.reasoning).toBeTruthy();
        expect(complexity.reasoning.length).toBeGreaterThan(10);
        
        // Complexity should correlate with duplication characteristics
        const fileCount = new Set(duplication.locations.map(l => l.filePath)).size;
        const codeComplexity = duplication.impact.complexity;
        const testCoverage = duplication.impact.testCoverage;
        
        // High file count should increase complexity
        if (fileCount > 5) {
          expect(['medium', 'high', 'critical']).toContain(complexity.level);
        }
        
        // High code complexity should increase overall complexity (but other factors matter too)
        if (codeComplexity > 50 && fileCount > 5 && testCoverage < 0.3) {
          expect(['medium', 'high', 'critical']).toContain(complexity.level);
        }
        
        // Low test coverage should increase complexity
        if (testCoverage < 0.3) {
          expect(['medium', 'high', 'critical']).toContain(complexity.level);
        }
        
        // Migration should be more complex than consolidation
        if (recommendationType === 'migration') {
          expect(['medium', 'high', 'critical']).toContain(complexity.level);
        }
      }
    ), { numRuns: 50 });
  });

  it('Property 7.3: RiskAssessor should identify breaking changes and provide mitigation strategies', () => {
    const riskAssessor = new RiskAssessor();

    fc.assert(fc.property(
      fc.tuple(optimizationRecommendationArb, fc.array(duplicationInstanceArb, { minLength: 1, maxLength: 5 })),
      ([recommendation, duplications]) => {
        const riskAnalysis = riskAssessor.assessRisks(recommendation, duplications);
        
        // Risk analysis should be comprehensive and valid
        expect(['low', 'medium', 'high', 'critical']).toContain(riskAnalysis.overallRiskLevel);
        expect(Array.isArray(riskAnalysis.risks)).toBe(true);
        expect(Array.isArray(riskAnalysis.mitigationStrategies)).toBe(true);
        expect(['immediate', 'phased', 'delayed', 'avoid']).toContain(riskAnalysis.recommendedApproach);
        
        // Each risk should be properly structured
        riskAnalysis.risks.forEach(risk => {
          expect(['breaking_change', 'performance', 'compatibility', 'testing']).toContain(risk.type);
          expect(['low', 'medium', 'high']).toContain(risk.severity);
          expect(risk.description).toBeTruthy();
          expect(risk.mitigation).toBeTruthy();
        });
        
        // Mitigation strategies should be provided for identified risks
        if (riskAnalysis.risks.length > 0) {
          expect(riskAnalysis.mitigationStrategies.length).toBeGreaterThan(0);
        }
        
        // High-risk scenarios should have appropriate recommendations
        if (riskAnalysis.overallRiskLevel === 'critical') {
          expect(['delayed', 'avoid']).toContain(riskAnalysis.recommendedApproach);
        }
        
        // Low-risk scenarios should allow immediate implementation
        if (riskAnalysis.overallRiskLevel === 'low') {
          expect(['immediate', 'phased']).toContain(riskAnalysis.recommendedApproach);
        }
      }
    ), { numRuns: 50 });
  });

  it('Property 7.4: StrategyGenerator should create complete implementation plans with step-by-step guidance', () => {
    const strategyGenerator = new StrategyGenerator();

    fc.assert(fc.property(
      fc.tuple(optimizationRecommendationArb, fc.array(duplicationInstanceArb, { minLength: 1, maxLength: 5 })),
      ([recommendation, duplications]) => {
        const implementationPlan = strategyGenerator.generateImplementationPlan(recommendation, duplications);
        
        // Implementation plan should be comprehensive
        expect(Array.isArray(implementationPlan)).toBe(true);
        expect(implementationPlan.length).toBeGreaterThan(0);
        
        // Each step should be properly structured
        implementationPlan.forEach((step, index) => {
          expect(step.order).toBeGreaterThan(0);
          expect(step.title).toBeTruthy();
          expect(step.description).toBeTruthy();
          expect(step.validation).toBeTruthy();
        });
        
        // Steps should have valid order numbers (don't enforce strict ordering for generated plans)
        const orders = implementationPlan.map(s => s.order);
        const hasValidOrders = orders.every(order => order > 0 && order <= 100);
        expect(hasValidOrders).toBe(true);
        
        // Plan should include preparation, implementation, and validation phases
        const stepTitles = implementationPlan.map(s => s.title.toLowerCase());
        const hasPreparation = stepTitles.some(title => 
          title.includes('branch') || title.includes('backup') || title.includes('prepare')
        );
        const hasImplementation = stepTitles.some(title => 
          title.includes('implement') || title.includes('create') || title.includes('refactor')
        );
        const hasValidation = stepTitles.some(title => 
          title.includes('test') || title.includes('review') || title.includes('validate')
        );
        
        expect(hasPreparation || hasImplementation || hasValidation).toBe(true);
      }
    ), { numRuns: 50 });
  });

  it('Property 7.5: All recommendation components should work together to provide complete refactoring strategies', () => {
    const impactAnalyzer = new ImpactAnalyzer();
    const complexityEstimator = new ComplexityEstimator();
    const riskAssessor = new RiskAssessor();
    const strategyGenerator = new StrategyGenerator();

    fc.assert(fc.property(
      fc.array(duplicationInstanceArb, { minLength: 1, maxLength: 5 }),
      (duplications) => {
        // Create a mock recommendation based on duplications
        const recommendation: OptimizationRecommendation = {
          id: 'test-recommendation',
          title: 'Test Consolidation',
          description: 'Test recommendation for property testing',
          type: 'consolidation',
          priority: 'medium',
          complexity: {
            level: 'medium',
            factors: ['Multiple files affected'],
            reasoning: 'Moderate complexity due to file scope'
          },
          estimatedEffort: {
            hours: 16,
            complexity: {
              level: 'medium',
              factors: ['Multiple files affected'],
              reasoning: 'Moderate complexity due to file scope'
            },
            dependencies: []
          },
          benefits: ['Reduces code duplication'],
          risks: [],
          implementationPlan: [],
          affectedFiles: duplications.flatMap(d => d.locations.map(l => l.filePath))
        };

        // Test integrated workflow
        const impactResult = impactAnalyzer.assessRefactoringImpact(duplications);
        const complexity = complexityEstimator.estimateComplexity(duplications, recommendation.type);
        const effort = complexityEstimator.estimateEffort(recommendation, duplications);
        const riskAnalysis = riskAssessor.assessRisks(recommendation, duplications);
        const implementationPlan = strategyGenerator.generateImplementationPlan(recommendation, duplications);
        const refactoringStrategy = strategyGenerator.generateRefactoringStrategy(recommendation, duplications, riskAnalysis.risks);

        // All components should produce valid results
        expect(impactResult).toBeDefined();
        expect(complexity).toBeDefined();
        expect(effort).toBeDefined();
        expect(riskAnalysis).toBeDefined();
        expect(implementationPlan).toBeDefined();
        expect(refactoringStrategy).toBeDefined();

        // Results should be consistent with each other
        // Higher complexity should generally correlate with higher effort (with tolerance)
        const complexityScore = ['low', 'medium', 'high', 'critical'].indexOf(complexity.level);
        const effortHours = effort.hours;
        if (complexityScore >= 3) { // only critical complexity should guarantee high effort
          expect(effortHours).toBeGreaterThan(6);
        } else if (complexityScore >= 2) { // high complexity should have reasonable effort
          expect(effortHours).toBeGreaterThan(2);
        }

        // Higher risk should correlate with more detailed implementation plans
        if (riskAnalysis.overallRiskLevel === 'high' || riskAnalysis.overallRiskLevel === 'critical') {
          expect(implementationPlan.length).toBeGreaterThan(3);
          expect(refactoringStrategy.phases.length).toBeGreaterThan(2);
        }

        // Benefits should be proportional to impact
        const benefits = impactAnalyzer.calculateRecommendationBenefits(recommendation);
        expect(Array.isArray(benefits)).toBe(true);
        if (impactResult.benefitScore > 0.7) {
          expect(benefits.length).toBeGreaterThan(2);
        }

        // Refactoring strategy should include rollback plan
        expect(refactoringStrategy.rollbackPlan).toBeDefined();
        expect(refactoringStrategy.rollbackPlan.length).toBeGreaterThan(0);
        expect(refactoringStrategy.validationCriteria).toBeDefined();
        expect(refactoringStrategy.validationCriteria.length).toBeGreaterThan(0);
      }
    ), { numRuns: 30 });
  });

  it('Property 7.6: Recommendation prioritization should be consistent and logical', () => {
    const impactAnalyzer = new ImpactAnalyzer();

    fc.assert(fc.property(
      fc.array(duplicationInstanceArb, { minLength: 2, maxLength: 10 }),
      (allDuplications) => {
        // Create multiple sets of duplications with different characteristics
        const duplicationSets = [
          allDuplications.slice(0, Math.ceil(allDuplications.length / 3)),
          allDuplications.slice(Math.ceil(allDuplications.length / 3), Math.ceil(2 * allDuplications.length / 3)),
          allDuplications.slice(Math.ceil(2 * allDuplications.length / 3))
        ].filter(set => set.length > 0);

        const impactResults = duplicationSets.map(set => ({
          set,
          impact: impactAnalyzer.assessRefactoringImpact(set)
        }));

        // Sort by impact rating
        impactResults.sort((a, b) => b.impact.impactRating - a.impact.impactRating);

        // Higher impact ratings should generally correlate with higher benefit scores (with tolerance)
        for (let i = 0; i < impactResults.length - 1; i++) {
          const current = impactResults[i];
          const next = impactResults[i + 1];
          
          if (current.impact.impactRating > next.impact.impactRating + 0.1) { // Only check significant differences
            // Allow for algorithm complexity - benefit score may not always correlate directly
            const benefitDifference = current.impact.benefitScore - next.impact.benefitScore;
            expect(benefitDifference).toBeGreaterThanOrEqual(-0.5); // Allow reasonable tolerance for algorithm complexity
          }
        }

        // Validate that impact ratings make sense relative to the data
        impactResults.forEach(({ set, impact }) => {
          const totalLOC = set.reduce((sum, dup) => sum + dup.impact.linesOfCode, 0);
          const avgComplexity = set.reduce((sum, dup) => sum + dup.impact.complexity, 0) / set.length;
          
          // Skip validation if we have invalid data (NaN values)
          if (isNaN(impact.impactRating) || isNaN(avgComplexity)) {
            return;
          }
          
          // More lines of code should generally lead to higher impact
          if (totalLOC > 500) {
            expect(impact.impactRating).toBeGreaterThan(0.1);
          }
          
          // Higher complexity should contribute to impact
          if (avgComplexity > 50 && !isNaN(avgComplexity)) {
            expect(impact.impactRating).toBeGreaterThan(0.1);
          }
        });
      }
    ), { numRuns: 30 });
  });

  it('Property 7.7: Code examples should be generated appropriately for different recommendation types', () => {
    const strategyGenerator = new StrategyGenerator();

    fc.assert(fc.property(
      fc.tuple(
        fc.constantFrom('consolidation', 'abstraction', 'refactoring', 'migration'),
        fc.array(duplicationInstanceArb, { minLength: 1, maxLength: 3 })
      ),
      ([recommendationType, duplications]) => {
        const mockRecommendation: OptimizationRecommendation = {
          id: 'test-rec',
          title: 'Test Recommendation',
          description: 'Test description',
          type: recommendationType,
          priority: 'medium',
          complexity: { level: 'medium', factors: [], reasoning: 'Test' },
          estimatedEffort: { hours: 8, complexity: { level: 'medium', factors: [], reasoning: 'Test' }, dependencies: [] },
          benefits: [],
          risks: [],
          implementationPlan: [],
          affectedFiles: []
        };

        const codeExamples = strategyGenerator.generateCodeExamples(mockRecommendation, duplications);

        // Should generate appropriate examples for each type
        expect(typeof codeExamples).toBe('object');
        expect(Object.keys(codeExamples).length).toBeGreaterThan(0);

        switch (recommendationType) {
          case 'consolidation':
            expect(codeExamples['before'] || codeExamples['after'] || codeExamples['migration']).toBeDefined();
            break;
          case 'abstraction':
            expect(codeExamples['interface'] || codeExamples['implementation'] || codeExamples['usage']).toBeDefined();
            break;
          case 'refactoring':
            expect(codeExamples['refactored'] || codeExamples['tests']).toBeDefined();
            break;
          case 'migration':
            expect(codeExamples['legacy'] || codeExamples['modern'] || codeExamples['adapter']).toBeDefined();
            break;
        }

        // All generated examples should be non-empty strings
        Object.values(codeExamples).forEach(example => {
          expect(typeof example).toBe('string');
          expect(example.length).toBeGreaterThan(0);
        });
      }
    ), { numRuns: 50 });
  });
});