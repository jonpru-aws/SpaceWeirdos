import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, ApiError } from '../src/frontend/services/apiClient';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.clearAllMocks();
  });

  describe('createWarband', () => {
    it('should create a warband successfully', async () => {
      const mockWarband = {
        id: '123',
        name: 'Test Warband',
        ability: 'Cyborgs' as const,
        pointLimit: 75 as const,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockWarband,
      });

      const result = await apiClient.createWarband({
        name: 'Test Warband',
        pointLimit: 75,
        ability: 'Cyborgs',
      });

      expect(result).toEqual(mockWarband);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/warbands'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        })
      );
    });

    it('should throw ApiError on failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Invalid data',
          details: 'Name is required',
        }),
      });

      await expect(
        apiClient.createWarband({
          name: '',
          pointLimit: 75,
          ability: 'Cyborgs',
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('getAllWarbands', () => {
    it('should fetch all warbands', async () => {
      const mockWarbands = [
        {
          id: '1',
          name: 'Warband 1',
          ability: 'Cyborgs' as const,
          pointLimit: 75 as const,
          totalCost: 0,
          weirdos: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockWarbands,
      });

      const result = await apiClient.getAllWarbands();

      expect(result).toEqual(mockWarbands);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/warbands'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('getWarband', () => {
    it('should fetch a specific warband', async () => {
      const mockWarband = {
        id: '123',
        name: 'Test Warband',
        ability: 'Cyborgs' as const,
        pointLimit: 75 as const,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockWarband,
      });

      const result = await apiClient.getWarband('123');

      expect(result).toEqual(mockWarband);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/warbands/123'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should throw ApiError when warband not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Warband not found',
          details: 'No warband found with id: 999',
        }),
      });

      await expect(apiClient.getWarband('999')).rejects.toThrow(ApiError);
    });
  });

  describe('updateWarband', () => {
    it('should update a warband', async () => {
      const mockWarband = {
        id: '123',
        name: 'Updated Warband',
        ability: 'Cyborgs' as const,
        pointLimit: 125 as const,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockWarband,
      });

      const result = await apiClient.updateWarband('123', {
        name: 'Updated Warband',
        pointLimit: 125,
      });

      expect(result).toEqual(mockWarband);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/warbands/123'),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  describe('deleteWarband', () => {
    it('should delete a warband', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(apiClient.deleteWarband('123')).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/warbands/123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for a weirdo', async () => {
      const mockWeirdo = {
        id: '1',
        name: 'Test Weirdo',
        type: 'leader' as const,
        attributes: {
          speed: 2 as const,
          defense: '2d8' as const,
          firepower: '2d8' as const,
          prowess: '2d8' as const,
          willpower: '2d8' as const,
        },
        closeCombatWeapons: [],
        rangedWeapons: [],
        equipment: [],
        psychicPowers: [],
        leaderTrait: null,
        notes: '',
        totalCost: 0,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ cost: 15 }),
      });

      const result = await apiClient.calculateCost({
        weirdo: mockWeirdo,
        warbandAbility: 'Cyborgs',
      });

      expect(result).toEqual({ cost: 15 });
    });
  });

  describe('validate', () => {
    it('should validate a warband', async () => {
      const mockWarband = {
        id: '123',
        name: 'Test Warband',
        ability: 'Cyborgs' as const,
        pointLimit: 75 as const,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          valid: true,
          errors: [],
        }),
      });

      const result = await apiClient.validate({ warband: mockWarband });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Error handling and retry logic', () => {
    it('should retry on server errors', async () => {
      // First two calls fail with 500, third succeeds
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [],
        });

      const result = await apiClient.getAllWarbands();

      expect(result).toEqual([]);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on client errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Bad request',
          details: 'Invalid data',
        }),
      });

      await expect(
        apiClient.createWarband({
          name: '',
          pointLimit: 75,
          ability: 'Cyborgs',
        })
      ).rejects.toThrow(ApiError);

      // Should only be called once (no retries for 4xx errors)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw ApiError with details', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Not found',
          details: 'Warband does not exist',
        }),
      });

      try {
        await apiClient.getWarband('999');
        expect.fail('Should have thrown an error');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ApiError);
        if (error instanceof ApiError) {
          expect(error.message).toBe('Not found');
          expect(error.statusCode).toBe(404);
          expect(error.details).toBe('Warband does not exist');
        }
      }
    });
  });
});

