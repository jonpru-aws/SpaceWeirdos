import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';
import { GameDataProvider, GameData } from '../src/frontend/contexts/GameDataContext';
import type { 
  Warband, 
  Weirdo, 
  Weapon, 
  Equipment, 
  PsychicPower,
  WarbandAbility,
  LeaderTrait
} from '../src/backend/models/types';

/**
 * Test Helper Utilities
 * 
 * Provides reusable helper functions for testing components with context providers.
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

/**
 * Options for renderWithProviders
 */
export interface RenderWithProvidersOptions {
  gameData?: GameData;
  initialGameDataLoading?: boolean;
  initialGameDataError?: Error | null;
}

/**
 * Renders a component wrapped with all required context providers
 * 
 * Requirement 5.1: Provide renderWithProviders helper for consistent test setup
 * 
 * @param ui - React element to render
 * @param options - Optional configuration for providers
 * @returns RenderResult from @testing-library/react
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderWithProvidersOptions
): RenderResult {
  // Mock fetch to provide game data immediately in tests
  const mockGameData = options?.gameData || createMockGameData();
  
  // Mock the fetch calls that GameDataProvider makes
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('/warbandAbilities.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGameData.warbandAbilities)
      });
    }
    if (url.includes('/closeCombatWeapons.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGameData.closeCombatWeapons)
      });
    }
    if (url.includes('/rangedWeapons.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGameData.rangedWeapons)
      });
    }
    if (url.includes('/equipment.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGameData.equipment)
      });
    }
    if (url.includes('/psychicPowers.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGameData.psychicPowers)
      });
    }
    if (url.includes('/leaderTraits.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGameData.leaderTraits)
      });
    }
    if (url.includes('/attributes.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGameData.attributes)
      });
    }
    return Promise.reject(new Error(`Unmocked fetch call to ${url}`));
  }) as any;
  
  return render(
    <GameDataProvider>
      {ui}
    </GameDataProvider>
  );
}

/**
 * Creates mock game data for testing
 * 
 * Requirement 5.2: Provide createMockGameData helper for consistent mock data
 * 
 * @returns Complete GameData object with mock values
 */
export function createMockGameData(): GameData {
  const mockCloseCombatWeapons: Weapon[] = [
    {
      id: 'unarmed',
      name: 'Unarmed',
      type: 'close',
      baseCost: 0,
      maxActions: 3,
      notes: 'Basic unarmed attack'
    },
    {
      id: 'melee-weapon',
      name: 'Melee Weapon',
      type: 'close',
      baseCost: 1,
      maxActions: 2,
      notes: 'Standard melee weapon'
    }
  ];

  const mockRangedWeapons: Weapon[] = [
    {
      id: 'auto-pistol',
      name: 'Auto Pistol',
      type: 'ranged',
      baseCost: 0,
      maxActions: 3,
      notes: 'Basic ranged weapon'
    },
    {
      id: 'auto-rifle',
      name: 'Auto Rifle',
      type: 'ranged',
      baseCost: 1,
      maxActions: 3,
      notes: 'Standard rifle'
    }
  ];

  const mockEquipment: Equipment[] = [
    {
      id: 'cybernetics',
      name: 'Cybernetics',
      type: 'Passive',
      baseCost: 1,
      effect: '+1 to Power rolls'
    },
    {
      id: 'grenade',
      name: 'Grenade',
      type: 'Action',
      baseCost: 1,
      effect: 'Blast AOE'
    }
  ];

  const mockPsychicPowers: PsychicPower[] = [
    {
      id: 'fear',
      name: 'Fear',
      type: 'Attack',
      cost: 1,
      effect: 'Fear effect'
    },
    {
      id: 'healing',
      name: 'Healing',
      type: 'Effect',
      cost: 1,
      effect: 'Healing effect'
    }
  ];

  const mockLeaderTraits = [
    {
      id: 'bounty-hunter',
      name: 'Bounty Hunter' as LeaderTrait,
      description: 'Bounty hunter ability'
    },
    {
      id: 'healer',
      name: 'Healer' as LeaderTrait,
      description: 'Healer ability'
    }
  ];

  const mockWarbandAbilities = [
    {
      id: 'cyborgs',
      name: 'Cyborgs' as WarbandAbility,
      description: 'Cyborg description',
      rule: 'Cyborg rule'
    },
    {
      id: 'soldiers',
      name: 'Soldiers' as WarbandAbility,
      description: 'Soldiers description',
      rule: 'Soldiers rule'
    }
  ];

  const mockAttributes = {
    speed: [
      { level: 1, cost: 0 },
      { level: 2, cost: 1 },
      { level: 3, cost: 2 }
    ],
    defense: [
      { level: '2d6', cost: 0 },
      { level: '2d8', cost: 1 },
      { level: '2d10', cost: 2 }
    ],
    firepower: [
      { level: 'None', cost: 0 },
      { level: '2d8', cost: 1 },
      { level: '2d10', cost: 2 }
    ],
    prowess: [
      { level: '2d6', cost: 0 },
      { level: '2d8', cost: 1 },
      { level: '2d10', cost: 2 }
    ],
    willpower: [
      { level: '2d6', cost: 0 },
      { level: '2d8', cost: 1 },
      { level: '2d10', cost: 2 }
    ]
  };

  return {
    closeCombatWeapons: mockCloseCombatWeapons,
    rangedWeapons: mockRangedWeapons,
    equipment: mockEquipment,
    psychicPowers: mockPsychicPowers,
    leaderTraits: mockLeaderTraits,
    warbandAbilities: mockWarbandAbilities,
    attributes: mockAttributes
  };
}

/**
 * Creates a mock warband for testing
 * 
 * Requirement 5.3: Provide createMockWarband helper for consistent mock warbands
 * 
 * @param overrides - Optional partial warband to override defaults
 * @returns Complete Warband object
 */
export function createMockWarband(overrides?: Partial<Warband>): Warband {
  const defaultWarband: Warband = {
    id: 'test-warband-1',
    name: 'Test Warband',
    ability: 'Cyborgs',
    pointLimit: 75,
    totalCost: 0,
    weirdos: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  return {
    ...defaultWarband,
    ...overrides
  };
}

/**
 * Creates a mock weirdo for testing
 * 
 * Requirement 5.4: Provide createMockWeirdo helper for consistent mock weirdos
 * 
 * @param type - Type of weirdo ('leader' or 'trooper')
 * @param overrides - Optional partial weirdo to override defaults
 * @returns Complete Weirdo object
 */
export function createMockWeirdo(
  type: 'leader' | 'trooper',
  overrides?: Partial<Weirdo>
): Weirdo {
  const defaultWeirdo: Weirdo = {
    id: `test-${type}-1`,
    name: type === 'leader' ? 'Test Leader' : 'Test Trooper',
    type,
    attributes: {
      speed: 1,
      defense: '2d6',
      firepower: 'None',
      prowess: '2d6',
      willpower: '2d6'
    },
    closeCombatWeapons: [],
    rangedWeapons: [],
    equipment: [],
    psychicPowers: [],
    leaderTrait: null,
    notes: '',
    totalCost: 10
  };

  return {
    ...defaultWeirdo,
    ...overrides
  };
}
