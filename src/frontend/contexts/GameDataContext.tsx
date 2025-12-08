import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

/**
 * GameDataContext
 * 
 * Provides centralized game data management for components.
 * Fetches all game data via API on app initialization and caches it.
 * Reduces API calls by sharing cached data via Context API.
 * 
 * Requirements: 9.1, 9.5, 9.6
 */

/**
 * Type definitions for game data
 */
export interface AttributeCosts {
  speed: Record<string, number>;
  defense: Record<string, number>;
  firepower: Record<string, number>;
  prowess: Record<string, number>;
  willpower: Record<string, number>;
}

export interface Weapon {
  id: string;
  name: string;
  type: 'close' | 'ranged';
  baseCost: number;
  maxActions?: number;
  range?: string;
  notes: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  baseCost: number;
  effect: string;
}

export interface PsychicPower {
  id: string;
  name: string;
  type: string;
  cost: number;
  effect: string;
}

export interface LeaderTrait {
  id: string;
  name: string;
  description: string;
}

export interface WarbandAbility {
  id: string;
  name: string;
  description: string;
  rule: string;
}

/**
 * Context value interface
 */
interface GameDataContextValue {
  // Game data
  attributes: AttributeCosts | null;
  closeCombatWeapons: Weapon[];
  rangedWeapons: Weapon[];
  equipment: Equipment[];
  psychicPowers: PsychicPower[];
  leaderTraits: LeaderTrait[];
  warbandAbilities: WarbandAbility[];
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Retry function
  refetch: () => Promise<void>;
}

/**
 * Create context with undefined default
 */
const GameDataContext = createContext<GameDataContextValue | undefined>(undefined);

/**
 * Provider props
 */
interface GameDataProviderProps {
  children: ReactNode;
}

/**
 * API base URL configuration
 */
// Type assertion safe: import.meta.env is a Vite-specific object that TypeScript doesn't recognize
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

/**
 * GameDataProvider component
 * 
 * Fetches all game data on mount and provides it to child components.
 * Handles loading and error states.
 * 
 * Requirements: 9.1, 9.5, 9.6
 */
export function GameDataProvider({ children }: GameDataProviderProps) {
  const [attributes, setAttributes] = useState<AttributeCosts | null>(null);
  const [closeCombatWeapons, setCloseCombatWeapons] = useState<Weapon[]>([]);
  const [rangedWeapons, setRangedWeapons] = useState<Weapon[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [psychicPowers, setPsychicPowers] = useState<PsychicPower[]>([]);
  const [leaderTraits, setLeaderTraits] = useState<LeaderTrait[]>([]);
  const [warbandAbilities, setWarbandAbilities] = useState<WarbandAbility[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all game data from API
   * Requirements: 9.1, 9.5
   */
  const fetchGameData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all game data in parallel for better performance
      const [
        attributesRes,
        closeCombatRes,
        rangedRes,
        equipmentRes,
        powersRes,
        traitsRes,
        abilitiesRes,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/game-data/attributes`),
        fetch(`${API_BASE_URL}/game-data/weapons/close`),
        fetch(`${API_BASE_URL}/game-data/weapons/ranged`),
        fetch(`${API_BASE_URL}/game-data/equipment`),
        fetch(`${API_BASE_URL}/game-data/psychic-powers`),
        fetch(`${API_BASE_URL}/game-data/leader-traits`),
        fetch(`${API_BASE_URL}/game-data/warband-abilities`),
      ]);

      // Check for HTTP errors
      if (!attributesRes.ok) throw new Error('Failed to fetch attributes');
      if (!closeCombatRes.ok) throw new Error('Failed to fetch close combat weapons');
      if (!rangedRes.ok) throw new Error('Failed to fetch ranged weapons');
      if (!equipmentRes.ok) throw new Error('Failed to fetch equipment');
      if (!powersRes.ok) throw new Error('Failed to fetch psychic powers');
      if (!traitsRes.ok) throw new Error('Failed to fetch leader traits');
      if (!abilitiesRes.ok) throw new Error('Failed to fetch warband abilities');

      // Parse JSON responses
      const [
        attributesData,
        closeCombatData,
        rangedData,
        equipmentData,
        powersData,
        traitsData,
        abilitiesData,
      ] = await Promise.all([
        attributesRes.json(),
        closeCombatRes.json(),
        rangedRes.json(),
        equipmentRes.json(),
        powersRes.json(),
        traitsRes.json(),
        abilitiesRes.json(),
      ]);

      // Update state with fetched data (Requirements 9.1, 9.6)
      // Type assertions safe: API responses are validated to match type definitions by backend
      setAttributes(attributesData as AttributeCosts);
      setCloseCombatWeapons(closeCombatData as Weapon[]);
      // Type assertion safe: API response validated by backend to match Weapon[] type
      setRangedWeapons(rangedData as Weapon[]);
      // Type assertion safe: API response validated by backend to match Equipment[] type
      setEquipment(equipmentData as Equipment[]);
      // Type assertion safe: API response validated by backend to match PsychicPower[] type
      setPsychicPowers(powersData as PsychicPower[]);
      // Type assertion safe: API response validated by backend to match LeaderTrait[] type
      setLeaderTraits(traitsData as LeaderTrait[]);
      // Type assertion safe: API response validated by backend to match WarbandAbility[] type
      setWarbandAbilities(abilitiesData as WarbandAbility[]);
      
      setIsLoading(false);
    } catch (error: unknown) {
      // Handle errors (Requirement 9.5)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load game data';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Error fetching game data:', error);
    }
  };

  /**
   * Fetch game data on component mount
   * Requirements: 9.1
   */
  useEffect(() => {
    fetchGameData();
  }, []);

  const value: GameDataContextValue = {
    attributes,
    closeCombatWeapons,
    rangedWeapons,
    equipment,
    psychicPowers,
    leaderTraits,
    warbandAbilities,
    isLoading,
    error,
    refetch: fetchGameData,
  };

  return (
    <GameDataContext.Provider value={value}>
      {children}
    </GameDataContext.Provider>
  );
}

/**
 * Custom hook to access game data context
 * 
 * Throws error if used outside of GameDataProvider.
 * 
 * Requirements: 9.1, 9.5, 9.6
 * 
 * @returns GameDataContextValue
 */
export function useGameData(): GameDataContextValue {
  const context = useContext(GameDataContext);
  
  if (context === undefined) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  
  return context;
}
