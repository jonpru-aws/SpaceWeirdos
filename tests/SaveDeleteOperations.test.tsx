import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WarbandEditor } from '../src/frontend/components/WarbandEditor';
import { WarbandList } from '../src/frontend/components/WarbandList';
import { WarbandProvider } from '../src/frontend/contexts/WarbandContext';
import { Warband } from '../src/backend/models/types';
import * as apiClientModule from '../src/frontend/services/apiClient';

/**
 * Save/Delete Operations Tests
 * 
 * Tests save and delete functionality with notifications.
 * 
 * Requirements: 8.3, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4
 */

describe('Save/Delete Operations', () => {
  let mockOnSaveSuccess: ReturnType<typeof vi.fn>;
  let mockOnSaveError: ReturnType<typeof vi.fn>;
  let mockOnDeleteSuccess: ReturnType<typeof vi.fn>;
  let mockOnDeleteError: ReturnType<typeof vi.fn>;
  let mockOnBack: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSaveSuccess = vi.fn();
    mockOnSaveError = vi.fn();
    mockOnDeleteSuccess = vi.fn();
    mockOnDeleteError = vi.fn();
    mockOnBack = vi.fn();
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  /**
   * Test: Save validates before persisting
   * Requirements: 9.1
   */
  it('should validate warband before saving', async () => {
    const user = userEvent.setup();

    // Mock API client to return validation error
    vi.spyOn(apiClientModule.apiClient, 'validateWarband').mockResolvedValue({
      valid: false,
      errors: [{
        field: 'name',
        message: 'Warband name is required',
        severity: 'error'
      }]
    });

    render(
      <WarbandProvider>
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

    // Mock API client for successful save
    vi.spyOn(apiClientModule.apiClient, 'validateWarband').mockResolvedValue({
      valid: true,
      errors: []
    });
    vi.spyOn(apiClientModule.apiClient, 'createWarband').mockResolvedValue({
      id: 'new-id',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    render(
      <WarbandProvider>
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

    // Create warband data
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

    // Mock API client
    vi.spyOn(apiClientModule.apiClient, 'getWarband').mockResolvedValue(warband);

    render(
      <WarbandProvider>
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

    // Create warband data
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

    // Mock API client
    vi.spyOn(apiClientModule.apiClient, 'getWarband').mockResolvedValue(warband);
    vi.spyOn(apiClientModule.apiClient, 'deleteWarband').mockResolvedValue(undefined);

    render(
      <WarbandProvider>
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

    // API should have been called
    expect(apiClientModule.apiClient.deleteWarband).toHaveBeenCalledWith('test-id');
  });

  /**
   * Test: Delete from list shows confirmation and updates
   * Requirements: 8.3, 8.5, 8.6, 9.3
   */
  it('should delete warband from list after confirmation', async () => {
    const user = userEvent.setup();
    const mockOnCreateWarband = vi.fn();
    const mockOnLoadWarband = vi.fn();

    // Create warband data
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

    // Mock API client
    vi.spyOn(apiClientModule.apiClient, 'getAllWarbands').mockResolvedValue([warband]);
    vi.spyOn(apiClientModule.apiClient, 'deleteWarband').mockResolvedValue(undefined);

    render(
      <WarbandList
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

    // Mock the second call to getAllWarbands (after deletion) to return empty array
    vi.spyOn(apiClientModule.apiClient, 'getAllWarbands').mockResolvedValue([]);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });
    await user.click(confirmButton);

    // Should call success callback
    await waitFor(() => {
      expect(mockOnDeleteSuccess).toHaveBeenCalled();
      expect(mockOnDeleteError).not.toHaveBeenCalled();
    });

    // API should have been called
    expect(apiClientModule.apiClient.deleteWarband).toHaveBeenCalledWith('test-id');

    // Warband should be removed from list
    await waitFor(() => {
      expect(screen.queryByText('Test Warband')).not.toBeInTheDocument();
    });
  });
});
