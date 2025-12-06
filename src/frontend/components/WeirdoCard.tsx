import { memo } from 'react';
import { Weirdo } from '../../backend/models/types';
import './WarbandEditor.css';

/**
 * WeirdoCard Component
 * 
 * Displays a single weirdo in a card format with name, type, cost, and actions.
 * Shows validation errors if present.
 * Memoized for performance optimization in lists.
 * 
 * Requirements: 4.1, 4.3, 4.4, 9.3, 9.4 - React.memo for list items
 */

interface WeirdoCardProps {
  weirdo: Weirdo;
  isSelected: boolean;
  hasErrors: boolean;
  errorMessages: string[];
  onSelect: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

const WeirdoCardComponent = ({
  weirdo,
  isSelected,
  hasErrors,
  errorMessages,
  onSelect,
  onEdit,
  onRemove
}: WeirdoCardProps) => {
  return (
    <div
      className={`weirdo-card ${isSelected ? 'selected' : ''} ${hasErrors ? 'error' : ''}`}
      onClick={onSelect}
    >
      {hasErrors && errorMessages.length > 0 && (
        <div className="weirdo-error-tooltip" role="tooltip" aria-live="polite">
          <div className="tooltip-content">
            {errorMessages.length === 1 ? (
              <p>{errorMessages[0]}</p>
            ) : (
              <ul>
                {errorMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <div className="weirdo-header">
        <div className="weirdo-info">
          <h3>{weirdo.name}</h3>
          <span className={`weirdo-type ${weirdo.type}`}>
            {weirdo.type === 'leader' ? '👑 Leader' : '⚔ Trooper'}
          </span>
        </div>
        <div className="weirdo-cost">
          {weirdo.totalCost} pts
        </div>
      </div>
      <div className="weirdo-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="edit-button"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="remove-button"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

// Memoize component for performance in lists
// Requirements: 9.3, 9.4 - React.memo for list items
export const WeirdoCard = memo(WeirdoCardComponent);
