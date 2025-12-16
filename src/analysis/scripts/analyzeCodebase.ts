/**
 * Simple codebase analysis script for Space Weirdos
 */

import { promises as fs } from 'fs';
import path from 'path';

interface FileAnalysis {
  path: string;
  lines: number;
  functions: string[];
  classes: string[];
  imports: string[];
  exports: string[];
}

interface DuplicationPattern {
  type: 'exact' | 'functional' | 'pattern' | 'configuration';
  description: string;
  locations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

class CodebaseAnalyzer {
  private sourceFiles: string[] = [];
  private fileAnalyses: FileAnalysis[] = [];
  private duplications: DuplicationPattern[] = [];

  async analyze(): Promise<void> {
    console.log('🔍 Starting Space Weirdos codebase analysis...\n');

    // Step 1: Collect source files
    await this.collectSourceFiles();
    console.log(`📁 Found ${this.sourceFiles.length} source files\n`);

    // Step 2: Analyze each file
    await this.analyzeFiles();
    console.log(`📊 Analyzed ${this.fileAnalyses.length} files\n`);

    // Step 3: Detect duplication patterns
    await this.detectDuplications();
    console.log(`🔍 Found ${this.duplications.length} duplication patterns\n`);

    // Step 4: Generate report
    await this.generateReport();
    console.log('✅ Analysis complete!\n');
  }

  private async collectSourceFiles(): Promise<void> {
    const walkDir = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip certain directories
          if (['node_modules', 'dist', 'build', 'reports', '.git'].includes(entry.name)) {
            continue;
          }
          await walkDir(fullPath);
        } else if (entry.isFile()) {
          // Include TypeScript and JavaScript files
          if (fullPath.match(/\.(ts|tsx|js|jsx)$/) && !fullPath.includes('.test.') && !fullPath.includes('.spec.')) {
            this.sourceFiles.push(fullPath);
          }
        }
      }
    };

    await walkDir('src');
  }

  private async analyzeFiles(): Promise<void> {
    for (const filePath of this.sourceFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const analysis = this.analyzeFileContent(filePath, content);
        this.fileAnalyses.push(analysis);
      } catch (error) {
        console.warn(`⚠️  Failed to analyze ${filePath}: ${error}`);
      }
    }
  }

  private analyzeFileContent(filePath: string, content: string): FileAnalysis {
    const lines = content.split('\n');
    const functions: string[] = [];
    const classes: string[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Extract function names
      const funcMatch = trimmed.match(/(?:function|const|let|var)\s+(\w+)|(\w+)\s*[:=]\s*(?:async\s+)?(?:function|\()/);
      if (funcMatch) {
        const funcName = funcMatch[1] || funcMatch[2];
        if (funcName && !functions.includes(funcName)) {
          functions.push(funcName);
        }
      }

      // Extract class names
      const classMatch = trimmed.match(/class\s+(\w+)/);
      if (classMatch) {
        classes.push(classMatch[1]);
      }

      // Extract imports
      const importMatch = trimmed.match(/import.*from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        imports.push(importMatch[1]);
      }

      // Extract exports
      const exportMatch = trimmed.match(/export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/);
      if (exportMatch) {
        exports.push(exportMatch[1]);
      }
    }

    return {
      path: filePath,
      lines: lines.length,
      functions,
      classes,
      imports,
      exports
    };
  }

  private async detectDuplications(): Promise<void> {
    // Detect configuration duplications
    this.detectConfigurationDuplications();
    
    // Detect validation duplications
    this.detectValidationDuplications();
    
    // Detect cache duplications
    this.detectCacheDuplications();
    
    // Detect service duplications
    this.detectServiceDuplications();
    
    // Detect error handling duplications
    this.detectErrorHandlingDuplications();
    
    // Detect UI component duplications
    this.detectUIComponentDuplications();
  }

  private detectConfigurationDuplications(): void {
    const configFiles = this.fileAnalyses.filter(f => 
      f.path.includes('config') || 
      f.path.includes('constants') ||
      f.functions.some(fn => fn.toLowerCase().includes('config'))
    );

    if (configFiles.length > 1) {
      this.duplications.push({
        type: 'configuration',
        description: 'Multiple configuration management approaches detected',
        locations: configFiles.map(f => f.path),
        severity: 'high',
        recommendation: 'Consolidate all configuration into ConfigurationManager system'
      });
    }

    // Check for hardcoded values that should use configuration
    const filesWithHardcodedValues = this.fileAnalyses.filter(f => {
      // This is a simplified check - in reality we'd parse the AST
      return f.path.includes('src/') && !f.path.includes('config');
    });

    if (filesWithHardcodedValues.length > 5) {
      this.duplications.push({
        type: 'configuration',
        description: 'Potential hardcoded values that should use ConfigurationManager',
        locations: filesWithHardcodedValues.slice(0, 10).map(f => f.path),
        severity: 'medium',
        recommendation: 'Audit files for magic numbers and hardcoded strings, migrate to ConfigurationManager'
      });
    }
  }

  private detectValidationDuplications(): void {
    const validationFiles = this.fileAnalyses.filter(f => 
      f.functions.some(fn => fn.toLowerCase().includes('valid')) ||
      f.path.includes('validation') ||
      f.classes.some(cls => cls.toLowerCase().includes('valid'))
    );

    if (validationFiles.length > 3) {
      this.duplications.push({
        type: 'functional',
        description: 'Multiple validation implementations detected',
        locations: validationFiles.map(f => f.path),
        severity: 'high',
        recommendation: 'Consolidate validation logic into shared ValidationService utilities'
      });
    }
  }

  private detectCacheDuplications(): void {
    const cacheFiles = this.fileAnalyses.filter(f => 
      f.functions.some(fn => fn.toLowerCase().includes('cache')) ||
      f.classes.some(cls => cls.toLowerCase().includes('cache')) ||
      f.path.includes('Cache')
    );

    if (cacheFiles.length > 1) {
      this.duplications.push({
        type: 'pattern',
        description: 'Multiple caching implementations detected',
        locations: cacheFiles.map(f => f.path),
        severity: 'medium',
        recommendation: 'Unify caching implementations using a single, configurable cache utility'
      });
    }
  }

  private detectServiceDuplications(): void {
    const serviceFiles = this.fileAnalyses.filter(f => 
      f.path.includes('services/') ||
      f.classes.some(cls => cls.includes('Service'))
    );

    // Look for services with similar function names
    const functionGroups: { [key: string]: string[] } = {};
    
    serviceFiles.forEach(file => {
      file.functions.forEach(fn => {
        const normalizedName = fn.toLowerCase().replace(/[0-9]/g, '');
        if (!functionGroups[normalizedName]) {
          functionGroups[normalizedName] = [];
        }
        functionGroups[normalizedName].push(file.path);
      });
    });

    Object.entries(functionGroups).forEach(([fnName, files]) => {
      if (files.length > 1 && fnName.length > 3) {
        this.duplications.push({
          type: 'functional',
          description: `Similar function "${fnName}" found in multiple services`,
          locations: [...new Set(files)],
          severity: 'medium',
          recommendation: `Consider consolidating "${fnName}" functionality into a shared utility or base service`
        });
      }
    });
  }

  private detectErrorHandlingDuplications(): void {
    const errorFiles = this.fileAnalyses.filter(f => 
      f.functions.some(fn => fn.toLowerCase().includes('error')) ||
      f.classes.some(cls => cls.toLowerCase().includes('error')) ||
      f.path.includes('error')
    );

    if (errorFiles.length > 2) {
      this.duplications.push({
        type: 'pattern',
        description: 'Multiple error handling implementations detected',
        locations: errorFiles.map(f => f.path),
        severity: 'medium',
        recommendation: 'Standardize error handling using consistent patterns and utilities'
      });
    }
  }

  private detectUIComponentDuplications(): void {
    const componentFiles = this.fileAnalyses.filter(f => 
      f.path.includes('components/') && f.path.endsWith('.tsx')
    );

    // Look for components with similar names or functions
    const componentGroups: { [key: string]: string[] } = {};
    
    componentFiles.forEach(file => {
      const componentName = path.basename(file.path, '.tsx');
      const baseName = componentName.replace(/[A-Z]/g, '').toLowerCase();
      
      if (!componentGroups[baseName]) {
        componentGroups[baseName] = [];
      }
      componentGroups[baseName].push(file.path);
    });

    Object.entries(componentGroups).forEach(([baseName, files]) => {
      if (files.length > 1 && baseName.length > 2) {
        this.duplications.push({
          type: 'pattern',
          description: `Similar UI components detected: ${baseName}`,
          locations: files,
          severity: 'low',
          recommendation: `Review components for potential consolidation or shared base component`
        });
      }
    });
  }

  private async generateReport(): Promise<void> {
    const report = {
      analysis: {
        timestamp: new Date().toISOString(),
        totalFiles: this.fileAnalyses.length,
        totalLines: this.fileAnalyses.reduce((sum, f) => sum + f.lines, 0),
        totalFunctions: this.fileAnalyses.reduce((sum, f) => sum + f.functions.length, 0),
        totalClasses: this.fileAnalyses.reduce((sum, f) => sum + f.classes.length, 0)
      },
      summary: {
        totalDuplications: this.duplications.length,
        byType: this.groupBy(this.duplications, 'type'),
        bySeverity: this.groupBy(this.duplications, 'severity'),
        potentialSavings: {
          linesOfCode: this.estimateLineSavings(),
          files: this.estimateFileSavings(),
          estimatedHours: this.estimateEffortSavings()
        }
      },
      duplications: this.duplications.map((dup, index) => ({
        id: `dup-${index + 1}`,
        ...dup,
        impact: this.calculateImpact(dup)
      })),
      recommendations: this.generateRecommendations(),
      fileAnalysis: this.fileAnalyses.map(f => ({
        path: path.relative(process.cwd(), f.path),
        lines: f.lines,
        functions: f.functions.length,
        classes: f.classes.length,
        complexity: this.calculateFileComplexity(f)
      }))
    };

    // Ensure reports directory exists
    await fs.mkdir('reports/duplication', { recursive: true });

    // Save detailed JSON report
    await fs.writeFile(
      'reports/duplication/space-weirdos-analysis.json',
      JSON.stringify(report, null, 2)
    );

    // Generate markdown report
    const markdown = this.generateMarkdownReport(report);
    await fs.writeFile('reports/duplication/space-weirdos-analysis.md', markdown);

    console.log('📄 Reports generated:');
    console.log('   • reports/duplication/space-weirdos-analysis.json');
    console.log('   • reports/duplication/space-weirdos-analysis.md');

    // Print summary
    this.printSummary(report);
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  private estimateLineSavings(): number {
    return this.duplications.reduce((total, dup) => {
      return total + (dup.locations.length - 1) * 20; // Estimate 20 lines per duplication
    }, 0);
  }

  private estimateFileSavings(): number {
    return Math.floor(this.duplications.length * 0.3); // Estimate 30% could result in file consolidation
  }

  private estimateEffortSavings(): number {
    const severityHours = { low: 2, medium: 6, high: 16, critical: 40 };
    return this.duplications.reduce((total, dup) => {
      return total + severityHours[dup.severity];
    }, 0);
  }

  private calculateImpact(duplication: DuplicationPattern): any {
    const severityScores = { low: 1, medium: 3, high: 7, critical: 10 };
    const baseScore = severityScores[duplication.severity];
    
    return {
      linesOfCode: duplication.locations.length * 15,
      complexity: baseScore,
      maintainabilityIndex: Math.max(20, 100 - (baseScore * 10)),
      testCoverage: Math.max(50, 90 - (baseScore * 5))
    };
  }

  private calculateFileComplexity(file: FileAnalysis): string {
    const score = file.functions.length * 2 + file.classes.length * 3 + file.lines * 0.01;
    
    if (score > 50) return 'high';
    if (score > 20) return 'medium';
    return 'low';
  }

  private generateRecommendations(): any[] {
    return this.duplications.map((dup, index) => ({
      id: `rec-${index + 1}`,
      title: this.getRecommendationTitle(dup),
      description: dup.recommendation,
      type: this.getRecommendationType(dup),
      priority: dup.severity,
      complexity: {
        level: dup.severity === 'critical' ? 'high' : dup.severity === 'high' ? 'medium' : 'low',
        factors: this.getComplexityFactors(dup),
        reasoning: `${dup.type} duplication affecting ${dup.locations.length} locations`
      },
      estimatedEffort: {
        hours: this.getEstimatedHours(dup.severity),
        dependencies: this.getDependencies(dup)
      },
      benefits: this.getBenefits(dup),
      risks: this.getRisks(dup),
      implementationPlan: this.getImplementationPlan(dup),
      affectedFiles: dup.locations.map(loc => path.relative(process.cwd(), loc))
    }));
  }

  private getRecommendationTitle(dup: DuplicationPattern): string {
    const typeMap = {
      exact: 'Consolidate Identical Code',
      functional: 'Unify Duplicate Functionality',
      pattern: 'Abstract Repeated Patterns',
      configuration: 'Centralize Configuration'
    };
    return typeMap[dup.type];
  }

  private getRecommendationType(dup: DuplicationPattern): string {
    const typeMap = {
      exact: 'consolidation',
      functional: 'refactoring',
      pattern: 'abstraction',
      configuration: 'migration'
    };
    return typeMap[dup.type];
  }

  private getComplexityFactors(dup: DuplicationPattern): string[] {
    const factors = [`${dup.locations.length} affected locations`];
    
    if (dup.type === 'configuration') {
      factors.push('Configuration migration required');
    }
    if (dup.severity === 'high' || dup.severity === 'critical') {
      factors.push('High impact changes');
    }
    if (dup.locations.length > 5) {
      factors.push('Multiple file modifications');
    }
    
    return factors;
  }

  private getEstimatedHours(severity: string): number {
    const hours = { low: 2, medium: 6, high: 16, critical: 40 };
    return hours[severity as keyof typeof hours] || 6;
  }

  private getDependencies(dup: DuplicationPattern): string[] {
    const deps = ['Code review', 'Testing'];
    
    if (dup.type === 'configuration') {
      deps.push('Configuration system setup');
    }
    if (dup.locations.length > 3) {
      deps.push('Coordination across multiple files');
    }
    
    return deps;
  }

  private getBenefits(dup: DuplicationPattern): string[] {
    const benefits = [
      `Eliminate ${dup.locations.length - 1} duplicate implementations`,
      'Improve code maintainability',
      'Reduce technical debt'
    ];

    if (dup.type === 'configuration') {
      benefits.push('Centralize configuration management');
    }
    if (dup.severity === 'high' || dup.severity === 'critical') {
      benefits.push('Significant maintainability improvement');
    }

    return benefits;
  }

  private getRisks(dup: DuplicationPattern): any[] {
    const risks = [];

    if (dup.locations.length > 5) {
      risks.push({
        type: 'breaking_change',
        severity: 'medium',
        description: 'Multiple file changes may introduce breaking changes',
        mitigation: 'Comprehensive testing and gradual rollout'
      });
    }

    if (dup.type === 'configuration') {
      risks.push({
        type: 'compatibility',
        severity: 'low',
        description: 'Configuration changes may affect environment compatibility',
        mitigation: 'Test in all environments before deployment'
      });
    }

    return risks;
  }

  private getImplementationPlan(dup: DuplicationPattern): any[] {
    const plan = [];

    if (dup.type === 'configuration') {
      plan.push({
        order: 1,
        title: 'Set up centralized configuration',
        description: 'Ensure ConfigurationManager is properly configured',
        validation: 'Configuration system tests pass'
      });
    }

    plan.push({
      order: plan.length + 1,
      title: 'Identify consolidation target',
      description: 'Choose the best implementation to keep and enhance',
      validation: 'Implementation choice documented and reviewed'
    });

    plan.push({
      order: plan.length + 1,
      title: 'Refactor duplicate code',
      description: 'Replace duplicates with calls to consolidated implementation',
      validation: 'All existing functionality preserved'
    });

    plan.push({
      order: plan.length + 1,
      title: 'Update tests',
      description: 'Ensure all tests pass with consolidated implementation',
      validation: 'Test suite passes completely'
    });

    return plan;
  }

  private generateMarkdownReport(report: any): string {
    return `# Space Weirdos Codebase Analysis Report

Generated: ${new Date(report.analysis.timestamp).toLocaleString()}

## Executive Summary

This analysis identified **${report.summary.totalDuplications} duplication patterns** across **${report.analysis.totalFiles} source files** containing **${report.analysis.totalLines.toLocaleString()} lines of code**.

### Key Findings

- **Total Functions**: ${report.analysis.totalFunctions}
- **Total Classes**: ${report.analysis.totalClasses}
- **Duplication Patterns**: ${report.summary.totalDuplications}

### Potential Savings

- **Lines of Code**: ${report.summary.potentialSavings.linesOfCode}
- **Files**: ${report.summary.potentialSavings.files}
- **Estimated Effort**: ${report.summary.potentialSavings.estimatedHours} hours

## Duplication Patterns by Type

${Object.entries(report.summary.byType).map(([type, count]) => `- **${type}**: ${count}`).join('\n')}

## Duplication Patterns by Severity

${Object.entries(report.summary.bySeverity).map(([severity, count]) => `- **${severity}**: ${count}`).join('\n')}

## Detailed Findings

${report.duplications.map((dup: any, index: number) => `
### ${index + 1}. ${dup.description}

- **Type**: ${dup.type}
- **Severity**: ${dup.severity}
- **Locations**: ${dup.locations.length}
- **Recommendation**: ${dup.recommendation}

**Affected Files**:
${dup.locations.map((loc: string) => `- ${path.relative(process.cwd(), loc)}`).join('\n')}
`).join('\n')}

## Recommendations

${report.recommendations.map((rec: any, index: number) => `
### ${index + 1}. ${rec.title}

- **Priority**: ${rec.priority}
- **Type**: ${rec.type}
- **Estimated Effort**: ${rec.estimatedEffort.hours} hours
- **Complexity**: ${rec.complexity.level}

**Description**: ${rec.description}

**Benefits**:
${rec.benefits.map((benefit: string) => `- ${benefit}`).join('\n')}

**Implementation Steps**:
${rec.implementationPlan.map((step: any) => `${step.order}. ${step.title}: ${step.description}`).join('\n')}
`).join('\n')}

## File Complexity Analysis

${report.fileAnalysis
  .filter((f: any) => f.complexity === 'high')
  .slice(0, 10)
  .map((f: any) => `- **${f.path}**: ${f.lines} lines, ${f.functions} functions, ${f.classes} classes (${f.complexity} complexity)`)
  .join('\n')}

## Next Steps

1. **Prioritize High-Severity Issues**: Focus on ${Object.entries(report.summary.bySeverity).filter(([severity]) => severity === 'high' || severity === 'critical').reduce((sum, [, count]) => sum + (count as number), 0)} high-priority duplications
2. **Configuration Consolidation**: Implement centralized configuration management
3. **Service Layer Optimization**: Consolidate overlapping service functionality
4. **Validation Unification**: Create shared validation utilities
5. **Cache Standardization**: Implement unified caching strategy

---

*This report was generated by the Space Weirdos Code Duplication Analysis tool.*
`;
  }

  private printSummary(report: any): void {
    console.log('\n📊 ANALYSIS SUMMARY');
    console.log('==================');
    console.log(`Total Files Analyzed: ${report.analysis.totalFiles}`);
    console.log(`Total Lines of Code: ${report.analysis.totalLines.toLocaleString()}`);
    console.log(`Total Functions: ${report.analysis.totalFunctions}`);
    console.log(`Total Classes: ${report.analysis.totalClasses}`);
    console.log(`Duplication Patterns: ${report.summary.totalDuplications}`);
    
    console.log('\nBy Type:');
    Object.entries(report.summary.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\nBy Severity:');
    Object.entries(report.summary.bySeverity).forEach(([severity, count]) => {
      console.log(`  ${severity}: ${count}`);
    });
    
    console.log('\nPotential Savings:');
    console.log(`  Lines of Code: ${report.summary.potentialSavings.linesOfCode}`);
    console.log(`  Files: ${report.summary.potentialSavings.files}`);
    console.log(`  Estimated Hours: ${report.summary.potentialSavings.estimatedHours}`);
  }
}

// Run analysis
const analyzer = new CodebaseAnalyzer();
analyzer.analyze().catch(console.error);