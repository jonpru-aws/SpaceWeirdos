import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WarbandEditor } from '../src/frontend/components/WarbandEditor';
import { WarbandList } from '../src/frontend/components/WarbandList';
import { WarbandProvider } from '../src/frontend/contexts/WarbandContext';
import { DataRepository } from '../src/backend/services/DataRepository';
import { CostEngine } from '../src/backend/services/CostEngine';
import { ValidationService } from '../src/backend/services/ValidationService';
import { Warband } from '../src/backend/models/types';

/**
 * Save/Delete Operations Tests
 * 
 * Tests save and delete functionality with notifications.
 * 
 * Requirements: 8.3, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4
 */

describe('Save/Delete Operations', () => {
  let dataRepository: DataRepository;
  let costEngine: CostEngine;
  let validationService: ValidationService;
  let mockOnSaveSuccess: ReturnType<typeof vi.fn>;
  let mockOnSaveError: ReturnType<typeof vi.fn>;
  let mockOnDeleteSuccess: ReturnType<typeof vi.fn>;
  let mockOnDeleteError: ReturnType<typeof vi.fn>;
  let mockOnBack: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dataRepository = new DataRepository('', false); // Disable persistence for tests
    costEngine = new CostEngine();
    validationService = new ValidationService();
    mockOnSaveSuccess = vi.fn();
    mockOnSaveError = vi.fn();
    mockOnDeleteSuccess = vi.fn();
    mockOnDeleteError = vi.fn();
    mockOnBack = vi.fn();
  });

  /**
   * Test: Save validates before persisting
   * Requirements: 9.1
   */
  it('should validate warband before saving', async () => {
    const user = userEvent.setup();

    render(
      <WarbandProvider
        dataRepository={dataRepository}
        costEngine={costEngine}
        validationService={validationService}
      >
        <WarbandEditor
          onBack={mockOnBack}
          onSaveSuccess={mockOnSaveSuccess}
          onSaveError={mockOnSaveError}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
        />
      </WarbandProvider>
    );

    // Wait for warband to be created
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save warband/i })).toBeInTheDocument();
    });

    // Clear the warband name to make it invalid
    const nameInput = screen.getByLabelText(/warband name/i);
    await user.clear(nameInput);

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save warband/i });
    await user.click(saveButton);

    // Should call error callback with validation error
    await waitFor(() => {
      expect(mockOnSaveError).toHaveBeenCalled();
      expect(mockOnSaveSuccess).not.toHaveBeenCalled();
    });
  });

  /**
   * Test: Save shows success notification
   * Requirements: 9.1
   */
  it('should show success notification on successful save', async () => {
    const user = userEvent.setup();

    render(
      <WarbandProvider
        dataRepository={dataRepository}
        costEngine={costEngine}
        validationService={validationService}
      >
        <WarbandEditor
          onBack={mockOnBack}
          onSaveSuccess={mockOnSaveSuccess}
          onSaveError={mockOnSaveError}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
        />
      </WarbandProvider>
    );

    // Wait for warband to be created
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save warband/i })).toBeInTheDocument();
    });

    // Ensure warband has a valid name
    const nameInput = screen.getByLabelText(/warband name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Test Warband');

    // Save the warband
    const saveButton = screen.getByRole('button', { name: /save warband/i });
    await user.click(saveButton);

    // Should call success callback
    await waitFor(() => {
      expect(mockOnSaveSuccess).toHaveBeenCalled();
      expect(mockOnSaveError).not.toHaveBeenCalled();
    });
  });

  /**
   * Test: Delete shows confirmation dialog
   * Requirements: 8.3
   */
  it('should show confirmation dialog before deleting', async () => {
    const user = userEvent.setup();

    // Create and save a warband first
    const warband: Warband = {
      id: 'test-id',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dataRepository.saveWarband(warband);

    render(
      <WarbandProvider
        dataRepository={dataRepository}
        costEngine={costEngine}
        validationService={validationService}
      >
        <WarbandEditor
          warbandId="test-id"
          onBack={mockOnBack}
          onSaveSuccess={mockOnSaveSuccess}
          onSaveError={mockOnSaveError}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
        />
      </WarbandProvider>
    );

    // Wait for warband to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete warband/i })).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete warband/i });
    await user.click(deleteButton);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument();
      expect(screen.getByText(/test warband/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Delete updates list after confirmation
   * Requirements: 8.5, 8.6, 9.3
   */
  it('should delete warband and show success notification after confirmation', async () => {
    const user = userEvent.setup();

    // Create and save a warband first
    const warband: Warband = {
      id: 'test-id',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dataRepository.saveWarband(warband);

    render(
      <WarbandProvider
        dataRepository={dataRepository}
        costEngine={costEngine}
        validationService={validationService}
      >
        <WarbandEditor
          warbandId="test-id"
          onBack={mockOnBack}
          onSaveSuccess={mockOnSaveSuccess}
          onSaveError={mockOnSaveError}
          onDeleteSuccess={mockOnDeleteSuccess}
          onDeleteError={mockOnDeleteError}
        />
      </WarbandProvider>
    );

    // Wait for warband to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete warband/i })).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete warband/i });
    await user.click(deleteButton);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });
    await user.click(confirmButton);

    // Should call success callback
    await waitFor(() => {
      expect(mockOnDeleteSuccess).toHaveBeenCalled();
      expect(mockOnDeleteError).not.toHaveBeenCalled();
    });

    // Warband should be deleted from repository
    expect(dataRepository.getWarband('test-id')).toBeNull();
  });

  /**
   * Test: Delete from list shows confirmation and updates
   * Requirements: 8.3, 8.5, 8.6, 9.3
   */
  it('should delete warband from list after confirmation', async () => {
    const user = userEvent.setup();
    const mockOnCreateWarband = vi.fn();
    const mockOnLoadWarband = vi.fn();

    // Create and save a warband first
    const warband: Warband = {
      id: 'test-id',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dataRepository.saveWarband(warband);

    render(
      <WarbandList
        dataRepository={dataRepository}
        onCreateWarband={mockOnCreateWarband}
        onLoadWarband={mockOnLoadWarband}
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Wait for warband list to load
    await waitFor(() => {
      expect(screen.getByText('Test Warband')).toBeInTheDocument();
    });

    // Click delete button on warband card
    const deleteButton = screen.getByRole('button', { name: /delete test warband/i });
    await user.click(deleteButton);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });
    await user.click(confirmButton);

    // Should call success callback
    await waitFor(() => {
      expect(mockOnDeleteSuccess).toHaveBeenCalled();
      expect(mockOnDeleteError).not.toHaveBeenCalled();
    });

    // Warband should be removed from list
    await waitFor(() => {
      expect(screen.queryByText('Test Warband')).not.toBeInTheDocument();
    });
  });
});
