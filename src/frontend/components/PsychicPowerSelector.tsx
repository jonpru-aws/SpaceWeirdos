import { memo } from 'react';
import { PsychicPower } from '../../backend/models/types';

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
    <div className="psychic-power-selector">
      <h4>Psychic Powers</h4>
      <ul className="psychic-power-selector__list">
        {availablePowers.map((power) => {
          const isSelected = selectedPowers.some(p => p.id === power.id);

          return (
            <li key={power.id} className="psychic-power-selector__item">
              <label className="psychic-power-selector__label">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(power)}
                  className="psychic-power-selector__checkbox"
                />
                <div className="psychic-power-selector__content">
                  <div className="psychic-power-selector__header">
                    <span className="psychic-power-selector__name">{power.name}</span>
                    <span className="psychic-power-selector__cost">{power.cost} pts</span>
                  </div>
                  <div className="psychic-power-selector__effect">{power.effect}</div>
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
