/**
 * Service Consolidation Analyzer
 * 
 * Analyzes service layer to provide consolidation recommendations:
 * - Shared interfaces and base class opportunities
 * - Service refactoring and consolidation strategies
 * - Architectural improvement suggestions
 * 
 * Requirements: 5.4, 5.5
 */

import { OptimizationRecommendation, ComplexityRating, Risk, ImplementationStep } from '../types/DuplicationModels.js';
import { ServiceInfo, ServiceMethod, ServiceDependency, ServiceLayerAnalyzer } from './ServiceLayerAnalyzer.js';

export interface SharedInterfaceOpportunity {
  interfaceName: string;
  services: string[];
  commonMethods: ServiceMethod[];
  benefits: string[];
  complexity: 'low' | 'medium' | 'high';
}

export interface BaseClassOpportunity {
  baseClassName: string;
  services: string[];
  commonFunctionality: string[];
  abstractMethods: string[];
  benefits: string[];
  complexity: 'low' | 'medium' | 'high';
}

export interface ServiceMergeOpportunity {
  targetService: string;
  servicesToMerge: string[];
  mergeStrategy: 'full_merge' | 'partial_merge' | 'composition';
  benefits: string[];
  risks: string[];
  complexity: 'low' | 'medium' | 'high';
}

export interface ArchitecturalImprovement {
  type: 'dependency_injection' | 'factory_pattern' | 'strategy_pattern' | 'facade_pattern';
  description: string;
  affectedServices: string[];
  benefits: string[];
  implementationEffort: 'low' | 'medium' | 'high';
}

export class ServiceConsolidationAnalyzer {
  private services: Map<string, ServiceInfo>;
  private dependencies: ServiceDependency[];

  constructor(serviceAnalyzer: ServiceLayerAnalyzer) {
    this.services = serviceAnalyzer.getServices();
    this.dependencies = serviceAnalyzer.getDependencies();
  }

  /**
   * Generates comprehensive service consolidation recommendations
   * Requirements: 5.4, 5.5
   */
  generateConsolidationRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze shared interface opportunities
    const sharedInterfaces = this.analyzeSharedInterfaceOpportunities();
    recommendations.push(...this.createSharedInterfaceRecommendations(sharedInterfaces));

    // Analyze base class opportunities
    const baseClasses = this.analyzeBaseClassOpportunities();
    recommendations.push(...this.createBaseClassRecommendations(baseClasses));

    // Analyze service merge opportunities
    const mergeOpportunities = this.analyzeServiceMergeOpportunities();
    recommendations.push(...this.createServiceMergeRecommendations(mergeOpportunities));

    // Analyze architectural improvements
    const architecturalImprovements = this.analyzeArchitecturalImprovements();
    recommendations.push(...this.createArchitecturalRecommendations(architecturalImprovements));

    return recommendations;
  }

  /**
   * Analyzes opportunities for shared interfaces
   * Requirements: 5.4
   */
  private analyzeSharedInterfaceOpportunities(): SharedInterfaceOpportunity[] {
    const opportunities: SharedInterfaceOpportunity[] = [];
    const serviceArray = Array.from(this.services.values());

    // Group services by similar method signatures
    const methodGroups = this.groupServicesByMethods(serviceArray);

    for (const [methodSignature, services] of methodGroups) {
      if (services.length >= 2) {
        const commonMethods = this.findCommonMethods(services);
        
        if (commonMethods.length >= 2) {
          const interfaceName = this.generateInterfaceName(methodSignature, services);
          
          opportunities.push({
            interfaceName,
            services: services.map(s => s.name),
            commonMethods,
            benefits: this.calculateInterfaceBenefits(services, commonMethods),
            complexity: this.calculateInterfaceComplexity(services, commonMethods)
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Groups services by similar method patterns
   */
  private groupServicesByMethods(services: ServiceInfo[]): Map<string, ServiceInfo[]> {
    const groups = new Map<string, ServiceInfo[]>();

    for (const service of services) {
      for (const method of service.methods) {
        const key = this.normalizeMethodSignature(method.signature);
        
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        
        const existingServices = groups.get(key)!;
        if (!existingServices.some(s => s.name === service.name)) {
          existingServices.push(service);
        }
      }
    }

    return groups;
  }

  /**
   * Normalizes method signature for comparison
   */
  private normalizeMethodSignature(signature: string): string {
    // Remove specific type names and focus on structure
    return signature
      .replace(/\b[A-Z][a-zA-Z]*\b/g, 'Type') // Replace type names
      .replace(/\bid\b/g, 'identifier') // Normalize common parameter names
      .replace(/\bdata\b/g, 'payload');
  }

  /**
   * Finds common methods across services
   */
  private findCommonMethods(services: ServiceInfo[]): ServiceMethod[] {
    if (services.length === 0) return [];

    const firstService = services[0];
    const commonMethods: ServiceMethod[] = [];

    for (const method of firstService.methods) {
      const isCommon = services.every(service => 
        service.methods.some(m => 
          this.normalizeMethodSignature(m.signature) === this.normalizeMethodSignature(method.signature)
        )
      );

      if (isCommon) {
        commonMethods.push(method);
      }
    }

    return commonMethods;
  }

  /**
   * Generates appropriate interface name
   */
  private generateInterfaceName(methodSignature: string, services: ServiceInfo[]): string {
    // Extract common functionality from service names
    const serviceNames = services.map(s => s.name);
    const commonWords = this.findCommonWords(serviceNames);
    
    if (commonWords.length > 0) {
      return `I${commonWords[0]}Operations`;
    }

    // Fallback to method-based naming
    const methodName = methodSignature.split('(')[0];
    return `I${this.capitalize(methodName)}Provider`;
  }

  /**
   * Finds common words in service names
   */
  private findCommonWords(names: string[]): string[] {
    const words = names.map(name => 
      name.replace(/Service|Repository|Engine/g, '').split(/(?=[A-Z])/).filter(w => w.length > 2)
    );

    if (words.length === 0) return [];

    const firstWords = words[0];
    return firstWords.filter(word => 
      words.every(wordList => wordList.includes(word))
    );
  }

  /**
   * Capitalizes first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Calculates benefits of creating shared interface
   */
  private calculateInterfaceBenefits(services: ServiceInfo[], commonMethods: ServiceMethod[]): string[] {
    const benefits: string[] = [];

    benefits.push(`Standardizes interface across ${services.length} services`);
    benefits.push(`Enables polymorphic usage of ${commonMethods.length} common methods`);
    benefits.push('Improves testability through interface mocking');
    benefits.push('Reduces coupling between services and their consumers');

    if (services.length >= 3) {
      benefits.push('Enables factory pattern implementation');
    }

    return benefits;
  }

  /**
   * Calculates complexity of interface implementation
   */
  private calculateInterfaceComplexity(services: ServiceInfo[], commonMethods: ServiceMethod[]): 'low' | 'medium' | 'high' {
    const totalMethods = services.reduce((sum, s) => sum + s.methods.length, 0);
    const complexityScore = commonMethods.reduce((sum, m) => sum + m.complexity, 0);

    if (complexityScore > 20 || totalMethods > 50) return 'high';
    if (complexityScore > 10 || totalMethods > 20) return 'medium';
    return 'low';
  }

  /**
   * Analyzes opportunities for base classes
   * Requirements: 5.4
   */
  private analyzeBaseClassOpportunities(): BaseClassOpportunity[] {
    const opportunities: BaseClassOpportunity[] = [];
    const serviceArray = Array.from(this.services.values());

    // Group services by common functionality patterns
    const functionalityGroups = this.groupServicesByFunctionality(serviceArray);

    for (const [functionality, services] of functionalityGroups) {
      if (services.length >= 2) {
        const commonFunctionality = this.findCommonFunctionality(services);
        const abstractMethods = this.identifyAbstractMethods(services);

        if (commonFunctionality.length >= 2) {
          opportunities.push({
            baseClassName: this.generateBaseClassName(functionality, services),
            services: services.map(s => s.name),
            commonFunctionality,
            abstractMethods,
            benefits: this.calculateBaseClassBenefits(services, commonFunctionality),
            complexity: this.calculateBaseClassComplexity(services, commonFunctionality)
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Groups services by common functionality
   */
  private groupServicesByFunctionality(services: ServiceInfo[]): Map<string, ServiceInfo[]> {
    const groups = new Map<string, ServiceInfo[]>();

    for (const service of services) {
      for (const responsibility of service.responsibilities) {
        if (!groups.has(responsibility)) {
          groups.set(responsibility, []);
        }
        groups.get(responsibility)!.push(service);
      }
    }

    return groups;
  }

  /**
   * Finds common functionality across services
   */
  private findCommonFunctionality(services: ServiceInfo[]): string[] {
    if (services.length === 0) return [];

    const firstService = services[0];
    return firstService.responsibilities.filter(responsibility =>
      services.every(service => service.responsibilities.includes(responsibility))
    );
  }

  /**
   * Identifies methods that should be abstract in base class
   */
  private identifyAbstractMethods(services: ServiceInfo[]): string[] {
    const abstractMethods: string[] = [];
    const allMethods = new Set<string>();

    // Collect all unique method names
    services.forEach(service => {
      service.methods.forEach(method => {
        allMethods.add(method.name);
      });
    });

    // Methods that exist in some but not all services should be abstract
    for (const methodName of allMethods) {
      const servicesWithMethod = services.filter(service =>
        service.methods.some(method => method.name === methodName)
      );

      if (servicesWithMethod.length > 1 && servicesWithMethod.length < services.length) {
        abstractMethods.push(methodName);
      }
    }

    return abstractMethods;
  }

  /**
   * Generates appropriate base class name
   */
  private generateBaseClassName(functionality: string, _services: ServiceInfo[]): string {
    const functionalityName = this.capitalize(functionality.replace(/_/g, ''));
    return `Base${functionalityName}Service`;
  }

  /**
   * Calculates benefits of creating base class
   */
  private calculateBaseClassBenefits(services: ServiceInfo[], commonFunctionality: string[]): string[] {
    const benefits: string[] = [];

    benefits.push(`Eliminates code duplication across ${services.length} services`);
    benefits.push(`Centralizes ${commonFunctionality.length} common responsibilities`);
    benefits.push('Provides consistent implementation patterns');
    benefits.push('Simplifies maintenance and updates');
    benefits.push('Enables template method pattern usage');

    return benefits;
  }

  /**
   * Calculates complexity of base class implementation
   */
  private calculateBaseClassComplexity(services: ServiceInfo[], commonFunctionality: string[]): 'low' | 'medium' | 'high' {
    const totalComplexity = services.reduce((sum, s) => sum + s.complexity, 0);
    const avgComplexity = totalComplexity / services.length;

    if (avgComplexity > 15 || commonFunctionality.length > 5) return 'high';
    if (avgComplexity > 8 || commonFunctionality.length > 3) return 'medium';
    return 'low';
  }

  /**
   * Analyzes service merge opportunities
   * Requirements: 5.5
   */
  private analyzeServiceMergeOpportunities(): ServiceMergeOpportunity[] {
    const opportunities: ServiceMergeOpportunity[] = [];
    const serviceArray = Array.from(this.services.values());

    // Find services with high responsibility overlap
    for (let i = 0; i < serviceArray.length; i++) {
      for (let j = i + 1; j < serviceArray.length; j++) {
        const service1 = serviceArray[i];
        const service2 = serviceArray[j];

        const overlapRatio = this.calculateResponsibilityOverlap(service1, service2);
        
        if (overlapRatio > 0.6) {
          const mergeStrategy = this.determineMergeStrategy(service1, service2, overlapRatio);
          
          opportunities.push({
            targetService: service1.name,
            servicesToMerge: [service2.name],
            mergeStrategy,
            benefits: this.calculateMergeBenefits(service1, service2, mergeStrategy),
            risks: this.calculateMergeRisks(service1, service2, mergeStrategy),
            complexity: this.calculateMergeComplexity(service1, service2, mergeStrategy)
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Calculates responsibility overlap between services
   */
  private calculateResponsibilityOverlap(service1: ServiceInfo, service2: ServiceInfo): number {
    const commonResponsibilities = service1.responsibilities.filter(r =>
      service2.responsibilities.includes(r)
    );

    const totalResponsibilities = new Set([...service1.responsibilities, ...service2.responsibilities]).size;
    return totalResponsibilities > 0 ? commonResponsibilities.length / totalResponsibilities : 0;
  }

  /**
   * Determines appropriate merge strategy
   */
  private determineMergeStrategy(_service1: ServiceInfo, _service2: ServiceInfo, overlapRatio: number): 'full_merge' | 'partial_merge' | 'composition' {
    if (overlapRatio > 0.8) return 'full_merge';
    if (overlapRatio > 0.6) return 'partial_merge';
    return 'composition';
  }

  /**
   * Calculates benefits of service merge
   */
  private calculateMergeBenefits(service1: ServiceInfo, service2: ServiceInfo, strategy: string): string[] {
    const benefits: string[] = [];

    benefits.push('Reduces code duplication and maintenance overhead');
    benefits.push('Simplifies service layer architecture');
    benefits.push('Improves cohesion of related functionality');

    if (strategy === 'full_merge') {
      benefits.push('Eliminates redundant service instances');
      benefits.push('Reduces memory footprint');
    }

    const totalLinesOfCode = service1.linesOfCode + service2.linesOfCode;
    const estimatedReduction = Math.floor(totalLinesOfCode * 0.2);
    benefits.push(`Potential reduction of ~${estimatedReduction} lines of code`);

    return benefits;
  }

  /**
   * Calculates risks of service merge
   */
  private calculateMergeRisks(service1: ServiceInfo, service2: ServiceInfo, strategy: string): string[] {
    const risks: string[] = [];

    risks.push('May increase service complexity and responsibility scope');
    risks.push('Requires careful testing of merged functionality');

    if (strategy === 'full_merge') {
      risks.push('Breaking changes to existing service consumers');
      risks.push('Potential performance impact from larger service');
    }

    const dependencyCount = this.dependencies.filter(d => 
      d.from === service1.name || d.from === service2.name ||
      d.to === service1.name || d.to === service2.name
    ).length;

    if (dependencyCount > 5) {
      risks.push('High number of dependencies may complicate merge');
    }

    return risks;
  }

  /**
   * Calculates complexity of service merge
   */
  private calculateMergeComplexity(service1: ServiceInfo, service2: ServiceInfo, strategy: string): 'low' | 'medium' | 'high' {
    const totalComplexity = service1.complexity + service2.complexity;
    const totalMethods = service1.methods.length + service2.methods.length;

    if (strategy === 'full_merge' && (totalComplexity > 25 || totalMethods > 20)) return 'high';
    if (totalComplexity > 15 || totalMethods > 12) return 'medium';
    return 'low';
  }

  /**
   * Analyzes architectural improvements
   * Requirements: 5.5
   */
  private analyzeArchitecturalImprovements(): ArchitecturalImprovement[] {
    const improvements: ArchitecturalImprovement[] = [];

    // Analyze dependency injection opportunities
    improvements.push(...this.analyzeDependencyInjectionOpportunities());

    // Analyze factory pattern opportunities
    improvements.push(...this.analyzeFactoryPatternOpportunities());

    // Analyze strategy pattern opportunities
    improvements.push(...this.analyzeStrategyPatternOpportunities());

    // Analyze facade pattern opportunities
    improvements.push(...this.analyzeFacadePatternOpportunities());

    return improvements;
  }

  /**
   * Analyzes dependency injection opportunities
   */
  private analyzeDependencyInjectionOpportunities(): ArchitecturalImprovement[] {
    const improvements: ArchitecturalImprovement[] = [];

    // Find services with hard-coded dependencies
    const servicesWithHardDependencies = Array.from(this.services.values()).filter(service => {
      return this.dependencies.some(dep => 
        dep.from === service.name && dep.type === 'instantiation'
      );
    });

    if (servicesWithHardDependencies.length > 0) {
      improvements.push({
        type: 'dependency_injection',
        description: 'Replace hard-coded service instantiation with dependency injection',
        affectedServices: servicesWithHardDependencies.map(s => s.name),
        benefits: [
          'Improves testability through dependency mocking',
          'Reduces coupling between services',
          'Enables runtime service configuration',
          'Facilitates service lifecycle management'
        ],
        implementationEffort: servicesWithHardDependencies.length > 3 ? 'high' : 'medium'
      });
    }

    return improvements;
  }

  /**
   * Analyzes factory pattern opportunities
   */
  private analyzeFactoryPatternOpportunities(): ArchitecturalImprovement[] {
    const improvements: ArchitecturalImprovement[] = [];

    // Find services that create similar objects
    const creationServices = Array.from(this.services.values()).filter(service =>
      service.methods.some(method => 
        method.name.toLowerCase().includes('create') || 
        method.name.toLowerCase().includes('build')
      )
    );

    if (creationServices.length >= 2) {
      improvements.push({
        type: 'factory_pattern',
        description: 'Implement factory pattern for object creation consistency',
        affectedServices: creationServices.map(s => s.name),
        benefits: [
          'Centralizes object creation logic',
          'Ensures consistent object initialization',
          'Simplifies object creation complexity',
          'Enables creation strategy variations'
        ],
        implementationEffort: 'medium'
      });
    }

    return improvements;
  }

  /**
   * Analyzes strategy pattern opportunities
   */
  private analyzeStrategyPatternOpportunities(): ArchitecturalImprovement[] {
    const improvements: ArchitecturalImprovement[] = [];

    // Find services with similar algorithms or calculations
    const calculationServices = Array.from(this.services.values()).filter(service =>
      service.responsibilities.includes('calculation') ||
      service.methods.some(method => method.businessLogic.includes('calculation'))
    );

    if (calculationServices.length >= 2) {
      improvements.push({
        type: 'strategy_pattern',
        description: 'Implement strategy pattern for algorithm variations',
        affectedServices: calculationServices.map(s => s.name),
        benefits: [
          'Enables runtime algorithm selection',
          'Simplifies adding new calculation strategies',
          'Improves code organization and maintainability',
          'Reduces conditional complexity'
        ],
        implementationEffort: 'medium'
      });
    }

    return improvements;
  }

  /**
   * Analyzes facade pattern opportunities
   */
  private analyzeFacadePatternOpportunities(): ArchitecturalImprovement[] {
    const improvements: ArchitecturalImprovement[] = [];

    // Find complex service interactions that could benefit from facade
    const complexInteractions = this.findComplexServiceInteractions();

    if (complexInteractions.length > 0) {
      improvements.push({
        type: 'facade_pattern',
        description: 'Implement facade pattern to simplify complex service interactions',
        affectedServices: complexInteractions,
        benefits: [
          'Simplifies client interaction with service layer',
          'Reduces coupling between clients and multiple services',
          'Provides unified interface for related operations',
          'Improves API usability and consistency'
        ],
        implementationEffort: 'high'
      });
    }

    return improvements;
  }

  /**
   * Finds complex service interactions
   */
  private findComplexServiceInteractions(): string[] {
    const interactionCounts = new Map<string, number>();

    // Count how many services each service depends on
    this.dependencies.forEach(dep => {
      const count = interactionCounts.get(dep.from) || 0;
      interactionCounts.set(dep.from, count + 1);
    });

    // Return services with high interaction counts
    return Array.from(interactionCounts.entries())
      .filter(([_, count]) => count >= 3)
      .map(([service, _]) => service);
  }

  /**
   * Creates shared interface recommendations
   */
  private createSharedInterfaceRecommendations(opportunities: SharedInterfaceOpportunity[]): OptimizationRecommendation[] {
    return opportunities.map(opportunity => {
      const complexity: ComplexityRating = {
        level: opportunity.complexity,
        factors: [
          `${opportunity.services.length} services affected`,
          `${opportunity.commonMethods.length} methods to standardize`,
          'Interface design and implementation required'
        ],
        reasoning: `Creating shared interface for ${opportunity.services.length} services with ${opportunity.commonMethods.length} common methods`
      };

      const risks: Risk[] = [
        {
          type: 'breaking_change',
          severity: 'medium',
          description: 'Existing service consumers may need updates',
          mitigation: 'Implement interface gradually with backward compatibility'
        }
      ];

      const steps: ImplementationStep[] = [
        {
          order: 1,
          title: 'Define shared interface',
          description: `Create ${opportunity.interfaceName} interface with common method signatures`,
          validation: 'Interface compiles without errors'
        },
        {
          order: 2,
          title: 'Update services to implement interface',
          description: 'Modify each service to implement the shared interface',
          validation: 'All services implement interface correctly'
        },
        {
          order: 3,
          title: 'Update service consumers',
          description: 'Update code that uses services to work with interface',
          validation: 'All consumers work with interface-based services'
        }
      ];

      return {
        id: `shared-interface-${opportunity.interfaceName.toLowerCase()}`,
        title: `Create Shared Interface: ${opportunity.interfaceName}`,
        description: `Implement shared interface for ${opportunity.services.join(', ')} to standardize common operations`,
        type: 'abstraction',
        priority: opportunity.services.length >= 3 ? 'high' : 'medium',
        complexity,
        estimatedEffort: {
          hours: opportunity.services.length * 4,
          complexity,
          dependencies: opportunity.services
        },
        benefits: opportunity.benefits,
        risks,
        implementationPlan: steps,
        affectedFiles: opportunity.services.map(service => {
          const serviceInfo = this.services.get(service);
          return serviceInfo?.filePath || '';
        }).filter(path => path !== '')
      };
    });
  }

  /**
   * Creates base class recommendations
   */
  private createBaseClassRecommendations(opportunities: BaseClassOpportunity[]): OptimizationRecommendation[] {
    return opportunities.map(opportunity => {
      const complexity: ComplexityRating = {
        level: opportunity.complexity,
        factors: [
          `${opportunity.services.length} services to refactor`,
          `${opportunity.commonFunctionality.length} common responsibilities`,
          `${opportunity.abstractMethods.length} abstract methods to define`
        ],
        reasoning: `Creating base class for ${opportunity.services.length} services with shared functionality`
      };

      const risks: Risk[] = [
        {
          type: 'breaking_change',
          severity: 'high',
          description: 'Service inheritance hierarchy changes',
          mitigation: 'Implement base class incrementally with thorough testing'
        }
      ];

      const steps: ImplementationStep[] = [
        {
          order: 1,
          title: 'Create base class',
          description: `Implement ${opportunity.baseClassName} with common functionality`,
          validation: 'Base class compiles and provides expected functionality'
        },
        {
          order: 2,
          title: 'Refactor services to extend base class',
          description: 'Update each service to extend the base class',
          validation: 'All services extend base class correctly'
        },
        {
          order: 3,
          title: 'Remove duplicate code',
          description: 'Remove duplicated functionality from child services',
          validation: 'No duplicate code remains in child services'
        }
      ];

      return {
        id: `base-class-${opportunity.baseClassName.toLowerCase()}`,
        title: `Create Base Class: ${opportunity.baseClassName}`,
        description: `Implement base class for ${opportunity.services.join(', ')} to eliminate code duplication`,
        type: 'consolidation',
        priority: 'high',
        complexity,
        estimatedEffort: {
          hours: opportunity.services.length * 6,
          complexity,
          dependencies: opportunity.services
        },
        benefits: opportunity.benefits,
        risks,
        implementationPlan: steps,
        affectedFiles: opportunity.services.map(service => {
          const serviceInfo = this.services.get(service);
          return serviceInfo?.filePath || '';
        }).filter(path => path !== '')
      };
    });
  }

  /**
   * Creates service merge recommendations
   */
  private createServiceMergeRecommendations(opportunities: ServiceMergeOpportunity[]): OptimizationRecommendation[] {
    return opportunities.map(opportunity => {
      const complexity: ComplexityRating = {
        level: opportunity.complexity,
        factors: [
          `${opportunity.servicesToMerge.length + 1} services involved`,
          `${opportunity.mergeStrategy} merge strategy`,
          'Dependency updates required'
        ],
        reasoning: `Merging services using ${opportunity.mergeStrategy} strategy`
      };

      const risks: Risk[] = opportunity.risks.map(risk => ({
        type: 'breaking_change',
        severity: 'medium',
        description: risk,
        mitigation: 'Implement merge gradually with comprehensive testing'
      }));

      const steps: ImplementationStep[] = [
        {
          order: 1,
          title: 'Plan merge strategy',
          description: `Plan ${opportunity.mergeStrategy} merge of services`,
          validation: 'Merge plan reviewed and approved'
        },
        {
          order: 2,
          title: 'Implement merged service',
          description: `Merge ${opportunity.servicesToMerge.join(', ')} into ${opportunity.targetService}`,
          validation: 'Merged service provides all required functionality'
        },
        {
          order: 3,
          title: 'Update dependencies',
          description: 'Update all service consumers to use merged service',
          validation: 'All dependencies updated and working correctly'
        }
      ];

      return {
        id: `service-merge-${opportunity.targetService.toLowerCase()}`,
        title: `Merge Services: ${opportunity.servicesToMerge.join(', ')} into ${opportunity.targetService}`,
        description: `Consolidate related services to reduce duplication and improve cohesion`,
        type: 'consolidation',
        priority: 'medium',
        complexity,
        estimatedEffort: {
          hours: (opportunity.servicesToMerge.length + 1) * 8,
          complexity,
          dependencies: [opportunity.targetService, ...opportunity.servicesToMerge]
        },
        benefits: opportunity.benefits,
        risks,
        implementationPlan: steps,
        affectedFiles: [opportunity.targetService, ...opportunity.servicesToMerge].map(service => {
          const serviceInfo = this.services.get(service);
          return serviceInfo?.filePath || '';
        }).filter(path => path !== '')
      };
    });
  }

  /**
   * Creates architectural improvement recommendations
   */
  private createArchitecturalRecommendations(improvements: ArchitecturalImprovement[]): OptimizationRecommendation[] {
    return improvements.map(improvement => {
      const complexity: ComplexityRating = {
        level: improvement.implementationEffort,
        factors: [
          `${improvement.affectedServices.length} services affected`,
          `${improvement.type} pattern implementation`,
          'Architectural changes required'
        ],
        reasoning: `Implementing ${improvement.type} pattern across multiple services`
      };

      const risks: Risk[] = [
        {
          type: 'breaking_change',
          severity: improvement.implementationEffort === 'high' ? 'high' : 'medium',
          description: 'Architectural changes may affect existing functionality',
          mitigation: 'Implement pattern incrementally with thorough testing'
        }
      ];

      const steps: ImplementationStep[] = [
        {
          order: 1,
          title: `Design ${improvement.type} implementation`,
          description: improvement.description,
          validation: 'Design reviewed and approved'
        },
        {
          order: 2,
          title: 'Implement pattern',
          description: `Implement ${improvement.type} across affected services`,
          validation: 'Pattern implemented correctly'
        },
        {
          order: 3,
          title: 'Update service consumers',
          description: 'Update code to use new architectural pattern',
          validation: 'All consumers updated and working correctly'
        }
      ];

      return {
        id: `architectural-${improvement.type}`,
        title: `Implement ${improvement.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        description: improvement.description,
        type: 'refactoring',
        priority: improvement.implementationEffort === 'high' ? 'high' : 'medium',
        complexity,
        estimatedEffort: {
          hours: improvement.affectedServices.length * (improvement.implementationEffort === 'high' ? 12 : 8),
          complexity,
          dependencies: improvement.affectedServices
        },
        benefits: improvement.benefits,
        risks,
        implementationPlan: steps,
        affectedFiles: improvement.affectedServices.map(service => {
          const serviceInfo = this.services.get(service);
          return serviceInfo?.filePath || '';
        }).filter(path => path !== '')
      };
    });
  }
}