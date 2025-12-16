/**
 * SimilarityAnalyzer - Analyzes similarity between code blocks using multiple algorithms
 */

import * as ts from 'typescript';
import { ParsedFile } from '../parsers/CodeParser.js';

export interface SimilarityResult {
  similarity: number;
  algorithm: SimilarityAlgorithm;
  details: SimilarityDetails;
}

export interface SimilarityDetails {
  exactMatch?: boolean;
  structuralSimilarity?: number;
  semanticSimilarity?: number;
  tokenSimilarity?: number;
  astSimilarity?: number;
}

export enum SimilarityAlgorithm {
  EXACT = 'exact',
  STRUCTURAL = 'structural', 
  SEMANTIC = 'semantic',
  TOKEN_BASED = 'token_based',
  AST_BASED = 'ast_based',
  COMBINED = 'combined'
}

export interface SimilarityConfig {
  exactMatchThreshold: number;
  structuralThreshold: number;
  semanticThreshold: number;
  tokenThreshold: number;
  astThreshold: number;
  ignoreWhitespace: boolean;
  ignoreComments: boolean;
  ignoreVariableNames: boolean;
}

export interface CodeBlock {
  content: string;
  startLine: number;
  endLine: number;
  filePath: string;
  type: 'function' | 'method' | 'class' | 'interface' | 'block';
  metadata?: any;
}

export class SimilarityAnalyzer {
  private config: SimilarityConfig;

  constructor(config?: Partial<SimilarityConfig>) {
    this.config = {
      exactMatchThreshold: 1.0,
      structuralThreshold: 0.8,
      semanticThreshold: 0.7,
      tokenThreshold: 0.75,
      astThreshold: 0.8,
      ignoreWhitespace: true,
      ignoreComments: true,
      ignoreVariableNames: false,
      ...config
    };
  }

  /**
   * Calculate similarity between two strings using a simple text-based approach
   * This method is used by detectors that need to compare simple string patterns
   */
  calculateSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) {
      return 0;
    }

    // Normalize whitespace if configured
    let content1 = text1;
    let content2 = text2;

    if (this.config.ignoreWhitespace) {
      content1 = this.normalizeWhitespace(content1);
      content2 = this.normalizeWhitespace(content2);
    }

    if (this.config.ignoreComments) {
      content1 = this.removeComments(content1);
      content2 = this.removeComments(content2);
    }

    // Exact match check
    if (content1 === content2) {
      return 1.0;
    }

    // Token-based similarity for non-exact matches
    const tokens1 = this.tokenize(content1);
    const tokens2 = this.tokenize(content2);
    
    return this.calculateJaccardSimilarity(tokens1, tokens2);
  }

  /**
   * Compare two code blocks using the specified algorithm
   */
  compare(block1: CodeBlock, block2: CodeBlock, algorithm: SimilarityAlgorithm = SimilarityAlgorithm.COMBINED): SimilarityResult {
    switch (algorithm) {
      case SimilarityAlgorithm.EXACT:
        return this.exactMatch(block1, block2);
      case SimilarityAlgorithm.STRUCTURAL:
        return this.structuralSimilarity(block1, block2);
      case SimilarityAlgorithm.SEMANTIC:
        return this.semanticSimilarity(block1, block2);
      case SimilarityAlgorithm.TOKEN_BASED:
        return this.tokenBasedSimilarity(block1, block2);
      case SimilarityAlgorithm.AST_BASED:
        return this.astBasedSimilarity(block1, block2);
      case SimilarityAlgorithm.COMBINED:
        return this.combinedSimilarity(block1, block2);
      default:
        throw new Error(`Unknown similarity algorithm: ${algorithm}`);
    }
  }

  /**
   * Extract code blocks from parsed files
   */
  extractCodeBlocks(parsedFile: ParsedFile): CodeBlock[] {
    const blocks: CodeBlock[] = [];
    const { metadata, content, filePath } = parsedFile;

    // Extract function blocks
    metadata.functions.forEach(func => {
      blocks.push({
        content: this.extractContentByLines(content, func.startLine, func.endLine),
        startLine: func.startLine,
        endLine: func.endLine,
        filePath,
        type: 'function',
        metadata: func
      });
    });

    // Extract class blocks
    metadata.classes.forEach(cls => {
      blocks.push({
        content: this.extractContentByLines(content, cls.startLine, cls.endLine),
        startLine: cls.startLine,
        endLine: cls.endLine,
        filePath,
        type: 'class',
        metadata: cls
      });

      // Extract method blocks
      cls.methods.forEach(method => {
        blocks.push({
          content: this.extractContentByLines(content, method.startLine, method.endLine),
          startLine: method.startLine,
          endLine: method.endLine,
          filePath,
          type: 'method',
          metadata: method
        });
      });
    });

    // Extract interface blocks
    metadata.interfaces.forEach(iface => {
      blocks.push({
        content: this.extractContentByLines(content, iface.startLine, iface.endLine),
        startLine: iface.startLine,
        endLine: iface.endLine,
        filePath,
        type: 'interface',
        metadata: iface
      });
    });

    return blocks;
  }

  /**
   * Exact match comparison
   */
  private exactMatch(block1: CodeBlock, block2: CodeBlock): SimilarityResult {
    let content1 = block1.content;
    let content2 = block2.content;

    if (this.config.ignoreWhitespace) {
      content1 = this.normalizeWhitespace(content1);
      content2 = this.normalizeWhitespace(content2);
    }

    if (this.config.ignoreComments) {
      content1 = this.removeComments(content1);
      content2 = this.removeComments(content2);
    }

    const isExact = content1 === content2;
    
    return {
      similarity: isExact ? 1.0 : 0.0,
      algorithm: SimilarityAlgorithm.EXACT,
      details: {
        exactMatch: isExact
      }
    };
  }

  /**
   * Structural similarity based on code structure patterns
   */
  private structuralSimilarity(block1: CodeBlock, block2: CodeBlock): SimilarityResult {
    const structure1 = this.extractStructure(block1.content);
    const structure2 = this.extractStructure(block2.content);
    
    const similarity = this.calculateJaccardSimilarity(structure1, structure2);
    
    return {
      similarity,
      algorithm: SimilarityAlgorithm.STRUCTURAL,
      details: {
        structuralSimilarity: similarity
      }
    };
  }

  /**
   * Semantic similarity based on function signatures and behavior patterns
   */
  private semanticSimilarity(block1: CodeBlock, block2: CodeBlock): SimilarityResult {
    // For functions and methods, compare signatures and patterns
    if ((block1.type === 'function' || block1.type === 'method') && 
        (block2.type === 'function' || block2.type === 'method')) {
      
      const sig1 = this.extractFunctionSignature(block1);
      const sig2 = this.extractFunctionSignature(block2);
      
      const signatureSimilarity = this.compareSignatures(sig1, sig2);
      const patternSimilarity = this.comparePatterns(block1.content, block2.content);
      
      const similarity = (signatureSimilarity + patternSimilarity) / 2;
      
      return {
        similarity,
        algorithm: SimilarityAlgorithm.SEMANTIC,
        details: {
          semanticSimilarity: similarity
        }
      };
    }

    // For other types, fall back to pattern comparison
    const similarity = this.comparePatterns(block1.content, block2.content);
    
    return {
      similarity,
      algorithm: SimilarityAlgorithm.SEMANTIC,
      details: {
        semanticSimilarity: similarity
      }
    };
  }

  /**
   * Token-based similarity using tokenization
   */
  private tokenBasedSimilarity(block1: CodeBlock, block2: CodeBlock): SimilarityResult {
    const tokens1 = this.tokenize(block1.content);
    const tokens2 = this.tokenize(block2.content);
    
    const similarity = this.calculateJaccardSimilarity(tokens1, tokens2);
    
    return {
      similarity,
      algorithm: SimilarityAlgorithm.TOKEN_BASED,
      details: {
        tokenSimilarity: similarity
      }
    };
  }

  /**
   * AST-based similarity using TypeScript compiler API
   */
  private astBasedSimilarity(block1: CodeBlock, block2: CodeBlock): SimilarityResult {
    try {
      const ast1 = this.parseToAST(block1.content);
      const ast2 = this.parseToAST(block2.content);
      
      const similarity = this.compareASTs(ast1, ast2);
      
      return {
        similarity,
        algorithm: SimilarityAlgorithm.AST_BASED,
        details: {
          astSimilarity: similarity
        }
      };
    } catch (error) {
      // If AST parsing fails, fall back to token-based similarity
      return this.tokenBasedSimilarity(block1, block2);
    }
  }

  /**
   * Combined similarity using multiple algorithms
   */
  private combinedSimilarity(block1: CodeBlock, block2: CodeBlock): SimilarityResult {
    const exact = this.exactMatch(block1, block2);
    if (exact.similarity === 1.0) {
      return exact;
    }

    const structural = this.structuralSimilarity(block1, block2);
    const semantic = this.semanticSimilarity(block1, block2);
    const token = this.tokenBasedSimilarity(block1, block2);
    const ast = this.astBasedSimilarity(block1, block2);

    // Weighted average of different similarity measures
    const weights = {
      structural: 0.3,
      semantic: 0.3,
      token: 0.2,
      ast: 0.2
    };

    const combinedScore = 
      structural.similarity * weights.structural +
      semantic.similarity * weights.semantic +
      token.similarity * weights.token +
      ast.similarity * weights.ast;

    return {
      similarity: combinedScore,
      algorithm: SimilarityAlgorithm.COMBINED,
      details: {
        exactMatch: exact.details.exactMatch,
        structuralSimilarity: structural.similarity,
        semanticSimilarity: semantic.similarity,
        tokenSimilarity: token.similarity,
        astSimilarity: ast.similarity
      }
    };
  }

  // Helper methods

  private extractContentByLines(content: string, startLine: number, endLine: number): string {
    const lines = content.split('\n');
    return lines.slice(startLine - 1, endLine).join('\n');
  }

  private normalizeWhitespace(content: string): string {
    return content.replace(/\s+/g, ' ').trim();
  }

  private removeComments(content: string): string {
    // Remove single-line comments
    content = content.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    return content;
  }

  private extractStructure(content: string): string[] {
    const patterns: string[] = [];
    
    // Extract structural patterns
    const structuralRegexes = [
      /\bif\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bswitch\s*\(/g,
      /\btry\s*\{/g,
      /\bcatch\s*\(/g,
      /\bfunction\s+\w+/g,
      /\bclass\s+\w+/g,
      /\binterface\s+\w+/g,
      /\breturn\b/g,
      /\bthrow\b/g
    ];

    structuralRegexes.forEach(regex => {
      const matches = content.match(regex);
      if (matches) {
        patterns.push(...matches);
      }
    });

    return patterns;
  }

  private tokenize(content: string): string[] {
    // Simple tokenization - could be enhanced with proper lexical analysis
    return content
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0)
      .map(token => token.toLowerCase());
  }

  private calculateJaccardSimilarity(set1: string[], set2: string[]): number {
    const s1 = new Set(set1);
    const s2 = new Set(set2);
    
    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private extractFunctionSignature(block: CodeBlock): any {
    if (block.metadata && (block.type === 'function' || block.type === 'method')) {
      return {
        name: block.metadata.name,
        parameters: block.metadata.parameters || [],
        returnType: block.metadata.returnType
      };
    }
    return null;
  }

  private compareSignatures(sig1: any, sig2: any): number {
    if (!sig1 || !sig2) return 0;
    
    let score = 0;
    let factors = 0;

    // Compare parameter count
    if (sig1.parameters && sig2.parameters) {
      const paramCountSimilarity = 1 - Math.abs(sig1.parameters.length - sig2.parameters.length) / 
        Math.max(sig1.parameters.length, sig2.parameters.length, 1);
      score += paramCountSimilarity;
      factors++;
    }

    // Compare return types
    if (sig1.returnType && sig2.returnType) {
      score += sig1.returnType === sig2.returnType ? 1 : 0;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  private comparePatterns(content1: string, content2: string): number {
    const patterns1 = this.extractBehaviorPatterns(content1);
    const patterns2 = this.extractBehaviorPatterns(content2);
    
    return this.calculateJaccardSimilarity(patterns1, patterns2);
  }

  private extractBehaviorPatterns(content: string): string[] {
    const patterns: string[] = [];
    
    // Extract common programming patterns
    const patternRegexes = [
      /\w+\s*=\s*new\s+\w+/g,  // Object creation
      /\w+\.\w+\(/g,            // Method calls
      /\w+\[\w+\]/g,            // Array/object access
      /if\s*\([^)]+\)/g,        // Conditional patterns
      /for\s*\([^)]+\)/g,       // Loop patterns
      /return\s+[^;]+/g,        // Return patterns
      /throw\s+[^;]+/g          // Error patterns
    ];

    patternRegexes.forEach(regex => {
      const matches = content.match(regex);
      if (matches) {
        patterns.push(...matches.map(m => m.replace(/\w+/g, 'VAR')));
      }
    });

    return patterns;
  }

  private parseToAST(content: string): ts.Node {
    return ts.createSourceFile(
      'temp.ts',
      content,
      ts.ScriptTarget.ES2020,
      true
    );
  }

  private compareASTs(ast1: ts.Node, ast2: ts.Node): number {
    // Simplified AST comparison - could be enhanced with more sophisticated tree comparison
    const structure1 = this.getASTStructure(ast1);
    const structure2 = this.getASTStructure(ast2);
    
    return this.calculateJaccardSimilarity(structure1, structure2);
  }

  private getASTStructure(node: ts.Node): string[] {
    const structure: string[] = [];
    
    const visit = (n: ts.Node) => {
      structure.push(ts.SyntaxKind[n.kind]);
      ts.forEachChild(n, visit);
    };
    
    visit(node);
    return structure;
  }
}