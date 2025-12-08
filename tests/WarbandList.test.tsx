import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { WarbandList, WarbandListItem } from '../src/frontend/components/WarbandList';
import { DeleteConfirmationDialog } from '../src/frontend/components/DeleteConfirmationDialog';
import type { WarbandSummary, Warband, Attributes } from '../src/backend/models/types';
import * as apiClient from '../src/frontend/services/apiClient';

// Mock the apiClient module
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    getAllWarbands: vi.fn(),
    deleteWarband: vi.fn(),
  }
}));

describe('WarbandList Component', () => {
  const mockAttributes: Attributes = {
    speed: 1,
    defense: '2d6',
    firepower: 'None',
    prowess: '2d6',
    willpower: '2d6'
  };

  const mockWarbands: Warband[] = [
    {
      id: '1',
      name: 'The Cyborg Squad',
      ability: 'Cyborgs',
      pointLimit: 75,
      totalCost: 50,
      weirdos: [
        { 
          id: '1', 
          name: 'Leader', 
          type: 'leader',
          attributes: mockAttributes, 
          closeCombatWeapons: [], 
          rangedWeapons: [], 
          equipment: [], 
          psychicPowers: [],
          leaderTrait: null,
          notes: '',
          totalCost: 25
        },
        { 
          id: '2', 
          name: 'Grunt', 
          type: 'trooper',
          attributes: mockAttributes, 
          closeCombatWeapons: [], 
          rangedWeapons: [], 
          equipment: [], 
          psychicPowers: [],
          leaderTrait: null,
          notes: '',
          totalCost: 25
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Mutant Horde',
      ability: 'Mutants',
      pointLimit: 125,
      totalCost: 100,
      weirdos: [
        { 
          id: '3', 
          name: 'Mutant', 
          type: 'trooper',
          attributes: mockAttributes, 
          closeCombatWeapons: [], 
          rangedWeapons: [], 
          equipment: [], 
          psychicPowers: [],
          leaderTrait: null,
          notes: '',
          totalCost: 100
        }
      ],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  let mockOnLoadWarband: ReturnType<typeof vi.fn>;
  let mockOnDeleteSuccess: ReturnType<typeof vi.fn>;
  let mockOnDeleteError: ReturnType<typeof vi.fn>;
  let mockOnCreateWarband: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    vi.mocked(apiClient.apiClient.getAllWarbands).mockResolvedValue(mockWarbands);
    vi.mocked(apiClient.apiClient.deleteWarband).mockResolvedValue(undefined);
    
    mockOnLoadWarband = vi.fn();
    mockOnDeleteSuccess = vi.fn();
    mockOnDeleteError = vi.fn();
    mockOnCreateWarband = vi.fn();
  });

  describe('Loading warbands', () => {
    it('should load and display warbands successfully', async () => {
      // Requirement 7.1: Display all saved warbands
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
        expect(screen.getByText('Mutant Horde')).toBeInTheDocument();
      });

      expect(apiClient.apiClient.getAllWarbands).toHaveBeenCalledTimes(1);
    });

    it('should display error state when loading fails', async () => {
      const errorMessage = 'Failed to load';
      vi.mocked(apiClient.apiClient.getAllWarbands).mockRejectedValue(new Error(errorMessage));

      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load warbands/)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      let callCount = 0;
      vi.mocked(apiClient.apiClient.getAllWarbands).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network error');
        }
        return mockWarbands;
      });

      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load warbands/)).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
      });

      expect(apiClient.apiClient.getAllWarbands).toHaveBeenCalledTimes(2);
    });
  });

  describe('Displaying warband list', () => {
    it('should display warband name', async () => {
      // Requirement 7.2: Show warband name
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
        expect(screen.getByText('Mutant Horde')).toBeInTheDocument();
      });
    });

    it('should display warband ability', async () => {
      // Requirement 7.3: Show warband ability
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Cyborgs')).toBeInTheDocument();
        expect(screen.getByText('Mutants')).toBeInTheDocument();
      });
    });

    it('should display point limit', async () => {
      // Requirement 7.4: Show point limit
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('75 points')).toBeInTheDocument();
        expect(screen.getByLabelText('125 points')).toBeInTheDocument();
      });
    });

    it('should display total cost', async () => {
      // Requirement 7.5: Show total point cost
      // Requirement 12.1: Display total cost for each warband
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        // Costs come from warband.totalCost (API-calculated)
        expect(screen.getByLabelText('50 points used')).toBeInTheDocument();
        expect(screen.getByLabelText('100 points used')).toBeInTheDocument();
      });
    });

    it('should display zero cost for empty warband', async () => {
      // Requirement 12.3: Handle empty warband (0 cost) correctly
      const emptyWarband: Warband = {
        id: '3',
        name: 'Empty Warband',
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      };

      vi.mocked(apiClient.apiClient.getAllWarbands).mockResolvedValue([emptyWarband]);

      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('0 points used')).toBeInTheDocument();
      });
    });

    it('should display weirdo count', async () => {
      // Requirement 7.6: Show number of weirdos
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('2 weirdos')).toBeInTheDocument();
        expect(screen.getByLabelText('1 weirdos')).toBeInTheDocument();
      });
    });

    it('should display Load and Delete buttons for each warband', async () => {
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        const loadButtons = screen.getAllByText('Load');
        const deleteButtons = screen.getAllByText('Delete');
        
        expect(loadButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
      });
    });
  });

  describe('Empty state', () => {
    it('should display message when no warbands exist', async () => {
      // Requirement 7.7: Display message when no warbands exist
      vi.mocked(apiClient.apiClient.getAllWarbands).mockResolvedValue([]);

      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/No warbands found. Create your first warband to get started!/)
        ).toBeInTheDocument();
      });
    });

    it('should display create button in empty state', async () => {
      vi.mocked(apiClient.apiClient.getAllWarbands).mockResolvedValue([]);

      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });
    });
  });

  describe('Loading a warband', () => {
    it('should call onLoadWarband when Load button is clicked', async () => {
      // Requirement 7.9: Load warband functionality
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
      });

      const loadButtons = screen.getAllByText('Load');
      fireEvent.click(loadButtons[0]);

      expect(mockOnLoadWarband).toHaveBeenCalledWith('1');
    });
  });

  describe('Deleting a warband', () => {
    it('should show confirmation dialog when Delete button is clicked', async () => {
      // Requirement 8.1: Show confirmation dialog
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      // Requirement 8.2: Display warband name in dialog
      await waitFor(() => {
        expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete the warband/)).toBeInTheDocument();
      });
    });

    it('should delete warband when confirmed', async () => {
      // Requirement 8.3: Delete on confirmation
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm deletion/ });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(apiClient.apiClient.deleteWarband).toHaveBeenCalledWith('1');
        expect(mockOnDeleteSuccess).toHaveBeenCalled();
      });
      
      // List should be reloaded
      await waitFor(() => {
        expect(apiClient.apiClient.getAllWarbands).toHaveBeenCalledTimes(2);
      });
    });

    it('should not delete warband when cancelled', async () => {
      // Requirement 8.4: Cancel preserves warband
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel deletion/ });
      fireEvent.click(cancelButton);

      expect(apiClient.apiClient.deleteWarband).not.toHaveBeenCalled();
      expect(mockOnDeleteSuccess).not.toHaveBeenCalled();
      
      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
      });
    });
  });

  describe('Create New Warband button', () => {
    it('should display create button when warbands exist', async () => {
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
      });

      expect(screen.getByText('Create New Warband')).toBeInTheDocument();
    });

    it('should call onCreateWarband when create button is clicked', async () => {
      render(
        <WarbandList
          onLoadWarband={mockOnLoadWarband}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
          onCreateWarband={mockOnCreateWarband}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create New Warband');
      fireEvent.click(createButton);

      expect(mockOnCreateWarband).toHaveBeenCalled();
    });
  });
});

describe('WarbandListItem Component', () => {
  const mockWarband: WarbandSummary = {
    id: '1',
    name: 'Test Warband',
    ability: 'Cyborgs',
    pointLimit: 75,
    totalCost: 50,
    weirdoCount: 2,
    updatedAt: new Date('2024-01-01'),
  };

  it('should display correct information', () => {
    // Requirements: 7.2, 7.3, 7.4, 7.5, 7.6
    const mockOnSelect = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <WarbandListItem
        warband={mockWarband}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Warband')).toBeInTheDocument();
    expect(screen.getByText('Cyborgs')).toBeInTheDocument();
    expect(screen.getByLabelText('75 points')).toBeInTheDocument();
    expect(screen.getByLabelText('50 points used')).toBeInTheDocument();
    expect(screen.getByLabelText('2 weirdos')).toBeInTheDocument();
  });

  it('should call onSelect when Load button is clicked', () => {
    const mockOnSelect = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <WarbandListItem
        warband={mockWarband}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const loadButton = screen.getByText('Load');
    fireEvent.click(loadButton);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('should call onDelete when Delete button is clicked', () => {
    const mockOnSelect = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <WarbandListItem
        warband={mockWarband}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });
});

describe('DeleteConfirmationDialog Component', () => {
  it('should show warband name', () => {
    // Requirement 8.2: Display warband name
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <DeleteConfirmationDialog
        warbandName="Test Warband"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Test Warband/)).toBeInTheDocument();
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
  });

  it('should call onConfirm when Delete button is clicked', () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <DeleteConfirmationDialog
        warbandName="Test Warband"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /Confirm deletion/ });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should call onCancel when Cancel button is clicked', () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <DeleteConfirmationDialog
        warbandName="Test Warband"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel deletion/ });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onCancel when Escape key is pressed', () => {
    // Requirement 8.4: Escape key handling
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <DeleteConfirmationDialog
        warbandName="Test Warband"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
