import { useState, useEffect, useRef, useCallback } from 'react';
import type { WarbandAbility } from '../../backend/models/types';
import { apiClient } from '../services/apiClient';
import { CostCache } from '../services/CostCache';

/**
 * Parameters for item cost calculation
 */
export interface ItemCostParams {
  itemType: 'weapon' | 'equipment' | 'psychicPower';
  itemName: string;
  warbandAbility: WarbandAbility | null;
  // For weapons, need to know if close or ranged
  weaponType?: 'close' | 'ranged';
}

/**
 * Result from item cost hook
 */
export interface ItemCostResult {
  cost: number;
  isLoading: boolean;
  error: string | null;
}

// Shared cache instance for item costs
const itemCostCache = new CostCache<number>(100, 5000);

// Export for testing purposes
export { itemCostCache };

/**
 * Generates a deterministic cache key from item cost parameters
 */
function generateItemCacheKey(params: ItemCostParams): string {
  return JSON.stringify({
    type: params.itemType,
    name: params.itemName,
    ability: params.warbandAbility,
    weaponType: params.weaponType,
  });
}

/**
 * Custom hook for calculating individual item costs
 * 
 * Features:
 * - Uses same caching mechanism as useCostCalculation
 * - Optimized for displaying costs in selector components
 * - Returns cost, loading state, and error state
 * - Caches results for identical inputs (5 second TTL)
 * - Invalidates cache when warband ability changes
 * 
 * @param params Item cost parameters
 * @returns Item cost result with loading and error states
 */
export function useItemCost(params: ItemCostParams): ItemCostResult {
  // Generate cache key from params
  const cacheKey = generateItemCacheKey(params);
  
  // State for the current result
  const [result, setResult] = useState<ItemCostResult>(() => {
    // Try to get cached value on initial render
    const cached = itemCostCache.get(cacheKey);
    if (cached !== null) {
      return {
        cost: cached,
        isLoading: false,
        error: null,
      };
    }
    
    // Default initial state
    return {
      cost: 0,
      isLoading: true,
      error: null,
    };
  });

  // Ref to track the current warband ability for cache invalidation
  const previousAbilityRef = useRef<WarbandAbility | null>(
    params.warbandAbility
  );

  // Memoized function to perform the actual API call
  const performCalculation = useCallback(async (
    calculationParams: ItemCostParams,
    key: string
  ) => {
    // Track if this specific call is still valid
    let isCancelled = false;

    try {
      // Check cache first
      const cached = itemCostCache.get(key);
      if (cached !== null) {
        if (!isCancelled) {
          setResult({
            cost: cached,
            isLoading: false,
            error: null,
          });
        }
        return () => { isCancelled = true; };
      }

      // Set loading state (keeping last known values)
      if (!isCancelled) {
        setResult(prev => ({ ...prev, isLoading: true, error: null }));
      }

      // Build the API request based on item type
      // We'll use the real-time cost calculation endpoint with minimal params
      const apiParams: {
        weirdoType: 'trooper';
        attributes: {
          speed: number;
          defense: string;
          firepower: string;
          prowess: string;
          willpower: string;
        };
        weapons?: {
          close?: string[];
          ranged?: string[];
        };
        equipment?: string[];
        psychicPowers?: string[];
        warbandAbility?: WarbandAbility | null;
      } = {
        weirdoType: 'trooper',
        attributes: {
          speed: 1,
          defense: '2d6',
          firepower: 'None',
          prowess: '2d6',
          willpower: '2d6',
        },
        warbandAbility: calculationParams.warbandAbility,
      };

      // Add the specific item based on type
      if (calculationParams.itemType === 'weapon') {
        if (calculationParams.weaponType === 'close') {
          apiParams.weapons = { close: [calculationParams.itemName] };
        } else if (calculationParams.weaponType === 'ranged') {
          apiParams.weapons = { ranged: [calculationParams.itemName] };
        }
      } else if (calculationParams.itemType === 'equipment') {
        apiParams.equipment = [calculationParams.itemName];
      } else if (calculationParams.itemType === 'psychicPower') {
        apiParams.psychicPowers = [calculationParams.itemName];
      }

      // Make API call
      const response = await apiClient.calculateCostRealTime(apiParams);

      // Extract the cost for this specific item type
      let itemCost = 0;
      if (calculationParams.itemType === 'weapon') {
        itemCost = response.data.breakdown.weapons;
      } else if (calculationParams.itemType === 'equipment') {
        itemCost = response.data.breakdown.equipment;
      } else if (calculationParams.itemType === 'psychicPower') {
        itemCost = response.data.breakdown.psychicPowers;
      }

      // Cache the cost
      itemCostCache.set(key, itemCost);

      // Update state with new result
      if (!isCancelled) {
        setResult({
          cost: itemCost,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: unknown) {
      if (!isCancelled) {
        setResult(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to calculate item cost',
        }));
      }
    }

    // Return cleanup function
    return () => { isCancelled = true; };
  }, []);

  // Effect to handle cost calculation
  useEffect(() => {
    // Check if warband ability changed - if so, invalidate cache
    if (previousAbilityRef.current !== params.warbandAbility) {
      itemCostCache.clear();
      previousAbilityRef.current = params.warbandAbility;
    }

    // Perform calculation and get cleanup function
    const cleanupPromise = performCalculation(params, cacheKey);
    
    // Return cleanup function that cancels the async operation
    return () => {
      cleanupPromise.then(cleanup => cleanup?.());
    };
  }, [params.itemType, params.itemName, params.warbandAbility, params.weaponType, cacheKey, performCalculation]);

  return result;
}
