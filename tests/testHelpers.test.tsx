import { describe, it, expect } from 'vitest';
import { 
  createMockGameData, 
  createMockWarband, 
  createMockWeirdo,
  renderWithProviders
} from './testHelpers';
import { screen } from '@testing-library/react';

/**
 * Unit tests for test helper utilities
 * 
 * Requirements: 5.4 - Test helpers produce valid data
 */

describe('Test Helper Utilities', () => {
  describe('createMockGameData', () => {
    it('should create valid game data structure', () => {
      const gameData = createMockGameData();

      // Verify all required properties exist
      expect(gameData).toHaveProperty('closeCombatWeapons');
      expect(gameData).toHaveProperty('rangedWeapons');
      expect(gameData).toHaveProperty('equipment');
      expect(gameData).toHaveProperty('psychicPowers');
      expect(gameData).toHaveProperty('leaderTraits');
      expect(gameData).toHaveProperty('warbandAbilities');
      expect(gameData).toHaveProperty('attributes');
    });

    it('should create non-empty weapon arrays', () => {
      const gameData = createMockGameData();

      expect(gameData.closeCombatWeapons.length).toBeGreaterThan(0);
      expect(gameData.rangedWeapons.length).toBeGreaterThan(0);
    });

    it('should create valid weapon objects', () => {
      const gameData = createMockGameData();

      const closeCombatWeapon = gameData.closeCombatWeapons[0];
      expect(closeCombatWeapon).toHaveProperty('id');
      expect(closeCombatWeapon).toHaveProperty('name');
      expect(closeCombatWeapon).toHaveProperty('type', 'close');
      expect(closeCombatWeapon).toHaveProperty('baseCost');
      expect(typeof closeCombatWeapon.baseCost).toBe('number');

      const rangedWeapon = gameData.rangedWeapons[0];
      expect(rangedWeapon).toHaveProperty('type', 'ranged');
    });

    it('should create valid equipment objects', () => {
      const gameData = createMockGameData();

      expect(gameData.equipment.length).toBeGreaterThan(0);
      const equipment = gameData.equipment[0];
      expect(equipment).toHaveProperty('id');
      expect(equipment).toHaveProperty('name');
      expect(equipment).toHaveProperty('baseCost');
      expect(typeof equipment.baseCost).toBe('number');
    });

    it('should create valid attributes structure', () => {
      const gameData = createMockGameData();

      expect(gameData.attributes).toHaveProperty('speed');
      expect(gameData.attributes).toHaveProperty('defense');
      expect(gameData.attributes).toHaveProperty('firepower');
      expect(gameData.attributes).toHaveProperty('prowess');
      expect(gameData.attributes).toHaveProperty('willpower');

      // Verify attribute arrays have cost data
      expect(gameData.attributes.speed.length).toBeGreaterThan(0);
      expect(gameData.attributes.speed[0]).toHaveProperty('level');
      expect(gameData.attributes.speed[0]).toHaveProperty('cost');
    });
  });

  describe('createMockWarband', () => {
    it('should create valid warband with default values', () => {
      const warband = createMockWarband();

      expect(warband).toHaveProperty('id');
      expect(warband).toHaveProperty('name');
      expect(warband).toHaveProperty('ability');
      expect(warband).toHaveProperty('pointLimit');
      expect(warband).toHaveProperty('totalCost');
      expect(warband).toHaveProperty('weirdos');
      expect(Array.isArray(warband.weirdos)).toBe(true);
    });

    it('should apply overrides to default warband', () => {
      const warband = createMockWarband({
        name: 'Custom Warband',
        pointLimit: 100
      });

      expect(warband.name).toBe('Custom Warband');
      expect(warband.pointLimit).toBe(100);
      // Default values should still be present
      expect(warband).toHaveProperty('id');
      expect(warband).toHaveProperty('ability');
    });

    it('should create warband with valid dates', () => {
      const warband = createMockWarband();

      expect(warband.createdAt).toBeInstanceOf(Date);
      expect(warband.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('createMockWeirdo', () => {
    it('should create valid leader weirdo', () => {
      const leader = createMockWeirdo('leader');

      expect(leader.type).toBe('leader');
      expect(leader).toHaveProperty('id');
      expect(leader).toHaveProperty('name');
      expect(leader).toHaveProperty('attributes');
      expect(leader).toHaveProperty('closeCombatWeapons');
      expect(leader).toHaveProperty('rangedWeapons');
      expect(leader).toHaveProperty('equipment');
      expect(leader).toHaveProperty('totalCost');
    });

    it('should create valid trooper weirdo', () => {
      const trooper = createMockWeirdo('trooper');

      expect(trooper.type).toBe('trooper');
      expect(trooper).toHaveProperty('id');
      expect(trooper).toHaveProperty('name');
    });

    it('should apply overrides to default weirdo', () => {
      const weirdo = createMockWeirdo('leader', {
        name: 'Custom Leader',
        totalCost: 25
      });

      expect(weirdo.name).toBe('Custom Leader');
      expect(weirdo.totalCost).toBe(25);
      expect(weirdo.type).toBe('leader');
    });

    it('should create weirdo with valid attributes structure', () => {
      const weirdo = createMockWeirdo('trooper');

      expect(weirdo.attributes).toHaveProperty('speed');
      expect(weirdo.attributes).toHaveProperty('defense');
      expect(weirdo.attributes).toHaveProperty('firepower');
      expect(weirdo.attributes).toHaveProperty('prowess');
      expect(weirdo.attributes).toHaveProperty('willpower');
    });

    it('should create weirdo with empty arrays for weapons and equipment', () => {
      const weirdo = createMockWeirdo('trooper');

      expect(Array.isArray(weirdo.closeCombatWeapons)).toBe(true);
      expect(Array.isArray(weirdo.rangedWeapons)).toBe(true);
      expect(Array.isArray(weirdo.equipment)).toBe(true);
      expect(Array.isArray(weirdo.psychicPowers)).toBe(true);
    });
  });

  describe('renderWithProviders', () => {
    it('should render component wrapped with providers', () => {
      const TestComponent = () => <div data-testid="test-component">Test Content</div>;
      
      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('test-component')).toBeDefined();
      expect(screen.getByText('Test Content')).toBeDefined();
    });

    it('should render component with text content', () => {
      const TestComponent = () => <div>Hello World</div>;
      
      const { container } = renderWithProviders(<TestComponent />);

      expect(container.textContent).toContain('Hello World');
    });

    it('should return render result with standard testing library methods', () => {
      const TestComponent = () => <button>Click Me</button>;
      
      const result = renderWithProviders(<TestComponent />);

      expect(result).toHaveProperty('container');
      expect(result).toHaveProperty('rerender');
      expect(result).toHaveProperty('unmount');
      expect(screen.getByRole('button')).toBeDefined();
    });
  });
});
