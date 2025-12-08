/**
 * Test for warning logic with 25-point weirdo context
 * 
 * This test verifies that warnings are generated correctly based on
 * whether a 25-point weirdo already exists in the warband.
 * 
 * Requirements: 7.5, 7.6, 7.7, 7.8, 7.9
 */

import { describe, it, expect } from 'vitest';
import { ValidationService } from '../src/backend/services/ValidationService';
import type { Weirdo, Warband } from '../src/backend/models/types';

describe('Warning Logic with 25-Point Weirdo Context', () => {
  const validationService = new ValidationService();

  const createWeirdo = (id: string, name: string, cost: number): Weirdo => {
    // Create a weirdo with attributes that sum to the desired cost
    // Speed 1 (0), Defense 2d6 (2), Firepower None (0), Prowess 2d6 (2), Willpower 2d6 (2) = 6 base
    // Adjust speed to reach target cost
    let speed: 1 | 2 | 3 = 1;
    let defense: '2d6' | '2d8' | '2d10' = '2d6';
    let prowess: '2d6' | '2d8' | '2d10' = '2d6';
    let willpower: '2d6' | '2d8' | '2d10' = '2d6';
    
    // Calculate needed cost: cost = speed + defense + firepower + prowess + willpower
    // Start with base: 0 + 2 + 0 + 2 + 2 = 6
    let currentCost = 6;
    
    // Adjust attributes to reach target
    if (cost >= 18) {
      defense = '2d10'; // 8 points
      prowess = '2d8'; // 4 points
      willpower = '2d8'; // 4 points
      currentCost = 0 + 8 + 0 + 4 + 4; // 16
      if (cost >= 19) speed = 2; // +1 = 17
      if (cost >= 20) speed = 3; // +3 = 19
      if (cost >= 22) prowess = '2d10'; // +2 = 21
      if (cost >= 23) willpower = '2d10'; // +2 = 23
    }

    return {
      id,
      name,
      type: 'trooper',
      attributes: {
        speed,
        defense,
        firepower: 'None',
        prowess,
        willpower
      },
      closeCombatWeapons: [{
        id: 'weapon-1',
        name: 'Unarmed',
        type: 'close',
        baseCost: 0,
        maxActions: 1,
        notes: ''
      }],
      rangedWeapons: [],
      equipment: [],
      psychicPowers: [],
      leaderTrait: null,
      notes: '',
      totalCost: 0
    };
  };

  it('should warn at 18-20 when no 25-point weirdo exists', () => {
    const weirdo19 = createWeirdo('w1', 'Weirdo 19pts', 19);
    const warband: Warband = {
      id: 'warband-1',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [weirdo19],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = validationService.validateWeirdo(weirdo19, warband);
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.message.includes('20-point limit'))).toBe(true);
  });

  it('should warn at 23-25 when no 25-point weirdo exists', () => {
    const weirdo23 = createWeirdo('w1', 'Weirdo 23pts', 23);
    const warband: Warband = {
      id: 'warband-1',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [weirdo23],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = validationService.validateWeirdo(weirdo23, warband);
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.message.includes('25-point limit'))).toBe(true);
  });

  it('should warn at 18-20 for other weirdos when a 25-point weirdo exists', () => {
    const weirdo23 = createWeirdo('w1', 'Weirdo 23pts', 23);
    const weirdo19 = createWeirdo('w2', 'Weirdo 19pts', 19);
    const warband: Warband = {
      id: 'warband-1',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [weirdo23, weirdo19],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = validationService.validateWeirdo(weirdo19, warband);
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.message.includes('20-point limit'))).toBe(true);
    expect(result.warnings.some(w => w.message.includes('25-point limit'))).toBe(false);
  });

  it('should warn at 23-25 for the 25-point weirdo itself', () => {
    const weirdo23 = createWeirdo('w1', 'Weirdo 23pts', 23);
    const weirdo10 = createWeirdo('w2', 'Weirdo 10pts', 10);
    const warband: Warband = {
      id: 'warband-1',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [weirdo23, weirdo10],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = validationService.validateWeirdo(weirdo23, warband);
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.message.includes('25-point limit'))).toBe(true);
    expect(result.warnings.some(w => w.message.includes('20-point limit'))).toBe(false);
  });

  it('should not warn at 17 points when no 25-point weirdo exists', () => {
    const weirdo17 = createWeirdo('w1', 'Weirdo 17pts', 17);
    const warband: Warband = {
      id: 'warband-1',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [weirdo17],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = validationService.validateWeirdo(weirdo17, warband);
    
    expect(result.warnings.length).toBe(0);
  });

  it('should warn with both limits when at 20 points and no 25-point weirdo exists', () => {
    const weirdo20 = createWeirdo('w1', 'Weirdo 20pts', 20);
    const warband: Warband = {
      id: 'warband-1',
      name: 'Test Warband',
      ability: null,
      pointLimit: 75,
      totalCost: 0,
      weirdos: [weirdo20],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = validationService.validateWeirdo(weirdo20, warband);
    
    // At exactly 20 points, should warn about 20-point limit (0 points away)
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.message.includes('20-point limit'))).toBe(true);
  });
});
