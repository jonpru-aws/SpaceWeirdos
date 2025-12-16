/**
 * Validation Consolidation Analyzer
 * 
 * Analyzes validation logic duplication and generates recommendations for
 * centralized validation utilities and shared rule management.
 * 
 * Requirements: 4.4, 4.5
 */

import { OptimizationRecommendation, DuplicationInstance, ComplexityRating, Risk, ImplementationStep } from '../types/DuplicationModels.js';
import { ValidationPattern, ValidationRule, ErrorMessagePattern } from '../detectors/ValidationDuplicationDetector.js';

export interface ValidationConsolidationOpportunity {
  type: 'shared_utility' | 'centralized_rules' | 'unified_messages' | 'common_patterns';
  duplications: DuplicationInstance[];
  consolidationTarget: string;
  affectedFiles: string[];
  estimatedSavings: {
    linesOfCode: number;
    duplicateRules: number;
    maintenanceEffort: number;
  };
}

export interface ValidationMigrationStrategy {
  phase: number;
  title: string;
  description: string;
  steps: ImplementationStep[];
  risks: Risk[];
  dependencies: string[];
}

export class ValidationConsolidationAnalyzer {
  private complexityThresholds = {
    low: 2,
    medium: 5,
    high: 10,
    critical: 20
  };

  /**
   * Analyze validation duplications and generate consolidation recommendations
   */
  async analyzeValidationConsolidation(duplications: DuplicationInstance[]): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Group duplications by type and analyze consolidation opportunities
    const opportunities = this.identifyConsolidationOpportunities(duplications);

    for (const opportunity of opportunities) {
      const recommendation = await this.createConsolidationRecommendation(opportunity);
      recommendations.push(recommendation);
    }

    // Sort recommendations by priority and impact
    return this.prioritizeRecommendations(recommendations);
  }

  /**
   * Identify consolidation opportunities from validation duplications
   */
  private identifyConsolidationOpportunities(duplications: DuplicationInstance[]): ValidationConsolidationOpportunity[] {
    const opportunities: ValidationConsolidationOpportunity[] = [];

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
    if (description.includes('validation rules')) {
      return 'validation_rules';
    } else if (description.includes('error message')) {
      return 'error_messages';
    } else if (description.includes('validation patterns')) {
      return 'validation_patterns';
    } else if (description.includes('field validation')) {
      return 'field_validation';
    }
    return 'general_validation';
  }

  /**
   * Analyze a pattern group for consolidation opportunities
   */
  private analyzePatternForConsolidation(
    pattern: string,
    duplications: DuplicationInstance[]
  ): ValidationConsolidationOpportunity | null {
    if (duplications.length < 2) return null;

    const affectedFiles = this.extractAffectedFiles(duplications);
    const estimatedSavings = this.calculateEstimatedSavings(duplications);

    let type: ValidationConsolidationOpportunity['type'];
    let consolidationTarget: string;

    switch (pattern) {
      case 'validation_rules':
        type = 'centralized_rules';
        consolidationTarget = 'SharedValidationRules';
        break;
      case 'error_messages':
        type = 'unified_messages';
        consolidationTarget = 'ValidationMessageService';
        break;
      case 'validation_patterns':
        type = 'common_patterns';
        consolidationTarget = 'ValidationPatternLibrary';
        break;
      case 'field_validation':
        type = 'shared_utility';
        consolidationTarget = 'FieldValidationUtility';
        break;
      default:
        type = 'shared_utility';
        consolidationTarget = 'ValidationUtilityService';
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
  private calculateEstimatedSavings(duplications: DuplicationInstance[]): ValidationConsolidationOpportunity['estimatedSavings'] {
    let totalLines = 0;
    let duplicateRules = 0;
    
    for (const duplication of duplications) {
      totalLines += duplication.impact.linesOfCode;
      duplicateRules += duplication.locations.length - 1; // Keep one, remove others
    }
    
    return {
      linesOfCode: Math.floor(totalLines * 0.7), // Estimate 70% reduction
      duplicateRules,
      maintenanceEffort: duplicateRules * 2 // Hours saved per duplicate rule
    };
  }

  /**
   * Create consolidation recommendation from opportunity
   */
  private async createConsolidationRecommendation(
    opportunity: ValidationConsolidationOpportunity
  ): Promise<OptimizationRecommendation> {
    const complexity = this.assessComplexity(opportunity);
    const risks = this.identifyRisks(opportunity);
    const migrationStrategy = this.createMigrationStrategy(opportunity);
    const benefits = this.identifyBenefits(opportunity);

    return {
      id: `validation-consolidation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
  private assessComplexity(opportunity: ValidationConsolidationOpportunity): ComplexityRating {
    const fileCount = opportunity.affectedFiles.length;
    const duplicationCount = opportunity.duplications.length;
    
    let level: ComplexityRating['level'];
    const factors: string[] = [];
    
    if (fileCount <= this.complexityThresholds.low && duplicationCount <= this.complexityThresholds.low) {
      level = 'low';
      factors.push('Few files affected', 'Simple consolidation pattern');
    } else if (fileCount <= this.complexityThresholds.medium && duplicationCount <= this.complexityThresholds.medium) {
      level = 'medium';
      factors.push('Moderate number of files', 'Multiple validation patterns');
    } else if (fileCount <= this.complexityThresholds.high || duplicationCount <= this.complexityThresholds.high) {
      level = 'high';
      factors.push('Many files affected', 'Complex validation logic');
    } else {
      level = 'critical';
      factors.push('Extensive file changes', 'Complex interdependencies');
    }

    // Add specific complexity factors
    if (opportunity.type === 'centralized_rules') {
      factors.push('Requires rule extraction and centralization');
    }
    if (opportunity.type === 'unified_messages') {
      factors.push('Message template standardization needed');
    }

    return {
      level,
      factors,
      reasoning: `Consolidation affects ${fileCount} files with ${duplicationCount} duplicate patterns`
    };
  }

  /**
   * Identify risks in consolidation
   */
  private identifyRisks(opportunity: ValidationConsolidationOpportunity): Risk[] {
    const risks: Risk[] = [];

    // Breaking change risk
    if (opportunity.affectedFiles.length > 5) {
      risks.push({
        type: 'breaking_change',
        severity: 'medium',
        description: 'Consolidation may break existing validation behavior',
        mitigation: 'Implement comprehensive tests before refactoring and use gradual migration'
      });
    }

    // Performance risk
    if (opportunity.duplications.length > 10) {
      risks.push({
        type: 'performance',
        severity: 'low',
        description: 'Centralized validation may introduce slight performance overhead',
        mitigation: 'Implement caching and optimize validation logic'
      });
    }

    // Compatibility risk
    risks.push({
      type: 'compatibility',
      severity: 'low',
      description: 'Different validation contexts may have subtle behavioral differences',
      mitigation: 'Thoroughly analyze existing validation behavior and maintain compatibility'
    });

    // Testing risk
    risks.push({
      type: 'testing',
      severity: 'medium',
      description: 'Consolidated validation requires comprehensive test coverage',
      mitigation: 'Create property-based tests for validation logic and maintain existing test coverage'
    });

    return risks;
  }

  /**
   * Create migration strategy for consolidation
   */
  private createMigrationStrategy(opportunity: ValidationConsolidationOpportunity): ValidationMigrationStrategy {
    const steps: ImplementationStep[] = [];

    // Phase 1: Analysis and preparation
    steps.push({
      order: 1,
      title: 'Analyze existing validation patterns',
      description: 'Document current validation behavior and identify consolidation targets',
      validation: 'All validation patterns documented and analyzed'
    });

    // Phase 2: Create consolidated utility
    steps.push({
      order: 2,
      title: `Create ${opportunity.consolidationTarget}`,
      description: 'Implement centralized validation utility with shared logic',
      codeExample: this.generateCodeExample(opportunity),
      validation: 'Utility created with comprehensive test coverage'
    });

    // Phase 3: Migrate existing code
    steps.push({
      order: 3,
      title: 'Migrate existing validation code',
      description: 'Replace duplicate validation logic with calls to centralized utility',
      validation: 'All duplicate validation code replaced and tests passing'
    });

    // Phase 4: Cleanup and optimization
    steps.push({
      order: 4,
      title: 'Remove duplicate code and optimize',
      description: 'Clean up old validation code and optimize the consolidated utility',
      validation: 'Duplicate code removed and performance verified'
    });

    return {
      phase: 1,
      title: `${opportunity.consolidationTarget} Migration`,
      description: `Consolidate ${opportunity.type} into centralized utility`,
      steps,
      risks: this.identifyRisks(opportunity),
      dependencies: this.identifyDependencies(opportunity)
    };
  }

  /**
   * Generate code example for consolidation
   */
  private generateCodeExample(opportunity: ValidationConsolidationOpportunity): string {
    switch (opportunity.type) {
      case 'centralized_rules':
        return `
// Centralized validation rules
export class SharedValidationRules {
  static validateRequired(value: any, fieldName: string): ValidationError | null {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return {
        field: fieldName,
        message: \`\${fieldName} is required\`,
        code: 'FIELD_REQUIRED'
      };
    }
    return null;
  }

  static validateRange(value: number, min: number, max: number, fieldName: string): ValidationError | null {
    if (value < min || value > max) {
      return {
        field: fieldName,
        message: \`\${fieldName} must be between \${min} and \${max}\`,
        code: 'VALUE_OUT_OF_RANGE'
      };
    }
    return null;
  }
}`;

      case 'unified_messages':
        return `
// Unified message service
export class ValidationMessageService {
  private static messages = {
    FIELD_REQUIRED: '{field} is required',
    VALUE_OUT_OF_RANGE: '{field} must be between {min} and {max}',
    INVALID_FORMAT: '{field} has an invalid format'
  };

  static getMessage(code: string, params: Record<string, any> = {}): string {
    let message = this.messages[code] || 'Validation error';
    
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(\`{\${key}}\`, String(value));
    });
    
    return message;
  }
}`;

      case 'shared_utility':
        return `
// Shared validation utility
export class FieldValidationUtility {
  static validateField<T>(
    value: T,
    validators: Array<(value: T) => ValidationError | null>
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors.push(error);
      }
    }
    
    return errors;
  }

  static createValidator<T>(
    condition: (value: T) => boolean,
    errorMessage: string,
    errorCode: string,
    fieldName: string
  ): (value: T) => ValidationError | null {
    return (value: T) => {
      if (!condition(value)) {
        return {
          field: fieldName,
          message: errorMessage,
          code: errorCode
        };
      }
      return null;
    };
  }
}`;

      default:
        return `
// Validation utility implementation
export class ValidationUtilityService {
  // Implement consolidated validation logic here
}`;
    }
  }

  /**
   * Identify benefits of consolidation
   */
  private identifyBenefits(opportunity: ValidationConsolidationOpportunity): string[] {
    const benefits: string[] = [];

    benefits.push(`Reduce code duplication by ${opportunity.estimatedSavings.linesOfCode} lines`);
    benefits.push(`Eliminate ${opportunity.estimatedSavings.duplicateRules} duplicate validation rules`);
    benefits.push('Improve maintainability through centralized validation logic');
    benefits.push('Ensure consistent validation behavior across the application');
    benefits.push(`Save approximately ${opportunity.estimatedSavings.maintenanceEffort} hours of maintenance effort`);

    if (opportunity.type === 'unified_messages') {
      benefits.push('Standardize error messages for better user experience');
    }

    if (opportunity.type === 'centralized_rules') {
      benefits.push('Enable easier validation rule updates and modifications');
    }

    return benefits;
  }

  /**
   * Determine priority based on opportunity and complexity
   */
  private determinePriority(
    opportunity: ValidationConsolidationOpportunity,
    complexity: ComplexityRating
  ): 'low' | 'medium' | 'high' | 'critical' {
    const impact = opportunity.estimatedSavings.linesOfCode + (opportunity.estimatedSavings.duplicateRules * 10);
    
    if (complexity.level === 'low' && impact > 100) {
      return 'high';
    } else if (complexity.level === 'medium' && impact > 200) {
      return 'high';
    } else if (impact > 50) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Estimate effort hours for consolidation
   */
  private estimateEffortHours(
    opportunity: ValidationConsolidationOpportunity,
    complexity: ComplexityRating
  ): number {
    const baseHours = opportunity.affectedFiles.length * 2;
    const complexityMultiplier = {
      low: 1,
      medium: 1.5,
      high: 2.5,
      critical: 4
    }[complexity.level];

    return Math.ceil(baseHours * complexityMultiplier);
  }

  /**
   * Identify dependencies for consolidation
   */
  private identifyDependencies(opportunity: ValidationConsolidationOpportunity): string[] {
    const dependencies: string[] = [];

    dependencies.push('Comprehensive test coverage for existing validation logic');
    dependencies.push('Documentation of current validation behavior');

    if (opportunity.type === 'centralized_rules') {
      dependencies.push('Configuration system for validation rules');
    }

    if (opportunity.type === 'unified_messages') {
      dependencies.push('Internationalization support for error messages');
    }

    return dependencies;
  }

  /**
   * Generate recommendation description
   */
  private generateRecommendationDescription(opportunity: ValidationConsolidationOpportunity): string {
    const fileCount = opportunity.affectedFiles.length;
    const duplicationCount = opportunity.duplications.length;
    
    return `Consolidate ${duplicationCount} duplicate validation patterns across ${fileCount} files into a centralized ${opportunity.consolidationTarget}. This will eliminate code duplication, improve maintainability, and ensure consistent validation behavior throughout the application.`;
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