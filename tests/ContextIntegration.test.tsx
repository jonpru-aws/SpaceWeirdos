import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GameDataProvider } from '../src/frontend/contexts/GameDataContext';
import { WeirdoEditor } from '../src/frontend/components/WeirdoEditor';
import { Weirdo } from '../src/backend/models/types';

/**
 * Integration tests for Context usage in components
 * 
 * Tests that components properly consume GameDataContext
 * and handle loading/error states correctly.
 * 
 * Requirements: 11.4
 */

describe('Context Integration Tests', () => {
  const mockWeirdo: Weirdo = {
    id: 'test-weirdo',
    name: 'Test Weirdo',
    type: 'trooper',
    attributes: {
      speed: 1,
      defense: '2d6',
      firepower: 'None',
      prowess: '2d6',
      willpower: '2d6',
    },
    closeCombatWeapons: [],
    rangedWeapons: [],
    equipment: [],
    psychicPowers: [],
    leaderTrait: null,
    notes: '',
    totalCost: 10,
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock fetch for game data
    global.fetch = vi.fn();
  });

  /**
   * Test: WeirdoEditor consumes GameDataContext
   * Requirement: 11.4
   */
  it('should consume GameDataContext and display loading state', async () => {
    // Mock fetch to delay response
    vi.mocked(global.fetch).mockImplementation(() =>
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <GameDataProvider>
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility={null}
          onChange={() => {}}
        />
      </GameDataProvider>
    );

    // Should show loading state
    expect(screen.getByText(/loading game data/i)).toBeInTheDocument();
  });

  /**
   * Test: WeirdoEditor handles GameDataContext error
   * Requirement: 11.4
   */
  it('should handle GameDataContext error state', async () => {
    // Mock fetch to reject
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    render(
      <GameDataProvider>
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility={null}
          onChange={() => {}}
        />
      </GameDataProvider>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load game data/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: WeirdoEditor renders with GameDataContext data
   * Requirement: 11.4
   */
  it('should render WeirdoEditor with data from GameDataContext', async () => {
    // Mock successful fetch responses
    const mockGameData = {
      closeCombatWeapons: [
        { id: '1', name: 'Sword', cost: 2, rule: 'Sharp' },
      ],
      rangedWeapons: [
        { id: '2', name: 'Pistol', cost: 3, rule: 'Ranged' },
      ],
      equipment: [
        { id: '3', name: 'Armor', cost: 1, rule: 'Protective' },
      ],
      psychicPowers: [
        { id: '4', name: 'Telekinesis', cost: 2, rule: 'Move things' },
      ],
      leaderTraits: [
        { id: '5', name: 'Inspiring', effect: 'Boosts morale' },
      ],
      warbandAbilities: [],
      attributes: {
        speed: [],
        defense: [],
        firepower: [],
        prowess: [],
        willpower: [],
      },
    };

    vi.mocked(global.fetch).mockImplementation((url) => {
      const urlStr = url.toString();
      if (urlStr.includes('closeCombatWeapons')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.closeCombatWeapons),
        } as Response);
      }
      if (urlStr.includes('rangedWeapons')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.rangedWeapons),
        } as Response);
      }
      if (urlStr.includes('equipment')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.equipment),
        } as Response);
      }
      if (urlStr.includes('psychicPowers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.psychicPowers),
        } as Response);
      }
      if (urlStr.includes('leaderTraits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.leaderTraits),
        } as Response);
      }
      if (urlStr.includes('warbandAbilities')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.warbandAbilities),
        } as Response);
      }
      if (urlStr.includes('attributes')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.attributes),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <GameDataProvider>
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility={null}
          onChange={() => {}}
        />
      </GameDataProvider>
    );

    // Wait for data to load and component to render
    await waitFor(() => {
      expect(screen.queryByText(/loading game data/i)).not.toBeInTheDocument();
    });

    // Verify component rendered with weirdo data
    expect(screen.getByDisplayValue('Test Weirdo')).toBeInTheDocument();
  });

  /**
   * Test: Multiple components share same GameDataContext
   * Requirement: 11.4
   */
  it('should share GameDataContext data across multiple components', async () => {
    const mockGameData = {
      closeCombatWeapons: [{ id: '1', name: 'Sword', cost: 2, rule: 'Sharp' }],
      rangedWeapons: [],
      equipment: [],
      psychicPowers: [],
      leaderTraits: [],
      warbandAbilities: [],
      attributes: {
        speed: [],
        defense: [],
        firepower: [],
        prowess: [],
        willpower: [],
      },
    };

    let fetchCallCount = 0;
    vi.mocked(global.fetch).mockImplementation((url) => {
      fetchCallCount++;
      const urlStr = url.toString();
      if (urlStr.includes('closeCombatWeapons')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.closeCombatWeapons),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });

    const mockWeirdo2: Weirdo = {
      ...mockWeirdo,
      id: 'test-weirdo-2',
      name: 'Test Weirdo 2',
    };

    render(
      <GameDataProvider>
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility={null}
          onChange={() => {}}
        />
        <WeirdoEditor
          weirdo={mockWeirdo2}
          warbandAbility={null}
          onChange={() => {}}
        />
      </GameDataProvider>
    );

    // Wait for components to render
    await waitFor(() => {
      expect(screen.queryAllByText(/loading game data/i)).toHaveLength(0);
    });

    // Verify both components rendered
    expect(screen.getByDisplayValue('Test Weirdo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Weirdo 2')).toBeInTheDocument();

    // Verify fetch was called only once per resource (data is shared)
    // 7 resources: closeCombatWeapons, rangedWeapons, equipment, psychicPowers, leaderTraits, warbandAbilities, attributes
    expect(fetchCallCount).toBe(7);
  });
});
