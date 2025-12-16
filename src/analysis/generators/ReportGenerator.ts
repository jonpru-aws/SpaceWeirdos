/**
 * Report generation and formatting for duplication analysis results
 */

import {
  DuplicationInstance,
  OptimizationRecommendation,
  DuplicationReport,
  ReportSummary,
  QualityMetrics,
  ImpactMetrics
} from '../types/DuplicationModels.js';
import { IReportGenerator } from '../interfaces/AnalysisInterfaces.js';

export class ReportGenerator implements IReportGenerator {
  /**
   * Generate a comprehensive duplication analysis report
   */
  async generateReport(
    duplications: DuplicationInstance[],
    recommendations: OptimizationRecommendation[]
  ): Promise<DuplicationReport> {
    const summary = this.generateSummary(duplications, recommendations);
    const metrics = this.calculateQualityMetrics(duplications, recommendations);

    return {
      summary,
      duplications,
      recommendations,
      metrics,
      generatedAt: new Date()
    };
  }

  /**
   * Export report in specified format
   */
  async exportReport(report: DuplicationReport, format: 'json' | 'html' | 'markdown'): Promise<string> {
    switch (format) {
      case 'json':
        return this.exportAsJson(report);
      case 'html':
        return this.exportAsHtml(report);
      case 'markdown':
        return this.exportAsMarkdown(report);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate report summary with statistics and potential savings
   */
  private generateSummary(
    duplications: DuplicationInstance[],
    recommendations: OptimizationRecommendation[]
  ): ReportSummary {
    const byType = this.groupByType(duplications);
    const bySeverity = this.groupBySeverity(recommendations);
    const potentialSavings = this.calculatePotentialSavings(duplications, recommendations);

    return {
      totalDuplications: duplications.length,
      byType,
      bySeverity,
      potentialSavings
    };
  }

  /**
   * Calculate quality metrics for maintainability and technical debt assessment
   */
  private calculateQualityMetrics(
    duplications: DuplicationInstance[],
    recommendations: OptimizationRecommendation[]
  ): QualityMetrics {
    const totalLinesOfCode = this.calculateTotalLinesOfCode(duplications);
    const duplicatedLines = duplications.reduce((sum, dup) => sum + dup.impact.linesOfCode, 0);
    
    const duplicationPercentage = totalLinesOfCode > 0 ? (duplicatedLines / totalLinesOfCode) * 100 : 0;
    
    const maintainabilityIndex = this.calculateMaintainabilityIndex(duplications);
    const technicalDebtRatio = this.calculateTechnicalDebtRatio(duplications, recommendations);
    const codeComplexity = this.calculateAverageComplexity(duplications);

    return {
      duplicationPercentage,
      maintainabilityIndex,
      technicalDebtRatio,
      codeComplexity
    };
  }

  /**
   * Group duplications by type
   */
  private groupByType(duplications: DuplicationInstance[]): Record<string, number> {
    const groups: Record<string, number> = {
      exact: 0,
      functional: 0,
      pattern: 0,
      configuration: 0
    };

    duplications.forEach(dup => {
      groups[dup.type] = (groups[dup.type] || 0) + 1;
    });

    return groups;
  }

  /**
   * Group recommendations by severity/priority
   */
  private groupBySeverity(recommendations: OptimizationRecommendation[]): Record<string, number> {
    const groups: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    recommendations.forEach(rec => {
      groups[rec.priority] = (groups[rec.priority] || 0) + 1;
    });

    return groups;
  }

  /**
   * Calculate potential savings from implementing recommendations
   */
  private calculatePotentialSavings(
    duplications: DuplicationInstance[],
    recommendations: OptimizationRecommendation[]
  ): { linesOfCode: number; files: number; estimatedHours: number } {
    const linesOfCode = duplications.reduce((sum, dup) => {
      // Estimate lines saved by removing duplications (conservative estimate)
      const duplicateLocations = dup.locations.length - 1; // Keep one original
      return sum + (duplicateLocations * dup.impact.linesOfCode * 0.8); // 80% savings estimate
    }, 0);

    const affectedFilesSet = new Set<string>();
    recommendations.forEach(rec => {
      rec.affectedFiles.forEach(file => affectedFilesSet.add(file));
    });
    const files = affectedFilesSet.size;

    const estimatedHours = recommendations.reduce((sum, rec) => sum + rec.estimatedEffort.hours, 0);

    return {
      linesOfCode: Math.round(linesOfCode),
      files,
      estimatedHours: Math.round(estimatedHours)
    };
  }

  /**
   * Calculate total lines of code across all analyzed files
   */
  private calculateTotalLinesOfCode(duplications: DuplicationInstance[]): number {
    const filesSet = new Set<string>();
    let totalLines = 0;

    duplications.forEach(dup => {
      dup.locations.forEach(loc => {
        if (!filesSet.has(loc.filePath)) {
          filesSet.add(loc.filePath);
          // Estimate total file size based on duplication location
          totalLines += Math.max(loc.endLine, 100); // Conservative estimate
        }
      });
    });

    return totalLines;
  }

  /**
   * Calculate maintainability index based on duplication patterns
   */
  private calculateMaintainabilityIndex(duplications: DuplicationInstance[]): number {
    if (duplications.length === 0) return 100;

    const avgMaintainability = duplications.reduce((sum, dup) => 
      sum + dup.impact.maintainabilityIndex, 0) / duplications.length;

    // Penalize based on number of duplications
    const duplicationPenalty = Math.min(duplications.length * 2, 30);
    
    return Math.max(0, Math.min(100, avgMaintainability - duplicationPenalty));
  }

  /**
   * Calculate technical debt ratio
   */
  private calculateTechnicalDebtRatio(
    duplications: DuplicationInstance[],
    recommendations: OptimizationRecommendation[]
  ): number {
    const totalEffort = recommendations.reduce((sum, rec) => sum + rec.estimatedEffort.hours, 0);
    const totalComplexity = duplications.reduce((sum, dup) => sum + dup.impact.complexity, 0);
    
    // Technical debt ratio as percentage of total development effort
    const baselineEffort = Math.max(totalEffort * 0.1, 40); // Minimum baseline
    return totalComplexity > 0 ? Math.min(100, (totalEffort / baselineEffort) * 10) : 0;
  }

  /**
   * Calculate average code complexity
   */
  private calculateAverageComplexity(duplications: DuplicationInstance[]): number {
    if (duplications.length === 0) return 0;
    
    const totalComplexity = duplications.reduce((sum, dup) => sum + dup.impact.complexity, 0);
    return totalComplexity / duplications.length;
  }

  /**
   * Export report as JSON
   */
  private exportAsJson(report: DuplicationReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report as HTML
   */
  private exportAsHtml(report: DuplicationReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Duplication Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; font-size: 0.9em; }
        .section { margin-bottom: 30px; }
        .duplication-item { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #007cba; }
        .recommendation-item { background: #fff3cd; padding: 15px; margin: 10px 0; border-left: 4px solid #ffc107; }
        .priority-high { border-left-color: #dc3545; }
        .priority-critical { border-left-color: #6f42c1; }
        .code-location { font-family: monospace; background: #f8f9fa; padding: 5px; margin: 5px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Code Duplication Analysis Report</h1>
        <p>Generated on: ${report.generatedAt.toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="metric-card">
            <div class="metric-value">${report.summary.totalDuplications}</div>
            <div class="metric-label">Total Duplications</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${report.metrics.duplicationPercentage.toFixed(1)}%</div>
            <div class="metric-label">Duplication Percentage</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${report.metrics.maintainabilityIndex.toFixed(0)}</div>
            <div class="metric-label">Maintainability Index</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${report.summary.potentialSavings.linesOfCode}</div>
            <div class="metric-label">Lines of Code Savings</div>
        </div>
    </div>

    <div class="section">
        <h2>Duplication Summary by Type</h2>
        ${Object.entries(report.summary.byType).map(([type, count]) => 
          `<p><strong>${type}:</strong> ${count} instances</p>`
        ).join('')}
    </div>

    <div class="section">
        <h2>Quality Metrics</h2>
        <ul>
            <li><strong>Technical Debt Ratio:</strong> ${report.metrics.technicalDebtRatio.toFixed(1)}%</li>
            <li><strong>Average Code Complexity:</strong> ${report.metrics.codeComplexity.toFixed(1)}</li>
            <li><strong>Estimated Effort:</strong> ${report.summary.potentialSavings.estimatedHours} hours</li>
        </ul>
    </div>

    <div class="section">
        <h2>Top Duplications</h2>
        ${report.duplications.slice(0, 10).map(dup => `
            <div class="duplication-item">
                <h4>${dup.description}</h4>
                <p><strong>Type:</strong> ${dup.type} | <strong>Similarity:</strong> ${(dup.similarity * 100).toFixed(1)}%</p>
                <p><strong>Impact:</strong> ${dup.impact.linesOfCode} lines, complexity ${dup.impact.complexity}</p>
                <div><strong>Locations:</strong></div>
                ${dup.locations.map(loc => 
                  `<div class="code-location">${loc.filePath}:${loc.startLine}-${loc.endLine}</div>`
                ).join('')}
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Optimization Recommendations</h2>
        ${report.recommendations.slice(0, 10).map(rec => `
            <div class="recommendation-item priority-${rec.priority}">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
                <p><strong>Priority:</strong> ${rec.priority} | <strong>Effort:</strong> ${rec.estimatedEffort.hours}h</p>
                <p><strong>Benefits:</strong> ${rec.benefits.join(', ')}</p>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  /**
   * Export report as Markdown
   */
  private exportAsMarkdown(report: DuplicationReport): string {
    return `# Code Duplication Analysis Report

Generated on: ${report.generatedAt.toLocaleString()}

## Summary

- **Total Duplications:** ${report.summary.totalDuplications}
- **Duplication Percentage:** ${report.metrics.duplicationPercentage.toFixed(1)}%
- **Maintainability Index:** ${report.metrics.maintainabilityIndex.toFixed(0)}
- **Technical Debt Ratio:** ${report.metrics.technicalDebtRatio.toFixed(1)}%

## Potential Savings

- **Lines of Code:** ${report.summary.potentialSavings.linesOfCode}
- **Files Affected:** ${report.summary.potentialSavings.files}
- **Estimated Effort:** ${report.summary.potentialSavings.estimatedHours} hours

## Duplications by Type

${Object.entries(report.summary.byType).map(([type, count]) => 
  `- **${type}:** ${count} instances`
).join('\n')}

## Recommendations by Priority

${Object.entries(report.summary.bySeverity).map(([priority, count]) => 
  `- **${priority}:** ${count} recommendations`
).join('\n')}

## Top Duplications

${report.duplications.slice(0, 10).map((dup, index) => `
### ${index + 1}. ${dup.description}

- **Type:** ${dup.type}
- **Similarity:** ${(dup.similarity * 100).toFixed(1)}%
- **Impact:** ${dup.impact.linesOfCode} lines, complexity ${dup.impact.complexity}

**Locations:**
${dup.locations.map(loc => `- \`${loc.filePath}:${loc.startLine}-${loc.endLine}\``).join('\n')}
`).join('\n')}

## Top Recommendations

${report.recommendations.slice(0, 10).map((rec, index) => `
### ${index + 1}. ${rec.title}

${rec.description}

- **Priority:** ${rec.priority}
- **Effort:** ${rec.estimatedEffort.hours} hours
- **Complexity:** ${rec.complexity.level}

**Benefits:**
${rec.benefits.map(benefit => `- ${benefit}`).join('\n')}

**Affected Files:**
${rec.affectedFiles.map(file => `- \`${file}\``).join('\n')}
`).join('\n')}

## Quality Metrics Details

- **Average Code Complexity:** ${report.metrics.codeComplexity.toFixed(2)}
- **Maintainability Index:** ${report.metrics.maintainabilityIndex.toFixed(1)}/100
- **Technical Debt Ratio:** ${report.metrics.technicalDebtRatio.toFixed(1)}%
- **Duplication Coverage:** ${report.metrics.duplicationPercentage.toFixed(2)}%

---
*Report generated by Code Duplication Analysis System*
`;
  }
}