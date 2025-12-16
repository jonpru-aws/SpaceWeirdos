/**
 * Error Handling Analyzer
 * 
 * Analyzes error handling duplication and generates recommendations for
 * unified error handling strategies and consistent error management.
 * 
 * Requirements: 6.4, 6.5
 */

import { OptimizationRecommendation, DuplicationInstance, ComplexityRating, Risk, ImplementationStep } from '../types/DuplicationModels.js';
import { ErrorHandlingPattern } from '../detectors/ErrorHandlingDuplicationDetector.js';

export interface ErrorHandlingConsolidationOpportunity {
  type: 'unified_classification' | 'centralized_logging' | 'standardized_messaging' | 'common_retry_strategy' | 'unified_recovery';
  duplications: DuplicationInstance[];
  consolidationTarget: string;
  affectedFiles: string[];
  estimatedSavings: {
    linesOfCode: number;
    duplicatePatterns: number;
    maintenanceEffort: number;
  };
}

export interface ErrorHandlingMigrationStrategy {
  phase: number;
  title: string;
  description: string;
  steps: ImplementationStep[];
  risks: Risk[];
  dependencies: string[];
}

export class ErrorHandlingAnalyzer {
  private complexityThresholds = {
    low: 2,
    medium: 5,
    high: 10,
    critical: 20
  };

  /**
   * Generate recommendations from error handling analysis
   * Requirements: 6.4, 6.5
   */
  generateRecommendations(analysis: any, files: any[]): OptimizationRecommendation[] {
    // Extract duplications from analysis
    const duplications = [
      ...analysis.duplicateClassifications,
      ...analysis.inconsistentMessaging,
      ...analysis.duplicateRetryMechanisms,
      ...analysis.duplicateLogging
    ];

    // Use the main analysis method
    return this.analyzeErrorHandlingConsolidationSync(duplications);
  }

  /**
   * Analyze error handling duplications and generate consolidation recommendations
   * Requirements: 6.4, 6.5
   */
  async analyzeErrorHandlingConsolidation(duplications: DuplicationInstance[]): Promise<OptimizationRecommendation[]> {
    return this.analyzeErrorHandlingConsolidationSync(duplications);
  }

  /**
   * Synchronous version of error handling consolidation analysis
   */
  private analyzeErrorHandlingConsolidationSync(duplications: DuplicationInstance[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Group duplications by type and analyze consolidation opportunities
    const opportunities = this.identifyConsolidationOpportunities(duplications);

    for (const opportunity of opportunities) {
      const recommendation = this.createConsolidationRecommendationSync(opportunity);
      recommendations.push(recommendation);
    }

    // Sort recommendations by priority and impact
    return this.prioritizeRecommendations(recommendations);
  }

  /**
   * Identify consolidation opportunities from error handling duplications
   * Requirements: 6.4, 6.5
   */
  private identifyConsolidationOpportunities(duplications: DuplicationInstance[]): ErrorHandlingConsolidationOpportunity[] {
    const opportunities: ErrorHandlingConsolidationOpportunity[] = [];

    // Group duplications by similarity and type
    const groupedDuplications = this.groupDuplicationsByPattern(duplications);

    for (const [pattern, patternDuplications] of groupedDuplications) {
      const opportunity = this.analyzePatternForConsolidation(pattern, patternDuplications);
      if (opportunity) {
        opportunities.push(opportunity);
      }
    }

    return opportunities;
  }

  /**
   * Group duplications by similar patterns
   */
  private groupDuplicationsByPattern(duplications: DuplicationInstance[]): Map<string, DuplicationInstance[]> {
    const groups = new Map<string, DuplicationInstance[]>();

    for (const duplication of duplications) {
      // Extract pattern from description
      const pattern = this.extractPatternFromDescription(duplication.description);
      
      if (!groups.has(pattern)) {
        groups.set(pattern, []);
      }
      groups.get(pattern)!.push(duplication);
    }

    return groups;
  }

  /**
   * Extract pattern identifier from duplication description
   */
  private extractPatternFromDescription(description: string): string {
    // Extract key patterns from description
    if (description.includes('error classification')) {
      return 'error_classification';
    } else if (description.includes('error messaging') || description.includes('inconsistent messaging')) {
      return 'error_messaging';
    } else if (description.includes('retry') || description.includes('recovery')) {
      return 'retry_recovery';
    } else if (description.includes('logging')) {
      return 'error_logging';
    } else if (description.includes('notification')) {
      return 'error_notification';
    }
    return 'general_error_handling';
  }

  /**
   * Analyze a pattern group for consolidation opportunities
   */
  private analyzePatternForConsolidation(
    pattern: string,
    duplications: DuplicationInstance[]
  ): ErrorHandlingConsolidationOpportunity | null {
    if (duplications.length < 1) return null;

    const affectedFiles = this.extractAffectedFiles(duplications);
    const estimatedSavings = this.calculateEstimatedSavings(duplications);

    let type: ErrorHandlingConsolidationOpportunity['type'];
    let consolidationTarget: string;

    switch (pattern) {
      case 'error_classification':
        type = 'unified_classification';
        consolidationTarget = 'UnifiedErrorClassificationService';
        break;
      case 'error_messaging':
        type = 'standardized_messaging';
        consolidationTarget = 'StandardizedErrorMessageService';
        break;
      case 'retry_recovery':
        type = 'common_retry_strategy';
        consolidationTarget = 'CommonRetryStrategyService';
        break;
      case 'error_logging':
        type = 'centralized_logging';
        consolidationTarget = 'CentralizedErrorLoggingService';
        break;
      case 'error_notification':
        type = 'unified_recovery';
        consolidationTarget = 'UnifiedErrorRecoveryService';
        break;
      default:
        type = 'unified_classification';
        consolidationTarget = 'UnifiedErrorHandlingService';
    }

    return {
      type,
      duplications,
      consolidationTarget,
      affectedFiles,
      estimatedSavings
    };
  }

  /**
   * Extract affected files from duplications
   */
  private extractAffectedFiles(duplications: DuplicationInstance[]): string[] {
    const files = new Set<string>();
    
    for (const duplication of duplications) {
      for (const location of duplication.locations) {
        files.add(location.filePath);
      }
    }
    
    return Array.from(files);
  }

  /**
   * Calculate estimated savings from consolidation
   */
  private calculateEstimatedSavings(duplications: DuplicationInstance[]): ErrorHandlingConsolidationOpportunity['estimatedSavings'] {
    let totalLines = 0;
    let duplicatePatterns = 0;
    
    for (const duplication of duplications) {
      totalLines += duplication.impact.linesOfCode;
      duplicatePatterns += duplication.locations.length - 1; // Keep one, remove others
    }
    
    return {
      linesOfCode: Math.floor(totalLines * 0.6), // Estimate 60% reduction (error handling is complex)
      duplicatePatterns,
      maintenanceEffort: duplicatePatterns * 3 // Hours saved per duplicate pattern (error handling is more complex)
    };
  }

  /**
   * Create consolidation recommendation from opportunity (async version)
   */
  private async createConsolidationRecommendation(
    opportunity: ErrorHandlingConsolidationOpportunity
  ): Promise<OptimizationRecommendation> {
    return this.createConsolidationRecommendationSync(opportunity);
  }

  /**
   * Create consolidation recommendation from opportunity (sync version)
   */
  private createConsolidationRecommendationSync(
    opportunity: ErrorHandlingConsolidationOpportunity
  ): OptimizationRecommendation {
    const complexity = this.assessComplexity(opportunity);
    const risks = this.identifyRisks(opportunity);
    const migrationStrategy = this.createMigrationStrategy(opportunity);
    const benefits = this.identifyBenefits(opportunity);

    return {
      id: `error-handling-consolidation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `Consolidate ${opportunity.type.replace('_', ' ')} into ${opportunity.consolidationTarget}`,
      description: this.generateRecommendationDescription(opportunity),
      type: 'consolidation',
      priority: this.determinePriority(opportunity, complexity),
      complexity,
      estimatedEffort: {
        hours: this.estimateEffortHours(opportunity, complexity),
        complexity,
        dependencies: this.identifyDependencies(opportunity)
      },
      benefits,
      risks,
      implementationPlan: migrationStrategy.steps,
      affectedFiles: opportunity.affectedFiles
    };
  }

  /**
   * Assess complexity of consolidation
   */
  private assessComplexity(opportunity: ErrorHandlingConsolidationOpportunity): ComplexityRating {
    const fileCount = opportunity.affectedFiles.length;
    const duplicationCount = opportunity.duplications.length;
    
    let level: ComplexityRating['level'];
    const factors: string[] = [];
    
    if (fileCount <= this.complexityThresholds.low && duplicationCount <= this.complexityThresholds.low) {
      level = 'low';
      factors.push('Few files affected', 'Simple error handling consolidation');
    } else if (fileCount <= this.complexityThresholds.medium && duplicationCount <= this.complexityThresholds.medium) {
      level = 'medium';
      factors.push('Moderate number of files', 'Multiple error handling patterns');
    } else if (fileCount <= this.complexityThresholds.high || duplicationCount <= this.complexityThresholds.high) {
      level = 'high';
      factors.push('Many files affected', 'Complex error handling logic');
    } else {
      level = 'critical';
      factors.push('Extensive file changes', 'Complex error handling interdependencies');
    }

    // Add specific complexity factors based on error handling type
    if (opportunity.type === 'unified_classification') {
      factors.push('Requires error type analysis and classification logic consolidation');
    }
    if (opportunity.type === 'standardized_messaging') {
      factors.push('Message template standardization and internationalization considerations');
    }
    if (opportunity.type === 'common_retry_strategy') {
      factors.push('Retry logic consolidation with different strategy requirements');
    }
    if (opportunity.type === 'centralized_logging') {
      factors.push('Logging format standardization and performance considerations');
    }

    return {
      level,
      factors,
      reasoning: `Error handling consolidation affects ${fileCount} files with ${duplicationCount} duplicate patterns`
    };
  }

  /**
   * Identify risks in consolidation
   */
  private identifyRisks(opportunity: ErrorHandlingConsolidationOpportunity): Risk[] {
    const risks: Risk[] = [];

    // Breaking change risk - higher for error handling
    if (opportunity.affectedFiles.length > 3) {
      risks.push({
        type: 'breaking_change',
        severity: 'high',
        description: 'Error handling consolidation may change error behavior and break existing error handling logic',
        mitigation: 'Implement comprehensive error handling tests and use gradual migration with fallback mechanisms'
      });
    }

    // Performance risk - error handling is critical path
    if (opportunity.duplications.length > 5) {
      risks.push({
        type: 'performance',
        severity: 'medium',
        description: 'Centralized error handling may introduce performance overhead in error scenarios',
        mitigation: 'Optimize error handling paths and implement efficient error classification caching'
      });
    }

    // Compatibility risk - different error contexts
    risks.push({
      type: 'compatibility',
      severity: 'medium',
      description: 'Different error handling contexts may have specific requirements that could be lost in consolidation',
      mitigation: 'Thoroughly analyze existing error handling behavior and maintain context-specific handling where necessary'
    });

    // Testing risk - error scenarios are hard to test
    risks.push({
      type: 'testing',
      severity: 'high',
      description: 'Consolidated error handling requires comprehensive test coverage for all error scenarios',
      mitigation: 'Create property-based tests for error handling logic and maintain comprehensive error scenario test coverage'
    });

    return risks;
  }

  /**
   * Create migration strategy for consolidation
   */
  private createMigrationStrategy(opportunity: ErrorHandlingConsolidationOpportunity): ErrorHandlingMigrationStrategy {
    const steps: ImplementationStep[] = [];

    // Phase 1: Analysis and preparation
    steps.push({
      order: 1,
      title: 'Analyze existing error handling patterns',
      description: 'Document current error handling behavior, error types, and consolidation requirements',
      validation: 'All error handling patterns documented and analyzed for consolidation compatibility'
    });

    // Phase 2: Create consolidated service
    steps.push({
      order: 2,
      title: `Create ${opportunity.consolidationTarget}`,
      description: 'Implement centralized error handling service with unified logic',
      codeExample: this.generateCodeExample(opportunity),
      validation: 'Service created with comprehensive test coverage for all error scenarios'
    });

    // Phase 3: Migrate existing code gradually
    steps.push({
      order: 3,
      title: 'Migrate existing error handling code',
      description: 'Replace duplicate error handling logic with calls to centralized service, one module at a time',
      validation: 'All duplicate error handling code replaced and error behavior verified'
    });

    // Phase 4: Cleanup and optimization
    steps.push({
      order: 4,
      title: 'Remove duplicate code and optimize error handling',
      description: 'Clean up old error handling code and optimize the consolidated service for performance',
      validation: 'Duplicate code removed, performance verified, and error handling optimized'
    });

    return {
      phase: 1,
      title: `${opportunity.consolidationTarget} Migration`,
      description: `Consolidate ${opportunity.type} into centralized error handling service`,
      steps,
      risks: this.identifyRisks(opportunity),
      dependencies: this.identifyDependencies(opportunity)
    };
  }

  /**
   * Generate code example for consolidation
   */
  private generateCodeExample(opportunity: ErrorHandlingConsolidationOpportunity): string {
    switch (opportunity.type) {
      case 'unified_classification':
        return `
// Unified error classification service
export class UnifiedErrorClassificationService {
  private static errorTypeMap = new Map([
    ['ValidationError', { category: 'validation', severity: 'medium', retryable: false }],
    ['NetworkError', { category: 'network', severity: 'high', retryable: true }],
    ['NotFoundError', { category: 'resource', severity: 'low', retryable: false }],
    ['AppError', { category: 'application', severity: 'medium', retryable: false }]
  ]);

  static classifyError(error: Error): ErrorClassification {
    const errorType = error.constructor.name;
    const classification = this.errorTypeMap.get(errorType) || {
      category: 'unknown',
      severity: 'medium',
      retryable: false
    };

    return {
      type: errorType,
      category: classification.category,
      severity: classification.severity,
      retryable: classification.retryable,
      message: error.message,
      code: (error as any).code || 'UNKNOWN_ERROR'
    };
  }

  static shouldRetry(error: Error, attemptCount: number = 0): boolean {
    const classification = this.classifyError(error);
    return classification.retryable && attemptCount < 3;
  }
}`;

      case 'standardized_messaging':
        return `
// Standardized error message service
export class StandardizedErrorMessageService {
  private static messageTemplates = {
    VALIDATION_ERROR: 'Validation failed: {details}',
    NETWORK_ERROR: 'Network request failed: {reason}',
    NOT_FOUND_ERROR: 'Resource not found: {resource}',
    PERMISSION_ERROR: 'Access denied: {action} not permitted',
    GENERIC_ERROR: 'An error occurred: {message}'
  };

  static formatErrorMessage(
    errorCode: string,
    params: Record<string, any> = {},
    userFriendly: boolean = true
  ): string {
    const template = this.messageTemplates[errorCode] || this.messageTemplates.GENERIC_ERROR;
    
    let message = template;
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(\`{\${key}}\`, String(value));
    });

    if (userFriendly) {
      message = this.makeUserFriendly(message);
    }

    return message;
  }

  private static makeUserFriendly(message: string): string {
    // Convert technical messages to user-friendly ones
    return message
      .replace(/validation failed/i, 'Please check your input')
      .replace(/network request failed/i, 'Connection problem occurred')
      .replace(/not found/i, 'could not be found');
  }

  static getErrorSeverityLevel(errorCode: string): 'info' | 'warning' | 'error' | 'critical' {
    if (errorCode.includes('VALIDATION')) return 'warning';
    if (errorCode.includes('NETWORK')) return 'error';
    if (errorCode.includes('PERMISSION')) return 'error';
    if (errorCode.includes('NOT_FOUND')) return 'info';
    return 'error';
  }
}`;

      case 'common_retry_strategy':
        return `
// Common retry strategy service
export class CommonRetryStrategyService {
  private static readonly DEFAULT_MAX_RETRIES = 3;
  private static readonly DEFAULT_BASE_DELAY = 1000;

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = this.DEFAULT_MAX_RETRIES,
      baseDelay = this.DEFAULT_BASE_DELAY,
      strategy = 'exponential',
      shouldRetry = this.defaultShouldRetry
    } = options;

    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries || !shouldRetry(lastError, attempt)) {
          throw lastError;
        }

        const delay = this.calculateDelay(attempt, baseDelay, strategy);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private static calculateDelay(
    attempt: number,
    baseDelay: number,
    strategy: 'linear' | 'exponential' | 'fixed'
  ): number {
    switch (strategy) {
      case 'linear':
        return baseDelay * (attempt + 1);
      case 'exponential':
        return baseDelay * Math.pow(2, attempt);
      case 'fixed':
      default:
        return baseDelay;
    }
  }

  private static defaultShouldRetry(error: Error, attempt: number): boolean {
    // Don't retry validation errors or client errors
    if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
      return false;
    }
    
    // Retry network errors and server errors
    return error.name === 'NetworkError' || error.name === 'ApiError';
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}`;

      case 'centralized_logging':
        return `
// Centralized error logging service
export class CentralizedErrorLoggingService {
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  static logError(
    error: Error,
    context: ErrorContext = {},
    options: LoggingOptions = {}
  ): void {
    const logEntry = this.createLogEntry(error, context, options);
    
    // Log to console with appropriate level
    this.logToConsole(logEntry);
    
    // Log to external service if configured
    if (options.external !== false) {
      this.logToExternalService(logEntry);
    }
    
    // Store for analytics if enabled
    if (options.analytics !== false) {
      this.logForAnalytics(logEntry);
    }
  }

  private static createLogEntry(
    error: Error,
    context: ErrorContext,
    options: LoggingOptions
  ): ErrorLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: options.level || 'error',
      message: error.message,
      errorType: error.constructor.name,
      errorCode: (error as any).code || 'UNKNOWN',
      stack: error.stack,
      context: {
        userId: context.userId,
        sessionId: context.sessionId,
        operation: context.operation,
        component: context.component,
        ...context.additional
      },
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : context.url,
        timestamp: Date.now()
      }
    };
  }

  private static logToConsole(logEntry: ErrorLogEntry): void {
    const message = \`[\${logEntry.timestamp}] \${logEntry.level.toUpperCase()}: \${logEntry.message}\`;
    
    switch (logEntry.level) {
      case 'debug':
        console.debug(message, logEntry);
        break;
      case 'info':
        console.info(message, logEntry);
        break;
      case 'warn':
        console.warn(message, logEntry);
        break;
      case 'error':
      default:
        console.error(message, logEntry);
        break;
    }
  }

  private static logToExternalService(logEntry: ErrorLogEntry): void {
    // Implementation for external logging service
    // This would integrate with services like Sentry, LogRocket, etc.
  }

  private static logForAnalytics(logEntry: ErrorLogEntry): void {
    // Implementation for error analytics
    // This would track error patterns and frequencies
  }
}`;

      case 'unified_recovery':
        return `
// Unified error recovery service
export class UnifiedErrorRecoveryService {
  private static recoveryStrategies = new Map<string, RecoveryStrategy>();

  static registerRecoveryStrategy(errorType: string, strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(errorType, strategy);
  }

  static async attemptRecovery(
    error: Error,
    context: RecoveryContext = {}
  ): Promise<RecoveryResult> {
    const errorType = error.constructor.name;
    const strategy = this.recoveryStrategies.get(errorType) || this.getDefaultStrategy(errorType);

    try {
      const result = await strategy.recover(error, context);
      
      if (result.success) {
        this.logSuccessfulRecovery(error, strategy, context);
      } else {
        this.logFailedRecovery(error, strategy, context, result.reason);
      }

      return result;
    } catch (recoveryError) {
      this.logRecoveryException(error, strategy, context, recoveryError as Error);
      
      return {
        success: false,
        reason: 'Recovery strategy failed',
        canRetry: false
      };
    }
  }

  private static getDefaultStrategy(errorType: string): RecoveryStrategy {
    return {
      recover: async (error: Error, context: RecoveryContext) => {
        // Default recovery: log error and suggest user action
        return {
          success: false,
          reason: \`No recovery strategy available for \${errorType}\`,
          canRetry: false,
          userMessage: 'Please try again or contact support if the problem persists'
        };
      }
    };
  }

  private static logSuccessfulRecovery(
    error: Error,
    strategy: RecoveryStrategy,
    context: RecoveryContext
  ): void {
    console.info('Error recovery successful', {
      errorType: error.constructor.name,
      strategy: strategy.constructor.name,
      context
    });
  }

  private static logFailedRecovery(
    error: Error,
    strategy: RecoveryStrategy,
    context: RecoveryContext,
    reason: string
  ): void {
    console.warn('Error recovery failed', {
      errorType: error.constructor.name,
      strategy: strategy.constructor.name,
      reason,
      context
    });
  }

  private static logRecoveryException(
    originalError: Error,
    strategy: RecoveryStrategy,
    context: RecoveryContext,
    recoveryError: Error
  ): void {
    console.error('Error recovery threw exception', {
      originalError: originalError.message,
      recoveryError: recoveryError.message,
      strategy: strategy.constructor.name,
      context
    });
  }
}`;

      default:
        return `
// Unified error handling service implementation
export class UnifiedErrorHandlingService {
  // Implement consolidated error handling logic here
}`;
    }
  }

  /**
   * Identify benefits of consolidation
   */
  private identifyBenefits(opportunity: ErrorHandlingConsolidationOpportunity): string[] {
    const benefits: string[] = [];

    benefits.push(`Reduce error handling code duplication by ${opportunity.estimatedSavings.linesOfCode} lines`);
    benefits.push(`Eliminate ${opportunity.estimatedSavings.duplicatePatterns} duplicate error handling patterns`);
    benefits.push('Improve error handling consistency across the application');
    benefits.push('Enhance error debugging and troubleshooting capabilities');
    benefits.push(`Save approximately ${opportunity.estimatedSavings.maintenanceEffort} hours of maintenance effort`);

    if (opportunity.type === 'standardized_messaging') {
      benefits.push('Standardize error messages for better user experience');
      benefits.push('Enable easier internationalization of error messages');
    }

    if (opportunity.type === 'unified_classification') {
      benefits.push('Improve error categorization and handling logic');
      benefits.push('Enable better error analytics and monitoring');
    }

    if (opportunity.type === 'common_retry_strategy') {
      benefits.push('Standardize retry behavior across different operations');
      benefits.push('Improve application resilience to transient errors');
    }

    if (opportunity.type === 'centralized_logging') {
      benefits.push('Improve error tracking and monitoring capabilities');
      benefits.push('Enable better error analytics and pattern detection');
    }

    return benefits;
  }

  /**
   * Determine priority based on opportunity and complexity
   */
  private determinePriority(
    opportunity: ErrorHandlingConsolidationOpportunity,
    complexity: ComplexityRating
  ): 'low' | 'medium' | 'high' | 'critical' {
    const impact = opportunity.estimatedSavings.linesOfCode + (opportunity.estimatedSavings.duplicatePatterns * 15);
    
    // Error handling is critical, so prioritize higher
    if (complexity.level === 'low' && impact > 80) {
      return 'high';
    } else if (complexity.level === 'medium' && impact > 150) {
      return 'high';
    } else if (impact > 40) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Estimate effort hours for consolidation
   */
  private estimateEffortHours(
    opportunity: ErrorHandlingConsolidationOpportunity,
    complexity: ComplexityRating
  ): number {
    const baseHours = opportunity.affectedFiles.length * 3; // Error handling is more complex
    const complexityMultiplier = {
      low: 1.2,
      medium: 2,
      high: 3,
      critical: 5
    }[complexity.level];

    return Math.ceil(baseHours * complexityMultiplier);
  }

  /**
   * Identify dependencies for consolidation
   */
  private identifyDependencies(opportunity: ErrorHandlingConsolidationOpportunity): string[] {
    const dependencies: string[] = [];

    dependencies.push('Comprehensive test coverage for existing error handling logic');
    dependencies.push('Documentation of current error handling behavior and requirements');
    dependencies.push('Error monitoring and logging infrastructure');

    if (opportunity.type === 'unified_classification') {
      dependencies.push('Error taxonomy and classification system');
    }

    if (opportunity.type === 'standardized_messaging') {
      dependencies.push('Internationalization support for error messages');
      dependencies.push('User experience guidelines for error messaging');
    }

    if (opportunity.type === 'common_retry_strategy') {
      dependencies.push('Configuration system for retry policies');
      dependencies.push('Circuit breaker pattern implementation');
    }

    if (opportunity.type === 'centralized_logging') {
      dependencies.push('External logging service integration');
      dependencies.push('Log aggregation and analysis tools');
    }

    return dependencies;
  }

  /**
   * Generate recommendation description
   */
  private generateRecommendationDescription(opportunity: ErrorHandlingConsolidationOpportunity): string {
    const fileCount = opportunity.affectedFiles.length;
    const duplicationCount = opportunity.duplications.length;
    
    return `Consolidate ${duplicationCount} duplicate error handling patterns across ${fileCount} files into a centralized ${opportunity.consolidationTarget}. This will eliminate error handling code duplication, improve consistency, enhance debugging capabilities, and ensure unified error management throughout the application.`;
  }

  /**
   * Prioritize recommendations by impact and complexity
   */
  private prioritizeRecommendations(recommendations: OptimizationRecommendation[]): OptimizationRecommendation[] {
    return recommendations.sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by estimated effort (lower effort first)
      return a.estimatedEffort.hours - b.estimatedEffort.hours;
    });
  }
}

// Supporting interfaces
interface ErrorClassification {
  type: string;
  category: string;
  severity: string;
  retryable: boolean;
  message: string;
  code: string;
}

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  strategy?: 'linear' | 'exponential' | 'fixed';
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  operation?: string;
  component?: string;
  url?: string;
  additional?: Record<string, any>;
}

interface LoggingOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  external?: boolean;
  analytics?: boolean;
}

interface ErrorLogEntry {
  timestamp: string;
  level: string;
  message: string;
  errorType: string;
  errorCode: string;
  stack?: string;
  context: Record<string, any>;
  metadata: Record<string, any>;
}

interface RecoveryContext {
  operation?: string;
  component?: string;
  userId?: string;
  retryCount?: number;
  additional?: Record<string, any>;
}

interface RecoveryResult {
  success: boolean;
  reason?: string;
  canRetry: boolean;
  userMessage?: string;
  data?: any;
}

interface RecoveryStrategy {
  recover(error: Error, context: RecoveryContext): Promise<RecoveryResult>;
}