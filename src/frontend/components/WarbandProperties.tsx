import { useWarband } from '../contexts/WarbandContext';
import { WarbandAbility } from '../../backend/models/types';

/**
 * WarbandProperties Component
 * 
 * Edits warband-level settings:
 * - Warband name (text input with validation)
 * - Point limit (radio buttons: 75 or 125)
 * - Warband ability (dropdown with descriptions)
 * 
 * Displays validation errors inline.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 5.1
 */

// Warband ability options with descriptions
const WARBAND_ABILITIES: Array<{ value: WarbandAbility | null; label: string; description: string }> = [
  { value: null, label: 'None', description: 'No special ability' },
  { value: 'Cyborgs', label: 'Cyborgs', description: 'All members can purchase 1 additional equipment option' },
  { value: 'Fanatics', label: 'Fanatics', description: 'Roll Willpower with +1DT for all rolls except Psychic Powers' },
  { value: 'Living Weapons', label: 'Living Weapons', description: 'Unarmed attacks do not have -1DT to Prowess rolls' },
  { value: 'Heavily Armed', label: 'Heavily Armed', description: 'All Ranged weapons are 1 less Points Cost' },
  { value: 'Mutants', label: 'Mutants', description: 'Speed, Claws & Teeth, Horrible Claws & Teeth, and Whip/Tail cost 1 less Points Cost' },
  { value: 'Soldiers', label: 'Soldiers', description: 'Grenades, Heavy Armor, and Medkits may be selected at 0 Points Cost' },
  { value: 'Undead', label: 'Undead', description: 'A second staggered condition does not take weirdos out of action' },
];

export function WarbandProperties() {
  const { currentWarband, updateWarband, validationErrors } = useWarband();

  if (!currentWarband) {
    return null;
  }

  // Get validation errors for warband name
  // Errors are stored under 'warband' key for warband-level validation
  const warbandErrors = validationErrors.get('warband') || [];
  const nameErrors = warbandErrors.filter(error => 
    error.field === 'warband.name' || error.field === 'name'
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateWarband({ name: e.target.value });
  };

  const handlePointLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Type assertion is safe: radio input values are constrained to "75" or "125" in JSX
    const pointLimit = parseInt(e.target.value) as 75 | 125;
    updateWarband({ pointLimit });
  };

  const handleAbilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Type assertion is safe: select options are constrained to valid WarbandAbility values in JSX
    const ability = e.target.value === 'null' ? null : (e.target.value as WarbandAbility);
    updateWarband({ ability });
  };

  return (
    <div className="warband-properties">
      {/* Warband Name Input (Requirements 1.1, 1.2, 1.6) */}
      <div className="warband-properties__field">
        <label htmlFor="warband-name">
          Warband Name <span className="required">*</span>
        </label>
        <input
          id="warband-name"
          type="text"
          value={currentWarband.name}
          onChange={handleNameChange}
          placeholder="Enter warband name"
          aria-invalid={nameErrors.length > 0}
          aria-describedby={nameErrors.length > 0 ? 'warband-name-error' : undefined}
        />
        {/* Display validation errors inline (Requirement 1.6) */}
        {nameErrors.length > 0 && (
          <div id="warband-name-error" className="warband-properties__error" role="alert">
            {nameErrors[0].message}
          </div>
        )}
      </div>

      {/* Point Limit Radio Buttons (Requirement 1.3) */}
      <div className="warband-properties__field">
        <fieldset>
          <legend>Point Limit <span className="required">*</span></legend>
          <div className="warband-properties__radio-group">
            <label>
              <input
                type="radio"
                name="point-limit"
                value="75"
                checked={currentWarband.pointLimit === 75}
                onChange={handlePointLimitChange}
              />
              <span>75 Points</span>
            </label>
            <label>
              <input
                type="radio"
                name="point-limit"
                value="125"
                checked={currentWarband.pointLimit === 125}
                onChange={handlePointLimitChange}
              />
              <span>125 Points</span>
            </label>
          </div>
        </fieldset>
      </div>

      {/* Warband Ability Dropdown (Requirements 1.5, 5.1) */}
      <div className="warband-properties__field">
        <label htmlFor="warband-ability">Warband Ability</label>
        <select
          id="warband-ability"
          value={currentWarband.ability || 'null'}
          onChange={handleAbilityChange}
        >
          {WARBAND_ABILITIES.map(ability => (
            <option key={ability.label} value={ability.value || 'null'}>
              {ability.label}
            </option>
          ))}
        </select>
        {/* Display description for selected ability (Requirement 5.1) */}
        {currentWarband.ability && (
          <div className="warband-properties__ability-description">
            {WARBAND_ABILITIES.find(a => a.value === currentWarband.ability)?.description}
          </div>
        )}
      </div>
    </div>
  );
}
