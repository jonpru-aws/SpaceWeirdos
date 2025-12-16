/**
 * Name Conflict Resolution Service Tests
 * 
 * Tests for the name conflict resolution system including unique name generation,
 * name validation, and sanitization functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NameConflictResolutionService } from '../src/backend/services/NameConflictResolutionService.js';
import { DataRepository } from '../src/backend/services/DataRepository.js';
import { Warband } from '../src/backend/models/types.js';

// Mock DataRepository
vi.mock('../src/backend/services/DataRepository.js');

describe('NameConflictResolutionService', () => {
  let service: NameConflictResolutionService;
  let mockRepository: vi.Mocked<DataRepository>;

  beforeEach(() => {
    mockRepository = {
      loadAllWarbands: vi.fn()
    } as any;
    
    service = new NameConflictResolutionService(mockRepository);
  });

  describe('generateUniqueName', () => {
    it('should return the original name if no conflicts exist', () => {
      mockRepository.loadAllWarbands.mockReturnValue([]);
      
      const result = service.generateUniqueName('Test Warband');
      
      expect(result.success).toBe(true);
      expect(result.resolvedName).toBe('Test Warband');
    });

    it('should generate a unique name with suffix when conflicts exist', () => {
      const existingWarbands: Warband[] = [
        { name: 'Test Warband' } as Warband
      ];
      mockRepository.loadAllWarbands.mockReturnValue(existingWarbands);
      
      const result = service.generateUniqueName('Test Warband');
      
      expect(result.success).toBe(true);
      expect(result.resolvedName).toBe('Test Warband v2');
    });

    it('should sanitize the base name before processing', () => {
      mockRepository.loadAllWarbands.mockReturnValue([]);
      
      const result = service.generateUniqueName('Test<script>alert("xss")</script>Warband');
      
      expect(result.success).toBe(true);
      expect(result.resolvedName).toBe('TestscriptalertxssscriptWarband');
    });

    it('should handle empty names after sanitization', () => {
      mockRepository.loadAllWarbands.mockReturnValue([]);
      
      const result = service.generateUniqueName('<>');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty after sanitization');
    });
  });

  describe('validateName', () => {
    it('should validate a good name as valid and available', () => {
      mockRepository.loadAllWarbands.mockReturnValue([]);
      
      const result = service.validateName('Good Warband Name');
      
      expect(result.valid).toBe(true);
      expect(result.available).toBe(true);
      expect(result.sanitized).toBe('Good Warband Name');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect name conflicts', () => {
      const existingWarbands: Warband[] = [
        { name: 'Existing Warband' } as Warband
      ];
      mockRepository.loadAllWarbands.mockReturnValue(existingWarbands);
      
      const result = service.validateName('Existing Warband');
      
      expect(result.valid).toBe(false);
      expect(result.available).toBe(false);
      expect(result.errors).toContain('Name is already taken');
    });

    it('should reject reserved names', () => {
      mockRepository.loadAllWarbands.mockReturnValue([]);
      
      const result = service.validateName('admin');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name uses reserved words');
    });

    it('should handle names that get truncated during sanitization', () => {
      mockRepository.loadAllWarbands.mockReturnValue([]);
      
      const longName = 'a'.repeat(60);
      const result = service.validateName(longName);
      
      // The name gets sanitized to 50 characters, so it should be valid
      expect(result.valid).toBe(true);
      expect(result.sanitized).toHaveLength(50);
    });
  });

  describe('sanitizeName', () => {
    it('should remove dangerous characters', () => {
      const result = service.sanitizeName('Test<script>alert("xss")</script>Name');
      expect(result).toBe('TestscriptalertxssscriptName');
    });

    it('should normalize whitespace', () => {
      const result = service.sanitizeName('  Test   Multiple   Spaces  ');
      expect(result).toBe('Test Multiple Spaces');
    });

    it('should limit length', () => {
      const longName = 'a'.repeat(100);
      const result = service.sanitizeName(longName);
      expect(result.length).toBe(50);
    });

    it('should handle non-string input', () => {
      const result = service.sanitizeName(null as any);
      expect(result).toBe('');
    });
  });

  describe('checkNameConflict', () => {
    it('should detect conflicts case-insensitively', () => {
      const existingWarbands: Warband[] = [
        { name: 'Test Warband' } as Warband
      ];
      mockRepository.loadAllWarbands.mockReturnValue(existingWarbands);
      
      const hasConflict = service.checkNameConflict('TEST WARBAND');
      expect(hasConflict).toBe(true);
    });

    it('should return false for unique names', () => {
      mockRepository.loadAllWarbands.mockReturnValue([]);
      
      const hasConflict = service.checkNameConflict('Unique Name');
      expect(hasConflict).toBe(false);
    });
  });

  describe('suggestAlternativeNames', () => {
    it('should suggest numbered alternatives', () => {
      const existingWarbands: Warband[] = [
        { name: 'Test Warband' } as Warband
      ];
      mockRepository.loadAllWarbands.mockReturnValue(existingWarbands);
      
      const suggestions = service.suggestAlternativeNames('Test Warband', 3);
      
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toBe('Test Warband 1');
      expect(suggestions[1]).toBe('Test Warband 2');
      expect(suggestions[2]).toBe('Test Warband 3');
    });

    it('should suggest descriptive alternatives when numbered ones are taken', () => {
      const existingWarbands: Warband[] = [
        { name: 'Test Warband' } as Warband,
        { name: 'Test Warband 1' } as Warband,
        { name: 'Test Warband 2' } as Warband,
        { name: 'Test Warband 3' } as Warband
      ];
      mockRepository.loadAllWarbands.mockReturnValue(existingWarbands);
      
      const suggestions = service.suggestAlternativeNames('Test Warband', 3);
      
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toBe('Elite Test Warband');
      expect(suggestions[1]).toBe('Advanced Test Warband');
      expect(suggestions[2]).toBe('Special Test Warband');
    });

    it('should provide fallback suggestions for empty names', () => {
      mockRepository.loadAllWarbands.mockReturnValue([]);
      
      const suggestions = service.suggestAlternativeNames('', 3);
      
      expect(suggestions).toHaveLength(3);
      expect(suggestions).toEqual(['My Warband', 'New Warband', 'Untitled Warband']);
    });
  });
});