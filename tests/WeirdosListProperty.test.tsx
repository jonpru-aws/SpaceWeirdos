import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { WeirdosList } from '../src/frontend/components/WeirdosList';
import { DataRepository } from '../src/backend/services/DataRepository';
import { CostEngine } from '../src/backend/services/CostEngine';
import { ValidationService } from '../src/backend/services/ValidationService';
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
 * Property-Based Tests for WeirdosList Component
 * 
 * Tests universal properties that should hold across all valid inputs.
 * Uses fast-check library for property-based testing with minimum 50 iterations.
 */

describe('WeirdosList Property-Based Tests', () => {
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

  /**
   * Property 20: WeirdosList displays all weirdos
   * 
   * For any warband with weirdos, the WeirdosList should render a card for each weirdo.
   * 
   * **Feature: npm-package-upgrade-fixes, Property 20: WeirdosList displays all weirdos**
   * **Validates: Requirements 6.1**
   */
  it('Property 20: WeirdosList displays all weirdos', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate number of leaders (0 or 1) and troopers (0-3) - reduced for performance
        fc.constantFrom(0, 1),
        fc.integer({ min: 0, max: 3 }),
        async (numLeaders, numTroopers) => {
          const dataRepository = new DataRepository(':memory:', false);
          const costEngine = new CostEngine();
          const validationService = new ValidationService();

          const { unmount } = render(
            <WarbandProvider
              dataRepository={dataRepository}
              costEngine={costEngine}
              validationService={validationService}
            >
              <WithWarband>
                <WeirdosList />
              </WithWarband>
            </WarbandProvider>
          );

          try {
            const totalWeirdos = numLeaders + numTroopers;
            
            if (totalWeirdos === 0) {
              // Should show empty state
              await waitFor(() => {
                expect(screen.getByText(/No weirdos yet/)).toBeInTheDocument();
              }, { timeout: 1000 });
            } else {
              // Add weirdos by clicking buttons
              for (let i = 0; i < numLeaders; i++) {
                const addLeaderButton = screen.getByRole('button', { name: /Add Leader/i });
                fireEvent.click(addLeaderButton);
                await waitFor(() => {
                  expect(screen.getByText('New Leader')).toBeInTheDocument();
                }, { timeout: 1000 });
              }
              
              for (let i = 0; i < numTroopers; i++) {
                const addTrooperButton = screen.getByRole('button', { name: /Add Trooper/i });
                fireEvent.click(addTrooperButton);
                await waitFor(() => {
                  const trooperCards = screen.getAllByText('New Trooper');
                  expect(trooperCards.length).toBe(i + 1);
                }, { timeout: 1000 });
              }
              
              // Verify total count
              const weirdoCards = screen.getAllByRole('button', { name: /Select/ });
              expect(weirdoCards.length).toBe(totalWeirdos);
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000); // Increased timeout for async property test

  /**
   * Property 21: Add Leader button state depends on leader existence
   * 
   * For any warband, the Add Leader button should be disabled if and only if 
   * the warband has a leader.
   * 
   * **Feature: npm-package-upgrade-fixes, Property 21: Add Leader button state depends on leader existence**
   * **Validates: Requirements 6.2, 6.3**
   */
  it('Property 21: Add Leader button state depends on leader existence', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate whether to include a leader (boolean)
        fc.boolean(),
        async (hasLeader) => {
          const dataRepository = new DataRepository(':memory:', false);
          const costEngine = new CostEngine();
          const validationService = new ValidationService();

          // Helper component that creates warband and optionally adds leader
          const TestWarband = ({ children }: { children: ReactNode }) => {
            const { createWarband, addWeirdo, currentWarband } = useWarband();
            const initialized = useRef(false);
            const leaderAdded = useRef(false);
            
            useEffect(() => {
              if (!initialized.current) {
                createWarband('Test Warband', 75);
                initialized.current = true;
              }
            }, [createWarband]);
            
            useEffect(() => {
              if (currentWarband && !leaderAdded.current && initialized.current && hasLeader) {
                addWeirdo('leader');
                leaderAdded.current = true;
              }
            }, [currentWarband, addWeirdo]);
            
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
            // Wait for component to render
            await waitFor(() => {
              const addLeaderButton = screen.getByRole('button', { name: /Add Leader/i });
              expect(addLeaderButton).toBeInTheDocument();
            }, { timeout: 1000 });

            // If we should have a leader, wait for it to be added
            if (hasLeader) {
              await waitFor(() => {
                expect(screen.getByText('New Leader')).toBeInTheDocument();
              }, { timeout: 1000 });
            }

            // Check button state
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
      { numRuns: 50 }
    );
  }, 30000); // Increased timeout for async property test

  /**
   * Property 22: Add Leader creates leader weirdo
   * 
   * For any warband without a leader, clicking Add Leader should create a new 
   * weirdo with type 'leader' and default properties.
   * 
   * **Feature: npm-package-upgrade-fixes, Property 22: Add Leader creates leader weirdo**
   * **Validates: Requirements 6.4**
   */
  it('Property 22: Add Leader creates leader weirdo', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate number of existing troopers (0-2) - reduced for performance
        fc.integer({ min: 0, max: 2 }),
        async (numTroopers) => {
          const dataRepository = new DataRepository(':memory:', false);
          const costEngine = new CostEngine();
          const validationService = new ValidationService();

          const { unmount } = render(
            <WarbandProvider
              dataRepository={dataRepository}
              costEngine={costEngine}
              validationService={validationService}
            >
              <WithWarband>
                <WeirdosList />
              </WithWarband>
            </WarbandProvider>
          );

          try {
            // Add troopers by clicking button
            for (let i = 0; i < numTroopers; i++) {
              const addTrooperButton = screen.getByRole('button', { name: /Add Trooper/i });
              fireEvent.click(addTrooperButton);
              await waitFor(() => {
                const trooperCards = screen.getAllByText('New Trooper');
                expect(trooperCards.length).toBe(i + 1);
              }, { timeout: 1000 });
            }

            // Click Add Leader button
            const addLeaderButton = screen.getByRole('button', { name: /Add Leader/i });
            fireEvent.click(addLeaderButton);

            // Wait for leader to be added
            await waitFor(() => {
              expect(screen.getByText('New Leader')).toBeInTheDocument();
            }, { timeout: 1000 });

            // Verify leader type is displayed
            const leaderTypeElements = screen.getAllByText('Leader');
            expect(leaderTypeElements.length).toBeGreaterThan(0);

            // Verify total weirdo count
            const weirdoCards = screen.getAllByRole('button', { name: /Select/ });
            expect(weirdoCards.length).toBe(numTroopers + 1);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000); // Increased timeout for async property test

  /**
   * Property 23: Add Trooper creates trooper weirdo
   * 
   * For any warband, clicking Add Trooper should create a new weirdo with 
   * type 'trooper' and default properties.
   * 
   * **Feature: npm-package-upgrade-fixes, Property 23: Add Trooper creates trooper weirdo**
   * **Validates: Requirements 6.5**
   */
  it('Property 23: Add Trooper creates trooper weirdo', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate whether to include a leader and number of existing troopers (reduced for performance)
        fc.boolean(),
        fc.integer({ min: 0, max: 2 }),
        async (hasLeader, numExistingTroopers) => {
          const dataRepository = new DataRepository(':memory:', false);
          const costEngine = new CostEngine();
          const validationService = new ValidationService();

          const { unmount } = render(
            <WarbandProvider
              dataRepository={dataRepository}
              costEngine={costEngine}
              validationService={validationService}
            >
              <WithWarband>
                <WeirdosList />
              </WithWarband>
            </WarbandProvider>
          );

          try {
            // Add existing weirdos by clicking buttons
            if (hasLeader) {
              const addLeaderButton = screen.getByRole('button', { name: /Add Leader/i });
              fireEvent.click(addLeaderButton);
              await waitFor(() => {
                expect(screen.getByText('New Leader')).toBeInTheDocument();
              }, { timeout: 3000 });
            }
            
            for (let i = 0; i < numExistingTroopers; i++) {
              const addTrooperButton = screen.getByRole('button', { name: /Add Trooper/i });
              fireEvent.click(addTrooperButton);
              await waitFor(() => {
                const trooperCards = screen.getAllByText('New Trooper');
                expect(trooperCards.length).toBe(i + 1);
              }, { timeout: 3000 });
            }

            // Click Add Trooper button to add one more
            const addTrooperButton = screen.getByRole('button', { name: /Add Trooper/i });
            fireEvent.click(addTrooperButton);

            // Wait for new trooper to be added
            await waitFor(() => {
              const trooperElements = screen.getAllByText('New Trooper');
              expect(trooperElements.length).toBe(numExistingTroopers + 1);
            }, { timeout: 3000 });

            // Verify trooper type is displayed
            const trooperTypeElements = screen.getAllByText('Trooper');
            expect(trooperTypeElements.length).toBeGreaterThan(0);

            // Verify total weirdo count
            const totalExpected = (hasLeader ? 1 : 0) + numExistingTroopers + 1;
            const weirdoCards = screen.getAllByRole('button', { name: /Select/ });
            expect(weirdoCards.length).toBe(totalExpected);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000); // Increased timeout for async property test
});
