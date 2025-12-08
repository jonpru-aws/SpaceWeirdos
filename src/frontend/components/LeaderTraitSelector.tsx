import { memo } from 'react';
import { LeaderTrait } from '../../backend/models/types';
import './LeaderTraitSelector.css';

/**
 * LeaderTraitSelector Component
 * 
 * Dropdown selector for leader traits.
 * Includes "None" option for no trait selection.
 * Displays description for each trait.
 * Only rendered for leaders.
 * 
 * Requirements: 5.6, 12.5
 */

interface LeaderTraitData {
  id: string;
  name: LeaderTrait;
  description: string;
}

interface LeaderTraitSelectorProps {
  selectedTrait: LeaderTrait | null;
  availableTraits: LeaderTraitData[];
  onChange: (trait: LeaderTrait | null) => void;
  weirdoType: 'leader' | 'trooper';
}

const LeaderTraitSelectorComponent = ({
  selectedTrait,
  availableTraits,
  onChange,
  weirdoType
}: LeaderTraitSelectorProps) => {
  // Only render for leaders
  if (weirdoType !== 'leader') {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      onChange(null);
    } else {
      // Type assertion is safe: select options are constrained to valid LeaderTrait values in JSX
      onChange(value as LeaderTrait);
    }
  };

  return (
    <div className="leader-trait-selector" role="group" aria-labelledby="leader-trait-label">
      <label 
        htmlFor="leader-trait" 
        id="leader-trait-label"
        className="leader-trait-selector__label"
      >
        Leader Trait
      </label>
      <select
        id="leader-trait"
        value={selectedTrait || ''}
        onChange={handleChange}
        className="leader-trait-selector__select select"
        aria-label="Select leader trait"
      >
        <option value="">None</option>
        {availableTraits.map((trait) => (
          <option key={trait.id} value={trait.name}>
            {trait.name} - {trait.description}
          </option>
        ))}
      </select>
    </div>
  );
};

// Memoize component for performance
export const LeaderTraitSelector = memo(LeaderTraitSelectorComponent);
