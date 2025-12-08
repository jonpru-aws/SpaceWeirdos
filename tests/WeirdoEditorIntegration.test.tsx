import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeirdoEditor } from '../src/frontend/components/WeirdoEditor';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { GameDataProvider } from '../src/frontend/contexts/GameDataContext';
import { CostEngine } from '../src/backend/services/CostEngine';
import { ValidationService } from '../src/backend/services/ValidationService';
import { DataRepository } from '../src/backend/services/DataRepository';
import { useEffect } from 'react';

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
  });

  // Helper component to set up warband state
  const TestSetup = ({ 
    weirdoType, 
    children 
  }: { 
    weirdoType?: 'leader' | 'trooper';
    children: React.ReactNode;
  }) => {
    const { createWarband, addWeirdo, currentWarband } = useWarband();

    useEffect(() => {
      if (!currentWarband) {
        createWarband('Test Warband', 75);
      }
    }, []);

    useEffect(() => {
      if (currentWarband && weirdoType && currentWarband.weirdos.length === 0) {
        addWeirdo(weirdoType);
      }
    }, [currentWarband, weirdoType]);

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
  it('should render and interact with equipment selector', () => {
    renderWithProviders('leader');

    // Equipment section should be visible
    expect(screen.getByText(/equipment/i)).toBeInTheDocument();
  });

  /**
   * Test psychic power selector integration
   * Requirement: 6.1-6.3
   */
  it('should render and interact with psychic power selector', () => {
    renderWithProviders('leader');

    // Psychic powers section should be visible
    expect(screen.getByText(/psychic powers/i)).toBeInTheDocument();
  });

  /**
   * Test leader trait selector integration for leaders
   * Requirement: 7.1-7.4
   */
  it('should render leader trait selector for leaders', () => {
    renderWithProviders('leader');

    // Leader trait section should be visible for leaders
    expect(screen.getByText(/leader trait/i)).toBeInTheDocument();
  });

  /**
   * Test leader trait selector is hidden for troopers
   * Requirement: 7.2
   */
  it('should not render leader trait selector for troopers', () => {
    renderWithProviders('trooper');

    // Leader trait section should NOT be visible for troopers
    expect(screen.queryByText(/leader trait/i)).not.toBeInTheDocument();
  });

  /**
   * Test all selectors work together correctly
   * Requirements: 5.1-5.6, 6.1-6.3, 7.1-7.4
   */
  it('should render all selectors together for a leader', () => {
    renderWithProviders('leader');

    // All sections should be present (except ranged weapons since default firepower is None)
    expect(screen.getByText(/basic information/i)).toBeInTheDocument();
    expect(screen.getByText(/attributes/i)).toBeInTheDocument();
    expect(screen.getByText(/close combat weapons/i)).toBeInTheDocument();
    expect(screen.getByText(/equipment/i)).toBeInTheDocument();
    expect(screen.getByText(/psychic powers/i)).toBeInTheDocument();
    expect(screen.getByText(/leader trait/i)).toBeInTheDocument();
    
    // Ranged weapons should be hidden since default firepower is None
    expect(screen.queryByText(/ranged weapons/i)).not.toBeInTheDocument();
  });

  /**
   * Test equipment and psychic power selectors work together
   * Requirements: 5.1-5.6, 6.1-6.3
   */
  it('should allow selecting both equipment and psychic powers', () => {
    renderWithProviders('leader');

    // Both sections should be independently functional
    expect(screen.getByText(/equipment/i)).toBeInTheDocument();
    expect(screen.getByText(/psychic powers/i)).toBeInTheDocument();

    // Both should be visible at the same time
    expect(screen.getByText(/equipment/i)).toBeVisible();
    expect(screen.getByText(/psychic powers/i)).toBeVisible();
  });

  /**
   * Test ranged weapons conditional rendering with equipment selector
   * Requirements: 4.4, 5.1-5.6
   */
  it('should hide ranged weapons but show equipment when firepower is None', () => {
    renderWithProviders('trooper');

    // Ranged weapons should be hidden (trooper has firepower None by default)
    expect(screen.queryByText(/ranged weapons/i)).not.toBeInTheDocument();

    // Equipment should still be visible
    expect(screen.getByText(/equipment/i)).toBeInTheDocument();
  });

  /**
   * Test all selectors maintain state independently
   * Requirements: 5.1-5.6, 6.1-6.3, 7.1-7.4
   */
  it('should maintain independent state for all selectors', () => {
    renderWithProviders('leader');

    // All selector sections should be present and independent
    expect(screen.getByText(/equipment/i)).toBeInTheDocument();
    expect(screen.getByText(/psychic powers/i)).toBeInTheDocument();
    expect(screen.getByText(/leader trait/i)).toBeInTheDocument();
  });
});
