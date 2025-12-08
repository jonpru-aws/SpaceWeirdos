import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GameDataProvider, useGameData } from '../src/frontend/contexts/GameDataContext';

/**
 * Unit tests for GameDataContext
 * 
 * Tests game data fetching, loading states, error handling, and caching.
 * Requirements: 9.1, 9.5
 */

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test component that uses the context
function TestComponent() {
  const {
    attributes,
    closeCombatWeapons,
    rangedWeapons,
    equipment,
    psychicPowers,
    leaderTraits,
    warbandAbilities,
    isLoading,
    error,
  } = useGameData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div data-testid="attributes">{attributes ? 'Attributes loaded' : 'No attributes'}</div>
      <div data-testid="close-weapons">Close weapons: {closeCombatWeapons.length}</div>
      <div data-testid="ranged-weapons">Ranged weapons: {rangedWeapons.length}</div>
      <div data-testid="equipment">Equipment: {equipment.length}</div>
      <div data-testid="powers">Powers: {psychicPowers.length}</div>
      <div data-testid="traits">Traits: {leaderTraits.length}</div>
      <div data-testid="abilities">Abilities: {warbandAbilities.length}</div>
    </div>
  );
}

describe('GameDataContext', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Game data fetches on initialization
   * Requirement: 9.1
   */
  it('should fetch all game data on initialization', async () => {
    // Mock successful API responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/game-data/attributes')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            speed: { '1': 0, '2': 1, '3': 3 },
            defense: { '2d6': 2, '2d8': 4, '2d10': 8 },
            firepower: { 'None': 0, '2d8': 2, '2d10': 4 },
            prowess: { '2d6': 2, '2d8': 4, '2d10': 6 },
            willpower: { '2d6': 2, '2d8': 4, '2d10': 6 },
          }),
        });
      }
      if (url.includes('/game-data/weapons/close')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'unarmed', name: 'Unarmed', type: 'close', baseCost: 0, notes: '' },
            { id: 'melee-weapon', name: 'Melee Weapon', type: 'close', baseCost: 1, notes: '' },
          ]),
        });
      }
      if (url.includes('/game-data/weapons/ranged')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'pistol', name: 'Pistol', type: 'ranged', baseCost: 1, notes: '' },
          ]),
        });
      }
      if (url.includes('/game-data/equipment')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'cybernetics', name: 'Cybernetics', baseCost: 1, effect: '+1 to Power rolls' },
          ]),
        });
      }
      if (url.includes('/game-data/psychic-powers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'fear', name: 'Fear', cost: 1, effect: 'Cause fear' },
          ]),
        });
      }
      if (url.includes('/game-data/leader-traits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'tactician', name: 'Tactician', description: '+1DT to Initiative' },
          ]),
        });
      }
      if (url.includes('/game-data/warband-abilities')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'ability1', name: 'Test Ability', description: 'Test', rule: 'Test rule' },
          ]),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <GameDataProvider>
        <TestComponent />
      </GameDataProvider>
    );

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('attributes')).toHaveTextContent('Attributes loaded');
    });

    // Verify all data was fetched
    expect(screen.getByTestId('close-weapons')).toHaveTextContent('Close weapons: 2');
    expect(screen.getByTestId('ranged-weapons')).toHaveTextContent('Ranged weapons: 1');
    expect(screen.getByTestId('equipment')).toHaveTextContent('Equipment: 1');
    expect(screen.getByTestId('powers')).toHaveTextContent('Powers: 1');
    expect(screen.getByTestId('traits')).toHaveTextContent('Traits: 1');
    expect(screen.getByTestId('abilities')).toHaveTextContent('Abilities: 1');

    // Verify fetch was called for all endpoints
    expect(mockFetch).toHaveBeenCalledTimes(7);
  });

  /**
   * Test: Loading states
   * Requirement: 9.5
   */
  it('should show loading state while fetching data', async () => {
    // Mock delayed responses
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve([]),
        }), 100)
      )
    );

    render(
      <GameDataProvider>
        <TestComponent />
      </GameDataProvider>
    );

    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  /**
   * Test: Error handling for failed API calls
   * Requirement: 9.5
   */
  it('should handle API errors gracefully', async () => {
    // Mock failed API response
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    render(
      <GameDataProvider>
        <TestComponent />
      </GameDataProvider>
    );

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    // Verify error message is displayed
    expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
  });

  /**
   * Test: Network error handling
   * Requirement: 9.5
   */
  it('should handle network errors', async () => {
    // Mock network error
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(
      <GameDataProvider>
        <TestComponent />
      </GameDataProvider>
    );

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    // Verify error message is displayed
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  /**
   * Test: Data caching
   * Requirement: 9.1, 9.6
   */
  it('should cache game data and not refetch on re-render', async () => {
    // Mock successful API responses
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    const { rerender } = render(
      <GameDataProvider>
        <TestComponent />
      </GameDataProvider>
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(7);
    });

    // Clear mock call history
    mockFetch.mockClear();

    // Re-render the component
    rerender(
      <GameDataProvider>
        <TestComponent />
      </GameDataProvider>
    );

    // Wait a bit to ensure no new fetches occur
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify no additional fetches were made (data is cached)
    expect(mockFetch).not.toHaveBeenCalled();
  });

  /**
   * Test: useGameData hook throws error outside provider
   * Requirement: 9.1
   */
  it('should throw error when useGameData is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useGameData must be used within a GameDataProvider');

    consoleError.mockRestore();
  });

  /**
   * Test: Refetch function
   * Requirement: 9.5
   */
  it('should allow refetching data via refetch function', async () => {
    // Mock successful API responses
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    function TestRefetchComponent() {
      const { refetch, isLoading } = useGameData();
      
      return (
        <div>
          <button onClick={() => refetch()}>Refetch</button>
          {isLoading && <div>Loading...</div>}
        </div>
      );
    }

    render(
      <GameDataProvider>
        <TestRefetchComponent />
      </GameDataProvider>
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(7);
    });

    mockFetch.mockClear();

    // Click refetch button
    const refetchButton = screen.getByText('Refetch');
    refetchButton.click();

    // Verify data is refetched
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(7);
    });
  });
});
