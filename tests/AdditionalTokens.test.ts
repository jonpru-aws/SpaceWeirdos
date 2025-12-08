/**
 * Additional Token Definition Tests
 * 
 * Verifies that shadow, z-index, transition, and border tokens are properly defined
 * with valid CSS syntax and follow expected patterns.
 * 
 * Requirements: 6.1-6.4, 7.1-7.3, 8.1-8.2
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

describe('Shadow Token Definitions', () => {
  let shadowTokens: string;

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

  // Helper to validate shadow CSS syntax
  const isValidShadow = (value: string): boolean => {
    // "none" is valid
    if (value === 'none') return true;
    
    // Shadow format: <offset-x> <offset-y> [<blur-radius>] [<spread-radius>] <color>
    // Can have multiple shadows separated by commas
    // Values can be 0 or have px units
    const shadowPattern = /^(-?\d+(?:px)?\s+){2,4}rgba?\([^)]+\)(\s*,\s*(-?\d+(?:px)?\s+){2,4}rgba?\([^)]+\))*$/;
    return shadowPattern.test(value);
  };

  beforeAll(async () => {
    const shadowTokensPath = resolve(process.cwd(), 'src/frontend/styles/tokens/shadows.css');
    shadowTokens = await readFile(shadowTokensPath, 'utf-8');
  });

  describe('Shadow Token Existence', () => {
    it('should define all shadow tokens', () => {
      const tokens = extractTokens(shadowTokens);
      
      const shadowLevels = ['none', 'sm', 'md', 'lg', 'xl'];
      shadowLevels.forEach(level => {
        const tokenName = `--shadow-${level}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });
  });

  describe('Shadow Token Syntax', () => {
    it('should have valid CSS shadow syntax', () => {
      const tokens = extractTokens(shadowTokens);
      
      const shadowLevels = ['none', 'sm', 'md', 'lg', 'xl'];
      shadowLevels.forEach(level => {
        const tokenName = `--shadow-${level}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidShadow(value!), `${tokenName} should have valid CSS shadow syntax, got: ${value}`).toBe(true);
      });
    });

    it('should have shadow-none equal to "none"', () => {
      const tokens = extractTokens(shadowTokens);
      const noneValue = tokens.get('--shadow-none');
      expect(noneValue).toBe('none');
    });

    it('should use rgba colors for shadows', () => {
      const tokens = extractTokens(shadowTokens);
      
      const shadowLevels = ['sm', 'md', 'lg', 'xl'];
      shadowLevels.forEach(level => {
        const tokenName = `--shadow-${level}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(value!).toContain('rgba');
      });
    });
  });
});

describe('Z-Index Token Definitions', () => {
  let zIndexTokens: string;

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

  // Helper to check if value is a valid integer
  const isValidInteger = (value: string): boolean => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num.toString() === value;
  };

  beforeAll(async () => {
    const zIndexTokensPath = resolve(process.cwd(), 'src/frontend/styles/tokens/z-index.css');
    zIndexTokens = await readFile(zIndexTokensPath, 'utf-8');
  });

  describe('Z-Index Token Existence', () => {
    it('should define all z-index tokens', () => {
      const tokens = extractTokens(zIndexTokens);
      
      const zIndexLevels = ['base', 'sticky', 'dropdown', 'overlay', 'modal', 'tooltip'];
      zIndexLevels.forEach(level => {
        const tokenName = `--z-index-${level}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });
  });

  describe('Z-Index Token Values', () => {
    it('should have valid integer values', () => {
      const tokens = extractTokens(zIndexTokens);
      
      const zIndexLevels = ['base', 'sticky', 'dropdown', 'overlay', 'modal', 'tooltip'];
      zIndexLevels.forEach(level => {
        const tokenName = `--z-index-${level}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidInteger(value!), `${tokenName} should be a valid integer, got: ${value}`).toBe(true);
      });
    });

    it('should have z-index-base equal to 0', () => {
      const tokens = extractTokens(zIndexTokens);
      const baseValue = tokens.get('--z-index-base');
      expect(baseValue).toBe('0');
    });

    it('should follow ascending order', () => {
      const tokens = extractTokens(zIndexTokens);
      
      const zIndexLevels = ['base', 'sticky', 'dropdown', 'overlay', 'modal', 'tooltip'];
      const values = zIndexLevels.map(level => {
        const tokenName = `--z-index-${level}`;
        const value = tokens.get(tokenName);
        return parseInt(value!, 10);
      });
      
      // Check that each value is greater than the previous
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });

    it('should have clear separation between levels', () => {
      const tokens = extractTokens(zIndexTokens);
      
      const zIndexLevels = ['base', 'sticky', 'dropdown', 'overlay', 'modal', 'tooltip'];
      const values = zIndexLevels.map(level => {
        const tokenName = `--z-index-${level}`;
        const value = tokens.get(tokenName);
        return parseInt(value!, 10);
      });
      
      // Check that there's at least a difference of 10 between consecutive levels (except base)
      for (let i = 2; i < values.length; i++) {
        const difference = values[i] - values[i - 1];
        expect(difference).toBeGreaterThanOrEqual(10);
      }
    });
  });
});

describe('Transition Token Definitions', () => {
  let transitionTokens: string;

  // Helper to extract CSS custom properties from the :root block only
  const extractTokens = (content: string): Map<string, string> => {
    const tokens = new Map<string, string>();
    
    // Extract only from the first :root block (before media queries)
    const rootMatch = content.match(/:root\s*\{([^}]+)\}/);
    if (rootMatch) {
      const rootContent = rootMatch[1];
      const regex = /--([a-z0-9-]+):\s*([^;]+);/g;
      let match;
      
      while ((match = regex.exec(rootContent)) !== null) {
        tokens.set(`--${match[1]}`, match[2].trim());
      }
    }
    
    return tokens;
  };

  // Helper to validate timing value (ms or s)
  const isValidTiming = (value: string): boolean => {
    return /^\d+m?s$/.test(value);
  };

  // Helper to validate easing function
  const isValidEasing = (value: string): boolean => {
    // Check for keyword values
    if (['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'].includes(value)) {
      return true;
    }
    // Check for cubic-bezier format
    return /^cubic-bezier\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)$/.test(value);
  };

  beforeAll(async () => {
    const transitionTokensPath = resolve(process.cwd(), 'src/frontend/styles/tokens/transitions.css');
    transitionTokens = await readFile(transitionTokensPath, 'utf-8');
  });

  describe('Transition Duration Tokens', () => {
    it('should define all transition duration tokens', () => {
      const tokens = extractTokens(transitionTokens);
      
      const durations = ['fast', 'normal', 'slow'];
      durations.forEach(duration => {
        const tokenName = `--transition-${duration}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid timing values', () => {
      const tokens = extractTokens(transitionTokens);
      
      const durations = ['fast', 'normal', 'slow'];
      durations.forEach(duration => {
        const tokenName = `--transition-${duration}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidTiming(value!), `${tokenName} should have valid timing value (ms or s), got: ${value}`).toBe(true);
      });
    });

    it('should use milliseconds for duration values', () => {
      const tokens = extractTokens(transitionTokens);
      
      const durations = ['fast', 'normal', 'slow'];
      durations.forEach(duration => {
        const tokenName = `--transition-${duration}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(value!).toContain('ms');
      });
    });

    it('should have durations increase monotonically', () => {
      const tokens = extractTokens(transitionTokens);
      
      const durations = ['fast', 'normal', 'slow'];
      const values = durations.map(duration => {
        const tokenName = `--transition-${duration}`;
        const value = tokens.get(tokenName);
        return parseInt(value!.replace('ms', ''), 10);
      });
      
      // Check that each value is greater than the previous
      // Note: This tests the base values, not the reduced-motion overrides
      for (let i = 1; i < values.length; i++) {
        expect(values[i], `${durations[i]} (${values[i]}ms) should be greater than ${durations[i-1]} (${values[i-1]}ms)`).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('Easing Function Tokens', () => {
    it('should define all easing function tokens', () => {
      const tokens = extractTokens(transitionTokens);
      
      const easings = ['linear', 'in', 'out', 'in-out'];
      easings.forEach(easing => {
        const tokenName = `--easing-${easing}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid easing function values', () => {
      const tokens = extractTokens(transitionTokens);
      
      const easings = ['linear', 'in', 'out', 'in-out'];
      easings.forEach(easing => {
        const tokenName = `--easing-${easing}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidEasing(value!), `${tokenName} should have valid easing function, got: ${value}`).toBe(true);
      });
    });

    it('should have easing-linear equal to "linear"', () => {
      const tokens = extractTokens(transitionTokens);
      const linearValue = tokens.get('--easing-linear');
      expect(linearValue).toBe('linear');
    });
  });
});

describe('Border Token Definitions', () => {
  let borderTokens: string;

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

  // Helper to validate border radius value
  const isValidBorderRadius = (value: string): boolean => {
    return /^(\d+(\.\d+)?rem|\d+px|0)$/.test(value);
  };

  // Helper to validate border width value
  const isValidBorderWidth = (value: string): boolean => {
    return /^\d+px$/.test(value);
  };

  beforeAll(async () => {
    const borderTokensPath = resolve(process.cwd(), 'src/frontend/styles/tokens/borders.css');
    borderTokens = await readFile(borderTokensPath, 'utf-8');
  });

  describe('Border Radius Tokens', () => {
    it('should define all border radius tokens', () => {
      const tokens = extractTokens(borderTokens);
      
      const radiusSizes = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
      radiusSizes.forEach(size => {
        const tokenName = `--border-radius-${size}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid border radius values', () => {
      const tokens = extractTokens(borderTokens);
      
      const radiusSizes = ['none', 'sm', 'md', 'lg', 'xl'];
      radiusSizes.forEach(size => {
        const tokenName = `--border-radius-${size}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidBorderRadius(value!), `${tokenName} should have valid border radius value, got: ${value}`).toBe(true);
      });
    });

    it('should have border-radius-none equal to 0', () => {
      const tokens = extractTokens(borderTokens);
      const noneValue = tokens.get('--border-radius-none');
      expect(noneValue).toBe('0');
    });

    it('should have border-radius-full as large value for circular shapes', () => {
      const tokens = extractTokens(borderTokens);
      const fullValue = tokens.get('--border-radius-full');
      expect(fullValue, '--border-radius-full should exist').toBeDefined();
      // Should be a very large value like 9999px or 50%
      expect(fullValue!).toMatch(/^\d{3,}px$/);
    });

    it('should use rem units for border radius (except none and full)', () => {
      const tokens = extractTokens(borderTokens);
      
      const radiusSizes = ['sm', 'md', 'lg', 'xl'];
      radiusSizes.forEach(size => {
        const tokenName = `--border-radius-${size}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(value!).toContain('rem');
      });
    });
  });

  describe('Border Width Tokens', () => {
    it('should define all border width tokens', () => {
      const tokens = extractTokens(borderTokens);
      
      const widthSizes = ['thin', 'medium', 'thick'];
      widthSizes.forEach(size => {
        const tokenName = `--border-width-${size}`;
        expect(tokens.has(tokenName), `${tokenName} should be defined`).toBe(true);
      });
    });

    it('should have valid border width values', () => {
      const tokens = extractTokens(borderTokens);
      
      const widthSizes = ['thin', 'medium', 'thick'];
      widthSizes.forEach(size => {
        const tokenName = `--border-width-${size}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(isValidBorderWidth(value!), `${tokenName} should have valid border width value (px), got: ${value}`).toBe(true);
      });
    });

    it('should use px units for border width', () => {
      const tokens = extractTokens(borderTokens);
      
      const widthSizes = ['thin', 'medium', 'thick'];
      widthSizes.forEach(size => {
        const tokenName = `--border-width-${size}`;
        const value = tokens.get(tokenName);
        expect(value, `${tokenName} should exist`).toBeDefined();
        expect(value!).toContain('px');
      });
    });

    it('should have border widths increase monotonically', () => {
      const tokens = extractTokens(borderTokens);
      
      const widthSizes = ['thin', 'medium', 'thick'];
      const values = widthSizes.map(size => {
        const tokenName = `--border-width-${size}`;
        const value = tokens.get(tokenName);
        return parseInt(value!.replace('px', ''), 10);
      });
      
      // Check that each value is greater than the previous
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });
});
