/**
 * PatternDuplicationDetector - Identifies repeated implementation patterns that could be abstracted
 * Detects singleton patterns and architectural anti-patterns
 */

import { IDuplicationDetector } from '../interfaces/AnalysisInterfaces.js';
import { DuplicationInstance, CodeLocation, ImpactMetrics } from '../types/DuplicationModels.js';
import { ParsedFile } from '../parsers/CodeParser.js';
import { SimilarityAnalyzer, CodeBlock } from '../analyzers/SimilarityAnalyzer.js';
import { v4 as uuidv4 } from 'uuid';

export interface PatternDuplicationConfig {
  minPatternOccurrences: number;
  minPatternSimilarity: number;
  detectSingletonPatterns: boolean;
  detectFactoryPatterns: boolean;
  detectObserverPatterns: boolean;
  detectAntiPatterns: boolean;
}

export interface DetectedPattern {
  type: PatternType;
  name: string;
  occurrences: CodeLocation[];
  similarity: number;
  description: string;
  isAntiPattern: boolean;
}

export enum PatternType {
  SINGLETON = 'singleton',
  FACTORY = 'factory',
  OBSERVER = 'observer',
  BUILDER = 'builder',
  STRATEGY = 'strategy',
  DECORATOR = 'decorator',
  ADAPTER = 'adapter',
  // Anti-patterns
  GOD_CLASS = 'god_class',
  LONG_METHOD = 'long_method',
  DUPLICATE_CODE = 'duplicate_code',
  LARGE_CLASS = 'large_class',
  LONG_PARAMETER_LIST = 'long_parameter_list'
}

export class PatternDuplicationDetector implements IDuplicationDetector {
  private config: PatternDuplicationConfig;
  private similarityAnalyzer: SimilarityAnalyzer;

  constructor(config?: Partial<PatternDuplicationConfig>) {
    this.config = {
      minPatternOccurrences: 2,
      minPatternSimilarity: 0.7,
      detectSingletonPatterns: true,
      detectFactoryPatterns: true,
      detectObserverPatterns: true,
      detectAntiPatterns: true,
      ...config
    };

    this.similarityAnalyzer = new SimilarityAnalyzer();
  }

  getDetectorType(): 'exact' | 'functional' | 'pattern' | 'configuration' {
    return 'pattern';
  }

  async detectDuplications(files: ParsedFile[]): Promise<DuplicationInstance[]> {
    const duplications: DuplicationInstance[] = [];
    const detectedPatterns: DetectedPattern[] = [];

    // Detect various patterns across all files
    for (const file of files) {
      if (this.config.detectSingletonPatterns) {
        detectedPatterns.push(...this.detectSingletonPatterns(file));
      }
      if (this.config.detectFactoryPatterns) {
        detectedPatterns.push(...this.detectFactoryPatterns(file));
      }
      if (this.config.detectObserverPatterns) {
        detectedPatterns.push(...this.detectObserverPatterns(file));
      }
      if (this.config.detectAntiPatterns) {
        detectedPatterns.push(...this.detectAntiPatterns(file));
      }
    }

    // Group patterns by type and find duplications
    const patternGroups = this.groupPatternsByType(detectedPatterns);
    
    for (const [patternType, patterns] of patternGroups.entries()) {
      if (patterns.length >= this.config.minPatternOccurrences) {
        const duplication = this.createPatternDuplication(patternType, patterns);
        duplications.push(duplication);
      }
    }

    return duplications.sort((a, b) => b.similarity - a.similarity);
  }

  private detectSingletonPatterns(file: ParsedFile): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    for (const classInfo of file.metadata.classes) {
      const classContent = this.extractClassContent(file, classInfo);
      
      if (this.isSingletonPattern(classContent, classInfo)) {
        patterns.push({
          type: PatternType.SINGLETON,
          name: classInfo.name,
          occurrences: [{
            filePath: file.filePath,
            startLine: classInfo.startLine,
            endLine: classInfo.endLine,
            codeBlock: classContent,
            context: `singleton class: ${classInfo.name}`
          }],
          similarity: 1.0,
          description: `Singleton pattern implementation in class ${classInfo.name}`,
          isAntiPattern: false
        });
      }
    }

    return patterns;
  }

  private isSingletonPattern(classContent: string, classInfo: any): boolean {
    const content = classContent.toLowerCase();
    
    // Check for singleton characteristics
    const hasPrivateConstructor = content.includes('private constructor') || 
                                 content.includes('private static');
    const hasGetInstance = content.includes('getinstance') || 
                          content.includes('get instance');
    const hasStaticInstance = content.includes('static instance') || 
                             content.includes('static _instance');

    // Must have at least 2 of the 3 singleton characteristics
    const singletonScore = [hasPrivateConstructor, hasGetInstance, hasStaticInstance]
      .filter(Boolean).length;

    return singletonScore >= 2;
  }

  private detectFactoryPatterns(file: ParsedFile): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    for (const classInfo of file.metadata.classes) {
      const classContent = this.extractClassContent(file, classInfo);
      
      if (this.isFactoryPattern(classContent, classInfo)) {
        patterns.push({
          type: PatternType.FACTORY,
          name: classInfo.name,
          occurrences: [{
            filePath: file.filePath,
            startLine: classInfo.startLine,
            endLine: classInfo.endLine,
            codeBlock: classContent,
            context: `factory class: ${classInfo.name}`
          }],
          similarity: 1.0,
          description: `Factory pattern implementation in class ${classInfo.name}`,
          isAntiPattern: false
        });
      }
    }

    // Also check for factory functions
    for (const funcInfo of file.metadata.functions) {
      const funcContent = this.extractFunctionContent(file, funcInfo);
      
      if (this.isFactoryFunction(funcContent, funcInfo)) {
        patterns.push({
          type: PatternType.FACTORY,
          name: funcInfo.name,
          occurrences: [{
            filePath: file.filePath,
            startLine: funcInfo.startLine,
            endLine: funcInfo.endLine,
            codeBlock: funcContent,
            context: `factory function: ${funcInfo.name}`
          }],
          similarity: 1.0,
          description: `Factory pattern implementation in function ${funcInfo.name}`,
          isAntiPattern: false
        });
      }
    }

    return patterns;
  }

  private isFactoryPattern(content: string, classInfo: any): boolean {
    const lowerContent = content.toLowerCase();
    
    // Check for factory characteristics
    const hasCreateMethod = lowerContent.includes('create') && 
                           (lowerContent.includes('new ') || lowerContent.includes('return'));
    const hasFactoryName = classInfo.name.toLowerCase().includes('factory');
    const hasMultipleCreationMethods = (content.match(/create\w*/gi) || []).length > 1;

    return hasCreateMethod && (hasFactoryName || hasMultipleCreationMethods);
  }

  private isFactoryFunction(content: string, funcInfo: any): boolean {
    const lowerContent = content.toLowerCase();
    const funcName = funcInfo.name.toLowerCase();
    
    // Check for factory function characteristics
    const hasFactoryName = funcName.includes('create') || funcName.includes('make') || 
                          funcName.includes('build') || funcName.includes('factory');
    const returnsNewObject = lowerContent.includes('return') && 
                            (lowerContent.includes('new ') || lowerContent.includes('{'));
    const hasConditionalCreation = lowerContent.includes('if') && returnsNewObject;

    return hasFactoryName && returnsNewObject && hasConditionalCreation;
  }

  private detectObserverPatterns(file: ParsedFile): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    for (const classInfo of file.metadata.classes) {
      const classContent = this.extractClassContent(file, classInfo);
      
      if (this.isObserverPattern(classContent, classInfo)) {
        patterns.push({
          type: PatternType.OBSERVER,
          name: classInfo.name,
          occurrences: [{
            filePath: file.filePath,
            startLine: classInfo.startLine,
            endLine: classInfo.endLine,
            codeBlock: classContent,
            context: `observer class: ${classInfo.name}`
          }],
          similarity: 1.0,
          description: `Observer pattern implementation in class ${classInfo.name}`,
          isAntiPattern: false
        });
      }
    }

    return patterns;
  }

  private isObserverPattern(content: string, classInfo: any): boolean {
    const lowerContent = content.toLowerCase();
    
    // Check for observer characteristics
    const hasSubscribe = lowerContent.includes('subscribe') || lowerContent.includes('addeventlistener');
    const hasNotify = lowerContent.includes('notify') || lowerContent.includes('emit') || 
                     lowerContent.includes('trigger');
    const hasObserverList = lowerContent.includes('observers') || lowerContent.includes('listeners') ||
                           lowerContent.includes('subscribers');

    return (hasSubscribe && hasNotify) || (hasObserverList && (hasSubscribe || hasNotify));
  }

  private detectAntiPatterns(file: ParsedFile): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    for (const classInfo of file.metadata.classes) {
      const classContent = this.extractClassContent(file, classInfo);
      
      // Detect God Class anti-pattern
      if (this.isGodClass(classContent, classInfo)) {
        patterns.push({
          type: PatternType.GOD_CLASS,
          name: classInfo.name,
          occurrences: [{
            filePath: file.filePath,
            startLine: classInfo.startLine,
            endLine: classInfo.endLine,
            codeBlock: classContent,
            context: `god class: ${classInfo.name}`
          }],
          similarity: 1.0,
          description: `God Class anti-pattern detected in ${classInfo.name}`,
          isAntiPattern: true
        });
      }

      // Detect Large Class anti-pattern
      if (this.isLargeClass(classContent, classInfo)) {
        patterns.push({
          type: PatternType.LARGE_CLASS,
          name: classInfo.name,
          occurrences: [{
            filePath: file.filePath,
            startLine: classInfo.startLine,
            endLine: classInfo.endLine,
            codeBlock: classContent,
            context: `large class: ${classInfo.name}`
          }],
          similarity: 1.0,
          description: `Large Class anti-pattern detected in ${classInfo.name}`,
          isAntiPattern: true
        });
      }
    }

    // Detect Long Method anti-pattern
    for (const funcInfo of file.metadata.functions) {
      const funcContent = this.extractFunctionContent(file, funcInfo);
      
      if (this.isLongMethod(funcContent, funcInfo)) {
        patterns.push({
          type: PatternType.LONG_METHOD,
          name: funcInfo.name,
          occurrences: [{
            filePath: file.filePath,
            startLine: funcInfo.startLine,
            endLine: funcInfo.endLine,
            codeBlock: funcContent,
            context: `long method: ${funcInfo.name}`
          }],
          similarity: 1.0,
          description: `Long Method anti-pattern detected in ${funcInfo.name}`,
          isAntiPattern: true
        });
      }

      // Detect Long Parameter List anti-pattern
      if (this.hasLongParameterList(funcInfo)) {
        patterns.push({
          type: PatternType.LONG_PARAMETER_LIST,
          name: funcInfo.name,
          occurrences: [{
            filePath: file.filePath,
            startLine: funcInfo.startLine,
            endLine: funcInfo.endLine,
            codeBlock: funcContent,
            context: `long parameter list: ${funcInfo.name}`
          }],
          similarity: 1.0,
          description: `Long Parameter List anti-pattern detected in ${funcInfo.name}`,
          isAntiPattern: true
        });
      }
    }

    return patterns;
  }

  private isGodClass(content: string, classInfo: any): boolean {
    const lineCount = classInfo.endLine - classInfo.startLine + 1;
    const methodCount = classInfo.methods?.length || 0;
    const propertyCount = classInfo.properties?.length || 0;

    // God class thresholds
    return lineCount > 500 || methodCount > 20 || propertyCount > 15;
  }

  private isLargeClass(content: string, classInfo: any): boolean {
    const lineCount = classInfo.endLine - classInfo.startLine + 1;
    const methodCount = classInfo.methods?.length || 0;

    // Large class thresholds (less severe than God class)
    return lineCount > 300 || methodCount > 15;
  }

  private isLongMethod(content: string, funcInfo: any): boolean {
    const lineCount = funcInfo.endLine - funcInfo.startLine + 1;
    
    // Long method threshold
    return lineCount > 50;
  }

  private hasLongParameterList(funcInfo: any): boolean {
    const paramCount = funcInfo.parameters?.length || 0;
    
    // Long parameter list threshold
    return paramCount > 5;
  }

  private extractClassContent(file: ParsedFile, classInfo: any): string {
    const lines = file.content.split('\n');
    return lines.slice(classInfo.startLine - 1, classInfo.endLine).join('\n');
  }

  private extractFunctionContent(file: ParsedFile, funcInfo: any): string {
    const lines = file.content.split('\n');
    return lines.slice(funcInfo.startLine - 1, funcInfo.endLine).join('\n');
  }

  private groupPatternsByType(patterns: DetectedPattern[]): Map<PatternType, DetectedPattern[]> {
    const groups = new Map<PatternType, DetectedPattern[]>();
    
    for (const pattern of patterns) {
      if (!groups.has(pattern.type)) {
        groups.set(pattern.type, []);
      }
      groups.get(pattern.type)!.push(pattern);
    }

    return groups;
  }

  private createPatternDuplication(
    patternType: PatternType,
    patterns: DetectedPattern[]
  ): DuplicationInstance {
    const allLocations: CodeLocation[] = [];
    
    for (const pattern of patterns) {
      allLocations.push(...pattern.occurrences);
    }

    const impact = this.calculatePatternImpact(allLocations, patternType);
    const description = this.generatePatternDescription(patternType, patterns);

    return {
      id: uuidv4(),
      type: 'pattern',
      similarity: this.calculatePatternSimilarity(patterns),
      locations: allLocations,
      description,
      impact
    };
  }

  private calculatePatternSimilarity(patterns: DetectedPattern[]): number {
    if (patterns.length === 0) return 0;
    
    // For patterns, similarity is based on how consistently the pattern is implemented
    const avgSimilarity = patterns.reduce((sum, p) => sum + p.similarity, 0) / patterns.length;
    
    // Bonus for multiple occurrences of the same pattern
    const occurrenceBonus = Math.min(patterns.length * 0.1, 0.3);
    
    return Math.min(avgSimilarity + occurrenceBonus, 1.0);
  }

  private calculatePatternImpact(locations: CodeLocation[], patternType: PatternType): ImpactMetrics {
    const totalLines = locations.reduce((sum, loc) => sum + (loc.endLine - loc.startLine + 1), 0);
    
    // Different patterns have different complexity impacts
    const patternComplexityMultiplier = this.getPatternComplexityMultiplier(patternType);
    const complexity = Math.round(totalLines * patternComplexityMultiplier);
    
    // Anti-patterns have negative maintainability impact
    const isAntiPattern = [
      PatternType.GOD_CLASS,
      PatternType.LONG_METHOD,
      PatternType.LARGE_CLASS,
      PatternType.LONG_PARAMETER_LIST
    ].includes(patternType);
    
    const maintainabilityPenalty = isAntiPattern ? 30 : 0;
    
    return {
      linesOfCode: totalLines,
      complexity,
      maintainabilityIndex: Math.max(0, 100 - complexity * 0.5 - maintainabilityPenalty),
      testCoverage: 0
    };
  }

  private getPatternComplexityMultiplier(patternType: PatternType): number {
    const multipliers: Record<PatternType, number> = {
      [PatternType.SINGLETON]: 1.2,
      [PatternType.FACTORY]: 1.1,
      [PatternType.OBSERVER]: 1.3,
      [PatternType.BUILDER]: 1.1,
      [PatternType.STRATEGY]: 1.0,
      [PatternType.DECORATOR]: 1.2,
      [PatternType.ADAPTER]: 1.1,
      [PatternType.GOD_CLASS]: 2.0,
      [PatternType.LONG_METHOD]: 1.5,
      [PatternType.DUPLICATE_CODE]: 1.8,
      [PatternType.LARGE_CLASS]: 1.6,
      [PatternType.LONG_PARAMETER_LIST]: 1.3
    };

    return multipliers[patternType] || 1.0;
  }

  private generatePatternDescription(patternType: PatternType, patterns: DetectedPattern[]): string {
    const count = patterns.length;
    const isAntiPattern = patterns[0]?.isAntiPattern || false;
    const patternName = patternType.replace('_', ' ').toLowerCase();
    
    if (isAntiPattern) {
      return `${count} instances of ${patternName} anti-pattern detected across multiple files`;
    } else {
      return `${count} instances of ${patternName} pattern detected - consider consolidating similar implementations`;
    }
  }
}