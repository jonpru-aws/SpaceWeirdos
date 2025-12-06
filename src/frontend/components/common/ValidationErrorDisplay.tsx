import { memo } from 'react';
import { ValidationError } from '../../../backend/models/types';
import './ValidationErrorDisplay.css';

/**
 * ValidationErrorDisplay Component
 * 
 * Displays validation errors with optional filtering and grouping.
 * Provides a consistent way to show validation feedback across the application.
 * Memoized for performance optimization.
 * 
 * Requirements: 5.3, 5.4, 9.4 - React.memo for reusable components
 */

interface ValidationErrorDisplayProps {
  errors: ValidationError[];
  filterByField?: string;
  className?: string;
}

const ValidationErrorDisplayComponent = ({ 
  errors, 
  filterByField,
  className = ''
}: ValidationErrorDisplayProps) => {
  // Filter errors if filterByField is provided
  const filteredErrors = filterByField
    ? errors.filter(err => err.field === filterByField || err.field.includes(filterByField))
    : errors;

  // Group errors by field
  const groupedErrors = filteredErrors.reduce((acc, error) => {
    const field = error.field || 'general';
    if (!acc[field]) {
      acc[field] = [];
    }
    acc[field].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  // If no errors, don't render anything
  if (filteredErrors.length === 0) {
    return null;
  }

  const fieldNames = Object.keys(groupedErrors);

  return (
    <div className={`validation-error-display ${className}`} role="alert" aria-live="polite">
      {fieldNames.length === 1 && fieldNames[0] === 'general' ? (
        // Single group of general errors - show as simple list
        <ul className="error-list">
          {groupedErrors['general'].map((error, idx) => (
            <li key={idx} className="error-item">
              {error.message}
            </li>
          ))}
        </ul>
      ) : (
        // Multiple fields or specific fields - show grouped
        <div className="error-groups">
          {fieldNames.map(field => (
            <div key={field} className="error-group">
              <div className="error-field-name">{field}:</div>
              <ul className="error-list">
                {groupedErrors[field].map((error, idx) => (
                  <li key={idx} className="error-item">
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const ValidationErrorDisplay = memo(ValidationErrorDisplayComponent);
