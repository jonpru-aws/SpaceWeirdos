import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { Warband, Weirdo, WarbandAbility } from '../src/backend/models/types';
import { apiClient } from '../src/frontend/services/apiClient';
import { ReactNode } from 'react';

const testConfig = { numRuns: 50 };

// Mock apiClient
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    getWarband: vi.fn(),
    updateWarband: vi.fn(),
    addWeirdo: vi.fn(),
    removeWeirdo: vi.fn(),
    updateWeirdo: vi.fn(),
    createWarband: vi.fn(),
    validate: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(message: string, public statusCode?: number, public details?: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

// Generators
const warbandAbilityGen = fc.constantFrom<WarbandAbility>(
  'Cyborgs',
  'Fanatics',
  'Living Weapons',
  'Heavily Armed',
  'Mutants',
  'Soldiers',
  'Undead'
);

const weirdoGen = fc.record<Weirdo>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  type: fc.constantFrom('leader' as const, 'trooper' as const),
  attributes: fc.record({
    speed: fc.constantFrom(1, 2, 3),
    defense: fc.constantFrom('2d6' as const, '2d8' as const, '2d10' as const),
    firepower: fc.constantFrom('None' as const, '2d8' as const, '2d10' as const),
    prowess: fc.constantFrom('2d6' as const, '2d8' as const, '2d10' as const),
    willpower: fc.constantFrom('2d6' as const, '2d8' as const, '2d10' as const),
  }),
  closeCombatWeapons: fc.array(
    fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1 }),
      type: fc.constant('close' as const),
      baseCost: fc.integer({ min: 0, max: 5 }),
      maxActions: fc.integer({ min: 1, max: 3 }),
      notes: fc.string(),
    }),
    { minLength: 1, maxLength: 3 }
  ),
  rangedWeapons: fc.array(
    fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1 }),
      type: fc.constant('ranged' as const),
      baseCost: fc.integer({ min: 0, max: 5 }),
      maxActions: fc.integer({ min: 1, max: 3 }),
      notes: fc.string(),
    }),
    { minLength: 0, maxLength: 2 }
  ),
  equipment: fc.array(
    fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1 }),
      type: fc.constantFrom('Passive' as const, 'Action' as const),
      baseCost: fc.integer({ min: 0, max: 5 }),
      effect: fc.string(),
    }),
    { minLength: 0, maxLength: 2 }
  ),
  psychicPowers: fc.array(
    fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1 }),
      type: fc.constantFrom('Attack' as const, 'Effect' as const, 'Either' as const),
      cost: fc.integer({ min: 0, max: 5 }),
      effect: fc.string(),
    }),
    { minLength: 0, maxLength: 3 }
  ),
  leaderTrait: fc.option(
    fc.constantFrom('Bounty Hunter', 'Healer', 'Majestic', 'Monstrous', 'Political Officer', 'Sorcerer', 'Tactician'),
    { nil: null }
  ),
  notes: fc.string(),
  totalCost: fc.integer({ min: 0, max: 100 }),
});

const warbandGen = fc.record<Warband>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  ability: fc.option(warbandAbilityGen, { nil: null }),
  pointLimit: fc.constantFrom(75 as const, 125 as const),
  totalCost: fc.integer({ min: 0, max: 125 }),
  weirdos: fc.array(weirdoGen, { minLength: 0, maxLength: 5 }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

describe('WarbandContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Property 4: Context introduction preserves data flow', () => {
    // **Feature: code-refactoring, Property 4: Context introduction preserves data flow**
    // **Validates: Requirements 11.4**

    it('should preserve warband state updates through context', async () => {
      // Test with a saved warband
      const savedWarband: Warband = {
        id: 'test-id',
        name: 'Original Name',
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedWarband = { ...savedWarband, name: 'Updated Name' };
      vi.mocked(apiClient.updateWarband).mockResolvedValue(updatedWarband);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider warbandId="test-id">{children}</WarbandProvider>
      );

      vi.mocked(apiClient.getWarband).mockResolvedValue(savedWarband);

      const { result } = renderHook(() => useWarband(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.warband).not.toBeNull();
      });

      // Update warband name through context
      await act(async () => {
        await result.current.updateWarband({ name: 'Updated Name' });
      });

      // Verify API was called and state was updated
      expect(apiClient.updateWarband).toHaveBeenCalledWith('test-id', { name: 'Updated Name' });
      expect(result.current.warband?.name).toBe('Updated Name');
    });

    it('should preserve weirdo addition through context', async () => {
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

      const newWeirdo: Weirdo = {
        id: 'new-weirdo-id',
        name: 'New Leader',
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

      const updatedWarband = {
        ...warband,
        weirdos: [newWeirdo],
      };

      vi.mocked(apiClient.getWarband).mockResolvedValue(warband);
      vi.mocked(apiClient.addWeirdo).mockResolvedValue(updatedWarband);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider warbandId="test-id">{children}</WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.warband).not.toBeNull();
      });

      // Add weirdo through context
      await act(async () => {
        await result.current.addWeirdo('leader');
      });

      // Verify weirdo was added
      expect(apiClient.addWeirdo).toHaveBeenCalled();
      expect(result.current.warband?.weirdos.length).toBe(1);
    });

    it('should preserve weirdo removal through context', async () => {
      const weirdo: Weirdo = {
        id: 'weirdo-1',
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

      const warband: Warband = {
        id: 'test-id',
        name: 'Test Warband',
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [weirdo],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedWarband = {
        ...warband,
        weirdos: [],
      };

      vi.mocked(apiClient.getWarband).mockResolvedValue(warband);
      vi.mocked(apiClient.removeWeirdo).mockResolvedValue(updatedWarband);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider warbandId="test-id">{children}</WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.warband).not.toBeNull();
      });

      // Remove weirdo through context
      await act(async () => {
        await result.current.removeWeirdo('weirdo-1');
      });

      // Verify weirdo was removed
      expect(apiClient.removeWeirdo).toHaveBeenCalledWith('test-id', 'weirdo-1');
      expect(result.current.warband?.weirdos.length).toBe(0);
    });

    it('should preserve weirdo updates through context', async () => {
      const weirdo: Weirdo = {
        id: 'weirdo-1',
        name: 'Original Name',
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

      const warband: Warband = {
        id: 'test-id',
        name: 'Test Warband',
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [weirdo],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedWeirdo = { ...weirdo, name: 'Updated Name' };
      const updatedWarband = {
        ...warband,
        weirdos: [updatedWeirdo],
      };

      vi.mocked(apiClient.getWarband).mockResolvedValue(warband);
      vi.mocked(apiClient.updateWeirdo).mockResolvedValue(updatedWarband);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider warbandId="test-id">{children}</WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.warband).not.toBeNull();
      });

      // Update weirdo through context
      await act(async () => {
        await result.current.updateWeirdo('weirdo-1', { name: 'Updated Name' });
      });

      // Verify weirdo was updated
      expect(apiClient.updateWeirdo).toHaveBeenCalled();
      expect(result.current.warband?.weirdos[0].name).toBe('Updated Name');
    });

    it('should preserve ability changes and trigger cost recalculation', async () => {
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

      const updatedWarband = { ...warband, ability: 'Cyborgs' as WarbandAbility };
      vi.mocked(apiClient.getWarband).mockResolvedValue(warband);
      vi.mocked(apiClient.updateWarband).mockResolvedValue(updatedWarband);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider warbandId="test-id">{children}</WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.warband).not.toBeNull();
      });

      // Update ability through context
      await act(async () => {
        await result.current.updateWarband({ ability: 'Cyborgs' });
      });

      // Verify ability was updated
      expect(apiClient.updateWarband).toHaveBeenCalledWith('test-id', { ability: 'Cyborgs' });
      expect(result.current.warband?.ability).toBe('Cyborgs');
    });
  });

  describe('Unit tests for WarbandContext', () => {
    it('should initialize with new warband when no ID provided', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>{children}</WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      await waitFor(() => {
        expect(result.current.warband).not.toBeNull();
        expect(result.current.warband?.name).toBe('New Warband');
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useWarband());
      }).toThrow('useWarband must be used within a WarbandProvider');
      
      consoleSpy.mockRestore();
    });

    it('should create new warband with default values', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider>{children}</WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      await waitFor(() => {
        expect(result.current.warband).toEqual({
          id: '',
          name: 'New Warband',
          ability: null,
          pointLimit: 75,
          totalCost: 0,
          weirdos: [],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });

    it('should handle errors when adding weirdo fails', async () => {
      const error = new Error('Failed to add weirdo');
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

      vi.mocked(apiClient.getWarband).mockResolvedValue(warband);
      vi.mocked(apiClient.addWeirdo).mockRejectedValue(error);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <WarbandProvider warbandId="test-id">{children}</WarbandProvider>
      );

      const { result } = renderHook(() => useWarband(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.warband).not.toBeNull();
      });

      // Try to add weirdo
      await act(async () => {
        try {
          await result.current.addWeirdo('leader');
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();
    });
  });
});
