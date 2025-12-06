import { memo } from 'react';
import { WarbandAbility, ValidationError } from '../../backend/models/types';
import './WarbandEditor.css';

/**
 * WarbandProperties Component
 * 
 * Displays and manages warband-level properties: name, ability, and point limit.
 * Memoized for performance optimization.
 * 
 * Requirements: 4.1, 4.3, 4.4, 9.4 - React.memo for reusable components
 */

interface WarbandPropertiesProps {
  name: string;
  ability: WarbandAbility | null;
  pointLimit: 75 | 125;
  validationErrors: ValidationError[];
  abilityDescriptions: Record<string, string>;
  onNameChange: (name: string) => void;
  onAbilityChange: (ability: WarbandAbility | null) => void;
  onPointLimitChange: (pointLimit: 75 | 125) => void;
}

const WARBAND_ABILITIES: WarbandAbility[] = [
  'Cyborgs',
  'Fanatics',
  'Living Weapons',
  'Heavily Armed',
  'Mutants',
  'Soldiers',
  'Undead'
];

const WarbandPropertiesComponent = ({
  name,
  ability,
  pointLimit,
  validationErrors,
  abilityDescriptions,
  onNameChange,
  onAbilityChange,
  onPointLimitChange
}: WarbandPropertiesProps) => {
  return (
    <div className="warband-properties">
      <h2>Warband Properties</h2>
      
      <div className="form-group">
        <label htmlFor="warband-name">
          Name <span className="required">*</span>
        </label>
        <input
          id="warband-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter warband name"
          className={validationErrors.some(e => e.field === 'name') ? 'error' : ''}
        />
      </div>

      <div className="form-group">
        <label htmlFor="warband-ability">
          Warband Ability
        </label>
        <select
          id="warband-ability"
          value={ability || ''}
          onChange={(e) => onAbilityChange(e.target.value === '' ? null : e.target.value as WarbandAbility)}
        >
          <option value="">No Ability</option>
          {WARBAND_ABILITIES.map(abilityOption => (
            <option key={abilityOption} value={abilityOption} title={abilityDescriptions[abilityOption] || ''}>
              {abilityOption}
            </option>
          ))}
        </select>
        {ability && (
          <p className="ability-description" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            {abilityDescriptions[ability] || 'Loading description...'}
          </p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="point-limit">
          Point Limit <span className="required">*</span>
        </label>
        <select
          id="point-limit"
          value={pointLimit}
          onChange={(e) => onPointLimitChange(Number(e.target.value) as 75 | 125)}
        >
          <option value={75}>75 Points</option>
          <option value={125}>125 Points</option>
        </select>
      </div>
    </div>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const WarbandProperties = memo(WarbandPropertiesComponent);
