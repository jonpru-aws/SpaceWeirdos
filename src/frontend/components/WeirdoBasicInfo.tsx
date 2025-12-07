import { Weirdo } from '../../backend/models/types';

/**
 * WeirdoBasicInfo Component
 * 
 * Displays and edits basic weirdo information.
 * Shows weirdo name input and type (Leader/Trooper).
 * 
 * Requirements: 10.3
 */

interface WeirdoBasicInfoProps {
  weirdo: Weirdo;
  onUpdate: (updates: Partial<Weirdo>) => void;
}

export function WeirdoBasicInfo({ weirdo, onUpdate }: WeirdoBasicInfoProps) {
  // Format weirdo type for display
  const typeLabel = weirdo.type === 'leader' ? 'Leader' : 'Trooper';

  return (
    <div className="weirdo-basic-info">
      <div className="weirdo-basic-info__field">
        <label htmlFor="weirdo-name" className="weirdo-basic-info__label">
          Name:
        </label>
        <input
          id="weirdo-name"
          type="text"
          className="weirdo-basic-info__input"
          value={weirdo.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Enter weirdo name"
        />
      </div>

      <div className="weirdo-basic-info__field">
        <span className="weirdo-basic-info__label">Type:</span>
        <span className="weirdo-basic-info__type">{typeLabel}</span>
      </div>
    </div>
  );
}
