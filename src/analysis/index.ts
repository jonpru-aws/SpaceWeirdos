/**
 * Main entry point for the code duplication analysis system
 */

// Export all types and models
export * from './types/DuplicationModels.js';

// Export all interfaces
export * from './interfaces/AnalysisInterfaces.js';

// Export parsers and analyzers
export * from './parsers/CodeParser.js';
export * from './analyzers/SimilarityAnalyzer.js';
export * from './utils/FileSystemUtils.js';

// Export generators
export * from './generators/ReportGenerator.js';

// Export CLI and integration utilities
export * from './cli/AnalysisCLI.js';
export * from './integration/BuildIntegration.js';

// Re-export commonly used types for convenience
export type {
  DuplicationInstance,
  OptimizationRecommendation,
  DuplicationReport,
  CodeLocation,
  ImpactMetrics
} from './types/DuplicationModels.js';

export type {
  IDuplicationDetector,
  IRecommendationEngine,
  IReportGenerator,
  AnalysisConfig
} from './interfaces/AnalysisInterfaces.js';

export type {
  ParsedFile,
  FileMetadata,
  ClassInfo,
  FunctionInfo,
  MethodInfo
} from './parsers/CodeParser.js';

export type {
  SimilarityResult,
  SimilarityConfig,
  CodeBlock,
  SimilarityAlgorithm
} from './analyzers/SimilarityAnalyzer.js';

export type {
  FileFilter,
  FileInfo
} from './utils/FileSystemUtils.js';