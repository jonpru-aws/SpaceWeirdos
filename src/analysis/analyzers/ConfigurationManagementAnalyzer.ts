/**
 * ConfigurationManagementAnalyzer - Provides migration recommendations for configuration management
 * Analyzes configuration usage patterns and suggests ConfigurationManager adoption strategies
 */

import { OptimizationRecommendation, ComplexityRating, Risk, ImplementationStep } from '../types/DuplicationModels.js';
import { DuplicationInstance } from '../types/DuplicationModels.js';
import { v4 as uuidv4 } from 'uuid';

export interface ConfigurationMigrationAnalysis {
  hardcodedConfigCount: number;
  configManagerUsageCount: number;
  mixedUsageFiles: string[];
  migrationComplexity: 'low' | 'medium' | 'high';
  estimatedEffortHours: number;
  prioritizedMigrations: ConfigurationMigrationPriority[];
}

export interface ConfigurationMigrationPriority {
  category: string;
  files: string[];
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  migrationStrategy: string;
  codeExample: string;
}

export class ConfigurationManagementAnalyzer {
  
  analyzeConfigurationMigration(duplications: DuplicationInstance[]): ConfigurationMigrationAnalysis {
    const configDuplications = duplications.filter(d => d.type === 'configuration');
    
    const hardcodedConfigCount = this.countHardcodedConfigurations(configDuplications);
    const configManagerUsageCount = this.countConfigManagerUsage(configDuplications);
    const mixedUsageFiles = this.identifyMixedUsageFiles(configDuplications);
    
    const migrationComplexity = this.assessMigrationComplexity(
      hardcodedConfigCount,
      configManagerUsageCount,
      mixedUsageFiles.length
    );
    
    const estimatedEffortHours = this.estimateMigrationEffort(
      hardcodedConfigCount,
      migrationComplexity
    );
    
    const prioritizedMigrations = this.prioritizeMigrations(configDuplications);
    
    return {
      hardcodedConfigCount,
      configManagerUsageCount,
      mixedUsageFiles,
      migrationComplexity,
      estimatedEffortHours,
      prioritizedMigrations
    };
  }

  generateMigrationRecommendations(
    duplications: DuplicationInstance[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const analysis = this.analyzeConfigurationMigration(duplications);
    
    // High-priority recommendation for mixed usage
    if (analysis.mixedUsageFiles.length > 0) {
      recommendations.push(this.createMixedUsageRecommendation(analysis));
    }
    
    // Category-specific migration recommendations
    for (const migration of analysis.prioritizedMigrations) {
      if (migration.impact === 'high' || migration.impact === 'medium') {
        recommendations.push(this.createCategoryMigrationRecommendation(migration));
      }
    }
    
    // Overall configuration standardization recommendation
    if (analysis.hardcodedConfigCount > 5) {
      recommendations.push(this.createStandardizationRecommendation(analysis));
    }
    
    return recommendations.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
  }

  private countHardcodedConfigurations(duplications: DuplicationInstance[]): number {
    return duplications.filter(d => 
      d.description.includes('hardcoded') || 
      d.description.includes('should use ConfigurationManager')
    ).length;
  }

  private countConfigManagerUsage(duplications: DuplicationInstance[]): number {
    return duplications.filter(d => 
      d.description.includes('ConfigurationManager') &&
      !d.description.includes('should use')
    ).length;
  }

  private identifyMixedUsageFiles(duplications: DuplicationInstance[]): string[] {
    const fileConfigUsage: Map<string, Set<string>> = new Map();
    
    for (const duplication of duplications) {
      for (const location of duplication.locations) {
        if (!fileConfigUsage.has(location.filePath)) {
          fileConfigUsage.set(location.filePath, new Set());
        }
        
        const usageType = this.determineConfigUsageType(duplication.description);
        fileConfigUsage.get(location.filePath)!.add(usageType);
      }
    }
    
    // Find files with mixed usage patterns
    return Array.from(fileConfigUsage.entries())
      .filter(([_, usageTypes]) => usageTypes.size > 1)
      .map(([filePath, _]) => filePath);
  }

  private determineConfigUsageType(description: string): string {
    if (description.includes('ConfigurationManager')) return 'configuration_manager';
    if (description.includes('process.env')) return 'direct_env';
    if (description.includes('hardcoded')) return 'hardcoded';
    return 'other';
  }

  private assessMigrationComplexity(
    hardcodedCount: number,
    configManagerCount: number,
    mixedUsageFileCount: number
  ): 'low' | 'medium' | 'high' {
    const totalConfig = hardcodedCount + configManagerCount;
    const mixedUsageRatio = mixedUsageFileCount / Math.max(1, totalConfig);
    
    if (hardcodedCount < 5 && mixedUsageRatio < 0.2) return 'low';
    if (hardcodedCount < 15 && mixedUsageRatio < 0.4) return 'medium';
    return 'high';
  }

  private estimateMigrationEffort(
    hardcodedCount: number,
    complexity: 'low' | 'medium' | 'high'
  ): number {
    const baseHours = hardcodedCount * 0.5; // 30 minutes per hardcoded config
    const complexityMultiplier = { low: 1, medium: 1.5, high: 2.5 }[complexity];
    const testingOverhead = 2; // Additional hours for testing
    
    return Math.round(baseHours * complexityMultiplier + testingOverhead);
  }

  private prioritizeMigrations(duplications: DuplicationInstance[]): ConfigurationMigrationPriority[] {
    const categoryGroups: Map<string, DuplicationInstance[]> = new Map();
    
    // Group duplications by category
    for (const duplication of duplications) {
      const category = this.extractCategory(duplication.description);
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(duplication);
    }
    
    // Create migration priorities
    const priorities: ConfigurationMigrationPriority[] = [];
    for (const [category, categoryDuplications] of categoryGroups.entries()) {
      const files = this.extractUniqueFiles(categoryDuplications);
      const impact = this.assessCategoryImpact(category, categoryDuplications.length);
      const effort = this.assessCategoryEffort(categoryDuplications.length);
      const migrationStrategy = this.generateCategoryMigrationStrategy(category);
      const codeExample = this.generateCategoryCodeExample(category);
      
      priorities.push({
        category,
        files,
        impact,
        effort,
        migrationStrategy,
        codeExample
      });
    }
    
    // Sort by impact (high first) then by effort (low first)
    return priorities.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      const effortScore = { low: 3, medium: 2, high: 1 };
      
      const aScore = impactScore[a.impact] * 10 + effortScore[a.effort];
      const bScore = impactScore[b.impact] * 10 + effortScore[b.effort];
      
      return bScore - aScore;
    });
  }

  private extractCategory(description: string): string {
    if (description.includes('cost') || description.includes('point')) return 'Cost Limits';
    if (description.includes('validation') || description.includes('threshold')) return 'Validation Thresholds';
    if (description.includes('api') || description.includes('endpoint')) return 'API Configuration';
    if (description.includes('cache')) return 'Cache Settings';
    if (description.includes('error') || description.includes('message')) return 'Error Messages';
    if (description.includes('server') || description.includes('port')) return 'Server Configuration';
    return 'General Configuration';
  }

  private extractUniqueFiles(duplications: DuplicationInstance[]): string[] {
    const files = new Set<string>();
    for (const duplication of duplications) {
      for (const location of duplication.locations) {
        files.add(location.filePath);
      }
    }
    return Array.from(files);
  }

  private assessCategoryImpact(category: string, count: number): 'low' | 'medium' | 'high' {
    const highImpactCategories = ['Cost Limits', 'Validation Thresholds', 'Server Configuration'];
    const mediumImpactCategories = ['API Configuration', 'Cache Settings'];
    
    if (highImpactCategories.includes(category) && count >= 2) return 'high';
    if (mediumImpactCategories.includes(category) && count >= 3) return 'medium';
    if (count >= 5) return 'medium';
    return 'low';
  }

  private assessCategoryEffort(count: number): 'low' | 'medium' | 'high' {
    if (count <= 2) return 'low';
    if (count <= 5) return 'medium';
    return 'high';
  }

  private generateCategoryMigrationStrategy(category: string): string {
    switch (category) {
      case 'Cost Limits':
        return 'Migrate hardcoded point limits and costs to configManager.getCostConfig()';
      case 'Validation Thresholds':
        return 'Centralize validation thresholds in configManager.getValidationConfig()';
      case 'API Configuration':
        return 'Move API endpoints and settings to configManager.getApiConfig()';
      case 'Cache Settings':
        return 'Standardize cache configuration using configManager.getCacheConfig()';
      case 'Error Messages':
        return 'Centralize error messages in configManager.getValidationConfig().messages';
      case 'Server Configuration':
        return 'Move server settings to configManager.getServerConfig()';
      default:
        return 'Migrate to appropriate ConfigurationManager method';
    }
  }

  private generateCategoryCodeExample(category: string): string {
    switch (category) {
      case 'Cost Limits':
        return `
// Before: const POINT_LIMIT = 75;
// After:
const configManager = ConfigurationManager.getInstance();
await configManager.initialize();
const costConfig = configManager.getCostConfig();
const pointLimit = costConfig.pointLimits.standard;`;

      case 'Validation Thresholds':
        return `
// Before: const WARNING_THRESHOLD = 0.9;
// After:
const validationConfig = configManager.getValidationConfig();
const warningThreshold = validationConfig.costWarningThreshold;`;

      case 'API Configuration':
        return `
// Before: const API_URL = 'http://localhost:3001/api';
// After:
const apiConfig = configManager.getApiConfig();
const apiUrl = apiConfig.baseUrl;`;

      case 'Cache Settings':
        return `
// Before: const cache = new SimpleCache(100, 5000);
// After:
const cache = configManager.createCacheInstance<ItemCost>('item-cost');`;

      default:
        return `
// Use appropriate ConfigurationManager method
const config = configManager.get[Category]Config();`;
    }
  }

  private createMixedUsageRecommendation(analysis: ConfigurationMigrationAnalysis): OptimizationRecommendation {
    return {
      id: uuidv4(),
      title: 'Standardize Mixed Configuration Usage',
      description: `${analysis.mixedUsageFiles.length} files use inconsistent configuration access patterns. Standardize to ConfigurationManager for consistency.`,
      type: 'migration',
      priority: 'high',
      complexity: {
        level: analysis.migrationComplexity,
        factors: [
          'Mixed configuration access patterns',
          'Potential breaking changes',
          'Testing requirements'
        ],
        reasoning: 'Mixed usage patterns create maintenance overhead and potential inconsistencies'
      },
      estimatedEffort: {
        hours: Math.round(analysis.estimatedEffortHours * 0.6),
        complexity: {
          level: analysis.migrationComplexity,
          factors: ['File analysis', 'Pattern replacement', 'Testing'],
          reasoning: 'Mixed usage patterns require careful analysis and testing'
        },
        dependencies: ['ConfigurationManager', 'Environment variables', 'Test updates']
      },
      benefits: [
        'Consistent configuration access across the application',
        'Centralized configuration management',
        'Environment-specific configuration support',
        'Improved maintainability and debugging'
      ],
      risks: [
        {
          type: 'breaking_change',
          severity: 'medium',
          description: 'Configuration access pattern changes may affect runtime behavior',
          mitigation: 'Thorough testing and gradual migration'
        }
      ],
      implementationPlan: [
        {
          order: 1,
          title: 'Audit Mixed Usage Files',
          description: 'Identify all configuration access patterns in affected files',
          validation: 'Complete inventory of configuration usage patterns'
        },
        {
          order: 2,
          title: 'Create Migration Plan',
          description: 'Plan the migration sequence to minimize breaking changes',
          validation: 'Detailed migration sequence with rollback plans'
        },
        {
          order: 3,
          title: 'Migrate High-Impact Files First',
          description: 'Start with files that have the most configuration inconsistencies',
          validation: 'High-impact files use consistent ConfigurationManager patterns'
        },
        {
          order: 4,
          title: 'Update Tests and Validation',
          description: 'Ensure all tests pass with new configuration patterns',
          validation: 'All tests pass and configuration behavior is preserved'
        }
      ],
      affectedFiles: analysis.mixedUsageFiles
    };
  }

  private createCategoryMigrationRecommendation(migration: ConfigurationMigrationPriority): OptimizationRecommendation {
    return {
      id: uuidv4(),
      title: `Migrate ${migration.category} Configuration`,
      description: `Standardize ${migration.category.toLowerCase()} configuration to use ConfigurationManager across ${migration.files.length} files.`,
      type: 'migration',
      priority: migration.impact === 'high' ? 'high' : 'medium',
      complexity: {
        level: migration.effort,
        factors: [
          `${migration.files.length} files affected`,
          'Configuration pattern changes',
          'Testing requirements'
        ],
        reasoning: `${migration.category} configuration affects core application behavior`
      },
      estimatedEffort: {
        hours: this.estimateCategoryEffort(migration.effort, migration.files.length),
        complexity: {
          level: migration.effort,
          factors: ['Pattern analysis', 'Code migration', 'Testing'],
          reasoning: `${migration.category} migration affects ${migration.files.length} files`
        },
        dependencies: ['ConfigurationManager', 'Configuration validation', 'Test updates']
      },
      benefits: [
        `Centralized ${migration.category.toLowerCase()} management`,
        'Environment-specific configuration support',
        'Consistent configuration access patterns',
        'Improved maintainability'
      ],
      risks: [
        {
          type: 'breaking_change',
          severity: migration.impact === 'high' ? 'medium' : 'low',
          description: `Changes to ${migration.category.toLowerCase()} access patterns`,
          mitigation: 'Gradual migration with comprehensive testing'
        }
      ],
      implementationPlan: [
        {
          order: 1,
          title: `Analyze ${migration.category} Usage`,
          description: `Identify all ${migration.category.toLowerCase()} access patterns`,
          codeExample: migration.codeExample,
          validation: `Complete inventory of ${migration.category.toLowerCase()} usage`
        },
        {
          order: 2,
          title: 'Implement ConfigurationManager Integration',
          description: migration.migrationStrategy,
          validation: `${migration.category} uses ConfigurationManager consistently`
        },
        {
          order: 3,
          title: 'Update Tests',
          description: `Update tests to work with new ${migration.category.toLowerCase()} patterns`,
          validation: 'All tests pass with new configuration approach'
        }
      ],
      affectedFiles: migration.files
    };
  }

  private createStandardizationRecommendation(analysis: ConfigurationMigrationAnalysis): OptimizationRecommendation {
    return {
      id: uuidv4(),
      title: 'Comprehensive Configuration Standardization',
      description: `Migrate ${analysis.hardcodedConfigCount} hardcoded configurations to ConfigurationManager for centralized management.`,
      type: 'migration',
      priority: 'medium',
      complexity: {
        level: analysis.migrationComplexity,
        factors: [
          `${analysis.hardcodedConfigCount} hardcoded configurations`,
          'Multiple configuration categories',
          'Cross-cutting changes'
        ],
        reasoning: 'Large-scale configuration standardization requires careful planning'
      },
      estimatedEffort: {
        hours: analysis.estimatedEffortHours,
        complexity: {
          level: analysis.migrationComplexity,
          factors: ['Configuration analysis', 'Migration implementation', 'Comprehensive testing'],
          reasoning: 'Large-scale configuration migration requires systematic approach'
        },
        dependencies: ['ConfigurationManager', 'Environment configuration', 'Test infrastructure']
      },
      benefits: [
        'Centralized configuration management',
        'Environment-specific configuration support',
        'Consistent configuration access patterns',
        'Improved maintainability and debugging',
        'Better configuration validation'
      ],
      risks: [
        {
          type: 'breaking_change',
          severity: 'medium',
          description: 'Large-scale configuration changes may affect multiple components',
          mitigation: 'Phased migration with extensive testing'
        },
        {
          type: 'performance',
          severity: 'low',
          description: 'Configuration initialization overhead',
          mitigation: 'Optimize ConfigurationManager initialization'
        }
      ],
      implementationPlan: [
        {
          order: 1,
          title: 'Configuration Audit',
          description: 'Complete audit of all configuration usage patterns',
          validation: 'Comprehensive configuration inventory'
        },
        {
          order: 2,
          title: 'Prioritized Migration Plan',
          description: 'Create phased migration plan based on impact and complexity',
          validation: 'Detailed migration roadmap with timelines'
        },
        {
          order: 3,
          title: 'High-Priority Migrations',
          description: 'Migrate high-impact configurations first',
          validation: 'Critical configurations use ConfigurationManager'
        },
        {
          order: 4,
          title: 'Remaining Migrations',
          description: 'Complete migration of remaining configurations',
          validation: 'All configurations use ConfigurationManager'
        },
        {
          order: 5,
          title: 'Validation and Testing',
          description: 'Comprehensive testing of all configuration changes',
          validation: 'All tests pass and configuration behavior is preserved'
        }
      ],
      affectedFiles: []
    };
  }

  private estimateCategoryEffort(effort: 'low' | 'medium' | 'high', fileCount: number): number {
    const baseHours = { low: 1, medium: 2, high: 4 }[effort];
    return Math.round(baseHours + (fileCount * 0.5));
  }

  private getPriorityScore(priority: 'low' | 'medium' | 'high' | 'critical'): number {
    return { low: 1, medium: 2, high: 3, critical: 4 }[priority];
  }
}