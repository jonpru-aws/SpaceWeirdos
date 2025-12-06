import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, NotFoundError } from '../src/backend/errors/AppError';

/**
 * Unit tests for custom error classes
 * Requirements: 10.4
 */

describe('AppError', () => {
  describe('error construction', () => {
    it('should create error with message and code', () => {
      const error = new AppError('Test error', 'TEST_CODE');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500); // Default status code
      expect(error.context).toBeUndefined();
    });

    it('should create error with custom status code', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400);
      
      expect(error.statusCode).toBe(400);
    });

    it('should create error with context', () => {
      const context = { userId: '123', action: 'delete' };
      const error = new AppError('Test error', 'TEST_CODE', 500, context);
      
      expect(error.context).toEqual(context);
    });
  });

  describe('error properties', () => {
    it('should have correct name property', () => {
      const error = new AppError('Test error', 'TEST_CODE');
      
      expect(error.name).toBe('AppError');
    });

    it('should be instance of Error', () => {
      const error = new AppError('Test error', 'TEST_CODE');
      
      expect(error).toBeInstanceOf(Error);
    });

    it('should have stack trace', () => {
      const error = new AppError('Test error', 'TEST_CODE');
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('toJSON method', () => {
    it('should convert error to JSON without context', () => {
      const error = new AppError('Test error', 'TEST_CODE');
      const json = error.toJSON();
      
      expect(json).toEqual({
        error: 'Test error',
        code: 'TEST_CODE'
      });
    });

    it('should convert error to JSON with context', () => {
      const context = { field: 'name', value: 'invalid' };
      const error = new AppError('Test error', 'TEST_CODE', 400, context);
      const json = error.toJSON();
      
      expect(json).toEqual({
        error: 'Test error',
        code: 'TEST_CODE',
        context
      });
    });
  });
});

describe('ValidationError', () => {
  describe('error construction', () => {
    it('should create validation error with message and code', () => {
      const error = new ValidationError('Invalid input', 'INVALID_INPUT');
      
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.statusCode).toBe(400);
    });

    it('should create validation error with context', () => {
      const context = { field: 'email', reason: 'invalid format' };
      const error = new ValidationError('Invalid email', 'INVALID_EMAIL', context);
      
      expect(error.context).toEqual(context);
    });
  });

  describe('error inheritance', () => {
    it('should be instance of AppError', () => {
      const error = new ValidationError('Invalid input', 'INVALID_INPUT');
      
      expect(error).toBeInstanceOf(AppError);
    });

    it('should be instance of Error', () => {
      const error = new ValidationError('Invalid input', 'INVALID_INPUT');
      
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name property', () => {
      const error = new ValidationError('Invalid input', 'INVALID_INPUT');
      
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('toJSON method', () => {
    it('should inherit toJSON from AppError', () => {
      const error = new ValidationError('Invalid input', 'INVALID_INPUT');
      const json = error.toJSON();
      
      expect(json).toEqual({
        error: 'Invalid input',
        code: 'INVALID_INPUT'
      });
    });
  });
});

describe('NotFoundError', () => {
  describe('error construction', () => {
    it('should create not found error with resource and id', () => {
      const error = new NotFoundError('Warband', '123');
      
      expect(error.message).toBe('Warband not found: 123');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });

    it('should include resource and id in context', () => {
      const error = new NotFoundError('Weirdo', 'abc-456');
      
      expect(error.context).toEqual({
        resource: 'Weirdo',
        id: 'abc-456'
      });
    });
  });

  describe('error inheritance', () => {
    it('should be instance of AppError', () => {
      const error = new NotFoundError('Warband', '123');
      
      expect(error).toBeInstanceOf(AppError);
    });

    it('should be instance of Error', () => {
      const error = new NotFoundError('Warband', '123');
      
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name property', () => {
      const error = new NotFoundError('Warband', '123');
      
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('toJSON method', () => {
    it('should include context in JSON output', () => {
      const error = new NotFoundError('Warband', '123');
      const json = error.toJSON();
      
      expect(json).toEqual({
        error: 'Warband not found: 123',
        code: 'NOT_FOUND',
        context: {
          resource: 'Warband',
          id: '123'
        }
      });
    });
  });
});
