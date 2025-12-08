import { useState, useEffect, useRef, useCallback } from 'react';
import type { WarbandAbility } from '../../backend/models/types';
import { apiClient } from '../services/apiClient';
import { CostCache } from '../services/CostCache';
import type { RealTimeCostResponse } from '../services/apiTypes';

/**
 * Parameters for cost calculation
 */
export interface CostCalculationParams {
  weirdoType: 'leader' | 'trooper';
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
}

/**
 * Result from cost calculation hook
 */
export interface CostCalculationResult {
  totalCost: number;
  breakdown: {
    attributes: number;
    weapons: number;
    equipment: number;
    psychicPowers: number;
  };
  warnings: string[];
  isApproachingLimit: boolean;
  isOverLimit: boolean;
  isLoading: boolean;
  error: string | null;
}

// Shared cache instance across all hook instances
const costCache = new CostCache<RealTimeCostResponse>(100, 5000);

// Export for testing purposes
export { costCache };

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 300;

/**
 * Generates a deterministic cache key from cost calculation parameters
 */
function generateCacheKey(params: CostCalculationParams): string {
  return JSON.stringify({
    type: params.weirdoType,
    attrs: params.attributes,
    weapons: {
      close: params.weapons?.close?.slice().sort() || [],
      ranged: params.weapons?.ranged?.slice().sort() || [],
    },
    equipment: params.equipment?.slice().sort() || [],
    powers: params.psychicPowers?.slice().sort() || [],
    ability: params.warbandAbility,
  });
}

/**
 * Custom hook for cost calculations with caching and debouncing
 * 
 * Features:
 * - Debounces API calls by 300ms to reduce load during rapid changes
 * - Caches results for identical inputs (5 second TTL)
 * - Returns last known value while loading (optimistic updates)
 * - Invalidates cache when warband ability changes
 * 
 * @param params Cost calculation parameters
 * @param initialCost Optional initial cost value to display before first calculation completes
 * @returns Cost calculation result with loading and error states
 */
export function useCostCalculation(
  params: CostCalculationParams,
  initialCost?: number
): CostCalculationResult {
  // Generate cache key from params
  const cacheKey = generateCacheKey(params);
  
  // State for the current result
  const [result, setResult] = useState<CostCalculationResult>(() => {
    // Try to get cached value on initial render
    const cached = costCache.get(cacheKey);
    if (cached) {
      return {
        totalCost: cached.data.totalCost,
        breakdown: cached.data.breakdown,
        warnings: cached.data.warnings,
        isApproachingLimit: cached.data.isApproachingLimit,
        isOverLimit: cached.data.isOverLimit,
        isLoading: false,
        error: null,
      };
    }
    
    // Default initial state - use initialCost if provided
    return {
      totalCost: initialCost ?? 0,
      breakdown: {
        attributes: 0,
        weapons: 0,
        equipment: 0,
        psychicPowers: 0,
      },
      warnings: [],
      isApproachingLimit: false,
      isOverLimit: false,
      isLoading: true,
      error: null,
    };
  });

  // Ref to track the debounce timeout
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref to track the current warband ability for cache invalidation
  const previousAbilityRef = useRef<WarbandAbility | null | undefined>(
    params.warbandAbility
  );

  // Memoized function to perform the actual API call
  const performCalculation = useCallback(async (
    calculationParams: CostCalculationParams,
    key: string
  ) => {
    // Track if this specific call is still valid
    let isCancelled = false;

    try {
      // Check cache first
      const cached = costCache.get(key);
      if (cached) {
        if (!isCancelled) {
          setResult({
            totalCost: cached.data.totalCost,
            breakdown: cached.data.breakdown,
            warnings: cached.data.warnings,
            isApproachingLimit: cached.data.isApproachingLimit,
            isOverLimit: cached.data.isOverLimit,
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

      // Make API call
      const response = await apiClient.calculateCostRealTime({
        weirdoType: calculationParams.weirdoType,
        attributes: calculationParams.attributes,
        weapons: calculationParams.weapons,
        equipment: calculationParams.equipment,
        psychicPowers: calculationParams.psychicPowers,
        warbandAbility: calculationParams.warbandAbility,
      });

      // Cache the response
      costCache.set(key, response);

      // Update state with new result
      if (!isCancelled) {
        setResult({
          totalCost: response.data.totalCost,
          breakdown: response.data.breakdown,
          warnings: response.data.warnings,
          isApproachingLimit: response.data.isApproachingLimit,
          isOverLimit: response.data.isOverLimit,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: unknown) {
      if (!isCancelled) {
        setResult(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to calculate cost',
        }));
      }
    }

    // Return cleanup function
    return () => { isCancelled = true; };
  }, []);

  // Effect to handle cost calculation with debouncing
  useEffect(() => {
    // Check if warband ability changed - if so, invalidate cache
    if (previousAbilityRef.current !== params.warbandAbility) {
      costCache.clear();
      previousAbilityRef.current = params.warbandAbility;
    }

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set up new debounced calculation
    debounceTimeoutRef.current = setTimeout(() => {
      const cleanupPromise = performCalculation(params, cacheKey);
      
      // Store cleanup function for this calculation
      return () => {
        cleanupPromise.then(cleanup => cleanup?.());
      };
    }, DEBOUNCE_DELAY);

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [params, cacheKey, performCalculation]);

  return result;
}
