/**
 * Complexity Estimator for effort estimation and complexity ratings
 * Requirements: 7.1, 7.3, 7.4
 */

import { DuplicationInstance, ComplexityRating, EffortEstimate, OptimizationRecommendation } from '../types/DuplicationModels.js';

export interface ComplexityFactors {
  codeComplexity: number;
  fileCount: number;
  dependencyCount: number;
  testCoverage: number;
  crossModuleDependencies: boolean;
  hasExternalDependencies: boolean;
  requiresInterfaceChanges: boolean;
}

export interface EffortEstimationConfig {
  baseHoursPerFile: number;
  complexityMultiplier: number;
  testingMultiplier: number;
  documentationMultiplier: number;
}

export class ComplexityEstimator {
  private config: EffortEstimationConfig;

  constructor(config: Partial<EffortEstimationConfig> = {}) {
    this.config = {
      baseHoursPerFile: 2,
      complexityMultiplier: 1.5,
      testingMultiplier: 0.5,
      documentationMultiplier: 0.3,
      ...config
    };
  }

  /**
   * Estimate the complexity rating for a refactoring task
   */
  estimateComplexity(duplications: DuplicationInstance[], recommendationType: OptimizationRecommendation['type']): ComplexityRating {
    const factors = this.analyzeComplexityFactors(duplications);
    const level = this.determineComplexityLevel(factors, recommendationType);
    const factorDescriptions = this.generateFactorDescriptions(factors);
    const reasoning = this.generateComplexityReasoning(factors, recommendationType, level);

    return {
      level,
      factors: factorDescriptions,
      reasoning
    };
  }

  /**
   * Estimate the effort required for implementing a recommendation
   */
  estimateEffort(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): EffortEstimate {
    const complexity = recommendation.complexity;
    const baseHours = this.calculateBaseHours(recommendation.affectedFiles.length);
    const complexityMultiplier = this.getComplexityMultiplier(complexity.level);
    const typeMultiplier = this.getTypeMultiplier(recommendation.type);
    
    const totalHours = Math.ceil(baseHours * complexityMultiplier * typeMultiplier);
    const dependencies = this.identifyDependencies(duplications, recommendation);

    return {
      hours: totalHours,
      complexity,
      dependencies
    };
  }

  /**
   * Analyze complexity factors for a set of duplications
   */
  private analyzeComplexityFactors(duplications: DuplicationInstance[]): ComplexityFactors {
    const affectedFiles = this.getUniqueFiles(duplications);
    const totalComplexity = duplications.reduce((sum, d) => sum + d.impact.complexity, 0);
    const avgTestCoverage = duplications.reduce((sum, d) => sum + d.impact.testCoverage, 0) / duplications.length;
    
    // Analyze cross-module dependencies
    const modules = new Set(affectedFiles.map(file => this.extractModuleName(file)));
    const crossModuleDependencies = modules.size > 1;
    
    // Check for external dependencies (simplified heuristic)
    const hasExternalDependencies = affectedFiles.some(file => 
      file.includes('node_modules') || file.includes('external') || file.includes('vendor')
    );
    
    // Check if interface changes are required (heuristic based on file types)
    const requiresInterfaceChanges = affectedFiles.some(file => 
      file.includes('interface') || file.includes('types') || file.includes('api')
    );

    return {
      codeComplexity: totalComplexity,
      fileCount: affectedFiles.length,
      dependencyCount: modules.size,
      testCoverage: avgTestCoverage,
      crossModuleDependencies,
      hasExternalDependencies,
      requiresInterfaceChanges
    };
  }

  /**
   * Determine complexity level based on factors and recommendation type
   */
  private determineComplexityLevel(factors: ComplexityFactors, type: OptimizationRecommendation['type']): ComplexityRating['level'] {
    let complexityScore = 0;

    // File count impact
    if (factors.fileCount > 10) complexityScore += 3;
    else if (factors.fileCount > 5) complexityScore += 2;
    else if (factors.fileCount > 2) complexityScore += 1;

    // Code complexity impact
    if (factors.codeComplexity > 50) complexityScore += 3;
    else if (factors.codeComplexity > 25) complexityScore += 2;
    else if (factors.codeComplexity > 10) complexityScore += 1;

    // Test coverage impact (lower coverage = higher complexity)
    if (factors.testCoverage < 0.3) complexityScore += 3;
    else if (factors.testCoverage < 0.5) complexityScore += 2;
    else if (factors.testCoverage < 0.7) complexityScore += 1;

    // Dependency impact
    if (factors.crossModuleDependencies) complexityScore += 2;
    if (factors.hasExternalDependencies) complexityScore += 2;
    if (factors.requiresInterfaceChanges) complexityScore += 3;

    // Type-specific adjustments
    switch (type) {
      case 'migration':
        complexityScore += 2; // Migrations are inherently more complex
        break;
      case 'abstraction':
        complexityScore += 1; // Abstractions require careful design
        break;
      case 'consolidation':
        // No adjustment - baseline complexity
        break;
      case 'refactoring':
        complexityScore -= 1; // Refactoring is often simpler
        break;
    }

    // Determine level based on score
    if (complexityScore >= 10) return 'critical';
    if (complexityScore >= 7) return 'high';
    if (complexityScore >= 4) return 'medium';
    return 'low';
  }

  /**
   * Generate human-readable descriptions of complexity factors
   */
  private generateFactorDescriptions(factors: ComplexityFactors): string[] {
    const descriptions: string[] = [];

    if (factors.fileCount > 5) {
      descriptions.push(`High file count (${factors.fileCount} files affected)`);
    }

    if (factors.codeComplexity > 25) {
      descriptions.push(`High code complexity (${factors.codeComplexity} complexity points)`);
    }

    if (factors.testCoverage < 0.5) {
      descriptions.push(`Low test coverage (${Math.round(factors.testCoverage * 100)}%)`);
    }

    if (factors.crossModuleDependencies) {
      descriptions.push(`Cross-module dependencies (${factors.dependencyCount} modules)`);
    }

    if (factors.hasExternalDependencies) {
      descriptions.push('External dependencies involved');
    }

    if (factors.requiresInterfaceChanges) {
      descriptions.push('Interface changes required');
    }

    return descriptions;
  }

  /**
   * Generate reasoning for complexity rating
   */
  private generateComplexityReasoning(factors: ComplexityFactors, type: OptimizationRecommendation['type'], level: ComplexityRating['level']): string {
    const reasons: string[] = [];

    switch (level) {
      case 'low':
        reasons.push('This refactoring has minimal complexity due to');
        if (factors.fileCount <= 2) reasons.push('limited file scope');
        if (factors.testCoverage >= 0.7) reasons.push('good test coverage');
        if (!factors.crossModuleDependencies) reasons.push('no cross-module dependencies');
        break;

      case 'medium':
        reasons.push('This refactoring has moderate complexity due to');
        if (factors.fileCount > 2 && factors.fileCount <= 5) reasons.push('moderate file scope');
        if (factors.codeComplexity > 10 && factors.codeComplexity <= 25) reasons.push('moderate code complexity');
        break;

      case 'high':
        reasons.push('This refactoring has high complexity due to');
        if (factors.fileCount > 5) reasons.push('large file scope');
        if (factors.crossModuleDependencies) reasons.push('cross-module dependencies');
        if (factors.testCoverage < 0.5) reasons.push('insufficient test coverage');
        break;

      case 'critical':
        reasons.push('This refactoring has critical complexity due to');
        if (factors.fileCount > 10) reasons.push('extensive file scope');
        if (factors.hasExternalDependencies) reasons.push('external dependencies');
        if (factors.requiresInterfaceChanges) reasons.push('required interface changes');
        break;
    }

    // Add type-specific reasoning
    switch (type) {
      case 'migration':
        reasons.push('and the migration nature of the change');
        break;
      case 'abstraction':
        reasons.push('and the need for careful abstraction design');
        break;
    }

    return reasons.join(' ') + '.';
  }

  /**
   * Calculate base hours for implementation
   */
  private calculateBaseHours(fileCount: number): number {
    return fileCount * this.config.baseHoursPerFile;
  }

  /**
   * Get complexity multiplier based on level
   */
  private getComplexityMultiplier(level: ComplexityRating['level']): number {
    switch (level) {
      case 'low': return 1.0;
      case 'medium': return 1.5;
      case 'high': return 2.5;
      case 'critical': return 4.0;
    }
  }

  /**
   * Get type-specific effort multiplier
   */
  private getTypeMultiplier(type: OptimizationRecommendation['type']): number {
    switch (type) {
      case 'consolidation': return 1.0;
      case 'refactoring': return 1.2;
      case 'abstraction': return 1.8;
      case 'migration': return 2.5;
    }
  }

  /**
   * Identify dependencies for effort estimation
   */
  private identifyDependencies(duplications: DuplicationInstance[], recommendation: OptimizationRecommendation): string[] {
    const dependencies: string[] = [];
    
    // Add file dependencies
    const affectedFiles = recommendation.affectedFiles;
    if (affectedFiles.length > 1) {
      dependencies.push('Coordinate changes across multiple files');
    }

    // Add testing dependencies
    const avgTestCoverage = duplications.reduce((sum, d) => sum + d.impact.testCoverage, 0) / duplications.length;
    if (avgTestCoverage < 0.7) {
      dependencies.push('Improve test coverage before refactoring');
    }

    // Add type-specific dependencies
    switch (recommendation.type) {
      case 'migration':
        dependencies.push('Plan migration strategy and rollback procedures');
        break;
      case 'abstraction':
        dependencies.push('Design and validate abstraction interfaces');
        break;
    }

    return dependencies;
  }

  /**
   * Get unique files from duplications
   */
  private getUniqueFiles(duplications: DuplicationInstance[]): string[] {
    const files = new Set<string>();
    duplications.forEach(duplication => {
      duplication.locations.forEach(location => {
        files.add(location.filePath);
      });
    });
    return Array.from(files);
  }

  /**
   * Extract module name from file path
   */
  private extractModuleName(filePath: string): string {
    const parts = filePath.split('/');
    // Find the first meaningful directory (skip src, lib, etc.)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part && !['src', 'lib', 'dist', 'build'].includes(part)) {
        return part;
      }
    }
    return 'root';
  }
}