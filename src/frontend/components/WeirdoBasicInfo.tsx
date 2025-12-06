import { memo } from 'react';
import { ValidationError } from '../../backend/models/types';

interface WeirdoBasicInfoProps {
  name: string;
  type: 'leader' | 'trooper';
  onNameChange: (name: string) => void;
  validationErrors: ValidationError[];
}

/**
 * WeirdoBasicInfo Component
 * 
 * Displays and edits basic weirdo information (name and type).
 * Memoized for performance optimization.
 * 
 * Requirements: 4.2, 4.3, 4.4, 9.4 - React.memo for reusable components
 */
const WeirdoBasicInfoComponent = ({ name, type, onNameChange, validationErrors }: WeirdoBasicInfoProps) => {
  return (
    <div className="form-section">
      <h3>Basic Info</h3>
      <div className="form-group">
        <label htmlFor="weirdo-name">
          Name <span className="required">*</span>
        </label>
        <input
          id="weirdo-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter weirdo name"
          className={validationErrors.some(e => e.field === 'name') ? 'error' : ''}
        />
      </div>
      <div className="form-group">
        <label>Type</label>
        <div className="type-display">
          {type === 'leader' ? '👑 Leader' : '⚔ Trooper'}
        </div>
      </div>
    </div>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const WeirdoBasicInfo = memo(WeirdoBasicInfoComponent);
