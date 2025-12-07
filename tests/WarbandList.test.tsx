import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { WarbandList, WarbandListItem } from '../src/frontend/components/WarbandList';
import { DeleteConfirmationDialog } from '../src/frontend/components/DeleteConfirmationDialog';
import { DataRepository } from '../src/backend/services/DataRepository';
import type { WarbandSummary } from '../src/backend/models/types';

describe('WarbandList Component', () => {
  const mockWarbandSummaries: WarbandSummary[] = [
    {
      id: '1',
      name: 'The Cyborg Squad',
      ability: 'Cyborgs',
      pointLimit: 75,
      totalCost: 50,
      weirdoCount: 2,
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Mutant Horde',
      ability: 'Mutants',
      pointLimit: 125,
      totalCost: 100,
      weirdoCount: 1,
      updatedAt: new Date('2024-01-02'),
    },
  ];

  let mockDataRepository: DataRepository;
  let mockOnSelectWarband: ReturnType<typeof vi.fn>;
  let mockOnDeleteWarband: ReturnType<typeof vi.fn>;
  let mockOnCreateNew: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDataRepository = {
      getAllWarbands: vi.fn().mockReturnValue(mockWarbandSummaries),
    } as any;
    
    mockOnSelectWarband = vi.fn();
    mockOnDeleteWarband = vi.fn();
    mockOnCreateNew = vi.fn();
  });

  describe('Loading warbands', () => {
    it('should load and display warbands successfully', async () => {
      // Requirement 7.1: Display all saved warbands
      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
        expect(screen.getByText('Mutant Horde')).toBeInTheDocument();
      });

      expect(mockDataRepository.getAllWarbands).toHaveBeenCalledTimes(1);
    });

    it('should display error state when loading fails', async () => {
      const errorMessage = 'Failed to load';
      mockDataRepository.getAllWarbands = vi.fn().mockImplementation(() => {
        throw new Error(errorMessage);
      });

      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load warbands/)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      let callCount = 0;
      mockDataRepository.getAllWarbands = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network error');
        }
        return mockWarbandSummaries;
      });

      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
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

      expect(mockDataRepository.getAllWarbands).toHaveBeenCalledTimes(2);
    });
  });

  describe('Displaying warband list', () => {
    it('should display warband name', async () => {
      // Requirement 7.2: Show warband name
      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
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
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
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
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('75')).toBeInTheDocument();
        expect(screen.getByText('125')).toBeInTheDocument();
      });
    });

    it('should display total cost', async () => {
      // Requirement 7.5: Show total point cost
      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('should display weirdo count', async () => {
      // Requirement 7.6: Show number of weirdos
      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('should display Load and Delete buttons for each warband', async () => {
      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
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
      mockDataRepository.getAllWarbands = vi.fn().mockReturnValue([]);

      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/No warbands found. Create your first warband to get started!/)
        ).toBeInTheDocument();
      });
    });

    it('should display create button in empty state', async () => {
      mockDataRepository.getAllWarbands = vi.fn().mockReturnValue([]);

      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Create New Warband')).toBeInTheDocument();
      });
    });
  });

  describe('Loading a warband', () => {
    it('should call onSelectWarband when Load button is clicked', async () => {
      // Requirement 7.9: Load warband functionality
      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
      });

      const loadButtons = screen.getAllByText('Load');
      fireEvent.click(loadButtons[0]);

      expect(mockOnSelectWarband).toHaveBeenCalledWith('1');
    });
  });

  describe('Deleting a warband', () => {
    it('should show confirmation dialog when Delete button is clicked', async () => {
      // Requirement 8.1: Show confirmation dialog
      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
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
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
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

      expect(mockOnDeleteWarband).toHaveBeenCalledWith('1');
      
      // List should be reloaded
      await waitFor(() => {
        expect(mockDataRepository.getAllWarbands).toHaveBeenCalledTimes(2);
      });
    });

    it('should not delete warband when cancelled', async () => {
      // Requirement 8.4: Cancel preserves warband
      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
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

      expect(mockOnDeleteWarband).not.toHaveBeenCalled();
      
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
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
      });

      expect(screen.getByText('Create New Warband')).toBeInTheDocument();
    });

    it('should call onCreateNew when create button is clicked', async () => {
      render(
        <WarbandList
          dataRepository={mockDataRepository}
          onSelectWarband={mockOnSelectWarband}
          onDeleteWarband={mockOnDeleteWarband}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Cyborg Squad')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create New Warband');
      fireEvent.click(createButton);

      expect(mockOnCreateNew).toHaveBeenCalled();
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
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
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
