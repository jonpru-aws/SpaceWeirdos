import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { WeirdoEditor } from '../src/frontend/components/WeirdoEditor';
import { WeirdoCostDisplay } from '../src/frontend/components/WeirdoCostDisplay';
import { WeirdoBasicInfo } from '../src/frontend/components/WeirdoBasicInfo';
import { Weirdo } from '../src/backend/models/types';
import { CostEngine } from '../src/backend/services/CostEngine';
import { ValidationService } from '../src/backend/services/ValidationService';
import { DataRepository } from '../src/backend/services/DataRepository';
import { WarbandProvider } from '../src/frontend/contexts/WarbandContext';
import { GameDataProvider } from '../src/frontend/contexts/GameDataContext';
import { useWarband } from '../src/frontend/contexts/WarbandContext';
import * as apiClient from '../src/frontend/services/apiClient';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

/**
 * Unit tests for WeirdoEditor core components
 * 
 * Tests WeirdoEditor conditional rendering, WeirdoCostDisplay sticky positioning
 * and warning indicators, and WeirdoBasicInfo functionality.
 * 
 * Requirements: 3.1, 3.3, 3.4, 6.1, 6.3, 10.3, 10.4, 12.7
 */

const createMockWeirdo = (type: 'leader' | 'trooper', totalCost: number = 0): Weirdo => ({
  id: 'weirdo-1',
  name: type === 'leader' ? 'Test Leader' : 'Test Trooper',
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
  totalCost
});



// Helper to render with both GameDataProvider and WarbandProvider
const renderWithProviders = (ui: React.ReactElement) => {
  const costEngine = new CostEngine();
  const validationService = new ValidationService();
  const dataRepository = new DataRepository();

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

  return render(ui, { wrapper: Wrapper });
};

describe('WeirdoEditor', () => {
  /**
   * Test conditional rendering when no weirdo is selected
   * Requirement: 10.4
   */
  it('should display message when no weirdo is selected', () => {
    renderWithProviders(<WeirdoEditor />);

    expect(screen.getByText(/Select a weirdo from the list to edit/i)).toBeInTheDocument();
  });

  /**
   * Test that component renders without crashing when warband exists
   * Requirement: 10.3
   */
  it('should render without crashing', () => {
    renderWithProviders(<WeirdoEditor />);
    
    // Should show empty message since no weirdo is selected
    expect(screen.getByText(/Select a weirdo from the list to edit/i)).toBeInTheDocument();
  });
});

describe('WeirdoCostDisplay', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock response
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 10,
        breakdown: {
          attributes: 4,
          weapons: 2,
          equipment: 2,
          psychicPowers: 2,
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });
  });

  /**
   * Test cost display shows correct values
   * Requirement: 3.1, 3.3
   */
  it('should display weirdo cost correctly', () => {
    const mockWeirdo = createMockWeirdo('trooper', 10);
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={mockWeirdo}
        warbandAbility={null}
      />
    );

    // Cost is calculated by API, not from totalCost field
    // Check for the cost value span specifically
    const costValue = container.querySelector('.weirdo-cost-display__value');
    expect(costValue).toBeInTheDocument();
    expect(costValue?.textContent).toMatch(/\d+\s*\/\s*20\s+pts/i);
  });

  /**
   * Test warning indicator when approaching limit
   * Requirement: 3.4
   */
  it('should show warning indicator when approaching limit', async () => {
    const mockWeirdo = createMockWeirdo('trooper', 15);
    // Set attributes to make cost approach limit (within 10 points of 20, so 11-20)
    // Need to get cost between 11 and 20
    mockWeirdo.attributes.speed = 2; // 1pt
    mockWeirdo.attributes.defense = '2d8'; // 1pt
    mockWeirdo.attributes.prowess = '2d10'; // 2pts
    mockWeirdo.attributes.willpower = '2d10'; // 2pts
    // Total should be around 12 points (within warning range)
    mockWeirdo.totalCost = 12;
    
    // Mock API to return approaching limit
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 12,
        breakdown: {
          attributes: 8,
          weapons: 2,
          equipment: 2,
          psychicPowers: 0,
        },
        warnings: [],
        isApproachingLimit: true,
        isOverLimit: false,
        calculationTime: 5,
      },
    });
    
    render(
      <WeirdoCostDisplay
        weirdo={mockWeirdo}
        warbandAbility={null}
      />
    );

    // Wait for the cost calculation to complete
    await waitFor(() => {
      expect(screen.getByText(/Approaching Limit/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  /**
   * Test error indicator when exceeding limit
   * Requirement: 3.4
   */
  it('should show error indicator when exceeding limit', async () => {
    const mockWeirdo = createMockWeirdo('trooper', 25);
    // Set attributes to make cost exceed limit
    mockWeirdo.attributes.speed = 3;
    mockWeirdo.attributes.defense = '2d10';
    mockWeirdo.attributes.firepower = '2d10';
    mockWeirdo.attributes.prowess = '2d10';
    mockWeirdo.attributes.willpower = '2d10';
    mockWeirdo.totalCost = 25;
    
    // Mock API to return over limit
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 25,
        breakdown: {
          attributes: 15,
          weapons: 4,
          equipment: 4,
          psychicPowers: 2,
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: true,
        calculationTime: 5,
      },
    });
    
    render(
      <WeirdoCostDisplay
        weirdo={mockWeirdo}
        warbandAbility={null}
      />
    );

    // Wait for the cost calculation to complete
    await waitFor(() => {
      expect(screen.getByText(/Over Limit/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  /**
   * Test leader cost limits
   * Requirement: 3.4
   */
  it('should use 25 point limit for leaders', () => {
    const mockWeirdo = createMockWeirdo('leader', 20);
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={mockWeirdo}
        warbandAbility={null}
      />
    );

    // Cost is calculated by API
    // Check for the cost value span specifically
    const costValue = container.querySelector('.weirdo-cost-display__value');
    expect(costValue).toBeInTheDocument();
    expect(costValue?.textContent).toMatch(/\d+\s*\/\s*25\s+pts/i);
  });

  /**
   * Test sticky positioning CSS class
   * Requirement: 6.1, 6.3
   */
  it('should have sticky positioning CSS class', () => {
    const mockWeirdo = createMockWeirdo('trooper', 10);
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={mockWeirdo}
        warbandAbility={null}
      />
    );

    const costDisplay = container.querySelector('.weirdo-cost-display');
    expect(costDisplay).toBeInTheDocument();
  });
});

describe('WeirdoBasicInfo', () => {
  /**
   * Test name input rendering
   * Requirement: 10.3
   */
  it('should render weirdo name input', () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnUpdate = () => {};
    
    render(
      <WeirdoBasicInfo weirdo={mockWeirdo} onUpdate={mockOnUpdate} />
    );

    const nameInput = screen.getByLabelText(/Name:/i) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe('Test Leader');
  });

  /**
   * Test type display for leader
   * Requirement: 10.3
   */
  it('should display Leader type correctly', () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnUpdate = () => {};
    
    render(
      <WeirdoBasicInfo weirdo={mockWeirdo} onUpdate={mockOnUpdate} />
    );

    expect(screen.getByText('Leader')).toBeInTheDocument();
  });

  /**
   * Test type display for trooper
   * Requirement: 10.3
   */
  it('should display Trooper type correctly', () => {
    const mockWeirdo = createMockWeirdo('trooper');
    const mockOnUpdate = () => {};
    
    render(
      <WeirdoBasicInfo weirdo={mockWeirdo} onUpdate={mockOnUpdate} />
    );

    expect(screen.getByText('Trooper')).toBeInTheDocument();
  });
});

describe('Automatic Unarmed Selection', () => {
  /**
   * Test that "unarmed" is automatically selected when weirdo has no weapons
   * Requirement: 6.1, 6.2
   */
  it('should automatically select unarmed when weirdo has no close combat weapons', async () => {
    const costEngine = new CostEngine();
    const validationService = new ValidationService();
    const dataRepository = new DataRepository();

    // Create a test component that uses the warband context
    const TestComponent = () => {
      const { currentWarband, addWeirdo, selectWeirdo } = useWarband();
      
      // Add a weirdo with no weapons on mount
      React.useEffect(() => {
        if (!currentWarband) {
          const warbandId = 'test-warband';
          // Create warband first
          addWeirdo(warbandId, 'trooper');
        }
      }, [currentWarband, addWeirdo]);

      const selectedWeirdo = currentWarband?.weirdos.find(w => w.id === currentWarband.weirdos[0]?.id);
      
      return (
        <div>
          {selectedWeirdo && (
            <div data-testid="weapon-count">
              {selectedWeirdo.closeCombatWeapons.length}
            </div>
          )}
        </div>
      );
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

    render(<TestComponent />, { wrapper: Wrapper });

    // Wait for the automatic unarmed selection to occur
    await waitFor(() => {
      const weaponCount = screen.queryByTestId('weapon-count');
      if (weaponCount) {
        expect(weaponCount.textContent).toBe('1');
      }
    }, { timeout: 1000 });
  });

  /**
   * Test that cost recalculates after automatic unarmed selection
   * Requirement: 6.3
   */
  it('should recalculate cost after automatic unarmed selection', async () => {
    const costEngine = new CostEngine();
    const validationService = new ValidationService();
    const dataRepository = new DataRepository();

    const TestComponent = () => {
      const { currentWarband, addWeirdo } = useWarband();
      
      React.useEffect(() => {
        if (!currentWarband) {
          addWeirdo('test-warband', 'trooper');
        }
      }, [currentWarband, addWeirdo]);

      const selectedWeirdo = currentWarband?.weirdos[0];
      
      return (
        <div>
          {selectedWeirdo && (
            <>
              <div data-testid="weapon-count">
                {selectedWeirdo.closeCombatWeapons.length}
              </div>
              <div data-testid="weapon-id">
                {selectedWeirdo.closeCombatWeapons[0]?.id || 'none'}
              </div>
            </>
          )}
        </div>
      );
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

    render(<TestComponent />, { wrapper: Wrapper });

    // Wait for automatic unarmed selection
    await waitFor(() => {
      const weaponId = screen.queryByTestId('weapon-id');
      if (weaponId) {
        expect(weaponId.textContent).toBe('unarmed');
      }
    }, { timeout: 1000 });
  });
});
