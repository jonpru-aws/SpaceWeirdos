import { createContext, useContext, useState, ReactNode } from 'react';
import { Warband, Weirdo, ValidationError, ValidationResult } from '../../backend/models/types';
import { DataRepository } from '../../backend/services/DataRepository';
import { CostEngine } from '../../backend/services/CostEngine';
import { ValidationService } from '../../backend/services/ValidationService';

/**
 * WarbandContext
 * 
 * Provides centralized warband state management for components.
 * Reduces prop drilling by sharing warband data and update functions via Context API.
 * Integrates with DataRepository for persistence, CostEngine for cost calculations,
 * and ValidationService for validation.
 * 
 * Requirements: 1.1-1.7, 2.1-2.7, 3.1-3.3, 10.5, 10.6, 11.5
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
  addWeirdo: (type: 'leader' | 'trooper') => void;
  removeWeirdo: (id: string) => void;
  updateWeirdo: (id: string, updates: Partial<Weirdo>) => void;
  selectWeirdo: (id: string) => void;
  
  // Computed values
  getWeirdoCost: (id: string) => number;
  getWarbandCost: () => number;
  validateWarband: () => ValidationResult;
  validateWeirdo: (id: string) => ValidationResult;
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
  dataRepository: DataRepository;
  costEngine: CostEngine;
  validationService: ValidationService;
}

/**
 * WarbandProvider component
 * 
 * Manages warband state and provides update functions.
 * Integrates with DataRepository, CostEngine, and ValidationService.
 * 
 * Requirements: 1.1-1.7, 2.1-2.7, 3.1-3.3, 10.5, 10.6, 11.5
 */
export function WarbandProvider({ 
  children, 
  dataRepository, 
  costEngine, 
  validationService 
}: WarbandProviderProps) {
  const [currentWarband, setCurrentWarband] = useState<Warband | null>(null);
  const [selectedWeirdoId, setSelectedWeirdoId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Map<string, ValidationError[]>>(new Map());

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
   * Load existing warband by ID from DataRepository
   * Requirements: 2.4, 7.9
   */
  const loadWarband = async (id: string): Promise<void> => {
    try {
      const loadedWarband = dataRepository.getWarband(id);
      if (loadedWarband) {
        setCurrentWarband(loadedWarband);
        setSelectedWeirdoId(null);
        setValidationErrors(new Map());
      } else {
        throw new Error(`Warband with id ${id} not found`);
      }
    } catch (err) {
      console.error('Error loading warband:', err);
      throw err;
    }
  };

  /**
   * Update warband properties
   * Requirements: 1.2, 1.3, 1.5
   */
  const updateWarband = (updates: Partial<Warband>): void => {
    if (!currentWarband) return;

    const updatedWarband = { ...currentWarband, ...updates };
    
    // Recalculate total cost if weirdos changed
    if (updates.weirdos || updates.ability !== undefined) {
      updatedWarband.totalCost = costEngine.calculateWarbandCost(updatedWarband);
    }
    
    setCurrentWarband(updatedWarband);
  };

  /**
   * Add a new weirdo to the warband
   * Requirements: 2.3, 2.4, 11.1, 11.2, 11.3
   */
  const addWeirdo = (type: 'leader' | 'trooper'): void => {
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

    // Calculate initial cost
    newWeirdo.totalCost = costEngine.calculateWeirdoCost(newWeirdo, currentWarband.ability);

    // Add to warband
    const updatedWeirdos = [...currentWarband.weirdos, newWeirdo];
    const updatedWarband = {
      ...currentWarband,
      weirdos: updatedWeirdos,
      totalCost: costEngine.calculateWarbandCost({ ...currentWarband, weirdos: updatedWeirdos }),
    };

    setCurrentWarband(updatedWarband);
    setSelectedWeirdoId(newWeirdo.id); // Auto-select new weirdo (Requirement 10.6)
  };

  /**
   * Remove a weirdo from the warband
   * Requirements: 11.4, 11.5, 11.6
   */
  const removeWeirdo = (weirdoId: string): void => {
    if (!currentWarband) return;

    const updatedWeirdos = currentWarband.weirdos.filter(w => w.id !== weirdoId);
    const updatedWarband = {
      ...currentWarband,
      weirdos: updatedWeirdos,
      totalCost: costEngine.calculateWarbandCost({ ...currentWarband, weirdos: updatedWeirdos }),
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
   * Requirements: 3.1, 3.2, 3.6
   */
  const updateWeirdo = (weirdoId: string, updates: Partial<Weirdo>): void => {
    if (!currentWarband) return;

    const weirdo = currentWarband.weirdos.find(w => w.id === weirdoId);
    if (!weirdo) {
      throw new Error(`Weirdo with id ${weirdoId} not found`);
    }

    const updatedWeirdo = { ...weirdo, ...updates };
    
    // Recalculate weirdo cost (Requirement 3.1)
    updatedWeirdo.totalCost = costEngine.calculateWeirdoCost(updatedWeirdo, currentWarband.ability);

    // Update warband with new weirdo
    const updatedWeirdos = currentWarband.weirdos.map(w =>
      w.id === weirdoId ? updatedWeirdo : w
    );
    
    // Recalculate warband total cost (Requirement 3.2)
    const updatedWarband = {
      ...currentWarband,
      weirdos: updatedWeirdos,
      totalCost: costEngine.calculateWarbandCost({ ...currentWarband, weirdos: updatedWeirdos }),
    };

    setCurrentWarband(updatedWarband);
  };

  /**
   * Select a weirdo for editing
   * Requirements: 10.5
   */
  const selectWeirdo = (id: string): void => {
    setSelectedWeirdoId(id);
  };

  /**
   * Save the warband to DataRepository
   * Requirements: 9.1, 9.2
   */
  const saveWarband = async (): Promise<void> => {
    if (!currentWarband) return;

    // Validate warband name
    if (!currentWarband.name.trim()) {
      throw new Error('Warband name is required');
    }

    try {
      // Validate warband
      const validation = validationService.validateWarband(currentWarband);
      
      if (!validation.valid) {
        throw new Error('Please fix validation errors before saving');
      }

      // Save warband using DataRepository
      const savedWarband = dataRepository.saveWarband(currentWarband);
      setCurrentWarband(savedWarband);
    } catch (err) {
      console.error('Error saving warband:', err);
      throw err;
    }
  };

  /**
   * Delete a warband from DataRepository
   * Requirements: 8.3, 8.5, 8.6
   */
  const deleteWarband = async (id: string): Promise<void> => {
    try {
      const deleted = dataRepository.deleteWarband(id);
      if (!deleted) {
        throw new Error(`Warband with id ${id} not found`);
      }
      
      // Clear current warband if it was deleted
      if (currentWarband?.id === id) {
        setCurrentWarband(null);
        setSelectedWeirdoId(null);
        setValidationErrors(new Map());
      }
    } catch (err) {
      console.error('Error deleting warband:', err);
      throw err;
    }
  };

  /**
   * Get the cost of a specific weirdo
   * Requirements: 3.1, 3.3
   */
  const getWeirdoCost = (id: string): number => {
    if (!currentWarband) return 0;
    
    const weirdo = currentWarband.weirdos.find(w => w.id === id);
    if (!weirdo) return 0;
    
    return costEngine.calculateWeirdoCost(weirdo, currentWarband.ability);
  };

  /**
   * Get the total cost of the warband
   * Requirements: 3.2, 3.3
   */
  const getWarbandCost = (): number => {
    if (!currentWarband) return 0;
    return costEngine.calculateWarbandCost(currentWarband);
  };

  /**
   * Validate the entire warband
   * Requirements: 4.1, 4.2, 4.3, 9.1
   */
  const validateWarband = (): ValidationResult => {
    if (!currentWarband) {
      return { valid: true, errors: [] };
    }
    
    const result = validationService.validateWarband(currentWarband);
    
    // Update validation errors map
    const newErrors = new Map<string, ValidationError[]>();
    for (const error of result.errors) {
      // Extract weirdo ID from field path (e.g., "weirdo.temp-123.name" -> "temp-123")
      const match = error.field.match(/weirdo\.([^.]+)\./);
      if (match) {
        const weirdoId = match[1];
        const existing = newErrors.get(weirdoId) || [];
        newErrors.set(weirdoId, [...existing, error]);
      }
    }
    setValidationErrors(newErrors);
    
    return result;
  };

  /**
   * Validate a specific weirdo
   * Requirements: 4.1, 4.2, 4.3
   */
  const validateWeirdo = (id: string): ValidationResult => {
    if (!currentWarband) {
      return { valid: true, errors: [] };
    }
    
    const weirdo = currentWarband.weirdos.find(w => w.id === id);
    if (!weirdo) {
      return { valid: true, errors: [] };
    }
    
    const errors = validationService.validateWeirdo(weirdo, currentWarband);
    
    // Update validation errors for this weirdo
    const newErrors = new Map(validationErrors);
    if (errors.length > 0) {
      newErrors.set(id, errors);
    } else {
      newErrors.delete(id);
    }
    setValidationErrors(newErrors);
    
    return {
      valid: errors.length === 0,
      errors
    };
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
