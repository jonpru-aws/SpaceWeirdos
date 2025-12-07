import { useState } from 'react';
import { Weirdo, ValidationError } from '../../backend/models/types';
import './WeirdoCard.css';

/**
 * WeirdoCard Component
 * 
 * Compact display of weirdo information in the list.
 * Shows name, type, cost, and validation status.
 * Handles selection and removal.
 * Displays validation errors in tooltip on hover.
 * 
 * Requirements: 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 10.5, 11.4
 */

interface WeirdoCardProps {
  weirdo: Weirdo;
  cost: number;
  isSelected: boolean;
  hasErrors: boolean;
  validationErrors?: ValidationError[];
  onClick: () => void;
  onRemove: () => void;
}

export function WeirdoCard({
  weirdo,
  cost,
  isSelected,
  hasErrors,
  validationErrors = [],
  onClick,
  onRemove,
}: WeirdoCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Build CSS classes based on state
  const cardClasses = [
    'weirdo-card',
    isSelected && 'weirdo-card--selected',
    hasErrors && 'weirdo-card--error',
  ]
    .filter(Boolean)
    .join(' ');

  // Handle remove button click (prevent event bubbling to card click)
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  // Format weirdo type for display
  const typeLabel = weirdo.type === 'leader' ? 'Leader' : 'Trooper';

  // Format validation error messages for tooltip (Requirements 4.3, 4.4, 4.6, 4.7)
  const formatErrorMessage = (error: ValidationError): string => {
    // If error message includes point total, show it (Requirement 4.7)
    return error.message;
  };

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Select ${weirdo.name}`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => hasErrors && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Error indicator with tooltip (Requirements 4.1, 4.2, 4.3, 4.4) */}
      {hasErrors && (
        <div className="weirdo-card__error-indicator" aria-label="Has validation errors">
          ⚠
          {/* Tooltip showing validation errors (Requirements 4.3, 4.4, 4.6) */}
          {showTooltip && validationErrors.length > 0 && (
            <div className="weirdo-card__tooltip" role="tooltip">
              <div className="weirdo-card__tooltip-title">Validation Errors:</div>
              <ul className="weirdo-card__tooltip-list">
                {validationErrors.map((error, index) => (
                  <li key={index} className="weirdo-card__tooltip-item">
                    {formatErrorMessage(error)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Weirdo info */}
      <div className="weirdo-card__info">
        <div className="weirdo-card__name">{weirdo.name}</div>
        <div className="weirdo-card__type">{typeLabel}</div>
      </div>

      {/* Cost display (Requirement 3.3) */}
      <div className="weirdo-card__cost">{cost} pts</div>

      {/* Remove button (Requirement 11.4) */}
      <button
        className="weirdo-card__remove"
        onClick={handleRemoveClick}
        aria-label={`Remove ${weirdo.name}`}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
