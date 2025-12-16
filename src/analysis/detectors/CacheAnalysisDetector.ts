/**
 * Cache Analysis Detector
 * 
 * Analyzes cache implementations across frontend and backend to identify:
 * - Multiple cache implementations with overlapping functionality
 * - Inconsistent cache configurations and settings
 * - Opportunities for cache consolidation and standardization
 */

import type { 
  DuplicationInstance, 
  CodeLocation, 
  ImpactMetrics,
  OptimizationRecommendation 
} from '../interfaces/AnalysisInterfaces';
import type { FileMetadata } from '../parsers/CodeParser';

export interface CacheImplementation {
  filePath: string;
  className: string;
  location: CodeLocation;
  features: CacheFeature[];
  configuration: CacheConfiguration;
  usage: CacheUsage[];
}

export interface CacheFeature {
  name: string;
  type: 'ttl' | 'lru' | 'size_limit' | 'invalidation' | 'persistence' | 'statistics';
  implementation: string;
}

export interface CacheConfiguration {
  maxSize?: number;
  ttl?: number;
  evictionPolicy?: string;
  keyGeneration?: string;
  configurationSource: 'hardcoded' | 'configuration_manager' | 'environment' | 'mixed';
}

export interface CacheUsage {
  filePath: string;
  purpose: string;
  location: CodeLocation;
  instantiation: string;
}

export interface CacheConsolidationOpportunity {
  type: 'duplicate_implementation' | 'overlapping_functionality' | 'inconsistent_configuration';
  caches: CacheImplementation[];
  description: string;
  consolidationStrategy: string;
}

/**
 * Detects and analyzes cache implementations for consolidation opportunities
 */
export class CacheAnalysisDetector {
  private cacheImplementations: CacheImplementation[] = [];
  private consolidationOpportunities: CacheConsolidationOpportunity[] = [];

  /**
   * Analyzes files to detect cache implementations and usage patterns
   */
  async analyzeFiles(files: { filePath: string; content: string; metadata: FileMetadata }[]): Promise<{
    duplications: DuplicationInstance[];
    recommendations: OptimizationRecommendation[];
  }> {
    // Reset state
    this.cacheImplementations = [];
    this.consolidationOpportunities = [];

    // Detect cache implementations
    for (const file of files) {
      await this.detectCacheImplementations(file);
    }

    // Also detect cache usage patterns across all files
    this.detectCacheUsagePatterns(files);

    // Analyze for consolidation opportunities
    this.analyzeConsolidationOpportunities();

    // Generate duplication instances and recommendations
    const duplications = this.generateDuplicationInstances();
    const recommendations = this.generateRecommendations();

    return { duplications, recommendations };
  }

  /**
   * Detects cache implementations in a single file
   */
  private async detectCacheImplementations(file: { filePath: string; content: string; metadata: FileMetadata }): Promise<void> {
    const { filePath, content, metadata } = file;

    // Look for cache class definitions
    for (const classInfo of metadata.classes) {
      if (this.isCacheClass(classInfo.name, content)) {
        const cacheImpl = await this.analyzeCacheClass(filePath, classInfo, content);
        if (cacheImpl) {
          this.cacheImplementations.push(cacheImpl);
        }
      }
    }

    // Look for cache instantiations and usage
    this.detectCacheUsage(filePath, content);
  }

  /**
   * Determines if a class is a cache implementation
   */
  private isCacheClass(className: string, content: string): boolean {
    // Sanitize className to prevent regex injection
    const sanitizedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Skip invalid class names
    if (!className || className.trim().length === 0 || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(className.trim())) {
      return false;
    }

    const cacheIndicators = [
      /class\s+\w*Cache\w*/i,
      /class\s+\w*\s+.*cache.*{/i,
      /implements.*Cache/i,
      /extends.*Cache/i
    ];

    try {
      const classPattern = new RegExp(`class\\s+${sanitizedClassName}`, 'i');
      const classMatch = content.match(classPattern);
      
      if (!classMatch) return false;

      // Check if class name or nearby content suggests caching
      return cacheIndicators.some(pattern => pattern.test(content)) ||
             className.toLowerCase().includes('cache') ||
             this.hasCacheMethodSignatures(content);
    } catch (error) {
      // If regex fails, fall back to simple string matching
      return className.toLowerCase().includes('cache') && 
             content.includes(`class ${className}`) &&
             this.hasCacheMethodSignatures(content);
    }
  }

  /**
   * Checks if content has typical cache method signatures
   */
  private hasCacheMethodSignatures(content: string): boolean {
    const cacheMethodPatterns = [
      /\bget\s*\([^)]*key[^)]*\)/i,
      /\bset\s*\([^)]*key[^)]*,.*value/i,
      /\bdelete\s*\([^)]*key[^)]*\)/i,
      /\bclear\s*\(\s*\)/i,
      /\bhas\s*\([^)]*key[^)]*\)/i,
      /\bevict/i,
      /\bttl\b/i,
      /\bexpir/i
    ];

    return cacheMethodPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Analyzes a cache class implementation
   */
  private async analyzeCacheClass(
    filePath: string, 
    classInfo: any, 
    content: string
  ): Promise<CacheImplementation | null> {
    const features = this.extractCacheFeatures(content);
    const configuration = this.extractCacheConfiguration(content);
    const usage = this.findCacheUsage(filePath, classInfo.name, content);

    const location: CodeLocation = {
      filePath,
      startLine: classInfo.startLine,
      endLine: classInfo.endLine,
      codeBlock: this.extractCodeBlock(content, classInfo.startLine, classInfo.endLine),
      context: `Cache class: ${classInfo.name}`
    };

    return {
      filePath,
      className: classInfo.name,
      location,
      features,
      configuration,
      usage
    };
  }

  /**
   * Extracts cache features from implementation
   */
  private extractCacheFeatures(content: string): CacheFeature[] {
    const features: CacheFeature[] = [];

    // TTL support
    if (/ttl|time.*live|expir|timestamp/i.test(content)) {
      features.push({
        name: 'TTL Support',
        type: 'ttl',
        implementation: this.extractImplementationDetail(content, /ttl|expir|timestamp/i)
      });
    }

    // LRU eviction
    if (/lru|least.*recent|lastAccessed/i.test(content)) {
      features.push({
        name: 'LRU Eviction',
        type: 'lru',
        implementation: this.extractImplementationDetail(content, /lru|least.*recent|lastAccessed/i)
      });
    }

    // Size limits
    if (/maxSize|max.*size|capacity|limit/i.test(content)) {
      features.push({
        name: 'Size Limits',
        type: 'size_limit',
        implementation: this.extractImplementationDetail(content, /maxSize|max.*size|capacity/i)
      });
    }

    // Invalidation
    if (/invalidat|clear|delete|evict/i.test(content)) {
      features.push({
        name: 'Cache Invalidation',
        type: 'invalidation',
        implementation: this.extractImplementationDetail(content, /invalidat|clear|delete/i)
      });
    }

    return features;
  }

  /**
   * Extracts cache configuration details
   */
  private extractCacheConfiguration(content: string): CacheConfiguration {
    const config: CacheConfiguration = {
      configurationSource: 'hardcoded'
    };

    // Check for hardcoded values
    const maxSizeMatch = content.match(/maxSize.*?=.*?(\d+)/i);
    if (maxSizeMatch) {
      config.maxSize = parseInt(maxSizeMatch[1]);
    }

    const ttlMatch = content.match(/ttl.*?=.*?(\d+)/i);
    if (ttlMatch) {
      config.ttl = parseInt(ttlMatch[1]);
    }

    // Check configuration source
    if (/ConfigurationManager|configManager/i.test(content)) {
      config.configurationSource = 'configuration_manager';
    } else if (/process\.env|environment/i.test(content)) {
      config.configurationSource = 'environment';
    } else if (/getFrontendConfigInstance|frontendConfig/i.test(content)) {
      config.configurationSource = 'configuration_manager';
    }

    // Check for mixed sources
    const hasHardcoded = /=\s*\d+/.test(content);
    const hasConfig = /config|Config/.test(content);
    if (hasHardcoded && hasConfig) {
      config.configurationSource = 'mixed';
    }

    return config;
  }

  /**
   * Finds usage of cache classes
   */
  private findCacheUsage(filePath: string, className: string, content: string): CacheUsage[] {
    const usage: CacheUsage[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (line.includes(`new ${className}`) || line.includes(`${className}(`)) {
        usage.push({
          filePath,
          purpose: this.inferCachePurpose(line, content),
          location: {
            filePath,
            startLine: index + 1,
            endLine: index + 1,
            codeBlock: line.trim(),
            context: `Cache instantiation: ${className}`
          },
          instantiation: line.trim()
        });
      }
    });

    return usage;
  }

  /**
   * Detects cache usage patterns across files
   */
  private detectCacheUsage(filePath: string, content: string): void {
    // Look for cache instantiations
    const cachePatterns = [
      /new\s+\w*Cache\w*/g,
      /\w*Cache\w*\s*\(/g,
      /createCacheInstance/g
    ];

    cachePatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        // Find existing cache implementation or create usage record
        this.recordCacheUsage(filePath, match, content);
      }
    });
  }

  /**
   * Records cache usage for analysis
   */
  private recordCacheUsage(filePath: string, match: RegExpMatchArray, content: string): void {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = content.split('\n')[lineNumber - 1];
    
    // Find if this usage belongs to an existing cache implementation
    const existingCache = this.cacheImplementations.find(cache => 
      cache.filePath === filePath || 
      line.includes(cache.className)
    );

    if (existingCache) {
      existingCache.usage.push({
        filePath,
        purpose: this.inferCachePurpose(line, content),
        location: {
          filePath,
          startLine: lineNumber,
          endLine: lineNumber,
          codeBlock: line.trim(),
          context: 'Cache usage'
        },
        instantiation: line.trim()
      });
    }
  }

  /**
   * Detects cache usage patterns across all files
   */
  private detectCacheUsagePatterns(files: { filePath: string; content: string; metadata: FileMetadata }[]): void {
    for (const file of files) {
      this.analyzeFileForCacheUsage(file);
    }
  }

  /**
   * Analyzes a single file for cache usage patterns
   */
  private analyzeFileForCacheUsage(file: { filePath: string; content: string; metadata: FileMetadata }): void {
    const { filePath, content } = file;

    // Look for cache instantiations with hardcoded values
    const hardcodedCachePatterns = [
      /new\s+CostCache\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g,
      /new\s+SimpleCache\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g,
      /new\s+\w*Cache\w*\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g
    ];

    hardcodedCachePatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        this.recordHardcodedCacheUsage(filePath, match, content);
      }
    });

    // Look for ConfigurationManager cache usage
    const configManagerCachePatterns = [
      /configManager\.createCacheInstance/g,
      /ConfigurationManager\.getInstance\(\)\.createCacheInstance/g,
      /getFrontendConfigInstance\(\)\.cache/g
    ];

    configManagerCachePatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        this.recordConfigManagerCacheUsage(filePath, match, content);
      }
    });

    // Look for duplicate cache implementations (CostCache.ts vs CostCache.js)
    if (filePath.includes('CostCache')) {
      this.recordDuplicateCacheFile(filePath, content);
    }
  }

  /**
   * Records hardcoded cache usage for analysis
   */
  private recordHardcodedCacheUsage(filePath: string, match: RegExpMatchArray, content: string): void {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = content.split('\n')[lineNumber - 1];
    
    // Extract cache class name and parameters
    const cacheMatch = line.match(/new\s+(\w*Cache\w*)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (cacheMatch) {
      const [, className, maxSize, ttl] = cacheMatch;
      
      // Find or create cache implementation record
      let cacheImpl = this.cacheImplementations.find(cache => 
        cache.className === className && cache.filePath === filePath
      );

      if (!cacheImpl) {
        cacheImpl = {
          filePath,
          className,
          location: {
            filePath,
            startLine: lineNumber,
            endLine: lineNumber,
            codeBlock: line.trim(),
            context: `Hardcoded cache instantiation: ${className}`
          },
          features: this.inferCacheFeaturesFromUsage(line, content),
          configuration: {
            maxSize: parseInt(maxSize),
            ttl: parseInt(ttl),
            configurationSource: 'hardcoded'
          },
          usage: []
        };
        this.cacheImplementations.push(cacheImpl);
      }

      // Record this usage
      cacheImpl.usage.push({
        filePath,
        purpose: this.inferCachePurpose(line, content),
        location: {
          filePath,
          startLine: lineNumber,
          endLine: lineNumber,
          codeBlock: line.trim(),
          context: 'Hardcoded cache instantiation'
        },
        instantiation: line.trim()
      });
    }
  }

  /**
   * Records ConfigurationManager cache usage for analysis
   */
  private recordConfigManagerCacheUsage(filePath: string, match: RegExpMatchArray, content: string): void {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = content.split('\n')[lineNumber - 1];
    
    // Find or create cache implementation record for ConfigurationManager usage
    let cacheImpl = this.cacheImplementations.find(cache => 
      cache.className === 'ConfigurationManager' && cache.filePath === filePath
    );

    if (!cacheImpl) {
      cacheImpl = {
        filePath,
        className: 'ConfigurationManager',
        location: {
          filePath,
          startLine: lineNumber,
          endLine: lineNumber,
          codeBlock: line.trim(),
          context: 'ConfigurationManager cache usage'
        },
        features: [
          { name: 'Centralized Configuration', type: 'ttl', implementation: 'ConfigurationManager' },
          { name: 'Purpose-based Factory', type: 'size_limit', implementation: 'createCacheInstance' }
        ],
        configuration: {
          configurationSource: 'configuration_manager'
        },
        usage: []
      };
      this.cacheImplementations.push(cacheImpl);
    }

    // Record this usage
    cacheImpl.usage.push({
      filePath,
      purpose: this.inferCachePurpose(line, content),
      location: {
        filePath,
        startLine: lineNumber,
        endLine: lineNumber,
        codeBlock: line.trim(),
        context: 'ConfigurationManager cache usage'
      },
      instantiation: line.trim()
    });
  }

  /**
   * Records duplicate cache file for analysis
   */
  private recordDuplicateCacheFile(filePath: string, content: string): void {
    const isTypeScript = filePath.endsWith('.ts');
    const isJavaScript = filePath.endsWith('.js');
    
    if (isTypeScript || isJavaScript) {
      const className = 'CostCache';
      
      let cacheImpl = this.cacheImplementations.find(cache => 
        cache.className === className && cache.filePath === filePath
      );

      if (!cacheImpl) {
        cacheImpl = {
          filePath,
          className,
          location: {
            filePath,
            startLine: 1,
            endLine: content.split('\n').length,
            codeBlock: content.substring(0, 500) + '...',
            context: `Duplicate cache file: ${className} (${isTypeScript ? 'TypeScript' : 'JavaScript'})`
          },
          features: this.extractCacheFeatures(content),
          configuration: this.extractCacheConfiguration(content),
          usage: []
        };
        this.cacheImplementations.push(cacheImpl);
      }
    }
  }

  /**
   * Infers cache features from usage patterns
   */
  private inferCacheFeaturesFromUsage(line: string, content: string): CacheFeature[] {
    const features: CacheFeature[] = [];

    // Check for TTL usage
    if (/ttl|expir|timeout/i.test(line) || /ttl|expir|timeout/i.test(content)) {
      features.push({
        name: 'TTL Support',
        type: 'ttl',
        implementation: 'Constructor parameter'
      });
    }

    // Check for size limits
    if (/maxSize|size|capacity/i.test(line) || /maxSize|size|capacity/i.test(content)) {
      features.push({
        name: 'Size Limits',
        type: 'size_limit',
        implementation: 'Constructor parameter'
      });
    }

    // Check for LRU if mentioned in context
    if (/lru|least.*recent/i.test(content)) {
      features.push({
        name: 'LRU Eviction',
        type: 'lru',
        implementation: 'Eviction policy'
      });
    }

    return features;
  }

  /**
   * Infers the purpose of cache usage from context
   */
  private inferCachePurpose(line: string, content: string): string {
    if (/cost|Cost/.test(line)) return 'cost_calculation';
    if (/item|Item/.test(line)) return 'item_cost';
    if (/validation|Validation/.test(line)) return 'validation_result';
    if (/api|Api|response|Response/.test(line)) return 'api_response';
    return 'general_purpose';
  }

  /**
   * Analyzes consolidation opportunities
   */
  private analyzeConsolidationOpportunities(): void {
    this.findDuplicateImplementations();
    this.findOverlappingFunctionality();
    this.findInconsistentConfigurations();
  }

  /**
   * Finds duplicate cache implementations
   */
  private findDuplicateImplementations(): void {
    const implementationGroups = new Map<string, CacheImplementation[]>();

    // Group caches by similar feature sets
    for (const cache of this.cacheImplementations) {
      const featureSignature = cache.features
        .map(f => f.type)
        .sort()
        .join(',');
      
      if (!implementationGroups.has(featureSignature)) {
        implementationGroups.set(featureSignature, []);
      }
      implementationGroups.get(featureSignature)!.push(cache);
    }

    // Find groups with multiple implementations
    for (const [signature, caches] of implementationGroups) {
      if (caches.length > 1) {
        this.consolidationOpportunities.push({
          type: 'duplicate_implementation',
          caches,
          description: `Multiple cache implementations with similar features: ${signature}`,
          consolidationStrategy: 'Create a unified cache implementation with configurable features'
        });
      }
    }
  }

  /**
   * Finds overlapping functionality between different caches
   */
  private findOverlappingFunctionality(): void {
    const purposeGroups = new Map<string, CacheImplementation[]>();

    // Group by usage purpose
    for (const cache of this.cacheImplementations) {
      for (const usage of cache.usage) {
        if (!purposeGroups.has(usage.purpose)) {
          purposeGroups.set(usage.purpose, []);
        }
        if (!purposeGroups.get(usage.purpose)!.includes(cache)) {
          purposeGroups.get(usage.purpose)!.push(cache);
        }
      }
    }

    // Find purposes served by multiple caches
    for (const [purpose, caches] of purposeGroups) {
      if (caches.length > 1) {
        this.consolidationOpportunities.push({
          type: 'overlapping_functionality',
          caches,
          description: `Multiple caches serving the same purpose: ${purpose}`,
          consolidationStrategy: 'Use a single cache instance with purpose-specific configuration'
        });
      }
    }

    // Also check for caches with similar class names (indicating similar purposes)
    const nameGroups = new Map<string, CacheImplementation[]>();
    for (const cache of this.cacheImplementations) {
      // Extract base name (remove "Cache" suffix and common prefixes)
      const baseName = cache.className.replace(/Cache$/, '').replace(/^(Item|Cost|Simple|Validation|Api)/, '');
      if (baseName.length > 0) {
        if (!nameGroups.has(baseName)) {
          nameGroups.set(baseName, []);
        }
        nameGroups.get(baseName)!.push(cache);
      }
    }

    // Find name groups with multiple implementations
    for (const [baseName, caches] of nameGroups) {
      if (caches.length > 1) {
        this.consolidationOpportunities.push({
          type: 'overlapping_functionality',
          caches,
          description: `Multiple cache implementations with similar names suggesting overlapping functionality: ${baseName}`,
          consolidationStrategy: 'Consolidate similar cache implementations into a unified solution'
        });
      }
    }
  }

  /**
   * Finds inconsistent cache configurations
   */
  private findInconsistentConfigurations(): void {
    const configGroups = new Map<string, CacheImplementation[]>();

    // Group by configuration source
    for (const cache of this.cacheImplementations) {
      const source = cache.configuration.configurationSource;
      if (!configGroups.has(source)) {
        configGroups.set(source, []);
      }
      configGroups.get(source)!.push(cache);
    }

    // Check for mixed configuration sources
    if (configGroups.size > 1) {
      const allCaches = Array.from(configGroups.values()).flat();
      this.consolidationOpportunities.push({
        type: 'inconsistent_configuration',
        caches: allCaches,
        description: 'Inconsistent cache configuration sources across implementations',
        consolidationStrategy: 'Standardize all cache configurations to use ConfigurationManager'
      });
    }

    // Check for hardcoded configurations that should use ConfigurationManager
    const hardcodedCaches = configGroups.get('hardcoded') || [];
    if (hardcodedCaches.length > 0) {
      this.consolidationOpportunities.push({
        type: 'inconsistent_configuration',
        caches: hardcodedCaches,
        description: 'Cache implementations using hardcoded configuration values',
        consolidationStrategy: 'Migrate hardcoded values to ConfigurationManager for consistency'
      });
    }
  }

  /**
   * Generates duplication instances from consolidation opportunities
   */
  private generateDuplicationInstances(): DuplicationInstance[] {
    const duplications: DuplicationInstance[] = [];

    for (const opportunity of this.consolidationOpportunities) {
      const locations = opportunity.caches.map(cache => cache.location);
      
      const impact: ImpactMetrics = {
        linesOfCode: locations.reduce((sum, loc) => sum + (loc.endLine - loc.startLine + 1), 0),
        complexity: opportunity.caches.length * 2, // Multiple implementations increase complexity
        maintainabilityIndex: Math.max(0, 100 - (opportunity.caches.length * 10)),
        testCoverage: 0 // Will be calculated separately
      };

      duplications.push({
        id: `cache-${opportunity.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'pattern',
        similarity: this.calculateSimilarity(opportunity.caches),
        locations,
        description: opportunity.description,
        impact
      });
    }

    return duplications;
  }

  /**
   * Generates optimization recommendations
   */
  private generateRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    for (const opportunity of this.consolidationOpportunities) {
      const recommendation = this.createRecommendation(opportunity);
      recommendations.push(recommendation);
    }

    return recommendations;
  }

  /**
   * Creates a recommendation from a consolidation opportunity
   */
  private createRecommendation(opportunity: CacheConsolidationOpportunity): OptimizationRecommendation {
    const affectedFiles = [...new Set(opportunity.caches.map(cache => cache.filePath))];
    
    return {
      id: `cache-rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `Consolidate Cache Implementations: ${opportunity.type.replace(/_/g, ' ')}`,
      description: opportunity.description,
      type: 'consolidation',
      priority: this.determinePriority(opportunity),
      complexity: this.assessComplexity(opportunity),
      estimatedEffort: this.estimateEffort(opportunity),
      benefits: this.identifyBenefits(opportunity),
      risks: this.identifyRisks(opportunity),
      implementationPlan: this.createImplementationPlan(opportunity),
      affectedFiles
    };
  }

  /**
   * Determines recommendation priority
   */
  private determinePriority(opportunity: CacheConsolidationOpportunity): 'low' | 'medium' | 'high' | 'critical' {
    if (opportunity.caches.length >= 3) return 'high';
    if (opportunity.type === 'inconsistent_configuration') return 'medium';
    return 'low';
  }

  /**
   * Assesses implementation complexity
   */
  private assessComplexity(opportunity: CacheConsolidationOpportunity): any {
    const level = opportunity.caches.length > 2 ? 'medium' : 'low';
    return {
      level,
      factors: [
        `${opportunity.caches.length} cache implementations to consolidate`,
        'Configuration migration required',
        'Usage pattern analysis needed'
      ],
      reasoning: `Consolidating ${opportunity.caches.length} cache implementations requires careful analysis of usage patterns and configuration migration.`
    };
  }

  /**
   * Estimates implementation effort
   */
  private estimateEffort(opportunity: CacheConsolidationOpportunity): any {
    return {
      hours: opportunity.caches.length * 4, // 4 hours per cache to consolidate
      complexity: opportunity.caches.length > 2 ? 'medium' : 'low',
      tasks: [
        'Analyze existing cache implementations',
        'Design unified cache interface',
        'Migrate configuration to ConfigurationManager',
        'Update usage sites',
        'Add comprehensive tests'
      ]
    };
  }

  /**
   * Identifies benefits of consolidation
   */
  private identifyBenefits(opportunity: CacheConsolidationOpportunity): string[] {
    return [
      'Reduced code duplication and maintenance overhead',
      'Consistent cache behavior across the application',
      'Centralized configuration management',
      'Improved testability and debugging',
      'Better performance monitoring and metrics'
    ];
  }

  /**
   * Identifies risks of consolidation
   */
  private identifyRisks(opportunity: CacheConsolidationOpportunity): any[] {
    return [
      {
        type: 'breaking_change',
        severity: 'medium',
        description: 'Cache API changes may require updates to existing code',
        mitigation: 'Implement backward-compatible wrapper during transition'
      },
      {
        type: 'performance',
        severity: 'low',
        description: 'Unified cache may have different performance characteristics',
        mitigation: 'Benchmark before and after consolidation'
      }
    ];
  }

  /**
   * Creates implementation plan
   */
  private createImplementationPlan(opportunity: CacheConsolidationOpportunity): any[] {
    return [
      {
        order: 1,
        title: 'Analyze Existing Cache Implementations',
        description: 'Document current cache features, configurations, and usage patterns',
        validation: 'Complete feature matrix and usage analysis'
      },
      {
        order: 2,
        title: 'Design Unified Cache Interface',
        description: 'Create a consolidated cache interface that supports all required features',
        codeExample: `
interface UnifiedCache<T> {
  get(key: string): T | null;
  set(key: string, value: T, options?: CacheOptions): void;
  delete(key: string): boolean;
  clear(): void;
  invalidate(predicate: (key: string) => boolean): void;
}`,
        validation: 'Interface supports all existing cache features'
      },
      {
        order: 3,
        title: 'Migrate Configuration to ConfigurationManager',
        description: 'Update all cache configurations to use centralized configuration management',
        validation: 'All cache instances use ConfigurationManager for settings'
      },
      {
        order: 4,
        title: 'Update Usage Sites',
        description: 'Replace existing cache instantiations with unified cache factory',
        validation: 'All cache usage updated and tests passing'
      }
    ];
  }

  /**
   * Calculates similarity between cache implementations
   */
  private calculateSimilarity(caches: CacheImplementation[]): number {
    if (caches.length < 2) return 0;

    // Calculate feature overlap
    const allFeatures = new Set<string>();
    const featureCounts = new Map<string, number>();

    for (const cache of caches) {
      for (const feature of cache.features) {
        allFeatures.add(feature.type);
        featureCounts.set(feature.type, (featureCounts.get(feature.type) || 0) + 1);
      }
    }

    // Calculate similarity as percentage of shared features
    const sharedFeatures = Array.from(featureCounts.values()).filter(count => count > 1).length;
    return (sharedFeatures / allFeatures.size) * 100;
  }

  /**
   * Extracts implementation detail for a feature
   */
  private extractImplementationDetail(content: string, pattern: RegExp): string {
    const match = content.match(pattern);
    if (!match) return 'Not specified';

    // Extract surrounding context
    const lines = content.split('\n');
    const matchLine = lines.find(line => pattern.test(line));
    return matchLine?.trim() || 'Implementation found';
  }

  /**
   * Extracts code block between line numbers
   */
  private extractCodeBlock(content: string, startLine: number, endLine: number): string {
    const lines = content.split('\n');
    return lines.slice(startLine - 1, endLine).join('\n');
  }
}