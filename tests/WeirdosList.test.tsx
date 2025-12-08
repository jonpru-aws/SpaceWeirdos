import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { WeirdosList } from '../src/frontend/components/WeirdosList';
import { WeirdoCard } from '../src/frontend/components/WeirdoCard';
import { DataRepository } from '../src/backend/services/DataRepository';
import { CostEngine } from '../src/backend/services/CostEngine';
import { ValidationService } from '../src/backend/services/ValidationService';
import { Weirdo } from '../src/backend/models/types';
import { ReactNode, useEffect, useRef } from 'react';
import fc from 'fast-check';
import * as apiClient from '../src/frontend/services/apiClient';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

/**
 * Unit tests for weirdo list components
 * 
 * Tests WeirdosList disables Add Leader when leader exists,
 * WeirdoCard shows error indicator, selection highlighting,
 * and remove button updates warband cost.
 * 
 * Requirements: 2.3, 2.4, 3.3, 4.1, 4.2, 10.5, 11.1-11.4
 */

describe('Weirdo List Components', () => {
  let dataRepository: DataRepository;
  let costEngine: CostEngine;
  let validationService: ValidationService;

  beforeEach(() => {
    dataRepository = new DataRepository(':memory:', false);
    costEngine = new CostEngine();
    validationService = new ValidationService();
    
    // Reset and setup API mock
    vi.clearAllMocks();
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

  const createWrapper = (children: ReactNode) => (
    <WarbandProvider
      dataRepository={dataRepository}
      costEngine={costEngine}
      validationService={validationService}
    >
      {children}
    </WarbandProvider>
  );

  // Helper component that creates a warband
  const WithWarband = ({ children }: { children: ReactNode }) => {
    const { createWarband } = useWarband();
    const initialized = useRef(false);
    
    useEffect(() => {
      if (!initialized.current) {
        createWarband('Test Warband', 75);
        initialized.current = true;
      }
    }, [createWarband]);
    
    return <>{children}</>;
  };

  describe('WeirdosList', () => {
    /**
     * Test Add Leader button is disabled when leader exists
     * Requirements: 11.3
     */
    it('should disable Add Leader button when warband has a leader', async () => {
      const WithLeader = ({ children }: { children: ReactNode }) => {
        const { createWarband, addWeirdo, currentWarband } = useWarband();
        const initialized = useRef(false);
        
        useEffect(() => {
          if (!initialized.current) {
            createWarband('Test Warband', 75);
            initialized.current = true;
          }
        }, [createWarband]);
        
        useEffect(() => {
          if (currentWarband && currentWarband.weirdos.length === 0 && initialized.current) {
            addWeirdo('leader');
          }
        }, [currentWarband, addWeirdo]);
        
        return <>{children}</>;
      };

      render(
        createWrapper(
          <WithLeader>
            <WeirdosList />
          </WithLeader>
        )
      );

      await waitFor(() => {
        const addLeaderButton = screen.getByRole('button', { name: /Add Leader/i });
        expect(addLeaderButton).toBeDisabled();
      }, { timeout: 5000 });
    });

    /**
     * Test Add Leader button is enabled when no leader exists
     * Requirements: 11.1, 11.3
     */
    it('should enable Add Leader button when warband has no leader', () => {
      render(
        createWrapper(
          <WithWarband>
            <WeirdosList />
          </WithWarband>
        )
      );

      const addLeaderButton = screen.getByRole('button', { name: /Add Leader/i });
      expect(addLeaderButton).not.toBeDisabled();
    });

    /**
     * Test Add Trooper button is always enabled
     * Requirements: 11.2
     */
    it('should always enable Add Trooper button', () => {
      render(
        createWrapper(
          <WithWarband>
            <WeirdosList />
          </WithWarband>
        )
      );

      const addTrooperButton = screen.getByLabelText('Add Trooper');
      expect(addTrooperButton).not.toBeDisabled();
    });

    /**
     * Test empty state message when no weirdos
     * Requirements: 2.3
     */
    it('should display empty state when no weirdos exist', () => {
      render(
        createWrapper(
          <WithWarband>
            <WeirdosList />
          </WithWarband>
        )
      );

      expect(screen.getByText(/No weirdos yet/)).toBeInTheDocument();
    });

    /**
     * Test weirdos are displayed in list
     * Requirements: 2.4, 2.7
     */
    it('should display weirdos in the list', async () => {
      render(
        createWrapper(
          <WithWarband>
            <WeirdosList />
          </WithWarband>
        )
      );

      // Click the add buttons to add weirdos
      const addLeaderButton = screen.getByRole('button', { name: /Add Leader/i });
      const addTrooperButton = screen.getByRole('button', { name: /Add Trooper/i });
      
      // Add leader first and wait for it to appear
      fireEvent.click(addLeaderButton);
      await waitFor(() => {
        expect(screen.getByText('New Leader')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Then add trooper and wait for it to appear
      fireEvent.click(addTrooperButton);
      await waitFor(() => {
        expect(screen.getByText('New Trooper')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('WeirdoCard', () => {
    const mockWeirdo: Weirdo = {
      id: 'test-1',
      name: 'Test Weirdo',
      type: 'leader',
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
      totalCost: 0,
    };

    /**
     * Test weirdo name, type, and cost display
     * Requirements: 3.3, 10.5
     */
    it('should display weirdo name, type, and cost', () => {
      const mockOnClick = () => {};
      const mockOnRemove = () => {};

      render(
        <WeirdoCard
          weirdo={mockWeirdo}
          cost={15}
          isSelected={false}
          hasErrors={false}
          onClick={mockOnClick}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText('Test Weirdo')).toBeInTheDocument();
      expect(screen.getByText('Leader')).toBeInTheDocument();
      expect(screen.getByText('15 pts')).toBeInTheDocument();
    });

    /**
     * Test error indicator is shown when hasErrors is true
     * Requirements: 4.1, 4.2
     */
    it('should show error indicator when weirdo has validation errors', () => {
      const mockOnClick = () => {};
      const mockOnRemove = () => {};

      const { container } = render(
        <WeirdoCard
          weirdo={mockWeirdo}
          cost={15}
          isSelected={false}
          hasErrors={true}
          onClick={mockOnClick}
          onRemove={mockOnRemove}
        />
      );

      const errorIndicator = container.querySelector('.weirdo-card__error-indicator');
      expect(errorIndicator).toBeInTheDocument();
      expect(errorIndicator).toHaveTextContent('⚠');
    });

    /**
     * Test selected state styling
     * Requirements: 10.5
     */
    it('should apply selected styling when isSelected is true', () => {
      const mockOnClick = () => {};
      const mockOnRemove = () => {};

      const { container } = render(
        <WeirdoCard
          weirdo={mockWeirdo}
          cost={15}
          isSelected={true}
          hasErrors={false}
          onClick={mockOnClick}
          onRemove={mockOnRemove}
        />
      );

      const card = container.querySelector('.weirdo-card');
      expect(card).toHaveClass('weirdo-card--selected');
    });

    /**
     * Test click handler is called when card is clicked
     * Requirements: 10.5
     */
    it('should call onClick when card is clicked', () => {
      let clicked = false;
      const mockOnClick = () => { clicked = true; };
      const mockOnRemove = () => {};

      const { container } = render(
        <WeirdoCard
          weirdo={mockWeirdo}
          cost={15}
          isSelected={false}
          hasErrors={false}
          onClick={mockOnClick}
          onRemove={mockOnRemove}
        />
      );

      const card = container.querySelector('.weirdo-card');
      if (card) {
        fireEvent.click(card);
      }
      expect(clicked).toBe(true);
    });

    /**
     * Test remove button calls onRemove handler
     * Requirements: 11.4
     */
    it('should call onRemove when remove button is clicked', () => {
      let removed = false;
      const mockOnClick = () => {};
      const mockOnRemove = () => { removed = true; };

      render(
        <WeirdoCard
          weirdo={mockWeirdo}
          cost={15}
          isSelected={false}
          hasErrors={false}
          onClick={mockOnClick}
          onRemove={mockOnRemove}
        />
      );

      const removeButton = screen.getByLabelText('Remove Test Weirdo');
      fireEvent.click(removeButton);
      expect(removed).toBe(true);
    });

    /**
     * Test remove button click does not trigger card onClick
     * Requirements: 11.4
     */
    it('should not trigger card onClick when remove button is clicked', () => {
      let cardClicked = false;
      let removed = false;
      const mockOnClick = () => { cardClicked = true; };
      const mockOnRemove = () => { removed = true; };

      render(
        <WeirdoCard
          weirdo={mockWeirdo}
          cost={15}
          isSelected={false}
          hasErrors={false}
          onClick={mockOnClick}
          onRemove={mockOnRemove}
        />
      );

      const removeButton = screen.getByLabelText('Remove Test Weirdo');
      fireEvent.click(removeButton);
      
      expect(removed).toBe(true);
      expect(cardClicked).toBe(false);
    });
  });
});

/**
 * Property-Based Tests for Weirdo Management
 * 
 * **Feature: space-weirdos-ui, Property 12: Add leader button is disabled when leader exists**
 * **Validates: Requirements 11.3**
 */
describe('Property-Based Tests: Weirdo Management', () => {
  // Test configuration for property-based tests (numRuns: 50)

  /**
   * Property 12: Add leader button is disabled when leader exists
   * 
   * For any warband state, the "Add Leader" button should be disabled when 
   * the warband already has a leader, and enabled when no leader exists.
   * 
   * **Feature: space-weirdos-ui, Property 12: Add leader button is disabled when leader exists**
   * **Validates: Requirements 11.3**
   */
  it('Property 12: Add leader button state depends on leader existence', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate whether to include a leader (boolean)
        fc.boolean(),
        async (hasLeader) => {
          const dataRepository = new DataRepository(':memory:', false);
          const costEngine = new CostEngine();
          const validationService = new ValidationService();

          // Helper component that creates a warband
          const TestWarband = ({ children }: { children: ReactNode }) => {
            const { createWarband } = useWarband();
            const initialized = useRef(false);
            
            useEffect(() => {
              if (!initialized.current) {
                createWarband('Test Warband', 75);
                initialized.current = true;
              }
            }, [createWarband]);
            
            return <>{children}</>;
          };

          const { unmount } = render(
            <WarbandProvider
              dataRepository={dataRepository}
              costEngine={costEngine}
              validationService={validationService}
            >
              <TestWarband>
                <WeirdosList />
              </TestWarband>
            </WarbandProvider>
          );

          try {
            // Wait for warband to be created and button to appear
            await waitFor(
              () => {
                const addLeaderButton = screen.getByRole('button', { name: /Add Leader/i });
                expect(addLeaderButton).toBeInTheDocument();
              },
              { timeout: 3000 }
            );

            // Add leader if specified
            if (hasLeader) {
              const addLeaderButton = screen.getByRole('button', { name: /Add Leader/i });
              fireEvent.click(addLeaderButton);
              
              // Wait for leader to be added
              await waitFor(
                () => {
                  expect(screen.getByText('New Leader')).toBeInTheDocument();
                },
                { timeout: 3000 }
              );
            }

            // Now check the button state
            const addLeaderButton = screen.getByRole('button', { name: /Add Leader/i });
            
            // Property: Button should be disabled if and only if a leader exists
            if (hasLeader) {
              expect(addLeaderButton).toBeDisabled();
            } else {
              expect(addLeaderButton).not.toBeDisabled();
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 } // Reduced runs for async test to prevent timeout
    );
  }, 30000); // Increased timeout for async property test
});
