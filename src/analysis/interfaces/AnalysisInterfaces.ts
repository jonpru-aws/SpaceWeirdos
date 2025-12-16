/**
 * Core interfaces for the duplication analysis system
 */

import { DuplicationInstance, OptimizationRecommendation, DuplicationReport } from '../types/DuplicationModels.js';

export interface ICodeParser {
  parseFile(filePath: string): Promise<ParsedFile>;
  parseDirectory(directoryPath: string): Promise<ParsedFile[]>;
}

export interface ParsedFile {
  filePath: string;
  ast: any; // TypeScript AST node
  metadata: FileMetadata;
}

export interface FileMetadata {
  linesOfCode: number;
  complexity: number;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
}

export interface FunctionInfo {
  name: string;
  startLine: number;
  endLine: number;
  parameters: string[];
  returnType?: string;
  complexity: number;
}

export interface ClassInfo {
  name: string;
  startLine: number;
  endLine: number;
  methods: FunctionInfo[];
  properties: PropertyInfo[];
  extends?: string;
  implements?: string[];
}

export interface PropertyInfo {
  name: string;
  type?: string;
  isStatic: boolean;
  isPrivate: boolean;
}

export interface ImportInfo {
  module: string;
  imports: string[];
  isDefault: boolean;
}

export interface ExportInfo {
  name: string;
  type: 'function' | 'class' | 'variable' | 'type';
  isDefault: boolean;
}

export interface ISimilarityAnalyzer {
  calculateSimilarity(code1: string, code2: string): number;
  calculateStructuralSimilarity(ast1: any, ast2: any): number;
  calculateSemanticSimilarity(metadata1: FileMetadata, metadata2: FileMetadata): number;
}

export interface IDuplicationDetector {
  detectDuplications(files: ParsedFile[]): Promise<DuplicationInstance[]>;
  getDetectorType(): 'exact' | 'functional' | 'pattern' | 'configuration';
}

export interface IRecommendationEngine {
  generateRecommendations(duplications: DuplicationInstance[]): Promise<OptimizationRecommendation[]>;
  prioritizeRecommendations(recommendations: OptimizationRecommendation[]): OptimizationRecommendation[];
}

export interface IReportGenerator {
  generateReport(duplications: DuplicationInstance[], recommendations: OptimizationRecommendation[]): Promise<DuplicationReport>;
  exportReport(report: DuplicationReport, format: 'json' | 'html' | 'markdown'): Promise<string>;
}

export interface AnalysisConfig {
  similarityThreshold: number;
  minCodeBlockSize: number;
  excludePatterns: string[];
  includePatterns: string[];
  analysisTypes: ('exact' | 'functional' | 'pattern' | 'configuration')[];
}