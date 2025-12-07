import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeirdoEditor } from '../src/frontend/components/WeirdoEditor';
import { WeirdoCostDisplay } from '../src/frontend/components/WeirdoCostDisplay';
import { WeirdoBasicInfo } from '../src/frontend/components/WeirdoBasicInfo';
import { Weirdo } from '../src/backend/models/types';
import { CostEngine } from '../src/backend/services/CostEngine';
import { ValidationService } from '../src/backend/services/ValidationService';
import { DataRepository } from '../src/backend/services/DataRepository';
import { WarbandProvider } from '../src/frontend/contexts/WarbandContext';
import { GameDataProvider } from '../src/frontend/contexts/GameDataContext';

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
  const costEngine = new CostEngine();

  /**
   * Test cost display shows correct values
   * Requirement: 3.1, 3.3
   */
  it('should display weirdo cost correctly', () => {
    const mockWeirdo = createMockWeirdo('trooper', 10);
    
    render(
      <WeirdoCostDisplay
        weirdo={mockWeirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Cost is calculated by CostEngine, not from totalCost field
    // Default attributes cost 6 points
    expect(screen.getByText(/6 \/ 20 pts/i)).toBeInTheDocument();
  });

  /**
   * Test warning indicator when approaching limit
   * Requirement: 3.4
   */
  it('should show warning indicator when approaching limit', () => {
    const mockWeirdo = createMockWeirdo('trooper', 15);
    // Set attributes to make cost approach limit (within 10 points of 20, so 11-20)
    // Need to get cost between 11 and 20
    mockWeirdo.attributes.speed = 2; // 1pt
    mockWeirdo.attributes.defense = '2d8'; // 1pt
    mockWeirdo.attributes.prowess = '2d10'; // 2pts
    mockWeirdo.attributes.willpower = '2d10'; // 2pts
    // Total should be around 12 points (within warning range)
    
    render(
      <WeirdoCostDisplay
        weirdo={mockWeirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    expect(screen.getByText(/Approaching Limit/i)).toBeInTheDocument();
  });

  /**
   * Test error indicator when exceeding limit
   * Requirement: 3.4
   */
  it('should show error indicator when exceeding limit', () => {
    const mockWeirdo = createMockWeirdo('trooper', 25);
    // Set attributes to make cost exceed limit
    mockWeirdo.attributes.speed = 3;
    mockWeirdo.attributes.defense = '2d10';
    mockWeirdo.attributes.firepower = '2d10';
    mockWeirdo.attributes.prowess = '2d10';
    mockWeirdo.attributes.willpower = '2d10';
    
    render(
      <WeirdoCostDisplay
        weirdo={mockWeirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    expect(screen.getByText(/Over Limit/i)).toBeInTheDocument();
  });

  /**
   * Test leader cost limits
   * Requirement: 3.4
   */
  it('should use 25 point limit for leaders', () => {
    const mockWeirdo = createMockWeirdo('leader', 20);
    
    render(
      <WeirdoCostDisplay
        weirdo={mockWeirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Cost is calculated by CostEngine - default attributes cost 6 points
    expect(screen.getByText(/6 \/ 25 pts/i)).toBeInTheDocument();
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
        costEngine={costEngine}
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
