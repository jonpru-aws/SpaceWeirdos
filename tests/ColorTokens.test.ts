/**
 * Color Token Definition Tests
 * 
 * Verifies that all color tokens are properly defined with valid values
 * and semantic naming conventions.
 * 
 * Requirements: 1.1-1.7
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Color Token Definitions', () => {
  let colorTokens: string;

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

  // Helper to validate hex color format
  const isValidHexColor = (value: string): boolean => {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
  };

  // Helper to validate rgb/rgba color format
  const isValidRgbColor = (value: string): boolean => {
    return /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+)?\s*\)$/i.test(value);
  };

  // Helper to check if value is a CSS variable reference
  const isCssVariable = (value: string): boolean => {
    return /^var\(--[a-z0-9-]+\)$/i.test(value);
  };

  beforeAll(async () => {
    const colorTokensPath = resolve(process.cwd(), 'src/frontend/styles/tokens/colors.css');
    colorTokens = await readFile(colorTokensPath, 'utf-8');
  });

  describe('Primary Color Tokens', () => {
    it('should define all primary color shades', () => {
      const tokens = extractTokens(colorTokens);
      
      const primaryShades = [50, 100, 200, 300, 400, 500, 600, 700];
      primaryShades.forEach(shade => {
        const tokenName = `--color-primary-${shade}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid hex values for primary colors', () => {
      const tokens = extractTokens(colorTokens);
      
      const primaryShades = [50, 100, 200, 300, 400, 500, 600, 700];
      primaryShades.forEach(shade => {
        const tokenName = `--color-primary-${shade}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidHexColor(value!), `${tokenName} should be valid hex color`).toBe(true);
      });
    });
  });

  describe('Neutral Color Tokens', () => {
    it('should define all neutral color shades', () => {
      const tokens = extractTokens(colorTokens);
      
      const neutralShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      neutralShades.forEach(shade => {
        const tokenName = `--color-neutral-${shade}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid hex values for neutral colors', () => {
      const tokens = extractTokens(colorTokens);
      
      const neutralShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      neutralShades.forEach(shade => {
        const tokenName = `--color-neutral-${shade}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidHexColor(value!), `${tokenName} should be valid hex color`).toBe(true);
      });
    });
  });

  describe('Semantic Color Tokens', () => {
    it('should define all semantic color tokens', () => {
      const tokens = extractTokens(colorTokens);
      
      const semanticColors = [
        'success', 'success-light',
        'warning', 'warning-light',
        'error', 'error-light',
        'info', 'info-light'
      ];
      
      semanticColors.forEach(color => {
        const tokenName = `--color-${color}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid color values for semantic colors', () => {
      const tokens = extractTokens(colorTokens);
      
      const semanticColors = [
        'success', 'success-light',
        'warning', 'warning-light',
        'error', 'error-light',
        'info', 'info-light'
      ];
      
      semanticColors.forEach(color => {
        const tokenName = `--color-${color}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidHexColor(value!), `${tokenName} should be valid hex color`).toBe(true);
      });
    });
  });

  describe('Text Color Tokens', () => {
    it('should define all text color tokens', () => {
      const tokens = extractTokens(colorTokens);
      
      const textColors = ['primary', 'secondary', 'disabled', 'inverse'];
      textColors.forEach(color => {
        const tokenName = `--color-text-${color}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid values for text colors (hex or CSS variable)', () => {
      const tokens = extractTokens(colorTokens);
      
      const textColors = ['primary', 'secondary', 'disabled', 'inverse'];
      textColors.forEach(color => {
        const tokenName = `--color-text-${color}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        
        const isValid = isValidHexColor(value!) || isCssVariable(value!);
        expect(isValid, `${tokenName} should be valid hex color or CSS variable`).toBe(true);
      });
    });
  });

  describe('Background Color Tokens', () => {
    it('should define all background color tokens', () => {
      const tokens = extractTokens(colorTokens);
      
      const bgColors = ['base', 'elevated', 'overlay'];
      bgColors.forEach(color => {
        const tokenName = `--color-bg-${color}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid values for background colors', () => {
      const tokens = extractTokens(colorTokens);
      
      const bgColors = ['base', 'elevated', 'overlay'];
      bgColors.forEach(color => {
        const tokenName = `--color-bg-${color}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        
        const isValid = isValidHexColor(value!) || isCssVariable(value!) || isValidRgbColor(value!);
        expect(isValid, `${tokenName} should be valid color value`).toBe(true);
      });
    });
  });

  describe('Border Color Tokens', () => {
    it('should define all border color tokens', () => {
      const tokens = extractTokens(colorTokens);
      
      const borderColors = ['default', 'hover', 'focus'];
      borderColors.forEach(color => {
        const tokenName = `--color-border-${color}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid values for border colors', () => {
      const tokens = extractTokens(colorTokens);
      
      const borderColors = ['default', 'hover', 'focus'];
      borderColors.forEach(color => {
        const tokenName = `--color-border-${color}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        
        const isValid = isValidHexColor(value!) || isCssVariable(value!);
        expect(isValid, `${tokenName} should be valid hex color or CSS variable`).toBe(true);
      });
    });
  });

  describe('Semantic Naming Convention', () => {
    it('should use semantic names rather than literal color names', () => {
      const tokens = extractTokens(colorTokens);
      
      // Check that all token names follow semantic naming
      const tokenNames = Array.from(tokens.keys());
      
      // Tokens should not contain literal color names like "red", "blue", "green" in their semantic tokens
      // (except in palette definitions like primary-500, neutral-300)
      const semanticTokens = tokenNames.filter(name => 
        name.startsWith('--color-text-') ||
        name.startsWith('--color-bg-') ||
        name.startsWith('--color-border-') ||
        name === '--color-success' ||
        name === '--color-warning' ||
        name === '--color-error' ||
        name === '--color-info'
      );
      
      const literalColorNames = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink'];
      
      semanticTokens.forEach(tokenName => {
        literalColorNames.forEach(literalColor => {
          expect(tokenName.toLowerCase()).not.toContain(literalColor);
        });
      });
    });

    it('should use purpose-based naming for semantic colors', () => {
      const tokens = extractTokens(colorTokens);
      
      // Verify semantic color tokens exist with purpose-based names
      expect(tokens.has('--color-success')).toBe(true);
      expect(tokens.has('--color-warning')).toBe(true);
      expect(tokens.has('--color-error')).toBe(true);
      expect(tokens.has('--color-info')).toBe(true);
      
      // Verify text colors use purpose-based names
      expect(tokens.has('--color-text-primary')).toBe(true);
      expect(tokens.has('--color-text-secondary')).toBe(true);
      expect(tokens.has('--color-text-disabled')).toBe(true);
      
      // Verify background colors use purpose-based names
      expect(tokens.has('--color-bg-base')).toBe(true);
      expect(tokens.has('--color-bg-elevated')).toBe(true);
      
      // Verify border colors use purpose-based names
      expect(tokens.has('--color-border-default')).toBe(true);
      expect(tokens.has('--color-border-hover')).toBe(true);
      expect(tokens.has('--color-border-focus')).toBe(true);
    });
  });

  describe('Color Value Format', () => {
    it('should have all direct color values in valid hex or rgb format', () => {
      const tokens = extractTokens(colorTokens);
      
      tokens.forEach((value, name) => {
        // Skip CSS variable references
        if (isCssVariable(value)) {
          return;
        }
        
        const isValid = isValidHexColor(value) || isValidRgbColor(value);
        expect(isValid, `${name} should have valid hex or rgb color value, got: ${value}`).toBe(true);
      });
    });
  });
});
