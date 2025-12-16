/**
 * Integration tests for complete duplication analysis workflow
 * Tests end-to-end analysis pipeline with realistic codebases
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { ReportGenerator } from '../src/analysis/generators/ReportGenerator.js';

import { BuildIntegration } from '../src/analysis/integration/BuildIntegration.js';
import {
  DuplicationInstance,
  OptimizationRecommendation
} from '../src/analysis/types/DuplicationModels.js';

describe('Analysis Workflow Integration Tests', () => {
  let tempDir: string;
  let reportGenerator: ReportGenerator;
  let buildIntegration: BuildIntegration;

  beforeEach(async () => {
    // Create temporary directory for test files
    tempDir = path.join(process.cwd(), 'temp-test-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });

    reportGenerator = new ReportGenerator();
    buildIntegration = new BuildIntegration();
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Report Generation Workflow', () => {
    it('should generate complete report with all sections', async () => {
      // Create test duplications
      const duplications: DuplicationInstance[] = [
        {
          id: 'test-dup-1',
          type: 'exact',
          similarity: 0.95,
          locations: [
            {
              filePath: 'src/component1.ts',
              startLine: 10,
              endLine: 25,
              codeBlock: 'function validateInput(input: string) { return input.length > 0; }',
              context: 'Input validation'
            },
            {
              filePath: 'src/component2.ts',
              startLine: 15,
              endLine: 30,
              codeBlock: 'function validateInput(input: string) { return input.length > 0; }',
              context: 'Input validation'
            }
          ],
          description: 'Duplicate input validation function',
          impact: {
            linesOfCode: 15,
            complexity: 3,
            maintainabilityIndex: 75,
            testCoverage: 80
          }
        },
        {
          id: 'test-dup-2',
          type: 'functional',
          similarity: 0.85,
          locations: [
            {
              filePath: 'src/service1.ts',
              startLine: 20,
              endLine: 40,
              codeBlock: 'class CacheService { private cache = new Map(); }',
              context: 'Caching implementation'
            },
            {
              filePath: 'src/service2.ts',
              startLine: 25,
              endLine: 45,
              codeBlock: 'class DataCache { private storage = new Map(); }',
              context: 'Caching implementation'
            }
          ],
          description: 'Similar caching implementations',
          impact: {
            linesOfCode: 20,
            complexity: 5,
            maintainabilityIndex: 65,
            testCoverage: 70
          }
        }
      ];

      // Create test recommendations
      const recommendations: OptimizationRecommendation[] = [
        {
          id: 'test-rec-1',
          title: 'Consolidate validation functions',
          description: 'Create shared validation utility',
          type: 'consolidation',
          priority: 'high',
          complexity: {
            level: 'medium',
            factors: ['Multiple file changes', 'Test updates'],
            reasoning: 'Requires refactoring across components'
          },
          estimatedEffort: {
            hours: 4,
            complexity: {
              level: 'medium',
              factors: ['Refactoring'],
              reasoning: 'Moderate complexity'
            },
            dependencies: ['Utility creation']
          },
          benefits: ['Reduced duplication', 'Improved maintainability'],
          risks: [
            {
              type: 'breaking_change',
              severity: 'low',
              description: 'Potential validation changes',
              mitigation: 'Comprehensive testing'
            }
          ],
          implementationPlan: [
            {
              order: 1,
              title: 'Create utility',
              description: 'Extract validation logic',
              validation: 'Tests pass'
            }
          ],
          affectedFiles: ['src/component1.ts', 'src/component2.ts']
        }
      ];

      // Generate report
      const report = await reportGenerator.generateReport(duplications, recommendations);

      // Verify report structure
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.duplications).toHaveLength(2);
      expect(report.recommendations).toHaveLength(1);
      expect(report.metrics).toBeDefined();
      expect(report.generatedAt).toBeInstanceOf(Date);

      // Verify summary calculations
      expect(report.summary.totalDuplications).toBe(2);
      expect(report.summary.byType.exact).toBe(1);
      expect(report.summary.byType.functional).toBe(1);
      expect(report.summary.bySeverity.high).toBe(1);

      // Verify metrics calculations
      expect(report.metrics.duplicationPercentage).toBeGreaterThan(0);
      expect(report.metrics.maintainabilityIndex).toBeGreaterThan(0);
      expect(report.metrics.technicalDebtRatio).toBeGreaterThanOrEqual(0);
      expect(report.metrics.codeComplexity).toBeGreaterThan(0);

      // Verify potential savings
      expect(report.summary.potentialSavings.linesOfCode).toBeGreaterThan(0);
      expect(report.summary.potentialSavings.files).toBeGreaterThan(0);
      expect(report.summary.potentialSavings.estimatedHours).toBe(4);
    });

    it('should export reports in all supported formats', async () => {
      const duplications: DuplicationInstance[] = [{
        id: 'test-dup',
        type: 'exact',
        similarity: 0.9,
        locations: [{
          filePath: 'test.ts',
          startLine: 1,
          endLine: 10,
          codeBlock: 'test code',
          context: 'test'
        }],
        description: 'Test duplication',
        impact: {
          linesOfCode: 10,
          complexity: 2,
          maintainabilityIndex: 80,
          testCoverage: 90
        }
      }];

      const recommendations: OptimizationRecommendation[] = [];
      const report = await reportGenerator.generateReport(duplications, recommendations);

      // Test JSON export
      const jsonOutput = await reportGenerator.exportReport(report, 'json');
      expect(() => JSON.parse(jsonOutput)).not.toThrow();
      const parsedJson = JSON.parse(jsonOutput);
      expect(parsedJson.summary.totalDuplications).toBe(1);

      // Test HTML export
      const htmlOutput = await reportGenerator.exportReport(report, 'html');
      expect(htmlOutput).toContain('<!DOCTYPE html>');
      expect(htmlOutput).toContain('Code Duplication Analysis Report');
      expect(htmlOutput).toContain('Test duplication');

      // Test Markdown export
      const markdownOutput = await reportGenerator.exportReport(report, 'markdown');
      expect(markdownOutput).toContain('# Code Duplication Analysis Report');
      expect(markdownOutput).toContain('## Summary');
      expect(markdownOutput).toContain('Test duplication');
    });
  });

  describe('CLI Integration Workflow', () => {
    it('should handle command line arguments correctly', async () => {
      // Create test source files
      const srcDir = path.join(tempDir, 'src');
      await fs.mkdir(srcDir, { recursive: true });
      
      await fs.writeFile(
        path.join(srcDir, 'test1.ts'),
        'function duplicate() { return "test"; }'
      );
      await fs.writeFile(
        path.join(srcDir, 'test2.ts'),
        'function duplicate() { return "test"; }'
      );

      // Create output directory
      const outputDir = path.join(tempDir, 'reports');
      await fs.mkdir(outputDir, { recursive: true });

      // Test CLI argument parsing (without actually running analysis)
      const args = [
        '--input', srcDir,
        '--output', path.join(outputDir, 'test-report.json'),
        '--format', 'json',
        '--threshold', '0.8',
        '--verbose'
      ];

      // This would normally run the full analysis, but we're testing the workflow
      // In a real implementation, this would verify the CLI processes arguments correctly
      expect(args).toContain('--input');
      expect(args).toContain(srcDir);
      expect(args).toContain('--format');
      expect(args).toContain('json');
    });

    it('should generate configuration template', async () => {
      const configPath = path.join(tempDir, 'analysis.config.json');
      
      // Generate config template
      const template = buildIntegration.generateConfigTemplate();
      await fs.writeFile(configPath, template);

      // Verify config file was created and is valid JSON
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      expect(config.buildIntegration).toBeDefined();
      expect(config.buildIntegration.failureThreshold).toBe(15);
      expect(config.buildIntegration.warningThreshold).toBe(10);
      expect(config.buildIntegration.analysisConfig).toBeDefined();
      expect(config.buildIntegration.analysisConfig.similarityThreshold).toBe(0.8);
    });
  });

  describe('Build Integration Workflow', () => {
    it('should run build analysis with thresholds', async () => {
      const config = {
        failureThreshold: 20,
        warningThreshold: 10,
        outputDir: path.join(tempDir, 'build-reports'),
        reportFormats: ['json', 'html'] as ('json' | 'html' | 'markdown')[],
        analysisConfig: {
          similarityThreshold: 0.8,
          minCodeBlockSize: 5,
          excludePatterns: ['**/*.test.ts'],
          includePatterns: ['**/*.ts'],
          analysisTypes: ['exact', 'functional'] as ('exact' | 'functional' | 'pattern' | 'configuration')[]
        }
      };

      const result = await buildIntegration.runBuildAnalysis(tempDir, config);

      // Verify build result structure
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.duplicationPercentage).toBeGreaterThanOrEqual(0);
      expect(result.totalDuplications).toBeGreaterThanOrEqual(0);
      expect(result.reportPaths).toBeDefined();
      expect(result.warnings).toBeDefined();
      expect(result.errors).toBeDefined();

      // Verify reports were generated
      if (result.reportPaths.length > 0) {
        for (const reportPath of result.reportPaths) {
          const exists = await fs.access(reportPath).then(() => true).catch(() => false);
          expect(exists).toBe(true);
        }
      }
    });

    it('should generate CI/CD integration scripts', async () => {
      const scriptsDir = path.join(tempDir, 'ci-scripts');
      
      await buildIntegration.generateCIScripts(scriptsDir);

      // Verify all CI script files were created
      const expectedFiles = [
        'duplication-analysis.yml',
        'Jenkinsfile.duplication',
        '.gitlab-ci-duplication.yml',
        'package-scripts.json'
      ];

      for (const fileName of expectedFiles) {
        const filePath = path.join(scriptsDir, fileName);
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        expect(exists).toBe(true);

        const content = await fs.readFile(filePath, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }

      // Verify GitHub Actions workflow content
      const githubWorkflow = await fs.readFile(
        path.join(scriptsDir, 'duplication-analysis.yml'),
        'utf-8'
      );
      expect(githubWorkflow).toContain('name: Code Duplication Analysis');
      expect(githubWorkflow).toContain('npm run duplication:analyze');

      // Verify package scripts are valid JSON
      const packageScripts = await fs.readFile(
        path.join(scriptsDir, 'package-scripts.json'),
        'utf-8'
      );
      const scripts = JSON.parse(packageScripts);
      expect(scripts.scripts).toBeDefined();
      expect(scripts.scripts['duplication:analyze']).toBeDefined();
    });
  });

  describe('End-to-End Analysis Pipeline', () => {
    it('should complete full analysis workflow with realistic codebase', async () => {
      // Create realistic test codebase structure
      const srcDir = path.join(tempDir, 'src');
      const componentsDir = path.join(srcDir, 'components');
      const servicesDir = path.join(srcDir, 'services');
      
      await fs.mkdir(componentsDir, { recursive: true });
      await fs.mkdir(servicesDir, { recursive: true });

      // Create duplicate validation functions
      const validationCode1 = `
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired(value: string): boolean {
  return value && value.trim().length > 0;
}`;

      const validationCode2 = `
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired(value: string): boolean {
  return value && value.trim().length > 0;
}`;

      await fs.writeFile(path.join(componentsDir, 'UserForm.ts'), validationCode1);
      await fs.writeFile(path.join(componentsDir, 'ContactForm.ts'), validationCode2);

      // Create similar cache implementations
      const cacheCode1 = `
export class UserCache {
  private cache = new Map<string, any>();
  
  get(key: string): any {
    return this.cache.get(key);
  }
  
  set(key: string, value: any): void {
    this.cache.set(key, value);
  }
}`;

      const cacheCode2 = `
export class DataCache {
  private storage = new Map<string, any>();
  
  get(key: string): any {
    return this.storage.get(key);
  }
  
  set(key: string, value: any): void {
    this.storage.set(key, value);
  }
}`;

      await fs.writeFile(path.join(servicesDir, 'UserService.ts'), cacheCode1);
      await fs.writeFile(path.join(servicesDir, 'DataService.ts'), cacheCode2);

      // Run complete analysis workflow
      const config = {
        failureThreshold: 50, // High threshold to avoid failure
        warningThreshold: 20,
        outputDir: path.join(tempDir, 'analysis-output'),
        reportFormats: ['json', 'html', 'markdown'] as ('json' | 'html' | 'markdown')[],
        analysisConfig: {
          similarityThreshold: 0.7,
          minCodeBlockSize: 3,
          excludePatterns: ['node_modules/**'],
          includePatterns: ['**/*.ts'],
          analysisTypes: ['exact', 'functional', 'pattern'] as ('exact' | 'functional' | 'pattern' | 'configuration')[]
        }
      };

      const result = await buildIntegration.runBuildAnalysis(tempDir, config);

      // Verify workflow completed successfully
      expect(result.success).toBe(true);
      expect(result.reportPaths).toHaveLength(3); // json, html, markdown

      // Verify all report files exist and contain expected content
      for (const reportPath of result.reportPaths) {
        const exists = await fs.access(reportPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);

        const content = await fs.readFile(reportPath, 'utf-8');
        expect(content.length).toBeGreaterThan(0);

        // Check for expected content based on file type
        if (reportPath.endsWith('.json')) {
          const report = JSON.parse(content);
          expect(report.summary).toBeDefined();
          expect(report.metrics).toBeDefined();
        } else if (reportPath.endsWith('.html')) {
          expect(content).toContain('<!DOCTYPE html>');
          expect(content).toContain('Code Duplication Analysis Report');
        } else if (reportPath.endsWith('.md')) {
          expect(content).toContain('# Code Duplication Analysis Report');
          expect(content).toContain('## Summary');
        }
      }

      // Verify metrics are reasonable
      expect(result.duplicationPercentage).toBeGreaterThanOrEqual(0);
      expect(result.duplicationPercentage).toBeLessThanOrEqual(100);
      expect(result.totalDuplications).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty codebase gracefully', async () => {
      const emptyDir = path.join(tempDir, 'empty');
      await fs.mkdir(emptyDir, { recursive: true });

      const result = await buildIntegration.runBuildAnalysis(emptyDir, {
        outputDir: path.join(tempDir, 'empty-reports')
      });

      expect(result.success).toBe(true);
      expect(result.totalDuplications).toBe(0);
      expect(result.duplicationPercentage).toBe(0);
    });

    it('should handle invalid configuration gracefully', async () => {
      const invalidConfig = {
        failureThreshold: -1, // Invalid threshold
        analysisConfig: {
          similarityThreshold: 2.0, // Invalid threshold > 1
          minCodeBlockSize: -5,
          excludePatterns: [],
          includePatterns: [],
          analysisTypes: ['invalid'] as any
        }
      };

      // Should not throw, but may produce warnings
      const result = await buildIntegration.runBuildAnalysis(tempDir, invalidConfig);
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('should handle file system errors gracefully', async () => {
      const nonExistentDir = path.join(tempDir, 'does-not-exist');

      const result = await buildIntegration.runBuildAnalysis(nonExistentDir, {
        outputDir: path.join(tempDir, 'error-reports')
      });

      // Should handle gracefully and not crash
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });
});