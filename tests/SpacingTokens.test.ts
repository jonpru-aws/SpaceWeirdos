/**
 * Spacing Token Definition Tests
 * 
 * Verifies that all spacing tokens are properly defined with valid values,
 * follow a consistent pattern, and use rem units.
 * 
 * Requirements: 2.1, 2.2
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Spacing Token Definitions', () => {
  let spacingTokens: string;

  // Helper to extract CSS custom properties from the file
  const extractTokens = (content: string): Map<string, string> => {
    const tokens = new Map<string, string>();
    const regex = /--([a-z0-9-]+):\s*([^;]+);/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      tokens.set(`--${match[1]}`, match[2].trim());
    }
    
    return tokens;
  };

  // Helper to check if value is in rem units
  const isRemValue = (value: string): boolean => {
    return /^[\d.]+rem$/.test(value) || value === '0';
  };

  // Helper to check if value is a CSS variable reference
  const isCssVariable = (value: string): boolean => {
    return /^var\(--[a-z0-9-]+\)$/i.test(value);
  };

  // Helper to parse rem value to number
  const parseRemValue = (value: string): number => {
    if (value === '0') return 0;
    return parseFloat(value.replace('rem', ''));
  };

  beforeAll(async () => {
    const spacingTokensPath = resolve(process.cwd(), 'src/frontend/styles/tokens/spacing.css');
    spacingTokens = await readFile(spacingTokensPath, 'utf-8');
  });

  describe('Spacing Scale Tokens', () => {
    it('should define all spacing scale tokens', () => {
      const tokens = extractTokens(spacingTokens);
      
      const spacingScales = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16];
      spacingScales.forEach(scale => {
        const tokenName = `--spacing-${scale}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have all spacing values in rem units or 0', () => {
      const tokens = extractTokens(spacingTokens);
      
      const spacingScales = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16];
      spacingScales.forEach(scale => {
        const tokenName = `--spacing-${scale}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isRemValue(value!), `${tokenName} should be in rem units or 0, got: ${value}`).toBe(true);
      });
    });

    it('should follow consistent multiplier-based scale', () => {
      const tokens = extractTokens(spacingTokens);
      // Base unit is 0.25rem = 4px
      
      // Test that spacing values follow the expected pattern
      const expectedValues: Record<number, number> = {
        0: 0,
        1: 0.25,
        2: 0.5,
        3: 0.75,
        4: 1,
        5: 1.25,
        6: 1.5,
        7: 1.75,
        8: 2,
        9: 2.25,
        10: 2.5,
        11: 2.75,
        12: 3,
        14: 3.5,
        16: 4
      };
      
      Object.entries(expectedValues).forEach(([scale, expectedRem]) => {
        const tokenName = `--spacing-${scale}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        
        const actualRem = parseRemValue(value!);
        expect(actualRem).toBe(expectedRem);
      });
    });

    it('should use 0.25rem as base unit', () => {
      const tokens = extractTokens(spacingTokens);
      const spacing1 = tokens.get('--spacing-1');
      
      expect(spacing1).toBe('0.25rem');
    });
  });

  describe('Semantic Spacing Tokens', () => {
    it('should define all semantic spacing tokens', () => {
      const tokens = extractTokens(spacingTokens);
      
      const semanticSpacing = ['xs', 'sm', 'md', 'lg', 'xl'];
      semanticSpacing.forEach(size => {
        const tokenName = `--spacing-${size}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have semantic spacing tokens reference scale tokens', () => {
      const tokens = extractTokens(spacingTokens);
      
      const semanticSpacing = ['xs', 'sm', 'md', 'lg', 'xl'];
      semanticSpacing.forEach(size => {
        const tokenName = `--spacing-${size}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isCssVariable(value!), `${tokenName} should reference a CSS variable`).toBe(true);
      });
    });

    it('should map semantic tokens to correct scale values', () => {
      const tokens = extractTokens(spacingTokens);
      
      const expectedMappings: Record<string, string> = {
        'xs': 'var(--spacing-1)',
        'sm': 'var(--spacing-2)',
        'md': 'var(--spacing-4)',
        'lg': 'var(--spacing-6)',
        'xl': 'var(--spacing-8)'
      };
      
      Object.entries(expectedMappings).forEach(([size, expectedValue]) => {
        const tokenName = `--spacing-${size}`;
        const value = tokens.get(tokenName);
        expect(value).toBe(expectedValue);
      });
    });
  });

  describe('Gap Tokens', () => {
    it('should define all gap tokens', () => {
      const tokens = extractTokens(spacingTokens);
      
      const gapSizes = ['xs', 'sm', 'md', 'lg', 'xl'];
      gapSizes.forEach(size => {
        const tokenName = `--gap-${size}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have gap tokens reference spacing tokens', () => {
      const tokens = extractTokens(spacingTokens);
      
      const gapSizes = ['xs', 'sm', 'md', 'lg', 'xl'];
      gapSizes.forEach(size => {
        const tokenName = `--gap-${size}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isCssVariable(value!), `${tokenName} should reference a CSS variable`).toBe(true);
      });
    });

    it('should map gap tokens to correct spacing values', () => {
      const tokens = extractTokens(spacingTokens);
      
      const expectedMappings: Record<string, string> = {
        'xs': 'var(--spacing-1)',
        'sm': 'var(--spacing-2)',
        'md': 'var(--spacing-4)',
        'lg': 'var(--spacing-6)',
        'xl': 'var(--spacing-8)'
      };
      
      Object.entries(expectedMappings).forEach(([size, expectedValue]) => {
        const tokenName = `--gap-${size}`;
        const value = tokens.get(tokenName);
        expect(value).toBe(expectedValue);
      });
    });
  });

  describe('Spacing Scale Consistency', () => {
    it('should have spacing values increase monotonically', () => {
      const tokens = extractTokens(spacingTokens);
      
      const spacingScales = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16];
      const values = spacingScales.map(scale => {
        const tokenName = `--spacing-${scale}`;
        const value = tokens.get(tokenName);
        return parseRemValue(value!);
      });
      
      // Check that each value is greater than or equal to the previous
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
      }
    });

    it('should have consistent increments in lower scale (1-8)', () => {
      const tokens = extractTokens(spacingTokens);
      const baseUnit = 0.25;
      
      // Spacing 1-8 should increment by 0.25rem each step
      for (let scale = 1; scale <= 8; scale++) {
        const tokenName = `--spacing-${scale}`;
        const value = tokens.get(tokenName);
        const actualRem = parseRemValue(value!);
        const expectedRem = scale * baseUnit;
        
        expect(actualRem).toBe(expectedRem);
      }
    });
  });

  describe('Token Value Format', () => {
    it('should have all direct spacing values in rem units or 0', () => {
      const tokens = extractTokens(spacingTokens);
      
      tokens.forEach((value, name) => {
        // Skip CSS variable references
        if (isCssVariable(value)) {
          return;
        }
        
        // Only check spacing scale tokens (not semantic or gap tokens)
        if (name.match(/^--spacing-\d+$/)) {
          expect(isRemValue(value), `${name} should be in rem units or 0, got: ${value}`).toBe(true);
        }
      });
    });

    it('should not use px units', () => {
      const tokens = extractTokens(spacingTokens);
      
      tokens.forEach((value) => {
        expect(value).not.toContain('px');
      });
    });
  });
});
