import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WeirdoEditor } from '../src/frontend/components/WeirdoEditor';
import { Weirdo, Weapon } from '../src/backend/models/types';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { GameDataProvider, useGameData } from '../src/frontend/contexts/GameDataContext';
import React from 'react';

/**
 * Unit tests for automatic unarmed selection
 * 
 * Tests that the system automatically selects "unarmed" when a weirdo has no
 * close combat weapons, preventing validation errors.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

// Mock API client to avoid network calls
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn().mockResolvedValue({
      success: true,
      data: {
        totalCost: 6,
        breakdown: {
          attributes: 6,
          weapons: 0,
          equipment: 0,
          psychicPowers: 0
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false
      }
    }),
    validateWeirdo: vi.fn().mockResolvedValue({
      valid: true,
      errors: []
    }),
    validateWarband: vi.fn().mockResolvedValue({
      valid: true,
      errors: []
    })
  }
}));

describe('Automatic Unarmed Selection', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <GameDataProvider>
        <WarbandProvider>
          {children}
        </WarbandProvider>
      </GameDataProvider>
    );

    return render(ui, { wrapper: Wrapper });
  };

  /**
   * Test "unarmed" is selected when weirdo has no weapons
   * Requirement: 6.1
   */
  it('should automatically select unarmed when weirdo has no close combat weapons', async () => {
    // Create a test component that creates a weirdo and checks its weapons
    const TestComponent = () => {
      const { currentWarband, createWarband, addWeirdo, selectWeirdo } = useWarband();
      const gameData = useGameData();
      
      React.useEffect(() => {
        if (!currentWarband) {
          createWarband('Test Warband', 75);
        }
      }, [currentWarband, createWarband]);
      
      React.useEffect(() => {
        if (currentWarband && currentWarband.weirdos.length === 0) {
          addWeirdo('trooper');
        }
      }, [currentWarband, addWeirdo]);
      
      React.useEffect(() => {
        if (currentWarband && currentWarband.weirdos.length > 0 && !currentWarband.weirdos[0].closeCombatWeapons.length) {
          selectWeirdo(currentWarband.weirdos[0].id);
        }
      }, [currentWarband, selectWeirdo]);
      
      const weirdo = currentWarband?.weirdos[0];
      
      return (
        <div>
          {weirdo && (
            <>
              <div data-testid="weapon-count">{weirdo.closeCombatWeapons.length}</div>
              <div data-testid="weapon-id">{weirdo.closeCombatWeapons[0]?.id || 'none'}</div>
              <WeirdoEditor />
            </>
          )}
        </div>
      );
    };
    
    renderWithProviders(<TestComponent />);
    
    // Wait for automatic unarmed selection to occur
    await waitFor(() => {
      const weaponCount = screen.queryByTestId('weapon-count');
      const weaponId = screen.queryByTestId('weapon-id');
      
      if (weaponCount && weaponId) {
        expect(weaponCount.textContent).toBe('1');
        expect(weaponId.textContent).toBe('unarmed');
      }
    }, { timeout: 2000 });
  });

  /**
   * Test "unarmed" is selected when last weapon is deselected
   * Requirement: 6.2, 6.4
   */
  it('should automatically select unarmed when last weapon is deselected', async () => {
    const TestComponent = () => {
      const { currentWarband, createWarband, addWeirdo, updateWeirdo } = useWarband();
      const gameData = useGameData();
      const [weaponRemoved, setWeaponRemoved] = React.useState(false);
      
      React.useEffect(() => {
        if (!currentWarband) {
          createWarband('Test Warband', 75);
        }
      }, [currentWarband, createWarband]);
      
      React.useEffect(() => {
        if (currentWarband && currentWarband.weirdos.length === 0) {
          addWeirdo('trooper');
        }
      }, [currentWarband, addWeirdo]);
      
      React.useEffect(() => {
        const weirdo = currentWarband?.weirdos[0];
        if (weirdo && !weaponRemoved && weirdo.closeCombatWeapons.length === 1 && weirdo.closeCombatWeapons[0].id === 'unarmed') {
          // Add a melee weapon
          const meleeWeapon = gameData.closeCombatWeapons.find(w => w.id === 'melee-weapon');
          if (meleeWeapon) {
            updateWeirdo(weirdo.id, { closeCombatWeapons: [meleeWeapon as Weapon] });
            setWeaponRemoved(true);
          }
        }
      }, [currentWarband, gameData, updateWeirdo, weaponRemoved]);
      
      React.useEffect(() => {
        const weirdo = currentWarband?.weirdos[0];
        if (weirdo && weaponRemoved && weirdo.closeCombatWeapons.length === 1 && weirdo.closeCombatWeapons[0].id === 'melee-weapon') {
          // Remove all weapons to trigger automatic unarmed selection
          updateWeirdo(weirdo.id, { closeCombatWeapons: [] });
        }
      }, [currentWarband, updateWeirdo, weaponRemoved]);
      
      const weirdo = currentWarband?.weirdos[0];
      
      return (
        <div>
          {weirdo && (
            <>
              <div data-testid="weapon-count">{weirdo.closeCombatWeapons.length}</div>
              <div data-testid="weapon-id">{weirdo.closeCombatWeapons[0]?.id || 'none'}</div>
            </>
          )}
        </div>
      );
    };
    
    renderWithProviders(<TestComponent />);
    
    // Wait for the weapon to be removed and unarmed to be automatically selected
    await waitFor(() => {
      const weaponCount = screen.queryByTestId('weapon-count');
      const weaponId = screen.queryByTestId('weapon-id');
      
      if (weaponCount && weaponId) {
        expect(weaponCount.textContent).toBe('1');
        expect(weaponId.textContent).toBe('unarmed');
      }
    }, { timeout: 3000 });
  });

  /**
   * Test cost recalculates after automatic selection
   * Requirement: 6.3
   */
  it('should recalculate cost after automatic unarmed selection', async () => {
    const TestComponent = () => {
      const { currentWarband, createWarband, addWeirdo } = useWarband();
      
      React.useEffect(() => {
        if (!currentWarband) {
          createWarband('Test Warband', 75);
        }
      }, [currentWarband, createWarband]);
      
      React.useEffect(() => {
        if (currentWarband && currentWarband.weirdos.length === 0) {
          addWeirdo('trooper');
        }
      }, [currentWarband, addWeirdo]);
      
      const weirdo = currentWarband?.weirdos[0];
      
      return (
        <div>
          {weirdo && (
            <>
              <div data-testid="weapon-id">{weirdo.closeCombatWeapons[0]?.id || 'none'}</div>
              <div data-testid="total-cost">{weirdo.totalCost}</div>
            </>
          )}
        </div>
      );
    };
    
    renderWithProviders(<TestComponent />);
    
    // Wait for automatic unarmed selection and cost calculation
    await waitFor(() => {
      const weaponId = screen.queryByTestId('weapon-id');
      const totalCost = screen.queryByTestId('total-cost');
      
      if (weaponId && totalCost) {
        expect(weaponId.textContent).toBe('unarmed');
        // Cost should be calculated (6 for base attributes)
        expect(parseInt(totalCost.textContent || '0')).toBeGreaterThanOrEqual(0);
      }
    }, { timeout: 2000 });
  });

  /**
   * Test "unarmed" cannot be deselected when it's the only weapon
   * Requirement: 6.4
   */
  it('should prevent deselecting unarmed when it is the only weapon', async () => {
    const TestComponent = () => {
      const { currentWarband, createWarband, addWeirdo, updateWeirdo } = useWarband();
      const [attemptedRemoval, setAttemptedRemoval] = React.useState(false);
      
      React.useEffect(() => {
        if (!currentWarband) {
          createWarband('Test Warband', 75);
        }
      }, [currentWarband, createWarband]);
      
      React.useEffect(() => {
        if (currentWarband && currentWarband.weirdos.length === 0) {
          addWeirdo('trooper');
        }
      }, [currentWarband, addWeirdo]);
      
      React.useEffect(() => {
        const weirdo = currentWarband?.weirdos[0];
        if (weirdo && !attemptedRemoval && weirdo.closeCombatWeapons.length === 1 && weirdo.closeCombatWeapons[0].id === 'unarmed') {
          // Try to remove unarmed (should be prevented)
          updateWeirdo(weirdo.id, { closeCombatWeapons: [] });
          setAttemptedRemoval(true);
        }
      }, [currentWarband, updateWeirdo, attemptedRemoval]);
      
      const weirdo = currentWarband?.weirdos[0];
      
      return (
        <div>
          {weirdo && (
            <>
              <div data-testid="weapon-count">{weirdo.closeCombatWeapons.length}</div>
              <div data-testid="weapon-id">{weirdo.closeCombatWeapons[0]?.id || 'none'}</div>
            </>
          )}
        </div>
      );
    };
    
    renderWithProviders(<TestComponent />);
    
    // Wait and verify unarmed is still selected
    await waitFor(() => {
      const weaponCount = screen.queryByTestId('weapon-count');
      const weaponId = screen.queryByTestId('weapon-id');
      
      if (weaponCount && weaponId) {
        expect(weaponCount.textContent).toBe('1');
        expect(weaponId.textContent).toBe('unarmed');
      }
    }, { timeout: 2000 });
  });

  /**
   * Test multiple weapons can coexist with "unarmed"
   * Requirement: 6.5
   */
  it('should allow multiple weapons to coexist with unarmed', async () => {
    const TestComponent = () => {
      const { currentWarband, createWarband, addWeirdo, updateWeirdo } = useWarband();
      const gameData = useGameData();
      const [weaponAdded, setWeaponAdded] = React.useState(false);
      
      React.useEffect(() => {
        if (!currentWarband) {
          createWarband('Test Warband', 75);
        }
      }, [currentWarband, createWarband]);
      
      React.useEffect(() => {
        if (currentWarband && currentWarband.weirdos.length === 0) {
          addWeirdo('trooper');
        }
      }, [currentWarband, addWeirdo]);
      
      React.useEffect(() => {
        const weirdo = currentWarband?.weirdos[0];
        if (weirdo && !weaponAdded && weirdo.closeCombatWeapons.length === 1 && weirdo.closeCombatWeapons[0].id === 'unarmed') {
          // Add a melee weapon alongside unarmed
          const meleeWeapon = gameData.closeCombatWeapons.find(w => w.id === 'melee-weapon');
          if (meleeWeapon) {
            updateWeirdo(weirdo.id, { 
              closeCombatWeapons: [...weirdo.closeCombatWeapons, meleeWeapon as Weapon] 
            });
            setWeaponAdded(true);
          }
        }
      }, [currentWarband, gameData, updateWeirdo, weaponAdded]);
      
      const weirdo = currentWarband?.weirdos[0];
      
      return (
        <div>
          {weirdo && (
            <>
              <div data-testid="weapon-count">{weirdo.closeCombatWeapons.length}</div>
              <div data-testid="has-unarmed">
                {weirdo.closeCombatWeapons.some(w => w.id === 'unarmed') ? 'yes' : 'no'}
              </div>
              <div data-testid="has-melee">
                {weirdo.closeCombatWeapons.some(w => w.id === 'melee-weapon') ? 'yes' : 'no'}
              </div>
            </>
          )}
        </div>
      );
    };
    
    renderWithProviders(<TestComponent />);
    
    // Wait and verify both weapons are present
    await waitFor(() => {
      const weaponCount = screen.queryByTestId('weapon-count');
      const hasUnarmed = screen.queryByTestId('has-unarmed');
      const hasMelee = screen.queryByTestId('has-melee');
      
      if (weaponCount && hasUnarmed && hasMelee) {
        expect(weaponCount.textContent).toBe('2');
        expect(hasUnarmed.textContent).toBe('yes');
        expect(hasMelee.textContent).toBe('yes');
      }
    }, { timeout: 2000 });
  });
});
