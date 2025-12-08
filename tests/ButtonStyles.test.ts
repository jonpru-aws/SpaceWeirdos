/**
 * Button Styles Tests
 * 
 * Verifies that button classes apply correct colors, focus states have visible outlines,
 * and disabled states have reduced opacity.
 * 
 * Requirements: 4.1, 4.5, 4.6, 4.7
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Button Styles', () => {
  let buttonStyles: string;

  // Helper to extract CSS rules from the file
  const extractRules = (content: string): Map<string, Map<string, string>> => {
    const rules = new Map<string, Map<string, string>>();
    
    // Match CSS rules: selector { property: value; }
    const ruleRegex = /([.:#\w\s\-:(),>+~[\]="']+)\s*\{([^}]+)\}/g;
    let match;
    
    while ((match = ruleRegex.exec(content)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2];
      
      const properties = new Map<string, string>();
      const propRegex = /([a-z-]+):\s*([^;]+);/g;
      let propMatch;
      
      while ((propMatch = propRegex.exec(declarations)) !== null) {
        properties.set(propMatch[1].trim(), propMatch[2].trim());
      }
      
      rules.set(selector, properties);
    }
    
    return rules;
  };

  beforeAll(async () => {
    const buttonStylesPath = resolve(process.cwd(), 'src/frontend/styles/base/buttons.css');
    buttonStyles = await readFile(buttonStylesPath, 'utf-8');
  });

  describe('Button Base Styles', () => {
    it('should define .btn base class', () => {
      const rules = extractRules(buttonStyles);
      expect(rules.has('.btn'), '.btn class should be defined').toBe(true);
    });

    it('should define button variants', () => {
      const rules = extractRules(buttonStyles);
      
      expect(rules.has('.btn-primary'), '.btn-primary should be defined').toBe(true);
      expect(rules.has('.btn-secondary'), '.btn-secondary should be defined').toBe(true);
      expect(rules.has('.btn-danger'), '.btn-danger should be defined').toBe(true);
    });
  });

  describe('Button Color Application', () => {
    it('should apply correct background color to .btn-primary', () => {
      const rules = extractRules(buttonStyles);
      const primaryStyles = rules.get('.btn-primary');
      
      expect(primaryStyles, '.btn-primary should have styles').toBeDefined();
      expect(primaryStyles!.has('background-color'), '.btn-primary should have background-color').toBe(true);
      
      const bgColor = primaryStyles!.get('background-color');
      expect(bgColor).toContain('--color-primary');
    });

    it('should apply correct text color to .btn-primary', () => {
      const rules = extractRules(buttonStyles);
      const primaryStyles = rules.get('.btn-primary');
      
      expect(primaryStyles, '.btn-primary should have styles').toBeDefined();
      expect(primaryStyles!.has('color'), '.btn-primary should have color').toBe(true);
      
      const textColor = primaryStyles!.get('color');
      expect(textColor).toContain('--color-text-inverse');
    });

    it('should apply correct colors to .btn-secondary', () => {
      const rules = extractRules(buttonStyles);
      const secondaryStyles = rules.get('.btn-secondary');
      
      expect(secondaryStyles, '.btn-secondary should have styles').toBeDefined();
      expect(secondaryStyles!.has('background-color'), '.btn-secondary should have background-color').toBe(true);
      expect(secondaryStyles!.has('color'), '.btn-secondary should have color').toBe(true);
      expect(secondaryStyles!.has('border-color'), '.btn-secondary should have border-color').toBe(true);
      
      const bgColor = secondaryStyles!.get('background-color');
      const textColor = secondaryStyles!.get('color');
      const borderColor = secondaryStyles!.get('border-color');
      
      expect(bgColor).toBe('transparent');
      expect(textColor).toContain('--color-primary');
      expect(borderColor).toContain('--color-primary');
    });

    it('should apply correct colors to .btn-danger', () => {
      const rules = extractRules(buttonStyles);
      const dangerStyles = rules.get('.btn-danger');
      
      expect(dangerStyles, '.btn-danger should have styles').toBeDefined();
      expect(dangerStyles!.has('background-color'), '.btn-danger should have background-color').toBe(true);
      expect(dangerStyles!.has('color'), '.btn-danger should have color').toBe(true);
      
      const bgColor = dangerStyles!.get('background-color');
      const textColor = dangerStyles!.get('color');
      
      expect(bgColor).toContain('--color-error');
      expect(textColor).toContain('--color-text-inverse');
    });
  });

  describe('Button Focus States', () => {
    it('should have visible focus outline on .btn:focus', () => {
      const rules = extractRules(buttonStyles);
      const focusStyles = rules.get('.btn:focus');
      
      expect(focusStyles, '.btn:focus should have styles').toBeDefined();
      expect(focusStyles!.has('outline'), '.btn:focus should have outline').toBe(true);
      
      const outline = focusStyles!.get('outline');
      expect(outline, 'outline should not be "none"').not.toBe('none');
      expect(outline, 'outline should have width').toContain('2px');
      expect(outline, 'outline should be solid').toContain('solid');
    });

    it('should have outline-offset for better visibility', () => {
      const rules = extractRules(buttonStyles);
      const focusStyles = rules.get('.btn:focus');
      
      expect(focusStyles, '.btn:focus should have styles').toBeDefined();
      expect(focusStyles!.has('outline-offset'), '.btn:focus should have outline-offset').toBe(true);
      
      const outlineOffset = focusStyles!.get('outline-offset');
      expect(outlineOffset).toBe('2px');
    });

    it('should use focus border color for outline', () => {
      const rules = extractRules(buttonStyles);
      const focusStyles = rules.get('.btn:focus');
      
      expect(focusStyles, '.btn:focus should have styles').toBeDefined();
      
      const outline = focusStyles!.get('outline');
      expect(outline, 'outline should use --color-border-focus').toContain('--color-border-focus');
    });

    it('should have focus-visible styles for keyboard navigation', () => {
      const rules = extractRules(buttonStyles);
      const focusVisibleStyles = rules.get('.btn:focus-visible');
      
      expect(focusVisibleStyles, '.btn:focus-visible should have styles').toBeDefined();
      expect(focusVisibleStyles!.has('outline'), '.btn:focus-visible should have outline').toBe(true);
      
      const outline = focusVisibleStyles!.get('outline');
      expect(outline, 'outline should not be "none"').not.toBe('none');
      expect(outline, 'outline should have width').toContain('2px');
    });
  });

  describe('Button Disabled States', () => {
    it('should have reduced opacity for disabled buttons', () => {
      const rules = extractRules(buttonStyles);
      const disabledStyles = rules.get('.btn:disabled');
      
      expect(disabledStyles, '.btn:disabled should have styles').toBeDefined();
      expect(disabledStyles!.has('opacity'), '.btn:disabled should have opacity').toBe(true);
      
      const opacity = disabledStyles!.get('opacity');
      const opacityValue = parseFloat(opacity!);
      
      expect(opacityValue, 'opacity should be less than 1').toBeLessThan(1);
      expect(opacityValue, 'opacity should be greater than 0').toBeGreaterThan(0);
      expect(opacityValue).toBe(0.5);
    });

    it('should have not-allowed cursor for disabled buttons', () => {
      const rules = extractRules(buttonStyles);
      const disabledStyles = rules.get('.btn:disabled');
      
      expect(disabledStyles, '.btn:disabled should have styles').toBeDefined();
      expect(disabledStyles!.has('cursor'), '.btn:disabled should have cursor').toBe(true);
      
      const cursor = disabledStyles!.get('cursor');
      expect(cursor).toBe('not-allowed');
    });

    it('should disable pointer events for disabled buttons', () => {
      const rules = extractRules(buttonStyles);
      const disabledStyles = rules.get('.btn:disabled');
      
      expect(disabledStyles, '.btn:disabled should have styles').toBeDefined();
      expect(disabledStyles!.has('pointer-events'), '.btn:disabled should have pointer-events').toBe(true);
      
      const pointerEvents = disabledStyles!.get('pointer-events');
      expect(pointerEvents).toBe('none');
    });
  });

  describe('Button Hover States', () => {
    it('should have hover styles for .btn-primary', () => {
      const rules = extractRules(buttonStyles);
      const hoverStyles = rules.get('.btn-primary:hover:not(:disabled)');
      
      expect(hoverStyles, '.btn-primary:hover:not(:disabled) should have styles').toBeDefined();
      expect(hoverStyles!.has('background-color'), 'hover should change background-color').toBe(true);
    });

    it('should have hover styles for .btn-secondary', () => {
      const rules = extractRules(buttonStyles);
      const hoverStyles = rules.get('.btn-secondary:hover:not(:disabled)');
      
      expect(hoverStyles, '.btn-secondary:hover:not(:disabled) should have styles').toBeDefined();
      expect(hoverStyles!.has('background-color'), 'hover should change background-color').toBe(true);
    });

    it('should have hover styles for .btn-danger', () => {
      const rules = extractRules(buttonStyles);
      const hoverStyles = rules.get('.btn-danger:hover:not(:disabled)');
      
      expect(hoverStyles, '.btn-danger:hover:not(:disabled) should have styles').toBeDefined();
      expect(hoverStyles!.has('background-color'), 'hover should change background-color').toBe(true);
    });

    it('should not apply hover styles to disabled buttons', () => {
      // Verify that hover selectors include :not(:disabled)
      expect(buttonStyles).toContain(':hover:not(:disabled)');
    });
  });

  describe('Button Active States', () => {
    it('should have active styles for .btn-primary', () => {
      const rules = extractRules(buttonStyles);
      const activeStyles = rules.get('.btn-primary:active:not(:disabled)');
      
      expect(activeStyles, '.btn-primary:active:not(:disabled) should have styles').toBeDefined();
      expect(activeStyles!.has('background-color'), 'active should change background-color').toBe(true);
    });

    it('should have active styles for .btn-secondary', () => {
      const rules = extractRules(buttonStyles);
      const activeStyles = rules.get('.btn-secondary:active:not(:disabled)');
      
      expect(activeStyles, '.btn-secondary:active:not(:disabled) should have styles').toBeDefined();
      expect(activeStyles!.has('background-color'), 'active should change background-color').toBe(true);
    });

    it('should have active styles for .btn-danger', () => {
      const rules = extractRules(buttonStyles);
      const activeStyles = rules.get('.btn-danger:active:not(:disabled)');
      
      expect(activeStyles, '.btn-danger:active:not(:disabled) should have styles').toBeDefined();
      expect(activeStyles!.has('background-color'), 'active should change background-color').toBe(true);
    });
  });
});
