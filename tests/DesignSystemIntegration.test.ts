/**
 * Design System Integration Tests
 * 
 * Verifies that the design system is properly integrated into the application
 * and that all CSS files load without errors.
 * 
 * Requirements: All (verifies design system integration)
 */

import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Design System Integration', () => {
  it('should import design system in main index.css', async () => {
    const indexCssPath = resolve(process.cwd(), 'src/frontend/index.css');
    const content = await readFile(indexCssPath, 'utf-8');
    
    // Verify design system is imported
    expect(content).toContain("@import './styles/index.css'");
  });

  it('should have design system index.css with all imports', async () => {
    const designSystemIndexPath = resolve(process.cwd(), 'src/frontend/styles/index.css');
    const content = await readFile(designSystemIndexPath, 'utf-8');
    
    // Verify all token imports
    expect(content).toContain("@import './tokens/colors.css'");
    expect(content).toContain("@import './tokens/spacing.css'");
    expect(content).toContain("@import './tokens/typography.css'");
    expect(content).toContain("@import './tokens/shadows.css'");
    expect(content).toContain("@import './tokens/borders.css'");
    expect(content).toContain("@import './tokens/transitions.css'");
    expect(content).toContain("@import './tokens/z-index.css'");
    expect(content).toContain("@import './tokens/breakpoints.css'");
    
    // Verify all base style imports
    expect(content).toContain("@import './base/reset.css'");
    expect(content).toContain("@import './base/buttons.css'");
    expect(content).toContain("@import './base/forms.css'");
    expect(content).toContain("@import './base/labels.css'");
    expect(content).toContain("@import './base/cards.css'");
    
    // Verify all utility imports
    expect(content).toContain("@import './utilities/spacing.css'");
    expect(content).toContain("@import './utilities/layout.css'");
    expect(content).toContain("@import './utilities/display.css'");
    expect(content).toContain("@import './utilities/text.css'");
    expect(content).toContain("@import './utilities/typography.css'");
    
    // Verify reduced motion support
    expect(content).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('should verify all design system files exist', async () => {
    const files = [
      'src/frontend/styles/index.css',
      'src/frontend/styles/tokens/colors.css',
      'src/frontend/styles/tokens/spacing.css',
      'src/frontend/styles/tokens/typography.css',
      'src/frontend/styles/tokens/shadows.css',
      'src/frontend/styles/tokens/borders.css',
      'src/frontend/styles/tokens/transitions.css',
      'src/frontend/styles/tokens/z-index.css',
      'src/frontend/styles/tokens/breakpoints.css',
      'src/frontend/styles/base/reset.css',
      'src/frontend/styles/base/buttons.css',
      'src/frontend/styles/base/forms.css',
      'src/frontend/styles/base/labels.css',
      'src/frontend/styles/base/cards.css',
      'src/frontend/styles/utilities/spacing.css',
      'src/frontend/styles/utilities/layout.css',
      'src/frontend/styles/utilities/display.css',
      'src/frontend/styles/utilities/text.css',
      'src/frontend/styles/utilities/typography.css',
    ];

    for (const file of files) {
      const filePath = resolve(process.cwd(), file);
      const content = await readFile(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    }
  });
});
