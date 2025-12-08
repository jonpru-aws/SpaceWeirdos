import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import type { Warband, Weirdo, ValidationError, ValidationResult } from '../../backend/models/types';
import { apiClient } from '../services/apiClient';

/**
 * WarbandContext
 * 
 * Provides centralized warband state management for components.
 * Reduces prop drilling by sharing warband data and update functions via Context API.
 * Integrates with API client for persistence, cost calculations, and validation.
 * All cost calculations are performed via API (no direct CostEngine imports).
 * 
 * Requirements: 1.1-1.7, 2.1-2.7, 3.1-3.3, 10.5, 10.6, 11.5, 6.2, 6.4, 6.5, 6.7, 9.2, 9.6
 */

/**
 * Context value interface
 */
interface WarbandContextValue {
  // Current state
  currentWarband: Warband | null;
  selectedWeirdoId: string | null;
  validationErrors: Map<string, ValidationError[]>;
  
  // Warband operations
  createWarband: (name: string, pointLimit: 75 | 125) => void;
  updateWarband: (updates: Partial<Warband>) => void;
  saveWarband: () => Promise<void>;
  loadWarband: (id: string) => Promise<void>;
  deleteWarband: (id: string) => Promise<void>;
  
  // Weirdo operations
  addWeirdo: (type: 'leader' | 'trooper') => Promise<void>;
  removeWeirdo: (id: string) => void;
  updateWeirdo: (id: string, updates: Partial<Weirdo>) => void;
  selectWeirdo: (id: string) => void;
  
  // Computed values
  getWeirdoCost: (id: string) => number;
  getWarbandCost: () => number;
  validateWarband: () => Promise<ValidationResult>;
  validateWeirdo: (id: string) => Promise<ValidationResult>;
}

/**
 * Create context with undefined default
 */
const WarbandContext = createContext<WarbandContextValue | undefined>(undefined);

/**
 * Provider props
 */
interface WarbandProviderProps {
  children: ReactNode;
}

/**
 * WarbandProvider component
 * 
 * Manages warband state and provides update functions.
 * Integrates with API client for all cost calculations.
 * 
 * Requirements: 1.1-1.7, 2.1-2.7, 3.1-3.3, 10.5, 10.6, 11.5, 9.2, 9.6
 */
export function WarbandProvider({ 
  children
}: WarbandProviderProps) {
  const [currentWarband, setCurrentWarband] = useState<Warband | null>(null);
  const [selectedWeirdoId, setSelectedWeirdoId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Map<string, ValidationError[]>>(new Map());
  
  // Ref to track the latest warband state for debounced operations
  const currentWarbandRef = useRef<Warband | null>(null);
  
  // Debounce timer ref for cost calculations (Requirement 1.4)
  const costUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Debounce timer ref for validation
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    currentWarbandRef.current = currentWarband;
  }, [currentWarband]);

  /**
   * Debounced cost recalculation function using API
   * Delays cost updates by 100ms to avoid excessive API calls
   * Requirements: 1.4, 6.1, 6.3
   */
  const debouncedCostUpdate = useCallback(() => {
    // Clear existing timer
    if (costUpdateTimerRef.current) {
      clearTimeout(costUpdateTimerRef.current);
    }
    
    // Set new timer for 100ms debounce
    costUpdateTimerRef.current = setTimeout(async () => {
      // Get the latest warband state from ref
      const warband = currentWarbandRef.current;
      
      if (!warband) return;
      
      try {
        // Recalculate all weirdo costs via API
        const costPromises = warband.weirdos.map(async (weirdo) => {
          try {
            const response = await apiClient.calculateCostRealTime({
              weirdoType: weirdo.type,
              attributes: weirdo.attributes,
              weapons: {
                close: weirdo.closeCombatWeapons.map(w => w.name),
                ranged: weirdo.rangedWeapons.map(w => w.name),
              },
              equipment: weirdo.equipment.map(e => e.name),
              psychicPowers: weirdo.psychicPowers.map(p => p.name),
              warbandAbility: warband.ability,
            });
            
            return {
              ...weirdo,
              totalCost: response.data.totalCost,
            };
          } catch (error: unknown) {
            console.error(`Error calculating cost for weirdo ${weirdo.id}:`, error);
            // Fallback to existing cost on error
            return weirdo;
          }
        });
        
        const updatedWeirdos = await Promise.all(costPromises);
        
        // Calculate warband total cost
        const totalCost = updatedWeirdos.reduce((sum, w) => sum + w.totalCost, 0);
        
        const updatedWarband = {
          ...warband,
          weirdos: updatedWeirdos,
          totalCost,
        };
        
        setCurrentWarband(updatedWarband);
      } catch (error: unknown) {
        console.error('Error in debounced cost update:', error);
        // Keep existing warband state on error
      }
    }, 100);
  }, []);

  /**
   * Debounced validation function
   * Delays validation by 300ms to avoid excessive API calls
   */
  const debouncedValidation = useCallback((weirdoId: string, warband: Warband) => {
    // Clear existing timer
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }
    
    // Set new timer for 300ms debounce
    validationTimerRef.current = setTimeout(async () => {
      const weirdo = warband.weirdos.find(w => w.id === weirdoId);
      if (!weirdo) return;
      
      try {
        const result = await apiClient.validateWeirdo(weirdo, warband);
        
        // Update validation errors for this weirdo
        setValidationErrors(prevErrors => {
          const newErrors = new Map(prevErrors);
          if (result.errors.length > 0) {
            newErrors.set(weirdoId, result.errors);
          } else {
            newErrors.delete(weirdoId);
          }
          return newErrors;
        });
      } catch (error: unknown) {
        console.error('Error validating weirdo:', error);
      }
    }, 300);
  }, []);

  /**
   * Cleanup debounce timers on unmount
   */
  useEffect(() => {
    return () => {
      if (costUpdateTimerRef.current) {
        clearTimeout(costUpdateTimerRef.current);
      }
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, []);

  /**
   * Create a new warband with specified name and point limit
   * Requirements: 1.1, 1.2, 1.3, 1.4
   */
  const createWarband = (name: string, pointLimit: 75 | 125): void => {
    const newWarband: Warband = {
      id: '',
      name,
      ability: null,
      pointLimit,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentWarband(newWarband);
    setSelectedWeirdoId(null);
    setValidationErrors(new Map());
  };

  /**
   * Load existing warband by ID from API
   * Requirements: 2.4, 7.9
   */
  const loadWarband = async (id: string): Promise<void> => {
    try {
      const loadedWarband = await apiClient.getWarband(id);
      setCurrentWarband(loadedWarband);
      setSelectedWeirdoId(null);
      setValidationErrors(new Map());
    } catch (error: unknown) {
      console.error('Error loading warband:', error);
      throw error;
    }
  };

  /**
   * Update warband properties
   * Uses debounced cost calculation when ability changes
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
   */
  const updateWarband = (updates: Partial<Warband>): void => {
    if (!currentWarband) return;

    const updatedWarband = { ...currentWarband, ...updates };
    
    // Immediately update state for responsive UI
    setCurrentWarband(updatedWarband);
    
    // Trigger debounced cost recalculation if ability changed (Requirements 1.1, 1.2, 1.4)
    if (updates.ability !== undefined) {
      debouncedCostUpdate();
    }
  };

  /**
   * Add a new weirdo to the warband
   * Requirements: 2.3, 2.4, 11.1, 11.2, 11.3, 6.1
   */
  const addWeirdo = async (type: 'leader' | 'trooper'): Promise<void> => {
    if (!currentWarband) return;

    // Check if warband already has a leader
    const hasLeader = currentWarband.weirdos.some(w => w.type === 'leader');
    if (type === 'leader' && hasLeader) {
      throw new Error('Warband already has a leader');
    }

    // Create new weirdo with default values
    const newWeirdo: Weirdo = {
      id: `temp-${Date.now()}`,
      name: type === 'leader' ? 'New Leader' : 'New Trooper',
      type,
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

    try {
      // Calculate initial cost via API
      const response = await apiClient.calculateCostRealTime({
        weirdoType: type,
        attributes: newWeirdo.attributes,
        weapons: {
          close: [],
          ranged: [],
        },
        equipment: [],
        psychicPowers: [],
        warbandAbility: currentWarband.ability,
      });
      
      newWeirdo.totalCost = response.data.totalCost;
    } catch (error: unknown) {
      console.error('Error calculating initial weirdo cost:', error);
      // Default to 0 if API fails; will be recalculated on next update
      newWeirdo.totalCost = 0;
    }

    // Add to warband
    const updatedWeirdos = [...currentWarband.weirdos, newWeirdo];
    const totalCost = updatedWeirdos.reduce((sum, w) => sum + w.totalCost, 0);
    
    const updatedWarband = {
      ...currentWarband,
      weirdos: updatedWeirdos,
      totalCost,
    };

    setCurrentWarband(updatedWarband);
    setSelectedWeirdoId(newWeirdo.id); // Auto-select new weirdo (Requirement 10.6)
  };

  /**
   * Remove a weirdo from the warband
   * Requirements: 11.4, 11.5, 11.6, 9.2
   */
  const removeWeirdo = (weirdoId: string): void => {
    if (!currentWarband) return;

    const updatedWeirdos = currentWarband.weirdos.filter(w => w.id !== weirdoId);
    const totalCost = updatedWeirdos.reduce((sum, w) => sum + w.totalCost, 0);
    
    const updatedWarband = {
      ...currentWarband,
      weirdos: updatedWeirdos,
      totalCost,
    };

    setCurrentWarband(updatedWarband);
    
    // Clear selection if removed weirdo was selected (Requirement 11.6)
    if (selectedWeirdoId === weirdoId) {
      setSelectedWeirdoId(null);
    }
    
    // Clear validation errors for removed weirdo
    const newErrors = new Map(validationErrors);
    newErrors.delete(weirdoId);
    setValidationErrors(newErrors);
  };

  /**
   * Update a weirdo in the warband
   * Uses debounced cost calculation for performance
   * Requirements: 1.1, 1.2, 1.4, 3.1, 3.2, 3.6
   */
  const updateWeirdo = (weirdoId: string, updates: Partial<Weirdo>): void => {
    // Use functional update to ensure we work with latest state
    setCurrentWarband(prevWarband => {
      if (!prevWarband) return prevWarband;

      const weirdo = prevWarband.weirdos.find(w => w.id === weirdoId);
      if (!weirdo) {
        console.error(`Weirdo with id ${weirdoId} not found`);
        return prevWarband;
      }

      // Create a copy of updates without totalCost to prevent accidental overwrites
      // Type assertion safe: destructuring to extract and ignore totalCost field from updates object
      const { totalCost: _ignoredCost, ...safeUpdates } = updates as any;
      
      // Merge updates while preserving totalCost from original weirdo
      const updatedWeirdo = { 
        ...weirdo, 
        ...safeUpdates,
        // Always preserve the existing totalCost (will be recalculated by debounced update)
        totalCost: weirdo.totalCost
      };

      // Update warband with new weirdo
      const updatedWeirdos = prevWarband.weirdos.map(w =>
        w.id === weirdoId ? updatedWeirdo : w
      );
      
      const updatedWarband = {
        ...prevWarband,
        weirdos: updatedWeirdos,
      };

      // Trigger debounced validation
      debouncedValidation(weirdoId, updatedWarband);
      
      return updatedWarband;
    });
    
    // Trigger debounced cost recalculation (Requirements 1.1, 1.2, 1.4)
    debouncedCostUpdate();
  };

  /**
   * Select a weirdo for editing (or clear selection with null)
   * Requirements: 10.5
   */
  const selectWeirdo = (id: string | null): void => {
    setSelectedWeirdoId(id);
  };

  /**
   * Save the warband to API
   * Requirements: 9.1, 9.2, 6.1, 6.2
   */
  const saveWarband = async (): Promise<void> => {
    if (!currentWarband) return;

    try {
      // Validate warband using API (Requirements 6.2, 6.4, 6.7)
      const validation = await apiClient.validateWarband(currentWarband);
      
      if (!validation.valid) {
        // Update validation errors map
        const newErrors = new Map<string, ValidationError[]>();
        for (const error of validation.errors) {
          // Extract weirdo ID from field path (e.g., "weirdo.temp-123.name" -> "temp-123")
          const match = error.field.match(/weirdo\.([^.]+)\./);
          if (match) {
            const weirdoId = match[1];
            const existing = newErrors.get(weirdoId) || [];
            newErrors.set(weirdoId, [...existing, error]);
          } else {
            // Warband-level errors
            const existing = newErrors.get('warband') || [];
            newErrors.set('warband', [...existing, error]);
          }
        }
        setValidationErrors(newErrors);
        throw new Error('Please fix validation errors before saving');
      }

      // Save warband using API (Requirements 6.2, 6.6)
      const savedWarband = currentWarband.id 
        ? await apiClient.updateWarband(currentWarband.id, currentWarband)
        : await apiClient.createWarband({
            name: currentWarband.name,
            pointLimit: currentWarband.pointLimit,
            ability: currentWarband.ability,
            weirdos: currentWarband.weirdos
          });
      setCurrentWarband(savedWarband);
      
      // Clear validation errors on successful save
      setValidationErrors(new Map());
    } catch (error: unknown) {
      console.error('Error saving warband:', error);
      throw error;
    }
  };

  /**
   * Delete a warband from API
   * Requirements: 8.3, 8.5, 8.6
   */
  const deleteWarband = async (id: string): Promise<void> => {
    try {
      await apiClient.deleteWarband(id);
      
      // Clear current warband if it was deleted
      if (currentWarband?.id === id) {
        setCurrentWarband(null);
        setSelectedWeirdoId(null);
        setValidationErrors(new Map());
      }
    } catch (error: unknown) {
      console.error('Error deleting warband:', error);
      throw error;
    }
  };

  /**
   * Get the cost of a specific weirdo (memoized for performance)
   * Requirements: 1.4, 3.1, 3.3, 9.2
   */
  const getWeirdoCost = useCallback((id: string): number => {
    if (!currentWarband) return 0;
    
    const weirdo = currentWarband.weirdos.find(w => w.id === id);
    if (!weirdo) return 0;
    
    // Return cached cost from weirdo object (calculated by API)
    return weirdo.totalCost;
  }, [currentWarband]);

  /**
   * Get the total cost of the warband (memoized for performance)
   * Requirements: 1.4, 3.2, 3.3, 9.2
   */
  const getWarbandCost = useCallback((): number => {
    if (!currentWarband) return 0;
    // Return cached cost from warband object (calculated by API)
    return currentWarband.totalCost;
  }, [currentWarband]);

  /**
   * Validate the entire warband using API
   * Requirements: 4.1, 4.2, 4.3, 9.1, 6.2, 6.4, 6.7
   */
  const validateWarband = async (): Promise<ValidationResult> => {
    if (!currentWarband) {
      return { valid: true, errors: [] };
    }
    
    try {
      const result = await apiClient.validateWarband(currentWarband);
      
      // Update validation errors map
      const newErrors = new Map<string, ValidationError[]>();
      for (const error of result.errors) {
        // Extract weirdo ID from field path (e.g., "weirdo.temp-123.name" -> "temp-123")
        const match = error.field.match(/weirdo\.([^.]+)\./);
        if (match) {
          const weirdoId = match[1];
          const existing = newErrors.get(weirdoId) || [];
          newErrors.set(weirdoId, [...existing, error]);
        } else {
          // Warband-level errors
          const existing = newErrors.get('warband') || [];
          newErrors.set('warband', [...existing, error]);
        }
      }
      setValidationErrors(newErrors);
      
      return result;
    } catch (error: unknown) {
      console.error('Error validating warband:', error);
      return { valid: false, errors: [] };
    }
  };

  /**
   * Validate a specific weirdo using API
   * Requirements: 4.1, 4.2, 4.3, 6.2, 6.4, 6.7
   */
  const validateWeirdo = async (id: string): Promise<ValidationResult> => {
    if (!currentWarband) {
      return { valid: true, errors: [] };
    }
    
    const weirdo = currentWarband.weirdos.find(w => w.id === id);
    if (!weirdo) {
      return { valid: true, errors: [] };
    }
    
    try {
      const result = await apiClient.validateWeirdo(weirdo, currentWarband);
      
      // Update validation errors for this weirdo
      const newErrors = new Map(validationErrors);
      if (result.errors.length > 0) {
        newErrors.set(id, result.errors);
      } else {
        newErrors.delete(id);
      }
      setValidationErrors(newErrors);
      
      return result;
    } catch (error: unknown) {
      console.error('Error validating weirdo:', error);
      return { valid: false, errors: [] };
    }
  };

  const value: WarbandContextValue = {
    currentWarband,
    selectedWeirdoId,
    validationErrors,
    createWarband,
    updateWarband,
    saveWarband,
    loadWarband,
    deleteWarband,
    addWeirdo,
    removeWeirdo,
    updateWeirdo,
    selectWeirdo,
    getWeirdoCost,
    getWarbandCost,
    validateWarband,
    validateWeirdo,
  };

  return (
    <WarbandContext.Provider value={value}>
      {children}
    </WarbandContext.Provider>
  );
}

/**
 * Custom hook to access warband context
 * 
 * Throws error if used outside of WarbandProvider.
 * 
 * Requirements: 1.1-1.7, 2.1-2.7, 3.1-3.3, 10.5, 10.6, 11.5
 * 
 * @returns WarbandContextValue
 */
export function useWarband(): WarbandContextValue {
  const context = useContext(WarbandContext);
  
  if (context === undefined) {
    throw new Error('useWarband must be used within a WarbandProvider');
  }
  
  return context;
}
