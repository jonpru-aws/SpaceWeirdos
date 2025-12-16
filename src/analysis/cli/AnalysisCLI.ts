#!/usr/bin/env node

/**
 * Command-line interface for running duplication analysis
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ReportGenerator } from '../generators/ReportGenerator.js';
import { DuplicationInstance, OptimizationRecommendation, AnalysisConfig } from '../types/DuplicationModels.js';

interface CLIOptions {
  input: string;
  output?: string;
  format: 'json' | 'html' | 'markdown';
  config?: string;
  threshold?: number;
  types?: string[];
  exclude?: string[];
  include?: string[];
  verbose?: boolean;
}

export class AnalysisCLI {
  private reportGenerator: ReportGenerator;

  constructor() {
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * Main CLI entry point
   */
  async run(args: string[]): Promise<void> {
    try {
      const options = this.parseArguments(args);
      
      if (options.verbose) {
        console.log('Starting code duplication analysis...');
        console.log('Input directory:', options.input);
        console.log('Output format:', options.format);
      }

      const config = await this.loadConfig(options);
      const { duplications, recommendations } = await this.runAnalysis(options.input, config);
      
      const report = await this.reportGenerator.generateReport(duplications, recommendations);
      const output = await this.reportGenerator.exportReport(report, options.format);

      if (options.output) {
        await this.writeOutput(options.output, output, options.format);
        console.log(`Analysis complete. Report saved to: ${options.output}`);
      } else {
        console.log(output);
      }

      // Print summary to stderr for CI/CD integration
      this.printSummary(report, options.verbose);

    } catch (error) {
      console.error('Analysis failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  /**
   * Parse command line arguments
   */
  private parseArguments(args: string[]): CLIOptions {
    const options: CLIOptions = {
      input: '.',
      format: 'json'
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      switch (arg) {
        case '--input':
        case '-i':
          if (!nextArg) throw new Error('--input requires a directory path');
          options.input = nextArg;
          i++;
          break;

        case '--output':
        case '-o':
          if (!nextArg) throw new Error('--output requires a file path');
          options.output = nextArg;
          i++;
          break;

        case '--format':
        case '-f':
          if (!nextArg || !['json', 'html', 'markdown'].includes(nextArg)) {
            throw new Error('--format must be one of: json, html, markdown');
          }
          options.format = nextArg as 'json' | 'html' | 'markdown';
          i++;
          break;

        case '--config':
        case '-c':
          if (!nextArg) throw new Error('--config requires a config file path');
          options.config = nextArg;
          i++;
          break;

        case '--threshold':
        case '-t':
          if (!nextArg) throw new Error('--threshold requires a number between 0 and 1');
          const threshold = parseFloat(nextArg);
          if (isNaN(threshold) || threshold < 0 || threshold > 1) {
            throw new Error('--threshold must be a number between 0 and 1');
          }
          options.threshold = threshold;
          i++;
          break;

        case '--types':
          if (!nextArg) throw new Error('--types requires a comma-separated list');
          options.types = nextArg.split(',').map(t => t.trim());
          i++;
          break;

        case '--exclude':
          if (!nextArg) throw new Error('--exclude requires a comma-separated list of patterns');
          options.exclude = nextArg.split(',').map(p => p.trim());
          i++;
          break;

        case '--include':
          if (!nextArg) throw new Error('--include requires a comma-separated list of patterns');
          options.include = nextArg.split(',').map(p => p.trim());
          i++;
          break;

        case '--verbose':
        case '-v':
          options.verbose = true;
          break;

        case '--help':
        case '-h':
          this.printHelp();
          process.exit(0);
          break;

        default:
          if (arg.startsWith('-')) {
            throw new Error(`Unknown option: ${arg}`);
          }
          // Treat as input directory if no --input specified
          if (options.input === '.') {
            options.input = arg;
          }
          break;
      }
    }

    return options;
  }

  /**
   * Load analysis configuration
   */
  private async loadConfig(options: CLIOptions): Promise<AnalysisConfig> {
    let config: Partial<AnalysisConfig> = {};

    // Load from config file if specified
    if (options.config) {
      try {
        const configContent = await fs.readFile(options.config, 'utf-8');
        config = JSON.parse(configContent);
      } catch (error) {
        throw new Error(`Failed to load config file: ${options.config}`);
      }
    }

    // Override with CLI options
    return {
      similarityThreshold: options.threshold ?? config.similarityThreshold ?? 0.8,
      minCodeBlockSize: config.minCodeBlockSize ?? 5,
      excludePatterns: options.exclude ?? config.excludePatterns ?? [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.test.ts',
        '**/*.test.js',
        '**/*.spec.ts',
        '**/*.spec.js'
      ],
      includePatterns: options.include ?? config.includePatterns ?? [
        '**/*.ts',
        '**/*.js',
        '**/*.tsx',
        '**/*.jsx'
      ],
      analysisTypes: (options.types as any) ?? config.analysisTypes ?? [
        'exact',
        'functional',
        'pattern',
        'configuration'
      ]
    };
  }

  /**
   * Run the duplication analysis
   */
  private async runAnalysis(
    inputPath: string,
    config: AnalysisConfig
  ): Promise<{ duplications: DuplicationInstance[]; recommendations: OptimizationRecommendation[] }> {
    // For now, return mock data since the full analysis pipeline isn't implemented yet
    // This will be replaced with actual analysis logic in future tasks
    
    console.log(`Analyzing directory: ${inputPath}`);
    console.log(`Configuration: ${JSON.stringify(config, null, 2)}`);
    
    // Mock duplications for demonstration
    const duplications: DuplicationInstance[] = [
      {
        id: 'dup-1',
        type: 'exact',
        similarity: 0.95,
        locations: [
          {
            filePath: path.join(inputPath, 'src/example1.ts'),
            startLine: 10,
            endLine: 25,
            codeBlock: 'function validateInput(input: string) { /* ... */ }',
            context: 'Input validation'
          },
          {
            filePath: path.join(inputPath, 'src/example2.ts'),
            startLine: 15,
            endLine: 30,
            codeBlock: 'function validateInput(input: string) { /* ... */ }',
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
      }
    ];

    // Mock recommendations
    const recommendations: OptimizationRecommendation[] = [
      {
        id: 'rec-1',
        title: 'Consolidate input validation functions',
        description: 'Create a shared validation utility to eliminate duplicate validation logic',
        type: 'consolidation',
        priority: 'high',
        complexity: {
          level: 'medium',
          factors: ['Multiple file changes', 'Test updates required'],
          reasoning: 'Requires refactoring across multiple components'
        },
        estimatedEffort: {
          hours: 4,
          complexity: {
            level: 'medium',
            factors: ['Refactoring', 'Testing'],
            reasoning: 'Moderate complexity due to multiple touchpoints'
          },
          dependencies: ['Validation utility creation', 'Import updates']
        },
        benefits: [
          'Reduced code duplication',
          'Improved maintainability',
          'Consistent validation behavior'
        ],
        risks: [
          {
            type: 'breaking_change',
            severity: 'low',
            description: 'Potential changes to validation behavior',
            mitigation: 'Comprehensive testing of validation scenarios'
          }
        ],
        implementationPlan: [
          {
            order: 1,
            title: 'Create shared validation utility',
            description: 'Extract common validation logic into a reusable utility',
            validation: 'Unit tests pass for new utility'
          },
          {
            order: 2,
            title: 'Update existing code to use utility',
            description: 'Replace duplicate validation code with utility calls',
            validation: 'All existing tests continue to pass'
          }
        ],
        affectedFiles: ['src/example1.ts', 'src/example2.ts', 'src/utils/validation.ts']
      }
    ];

    return { duplications, recommendations };
  }

  /**
   * Write output to file
   */
  private async writeOutput(outputPath: string, content: string, format: string): Promise<void> {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Add appropriate file extension if not present
    let finalPath = outputPath;
    const ext = path.extname(outputPath);
    if (!ext) {
      const extensions = { json: '.json', html: '.html', markdown: '.md' };
      finalPath = outputPath + extensions[format as keyof typeof extensions];
    }

    await fs.writeFile(finalPath, content, 'utf-8');
  }

  /**
   * Print summary for CI/CD integration
   */
  private printSummary(report: any, verbose: boolean): void {
    console.error('\n=== Analysis Summary ===');
    console.error(`Total Duplications: ${report.summary.totalDuplications}`);
    console.error(`Duplication Percentage: ${report.metrics.duplicationPercentage.toFixed(1)}%`);
    console.error(`Maintainability Index: ${report.metrics.maintainabilityIndex.toFixed(0)}`);
    console.error(`Potential Savings: ${report.summary.potentialSavings.linesOfCode} lines`);
    
    if (verbose) {
      console.error('\nBy Type:');
      Object.entries(report.summary.byType).forEach(([type, count]) => {
        console.error(`  ${type}: ${count}`);
      });
      
      console.error('\nBy Priority:');
      Object.entries(report.summary.bySeverity).forEach(([priority, count]) => {
        console.error(`  ${priority}: ${count}`);
      });
    }
    
    console.error('========================\n');
  }

  /**
   * Print help information
   */
  private printHelp(): void {
    console.log(`
Code Duplication Analysis CLI

Usage: duplication-analysis [options] [input-directory]

Options:
  -i, --input <dir>        Input directory to analyze (default: current directory)
  -o, --output <file>      Output file path (default: stdout)
  -f, --format <format>    Output format: json, html, markdown (default: json)
  -c, --config <file>      Configuration file path
  -t, --threshold <num>    Similarity threshold 0-1 (default: 0.8)
  --types <types>          Analysis types: exact,functional,pattern,configuration
  --exclude <patterns>     Exclude patterns (comma-separated)
  --include <patterns>     Include patterns (comma-separated)
  -v, --verbose            Verbose output
  -h, --help               Show this help

Examples:
  duplication-analysis                           # Analyze current directory
  duplication-analysis src/                      # Analyze src directory
  duplication-analysis -o report.html -f html   # Generate HTML report
  duplication-analysis -t 0.9 --verbose         # High threshold with verbose output
  duplication-analysis -c analysis.config.json  # Use custom configuration

Configuration File Format (JSON):
{
  "similarityThreshold": 0.8,
  "minCodeBlockSize": 5,
  "excludePatterns": ["node_modules/**", "dist/**"],
  "includePatterns": ["**/*.ts", "**/*.js"],
  "analysisTypes": ["exact", "functional", "pattern", "configuration"]
}
`);
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new AnalysisCLI();
  cli.run(process.argv.slice(2)).catch(error => {
    console.error('CLI Error:', error);
    process.exit(1);
  });
}