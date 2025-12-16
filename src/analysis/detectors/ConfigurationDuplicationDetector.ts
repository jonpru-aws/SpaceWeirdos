/**
 * ConfigurationDuplicationDetector - Identifies hardcoded values and configuration issues
 * Detects values that should use ConfigurationManager and inconsistent configuration patterns
 * Enhanced to detect missing validation patterns and provide migration recommendations
 */

import { IDuplicationDetector } from '../interfaces/AnalysisInterfaces.js';
import { DuplicationInstance, CodeLocation, ImpactMetrics } from '../types/DuplicationModels.js';
import { ParsedFile } from '../parsers/CodeParser.js';
import { v4 as uuidv4 } from 'uuid';

export interface ConfigurationDuplicationConfig {
  minOccurrences: number;
  detectHardcodedNumbers: boolean;
  detectHardcodedStrings: boolean;
  detectEnvironmentVariables: boolean;
  detectConfigurationPatterns: boolean;
  excludeCommonValues: boolean;
  detectValidationPatterns: boolean;
  detectConflictingDefinitions: boolean;
  analyzeConfigurationMigration: boolean;
}

export interface HardcodedValue {
  value: string;
  type: 'number' | 'string' | 'boolean' | 'url' | 'path' | 'env_var';
  occurrences: CodeLocation[];
  category: ConfigurationCategory;
  shouldUseConfigManager: boolean;
  migrationStrategy?: string;
  validationPattern?: string;
}

export interface ConfigurationConflict {
  configKey: string;
  conflictingValues: Array<{
    value: string;
    location: CodeLocation;
    source: 'hardcoded' | 'env_var' | 'config_file' | 'configuration_manager';
  }>;
  severity: 'low' | 'medium' | 'high';
  resolution: string;
}

export interface ValidationPatternAnalysis {
  missingPatterns: Array<{
    configKey: string;
    location: CodeLocation;
    suggestedValidation: string;
  }>;
  inconsistentPatterns: Array<{
    configKey: string;
    locations: CodeLocation[];
    patterns: string[];
    recommendedPattern: string;
  }>;
}

export enum ConfigurationCategory {
  COST_LIMITS = 'cost_limits',
  VALIDATION_THRESHOLDS = 'validation_thresholds',
  API_ENDPOINTS = 'api_endpoints',
  FILE_PATHS = 'file_paths',
  CACHE_SETTINGS = 'cache_settings',
  UI_CONSTANTS = 'ui_constants',
  ERROR_MESSAGES = 'error_messages',
  BUSINESS_RULES = 'business_rules',
  PERFORMANCE_SETTINGS = 'performance_settings',
  SERVER_CONFIGURATION = 'server_configuration',
  ENVIRONMENT_SETTINGS = 'environment_settings',
  UNKNOWN = 'unknown'
}

export class ConfigurationDuplicationDetector implements IDuplicationDetector {
  private config: ConfigurationDuplicationConfig;
  private commonValues = new Set([
    '0', '1', '2', '3', '4', '5', '10', '100', '1000',
    'true', 'false', 'null', 'undefined',
    '', ' ', '\n', '\t'
  ]);

  constructor(config?: Partial<ConfigurationDuplicationConfig>) {
    this.config = {
      minOccurrences: 2,
      detectHardcodedNumbers: true,
      detectHardcodedStrings: true,
      detectEnvironmentVariables: true,
      detectConfigurationPatterns: true,
      excludeCommonValues: true,
      detectValidationPatterns: true,
      detectConflictingDefinitions: true,
      analyzeConfigurationMigration: true,
      ...config
    };
  }

  getDetectorType(): 'exact' | 'functional' | 'pattern' | 'configuration' {
    return 'configuration';
  }

  async detectDuplications(files: ParsedFile[]): Promise<DuplicationInstance[]> {
    const duplications: DuplicationInstance[] = [];
    const hardcodedValues: Map<string, HardcodedValue> = new Map();

    // Analyze each file for hardcoded values
    for (const file of files) {
      this.analyzeFileForHardcodedValues(file, hardcodedValues);
    }

    // Convert hardcoded values to duplications
    for (const [value, hardcodedValue] of hardcodedValues.entries()) {
      if (hardcodedValue.occurrences.length >= this.config.minOccurrences) {
        // Add migration strategy for ConfigurationManager candidates
        if (hardcodedValue.shouldUseConfigManager) {
          hardcodedValue.migrationStrategy = this.generateMigrationStrategy(hardcodedValue);
        }
        
        const duplication = this.createConfigurationDuplication(hardcodedValue);
        duplications.push(duplication);
      }
    }

    // Only add other types of duplications if specifically configured and we have hardcoded duplications
    const hasHardcodedDuplications = duplications.length > 0;

    // Detect configuration access pattern inconsistencies
    if (this.config.detectConfigurationPatterns && hasHardcodedDuplications) {
      const patternDuplications = this.detectConfigurationPatternInconsistencies(files);
      duplications.push(...patternDuplications);
    }

    // Detect conflicting configuration definitions
    if (this.config.detectConflictingDefinitions && hasHardcodedDuplications) {
      const conflictDuplications = this.detectConflictingConfigurationDefinitions(files);
      duplications.push(...conflictDuplications);
    }

    // Detect missing validation patterns
    if (this.config.detectValidationPatterns && hasHardcodedDuplications) {
      const validationDuplications = this.detectMissingValidationPatterns(files, hardcodedValues);
      duplications.push(...validationDuplications);
    }

    return duplications.sort((a, b) => b.impact.complexity - a.impact.complexity);
  }

  private analyzeFileForHardcodedValues(file: ParsedFile, hardcodedValues: Map<string, HardcodedValue>): void {
    const content = file.content;
    const lines = content.split('\n');

    // Skip test files and configuration files themselves
    if (this.shouldSkipFile(file.filePath)) {
      return;
    }

    // Detect hardcoded numbers
    if (this.config.detectHardcodedNumbers) {
      this.detectHardcodedNumbers(file, lines, hardcodedValues);
    }

    // Detect hardcoded strings
    if (this.config.detectHardcodedStrings) {
      this.detectHardcodedStrings(file, lines, hardcodedValues);
    }

    // Detect environment variables
    if (this.config.detectEnvironmentVariables) {
      this.detectEnvironmentVariables(file, lines, hardcodedValues);
    }
  }

  private shouldSkipFile(filePath: string): boolean {
    const skipPatterns = [
      /\.test\./,
      /\.spec\./,
      /config\//,
      /configuration/i,
      /constants\//,
      /node_modules/,
      /\.d\.ts$/,
      /package\.json$/,
      /tsconfig/
    ];

    return skipPatterns.some(pattern => pattern.test(filePath));
  }

  private detectHardcodedNumbers(
    file: ParsedFile,
    lines: string[],
    hardcodedValues: Map<string, HardcodedValue>
  ): void {
    // Patterns for detecting hardcoded numbers that might be configuration
    const numberPatterns = [
      // Point limits, costs, thresholds
      /(?:limit|max|min|threshold|cost|price|points?)\s*[=:]\s*(\d+)/gi,
      // Array/object access with numbers that might be limits
      /\[\s*(\d{2,})\s*\]/g,
      // Comparison with numbers
      /[<>=!]+\s*(\d{2,})/g,
      // Function calls with number parameters
      /\w+\(\s*(\d{2,})\s*[,)]/g,
      // Property assignments
      /\.\w+\s*=\s*(\d+)/g
    ];

    lines.forEach((line, lineIndex) => {
      numberPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const value = match[1];
          
          if (this.shouldAnalyzeValue(value)) {
            const category = this.categorizeNumericValue(value, line);
            const shouldUseConfigManager = this.shouldUseConfigurationManager(category);
            
            this.addHardcodedValue(hardcodedValues, value, 'number', {
              filePath: file.filePath,
              startLine: lineIndex + 1,
              endLine: lineIndex + 1,
              codeBlock: line.trim(),
              context: this.extractContext(lines, lineIndex)
            }, category, shouldUseConfigManager);
          }
        }
      });
    });
  }

  private detectHardcodedStrings(
    file: ParsedFile,
    lines: string[],
    hardcodedValues: Map<string, HardcodedValue>
  ): void {
    // Patterns for detecting hardcoded strings that might be configuration
    const stringPatterns = [
      // Error messages
      /(["'])(.*?error.*?|.*?invalid.*?|.*?failed.*?)\1/gi,
      // URLs and endpoints
      /(["'])(https?:\/\/[^"']+|\/api\/[^"']+)\1/gi,
      // File paths
      /(["'])([./][\w/.-]+\.(json|js|ts|css|html))\1/gi,
      // Environment variable names
      /process\.env\.(\w+)/g,
      // Common configuration strings
      /(["'])(localhost|development|production|test|staging)\1/gi
    ];

    lines.forEach((line, lineIndex) => {
      stringPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const value = match[2] || match[1];
          
          if (this.shouldAnalyzeValue(value)) {
            const category = this.categorizeStringValue(value, line);
            const shouldUseConfigManager = this.shouldUseConfigurationManager(category);
            
            this.addHardcodedValue(hardcodedValues, value, 'string', {
              filePath: file.filePath,
              startLine: lineIndex + 1,
              endLine: lineIndex + 1,
              codeBlock: line.trim(),
              context: this.extractContext(lines, lineIndex)
            }, category, shouldUseConfigManager);
          }
        }
      });
    });
  }

  private detectEnvironmentVariables(
    file: ParsedFile,
    lines: string[],
    hardcodedValues: Map<string, HardcodedValue>
  ): void {
    const envPattern = /process\.env\.(\w+)/g;

    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = envPattern.exec(line)) !== null) {
        const envVar = match[1];
        
        this.addHardcodedValue(hardcodedValues, envVar, 'env_var', {
          filePath: file.filePath,
          startLine: lineIndex + 1,
          endLine: lineIndex + 1,
          codeBlock: line.trim(),
          context: this.extractContext(lines, lineIndex)
        }, ConfigurationCategory.UNKNOWN, true);
      }
    });
  }

  private shouldAnalyzeValue(value: string): boolean {
    if (this.config.excludeCommonValues && this.commonValues.has(value)) {
      return false;
    }

    // Skip very short or very long values
    if (value.length < 2 || value.length > 100) {
      return false;
    }

    // Skip values that look like variable names or code
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) {
      return false;
    }

    return true;
  }

  private categorizeNumericValue(value: string, context: string): ConfigurationCategory {
    const num = parseInt(value, 10);
    const lowerContext = context.toLowerCase();

    // Cost and point limits (common in Space Weirdos)
    if (lowerContext.includes('point') || lowerContext.includes('cost') || 
        lowerContext.includes('limit') || (num >= 50 && num <= 200)) {
      return ConfigurationCategory.COST_LIMITS;
    }

    // Validation thresholds
    if (lowerContext.includes('threshold') || lowerContext.includes('max') || 
        lowerContext.includes('min') || (num > 0 && num < 10)) {
      return ConfigurationCategory.VALIDATION_THRESHOLDS;
    }

    // Cache settings
    if (lowerContext.includes('cache') || lowerContext.includes('ttl') || 
        (num >= 100 && num <= 10000)) {
      return ConfigurationCategory.CACHE_SETTINGS;
    }

    // Performance settings
    if (lowerContext.includes('timeout') || lowerContext.includes('retry') || 
        lowerContext.includes('delay')) {
      return ConfigurationCategory.PERFORMANCE_SETTINGS;
    }

    return ConfigurationCategory.UNKNOWN;
  }

  private categorizeStringValue(value: string, context: string): ConfigurationCategory {
    const lowerValue = value.toLowerCase();
    const lowerContext = context.toLowerCase();

    // Error messages
    if (lowerValue.includes('error') || lowerValue.includes('invalid') || 
        lowerValue.includes('failed') || lowerValue.includes('required')) {
      return ConfigurationCategory.ERROR_MESSAGES;
    }

    // API endpoints
    if (lowerValue.startsWith('http') || lowerValue.startsWith('/api') || 
        lowerValue.includes('localhost')) {
      return ConfigurationCategory.API_ENDPOINTS;
    }

    // File paths
    if (lowerValue.includes('.json') || lowerValue.includes('.js') || 
        lowerValue.includes('./') || lowerValue.includes('../')) {
      return ConfigurationCategory.FILE_PATHS;
    }

    // Environment names
    if (['development', 'production', 'test', 'staging'].includes(lowerValue)) {
      return ConfigurationCategory.BUSINESS_RULES;
    }

    return ConfigurationCategory.UNKNOWN;
  }

  private shouldUseConfigurationManager(category: ConfigurationCategory): boolean {
    // Categories that should definitely use ConfigurationManager
    const configManagerCategories = [
      ConfigurationCategory.COST_LIMITS,
      ConfigurationCategory.VALIDATION_THRESHOLDS,
      ConfigurationCategory.API_ENDPOINTS,
      ConfigurationCategory.CACHE_SETTINGS,
      ConfigurationCategory.ERROR_MESSAGES,
      ConfigurationCategory.BUSINESS_RULES,
      ConfigurationCategory.PERFORMANCE_SETTINGS,
      ConfigurationCategory.SERVER_CONFIGURATION,
      ConfigurationCategory.ENVIRONMENT_SETTINGS
    ];

    return configManagerCategories.includes(category);
  }

  private addHardcodedValue(
    hardcodedValues: Map<string, HardcodedValue>,
    value: string,
    type: 'number' | 'string' | 'env_var',
    location: CodeLocation,
    category: ConfigurationCategory,
    shouldUseConfigManager: boolean
  ): void {
    if (!hardcodedValues.has(value)) {
      hardcodedValues.set(value, {
        value,
        type,
        occurrences: [],
        category,
        shouldUseConfigManager
      });
    }

    hardcodedValues.get(value)!.occurrences.push(location);
  }

  private extractContext(lines: string[], lineIndex: number): string {
    const start = Math.max(0, lineIndex - 1);
    const end = Math.min(lines.length, lineIndex + 2);
    return lines.slice(start, end).join('\n');
  }

  private detectConfigurationPatternInconsistencies(files: ParsedFile[]): DuplicationInstance[] {
    const duplications: DuplicationInstance[] = [];
    const configPatterns: Map<string, CodeLocation[]> = new Map();

    for (const file of files) {
      this.analyzeConfigurationPatterns(file, configPatterns);
    }

    // Find inconsistent patterns
    for (const [pattern, locations] of configPatterns.entries()) {
      if (locations.length >= 2) {
        const duplication = this.createPatternInconsistencyDuplication(pattern, locations);
        duplications.push(duplication);
      }
    }

    return duplications;
  }

  private analyzeConfigurationPatterns(file: ParsedFile, patterns: Map<string, CodeLocation[]>): void {
    const content = file.content;
    const lines = content.split('\n');

    // Look for different ways of accessing configuration
    const configAccessPatterns = [
      /process\.env\.\w+/g,
      /config\.\w+/g,
      /configuration\.\w+/g,
      /ConfigurationManager\./g,
      /getConfig\(\)/g,
      /\.env\./g
    ];

    lines.forEach((line, lineIndex) => {
      configAccessPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const patternType = this.normalizeConfigPattern(match[0]);
          
          if (!patterns.has(patternType)) {
            patterns.set(patternType, []);
          }

          patterns.get(patternType)!.push({
            filePath: file.filePath,
            startLine: lineIndex + 1,
            endLine: lineIndex + 1,
            codeBlock: line.trim(),
            context: this.extractContext(lines, lineIndex)
          });
        }
      });
    });
  }

  private normalizeConfigPattern(pattern: string): string {
    if (pattern.startsWith('process.env')) return 'direct_env_access';
    if (pattern.includes('ConfigurationManager')) return 'configuration_manager';
    if (pattern.startsWith('config.')) return 'config_object';
    if (pattern.includes('getConfig')) return 'config_function';
    return 'other_config_access';
  }

  private createConfigurationDuplication(hardcodedValue: HardcodedValue): DuplicationInstance {
    const impact = this.calculateConfigurationImpact(hardcodedValue);
    const description = this.generateConfigurationDescription(hardcodedValue);

    return {
      id: uuidv4(),
      type: 'configuration',
      similarity: 1.0, // Exact matches for hardcoded values
      locations: hardcodedValue.occurrences,
      description,
      impact
    };
  }

  private createPatternInconsistencyDuplication(
    pattern: string,
    locations: CodeLocation[]
  ): DuplicationInstance {
    const impact = this.calculatePatternInconsistencyImpact(locations);
    const description = `Inconsistent configuration access pattern: ${pattern} used in ${locations.length} different ways`;

    return {
      id: uuidv4(),
      type: 'configuration',
      similarity: 0.8, // Pattern inconsistencies are similar but not exact
      locations,
      description,
      impact
    };
  }

  private calculateConfigurationImpact(hardcodedValue: HardcodedValue): ImpactMetrics {
    const occurrenceCount = hardcodedValue.occurrences.length;
    const totalLines = occurrenceCount; // Each occurrence is typically one line
    
    // Higher impact for values that should use ConfigurationManager
    const configManagerBonus = hardcodedValue.shouldUseConfigManager ? 10 : 0;
    
    // Higher impact for more critical categories
    const categoryMultiplier = this.getCategoryImpactMultiplier(hardcodedValue.category);
    
    const complexity = Math.round((occurrenceCount * categoryMultiplier) + configManagerBonus);

    return {
      linesOfCode: totalLines,
      complexity,
      maintainabilityIndex: Math.max(0, 100 - complexity * 2),
      testCoverage: 0
    };
  }

  private calculatePatternInconsistencyImpact(locations: CodeLocation[]): ImpactMetrics {
    const totalLines = locations.length;
    const complexity = Math.round(totalLines * 1.5); // Pattern inconsistencies are moderately complex

    return {
      linesOfCode: totalLines,
      complexity,
      maintainabilityIndex: Math.max(0, 100 - complexity * 1.5),
      testCoverage: 0
    };
  }

  private getCategoryImpactMultiplier(category: ConfigurationCategory): number {
    const multipliers: Record<ConfigurationCategory, number> = {
      [ConfigurationCategory.COST_LIMITS]: 2.0,
      [ConfigurationCategory.VALIDATION_THRESHOLDS]: 1.8,
      [ConfigurationCategory.API_ENDPOINTS]: 1.5,
      [ConfigurationCategory.ERROR_MESSAGES]: 1.3,
      [ConfigurationCategory.BUSINESS_RULES]: 1.7,
      [ConfigurationCategory.CACHE_SETTINGS]: 1.2,
      [ConfigurationCategory.PERFORMANCE_SETTINGS]: 1.4,
      [ConfigurationCategory.FILE_PATHS]: 1.1,
      [ConfigurationCategory.UI_CONSTANTS]: 0.8,
      [ConfigurationCategory.SERVER_CONFIGURATION]: 1.6,
      [ConfigurationCategory.ENVIRONMENT_SETTINGS]: 1.5,
      [ConfigurationCategory.UNKNOWN]: 1.0
    };

    return multipliers[category] || 1.0;
  }

  private generateConfigurationDescription(hardcodedValue: HardcodedValue): string {
    const count = hardcodedValue.occurrences.length;
    const category = hardcodedValue.category.replace('_', ' ').toLowerCase();
    
    let description = `Hardcoded ${hardcodedValue.type} "${hardcodedValue.value}" appears ${count} times`;
    
    if (hardcodedValue.category !== ConfigurationCategory.UNKNOWN) {
      description += ` (${category})`;
    }
    
    if (hardcodedValue.shouldUseConfigManager) {
      description += ' - should use ConfigurationManager';
      if (hardcodedValue.migrationStrategy) {
        description += ` (${hardcodedValue.migrationStrategy})`;
      }
    }

    return description;
  }

  private generateMigrationStrategy(hardcodedValue: HardcodedValue): string {
    switch (hardcodedValue.category) {
      case ConfigurationCategory.COST_LIMITS:
        return 'migrate to configManager.getCostConfig().pointLimits';
      case ConfigurationCategory.VALIDATION_THRESHOLDS:
        return 'migrate to configManager.getValidationConfig().thresholds';
      case ConfigurationCategory.API_ENDPOINTS:
        return 'migrate to configManager.getApiConfig().baseUrl';
      case ConfigurationCategory.CACHE_SETTINGS:
        return 'migrate to configManager.getCacheConfig()';
      case ConfigurationCategory.ERROR_MESSAGES:
        return 'migrate to configManager.getValidationConfig().messages';
      case ConfigurationCategory.PERFORMANCE_SETTINGS:
        return 'migrate to configManager.getApiConfig() or getServerConfig()';
      case ConfigurationCategory.SERVER_CONFIGURATION:
        return 'migrate to configManager.getServerConfig()';
      default:
        return 'migrate to appropriate ConfigurationManager method';
    }
  }

  private detectConflictingConfigurationDefinitions(files: ParsedFile[]): DuplicationInstance[] {
    const duplications: DuplicationInstance[] = [];
    const configDefinitions: Map<string, Array<{
      value: string;
      location: CodeLocation;
      source: 'hardcoded' | 'env_var' | 'config_file' | 'configuration_manager';
    }>> = new Map();

    // Analyze files for configuration definitions
    for (const file of files) {
      this.analyzeConfigurationDefinitions(file, configDefinitions);
    }

    // Find conflicts
    for (const [configKey, definitions] of configDefinitions.entries()) {
      if (definitions.length > 1) {
        const uniqueValues = new Set(definitions.map(d => d.value));
        if (uniqueValues.size > 1) {
          // Found conflicting values for the same configuration key
          const conflict = this.createConfigurationConflict(configKey, definitions);
          const duplication = this.createConflictDuplication(conflict);
          duplications.push(duplication);
        }
      }
    }

    return duplications;
  }

  private analyzeConfigurationDefinitions(
    file: ParsedFile,
    configDefinitions: Map<string, Array<{
      value: string;
      location: CodeLocation;
      source: 'hardcoded' | 'env_var' | 'config_file' | 'configuration_manager';
    }>>
  ): void {
    const content = file.content;
    const lines = content.split('\n');

    // Patterns for different configuration sources
    const patterns = [
      // Environment variables
      { pattern: /process\.env\.(\w+)\s*=\s*['"]([^'"]+)['"]/g, source: 'env_var' as const },
      // Hardcoded assignments
      { pattern: /(?:const|let|var)\s+(\w*(?:LIMIT|THRESHOLD|CONFIG|SETTING)\w*)\s*=\s*(['"]?[^;]+['"]?)/g, source: 'hardcoded' as const },
      // ConfigurationManager usage
      { pattern: /configManager\.get(\w+Config)\(\)/g, source: 'configuration_manager' as const },
    ];

    lines.forEach((line, lineIndex) => {
      patterns.forEach(({ pattern, source }) => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const configKey = match[1];
          const value = match[2] || match[1];
          
          if (!configDefinitions.has(configKey)) {
            configDefinitions.set(configKey, []);
          }

          configDefinitions.get(configKey)!.push({
            value,
            location: {
              filePath: file.filePath,
              startLine: lineIndex + 1,
              endLine: lineIndex + 1,
              codeBlock: line.trim(),
              context: this.extractContext(lines, lineIndex)
            },
            source
          });
        }
      });
    });
  }

  private createConfigurationConflict(
    configKey: string,
    definitions: Array<{
      value: string;
      location: CodeLocation;
      source: 'hardcoded' | 'env_var' | 'config_file' | 'configuration_manager';
    }>
  ): ConfigurationConflict {
    const uniqueValues = new Set(definitions.map(d => d.value));
    const hasConfigManager = definitions.some(d => d.source === 'configuration_manager');
    const hasHardcoded = definitions.some(d => d.source === 'hardcoded');
    
    let severity: 'low' | 'medium' | 'high' = 'medium';
    if (hasConfigManager && hasHardcoded) {
      severity = 'high'; // Mixed usage is problematic
    } else if (uniqueValues.size > 2) {
      severity = 'high'; // Many conflicting values
    }

    return {
      configKey,
      conflictingValues: definitions,
      severity,
      resolution: hasConfigManager 
        ? `Migrate all ${configKey} usage to ConfigurationManager`
        : `Centralize ${configKey} definition using ConfigurationManager`
    };
  }

  private createConflictDuplication(conflict: ConfigurationConflict): DuplicationInstance {
    const locations = conflict.conflictingValues.map(cv => cv.location);
    const impact = this.calculateConflictImpact(conflict);
    
    return {
      id: uuidv4(),
      type: 'configuration',
      similarity: 0.9, // High similarity due to same config key
      locations,
      description: `Configuration conflict: "${conflict.configKey}" has ${conflict.conflictingValues.length} different definitions (${conflict.resolution})`,
      impact
    };
  }

  private calculateConflictImpact(conflict: ConfigurationConflict): ImpactMetrics {
    const severityMultiplier = { low: 1, medium: 1.5, high: 2 }[conflict.severity];
    const complexity = Math.round(conflict.conflictingValues.length * severityMultiplier * 5);
    
    return {
      linesOfCode: conflict.conflictingValues.length,
      complexity,
      maintainabilityIndex: Math.max(0, 100 - complexity * 3),
      testCoverage: 0
    };
  }

  private detectMissingValidationPatterns(
    files: ParsedFile[],
    hardcodedValues: Map<string, HardcodedValue>
  ): DuplicationInstance[] {
    const duplications: DuplicationInstance[] = [];
    const validationAnalysis = this.analyzeValidationPatterns(files, hardcodedValues);

    // Create duplications for missing validation patterns - only if there are multiple instances
    for (const missing of validationAnalysis.missingPatterns) {
      // Only create duplication if the hardcoded value appears in multiple locations
      const hardcodedValue = hardcodedValues.get(missing.configKey);
      if (hardcodedValue && hardcodedValue.occurrences.length >= 2) {
        const duplication: DuplicationInstance = {
          id: uuidv4(),
          type: 'configuration',
          similarity: 0.7,
          locations: hardcodedValue.occurrences, // Use all occurrences, not just one
          description: `Missing validation pattern for configuration "${missing.configKey}" - ${missing.suggestedValidation}`,
          impact: {
            linesOfCode: hardcodedValue.occurrences.length,
            complexity: hardcodedValue.occurrences.length * 4,
            maintainabilityIndex: Math.max(0, 100 - hardcodedValue.occurrences.length * 5),
            testCoverage: 0
          }
        };
        duplications.push(duplication);
      }
    }

    // Create duplications for inconsistent validation patterns
    for (const inconsistent of validationAnalysis.inconsistentPatterns) {
      const duplication: DuplicationInstance = {
        id: uuidv4(),
        type: 'configuration',
        similarity: 0.8,
        locations: inconsistent.locations,
        description: `Inconsistent validation patterns for "${inconsistent.configKey}" - recommend: ${inconsistent.recommendedPattern}`,
        impact: {
          linesOfCode: inconsistent.locations.length,
          complexity: inconsistent.locations.length * 3,
          maintainabilityIndex: Math.max(0, 100 - inconsistent.locations.length * 5),
          testCoverage: 0
        }
      };
      duplications.push(duplication);
    }

    return duplications;
  }

  private analyzeValidationPatterns(
    files: ParsedFile[],
    hardcodedValues: Map<string, HardcodedValue>
  ): ValidationPatternAnalysis {
    const missingPatterns: ValidationPatternAnalysis['missingPatterns'] = [];
    const inconsistentPatterns: ValidationPatternAnalysis['inconsistentPatterns'] = [];
    const validationPatterns: Map<string, Array<{ pattern: string; location: CodeLocation }>> = new Map();

    // Analyze each file for validation patterns
    for (const file of files) {
      this.analyzeFileValidationPatterns(file, validationPatterns);
    }

    // Check hardcoded values that should have validation
    for (const [value, hardcodedValue] of hardcodedValues.entries()) {
      if (hardcodedValue.shouldUseConfigManager && this.needsValidation(hardcodedValue.category)) {
        const hasValidation = this.hasValidationPattern(hardcodedValue, validationPatterns);
        if (!hasValidation) {
          missingPatterns.push({
            configKey: value,
            location: hardcodedValue.occurrences[0],
            suggestedValidation: this.suggestValidationPattern(hardcodedValue.category)
          });
        }
      }
    }

    // Check for inconsistent patterns
    for (const [configKey, patterns] of validationPatterns.entries()) {
      if (patterns.length > 1) {
        const uniquePatterns = new Set(patterns.map(p => p.pattern));
        if (uniquePatterns.size > 1) {
          inconsistentPatterns.push({
            configKey,
            locations: patterns.map(p => p.location),
            patterns: Array.from(uniquePatterns),
            recommendedPattern: this.recommendValidationPattern(Array.from(uniquePatterns))
          });
        }
      }
    }

    return { missingPatterns, inconsistentPatterns };
  }

  private analyzeFileValidationPatterns(
    file: ParsedFile,
    validationPatterns: Map<string, Array<{ pattern: string; location: CodeLocation }>>
  ): void {
    const content = file.content;
    const lines = content.split('\n');

    // Patterns for validation
    const patterns = [
      /if\s*\(\s*(\w+)\s*[<>=!]+\s*\d+\s*\)/g, // Numeric validation
      /if\s*\(\s*!(\w+)\s*\)/g, // Existence validation
      /(\w+)\.length\s*[<>=!]+\s*\d+/g, // Length validation
      /typeof\s+(\w+)\s*[=!]+\s*['"](\w+)['"]/g, // Type validation
    ];

    lines.forEach((line, lineIndex) => {
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const configKey = match[1];
          const validationPattern = match[0];
          
          if (!validationPatterns.has(configKey)) {
            validationPatterns.set(configKey, []);
          }

          validationPatterns.get(configKey)!.push({
            pattern: validationPattern,
            location: {
              filePath: file.filePath,
              startLine: lineIndex + 1,
              endLine: lineIndex + 1,
              codeBlock: line.trim(),
              context: this.extractContext(lines, lineIndex)
            }
          });
        }
      });
    });
  }

  private needsValidation(category: ConfigurationCategory): boolean {
    const validationCategories = [
      ConfigurationCategory.COST_LIMITS,
      ConfigurationCategory.VALIDATION_THRESHOLDS,
      ConfigurationCategory.CACHE_SETTINGS,
      ConfigurationCategory.PERFORMANCE_SETTINGS,
      ConfigurationCategory.SERVER_CONFIGURATION
    ];
    return validationCategories.includes(category);
  }

  private hasValidationPattern(
    hardcodedValue: HardcodedValue,
    validationPatterns: Map<string, Array<{ pattern: string; location: CodeLocation }>>
  ): boolean {
    // Check if any validation patterns exist for this value or similar values
    for (const [key, patterns] of validationPatterns.entries()) {
      if (key.includes(hardcodedValue.value) || hardcodedValue.value.includes(key)) {
        return patterns.length > 0;
      }
    }
    return false;
  }

  private suggestValidationPattern(category: ConfigurationCategory): string {
    switch (category) {
      case ConfigurationCategory.COST_LIMITS:
        return 'validate point limits are positive numbers within reasonable range';
      case ConfigurationCategory.VALIDATION_THRESHOLDS:
        return 'validate thresholds are between 0 and 1';
      case ConfigurationCategory.CACHE_SETTINGS:
        return 'validate cache size and TTL are positive numbers';
      case ConfigurationCategory.PERFORMANCE_SETTINGS:
        return 'validate timeout and retry values are positive';
      case ConfigurationCategory.SERVER_CONFIGURATION:
        return 'validate port numbers and host addresses';
      default:
        return 'add appropriate validation for configuration value';
    }
  }

  private recommendValidationPattern(patterns: string[]): string {
    // Simple heuristic: prefer more comprehensive patterns
    return patterns.reduce((best, current) => 
      current.length > best.length ? current : best
    );
  }
}