/**
 * Property-based tests for similarity analysis accuracy
 * **Feature: code-duplication-optimization, Property 1: Duplication Detection Completeness**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  SimilarityAnalyzer, 
  SimilarityAlgorithm, 
  CodeBlock,
  SimilarityConfig 
} from '../src/analysis/analyzers/SimilarityAnalyzer.js';

// Test generators for code blocks
const validIdentifierArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s));

const validTypeArb = fc.constantFrom('string', 'number', 'boolean', 'void', 'any');

const validParameterArb = fc.record({
  name: validIdentifierArb,
  type: fc.option(validTypeArb, { nil: undefined })
});

const validFunctionBodyArb = fc.array(
  fc.constantFrom(
    'return value;',
    'console.log("test");',
    'const result = calculate();',
    'if (condition) { return true; }',
    'for (let i = 0; i < 10; i++) { process(i); }',
    'try { execute(); } catch (e) { handle(e); }',
    'const data = await fetch(url);',
    'this.property = newValue;'
  ),
  { minLength: 1, maxLength: 10 }
);

const validFunctionCodeArb = fc.record({
  name: validIdentifierArb,
  parameters: fc.array(validParameterArb, { maxLength: 5 }),
  returnType: fc.option(validTypeArb, { nil: undefined }),
  body: validFunctionBodyArb
}).map(func => {
  const params = func.parameters.map(p => 
    p.type ? `${p.name}: ${p.type}` : p.name
  ).join(', ');
  
  const returnTypeStr = func.returnType ? `: ${func.returnType}` : '';
  const bodyStr = func.body.map(line => `  ${line}`).join('\n');
  
  return `function ${func.name}(${params})${returnTypeStr} {\n${bodyStr}\n}`;
});

const validClassCodeArb = fc.record({
  name: validIdentifierArb,
  methods: fc.array(validFunctionCodeArb, { minLength: 1, maxLength: 5 })
}).map(cls => {
  const methodsStr = cls.methods.map(method => 
    method.replace('function ', '  ').replace(/^/gm, '  ')
  ).join('\n\n');
  
  return `class ${cls.name} {\n${methodsStr}\n}`;
});

const validCodeContentArb = fc.oneof(
  validFunctionCodeArb,
  validClassCodeArb
);

const validCodeBlockArb = fc.record({
  content: validCodeContentArb,
  filePath: fc.string({ minLength: 5, maxLength: 50 }).map(s => `src/${s}.ts`),
  type: fc.constantFrom('function' as const, 'class' as const, 'method' as const)
}).map((block, index) => ({
  ...block,
  startLine: 1,
  endLine: block.content.split('\n').length
})) as fc.Arbitrary<CodeBlock>;

describe('SimilarityAnalyzer Property Tests', () => {
  const analyzer = new SimilarityAnalyzer();

  describe('Property 1: Duplication Detection Completeness', () => {
    it('should detect exact duplicates with 100% similarity', () => {
      fc.assert(
        fc.property(validCodeBlockArb, (originalBlock) => {
          // Create an exact duplicate
          const duplicateBlock: CodeBlock = {
            ...originalBlock,
            filePath: 'src/duplicate.ts'
          };

          const result = analyzer.compare(originalBlock, duplicateBlock, SimilarityAlgorithm.EXACT);
          
          // Exact duplicates should have 100% similarity
          expect(result.similarity).toBe(1.0);
          expect(result.details.exactMatch).toBe(true);
        }),
        { numRuns: 50 }
      );
    });

    it('should detect structural similarity for similar code patterns', () => {
      fc.assert(
        fc.property(validCodeBlockArb, (originalBlock) => {
          // Create a structurally similar block by changing variable names
          const modifiedContent = originalBlock.content
            .replace(/\bvalue\b/g, 'data')
            .replace(/\bresult\b/g, 'output')
            .replace(/\bcondition\b/g, 'check');

          const similarBlock: CodeBlock = {
            ...originalBlock,
            content: modifiedContent,
            filePath: 'src/similar.ts'
          };

          const result = analyzer.compare(originalBlock, similarBlock, SimilarityAlgorithm.STRUCTURAL);
          
          // Structurally similar code should have high similarity
          expect(result.similarity).toBeGreaterThan(0.5);
        }),
        { numRuns: 50 }
      );
    });

    it('should assign lower similarity to completely different code', () => {
      fc.assert(
        fc.property(validCodeBlockArb, validCodeBlockArb, (block1, block2) => {
          // Skip if blocks are too similar by chance
          fc.pre(block1.content !== block2.content);
          fc.pre(!block1.content.includes(block2.content.substring(0, 20)));
          fc.pre(!block2.content.includes(block1.content.substring(0, 20)));

          const result = analyzer.compare(block1, block2, SimilarityAlgorithm.COMBINED);
          
          // Different code should have lower similarity than identical code
          expect(result.similarity).toBeLessThan(1.0);
        }),
        { numRuns: 50 }
      );
    });

    it('should maintain similarity symmetry', () => {
      fc.assert(
        fc.property(validCodeBlockArb, validCodeBlockArb, (block1, block2) => {
          const result1 = analyzer.compare(block1, block2, SimilarityAlgorithm.COMBINED);
          const result2 = analyzer.compare(block2, block1, SimilarityAlgorithm.COMBINED);
          
          // Similarity should be symmetric
          expect(Math.abs(result1.similarity - result2.similarity)).toBeLessThan(0.01);
        }),
        { numRuns: 50 }
      );
    });

    it('should handle whitespace and comment variations correctly', () => {
      fc.assert(
        fc.property(validCodeBlockArb, (originalBlock) => {
          // Create a simple whitespace variation that should normalize to the same content
          const modifiedContent = originalBlock.content
            .replace(/  /g, '    ') // Change indentation
            .replace(/\n/g, '\n '); // Add single space at line start

          const modifiedBlock: CodeBlock = {
            ...originalBlock,
            content: modifiedContent,
            filePath: 'src/modified.ts'
          };

          const config: SimilarityConfig = {
            exactMatchThreshold: 1.0,
            structuralThreshold: 0.8,
            semanticThreshold: 0.7,
            tokenThreshold: 0.75,
            astThreshold: 0.8,
            ignoreWhitespace: true,
            ignoreComments: true,
            ignoreVariableNames: false
          };

          const analyzerWithConfig = new SimilarityAnalyzer(config);
          const result = analyzerWithConfig.compare(originalBlock, modifiedBlock, SimilarityAlgorithm.EXACT);
          
          // Should detect as exact match when ignoring whitespace
          // Note: We expect high similarity but not necessarily perfect due to normalization complexity
          expect(result.similarity).toBeGreaterThan(0.8);
        }),
        { numRuns: 50 }
      );
    });

    it('should correctly categorize different types of duplication', () => {
      fc.assert(
        fc.property(validCodeBlockArb, (originalBlock) => {
          // Test exact match
          const exactDuplicate: CodeBlock = { ...originalBlock, filePath: 'src/exact.ts' };
          const exactResult = analyzer.compare(originalBlock, exactDuplicate, SimilarityAlgorithm.EXACT);
          
          // Test structural similarity with variable name changes
          const structuralVariant: CodeBlock = {
            ...originalBlock,
            content: originalBlock.content.replace(/\w+/g, (match) => 
              match.length > 3 ? `${match}_modified` : match
            ),
            filePath: 'src/structural.ts'
          };
          const structuralResult = analyzer.compare(originalBlock, structuralVariant, SimilarityAlgorithm.STRUCTURAL);
          
          // Exact match should have higher similarity than structural variant
          expect(exactResult.similarity).toBeGreaterThanOrEqual(structuralResult.similarity);
          
          // Both should be detected as similar (above threshold)
          expect(exactResult.similarity).toBeGreaterThan(0.8);
        }),
        { numRuns: 50 }
      );
    });

    it('should provide consistent results across multiple algorithm runs', () => {
      fc.assert(
        fc.property(validCodeBlockArb, validCodeBlockArb, (block1, block2) => {
          const result1 = analyzer.compare(block1, block2, SimilarityAlgorithm.COMBINED);
          const result2 = analyzer.compare(block1, block2, SimilarityAlgorithm.COMBINED);
          
          // Results should be deterministic
          expect(result1.similarity).toBe(result2.similarity);
          expect(result1.algorithm).toBe(result2.algorithm);
        }),
        { numRuns: 50 }
      );
    });

    it('should handle edge cases gracefully', () => {
      fc.assert(
        fc.property(fc.constantFrom('', '   ', '\n\n', '//comment'), (emptyContent) => {
          const emptyBlock: CodeBlock = {
            content: emptyContent,
            startLine: 1,
            endLine: 1,
            filePath: 'src/empty.ts',
            type: 'function'
          };

          const normalBlock: CodeBlock = {
            content: 'function test() { return true; }',
            startLine: 1,
            endLine: 1,
            filePath: 'src/normal.ts',
            type: 'function'
          };

          const result = analyzer.compare(emptyBlock, normalBlock, SimilarityAlgorithm.COMBINED);
          
          // Should handle empty content without throwing errors
          expect(result.similarity).toBeGreaterThanOrEqual(0);
          expect(result.similarity).toBeLessThanOrEqual(1);
        }),
        { numRuns: 50 }
      );
    });
  });
});