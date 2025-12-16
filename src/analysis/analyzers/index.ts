/**
 * Analysis analyzers export index
 */

export { SimilarityAnalyzer } from './SimilarityAnalyzer.js';
export { SingletonPatternAnalyzer } from './SingletonPatternAnalyzer.js';
export { DependencyInjectionAnalyzer } from './DependencyInjectionAnalyzer.js';
export { CacheConsolidationAnalyzer } from './CacheConsolidationAnalyzer.js';
export { ValidationConsolidationAnalyzer } from './ValidationConsolidationAnalyzer.js';
export { ServiceLayerAnalyzer } from './ServiceLayerAnalyzer.js';
export { ServiceConsolidationAnalyzer } from './ServiceConsolidationAnalyzer.js';
export { ErrorHandlingAnalyzer } from './ErrorHandlingAnalyzer.js';
export { ImpactAnalyzer } from './ImpactAnalyzer.js';
export { ComplexityEstimator } from './ComplexityEstimator.js';
export { RiskAssessor } from './RiskAssessor.js';
export { StrategyGenerator } from './StrategyGenerator.js';
export { ConfigurationManagementAnalyzer } from './ConfigurationManagementAnalyzer.js';

export type { 
  SingletonAnalysisConfig,
  SingletonInstance,
  SingletonImplementation,
  SingletonCharacteristics,
  ConsolidationOpportunity
} from './SingletonPatternAnalyzer.js';

export type {
  DependencyInjectionConfig,
  DependencyInjectionOpportunity,
  DIBenefit,
  DIChallenge,
  MigrationStrategy,
  MigrationPhase,
  ConsumerAnalysis,
  DIApproach
} from './DependencyInjectionAnalyzer.js';

export type { 
  UnifiedCachingStrategy, 
  CacheStandardizationReport, 
  MigrationRoadmap,
  CacheInventory,
  MigrationPhase as CacheMigrationPhase
} from './CacheConsolidationAnalyzer.js';

export type {
  ValidationConsolidationOpportunity,
  ValidationMigrationStrategy
} from './ValidationConsolidationAnalyzer.js';

export type {
  ServiceInfo,
  ServiceMethod,
  ServiceDependency,
  ResponsibilityOverlap,
  CircularDependency
} from './ServiceLayerAnalyzer.js';

export type {
  SharedInterfaceOpportunity,
  BaseClassOpportunity,
  ServiceMergeOpportunity,
  ArchitecturalImprovement
} from './ServiceConsolidationAnalyzer.js';

export type {
  ErrorHandlingConsolidationOpportunity,
  ErrorHandlingMigrationStrategy
} from './ErrorHandlingAnalyzer.js';

export type {
  ImpactAnalysisResult,
  ImpactAnalysisConfig
} from './ImpactAnalyzer.js';

export type {
  ComplexityFactors,
  EffortEstimationConfig
} from './ComplexityEstimator.js';

export type {
  RiskAssessmentConfig,
  RiskAnalysisResult
} from './RiskAssessor.js';

export type {
  RefactoringStrategy,
  StrategyPhase,
  RollbackStep,
  ValidationCriterion,
  MigrationStrategy,
  MigrationPhase
} from './StrategyGenerator.js';

export type {
  ConfigurationMigrationAnalysis,
  ConfigurationMigrationPriority
} from './ConfigurationManagementAnalyzer.js';