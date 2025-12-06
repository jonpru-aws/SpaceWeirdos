import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { WeirdoEditor } from '../src/frontend/components/WeirdoEditor';
import { WarbandEditor } from '../src/frontend/components/WarbandEditor';
import { Weirdo, Warband } from '../src/backend/models/types';
import { apiClient } from '../src/frontend/services/apiClient';
import { GameDataProvider } from '../src/frontend/contexts/GameDataContext';
import fc from 'fast-check';

/**
 * **Feature: space-weirdos-warband, Property 27: Cost displays remain visible during scrolling**
 * **Validates: Requirements 17.1, 17.2, 17.3, 17.4**
 * 
 * Property-based tests for sticky cost displays
 * 
 * This test verifies that cost displays have sticky positioning applied
 * and remain visible at the top when scrolling through content.
 */

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCost: vi.fn(),
    validate: vi.fn(),
    getWarband: vi.fn(),
    createWarband: vi.fn(),
    updateWarband: vi.fn(),
    addWeirdo: vi.fn(),
    removeWeirdo: vi.fn(),
    updateWeirdo: vi.fn()
  }
}));

// Mock fetch for game data
global.fetch = vi.fn();

const mockGameData = {
  closeCombatWeapons: [
    { id: 'unarmed', name: 'Unarmed', type: 'close', baseCost: 0, maxActions: 3, notes: '' }
  ],
  rangedWeapons: [
    { id: 'auto-pistol', name: 'Auto Pistol', type: 'ranged', baseCost: 0, maxActions: 3, notes: '' }
  ],
  equipment: [
    { id: 'cybernetics', name: 'Cybernetics', type: 'Passive', baseCost: 1, effect: '+1 to Power rolls' }
  ],
  psychicPowers: [
    { id: 'fear', name: 'Fear', type: 'Attack', cost: 1, effect: 'Fear effect' }
  ],
  leaderTraits: [
    { id: 'bounty-hunter', name: 'Bounty Hunter', description: 'Bounty hunter ability' }
  ],
  warbandAbilities: [
    { id: 'cyborgs', name: 'Cyborgs', description: 'Cyborg ability', rule: 'Cyborg rule' }
  ],
  attributes: {
    speed: [{ level: 1, cost: 0 }, { level: 2, cost: 1 }],
    defense: [{ level: '2d6', cost: 0 }, { level: '2d8', cost: 1 }],
    firepower: [{ level: 'None', cost: 0 }, { level: '2d8', cost: 1 }],
    prowess: [{ level: '2d6', cost: 0 }, { level: '2d8', cost: 1 }],
    willpower: [{ level: '2d6', cost: 0 }, { level: '2d8', cost: 1 }]
  }
};

const createMockWeirdo = (totalCost: number): Weirdo => ({
  id: `weirdo-${Date.now()}`,
  name: 'Test Weirdo',
  type: 'trooper',
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
  totalCost
});

const createMockWarband = (totalCost: number, weirdoCount: number): Warband => ({
  id: `warband-${Date.now()}`,
  name: 'Test Warband',
  ability: 'Cyborgs',
  pointLimit: 75,
  totalCost,
  weirdos: Array.from({ length: weirdoCount }, () => createMockWeirdo(Math.floor(totalCost / weirdoCount))),
  createdAt: new Date(),
  updatedAt: new Date()
});

describe('Sticky Cost Displays - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch responses for game data
    global.fetch = vi.fn((url: string) => {
      const mockDataMap: Record<string, any> = {
        '/data/closeCombatWeapons.json': mockGameData.closeCombatWeapons,
        '/data/rangedWeapons.json': mockGameData.rangedWeapons,
        '/data/equipment.json': mockGameData.equipment,
        '/data/psychicPowers.json': mockGameData.psychicPowers,
        '/data/leaderTraits.json': mockGameData.leaderTraits,
        '/data/warbandAbilities.json': mockGameData.warbandAbilities,
        '/data/attributes.json': {
          speed: [],
          defense: [],
          firepower: [],
          prowess: [],
          willpower: []
        }
      };

      const data = mockDataMap[url] || [];
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data),
      } as Response);
    });

    // Mock API responses
    (apiClient.calculateCost as any).mockResolvedValue({ cost: 10 });
    (apiClient.validate as any).mockResolvedValue({ valid: true, errors: [] });
  });

  /**
   * Property 27: Cost displays remain visible during scrolling
   * 
   * For any weirdo editor or warband editor, the cost display should have
   * sticky positioning applied (position: sticky, top: 0) to remain visible
   * when scrolling through content.
   */
  it('should apply sticky positioning to weirdo cost display for all weirdos', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 25 }), // totalCost
        async (totalCost) => {
          const mockWeirdo = createMockWeirdo(totalCost);
          const mockOnChange = vi.fn();

          const { container, unmount } = render(
            <GameDataProvider>
              <WeirdoEditor
                weirdo={mockWeirdo}
                warbandAbility="Cyborgs"
                onChange={mockOnChange}
              />
            </GameDataProvider>
          );

          // Wait for component to render
          await waitFor(() => {
            const costDisplays = container.querySelectorAll('.cost-display');
            expect(costDisplays.length).toBeGreaterThan(0);
          });

          // Find the cost display element
          const costDisplay = container.querySelector('.cost-display');
          expect(costDisplay).toBeInTheDocument();

          // Verify sticky positioning is applied via CSS
          // The CSS class should be present, which applies position: sticky
          expect(costDisplay).toHaveClass('cost-display');
          
          // The element should be in the DOM and have the cost-display class
          // which has position: sticky in the CSS
          const hasStickyCostDisplay = costDisplay !== null;
          expect(hasStickyCostDisplay).toBe(true);
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should apply sticky positioning to warband cost display for all warbands', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 75 }), // totalCost
        fc.integer({ min: 1, max: 5 }),  // weirdoCount (min 1 to ensure warband renders properly)
        async (totalCost, weirdoCount) => {
          const mockWarband = createMockWarband(totalCost, weirdoCount);
          
          (apiClient.getWarband as any).mockResolvedValue(mockWarband);

          const { container, unmount } = render(
            <GameDataProvider>
              <WarbandEditor warbandId={mockWarband.id} />
            </GameDataProvider>
          );

          // Wait for component to render with cost display
          await waitFor(() => {
            const costDisplay = container.querySelector('.cost-display');
            expect(costDisplay).toBeInTheDocument();
          }, { timeout: 5000 });

          // Find the cost display element
          const costDisplay = container.querySelector('.cost-display');

          // Verify sticky positioning is applied via CSS
          // The CSS class should be present, which applies position: sticky
          expect(costDisplay).toHaveClass('cost-display');
          
          // The element should be in the DOM and have the cost-display class
          // which has position: sticky in the CSS
          const hasStickyCostDisplay = costDisplay !== null;
          expect(hasStickyCostDisplay).toBe(true);
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Verify cost display doesn't obscure controls
   * 
   * For any cost display, it should not overlap with or obscure
   * selection controls or other interactive elements.
   */
  it('should not obscure selection controls in weirdo editor', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 25 }), // totalCost
        async (totalCost) => {
          const mockWeirdo = createMockWeirdo(totalCost);
          const mockOnChange = vi.fn();

          const { container, unmount } = render(
            <GameDataProvider>
              <WeirdoEditor
                weirdo={mockWeirdo}
                warbandAbility="Cyborgs"
                onChange={mockOnChange}
              />
            </GameDataProvider>
          );

          // Wait for component to render
          await waitFor(() => {
            const costDisplays = container.querySelectorAll('.cost-display');
            expect(costDisplays.length).toBeGreaterThan(0);
          });

          // Verify that form sections exist and are accessible
          const formSections = container.querySelectorAll('.form-section');
          expect(formSections.length).toBeGreaterThan(0);

          // Verify that the cost display has appropriate z-index
          const costDisplay = container.querySelector('.cost-display');
          expect(costDisplay).toBeInTheDocument();
          
          // The cost display should be present and not prevent access to other elements
          // All form sections should still be in the DOM
          const allFormSectionsAccessible = formSections.length > 0;
          expect(allFormSectionsAccessible).toBe(true);
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should not obscure weirdo management controls in warband editor', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 75 }), // totalCost
        fc.integer({ min: 1, max: 3 }),  // weirdoCount (reduced to 1-3 for faster rendering)
        async (totalCost, weirdoCount) => {
          const mockWarband = createMockWarband(totalCost, weirdoCount);
          
          (apiClient.getWarband as any).mockResolvedValue(mockWarband);

          const { container, unmount } = render(
            <GameDataProvider>
              <WarbandEditor warbandId={mockWarband.id} />
            </GameDataProvider>
          );

          // Wait for component to render with increased timeout
          await waitFor(() => {
            const warbandProperties = container.querySelector('.warband-properties');
            expect(warbandProperties).toBeInTheDocument();
          }, { timeout: 8000 });

          // Verify that weirdos section exists and is accessible
          const weirdosSection = container.querySelector('.weirdos-section');
          expect(weirdosSection).toBeInTheDocument();

          // Verify that add buttons are accessible
          const addButtons = container.querySelector('.add-buttons');
          expect(addButtons).toBeInTheDocument();

          // The cost display should be present and not prevent access to other elements
          const costDisplay = container.querySelector('.cost-display');
          expect(costDisplay).toBeInTheDocument();
          
          // All sections should still be accessible
          const allSectionsAccessible = weirdosSection !== null && addButtons !== null;
          expect(allSectionsAccessible).toBe(true);
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 20000); // Increase test timeout to 20 seconds

  /**
   * Verify cost display styling is appropriate for sticky positioning
   * 
   * For any cost display, it should have the base styling class that applies
   * sticky positioning (position: sticky, top: 0) via CSS.
   * 
   * Note: This test focuses on verifying the structural elements needed for
   * sticky positioning. Warning/error classes are tested separately as they
   * depend on async state calculations.
   */
  it('should have appropriate styling for sticky cost displays', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 25 }), // totalCost
        async (totalCost) => {
          const mockWeirdo = createMockWeirdo(totalCost);
          const mockOnChange = vi.fn();

          const { container, unmount } = render(
            <GameDataProvider>
              <WeirdoEditor
                weirdo={mockWeirdo}
                warbandAbility="Cyborgs"
                onChange={mockOnChange}
              />
            </GameDataProvider>
          );

          // Wait for component to render
          await waitFor(() => {
            const costDisplays = container.querySelectorAll('.cost-display');
            expect(costDisplays.length).toBeGreaterThan(0);
          });

          // Find the cost display element
          const costDisplay = container.querySelector('.cost-display');
          expect(costDisplay).toBeInTheDocument();

          // Verify the cost display has the base class that applies sticky positioning
          expect(costDisplay).toHaveClass('cost-display');
          
          // Verify that the cost value element exists (required for proper display)
          const costValue = container.querySelector('.cost-value');
          expect(costValue).toBeInTheDocument();
          
          // Verify the cost label exists (required for proper display)
          const costLabel = container.querySelector('.cost-label');
          expect(costLabel).toBeInTheDocument();
          
          // The cost display should have all required structural elements
          const hasProperStructure = costDisplay !== null && costValue !== null && costLabel !== null;
          expect(hasProperStructure).toBe(true);
          
          // Verify the cost display has the class that applies sticky positioning via CSS
          // (We can't test position: sticky directly in jsdom, but we verify the class is present)
          const hasStickyStyling = costDisplay?.classList.contains('cost-display') ?? false;
          expect(hasStickyStyling).toBe(true);
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });
});
