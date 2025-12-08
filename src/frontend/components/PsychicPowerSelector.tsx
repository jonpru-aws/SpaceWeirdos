import { memo } from 'react';
import { PsychicPower } from '../../backend/models/types';
import './PsychicPowerSelector.css';

/**
 * PsychicPowerSelector Component
 * 
 * Multi-select interface for psychic powers.
 * Displays name, cost, and effect for each power.
 * No limit on selections.
 * 
 * Requirements: 5.5, 12.4
 */

interface PsychicPowerSelectorProps {
  selectedPowers: PsychicPower[];
  availablePowers: PsychicPower[];
  onChange: (powers: PsychicPower[]) => void;
}

const PsychicPowerSelectorComponent = ({
  selectedPowers,
  availablePowers,
  onChange
}: PsychicPowerSelectorProps) => {
  const handleToggle = (power: PsychicPower) => {
    const isSelected = selectedPowers.some(p => p.id === power.id);
    
    if (isSelected) {
      // Remove power
      onChange(selectedPowers.filter(p => p.id !== power.id));
    } else {
      // Add power
      onChange([...selectedPowers, power]);
    }
  };

  return (
    <div className="psychic-power-selector" role="group" aria-labelledby="psychic-powers-heading">
      <h4 id="psychic-powers-heading">Psychic Powers</h4>
      <ul className="psychic-power-selector__list" role="list">
        {availablePowers.map((power) => {
          const isSelected = selectedPowers.some(p => p.id === power.id);

          return (
            <li key={power.id} className="psychic-power-selector__item" role="listitem">
              <label 
                className="psychic-power-selector__label"
                htmlFor={`psychic-power-${power.id}`}
              >
                <input
                  type="checkbox"
                  id={`psychic-power-${power.id}`}
                  checked={isSelected}
                  onChange={() => handleToggle(power)}
                  className="psychic-power-selector__checkbox checkbox"
                  aria-describedby={`psychic-power-effect-${power.id}`}
                  aria-label={`${power.name}, ${power.cost} points`}
                />
                <div className="psychic-power-selector__content">
                  <div className="psychic-power-selector__header">
                    <span className="psychic-power-selector__name">{power.name}</span>
                    <span 
                      className="psychic-power-selector__cost"
                      aria-label={`Cost: ${power.cost} points`}
                    >
                      {power.cost} pts
                    </span>
                  </div>
                  <div 
                    className="psychic-power-selector__effect"
                    id={`psychic-power-effect-${power.id}`}
                  >
                    {power.effect}
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Memoize component for performance
export const PsychicPowerSelector = memo(PsychicPowerSelectorComponent);
