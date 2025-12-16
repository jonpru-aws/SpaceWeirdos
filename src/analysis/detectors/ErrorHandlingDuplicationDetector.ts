/**
 * Error Handling Duplication Detector
 * 
 * Detects duplicate error classification logic, inconsistent error messaging patterns,
 * and duplicate retry/recovery mechanisms across the codebase.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import { IDuplicationDetector, ParsedFile } from '../interfaces/AnalysisInterfaces.js';
import { DuplicationInstance, CodeLocation, ImpactMetrics } from '../types/DuplicationModels.js';
import * as ts from 'typescript';

export interface ErrorHandlingPattern {
  type: 'classification' | 'messaging' | 'retry' | 'recovery' | 'logging';
  pattern: string;
  location: CodeLocation;
  metadata: {
    errorTypes?: string[];
    messageTemplates?: string[];
    retryStrategies?: string[];
    logLevels?: string[];
  };
}

export interface ErrorHandlingAnalysis {
  patterns: ErrorHandlingPattern[];
  duplicateClassifications: DuplicationInstance[];
  inconsistentMessaging: DuplicationInstance[];
  duplicateRetryMechanisms: DuplicationInstance[];
  duplicateLogging: DuplicationInstance[];
}

/**
 * Detects duplication in error handling implementations
 */
export class ErrorHandlingDuplicationDetector implements IDuplicationDetector {
  private similarityThreshold = 0.8;

  async detectDuplications(files: ParsedFile[]): Promise<DuplicationInstance[]> {
    const errorHandlingPatterns = this.extractErrorHandlingPatterns(files);
    const analysis = this.analyzeErrorHandlingPatterns(errorHandlingPatterns);
    
    return [
      ...analysis.duplicateClassifications,
      ...analysis.inconsistentMessaging,
      ...analysis.duplicateRetryMechanisms,
      ...analysis.duplicateLogging
    ];
  }

  getDetectorType(): 'exact' | 'functional' | 'pattern' | 'configuration' {
    return 'pattern';
  }

  /**
   * Extracts error handling patterns from parsed files
   * Requirements: 6.1, 6.2, 6.3
   */
  private extractErrorHandlingPatterns(files: ParsedFile[]): ErrorHandlingPattern[] {
    const patterns: ErrorHandlingPattern[] = [];

    for (const file of files) {
      patterns.push(...this.extractFromFile(file));
    }

    return patterns;
  }

  /**
   * Extracts error handling patterns from a single file
   */
  private extractFromFile(file: ParsedFile): ErrorHandlingPattern[] {
    const patterns: ErrorHandlingPattern[] = [];
    const sourceFile = file.ast as ts.SourceFile;

    const visit = (node: ts.Node) => {
      try {
        // Extract error classification patterns
        if (this.isErrorClassificationNode(node)) {
          patterns.push(this.extractClassificationPattern(node, file.filePath));
        }

        // Extract error messaging patterns
        if (this.isErrorMessagingNode(node)) {
          patterns.push(this.extractMessagingPattern(node, file.filePath));
        }

        // Extract retry mechanism patterns
        if (this.isRetryMechanismNode(node)) {
          patterns.push(this.extractRetryPattern(node, file.filePath));
        }

        // Extract error logging patterns
        if (this.isErrorLoggingNode(node)) {
          patterns.push(this.extractLoggingPattern(node, file.filePath));
        }
      } catch (error) {
        // Continue processing other nodes if one fails
        console.warn(`Error processing node in ${file.filePath}:`, error);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return patterns;
  }

  /**
   * Analyzes error handling patterns for duplications
   */
  private analyzeErrorHandlingPatterns(patterns: ErrorHandlingPattern[]): ErrorHandlingAnalysis {
    const classificationPatterns = patterns.filter(p => p.type === 'classification');
    const messagingPatterns = patterns.filter(p => p.type === 'messaging');
    const retryPatterns = patterns.filter(p => p.type === 'retry');
    const loggingPatterns = patterns.filter(p => p.type === 'logging');

    return {
      patterns,
      duplicateClassifications: this.findDuplicateClassifications(classificationPatterns),
      inconsistentMessaging: this.findInconsistentMessaging(messagingPatterns),
      duplicateRetryMechanisms: this.findDuplicateRetryMechanisms(retryPatterns),
      duplicateLogging: this.findDuplicateLogging(loggingPatterns)
    };
  }

  /**
   * Identifies duplicate error classification logic
   * Requirements: 6.1
   */
  private findDuplicateClassifications(patterns: ErrorHandlingPattern[]): DuplicationInstance[] {
    const duplications: DuplicationInstance[] = [];
    
    // Simple approach: compare each pattern with every other pattern
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const similarity = this.calculatePatternSimilarity(patterns[i], patterns[j]);
        if (similarity >= this.similarityThreshold) {
          duplications.push({
            id: `error-classification-${Date.now()}-${Math.random()}`,
            type: 'pattern',
            similarity,
            locations: [patterns[i].location, patterns[j].location],
            description: `Duplicate error classification logic found in 2 locations`,
            impact: this.calculateImpact([patterns[i].location, patterns[j].location])
          });
        }
      }
    }

    return duplications;
  }

  /**
   * Identifies inconsistent error messaging patterns
   * Requirements: 6.2
   */
  private findInconsistentMessaging(patterns: ErrorHandlingPattern[]): DuplicationInstance[] {
    const duplications: DuplicationInstance[] = [];
    const messageGroups = this.groupByErrorType(patterns);

    for (const [errorType, groupPatterns] of messageGroups) {
      const messageTemplates = groupPatterns
        .flatMap(p => p.metadata.messageTemplates || [])
        .filter((template, index, arr) => arr.indexOf(template) === index);

      if (messageTemplates.length > 1) {
        // Multiple different message templates for the same error type indicates inconsistency
        duplications.push({
          id: `error-messaging-${Date.now()}-${Math.random()}`,
          type: 'pattern',
          similarity: 0.7, // Inconsistency rather than exact duplication
          locations: groupPatterns.map(p => p.location),
          description: `Inconsistent error messaging for ${errorType}: ${messageTemplates.length} different templates found`,
          impact: this.calculateImpact(groupPatterns.map(p => p.location))
        });
      }
    }

    return duplications;
  }

  /**
   * Identifies duplicate retry and recovery mechanisms
   * Requirements: 6.3
   */
  private findDuplicateRetryMechanisms(patterns: ErrorHandlingPattern[]): DuplicationInstance[] {
    const duplications: DuplicationInstance[] = [];
    const groups = this.groupSimilarPatterns(patterns);

    for (const group of groups) {
      if (group.length > 1) {
        const similarity = this.calculatePatternSimilarity(group[0], group[1]);
        if (similarity >= this.similarityThreshold) {
          duplications.push({
            id: `error-retry-${Date.now()}-${Math.random()}`,
            type: 'pattern',
            similarity,
            locations: group.map(p => p.location),
            description: `Duplicate retry/recovery mechanism found in ${group.length} locations`,
            impact: this.calculateImpact(group.map(p => p.location))
          });
        }
      }
    }

    return duplications;
  }

  /**
   * Identifies duplicate error logging patterns
   */
  private findDuplicateLogging(patterns: ErrorHandlingPattern[]): DuplicationInstance[] {
    const duplications: DuplicationInstance[] = [];
    const groups = this.groupSimilarPatterns(patterns);

    for (const group of groups) {
      if (group.length > 1) {
        const similarity = this.calculatePatternSimilarity(group[0], group[1]);
        if (similarity >= this.similarityThreshold) {
          duplications.push({
            id: `error-logging-${Date.now()}-${Math.random()}`,
            type: 'pattern',
            similarity,
            locations: group.map(p => p.location),
            description: `Duplicate error logging pattern found in ${group.length} locations`,
            impact: this.calculateImpact(group.map(p => p.location))
          });
        }
      }
    }

    return duplications;
  }

  /**
   * Checks if a node represents error classification logic
   */
  private isErrorClassificationNode(node: ts.Node): boolean {
    const text = node.getFullText();
    
    // Check for error classification patterns
    if (ts.isIfStatement(node) || ts.isSwitchStatement(node)) {
      return /error|Error|exception|Exception/.test(text) &&
             (/instanceof|typeof|\.code|\.type|\.name|constructor\.name/.test(text));
    }

    // Check for return statements with error classification
    if (ts.isReturnStatement(node)) {
      return /type|category|severity|level/.test(text) && /error|validation|network/i.test(text);
    }

    if (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) {
      const name = node.name?.getText() || '';
      return /classify|categorize|handle|process.*error/i.test(name);
    }

    // Check for any node that contains error classification logic
    return /instanceof.*Error|switch.*error\.constructor|if.*error\.code/.test(text);
  }

  /**
   * Checks if a node represents error messaging logic
   */
  private isErrorMessagingNode(node: ts.Node): boolean {
    const text = node.getFullText();
    
    if (ts.isStringLiteral(node) || ts.isTemplateExpression(node)) {
      return /error|failed|invalid|cannot|unable|not found|required|missing/i.test(text);
    }

    // Check for throw statements with error messages
    if (ts.isThrowStatement(node)) {
      return /Error|ValidationError|NetworkError/.test(text);
    }

    // Check for return statements with error objects
    if (ts.isReturnStatement(node)) {
      return /error.*:|message.*:/.test(text);
    }

    if (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) {
      const name = node.name?.getText() || '';
      return /message|format.*error|generate.*message/i.test(name);
    }

    return false;
  }

  /**
   * Checks if a node represents retry mechanism logic
   */
  private isRetryMechanismNode(node: ts.Node): boolean {
    const text = node.getFullText();
    
    if (ts.isForStatement(node) || ts.isWhileStatement(node) || ts.isDoStatement(node)) {
      return /retry|attempt|tries|maxRetries|retryCount|maxAttempts/i.test(text);
    }

    if (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) {
      const name = node.name?.getText() || '';
      return /retry|attempt|recover|backoff/i.test(name);
    }

    // Check for any retry-related patterns
    return /for.*attempt|while.*retry|catch.*retry|maxAttempts|retryCount/i.test(text);
  }

  /**
   * Checks if a node represents error logging logic
   */
  private isErrorLoggingNode(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) {
      const text = node.getFullText();
      return /console\.(error|warn|log)|logger\.|log\.|\.error\(|\.warn\(/i.test(text);
    }

    return false;
  }

  /**
   * Extracts error classification pattern from a node
   */
  private extractClassificationPattern(node: ts.Node, filePath: string): ErrorHandlingPattern {
    const sourceFile = node.getSourceFile();
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
    const text = node.getFullText();

    // Extract error types from the classification logic
    const errorTypes = this.extractErrorTypes(text);

    return {
      type: 'classification',
      pattern: this.normalizePattern(text),
      location: {
        filePath,
        startLine: start.line + 1,
        endLine: end.line + 1,
        codeBlock: text.trim(),
        context: this.getContext(node, sourceFile)
      },
      metadata: {
        errorTypes
      }
    };
  }

  /**
   * Extracts error messaging pattern from a node
   */
  private extractMessagingPattern(node: ts.Node, filePath: string): ErrorHandlingPattern {
    const sourceFile = node.getSourceFile();
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
    const text = node.getFullText();

    // Extract message templates
    const messageTemplates = this.extractMessageTemplates(text);

    return {
      type: 'messaging',
      pattern: this.normalizePattern(text),
      location: {
        filePath,
        startLine: start.line + 1,
        endLine: end.line + 1,
        codeBlock: text.trim(),
        context: this.getContext(node, sourceFile)
      },
      metadata: {
        messageTemplates
      }
    };
  }

  /**
   * Extracts retry pattern from a node
   */
  private extractRetryPattern(node: ts.Node, filePath: string): ErrorHandlingPattern {
    const sourceFile = node.getSourceFile();
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
    const text = node.getFullText();

    // Extract retry strategies
    const retryStrategies = this.extractRetryStrategies(text);

    return {
      type: 'retry',
      pattern: this.normalizePattern(text),
      location: {
        filePath,
        startLine: start.line + 1,
        endLine: end.line + 1,
        codeBlock: text.trim(),
        context: this.getContext(node, sourceFile)
      },
      metadata: {
        retryStrategies
      }
    };
  }

  /**
   * Extracts logging pattern from a node
   */
  private extractLoggingPattern(node: ts.Node, filePath: string): ErrorHandlingPattern {
    const sourceFile = node.getSourceFile();
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
    const text = node.getFullText();

    // Extract log levels
    const logLevels = this.extractLogLevels(text);

    return {
      type: 'logging',
      pattern: this.normalizePattern(text),
      location: {
        filePath,
        startLine: start.line + 1,
        endLine: end.line + 1,
        codeBlock: text.trim(),
        context: this.getContext(node, sourceFile)
      },
      metadata: {
        logLevels
      }
    };
  }

  /**
   * Groups similar patterns together
   */
  private groupSimilarPatterns(patterns: ErrorHandlingPattern[]): ErrorHandlingPattern[][] {
    const groups: ErrorHandlingPattern[][] = [];
    const processed = new Set<number>();

    for (let i = 0; i < patterns.length; i++) {
      if (processed.has(i)) continue;

      const group = [patterns[i]];
      processed.add(i);

      for (let j = i + 1; j < patterns.length; j++) {
        if (processed.has(j)) continue;

        const similarity = this.calculatePatternSimilarity(patterns[i], patterns[j]);
        if (similarity >= this.similarityThreshold) {
          group.push(patterns[j]);
          processed.add(j);
        }
      }

      if (group.length > 1) {
        groups.push(group);
      }
    }

    return groups;
  }

  /**
   * Groups patterns by error type
   */
  private groupByErrorType(patterns: ErrorHandlingPattern[]): Map<string, ErrorHandlingPattern[]> {
    const groups = new Map<string, ErrorHandlingPattern[]>();

    for (const pattern of patterns) {
      const errorTypes = pattern.metadata.errorTypes || ['unknown'];
      
      for (const errorType of errorTypes) {
        if (!groups.has(errorType)) {
          groups.set(errorType, []);
        }
        groups.get(errorType)!.push(pattern);
      }
    }

    return groups;
  }

  /**
   * Calculates similarity between two patterns
   */
  private calculatePatternSimilarity(pattern1: ErrorHandlingPattern, pattern2: ErrorHandlingPattern): number {
    // Normalize patterns for comparison
    const normalized1 = this.normalizePattern(pattern1.pattern);
    const normalized2 = this.normalizePattern(pattern2.pattern);

    // Calculate text similarity
    const textSimilarity = this.calculateTextSimilarity(normalized1, normalized2);

    // Calculate metadata similarity
    const metadataSimilarity = this.calculateMetadataSimilarity(pattern1.metadata, pattern2.metadata);

    // Weighted average
    return (textSimilarity * 0.7) + (metadataSimilarity * 0.3);
  }

  /**
   * Normalizes a pattern for comparison
   */
  private normalizePattern(pattern: string): string {
    return pattern
      .replace(/\s+/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .toLowerCase()
      .trim();
  }

  /**
   * Calculates text similarity using Levenshtein distance
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const maxLength = Math.max(text1.length, text2.length);
    if (maxLength === 0) return 1;

    const distance = this.levenshteinDistance(text1, text2);
    return 1 - (distance / maxLength);
  }

  /**
   * Calculates Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculates metadata similarity
   */
  private calculateMetadataSimilarity(metadata1: any, metadata2: any): number {
    const keys1 = Object.keys(metadata1);
    const keys2 = Object.keys(metadata2);
    const allKeys = [...new Set([...keys1, ...keys2])];

    if (allKeys.length === 0) return 1;

    let matches = 0;
    for (const key of allKeys) {
      const value1 = metadata1[key] || [];
      const value2 = metadata2[key] || [];
      
      if (Array.isArray(value1) && Array.isArray(value2)) {
        const intersection = value1.filter(v => value2.includes(v));
        const union = [...new Set([...value1, ...value2])];
        if (union.length > 0) {
          matches += intersection.length / union.length;
        }
      }
    }

    return matches / allKeys.length;
  }

  /**
   * Extracts error types from classification logic
   */
  private extractErrorTypes(text: string): string[] {
    const types: string[] = [];
    
    // Extract from instanceof checks
    const instanceofMatches = text.match(/instanceof\s+(\w+Error|\w+Exception)/g);
    if (instanceofMatches) {
      types.push(...instanceofMatches.map(m => m.replace('instanceof ', '')));
    }

    // Extract from error.code or error.type checks
    const codeMatches = text.match(/['"`]([A-Z_]+)['"`]/g);
    if (codeMatches) {
      types.push(...codeMatches.map(m => m.replace(/['"`]/g, '')));
    }

    return [...new Set(types)];
  }

  /**
   * Extracts message templates from messaging logic
   */
  private extractMessageTemplates(text: string): string[] {
    const templates: string[] = [];
    
    // Extract string literals and template literals
    const stringMatches = text.match(/['"`][^'"`]*['"`]/g);
    if (stringMatches) {
      templates.push(...stringMatches.map(m => m.replace(/['"`]/g, '')));
    }

    return templates.filter(t => t.length > 5); // Filter out short strings
  }

  /**
   * Extracts retry strategies from retry logic
   */
  private extractRetryStrategies(text: string): string[] {
    const strategies: string[] = [];
    
    if (/exponential|backoff/i.test(text)) {
      strategies.push('exponential_backoff');
    }
    if (/linear|fixed/i.test(text)) {
      strategies.push('fixed_delay');
    }
    if (/jitter|random/i.test(text)) {
      strategies.push('jitter');
    }

    return strategies;
  }

  /**
   * Extracts log levels from logging logic
   */
  private extractLogLevels(text: string): string[] {
    const levels: string[] = [];
    
    if (/\.error\(|console\.error/i.test(text)) levels.push('error');
    if (/\.warn\(|console\.warn/i.test(text)) levels.push('warn');
    if (/\.info\(|console\.info/i.test(text)) levels.push('info');
    if (/\.debug\(|console\.debug/i.test(text)) levels.push('debug');
    if (/\.log\(|console\.log/i.test(text)) levels.push('log');

    return levels;
  }

  /**
   * Gets context around a node
   */
  private getContext(node: ts.Node, sourceFile: ts.SourceFile): string {
    const parent = node.parent;
    if (parent) {
      const start = sourceFile.getLineAndCharacterOfPosition(parent.getStart());
      const end = sourceFile.getLineAndCharacterOfPosition(parent.getEnd());
      return `In ${ts.SyntaxKind[parent.kind]} at lines ${start.line + 1}-${end.line + 1}`;
    }
    return 'Top level';
  }

  /**
   * Calculates impact metrics for a set of locations
   */
  private calculateImpact(locations: CodeLocation[]): ImpactMetrics {
    const totalLines = locations.reduce((sum, loc) => sum + (loc.endLine - loc.startLine + 1), 0);
    
    return {
      linesOfCode: totalLines,
      complexity: Math.min(10, Math.ceil(totalLines / 10)), // Rough complexity estimate
      maintainabilityIndex: Math.max(0, 100 - (totalLines * 2)), // Rough maintainability estimate
      testCoverage: 0 // Would need actual test coverage data
    };
  }
}