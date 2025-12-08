/**
 * Typography Token Definition Tests
 * 
 * Verifies that all typography tokens are properly defined with valid values,
 * font sizes are in rem units, and font weights are valid values.
 * 
 * Requirements: 3.1-3.5
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Typography Token Definitions', () => {
  let typographyTokens: string;

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
    return /^[\d.]+rem$/.test(value);
  };

  // Helper to check if value is a valid font weight
  const isValidFontWeight = (value: string): boolean => {
    const numericWeight = parseInt(value, 10);
    return !isNaN(numericWeight) && numericWeight >= 100 && numericWeight <= 900 && numericWeight % 100 === 0;
  };

  // Helper to check if value is a valid line height
  const isValidLineHeight = (value: string): boolean => {
    const numericValue = parseFloat(value);
    return !isNaN(numericValue) && numericValue > 0;
  };

  // Helper to check if value is a valid letter spacing
  const isValidLetterSpacing = (value: string): boolean => {
    return /^-?[\d.]+em$/.test(value) || value === '0';
  };

  beforeAll(async () => {
    const typographyTokensPath = resolve(process.cwd(), 'src/frontend/styles/tokens/typography.css');
    typographyTokens = await readFile(typographyTokensPath, 'utf-8');
  });

  describe('Font Family Tokens', () => {
    it('should define base font family token', () => {
      const tokens = extractTokens(typographyTokens);
      expect(tokens.has('--font-family-base'), '--font-family-base should be defined').toBe(true);
    });

    it('should define monospace font family token', () => {
      const tokens = extractTokens(typographyTokens);
      expect(tokens.has('--font-family-mono'), '--font-family-mono should be defined').toBe(true);
    });

    it('should have non-empty font family values', () => {
      const tokens = extractTokens(typographyTokens);
      
      const fontFamilies = ['base', 'mono'];
      fontFamilies.forEach(family => {
        const tokenName = `--font-family-${family}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(value!.length, `${tokenName} should not be empty`).toBeGreaterThan(0);
      });
    });
  });

  describe('Font Size Tokens', () => {
    it('should define all font size tokens', () => {
      const tokens = extractTokens(typographyTokens);
      
      const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
      fontSizes.forEach(size => {
        const tokenName = `--font-size-${size}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have all font sizes in rem units', () => {
      const tokens = extractTokens(typographyTokens);
      
      const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
      fontSizes.forEach(size => {
        const tokenName = `--font-size-${size}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isRemValue(value!), `${tokenName} should be in rem units, got: ${value}`).toBe(true);
      });
    });

    it('should have font-size-base equal to 1rem', () => {
      const tokens = extractTokens(typographyTokens);
      const baseSize = tokens.get('--font-size-base');
      expect(baseSize).toBe('1rem');
    });

    it('should have font sizes increase monotonically', () => {
      const tokens = extractTokens(typographyTokens);
      
      const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
      const values = fontSizes.map(size => {
        const tokenName = `--font-size-${size}`;
        const value = tokens.get(tokenName);
        return parseFloat(value!.replace('rem', ''));
      });
      
      // Check that each value is greater than the previous
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('Font Weight Tokens', () => {
    it('should define all font weight tokens', () => {
      const tokens = extractTokens(typographyTokens);
      
      const fontWeights = ['normal', 'medium', 'semibold', 'bold'];
      fontWeights.forEach(weight => {
        const tokenName = `--font-weight-${weight}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid font weight values', () => {
      const tokens = extractTokens(typographyTokens);
      
      const fontWeights = ['normal', 'medium', 'semibold', 'bold'];
      fontWeights.forEach(weight => {
        const tokenName = `--font-weight-${weight}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidFontWeight(value!), `${tokenName} should be valid font weight (100-900, multiples of 100), got: ${value}`).toBe(true);
      });
    });

    it('should have font-weight-normal equal to 400', () => {
      const tokens = extractTokens(typographyTokens);
      const normalWeight = tokens.get('--font-weight-normal');
      expect(normalWeight).toBe('400');
    });

    it('should have font-weight-bold equal to 700', () => {
      const tokens = extractTokens(typographyTokens);
      const boldWeight = tokens.get('--font-weight-bold');
      expect(boldWeight).toBe('700');
    });

    it('should have font weights increase monotonically', () => {
      const tokens = extractTokens(typographyTokens);
      
      const fontWeights = ['normal', 'medium', 'semibold', 'bold'];
      const values = fontWeights.map(weight => {
        const tokenName = `--font-weight-${weight}`;
        const value = tokens.get(tokenName);
        return parseInt(value!, 10);
      });
      
      // Check that each value is greater than or equal to the previous
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('Line Height Tokens', () => {
    it('should define all line height tokens', () => {
      const tokens = extractTokens(typographyTokens);
      
      const lineHeights = ['tight', 'normal', 'relaxed'];
      lineHeights.forEach(height => {
        const tokenName = `--line-height-${height}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid line height values', () => {
      const tokens = extractTokens(typographyTokens);
      
      const lineHeights = ['tight', 'normal', 'relaxed'];
      lineHeights.forEach(height => {
        const tokenName = `--line-height-${height}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidLineHeight(value!), `${tokenName} should be valid line height (positive number), got: ${value}`).toBe(true);
      });
    });

    it('should have line-height-normal equal to 1.5', () => {
      const tokens = extractTokens(typographyTokens);
      const normalHeight = tokens.get('--line-height-normal');
      expect(normalHeight).toBe('1.5');
    });

    it('should have line heights increase monotonically', () => {
      const tokens = extractTokens(typographyTokens);
      
      const lineHeights = ['tight', 'normal', 'relaxed'];
      const values = lineHeights.map(height => {
        const tokenName = `--line-height-${height}`;
        const value = tokens.get(tokenName);
        return parseFloat(value!);
      });
      
      // Check that each value is greater than the previous
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('Letter Spacing Tokens', () => {
    it('should define all letter spacing tokens', () => {
      const tokens = extractTokens(typographyTokens);
      
      const letterSpacings = ['tight', 'normal', 'wide'];
      letterSpacings.forEach(spacing => {
        const tokenName = `--letter-spacing-${spacing}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid letter spacing values', () => {
      const tokens = extractTokens(typographyTokens);
      
      const letterSpacings = ['tight', 'normal', 'wide'];
      letterSpacings.forEach(spacing => {
        const tokenName = `--letter-spacing-${spacing}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidLetterSpacing(value!), `${tokenName} should be valid letter spacing (em units or 0), got: ${value}`).toBe(true);
      });
    });

    it('should have letter-spacing-normal equal to 0', () => {
      const tokens = extractTokens(typographyTokens);
      const normalSpacing = tokens.get('--letter-spacing-normal');
      expect(normalSpacing).toBe('0');
    });
  });

  describe('Token Value Format', () => {
    it('should not use px units for font sizes', () => {
      const tokens = extractTokens(typographyTokens);
      
      const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
      fontSizes.forEach(size => {
        const tokenName = `--font-size-${size}`;
        const value = tokens.get(tokenName);
        expect(value).not.toContain('px');
      });
    });

    it('should use numeric values for font weights', () => {
      const tokens = extractTokens(typographyTokens);
      
      const fontWeights = ['normal', 'medium', 'semibold', 'bold'];
      fontWeights.forEach(weight => {
        const tokenName = `--font-weight-${weight}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        
        // Should be a number, not a keyword like "bold" or "normal"
        const numericValue = parseInt(value!, 10);
        expect(isNaN(numericValue)).toBe(false);
      });
    });

    it('should use unitless values for line heights', () => {
      const tokens = extractTokens(typographyTokens);
      
      const lineHeights = ['tight', 'normal', 'relaxed'];
      lineHeights.forEach(height => {
        const tokenName = `--line-height-${height}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        
        // Should not contain units like px, rem, em
        expect(value).not.toContain('px');
        expect(value).not.toContain('rem');
        expect(value).not.toContain('em');
      });
    });
  });
});
