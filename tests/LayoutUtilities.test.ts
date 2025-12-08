/**
 * Layout Utilities Tests
 * 
 * Verifies that layout utility classes (container, flexbox, grid) apply correct
 * display properties, alignment, and column counts.
 * 
 * Requirements: 5.1, 5.2, 5.3
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Layout Utilities', () => {
  let layoutUtilities: string;

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

  beforeAll(async () => {
    const layoutUtilitiesPath = resolve(process.cwd(), 'src/frontend/styles/utilities/layout.css');
    layoutUtilities = await readFile(layoutUtilitiesPath, 'utf-8');
  });

  describe('Container Classes (Requirement 5.1)', () => {
    it('should apply correct max-width for .container', () => {
      const rules = extractRules(layoutUtilities);
      const containerRule = rules.get('container');
      
      expect(containerRule, '.container should be defined').toBeDefined();
      expect(containerRule!.get('max-width')).toBe('1280px');
    });

    it('should apply correct max-width for .container-sm', () => {
      const rules = extractRules(layoutUtilities);
      const containerRule = rules.get('container-sm');
      
      expect(containerRule, '.container-sm should be defined').toBeDefined();
      expect(containerRule!.get('max-width')).toBe('640px');
    });

    it('should apply correct max-width for .container-md', () => {
      const rules = extractRules(layoutUtilities);
      const containerRule = rules.get('container-md');
      
      expect(containerRule, '.container-md should be defined').toBeDefined();
      expect(containerRule!.get('max-width')).toBe('768px');
    });

    it('should apply correct max-width for .container-lg', () => {
      const rules = extractRules(layoutUtilities);
      const containerRule = rules.get('container-lg');
      
      expect(containerRule, '.container-lg should be defined').toBeDefined();
      expect(containerRule!.get('max-width')).toBe('1024px');
    });

    it('should center containers with auto margins', () => {
      const rules = extractRules(layoutUtilities);
      const containerRule = rules.get('container');
      
      expect(containerRule!.get('margin-left')).toBe('auto');
      expect(containerRule!.get('margin-right')).toBe('auto');
    });

    it('should have full width for all containers', () => {
      const rules = extractRules(layoutUtilities);
      
      ['container', 'container-sm', 'container-md', 'container-lg'].forEach(className => {
        const rule = rules.get(className);
        expect(rule!.get('width')).toBe('100%');
      });
    });

    it('should have horizontal padding for all containers', () => {
      const rules = extractRules(layoutUtilities);
      
      ['container', 'container-sm', 'container-md', 'container-lg'].forEach(className => {
        const rule = rules.get(className);
        expect(rule!.get('padding-left')).toBe('var(--spacing-4)');
        expect(rule!.get('padding-right')).toBe('var(--spacing-4)');
      });
    });
  });

  describe('Flexbox Utilities (Requirement 5.2)', () => {
    it('should apply correct display for .flex', () => {
      const rules = extractRules(layoutUtilities);
      const flexRule = rules.get('flex');
      
      expect(flexRule, '.flex should be defined').toBeDefined();
      expect(flexRule!.get('display')).toBe('flex');
    });

    it('should apply correct flex-direction for .flex-row', () => {
      const rules = extractRules(layoutUtilities);
      const flexRowRule = rules.get('flex-row');
      
      expect(flexRowRule, '.flex-row should be defined').toBeDefined();
      expect(flexRowRule!.get('flex-direction')).toBe('row');
    });

    it('should apply correct flex-direction for .flex-col', () => {
      const rules = extractRules(layoutUtilities);
      const flexColRule = rules.get('flex-col');
      
      expect(flexColRule, '.flex-col should be defined').toBeDefined();
      expect(flexColRule!.get('flex-direction')).toBe('column');
    });

    it('should apply correct flex-wrap for .flex-wrap', () => {
      const rules = extractRules(layoutUtilities);
      const flexWrapRule = rules.get('flex-wrap');
      
      expect(flexWrapRule, '.flex-wrap should be defined').toBeDefined();
      expect(flexWrapRule!.get('flex-wrap')).toBe('wrap');
    });

    it('should apply correct align-items for .items-start', () => {
      const rules = extractRules(layoutUtilities);
      const itemsStartRule = rules.get('items-start');
      
      expect(itemsStartRule, '.items-start should be defined').toBeDefined();
      expect(itemsStartRule!.get('align-items')).toBe('flex-start');
    });

    it('should apply correct align-items for .items-center', () => {
      const rules = extractRules(layoutUtilities);
      const itemsCenterRule = rules.get('items-center');
      
      expect(itemsCenterRule, '.items-center should be defined').toBeDefined();
      expect(itemsCenterRule!.get('align-items')).toBe('center');
    });

    it('should apply correct align-items for .items-end', () => {
      const rules = extractRules(layoutUtilities);
      const itemsEndRule = rules.get('items-end');
      
      expect(itemsEndRule, '.items-end should be defined').toBeDefined();
      expect(itemsEndRule!.get('align-items')).toBe('flex-end');
    });

    it('should apply correct justify-content for .justify-start', () => {
      const rules = extractRules(layoutUtilities);
      const justifyStartRule = rules.get('justify-start');
      
      expect(justifyStartRule, '.justify-start should be defined').toBeDefined();
      expect(justifyStartRule!.get('justify-content')).toBe('flex-start');
    });

    it('should apply correct justify-content for .justify-center', () => {
      const rules = extractRules(layoutUtilities);
      const justifyCenterRule = rules.get('justify-center');
      
      expect(justifyCenterRule, '.justify-center should be defined').toBeDefined();
      expect(justifyCenterRule!.get('justify-content')).toBe('center');
    });

    it('should apply correct justify-content for .justify-end', () => {
      const rules = extractRules(layoutUtilities);
      const justifyEndRule = rules.get('justify-end');
      
      expect(justifyEndRule, '.justify-end should be defined').toBeDefined();
      expect(justifyEndRule!.get('justify-content')).toBe('flex-end');
    });

    it('should apply correct justify-content for .justify-between', () => {
      const rules = extractRules(layoutUtilities);
      const justifyBetweenRule = rules.get('justify-between');
      
      expect(justifyBetweenRule, '.justify-between should be defined').toBeDefined();
      expect(justifyBetweenRule!.get('justify-content')).toBe('space-between');
    });

    it('should apply correct justify-content for .justify-around', () => {
      const rules = extractRules(layoutUtilities);
      const justifyAroundRule = rules.get('justify-around');
      
      expect(justifyAroundRule, '.justify-around should be defined').toBeDefined();
      expect(justifyAroundRule!.get('justify-content')).toBe('space-around');
    });
  });

  describe('Grid Utilities (Requirement 5.3)', () => {
    it('should apply correct display for .grid', () => {
      const rules = extractRules(layoutUtilities);
      const gridRule = rules.get('grid');
      
      expect(gridRule, '.grid should be defined').toBeDefined();
      expect(gridRule!.get('display')).toBe('grid');
    });

    it('should apply correct column count for .grid-cols-1', () => {
      const rules = extractRules(layoutUtilities);
      const gridCols1Rule = rules.get('grid-cols-1');
      
      expect(gridCols1Rule, '.grid-cols-1 should be defined').toBeDefined();
      expect(gridCols1Rule!.get('grid-template-columns')).toBe('repeat(1, minmax(0, 1fr))');
    });

    it('should apply correct column count for .grid-cols-2', () => {
      const rules = extractRules(layoutUtilities);
      const gridCols2Rule = rules.get('grid-cols-2');
      
      expect(gridCols2Rule, '.grid-cols-2 should be defined').toBeDefined();
      expect(gridCols2Rule!.get('grid-template-columns')).toBe('repeat(2, minmax(0, 1fr))');
    });

    it('should apply correct column count for .grid-cols-3', () => {
      const rules = extractRules(layoutUtilities);
      const gridCols3Rule = rules.get('grid-cols-3');
      
      expect(gridCols3Rule, '.grid-cols-3 should be defined').toBeDefined();
      expect(gridCols3Rule!.get('grid-template-columns')).toBe('repeat(3, minmax(0, 1fr))');
    });

    it('should apply correct column count for .grid-cols-4', () => {
      const rules = extractRules(layoutUtilities);
      const gridCols4Rule = rules.get('grid-cols-4');
      
      expect(gridCols4Rule, '.grid-cols-4 should be defined').toBeDefined();
      expect(gridCols4Rule!.get('grid-template-columns')).toBe('repeat(4, minmax(0, 1fr))');
    });
  });

  describe('Layout Utility Coverage', () => {
    it('should have all container variants defined', () => {
      const rules = extractRules(layoutUtilities);
      
      ['container', 'container-sm', 'container-md', 'container-lg'].forEach(className => {
        expect(rules.has(className), `${className} should be defined`).toBe(true);
      });
    });

    it('should have all flexbox direction utilities defined', () => {
      const rules = extractRules(layoutUtilities);
      
      ['flex', 'flex-row', 'flex-col'].forEach(className => {
        expect(rules.has(className), `${className} should be defined`).toBe(true);
      });
    });

    it('should have all align-items utilities defined', () => {
      const rules = extractRules(layoutUtilities);
      
      ['items-start', 'items-center', 'items-end'].forEach(className => {
        expect(rules.has(className), `${className} should be defined`).toBe(true);
      });
    });

    it('should have all justify-content utilities defined', () => {
      const rules = extractRules(layoutUtilities);
      
      ['justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around'].forEach(className => {
        expect(rules.has(className), `${className} should be defined`).toBe(true);
      });
    });

    it('should have all grid column utilities defined', () => {
      const rules = extractRules(layoutUtilities);
      
      ['grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'].forEach(className => {
        expect(rules.has(className), `${className} should be defined`).toBe(true);
      });
    });
  });
});
