/**
 * Form Element Styles Tests
 * 
 * Verifies that input classes apply correct border styles, validation states apply correct colors,
 * focus states have visible indicators, and disabled states are distinguishable.
 * 
 * Requirements: 4.2-4.7, 10.1-10.3
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Form Element Styles', () => {
  let formStyles: string;

  // Helper to extract CSS rules from the file
  const extractRules = (content: string): Map<string, Map<string, string>> => {
    const rules = new Map<string, Map<string, string>>();
    
    // Remove comments first
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Match CSS rules: selector { property: value; }
    // This regex handles multi-line selectors with commas
    const ruleRegex = /([^{}]+)\{([^}]+)\}/gs;  // Added 's' flag for dotall
    let match;
    
    while ((match = ruleRegex.exec(cleanContent)) !== null) {
      const selectorGroup = match[1].trim();
      const declarations = match[2];
      
      const properties = new Map<string, string>();
      // Updated regex to handle multi-line property values
      const propRegex = /([a-z-]+):\s*([^;]+?);/gs;  // Added 's' flag and made value non-greedy
      let propMatch;
      
      while ((propMatch = propRegex.exec(declarations)) !== null) {
        const propName = propMatch[1].trim();
        const propValue = propMatch[2].trim().replace(/\s+/g, ' ');  // Normalize whitespace
        properties.set(propName, propValue);
      }
      
      // Split comma-separated selectors and store each one
      const selectors = selectorGroup.split(',').map(s => s.trim());
      for (const selector of selectors) {
        rules.set(selector, properties);
      }
    }
    
    return rules;
  };

  beforeAll(async () => {
    const formStylesPath = resolve(process.cwd(), 'src/frontend/styles/base/forms.css');
    formStyles = await readFile(formStylesPath, 'utf-8');
  });

  describe('Input Base Styles', () => {
    it('should define .input, .select, and .textarea classes', () => {
      const rules = extractRules(formStyles);
      
      // These are defined together in a comma-separated selector
      const hasInputStyles = formStyles.includes('.input,') || formStyles.includes('.input {');
      const hasSelectStyles = formStyles.includes('.select,') || formStyles.includes('.select {');
      const hasTextareaStyles = formStyles.includes('.textarea,') || formStyles.includes('.textarea {');
      
      expect(hasInputStyles, '.input class should be defined').toBe(true);
      expect(hasSelectStyles, '.select class should be defined').toBe(true);
      expect(hasTextareaStyles, '.textarea class should be defined').toBe(true);
    });

    it('should define .checkbox and .radio classes', () => {
      const hasCheckboxStyles = formStyles.includes('.checkbox,') || formStyles.includes('.checkbox {');
      const hasRadioStyles = formStyles.includes('.radio,') || formStyles.includes('.radio {');
      
      expect(hasCheckboxStyles, '.checkbox class should be defined').toBe(true);
      expect(hasRadioStyles, '.radio class should be defined').toBe(true);
    });
  });

  describe('Input Border Styles', () => {
    it('should apply correct default border to input elements', () => {
      const rules = extractRules(formStyles);
      
      // Look for .input selector (comma-separated selectors are now split)
      const inputStyles = rules.get('.input');
      
      expect(inputStyles, 'input elements should have styles').toBeDefined();
      expect(inputStyles!.has('border'), 'input elements should have border').toBe(true);
      
      const border = inputStyles!.get('border');
      expect(border, 'border should use --color-border-default').toContain('--color-border-default');
      expect(border, 'border should use --border-width-thin').toContain('--border-width-thin');
      expect(border, 'border should be solid').toContain('solid');
    });

    it('should apply correct border-radius to input elements', () => {
      const rules = extractRules(formStyles);
      
      const inputStyles = rules.get('.input');
      
      expect(inputStyles, 'input elements should have styles').toBeDefined();
      expect(inputStyles!.has('border-radius'), 'input elements should have border-radius').toBe(true);
      
      const borderRadius = inputStyles!.get('border-radius');
      expect(borderRadius, 'border-radius should use design token').toContain('--border-radius');
    });

    it('should apply hover border color to input elements', () => {
      const rules = extractRules(formStyles);
      
      const hoverStyles = rules.get('.input:hover:not(:disabled)');
      
      expect(hoverStyles, 'input hover styles should be defined').toBeDefined();
      expect(hoverStyles!.has('border-color'), 'hover should change border-color').toBe(true);
      
      const borderColor = hoverStyles!.get('border-color');
      expect(borderColor, 'hover border should use --color-border-hover').toContain('--color-border-hover');
    });
  });

  describe('Validation State Colors', () => {
    it('should apply error border color to .input.error', () => {
      const rules = extractRules(formStyles);
      
      let errorStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes('.input.error') || selector.includes('.error')) {
          if (styles.has('border-color')) {
            errorStyles = styles;
            break;
          }
        }
      }
      
      expect(errorStyles, '.input.error should have styles').toBeDefined();
      expect(errorStyles!.has('border-color'), '.input.error should have border-color').toBe(true);
      
      const borderColor = errorStyles!.get('border-color');
      expect(borderColor, 'error border should use --color-error').toContain('--color-error');
    });

    it('should apply warning border color to .input.warning', () => {
      const rules = extractRules(formStyles);
      
      let warningStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes('.warning') && styles.has('border-color')) {
          warningStyles = styles;
          break;
        }
      }
      
      expect(warningStyles, '.input.warning should have styles').toBeDefined();
      expect(warningStyles!.has('border-color'), '.input.warning should have border-color').toBe(true);
      
      const borderColor = warningStyles!.get('border-color');
      expect(borderColor, 'warning border should use --color-warning').toContain('--color-warning');
    });

    it('should apply success border color to .input.success', () => {
      const rules = extractRules(formStyles);
      
      let successStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes('.success') && styles.has('border-color')) {
          successStyles = styles;
          break;
        }
      }
      
      expect(successStyles, '.input.success should have styles').toBeDefined();
      expect(successStyles!.has('border-color'), '.input.success should have border-color').toBe(true);
      
      const borderColor = successStyles!.get('border-color');
      expect(borderColor, 'success border should use --color-success').toContain('--color-success');
    });

    it('should apply error focus shadow to .input.error:focus', () => {
      const rules = extractRules(formStyles);
      
      let errorFocusStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes('.error:focus') && styles.has('box-shadow')) {
          errorFocusStyles = styles;
          break;
        }
      }
      
      expect(errorFocusStyles, '.input.error:focus should have styles').toBeDefined();
      expect(errorFocusStyles!.has('box-shadow'), '.input.error:focus should have box-shadow').toBe(true);
      
      const boxShadow = errorFocusStyles!.get('box-shadow');
      // Error shadow should contain red color (220, 38, 38)
      expect(boxShadow, 'error focus shadow should use red color').toContain('220');
    });

    it('should apply warning focus shadow to .input.warning:focus', () => {
      const rules = extractRules(formStyles);
      
      let warningFocusStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes('.warning:focus') && styles.has('box-shadow')) {
          warningFocusStyles = styles;
          break;
        }
      }
      
      expect(warningFocusStyles, '.input.warning:focus should have styles').toBeDefined();
      expect(warningFocusStyles!.has('box-shadow'), '.input.warning:focus should have box-shadow').toBe(true);
      
      const boxShadow = warningFocusStyles!.get('box-shadow');
      // Warning shadow should contain orange color (245, 158, 11)
      expect(boxShadow, 'warning focus shadow should use orange color').toContain('245');
    });

    it('should apply success focus shadow to .input.success:focus', () => {
      const rules = extractRules(formStyles);
      
      let successFocusStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes('.success:focus') && styles.has('box-shadow')) {
          successFocusStyles = styles;
          break;
        }
      }
      
      expect(successFocusStyles, '.input.success:focus should have styles').toBeDefined();
      expect(successFocusStyles!.has('box-shadow'), '.input.success:focus should have box-shadow').toBe(true);
      
      const boxShadow = successFocusStyles!.get('box-shadow');
      // Success shadow should contain green color (22, 163, 74)
      expect(boxShadow, 'success focus shadow should use green color').toContain('22');
    });
  });

  describe('Focus State Indicators', () => {
    it('should have visible focus border on input elements', () => {
      const rules = extractRules(formStyles);
      
      let focusStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes(':focus') && 
            (selector.includes('.input') || selector.includes('.select') || selector.includes('.textarea')) &&
            !selector.includes('.error') && !selector.includes('.warning') && !selector.includes('.success')) {
          focusStyles = styles;
          break;
        }
      }
      
      expect(focusStyles, 'input focus styles should be defined').toBeDefined();
      expect(focusStyles!.has('border-color'), 'focus should change border-color').toBe(true);
      
      const borderColor = focusStyles!.get('border-color');
      expect(borderColor, 'focus border should use --color-border-focus').toContain('--color-border-focus');
    });

    it('should have visible focus box-shadow on input elements', () => {
      const rules = extractRules(formStyles);
      
      let focusStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes(':focus') && 
            (selector.includes('.input') || selector.includes('.select') || selector.includes('.textarea')) &&
            !selector.includes('.error') && !selector.includes('.warning') && !selector.includes('.success')) {
          focusStyles = styles;
          break;
        }
      }
      
      expect(focusStyles, 'input focus styles should be defined').toBeDefined();
      expect(focusStyles!.has('box-shadow'), 'focus should have box-shadow').toBe(true);
      
      const boxShadow = focusStyles!.get('box-shadow');
      expect(boxShadow, 'box-shadow should not be "none"').not.toBe('none');
      expect(boxShadow, 'box-shadow should have spread radius').toContain('3px');
    });

    it('should remove default outline on input focus', () => {
      const rules = extractRules(formStyles);
      
      let focusStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes(':focus') && 
            (selector.includes('.input') || selector.includes('.select') || selector.includes('.textarea')) &&
            !selector.includes('.error') && !selector.includes('.warning') && !selector.includes('.success')) {
          focusStyles = styles;
          break;
        }
      }
      
      expect(focusStyles, 'input focus styles should be defined').toBeDefined();
      expect(focusStyles!.has('outline'), 'focus should have outline property').toBe(true);
      
      const outline = focusStyles!.get('outline');
      expect(outline, 'outline should be "none" (replaced by box-shadow)').toBe('none');
    });

    it('should have visible focus outline on checkbox elements', () => {
      const rules = extractRules(formStyles);
      
      let checkboxFocusStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes('.checkbox:focus') && !selector.includes(':not(:focus-visible)')) {
          checkboxFocusStyles = styles;
          break;
        }
      }
      
      expect(checkboxFocusStyles, '.checkbox:focus should have styles').toBeDefined();
      expect(checkboxFocusStyles!.has('outline'), '.checkbox:focus should have outline').toBe(true);
      
      const outline = checkboxFocusStyles!.get('outline');
      expect(outline, 'outline should not be "none"').not.toBe('none');
      expect(outline, 'outline should have width').toContain('2px');
      expect(outline, 'outline should be solid').toContain('solid');
    });

    it('should have visible focus outline on radio elements', () => {
      const rules = extractRules(formStyles);
      
      let radioFocusStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes('.radio:focus') && !selector.includes(':not(:focus-visible)')) {
          radioFocusStyles = styles;
          break;
        }
      }
      
      expect(radioFocusStyles, '.radio:focus should have styles').toBeDefined();
      expect(radioFocusStyles!.has('outline'), '.radio:focus should have outline').toBe(true);
      
      const outline = radioFocusStyles!.get('outline');
      expect(outline, 'outline should not be "none"').not.toBe('none');
      expect(outline, 'outline should have width').toContain('2px');
      expect(outline, 'outline should be solid').toContain('solid');
    });

    it('should have outline-offset for checkbox and radio focus', () => {
      const rules = extractRules(formStyles);
      
      let checkboxFocusStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes('.checkbox:focus') && !selector.includes(':not(:focus-visible)')) {
          checkboxFocusStyles = styles;
          break;
        }
      }
      
      expect(checkboxFocusStyles, '.checkbox:focus should have styles').toBeDefined();
      expect(checkboxFocusStyles!.has('outline-offset'), '.checkbox:focus should have outline-offset').toBe(true);
      
      const outlineOffset = checkboxFocusStyles!.get('outline-offset');
      expect(outlineOffset).toBe('2px');
    });

    it('should support focus-visible for keyboard navigation', () => {
      const hasFocusVisible = formStyles.includes(':focus-visible');
      expect(hasFocusVisible, 'should have :focus-visible styles for keyboard navigation').toBe(true);
    });
  });

  describe('Disabled State Styles', () => {
    it('should have reduced opacity for disabled input elements', () => {
      const rules = extractRules(formStyles);
      
      const disabledStyles = rules.get('.input:disabled');
      
      expect(disabledStyles, 'disabled input styles should be defined').toBeDefined();
      expect(disabledStyles!.has('opacity'), 'disabled inputs should have opacity').toBe(true);
      
      const opacity = disabledStyles!.get('opacity');
      const opacityValue = parseFloat(opacity!);
      
      expect(opacityValue, 'opacity should be less than 1').toBeLessThan(1);
      expect(opacityValue, 'opacity should be greater than 0').toBeGreaterThan(0);
    });

    it('should have not-allowed cursor for disabled input elements', () => {
      const rules = extractRules(formStyles);
      
      const disabledStyles = rules.get('.input:disabled');
      
      expect(disabledStyles, 'disabled input styles should be defined').toBeDefined();
      expect(disabledStyles!.has('cursor'), 'disabled inputs should have cursor').toBe(true);
      
      const cursor = disabledStyles!.get('cursor');
      expect(cursor).toBe('not-allowed');
    });

    it('should have distinguishable background color for disabled inputs', () => {
      const rules = extractRules(formStyles);
      
      const disabledStyles = rules.get('.input:disabled');
      
      expect(disabledStyles, 'disabled input styles should be defined').toBeDefined();
      expect(disabledStyles!.has('background-color'), 'disabled inputs should have background-color').toBe(true);
      
      const bgColor = disabledStyles!.get('background-color');
      expect(bgColor, 'disabled background should use neutral color').toContain('--color-neutral');
    });

    it('should have distinguishable text color for disabled inputs', () => {
      const rules = extractRules(formStyles);
      
      const disabledStyles = rules.get('.input:disabled');
      
      expect(disabledStyles, 'disabled input styles should be defined').toBeDefined();
      expect(disabledStyles!.has('color'), 'disabled inputs should have color').toBe(true);
      
      const textColor = disabledStyles!.get('color');
      expect(textColor, 'disabled text should use --color-text-disabled').toContain('--color-text-disabled');
    });

    it('should have reduced opacity for disabled checkbox and radio', () => {
      const rules = extractRules(formStyles);
      
      const disabledStyles = rules.get('.checkbox:disabled');
      
      expect(disabledStyles, 'disabled checkbox/radio styles should be defined').toBeDefined();
      expect(disabledStyles!.has('opacity'), 'disabled checkbox/radio should have opacity').toBe(true);
      
      const opacity = disabledStyles!.get('opacity');
      const opacityValue = parseFloat(opacity!);
      
      expect(opacityValue, 'opacity should be less than 1').toBeLessThan(1);
      expect(opacityValue, 'opacity should be greater than 0').toBeGreaterThan(0);
    });

    it('should have not-allowed cursor for disabled checkbox and radio', () => {
      const rules = extractRules(formStyles);
      
      const disabledStyles = rules.get('.checkbox:disabled');
      
      expect(disabledStyles, 'disabled checkbox/radio styles should be defined').toBeDefined();
      expect(disabledStyles!.has('cursor'), 'disabled checkbox/radio should have cursor').toBe(true);
      
      const cursor = disabledStyles!.get('cursor');
      expect(cursor).toBe('not-allowed');
    });

    it('should not apply hover styles to disabled inputs', () => {
      // Verify that hover selectors include :not(:disabled)
      expect(formStyles).toContain(':hover:not(:disabled)');
    });
  });

  describe('Checkbox and Radio Specific Styles', () => {
    it('should apply correct border to checkbox and radio', () => {
      // Verify the checkbox/radio styles exist in the CSS file
      expect(formStyles).toContain('.checkbox');
      expect(formStyles).toContain('.radio');
      
      // Verify border properties are defined
      const checkboxSection = formStyles.substring(
        formStyles.indexOf('.checkbox,'),
        formStyles.indexOf('}', formStyles.indexOf('.checkbox,'))
      );
      
      expect(checkboxSection).toContain('border');
      expect(checkboxSection).toContain('--border-width-medium');
      expect(checkboxSection).toContain('--color-border-default');
      expect(checkboxSection).toContain('solid');
    });

    it('should apply correct checked state colors', () => {
      const rules = extractRules(formStyles);
      
      let checkedStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes(':checked') && 
            (selector.includes('.checkbox') || selector.includes('.radio'))) {
          checkedStyles = styles;
          break;
        }
      }
      
      expect(checkedStyles, 'checked styles should be defined').toBeDefined();
      expect(checkedStyles!.has('background-color'), 'checked should have background-color').toBe(true);
      expect(checkedStyles!.has('border-color'), 'checked should have border-color').toBe(true);
      
      const bgColor = checkedStyles!.get('background-color');
      const borderColor = checkedStyles!.get('border-color');
      
      expect(bgColor, 'checked background should use --color-primary').toContain('--color-primary');
      expect(borderColor, 'checked border should use --color-primary').toContain('--color-primary');
    });

    it('should have hover styles for checkbox and radio', () => {
      const rules = extractRules(formStyles);
      
      let hoverStyles: Map<string, string> | undefined;
      for (const [selector, styles] of rules.entries()) {
        if (selector.includes(':hover:not(:disabled)') && 
            (selector.includes('.checkbox') || selector.includes('.radio'))) {
          hoverStyles = styles;
          break;
        }
      }
      
      expect(hoverStyles, 'checkbox/radio hover styles should be defined').toBeDefined();
      expect(hoverStyles!.has('border-color'), 'hover should change border-color').toBe(true);
    });
  });

  describe('Transition Styles', () => {
    it('should have transitions for smooth state changes on inputs', () => {
      const rules = extractRules(formStyles);
      
      const inputStyles = rules.get('.input');
      
      expect(inputStyles, 'input elements should have styles').toBeDefined();
      expect(inputStyles!.has('transition'), 'input elements should have transition').toBe(true);
      
      const transition = inputStyles!.get('transition');
      expect(transition, 'transition should include border-color').toContain('border-color');
      expect(transition, 'transition should include box-shadow').toContain('box-shadow');
    });

    it('should have transitions for checkbox and radio', () => {
      // Verify the checkbox/radio styles exist in the CSS file
      expect(formStyles).toContain('.checkbox');
      expect(formStyles).toContain('.radio');
      
      // Verify transition properties are defined
      const checkboxSection = formStyles.substring(
        formStyles.indexOf('.checkbox,'),
        formStyles.indexOf('}', formStyles.indexOf('.checkbox,'))
      );
      
      expect(checkboxSection).toContain('transition');
      expect(checkboxSection).toContain('--transition-fast');
      expect(checkboxSection).toContain('--easing-in-out');
    });
  });
});
