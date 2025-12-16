/**
 * Property-Based Tests for Cache Consolidation Analysis
 * 
 * **Feature: code-duplication-optimization, Property 3: Cache Implementation Consolidation**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { CacheAnalysisDetector } from '../src/analysis/detectors/CacheAnalysisDetector';
import { CacheConsolidationAnalyzer } from '../src/analysis/analyzers/CacheConsolidationAnalyzer';
import type { 
  CacheImplementation, 
  CacheFeature, 
  CacheConfiguration 
} from '../src/analysis/detectors/CacheAnalysisDetector';
import type { FileMetadata } from '../src/analysis/parsers/CodeParser';

describe('Cache Consolidation Analysis Properties', () => {
  let detector: CacheAnalysisDetector;
  let analyzer: CacheConsolidationAnalyzer;

  beforeEach(() => {
    detector = new CacheAnalysisDetector();
    analyzer = new CacheConsolidationAnalyzer();
  });

  /**
   * Property 3: Cache Implementation Consolidation
   * 
   * For any codebase with multiple caching mechanisms, the analysis should identify 
   * all cache implementations, detect overlapping functionality, and suggest unified 
   * caching strategies
   */
  it('should identify all cache implementations and detect consolidation opportunities', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate multiple cache implementations with varying characteristics
        fc.array(
          fc.record({
            className: fc.oneof(
              fc.constant('CostCache'),
              fc.constant('ItemCostCache'),
              fc.constant('SimpleCache'),
              fc.constant('ValidationCache'),
              fc.constant('ApiResponseCache')
            ),
            features: fc.array(
              fc.oneof(
                fc.constant('ttl'),
                fc.constant('lru'),
                fc.constant('size_limit'),
                fc.constant('invalidation')
              ),
              { minLength: 1, maxLength: 4 }
            ),
            configSource: fc.oneof(
              fc.constant('hardcoded'),
              fc.constant('configuration_manager'),
              fc.constant('environment'),
              fc.constant('mixed')
            ),
            maxSize: fc.integer({ min: 50, max: 500 }),
            ttl: fc.integer({ min: 1000, max: 60000 }),
            usagePurpose: fc.oneof(
              fc.constant('cost_calculation'),
              fc.constant('item_cost'),
              fc.constant('validation_result'),
              fc.constant('api_response')
            )
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (cacheSpecs) => {
          // Generate file content and metadata for each cache
          const files = cacheSpecs.map((spec, index) => {
            const content = generateCacheImplementationCode(spec);
            const metadata = generateCacheMetadata(spec, index);
            
            return {
              filePath: `src/cache/${spec.className}.ts`,
              content,
              metadata
            };
          });

          // Analyze cache implementations
          const { duplications, recommendations } = await detector.analyzeFiles(files);

          // Verify cache detection completeness
          expect(duplications).toBeDefined();
          expect(recommendations).toBeDefined();

          // Property: All cache implementations should be detected
          const detectedCacheCount = duplications.filter(d => 
            d.type === 'pattern' && d.description.includes('cache')
          ).length;
          
          // Should detect consolidation opportunities when multiple similar caches exist
          const similarCaches = groupCachesByFeatures(cacheSpecs);
          const expectedOpportunities = Object.values(similarCaches).filter(group => group.length > 1).length;
          
          if (expectedOpportunities > 0) {
            expect(detectedCacheCount).toBeGreaterThan(0);
          }

          // Property: Overlapping functionality should be identified
          const overlappingPurposes = groupCachesByPurpose(cacheSpecs);
          const hasOverlappingPurposes = Object.values(overlappingPurposes).some(group => group.length > 1);
          
          if (hasOverlappingPurposes) {
            // Check if overlapping functionality was detected in duplications OR recommendations
            const overlappingDuplications = duplications.filter(d => 
              d.description.includes('overlapping') || 
              d.description.includes('same purpose') ||
              d.description.includes('similar names') ||
              d.description.includes('Multiple caches')
            );
            const overlappingRecommendations = recommendations.filter(r =>
              r.description.includes('overlapping') ||
              r.description.includes('consolidat') ||
              r.title.includes('Consolidate')
            );
            
            // Should detect overlapping functionality in either duplications or recommendations
            expect(overlappingDuplications.length + overlappingRecommendations.length).toBeGreaterThan(0);
          }

          // Property: Inconsistent configurations should be flagged
          const configSources = new Set(cacheSpecs.map(spec => spec.configSource));
          if (configSources.size > 1) {
            const configInconsistencies = duplications.filter(d => 
              d.description.includes('inconsistent') || d.description.includes('configuration')
            );
            expect(configInconsistencies.length).toBeGreaterThan(0);
          }

          // Property: Recommendations should provide actionable consolidation strategies
          for (const recommendation of recommendations) {
            expect(recommendation.title).toBeDefined();
            expect(recommendation.description).toBeDefined();
            expect(recommendation.type).toMatch(/consolidation|migration|refactoring/);
            expect(recommendation.implementationPlan).toBeDefined();
            expect(recommendation.implementationPlan.length).toBeGreaterThan(0);
            
            // Each implementation step should be actionable
            for (const step of recommendation.implementationPlan) {
              expect(step.title).toBeDefined();
              expect(step.description).toBeDefined();
              expect(step.validation).toBeDefined();
            }
          }

          // Property: Similarity scores should reflect actual feature overlap
          for (const duplication of duplications) {
            expect(duplication.similarity).toBeGreaterThanOrEqual(0);
            expect(duplication.similarity).toBeLessThanOrEqual(100);
            
            // High similarity should correspond to many shared features
            if (duplication.similarity > 80) {
              expect(duplication.locations.length).toBeGreaterThanOrEqual(2);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Unified caching strategy recommendations should be appropriate for the context
   */
  it('should generate appropriate unified caching strategies based on cache inventory', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            className: fc.oneof(
              fc.constant('CostCache'),
              fc.constant('ItemCache'),
              fc.constant('ValidationCache'),
              fc.constant('ApiCache'),
              fc.constant('SimpleCache'),
              fc.constant('MemoryCache')
            ),
            features: fc.array(
              fc.oneof(
                fc.constant('ttl'),
                fc.constant('lru'),
                fc.constant('size_limit'),
                fc.constant('invalidation')
              ),
              { minLength: 1, maxLength: 4 }
            ),
            configSource: fc.oneof(
              fc.constant('hardcoded'),
              fc.constant('configuration_manager'),
              fc.constant('environment')
            ),
            usagePurpose: fc.oneof(
              fc.constant('cost_calculation'),
              fc.constant('item_cost'),
              fc.constant('validation_result'),
              fc.constant('api_response'),
              fc.constant('general_purpose')
            )
          }),
          { minLength: 1, maxLength: 6 }
        ),
        async (cacheSpecs) => {
          // Create mock cache implementations
          const cacheImplementations: CacheImplementation[] = cacheSpecs.map((spec, index) => ({
            filePath: `src/cache/${spec.className}.ts`,
            className: spec.className,
            location: {
              filePath: `src/cache/${spec.className}.ts`,
              startLine: 1,
              endLine: 50,
              codeBlock: `class ${spec.className} { }`,
              context: `Cache class: ${spec.className}`
            },
            features: spec.features.map(featureType => ({
              name: featureType,
              type: featureType as any,
              implementation: `${featureType} implementation`
            })),
            configuration: {
              configurationSource: spec.configSource as any,
              maxSize: 100,
              ttl: 5000
            },
            usage: [{
              filePath: `src/usage/usage${index}.ts`,
              purpose: spec.usagePurpose,
              location: {
                filePath: `src/usage/usage${index}.ts`,
                startLine: 10,
                endLine: 10,
                codeBlock: `new ${spec.className}()`,
                context: 'Cache usage'
              },
              instantiation: `new ${spec.className}()`
            }]
          }));

          // Analyze consolidation strategy
          const report = await analyzer.analyzeConsolidationStrategy(cacheImplementations, []);

          // Property: Strategy should match the complexity of the cache landscape
          expect(report.recommendedStrategy).toBeDefined();
          expect(report.recommendedStrategy.approach).toMatch(/factory_pattern|singleton_consolidation|configuration_standardization/);

          // Property: Factory pattern should be recommended for complex scenarios
          if (cacheImplementations.length >= 3) {
            const configSources = new Set(cacheImplementations.map(c => c.configuration.configurationSource));
            if (configSources.size > 1) {
              expect(report.recommendedStrategy.approach).toBe('factory_pattern');
            }
          }

          // Property: Configuration standardization should be recommended for hardcoded configs
          const hasHardcodedConfig = cacheImplementations.some(c => 
            c.configuration.configurationSource === 'hardcoded'
          );
          if (hasHardcodedConfig && cacheImplementations.length <= 2) {
            expect(report.recommendedStrategy.approach).toBe('configuration_standardization');
          }

          // Property: Migration roadmap should be comprehensive
          expect(report.migrationRoadmap).toBeDefined();
          expect(report.migrationRoadmap.phases.length).toBeGreaterThan(0);
          expect(report.migrationRoadmap.totalEstimatedHours).toBeGreaterThan(0);

          // Property: Each migration phase should have clear deliverables
          for (const phase of report.migrationRoadmap.phases) {
            expect(phase.name).toBeDefined();
            expect(phase.description).toBeDefined();
            expect(phase.estimatedHours).toBeGreaterThan(0);
            expect(phase.steps.length).toBeGreaterThan(0);
          }

          // Property: Recommendations should be actionable
          const recommendations = analyzer.generateConsolidationRecommendations(report);
          expect(recommendations.length).toBeGreaterThan(0);

          for (const recommendation of recommendations) {
            expect(recommendation.implementationPlan.length).toBeGreaterThan(0);
            expect(recommendation.benefits.length).toBeGreaterThan(0);
            expect(recommendation.estimatedEffort).toBeDefined();
            expect(recommendation.estimatedEffort.hours).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Cache analysis should handle edge cases gracefully
   */
  it('should handle edge cases in cache analysis gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Empty cache list
          fc.constant([]),
          // Single cache
          fc.array(
            fc.record({
              className: fc.constant('SingleCache'),
              features: fc.array(
                fc.oneof(
                  fc.constant('ttl'),
                  fc.constant('lru'),
                  fc.constant('size_limit')
                ), 
                { minLength: 1, maxLength: 3 }
              ),
              configSource: fc.constant('hardcoded'),
              usagePurpose: fc.constant('general_purpose')
            }),
            { minLength: 1, maxLength: 1 }
          ),
          // Many caches with identical features
          fc.array(
            fc.constant({
              className: 'IdenticalCache',
              features: ['ttl', 'lru'],
              configSource: 'hardcoded',
              usagePurpose: 'general_purpose'
            }),
            { minLength: 3, maxLength: 8 }
          )
        ),
        async (cacheSpecs) => {
          const files = cacheSpecs.map((spec, index) => ({
            filePath: `src/cache/Cache${index}.ts`,
            content: generateCacheImplementationCode(spec),
            metadata: generateCacheMetadata(spec, index)
          }));

          // Analysis should not throw errors
          const { duplications, recommendations } = await detector.analyzeFiles(files);

          // Property: Analysis should always return valid results
          expect(duplications).toBeDefined();
          expect(Array.isArray(duplications)).toBe(true);
          expect(recommendations).toBeDefined();
          expect(Array.isArray(recommendations)).toBe(true);

          // Property: Empty input should produce empty results
          if (cacheSpecs.length === 0) {
            expect(duplications.length).toBe(0);
            expect(recommendations.length).toBe(0);
          }

          // Property: Single cache should not produce consolidation opportunities
          if (cacheSpecs.length === 1) {
            const consolidationDuplications = duplications.filter(d => 
              d.description.includes('consolidation') || d.description.includes('multiple')
            );
            expect(consolidationDuplications.length).toBe(0);
          }

          // Property: Identical caches should be detected as duplicates
          if (cacheSpecs.length > 2 && cacheSpecs.every(spec => 
            spec.className === cacheSpecs[0].className && 
            JSON.stringify(spec.features) === JSON.stringify(cacheSpecs[0].features)
          )) {
            expect(duplications.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});

// Helper functions for test data generation

function generateCacheImplementationCode(spec: any): string {
  const features = spec.features || [];
  const hasTTL = features.includes('ttl');
  const hasLRU = features.includes('lru');
  const hasSizeLimit = features.includes('size_limit');
  const hasInvalidation = features.includes('invalidation');

  return `
/**
 * ${spec.className} - Cache implementation
 */
export class ${spec.className}<T> {
  private cache = new Map<string, any>();
  ${hasSizeLimit ? `private readonly maxSize = ${spec.maxSize || 100};` : ''}
  ${hasLRU ? 'private accessOrder = new Map<string, number>();' : ''}
  ${hasTTL ? `private readonly ttl = ${spec.ttl || 5000};` : ''}

  get(key: string): T | null {
    const entry = this.cache.get(key);
    ${hasLRU ? 'this.accessOrder.set(key, Date.now());' : ''}
    ${hasTTL ? `
    if (entry && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }` : ''}
    return entry ? entry.value : null;
  }

  set(key: string, value: T): void {
    ${hasSizeLimit ? `
    if (this.cache.size >= this.maxSize) {
      ${hasLRU ? 'this.evictLRU();' : 'this.cache.delete(this.cache.keys().next().value);'}
    }` : ''}
    
    this.cache.set(key, {
      value,
      ${hasTTL ? 'timestamp: Date.now()' : ''}
    });
    ${hasLRU ? 'this.accessOrder.set(key, Date.now());' : ''}
  }

  ${hasInvalidation ? `
  invalidate(predicate: (key: string) => boolean): void {
    for (const key of this.cache.keys()) {
      if (predicate(key)) {
        this.cache.delete(key);
      }
    }
  }` : ''}

  clear(): void {
    this.cache.clear();
    ${hasLRU ? 'this.accessOrder.clear();' : ''}
  }

  ${hasLRU ? `
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Infinity;
    for (const [key, time] of this.accessOrder) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }` : ''}
}`;
}

function generateCacheMetadata(spec: any, index: number): FileMetadata {
  return {
    filePath: `src/cache/${spec.className}.ts`,
    imports: [],
    exports: [{ name: spec.className, type: 'class', isDefault: false }],
    classes: [{
      name: spec.className,
      startLine: 4,
      endLine: 50,
      methods: [
        { name: 'get', startLine: 10, endLine: 15, parameters: ['key'], returnType: 'T | null', complexity: 2 },
        { name: 'set', startLine: 17, endLine: 25, parameters: ['key', 'value'], returnType: 'void', complexity: 3 },
        { name: 'clear', startLine: 40, endLine: 45, parameters: [], returnType: 'void', complexity: 1 }
      ],
      properties: [
        { name: 'cache', type: 'Map<string, any>', isStatic: false, isPrivate: true }
      ]
    }],
    functions: [],
    variables: []
  };
}

function groupCachesByFeatures(cacheSpecs: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  
  for (const spec of cacheSpecs) {
    const featureSignature = spec.features.sort().join(',');
    if (!groups[featureSignature]) {
      groups[featureSignature] = [];
    }
    groups[featureSignature].push(spec);
  }
  
  return groups;
}

function groupCachesByPurpose(cacheSpecs: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  
  for (const spec of cacheSpecs) {
    const purpose = spec.usagePurpose;
    if (!groups[purpose]) {
      groups[purpose] = [];
    }
    groups[purpose].push(spec);
  }
  
  return groups;
}