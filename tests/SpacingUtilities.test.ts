/**
 * Spacing Utilities Tests
 * 
 * Verifies that spacing utility classes (margin, padding, gap) apply correct values
 * from the design system tokens.
 * 
 * Requirements: 2.3, 2.4
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Spacing Utilities', () => {
  let spacingUtilities: string;
  let spacingTokens: string;

  // Helper to extract CSS rules from the file
  const extractRules = (content: string): Map<string, Map<string, string>> => {
    const rules = new Map<string, Map<string, string>>();
    
    // Match CSS rules like .class-name { property: value; }
    const ruleRegex = /\.([a-z0-9-]+)\s*\{([^}]+)\}/g;
    let match;
    
    while ((match = ruleRegex.exec(content)) !== null) {
      const className = match[1];
      const declarations = match[2];
      
      const properties = new Map<string, string>();
      const propRegex = /([a-z-]+):\s*([^;]+);/g;
      let propMatch;
      
      while ((propMatch = propRegex.exec(declarations)) !== null) {
        properties.set(propMatch[1], propMatch[2].trim());
      }
      
      rules.set(className, properties);
    }
    
    return rules;
  };

  // Helper to extract token values
  const extractTokens = (content: string): Map<string, string> => {
    const tokens = new Map<string, string>();
    const regex = /--([a-z0-9-]+):\s*([^;]+);/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      tokens.set(`--${match[1]}`, match[2].trim());
    }
    
    return tokens;
  };

  beforeAll(async () => {
    const spacingUtilitiesPath = resolve(process.cwd(), 'src/frontend/styles/utilities/spacing.css');
    const spacingTokensPath = resolve(process.cwd(), 'src/frontend/styles/tokens/spacing.css');
    
    spacingUtilities = await readFile(spacingUtilitiesPath, 'utf-8');
    spacingTokens = await readFile(spacingTokensPath, 'utf-8');
  });

  describe('Margin Utilities', () => {
    it('should apply correct margin values for all-sides utilities', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `m-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('margin')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct margin-top values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `mt-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('margin-top')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct margin-right values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `mr-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('margin-right')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct margin-bottom values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `mb-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('margin-bottom')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct margin-left values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `ml-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('margin-left')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct horizontal margin values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `mx-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('margin-left')).toBe(`var(--spacing-${scale})`);
        expect(rule!.get('margin-right')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct vertical margin values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `my-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('margin-top')).toBe(`var(--spacing-${scale})`);
        expect(rule!.get('margin-bottom')).toBe(`var(--spacing-${scale})`);
      });
    });
  });

  describe('Padding Utilities', () => {
    it('should apply correct padding values for all-sides utilities', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `p-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('padding')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct padding-top values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `pt-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('padding-top')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct padding-right values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `pr-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('padding-right')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct padding-bottom values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `pb-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('padding-bottom')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct padding-left values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `pl-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('padding-left')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct horizontal padding values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `px-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('padding-left')).toBe(`var(--spacing-${scale})`);
        expect(rule!.get('padding-right')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should apply correct vertical padding values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `py-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('padding-top')).toBe(`var(--spacing-${scale})`);
        expect(rule!.get('padding-bottom')).toBe(`var(--spacing-${scale})`);
      });
    });
  });

  describe('Gap Utilities', () => {
    it('should apply correct gap values', () => {
      const rules = extractRules(spacingUtilities);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `gap-${scale}`;
        const rule = rules.get(className);
        
        expect(rule, `${className} should be defined`).toBeDefined();
        expect(rule!.get('gap')).toBe(`var(--spacing-${scale})`);
      });
    });

    it('should reference valid spacing tokens', () => {
      const rules = extractRules(spacingUtilities);
      const tokens = extractTokens(spacingTokens);
      
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      scales.forEach(scale => {
        const className = `gap-${scale}`;
        const rule = rules.get(className);
        const gapValue = rule!.get('gap');
        
        // Extract token name from var() reference
        const tokenMatch = gapValue?.match(/var\((--spacing-\d+)\)/);
        expect(tokenMatch, `${className} should reference a spacing token`).toBeTruthy();
        
        const tokenName = tokenMatch![1];
        expect(tokens.has(tokenName), `Token ${tokenName} should exist`).toBe(true);
      });
    });
  });

  describe('Utility Token References', () => {
    it('should have all margin utilities reference valid spacing tokens', () => {
      const rules = extractRules(spacingUtilities);
      const tokens = extractTokens(spacingTokens);
      
      rules.forEach((properties, className) => {
        if (className.startsWith('m-') || className.startsWith('mt-') || 
            className.startsWith('mr-') || className.startsWith('mb-') || 
            className.startsWith('ml-') || className.startsWith('mx-') || 
            className.startsWith('my-')) {
          
          properties.forEach((value, property) => {
            if (property.startsWith('margin')) {
              const tokenMatch = value.match(/var\((--spacing-\d+)\)/);
              expect(tokenMatch, `${className} ${property} should reference a spacing token`).toBeTruthy();
              
              const tokenName = tokenMatch![1];
              expect(tokens.has(tokenName), `Token ${tokenName} should exist`).toBe(true);
            }
          });
        }
      });
    });

    it('should have all padding utilities reference valid spacing tokens', () => {
      const rules = extractRules(spacingUtilities);
      const tokens = extractTokens(spacingTokens);
      
      rules.forEach((properties, className) => {
        if (className.startsWith('p-') || className.startsWith('pt-') || 
            className.startsWith('pr-') || className.startsWith('pb-') || 
            className.startsWith('pl-') || className.startsWith('px-') || 
            className.startsWith('py-')) {
          
          properties.forEach((value, property) => {
            if (property.startsWith('padding')) {
              const tokenMatch = value.match(/var\((--spacing-\d+)\)/);
              expect(tokenMatch, `${className} ${property} should reference a spacing token`).toBeTruthy();
              
              const tokenName = tokenMatch![1];
              expect(tokens.has(tokenName), `Token ${tokenName} should exist`).toBe(true);
            }
          });
        }
      });
    });
  });

  describe('Utility Coverage', () => {
    it('should have complete margin utility coverage', () => {
      const rules = extractRules(spacingUtilities);
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      const directions = ['', 't', 'r', 'b', 'l', 'x', 'y'];
      
      directions.forEach(dir => {
        scales.forEach(scale => {
          const className = dir ? `m${dir}-${scale}` : `m-${scale}`;
          expect(rules.has(className), `${className} should be defined`).toBe(true);
        });
      });
    });

    it('should have complete padding utility coverage', () => {
      const rules = extractRules(spacingUtilities);
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      const directions = ['', 't', 'r', 'b', 'l', 'x', 'y'];
      
      directions.forEach(dir => {
        scales.forEach(scale => {
          const className = dir ? `p${dir}-${scale}` : `p-${scale}`;
          expect(rules.has(className), `${className} should be defined`).toBe(true);
        });
      });
    });

    it('should have complete gap utility coverage', () => {
      const rules = extractRules(spacingUtilities);
      const scales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
      
      scales.forEach(scale => {
        const className = `gap-${scale}`;
        expect(rules.has(className), `${className} should be defined`).toBe(true);
      });
    });
  });
});
