import { memo } from 'react';
import { Weapon, WarbandAbility } from '../../backend/models/types';
import { CostEngine } from '../../backend/services/CostEngine';
import './WeaponSelector.css';

/**
 * WeaponSelector Component
 * 
 * Multi-select interface for weapons with cost and notes display.
 * Supports both close combat and ranged weapons.
 * Shows modified costs when warband abilities apply.
 * Can be disabled (e.g., ranged weapons when Firepower is None).
 * 
 * Requirements: 5.3, 5.7, 5.8, 12.2, 12.7
 */

interface WeaponSelectorProps {
  type: 'close-combat' | 'ranged';
  selectedWeapons: Weapon[];
  availableWeapons: Weapon[];
  warbandAbility: WarbandAbility | null;
  onChange: (weapons: Weapon[]) => void;
  disabled?: boolean;
  costEngine: CostEngine;
}

const WeaponSelectorComponent = ({
  type,
  selectedWeapons,
  availableWeapons,
  warbandAbility,
  onChange,
  disabled = false,
  costEngine
}: WeaponSelectorProps) => {
  const handleToggle = (weapon: Weapon) => {
    // Don't allow changes when disabled
    if (disabled) {
      return;
    }
    
    const isSelected = selectedWeapons.some(w => w.id === weapon.id);
    
    if (isSelected) {
      // Remove weapon
      onChange(selectedWeapons.filter(w => w.id !== weapon.id));
    } else {
      // Add weapon
      onChange([...selectedWeapons, weapon]);
    }
  };

  const getWeaponCost = (weapon: Weapon): { baseCost: number; modifiedCost: number } => {
    const baseCost = weapon.baseCost;
    const modifiedCost = costEngine.getWeaponCost(weapon, warbandAbility);
    return { baseCost, modifiedCost };
  };

  const formatCostDisplay = (weapon: Weapon): string => {
    const { baseCost, modifiedCost } = getWeaponCost(weapon);
    
    if (baseCost !== modifiedCost) {
      // Show modified cost with strikethrough on base cost
      return `${modifiedCost} pts (was ${baseCost} pts)`;
    }
    return `${baseCost} pts`;
  };

  const hasModifiedCost = (weapon: Weapon): boolean => {
    const { baseCost, modifiedCost } = getWeaponCost(weapon);
    return baseCost !== modifiedCost;
  };

  const title = type === 'close-combat' ? 'Close Combat Weapons' : 'Ranged Weapons';
  const sectionId = `weapon-selector-${type}`;

  return (
    <div className="weapon-selector" role="group" aria-labelledby={`${sectionId}-heading`}>
      <h4 id={`${sectionId}-heading`}>{title}</h4>
      {disabled && (
        <p className="weapon-selector__disabled-message" role="alert">
          Ranged weapons are disabled when Firepower is None
        </p>
      )}
      <ul className="weapon-selector__list" role="list">
        {availableWeapons.map((weapon) => {
          const isSelected = selectedWeapons.some(w => w.id === weapon.id);
          const isModified = hasModifiedCost(weapon);

          return (
            <li key={weapon.id} className="weapon-selector__item" role="listitem">
              <label 
                className={`weapon-selector__label ${disabled ? 'disabled' : ''}`}
                htmlFor={`weapon-${weapon.id}`}
              >
                <input
                  type="checkbox"
                  id={`weapon-${weapon.id}`}
                  checked={isSelected}
                  onChange={() => handleToggle(weapon)}
                  disabled={disabled}
                  className="weapon-selector__checkbox checkbox"
                  aria-describedby={weapon.notes ? `weapon-notes-${weapon.id}` : undefined}
                />
                <div className="weapon-selector__content">
                  <div className="weapon-selector__header">
                    <span className="weapon-selector__name">{weapon.name}</span>
                    <span 
                      className={`weapon-selector__cost ${isModified ? 'modified' : ''}`}
                      aria-label={`Cost: ${formatCostDisplay(weapon)}`}
                    >
                      {formatCostDisplay(weapon)}
                    </span>
                  </div>
                  {weapon.notes && (
                    <div 
                      className="weapon-selector__notes" 
                      id={`weapon-notes-${weapon.id}`}
                    >
                      {weapon.notes}
                    </div>
                  )}
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
export const WeaponSelector = memo(WeaponSelectorComponent);
