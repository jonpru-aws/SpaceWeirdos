import { memo } from 'react';
import { Weapon, WarbandAbility, FirepowerLevel } from '../../backend/models/types';

interface WeaponSelectorProps {
  closeCombatWeapons: Weapon[];
  rangedWeapons: Weapon[];
  availableCloseCombatWeapons: Weapon[];
  availableRangedWeapons: Weapon[];
  firepower: FirepowerLevel;
  warbandAbility: WarbandAbility | null;
  onAddWeapon: (weapon: Weapon, weaponType: 'close' | 'ranged') => void;
  onRemoveWeapon: (weaponId: string, weaponType: 'close' | 'ranged') => void;
}

/**
 * WeaponSelector Component
 * 
 * Displays and manages close combat and ranged weapons.
 * Memoized for performance optimization.
 * 
 * Requirements: 3.1, 3.2, 3.3, 4.2, 4.3, 4.4, 7.3, 7.4, 9.4 - React.memo for reusable components
 */
const WeaponSelectorComponent = ({
  closeCombatWeapons,
  rangedWeapons,
  availableCloseCombatWeapons,
  availableRangedWeapons,
  firepower,
  warbandAbility,
  onAddWeapon,
  onRemoveWeapon
}: WeaponSelectorProps) => {
  return (
    <>
      {/* Close Combat Weapons */}
      <div className="form-section">
        <h3>Close Combat Weapons</h3>
        
        {closeCombatWeapons.length > 0 ? (
          <ul className="item-list">
            {closeCombatWeapons.map((weapon, index) => (
              <li key={`${weapon.id}-${index}`} className="item">
                <span className="item-name">
                  {weapon.name}
                  {weapon.notes && <span className="item-description"> - {weapon.notes}</span>}
                </span>
                <span className="item-cost">{weapon.baseCost} pts</span>
                <button
                  onClick={() => onRemoveWeapon(weapon.id, 'close')}
                  className="remove-item-button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No close combat weapons selected</p>
        )}

        <div className="form-group">
          <label htmlFor="add-cc-weapon">Add Weapon</label>
          <select
            id="add-cc-weapon"
            onChange={(e) => {
              const weapon = availableCloseCombatWeapons.find(w => w.id === e.target.value);
              if (weapon) {
                onAddWeapon(weapon, 'close');
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>Select a weapon...</option>
            {availableCloseCombatWeapons.map(weapon => {
              const isMutantWeapon = ['claws-teeth', 'horrible-claws-teeth', 'whip-tail'].includes(weapon.id);
              const modifiedCost = warbandAbility === 'Mutants' && isMutantWeapon
                ? Math.max(0, weapon.baseCost - 1)
                : weapon.baseCost;
              const costDisplay = warbandAbility === 'Mutants' && isMutantWeapon && weapon.baseCost !== modifiedCost
                ? `${modifiedCost} pts, was ${weapon.baseCost} pts`
                : `${modifiedCost} pts`;
              const displayText = weapon.notes
                ? `${weapon.name} (${costDisplay}) - ${weapon.notes}`
                : `${weapon.name} (${costDisplay})`;
              return (
                <option key={weapon.id} value={weapon.id}>
                  {displayText}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Ranged Weapons */}
      <div className="form-section">
        <h3>Ranged Weapons</h3>
        
        {firepower === 'None' && (
          <p className="warning-message">
            ⚠ Firepower level 2d8 or 2d10 required to use ranged weapons
          </p>
        )}
        
        {rangedWeapons.length > 0 ? (
          <ul className="item-list">
            {rangedWeapons.map((weapon, index) => (
              <li key={`${weapon.id}-${index}`} className="item">
                <span className="item-name">
                  {weapon.name}
                  {weapon.notes && <span className="item-description"> - {weapon.notes}</span>}
                </span>
                <span className="item-cost">{weapon.baseCost} pts</span>
                <button
                  onClick={() => onRemoveWeapon(weapon.id, 'ranged')}
                  className="remove-item-button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No ranged weapons selected</p>
        )}

        <div className="form-group">
          <label htmlFor="add-ranged-weapon">Add Weapon</label>
          <select
            id="add-ranged-weapon"
            onChange={(e) => {
              const weapon = availableRangedWeapons.find(w => w.id === e.target.value);
              if (weapon) {
                onAddWeapon(weapon, 'ranged');
                e.target.value = '';
              }
            }}
            defaultValue=""
            disabled={firepower === 'None'}
          >
            <option value="" disabled>
              {firepower === 'None'
                ? 'Firepower 2d8 or 2d10 required'
                : 'Select a weapon...'}
            </option>
            {availableRangedWeapons.map(weapon => {
              const modifiedCost = warbandAbility === 'Heavily Armed'
                ? Math.max(0, weapon.baseCost - 1)
                : weapon.baseCost;
              const costDisplay = warbandAbility === 'Heavily Armed' && weapon.baseCost !== modifiedCost
                ? `${modifiedCost} pts, was ${weapon.baseCost} pts`
                : `${modifiedCost} pts`;
              const displayText = weapon.notes
                ? `${weapon.name} (${costDisplay}) - ${weapon.notes}`
                : `${weapon.name} (${costDisplay})`;
              return (
                <option key={weapon.id} value={weapon.id}>
                  {displayText}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const WeaponSelector = memo(WeaponSelectorComponent);
