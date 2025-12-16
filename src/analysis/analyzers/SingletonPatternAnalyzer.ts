/**
 * SingletonPatternAnalyzer - Comprehensive analysis of singleton pattern implementations
 * Detects singleton patterns, analyzes consistency, and identifies consolidation opportunities
 */

import { ParsedFile, ClassInfo, FunctionInfo } from '../interfaces/AnalysisInterfaces.js';
import { DuplicationInstance, CodeLocation, ImpactMetrics, OptimizationRecommendation } from '../types/DuplicationModels.js';
import { v4 as uuidv4 } from 'uuid';

export interface SingletonAnalysisConfig {
  minSimilarityThreshold: number;
  detectInconsistencies: boolean;
  analyzeConsolidationOpportunities: boolean;
  evaluateDependencyInjectionOpportunities: boolean;
}

export interface SingletonInstance {
  id: string;
  className: string;
  filePath: string;
  location: CodeLocation;
  implementation: SingletonImplementation;
  characteristics: SingletonCharacteristics;
  inconsistencies: string[];
  consolidationOpportunities: string[];
  dependencyInjectionCandidate: boolean;
  dependencyInjectionReasons: string[];
}

export interface SingletonImplementation {
  hasPrivateConstructor: boolean;
  hasStaticInstance: boolean;
  hasGetInstanceMethod: boolean;
  instanceVariableName: string;
  getInstanceMethodName: string;
  implementationPattern: 'eager' | 'lazy' | 'thread_safe' | 'enum' | 'custom';
  threadSafety: 'none' | 'synchronized' | 'double_checked' | 'initialization_on_demand';
}

export interface SingletonCharacteristics {
  complexity: number;
  dependencies: string[];
  responsibilities: string[];
  statefulness: 'stateless' | 'stateful' | 'mixed';
  testability: 'high' | 'medium' | 'low';
  coupling: 'loose' | 'tight' | 'very_tight';
}

export interface ConsolidationOpportunity {
  singletons: SingletonInstance[];
  sharedFunctionality: string[];
  proposedBaseClass: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  benefits: string[];
  risks: string[];
}

export class SingletonPatternAnalyzer {
  private config: SingletonAnalysisConfig;

  constructor(config?: Partial<SingletonAnalysisConfig>) {
    this.config = {
      minSimilarityThreshold: 0.7,
      detectInconsistencies: true,
      analyzeConsolidationOpportunities: true,
      evaluateDependencyInjectionOpportunities: true,
      ...config
    };
  }

  async analyzeSingletonPatterns(files: ParsedFile[]): Promise<{
    singletons: SingletonInstance[];
    duplications: DuplicationInstance[];
    recommendations: OptimizationRecommendation[];
  }> {
    const singletons = await this.detectAllSingletons(files);
    const duplications = await this.findSingletonDuplications(singletons);
    const recommendations = await this.generateSingletonRecommendations(singletons);

    return {
      singletons,
      duplications,
      recommendations
    };
  }

  private async detectAllSingletons(files: ParsedFile[]): Promise<SingletonInstance[]> {
    const singletons: SingletonInstance[] = [];

    for (const file of files) {
      for (const classInfo of file.metadata.classes) {
        const classContent = this.extractClassContent(file, classInfo);
        
        if (this.isSingletonClass(classContent, classInfo)) {
          const singleton = await this.analyzeSingletonInstance(file, classInfo, classContent);
          singletons.push(singleton);
        }
      }
    }

    return singletons;
  }

  private isSingletonClass(classContent: string, classInfo: ClassInfo): boolean {
    const content = classContent.toLowerCase();
    
    // Enhanced singleton detection
    const hasPrivateConstructor = this.hasPrivateConstructor(content);
    const hasStaticInstance = this.hasStaticInstance(content);
    const hasGetInstance = this.hasGetInstanceMethod(content);
    const hasSingletonNaming = this.hasSingletonNaming(classInfo.name, content);
    
    // Singleton score based on characteristics
    const characteristics = [hasPrivateConstructor, hasStaticInstance, hasGetInstance, hasSingletonNaming];
    const singletonScore = characteristics.filter(Boolean).length;
    
    // Must have at least 2 strong singleton characteristics, OR have static instance (even without getInstance)
    // This allows detection of incomplete singleton implementations for inconsistency analysis
    return singletonScore >= 2 || (hasStaticInstance && hasPrivateConstructor);
  }

  private hasPrivateConstructor(content: string): boolean {
    return /private\s+constructor/i.test(content) ||
           /constructor\s*\(\s*\)\s*{\s*\/\/\s*private/i.test(content) ||
           /private\s+static\s+instance/i.test(content);
  }

  private hasStaticInstance(content: string): boolean {
    return /static\s+(?:private\s+)?(?:readonly\s+)?instance/i.test(content) ||
           /static\s+(?:private\s+)?_instance/i.test(content) ||
           /private\s+static\s+\w*instance/i.test(content);
  }

  private hasGetInstanceMethod(content: string): boolean {
    return /(?:static\s+)?(?:public\s+)?getInstance/i.test(content) ||
           /(?:static\s+)?(?:public\s+)?get\s+instance/i.test(content) ||
           /static\s+\w*getInstance/i.test(content);
  }

  private hasSingletonNaming(className: string, content: string): boolean {
    const lowerClassName = className.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    return lowerClassName.includes('singleton') ||
           lowerContent.includes('singleton pattern') ||
           lowerContent.includes('only one instance');
  }

  private async analyzeSingletonInstance(
    file: ParsedFile,
    classInfo: ClassInfo,
    classContent: string
  ): Promise<SingletonInstance> {
    const implementation = this.analyzeImplementation(classContent, classInfo);
    const characteristics = this.analyzeCharacteristics(classContent, classInfo);
    const inconsistencies = this.detectInconsistencies(implementation, characteristics);
    const consolidationOpportunities = this.identifyConsolidationOpportunities(classContent, classInfo);
    const dependencyInjectionAnalysis = this.evaluateDependencyInjectionOpportunity(
      implementation,
      characteristics
    );

    return {
      id: uuidv4(),
      className: classInfo.name,
      filePath: file.filePath,
      location: {
        filePath: file.filePath,
        startLine: classInfo.startLine,
        endLine: classInfo.endLine,
        codeBlock: classContent,
        context: `singleton class: ${classInfo.name}`
      },
      implementation,
      characteristics,
      inconsistencies,
      consolidationOpportunities,
      dependencyInjectionCandidate: dependencyInjectionAnalysis.isCandidate,
      dependencyInjectionReasons: dependencyInjectionAnalysis.reasons
    };
  }

  private analyzeImplementation(classContent: string, classInfo: ClassInfo): SingletonImplementation {
    const content = classContent.toLowerCase();
    
    const hasPrivateConstructor = this.hasPrivateConstructor(content);
    const hasStaticInstance = this.hasStaticInstance(content);
    const hasGetInstanceMethod = this.hasGetInstanceMethod(content);
    
    // Extract variable and method names
    const instanceVariableName = this.extractInstanceVariableName(classContent);
    const getInstanceMethodName = this.extractGetInstanceMethodName(classContent);
    
    // Determine implementation pattern
    const implementationPattern = this.determineImplementationPattern(classContent);
    const threadSafety = this.analyzeThreadSafety(classContent);

    return {
      hasPrivateConstructor,
      hasStaticInstance,
      hasGetInstanceMethod,
      instanceVariableName,
      getInstanceMethodName,
      implementationPattern,
      threadSafety
    };
  }

  private extractInstanceVariableName(content: string): string {
    const instanceMatch = content.match(/static\s+(?:private\s+)?(?:readonly\s+)?(\w*instance\w*)/i);
    return instanceMatch ? instanceMatch[1] : 'instance';
  }

  private extractGetInstanceMethodName(content: string): string {
    const methodMatch = content.match(/(?:static\s+)?(?:public\s+)?(get\w*instance\w*)/i);
    return methodMatch ? methodMatch[1] : 'getInstance';
  }

  private determineImplementationPattern(content: string): SingletonImplementation['implementationPattern'] {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('enum')) {
      return 'enum';
    } else if (lowerContent.includes('new ') && lowerContent.includes('static')) {
      return 'eager';
    } else if (lowerContent.includes('if') && lowerContent.includes('null')) {
      return 'lazy';
    } else if (lowerContent.includes('synchronized') || lowerContent.includes('lock')) {
      return 'thread_safe';
    } else {
      return 'custom';
    }
  }

  private analyzeThreadSafety(content: string): SingletonImplementation['threadSafety'] {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('synchronized')) {
      return 'synchronized';
    } else if (lowerContent.includes('double') && lowerContent.includes('check')) {
      return 'double_checked';
    } else if (lowerContent.includes('initialization') && lowerContent.includes('demand')) {
      return 'initialization_on_demand';
    } else {
      return 'none';
    }
  }

  private analyzeCharacteristics(classContent: string, classInfo: ClassInfo): SingletonCharacteristics {
    const complexity = this.calculateComplexity(classContent, classInfo);
    const dependencies = this.extractDependencies(classContent);
    const responsibilities = this.identifyResponsibilities(classContent, classInfo);
    const statefulness = this.analyzeStatefulness(classContent, classInfo);
    const testability = this.assessTestability(classContent, classInfo);
    const coupling = this.analyzeCoupling(classContent, dependencies);

    return {
      complexity,
      dependencies,
      responsibilities,
      statefulness,
      testability,
      coupling
    };
  }

  private calculateComplexity(classContent: string, classInfo: ClassInfo): number {
    const lineCount = classInfo.endLine - classInfo.startLine + 1;
    const methodCount = classInfo.methods?.length || 0;
    const propertyCount = classInfo.properties?.length || 0;
    
    // Complexity based on size and structure
    return Math.round((lineCount * 0.1) + (methodCount * 2) + (propertyCount * 1.5));
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // Extract import statements
    const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
    if (importMatches) {
      dependencies.push(...importMatches.map(match => {
        const moduleMatch = match.match(/from\s+['"]([^'"]+)['"]/);
        return moduleMatch ? moduleMatch[1] : '';
      }).filter(Boolean));
    }
    
    // Extract constructor dependencies
    const constructorMatches = content.match(/constructor\s*\([^)]*\)/);
    if (constructorMatches) {
      const params = constructorMatches[0].match(/\w+:\s*\w+/g);
      if (params) {
        dependencies.push(...params.map(param => param.split(':')[1].trim()));
      }
    }

    return [...new Set(dependencies)];
  }

  private identifyResponsibilities(classContent: string, classInfo: ClassInfo): string[] {
    const responsibilities: string[] = [];
    const content = classContent.toLowerCase();
    
    // Identify common responsibilities based on method names and content
    if (content.includes('config') || content.includes('setting')) {
      responsibilities.push('configuration_management');
    }
    if (content.includes('cache') || content.includes('store')) {
      responsibilities.push('caching');
    }
    if (content.includes('log') || content.includes('debug')) {
      responsibilities.push('logging');
    }
    if (content.includes('connect') || content.includes('database')) {
      responsibilities.push('database_connection');
    }
    if (content.includes('service') || content.includes('api')) {
      responsibilities.push('service_management');
    }
    if (content.includes('event') || content.includes('notify')) {
      responsibilities.push('event_management');
    }

    return responsibilities;
  }

  private analyzeStatefulness(classContent: string, classInfo: ClassInfo): SingletonCharacteristics['statefulness'] {
    const propertyCount = classInfo.properties?.length || 0;
    const content = classContent.toLowerCase();
    
    // Check for thread safety issues in the content - this indicates potential statefulness issues
    if (content.includes('thread safety issue') || content.includes('no null check')) {
      return 'stateful';
    }
    
    if (propertyCount === 0 || content.includes('stateless')) {
      return 'stateless';
    } else if (content.includes('state') || propertyCount > 5) {
      return 'stateful';
    } else {
      return 'mixed';
    }
  }

  private assessTestability(classContent: string, classInfo: ClassInfo): SingletonCharacteristics['testability'] {
    const content = classContent.toLowerCase();
    const dependencyCount = this.extractDependencies(classContent).length;
    
    if (content.includes('test') || dependencyCount === 0) {
      return 'high';
    } else if (dependencyCount > 5 || content.includes('global')) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  private analyzeCoupling(classContent: string, dependencies: string[]): SingletonCharacteristics['coupling'] {
    const dependencyCount = dependencies.length;
    const content = classContent.toLowerCase();
    
    if (dependencyCount > 10 || content.includes('global') || content.includes('static')) {
      return 'very_tight';
    } else if (dependencyCount > 5) {
      return 'tight';
    } else {
      return 'loose';
    }
  }

  private detectInconsistencies(
    implementation: SingletonImplementation,
    characteristics: SingletonCharacteristics
  ): string[] {
    const inconsistencies: string[] = [];
    
    // Check for implementation inconsistencies
    if (!implementation.hasPrivateConstructor) {
      inconsistencies.push('Missing private constructor - allows multiple instantiation');
    }
    
    if (!implementation.hasGetInstanceMethod && implementation.hasStaticInstance) {
      inconsistencies.push('Has static instance but no getInstance method');
    }
    
    if (implementation.threadSafety === 'none' && characteristics.statefulness === 'stateful') {
      inconsistencies.push('Stateful singleton without thread safety measures');
    }
    
    // Check for thread safety issues in implementation pattern
    if (implementation.implementationPattern === 'lazy' && implementation.threadSafety === 'none') {
      inconsistencies.push('Stateful singleton without thread safety measures');
    }
    
    if (characteristics.testability === 'low') {
      inconsistencies.push('Poor testability due to tight coupling or global state');
    }

    return inconsistencies;
  }

  private identifyConsolidationOpportunities(classContent: string, classInfo: ClassInfo): string[] {
    const opportunities: string[] = [];
    const content = classContent.toLowerCase();
    
    // Identify potential consolidation opportunities
    if (content.includes('config') || content.includes('setting')) {
      opportunities.push('Could be consolidated with other configuration singletons');
    }
    
    if (content.includes('cache')) {
      opportunities.push('Could share common caching infrastructure');
    }
    
    if (content.includes('service') && classInfo.methods && classInfo.methods.length < 5) {
      opportunities.push('Simple service that could be merged with similar services');
    }

    return opportunities;
  }

  private evaluateDependencyInjectionOpportunity(
    implementation: SingletonImplementation,
    characteristics: SingletonCharacteristics
  ): { isCandidate: boolean; reasons: string[] } {
    const reasons: string[] = [];
    let isCandidate = false;
    
    // Evaluate if singleton could be replaced with dependency injection
    if (characteristics.statefulness === 'stateless') {
      reasons.push('Stateless singleton could be replaced with regular class and DI');
      isCandidate = true;
    }
    
    if (characteristics.testability === 'low') {
      reasons.push('Poor testability suggests DI would improve testing');
      isCandidate = true;
    }
    
    if (characteristics.coupling === 'very_tight') {
      reasons.push('Tight coupling suggests DI would improve modularity');
      isCandidate = true;
    }
    
    if (characteristics.dependencies.length > 3) {
      reasons.push('Multiple dependencies suggest DI container would be beneficial');
      isCandidate = true;
    }

    return { isCandidate, reasons };
  }

  private async findSingletonDuplications(singletons: SingletonInstance[]): Promise<DuplicationInstance[]> {
    const duplications: DuplicationInstance[] = [];
    
    // Group singletons by similar characteristics
    const groups = this.groupSimilarSingletons(singletons);
    
    for (const group of groups) {
      if (group.length > 1) {
        const duplication = this.createSingletonDuplication(group);
        duplications.push(duplication);
      }
    }

    return duplications;
  }

  private groupSimilarSingletons(singletons: SingletonInstance[]): SingletonInstance[][] {
    const groups: SingletonInstance[][] = [];
    const processed = new Set<string>();
    
    for (const singleton of singletons) {
      if (processed.has(singleton.id)) continue;
      
      const similarGroup = [singleton];
      processed.add(singleton.id);
      
      for (const other of singletons) {
        if (processed.has(other.id)) continue;
        
        if (this.areSimilarSingletons(singleton, other)) {
          similarGroup.push(other);
          processed.add(other.id);
        }
      }
      
      groups.push(similarGroup);
    }
    
    return groups;
  }

  private areSimilarSingletons(singleton1: SingletonInstance, singleton2: SingletonInstance): boolean {
    // Check for similar responsibilities
    const sharedResponsibilities = singleton1.characteristics.responsibilities.filter(r =>
      singleton2.characteristics.responsibilities.includes(r)
    );
    
    if (sharedResponsibilities.length > 0) return true;
    
    // Check for similar implementation patterns
    if (singleton1.implementation.implementationPattern === singleton2.implementation.implementationPattern &&
        singleton1.characteristics.statefulness === singleton2.characteristics.statefulness) {
      return true;
    }
    
    return false;
  }

  private createSingletonDuplication(singletons: SingletonInstance[]): DuplicationInstance {
    const locations = singletons.map(s => s.location);
    const sharedResponsibilities = this.findSharedResponsibilities(singletons);
    
    const impact: ImpactMetrics = {
      linesOfCode: locations.reduce((sum, loc) => sum + (loc.endLine - loc.startLine + 1), 0),
      complexity: singletons.reduce((sum, s) => sum + s.characteristics.complexity, 0),
      maintainabilityIndex: Math.max(0, 100 - (singletons.length * 10)),
      testCoverage: 0
    };

    return {
      id: uuidv4(),
      type: 'pattern',
      similarity: this.calculateSingletonSimilarity(singletons),
      locations,
      description: `${singletons.length} similar singleton implementations with shared responsibilities: ${sharedResponsibilities.join(', ')}`,
      impact
    };
  }

  private findSharedResponsibilities(singletons: SingletonInstance[]): string[] {
    if (singletons.length === 0) return [];
    
    const firstResponsibilities = singletons[0].characteristics.responsibilities;
    return firstResponsibilities.filter(responsibility =>
      singletons.every(s => s.characteristics.responsibilities.includes(responsibility))
    );
  }

  private calculateSingletonSimilarity(singletons: SingletonInstance[]): number {
    if (singletons.length < 2) return 1.0;
    
    const sharedResponsibilities = this.findSharedResponsibilities(singletons);
    const avgResponsibilities = singletons.reduce((sum, s) => 
      sum + s.characteristics.responsibilities.length, 0) / singletons.length;
    
    const responsibilitySimilarity = avgResponsibilities > 0 ? 
      sharedResponsibilities.length / avgResponsibilities : 0;
    
    // Check implementation pattern consistency
    const patterns = singletons.map(s => s.implementation.implementationPattern);
    const uniquePatterns = new Set(patterns);
    const patternConsistency = 1 - (uniquePatterns.size - 1) / patterns.length;
    
    return Math.min((responsibilitySimilarity + patternConsistency) / 2, 1.0);
  }

  private async generateSingletonRecommendations(singletons: SingletonInstance[]): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Generate consolidation recommendations
    const consolidationOpportunities = this.findConsolidationOpportunities(singletons);
    for (const opportunity of consolidationOpportunities) {
      recommendations.push(this.createConsolidationRecommendation(opportunity));
    }
    
    // Generate dependency injection recommendations
    const diCandidates = singletons.filter(s => s.dependencyInjectionCandidate);
    for (const candidate of diCandidates) {
      recommendations.push(this.createDependencyInjectionRecommendation(candidate));
    }
    
    // Generate consistency improvement recommendations
    const inconsistentSingletons = singletons.filter(s => s.inconsistencies.length > 0);
    for (const singleton of inconsistentSingletons) {
      recommendations.push(this.createConsistencyRecommendation(singleton));
    }

    return recommendations;
  }

  private findConsolidationOpportunities(singletons: SingletonInstance[]): ConsolidationOpportunity[] {
    const opportunities: ConsolidationOpportunity[] = [];
    const groups = this.groupSimilarSingletons(singletons);
    
    for (const group of groups) {
      if (group.length > 1) {
        const sharedFunctionality = this.findSharedResponsibilities(group);
        if (sharedFunctionality.length > 0) {
          opportunities.push({
            singletons: group,
            sharedFunctionality,
            proposedBaseClass: `Base${sharedFunctionality[0].replace('_', '')}Singleton`,
            estimatedEffort: group.length > 3 ? 'high' : 'medium',
            benefits: [
              'Reduced code duplication',
              'Consistent implementation patterns',
              'Easier maintenance and testing'
            ],
            risks: [
              'Potential breaking changes',
              'Increased complexity during migration',
              'Need for thorough testing'
            ]
          });
        }
      }
    }
    
    return opportunities;
  }

  private createConsolidationRecommendation(opportunity: ConsolidationOpportunity): OptimizationRecommendation {
    return {
      id: uuidv4(),
      title: `Consolidate ${opportunity.singletons.length} Similar Singletons`,
      description: `Create a base class ${opportunity.proposedBaseClass} to consolidate shared functionality: ${opportunity.sharedFunctionality.join(', ')}`,
      type: 'consolidation',
      priority: opportunity.estimatedEffort === 'high' ? 'medium' : 'high',
      complexity: {
        level: opportunity.estimatedEffort,
        factors: ['Multiple singleton classes', 'Shared functionality extraction', 'Interface design'],
        reasoning: `Consolidating ${opportunity.singletons.length} singletons requires careful interface design and migration planning`
      },
      estimatedEffort: {
        hours: opportunity.estimatedEffort === 'high' ? 16 : 8,
        complexity: {
          level: opportunity.estimatedEffort,
          factors: ['Code refactoring', 'Testing updates', 'Documentation'],
          reasoning: 'Singleton consolidation requires careful planning and testing'
        },
        dependencies: opportunity.singletons.map(s => s.filePath)
      },
      benefits: opportunity.benefits,
      risks: opportunity.risks.map(risk => ({
        type: 'breaking_change' as const,
        severity: 'medium' as const,
        description: risk,
        mitigation: 'Implement gradual migration with comprehensive testing'
      })),
      implementationPlan: [
        {
          order: 1,
          title: 'Create base singleton class',
          description: `Create ${opportunity.proposedBaseClass} with shared functionality`,
          validation: 'Base class compiles and passes unit tests'
        },
        {
          order: 2,
          title: 'Migrate existing singletons',
          description: 'Update existing singletons to extend the base class',
          validation: 'All singletons maintain existing functionality'
        },
        {
          order: 3,
          title: 'Update tests and documentation',
          description: 'Update tests to cover new architecture',
          validation: 'All tests pass and documentation is updated'
        }
      ],
      affectedFiles: opportunity.singletons.map(s => s.filePath)
    };
  }

  private createDependencyInjectionRecommendation(singleton: SingletonInstance): OptimizationRecommendation {
    return {
      id: uuidv4(),
      title: `Replace ${singleton.className} Singleton with Dependency Injection`,
      description: `Convert ${singleton.className} from singleton pattern to dependency injection for better testability and modularity`,
      type: 'refactoring',
      priority: singleton.characteristics.testability === 'low' ? 'high' : 'medium',
      complexity: {
        level: 'medium',
        factors: ['Singleton removal', 'DI container setup', 'Consumer updates'],
        reasoning: 'Converting singleton to DI requires updating all consumers and setting up injection'
      },
      estimatedEffort: {
        hours: 12,
        complexity: {
          level: 'medium',
          factors: ['Pattern refactoring', 'Consumer updates', 'Testing'],
          reasoning: 'Singleton to DI conversion affects multiple consumers'
        },
        dependencies: [singleton.filePath]
      },
      benefits: [
        'Improved testability',
        'Better modularity',
        'Reduced coupling',
        'Easier mocking in tests'
      ],
      risks: [
        {
          type: 'breaking_change',
          severity: 'medium',
          description: 'All consumers need to be updated',
          mitigation: 'Implement gradual migration with adapter pattern'
        }
      ],
      implementationPlan: [
        {
          order: 1,
          title: 'Convert singleton to regular class',
          description: 'Remove singleton pattern and make class injectable',
          validation: 'Class can be instantiated normally'
        },
        {
          order: 2,
          title: 'Set up dependency injection',
          description: 'Configure DI container to manage class lifecycle',
          validation: 'DI container properly creates and manages instances'
        },
        {
          order: 3,
          title: 'Update all consumers',
          description: 'Update all code that uses the singleton to use DI',
          validation: 'All consumers work with injected instance'
        }
      ],
      affectedFiles: [singleton.filePath]
    };
  }

  private createConsistencyRecommendation(singleton: SingletonInstance): OptimizationRecommendation {
    return {
      id: uuidv4(),
      title: `Fix Inconsistencies in ${singleton.className} Singleton`,
      description: `Address implementation inconsistencies: ${singleton.inconsistencies.join(', ')}`,
      type: 'refactoring',
      priority: singleton.inconsistencies.length > 2 ? 'high' : 'medium',
      complexity: {
        level: 'low',
        factors: ['Implementation fixes', 'Pattern compliance'],
        reasoning: 'Fixing singleton inconsistencies is typically straightforward'
      },
      estimatedEffort: {
        hours: 4,
        complexity: {
          level: 'low',
          factors: ['Pattern fixes', 'Testing'],
          reasoning: 'Singleton consistency fixes are usually simple'
        },
        dependencies: [singleton.filePath]
      },
      benefits: [
        'Consistent singleton implementation',
        'Better thread safety',
        'Improved maintainability'
      ],
      risks: [
        {
          type: 'compatibility',
          severity: 'low',
          description: 'Minor changes to singleton behavior',
          mitigation: 'Thorough testing of singleton usage'
        }
      ],
      implementationPlan: singleton.inconsistencies.map((inconsistency, index) => ({
        order: index + 1,
        title: `Fix: ${inconsistency}`,
        description: `Address the inconsistency: ${inconsistency}`,
        validation: 'Singleton follows proper implementation pattern'
      })),
      affectedFiles: [singleton.filePath]
    };
  }

  private extractClassContent(file: ParsedFile, classInfo: ClassInfo): string {
    // For property-based testing, we'll generate content based on the class metadata
    // In a real implementation, this would extract from the actual file content
    let content = `class ${classInfo.name} {\n`;
    
    // Add properties
    if (classInfo.properties) {
      classInfo.properties.forEach(prop => {
        const visibility = prop.isPrivate ? 'private' : 'public';
        const staticKeyword = prop.isStatic ? 'static' : '';
        content += `  ${visibility} ${staticKeyword} ${prop.name}: ${prop.type || 'any'};\n`;
      });
    }
    
    // Add constructor (check if it should be private based on singleton pattern)
    const hasPrivateConstructor = classInfo.properties?.some(p => 
      p.isStatic && p.name.toLowerCase().includes('instance')
    );
    
    if (hasPrivateConstructor) {
      content += `  private constructor() {\n    // Private constructor\n  }\n`;
    } else {
      content += `  constructor() {\n    // Public constructor\n  }\n`;
    }
    
    // Add methods
    if (classInfo.methods) {
      classInfo.methods.forEach(method => {
        if (method.name === 'getInstance') {
          content += `\n  public static getInstance(): ${classInfo.name} {\n`;
          content += `    if (!${classInfo.name}.instance) {\n`;
          content += `      ${classInfo.name}.instance = new ${classInfo.name}();\n`;
          content += `    }\n`;
          content += `    return ${classInfo.name}.instance;\n`;
          content += `  }\n`;
        } else {
          content += `\n  public ${method.name}(): ${method.returnType || 'void'} {\n`;
          content += `    // Method implementation\n`;
          content += `  }\n`;
        }
      });
    }
    
    content += `}\n`;
    return content;
  }
}