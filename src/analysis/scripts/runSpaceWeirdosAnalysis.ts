#!/usr/bin/env tsx

/**
 * Comprehensive analysis script for Space Weirdos codebase
 * Generates detailed duplication report with prioritized recommendations
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ReportGenerator } from '../generators/ReportGenerator.js';
import { CodeParser } from '../parsers/CodeParser.js';
import { ExactMatchDetector } from '../detectors/ExactMatchDetector.js';
import { FunctionalDuplicationDetector } from '../detectors/FunctionalDuplicationDetector.js';
import { PatternDuplicationDetector } from '../detectors/PatternDuplicationDetector.js';
import { ConfigurationDuplicationDetector } from '../detectors/ConfigurationDuplicationDetector.js';
import { ValidationDuplicationDetector } from '../detectors/ValidationDuplicationDetector.js';
import { CacheAnalysisDetector } from '../detectors/CacheAnalysisDetector.js';
import { ErrorHandlingDuplicationDetector } from '../detectors/ErrorHandlingDuplicationDetector.js';
import { SimilarityAnalyzer } from '../analyzers/SimilarityAnalyzer.js';
import { ImpactAnalyzer } from '../analyzers/ImpactAnalyzer.js';
import { ComplexityEstimator } from '../analyzers/ComplexityEstimator.js';
import { RiskAssessor } from '../analyzers/RiskAssessor.js';
import { StrategyGenerator } from '../analyzers/StrategyGenerator.js';
import { DuplicationInstance, OptimizationRecommendation, AnalysisConfig } from '../types/DuplicationModels.js';

export class SpaceWeirdosAnalysis {
  private codeParser: CodeParser;
  private similarityAnalyzer: SimilarityAnalyzer;
  private reportGenerator: ReportGenerator;
  private impactAnalyzer: ImpactAnalyzer;
  private complexityEstimator: ComplexityEstimator;
  private riskAssessor: RiskAssessor;
  private strategyGenerator: StrategyGenerator;

  // Detectors
  private exactMatchDetector: ExactMatchDetector;
  private functionalDuplicationDetector: FunctionalDuplicationDetector;
  private patternDuplicationDetector: PatternDuplicationDetector;
  private configurationDuplicationDetector: ConfigurationDuplicationDetector;
  private validationDuplicationDetector: ValidationDuplicationDetector;
  private cacheAnalysisDetector: CacheAnalysisDetector;
  private errorHandlingDuplicationDetector: ErrorHandlingDuplicationDetector;

  constructor() {
    this.codeParser = new CodeParser();
    this.similarityAnalyzer = new SimilarityAnalyzer();
    this.reportGenerator = new ReportGenerator();
    this.impactAnalyzer = new ImpactAnalyzer();
    this.complexityEstimator = new ComplexityEstimator();
    this.riskAssessor = new RiskAssessor();
    this.strategyGenerator = new StrategyGenerator();

    // Initialize detectors
    this.exactMatchDetector = new ExactMatchDetector(this.similarityAnalyzer);
    this.functionalDuplicationDetector = new FunctionalDuplicationDetector(this.similarityAnalyzer);
    this.patternDuplicationDetector = new PatternDuplicationDetector(this.similarityAnalyzer);
    this.configurationDuplicationDetector = new ConfigurationDuplicationDetector(this.similarityAnalyzer);
    this.validationDuplicationDetector = new ValidationDuplicationDetector(this.similarityAnalyzer);
    this.cacheAnalysisDetector = new CacheAnalysisDetector(this.similarityAnalyzer);
    this.errorHandlingDuplicationDetector = new ErrorHandlingDuplicationDetector(this.similarityAnalyzer);
  }

  /**
   * Run comprehensive analysis on Space Weirdos codebase
   */
  async runAnalysis(): Promise<void> {
    console.log('🔍 Starting comprehensive Space Weirdos codebase analysis...\n');

    const config: AnalysisConfig = {
      similarityThreshold: 0.75, // Lower threshold to catch more potential duplications
      minCodeBlockSize: 3,
      excludePatterns: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.test.ts',
        '**/*.test.js',
        '**/*.spec.ts',
        '**/*.spec.js',
        'reports/**'
      ],
      includePatterns: [
        'src/**/*.ts',
        'src/**/*.tsx',
        'src/**/*.js',
        'src/**/*.jsx'
      ],
      analysisTypes: ['exact', 'functional', 'pattern', 'configuration']
    };

    try {
      // Step 1: Parse codebase
      console.log('📁 Parsing codebase...');
      const files = await this.getSourceFiles(config);
      console.log(`   Found ${files.length} source files to analyze`);

      const parsedFiles = [];
      for (const filePath of files) {
        try {
          const parsed = await this.codeParser.parseFile(filePath);
          parsedFiles.push(parsed);
        } catch (error) {
          console.warn(`   ⚠️  Failed to parse ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      console.log(`   Successfully parsed ${parsedFiles.length} files\n`);

      // Step 2: Run duplication detection
      console.log('🔍 Running duplication detection...');
      const duplications: DuplicationInstance[] = [];

      // Exact match detection
      console.log('   • Detecting exact matches...');
      const exactMatches = await this.exactMatchDetector.detectDuplications(parsedFiles, config);
      duplications.push(...exactMatches);
      console.log(`     Found ${exactMatches.length} exact matches`);

      // Functional duplication detection
      console.log('   • Detecting functional duplications...');
      const functionalDups = await this.functionalDuplicationDetector.detectDuplications(parsedFiles, config);
      duplications.push(...functionalDups);
      console.log(`     Found ${functionalDups.length} functional duplications`);

      // Pattern duplication detection
      console.log('   • Detecting pattern duplications...');
      const patternDups = await this.patternDuplicationDetector.detectDuplications(parsedFiles, config);
      duplications.push(...patternDups);
      console.log(`     Found ${patternDups.length} pattern duplications`);

      // Configuration duplication detection
      console.log('   • Detecting configuration duplications...');
      const configDups = await this.configurationDuplicationDetector.detectDuplications(parsedFiles, config);
      duplications.push(...configDups);
      console.log(`     Found ${configDups.length} configuration duplications`);

      // Validation duplication detection
      console.log('   • Detecting validation duplications...');
      const validationDups = await this.validationDuplicationDetector.detectDuplications(parsedFiles, config);
      duplications.push(...validationDups);
      console.log(`     Found ${validationDups.length} validation duplications`);

      // Cache analysis detection
      console.log('   • Detecting cache duplications...');
      const cacheDups = await this.cacheAnalysisDetector.detectDuplications(parsedFiles, config);
      duplications.push(...cacheDups);
      console.log(`     Found ${cacheDups.length} cache duplications`);

      // Error handling duplication detection
      console.log('   • Detecting error handling duplications...');
      const errorDups = await this.errorHandlingDuplicationDetector.detectDuplications(parsedFiles, config);
      duplications.push(...errorDups);
      console.log(`     Found ${errorDups.length} error handling duplications`);

      console.log(`\n   📊 Total duplications found: ${duplications.length}\n`);

      // Step 3: Generate recommendations
      console.log('💡 Generating optimization recommendations...');
      const recommendations = await this.generateRecommendations(duplications);
      console.log(`   Generated ${recommendations.length} recommendations\n`);

      // Step 4: Generate comprehensive report
      console.log('📋 Generating comprehensive report...');
      const report = await this.reportGenerator.generateReport(duplications, recommendations);

      // Step 5: Save reports in multiple formats
      await this.saveReports(report, duplications, recommendations);

      // Step 6: Print summary
      this.printAnalysisSummary(report);

      console.log('\n✅ Analysis complete! Check the reports/ directory for detailed findings.');

    } catch (error) {
      console.error('❌ Analysis failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get source files based on configuration
   */
  private async getSourceFiles(config: AnalysisConfig): Promise<string[]> {
    const files: string[] = [];
    
    async function walkDirectory(dir: string): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(process.cwd(), fullPath);
        
        if (entry.isDirectory()) {
          // Check exclude patterns for directories
          const shouldExclude = config.excludePatterns.some(pattern => 
            relativePath.includes(pattern.replace('/**', '')) || 
            relativePath.includes(pattern.replace('**/', ''))
          );
          
          if (!shouldExclude) {
            await walkDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          // Check include patterns for files
          const shouldInclude = config.includePatterns.some(pattern => {
            const ext = pattern.split('.').pop();
            return relativePath.endsWith(`.${ext}`);
          });
          
          // Check exclude patterns for files
          const shouldExclude = config.excludePatterns.some(pattern => 
            relativePath.includes(pattern.replace('**/', '')) ||
            relativePath.endsWith(pattern.replace('**/*', ''))
          );
          
          if (shouldInclude && !shouldExclude) {
            files.push(fullPath);
          }
        }
      }
    }
    
    await walkDirectory('src');
    return files;
  }

  /**
   * Generate optimization recommendations based on duplications
   */
  private async generateRecommendations(duplications: DuplicationInstance[]): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    for (const duplication of duplications) {
      try {
        // Analyze impact
        const impact = await this.impactAnalyzer.analyzeImpact(duplication);
        
        // Estimate complexity
        const complexity = await this.complexityEstimator.estimateComplexity(duplication);
        
        // Assess risks
        const risks = await this.riskAssessor.assessRisks(duplication);
        
        // Generate strategy
        const strategy = await this.strategyGenerator.generateStrategy(duplication);

        const recommendation: OptimizationRecommendation = {
          id: `rec-${duplication.id}`,
          title: this.generateRecommendationTitle(duplication),
          description: this.generateRecommendationDescription(duplication),
          type: this.determineRecommendationType(duplication),
          priority: this.determinePriority(impact, complexity),
          complexity,
          estimatedEffort: {
            hours: complexity.level === 'low' ? 2 : complexity.level === 'medium' ? 6 : 16,
            complexity,
            dependencies: strategy.dependencies || []
          },
          benefits: this.generateBenefits(duplication, impact),
          risks,
          implementationPlan: strategy.steps || [],
          affectedFiles: duplication.locations.map(loc => loc.filePath)
        };

        recommendations.push(recommendation);
      } catch (error) {
        console.warn(`Failed to generate recommendation for duplication ${duplication.id}:`, error);
      }
    }

    // Sort by priority and impact
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate recommendation title based on duplication type
   */
  private generateRecommendationTitle(duplication: DuplicationInstance): string {
    const typeMap = {
      exact: 'Consolidate identical code blocks',
      functional: 'Unify duplicate functionality',
      pattern: 'Abstract repeated patterns',
      configuration: 'Centralize configuration values'
    };
    
    return typeMap[duplication.type] || 'Optimize code duplication';
  }

  /**
   * Generate recommendation description
   */
  private generateRecommendationDescription(duplication: DuplicationInstance): string {
    const locations = duplication.locations.length;
    const files = new Set(duplication.locations.map(loc => path.basename(loc.filePath))).size;
    
    return `${duplication.description} found in ${locations} locations across ${files} files. ` +
           `Consolidating this duplication will improve maintainability and reduce technical debt.`;
  }

  /**
   * Determine recommendation type based on duplication
   */
  private determineRecommendationType(duplication: DuplicationInstance): 'consolidation' | 'abstraction' | 'refactoring' | 'migration' {
    switch (duplication.type) {
      case 'exact':
        return 'consolidation';
      case 'functional':
        return 'refactoring';
      case 'pattern':
        return 'abstraction';
      case 'configuration':
        return 'migration';
      default:
        return 'refactoring';
    }
  }

  /**
   * Determine priority based on impact and complexity
   */
  private determinePriority(impact: any, complexity: any): 'low' | 'medium' | 'high' | 'critical' {
    const impactScore = impact.linesOfCode * 0.1 + impact.complexity * 0.3 + (100 - impact.maintainabilityIndex) * 0.01;
    const complexityPenalty = complexity.level === 'high' ? 0.5 : complexity.level === 'medium' ? 0.2 : 0;
    
    const score = impactScore - complexityPenalty;
    
    if (score > 10) return 'critical';
    if (score > 5) return 'high';
    if (score > 2) return 'medium';
    return 'low';
  }

  /**
   * Generate benefits list
   */
  private generateBenefits(duplication: DuplicationInstance, impact: any): string[] {
    const benefits = [
      `Reduce code duplication by ${duplication.locations.length - 1} instances`,
      `Save approximately ${impact.linesOfCode * (duplication.locations.length - 1)} lines of code`,
      'Improve maintainability and consistency',
      'Reduce technical debt'
    ];

    if (impact.maintainabilityIndex < 70) {
      benefits.push('Significantly improve maintainability index');
    }

    if (duplication.type === 'configuration') {
      benefits.push('Centralize configuration management');
      benefits.push('Improve configuration consistency');
    }

    return benefits;
  }

  /**
   * Save reports in multiple formats
   */
  private async saveReports(
    report: any, 
    duplications: DuplicationInstance[], 
    recommendations: OptimizationRecommendation[]
  ): Promise<void> {
    // Ensure reports directory exists
    await fs.mkdir('reports/duplication', { recursive: true });

    // Save JSON report
    const jsonReport = JSON.stringify(report, null, 2);
    await fs.writeFile('reports/duplication/space-weirdos-analysis.json', jsonReport);

    // Save HTML report
    const htmlReport = await this.reportGenerator.exportReport(report, 'html');
    await fs.writeFile('reports/duplication/space-weirdos-analysis.html', htmlReport);

    // Save Markdown report
    const markdownReport = await this.reportGenerator.exportReport(report, 'markdown');
    await fs.writeFile('reports/duplication/space-weirdos-analysis.md', markdownReport);

    // Save detailed findings
    const detailedFindings = {
      analysis: {
        timestamp: new Date().toISOString(),
        totalFiles: report.summary.totalFiles || 0,
        totalDuplications: duplications.length,
        totalRecommendations: recommendations.length
      },
      duplications: duplications.map(dup => ({
        id: dup.id,
        type: dup.type,
        similarity: dup.similarity,
        description: dup.description,
        locations: dup.locations.map(loc => ({
          file: path.relative(process.cwd(), loc.filePath),
          lines: `${loc.startLine}-${loc.endLine}`,
          context: loc.context
        })),
        impact: dup.impact
      })),
      recommendations: recommendations.map(rec => ({
        id: rec.id,
        title: rec.title,
        description: rec.description,
        type: rec.type,
        priority: rec.priority,
        complexity: rec.complexity.level,
        estimatedHours: rec.estimatedEffort.hours,
        benefits: rec.benefits,
        affectedFiles: rec.affectedFiles.map(f => path.relative(process.cwd(), f))
      }))
    };

    await fs.writeFile(
      'reports/duplication/detailed-findings.json', 
      JSON.stringify(detailedFindings, null, 2)
    );

    console.log('   📄 Reports saved:');
    console.log('     • reports/duplication/space-weirdos-analysis.json');
    console.log('     • reports/duplication/space-weirdos-analysis.html');
    console.log('     • reports/duplication/space-weirdos-analysis.md');
    console.log('     • reports/duplication/detailed-findings.json');
  }

  /**
   * Print analysis summary
   */
  private printAnalysisSummary(report: any): void {
    console.log('\n📊 ANALYSIS SUMMARY');
    console.log('==================');
    console.log(`Total Duplications: ${report.summary.totalDuplications}`);
    console.log(`Duplication Percentage: ${report.metrics.duplicationPercentage.toFixed(1)}%`);
    console.log(`Maintainability Index: ${report.metrics.maintainabilityIndex.toFixed(0)}`);
    console.log(`Technical Debt Ratio: ${report.metrics.technicalDebtRatio.toFixed(2)}`);
    
    console.log('\nBy Type:');
    Object.entries(report.summary.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\nBy Priority:');
    Object.entries(report.summary.bySeverity).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count}`);
    });
    
    console.log('\nPotential Savings:');
    console.log(`  Lines of Code: ${report.summary.potentialSavings.linesOfCode}`);
    console.log(`  Files: ${report.summary.potentialSavings.files}`);
    console.log(`  Estimated Hours: ${report.summary.potentialSavings.estimatedHours}`);
  }
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analysis = new SpaceWeirdosAnalysis();
  analysis.runAnalysis().catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
}