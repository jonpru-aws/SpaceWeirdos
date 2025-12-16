/**
 * Core data models for code duplication analysis
 * Based on design document specifications
 */

export interface CodeLocation {
  filePath: string;
  startLine: number;
  endLine: number;
  codeBlock: string;
  context: string;
}

export interface ImpactMetrics {
  linesOfCode: number;
  complexity: number;
  maintainabilityIndex: number;
  testCoverage: number;
}

export interface DuplicationInstance {
  id: string;
  type: 'exact' | 'functional' | 'pattern' | 'configuration';
  similarity: number;
  locations: CodeLocation[];
  description: string;
  impact: ImpactMetrics;
}

export interface ComplexityRating {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  reasoning: string;
}

export interface EffortEstimate {
  hours: number;
  complexity: ComplexityRating;
  dependencies: string[];
}

export interface Risk {
  type: 'breaking_change' | 'performance' | 'compatibility' | 'testing';
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export interface ImplementationStep {
  order: number;
  title: string;
  description: string;
  codeExample?: string;
  validation: string;
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'consolidation' | 'abstraction' | 'refactoring' | 'migration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  complexity: ComplexityRating;
  estimatedEffort: EffortEstimate;
  benefits: string[];
  risks: Risk[];
  implementationPlan: ImplementationStep[];
  affectedFiles: string[];
}

export interface ReportSummary {
  totalDuplications: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  potentialSavings: {
    linesOfCode: number;
    files: number;
    estimatedHours: number;
  };
}

export interface QualityMetrics {
  duplicationPercentage: number;
  maintainabilityIndex: number;
  technicalDebtRatio: number;
  codeComplexity: number;
}

export interface DuplicationReport {
  summary: ReportSummary;
  duplications: DuplicationInstance[];
  recommendations: OptimizationRecommendation[];
  metrics: QualityMetrics;
  generatedAt: Date;
}

export interface AnalysisConfig {
  similarityThreshold: number;
  minCodeBlockSize: number;
  excludePatterns: string[];
  includePatterns: string[];
  analysisTypes: ('exact' | 'functional' | 'pattern' | 'configuration')[];
}