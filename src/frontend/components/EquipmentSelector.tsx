import { memo } from 'react';
import { Equipment, WarbandAbility } from '../../backend/models/types';
import { CostEngine } from '../../backend/services/CostEngine';

/**
 * EquipmentSelector Component
 * 
 * Multi-select interface for equipment with limit enforcement.
 * Displays name, cost, and effect for each item.
 * Shows current count vs limit and disables checkboxes when limit reached.
 * Shows modified costs when warband abilities apply.
 * 
 * Equipment limits:
 * - Leader without Cyborgs: 2
 * - Leader with Cyborgs: 3
 * - Trooper without Cyborgs: 1
 * - Trooper with Cyborgs: 2
 * 
 * Requirements: 5.4, 5.7, 5.8, 12.3, 12.6
 */

interface EquipmentSelectorProps {
  selectedEquipment: Equipment[];
  availableEquipment: Equipment[];
  weirdoType: 'leader' | 'trooper';
  warbandAbility: WarbandAbility | null;
  onChange: (equipment: Equipment[]) => void;
  costEngine: CostEngine;
}

const EquipmentSelectorComponent = ({
  selectedEquipment,
  availableEquipment,
  weirdoType,
  warbandAbility,
  onChange,
  costEngine
}: EquipmentSelectorProps) => {
  // Calculate equipment limit based on weirdo type and warband ability
  const getEquipmentLimit = (): number => {
    const isCyborg = warbandAbility === 'Cyborgs';
    
    if (weirdoType === 'leader') {
      return isCyborg ? 3 : 2;
    } else {
      return isCyborg ? 2 : 1;
    }
  };

  const limit = getEquipmentLimit();
  const isLimitReached = selectedEquipment.length >= limit;

  const handleToggle = (equipment: Equipment) => {
    const isSelected = selectedEquipment.some(e => e.id === equipment.id);
    
    if (isSelected) {
      // Remove equipment
      onChange(selectedEquipment.filter(e => e.id !== equipment.id));
    } else {
      // Don't allow adding if limit reached
      if (isLimitReached) {
        return;
      }
      // Add equipment
      onChange([...selectedEquipment, equipment]);
    }
  };

  const getEquipmentCost = (equipment: Equipment): { baseCost: number; modifiedCost: number } => {
    const baseCost = equipment.baseCost;
    const modifiedCost = costEngine.getEquipmentCost(equipment, warbandAbility);
    return { baseCost, modifiedCost };
  };

  const formatCostDisplay = (equipment: Equipment): string => {
    const { baseCost, modifiedCost } = getEquipmentCost(equipment);
    
    if (baseCost !== modifiedCost) {
      // Show modified cost with strikethrough on base cost
      return `${modifiedCost} pts (was ${baseCost} pts)`;
    }
    return `${baseCost} pts`;
  };

  const hasModifiedCost = (equipment: Equipment): boolean => {
    const { baseCost, modifiedCost } = getEquipmentCost(equipment);
    return baseCost !== modifiedCost;
  };

  return (
    <div className="equipment-selector">
      <h4>Equipment</h4>
      <div className="equipment-selector__limit-info">
        Selected: {selectedEquipment.length}/{limit}
      </div>
      <ul className="equipment-selector__list">
        {availableEquipment.map((equipment) => {
          const isSelected = selectedEquipment.some(e => e.id === equipment.id);
          const isDisabled = !isSelected && isLimitReached;
          const isModified = hasModifiedCost(equipment);

          return (
            <li key={equipment.id} className="equipment-selector__item">
              <label className={`equipment-selector__label ${isDisabled ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(equipment)}
                  disabled={isDisabled}
                  className="equipment-selector__checkbox"
                />
                <div className="equipment-selector__content">
                  <div className="equipment-selector__header">
                    <span className="equipment-selector__name">{equipment.name}</span>
                    <span className={`equipment-selector__cost ${isModified ? 'modified' : ''}`}>
                      {formatCostDisplay(equipment)}
                    </span>
                  </div>
                  <div className="equipment-selector__effect">{equipment.effect}</div>
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
export const EquipmentSelector = memo(EquipmentSelectorComponent);
