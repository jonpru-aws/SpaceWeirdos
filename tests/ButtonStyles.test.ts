/**
 * Button Style Tests
 * 
 * Verifies that button classes apply correct colors, focus states have visible
 * outlines, and disabled states have reduced opacity.
 * 
 * Requirements: 4.1, 4.5, 4.6, 4.7
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Button Styles', () => {
  let buttonStyles: string;

  // Helper to extract CSS rules for a selector
  const extractRules = (content: string, selector: string): Map<string, string> => {
    const rules = new Map<string, string>();
    
    // Escape special regex characters but preserve the selector structure
    const escapedSelector = selector
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\./g, '\\.')
      .replace(/:/g, ':');
    
    // Match the selector and its rules, handling multi-line
    const selectorRegex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'gs');
    const match = selectorRegex.exec(content);
    
    if (match) {
      const rulesBlock = match[1];
      const propertyRegex = /([a-z-]+):\s*([^;]+);/g;
      let propMatch;
      
      while ((propMatch = propertyRegex.exec(rulesBlock)) !== null) {
        rules.set(propMatch[1].trim(), propMatch[2].trim());
      }
    }
    
    return rules;
  };

  // Helper to check if a value references a CSS variable
  const isCssVariable = (value: string): boolean => {
    return /var\(--[a-z0-9-]+\)/.test(value);
  };

  beforeAll(async () => {
    const buttonStylesPath = resolve(process.cwd(), 'src/frontend/styles/base/buttons.css');
    buttonStyles = await readFile(buttonStylesPath, 'utf-8');
  });

  describe('Button Base Styles', () => {
    it('should define base .btn class', () => {
      expect(buttonStyles).toContain('.btn {');
    });

    it('should have cursor pointer for base button', () => {
      const rules = extractRules(buttonStyles, '.btn');
      expect(rules.get('cursor')).toBe('pointer');
    });
  });

  describe('Button Variant Colors (Requirement 4.1)', () => {
    it('should apply correct background color for .btn-primary', () => {
      const rules = extractRules(buttonStyles, '.btn-primary');
      const bgColor = rules.get('background-color');
      
      expect(bgColor).toBeDefined();
      expect(isCssVariable(bgColor!)).toBe(true);
      expect(bgColor).toContain('--color-primary');
    });

    it('should apply correct text color for .btn-primary', () => {
      const rules = extractRules(buttonStyles, '.btn-primary');
      const textColor = rules.get('color');
      
      expect(textColor).toBeDefined();
      expect(isCssVariable(textColor!)).toBe(true);
      expect(textColor).toContain('--color-text-inverse');
    });

    it('should apply correct colors for .btn-secondary', () => {
      const rules = extractRules(buttonStyles, '.btn-secondary');
      const bgColor = rules.get('background-color');
      const textColor = rules.get('color');
      const borderColor = rules.get('border-color');
      
      expect(bgColor).toBe('transparent');
      expect(textColor).toBeDefined();
      expect(isCssVariable(textColor!)).toBe(true);
      expect(textColor).toContain('--color-primary');
      expect(borderColor).toBeDefined();
      expect(isCssVariable(borderColor!)).toBe(true);
    });

    it('should apply correct background color for .btn-danger', () => {
      const rules = extractRules(buttonStyles, '.btn-danger');
      const bgColor = rules.get('background-color');
      
      expect(bgColor).toBeDefined();
      expect(isCssVariable(bgColor!)).toBe(true);
      expect(bgColor).toContain('--color-error');
    });

    it('should apply correct text color for .btn-danger', () => {
      const rules = extractRules(buttonStyles, '.btn-danger');
      const textColor = rules.get('color');
      
      expect(textColor).toBeDefined();
      expect(isCssVariable(textColor!)).toBe(true);
      expect(textColor).toContain('--color-text-inverse');
    });
  });

  describe('Button Focus States (Requirement 4.5)', () => {
    it('should have visible outline for .btn:focus', () => {
      const rules = extractRules(buttonStyles, '.btn:focus');
      const outline = rules.get('outline');
      
      expect(outline).toBeDefined();
      expect(outline).not.toBe('none');
      expect(outline).toContain('solid');
    });

    it('should have outline with sufficient width for .btn:focus', () => {
      const rules = extractRules(buttonStyles, '.btn:focus');
      const outline = rules.get('outline');
      
      expect(outline).toBeDefined();
      // Should have at least 2px outline
      expect(outline).toMatch(/\d+px/);
      const widthMatch = outline!.match(/(\d+)px/);
      if (widthMatch) {
        const width = parseInt(widthMatch[1]);
        expect(width).toBeGreaterThanOrEqual(2);
      }
    });

    it('should use focus border color for .btn:focus outline', () => {
      const rules = extractRules(buttonStyles, '.btn:focus');
      const outline = rules.get('outline');
      
      expect(outline).toBeDefined();
      expect(isCssVariable(outline!)).toBe(true);
      expect(outline).toContain('--color-border-focus');
    });

    it('should have outline-offset for .btn:focus', () => {
      const rules = extractRules(buttonStyles, '.btn:focus');
      const outlineOffset = rules.get('outline-offset');
      
      expect(outlineOffset).toBeDefined();
      expect(outlineOffset).not.toBe('0');
    });

    it('should have visible outline for .btn:focus-visible', () => {
      const rules = extractRules(buttonStyles, '.btn:focus-visible');
      const outline = rules.get('outline');
      
      expect(outline).toBeDefined();
      expect(outline).not.toBe('none');
      expect(outline).toContain('solid');
    });
  });

  describe('Button Hover States (Requirement 4.6)', () => {
    it('should define hover state for .btn-primary', () => {
      expect(buttonStyles).toContain('.btn-primary:hover:not(:disabled)');
    });

    it('should define hover state for .btn-secondary', () => {
      expect(buttonStyles).toContain('.btn-secondary:hover:not(:disabled)');
    });

    it('should define hover state for .btn-danger', () => {
      expect(buttonStyles).toContain('.btn-danger:hover:not(:disabled)');
    });

    it('should change background color on hover for .btn-primary', () => {
      const rules = extractRules(buttonStyles, '.btn-primary:hover:not(:disabled)');
      const bgColor = rules.get('background-color');
      
      expect(bgColor).toBeDefined();
      expect(isCssVariable(bgColor!)).toBe(true);
    });
  });

  describe('Button Disabled States (Requirement 4.7)', () => {
    it('should have reduced opacity for .btn:disabled', () => {
      const rules = extractRules(buttonStyles, '.btn:disabled');
      const opacity = rules.get('opacity');
      
      expect(opacity).toBeDefined();
      const opacityValue = parseFloat(opacity!);
      expect(opacityValue).toBeLessThan(1);
      expect(opacityValue).toBeGreaterThan(0);
    });

    it('should have cursor not-allowed for .btn:disabled', () => {
      const rules = extractRules(buttonStyles, '.btn:disabled');
      const cursor = rules.get('cursor');
      
      expect(cursor).toBe('not-allowed');
    });

    it('should have pointer-events none for .btn:disabled', () => {
      const rules = extractRules(buttonStyles, '.btn:disabled');
      const pointerEvents = rules.get('pointer-events');
      
      expect(pointerEvents).toBe('none');
    });

    it('should have opacity of 0.5 for disabled state', () => {
      const rules = extractRules(buttonStyles, '.btn:disabled');
      const opacity = rules.get('opacity');
      
      expect(opacity).toBe('0.5');
    });
  });

  describe('Button Active States (Requirement 4.6)', () => {
    it('should define active state for .btn-primary', () => {
      expect(buttonStyles).toContain('.btn-primary:active:not(:disabled)');
    });

    it('should define active state for .btn-secondary', () => {
      expect(buttonStyles).toContain('.btn-secondary:active:not(:disabled)');
    });

    it('should define active state for .btn-danger', () => {
      expect(buttonStyles).toContain('.btn-danger:active:not(:disabled)');
    });
  });

  describe('Button Transitions', () => {
    it('should have transition property for smooth state changes', () => {
      const rules = extractRules(buttonStyles, '.btn');
      const transition = rules.get('transition');
      
      expect(transition).toBeDefined();
      expect(transition).toContain('var(--transition-fast)');
    });
  });
});
