/**
 * Integration utilities for build and CI/CD processes
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ReportGenerator } from '../generators/ReportGenerator.js';
import { DuplicationReport, AnalysisConfig } from '../types/DuplicationModels.js';

export interface BuildIntegrationConfig {
  /** Fail build if duplication percentage exceeds this threshold */
  failureThreshold?: number;
  /** Warn if duplication percentage exceeds this threshold */
  warningThreshold?: number;
  /** Output directory for reports */
  outputDir?: string;
  /** Generate reports in these formats */
  reportFormats?: ('json' | 'html' | 'markdown')[];
  /** Analysis configuration */
  analysisConfig?: AnalysisConfig;
}

export interface BuildResult {
  success: boolean;
  duplicationPercentage: number;
  totalDuplications: number;
  reportPaths: string[];
  warnings: string[];
  errors: string[];
}

export class BuildIntegration {
  private reportGenerator: ReportGenerator;

  constructor() {
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * Run analysis as part of build process
   */
  async runBuildAnalysis(
    projectPath: string,
    config: BuildIntegrationConfig = {}
  ): Promise<BuildResult> {
    const result: BuildResult = {
      success: true,
      duplicationPercentage: 0,
      totalDuplications: 0,
      reportPaths: [],
      warnings: [],
      errors: []
    };

    try {
      // Load configuration with defaults
      const buildConfig = this.mergeWithDefaults(config);
      
      // Run analysis (mock implementation for now)
      const { duplications, recommendations } = await this.runAnalysis(projectPath, buildConfig.analysisConfig!);
      
      // Generate report
      const report = await this.reportGenerator.generateReport(duplications, recommendations);
      
      // Update result metrics
      result.duplicationPercentage = report.metrics.duplicationPercentage;
      result.totalDuplications = report.summary.totalDuplications;

      // Generate reports in requested formats
      if (buildConfig.outputDir) {
        await fs.mkdir(buildConfig.outputDir, { recursive: true });
        
        for (const format of buildConfig.reportFormats!) {
          const reportContent = await this.reportGenerator.exportReport(report, format);
          const fileName = `duplication-report.${this.getFileExtension(format)}`;
          const filePath = path.join(buildConfig.outputDir, fileName);
          
          await fs.writeFile(filePath, reportContent, 'utf-8');
          result.reportPaths.push(filePath);
        }
      }

      // Check thresholds and set warnings/errors
      this.evaluateThresholds(report, buildConfig, result);

      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      return result;
    }
  }

  /**
   * Generate CI/CD integration scripts
   */
  async generateCIScripts(outputDir: string): Promise<void> {
    await fs.mkdir(outputDir, { recursive: true });

    // GitHub Actions workflow
    const githubWorkflow = this.generateGitHubWorkflow();
    await fs.writeFile(path.join(outputDir, 'duplication-analysis.yml'), githubWorkflow);

    // Jenkins pipeline
    const jenkinsfile = this.generateJenkinsfile();
    await fs.writeFile(path.join(outputDir, 'Jenkinsfile.duplication'), jenkinsfile);

    // GitLab CI configuration
    const gitlabCI = this.generateGitLabCI();
    await fs.writeFile(path.join(outputDir, '.gitlab-ci-duplication.yml'), gitlabCI);

    // NPM scripts configuration
    const npmScripts = this.generateNPMScripts();
    await fs.writeFile(path.join(outputDir, 'package-scripts.json'), npmScripts);
  }

  /**
   * Create configuration template
   */
  generateConfigTemplate(): string {
    const template = {
      buildIntegration: {
        failureThreshold: 15,
        warningThreshold: 10,
        outputDir: 'reports/duplication',
        reportFormats: ['json', 'html'],
        analysisConfig: {
          similarityThreshold: 0.8,
          minCodeBlockSize: 5,
          excludePatterns: [
            'node_modules/**',
            'dist/**',
            'build/**',
            '**/*.test.ts',
            '**/*.test.js'
          ],
          includePatterns: [
            '**/*.ts',
            '**/*.js',
            '**/*.tsx',
            '**/*.jsx'
          ],
          analysisTypes: ['exact', 'functional', 'pattern', 'configuration']
        }
      }
    };

    return JSON.stringify(template, null, 2);
  }

  /**
   * Merge configuration with defaults
   */
  private mergeWithDefaults(config: BuildIntegrationConfig): Required<BuildIntegrationConfig> {
    return {
      failureThreshold: config.failureThreshold ?? 15,
      warningThreshold: config.warningThreshold ?? 10,
      outputDir: config.outputDir ?? 'reports/duplication',
      reportFormats: config.reportFormats ?? ['json', 'html'],
      analysisConfig: config.analysisConfig ?? {
        similarityThreshold: 0.8,
        minCodeBlockSize: 5,
        excludePatterns: ['node_modules/**', 'dist/**', '**/*.test.*'],
        includePatterns: ['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx'],
        analysisTypes: ['exact', 'functional', 'pattern', 'configuration']
      }
    };
  }

  /**
   * Mock analysis implementation
   */
  private async runAnalysis(projectPath: string, config: AnalysisConfig): Promise<any> {
    // This is a mock implementation - will be replaced with actual analysis
    return {
      duplications: [],
      recommendations: []
    };
  }

  /**
   * Evaluate thresholds and set appropriate warnings/errors
   */
  private evaluateThresholds(
    report: DuplicationReport,
    config: Required<BuildIntegrationConfig>,
    result: BuildResult
  ): void {
    const percentage = report.metrics.duplicationPercentage;

    if (percentage >= config.failureThreshold) {
      result.success = false;
      result.errors.push(
        `Duplication percentage (${percentage.toFixed(1)}%) exceeds failure threshold (${config.failureThreshold}%)`
      );
    } else if (percentage >= config.warningThreshold) {
      result.warnings.push(
        `Duplication percentage (${percentage.toFixed(1)}%) exceeds warning threshold (${config.warningThreshold}%)`
      );
    }

    // Additional quality checks
    if (report.metrics.maintainabilityIndex < 60) {
      result.warnings.push(
        `Low maintainability index: ${report.metrics.maintainabilityIndex.toFixed(0)}`
      );
    }

    if (report.metrics.technicalDebtRatio > 25) {
      result.warnings.push(
        `High technical debt ratio: ${report.metrics.technicalDebtRatio.toFixed(1)}%`
      );
    }
  }

  /**
   * Get file extension for report format
   */
  private getFileExtension(format: string): string {
    const extensions = {
      json: 'json',
      html: 'html',
      markdown: 'md'
    };
    return extensions[format as keyof typeof extensions] || 'txt';
  }

  /**
   * Generate GitHub Actions workflow
   */
  private generateGitHubWorkflow(): string {
    return `name: Code Duplication Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  duplication-analysis:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run duplication analysis
      run: |
        npm run duplication:analyze
        
    - name: Upload analysis reports
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: duplication-reports
        path: reports/duplication/
        
    - name: Comment PR with results
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const path = 'reports/duplication/duplication-report.json';
          if (fs.existsSync(path)) {
            const report = JSON.parse(fs.readFileSync(path, 'utf8'));
            const comment = \`## Code Duplication Analysis Results
            
            - **Total Duplications:** \${report.summary.totalDuplications}
            - **Duplication Percentage:** \${report.metrics.duplicationPercentage.toFixed(1)}%
            - **Maintainability Index:** \${report.metrics.maintainabilityIndex.toFixed(0)}
            - **Potential Savings:** \${report.summary.potentialSavings.linesOfCode} lines
            
            [View detailed report](../reports/duplication/duplication-report.html)\`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
          }
`;
  }

  /**
   * Generate Jenkinsfile
   */
  private generateJenkinsfile(): string {
    return `pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Duplication Analysis') {
            steps {
                sh 'npm run duplication:analyze'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/duplication/**/*', fingerprint: true
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'reports/duplication',
                        reportFiles: 'duplication-report.html',
                        reportName: 'Duplication Analysis Report'
                    ])
                }
                failure {
                    emailext (
                        subject: "Duplication Analysis Failed: \${env.JOB_NAME} - \${env.BUILD_NUMBER}",
                        body: "The duplication analysis has failed. Please check the build logs.",
                        to: "\${env.CHANGE_AUTHOR_EMAIL}"
                    )
                }
            }
        }
    }
}`;
  }

  /**
   * Generate GitLab CI configuration
   */
  private generateGitLabCI(): string {
    return `duplication_analysis:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run duplication:analyze
  artifacts:
    reports:
      junit: reports/duplication/duplication-report.xml
    paths:
      - reports/duplication/
    expire_in: 1 week
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

pages:
  stage: deploy
  dependencies:
    - duplication_analysis
  script:
    - mkdir public
    - cp -r reports/duplication/* public/
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
`;
  }

  /**
   * Generate NPM scripts configuration
   */
  private generateNPMScripts(): string {
    return JSON.stringify({
      scripts: {
        "duplication:analyze": "node dist/analysis/cli/AnalysisCLI.js --output reports/duplication/duplication-report --format html --verbose",
        "duplication:json": "node dist/analysis/cli/AnalysisCLI.js --output reports/duplication/duplication-report.json --format json",
        "duplication:html": "node dist/analysis/cli/AnalysisCLI.js --output reports/duplication/duplication-report.html --format html",
        "duplication:markdown": "node dist/analysis/cli/AnalysisCLI.js --output reports/duplication/duplication-report.md --format markdown",
        "duplication:ci": "node dist/analysis/cli/AnalysisCLI.js --format json --threshold 0.85 | tee reports/duplication/ci-results.json"
      }
    }, null, 2);
  }
}