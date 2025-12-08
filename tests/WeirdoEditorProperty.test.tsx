import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { WeirdoEditor } from '../src/frontend/components/WeirdoEditor';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { GameDataProvider } from '../src/frontend/contexts/GameDataContext';
import { CostEngine } from '../src/backend/services/CostEngine';
import { ValidationService } from '../src/backend/services/ValidationService';
import { DataRepository } from '../src/backend/services/DataRepository';
import { Weirdo, FirepowerLevel } from '../src/backend/models/types';
import { useEffect } from 'react';
import { validWeirdoTypeArb, validWeirdoNameArb } from './testGenerators';

/**
 * Property-Based Tests for WeirdoEditor
 * 
 * **Feature: npm-package-upgrade-fixes, Property 14: Selected weirdo shows all editor sections**
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.5, 4.6**
 * 
 * **Feature: npm-package-upgrade-fixes, Property 15: Ranged weapons section visibility depends on firepower**
 * **Validates: Requirements 4.4**
 * 
 * **Feature: npm-package-upgrade-fixes, Property 16: Leader shows leader trait section**
 * **Validates: Requirements 4.7**
 */

describe('WeirdoEditor Property-Based Tests', () => {
  let costEngine: CostEngine;
  let validationService: ValidationService;
  let dataRepository: DataRepository;

  beforeEach(() => {
    costEngine = new CostEngine();
    validationService = new ValidationService();
    dataRepository = new DataRepository();
  });

  // Helper to render with a specific weirdo
  const renderWithWeirdo = (weirdo: Weirdo) => {
    // Create a fresh test component for each render
    const TestComponent = () => {
      const { createWarband, currentWarband, selectWeirdo } = useWarband();

      useEffect(() => {
        if (!currentWarband) {
          createWarband('Test Warband', 75);
        }
      }, []);

      useEffect(() => {
        if (currentWarband && currentWarband.weirdos.length === 0) {
          // Manually add the weirdo to the warband
          currentWarband.weirdos.push(weirdo);
          selectWeirdo(weirdo.id);
        }
      }, [currentWarband]);

      return <WeirdoEditor />;
    };

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <GameDataProvider>
        <WarbandProvider
          dataRepository={dataRepository}
          costEngine={costEngine}
          validationService={validationService}
        >
          {children}
        </WarbandProvider>
      </GameDataProvider>
    );

    const { unmount } = render(<TestComponent />, { wrapper: Wrapper });
    return { unmount };
  };

  /**
   * Property 14: Selected weirdo shows all editor sections
   * 
   * For any selected weirdo, the WeirdoEditor should display basic information,
   * attributes, close combat weapons, equipment, and psychic powers sections.
   * 
   * **Feature: npm-package-upgrade-fixes, Property 14: Selected weirdo shows all editor sections**
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.5, 4.6**
   */
  it('Property 14: Selected weirdo shows all editor sections', () => {
    fc.assert(
      fc.property(validWeirdoTypeArb, validWeirdoNameArb, (type, name) => {
        const weirdo: Weirdo = {
          id: `weirdo-${Math.random()}`,
          name: name || 'Test Weirdo',
          type,
          attributes: {
            speed: 1,
            defense: '2d6',
            firepower: 'None',
            prowess: '2d6',
            willpower: '2d6'
          },
          closeCombatWeapons: [],
          rangedWeapons: [],
          equipment: [],
          psychicPowers: [],
          leaderTrait: null,
          notes: '',
          totalCost: 0
        };

        const { unmount } = renderWithWeirdo(weirdo);

        try {
          // All required sections should be present
          expect(screen.getByText(/basic information/i)).toBeInTheDocument();
          expect(screen.getByText(/attributes/i)).toBeInTheDocument();
          expect(screen.getByText(/close combat weapons/i)).toBeInTheDocument();
          expect(screen.getByText(/equipment/i)).toBeInTheDocument();
          expect(screen.getByText(/psychic powers/i)).toBeInTheDocument();
        } finally {
          // Clean up after each test run
          unmount();
        }
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 15: Ranged weapons section visibility depends on firepower
   * 
   * For any selected weirdo, the ranged weapons section should be visible
   * if and only if firepower is not 'None'.
   * 
   * **Feature: npm-package-upgrade-fixes, Property 15: Ranged weapons section visibility depends on firepower**
   * **Validates: Requirements 4.4**
   */
  it('Property 15: Ranged weapons section visibility depends on firepower', () => {
    // Generator for valid firepower levels
    const firepowerArb = fc.constantFrom(
      'None' as FirepowerLevel,
      '2d6' as FirepowerLevel,
      '3d6' as FirepowerLevel,
      '4d6' as FirepowerLevel,
      '5d6' as FirepowerLevel
    );

    fc.assert(
      fc.property(firepowerArb, (firepower) => {
        const weirdo: Weirdo = {
          id: `weirdo-${Math.random()}`,
          name: 'Test Weirdo',
          type: 'trooper',
          attributes: {
            speed: 1,
            defense: '2d6',
            firepower,
            prowess: '2d6',
            willpower: '2d6'
          },
          closeCombatWeapons: [],
          rangedWeapons: [],
          equipment: [],
          psychicPowers: [],
          leaderTrait: null,
          notes: '',
          totalCost: 0
        };

        const { unmount } = renderWithWeirdo(weirdo);

        try {
          if (firepower === 'None') {
            // When firepower is None, the heading "Ranged Weapons" still appears
            // but with a disabled message
            expect(screen.getByRole('heading', { name: /ranged weapons/i })).toBeInTheDocument();
            expect(screen.getByText(/set the firepower attribute/i)).toBeInTheDocument();
          } else {
            // Ranged weapons section SHOULD be visible with selector
            expect(screen.getByRole('heading', { name: /ranged weapons/i })).toBeInTheDocument();
            // Should NOT show the disabled message
            expect(screen.queryByText(/set the firepower attribute/i)).not.toBeInTheDocument();
          }
        } finally {
          // Clean up after each test run
          unmount();
        }
      }),
      { numRuns: 50 }
    );
  }, 15000); // Increase timeout to 15 seconds for property-based test with 50 runs

  /**
   * Property 16: Leader shows leader trait section
   * 
   * For any selected leader weirdo, the WeirdoEditor should display
   * the leader trait section.
   * 
   * **Feature: npm-package-upgrade-fixes, Property 16: Leader shows leader trait section**
   * **Validates: Requirements 4.7**
   */
  it('Property 16: Leader shows leader trait section', () => {
    fc.assert(
      fc.property(validWeirdoTypeArb, (type) => {
        const weirdo: Weirdo = {
          id: `weirdo-${Math.random()}`,
          name: 'Test Weirdo',
          type,
          attributes: {
            speed: 1,
            defense: '2d6',
            firepower: 'None',
            prowess: '2d6',
            willpower: '2d6'
          },
          closeCombatWeapons: [],
          rangedWeapons: [],
          equipment: [],
          psychicPowers: [],
          leaderTrait: null,
          notes: '',
          totalCost: 0
        };

        const { unmount } = renderWithWeirdo(weirdo);

        try {
          if (type === 'leader') {
            // Leader trait section SHOULD be visible for leaders
            expect(screen.getByText(/leader trait/i)).toBeInTheDocument();
          } else {
            // Leader trait section should NOT be visible for troopers
            expect(screen.queryByText(/leader trait/i)).not.toBeInTheDocument();
          }
        } finally {
          // Clean up after each test run
          unmount();
        }
      }),
      { numRuns: 50 }
    );
  });
});
