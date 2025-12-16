/**
 * Risk Assessor for identifying breaking changes and migration challenges
 * Requirements: 7.1, 7.3, 7.4
 */

import { DuplicationInstance, Risk, OptimizationRecommendation } from '../types/DuplicationModels.js';

export interface RiskAssessmentConfig {
  breakingChangeThreshold: number;
  performanceImpactThreshold: number;
  compatibilityRiskThreshold: number;
}

export interface RiskAnalysisResult {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  risks: Risk[];
  mitigationStrategies: string[];
  recommendedApproach: 'immediate' | 'phased' | 'delayed' | 'avoid';
}

export class RiskAssessor {
  private config: RiskAssessmentConfig;

  constructor(config: Partial<RiskAssessmentConfig> = {}) {
    this.config = {
      breakingChangeThreshold: 0.3,
      performanceImpactThreshold: 0.2,
      compatibilityRiskThreshold: 0.4,
      ...config
    };
  }

  /**
   * Assess risks for a refactoring recommendation
   */
  assessRisks(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): RiskAnalysisResult {
    const risks = this.identifyRisks(recommendation, duplications);
    const overallRiskLevel = this.calculateOverallRiskLevel(risks);
    const mitigationStrategies = this.generateMitigationStrategies(risks);
    const recommendedApproach = this.determineRecommendedApproach(overallRiskLevel, recommendation);

    return {
      overallRiskLevel,
      risks,
      mitigationStrategies,
      recommendedApproach
    };
  }

  /**
   * Identify potential breaking changes
   */
  identifyBreakingChanges(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): Risk[] {
    const breakingChangeRisks: Risk[] = [];

    // Check for interface changes
    if (this.hasInterfaceChanges(recommendation.affectedFiles)) {
      breakingChangeRisks.push({
        type: 'breaking_change',
        severity: 'high',
        description: 'Refactoring may require interface changes that break existing consumers',
        mitigation: 'Use deprecation warnings and provide migration path for consumers'
      });
    }

    // Check for public API changes
    if (this.hasPublicApiChanges(recommendation.affectedFiles)) {
      breakingChangeRisks.push({
        type: 'breaking_change',
        severity: 'medium',
        description: 'Changes to public APIs may affect external integrations',
        mitigation: 'Maintain backward compatibility through adapter patterns or versioning'
      });
    }

    // Check for dependency changes
    if (this.hasDependencyChanges(duplications)) {
      breakingChangeRisks.push({
        type: 'breaking_change',
        severity: 'medium',
        description: 'Consolidation may change dependency injection or module loading',
        mitigation: 'Ensure dependency injection containers are updated appropriately'
      });
    }

    return breakingChangeRisks;
  }

  /**
   * Assess migration challenges
   */
  assessMigrationChallenges(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): Risk[] {
    const migrationRisks: Risk[] = [];

    // Data migration risks
    if (recommendation.type === 'migration' && this.hasDataMigrationNeeds(duplications)) {
      migrationRisks.push({
        type: 'compatibility',
        severity: 'high',
        description: 'Data structures may need migration during consolidation',
        mitigation: 'Create data migration scripts and validate data integrity'
      });
    }

    // Configuration migration risks
    if (this.hasConfigurationChanges(duplications)) {
      migrationRisks.push({
        type: 'compatibility',
        severity: 'medium',
        description: 'Configuration formats or locations may change',
        mitigation: 'Provide configuration migration tools and clear documentation'
      });
    }

    // Testing migration risks
    const avgTestCoverage = duplications.reduce((sum, d) => sum + d.impact.testCoverage, 0) / duplications.length;
    if (avgTestCoverage < 0.5) {
      migrationRisks.push({
        type: 'testing',
        severity: 'high',
        description: 'Low test coverage increases risk of undetected regressions',
        mitigation: 'Increase test coverage before refactoring and add integration tests'
      });
    }

    return migrationRisks;
  }

  /**
   * Identify all risks for a recommendation
   */
  private identifyRisks(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): Risk[] {
    const risks: Risk[] = [];

    // Add breaking change risks
    risks.push(...this.identifyBreakingChanges(recommendation, duplications));

    // Add migration risks
    risks.push(...this.assessMigrationChallenges(recommendation, duplications));

    // Add performance risks
    risks.push(...this.assessPerformanceRisks(recommendation, duplications));

    // Add compatibility risks
    risks.push(...this.assessCompatibilityRisks(recommendation, duplications));

    return risks;
  }

  /**
   * Assess performance-related risks
   */
  private assessPerformanceRisks(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): Risk[] {
    const performanceRisks: Risk[] = [];

    // Check for potential performance degradation
    if (recommendation.type === 'abstraction' && duplications.length > 5) {
      performanceRisks.push({
        type: 'performance',
        severity: 'medium',
        description: 'Adding abstraction layers may introduce performance overhead',
        mitigation: 'Profile performance before and after changes, optimize critical paths'
      });
    }

    // Check for caching implications
    if (this.hasCachingImplications(duplications)) {
      performanceRisks.push({
        type: 'performance',
        severity: 'low',
        description: 'Consolidation may affect caching strategies',
        mitigation: 'Review and update caching mechanisms after consolidation'
      });
    }

    return performanceRisks;
  }

  /**
   * Assess compatibility-related risks
   */
  private assessCompatibilityRisks(recommendation: OptimizationRecommendation, duplications: DuplicationInstance[]): Risk[] {
    const compatibilityRisks: Risk[] = [];

    // Check for cross-platform compatibility
    if (this.hasCrossPlatformConcerns(recommendation.affectedFiles)) {
      compatibilityRisks.push({
        type: 'compatibility',
        severity: 'medium',
        description: 'Changes may affect cross-platform compatibility',
        mitigation: 'Test on all supported platforms and environments'
      });
    }

    // Check for version compatibility
    if (this.hasVersionCompatibilityConcerns(duplications)) {
      compatibilityRisks.push({
        type: 'compatibility',
        severity: 'low',
        description: 'Consolidation may affect backward compatibility',
        mitigation: 'Maintain compatibility layers for deprecated functionality'
      });
    }

    return compatibilityRisks;
  }

  /**
   * Calculate overall risk level from individual risks
   */
  private calculateOverallRiskLevel(risks: Risk[]): 'low' | 'medium' | 'high' | 'critical' {
    if (risks.length === 0) return 'low';

    const riskScores = risks.map(risk => {
      switch (risk.severity) {
        case 'low': return 1;
        case 'medium': return 2;
        case 'high': return 3;
        default: return 1;
      }
    });

    const maxRisk = Math.max(...riskScores);
    const avgRisk = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;

    // Critical if any high-severity breaking changes
    const hasHighBreakingChange = risks.some(r => r.type === 'breaking_change' && r.severity === 'high');
    if (hasHighBreakingChange) return 'critical';

    // High if multiple medium+ risks or any high-severity risk
    if (maxRisk >= 3 || (avgRisk >= 2 && risks.length >= 3)) return 'high';

    // Medium if any medium-severity risks or multiple low-severity risks
    if (maxRisk >= 2 || risks.length >= 4) return 'medium';

    return 'low';
  }

  /**
   * Generate mitigation strategies based on identified risks
   */
  private generateMitigationStrategies(risks: Risk[]): string[] {
    const strategies = new Set<string>();

    risks.forEach(risk => {
      strategies.add(risk.mitigation);

      // Add general strategies based on risk type
      switch (risk.type) {
        case 'breaking_change':
          strategies.add('Implement comprehensive regression testing');
          strategies.add('Create detailed migration documentation');
          break;
        case 'performance':
          strategies.add('Establish performance benchmarks before changes');
          strategies.add('Monitor performance metrics after deployment');
          break;
        case 'compatibility':
          strategies.add('Test in multiple environments and configurations');
          break;
        case 'testing':
          strategies.add('Increase automated test coverage');
          strategies.add('Implement integration and end-to-end tests');
          break;
      }
    });

    return Array.from(strategies);
  }

  /**
   * Determine recommended approach based on risk level
   */
  private determineRecommendedApproach(riskLevel: 'low' | 'medium' | 'high' | 'critical', recommendation: OptimizationRecommendation): 'immediate' | 'phased' | 'delayed' | 'avoid' {
    switch (riskLevel) {
      case 'low':
        return 'immediate';
      case 'medium':
        return recommendation.priority === 'high' || recommendation.priority === 'critical' ? 'phased' : 'immediate';
      case 'high':
        return 'phased';
      case 'critical':
        return recommendation.priority === 'critical' ? 'delayed' : 'avoid';
    }
  }

  // Helper methods for risk detection
  private hasInterfaceChanges(affectedFiles: string[]): boolean {
    return affectedFiles.some(file => 
      file.includes('interface') || 
      file.includes('types') || 
      file.endsWith('.d.ts')
    );
  }

  private hasPublicApiChanges(affectedFiles: string[]): boolean {
    return affectedFiles.some(file => 
      file.includes('api') || 
      file.includes('public') || 
      file.includes('export')
    );
  }

  private hasDependencyChanges(duplications: DuplicationInstance[]): boolean {
    return duplications.some(duplication => 
      duplication.description.toLowerCase().includes('dependency') ||
      duplication.description.toLowerCase().includes('injection') ||
      duplication.description.toLowerCase().includes('singleton')
    );
  }

  private hasDataMigrationNeeds(duplications: DuplicationInstance[]): boolean {
    return duplications.some(duplication => 
      duplication.description.toLowerCase().includes('data') ||
      duplication.description.toLowerCase().includes('storage') ||
      duplication.description.toLowerCase().includes('persistence')
    );
  }

  private hasConfigurationChanges(duplications: DuplicationInstance[]): boolean {
    return duplications.some(duplication => 
      duplication.description.toLowerCase().includes('config') ||
      duplication.description.toLowerCase().includes('setting') ||
      duplication.type === 'configuration'
    );
  }

  private hasCachingImplications(duplications: DuplicationInstance[]): boolean {
    return duplications.some(duplication => 
      duplication.description.toLowerCase().includes('cache') ||
      duplication.description.toLowerCase().includes('memoiz')
    );
  }

  private hasCrossPlatformConcerns(affectedFiles: string[]): boolean {
    return affectedFiles.some(file => 
      file.includes('platform') || 
      file.includes('os') || 
      file.includes('environment')
    );
  }

  private hasVersionCompatibilityConcerns(duplications: DuplicationInstance[]): boolean {
    return duplications.some(duplication => 
      duplication.description.toLowerCase().includes('version') ||
      duplication.description.toLowerCase().includes('legacy') ||
      duplication.description.toLowerCase().includes('deprecated')
    );
  }
}