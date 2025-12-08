import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { ReactNode } from 'react';
import * as apiClient from '../src/frontend/services/apiClient';

/**
 * Unit tests for WarbandContext
 * 
 * Tests warband creation, weirdo operations, cost calculations, and validation integration.
 * Requirements: 1.1-1.7, 3.1-3.3
 * 
 * NOTE: WarbandProvider was refactored to use API client directly instead of accepting
 * costEngine, dataRepository, and validationService props. The provider now only accepts
 * children. All API calls must be mocked in beforeEach for tests to work properly.
 */

describe('WarbandContext', () => {
  beforeEach(() => {
    // Mock API calls - required because WarbandProvider uses apiClient internally
    vi.spyOn(apiClient.apiClient, 'calculateCostRealTime').mockResolvedValue({
      data: {
        totalCost: 10,
        breakdown: {
          baseCost: 10,
          attributeCost: 0,
          weaponsCost: 0,
          equipmentCost: 0,
          psychicPowersCost: 0,
          modifiers: []
        }
      }
    });
    
    vi.spyOn(apiClient.apiClient, 'validateWarband').mockResolvedValue({
      valid: true,
      errors: []
    });
    
    vi.spyOn(apiClient.apiClient, 'validateWeirdo').mockResolvedValue({
      valid: true,
      errors: []
    });
    
    vi.spyOn(apiClient.apiClient, 'createWarband').mockResolvedValue({
      id: 'test-id',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    vi.spyOn(apiClient.apiClient, 'updateWarband').mockResolvedValue({
      id: 'test-id',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  describe('Unit tests for WarbandContext', () => {
    /**
     * Test warband creation with default values
     * Requirements: 1.1, 1.2, 1.3, 1.4
     */
    it('should create warband with default values', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      // Create a new warband
      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      // Verify default values
      expect(result.current.currentWarband).toEqual({
        id: '',
        name: 'Test Warband',
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should create warband with 125 point limit', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Big Warband', 125);
      });

      expect(result.current.currentWarband?.pointLimit).toBe(125);
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useWarband());
      }).toThrow('useWarband must be used within a WarbandProvider');
      
      consoleSpy.mockRestore();
    });

    /**
     * Test weirdo add operations
     * Requirements: 2.3, 2.4, 11.1, 11.2, 11.3
     */
    it('should add leader weirdo to warband', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      // Create warband first
      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      // Add leader (now async)
      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      expect(result.current.currentWarband?.weirdos).toHaveLength(1);
      expect(result.current.currentWarband?.weirdos[0].type).toBe('leader');
      expect(result.current.currentWarband?.weirdos[0].name).toBe('New Leader');
    });

    it('should add trooper weirdo to warband', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('trooper');
      });

      expect(result.current.currentWarband?.weirdos).toHaveLength(1);
      expect(result.current.currentWarband?.weirdos[0].type).toBe('trooper');
      expect(result.current.currentWarband?.weirdos[0].name).toBe('New Trooper');
    });

    it('should auto-select newly added weirdo', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      const weirdoId = result.current.currentWarband?.weirdos[0].id;
      expect(result.current.selectedWeirdoId).toBe(weirdoId);
    });

    it('should throw error when adding second leader', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      // Try to add second leader
      await expect(async () => {
        await act(async () => {
          await result.current.addWeirdo('leader');
        });
      }).rejects.toThrow('Warband already has a leader');
    });

    /**
     * Test weirdo remove operations
     * Requirements: 11.4, 11.5, 11.6
     */
    it('should remove weirdo from warband', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      const weirdoId = result.current.currentWarband?.weirdos[0].id!;

      act(() => {
        result.current.removeWeirdo(weirdoId);
      });

      expect(result.current.currentWarband?.weirdos).toHaveLength(0);
    });

    it('should clear selection when removing selected weirdo', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      const weirdoId = result.current.currentWarband?.weirdos[0].id!;
      expect(result.current.selectedWeirdoId).toBe(weirdoId);

      act(() => {
        result.current.removeWeirdo(weirdoId);
      });

      expect(result.current.selectedWeirdoId).toBeNull();
    });

    /**
     * Test cost calculation integration
     * Requirements: 3.1, 3.2, 3.3
     */
    it('should calculate weirdo cost when adding weirdo', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      const weirdo = result.current.currentWarband?.weirdos[0];
      expect(weirdo?.totalCost).toBeGreaterThanOrEqual(0);
    });

    it('should recalculate warband cost when adding weirdo', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      const initialCost = result.current.currentWarband?.totalCost;

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      const newCost = result.current.currentWarband?.totalCost;
      expect(newCost).toBeGreaterThanOrEqual(initialCost!);
    });

    it('should recalculate warband cost when removing weirdo', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      const costWithWeirdo = result.current.currentWarband?.totalCost;
      const weirdoId = result.current.currentWarband?.weirdos[0].id!;

      act(() => {
        result.current.removeWeirdo(weirdoId);
      });

      const costWithoutWeirdo = result.current.currentWarband?.totalCost;
      expect(costWithoutWeirdo).toBeLessThanOrEqual(costWithWeirdo!);
    });

    it('should recalculate costs when updating weirdo attributes', async () => {
      // Mock cost calculation to return different values for different attributes
      let callCount = 0;
      vi.spyOn(apiClient.apiClient, 'calculateCostRealTime').mockImplementation(async () => {
        callCount++;
        return {
          data: {
            totalCost: callCount === 1 ? 10 : 20, // First call returns 10, subsequent calls return 20
            breakdown: {
              baseCost: 10,
              attributeCost: callCount === 1 ? 0 : 10,
              weaponsCost: 0,
              equipmentCost: 0,
              psychicPowersCost: 0,
              modifiers: []
            }
          }
        };
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      const weirdoId = result.current.currentWarband?.weirdos[0].id!;
      const initialCost = result.current.currentWarband?.weirdos[0].totalCost;

      // Update attribute to higher value
      act(() => {
        result.current.updateWeirdo(weirdoId, {
          attributes: {
            speed: 3,
            defense: '2d10',
            firepower: '2d10',
            prowess: '2d10',
            willpower: '2d10',
          },
        });
      });

      // Wait for debounced cost update (100ms debounce + async API call)
      await waitFor(() => {
        const newCost = result.current.currentWarband?.weirdos[0].totalCost;
        expect(newCost).toBeGreaterThan(initialCost!);
      }, { timeout: 5000 });
    });

    it('should provide getWeirdoCost method', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      const weirdoId = result.current.currentWarband?.weirdos[0].id!;
      const cost = result.current.getWeirdoCost(weirdoId);
      
      expect(cost).toBeGreaterThanOrEqual(0);
      expect(cost).toBe(result.current.currentWarband?.weirdos[0].totalCost);
    });

    it('should provide getWarbandCost method', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      act(() => {
        result.current.addWeirdo('leader');
      });

      const cost = result.current.getWarbandCost();
      
      expect(cost).toBeGreaterThanOrEqual(0);
      expect(cost).toBe(result.current.currentWarband?.totalCost);
    });

    /**
     * Test validation integration
     * Requirements: 4.1, 4.2, 4.3, 9.1
     */
    it('should validate warband and store errors', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      act(() => {
        result.current.addWeirdo('leader');
      });

      // Validate warband (now async)
      let validationResult;
      await act(async () => {
        validationResult = await result.current.validateWarband();
      });

      expect(validationResult).toBeDefined();
      expect(validationResult!.valid).toBeDefined();
      expect(validationResult!.errors).toBeDefined();
    });

    it('should validate individual weirdo', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      const weirdoId = result.current.currentWarband?.weirdos[0].id!;

      let validationResult;
      await act(async () => {
        validationResult = await result.current.validateWeirdo(weirdoId);
      });

      expect(validationResult).toBeDefined();
      expect(validationResult!.valid).toBeDefined();
      expect(validationResult!.errors).toBeDefined();
    });

    it('should update validation errors map', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      await act(async () => {
        await result.current.validateWarband();
      });

      expect(result.current.validationErrors).toBeInstanceOf(Map);
    });

    it('should clear validation errors when weirdo is removed', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>
          {children}
        </WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      act(() => {
        result.current.createWarband('Test Warband', 75);
      });

      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      const weirdoId = result.current.currentWarband?.weirdos[0].id!;

      await act(async () => {
        await result.current.validateWeirdo(weirdoId);
      });

      act(() => {
        result.current.removeWeirdo(weirdoId);
      });

      expect(result.current.validationErrors.has(weirdoId)).toBe(false);
    });
  });
});

