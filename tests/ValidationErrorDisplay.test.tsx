import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationErrorDisplay } from '../src/frontend/components/common/ValidationErrorDisplay';
import { ValidationError } from '../src/backend/models/types';

/**
 * Unit tests for ValidationErrorDisplay component
 * 
 * Requirements: 5.4
 * Tests error rendering, filtering, and empty state
 */

describe('ValidationErrorDisplay', () => {
  describe('Error Rendering', () => {
    it('should render a single error message', () => {
      const errors: ValidationError[] = [
        { field: 'name', message: 'Name is required', code: 'REQUIRED' }
      ];

      render(<ValidationErrorDisplay errors={errors} />);

      expect(screen.getByText(/Name is required/)).toBeInTheDocument();
    });

    it('should render multiple error messages', () => {
      const errors: ValidationError[] = [
        { field: 'name', message: 'Name is required', code: 'REQUIRED' },
        { field: 'pointLimit', message: 'Point limit must be 75 or 125', code: 'INVALID_VALUE' }
      ];

      render(<ValidationErrorDisplay errors={errors} />);

      expect(screen.getByText(/Name is required/)).toBeInTheDocument();
      expect(screen.getByText(/Point limit must be 75 or 125/)).toBeInTheDocument();
    });

    it('should group errors by field', () => {
      const errors: ValidationError[] = [
        { field: 'name', message: 'Name is required', code: 'REQUIRED' },
        { field: 'name', message: 'Name must be at least 3 characters', code: 'MIN_LENGTH' },
        { field: 'pointLimit', message: 'Point limit is required', code: 'REQUIRED' }
      ];

      render(<ValidationErrorDisplay errors={errors} />);

      // Check that field names are displayed
      expect(screen.getByText('name:')).toBeInTheDocument();
      expect(screen.getByText('pointLimit:')).toBeInTheDocument();

      // Check that all error messages are displayed
      expect(screen.getByText(/Name is required/)).toBeInTheDocument();
      expect(screen.getByText(/Name must be at least 3 characters/)).toBeInTheDocument();
      expect(screen.getByText(/Point limit is required/)).toBeInTheDocument();
    });

    it('should render general errors without field grouping', () => {
      const errors: ValidationError[] = [
        { field: 'general', message: 'Warband validation failed', code: 'VALIDATION_ERROR' }
      ];

      render(<ValidationErrorDisplay errors={errors} />);

      // Should not show field name for general errors
      expect(screen.queryByText('general:')).not.toBeInTheDocument();
      expect(screen.getByText(/Warband validation failed/)).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter errors by field name', () => {
      const errors: ValidationError[] = [
        { field: 'name', message: 'Name is required', code: 'REQUIRED' },
        { field: 'pointLimit', message: 'Point limit is required', code: 'REQUIRED' },
        { field: 'ability', message: 'Invalid ability', code: 'INVALID_VALUE' }
      ];

      render(<ValidationErrorDisplay errors={errors} filterByField="name" />);

      // Should only show name error
      expect(screen.getByText(/Name is required/)).toBeInTheDocument();
      expect(screen.queryByText(/Point limit is required/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Invalid ability/)).not.toBeInTheDocument();
    });

    it('should filter errors by partial field match', () => {
      const errors: ValidationError[] = [
        { field: 'weirdo-123.name', message: 'Weirdo name is required', code: 'REQUIRED' },
        { field: 'weirdo-123.attributes', message: 'Invalid attributes', code: 'INVALID_VALUE' },
        { field: 'weirdo-456.name', message: 'Another weirdo name error', code: 'REQUIRED' }
      ];

      render(<ValidationErrorDisplay errors={errors} filterByField="weirdo-123" />);

      // Should show errors for weirdo-123
      expect(screen.getByText(/Weirdo name is required/)).toBeInTheDocument();
      expect(screen.getByText(/Invalid attributes/)).toBeInTheDocument();
      
      // Should not show errors for weirdo-456
      expect(screen.queryByText(/Another weirdo name error/)).not.toBeInTheDocument();
    });

    it('should show all errors when no filter is provided', () => {
      const errors: ValidationError[] = [
        { field: 'name', message: 'Name is required', code: 'REQUIRED' },
        { field: 'pointLimit', message: 'Point limit is required', code: 'REQUIRED' }
      ];

      render(<ValidationErrorDisplay errors={errors} />);

      expect(screen.getByText(/Name is required/)).toBeInTheDocument();
      expect(screen.getByText(/Point limit is required/)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render nothing when errors array is empty', () => {
      const { container } = render(<ValidationErrorDisplay errors={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when all errors are filtered out', () => {
      const errors: ValidationError[] = [
        { field: 'name', message: 'Name is required', code: 'REQUIRED' }
      ];

      const { container } = render(
        <ValidationErrorDisplay errors={errors} filterByField="nonexistent" />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const errors: ValidationError[] = [
        { field: 'name', message: 'Name is required', code: 'REQUIRED' }
      ];

      render(<ValidationErrorDisplay errors={errors} />);

      const errorDisplay = screen.getByRole('alert');
      expect(errorDisplay).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const errors: ValidationError[] = [
        { field: 'name', message: 'Name is required', code: 'REQUIRED' }
      ];

      const { container } = render(
        <ValidationErrorDisplay errors={errors} className="custom-class" />
      );

      const errorDisplay = container.querySelector('.validation-error-display');
      expect(errorDisplay).toHaveClass('custom-class');
    });
  });
});
