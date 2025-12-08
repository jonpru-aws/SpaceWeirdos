import { memo } from 'react';
import type { Weirdo } from '../../backend/models/types';

/**
 * WeirdoBasicInfo Component
 * 
 * Displays and edits basic weirdo information.
 * Shows weirdo name input and type (Leader/Trooper).
 * Memoized for performance optimization.
 * 
 * Requirements: 10.3
 */

interface WeirdoBasicInfoProps {
  weirdo: Weirdo;
  onUpdate: (updates: Partial<Weirdo>) => void;
}

const WeirdoBasicInfoComponent = ({ weirdo, onUpdate }: WeirdoBasicInfoProps) => {
  // Format weirdo type for display
  const typeLabel = weirdo.type === 'leader' ? 'Leader' : 'Trooper';

  return (
    <div className="weirdo-basic-info" role="group" aria-labelledby="basic-info-heading">
      <div className="weirdo-basic-info__field">
        <label htmlFor="weirdo-name" className="weirdo-basic-info__label">
          Name:
        </label>
        <input
          id="weirdo-name"
          type="text"
          className="weirdo-basic-info__input input"
          value={weirdo.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Enter weirdo name"
          aria-label="Weirdo name"
          required
        />
      </div>

      <div className="weirdo-basic-info__field">
        <span className="weirdo-basic-info__label" id="weirdo-type-label">Type:</span>
        <span 
          className="weirdo-basic-info__type"
          role="status"
          aria-labelledby="weirdo-type-label"
        >
          {typeLabel}
        </span>
      </div>
    </div>
  );
};

// Memoize component for performance
export const WeirdoBasicInfo = memo(WeirdoBasicInfoComponent);
