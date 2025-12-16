/**
 * Impact Analyzer for assessing refactoring impact and benefits
 * Requirements: 7.1, 7.3, 7.4
 */

import { DuplicationInstance, ImpactMetrics, OptimizationRecommendation } from '../types/DuplicationModels.js';

export interface ImpactAnalysisResult {
  potentialSavings: {
    linesOfCode: number;
    files: number;
    maintainabilityImprovement: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  benefitScore: number;
  impactRating: number;
}

export interface ImpactAnalysisConfig {
  weightLinesOfCode: number;
  weightComplexity: number;
  weightMaintainability: number;
  weightTestCoverage: number;
}

export class ImpactAnalyzer {
  private config: ImpactAnalysisConfig;

  constructor(config: Partial<ImpactAnalysisConfig> = {}) {
    this.config = {
      weightLinesOfCode: 0.3,
      weightComplexity: 0.25,
      weightMaintainability: 0.3,
      weightTestCoverage: 0.15,
      ...config
    };
  }

  /**
   * Assess the impact of refactoring a set of duplications
   */
  assessRefactoringImpact(duplications: DuplicationInstance[]): ImpactAnalysisResult {
    const totalLinesOfCode = this.calculateTotalLinesOfCode(duplications);
    const affectedFiles = this.getAffectedFiles(duplications);
    const maintainabilityImprovement = this.calculateMaintainabilityImprovement(duplications);
    const riskLevel = this.assessRiskLevel(duplications);
    const benefitScore = this.calculateBenefitScore(duplications);
    const impactRating = this.calculateImpactRating(duplications);

    return {
      potentialSavings: {
        linesOfCode: totalLinesOfCode,
        files: affectedFiles.length,
        maintainabilityImprovement
      },
      riskLevel,
      benefitScore,
      impactRating
    };
  }

  /**
   * Calculate benefits of implementing a specific recommendation
   */
  calculateRecommendationBenefits(recommendation: OptimizationRecommendation): string[] {
    const benefits: string[] = [];

    // Calculate quantitative benefits
    const affectedFilesCount = recommendation.affectedFiles.length;
    if (affectedFilesCount > 1) {
      benefits.push(`Consolidates code across ${affectedFilesCount} files`);
    }

    // Estimate maintenance benefits
    if (recommendation.type === 'consolidation') {
      benefits.push('Reduces maintenance overhead by centralizing logic');
      benefits.push('Improves consistency across the codebase');
    }

    if (recommendation.type === 'abstraction') {
      benefits.push('Increases code reusability');
      benefits.push('Simplifies future feature development');
    }

    if (recommendation.type === 'refactoring') {
      benefits.push('Improves code readability and structure');
      benefits.push('Reduces technical debt');
    }

    if (recommendation.type === 'migration') {
      benefits.push('Modernizes codebase architecture');
      benefits.push('Improves long-term maintainability');
    }

    // Add complexity-based benefits
    if (recommendation.complexity.level === 'low') {
      benefits.push('Low implementation risk with immediate benefits');
    }

    return benefits;
  }

  /**
   * Assess the overall impact rating for prioritization
   */
  calculateImpactRating(duplications: DuplicationInstance[]): number {
    let totalImpact = 0;
    let totalWeight = 0;

    for (const duplication of duplications) {
      const impact = duplication.impact;
      const weight = duplication.locations.length; // More locations = higher weight

      const impactScore = 
        (impact.linesOfCode * this.config.weightLinesOfCode) +
        (impact.complexity * this.config.weightComplexity) +
        (impact.maintainabilityIndex * this.config.weightMaintainability) +
        (impact.testCoverage * this.config.weightTestCoverage);

      totalImpact += impactScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalImpact / totalWeight : 0;
  }

  private calculateTotalLinesOfCode(duplications: DuplicationInstance[]): number {
    return duplications.reduce((total, duplication) => {
      // Calculate potential savings: (n-1) * lines for n duplicated locations
      const locations = duplication.locations.length;
      const linesPerLocation = duplication.impact.linesOfCode;
      return total + ((locations - 1) * linesPerLocation);
    }, 0);
  }

  private getAffectedFiles(duplications: DuplicationInstance[]): string[] {
    const files = new Set<string>();
    duplications.forEach(duplication => {
      duplication.locations.forEach(location => {
        files.add(location.filePath);
      });
    });
    return Array.from(files);
  }

  private calculateMaintainabilityImprovement(duplications: DuplicationInstance[]): number {
    // Calculate weighted average maintainability improvement
    let totalImprovement = 0;
    let totalWeight = 0;

    duplications.forEach(duplication => {
      const locations = duplication.locations.length;
      const baseImprovement = duplication.impact.maintainabilityIndex;
      
      // More duplications = higher improvement potential
      const improvement = baseImprovement * Math.log(locations + 1);
      const weight = duplication.impact.linesOfCode;

      totalImprovement += improvement * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalImprovement / totalWeight : 0;
  }

  private assessRiskLevel(duplications: DuplicationInstance[]): 'low' | 'medium' | 'high' | 'critical' {
    const totalFiles = this.getAffectedFiles(duplications).length;
    const totalComplexity = duplications.reduce((sum, d) => sum + d.impact.complexity, 0);
    const avgTestCoverage = duplications.reduce((sum, d) => sum + d.impact.testCoverage, 0) / duplications.length;

    // High risk factors
    if (totalFiles > 10 || totalComplexity > 50 || avgTestCoverage < 0.3) {
      return 'critical';
    }

    if (totalFiles > 5 || totalComplexity > 25 || avgTestCoverage < 0.5) {
      return 'high';
    }

    if (totalFiles > 2 || totalComplexity > 10 || avgTestCoverage < 0.7) {
      return 'medium';
    }

    return 'low';
  }

  private calculateBenefitScore(duplications: DuplicationInstance[]): number {
    const linesOfCodeSavings = this.calculateTotalLinesOfCode(duplications);
    const maintainabilityGain = this.calculateMaintainabilityImprovement(duplications);
    const fileReduction = this.getAffectedFiles(duplications).length;

    // Normalize and weight the benefits
    const normalizedLOC = Math.min(linesOfCodeSavings / 1000, 1); // Cap at 1000 LOC
    const normalizedMaintainability = Math.min(maintainabilityGain / 100, 1); // Cap at 100 points
    const normalizedFiles = Math.min(fileReduction / 20, 1); // Cap at 20 files

    return (normalizedLOC * 0.4) + (normalizedMaintainability * 0.4) + (normalizedFiles * 0.2);
  }
}