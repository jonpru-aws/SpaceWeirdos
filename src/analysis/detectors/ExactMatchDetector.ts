/**
 * ExactMatchDetector - Identifies identical or near-identical code blocks
 * Handles whitespace, comments, and formatting variations
 */

import { IDuplicationDetector } from '../interfaces/AnalysisInterfaces.js';
import { DuplicationInstance, CodeLocation, ImpactMetrics } from '../types/DuplicationModels.js';
import { ParsedFile } from '../parsers/CodeParser.js';
import { SimilarityAnalyzer, CodeBlock, SimilarityAlgorithm } from '../analyzers/SimilarityAnalyzer.js';
import { v4 as uuidv4 } from 'uuid';

export interface ExactMatchConfig {
  minSimilarity: number;
  minCodeBlockSize: number;
  ignoreWhitespace: boolean;
  ignoreComments: boolean;
  ignoreVariableNames: boolean;
}

export class ExactMatchDetector implements IDuplicationDetector {
  private config: ExactMatchConfig;
  private similarityAnalyzer: SimilarityAnalyzer;

  constructor(config?: Partial<ExactMatchConfig>) {
    this.config = {
      minSimilarity: 0.95, // 95% similarity for exact matches
      minCodeBlockSize: 5, // Minimum 5 lines
      ignoreWhitespace: true,
      ignoreComments: true,
      ignoreVariableNames: false,
      ...config
    };

    this.similarityAnalyzer = new SimilarityAnalyzer({
      exactMatchThreshold: this.config.minSimilarity,
      ignoreWhitespace: this.config.ignoreWhitespace,
      ignoreComments: this.config.ignoreComments,
      ignoreVariableNames: this.config.ignoreVariableNames
    });
  }

  getDetectorType(): 'exact' | 'functional' | 'pattern' | 'configuration' {
    return 'exact';
  }

  async detectDuplications(files: ParsedFile[]): Promise<DuplicationInstance[]> {
    const duplications: DuplicationInstance[] = [];
    const allCodeBlocks: CodeBlock[] = [];

    // Extract code blocks from all files
    for (const file of files) {
      const blocks = this.similarityAnalyzer.extractCodeBlocks(file);
      allCodeBlocks.push(...blocks.filter(block => this.isValidBlock(block)));
    }

    // Compare all blocks pairwise
    for (let i = 0; i < allCodeBlocks.length; i++) {
      for (let j = i + 1; j < allCodeBlocks.length; j++) {
        const block1 = allCodeBlocks[i];
        const block2 = allCodeBlocks[j];

        // Skip if same file and overlapping lines
        if (block1.filePath === block2.filePath && this.blocksOverlap(block1, block2)) {
          continue;
        }

        const result = this.similarityAnalyzer.compare(block1, block2, SimilarityAlgorithm.EXACT);
        
        if (result.similarity >= this.config.minSimilarity) {
          const duplication = this.createDuplicationInstance(block1, block2, result.similarity);
          duplications.push(duplication);
        }
      }
    }

    // Group similar duplications together
    return this.groupDuplications(duplications);
  }

  private isValidBlock(block: CodeBlock): boolean {
    const lineCount = block.endLine - block.startLine + 1;
    return lineCount >= this.config.minCodeBlockSize && 
           block.content.trim().length > 0 &&
           !this.isTriviallySimilar(block.content);
  }

  private isTriviallySimilar(content: string): boolean {
    // Skip blocks that are just imports, exports, or simple declarations
    const trimmed = content.trim();
    
    // Skip import/export statements
    if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) {
      return true;
    }

    // Skip simple variable declarations
    if (/^(const|let|var)\s+\w+\s*=\s*[^;]+;?\s*$/.test(trimmed)) {
      return true;
    }

    // Skip simple interface/type declarations
    if (/^(interface|type)\s+\w+\s*\{[^}]*\}\s*$/.test(trimmed.replace(/\s+/g, ' '))) {
      return true;
    }

    return false;
  }

  private blocksOverlap(block1: CodeBlock, block2: CodeBlock): boolean {
    return !(block1.endLine < block2.startLine || block2.endLine < block1.startLine);
  }

  private createDuplicationInstance(
    block1: CodeBlock, 
    block2: CodeBlock, 
    similarity: number
  ): DuplicationInstance {
    const locations: CodeLocation[] = [
      {
        filePath: block1.filePath,
        startLine: block1.startLine,
        endLine: block1.endLine,
        codeBlock: block1.content,
        context: this.extractContext(block1)
      },
      {
        filePath: block2.filePath,
        startLine: block2.startLine,
        endLine: block2.endLine,
        codeBlock: block2.content,
        context: this.extractContext(block2)
      }
    ];

    const impact = this.calculateImpact(locations);
    const description = this.generateDescription(block1, block2, similarity);

    return {
      id: uuidv4(),
      type: 'exact',
      similarity,
      locations,
      description,
      impact
    };
  }

  private extractContext(block: CodeBlock): string {
    if (block.type === 'function' || block.type === 'method') {
      return `${block.type}: ${block.metadata?.name || 'anonymous'}`;
    }
    if (block.type === 'class') {
      return `class: ${block.metadata?.name || 'anonymous'}`;
    }
    if (block.type === 'interface') {
      return `interface: ${block.metadata?.name || 'anonymous'}`;
    }
    return `${block.type} block`;
  }

  private calculateImpact(locations: CodeLocation[]): ImpactMetrics {
    const totalLines = locations.reduce((sum, loc) => sum + (loc.endLine - loc.startLine + 1), 0);
    
    // Simple complexity estimation based on code patterns
    const complexity = locations.reduce((sum, loc) => {
      const content = loc.codeBlock;
      let complexityScore = 1;
      
      // Add complexity for control structures
      complexityScore += (content.match(/\b(if|for|while|switch|try|catch)\b/g) || []).length;
      // Add complexity for function calls
      complexityScore += (content.match(/\w+\(/g) || []).length * 0.1;
      
      return sum + complexityScore;
    }, 0);

    return {
      linesOfCode: totalLines,
      complexity: Math.round(complexity),
      maintainabilityIndex: Math.max(0, 100 - complexity * 2), // Simple maintainability calculation
      testCoverage: 0 // Would need integration with test coverage tools
    };
  }

  private generateDescription(block1: CodeBlock, block2: CodeBlock, similarity: number): string {
    const similarityPercent = Math.round(similarity * 100);
    const context1 = this.extractContext(block1);
    const context2 = this.extractContext(block2);
    
    return `Exact match (${similarityPercent}% similar) between ${context1} in ${block1.filePath} and ${context2} in ${block2.filePath}`;
  }

  private groupDuplications(duplications: DuplicationInstance[]): DuplicationInstance[] {
    // For exact matches, we typically don't need complex grouping
    // since each pair represents a distinct duplication
    // However, we could group by similarity level or file patterns if needed
    
    return duplications.sort((a, b) => b.similarity - a.similarity);
  }
}