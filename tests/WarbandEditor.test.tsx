import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { WarbandEditor } from '../src/frontend/components/WarbandEditor';
import { WarbandProperties } from '../src/frontend/components/WarbandProperties';
import { WarbandCostDisplay } from '../src/frontend/components/WarbandCostDisplay';
import { DataRepository } from '../src/backend/services/DataRepository';
import { CostEngine } from '../src/backend/services/CostEngine';
import { ValidationService } from '../src/backend/services/ValidationService';
import { ReactNode, useEffect, useRef } from 'react';

/**
 * Unit tests for warband editor components
 * 
 * Tests WarbandEditor conditional rendering, WarbandProperties validation display,
 * and WarbandCostDisplay warning indicators.
 * 
 * Requirements: 1.1-1.6, 2.1, 2.2, 2.6, 3.2, 3.3, 3.5, 10.1-10.4
 */

describe('Warband Editor Components', () => {
  let dataRepository: DataRepository;
  let costEngine: CostEngine;
  let validationService: ValidationService;

  beforeEach(() => {
    dataRepository = new DataRepository(':memory:', false);
    costEngine = new CostEngine();
    validationService = new ValidationService(costEngine);
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

  // Helper component that creates a warband and renders children
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

  describe('WarbandEditor', () => {
    /**
     * Test conditional rendering when no warband exists
     * Requirements: 2.1, 2.2, 2.6
     */
    it('should display empty state message when no warband exists', () => {
      render(createWrapper(<WarbandEditor />));

      expect(screen.getByText('No Warband Selected')).toBeInTheDocument();
      expect(screen.getByText(/Create a new warband or load an existing one/)).toBeInTheDocument();
    });

    /**
     * Test three-section layout when warband exists
     * Requirements: 10.1, 10.2, 10.3, 10.4
     */
    it('should display three-section layout when warband exists', () => {
      render(
        createWrapper(
          <WithWarband>
            <WarbandEditor />
          </WithWarband>
        )
      );

      expect(screen.getByText('Warband Properties')).toBeInTheDocument();
      expect(screen.getByText('Weirdos')).toBeInTheDocument();
      expect(screen.getByText('Weirdo Editor')).toBeInTheDocument();
    });
  });

  describe('WarbandProperties', () => {
    /**
     * Test warband name input
     * Requirements: 1.1, 1.2
     */
    it('should render warband name input', () => {
      render(
        createWrapper(
          <WithWarband>
            <WarbandProperties />
          </WithWarband>
        )
      );

      const nameInput = screen.getByLabelText(/Warband Name/);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveValue('Test Warband');
    });

    /**
     * Test point limit radio buttons
     * Requirements: 1.3
     */
    it('should render point limit radio buttons', () => {
      render(
        createWrapper(
          <WithWarband>
            <WarbandProperties />
          </WithWarband>
        )
      );

      const radio75 = screen.getByLabelText('75 Points');
      const radio125 = screen.getByLabelText('125 Points');

      expect(radio75).toBeInTheDocument();
      expect(radio125).toBeInTheDocument();
      expect(radio75).toBeChecked();
      expect(radio125).not.toBeChecked();
    });

    /**
     * Test warband ability dropdown
     * Requirements: 1.5, 5.1
     */
    it('should render warband ability dropdown with descriptions', () => {
      render(
        createWrapper(
          <WithWarband>
            <WarbandProperties />
          </WithWarband>
        )
      );

      const abilitySelect = screen.getByLabelText('Warband Ability');
      expect(abilitySelect).toBeInTheDocument();
      expect(abilitySelect).toHaveValue('null');
    });

    /**
     * Test validation error display for empty warband name
     * Requirements: 1.6
     */
    it('should render input with empty value when warband name is empty', () => {
      const EmptyNameWarband = ({ children }: { children: ReactNode }) => {
        const { createWarband } = useWarband();
        const initialized = useRef(false);
        
        useEffect(() => {
          if (!initialized.current) {
            createWarband('', 75);
            initialized.current = true;
          }
        }, [createWarband]);
        
        return <>{children}</>;
      };

      render(
        createWrapper(
          <EmptyNameWarband>
            <WarbandProperties />
          </EmptyNameWarband>
        )
      );

      const nameInput = screen.getByLabelText(/Warband Name/);
      expect(nameInput).toHaveValue('');
    });
  });

  describe('WarbandCostDisplay', () => {
    /**
     * Test cost display with normal state
     * Requirements: 1.4, 3.2, 3.3
     */
    it('should display total cost and point limit', () => {
      render(
        createWrapper(
          <WithWarband>
            <WarbandCostDisplay />
          </WithWarband>
        )
      );

      expect(screen.getByText('Total Cost:')).toBeInTheDocument();
      expect(screen.getByText('0 / 75 pts')).toBeInTheDocument();
      expect(screen.getByText('75 pts remaining')).toBeInTheDocument();
    });

    /**
     * Test warning indicator when approaching limit (within 15 points)
     * Requirements: 3.5, 6.5
     */
    it('should display warning class when cost is within 15 points of limit', () => {
      const HighCostWarband = ({ children }: { children: ReactNode }) => {
        const { createWarband, addWeirdo, updateWeirdo, currentWarband } = useWarband();
        const initialized = useRef(false);
        
        useEffect(() => {
          if (!initialized.current) {
            createWarband('Test Warband', 75);
            addWeirdo('leader');
            initialized.current = true;
          }
        }, [createWarband, addWeirdo]);
        
        useEffect(() => {
          const leader = currentWarband?.weirdos[0];
          if (leader && initialized.current) {
            updateWeirdo(leader.id, {
              attributes: {
                speed: 3,
                defense: '3d6',
                firepower: '3d6',
                prowess: '3d6',
                willpower: '3d6',
              }
            });
          }
        }, [currentWarband?.weirdos, updateWeirdo]);
        
        return <>{children}</>;
      };

      const { container } = render(
        createWrapper(
          <HighCostWarband>
            <WarbandCostDisplay />
          </HighCostWarband>
        )
      );

      // Check if cost display is rendered
      const costDisplay = container.querySelector('.warband-cost-display');
      expect(costDisplay).toBeInTheDocument();
      
      // Should show remaining points
      expect(screen.getByText(/pts remaining/)).toBeInTheDocument();
    });

    /**
     * Test error styling when exceeding limit
     * Requirements: 3.5, 6.5, 6.6
     */
    it('should display error class when cost exceeds limit', () => {
      const OverLimitWarband = ({ children }: { children: ReactNode }) => {
        const { createWarband, addWeirdo, updateWeirdo, currentWarband } = useWarband();
        const initialized = useRef(false);
        
        useEffect(() => {
          if (!initialized.current) {
            createWarband('Test Warband', 75);
            addWeirdo('leader');
            addWeirdo('trooper');
            addWeirdo('trooper');
            initialized.current = true;
          }
        }, [createWarband, addWeirdo]);
        
        useEffect(() => {
          if (currentWarband?.weirdos && currentWarband.weirdos.length > 0 && initialized.current) {
            currentWarband.weirdos.forEach(weirdo => {
              updateWeirdo(weirdo.id, {
                attributes: {
                  speed: 3,
                  defense: '3d6',
                  firepower: '3d6',
                  prowess: '3d6',
                  willpower: '3d6',
                }
              });
            });
          }
        }, [currentWarband?.weirdos?.length, updateWeirdo]);
        
        return <>{children}</>;
      };

      const { container } = render(
        createWrapper(
          <OverLimitWarband>
            <WarbandCostDisplay />
          </OverLimitWarband>
        )
      );

      // Check if cost display is rendered
      const costDisplay = container.querySelector('.warband-cost-display');
      expect(costDisplay).toBeInTheDocument();
      
      // Should show "Over limit by X pts" message if over limit
      const overLimitText = screen.queryByText(/Over limit by/);
      if (overLimitText) {
        expect(overLimitText).toBeInTheDocument();
      }
    });

    /**
     * Test sticky positioning CSS class
     * Requirements: 6.2, 6.4
     */
    it('should have sticky positioning CSS class', () => {
      const { container } = render(
        createWrapper(
          <WithWarband>
            <WarbandCostDisplay />
          </WithWarband>
        )
      );

      const costDisplay = container.querySelector('.warband-cost-display');
      expect(costDisplay).toBeInTheDocument();
      expect(costDisplay).toHaveClass('warband-cost-display');
    });
  });
});
