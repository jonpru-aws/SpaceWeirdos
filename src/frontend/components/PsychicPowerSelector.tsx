import { memo } from 'react';
import { PsychicPower } from '../../backend/models/types';

interface PsychicPowerSelectorProps {
  psychicPowers: PsychicPower[];
  availablePsychicPowers: PsychicPower[];
  onAddPsychicPower: (power: PsychicPower) => void;
  onRemovePsychicPower: (powerId: string) => void;
}

/**
 * PsychicPowerSelector Component
 * 
 * Displays and manages psychic powers.
 * Memoized for performance optimization.
 * 
 * Requirements: 5.1, 5.2, 5.3, 4.2, 4.3, 4.4, 7.7, 9.4 - React.memo for reusable components
 */
const PsychicPowerSelectorComponent = ({
  psychicPowers,
  availablePsychicPowers,
  onAddPsychicPower,
  onRemovePsychicPower
}: PsychicPowerSelectorProps) => {
  return (
    <div className="form-section">
      <h3>Psychic Powers</h3>
      
      {psychicPowers.length > 0 ? (
        <ul className="item-list">
          {psychicPowers.map((power, index) => (
            <li key={`${power.id}-${index}`} className="item">
              <span className="item-name">
                {power.name}
                {power.effect && <span className="item-description"> - {power.effect}</span>}
              </span>
              <span className="item-cost">{power.cost} pts</span>
              <button
                onClick={() => onRemovePsychicPower(power.id)}
                className="remove-item-button"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">No psychic powers selected</p>
      )}

      <div className="form-group">
        <label htmlFor="add-psychic-power">Add Psychic Power</label>
        <select
          id="add-psychic-power"
          onChange={(e) => {
            const power = availablePsychicPowers.find(p => p.id === e.target.value);
            if (power) {
              onAddPsychicPower(power);
              e.target.value = '';
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>Select a power...</option>
          {availablePsychicPowers.map(power => {
            const displayText = `${power.name} (${power.cost} pts) - ${power.effect}`;
            return (
              <option key={power.id} value={power.id}>
                {displayText}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const PsychicPowerSelector = memo(PsychicPowerSelectorComponent);
