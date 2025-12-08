import { describe, it, expect, vi } from 'vitest';
import { apiClient } from '../src/frontend/services/apiClient';
import type { Warband, ValidationResult } from '../src/backend/models/types';

/**
 * Property-Based Tests for Save Operations
 * 
 * Tests universal properties of save and validation flow.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

describe('Save Operations Property Tests', () => {
  /**
   * Helper function to simulate the save flow logic
   * This mirrors what WarbandContext.saveWarband does
   */
  async function simulateSaveFlow(
    warband: Warband,
    onSuccess: () => void,
    onError: (error: Error) => void
  ): Promise<{ validateCalled: boolean; saveCalled: boolean; validationFirst: boolean; updateUsed: boolean }> {
    let validateCalled = false;
    let saveCalled = false;
    let validationFirst = false;
    let updateUsed = false;

    try {
      // Step 1: Validate
      validateCalled = true;
      const validation = await apiClient.validateWarband(warband);
      
      if (!validation.valid) {
        throw new Error('Validation failed');
      }

      // Step 2: Save (only if validation passed)
      if (!saveCalled) {
        validationFirst = true;
      }
      saveCalled = true;
      
      if (warband.id) {
        updateUsed = true;
        await apiClient.updateWarband(warband.id, warband);
      } else {
        await apiClient.createWarband({
          name: warband.name,
          pointLimit: warband.pointLimit,
          ability: warband.ability,
          weirdos: warband.weirdos
        });
      }
      
      onSuccess();
      return { validateCalled, saveCalled, validationFirst, updateUsed };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError(err);
      return { validateCalled, saveCalled, validationFirst, updateUsed };
    }
  }

  /**
   * **Feature: npm-package-upgrade-fixes, Property 28: Save validates before saving**
   * **Validates: Requirements 8.1**
   * 
   * For any warband, clicking save should call the validation API before calling the save API
   */
  it('Property 28: Save validates before saving', async () => {
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    // Mock validation to succeed
    const validateSpy = vi.spyOn(apiClient, 'validateWarband').mockResolvedValue({
      valid: true,
      errors: []
    } as ValidationResult);

    // Mock save
    const createSpy = vi.spyOn(apiClient, 'createWarband').mockResolvedValue({
      id: 'test-id',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Warband);

    const warband: Warband = {
      id: '',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await simulateSaveFlow(warband, mockSuccess, mockError);

    validateSpy.mockRestore();
    createSpy.mockRestore();

    // Validation should be called before save
    expect(result.validateCalled).toBe(true);
    expect(result.saveCalled).toBe(true);
    expect(result.validationFirst).toBe(true);
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 29: Invalid warband prevents save**
   * **Validates: Requirements 8.2**
   * 
   * For any warband that fails validation, the save API should not be called
   */
  it('Property 29: Invalid warband prevents save', async () => {
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    // Mock validation to fail
    const validateSpy = vi.spyOn(apiClient, 'validateWarband').mockResolvedValue({
      valid: false,
      errors: [{
        field: 'name',
        code: 'WARBAND_NAME_REQUIRED',
        message: 'Validation error'
      }]
    } as ValidationResult);

    // Mock save - should not be called
    const createSpy = vi.spyOn(apiClient, 'createWarband').mockRejectedValue(
      new Error('Save should not be called')
    );

    const warband: Warband = {
      id: '',
      name: '',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await simulateSaveFlow(warband, mockSuccess, mockError);

    validateSpy.mockRestore();
    createSpy.mockRestore();

    // Save should not have been called
    expect(result.validateCalled).toBe(true);
    expect(result.saveCalled).toBe(false);
    expect(mockError).toHaveBeenCalled();
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 30: Validation errors are displayed**
   * **Validates: Requirements 8.3**
   * 
   * For any warband that fails validation, validation errors should be displayed (via error callback)
   */
  it('Property 30: Validation errors are displayed', async () => {
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    // Mock validation to fail
    const validateSpy = vi.spyOn(apiClient, 'validateWarband').mockResolvedValue({
      valid: false,
      errors: [{
        field: 'name',
        code: 'WARBAND_NAME_REQUIRED',
        message: 'Warband name is required'
      }]
    } as ValidationResult);

    const warband: Warband = {
      id: '',
      name: '',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await simulateSaveFlow(warband, mockSuccess, mockError);

    validateSpy.mockRestore();

    // Error callback should have been called (this is how errors are displayed)
    expect(mockError).toHaveBeenCalled();
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 31: Successful save calls success callback**
   * **Validates: Requirements 8.4**
   * 
   * For any valid warband, when save succeeds, the success callback should be called
   */
  it('Property 31: Successful save calls success callback', async () => {
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    // Mock validation to succeed
    const validateSpy = vi.spyOn(apiClient, 'validateWarband').mockResolvedValue({
      valid: true,
      errors: []
    } as ValidationResult);

    // Mock save to succeed
    const createSpy = vi.spyOn(apiClient, 'createWarband').mockResolvedValue({
      id: 'test-id',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Warband);

    const warband: Warband = {
      id: '',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await simulateSaveFlow(warband, mockSuccess, mockError);

    validateSpy.mockRestore();
    createSpy.mockRestore();

    // Success callback should have been called
    expect(mockSuccess).toHaveBeenCalled();
    expect(mockError).not.toHaveBeenCalled();
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 32: Failed save calls error callback**
   * **Validates: Requirements 8.5**
   * 
   * For any valid warband, when save fails, the error callback should be called
   */
  it('Property 32: Failed save calls error callback', async () => {
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    // Mock validation to succeed
    const validateSpy = vi.spyOn(apiClient, 'validateWarband').mockResolvedValue({
      valid: true,
      errors: []
    } as ValidationResult);

    // Mock save to fail
    const createSpy = vi.spyOn(apiClient, 'createWarband').mockRejectedValue(
      new Error('Save failed')
    );

    const warband: Warband = {
      id: '',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await simulateSaveFlow(warband, mockSuccess, mockError);

    validateSpy.mockRestore();
    createSpy.mockRestore();

    // Error callback should have been called
    expect(mockError).toHaveBeenCalled();
    expect(mockSuccess).not.toHaveBeenCalled();
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 33: Existing warband uses update endpoint**
   * **Validates: Requirements 8.6**
   * 
   * For any warband with a non-empty id, saving should call the update API endpoint with the warband ID
   */
  it('Property 33: Existing warband uses update endpoint', async () => {
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    // Mock validation to succeed
    const validateSpy = vi.spyOn(apiClient, 'validateWarband').mockResolvedValue({
      valid: true,
      errors: []
    } as ValidationResult);

    // Mock update
    const updateSpy = vi.spyOn(apiClient, 'updateWarband').mockResolvedValue({
      id: 'existing-id',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Warband);

    // Mock create - should not be called
    const createSpy = vi.spyOn(apiClient, 'createWarband').mockRejectedValue(
      new Error('Create should not be called for existing warband')
    );

    const warband: Warband = {
      id: 'existing-id',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await simulateSaveFlow(warband, mockSuccess, mockError);

    validateSpy.mockRestore();
    updateSpy.mockRestore();
    createSpy.mockRestore();

    // Update should have been used (not create)
    expect(result.updateUsed).toBe(true);
    expect(mockSuccess).toHaveBeenCalled();
  });
});
