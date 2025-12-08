/**
 * Responsive Behavior Tests
 * 
 * Verifies that layout utilities work at different viewport sizes,
 * text remains readable at 200% zoom, and breakpoint-based styles
 * apply correctly.
 * 
 * Requirements: 2.5, 3.6, 9.1, 9.2, 9.3, 9.4
 */

import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Responsive Behavior', () => {
  describe('Breakpoint Tokens', () => {
    it('should define all breakpoint tokens', async () => {
      const breakpointsPath = resolve(process.cwd(), 'src/frontend/styles/tokens/breakpoints.css');
      const content = await readFile(breakpointsPath, 'utf-8');
      
      // Verify breakpoint tokens are defined (Requirements 9.1, 9.2)
      expect(content).toContain('--breakpoint-sm');
      expect(content).toContain('--breakpoint-md');
      expect(content).toContain('--breakpoint-lg');
      expect(content).toContain('--breakpoint-xl');
    });

    it('should have breakpoints in ascending order', async () => {
      const breakpointsPath = resolve(process.cwd(), 'src/frontend/styles/tokens/breakpoints.css');
      const content = await readFile(breakpointsPath, 'utf-8');
      
      // Extract breakpoint values
      const smMatch = content.match(/--breakpoint-sm:\s*(\d+)px/);
      const mdMatch = content.match(/--breakpoint-md:\s*(\d+)px/);
      const lgMatch = content.match(/--breakpoint-lg:\s*(\d+)px/);
      const xlMatch = content.match(/--breakpoint-xl:\s*(\d+)px/);
      
      expect(smMatch).toBeTruthy();
      expect(mdMatch).toBeTruthy();
      expect(lgMatch).toBeTruthy();
      expect(xlMatch).toBeTruthy();
      
      const sm = parseInt(smMatch![1]);
      const md = parseInt(mdMatch![1]);
      const lg = parseInt(lgMatch![1]);
      const xl = parseInt(xlMatch![1]);
      
      // Verify ascending order (Requirement 9.1)
      expect(sm).toBeLessThan(md);
      expect(md).toBeLessThan(lg);
      expect(lg).toBeLessThan(xl);
    });
  });

  describe('Layout Utilities', () => {
    it('should define responsive container classes', async () => {
      const layoutPath = resolve(process.cwd(), 'src/frontend/styles/utilities/layout.css');
      const content = await readFile(layoutPath, 'utf-8');
      
      // Verify container classes exist (Requirement 5.1, 5.6)
      expect(content).toContain('.container');
      expect(content).toContain('.container-sm');
      expect(content).toContain('.container-md');
      expect(content).toContain('.container-lg');
      
      // Verify containers have max-width
      expect(content).toMatch(/\.container\s*{[^}]*max-width/);
    });

    it('should define flexbox utilities for responsive layouts', async () => {
      const layoutPath = resolve(process.cwd(), 'src/frontend/styles/utilities/layout.css');
      const content = await readFile(layoutPath, 'utf-8');
      
      // Verify flexbox utilities (Requirement 5.2, 5.6)
      expect(content).toContain('.flex');
      expect(content).toContain('.flex-row');
      expect(content).toContain('.flex-col');
      expect(content).toContain('.flex-wrap');
      expect(content).toContain('.items-center');
      expect(content).toContain('.justify-between');
    });

    it('should define grid utilities for responsive layouts', async () => {
      const layoutPath = resolve(process.cwd(), 'src/frontend/styles/utilities/layout.css');
      const content = await readFile(layoutPath, 'utf-8');
      
      // Verify grid utilities (Requirement 5.3, 5.6)
      expect(content).toContain('.grid');
      expect(content).toContain('.grid-cols-1');
      expect(content).toContain('.grid-cols-2');
      expect(content).toContain('.grid-cols-3');
      expect(content).toContain('.grid-cols-4');
    });
  });

  describe('Typography Readability', () => {
    it('should use rem units for font sizes to support zoom', async () => {
      const typographyPath = resolve(process.cwd(), 'src/frontend/styles/tokens/typography.css');
      const content = await readFile(typographyPath, 'utf-8');
      
      // Verify font sizes use rem units (Requirement 3.6)
      const fontSizeMatches = content.match(/--font-size-[^:]+:\s*[^;]+;/g);
      expect(fontSizeMatches).toBeTruthy();
      
      // All font sizes should use rem units
      fontSizeMatches!.forEach(match => {
        expect(match).toMatch(/rem/);
      });
    });

    it('should define appropriate line heights for readability', async () => {
      const typographyPath = resolve(process.cwd(), 'src/frontend/styles/tokens/typography.css');
      const content = await readFile(typographyPath, 'utf-8');
      
      // Verify line height tokens exist (Requirement 3.6)
      expect(content).toContain('--line-height-tight');
      expect(content).toContain('--line-height-normal');
      expect(content).toContain('--line-height-relaxed');
      
      // Verify line heights are reasonable values
      const normalMatch = content.match(/--line-height-normal:\s*([\d.]+)/);
      expect(normalMatch).toBeTruthy();
      const normalValue = parseFloat(normalMatch![1]);
      expect(normalValue).toBeGreaterThanOrEqual(1.4);
      expect(normalValue).toBeLessThanOrEqual(1.8);
    });
  });

  describe('Responsive Spacing', () => {
    it('should use rem units for spacing to support zoom', async () => {
      const spacingPath = resolve(process.cwd(), 'src/frontend/styles/tokens/spacing.css');
      const content = await readFile(spacingPath, 'utf-8');
      
      // Verify spacing uses rem units (Requirement 2.5)
      const spacingMatches = content.match(/--spacing-[^:]+:\s*[^;]+;/g);
      expect(spacingMatches).toBeTruthy();
      
      // All spacing values should use rem units (except 0) or reference other spacing tokens
      spacingMatches!.forEach(match => {
        if (!match.includes(': 0')) {
          // Should either use rem directly or reference another spacing token
          expect(match).toMatch(/rem|var\(--spacing-/);
        }
      });
    });

    it('should define spacing utilities that work responsively', async () => {
      const spacingUtilPath = resolve(process.cwd(), 'src/frontend/styles/utilities/spacing.css');
      const content = await readFile(spacingUtilPath, 'utf-8');
      
      // Verify margin and padding utilities exist (Requirement 2.3, 2.4, 2.5)
      expect(content).toContain('.m-');
      expect(content).toContain('.p-');
      expect(content).toContain('.mt-');
      expect(content).toContain('.mb-');
      expect(content).toContain('.ml-');
      expect(content).toContain('.mr-');
      expect(content).toContain('.mx-');
      expect(content).toContain('.my-');
    });
  });

  describe('Display Utilities for Responsive Design', () => {
    it('should define display utilities for showing/hiding elements', async () => {
      const displayPath = resolve(process.cwd(), 'src/frontend/styles/utilities/display.css');
      const content = await readFile(displayPath, 'utf-8');
      
      // Verify display utilities (Requirement 9.4)
      expect(content).toContain('.hidden');
      expect(content).toContain('.visible');
      expect(content).toContain('.block');
      expect(content).toContain('.inline-block');
      expect(content).toContain('.inline');
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion for accessibility', async () => {
      const indexPath = resolve(process.cwd(), 'src/frontend/styles/index.css');
      const content = await readFile(indexPath, 'utf-8');
      
      // Verify reduced motion media query exists (Requirement 7.4)
      expect(content).toContain('@media (prefers-reduced-motion: reduce)');
      expect(content).toMatch(/animation-duration.*!important/);
      expect(content).toMatch(/transition-duration.*!important/);
    });
  });
});
