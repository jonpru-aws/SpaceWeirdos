import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Warband, Weirdo, WarbandAbility } from '../../backend/models/types';
import { apiClient } from '../services/apiClient';

/**
 * WarbandContext
 * 
 * Provides centralized warband state management for components.
 * Reduces prop drilling by sharing warband data and update functions via Context API.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

/**
 * Context value interface
 */
interface WarbandContextValue {
  warband: Warband | null;
  loading: boolean;
  error: Error | null;
  updateWarband: (updates: Partial<Warband>) => Promise<void>;
  addWeirdo: (type: 'leader' | 'trooper') => Promise<void>;
  removeWeirdo: (id: string) => Promise<void>;
  updateWeirdo: (id: string, updates: Partial<Weirdo>) => Promise<void>;
  loadWarband: (id: string) => Promise<void>;
  createNewWarband: () => void;
  saveWarband: () => Promise<void>;
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
  warbandId?: string;
}

/**
 * WarbandProvider component
 * 
 * Manages warband state and provides update functions.
 * Handles API calls and state synchronization.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */
export function WarbandProvider({ children, warbandId }: WarbandProviderProps) {
  const [warband, setWarband] = useState<Warband | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load existing warband by ID
   * Requirement 11.1
   */
  const loadWarband = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const loadedWarband = await apiClient.getWarband(id);
      setWarband(loadedWarband);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load warband';
      setError(new Error(errorMessage));
      console.error('Error loading warband:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new warband with default values
   * Requirement 11.1
   */
  const createNewWarband = (): void => {
    setWarband({
      id: '',
      name: 'New Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  /**
   * Update warband properties
   * Requirement 11.2
   */
  const updateWarband = async (updates: Partial<Warband>): Promise<void> => {
    if (!warband) return;

    try {
      // If warband is saved, update via API
      if (warband.id) {
        const updatedWarband = await apiClient.updateWarband(warband.id, updates);
        setWarband(updatedWarband);
      } else {
        // For unsaved warband, update locally
        setWarband({ ...warband, ...updates });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update warband';
      setError(new Error(errorMessage));
      console.error('Error updating warband:', err);
      throw err;
    }
  };

  /**
   * Add a new weirdo to the warband
   * Requirement 11.2
   */
  const addWeirdo = async (type: 'leader' | 'trooper'): Promise<void> => {
    if (!warband) return;

    // Check if warband already has a leader
    const hasLeader = warband.weirdos.some(w => w.type === 'leader');
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
      // If warband is saved, add via API
      if (warband.id) {
        const updatedWarband = await apiClient.addWeirdo(warband.id, newWeirdo);
        setWarband(updatedWarband);
      } else {
        // For unsaved warband, add locally
        setWarband({
          ...warband,
          weirdos: [...warband.weirdos, newWeirdo],
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add weirdo';
      setError(new Error(errorMessage));
      console.error('Error adding weirdo:', err);
      throw err;
    }
  };

  /**
   * Remove a weirdo from the warband
   * Requirement 11.2
   */
  const removeWeirdo = async (weirdoId: string): Promise<void> => {
    if (!warband) return;

    try {
      // If warband is saved, remove via API
      if (warband.id) {
        const updatedWarband = await apiClient.removeWeirdo(warband.id, weirdoId);
        setWarband(updatedWarband);
      } else {
        // For unsaved warband, remove locally
        setWarband({
          ...warband,
          weirdos: warband.weirdos.filter(w => w.id !== weirdoId),
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove weirdo';
      setError(new Error(errorMessage));
      console.error('Error removing weirdo:', err);
      throw err;
    }
  };

  /**
   * Update a weirdo in the warband
   * Requirement 11.2
   */
  const updateWeirdo = async (weirdoId: string, updates: Partial<Weirdo>): Promise<void> => {
    if (!warband) return;

    const weirdo = warband.weirdos.find(w => w.id === weirdoId);
    if (!weirdo) {
      throw new Error(`Weirdo with id ${weirdoId} not found`);
    }

    const updatedWeirdo = { ...weirdo, ...updates };

    try {
      // If warband is saved, update via API
      if (warband.id) {
        const updatedWarband = await apiClient.updateWeirdo(warband.id, weirdoId, updatedWeirdo);
        setWarband(updatedWarband);
      } else {
        // For unsaved warband, update locally
        const updatedWeirdos = warband.weirdos.map(w =>
          w.id === weirdoId ? updatedWeirdo : w
        );
        const newTotalCost = updatedWeirdos.reduce((sum, w) => sum + w.totalCost, 0);
        setWarband({
          ...warband,
          weirdos: updatedWeirdos,
          totalCost: newTotalCost,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update weirdo';
      setError(new Error(errorMessage));
      console.error('Error updating weirdo:', err);
      throw err;
    }
  };

  /**
   * Save the warband (create or update)
   * Requirement 11.2
   */
  const saveWarband = async (): Promise<void> => {
    if (!warband) return;

    // Validate warband name
    if (!warband.name.trim()) {
      throw new Error('Warband name is required');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate warband
      const validation = await apiClient.validate({ warband });
      
      if (!validation.valid) {
        throw new Error('Please fix validation errors before saving');
      }

      // Save or update warband
      let savedWarband: Warband;
      if (warband.id) {
        savedWarband = await apiClient.updateWarband(warband.id, warband);
      } else {
        savedWarband = await apiClient.createWarband({
          name: warband.name,
          pointLimit: warband.pointLimit,
          ability: warband.ability,
        });
      }

      setWarband(savedWarband);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save warband';
      setError(new Error(errorMessage));
      console.error('Error saving warband:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load warband on mount if warbandId is provided
   * Requirement 11.1
   */
  useEffect(() => {
    if (warbandId) {
      loadWarband(warbandId);
    } else {
      createNewWarband();
    }
  }, [warbandId]);

  const value: WarbandContextValue = {
    warband,
    loading,
    error,
    updateWarband,
    addWeirdo,
    removeWeirdo,
    updateWeirdo,
    loadWarband,
    createNewWarband,
    saveWarband,
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
 * Requirement 11.2
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
