import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GameDataProvider, useGameData } from '../src/frontend/contexts/GameDataContext';
import { apiClient } from '../src/frontend/services/apiClient';

/**
 * Unit tests for GameDataContext
 * 
 * Tests data loading, error handling, and context provider functionality.
 * 
 * Requirements: 6.4
 */

// Test component that uses the hook
function TestConsumer() {
  const { data, loading, error } = useGameData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <div data-testid="close-combat-count">{data.closeCombatWeapons.length}</div>
      <div data-testid="ranged-count">{data.rangedWeapons.length}</div>
      <div data-testid="equipment-count">{data.equipment.length}</div>
    </div>
  );
}

describe('GameDataContext', () => {
  beforeEach(() => {
    // Reset fetch mock and API client mock before each test
    vi.restoreAllMocks();
  });

  /**
   * Test: Data loading success
   * Requirement: 6.4
   */
  it('should load game data successfully', async () => {
    // Mock API client for warband abilities
    vi.spyOn(apiClient, 'getWarbandAbilities').mockResolvedValue([
      { id: 'cyborgs', name: 'Cyborgs', description: 'Test description', rule: 'Test rule' }
    ]);

    // Mock successful fetch responses for other data
    global.fetch = vi.fn((url) => {
      const mockData: Record<string, any> = {
        '/data/closeCombatWeapons.json': [
          { id: '1', name: 'Sword', type: 'close', baseCost: 1, maxActions: 2, notes: '' }
        ],
        '/data/rangedWeapons.json': [
          { id: '2', name: 'Gun', type: 'ranged', baseCost: 2, maxActions: 1, notes: '' }
        ],
        '/data/equipment.json': [
          { id: '3', name: 'Armor', type: 'Passive', baseCost: 1, effect: 'Defense +1' }
        ],
        '/data/psychicPowers.json': [],
        '/data/leaderTraits.json': [],
        '/data/attributes.json': {
          speed: [],
          defense: [],
          firepower: [],
          prowess: [],
          willpower: []
        },
      };

      const data = mockData[url as string] || [];
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data),
      } as Response);
    });

    render(
      <GameDataProvider>
        <TestConsumer />
      </GameDataProvider>
    );

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('close-combat-count')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('ranged-count')).toHaveTextContent('1');
    expect(screen.getByTestId('equipment-count')).toHaveTextContent('1');
  });

  /**
   * Test: Error handling
   * Requirement: 6.4
   */
  it('should handle fetch errors gracefully', async () => {
    // Mock API client to succeed (so error comes from fetch)
    vi.spyOn(apiClient, 'getWarbandAbilities').mockResolvedValue([]);

    // Mock failed fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      } as Response)
    );

    render(
      <GameDataProvider>
        <TestConsumer />
      </GameDataProvider>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  /**
   * Test: Network error handling
   * Requirement: 6.4
   */
  it('should handle network errors', async () => {
    // Mock API client to succeed (so error comes from fetch)
    vi.spyOn(apiClient, 'getWarbandAbilities').mockResolvedValue([]);

    // Mock network failure
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    render(
      <GameDataProvider>
        <TestConsumer />
      </GameDataProvider>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  /**
   * Test: Hook throws error outside provider
   * Requirement: 6.4
   */
  it('should throw error when useGameData is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useGameData must be used within a GameDataProvider');

    consoleSpy.mockRestore();
  });

  /**
   * Test: Context provider renders children
   * Requirement: 6.4
   */
  it('should render children while loading', () => {
    // Mock slow API call
    vi.spyOn(apiClient, 'getWarbandAbilities').mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    // Mock slow fetch
    global.fetch = vi.fn(() =>
      new Promise(() => {}) // Never resolves
    );

    render(
      <GameDataProvider>
        <div>Child content</div>
      </GameDataProvider>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  /**
   * Test: Warband abilities fetch via API on mount
   * Requirements: 6.3, 6.4
   */
  it('should fetch warband abilities via API on mount', async () => {
    const mockAbilities = [
      { id: 'cyborgs', name: 'Cyborgs' as const, description: 'Cyborg Equipment', rule: 'Extra equipment' },
      { id: 'fanatics', name: 'Fanatics' as const, description: 'Willpower bonus', rule: '+1DT' }
    ];

    // Mock API client
    const apiSpy = vi.spyOn(apiClient, 'getWarbandAbilities').mockResolvedValue(mockAbilities);

    // Mock other fetch calls
    global.fetch = vi.fn((url) => {
      const mockData: Record<string, any> = {
        '/data/closeCombatWeapons.json': [],
        '/data/rangedWeapons.json': [],
        '/data/equipment.json': [],
        '/data/psychicPowers.json': [],
        '/data/leaderTraits.json': [],
        '/data/attributes.json': {
          speed: [],
          defense: [],
          firepower: [],
          prowess: [],
          willpower: []
        },
      };

      const data = mockData[url as string] || [];
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data),
      } as Response);
    });

    render(
      <GameDataProvider>
        <TestConsumer />
      </GameDataProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify API was called
    expect(apiSpy).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Handle API errors for warband abilities
   * Requirements: 6.3, 6.4
   */
  it('should handle API errors when fetching warband abilities', async () => {
    // Mock API client to fail
    vi.spyOn(apiClient, 'getWarbandAbilities').mockRejectedValue(
      new Error('API error')
    );

    // Mock other fetch calls to succeed
    global.fetch = vi.fn((url) => {
      const mockData: Record<string, any> = {
        '/data/closeCombatWeapons.json': [],
        '/data/rangedWeapons.json': [],
        '/data/equipment.json': [],
        '/data/psychicPowers.json': [],
        '/data/leaderTraits.json': [],
        '/data/attributes.json': {
          speed: [],
          defense: [],
          firepower: [],
          prowess: [],
          willpower: []
        },
      };

      const data = mockData[url as string] || [];
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data),
      } as Response);
    });

    render(
      <GameDataProvider>
        <TestConsumer />
      </GameDataProvider>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
