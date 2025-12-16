/**
 * FunctionalDuplicationDetector - Identifies different implementations that achieve the same business logic
 * Uses semantic analysis to detect equivalent functionality
 */

import { IDuplicationDetector } from '../interfaces/AnalysisInterfaces.js';
import { DuplicationInstance, CodeLocation, ImpactMetrics } from '../types/DuplicationModels.js';
import { ParsedFile } from '../parsers/CodeParser.js';
import { SimilarityAnalyzer, CodeBlock, SimilarityAlgorithm } from '../analyzers/SimilarityAnalyzer.js';
import { v4 as uuidv4 } from 'uuid';

export interface FunctionalDuplicationConfig {
  minSemanticSimilarity: number;
  minStructuralSimilarity: number;
  minCodeBlockSize: number;
  analyzeReturnTypes: boolean;
  analyzeParameterPatterns: boolean;
  analyzeBehaviorPatterns: boolean;
}

export interface FunctionSignature {
  name: string;
  parameterCount: number;
  parameterTypes: string[];
  returnType?: string;
  behaviorPatterns: string[];
}

export class FunctionalDuplicationDetector implements IDuplicationDetector {
  private config: FunctionalDuplicationConfig;
  private similarityAnalyzer: SimilarityAnalyzer;

  constructor(config?: Partial<FunctionalDuplicationConfig>) {
    this.config = {
      minSemanticSimilarity: 0.7, // 70% semantic similarity
      minStructuralSimilarity: 0.6, // 60% structural similarity
      minCodeBlockSize: 3, // Minimum 3 lines for functional analysis
      analyzeReturnTypes: true,
      analyzeParameterPatterns: true,
      analyzeBehaviorPatterns: true,
      ...config
    };

    this.similarityAnalyzer = new SimilarityAnalyzer({
      semanticThreshold: this.config.minSemanticSimilarity,
      structuralThreshold: this.config.minStructuralSimilarity
    });
  }

  getDetectorType(): 'exact' | 'functional' | 'pattern' | 'configuration' {
    return 'functional';
  }

  async detectDuplications(files: ParsedFile[]): Promise<DuplicationInstance[]> {
    const duplications: DuplicationInstance[] = [];
    const functionalBlocks: CodeBlock[] = [];

    // Extract function and method blocks from all files
    for (const file of files) {
      const blocks = this.similarityAnalyzer.extractCodeBlocks(file);
      const functional = blocks.filter(block => 
        (block.type === 'function' || block.type === 'method') && 
        this.isValidFunctionalBlock(block)
      );
      functionalBlocks.push(...functional);
    }

    // Compare functional blocks for semantic similarity
    for (let i = 0; i < functionalBlocks.length; i++) {
      for (let j = i + 1; j < functionalBlocks.length; j++) {
        const block1 = functionalBlocks[i];
        const block2 = functionalBlocks[j];

        // Skip if same file and same function (exact duplicates handled elsewhere)
        if (block1.filePath === block2.filePath && 
            block1.metadata?.name === block2.metadata?.name) {
          continue;
        }

        const functionalSimilarity = await this.analyzeFunctionalSimilarity(block1, block2);
        
        if (functionalSimilarity.isFunctionalDuplicate) {
          const duplication = this.createFunctionalDuplication(
            block1, 
            block2, 
            functionalSimilarity
          );
          duplications.push(duplication);
        }
      }
    }

    return this.groupFunctionalDuplications(duplications);
  }

  private isValidFunctionalBlock(block: CodeBlock): boolean {
    const lineCount = block.endLine - block.startLine + 1;
    
    // Must be a reasonable size
    if (lineCount < this.config.minCodeBlockSize) {
      return false;
    }

    // Must have meaningful content (not just getters/setters)
    if (this.isTrivialFunction(block.content)) {
      return false;
    }

    return true;
  }

  private isTrivialFunction(content: string): boolean {
    const trimmed = content.trim();
    
    // Skip simple getters
    if (/^(get\s+\w+\(\)\s*\{\s*return\s+this\.\w+;\s*\}|return\s+this\.\w+;?\s*)$/s.test(trimmed)) {
      return true;
    }

    // Skip simple setters
    if (/^(set\s+\w+\([^)]+\)\s*\{\s*this\.\w+\s*=\s*\w+;\s*\}|this\.\w+\s*=\s*\w+;?\s*)$/s.test(trimmed)) {
      return true;
    }

    // Skip empty or nearly empty functions
    if (trimmed.length < 20) {
      return true;
    }

    return false;
  }

  private async analyzeFunctionalSimilarity(
    block1: CodeBlock, 
    block2: CodeBlock
  ): Promise<FunctionalSimilarityResult> {
    const signature1 = this.extractFunctionSignature(block1);
    const signature2 = this.extractFunctionSignature(block2);

    // Analyze different aspects of functional similarity
    const signatureSimilarity = this.compareSignatures(signature1, signature2);
    const behaviorSimilarity = this.compareBehaviorPatterns(signature1, signature2);
    const structuralResult = this.similarityAnalyzer.compare(block1, block2, SimilarityAlgorithm.STRUCTURAL);
    const semanticResult = this.similarityAnalyzer.compare(block1, block2, SimilarityAlgorithm.SEMANTIC);

    // Calculate overall functional similarity
    const weights = {
      signature: 0.3,
      behavior: 0.4,
      structural: 0.2,
      semantic: 0.1
    };

    const overallSimilarity = 
      signatureSimilarity * weights.signature +
      behaviorSimilarity * weights.behavior +
      structuralResult.similarity * weights.structural +
      semanticResult.similarity * weights.semantic;

    const isFunctionalDuplicate = 
      overallSimilarity >= this.config.minSemanticSimilarity &&
      structuralResult.similarity >= this.config.minStructuralSimilarity;

    return {
      isFunctionalDuplicate,
      overallSimilarity,
      signatureSimilarity,
      behaviorSimilarity,
      structuralSimilarity: structuralResult.similarity,
      semanticSimilarity: semanticResult.similarity,
      details: {
        signature1,
        signature2,
        reasonsForSimilarity: this.generateSimilarityReasons(
          signatureSimilarity,
          behaviorSimilarity,
          structuralResult.similarity,
          semanticResult.similarity
        )
      }
    };
  }

  private extractFunctionSignature(block: CodeBlock): FunctionSignature {
    const metadata = block.metadata;
    const content = block.content;

    const signature: FunctionSignature = {
      name: metadata?.name || 'anonymous',
      parameterCount: metadata?.parameters?.length || 0,
      parameterTypes: metadata?.parameters?.map(p => p.type || 'any') || [],
      returnType: metadata?.returnType,
      behaviorPatterns: this.extractBehaviorPatterns(content)
    };

    return signature;
  }

  private extractBehaviorPatterns(content: string): string[] {
    const patterns: string[] = [];

    // Extract common functional patterns
    const patternMatchers = [
      { pattern: /return\s+[^;]+/g, type: 'return_pattern' },
      { pattern: /if\s*\([^)]+\)\s*\{[^}]*\}/g, type: 'conditional_logic' },
      { pattern: /for\s*\([^)]*\)\s*\{[^}]*\}/g, type: 'iteration_pattern' },
      { pattern: /while\s*\([^)]+\)\s*\{[^}]*\}/g, type: 'loop_pattern' },
      { pattern: /try\s*\{[^}]*\}\s*catch/g, type: 'error_handling' },
      { pattern: /throw\s+[^;]+/g, type: 'error_throwing' },
      { pattern: /\w+\.\w+\(/g, type: 'method_calls' },
      { pattern: /new\s+\w+\(/g, type: 'object_creation' },
      { pattern: /\w+\[\w+\]/g, type: 'array_access' },
      { pattern: /\w+\?\.\w+/g, type: 'optional_chaining' },
      { pattern: /await\s+\w+/g, type: 'async_operations' },
      { pattern: /Promise\./g, type: 'promise_usage' }
    ];

    patternMatchers.forEach(matcher => {
      const matches = content.match(matcher.pattern);
      if (matches && matches.length > 0) {
        patterns.push(`${matcher.type}:${matches.length}`);
      }
    });

    // Extract data transformation patterns
    if (content.includes('.map(') || content.includes('.filter(') || content.includes('.reduce(')) {
      patterns.push('functional_programming');
    }

    if (content.includes('JSON.parse') || content.includes('JSON.stringify')) {
      patterns.push('json_processing');
    }

    if (content.includes('localStorage') || content.includes('sessionStorage')) {
      patterns.push('storage_operations');
    }

    return patterns;
  }

  private compareSignatures(sig1: FunctionSignature, sig2: FunctionSignature): number {
    let score = 0;
    let factors = 0;

    // Compare parameter counts
    if (this.config.analyzeParameterPatterns) {
      const paramCountSimilarity = 1 - Math.abs(sig1.parameterCount - sig2.parameterCount) / 
        Math.max(sig1.parameterCount, sig2.parameterCount, 1);
      score += paramCountSimilarity;
      factors++;

      // Compare parameter types if available
      if (sig1.parameterTypes.length > 0 && sig2.parameterTypes.length > 0) {
        const typeMatches = sig1.parameterTypes.filter(type => 
          sig2.parameterTypes.includes(type)
        ).length;
        const typeSimilarity = typeMatches / Math.max(sig1.parameterTypes.length, sig2.parameterTypes.length);
        score += typeSimilarity;
        factors++;
      }
    }

    // Compare return types
    if (this.config.analyzeReturnTypes && sig1.returnType && sig2.returnType) {
      score += sig1.returnType === sig2.returnType ? 1 : 0;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  private compareBehaviorPatterns(sig1: FunctionSignature, sig2: FunctionSignature): number {
    if (!this.config.analyzeBehaviorPatterns) {
      return 0;
    }

    const patterns1 = new Set(sig1.behaviorPatterns);
    const patterns2 = new Set(sig2.behaviorPatterns);

    const intersection = new Set([...patterns1].filter(x => patterns2.has(x)));
    const union = new Set([...patterns1, ...patterns2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private generateSimilarityReasons(
    signatureSimilarity: number,
    behaviorSimilarity: number,
    structuralSimilarity: number,
    semanticSimilarity: number
  ): string[] {
    const reasons: string[] = [];

    if (signatureSimilarity > 0.7) {
      reasons.push('Similar function signatures');
    }
    if (behaviorSimilarity > 0.6) {
      reasons.push('Similar behavior patterns');
    }
    if (structuralSimilarity > 0.7) {
      reasons.push('Similar code structure');
    }
    if (semanticSimilarity > 0.6) {
      reasons.push('Similar semantic meaning');
    }

    return reasons;
  }

  private createFunctionalDuplication(
    block1: CodeBlock,
    block2: CodeBlock,
    similarity: FunctionalSimilarityResult
  ): DuplicationInstance {
    const locations: CodeLocation[] = [
      {
        filePath: block1.filePath,
        startLine: block1.startLine,
        endLine: block1.endLine,
        codeBlock: block1.content,
        context: `function: ${block1.metadata?.name || 'anonymous'}`
      },
      {
        filePath: block2.filePath,
        startLine: block2.startLine,
        endLine: block2.endLine,
        codeBlock: block2.content,
        context: `function: ${block2.metadata?.name || 'anonymous'}`
      }
    ];

    const impact = this.calculateFunctionalImpact(locations, similarity);
    const description = this.generateFunctionalDescription(block1, block2, similarity);

    return {
      id: uuidv4(),
      type: 'functional',
      similarity: similarity.overallSimilarity,
      locations,
      description,
      impact
    };
  }

  private calculateFunctionalImpact(
    locations: CodeLocation[],
    similarity: FunctionalSimilarityResult
  ): ImpactMetrics {
    const totalLines = locations.reduce((sum, loc) => sum + (loc.endLine - loc.startLine + 1), 0);
    
    // Higher complexity for functional duplicates since they require more analysis
    const baseComplexity = totalLines * 0.5;
    const similarityBonus = similarity.overallSimilarity * 10; // Higher similarity = higher impact
    
    return {
      linesOfCode: totalLines,
      complexity: Math.round(baseComplexity + similarityBonus),
      maintainabilityIndex: Math.max(0, 100 - (baseComplexity + similarityBonus) * 1.5),
      testCoverage: 0
    };
  }

  private generateFunctionalDescription(
    block1: CodeBlock,
    block2: CodeBlock,
    similarity: FunctionalSimilarityResult
  ): string {
    const similarityPercent = Math.round(similarity.overallSimilarity * 100);
    const func1 = block1.metadata?.name || 'anonymous function';
    const func2 = block2.metadata?.name || 'anonymous function';
    
    const reasons = similarity.details.reasonsForSimilarity.join(', ');
    
    return `Functional duplication (${similarityPercent}% similar) between ${func1} in ${block1.filePath} and ${func2} in ${block2.filePath}. Reasons: ${reasons}`;
  }

  private groupFunctionalDuplications(duplications: DuplicationInstance[]): DuplicationInstance[] {
    // Group by similarity level and sort by impact
    return duplications
      .sort((a, b) => {
        // First by similarity, then by impact
        if (Math.abs(a.similarity - b.similarity) > 0.1) {
          return b.similarity - a.similarity;
        }
        return b.impact.complexity - a.impact.complexity;
      });
  }
}

interface FunctionalSimilarityResult {
  isFunctionalDuplicate: boolean;
  overallSimilarity: number;
  signatureSimilarity: number;
  behaviorSimilarity: number;
  structuralSimilarity: number;
  semanticSimilarity: number;
  details: {
    signature1: FunctionSignature;
    signature2: FunctionSignature;
    reasonsForSimilarity: string[];
  };
}