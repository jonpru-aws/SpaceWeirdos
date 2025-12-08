/**
 * Validation API Integration Tests
 * 
 * Tests the integration between frontend and backend validation API endpoints.
 * Verifies that validation API calls are made correctly and errors are handled properly.
 * 
 * Requirements: 6.2, 6.4, 6.5, 6.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../src/frontend/services/apiClient';
import { Warband, Weirdo, ValidationError } from '../src/backend/models/types';

describe('Validation API Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('validateWarband API endpoint', () => {
    /**
     * Test that validateWarband calls the correct API endpoint
     * Requirements: 6.2, 6.4, 6.7
     */
    it('should call POST /api/validation/warband endpoint', async () => {
      const mockWarband: Warband = {
        id: 'test-warband-1',
        name: 'Test Warband',
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock fetch to intercept API call
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            valid: true,
            errors: [],
          },
        }),
      } as Response);

      await apiClient.validateWarband(mockWarband);

      // Verify the correct endpoint was called
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/validation/warband'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockWarband),
        })
      );

      fetchSpy.mockRestore();
    });

    /**
     * Test that validateWarband returns validation result correctly
     * Requirements: 6.2, 6.4
     */
    it('should return validation result with valid flag and errors', async () => {
      const mockWarband: Warband = {
        id: 'test-warband-1',
        name: 'Test Warband',
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockErrors: ValidationError[] = [
        {
          field: 'warband.name',
          message: 'Warband name is required',
          code: 'WARBAND_NAME_REQUIRED',
        },
      ];

      // Mock fetch to return validation errors
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            valid: false,
            errors: mockErrors,
          },
        }),
      } as Response);

      const result = await apiClient.validateWarband(mockWarband);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(mockErrors);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('WARBAND_NAME_REQUIRED');

      fetchSpy.mockRestore();
    });

    /**
     * Test that validateWarband handles API errors gracefully
     * Requirements: 6.5
     */
    it('should handle API errors when validation endpoint fails', async () => {
      const mockWarband: Warband = {
        id: 'test-warband-1',
        name: 'Test Warband',
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock fetch to return error response (400 error won't retry)
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Bad request',
          details: 'Invalid warband data',
        }),
      } as Response);

      await expect(apiClient.validateWarband(mockWarband)).rejects.toThrow();

      fetchSpy.mockRestore();
    });
  });

  describe('validateWeirdo API endpoint', () => {
    /**
     * Test that validateWeirdo calls the correct API endpoint
     * Requirements: 6.2, 6.4, 6.7
     */
    it('should call POST /api/validation/weirdo endpoint', async () => {
      const mockWeirdo: Weirdo = {
        id: 'test-weirdo-1',
        name: 'Test Leader',
        type: 'leader',
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
        totalCost: 0,
      };

      // Mock fetch to intercept API call
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            valid: true,
            errors: [],
          },
        }),
      } as Response);

      await apiClient.validateWeirdo(mockWeirdo);

      // Verify the correct endpoint was called
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/validation/weirdo'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ weirdo: mockWeirdo, warband: undefined }),
        })
      );

      fetchSpy.mockRestore();
    });

    /**
     * Test that validateWeirdo includes warband context when provided
     * Requirements: 6.2, 6.4, 6.7
     */
    it('should include warband context in API call when provided', async () => {
      const mockWeirdo: Weirdo = {
        id: 'test-weirdo-1',
        name: 'Test Leader',
        type: 'leader',
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
        totalCost: 0,
      };

      const mockWarband: Warband = {
        id: 'test-warband-1',
        name: 'Test Warband',
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [mockWeirdo],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock fetch to intercept API call
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            valid: true,
            errors: [],
          },
        }),
      } as Response);

      await apiClient.validateWeirdo(mockWeirdo, mockWarband);

      // Verify warband context was included
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/validation/weirdo'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ weirdo: mockWeirdo, warband: mockWarband }),
        })
      );

      fetchSpy.mockRestore();
    });

    /**
     * Test that validateWeirdo returns validation errors correctly
     * Requirements: 6.2, 6.4
     */
    it('should return validation errors from API response', async () => {
      const mockWeirdo: Weirdo = {
        id: 'test-weirdo-1',
        name: '',
        type: 'leader',
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
        totalCost: 0,
      };

      const mockErrors: ValidationError[] = [
        {
          field: 'weirdo.name',
          message: 'Weirdo name is required',
          code: 'WEIRDO_NAME_REQUIRED',
        },
      ];

      // Mock fetch to return validation errors
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            valid: false,
            errors: mockErrors,
          },
        }),
      } as Response);

      const result = await apiClient.validateWeirdo(mockWeirdo);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(mockErrors);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('WEIRDO_NAME_REQUIRED');

      fetchSpy.mockRestore();
    });

    /**
     * Test that validateWeirdo handles API errors gracefully
     * Requirements: 6.5
     */
    it('should handle API errors when validation endpoint fails', async () => {
      const mockWeirdo: Weirdo = {
        id: 'test-weirdo-1',
        name: 'Test Leader',
        type: 'leader',
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
        totalCost: 0,
      };

      // Mock fetch to return error response (400 error won't retry)
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Bad request',
          details: 'Invalid weirdo data',
        }),
      } as Response);

      await expect(apiClient.validateWeirdo(mockWeirdo)).rejects.toThrow();

      fetchSpy.mockRestore();
    });
  });

  describe('Validation error display', () => {
    /**
     * Test that validation errors are properly structured for display
     * Requirements: 6.2, 6.4
     */
    it('should return structured validation errors with field, message, and code', async () => {
      const mockWarband: Warband = {
        id: 'test-warband-1',
        name: '',
        ability: null,
        pointLimit: 75,
        totalCost: 100,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockErrors: ValidationError[] = [
        {
          field: 'warband.name',
          message: 'Warband name is required',
          code: 'WARBAND_NAME_REQUIRED',
        },
        {
          field: 'warband.totalCost',
          message: 'Warband exceeds point limit of 75',
          code: 'WARBAND_POINT_LIMIT_EXCEEDED',
        },
      ];

      // Mock fetch to return multiple validation errors
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            valid: false,
            errors: mockErrors,
          },
        }),
      } as Response);

      const result = await apiClient.validateWarband(mockWarband);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      
      // Verify each error has required fields
      result.errors.forEach(error => {
        expect(error).toHaveProperty('field');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('code');
        expect(typeof error.field).toBe('string');
        expect(typeof error.message).toBe('string');
        expect(typeof error.code).toBe('string');
      });

      fetchSpy.mockRestore();
    });
  });
});
