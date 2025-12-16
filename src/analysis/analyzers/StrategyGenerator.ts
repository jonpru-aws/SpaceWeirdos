/**
 * Strategy Generator for step-by-step refactoring plans
 * Requirements: 7.2, 7.5
 */

import { DuplicationInstance, OptimizationRecommendation, ImplementationStep, Risk } from '../types/DuplicationModels.js';

export interface RefactoringStrategy {
  approach: 'consolidation' | 'abstraction' | 'refactoring' | 'migration';
  phases: StrategyPhase[];
  rollbackPlan: RollbackStep[];
  validationCriteria: ValidationCriterion[];
}

export interface StrategyPhase {
  name: string;
  description: string;
  steps: ImplementationStep[];
  prerequisites: string[];
  deliverables: string[];
  estimatedDuration: string;
}

export interface RollbackStep {
  order: number;
  description: string;
  commands?: string[];
  validationCheck: string;
}

export interface ValidationCriterion {
  type: 'functional' | 'performance' | 'compatibility' | 'quality';
  description: string;
  testMethod: string;
  acceptanceCriteria: string;
}

export interface MigrationStrategy {
  type: 'big_bang' | 'phased' | 'parallel_run' | 'feature_toggle';
  timeline: string;
  phases: MigrationPhase[];
  rollbackStrategy: string;
}

export interface MigrationPhase {
  name: string;
  description: string;
  duration: string;
  dependencies: string[];
  deliverables: string[];
  risks: string[];
}

export class StrategyGenerator {
  /**
   * Generate a comprehensive refactoring strategy
   */
  generateRefactoringStrategy(
    recommendation: OptimizationRecommendation, 
    duplications: DuplicationInstance[],
    risks: Risk[]
  ): RefactoringStrategy {
    const approach = recommendation.type;
    const phases = this.generateStrategyPhases(recommendation, duplications, risks);
    const rollbackPlan = this.generateRollbackPlan(recommendation, phases);
    const validationCriteria = this.generateValidationCriteria(recommendation, duplications);

    return {
      approach,
      phases,
      rollbackPlan,
      validationCriteria
    };
  }

  /**
   * Generate step-by-step implementation plans
   */
  generateImplementationPlan(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): ImplementationStep[] {
    const steps: ImplementationStep[] = [];

    // Phase 1: Preparation
    steps.push(...this.generatePreparationSteps(recommendation, duplications));

    // Phase 2: Implementation
    steps.push(...this.generateImplementationSteps(recommendation, duplications));

    // Phase 3: Integration
    steps.push(...this.generateIntegrationSteps(recommendation, duplications));

    // Phase 4: Validation
    steps.push(...this.generateValidationSteps(recommendation, duplications));

    return steps;
  }

  /**
   * Generate migration strategies for complex refactoring
   */
  generateMigrationStrategy(recommendation: OptimizationRecommendation, risks: Risk[]): MigrationStrategy {
    const type = this.determineMigrationType(recommendation, risks);
    const timeline = this.estimateTimeline(recommendation, type);
    const phases = this.generateMigrationPhases(recommendation, type);
    const rollbackStrategy = this.generateRollbackStrategy(recommendation, type);

    return {
      type,
      timeline,
      phases,
      rollbackStrategy
    };
  }

  /**
   * Generate specific code examples for implementation
   */
  generateCodeExamples(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): Record<string, string> {
    const examples: Record<string, string> = {};

    switch (recommendation.type) {
      case 'consolidation':
        examples['before'] = this.generateConsolidationBefore(duplications);
        examples['after'] = this.generateConsolidationAfter(duplications);
        examples['migration'] = this.generateConsolidationMigration(duplications);
        break;

      case 'abstraction':
        examples['interface'] = this.generateAbstractionInterface(duplications);
        examples['implementation'] = this.generateAbstractionImplementation(duplications);
        examples['usage'] = this.generateAbstractionUsage(duplications);
        break;

      case 'refactoring':
        examples['refactored'] = this.generateRefactoredCode(duplications);
        examples['tests'] = this.generateRefactoringTests(duplications);
        break;

      case 'migration':
        examples['legacy'] = this.generateLegacyCode(duplications);
        examples['modern'] = this.generateModernCode(duplications);
        examples['adapter'] = this.generateMigrationAdapter(duplications);
        break;
    }

    return examples;
  }

  /**
   * Generate strategy phases based on recommendation type
   */
  private generateStrategyPhases(
    recommendation: OptimizationRecommendation, 
    duplications: DuplicationInstance[],
    risks: Risk[]
  ): StrategyPhase[] {
    const phases: StrategyPhase[] = [];

    // Phase 1: Analysis and Planning
    phases.push({
      name: 'Analysis and Planning',
      description: 'Analyze current state and plan the refactoring approach',
      steps: this.generateAnalysisSteps(recommendation, duplications),
      prerequisites: ['Code review completed', 'Stakeholder approval obtained'],
      deliverables: ['Detailed analysis report', 'Implementation plan', 'Risk assessment'],
      estimatedDuration: '1-2 days'
    });

    // Phase 2: Preparation
    phases.push({
      name: 'Preparation',
      description: 'Prepare the codebase and environment for refactoring',
      steps: this.generatePreparationSteps(recommendation, duplications),
      prerequisites: ['Analysis phase completed', 'Development environment ready'],
      deliverables: ['Test coverage improved', 'Backup created', 'Dependencies updated'],
      estimatedDuration: '2-3 days'
    });

    // Phase 3: Implementation
    phases.push({
      name: 'Implementation',
      description: 'Execute the refactoring according to the plan',
      steps: this.generateImplementationSteps(recommendation, duplications),
      prerequisites: ['Preparation phase completed', 'All tests passing'],
      deliverables: ['Refactored code', 'Updated tests', 'Documentation updated'],
      estimatedDuration: this.estimateImplementationDuration(recommendation)
    });

    // Phase 4: Validation and Deployment
    phases.push({
      name: 'Validation and Deployment',
      description: 'Validate the changes and deploy to production',
      steps: this.generateValidationSteps(recommendation, duplications),
      prerequisites: ['Implementation completed', 'All tests passing'],
      deliverables: ['Validation report', 'Production deployment', 'Monitoring setup'],
      estimatedDuration: '1-2 days'
    });

    return phases;
  }

  /**
   * Generate analysis steps
   */
  private generateAnalysisSteps(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): ImplementationStep[] {
    return [
      {
        order: 1,
        title: 'Analyze Current Duplication',
        description: 'Review all identified duplications and their relationships',
        validation: 'All duplications documented and categorized'
      },
      {
        order: 2,
        title: 'Identify Dependencies',
        description: 'Map dependencies between duplicated code and other components',
        validation: 'Dependency graph created and reviewed'
      },
      {
        order: 3,
        title: 'Plan Consolidation Approach',
        description: 'Design the target architecture and consolidation strategy',
        validation: 'Architecture design approved by team'
      }
    ];
  }

  /**
   * Generate preparation steps
   */
  private generatePreparationSteps(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): ImplementationStep[] {
    const steps: ImplementationStep[] = [
      {
        order: 1,
        title: 'Create Feature Branch',
        description: 'Create a dedicated branch for the refactoring work',
        codeExample: 'git checkout -b refactor/' + recommendation.id,
        validation: 'Feature branch created and pushed to remote'
      },
      {
        order: 2,
        title: 'Backup Current State',
        description: 'Create backup of current implementation',
        codeExample: 'git tag backup-before-' + recommendation.id,
        validation: 'Backup tag created successfully'
      }
    ];

    // Add test coverage improvement if needed
    const avgTestCoverage = duplications.reduce((sum, d) => sum + d.impact.testCoverage, 0) / duplications.length;
    if (avgTestCoverage < 0.7) {
      steps.push({
        order: 3,
        title: 'Improve Test Coverage',
        description: 'Add tests for code that will be refactored',
        validation: 'Test coverage above 70% for affected code'
      });
    }

    return steps;
  }

  /**
   * Generate implementation steps based on recommendation type
   */
  private generateImplementationSteps(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): ImplementationStep[] {
    switch (recommendation.type) {
      case 'consolidation':
        return this.generateConsolidationSteps(duplications);
      case 'abstraction':
        return this.generateAbstractionSteps(duplications);
      case 'refactoring':
        return this.generateRefactoringSteps(duplications);
      case 'migration':
        return this.generateMigrationSteps(duplications);
      default:
        return [];
    }
  }

  /**
   * Generate consolidation-specific steps
   */
  private generateConsolidationSteps(duplications: DuplicationInstance[]): ImplementationStep[] {
    return [
      {
        order: 1,
        title: 'Create Consolidated Implementation',
        description: 'Create a single, consolidated version of the duplicated functionality',
        codeExample: this.generateConsolidationAfter(duplications),
        validation: 'Consolidated implementation created and compiles successfully'
      },
      {
        order: 2,
        title: 'Update All References',
        description: 'Replace all duplicate implementations with references to the consolidated version',
        validation: 'All references updated and tests pass'
      },
      {
        order: 3,
        title: 'Remove Duplicate Code',
        description: 'Remove the original duplicate implementations',
        validation: 'Duplicate code removed and no compilation errors'
      }
    ];
  }

  /**
   * Generate abstraction-specific steps
   */
  private generateAbstractionSteps(duplications: DuplicationInstance[]): ImplementationStep[] {
    return [
      {
        order: 1,
        title: 'Design Abstraction Interface',
        description: 'Create interface or base class for the abstraction',
        codeExample: this.generateAbstractionInterface(duplications),
        validation: 'Interface designed and reviewed'
      },
      {
        order: 2,
        title: 'Implement Abstraction',
        description: 'Create concrete implementation of the abstraction',
        codeExample: this.generateAbstractionImplementation(duplications),
        validation: 'Abstraction implemented and tested'
      },
      {
        order: 3,
        title: 'Migrate Existing Code',
        description: 'Update existing code to use the new abstraction',
        codeExample: this.generateAbstractionUsage(duplications),
        validation: 'All code migrated to use abstraction'
      }
    ];
  }

  /**
   * Generate refactoring-specific steps
   */
  private generateRefactoringSteps(duplications: DuplicationInstance[]): ImplementationStep[] {
    return [
      {
        order: 1,
        title: 'Refactor Duplicate Code',
        description: 'Apply refactoring patterns to eliminate duplication',
        codeExample: this.generateRefactoredCode(duplications),
        validation: 'Code refactored and maintains functionality'
      },
      {
        order: 2,
        title: 'Update Tests',
        description: 'Update or create tests for refactored code',
        codeExample: this.generateRefactoringTests(duplications),
        validation: 'All tests updated and passing'
      }
    ];
  }

  /**
   * Generate migration-specific steps
   */
  private generateMigrationSteps(duplications: DuplicationInstance[]): ImplementationStep[] {
    return [
      {
        order: 1,
        title: 'Create Modern Implementation',
        description: 'Implement modern version of the functionality',
        codeExample: this.generateModernCode(duplications),
        validation: 'Modern implementation created and tested'
      },
      {
        order: 2,
        title: 'Create Migration Adapter',
        description: 'Create adapter to maintain compatibility during migration',
        codeExample: this.generateMigrationAdapter(duplications),
        validation: 'Adapter created and compatibility maintained'
      },
      {
        order: 3,
        title: 'Migrate Consumers',
        description: 'Update all consumers to use the new implementation',
        validation: 'All consumers migrated successfully'
      }
    ];
  }

  /**
   * Generate integration steps
   */
  private generateIntegrationSteps(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): ImplementationStep[] {
    return [
      {
        order: 1,
        title: 'Integration Testing',
        description: 'Run integration tests to ensure system works as expected',
        validation: 'All integration tests pass'
      },
      {
        order: 2,
        title: 'Performance Testing',
        description: 'Verify that performance is maintained or improved',
        validation: 'Performance benchmarks meet requirements'
      }
    ];
  }

  /**
   * Generate validation steps
   */
  private generateValidationSteps(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): ImplementationStep[] {
    return [
      {
        order: 1,
        title: 'Code Review',
        description: 'Conduct thorough code review of all changes',
        validation: 'Code review completed and approved'
      },
      {
        order: 2,
        title: 'Final Testing',
        description: 'Run complete test suite to ensure no regressions',
        validation: 'All tests pass including edge cases'
      },
      {
        order: 3,
        title: 'Documentation Update',
        description: 'Update documentation to reflect the changes',
        validation: 'Documentation updated and reviewed'
      }
    ];
  }

  /**
   * Generate rollback plan
   */
  private generateRollbackPlan(recommendation: OptimizationRecommendation, phases: StrategyPhase[]): RollbackStep[] {
    return [
      {
        order: 1,
        description: 'Revert to backup tag',
        commands: ['git reset --hard backup-before-' + recommendation.id],
        validationCheck: 'Code reverted to original state'
      },
      {
        order: 2,
        description: 'Restore original dependencies',
        commands: ['npm install', 'npm run build'],
        validationCheck: 'Dependencies restored and build successful'
      },
      {
        order: 3,
        description: 'Run regression tests',
        commands: ['npm test'],
        validationCheck: 'All tests pass after rollback'
      }
    ];
  }

  /**
   * Generate validation criteria
   */
  private generateValidationCriteria(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): ValidationCriterion[] {
    return [
      {
        type: 'functional',
        description: 'All functionality works as before',
        testMethod: 'Run complete test suite',
        acceptanceCriteria: '100% of tests pass'
      },
      {
        type: 'performance',
        description: 'Performance is maintained or improved',
        testMethod: 'Run performance benchmarks',
        acceptanceCriteria: 'No performance regression > 5%'
      },
      {
        type: 'quality',
        description: 'Code quality metrics improved',
        testMethod: 'Run code quality analysis',
        acceptanceCriteria: 'Duplication reduced by expected amount'
      }
    ];
  }

  // Helper methods for generating code examples
  private generateConsolidationBefore(duplications: DuplicationInstance[]): string {
    return `// Before: Duplicate implementations
// File 1: ${duplications[0]?.locations[0]?.filePath || 'file1.ts'}
${duplications[0]?.locations[0]?.codeBlock || '// Duplicate code block 1'}

// File 2: ${duplications[0]?.locations[1]?.filePath || 'file2.ts'}
${duplications[0]?.locations[1]?.codeBlock || '// Duplicate code block 2'}`;
  }

  private generateConsolidationAfter(duplications: DuplicationInstance[]): string {
    return `// After: Consolidated implementation
// utils/consolidated.ts
export function consolidatedFunction() {
  // Unified implementation combining best practices from duplicates
  // Implementation details...
}`;
  }

  private generateConsolidationMigration(duplications: DuplicationInstance[]): string {
    return `// Migration: Update imports
import { consolidatedFunction } from '../utils/consolidated.js';

// Replace duplicate implementations with consolidated version
const result = consolidatedFunction();`;
  }

  private generateAbstractionInterface(duplications: DuplicationInstance[]): string {
    return `// Abstract interface
export interface AbstractService {
  process(data: any): Promise<any>;
  validate(input: any): boolean;
}`;
  }

  private generateAbstractionImplementation(duplications: DuplicationInstance[]): string {
    return `// Concrete implementation
export class ConcreteService implements AbstractService {
  async process(data: any): Promise<any> {
    // Unified implementation
    return data;
  }

  validate(input: any): boolean {
    // Consolidated validation logic
    return true;
  }
}`;
  }

  private generateAbstractionUsage(duplications: DuplicationInstance[]): string {
    return `// Usage of abstraction
import { AbstractService, ConcreteService } from './services.js';

const service: AbstractService = new ConcreteService();
const result = await service.process(data);`;
  }

  private generateRefactoredCode(duplications: DuplicationInstance[]): string {
    return `// Refactored code eliminating duplication
export class RefactoredClass {
  private commonMethod() {
    // Extracted common functionality
  }

  public method1() {
    this.commonMethod();
    // Specific logic for method1
  }

  public method2() {
    this.commonMethod();
    // Specific logic for method2
  }
}`;
  }

  private generateRefactoringTests(duplications: DuplicationInstance[]): string {
    return `// Updated tests for refactored code
describe('RefactoredClass', () => {
  it('should handle method1 correctly', () => {
    // Test method1 functionality
  });

  it('should handle method2 correctly', () => {
    // Test method2 functionality
  });
});`;
  }

  private generateLegacyCode(duplications: DuplicationInstance[]): string {
    return `// Legacy implementation
export class LegacyService {
  // Old implementation with duplications
}`;
  }

  private generateModernCode(duplications: DuplicationInstance[]): string {
    return `// Modern implementation
export class ModernService {
  // New implementation without duplications
  // Uses modern patterns and best practices
}`;
  }

  private generateMigrationAdapter(duplications: DuplicationInstance[]): string {
    return `// Migration adapter
export class MigrationAdapter {
  constructor(
    private legacyService: LegacyService,
    private modernService: ModernService
  ) {}

  // Provides compatibility during migration
}`;
  }

  // Helper methods for strategy generation
  private determineMigrationType(recommendation: OptimizationRecommendation, risks: Risk[]): MigrationStrategy['type'] {
    const hasHighRisk = risks.some(r => r.severity === 'high');
    const affectedFiles = recommendation.affectedFiles.length;

    if (hasHighRisk || affectedFiles > 10) return 'phased';
    if (affectedFiles > 5) return 'parallel_run';
    return 'big_bang';
  }

  private estimateTimeline(recommendation: OptimizationRecommendation, type: MigrationStrategy['type']): string {
    const baseHours = recommendation.estimatedEffort.hours;
    
    switch (type) {
      case 'big_bang': return `${Math.ceil(baseHours / 8)} days`;
      case 'phased': return `${Math.ceil(baseHours / 4)} weeks`;
      case 'parallel_run': return `${Math.ceil(baseHours / 6)} weeks`;
      case 'feature_toggle': return `${Math.ceil(baseHours / 5)} weeks`;
    }
  }

  private generateMigrationPhases(recommendation: OptimizationRecommendation, type: MigrationStrategy['type']): MigrationPhase[] {
    // Implementation would generate phases based on migration type
    return [
      {
        name: 'Phase 1: Preparation',
        description: 'Prepare for migration',
        duration: '1 week',
        dependencies: [],
        deliverables: ['Migration plan', 'Test strategy'],
        risks: ['Planning incomplete']
      }
    ];
  }

  private generateRollbackStrategy(recommendation: OptimizationRecommendation, type: MigrationStrategy['type']): string {
    switch (type) {
      case 'big_bang': return 'Immediate rollback using git revert';
      case 'phased': return 'Phase-by-phase rollback with validation';
      case 'parallel_run': return 'Switch back to legacy system';
      case 'feature_toggle': return 'Disable feature toggle';
    }
  }

  private estimateImplementationDuration(recommendation: OptimizationRecommendation): string {
    const hours = recommendation.estimatedEffort.hours;
    const days = Math.ceil(hours / 8);
    
    if (days <= 1) return '1 day';
    if (days <= 5) return `${days} days`;
    return `${Math.ceil(days / 5)} weeks`;
  }
}