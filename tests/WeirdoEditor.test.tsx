import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { WeirdoEditor } from '../src/frontend/components/WeirdoEditor';
import { Weirdo, WarbandAbility } from '../src/backend/models/types';
import { apiClient } from '../src/frontend/services/apiClient';
import { renderWithProviders } from './testHelpers';

/**
 * Unit tests for WeirdoEditorComponent
 * 
 * Requirements: 2.1-2.17, 3.1-3.5, 4.1-4.4, 5.1-5.3, 6.1-6.3, 7.1-7.8, 9.4, 15.1-15.4
 */

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCost: vi.fn(),
    validate: vi.fn()
  }
}));

// Mock fetch for game data
global.fetch = vi.fn();

const mockCloseCombatWeapons = [
  { id: 'unarmed', name: 'Unarmed', type: 'close', baseCost: 0, maxActions: 3, notes: '' },
  { id: 'melee-weapon', name: 'Melee Weapon', type: 'close', baseCost: 1, maxActions: 2, notes: '' }
];

const mockRangedWeapons = [
  { id: 'auto-pistol', name: 'Auto Pistol', type: 'ranged', baseCost: 0, maxActions: 3, notes: '' },
  { id: 'auto-rifle', name: 'Auto Rifle', type: 'ranged', baseCost: 1, maxActions: 3, notes: '' }
];

const mockEquipment = [
  { id: 'cybernetics', name: 'Cybernetics', type: 'Passive', baseCost: 1, effect: '+1 to Power rolls' },
  { id: 'grenade', name: 'Grenade', type: 'Action', baseCost: 1, effect: 'Blast AOE' }
];

const mockPsychicPowers = [
  { id: 'fear', name: 'Fear', type: 'Attack', cost: 1, effect: 'Fear effect' },
  { id: 'healing', name: 'Healing', type: 'Effect', cost: 1, effect: 'Healing effect' }
];

const mockLeaderTraits = [
  { id: 'bounty-hunter', name: 'Bounty Hunter', description: 'Bounty hunter ability' },
  { id: 'healer', name: 'Healer', description: 'Healer ability' }
];

const createMockWeirdo = (type: 'leader' | 'trooper'): Weirdo => ({
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
  totalCost: 0
});

describe('WeirdoEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch responses for game data
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('closeCombatWeapons.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCloseCombatWeapons) });
      }
      if (url.includes('rangedWeapons.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRangedWeapons) });
      }
      if (url.includes('equipment.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockEquipment) });
      }
      if (url.includes('psychicPowers.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPsychicPowers) });
      }
      if (url.includes('leaderTraits.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockLeaderTraits) });
      }
      if (url.includes('warbandAbilities.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('attributes.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ speed: [], defense: [], firepower: [], prowess: [], willpower: [] }) });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Mock API responses
    (apiClient.calculateCost as any).mockResolvedValue({ cost: 10 });
    (apiClient.validate as any).mockResolvedValue({ valid: true, errors: [] });
  });

  /**
   * Test creating new weirdo
   * Requirements: 2.1, 7.1
   */
  it('should render weirdo editor with initial weirdo data', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Leader')).toBeInTheDocument();
    });

    expect(screen.getByText(/Edit.*Leader/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toHaveValue('Test Leader');
  });

  /**
   * Test editing existing weirdo
   * Requirements: 2.1, 7.1
   */
  it('should allow editing weirdo name', async () => {
    const mockWeirdo = createMockWeirdo('trooper');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Trooper')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Trooper' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated Trooper'
      })
    );
  });

  /**
   * Test changing attributes
   * Requirements: 2.1, 2.2, 7.2, 15.1
   */
  it('should allow changing attributes and recalculate cost', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Speed/i)).toBeInTheDocument();
    });

    const speedSelect = screen.getByLabelText(/Speed/i);
    fireEvent.change(speedSelect, { target: { value: '2' } });

    await waitFor(() => {
      expect(apiClient.calculateCost).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  /**
   * Test adding/removing weapons
   * Requirements: 3.1, 3.2, 3.3, 7.3, 7.4, 15.1
   */
  it('should allow adding close combat weapons', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Close Combat Weapons')).toBeInTheDocument();
    });

    const addWeaponSelect = screen.getAllByRole('combobox').find(
      select => select.id === 'add-cc-weapon'
    );
    
    if (addWeaponSelect) {
      fireEvent.change(addWeaponSelect, { target: { value: 'unarmed' } });

      await waitFor(() => {
        expect(apiClient.calculateCost).toHaveBeenCalled();
      });
    }
  });

  it('should allow removing close combat weapons', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    mockWeirdo.closeCombatWeapons = [mockCloseCombatWeapons[0]];
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Unarmed')).toBeInTheDocument();
    });

    const removeButton = screen.getAllByText('Remove')[0];
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(apiClient.calculateCost).toHaveBeenCalled();
    });
  });

  it('should allow adding ranged weapons', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Ranged Weapons')).toBeInTheDocument();
    });

    const addWeaponSelect = screen.getAllByRole('combobox').find(
      select => select.id === 'add-ranged-weapon'
    );
    
    if (addWeaponSelect) {
      fireEvent.change(addWeaponSelect, { target: { value: 'auto-pistol' } });

      await waitFor(() => {
        expect(apiClient.calculateCost).toHaveBeenCalled();
      });
    }
  });

  /**
   * Test adding/removing equipment
   * Requirements: 4.1, 4.2, 4.4, 7.5, 7.6, 15.1
   */
  it('should allow adding equipment up to limit', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Equipment \(Max: 3\)/i)).toBeInTheDocument();
    });

    const addEquipmentSelect = screen.getAllByRole('combobox').find(
      select => select.id === 'add-equipment'
    );
    
    if (addEquipmentSelect) {
      fireEvent.change(addEquipmentSelect, { target: { value: 'cybernetics' } });

      await waitFor(() => {
        expect(apiClient.calculateCost).toHaveBeenCalled();
      });
    }
  });

  /**
   * Test equipment limits
   * Requirements: 4.1, 4.2, 4.4, 7.5, 7.6
   */
  it('should enforce equipment limits for leaders with Cyborgs ability', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Equipment \(Max: 3\)/i)).toBeInTheDocument();
    });
  });

  it('should enforce equipment limits for leaders without Cyborgs ability', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Soldiers"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Equipment \(Max: 2\)/i)).toBeInTheDocument();
    });
  });

  it('should enforce equipment limits for troopers', async () => {
    const mockWeirdo = createMockWeirdo('trooper');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Soldiers"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Equipment \(Max: 1\)/i)).toBeInTheDocument();
    });
  });

  /**
   * Test adding/removing psychic powers
   * Requirements: 5.1, 5.2, 5.3, 7.7, 15.1
   */
  it('should allow adding psychic powers', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Psychic Powers')).toBeInTheDocument();
    });

    const addPowerSelect = screen.getAllByRole('combobox').find(
      select => select.id === 'add-psychic-power'
    );
    
    if (addPowerSelect) {
      fireEvent.change(addPowerSelect, { target: { value: 'fear' } });

      await waitFor(() => {
        expect(apiClient.calculateCost).toHaveBeenCalled();
      });
    }
  });

  it('should allow removing psychic powers', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    mockWeirdo.psychicPowers = [mockPsychicPowers[0]];
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Fear')).toBeInTheDocument();
    });

    const removeButton = screen.getAllByText('Remove').find(
      btn => btn.closest('.item')?.textContent?.includes('Fear')
    );
    
    if (removeButton) {
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(apiClient.calculateCost).toHaveBeenCalled();
      });
    }
  });

  /**
   * Test leader trait selection
   * Requirements: 6.1, 6.2, 6.3
   */
  it('should allow leader to select a trait', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Leader Trait (Optional)')).toBeInTheDocument();
    });

    const traitSelect = screen.getByLabelText(/Trait/i);
    fireEvent.change(traitSelect, { target: { value: 'Bounty Hunter' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        leaderTrait: 'Bounty Hunter'
      })
    );
  });

  it('should not show leader trait section for troopers', async () => {
    const mockWeirdo = createMockWeirdo('trooper');
    const mockOnChange = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Edit.*Trooper/)).toBeInTheDocument();
    });

    expect(screen.queryByText('Leader Trait (Optional)')).not.toBeInTheDocument();
  });

  /**
   * Test validation errors
   * Requirements: 15.3
   */
  it('should display validation errors', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();

    (apiClient.validate as any).mockResolvedValue({
      valid: false,
      errors: [
        { field: 'closeCombatWeapons', message: 'At least one close combat weapon required', code: 'MISSING_CC_WEAPON' }
      ]
    });

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    // Trigger validation by changing an attribute
    await waitFor(() => {
      expect(screen.getByLabelText(/Speed/i)).toBeInTheDocument();
    });

    const speedSelect = screen.getByLabelText(/Speed/i);
    fireEvent.change(speedSelect, { target: { value: '2' } });

    await waitFor(() => {
      expect(screen.getByText(/At least one close combat weapon required/i)).toBeInTheDocument();
    });
  });

  /**
   * Test cost calculations
   * Requirements: 15.1, 15.2, 15.3, 15.4
   */
  it('should display real-time cost calculations', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    mockWeirdo.totalCost = 15;
    const mockOnChange = vi.fn();

    (apiClient.calculateCost as any).mockResolvedValue({ cost: 15 });

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('15 pts')).toBeInTheDocument();
    });
  });

  it('should show warning when approaching point limit', async () => {
    const mockWeirdo = createMockWeirdo('trooper');
    mockWeirdo.totalCost = 19;
    const mockOnChange = vi.fn();

    (apiClient.calculateCost as any).mockResolvedValue({ cost: 19 });

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Approaching limit/i)).toBeInTheDocument();
    });
  });

  it('should show error when exceeding point limit', async () => {
    const mockWeirdo = createMockWeirdo('trooper');
    mockWeirdo.totalCost = 21;
    const mockOnChange = vi.fn();

    (apiClient.calculateCost as any).mockResolvedValue({ cost: 21 });

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Exceeds 20 point limit/i)).toBeInTheDocument();
    });
  });

  it('should handle close button click', async () => {
    const mockWeirdo = createMockWeirdo('leader');
    const mockOnChange = vi.fn();
    const mockOnClose = vi.fn();

    renderWithProviders(
      <WeirdoEditor
        weirdo={mockWeirdo}
        warbandAbility="Cyborgs"
        onChange={mockOnChange}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Edit.*Leader/)).toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  /**
   * Integration Tests for WeirdoEditor Component Composition
   * Requirements: 4.3
   */
  describe('Integration: Component Composition', () => {
    it('should render all sub-components together', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      const mockOnChange = vi.fn();

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        // WeirdoCostDisplay
        expect(screen.getByTestId('weirdo-cost')).toBeInTheDocument();
        
        // WeirdoBasicInfo
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        
        // AttributeSelector
        expect(screen.getByLabelText(/Speed/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Defense/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Firepower/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Prowess/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Willpower/i)).toBeInTheDocument();
        
        // WeaponSelector
        expect(screen.getByText('Close Combat Weapons')).toBeInTheDocument();
        expect(screen.getByText('Ranged Weapons')).toBeInTheDocument();
        
        // EquipmentSelector
        expect(screen.getByText(/Equipment \(Max:/)).toBeInTheDocument();
        
        // PsychicPowerSelector
        expect(screen.getByText('Psychic Powers')).toBeInTheDocument();
        
        // LeaderTraitSelector (only for leaders)
        expect(screen.getByText('Leader Trait (Optional)')).toBeInTheDocument();
      });
    });

    it('should render trooper-specific component composition', async () => {
      const mockWeirdo = createMockWeirdo('trooper');
      const mockOnChange = vi.fn();

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Soldiers"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Edit.*Trooper/)).toBeInTheDocument();
      });

      // Should have all components except LeaderTraitSelector
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Speed/i)).toBeInTheDocument();
      expect(screen.getByText('Close Combat Weapons')).toBeInTheDocument();
      expect(screen.queryByText('Leader Trait (Optional)')).not.toBeInTheDocument();
    });
  });

  /**
   * Integration Tests for Data Flow Between Sub-Components
   * Requirements: 4.3
   */
  describe('Integration: Data Flow', () => {
    it('should propagate attribute changes through all components', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      const mockOnChange = vi.fn();

      (apiClient.calculateCost as any).mockResolvedValue({ cost: 12 });

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Speed/i)).toBeInTheDocument();
      });

      // Change attribute in AttributeSelector
      const speedSelect = screen.getByLabelText(/Speed/i);
      fireEvent.change(speedSelect, { target: { value: '2' } });

      // Should trigger cost recalculation
      await waitFor(() => {
        expect(apiClient.calculateCost).toHaveBeenCalledWith(
          expect.objectContaining({
            weirdo: expect.objectContaining({
              attributes: expect.objectContaining({
                speed: 2
              })
            })
          })
        );
      });

      // Should update WeirdoCostDisplay
      await waitFor(() => {
        expect(screen.getByText('12 pts')).toBeInTheDocument();
      });

      // Should call onChange with updated weirdo
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            speed: 2
          }),
          totalCost: 12
        })
      );
    });

    it('should propagate weapon changes through cost display', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      const mockOnChange = vi.fn();

      (apiClient.calculateCost as any).mockResolvedValue({ cost: 11 });

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Close Combat Weapons')).toBeInTheDocument();
      });

      // Add weapon in WeaponSelector
      const addWeaponSelect = screen.getAllByRole('combobox').find(
        select => select.id === 'add-cc-weapon'
      );
      
      if (addWeaponSelect) {
        fireEvent.change(addWeaponSelect, { target: { value: 'melee-weapon' } });

        // Should trigger cost recalculation
        await waitFor(() => {
          expect(apiClient.calculateCost).toHaveBeenCalledWith(
            expect.objectContaining({
              weirdo: expect.objectContaining({
                closeCombatWeapons: expect.arrayContaining([
                  expect.objectContaining({ id: 'melee-weapon' })
                ])
              })
            })
          );
        });

        // Should update cost display
        await waitFor(() => {
          expect(screen.getByText('11 pts')).toBeInTheDocument();
        });
      }
    });

    it('should propagate equipment changes through cost display', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      const mockOnChange = vi.fn();

      (apiClient.calculateCost as any).mockResolvedValue({ cost: 11 });

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Equipment \(Max:/)).toBeInTheDocument();
      });

      // Add equipment in EquipmentSelector
      const addEquipmentSelect = screen.getAllByRole('combobox').find(
        select => select.id === 'add-equipment'
      );
      
      if (addEquipmentSelect) {
        fireEvent.change(addEquipmentSelect, { target: { value: 'cybernetics' } });

        // Should trigger cost recalculation
        await waitFor(() => {
          expect(apiClient.calculateCost).toHaveBeenCalledWith(
            expect.objectContaining({
              weirdo: expect.objectContaining({
                equipment: expect.arrayContaining([
                  expect.objectContaining({ id: 'cybernetics' })
                ])
              })
            })
          );
        });

        // Should update cost display
        await waitFor(() => {
          expect(screen.getByText('11 pts')).toBeInTheDocument();
        });
      }
    });

    it('should update firepower in AttributeSelector and enable ranged weapons in WeaponSelector', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      const mockOnChange = vi.fn();

      (apiClient.calculateCost as any).mockResolvedValue({ cost: 12 });

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Firepower/i)).toBeInTheDocument();
      });

      // Initially, ranged weapons should be disabled
      const rangedWeaponSelect = screen.getAllByRole('combobox').find(
        select => select.id === 'add-ranged-weapon'
      ) as HTMLSelectElement;
      
      expect(rangedWeaponSelect).toBeDisabled();

      // Change firepower to enable ranged weapons
      const firepowerSelect = screen.getByLabelText(/Firepower/i);
      fireEvent.change(firepowerSelect, { target: { value: '2d8' } });

      // Should trigger cost recalculation
      await waitFor(() => {
        expect(apiClient.calculateCost).toHaveBeenCalled();
      });

      // Ranged weapons should now be enabled
      await waitFor(() => {
        const updatedRangedWeaponSelect = screen.getAllByRole('combobox').find(
          select => select.id === 'add-ranged-weapon'
        ) as HTMLSelectElement;
        expect(updatedRangedWeaponSelect).not.toBeDisabled();
      });
    });

    it('should propagate name changes from WeirdoBasicInfo to parent', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      const mockOnChange = vi.fn();

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Change name in WeirdoBasicInfo
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'New Leader Name' } });

      // Should call onChange with updated name
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Leader Name'
        })
      );
    });
  });

  /**
   * Integration Tests for User Interactions Across Multiple Sub-Components
   * Requirements: 4.3
   */
  describe('Integration: User Interactions', () => {
    it('should handle complete weirdo creation workflow', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      const mockOnChange = vi.fn();

      (apiClient.calculateCost as any).mockResolvedValue({ cost: 15 });

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      });

      // Step 1: Set name
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Captain Steel' } });

      // Step 2: Set attributes
      const speedSelect = screen.getByLabelText(/Speed/i);
      fireEvent.change(speedSelect, { target: { value: '2' } });

      await waitFor(() => {
        expect(apiClient.calculateCost).toHaveBeenCalled();
      });

      // Step 3: Add weapon
      const addWeaponSelect = screen.getAllByRole('combobox').find(
        select => select.id === 'add-cc-weapon'
      );
      
      if (addWeaponSelect) {
        fireEvent.change(addWeaponSelect, { target: { value: 'melee-weapon' } });

        await waitFor(() => {
          expect(screen.getByText('Melee Weapon')).toBeInTheDocument();
        });
      }

      // Step 4: Add equipment
      const addEquipmentSelect = screen.getAllByRole('combobox').find(
        select => select.id === 'add-equipment'
      );
      
      if (addEquipmentSelect) {
        fireEvent.change(addEquipmentSelect, { target: { value: 'cybernetics' } });

        await waitFor(() => {
          expect(screen.getByText('Cybernetics')).toBeInTheDocument();
        });
      }

      // Verify all changes were propagated
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Captain Steel',
          attributes: expect.objectContaining({
            speed: 2
          }),
          closeCombatWeapons: expect.arrayContaining([
            expect.objectContaining({ id: 'melee-weapon' })
          ]),
          equipment: expect.arrayContaining([
            expect.objectContaining({ id: 'cybernetics' })
          ])
        })
      );
    });

    it('should handle removing items and updating cost', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      mockWeirdo.closeCombatWeapons = [mockCloseCombatWeapons[0], mockCloseCombatWeapons[1]];
      mockWeirdo.equipment = [mockEquipment[0]];
      const mockOnChange = vi.fn();

      (apiClient.calculateCost as any).mockResolvedValue({ cost: 8 });

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Unarmed')).toBeInTheDocument();
        expect(screen.getByText('Melee Weapon')).toBeInTheDocument();
        expect(screen.getByText('Cybernetics')).toBeInTheDocument();
      });

      // Remove a weapon
      const removeButtons = screen.getAllByText('Remove');
      const weaponRemoveButton = removeButtons.find(
        btn => btn.closest('.item')?.textContent?.includes('Melee Weapon')
      );
      
      if (weaponRemoveButton) {
        fireEvent.click(weaponRemoveButton);

        await waitFor(() => {
          expect(apiClient.calculateCost).toHaveBeenCalled();
          expect(screen.queryByText('Melee Weapon')).not.toBeInTheDocument();
        });
      }

      // Remove equipment
      const equipmentRemoveButton = removeButtons.find(
        btn => btn.closest('.item')?.textContent?.includes('Cybernetics')
      );
      
      if (equipmentRemoveButton) {
        fireEvent.click(equipmentRemoveButton);

        await waitFor(() => {
          expect(apiClient.calculateCost).toHaveBeenCalled();
          expect(screen.queryByText('Cybernetics')).not.toBeInTheDocument();
        });
      }

      // Verify cost was updated
      await waitFor(() => {
        expect(screen.getByText('8 pts')).toBeInTheDocument();
      });
    });

    it('should handle leader trait selection and display', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      const mockOnChange = vi.fn();

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Leader Trait (Optional)')).toBeInTheDocument();
      });

      // Select a leader trait
      const traitSelect = screen.getByLabelText(/Trait/i);
      fireEvent.change(traitSelect, { target: { value: 'Bounty Hunter' } });

      // Should update weirdo with trait
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          leaderTrait: 'Bounty Hunter'
        })
      );

      // Should display trait description
      await waitFor(() => {
        const description = screen.getByText(/Bounty hunter ability/i, { selector: 'p.trait-description' });
        expect(description).toBeInTheDocument();
      });
    });

    it('should handle warband ability affecting multiple sub-components', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      const mockOnChange = vi.fn();

      (apiClient.calculateCost as any).mockResolvedValue({ cost: 10 });

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Mutants"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Speed/i)).toBeInTheDocument();
      });

      // Mutants ability should affect AttributeSelector (speed discount)
      const speedSelect = screen.getByLabelText(/Speed/i);
      const speedOptions = speedSelect.querySelectorAll('option');
      const speed2Option = Array.from(speedOptions).find(opt => opt.textContent?.includes('2 (0 pts, was 1 pts)'));
      expect(speed2Option).toBeInTheDocument();

      // Mutants ability should affect WeaponSelector (mutant weapon discount)
      // This would be visible in the weapon dropdown options
      const addWeaponSelect = screen.getAllByRole('combobox').find(
        select => select.id === 'add-cc-weapon'
      );
      expect(addWeaponSelect).toBeInTheDocument();
    });

    it('should enforce equipment limits based on weirdo type and warband ability', async () => {
      const mockWeirdo = createMockWeirdo('leader');
      mockWeirdo.equipment = [mockEquipment[0], mockEquipment[1]];
      const mockOnChange = vi.fn();

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Equipment \(Max: 3\)/i)).toBeInTheDocument();
      });

      // Should allow adding one more equipment (leader with Cyborgs = 3 max)
      const addEquipmentSelect = screen.getAllByRole('combobox').find(
        select => select.id === 'add-equipment'
      );
      
      if (addEquipmentSelect) {
        fireEvent.change(addEquipmentSelect, { target: { value: 'cybernetics' } });

        await waitFor(() => {
          expect(apiClient.calculateCost).toHaveBeenCalled();
        });
      }
    });

    it('should show cost warnings when approaching limits', async () => {
      const mockWeirdo = createMockWeirdo('trooper');
      mockWeirdo.totalCost = 19;
      const mockOnChange = vi.fn();

      (apiClient.calculateCost as any).mockResolvedValue({ cost: 19 });

    renderWithProviders(
        <WeirdoEditor
          weirdo={mockWeirdo}
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('19 pts')).toBeInTheDocument();
        expect(screen.getByText(/Approaching limit/i)).toBeInTheDocument();
      });

      // Add more equipment to exceed limit
      (apiClient.calculateCost as any).mockResolvedValue({ cost: 21 });

      const addEquipmentSelect = screen.getAllByRole('combobox').find(
        select => select.id === 'add-equipment'
      );
      
      if (addEquipmentSelect) {
        fireEvent.change(addEquipmentSelect, { target: { value: 'cybernetics' } });

        await waitFor(() => {
          expect(screen.getByText('21 pts')).toBeInTheDocument();
          expect(screen.getByText(/Exceeds 20 point limit/i)).toBeInTheDocument();
        });
      }
    });
  });
});

/**
 * Property-Based Tests for Performance Optimization Preservation
 * 
 * **Feature: code-refactoring, Property 5: Performance optimizations preserve functionality**
 * **Validates: Requirements 9.4**
 */

import * as fc from 'fast-check';

describe('Property-Based Tests: Performance Optimizations Preserve Functionality', () => {
  /**
   * Generator for valid weirdo data
   */
  const weirdoArbitrary = fc.record({
    id: fc.hexaString({ minLength: 1, maxLength: 10 }),
    name: fc.stringOf(
      fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' '),
      { minLength: 3, maxLength: 30 }
    ).map(s => s.trim() || 'Weirdo'),
    type: fc.constantFrom('leader', 'trooper'),
    attributes: fc.record({
      speed: fc.integer({ min: 1, max: 3 }),
      defense: fc.constantFrom('2d6', '2d8', '2d10'),
      firepower: fc.constantFrom('None', '2d6', '2d8', '2d10'),
      prowess: fc.constantFrom('2d6', '2d8', '2d10'),
      willpower: fc.constantFrom('2d6', '2d8', '2d10'),
    }),
    closeCombatWeapons: fc.constant([]),
    rangedWeapons: fc.constant([]),
    equipment: fc.constant([]),
    psychicPowers: fc.constant([]),
    leaderTrait: fc.constant(null),
    notes: fc.constant(''),
    totalCost: fc.integer({ min: 0, max: 50 }),
  });

  const warbandAbilityArbitrary = fc.constantFrom(
    'Cyborgs', 'Fanatics', 'Living Weapons', 'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
  );

  it('should render correctly with performance optimizations for any valid weirdo', async () => {
    /**
     * Property: For any valid weirdo and warband ability, the WeirdoEditor component
     * with performance optimizations (useMemo, useCallback) should:
     * 1. Render all weirdo data correctly
     * 2. Display correct cost
     * 3. Allow attribute changes
     * 4. Maintain correct equipment limits based on type and ability
     */
    await fc.assert(
      fc.asyncProperty(
        weirdoArbitrary,
        warbandAbilityArbitrary,
        async (weirdo, warbandAbility) => {
          const mockOnChange = vi.fn();
          
          // Mock API responses
          (apiClient.calculateCost as any).mockResolvedValue({ cost: weirdo.totalCost });
          (apiClient.validate as any).mockResolvedValue({ valid: true, errors: [] });

          const { unmount } = renderWithProviders(
            <WeirdoEditor
              weirdo={weirdo as Weirdo}
              warbandAbility={warbandAbility as WarbandAbility}
              onChange={mockOnChange}
            />
          );

          try {
            // 1. Verify weirdo data is rendered correctly
            await waitFor(() => {
              expect(screen.getByDisplayValue(weirdo.name)).toBeInTheDocument();
            });

            const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
            expect(nameInput.value).toBe(weirdo.name);

            // 2. Verify cost display
            expect(screen.getByText(`${weirdo.totalCost} pts`)).toBeInTheDocument();

            // 3. Verify attributes are rendered
            const speedSelect = screen.getByLabelText(/Speed/i) as HTMLSelectElement;
            expect(speedSelect.value).toBe(String(weirdo.attributes.speed));

            const defenseSelect = screen.getByLabelText(/Defense/i) as HTMLSelectElement;
            expect(defenseSelect.value).toBe(weirdo.attributes.defense);

            // 4. Verify equipment limit is calculated correctly (useMemo optimization)
            const expectedMaxEquipment = weirdo.type === 'leader' 
              ? (warbandAbility === 'Cyborgs' ? 3 : 2)
              : (warbandAbility === 'Cyborgs' ? 2 : 1);
            
            const equipmentHeader = screen.getByText(new RegExp(`Equipment \\(Max: ${expectedMaxEquipment}\\)`));
            expect(equipmentHeader).toBeInTheDocument();

            // 5. Verify leader trait section visibility
            if (weirdo.type === 'leader') {
              expect(screen.getByText('Leader Trait (Optional)')).toBeInTheDocument();
            } else {
              expect(screen.queryByText('Leader Trait (Optional)')).not.toBeInTheDocument();
            }

            // 6. Test that useCallback optimized handlers work correctly
            // Change name (tests handleNameChange callback)
            fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
            expect(mockOnChange).toHaveBeenCalledWith(
              expect.objectContaining({
                name: 'Updated Name'
              })
            );

            // Change attribute (tests handleAttributeChange callback)
            const newSpeed = weirdo.attributes.speed === 3 ? 2 : weirdo.attributes.speed + 1;
            fireEvent.change(speedSelect, { target: { value: String(newSpeed) } });
            
            await waitFor(() => {
              expect(apiClient.calculateCost).toHaveBeenCalled();
            });

          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should handle equipment operations correctly with performance optimizations', async () => {
    /**
     * Property: For any valid weirdo, equipment operations (add/remove) should work
     * correctly with useCallback optimizations
     */
    await fc.assert(
      fc.asyncProperty(
        weirdoArbitrary,
        warbandAbilityArbitrary,
        async (weirdo, warbandAbility) => {
          const mockOnChange = vi.fn();
          
          // Mock API responses
          (apiClient.calculateCost as any).mockResolvedValue({ cost: weirdo.totalCost + 1 });
          (apiClient.validate as any).mockResolvedValue({ valid: true, errors: [] });

          const { unmount } = renderWithProviders(
            <WeirdoEditor
              weirdo={weirdo as Weirdo}
              warbandAbility={warbandAbility as WarbandAbility}
              onChange={mockOnChange}
            />
          );

          try {
            await waitFor(() => {
              expect(screen.getByDisplayValue(weirdo.name)).toBeInTheDocument();
            });

            // Calculate expected max equipment (tests useMemo optimization)
            const expectedMaxEquipment = weirdo.type === 'leader' 
              ? (warbandAbility === 'Cyborgs' ? 3 : 2)
              : 1;

            // Only test adding equipment if under limit
            if (weirdo.equipment.length < expectedMaxEquipment) {
              const addEquipmentSelect = screen.getAllByRole('combobox').find(
                select => select.id === 'add-equipment'
              );
              
              if (addEquipmentSelect) {
                // Test handleAddEquipment callback
                fireEvent.change(addEquipmentSelect, { target: { value: 'cybernetics' } });

                await waitFor(() => {
                  expect(apiClient.calculateCost).toHaveBeenCalled();
                  expect(mockOnChange).toHaveBeenCalled();
                });
              }
            }

          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should handle weapon operations correctly with performance optimizations', async () => {
    /**
     * Property: For any valid weirdo, weapon operations (add/remove) should work
     * correctly with useCallback optimizations
     */
    await fc.assert(
      fc.asyncProperty(
        weirdoArbitrary,
        warbandAbilityArbitrary,
        async (weirdo, warbandAbility) => {
          const mockOnChange = vi.fn();
          
          // Mock API responses
          (apiClient.calculateCost as any).mockResolvedValue({ cost: weirdo.totalCost + 1 });
          (apiClient.validate as any).mockResolvedValue({ valid: true, errors: [] });

          const { unmount } = renderWithProviders(
            <WeirdoEditor
              weirdo={weirdo as Weirdo}
              warbandAbility={warbandAbility as WarbandAbility}
              onChange={mockOnChange}
            />
          );

          try {
            await waitFor(() => {
              expect(screen.getByDisplayValue(weirdo.name)).toBeInTheDocument();
            });

            // Test handleAddWeapon callback
            const addWeaponSelect = screen.getAllByRole('combobox').find(
              select => select.id === 'add-cc-weapon'
            );
            
            if (addWeaponSelect) {
              fireEvent.change(addWeaponSelect, { target: { value: 'unarmed' } });

              await waitFor(() => {
                expect(apiClient.calculateCost).toHaveBeenCalled();
                expect(mockOnChange).toHaveBeenCalled();
              });
            }

          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should calculate cost correctly with useMemo optimizations for any weirdo state', async () => {
    /**
     * Property: For any valid weirdo with varying costs, the cost display should
     * always show the correct value (tests useMemo optimization for cost calculations)
     */
    await fc.assert(
      fc.asyncProperty(
        weirdoArbitrary.chain(weirdo =>
          fc.integer({ min: 0, max: 50 }).map(cost => ({
            weirdo: { ...weirdo, totalCost: cost },
            expectedCost: cost
          }))
        ),
        warbandAbilityArbitrary,
        async ({ weirdo, expectedCost }, warbandAbility) => {
          const mockOnChange = vi.fn();
          
          // Mock API responses
          (apiClient.calculateCost as any).mockResolvedValue({ cost: expectedCost });
          (apiClient.validate as any).mockResolvedValue({ valid: true, errors: [] });

          const { unmount } = renderWithProviders(
            <WeirdoEditor
              weirdo={weirdo as Weirdo}
              warbandAbility={warbandAbility as WarbandAbility}
              onChange={mockOnChange}
            />
          );

          try {
            await waitFor(() => {
              expect(screen.getByText(`${expectedCost} pts`)).toBeInTheDocument();
            });

            // Verify cost warnings are displayed correctly (tests useMemo optimization)
            if (weirdo.type === 'trooper') {
              if (expectedCost >= 18 && expectedCost <= 20) {
                expect(screen.getByText(/Approaching limit/i)).toBeInTheDocument();
              } else if (expectedCost > 20) {
                expect(screen.getByText(/Exceeds 20 point limit/i)).toBeInTheDocument();
              }
            }

          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);
});


/**
 * Property-Based Tests for Equipment Limit Calculation
 * 
 * **Feature: code-refactoring, Property 10: Equipment limits are calculated correctly**
 * **Validates: Requirements 16.1, 16.2, 16.3, 16.4**
 */
describe('Property-Based Tests: Equipment Limit Calculation', () => {
  /**
   * Generator for weirdo types
   */
  const weirdoTypeArbitrary = fc.constantFrom('leader', 'trooper');

  /**
   * Generator for warband abilities
   */
  const warbandAbilityArbitrary = fc.constantFrom(
    'Cyborgs', 'Fanatics', 'Living Weapons', 'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
  );

  it('should calculate equipment limits correctly for all weirdo types and warband abilities', async () => {
    /**
     * Property: For any weirdo type and warband ability combination:
     * - Troopers with Cyborgs ability have equipment limit of 2
     * - Troopers with other abilities have equipment limit of 1
     * - Leaders with Cyborgs ability have equipment limit of 3
     * - Leaders with any other ability have equipment limit of 2
     */
    await fc.assert(
      fc.asyncProperty(
        weirdoTypeArbitrary,
        warbandAbilityArbitrary,
        async (weirdoType, warbandAbility) => {
          const mockWeirdo = createMockWeirdo(weirdoType as 'leader' | 'trooper');
          const mockOnChange = vi.fn();

          // Mock API responses
          (apiClient.calculateCost as any).mockResolvedValue({ cost: 10 });
          (apiClient.validate as any).mockResolvedValue({ valid: true, errors: [] });

          const { unmount } = renderWithProviders(
            <WeirdoEditor
              weirdo={mockWeirdo}
              warbandAbility={warbandAbility as WarbandAbility}
              onChange={mockOnChange}
            />
          );

          try {
            await waitFor(() => {
              expect(screen.getByDisplayValue(mockWeirdo.name)).toBeInTheDocument();
            });

            // Calculate expected equipment limit based on requirements
            let expectedMaxEquipment: number;
            if (weirdoType === 'trooper') {
              // Requirements 16.1, 16.2: Troopers with Cyborgs have limit of 2, others have limit of 1
              expectedMaxEquipment = warbandAbility === 'Cyborgs' ? 2 : 1;
            } else {
              // weirdoType === 'leader'
              if (warbandAbility === 'Cyborgs') {
                // Requirement 16.3: Leaders with Cyborgs have limit of 3
                expectedMaxEquipment = 3;
              } else {
                // Requirement 16.4: Leaders with other abilities have limit of 2
                expectedMaxEquipment = 2;
              }
            }

            // Verify the equipment limit is displayed correctly
            const equipmentHeader = screen.getByText(
              new RegExp(`Equipment \\(Max: ${expectedMaxEquipment}\\)`, 'i')
            );
            expect(equipmentHeader).toBeInTheDocument();

            // Verify the limit is enforced by checking the add equipment select
            const addEquipmentSelect = screen.getAllByRole('combobox').find(
              select => select.id === 'add-equipment'
            ) as HTMLSelectElement;

            // Add equipment up to the limit
            for (let i = 0; i < expectedMaxEquipment; i++) {
              if (addEquipmentSelect && !addEquipmentSelect.disabled) {
                const equipmentId = i === 0 ? 'cybernetics' : 'grenade';
                fireEvent.change(addEquipmentSelect, { target: { value: equipmentId } });
                
                await waitFor(() => {
                  expect(mockOnChange).toHaveBeenCalled();
                });
                
                // Update the mock weirdo to reflect the added equipment
                mockWeirdo.equipment.push(mockEquipment[i % mockEquipment.length]);
              }
            }

            // After reaching the limit, the select should be disabled
            await waitFor(() => {
              const updatedSelect = screen.getAllByRole('combobox').find(
                select => select.id === 'add-equipment'
              ) as HTMLSelectElement;
              
              if (mockWeirdo.equipment.length >= expectedMaxEquipment) {
                expect(updatedSelect).toBeDisabled();
              }
            });

          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should enforce trooper equipment limits based on warband ability', async () => {
    /**
     * Property: For any warband ability, troopers should have equipment limit of 2 for Cyborgs, 1 for others
     * This specifically tests Requirements 16.1 and 16.2
     */
    await fc.assert(
      fc.asyncProperty(
        warbandAbilityArbitrary,
        async (warbandAbility) => {
          const mockWeirdo = createMockWeirdo('trooper');
          const mockOnChange = vi.fn();

          // Mock API responses
          (apiClient.calculateCost as any).mockResolvedValue({ cost: 10 });
          (apiClient.validate as any).mockResolvedValue({ valid: true, errors: [] });

          const { unmount } = renderWithProviders(
            <WeirdoEditor
              weirdo={mockWeirdo}
              warbandAbility={warbandAbility as WarbandAbility}
              onChange={mockOnChange}
            />
          );

          try {
            await waitFor(() => {
              expect(screen.getByDisplayValue(mockWeirdo.name)).toBeInTheDocument();
            });

            // Troopers with Cyborgs have limit of 2, others have limit of 1
            const expectedLimit = warbandAbility === 'Cyborgs' ? 2 : 1;
            const equipmentHeader = screen.getByText(new RegExp(`Equipment \\(Max: ${expectedLimit}\\)`, 'i'));
            expect(equipmentHeader).toBeInTheDocument();

          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should calculate leader equipment limits based on Cyborgs ability', async () => {
    /**
     * Property: Leaders with Cyborgs ability should have limit of 3,
     * leaders with other abilities should have limit of 2
     * This specifically tests Requirements 16.3 and 16.4
     */
    await fc.assert(
      fc.asyncProperty(
        warbandAbilityArbitrary,
        async (warbandAbility) => {
          const mockWeirdo = createMockWeirdo('leader');
          const mockOnChange = vi.fn();

          // Mock API responses
          (apiClient.calculateCost as any).mockResolvedValue({ cost: 10 });
          (apiClient.validate as any).mockResolvedValue({ valid: true, errors: [] });

          const { unmount } = renderWithProviders(
            <WeirdoEditor
              weirdo={mockWeirdo}
              warbandAbility={warbandAbility as WarbandAbility}
              onChange={mockOnChange}
            />
          );

          try {
            await waitFor(() => {
              expect(screen.getByDisplayValue(mockWeirdo.name)).toBeInTheDocument();
            });

            // Calculate expected limit
            const expectedMaxEquipment = warbandAbility === 'Cyborgs' ? 3 : 2;

            // Verify the equipment limit is displayed correctly
            const equipmentHeader = screen.getByText(
              new RegExp(`Equipment \\(Max: ${expectedMaxEquipment}\\)`, 'i')
            );
            expect(equipmentHeader).toBeInTheDocument();

          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);
});
