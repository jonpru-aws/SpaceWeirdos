import { describe, it, expect, beforeEach } from 'vitest';
import { DataRepository } from '../src/backend/services/DataRepository';
import { ValidationService } from '../src/backend/services/ValidationService';
import { Warband } from '../src/backend/models/types';

describe('Warband Properties API Integration', () => {
  let repository: DataRepository;
  let validationService: ValidationService;

  beforeEach(() => {
    repository = new DataRepository('test-warbands.json', false);
    repository.clear();
    validationService = new ValidationService();
  });

  describe('Warband Validation', () => {
    it('should validate warband name is required', () => {
      const warband: Warband = {
        id: '1',
        name: '',
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = validationService.validateWarband(warband);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[0].code).toBe('WARBAND_NAME_REQUIRED');
    });

    it('should validate point limit is 75 or 125', () => {
      const warband: Warband = {
        id: '1',
        name: 'Test Warband',
        ability: null,
        pointLimit: 100 as any, // Invalid point limit
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = validationService.validateWarband(warband);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_POINT_LIMIT')).toBe(true);
    });

    it('should validate successfully with valid warband properties', () => {
      const warband: Warband = {
        id: '1',
        name: 'Test Warband',
        ability: 'Cyborgs',
        pointLimit: 75,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = validationService.validateWarband(warband);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Warband Save with Validation', () => {
    it('should save valid warband', () => {
      const warband: Warband = {
        id: '',
        name: 'Test Warband',
        ability: 'Soldiers',
        pointLimit: 125,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const saved = repository.saveWarband(warband);
      
      expect(saved.id).toBeTruthy();
      expect(saved.name).toBe('Test Warband');
      expect(saved.ability).toBe('Soldiers');
      expect(saved.pointLimit).toBe(125);
    });

    it('should reject invalid warband on save', () => {
      const warband: Warband = {
        id: '',
        name: '', // Invalid: empty name
        ability: null,
        pointLimit: 75,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => repository.saveWarband(warband)).toThrow();
    });
  });
});
