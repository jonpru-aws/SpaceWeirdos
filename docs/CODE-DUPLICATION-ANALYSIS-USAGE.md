# Code Duplication Analysis Usage Guide

## Overview

The Code Duplication Analysis system provides comprehensive tools for identifying and optimizing code duplication across TypeScript/JavaScript projects. This guide covers how to use the analysis tools, interpret results, and implement recommendations.

## Quick Start

### Running Basic Analysis

The simplest way to run analysis on your codebase:

```bash
# Run comprehensive analysis on the entire codebase
npm run analyze:codebase

# Run analysis on specific directories
npm run analyze:codebase -- --include="src/frontend/**" --include="src/backend/**"

# Run analysis with custom similarity threshold
npm run analyze:codebase -- --similarity-threshold=0.8
```

### Running Space Weirdos Specific Analysis

For the Space Weirdos project, use the specialized analysis script:

```bash
# Run complete Space Weirdos analysis
npm run analyze:space-weirdos

# Generate detailed report with recommendations
npm run analyze:space-weirdos -- --detailed-report
```

## Command Line Interface

### Basic Commands

```bash
# Show help and available options
npx ts-node src/analysis/cli/AnalysisCLI.ts --help

# Run analysis with default settings
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze

# Run analysis on specific directory
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --source-dir="src/frontend"

# Generate report in specific format
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --output-format="html" --output-file="duplication-report.html"
```

### Configuration Options

#### Analysis Scope
```bash
# Include specific file patterns
--include="src/**/*.ts" --include="src/**/*.tsx"

# Exclude specific directories
--exclude="node_modules/**" --exclude="dist/**" --exclude="tests/**"

# Analyze only specific file types
--file-types="ts,tsx,js,jsx"
```

#### Analysis Thresholds
```bash
# Set similarity threshold (0.0 to 1.0)
--similarity-threshold=0.85

# Set minimum duplication size (lines of code)
--min-duplication-size=5

# Set complexity threshold for recommendations
--complexity-threshold="medium"
```

#### Output Options
```bash
# Output formats: json, html, markdown, console
--output-format="json"

# Specify output file
--output-file="reports/duplication-analysis.json"

# Include detailed recommendations
--include-recommendations

# Include code examples in output
--include-code-examples
```

## Analysis Types

### 1. Exact Match Detection

Identifies identical or near-identical code blocks:

```bash
# Focus on exact matches only
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --detectors="exact-match"

# Adjust exact match sensitivity
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --exact-match-threshold=0.95
```

**Use Cases:**
- Copy-pasted code blocks
- Repeated utility functions
- Identical validation logic

### 2. Functional Duplication Detection

Identifies different implementations achieving the same functionality:

```bash
# Focus on functional duplication
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --detectors="functional"

# Include semantic analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --semantic-analysis
```

**Use Cases:**
- Multiple implementations of the same business logic
- Different approaches to the same problem
- Redundant service methods

### 3. Pattern Duplication Detection

Identifies repeated implementation patterns:

```bash
# Focus on pattern detection
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --detectors="pattern"

# Include architectural pattern analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --architectural-patterns
```

**Use Cases:**
- Repeated design patterns
- Similar class structures
- Common implementation approaches

### 4. Configuration Duplication Detection

Identifies hardcoded values and configuration issues:

```bash
# Focus on configuration analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --detectors="configuration"

# Include environment variable analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --env-analysis
```

**Use Cases:**
- Hardcoded constants
- Scattered configuration values
- Inconsistent configuration access

## Specialized Analysis

### Singleton Pattern Analysis

Analyze singleton implementations and consolidation opportunities:

```bash
# Run singleton-specific analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --analyzers="singleton"

# Include dependency injection recommendations
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --analyzers="singleton,dependency-injection"
```

### Service Layer Analysis

Analyze service duplication and architecture:

```bash
# Run service consolidation analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --analyzers="service-consolidation"

# Include coupling analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --coupling-analysis
```

### Cache Implementation Analysis

Analyze caching mechanisms and consolidation opportunities:

```bash
# Run cache analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --analyzers="cache-consolidation"

# Include performance impact analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --performance-analysis
```

### Validation Logic Analysis

Analyze validation duplication and centralization opportunities:

```bash
# Run validation analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --analyzers="validation-consolidation"

# Include error handling analysis
npx ts-node src/analysis/cli/AnalysisCLI.ts analyze --analyzers="validation-consolidation,error-handling"
```

## Interpreting Results

### Analysis Report Structure

The analysis generates comprehensive reports with the following sections:

#### 1. Executive Summary
```json
{
  "summary": {
    "totalDuplications": 45,
    "byType": {
      "exact": 12,
      "functional": 18,
      "pattern": 10,
      "configuration": 5
    },
    "bySeverity": {
      "critical": 3,
      "high": 8,
      "medium": 20,
      "low": 14
    },
    "potentialSavings": {
      "linesOfCode": 1250,
      "files": 23,
      "estimatedHours": 40
    }
  }
}
```

#### 2. Detailed Duplications
```json
{
  "duplications": [
    {
      "id": "dup-001",
      "type": "exact",
      "similarity": 0.95,
      "description": "Identical validation logic in multiple components",
      "locations": [
        {
          "filePath": "src/frontend/components/WarbandEditor.tsx",
          "startLine": 45,
          "endLine": 62,
          "codeBlock": "// validation code here"
        }
      ],
      "impact": {
        "linesOfCode": 18,
        "complexity": 3,
        "maintainabilityIndex": 65
      }
    }
  ]
}
```

#### 3. Optimization Recommendations
```json
{
  "recommendations": [
    {
      "id": "rec-001",
      "title": "Consolidate Validation Logic",
      "type": "consolidation",
      "priority": "high",
      "complexity": {
        "level": "medium",
        "factors": ["Multiple file changes", "Test updates required"]
      },
      "benefits": [
        "Reduced code duplication",
        "Improved maintainability",
        "Consistent validation behavior"
      ],
      "implementationPlan": [
        {
          "order": 1,
          "title": "Create shared validation utility",
          "description": "Extract common validation logic into ValidationUtils class"
        }
      ]
    }
  ]
}
```

### Quality Metrics

#### Duplication Percentage
- **< 5%**: Excellent code quality
- **5-10%**: Good, minor optimizations possible
- **10-20%**: Moderate duplication, optimization recommended
- **> 20%**: High duplication, immediate attention needed

#### Maintainability Index
- **80-100**: Highly maintainable
- **60-79**: Moderately maintainable
- **40-59**: Difficult to maintain
- **< 40**: Very difficult to maintain

#### Technical Debt Ratio
- **< 5%**: Low technical debt
- **5-10%**: Manageable technical debt
- **10-20%**: Moderate technical debt
- **> 20%**: High technical debt

## Implementing Recommendations

### Priority-Based Implementation

1. **Critical Priority**: Address immediately
   - Security-related duplications
   - Performance-critical code paths
   - High-impact, low-complexity changes

2. **High Priority**: Address in current sprint
   - Frequently modified code areas
   - Code with high maintenance burden
   - Clear consolidation opportunities

3. **Medium Priority**: Address in next release
   - Moderate impact improvements
   - Architectural enhancements
   - Code organization improvements

4. **Low Priority**: Address when convenient
   - Minor optimizations
   - Style and consistency improvements
   - Future-proofing changes

### Implementation Workflow

#### 1. Review Recommendations
```bash
# Generate detailed recommendations
npm run analyze:space-weirdos -- --detailed-report --output-format="html"

# Open the generated report
open reports/duplication-report.html
```

#### 2. Plan Implementation
- Group related recommendations
- Identify dependencies between changes
- Estimate effort and timeline
- Plan testing strategy

#### 3. Implement Changes
- Start with highest priority, lowest complexity items
- Implement one recommendation at a time
- Run tests after each change
- Update documentation as needed

#### 4. Validate Results
```bash
# Re-run analysis to verify improvements
npm run analyze:space-weirdos

# Compare before/after metrics
npm run analyze:space-weirdos -- --compare-with="previous-report.json"
```

## Integration with Development Workflow

### Pre-commit Hooks

Add duplication analysis to pre-commit hooks:

```bash
# .husky/pre-commit
#!/bin/sh
npm run analyze:codebase -- --threshold-check --max-duplication=15%
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/quality-check.yml
- name: Run Duplication Analysis
  run: |
    npm run analyze:codebase -- --output-format=json --output-file=duplication-report.json
    npm run check-duplication-thresholds -- duplication-report.json
```

### Code Review Integration

Generate reports for code reviews:

```bash
# Generate report for changed files only
git diff --name-only HEAD~1 | xargs npm run analyze:codebase -- --files-from-stdin
```

## Configuration Files

### Analysis Configuration

Create `.duplication-analysis.json` in your project root:

```json
{
  "analysis": {
    "similarityThreshold": 0.85,
    "minDuplicationSize": 5,
    "complexityThreshold": "medium"
  },
  "scope": {
    "include": ["src/**/*.ts", "src/**/*.tsx"],
    "exclude": ["**/*.test.ts", "**/*.spec.ts", "node_modules/**"]
  },
  "detectors": {
    "exactMatch": { "enabled": true, "threshold": 0.95 },
    "functional": { "enabled": true, "semanticAnalysis": true },
    "pattern": { "enabled": true, "architecturalPatterns": true },
    "configuration": { "enabled": true, "envAnalysis": true }
  },
  "analyzers": {
    "singleton": { "enabled": true, "dependencyInjection": true },
    "serviceConsolidation": { "enabled": true, "couplingAnalysis": true },
    "cacheConsolidation": { "enabled": true, "performanceAnalysis": true },
    "validationConsolidation": { "enabled": true, "errorHandling": true }
  },
  "output": {
    "format": "json",
    "includeRecommendations": true,
    "includeCodeExamples": false,
    "detailedMetrics": true
  },
  "thresholds": {
    "maxDuplicationPercentage": 15,
    "minMaintainabilityIndex": 60,
    "maxTechnicalDebtRatio": 20
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Analysis Takes Too Long
```bash
# Reduce analysis scope
npm run analyze:codebase -- --exclude="**/*.test.ts" --exclude="node_modules/**"

# Use faster similarity algorithms
npm run analyze:codebase -- --fast-mode
```

#### 2. Too Many False Positives
```bash
# Increase similarity threshold
npm run analyze:codebase -- --similarity-threshold=0.9

# Increase minimum duplication size
npm run analyze:codebase -- --min-duplication-size=10
```

#### 3. Missing Expected Duplications
```bash
# Decrease similarity threshold
npm run analyze:codebase -- --similarity-threshold=0.7

# Enable semantic analysis
npm run analyze:codebase -- --semantic-analysis
```

#### 4. Out of Memory Errors
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run analyze:codebase

# Analyze in smaller chunks
npm run analyze:codebase -- --chunk-size=100
```

### Debug Mode

Enable debug output for troubleshooting:

```bash
# Enable debug logging
DEBUG=duplication-analysis npm run analyze:codebase

# Verbose output
npm run analyze:codebase -- --verbose

# Save intermediate results
npm run analyze:codebase -- --save-intermediate --debug-dir="debug-output"
```

## Best Practices

### 1. Regular Analysis
- Run analysis weekly or bi-weekly
- Include in code review process
- Track metrics over time

### 2. Incremental Improvements
- Address high-priority items first
- Make small, focused changes
- Validate each improvement

### 3. Team Collaboration
- Share analysis results with team
- Discuss recommendations in team meetings
- Establish coding standards based on findings

### 4. Continuous Monitoring
- Set up automated analysis in CI/CD
- Monitor duplication trends
- Adjust thresholds based on project needs

## Advanced Usage

### Custom Detectors

Create custom detectors for project-specific patterns:

```typescript
// src/analysis/detectors/CustomDetector.ts
import { DuplicationDetector } from './DuplicationDetector';

export class CustomDetector extends DuplicationDetector {
  async detectDuplications(files: ParsedFile[]): Promise<DuplicationInstance[]> {
    // Custom detection logic
  }
}
```

### Custom Analyzers

Create specialized analyzers for domain-specific analysis:

```typescript
// src/analysis/analyzers/CustomAnalyzer.ts
import { Analyzer } from './Analyzer';

export class CustomAnalyzer extends Analyzer {
  async analyze(duplications: DuplicationInstance[]): Promise<OptimizationRecommendation[]> {
    // Custom analysis logic
  }
}
```

### API Usage

Use the analysis engine programmatically:

```typescript
import { AnalysisEngine } from './src/analysis/AnalysisEngine';

const engine = new AnalysisEngine({
  similarityThreshold: 0.85,
  detectors: ['exact-match', 'functional', 'pattern'],
  analyzers: ['singleton', 'service-consolidation']
});

const results = await engine.analyze(['src/**/*.ts']);
console.log(results.summary);
```