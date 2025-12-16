/**
 * DependencyInjectionAnalyzer - Analyzes singleton necessity and identifies DI migration opportunities
 * Evaluates when dependency injection could replace singletons for better architecture
 */

import { ParsedFile, ClassInfo, FunctionInfo } from '../interfaces/AnalysisInterfaces.js';
import { OptimizationRecommendation, ComplexityRating, Risk, ImplementationStep } from '../types/DuplicationModels.js';
import { SingletonInstance, SingletonCharacteristics } from './SingletonPatternAnalyzer.js';
import { v4 as uuidv4 } from 'uuid';

export interface DependencyInjectionConfig {
  evaluateStatelessSingletons: boolean;
  evaluateTestabilityConcerns: boolean;
  evaluateCouplingIssues: boolean;
  evaluateLifecycleManagement: boolean;
  minComplexityThreshold: number;
}

export interface DependencyInjectionOpportunity {
  id: string;
  singleton: SingletonInstance;
  necessityScore: number;
  migrationComplexity: 'low' | 'medium' | 'high' | 'critical';
  benefits: DIBenefit[];
  challenges: DIChallenge[];
  migrationStrategy: MigrationStrategy;
  affectedConsumers: ConsumerAnalysis[];
  recommendedApproach: DIApproach;
}

export interface DIBenefit {
  type: 'testability' | 'modularity' | 'flexibility' | 'maintainability' | 'performance';
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface DIChallenge {
  type: 'lifecycle' | 'state_management' | 'initialization' | 'consumer_updates' | 'configuration';
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface MigrationStrategy {
  approach: 'gradual' | 'big_bang' | 'adapter_pattern' | 'feature_flag';
  phases: MigrationPhase[];
  rollbackPlan: string;
  estimatedDuration: string;
}

export interface MigrationPhase {
  order: number;
  name: string;
  description: string;
  deliverables: string[];
  risks: string[];
  successCriteria: string[];
}

export interface ConsumerAnalysis {
  filePath: string;
  usagePattern: 'direct_access' | 'method_call' | 'property_access' | 'factory_method';
  complexity: 'simple' | 'moderate' | 'complex';
  migrationEffort: 'low' | 'medium' | 'high';
  breakingChanges: string[];
}

export interface DIApproach {
  containerType: 'constructor' | 'property' | 'method' | 'service_locator';
  lifecycleManagement: 'singleton' | 'transient' | 'scoped' | 'custom';
  configurationMethod: 'code' | 'configuration_file' | 'annotations' | 'conventions';
  recommendedLibrary?: string;
}

export class DependencyInjectionAnalyzer {
  private config: DependencyInjectionConfig;

  constructor(config?: Partial<DependencyInjectionConfig>) {
    this.config = {
      evaluateStatelessSingletons: true,
      evaluateTestabilityConcerns: true,
      evaluateCouplingIssues: true,
      evaluateLifecycleManagement: true,
      minComplexityThreshold: 5,
      ...config
    };
  }

  async analyzeDependencyInjectionOpportunities(
    singletons: SingletonInstance[],
    allFiles: ParsedFile[]
  ): Promise<{
    opportunities: DependencyInjectionOpportunity[];
    recommendations: OptimizationRecommendation[];
  }> {
    const opportunities: DependencyInjectionOpportunity[] = [];

    for (const singleton of singletons) {
      const opportunity = await this.evaluateSingletonForDI(singleton, allFiles);
      if (opportunity) {
        opportunities.push(opportunity);
      }
    }

    const recommendations = this.generateDIRecommendations(opportunities);

    return {
      opportunities,
      recommendations
    };
  }

  private async evaluateSingletonForDI(
    singleton: SingletonInstance,
    allFiles: ParsedFile[]
  ): Promise<DependencyInjectionOpportunity | null> {
    const necessityScore = this.calculateSingletonNecessity(singleton);
    
    // Only consider singletons with low necessity scores for DI migration
    if (necessityScore > 0.7) {
      return null;
    }

    const migrationComplexity = this.assessMigrationComplexity(singleton, allFiles);
    const benefits = this.identifyDIBenefits(singleton);
    const challenges = this.identifyDIChallenges(singleton);
    const affectedConsumers = await this.analyzeConsumers(singleton, allFiles);
    const migrationStrategy = this.developMigrationStrategy(singleton, affectedConsumers);
    const recommendedApproach = this.recommendDIApproach(singleton);

    return {
      id: uuidv4(),
      singleton,
      necessityScore,
      migrationComplexity,
      benefits,
      challenges,
      migrationStrategy,
      affectedConsumers,
      recommendedApproach
    };
  }

  private calculateSingletonNecessity(singleton: SingletonInstance): number {
    let necessityScore = 0;

    // Factors that increase singleton necessity
    if (singleton.characteristics.statefulness === 'stateful') {
      necessityScore += 0.3;
    }

    if (singleton.characteristics.responsibilities.includes('configuration_management')) {
      necessityScore += 0.2;
    }

    if (singleton.characteristics.responsibilities.includes('caching')) {
      necessityScore += 0.2;
    }

    if (singleton.characteristics.responsibilities.includes('database_connection')) {
      necessityScore += 0.3;
    }

    if (singleton.implementation.threadSafety !== 'none') {
      necessityScore += 0.2;
    }

    // Factors that decrease singleton necessity
    if (singleton.characteristics.statefulness === 'stateless') {
      necessityScore -= 0.3;
    }

    if (singleton.characteristics.testability === 'low') {
      necessityScore -= 0.2;
    }

    if (singleton.characteristics.coupling === 'very_tight') {
      necessityScore -= 0.2;
    }

    if (singleton.characteristics.dependencies.length > 3) {
      necessityScore -= 0.1;
    }

    return Math.max(0, Math.min(1, necessityScore));
  }

  private assessMigrationComplexity(
    singleton: SingletonInstance,
    allFiles: ParsedFile[]
  ): DependencyInjectionOpportunity['migrationComplexity'] {
    let complexityScore = 0;

    // Factors that increase complexity
    if (singleton.characteristics.statefulness === 'stateful') {
      complexityScore += 2;
    }

    if (singleton.characteristics.dependencies.length > 5) {
      complexityScore += 2;
    }

    if (singleton.inconsistencies.length > 2) {
      complexityScore += 1;
    }

    // Estimate consumer count (simplified)
    const estimatedConsumers = this.estimateConsumerCount(singleton, allFiles);
    if (estimatedConsumers > 10) {
      complexityScore += 3;
    } else if (estimatedConsumers > 5) {
      complexityScore += 2;
    } else if (estimatedConsumers > 2) {
      complexityScore += 1;
    }

    if (complexityScore >= 6) return 'critical';
    if (complexityScore >= 4) return 'high';
    if (complexityScore >= 2) return 'medium';
    return 'low';
  }

  private estimateConsumerCount(singleton: SingletonInstance, allFiles: ParsedFile[]): number {
    let consumerCount = 0;
    const className = singleton.className;

    for (const file of allFiles) {
      if (file.filePath === singleton.filePath) continue;

      // Simple heuristic: count files that import or reference the singleton
      const hasImport = file.metadata.imports.some(imp => 
        imp.imports.includes(className) || imp.module.includes(className.toLowerCase())
      );

      if (hasImport) {
        consumerCount++;
      }
    }

    return consumerCount;
  }

  private identifyDIBenefits(singleton: SingletonInstance): DIBenefit[] {
    const benefits: DIBenefit[] = [];

    if (singleton.characteristics.testability === 'low') {
      benefits.push({
        type: 'testability',
        description: 'Improved testability through dependency mocking and isolation',
        impact: 'high'
      });
    }

    if (singleton.characteristics.coupling === 'very_tight' || singleton.characteristics.coupling === 'tight') {
      benefits.push({
        type: 'modularity',
        description: 'Reduced coupling and improved module boundaries',
        impact: 'high'
      });
    }

    if (singleton.characteristics.statefulness === 'stateless') {
      benefits.push({
        type: 'flexibility',
        description: 'Multiple instances can be created for different contexts',
        impact: 'medium'
      });
    }

    if (singleton.characteristics.dependencies.length > 3) {
      benefits.push({
        type: 'maintainability',
        description: 'Clearer dependency management and lifecycle control',
        impact: 'medium'
      });
    }

    if (singleton.inconsistencies.length > 0) {
      benefits.push({
        type: 'maintainability',
        description: 'Elimination of singleton pattern inconsistencies',
        impact: 'medium'
      });
    }

    return benefits;
  }

  private identifyDIChallenges(singleton: SingletonInstance): DIChallenge[] {
    const challenges: DIChallenge[] = [];

    if (singleton.characteristics.statefulness === 'stateful') {
      challenges.push({
        type: 'state_management',
        description: 'Managing shared state across multiple instances',
        severity: 'high',
        mitigation: 'Use scoped lifecycle or external state management'
      });
    }

    if (singleton.characteristics.responsibilities.includes('configuration_management')) {
      challenges.push({
        type: 'initialization',
        description: 'Ensuring configuration is loaded before dependent services',
        severity: 'medium',
        mitigation: 'Use initialization hooks or eager loading'
      });
    }

    if (singleton.implementation.threadSafety !== 'none') {
      challenges.push({
        type: 'lifecycle',
        description: 'Maintaining thread safety without singleton guarantees',
        severity: 'medium',
        mitigation: 'Use thread-safe DI container or synchronization'
      });
    }

    const estimatedConsumers = singleton.characteristics.dependencies.length;
    if (estimatedConsumers > 5) {
      challenges.push({
        type: 'consumer_updates',
        description: 'Updating many consumer classes to use dependency injection',
        severity: 'high',
        mitigation: 'Implement gradual migration with adapter pattern'
      });
    }

    return challenges;
  }

  private async analyzeConsumers(
    singleton: SingletonInstance,
    allFiles: ParsedFile[]
  ): Promise<ConsumerAnalysis[]> {
    const consumers: ConsumerAnalysis[] = [];
    const className = singleton.className;

    for (const file of allFiles) {
      if (file.filePath === singleton.filePath) continue;

      const hasReference = this.fileReferencesClass(file, className);
      if (hasReference) {
        const analysis = this.analyzeConsumerFile(file, className);
        consumers.push(analysis);
      }
    }

    return consumers;
  }

  private fileReferencesClass(file: ParsedFile, className: string): boolean {
    // Check imports
    const hasImport = file.metadata.imports.some(imp => 
      imp.imports.includes(className) || imp.module.includes(className.toLowerCase())
    );

    if (hasImport) return true;

    // This would need actual file content analysis in a real implementation
    // For now, we'll use a simple heuristic based on metadata
    return false;
  }

  private analyzeConsumerFile(file: ParsedFile, className: string): ConsumerAnalysis {
    // Simplified analysis - in a real implementation, this would analyze actual usage patterns
    const complexity = this.assessConsumerComplexity(file);
    const migrationEffort = this.assessMigrationEffort(complexity);

    return {
      filePath: file.filePath,
      usagePattern: 'method_call', // Simplified assumption
      complexity,
      migrationEffort,
      breakingChanges: this.identifyBreakingChanges(file, className)
    };
  }

  private assessConsumerComplexity(file: ParsedFile): ConsumerAnalysis['complexity'] {
    const totalMethods = file.metadata.classes.reduce((sum, cls) => sum + (cls.methods?.length || 0), 0) +
                        file.metadata.functions.length;

    if (totalMethods > 20) return 'complex';
    if (totalMethods > 10) return 'moderate';
    return 'simple';
  }

  private assessMigrationEffort(complexity: ConsumerAnalysis['complexity']): ConsumerAnalysis['migrationEffort'] {
    switch (complexity) {
      case 'complex': return 'high';
      case 'moderate': return 'medium';
      case 'simple': return 'low';
    }
  }

  private identifyBreakingChanges(file: ParsedFile, className: string): string[] {
    // Simplified - in reality, this would analyze actual usage patterns
    return [
      `Update ${className} instantiation to use dependency injection`,
      'Modify constructor to accept injected dependencies',
      'Update test mocks and stubs'
    ];
  }

  private developMigrationStrategy(
    singleton: SingletonInstance,
    consumers: ConsumerAnalysis[]
  ): MigrationStrategy {
    const highComplexityConsumers = consumers.filter(c => c.migrationEffort === 'high').length;
    const totalConsumers = consumers.length;

    let approach: MigrationStrategy['approach'];
    if (totalConsumers <= 3) {
      approach = 'big_bang';
    } else if (highComplexityConsumers > totalConsumers * 0.5) {
      approach = 'feature_flag';
    } else {
      approach = 'gradual';
    }

    const phases = this.createMigrationPhases(approach, singleton, consumers);

    return {
      approach,
      phases,
      rollbackPlan: 'Revert to singleton pattern if issues arise during migration',
      estimatedDuration: this.estimateMigrationDuration(approach, consumers.length)
    };
  }

  private createMigrationPhases(
    approach: MigrationStrategy['approach'],
    singleton: SingletonInstance,
    consumers: ConsumerAnalysis[]
  ): MigrationPhase[] {
    const phases: MigrationPhase[] = [];

    if (approach === 'big_bang') {
      phases.push({
        order: 1,
        name: 'Complete Migration',
        description: 'Convert singleton and all consumers in one phase',
        deliverables: [
          'Updated singleton class',
          'DI container configuration',
          'All consumer updates',
          'Updated tests'
        ],
        risks: ['High risk of breaking changes', 'Difficult rollback'],
        successCriteria: ['All tests pass', 'No runtime errors', 'Performance maintained']
      });
    } else {
      phases.push(
        {
          order: 1,
          name: 'Preparation',
          description: 'Set up DI infrastructure and create adapter',
          deliverables: [
            'DI container setup',
            'Adapter pattern implementation',
            'Migration documentation'
          ],
          risks: ['Configuration complexity'],
          successCriteria: ['DI container works', 'Adapter maintains compatibility']
        },
        {
          order: 2,
          name: 'Gradual Consumer Migration',
          description: 'Migrate consumers in batches',
          deliverables: [
            'Migrated consumer batches',
            'Updated tests for each batch',
            'Performance monitoring'
          ],
          risks: ['Inconsistent state', 'Performance degradation'],
          successCriteria: ['Each batch works correctly', 'No performance regression']
        },
        {
          order: 3,
          name: 'Singleton Removal',
          description: 'Remove singleton pattern and adapter',
          deliverables: [
            'Cleaned up singleton class',
            'Removed adapter code',
            'Final documentation update'
          ],
          risks: ['Missed dependencies'],
          successCriteria: ['Clean architecture', 'All tests pass']
        }
      );
    }

    return phases;
  }

  private estimateMigrationDuration(approach: MigrationStrategy['approach'], consumerCount: number): string {
    const baseHours = approach === 'big_bang' ? 8 : 16;
    const consumerHours = consumerCount * 2;
    const totalHours = baseHours + consumerHours;

    if (totalHours <= 8) return '1 day';
    if (totalHours <= 16) return '2 days';
    if (totalHours <= 40) return '1 week';
    return '2+ weeks';
  }

  private recommendDIApproach(singleton: SingletonInstance): DIApproach {
    // Determine container type based on singleton characteristics
    let containerType: DIApproach['containerType'] = 'constructor';
    if (singleton.characteristics.dependencies.length > 5) {
      containerType = 'service_locator';
    }

    // Determine lifecycle based on singleton state
    let lifecycleManagement: DIApproach['lifecycleManagement'] = 'singleton';
    if (singleton.characteristics.statefulness === 'stateless') {
      lifecycleManagement = 'transient';
    }

    // Determine configuration method
    let configurationMethod: DIApproach['configurationMethod'] = 'code';
    if (singleton.characteristics.complexity > 10) {
      configurationMethod = 'configuration_file';
    }

    return {
      containerType,
      lifecycleManagement,
      configurationMethod,
      recommendedLibrary: 'inversify' // TypeScript DI library
    };
  }

  private generateDIRecommendations(opportunities: DependencyInjectionOpportunity[]): OptimizationRecommendation[] {
    return opportunities.map(opportunity => this.createDIRecommendation(opportunity));
  }

  private createDIRecommendation(opportunity: DependencyInjectionOpportunity): OptimizationRecommendation {
    const singleton = opportunity.singleton;
    const priority = this.determinePriority(opportunity);
    const complexity = this.determineComplexity(opportunity);

    return {
      id: uuidv4(),
      title: `Migrate ${singleton.className} from Singleton to Dependency Injection`,
      description: `Replace singleton pattern with dependency injection to improve ${opportunity.benefits.map(b => b.type).join(', ')}`,
      type: 'migration',
      priority,
      complexity,
      estimatedEffort: {
        hours: this.calculateEffortHours(opportunity),
        complexity,
        dependencies: [singleton.filePath, ...opportunity.affectedConsumers.map(c => c.filePath)]
      },
      benefits: opportunity.benefits.map(b => b.description),
      risks: opportunity.challenges.map(challenge => ({
        type: this.mapChallengeToRiskType(challenge.type),
        severity: challenge.severity,
        description: challenge.description,
        mitigation: challenge.mitigation
      })),
      implementationPlan: this.createImplementationPlan(opportunity),
      affectedFiles: [singleton.filePath, ...opportunity.affectedConsumers.map(c => c.filePath)]
    };
  }

  private determinePriority(opportunity: DependencyInjectionOpportunity): OptimizationRecommendation['priority'] {
    const highImpactBenefits = opportunity.benefits.filter(b => b.impact === 'high').length;
    const highSeverityChallenges = opportunity.challenges.filter(c => c.severity === 'high').length;

    if (highImpactBenefits >= 2 && highSeverityChallenges === 0) return 'high';
    if (highImpactBenefits >= 1 && highSeverityChallenges <= 1) return 'medium';
    return 'low';
  }

  private determineComplexity(opportunity: DependencyInjectionOpportunity): ComplexityRating {
    const level = opportunity.migrationComplexity;
    const factors = [
      'Singleton pattern removal',
      'DI container setup',
      'Consumer migration',
      ...opportunity.challenges.map(c => c.description)
    ];

    return {
      level,
      factors,
      reasoning: `Migration complexity is ${level} due to ${opportunity.affectedConsumers.length} affected consumers and ${opportunity.challenges.length} identified challenges`
    };
  }

  private calculateEffortHours(opportunity: DependencyInjectionOpportunity): number {
    const baseHours = 8;
    const consumerHours = opportunity.affectedConsumers.length * 2;
    const complexityMultiplier = {
      'low': 1,
      'medium': 1.5,
      'high': 2,
      'critical': 3
    }[opportunity.migrationComplexity];

    return Math.round((baseHours + consumerHours) * complexityMultiplier);
  }

  private mapChallengeToRiskType(challengeType: DIChallenge['type']): Risk['type'] {
    const mapping: Record<DIChallenge['type'], Risk['type']> = {
      'lifecycle': 'compatibility',
      'state_management': 'breaking_change',
      'initialization': 'compatibility',
      'consumer_updates': 'breaking_change',
      'configuration': 'compatibility'
    };

    return mapping[challengeType] || 'compatibility';
  }

  private createImplementationPlan(opportunity: DependencyInjectionOpportunity): ImplementationStep[] {
    return opportunity.migrationStrategy.phases.map((phase, index) => ({
      order: phase.order,
      title: phase.name,
      description: phase.description,
      codeExample: index === 0 ? this.generateDIExample(opportunity) : undefined,
      validation: phase.successCriteria.join(', ')
    }));
  }

  private generateDIExample(opportunity: DependencyInjectionOpportunity): string {
    const className = opportunity.singleton.className;
    
    return `// Before: Singleton pattern
class ${className} {
  private static instance: ${className};
  private constructor() {}
  
  static getInstance(): ${className} {
    if (!${className}.instance) {
      ${className}.instance = new ${className}();
    }
    return ${className}.instance;
  }
}

// After: Dependency injection
@injectable()
class ${className} {
  constructor(
    @inject('ConfigService') private config: ConfigService
  ) {}
}

// DI Container setup
container.bind<${className}>('${className}').to(${className}).inSingletonScope();`;
  }
}