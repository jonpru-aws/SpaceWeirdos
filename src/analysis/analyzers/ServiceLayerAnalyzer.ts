/**
 * Service Layer Analyzer
 * 
 * Analyzes service layer implementations to identify:
 * - Services with overlapping responsibilities
 * - Duplicate business logic implementations
 * - Circular dependencies and tight coupling issues
 * 
 * Requirements: 5.1, 5.2, 5.3
 */

import { ParsedFile, ClassInfo, FunctionInfo } from '../interfaces/AnalysisInterfaces.js';
import { DuplicationInstance, CodeLocation, ImpactMetrics } from '../types/DuplicationModels.js';
import { SimilarityAnalyzer } from './SimilarityAnalyzer.js';

export interface ServiceInfo {
  name: string;
  filePath: string;
  methods: ServiceMethod[];
  dependencies: string[];
  responsibilities: string[];
  complexity: number;
  linesOfCode: number;
}

export interface ServiceMethod {
  name: string;
  signature: string;
  startLine: number;
  endLine: number;
  complexity: number;
  businessLogic: string[];
  dependencies: string[];
}

export interface ServiceDependency {
  from: string;
  to: string;
  type: 'injection' | 'import' | 'instantiation';
  strength: 'weak' | 'medium' | 'strong';
}

export interface ResponsibilityOverlap {
  services: string[];
  overlappingResponsibilities: string[];
  severity: 'low' | 'medium' | 'high';
  consolidationOpportunity: boolean;
}

export interface CircularDependency {
  cycle: string[];
  severity: 'low' | 'medium' | 'high';
  breakingPoints: string[];
}

export class ServiceLayerAnalyzer {
  private similarityAnalyzer: SimilarityAnalyzer;
  private services: Map<string, ServiceInfo> = new Map();
  private dependencies: ServiceDependency[] = [];

  constructor(similarityAnalyzer: SimilarityAnalyzer) {
    this.similarityAnalyzer = similarityAnalyzer;
  }

  /**
   * Analyzes service layer files to identify duplication and architectural issues
   * Requirements: 5.1, 5.2, 5.3
   */
  async analyzeServiceLayer(files: ParsedFile[]): Promise<DuplicationInstance[]> {
    // Filter service files
    const serviceFiles = this.filterServiceFiles(files);
    
    // Extract service information
    for (const file of serviceFiles) {
      const serviceInfo = this.extractServiceInfo(file);
      if (serviceInfo) {
        this.services.set(serviceInfo.name, serviceInfo);
      }
    }

    // Analyze dependencies
    this.analyzeDependencies(serviceFiles);

    const duplications: DuplicationInstance[] = [];

    // Detect overlapping responsibilities
    const responsibilityOverlaps = this.detectResponsibilityOverlaps();
    duplications.push(...this.createResponsibilityDuplications(responsibilityOverlaps));

    // Detect duplicate business logic
    const businessLogicDuplications = await this.detectDuplicateBusinessLogic();
    duplications.push(...businessLogicDuplications);

    // Detect circular dependencies and tight coupling
    const circularDependencies = this.detectCircularDependencies();
    duplications.push(...this.createDependencyDuplications(circularDependencies));

    return duplications;
  }

  /**
   * Filters files to identify service layer files
   */
  private filterServiceFiles(files: ParsedFile[]): ParsedFile[] {
    return files.filter(file => {
      const isServiceFile = file.filePath.includes('/services/') || 
                           file.filePath.includes('Service.ts') ||
                           file.filePath.includes('Repository.ts') ||
                           file.filePath.includes('Engine.ts');
      
      const hasServiceClass = file.metadata.classes.some(cls => 
        cls.name.endsWith('Service') || 
        cls.name.endsWith('Repository') || 
        cls.name.endsWith('Engine')
      );

      return isServiceFile || hasServiceClass;
    });
  }

  /**
   * Extracts service information from a parsed file
   */
  private extractServiceInfo(file: ParsedFile): ServiceInfo | null {
    const serviceClass = file.metadata.classes.find(cls => 
      cls.name.endsWith('Service') || 
      cls.name.endsWith('Repository') || 
      cls.name.endsWith('Engine')
    );

    if (!serviceClass) {
      return null;
    }

    const methods = serviceClass.methods.map(method => this.extractServiceMethod(method, file));
    const dependencies = this.extractDependencies(file);
    const responsibilities = this.inferResponsibilities(serviceClass, methods);

    return {
      name: serviceClass.name,
      filePath: file.filePath,
      methods,
      dependencies,
      responsibilities,
      complexity: file.metadata.complexity,
      linesOfCode: file.metadata.linesOfCode
    };
  }

  /**
   * Extracts method information for service analysis
   */
  private extractServiceMethod(method: FunctionInfo, file: ParsedFile): ServiceMethod {
    const businessLogic = this.extractBusinessLogic(method, file);
    const dependencies = this.extractMethodDependencies(method, file);

    return {
      name: method.name,
      signature: this.buildMethodSignature(method),
      startLine: method.startLine,
      endLine: method.endLine,
      complexity: method.complexity,
      businessLogic,
      dependencies
    };
  }

  /**
   * Builds a normalized method signature for comparison
   */
  private buildMethodSignature(method: FunctionInfo): string {
    const params = method.parameters.join(', ');
    const returnType = method.returnType || 'void';
    return `${method.name}(${params}): ${returnType}`;
  }

  /**
   * Extracts business logic patterns from method implementation
   */
  private extractBusinessLogic(method: FunctionInfo, file: ParsedFile): string[] {
    const businessLogic: string[] = [];

    // Common business logic patterns
    const patterns = [
      'validation',
      'calculation',
      'transformation',
      'persistence',
      'retrieval',
      'authentication',
      'authorization',
      'notification',
      'logging',
      'caching'
    ];

    // This is a simplified implementation - in a real system, 
    // we would analyze the AST to identify actual business logic patterns
    if (method.name.toLowerCase().includes('validate')) {
      businessLogic.push('validation');
    }
    if (method.name.toLowerCase().includes('calculate') || method.name.toLowerCase().includes('cost')) {
      businessLogic.push('calculation');
    }
    if (method.name.toLowerCase().includes('save') || method.name.toLowerCase().includes('persist')) {
      businessLogic.push('persistence');
    }
    if (method.name.toLowerCase().includes('get') || method.name.toLowerCase().includes('load') || method.name.toLowerCase().includes('find')) {
      businessLogic.push('retrieval');
    }
    if (method.name.toLowerCase().includes('transform') || method.name.toLowerCase().includes('convert')) {
      businessLogic.push('transformation');
    }

    return businessLogic;
  }

  /**
   * Extracts method-level dependencies
   */
  private extractMethodDependencies(method: FunctionInfo, file: ParsedFile): string[] {
    const dependencies: string[] = [];

    // Extract dependencies from imports and method calls
    // This is simplified - real implementation would analyze AST
    file.metadata.imports.forEach(imp => {
      if (imp.module.includes('Service') || imp.module.includes('Repository') || imp.module.includes('Engine')) {
        dependencies.push(...imp.imports);
      }
    });

    return dependencies;
  }

  /**
   * Extracts service-level dependencies
   */
  private extractDependencies(file: ParsedFile): string[] {
    const dependencies: string[] = [];

    file.metadata.imports.forEach(imp => {
      if (imp.module.includes('Service') || imp.module.includes('Repository') || imp.module.includes('Engine')) {
        dependencies.push(...imp.imports);
      }
    });

    return dependencies;
  }

  /**
   * Infers service responsibilities from class and method names
   */
  private inferResponsibilities(serviceClass: ClassInfo, methods: ServiceMethod[]): string[] {
    const responsibilities: string[] = [];

    // Infer from class name
    const className = serviceClass.name.toLowerCase();
    if (className.includes('warband')) responsibilities.push('warband_management');
    if (className.includes('validation')) responsibilities.push('validation');
    if (className.includes('cost')) responsibilities.push('cost_calculation');
    if (className.includes('data') || className.includes('repository')) responsibilities.push('data_persistence');
    if (className.includes('import') || className.includes('export')) responsibilities.push('data_transfer');
    if (className.includes('error')) responsibilities.push('error_handling');

    // Infer from method patterns
    const businessLogicPatterns = new Set<string>();
    methods.forEach(method => {
      method.businessLogic.forEach(logic => businessLogicPatterns.add(logic));
    });

    responsibilities.push(...Array.from(businessLogicPatterns));

    return [...new Set(responsibilities)]; // Remove duplicates
  }

  /**
   * Analyzes dependencies between services
   */
  private analyzeDependencies(files: ParsedFile[]): void {
    this.dependencies = [];

    for (const file of files) {
      const serviceClass = file.metadata.classes.find(cls => 
        cls.name.endsWith('Service') || 
        cls.name.endsWith('Repository') || 
        cls.name.endsWith('Engine')
      );

      if (!serviceClass) continue;

      file.metadata.imports.forEach(imp => {
        if (imp.module.includes('Service') || imp.module.includes('Repository') || imp.module.includes('Engine')) {
          imp.imports.forEach(importedService => {
            this.dependencies.push({
              from: serviceClass.name,
              to: importedService,
              type: 'import',
              strength: this.calculateDependencyStrength(serviceClass, importedService, file)
            });
          });
        }
      });
    }
  }

  /**
   * Calculates the strength of dependency between services
   */
  private calculateDependencyStrength(serviceClass: ClassInfo, dependency: string, file: ParsedFile): 'weak' | 'medium' | 'strong' {
    // Count usage frequency in methods
    let usageCount = 0;
    
    serviceClass.methods.forEach(method => {
      // This is simplified - real implementation would analyze method bodies
      if (method.name.toLowerCase().includes(dependency.toLowerCase())) {
        usageCount++;
      }
    });

    if (usageCount >= 3) return 'strong';
    if (usageCount >= 1) return 'medium';
    return 'weak';
  }

  /**
   * Detects services with overlapping responsibilities
   * Requirements: 5.1
   */
  private detectResponsibilityOverlaps(): ResponsibilityOverlap[] {
    const overlaps: ResponsibilityOverlap[] = [];
    const serviceArray = Array.from(this.services.values());

    for (let i = 0; i < serviceArray.length; i++) {
      for (let j = i + 1; j < serviceArray.length; j++) {
        const service1 = serviceArray[i];
        const service2 = serviceArray[j];

        const commonResponsibilities = service1.responsibilities.filter(r => 
          service2.responsibilities.includes(r)
        );

        if (commonResponsibilities.length > 0) {
          const overlapRatio = commonResponsibilities.length / Math.max(service1.responsibilities.length, service2.responsibilities.length);
          
          let severity: 'low' | 'medium' | 'high' = 'low';
          if (overlapRatio > 0.7) severity = 'high';
          else if (overlapRatio > 0.4) severity = 'medium';

          overlaps.push({
            services: [service1.name, service2.name],
            overlappingResponsibilities: commonResponsibilities,
            severity,
            consolidationOpportunity: severity === 'high' || commonResponsibilities.length >= 3
          });
        }
      }
    }

    return overlaps;
  }

  /**
   * Detects duplicate business logic implementations
   * Requirements: 5.2
   */
  private async detectDuplicateBusinessLogic(): Promise<DuplicationInstance[]> {
    const duplications: DuplicationInstance[] = [];
    const serviceArray = Array.from(this.services.values());

    for (let i = 0; i < serviceArray.length; i++) {
      for (let j = i + 1; j < serviceArray.length; j++) {
        const service1 = serviceArray[i];
        const service2 = serviceArray[j];

        // Compare methods with similar business logic
        for (const method1 of service1.methods) {
          for (const method2 of service2.methods) {
            const similarity = this.calculateBusinessLogicSimilarity(method1, method2);
            
            if (similarity > 0.8) {
              const duplication = await this.createBusinessLogicDuplication(
                service1, method1, service2, method2, similarity
              );
              duplications.push(duplication);
            }
          }
        }
      }
    }

    return duplications;
  }

  /**
   * Calculates similarity between business logic implementations
   */
  private calculateBusinessLogicSimilarity(method1: ServiceMethod, method2: ServiceMethod): number {
    // Compare business logic patterns
    const commonLogic = method1.businessLogic.filter(logic => 
      method2.businessLogic.includes(logic)
    );
    
    const totalLogic = new Set([...method1.businessLogic, ...method2.businessLogic]).size;
    const logicSimilarity = totalLogic > 0 ? commonLogic.length / totalLogic : 0;

    // Compare method signatures using simple string similarity
    const signatureSimilarity = this.calculateStringSimilarity(
      method1.signature, method2.signature
    );

    // Weighted average
    return (logicSimilarity * 0.7) + (signatureSimilarity * 0.3);
  }

  /**
   * Simple string similarity calculation
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Creates a duplication instance for business logic similarity
   */
  private async createBusinessLogicDuplication(
    service1: ServiceInfo, method1: ServiceMethod,
    service2: ServiceInfo, method2: ServiceMethod,
    similarity: number
  ): Promise<DuplicationInstance> {
    const locations: CodeLocation[] = [
      {
        filePath: service1.filePath,
        startLine: method1.startLine,
        endLine: method1.endLine,
        codeBlock: method1.signature,
        context: `${service1.name}.${method1.name}`
      },
      {
        filePath: service2.filePath,
        startLine: method2.startLine,
        endLine: method2.endLine,
        codeBlock: method2.signature,
        context: `${service2.name}.${method2.name}`
      }
    ];

    const impact: ImpactMetrics = {
      linesOfCode: (method1.endLine - method1.startLine) + (method2.endLine - method2.startLine),
      complexity: method1.complexity + method2.complexity,
      maintainabilityIndex: 0.7, // Reduced due to duplication
      testCoverage: 0.8 // Assumed coverage
    };

    return {
      id: `service-logic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'functional',
      similarity,
      locations,
      description: `Duplicate business logic between ${service1.name}.${method1.name} and ${service2.name}.${method2.name}`,
      impact
    };
  }

  /**
   * Detects circular dependencies and tight coupling
   * Requirements: 5.3
   */
  private detectCircularDependencies(): CircularDependency[] {
    const cycles: CircularDependency[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const service of this.services.keys()) {
      if (!visited.has(service)) {
        const cycle = this.findCycle(service, visited, recursionStack, []);
        if (cycle.length > 0) {
          cycles.push({
            cycle,
            severity: this.calculateCycleSeverity(cycle),
            breakingPoints: this.identifyBreakingPoints(cycle)
          });
        }
      }
    }

    return cycles;
  }

  /**
   * Finds circular dependencies using DFS
   */
  private findCycle(
    service: string, 
    visited: Set<string>, 
    recursionStack: Set<string>, 
    path: string[]
  ): string[] {
    visited.add(service);
    recursionStack.add(service);
    path.push(service);

    const dependencies = this.dependencies.filter(dep => dep.from === service);
    
    for (const dep of dependencies) {
      if (!visited.has(dep.to)) {
        const cycle = this.findCycle(dep.to, visited, recursionStack, [...path]);
        if (cycle.length > 0) return cycle;
      } else if (recursionStack.has(dep.to)) {
        // Found a cycle
        const cycleStart = path.indexOf(dep.to);
        return path.slice(cycleStart).concat([dep.to]);
      }
    }

    recursionStack.delete(service);
    return [];
  }

  /**
   * Calculates the severity of a circular dependency
   */
  private calculateCycleSeverity(cycle: string[]): 'low' | 'medium' | 'high' {
    if (cycle.length > 4) return 'high';
    if (cycle.length > 2) return 'medium';
    return 'low';
  }

  /**
   * Identifies potential breaking points in circular dependencies
   */
  private identifyBreakingPoints(cycle: string[]): string[] {
    const breakingPoints: string[] = [];

    for (let i = 0; i < cycle.length - 1; i++) {
      const from = cycle[i];
      const to = cycle[i + 1];
      
      const dependency = this.dependencies.find(dep => dep.from === from && dep.to === to);
      if (dependency && dependency.strength === 'weak') {
        breakingPoints.push(`${from} -> ${to}`);
      }
    }

    return breakingPoints;
  }

  /**
   * Creates duplication instances for responsibility overlaps
   */
  private createResponsibilityDuplications(overlaps: ResponsibilityOverlap[]): DuplicationInstance[] {
    return overlaps.map(overlap => {
      const service1 = this.services.get(overlap.services[0])!;
      const service2 = this.services.get(overlap.services[1])!;

      const locations: CodeLocation[] = [
        {
          filePath: service1.filePath,
          startLine: 1,
          endLine: service1.linesOfCode,
          codeBlock: service1.name,
          context: `Service: ${service1.name}`
        },
        {
          filePath: service2.filePath,
          startLine: 1,
          endLine: service2.linesOfCode,
          codeBlock: service2.name,
          context: `Service: ${service2.name}`
        }
      ];

      const impact: ImpactMetrics = {
        linesOfCode: service1.linesOfCode + service2.linesOfCode,
        complexity: service1.complexity + service2.complexity,
        maintainabilityIndex: overlap.severity === 'high' ? 0.5 : 0.7,
        testCoverage: 0.8
      };

      return {
        id: `service-responsibility-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'pattern',
        similarity: overlap.overlappingResponsibilities.length / Math.max(service1.responsibilities.length, service2.responsibilities.length),
        locations,
        description: `Overlapping responsibilities between ${service1.name} and ${service2.name}: ${overlap.overlappingResponsibilities.join(', ')}`,
        impact
      };
    });
  }

  /**
   * Creates duplication instances for circular dependencies
   */
  private createDependencyDuplications(cycles: CircularDependency[]): DuplicationInstance[] {
    return cycles.map(cycle => {
      const locations: CodeLocation[] = cycle.cycle.slice(0, -1).map(serviceName => {
        const service = this.services.get(serviceName);
        return {
          filePath: service?.filePath || '',
          startLine: 1,
          endLine: service?.linesOfCode || 0,
          codeBlock: serviceName,
          context: `Circular dependency: ${serviceName}`
        };
      });

      const totalComplexity = cycle.cycle.slice(0, -1).reduce((sum, serviceName) => {
        const service = this.services.get(serviceName);
        return sum + (service?.complexity || 0);
      }, 0);

      const totalLinesOfCode = cycle.cycle.slice(0, -1).reduce((sum, serviceName) => {
        const service = this.services.get(serviceName);
        return sum + (service?.linesOfCode || 0);
      }, 0);

      const impact: ImpactMetrics = {
        linesOfCode: totalLinesOfCode,
        complexity: totalComplexity,
        maintainabilityIndex: cycle.severity === 'high' ? 0.3 : 0.5,
        testCoverage: 0.6 // Lower due to coupling
      };

      return {
        id: `service-circular-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'pattern',
        similarity: 1.0, // Circular dependencies are exact architectural issues
        locations,
        description: `Circular dependency detected: ${cycle.cycle.join(' -> ')}`,
        impact
      };
    });
  }

  /**
   * Gets all analyzed services
   */
  getServices(): Map<string, ServiceInfo> {
    return this.services;
  }

  /**
   * Gets all detected dependencies
   */
  getDependencies(): ServiceDependency[] {
    return this.dependencies;
  }
}