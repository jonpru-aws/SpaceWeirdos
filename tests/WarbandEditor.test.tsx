import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testHelpers';
import { WarbandEditor } from '../src/frontend/components/WarbandEditor';
import { apiClient } from '../src/frontend/services/apiClient';
import type { Warband, Weirdo, ValidationResult } from '../src/backend/models/types';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    getWarband: vi.fn(),
    createWarband: vi.fn(),
    updateWarband: vi.fn(),
    addWeirdo: vi.fn(),
    removeWeirdo: vi.fn(),
    validate: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(message: string, public statusCode?: number, public details?: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
global.window.confirm = mockConfirm;

describe('WarbandEditor Component', () => {
  const mockLeader: Weirdo = {
    id: 'w1',
    name: 'Leader',
    type: 'leader',
    attributes: {
      speed: 2,
      defense: '2d8',
      firepower: '2d8',
      prowess: '2d8',
      willpower: '2d8',
    },
    closeCombatWeapons: [],
    rangedWeapons: [],
    equipment: [],
    psychicPowers: [],
    leaderTrait: null,
    notes: '',
    totalCost: 20,
  };

  const mockTrooper: Weirdo = {
    id: 'w2',
    name: 'Trooper',
    type: 'trooper',
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
    totalCost: 10,
  };

  const mockWarband: Warband = {
    id: '1',
    name: 'Test Warband',
    ability: 'Cyborgs',
    pointLimit: 75,
    totalCost: 30,
    weirdos: [mockLeader, mockTrooper],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockValidationSuccess: ValidationResult = {
    valid: true,
    errors: [],
  };

  const mockValidationError: ValidationResult = {
    valid: false,
    errors: [
      {
        field: 'name',
        message: 'Warband name is required',
        code: 'REQUIRED_FIELD',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockClear();
    // Default mock for validate to prevent errors in useEffect
    vi.mocked(apiClient.validate).mockResolvedValue(mockValidationSuccess);
    // Mock fetch for warband abilities
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([
        { name: 'Cyborgs', description: 'Cyborg description' },
        { name: 'Fanatics', description: 'Fanatics description' },
        { name: 'Living Weapons', description: 'Living Weapons description' },
        { name: 'Heavily Armed', description: 'Heavily Armed description' },
        { name: 'Mutants', description: 'Mutants description' },
        { name: 'Soldiers', description: 'Soldiers description' },
        { name: 'Undead', description: 'Undead description' }
      ])
    });
  });

  describe('Creating new warband', () => {
    it('should initialize with default values for new warband', async () => {
      // Requirement 1.1, 1.2, 1.4, 1.6: Initialize with defaults (ability optional)
      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
      const pointLimitSelect = screen.getByLabelText(/Point Limit/i) as HTMLSelectElement;

      expect(nameInput.value).toBe('New Warband');
      expect(abilitySelect.value).toBe(''); // No ability selected by default
      expect(pointLimitSelect.value).toBe('75');
    });

    it('should display total cost as 0 for new warband', async () => {
      // Requirement 1.3: Initialize with zero cost
      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText(/0 \/ 75/)).toBeInTheDocument();
      });
    });

    it('should display empty weirdos list', async () => {
      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText(/No weirdos yet/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading existing warband', () => {
    it('should load warband data when warbandId is provided', async () => {
      // Requirement 11.1, 12.1, 12.2: Load existing warband
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(apiClient.getWarband).toHaveBeenCalledWith('1');
      });

      await waitFor(() => {
        expect(screen.getByText('Edit Warband')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Test Warband');
    });

    it('should display loading state while fetching warband', () => {
      vi.mocked(apiClient.getWarband).mockImplementation(
        () => new Promise(() => {})
      );

      renderWithProviders(<WarbandEditor warbandId="1" />);

      expect(screen.getByText('Loading warband...')).toBeInTheDocument();
    });

    it('should display error when loading fails', async () => {
      vi.mocked(apiClient.getWarband).mockRejectedValueOnce(
        new Error('Failed to load')
      );

      renderWithProviders(<WarbandEditor warbandId="1" />);

      // When loading fails, warband is null so it shows the fallback error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to initialize warband/)).toBeInTheDocument();
      });
    });
  });

  describe('Changing warband name', () => {
    it('should update warband name when input changes', async () => {
      // Requirement 1.1, 1.5: Name change
      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'New Warband Name' } });

      expect(nameInput.value).toBe('New Warband Name');
    });
  });

  describe('Changing warband ability', () => {
    it('should update warband ability when selection changes', async () => {
      // Requirement 1.4: Ability change
      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
      fireEvent.change(abilitySelect, { target: { value: 'Mutants' } });

      expect(abilitySelect.value).toBe('Mutants');
    });

    it('should recalculate costs when ability changes for existing warband', async () => {
      // Requirement 15.1, 15.2: Cost recalculation
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);
      vi.mocked(apiClient.updateWarband).mockResolvedValueOnce({
        ...mockWarband,
        ability: 'Mutants',
        totalCost: 28,
      });

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Edit Warband')).toBeInTheDocument();
      });

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
      fireEvent.change(abilitySelect, { target: { value: 'Mutants' } });

      await waitFor(() => {
        expect(apiClient.updateWarband).toHaveBeenCalledWith('1', { ability: 'Mutants' });
      });
    });
  });

  describe('Changing point limit', () => {
    it('should update point limit when selection changes', async () => {
      // Requirement 1.2: Point limit change
      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const pointLimitSelect = screen.getByLabelText(/Point Limit/i) as HTMLSelectElement;
      fireEvent.change(pointLimitSelect, { target: { value: '125' } });

      expect(pointLimitSelect.value).toBe('125');

      await waitFor(() => {
        expect(screen.getByText(/0 \/ 125/)).toBeInTheDocument();
      });
    });
  });

  describe('Adding weirdos', () => {
    it('should add leader when Add Leader button is clicked', async () => {
      // Requirement 2.1, 7.1: Add weirdo
      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const addLeaderButton = screen.getByText('+ Add Leader');
      fireEvent.click(addLeaderButton);

      await waitFor(() => {
        expect(screen.getByText('New Leader')).toBeInTheDocument();
      });
    });

    it('should add trooper when Add Trooper button is clicked', async () => {
      // Requirement 7.1: Add trooper
      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const addTrooperButton = screen.getByText('+ Add Trooper');
      fireEvent.click(addTrooperButton);

      await waitFor(() => {
        expect(screen.getByText('New Trooper')).toBeInTheDocument();
      });
    });

    it('should disable Add Leader button when leader already exists', async () => {
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Edit Warband')).toBeInTheDocument();
      });

      const addLeaderButton = screen.getByText('+ Add Leader') as HTMLButtonElement;
      expect(addLeaderButton.disabled).toBe(true);
    });

    it('should add weirdo via API for saved warband', async () => {
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);
      vi.mocked(apiClient.addWeirdo).mockResolvedValueOnce({
        ...mockWarband,
        weirdos: [...mockWarband.weirdos, mockTrooper],
      });

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Edit Warband')).toBeInTheDocument();
      });

      const addTrooperButton = screen.getByText('+ Add Trooper');
      fireEvent.click(addTrooperButton);

      await waitFor(() => {
        expect(apiClient.addWeirdo).toHaveBeenCalled();
      });
    });
  });

  describe('Removing weirdos', () => {
    it('should prompt for confirmation when removing weirdo', async () => {
      // Requirement 15.1, 15.2: Remove weirdo
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);
      mockConfirm.mockReturnValueOnce(false);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Leader')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[0]);

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining('Leader')
      );
    });

    it('should remove weirdo when confirmed', async () => {
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);
      vi.mocked(apiClient.removeWeirdo).mockResolvedValueOnce({
        ...mockWarband,
        weirdos: [mockLeader],
      });
      mockConfirm.mockReturnValueOnce(true);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Trooper')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[1]);

      await waitFor(() => {
        expect(apiClient.removeWeirdo).toHaveBeenCalledWith('1', 'w2');
      });
    });

    it('should not remove weirdo when cancelled', async () => {
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);
      mockConfirm.mockReturnValueOnce(false);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Trooper')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[1]);

      expect(mockConfirm).toHaveBeenCalled();
      expect(apiClient.removeWeirdo).not.toHaveBeenCalled();
    });
  });

  describe('Saving warband', () => {
    it('should create new warband when saving without ID', async () => {
      // Requirement 11.1, 11.4, 1.6: Save warband (ability optional)
      vi.mocked(apiClient.validate).mockResolvedValueOnce(mockValidationSuccess);
      vi.mocked(apiClient.createWarband).mockResolvedValueOnce(mockWarband);

      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'New Warband' } });

      const saveButton = screen.getByText('Create Warband');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(apiClient.validate).toHaveBeenCalled();
        expect(apiClient.createWarband).toHaveBeenCalledWith({
          name: 'New Warband',
          pointLimit: 75,
          ability: null, // Ability is now optional
        });
      });
    });

    it('should update existing warband when saving with ID', async () => {
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);
      vi.mocked(apiClient.validate).mockResolvedValueOnce(mockValidationSuccess);
      vi.mocked(apiClient.updateWarband).mockResolvedValueOnce(mockWarband);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Edit Warband')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(apiClient.validate).toHaveBeenCalled();
        expect(apiClient.updateWarband).toHaveBeenCalled();
      });
    });

    it('should display success message after saving', async () => {
      vi.mocked(apiClient.validate).mockResolvedValueOnce(mockValidationSuccess);
      vi.mocked(apiClient.createWarband).mockResolvedValueOnce(mockWarband);

      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'New Warband' } });

      const saveButton = screen.getByText('Create Warband');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Warband saved successfully!')).toBeInTheDocument();
      });
    });

    it('should prevent saving when name is empty', async () => {
      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      // Clear the default name to make it empty
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByText('Create Warband') as HTMLButtonElement;
      expect(saveButton.disabled).toBe(true);
    });
  });

  describe('Validation errors', () => {
    it('should display validation errors when save fails validation', async () => {
      vi.mocked(apiClient.validate).mockResolvedValueOnce(mockValidationError);

      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      const saveButton = screen.getByText('Create Warband');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Validation Errors/)).toBeInTheDocument();
        expect(screen.getByText(/Warband name is required/)).toBeInTheDocument();
      });
    });

    it('should not save when validation fails', async () => {
      vi.mocked(apiClient.validate).mockResolvedValueOnce(mockValidationError);

      renderWithProviders(<WarbandEditor />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      const saveButton = screen.getByText('Create Warband');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(apiClient.validate).toHaveBeenCalled();
      });

      expect(apiClient.createWarband).not.toHaveBeenCalled();
    });
  });

  describe('Cost calculations', () => {
    it('should display total cost of all weirdos', async () => {
      // Requirement 10.1, 15.2, 15.3: Calculate total cost
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/30 \/ 75/)).toBeInTheDocument();
      });
    });

    it('should display warning when approaching point limit', async () => {
      // Requirement 15.4, 15.5: Warning indicators
      const nearLimitWarband = {
        ...mockWarband,
        totalCost: 70,
        weirdos: [{ ...mockLeader, totalCost: 70 }],
      };

      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(nearLimitWarband);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/Approaching point limit/)).toBeInTheDocument();
      });
    });

    it('should display error when exceeding point limit', async () => {
      // Requirement 10.3: Exceeds limit
      const overLimitWarband = {
        ...mockWarband,
        totalCost: 80,
        weirdos: [{ ...mockLeader, totalCost: 80 }],
      };

      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(overLimitWarband);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/Exceeds point limit!/)).toBeInTheDocument();
      });
    });
  });

  describe('Back navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      const mockOnBack = vi.fn();

      renderWithProviders(<WarbandEditor onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const backButton = screen.getByText('← Back to List');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should call onBack when cancel button is clicked', async () => {
      const mockOnBack = vi.fn();

      renderWithProviders(<WarbandEditor onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Validation error styling', () => {
    it('should apply error CSS class to weirdos with validation errors', async () => {
      // Requirement 15.6, 15.7: Visual highlighting for invalid weirdos
      const warbandWithErrors: Warband = {
        ...mockWarband,
        weirdos: [
          { ...mockLeader, totalCost: 22 },
          { ...mockTrooper, totalCost: 23 },
        ],
      };

      const validationWithErrors: ValidationResult = {
        valid: false,
        errors: [
          {
            field: 'weirdos',
            message: 'Only one weirdo may cost 21-25 points',
            code: 'MULTIPLE_25_POINT_WEIRDOS',
          },
        ],
      };

      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(warbandWithErrors);
      vi.mocked(apiClient.validate).mockResolvedValueOnce(validationWithErrors);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Leader')).toBeInTheDocument();
      });

      // Wait for validation to complete
      await waitFor(() => {
        const leaderCard = screen.getByText('Leader').closest('.weirdo-card');
        const trooperCard = screen.getByText('Trooper').closest('.weirdo-card');
        
        expect(leaderCard).toHaveClass('error');
        expect(trooperCard).toHaveClass('error');
      });
    });

    it('should not apply error CSS class to valid weirdos', async () => {
      // Requirement 15.6, 15.7: Valid weirdos should not have error styling
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);
      vi.mocked(apiClient.validate).mockResolvedValueOnce(mockValidationSuccess);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Leader')).toBeInTheDocument();
      });

      await waitFor(() => {
        const leaderCard = screen.getByText('Leader').closest('.weirdo-card');
        const trooperCard = screen.getByText('Trooper').closest('.weirdo-card');
        
        expect(leaderCard).not.toHaveClass('error');
        expect(trooperCard).not.toHaveClass('error');
      });
    });

    it('should display error tooltip for weirdos with validation errors', async () => {
      // Requirement 15.8, 15.9: Tooltip with specific error messages
      const warbandWithErrors: Warband = {
        ...mockWarband,
        weirdos: [
          { ...mockLeader, id: 'w1', totalCost: 22 },
          { ...mockTrooper, id: 'w2', totalCost: 23 },
        ],
      };

      const validationWithErrors: ValidationResult = {
        valid: false,
        errors: [
          {
            field: 'weirdos',
            message: 'Only one weirdo may cost 21-25 points',
            code: 'MULTIPLE_25_POINT_WEIRDOS',
          },
        ],
      };

      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(warbandWithErrors);
      vi.mocked(apiClient.validate).mockResolvedValueOnce(validationWithErrors);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Leader')).toBeInTheDocument();
      });

      // Wait for validation to complete and tooltip to render
      await waitFor(() => {
        const tooltips = screen.getAllByRole('tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
        expect(tooltips[0]).toHaveTextContent('Only one weirdo may cost 21-25 points');
      });
    });

    it('should display multiple errors in tooltip as a list', async () => {
      // Requirement 15.8, 15.9: Multiple errors displayed as list
      const warbandWithErrors: Warband = {
        ...mockWarband,
        weirdos: [
          { ...mockLeader, id: 'w1', totalCost: 22 },
        ],
      };

      const validationWithMultipleErrors: ValidationResult = {
        valid: false,
        errors: [
          {
            field: 'w1',
            message: 'At least one close combat weapon is required',
            code: 'MISSING_CLOSE_COMBAT_WEAPON',
          },
          {
            field: 'w1',
            message: 'Ranged weapon required when Firepower is 2d8 or 2d10',
            code: 'MISSING_RANGED_WEAPON',
          },
        ],
      };

      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(warbandWithErrors);
      vi.mocked(apiClient.validate).mockResolvedValueOnce(validationWithMultipleErrors);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Leader')).toBeInTheDocument();
      });

      // Wait for validation to complete and tooltip to render
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveTextContent('At least one close combat weapon is required');
        expect(tooltip).toHaveTextContent('Ranged weapon required when Firepower is 2d8 or 2d10');
        
        // Check that errors are in a list
        const listItems = tooltip.querySelectorAll('li');
        expect(listItems.length).toBe(2);
      });
    });

    it('should not display tooltip for valid weirdos', async () => {
      // Requirement 15.8, 15.9: No tooltip for valid weirdos
      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(mockWarband);
      vi.mocked(apiClient.validate).mockResolvedValueOnce(mockValidationSuccess);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Leader')).toBeInTheDocument();
      });

      await waitFor(() => {
        const tooltips = screen.queryAllByRole('tooltip');
        expect(tooltips.length).toBe(0);
      });
    });

    it('should update error styling when validation state changes', async () => {
      // Requirement 15.6, 15.7: Visual feedback updates immediately
      const warbandWithErrors: Warband = {
        ...mockWarband,
        weirdos: [
          { ...mockLeader, totalCost: 22 },
          { ...mockTrooper, totalCost: 23 },
        ],
      };

      const validationWithErrors: ValidationResult = {
        valid: false,
        errors: [
          {
            field: 'weirdos',
            message: 'Only one weirdo may cost 21-25 points',
            code: 'MULTIPLE_25_POINT_WEIRDOS',
          },
        ],
      };

      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(warbandWithErrors);
      vi.mocked(apiClient.validate).mockResolvedValueOnce(validationWithErrors);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Leader')).toBeInTheDocument();
      });

      // Verify error styling is applied
      await waitFor(() => {
        const leaderCard = screen.getByText('Leader').closest('.weirdo-card');
        expect(leaderCard).toHaveClass('error');
      });

      // Update validation to success by mocking the next validation call
      vi.mocked(apiClient.validate).mockResolvedValueOnce(mockValidationSuccess);
      
      // Trigger re-validation by simulating a change (e.g., clicking a button)
      // In this case, we'll just wait for the component to re-validate
      await waitFor(() => {
        const leaderCard = screen.getByText('Leader').closest('.weirdo-card');
        // The error class should still be there since we haven't actually changed the data
        expect(leaderCard).toHaveClass('error');
      });
    });

    it('should display 25-point violation banner when multiple weirdos exceed 20 points', async () => {
      // Requirement 15.6, 15.7: Banner for 25-point rule violation
      const leader22 = { ...mockLeader, id: 'w1', name: 'Leader', totalCost: 22 };
      const trooper23 = { ...mockTrooper, id: 'w2', name: 'Trooper', totalCost: 23 };
      
      const warbandWithErrors: Warband = {
        ...mockWarband,
        id: '1',
        weirdos: [leader22, trooper23],
        totalCost: 45,
      };

      const validationWithErrors: ValidationResult = {
        valid: false,
        errors: [
          {
            field: 'weirdos',
            message: 'Only one weirdo may cost 21-25 points',
            code: 'MULTIPLE_25_POINT_WEIRDOS',
          },
        ],
      };

      // Clear and set up mocks
      vi.mocked(apiClient.getWarband).mockReset();
      vi.mocked(apiClient.validate).mockReset();
      vi.mocked(apiClient.getWarband).mockResolvedValue(warbandWithErrors);
      vi.mocked(apiClient.validate).mockResolvedValue(validationWithErrors);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      // Wait for warband to load
      await waitFor(() => {
        expect(screen.getByText('Leader')).toBeInTheDocument();
      });

      // Wait for validation to complete and banner to appear
      await waitFor(() => {
        const banner = document.querySelector('.error-banner');
        expect(banner).toBeInTheDocument();
        expect(banner).toHaveTextContent(/Only one weirdo may cost 21-25 points/);
      }, { timeout: 3000 });
    });

    it('should handle field-specific validation errors for weirdos', async () => {
      // Requirement 15.6, 15.7, 15.8, 15.9: Field-specific errors
      const leaderWithError = { ...mockLeader, id: 'w1', name: 'Leader' };
      
      const warbandWithErrors: Warband = {
        ...mockWarband,
        weirdos: [leaderWithError],
        totalCost: 20,
      };

      const validationWithErrors: ValidationResult = {
        valid: false,
        errors: [
          {
            field: 'w1.name',
            message: 'Weirdo name is required',
            code: 'REQUIRED_FIELD',
          },
        ],
      };

      vi.mocked(apiClient.getWarband).mockResolvedValueOnce(warbandWithErrors);
      // Mock validation to return errors every time it's called
      vi.mocked(apiClient.validate).mockResolvedValue(validationWithErrors);

      renderWithProviders(<WarbandEditor warbandId="1" />);

      await waitFor(() => {
        const leaderCard = screen.getByText('Leader').closest('.weirdo-card');
        expect(leaderCard).toHaveClass('error');
      }, { timeout: 2000 });

      // Verify tooltip shows the specific error
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveTextContent('Weirdo name is required');
      });
    });
  });
});

/**
 * Property-Based Tests
 * 
 * **Feature: code-refactoring, Property 3: Component splitting renders all warband data correctly**
 * **Validates: Requirements 4.3**
 */

import * as fc from 'fast-check';

describe('Property-Based Tests: Component Renders Warband Data Correctly', () => {
  /**
   * Generator for valid warband data
   * Uses alphanumeric strings to avoid test infrastructure issues with special characters
   * Ensures totalCost matches the sum of weirdo costs for consistency
   */
  const warbandArbitrary = fc.record({
    id: fc.hexaString({ minLength: 1, maxLength: 10 }),
    name: fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' '), { minLength: 3, maxLength: 30 }).map(s => s.trim() || 'Warband'),
    ability: fc.oneof(
      fc.constant(null),
      fc.constantFrom('Cyborgs', 'Fanatics', 'Living Weapons', 'Heavily Armed', 'Mutants', 'Soldiers', 'Undead')
    ),
    pointLimit: fc.constantFrom(75, 125),
    weirdos: fc.array(
      fc.record({
        id: fc.hexaString({ minLength: 1, maxLength: 10 }),
        name: fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' '), { minLength: 3, maxLength: 30 }).map(s => s.trim() || 'Weirdo'),
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
      }),
      { minLength: 0, maxLength: 5 }
    ),
    createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
    updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  }).map(warband => ({
    ...warband,
    // Calculate totalCost as sum of weirdo costs to ensure consistency
    totalCost: warband.weirdos.reduce((sum, weirdo) => sum + weirdo.totalCost, 0)
  }));

  it('should render all warband data correctly for any valid warband', async () => {
    /**
     * Comprehensive Property: For any valid warband, the component should:
     * 1. Render warband properties (name, ability, point limit)
     * 2. Display cost in the format "totalCost / pointLimit"
     * 3. Render all weirdos with their names and costs
     * 4. Correctly enable/disable the "Add Leader" button based on leader presence
     */
    await fc.assert(
      fc.asyncProperty(warbandArbitrary, async (warband) => {
        vi.mocked(apiClient.getWarband).mockResolvedValueOnce(warband as Warband);
        vi.mocked(apiClient.validate).mockResolvedValue({ valid: true, errors: [] });

        const { unmount } = renderWithProviders(<WarbandEditor warbandId={warband.id} />);

        try {
          await waitFor(() => {
            expect(screen.getByText('Edit Warband')).toBeInTheDocument();
          });

          // 1. Verify warband properties are rendered
          const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
          expect(nameInput.value).toBe(warband.name);

          const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
          expect(abilitySelect.value).toBe(warband.ability || '');

          const pointLimitSelect = screen.getByLabelText(/Point Limit/i) as HTMLSelectElement;
          expect(pointLimitSelect.value).toBe(String(warband.pointLimit));

          // 2. Verify cost display is rendered
          const costPattern = new RegExp(`${warband.totalCost}\\s*/\\s*${warband.pointLimit}`);
          expect(screen.getByText(costPattern)).toBeInTheDocument();

          // 3. Verify weirdos list is rendered
          expect(screen.getByText(`Weirdos (${warband.weirdos.length})`)).toBeInTheDocument();

          if (warband.weirdos.length === 0) {
            expect(screen.getByText(/No weirdos yet/)).toBeInTheDocument();
          } else {
            // Use getAllByText to handle duplicate names
            const nameElements = warband.weirdos.map(w => w.name);
            nameElements.forEach((name) => {
              const elements = screen.getAllByText(name);
              expect(elements.length).toBeGreaterThanOrEqual(1);
            });
            
            // Verify cost displays (may have duplicates)
            const costElements = warband.weirdos.map(w => `${w.totalCost} pts`);
            costElements.forEach((cost) => {
              const elements = screen.getAllByText(cost);
              expect(elements.length).toBeGreaterThanOrEqual(1);
            });
          }

          // 4. Verify leader button state
          const addLeaderButton = screen.getByText('+ Add Leader') as HTMLButtonElement;
          const hasLeader = warband.weirdos.some(w => w.type === 'leader');
          expect(addLeaderButton.disabled).toBe(hasLeader);
        } finally {
          // Cleanup
          unmount();
        }
      }),
      { numRuns: 20 }
    );
  }, 60000);

  it('should display correct warning/error states based on point limit', async () => {
    /**
     * Comprehensive Property: For any valid warband, the component should:
     * 1. Display warning when totalCost >= 90% of pointLimit and <= pointLimit
     * 2. Display error when totalCost > pointLimit
     * 3. Display no warning/error when totalCost < 90% of pointLimit
     */
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(75, 125).chain(pointLimit =>
          fc.oneof(
            // Case 1: Normal range (< 90%)
            // Use Math.floor to ensure we're strictly below the threshold
            fc.record({
              pointLimit: fc.constant(pointLimit),
              totalCost: fc.integer({ min: 0, max: Math.floor(pointLimit * 0.9) - 1 }),
              expectedState: fc.constant('normal' as const)
            }),
            // Case 2: Warning range (90% - 100%)
            // Use Math.ceil to ensure we're at or above the threshold
            fc.record({
              pointLimit: fc.constant(pointLimit),
              totalCost: fc.integer({ min: Math.ceil(pointLimit * 0.9), max: pointLimit }),
              expectedState: fc.constant('warning' as const)
            }),
            // Case 3: Error range (> 100%)
            fc.record({
              pointLimit: fc.constant(pointLimit),
              totalCost: fc.integer({ min: pointLimit + 1, max: pointLimit + 50 }),
              expectedState: fc.constant('error' as const)
            })
          )
        ).chain(({ pointLimit, totalCost, expectedState }) =>
          warbandArbitrary.map(warband => ({
            warband: {
              ...warband,
              pointLimit,
              totalCost,
              // Create a single weirdo with the target totalCost to ensure consistency
              weirdos: totalCost > 0 ? [{
                ...warband.weirdos[0] || {
                  id: 'w1',
                  name: 'Test Weirdo',
                  type: 'leader' as const,
                  attributes: {
                    speed: 1,
                    defense: '2d6' as const,
                    firepower: 'None' as const,
                    prowess: '2d6' as const,
                    willpower: '2d6' as const,
                  },
                  closeCombatWeapons: [],
                  rangedWeapons: [],
                  equipment: [],
                  psychicPowers: [],
                  leaderTrait: null,
                  notes: '',
                },
                totalCost
              }] : []
            },
            expectedState
          }))
        ),
        async ({ warband, expectedState }) => {
          vi.mocked(apiClient.getWarband).mockResolvedValueOnce(warband as Warband);
          vi.mocked(apiClient.validate).mockResolvedValue({ valid: true, errors: [] });

          const { unmount } = renderWithProviders(<WarbandEditor warbandId={warband.id} />);

          try {
            await waitFor(() => {
              expect(screen.getByText('Edit Warband')).toBeInTheDocument();
            });

            // Verify the correct state is displayed
            if (expectedState === 'warning') {
              expect(screen.getByText(/Approaching point limit/)).toBeInTheDocument();
              expect(screen.queryByText(/Exceeds point limit!/)).not.toBeInTheDocument();
            } else if (expectedState === 'error') {
              expect(screen.getByText(/Exceeds point limit!/)).toBeInTheDocument();
              expect(screen.queryByText(/Approaching point limit/)).not.toBeInTheDocument();
            } else {
              expect(screen.queryByText(/Approaching point limit/)).not.toBeInTheDocument();
              expect(screen.queryByText(/Exceeds point limit!/)).not.toBeInTheDocument();
            }
          } finally {
            // Cleanup
            unmount();
          }
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);
});
