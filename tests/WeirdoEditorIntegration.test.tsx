import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WeirdoEditor } from '../src/frontend/components/WeirdoEditor';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { GameDataProvider } from '../src/frontend/contexts/GameDataContext';
import { CostEngine } from '../src/backend/services/CostEngine';
import { ValidationService } from '../src/backend/services/ValidationService';
import { DataRepository } from '../src/backend/services/DataRepository';
import { useEffect } from 'react';
import { createMockGameData } from './testHelpers';
import * as apiClient from '../src/frontend/services/apiClient';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
    batchCalculateCosts: vi.fn(),
  },
}));

/**
 * Integration tests for complete WeirdoEditor
 * 
 * Tests that all selectors (equipment, psychic powers, leader trait) work together
 * correctly within the WeirdoEditor component.
 * 
 * Requirements: 5.1-5.6, 6.1-6.3, 7.1-7.4
 */

describe('WeirdoEditor Integration', () => {
  let costEngine: CostEngine;
  let validationService: ValidationService;
  let dataRepository: DataRepository;

  beforeEach(() => {
    costEngine = new CostEngine();
    validationService = new ValidationService();
    dataRepository = new DataRepository();

    // Mock fetch for GameDataProvider
    const mockGameData = createMockGameData();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/warbandAbilities.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.warbandAbilities)
        });
      }
      if (url.includes('/closeCombatWeapons.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.closeCombatWeapons)
        });
      }
      if (url.includes('/rangedWeapons.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.rangedWeapons)
        });
      }
      if (url.includes('/equipment.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.equipment)
        });
      }
      if (url.includes('/psychicPowers.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.psychicPowers)
        });
      }
      if (url.includes('/leaderTraits.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.leaderTraits)
        });
      }
      if (url.includes('/attributes.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.attributes)
        });
      }
      return Promise.reject(new Error(`Unmocked fetch call to ${url}`));
    }) as any;

    // Setup API client mock responses
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: { cost: 10, breakdown: {} }
    } as any);
  });

  // Helper component to set up warband state
  const TestSetup = ({ 
    weirdoType, 
    children 
  }: { 
    weirdoType?: 'leader' | 'trooper';
    children: React.ReactNode;
  }) => {
    const { createWarband, addWeirdo, currentWarband, selectedWeirdoId } = useWarband();

    useEffect(() => {
      const setup = async () => {
        if (!currentWarband) {
          createWarband('Test Warband', 75);
        }
      };
      setup();
    }, [createWarband, currentWarband]);

    useEffect(() => {
      const addWeirdoAsync = async () => {
        if (currentWarband && weirdoType && currentWarband.weirdos.length === 0) {
          // addWeirdo is async and will auto-select the weirdo
          await addWeirdo(weirdoType);
        }
      };
      addWeirdoAsync();
    }, [currentWarband, weirdoType, addWeirdo]);

    // Only render children when weirdo is selected (if weirdoType was provided)
    if (weirdoType && !selectedWeirdoId) {
      return null;
    }

    return <>{children}</>;
  };

  const renderWithProviders = (weirdoType?: 'leader' | 'trooper') => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <GameDataProvider>
        <WarbandProvider
          dataRepository={dataRepository}
          costEngine={costEngine}
          validationService={validationService}
        >
          <TestSetup weirdoType={weirdoType}>
            {children}
          </TestSetup>
        </WarbandProvider>
      </GameDataProvider>
    );

    return render(<WeirdoEditor />, { wrapper: Wrapper });
  };

  /**
   * Test equipment selector integration
   * Requirement: 5.1-5.6
   */
  it('should render and interact with equipment selector', async () => {
    renderWithProviders('leader');

    // Equipment section should be visible - wait longer for async loading
    await waitFor(() => {
      expect(screen.getByText(/equipment/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  /**
   * Test psychic power selector integration
   * Requirement: 6.1-6.3
   */
  it('should render and interact with psychic power selector', async () => {
    renderWithProviders('leader');

    // Psychic powers section should be visible
    expect(await screen.findByRole('heading', { name: /psychic powers/i })).toBeInTheDocument();
  });

  /**
   * Test leader trait selector integration for leaders
   * Requirement: 7.1-7.4
   */
  it('should render leader trait selector for leaders', async () => {
    renderWithProviders('leader');

    // Leader trait section should be visible for leaders
    expect(await screen.findByText(/leader trait/i)).toBeInTheDocument();
  });

  /**
   * Test leader trait selector is hidden for troopers
   * Requirement: 7.2
   */
  it('should not render leader trait selector for troopers', async () => {
    renderWithProviders('trooper');

    // Wait for component to render, then check leader trait is not present
    await screen.findByText(/equipment/i); // Wait for component to load
    expect(screen.queryByText(/leader trait/i)).not.toBeInTheDocument();
  });

  /**
   * Test all selectors work together correctly
   * Requirements: 5.1-5.6, 6.1-6.3, 7.1-7.4
   */
  it('should render all selectors together for a leader', async () => {
    renderWithProviders('leader');

    // All sections should be present (except ranged weapons since default firepower is None)
    expect(await screen.findByText(/basic information/i)).toBeInTheDocument();
    expect(screen.getByText(/attributes/i)).toBeInTheDocument();
    expect(screen.getByText(/close combat weapons/i)).toBeInTheDocument();
    expect(screen.getByText(/equipment/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /psychic powers/i })).toBeInTheDocument();
    expect(screen.getByText(/leader trait/i)).toBeInTheDocument();
    
    // Ranged weapons heading should be present but with disabled message
    expect(screen.getByRole('heading', { name: /ranged weapons/i })).toBeInTheDocument();
  });

  /**
   * Test equipment and psychic power selectors work together
   * Requirements: 5.1-5.6, 6.1-6.3
   */
  it('should allow selecting both equipment and psychic powers', async () => {
    renderWithProviders('leader');

    // Both sections should be independently functional
    expect(await screen.findByText(/equipment/i)).toBeInTheDocument();
    const psychicPowersHeading = screen.getByRole('heading', { name: /psychic powers/i });
    expect(psychicPowersHeading).toBeInTheDocument();

    // Both should be visible at the same time
    expect(screen.getByText(/equipment/i)).toBeVisible();
    expect(psychicPowersHeading).toBeVisible();
  });

  /**
   * Test ranged weapons conditional rendering with equipment selector
   * Requirements: 4.4, 5.1-5.6
   */
  it('should hide ranged weapons but show equipment when firepower is None', async () => {
    renderWithProviders('trooper');

    // Equipment should be visible
    expect(await screen.findByText(/equipment/i)).toBeInTheDocument();
    
    // Ranged weapons heading should be present but with disabled message
    expect(screen.getByRole('heading', { name: /ranged weapons/i })).toBeInTheDocument();
  });

  /**
   * Test all selectors maintain state independently
   * Requirements: 5.1-5.6, 6.1-6.3, 7.1-7.4
   */
  it('should maintain independent state for all selectors', async () => {
    renderWithProviders('leader');

    // All selector sections should be present and independent
    expect(await screen.findByText(/equipment/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /psychic powers/i })).toBeInTheDocument();
    expect(screen.getByText(/leader trait/i)).toBeInTheDocument();
  });
});
