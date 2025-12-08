import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validWarbandNameArb,
  validWeirdoNameArb,
  validPointLimitArb,
  validAttributesArb,
  validWeirdoArb,
  validWeirdosArrayArb,
  validWarbandArb
} from './testGenerators';

/**
 * Tests for Property-Based Test Generators
 * 
 * Verifies that generators produce valid data conforming to business rules.
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

describe('Test Generators', () => {
  /**
   * Requirement 10.1: Warband names must be non-empty strings (1-50 chars)
   */
  it('generates valid warband names', () => {
    fc.assert(
      fc.property(validWarbandNameArb, (name) => {
        expect(name.length).toBeGreaterThan(0);
        expect(name.length).toBeLessThanOrEqual(50);
        expect(name.trim().length).toBeGreaterThan(0);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Requirement 10.2: Weirdo names must be non-empty strings (1-30 chars)
   */
  it('generates valid weirdo names', () => {
    fc.assert(
      fc.property(validWeirdoNameArb, (name) => {
        expect(name.length).toBeGreaterThan(0);
        expect(name.length).toBeLessThanOrEqual(30);
        expect(name.trim().length).toBeGreaterThan(0);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Requirement 10.1: Point limits must be 75 or 125
   */
  it('generates valid point limits', () => {
    fc.assert(
      fc.property(validPointLimitArb, (limit) => {
        expect([75, 125]).toContain(limit);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Requirement 10.3: Attribute values must be within valid ranges
   */
  it('generates valid attributes', () => {
    fc.assert(
      fc.property(validAttributesArb, (attributes) => {
        expect(attributes.speed).toBeGreaterThanOrEqual(1);
        expect(attributes.speed).toBeLessThanOrEqual(6);
        expect(['2d6', '3d6', '4d6', '5d6']).toContain(attributes.defense);
        expect(['None', '2d6', '3d6', '4d6', '5d6']).toContain(attributes.firepower);
        expect(['2d6', '3d6', '4d6', '5d6']).toContain(attributes.prowess);
        expect(['2d6', '3d6', '4d6', '5d6']).toContain(attributes.willpower);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Requirement 10.4: Equipment respects limits (3 for leaders, 2 for troopers)
   */
  it('generates valid weirdos with equipment limits', () => {
    fc.assert(
      fc.property(validWeirdoArb, (weirdo) => {
        const maxEquipment = weirdo.type === 'leader' ? 3 : 2;
        expect(weirdo.equipment.length).toBeLessThanOrEqual(maxEquipment);
        expect(weirdo.name.length).toBeGreaterThan(0);
        expect(weirdo.name.length).toBeLessThanOrEqual(30);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Requirement 10.3: Max 1 leader per warband, max 10 weirdos total
   */
  it('generates valid weirdo arrays with leader constraint', () => {
    fc.assert(
      fc.property(validWeirdosArrayArb, (weirdos) => {
        const leaderCount = weirdos.filter(w => w.type === 'leader').length;
        expect(leaderCount).toBeLessThanOrEqual(1);
        expect(weirdos.length).toBeLessThanOrEqual(10);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Requirements: 10.1, 10.2, 10.3, 10.4
   * Complete warband validation
   */
  it('generates valid complete warbands', () => {
    fc.assert(
      fc.property(validWarbandArb, (warband) => {
        // Validate warband name
        expect(warband.name.length).toBeGreaterThan(0);
        expect(warband.name.length).toBeLessThanOrEqual(50);
        expect(warband.name.trim().length).toBeGreaterThan(0);
        
        // Validate point limit
        expect([75, 125]).toContain(warband.pointLimit);
        
        // Validate weirdos array
        expect(warband.weirdos.length).toBeLessThanOrEqual(10);
        
        // Validate max 1 leader
        const leaderCount = warband.weirdos.filter(w => w.type === 'leader').length;
        expect(leaderCount).toBeLessThanOrEqual(1);
        
        // Validate each weirdo
        warband.weirdos.forEach(weirdo => {
          expect(weirdo.name.length).toBeGreaterThan(0);
          expect(weirdo.name.length).toBeLessThanOrEqual(30);
          
          const maxEquipment = weirdo.type === 'leader' ? 3 : 2;
          expect(weirdo.equipment.length).toBeLessThanOrEqual(maxEquipment);
        });
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
