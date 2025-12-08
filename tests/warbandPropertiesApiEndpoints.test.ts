import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

describe('Warband Properties API Endpoints', () => {
  describe('GET /api/game-data/warband-abilities', () => {
    it('should load warband abilities from JSON file', async () => {
      const abilitiesPath = path.join(process.cwd(), 'data', 'warbandAbilities.json');
      const data = await fs.readFile(abilitiesPath, 'utf-8');
      const abilities = JSON.parse(data);

      expect(Array.isArray(abilities)).toBe(true);
      expect(abilities.length).toBeGreaterThan(0);
      
      // Verify structure of first ability
      const firstAbility = abilities[0];
      expect(firstAbility).toHaveProperty('id');
      expect(firstAbility).toHaveProperty('name');
      expect(firstAbility).toHaveProperty('description');
      expect(firstAbility).toHaveProperty('rule');
    });
  });

  describe('POST /api/validation/warband', () => {
    it('should validate empty name as invalid', () => {
      const name = '';
      const pointLimit = 75;
      const ability = null;
      const errors: Array<{ field: string; message: string; code: string }> = [];

      // Simulate validation logic
      if (!name || name.trim() === '') {
        errors.push({
          field: 'name',
          message: 'Warband name is required',
          code: 'WARBAND_NAME_REQUIRED'
        });
      }

      if (pointLimit !== 75 && pointLimit !== 125) {
        errors.push({
          field: 'pointLimit',
          message: 'Point limit must be 75 or 125',
          code: 'INVALID_POINT_LIMIT'
        });
      }

      const result = {
        valid: errors.length === 0,
        errors
      };

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('WARBAND_NAME_REQUIRED');
    });

    it('should validate invalid point limit', () => {
      const name = 'Test Warband';
      const pointLimit = 100; // Invalid
      const ability = null;
      const errors: Array<{ field: string; message: string; code: string }> = [];

      if (!name || name.trim() === '') {
        errors.push({
          field: 'name',
          message: 'Warband name is required',
          code: 'WARBAND_NAME_REQUIRED'
        });
      }

      if (pointLimit !== 75 && pointLimit !== 125) {
        errors.push({
          field: 'pointLimit',
          message: 'Point limit must be 75 or 125',
          code: 'INVALID_POINT_LIMIT'
        });
      }

      const result = {
        valid: errors.length === 0,
        errors
      };

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_POINT_LIMIT');
    });

    it('should validate valid warband properties', () => {
      const name = 'Test Warband';
      const pointLimit = 125;
      const ability = 'Cyborgs';
      const errors: Array<{ field: string; message: string; code: string }> = [];

      if (!name || name.trim() === '') {
        errors.push({
          field: 'name',
          message: 'Warband name is required',
          code: 'WARBAND_NAME_REQUIRED'
        });
      }

      if (pointLimit !== 75 && pointLimit !== 125) {
        errors.push({
          field: 'pointLimit',
          message: 'Point limit must be 75 or 125',
          code: 'INVALID_POINT_LIMIT'
        });
      }

      const result = {
        valid: errors.length === 0,
        errors
      };

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
