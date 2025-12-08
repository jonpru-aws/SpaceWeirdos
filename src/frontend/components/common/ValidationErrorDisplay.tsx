import { memo, useState } from 'react';
import { ValidationError } from '../../../backend/models/types';
import './ValidationErrorDisplay.css';

/**
 * ValidationErrorDisplay Component
 * 
 * Displays validation errors with optional filtering, grouping, and tooltip support.
 * Provides a consistent way to show validation feedback across the application.
 * Supports both inline display and tooltip-on-hover modes.
 * Memoized for performance optimization.
 * 
 * Requirements: 4.3, 4.4, 4.6
 */

interface ValidationErrorDisplayProps {
  errors: ValidationError[];
  filterByField?: string;
  className?: string;
  inline?: boolean;
  showTooltip?: boolean;
}

const ValidationErrorDisplayComponent = ({ 
  errors, 
  filterByField,
  className = '',
  inline = false,
  showTooltip = false
}: ValidationErrorDisplayProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

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

  // Tooltip mode - show error icon with count badge
  if (showTooltip) {
    return (
      <div 
        className={`validation-error-tooltip-container ${className}`}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        onFocus={() => setIsTooltipVisible(true)}
        onBlur={() => setIsTooltipVisible(false)}
        tabIndex={0}
        role="button"
        aria-label={`${filteredErrors.length} validation error${filteredErrors.length !== 1 ? 's' : ''}`}
        aria-describedby={isTooltipVisible ? 'validation-tooltip' : undefined}
      >
        <div className="validation-error-icon">
          <span className="error-icon" aria-hidden="true">⚠</span>
          <span className="error-count" aria-hidden="true">{filteredErrors.length}</span>
        </div>
        {isTooltipVisible && (
          <div 
            id="validation-tooltip"
            className="validation-error-tooltip" 
            role="tooltip"
            aria-live="polite"
          >
            {fieldNames.map(field => (
              <div key={field} className="tooltip-error-group">
                {field !== 'general' && (
                  <div className="tooltip-field-name">{field}:</div>
                )}
                <ul className="tooltip-error-list">
                  {groupedErrors[field].map((error, idx) => (
                    <li key={idx} className="tooltip-error-item">
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
  }

  // Inline mode - show errors directly
  const displayClass = inline ? 'validation-error-inline' : 'validation-error-display';

  return (
    <div className={`${displayClass} ${className}`} role="alert" aria-live="polite">
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
export const ValidationErrorDisplay = memo(ValidationErrorDisplayComponent);
