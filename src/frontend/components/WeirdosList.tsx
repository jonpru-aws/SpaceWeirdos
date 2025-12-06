import { memo } from 'react';
import { Weirdo, ValidationError } from '../../backend/models/types';
import { WeirdoCard } from './WeirdoCard';
import './WarbandEditor.css';

/**
 * WeirdosList Component
 * 
 * Displays the list of weirdos in the warband with add buttons and empty state.
 * Manages weirdo selection and provides actions for editing and removing weirdos.
 * Memoized for performance optimization.
 * 
 * Requirements: 4.1, 4.3, 4.4, 9.4 - React.memo for reusable components
 */

interface WeirdosListProps {
  weirdos: Weirdo[];
  selectedWeirdoId: string | null;
  validationErrors: ValidationError[];
  hasLeader: boolean;
  onAddLeader: () => void;
  onAddTrooper: () => void;
  onSelectWeirdo: (weirdoId: string) => void;
  onRemoveWeirdo: (weirdoId: string) => void;
}

const WeirdosListComponent = ({
  weirdos,
  selectedWeirdoId,
  validationErrors,
  hasLeader,
  onAddLeader,
  onAddTrooper,
  onSelectWeirdo,
  onRemoveWeirdo
}: WeirdosListProps) => {
  /**
   * Check if a specific weirdo has validation errors
   */
  const weirdoHasErrors = (weirdoId: string): boolean => {
    return validationErrors.some(err => {
      // Check if error is specific to this weirdo
      if (err.field?.includes(weirdoId)) return true;
      
      // Check for 21-25 point rule violation
      if (err.code === 'MULTIPLE_25_POINT_WEIRDOS') {
        const weirdo = weirdos.find(w => w.id === weirdoId);
        if (weirdo && weirdo.totalCost >= 21 && weirdo.totalCost <= 25) {
          return true;
        }
      }
      
      return false;
    });
  };

  /**
   * Get validation error messages for a specific weirdo
   */
  const getWeirdoErrors = (weirdoId: string): string[] => {
    const errors: string[] = [];
    
    validationErrors.forEach(err => {
      // Check if error is specific to this weirdo
      if (err.field?.includes(weirdoId)) {
        errors.push(err.message);
      }
      
      // Check for 21-25 point rule violation
      if (err.code === 'MULTIPLE_25_POINT_WEIRDOS') {
        const weirdo = weirdos.find(w => w.id === weirdoId);
        if (weirdo && weirdo.totalCost >= 21 && weirdo.totalCost <= 25) {
          errors.push(err.message);
        }
      }
    });
    
    return errors;
  };

  return (
    <div className="weirdos-section">
      <div className="section-header">
        <h2>Weirdos ({weirdos.length})</h2>
        <div className="add-buttons">
          <button
            onClick={onAddLeader}
            disabled={hasLeader}
            className="add-leader-button"
            aria-label={hasLeader ? 'Leader already added' : 'Add a leader to your warband'}
          >
            + Add Leader
          </button>
          <button
            onClick={onAddTrooper}
            className="add-trooper-button"
            aria-label="Add a trooper to your warband"
          >
            + Add Trooper
          </button>
        </div>
      </div>

      {weirdos.length === 0 ? (
        <p className="empty-state">No weirdos yet. Add a leader to get started!</p>
      ) : (
        <div className="weirdos-list">
          {weirdos.map(weirdo => {
            const hasErrors = weirdoHasErrors(weirdo.id);
            const errorMessages = hasErrors ? getWeirdoErrors(weirdo.id) : [];
            return (
              <WeirdoCard
                key={weirdo.id}
                weirdo={weirdo}
                isSelected={selectedWeirdoId === weirdo.id}
                hasErrors={hasErrors}
                errorMessages={errorMessages}
                onSelect={() => onSelectWeirdo(weirdo.id)}
                onEdit={() => onSelectWeirdo(weirdo.id)}
                onRemove={() => onRemoveWeirdo(weirdo.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const WeirdosList = memo(WeirdosListComponent);
