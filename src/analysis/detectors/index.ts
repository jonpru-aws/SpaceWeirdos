/**
 * Duplication detectors export index
 */

export { ExactMatchDetector } from './ExactMatchDetector.js';
export { FunctionalDuplicationDetector } from './FunctionalDuplicationDetector.js';
export { PatternDuplicationDetector } from './PatternDuplicationDetector.js';
export { ConfigurationDuplicationDetector } from './ConfigurationDuplicationDetector.js';
export { CacheAnalysisDetector } from './CacheAnalysisDetector.js';
export { ValidationDuplicationDetector } from './ValidationDuplicationDetector.js';
export { ErrorHandlingDuplicationDetector } from './ErrorHandlingDuplicationDetector.js';

export type { ExactMatchConfig } from './ExactMatchDetector.js';
export type { FunctionalDuplicationConfig } from './FunctionalDuplicationDetector.js';
export type { PatternDuplicationConfig } from './PatternDuplicationDetector.js';
export type { ConfigurationDuplicationConfig } from './ConfigurationDuplicationDetector.js';
export type { 
  CacheImplementation, 
  CacheFeature, 
  CacheConfiguration, 
  CacheUsage, 
  CacheConsolidationOpportunity 
} from './CacheAnalysisDetector.js';
export type {
  ValidationPattern,
  ValidationContext,
  ValidationRule,
  ErrorMessagePattern
} from './ValidationDuplicationDetector.js';
export type {
  ErrorHandlingPattern,
  ErrorHandlingAnalysis
} from './ErrorHandlingDuplicationDetector.js';