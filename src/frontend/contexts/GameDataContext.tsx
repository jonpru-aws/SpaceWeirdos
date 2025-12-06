import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Weapon,
  Equipment,
  PsychicPower,
  LeaderTrait,
  WarbandAbility,
} from '../../backend/models/types';

/**
 * GameDataContext
 * 
 * Provides centralized game data loading and access for all components.
 * Loads data once at application startup and shares it via Context API.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

/**
 * Warband ability with full metadata
 */
interface WarbandAbilityData {
  id: string;
  name: WarbandAbility;
  description: string;
  rule: string;
}

/**
 * Complete game data structure
 */
export interface GameData {
  closeCombatWeapons: Weapon[];
  rangedWeapons: Weapon[];
  equipment: Equipment[];
  psychicPowers: PsychicPower[];
  leaderTraits: { id: string; name: LeaderTrait; description: string }[];
  warbandAbilities: WarbandAbilityData[];
  attributes: {
    speed: { level: number; cost: number }[];
    defense: { level: string; cost: number }[];
    firepower: { level: string; cost: number }[];
    prowess: { level: string; cost: number }[];
    willpower: { level: string; cost: number }[];
  };
}

/**
 * Context value interface
 */
interface GameDataContextValue {
  data: GameData | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
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
 * GameDataProvider component
 * 
 * Loads all game data from JSON files on mount.
 * Provides loading and error states.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export function GameDataProvider({ children }: GameDataProviderProps) {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load all game data from JSON files
   * Requirements: 6.1, 6.2, 6.3
   */
  const loadGameData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Load all data files in parallel
      const [
        closeCombatWeapons,
        rangedWeapons,
        equipment,
        psychicPowers,
        leaderTraits,
        warbandAbilities,
        attributes,
      ] = await Promise.all([
        fetch('/data/closeCombatWeapons.json').then(r => {
          if (!r.ok) throw new Error('Failed to load close combat weapons');
          return r.json();
        }),
        fetch('/data/rangedWeapons.json').then(r => {
          if (!r.ok) throw new Error('Failed to load ranged weapons');
          return r.json();
        }),
        fetch('/data/equipment.json').then(r => {
          if (!r.ok) throw new Error('Failed to load equipment');
          return r.json();
        }),
        fetch('/data/psychicPowers.json').then(r => {
          if (!r.ok) throw new Error('Failed to load psychic powers');
          return r.json();
        }),
        fetch('/data/leaderTraits.json').then(r => {
          if (!r.ok) throw new Error('Failed to load leader traits');
          return r.json();
        }),
        fetch('/data/warbandAbilities.json').then(r => {
          if (!r.ok) throw new Error('Failed to load warband abilities');
          return r.json();
        }),
        fetch('/data/attributes.json').then(r => {
          if (!r.ok) throw new Error('Failed to load attributes');
          return r.json();
        }),
      ]);

      // Set loaded data
      setData({
        closeCombatWeapons,
        rangedWeapons,
        equipment,
        psychicPowers,
        leaderTraits,
        warbandAbilities,
        attributes,
      });
    } catch (err) {
      // Handle errors gracefully
      // Requirement 6.4
      const errorMessage = err instanceof Error ? err.message : 'Failed to load game data';
      setError(new Error(errorMessage));
      console.error('Error loading game data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load data on mount
   * Requirement 6.1
   */
  useEffect(() => {
    loadGameData();
  }, []);

  const value: GameDataContextValue = {
    data,
    loading,
    error,
    reload: loadGameData,
  };

  return (
    <GameDataContext.Provider value={value}>
      {children}
    </GameDataContext.Provider>
  );
}

/**
 * Custom hook to access game data
 * 
 * Throws error if used outside of GameDataProvider.
 * 
 * Requirements: 6.2
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
