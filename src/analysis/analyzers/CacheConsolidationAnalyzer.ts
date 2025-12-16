/**
 * Cache Consolidation Analyzer
 * 
 * Analyzes cache implementations to provide unified caching strategy recommendations.
 * Identifies opportunities for shared caching utilities and standardization.
 */

import type { 
  OptimizationRecommendation,
  ImplementationStep 
} from '../interfaces/AnalysisInterfaces';
import type { 
  CacheImplementation, 
  CacheConsolidationOpportunity,
  CacheConfiguration 
} from '../detectors/CacheAnalysisDetector';

export interface UnifiedCachingStrategy {
  approach: 'factory_pattern' | 'singleton_consolidation' | 'configuration_standardization';
  description: string;
  benefits: string[];
  implementation: StrategyImplementation;
  migrationPlan: MigrationStep[];
}

export interface StrategyImplementation {
  coreInterface: string;
  factoryMethod: string;
  configurationIntegration: string;
  usageExample: string;
}

export interface MigrationStep {
  phase: number;
  title: string;
  description: string;
  deliverables: string[];
  estimatedHours: number;
  risks: string[];
}

export interface CacheStandardizationReport {
  currentState: CacheInventory;
  recommendedStrategy: UnifiedCachingStrategy;
  consolidationOpportunities: CacheConsolidationOpportunity[];
  migrationRoadmap: MigrationRoadmap;
}

export interface CacheInventory {
  totalImplementations: number;
  implementationsByType: Map<string, CacheImplementation[]>;
  configurationSources: Map<string, number>;
  usagePatterns: Map<string, number>;
  inconsistencies: string[];
}

export interface MigrationRoadmap {
  phases: MigrationPhase[];
  totalEstimatedHours: number;
  criticalPath: string[];
  dependencies: PhaseDependency[];
}

export interface MigrationPhase {
  id: string;
  name: string;
  description: string;
  steps: MigrationStep[];
  estimatedHours: number;
  prerequisites: string[];
}

export interface PhaseDependency {
  from: string;
  to: string;
  reason: string;
}

/**
 * Analyzes cache implementations and provides consolidation strategies
 */
export class CacheConsolidationAnalyzer {
  
  /**
   * Analyzes cache implementations and generates unified strategy recommendations
   */
  async analyzeConsolidationStrategy(
    cacheImplementations: CacheImplementation[],
    consolidationOpportunities: CacheConsolidationOpportunity[]
  ): Promise<CacheStandardizationReport> {
    
    const currentState = this.analyzeCacheInventory(cacheImplementations);
    const recommendedStrategy = this.determineOptimalStrategy(currentState, consolidationOpportunities);
    const migrationRoadmap = this.createMigrationRoadmap(currentState, recommendedStrategy);

    return {
      currentState,
      recommendedStrategy,
      consolidationOpportunities,
      migrationRoadmap
    };
  }

  /**
   * Analyzes current cache usage and provides specific consolidation recommendations
   */
  analyzeCurrentCacheUsage(cacheImplementations: CacheImplementation[]): {
    duplicateImplementations: CacheImplementation[];
    hardcodedConfigurations: CacheImplementation[];
    configurationManagerUsage: CacheImplementation[];
    consolidationOpportunities: string[];
  } {
    const duplicateImplementations: CacheImplementation[] = [];
    const hardcodedConfigurations: CacheImplementation[] = [];
    const configurationManagerUsage: CacheImplementation[] = [];
    const consolidationOpportunities: string[] = [];

    // Identify duplicate implementations (CostCache.ts vs CostCache.js)
    const costCacheFiles = cacheImplementations.filter(cache => 
      cache.className === 'CostCache'
    );
    if (costCacheFiles.length > 1) {
      duplicateImplementations.push(...costCacheFiles);
      consolidationOpportunities.push(
        `Found ${costCacheFiles.length} CostCache implementations - consolidate to single TypeScript version`
      );
    }

    // Identify hardcoded configurations
    const hardcodedCaches = cacheImplementations.filter(cache => 
      cache.configuration.configurationSource === 'hardcoded'
    );
    if (hardcodedCaches.length > 0) {
      hardcodedConfigurations.push(...hardcodedCaches);
      consolidationOpportunities.push(
        `Found ${hardcodedCaches.length} caches with hardcoded configuration - migrate to ConfigurationManager`
      );
    }

    // Identify ConfigurationManager usage
    const configManagerCaches = cacheImplementations.filter(cache => 
      cache.configuration.configurationSource === 'configuration_manager'
    );
    if (configManagerCaches.length > 0) {
      configurationManagerUsage.push(...configManagerCaches);
    }

    // Check for mixed configuration sources
    const configSources = new Set(cacheImplementations.map(cache => cache.configuration.configurationSource));
    if (configSources.size > 1) {
      consolidationOpportunities.push(
        'Mixed configuration sources detected - standardize all caches to use ConfigurationManager'
      );
    }

    // Check for similar cache purposes
    const purposeGroups = new Map<string, CacheImplementation[]>();
    for (const cache of cacheImplementations) {
      for (const usage of cache.usage) {
        if (!purposeGroups.has(usage.purpose)) {
          purposeGroups.set(usage.purpose, []);
        }
        if (!purposeGroups.get(usage.purpose)!.includes(cache)) {
          purposeGroups.get(usage.purpose)!.push(cache);
        }
      }
    }

    for (const [purpose, caches] of purposeGroups) {
      if (caches.length > 1) {
        consolidationOpportunities.push(
          `Multiple caches serving ${purpose} purpose - consider shared cache instance`
        );
      }
    }

    return {
      duplicateImplementations,
      hardcodedConfigurations,
      configurationManagerUsage,
      consolidationOpportunities
    };
  }

  /**
   * Generates optimization recommendations for cache consolidation
   */
  generateConsolidationRecommendations(
    report: CacheStandardizationReport
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Main consolidation recommendation
    recommendations.push(this.createMainConsolidationRecommendation(report));

    // Configuration standardization recommendation
    if (report.currentState.configurationSources.size > 1) {
      recommendations.push(this.createConfigurationStandardizationRecommendation(report));
    }

    // Factory pattern recommendation
    if (report.currentState.totalImplementations > 2) {
      recommendations.push(this.createFactoryPatternRecommendation(report));
    }

    return recommendations;
  }

  /**
   * Analyzes current cache inventory
   */
  private analyzeCacheInventory(cacheImplementations: CacheImplementation[]): CacheInventory {
    const implementationsByType = new Map<string, CacheImplementation[]>();
    const configurationSources = new Map<string, number>();
    const usagePatterns = new Map<string, number>();
    const inconsistencies: string[] = [];

    // Categorize implementations
    for (const cache of cacheImplementations) {
      // Group by feature signature
      const featureSignature = cache.features.map(f => f.type).sort().join(',');
      if (!implementationsByType.has(featureSignature)) {
        implementationsByType.set(featureSignature, []);
      }
      implementationsByType.get(featureSignature)!.push(cache);

      // Count configuration sources
      const source = cache.configuration.configurationSource;
      configurationSources.set(source, (configurationSources.get(source) || 0) + 1);

      // Count usage patterns
      for (const usage of cache.usage) {
        usagePatterns.set(usage.purpose, (usagePatterns.get(usage.purpose) || 0) + 1);
      }
    }

    // Identify inconsistencies
    if (configurationSources.size > 1) {
      inconsistencies.push('Mixed configuration sources across cache implementations');
    }

    const hardcodedConfigs = Array.from(implementationsByType.values())
      .flat()
      .filter(cache => cache.configuration.configurationSource === 'hardcoded');
    
    if (hardcodedConfigs.length > 0) {
      inconsistencies.push(`${hardcodedConfigs.length} cache implementations use hardcoded configuration`);
    }

    // Check for duplicate feature sets
    for (const [signature, caches] of implementationsByType) {
      if (caches.length > 1) {
        inconsistencies.push(`${caches.length} implementations with identical features: ${signature}`);
      }
    }

    return {
      totalImplementations: cacheImplementations.length,
      implementationsByType,
      configurationSources,
      usagePatterns,
      inconsistencies
    };
  }

  /**
   * Determines the optimal consolidation strategy
   */
  private determineOptimalStrategy(
    inventory: CacheInventory,
    opportunities: CacheConsolidationOpportunity[]
  ): UnifiedCachingStrategy {
    
    // Primary strategy determination based on complexity and configuration sources
    if (inventory.totalImplementations >= 3 && inventory.configurationSources.size > 1) {
      return this.createFactoryPatternStrategy();
    }
    
    // Check for Space Weirdos specific patterns (only for smaller codebases)
    const hasDuplicateCostCache = Array.from(inventory.implementationsByType.values())
      .flat()
      .filter(cache => cache.className === 'CostCache').length > 1;
    
    const hasConfigurationManager = inventory.configurationSources.has('configuration_manager');
    const hasHardcodedConfig = inventory.configurationSources.has('hardcoded');
    
    // For Space Weirdos codebase with fewer implementations, prioritize configuration standardization
    if (inventory.totalImplementations < 3 && (hasDuplicateCostCache || (hasConfigurationManager && hasHardcodedConfig))) {
      return this.createSpaceWeirdosStrategy();
    }
    
    // Standard strategy determination
    if (inventory.configurationSources.has('hardcoded')) {
      return this.createConfigurationStandardizationStrategy();
    } else {
      return this.createSingletonConsolidationStrategy();
    }
  }

  /**
   * Creates factory pattern strategy
   */
  private createFactoryPatternStrategy(): UnifiedCachingStrategy {
    return {
      approach: 'factory_pattern',
      description: 'Implement a unified cache factory that creates purpose-specific cache instances using ConfigurationManager',
      benefits: [
        'Centralized cache creation and configuration',
        'Consistent cache behavior across all components',
        'Easy to add new cache types without code duplication',
        'Simplified testing and mocking',
        'Better performance monitoring and metrics'
      ],
      implementation: {
        coreInterface: `
interface UnifiedCache<T> {
  get(key: string): T | null;
  set(key: string, value: T, options?: CacheSetOptions): void;
  delete(key: string): boolean;
  clear(): void;
  invalidate(predicate: (key: string) => boolean): void;
  size(): number;
  stats(): CacheStats;
}

interface CacheSetOptions {
  ttl?: number;
  priority?: 'low' | 'normal' | 'high';
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
}`,
        factoryMethod: `
class CacheFactory {
  private static configManager = ConfigurationManager.getInstance();
  
  static createCache<T>(purpose: CachePurpose): UnifiedCache<T> {
    const config = this.configManager.getCacheConfig();
    
    switch (purpose) {
      case 'item-cost':
        return new UnifiedCacheImpl<T>({
          maxSize: config.itemCostCacheSize,
          ttl: config.itemCostCacheTtl,
          evictionPolicy: 'lru'
        });
      case 'cost-calculation':
        return new UnifiedCacheImpl<T>({
          maxSize: config.costCalculationCacheSize,
          ttl: config.costCalculationCacheTtl,
          evictionPolicy: 'lru'
        });
      default:
        return new UnifiedCacheImpl<T>({
          maxSize: config.defaultMaxSize,
          ttl: config.defaultTtlMs,
          evictionPolicy: 'lru'
        });
    }
  }
}`,
        configurationIntegration: `
// All cache configurations managed through ConfigurationManager
const cacheConfig = configManager.getCacheConfig();
const cache = CacheFactory.createCache<ItemCost>('item-cost');`,
        usageExample: `
// Frontend usage
const costCache = CacheFactory.createCache<CostResult>('cost-calculation');
costCache.set('warband-123', result, { ttl: 5000 });

// Backend usage  
const validationCache = CacheFactory.createCache<ValidationResult>('validation-result');
validationCache.set(validationKey, result);`
      },
      migrationPlan: [
        {
          phase: 1,
          title: 'Create Unified Cache Interface',
          description: 'Define common interface and base implementation',
          deliverables: ['UnifiedCache interface', 'Base implementation', 'Unit tests'],
          estimatedHours: 8,
          risks: ['Interface may not cover all existing features']
        },
        {
          phase: 2,
          title: 'Implement Cache Factory',
          description: 'Create factory with ConfigurationManager integration',
          deliverables: ['CacheFactory class', 'Configuration integration', 'Factory tests'],
          estimatedHours: 6,
          risks: ['Configuration migration complexity']
        },
        {
          phase: 3,
          title: 'Migrate Existing Caches',
          description: 'Replace existing cache implementations with factory-created instances',
          deliverables: ['Updated cache usage', 'Migration tests', 'Performance validation'],
          estimatedHours: 12,
          risks: ['Breaking changes in cache behavior']
        }
      ]
    };
  }

  /**
   * Creates Space Weirdos specific caching strategy
   */
  createSpaceWeirdosStrategy(): UnifiedCachingStrategy {
    return {
      approach: 'configuration_standardization',
      description: 'Standardize Space Weirdos cache implementations to use ConfigurationManager and eliminate duplicate CostCache files',
      benefits: [
        'Eliminate duplicate CostCache.ts and CostCache.js files',
        'Consistent configuration management across frontend and backend',
        'Leverage existing ConfigurationManager infrastructure',
        'Maintain current cache behavior while improving maintainability',
        'Environment-specific cache tuning capabilities'
      ],
      implementation: {
        coreInterface: `
// Use existing CostCache interface but with ConfigurationManager
interface CacheConfig {
  maxSize: number;
  ttl: number;
}

// Leverage existing ConfigurationManager.createCacheInstance
const configManager = ConfigurationManager.getInstance();
const cache = configManager.createCacheInstance<T>('item-cost');`,
        factoryMethod: `
// Update frontend hooks to use ConfigurationManager
// Before:
const costCache = new CostCache<RealTimeCostResponse>(
  frontendConfig.cache.costCalculationCacheSize,
  frontendConfig.cache.costCalculationCacheTtl
);

// After:
const configManager = ConfigurationManager.getInstance();
const costCache = configManager.createCacheInstance<RealTimeCostResponse>('cost-calculation');`,
        configurationIntegration: `
// Remove hardcoded cache instantiations in hooks
// Replace with ConfigurationManager factory method
// Maintain existing cache behavior and interfaces`,
        usageExample: `
// Frontend hooks (useCostCalculation.ts, useItemCost.ts)
const configManager = ConfigurationManager.getInstance();
const costCache = configManager.createCacheInstance<RealTimeCostResponse>('cost-calculation');
const itemCache = configManager.createCacheInstance<number>('item-cost');

// Backend services
const validationCache = configManager.createCacheInstance<ValidationResult>('validation-result');`
      },
      migrationPlan: [
        {
          phase: 1,
          title: 'Remove Duplicate CostCache.js File',
          description: 'Delete the JavaScript version and ensure all usage points to TypeScript version',
          deliverables: ['Remove CostCache.js', 'Update any imports', 'Verify no build errors'],
          estimatedHours: 2,
          risks: ['Build system may reference JavaScript version']
        },
        {
          phase: 2,
          title: 'Update Frontend Hooks to Use ConfigurationManager',
          description: 'Replace hardcoded cache instantiations with ConfigurationManager factory',
          deliverables: ['Updated useCostCalculation.ts', 'Updated useItemCost.ts', 'Updated tests'],
          estimatedHours: 4,
          risks: ['Cache behavior changes affecting existing functionality']
        },
        {
          phase: 3,
          title: 'Standardize All Cache Usage',
          description: 'Ensure all cache instantiations use ConfigurationManager consistently',
          deliverables: ['Audit all cache usage', 'Update remaining hardcoded instances', 'Integration tests'],
          estimatedHours: 6,
          risks: ['Missing cache instantiations in analysis']
        }
      ]
    };
  }

  /**
   * Creates configuration standardization strategy
   */
  private createConfigurationStandardizationStrategy(): UnifiedCachingStrategy {
    return {
      approach: 'configuration_standardization',
      description: 'Standardize all cache configurations to use ConfigurationManager while maintaining existing implementations',
      benefits: [
        'Consistent configuration management',
        'Environment-specific cache tuning',
        'Centralized cache parameter control',
        'Easier deployment configuration'
      ],
      implementation: {
        coreInterface: `
// Keep existing cache interfaces, standardize configuration
interface CacheConfig {
  maxSize: number;
  ttl: number;
  evictionPolicy: string;
}`,
        factoryMethod: `
// Use ConfigurationManager for all cache instantiations
const configManager = ConfigurationManager.getInstance();
const cacheConfig = configManager.getCacheConfig();

const costCache = new CostCache(
  cacheConfig.costCalculationCacheSize,
  cacheConfig.costCalculationCacheTtl
);`,
        configurationIntegration: `
// Migrate hardcoded values to ConfigurationManager
// Before: new CostCache(100, 5000)
// After: 
const config = configManager.getCacheConfig();
new CostCache(config.costCalculationCacheSize, config.costCalculationCacheTtl);`,
        usageExample: `
// All caches use centralized configuration
const itemCache = new ItemCostCache(
  configManager.getCacheConfig().itemCostCacheSize,
  configManager.getCacheConfig().itemCostCacheTtl
);`
      },
      migrationPlan: [
        {
          phase: 1,
          title: 'Audit Configuration Usage',
          description: 'Identify all hardcoded cache configurations',
          deliverables: ['Configuration audit report', 'Migration checklist'],
          estimatedHours: 4,
          risks: ['Missing hardcoded configurations']
        },
        {
          phase: 2,
          title: 'Update Cache Instantiations',
          description: 'Replace hardcoded values with ConfigurationManager calls',
          deliverables: ['Updated cache instantiations', 'Configuration tests'],
          estimatedHours: 8,
          risks: ['Configuration key mismatches']
        }
      ]
    };
  }

  /**
   * Creates singleton consolidation strategy
   */
  private createSingletonConsolidationStrategy(): UnifiedCachingStrategy {
    return {
      approach: 'singleton_consolidation',
      description: 'Consolidate similar cache implementations into shared singleton instances',
      benefits: [
        'Reduced memory footprint',
        'Shared cache benefits across components',
        'Simplified cache management',
        'Better cache hit rates'
      ],
      implementation: {
        coreInterface: `
class SharedCacheManager {
  private static instances = new Map<string, UnifiedCache<any>>();
  
  static getCache<T>(purpose: string): UnifiedCache<T> {
    if (!this.instances.has(purpose)) {
      this.instances.set(purpose, this.createCacheForPurpose<T>(purpose));
    }
    return this.instances.get(purpose)!;
  }
}`,
        factoryMethod: `
// Shared cache instances
const costCache = SharedCacheManager.getCache<CostResult>('cost-calculation');
const itemCache = SharedCacheManager.getCache<ItemCost>('item-cost');`,
        configurationIntegration: `
// Configuration-driven cache creation
private static createCacheForPurpose<T>(purpose: string): UnifiedCache<T> {
  const config = ConfigurationManager.getInstance().getCacheConfig();
  return new UnifiedCacheImpl<T>(config.getPurposeConfig(purpose));
}`,
        usageExample: `
// Multiple components share the same cache instance
const cache = SharedCacheManager.getCache<ValidationResult>('validation');
cache.set(key, result);`
      },
      migrationPlan: [
        {
          phase: 1,
          title: 'Create Shared Cache Manager',
          description: 'Implement singleton cache management',
          deliverables: ['SharedCacheManager class', 'Cache lifecycle management'],
          estimatedHours: 6,
          risks: ['Memory leaks from shared instances']
        },
        {
          phase: 2,
          title: 'Migrate to Shared Instances',
          description: 'Replace individual cache instances with shared ones',
          deliverables: ['Updated cache usage', 'Shared instance tests'],
          estimatedHours: 10,
          risks: ['Cache key conflicts between components']
        }
      ]
    };
  }

  /**
   * Creates migration roadmap
   */
  private createMigrationRoadmap(
    inventory: CacheInventory,
    strategy: UnifiedCachingStrategy
  ): MigrationRoadmap {
    
    const phases: MigrationPhase[] = strategy.migrationPlan.map((step, index) => ({
      id: `phase-${index + 1}`,
      name: step.title,
      description: step.description,
      steps: [step],
      estimatedHours: step.estimatedHours,
      prerequisites: index === 0 ? [] : [`phase-${index}`]
    }));

    const totalEstimatedHours = phases.reduce((sum, phase) => sum + phase.estimatedHours, 0);

    const criticalPath = phases.map(phase => phase.id);

    const dependencies: PhaseDependency[] = phases.slice(1).map((phase, index) => ({
      from: `phase-${index + 1}`,
      to: phase.id,
      reason: 'Sequential implementation required'
    }));

    return {
      phases,
      totalEstimatedHours,
      criticalPath,
      dependencies
    };
  }

  /**
   * Creates main consolidation recommendation
   */
  private createMainConsolidationRecommendation(report: CacheStandardizationReport): OptimizationRecommendation {
    const strategy = report.recommendedStrategy;
    
    return {
      id: `cache-consolidation-main-${Date.now()}`,
      title: 'Implement Unified Caching Strategy',
      description: strategy.description,
      type: 'consolidation',
      priority: 'high',
      complexity: {
        level: 'medium',
        factors: [
          `${report.currentState.totalImplementations} cache implementations to consolidate`,
          'Configuration migration required',
          'Multiple usage patterns to preserve'
        ],
        reasoning: 'Consolidating multiple cache implementations requires careful planning but provides significant long-term benefits'
      },
      estimatedEffort: {
        hours: report.migrationRoadmap.totalEstimatedHours,
        complexity: 'medium',
        tasks: strategy.migrationPlan.map(step => step.title)
      },
      benefits: strategy.benefits,
      risks: [
        {
          type: 'breaking_change',
          severity: 'medium',
          description: 'Cache API changes may require code updates',
          mitigation: 'Implement backward-compatible wrappers during transition'
        },
        {
          type: 'performance',
          severity: 'low',
          description: 'Unified implementation may have different performance characteristics',
          mitigation: 'Benchmark performance before and after migration'
        }
      ],
      implementationPlan: this.createImplementationSteps(strategy),
      affectedFiles: this.identifyAffectedFiles(report.currentState)
    };
  }

  /**
   * Creates configuration standardization recommendation
   */
  private createConfigurationStandardizationRecommendation(report: CacheStandardizationReport): OptimizationRecommendation {
    return {
      id: `cache-config-standardization-${Date.now()}`,
      title: 'Standardize Cache Configuration Management',
      description: 'Migrate all cache configurations to use ConfigurationManager for consistency',
      type: 'migration',
      priority: 'medium',
      complexity: {
        level: 'low',
        factors: ['Configuration source migration', 'Environment variable setup'],
        reasoning: 'Straightforward migration of configuration sources'
      },
      estimatedEffort: {
        hours: 8,
        complexity: 'low',
        tasks: ['Audit configurations', 'Update instantiations', 'Add tests']
      },
      benefits: [
        'Consistent configuration management',
        'Environment-specific cache tuning',
        'Centralized parameter control'
      ],
      risks: [
        {
          type: 'compatibility',
          severity: 'low',
          description: 'Configuration key mismatches',
          mitigation: 'Thorough testing of configuration migration'
        }
      ],
      implementationPlan: [
        {
          order: 1,
          title: 'Audit Current Configuration Usage',
          description: 'Identify all hardcoded cache configurations',
          validation: 'Complete list of configuration usage'
        },
        {
          order: 2,
          title: 'Update Cache Instantiations',
          description: 'Replace hardcoded values with ConfigurationManager calls',
          validation: 'All caches use centralized configuration'
        }
      ],
      affectedFiles: this.identifyAffectedFiles(report.currentState)
    };
  }

  /**
   * Creates factory pattern recommendation
   */
  private createFactoryPatternRecommendation(report: CacheStandardizationReport): OptimizationRecommendation {
    return {
      id: `cache-factory-pattern-${Date.now()}`,
      title: 'Implement Cache Factory Pattern',
      description: 'Create a unified cache factory for consistent cache creation and management',
      type: 'refactoring',
      priority: 'high',
      complexity: {
        level: 'medium',
        factors: ['Factory pattern implementation', 'Interface design', 'Migration complexity'],
        reasoning: 'Factory pattern provides long-term benefits but requires careful interface design'
      },
      estimatedEffort: {
        hours: 20,
        complexity: 'medium',
        tasks: ['Design interface', 'Implement factory', 'Migrate usage', 'Add tests']
      },
      benefits: [
        'Centralized cache creation',
        'Consistent behavior across components',
        'Easy addition of new cache types',
        'Simplified testing and mocking'
      ],
      risks: [
        {
          type: 'breaking_change',
          severity: 'medium',
          description: 'Factory pattern changes cache instantiation',
          mitigation: 'Gradual migration with backward compatibility'
        }
      ],
      implementationPlan: [
        {
          order: 1,
          title: 'Design Unified Cache Interface',
          description: 'Create common interface supporting all cache features',
          validation: 'Interface covers all existing functionality'
        },
        {
          order: 2,
          title: 'Implement Cache Factory',
          description: 'Create factory with ConfigurationManager integration',
          validation: 'Factory creates properly configured cache instances'
        },
        {
          order: 3,
          title: 'Migrate Cache Usage',
          description: 'Update all cache instantiations to use factory',
          validation: 'All components use factory-created caches'
        }
      ],
      affectedFiles: this.identifyAffectedFiles(report.currentState)
    };
  }

  /**
   * Creates implementation steps from strategy
   */
  private createImplementationSteps(strategy: UnifiedCachingStrategy): ImplementationStep[] {
    return strategy.migrationPlan.map((step, index) => ({
      order: index + 1,
      title: step.title,
      description: step.description,
      codeExample: index === 1 ? strategy.implementation.factoryMethod : undefined,
      validation: step.deliverables.join(', ')
    }));
  }

  /**
   * Identifies affected files from cache inventory
   */
  private identifyAffectedFiles(inventory: CacheInventory): string[] {
    const files = new Set<string>();
    
    for (const caches of inventory.implementationsByType.values()) {
      for (const cache of caches) {
        files.add(cache.filePath);
        for (const usage of cache.usage) {
          files.add(usage.filePath);
        }
      }
    }
    
    return Array.from(files);
  }
}