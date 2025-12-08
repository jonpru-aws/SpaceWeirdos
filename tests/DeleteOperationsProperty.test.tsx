import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { WarbandEditor } from '../src/frontend/components/WarbandEditor';
import { WarbandList } from '../src/frontend/components/WarbandList';
import { WarbandProvider } from '../src/frontend/contexts/WarbandContext';
import { Warband } from '../src/backend/models/types';
import * as apiClientModule from '../src/frontend/services/apiClient';

/**
 * Delete Operations Property-Based Tests
 * 
 * Property-based tests for delete operations using fast-check.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

describe('Delete Operations Property Tests', () => {
  let mockOnBack: ReturnType<typeof vi.fn>;
  let mockOnSaveSuccess: ReturnType<typeof vi.fn>;
  let mockOnSaveError: ReturnType<typeof vi.fn>;
  let mockOnDeleteSuccess: ReturnType<typeof vi.fn>;
  let mockOnDeleteError: ReturnType<typeof vi.fn>;
  let mockOnCreateWarband: ReturnType<typeof vi.fn>;
  let mockOnLoadWarband: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnBack = vi.fn();
    mockOnSaveSuccess = vi.fn();
    mockOnSaveError = vi.fn();
    mockOnDeleteSuccess = vi.fn();
    mockOnDeleteError = vi.fn();
    mockOnCreateWarband = vi.fn();
    mockOnLoadWarband = vi.fn();
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  // Increase timeout for property-based tests
  const testTimeout = 30000;

  /**
   * Property 34: Delete shows confirmation dialog
   * **Feature: npm-package-upgrade-fixes, Property 34: Delete shows confirmation dialog**
   * **Validates: Requirements 9.1**
   * 
   * For any warband, clicking delete should display a confirmation dialog before calling the API
   */
  describe('Property 34: Delete shows confirmation dialog', () => {
    it('should show confirmation dialog for any warband before deleting', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            pointLimit: fc.constantFrom(75, 125),
          }),
          async (warbandData) => {
            // Clear all mocks before each property test run
            vi.clearAllMocks();
            
            const user = userEvent.setup();

            const warband: Warband = {
              ...warbandData,
              ability: null,
              totalCost: 0,
              weirdos: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Mock API client
            vi.spyOn(apiClientModule.apiClient, 'getWarband').mockResolvedValue(warband);

            const { unmount, container } = render(
              <WarbandProvider>
                <WarbandEditor
                  warbandId={warband.id}
                  onBack={mockOnBack}
                  onSaveSuccess={mockOnSaveSuccess}
                  onSaveError={mockOnSaveError}
                  onDeleteSuccess={mockOnDeleteSuccess}
                  onDeleteError={mockOnDeleteError}
                />
              </WarbandProvider>
            );

            try {
              // Wait for warband to load
              await waitFor(() => {
                const deleteButtons = container.querySelectorAll('button[aria-label="Delete warband"]');
                expect(deleteButtons.length).toBeGreaterThan(0);
              }, { timeout: 3000 });

              // Click delete button
              const deleteButton = container.querySelector('button[aria-label="Delete warband"]') as HTMLButtonElement;
              await user.click(deleteButton);

              // Confirmation dialog should appear with warband name
              await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
                expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument();
                // Use text content matching instead of regex to avoid regex special characters
                const dialogText = screen.getByRole('dialog').textContent || '';
                expect(dialogText).toContain(warband.name);
              }, { timeout: 3000 });
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 3 }
      );
    }, 45000); // Increase timeout to 45 seconds for 3 runs
  });

  /**
   * Property 35: Confirmed delete calls API
   * **Feature: npm-package-upgrade-fixes, Property 35: Confirmed delete calls API**
   * **Validates: Requirements 9.2**
   * 
   * For any warband, confirming the delete dialog should call the delete API endpoint
   */
  describe('Property 35: Confirmed delete calls API', () => {
    it('should call delete API for any warband when confirmed', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            pointLimit: fc.constantFrom(75, 125),
          }),
          async (warbandData) => {
            // Clear all mocks before each property test run
            vi.clearAllMocks();
            
            const user = userEvent.setup();

            const warband: Warband = {
              ...warbandData,
              ability: null,
              totalCost: 0,
              weirdos: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Mock API client
            vi.spyOn(apiClientModule.apiClient, 'getWarband').mockResolvedValue(warband);
            const deleteSpy = vi.spyOn(apiClientModule.apiClient, 'deleteWarband').mockResolvedValue(undefined);

            const { unmount, container } = render(
              <WarbandProvider>
                <WarbandEditor
                  warbandId={warband.id}
                  onBack={mockOnBack}
                  onSaveSuccess={mockOnSaveSuccess}
                  onSaveError={mockOnSaveError}
                  onDeleteSuccess={mockOnDeleteSuccess}
                  onDeleteError={mockOnDeleteError}
                />
              </WarbandProvider>
            );

            try {
              // Wait for warband to load
              await waitFor(() => {
                const deleteButtons = container.querySelectorAll('button[aria-label="Delete warband"]');
                expect(deleteButtons.length).toBeGreaterThan(0);
              }, { timeout: 3000 });

              // Click delete button
              const deleteButton = container.querySelector('button[aria-label="Delete warband"]') as HTMLButtonElement;
              await user.click(deleteButton);

              // Wait for confirmation dialog
              await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
              }, { timeout: 3000 });

              // Confirm deletion
              const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });
              await user.click(confirmButton);

              // API should have been called with correct ID
              await waitFor(() => {
                expect(deleteSpy).toHaveBeenCalledWith(warband.id);
              }, { timeout: 3000 });
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5 }
      );
    }, testTimeout);
  });

  /**
   * Property 36: Successful delete removes from list
   * **Feature: npm-package-upgrade-fixes, Property 36: Successful delete removes from list**
   * **Validates: Requirements 9.3**
   * 
   * For any warband, when delete succeeds, the warband should be removed from the displayed list
   */
  describe('Property 36: Successful delete removes from list', () => {
    it('should remove any warband from list after successful deletion', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            pointLimit: fc.constantFrom(75, 125),
          }),
          async (warbandData) => {
            // Clear all mocks before each property test run
            vi.clearAllMocks();
            
            const user = userEvent.setup();

            const warband: Warband = {
              ...warbandData,
              ability: null,
              totalCost: 0,
              weirdos: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Mock API client
            vi.spyOn(apiClientModule.apiClient, 'getAllWarbands').mockResolvedValue([warband]);
            vi.spyOn(apiClientModule.apiClient, 'deleteWarband').mockResolvedValue(undefined);

            const { unmount } = render(
              <WarbandList
                onCreateWarband={mockOnCreateWarband}
                onLoadWarband={mockOnLoadWarband}
                onDeleteSuccess={mockOnDeleteSuccess}
                onDeleteError={mockOnDeleteError}
              />
            );

            try {
              // Wait for warband list to load
              await waitFor(() => {
                expect(screen.getByText(warband.name)).toBeInTheDocument();
              }, { timeout: 3000 });

              // Click delete button using exact aria-label
              const deleteButton = screen.getByRole('button', { name: `Delete ${warband.name}` });
              await user.click(deleteButton);

              // Wait for confirmation dialog
              await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
              }, { timeout: 3000 });

              // Mock the second call to getAllWarbands (after deletion) to return empty array
              vi.spyOn(apiClientModule.apiClient, 'getAllWarbands').mockResolvedValue([]);

              // Confirm deletion
              const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });
              await user.click(confirmButton);

              // Warband should be removed from list
              await waitFor(() => {
                expect(screen.queryByText(warband.name)).not.toBeInTheDocument();
              }, { timeout: 3000 });
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 3 }
      );
    }, 45000); // Increase timeout to 45 seconds for 3 runs
  });

  /**
   * Property 37: Successful delete shows notification
   * **Feature: npm-package-upgrade-fixes, Property 37: Successful delete shows notification**
   * **Validates: Requirements 9.4**
   * 
   * For any warband, when delete succeeds, a success notification should be displayed
   */
  describe('Property 37: Successful delete shows notification', () => {
    it('should call success callback for any warband after successful deletion', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            pointLimit: fc.constantFrom(75, 125),
          }),
          async (warbandData) => {
            // Clear all mocks before each property test run
            vi.clearAllMocks();
            
            const user = userEvent.setup();

            const warband: Warband = {
              ...warbandData,
              ability: null,
              totalCost: 0,
              weirdos: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Mock API client
            vi.spyOn(apiClientModule.apiClient, 'getWarband').mockResolvedValue(warband);
            vi.spyOn(apiClientModule.apiClient, 'deleteWarband').mockResolvedValue(undefined);

            const { unmount, container } = render(
              <WarbandProvider>
                <WarbandEditor
                  warbandId={warband.id}
                  onBack={mockOnBack}
                  onSaveSuccess={mockOnSaveSuccess}
                  onSaveError={mockOnSaveError}
                  onDeleteSuccess={mockOnDeleteSuccess}
                  onDeleteError={mockOnDeleteError}
                />
              </WarbandProvider>
            );

            try {
              // Wait for warband to load
              await waitFor(() => {
                const deleteButtons = container.querySelectorAll('button[aria-label="Delete warband"]');
                expect(deleteButtons.length).toBeGreaterThan(0);
              }, { timeout: 3000 });

              // Click delete button
              const deleteButton = container.querySelector('button[aria-label="Delete warband"]') as HTMLButtonElement;
              await user.click(deleteButton);

              // Wait for confirmation dialog
              await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
              }, { timeout: 3000 });

              // Confirm deletion
              const confirmButton = screen.getByRole('button', { name: /confirm deletion/i });
              await user.click(confirmButton);

              // Success callback should be called
              await waitFor(() => {
                expect(mockOnDeleteSuccess).toHaveBeenCalled();
                expect(mockOnDeleteError).not.toHaveBeenCalled();
              }, { timeout: 3000 });
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5 }
      );
    }, testTimeout);
  });

  /**
   * Property 38: Cancelled delete prevents API call
   * **Feature: npm-package-upgrade-fixes, Property 38: Cancelled delete prevents API call**
   * **Validates: Requirements 9.5**
   * 
   * For any warband, cancelling the delete dialog should not call the delete API endpoint
   */
  describe('Property 38: Cancelled delete prevents API call', () => {
    it('should not call delete API for any warband when cancelled', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            pointLimit: fc.constantFrom(75, 125),
          }),
          async (warbandData) => {
            // Clear all mocks before each property test run
            vi.clearAllMocks();
            
            const user = userEvent.setup();

            const warband: Warband = {
              ...warbandData,
              ability: null,
              totalCost: 0,
              weirdos: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Mock API client
            vi.spyOn(apiClientModule.apiClient, 'getWarband').mockResolvedValue(warband);
            const deleteSpy = vi.spyOn(apiClientModule.apiClient, 'deleteWarband').mockResolvedValue(undefined);

            const { unmount, container } = render(
              <WarbandProvider>
                <WarbandEditor
                  warbandId={warband.id}
                  onBack={mockOnBack}
                  onSaveSuccess={mockOnSaveSuccess}
                  onSaveError={mockOnSaveError}
                  onDeleteSuccess={mockOnDeleteSuccess}
                  onDeleteError={mockOnDeleteError}
                />
              </WarbandProvider>
            );

            try {
              // Wait for warband to load
              await waitFor(() => {
                const deleteButtons = container.querySelectorAll('button[aria-label="Delete warband"]');
                expect(deleteButtons.length).toBeGreaterThan(0);
              }, { timeout: 3000 });

              // Click delete button
              const deleteButton = container.querySelector('button[aria-label="Delete warband"]') as HTMLButtonElement;
              await user.click(deleteButton);

              // Wait for confirmation dialog
              await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
              }, { timeout: 3000 });

              // Cancel deletion
              const cancelButton = screen.getByRole('button', { name: /cancel/i });
              await user.click(cancelButton);

              // Dialog should be closed
              await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
              }, { timeout: 3000 });

              // API should NOT have been called
              expect(deleteSpy).not.toHaveBeenCalled();
              expect(mockOnDeleteSuccess).not.toHaveBeenCalled();
              expect(mockOnDeleteError).not.toHaveBeenCalled();
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5 }
      );
    }, testTimeout);
  });
});
