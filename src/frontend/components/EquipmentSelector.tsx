import { memo } from 'react';
import type { Equipment, WarbandAbility } from '../../backend/models/types';
import { useItemCost } from '../hooks/useItemCost';
import './EquipmentSelector.css';

/**
 * EquipmentSelector Component
 * 
 * Multi-select interface for equipment with limit enforcement.
 * Displays name, cost (with warband ability modifiers applied), and effect for each item.
 * Shows current count vs limit and disables checkboxes when limit reached.
 * Applies warband ability cost modifiers (e.g., Soldiers makes certain equipment free).
 * 
 * Equipment limits:
 * - Leader without Cyborgs: 2
 * - Leader with Cyborgs: 3
 * - Trooper without Cyborgs: 1
 * - Trooper with Cyborgs: 3
 * 
 * Requirements: 5.4, 5.7, 5.8, 12.3, 12.6, 9.2, 9.6, 1.2, 1.4, 2.2
 */

interface EquipmentSelectorProps {
  selectedEquipment: Equipment[];
  availableEquipment: Equipment[];
  weirdoType: 'leader' | 'trooper';
  warbandAbility: WarbandAbility | null;
  onChange: (equipment: Equipment[]) => void;
}

/**
 * EquipmentItem Component
 * 
 * Individual equipment item that uses useItemCost hook for API-based cost calculation
 */
interface EquipmentItemProps {
  equipment: Equipment;
  isSelected: boolean;
  warbandAbility: WarbandAbility | null;
  onToggle: (equipment: Equipment) => void;
  disabled: boolean;
}

const EquipmentItem = memo(({
  equipment,
  isSelected,
  warbandAbility,
  onToggle,
  disabled
}: EquipmentItemProps) => {
  // Use the useItemCost hook to get cost from API
  const { cost, isLoading, error } = useItemCost({
    itemType: 'equipment',
    itemName: equipment.name,
    warbandAbility,
  });

  const formatCostDisplay = (): string => {
    if (isLoading) {
      return '... pts';
    }
    if (error) {
      return '? pts';
    }
    return `${cost} pts`;
  };

  return (
    <li className="equipment-selector__item" role="listitem">
      <label 
        className={`equipment-selector__label ${disabled ? 'disabled' : ''}`}
        htmlFor={`equipment-${equipment.id}`}
      >
        <input
          type="checkbox"
          id={`equipment-${equipment.id}`}
          checked={isSelected}
          onChange={() => onToggle(equipment)}
          disabled={disabled}
          className="equipment-selector__checkbox checkbox"
          aria-describedby={`equipment-effect-${equipment.id}`}
          aria-label={`${equipment.name}, ${formatCostDisplay()}`}
        />
        <div className="equipment-selector__content">
          <div className="equipment-selector__header">
            <span className="equipment-selector__name">{equipment.name}</span>
            <span 
              className="equipment-selector__cost"
              aria-label={`Cost: ${formatCostDisplay()}`}
              data-loading={isLoading}
              data-error={error !== null}
            >
              {formatCostDisplay()}
            </span>
          </div>
          <div 
            className="equipment-selector__effect" 
            id={`equipment-effect-${equipment.id}`}
          >
            {equipment.effect}
          </div>
        </div>
      </label>
    </li>
  );
});

EquipmentItem.displayName = 'EquipmentItem';

const EquipmentSelectorComponent = ({
  selectedEquipment,
  availableEquipment,
  weirdoType,
  warbandAbility,
  onChange
}: EquipmentSelectorProps) => {
  // Calculate equipment limit based on weirdo type and warband ability
  const getEquipmentLimit = (): number => {
    const isCyborg = warbandAbility === 'Cyborgs';
    
    if (weirdoType === 'leader') {
      return isCyborg ? 3 : 2;
    } else {
      return isCyborg ? 3 : 1;
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

  return (
    <div className="equipment-selector" role="group" aria-labelledby="equipment-heading">
      <h4 id="equipment-heading">Equipment</h4>
      <div 
        className="equipment-selector__limit-info" 
        role="status" 
        aria-live="polite"
        aria-label={`Equipment limit: ${selectedEquipment.length} of ${limit} selected`}
      >
        Selected: {selectedEquipment.length}/{limit}
      </div>
      <ul className="equipment-selector__list" role="list">
        {availableEquipment.map((equipment) => {
          const isSelected = selectedEquipment.some(e => e.id === equipment.id);
          const isDisabled = !isSelected && isLimitReached;

          return (
            <EquipmentItem
              key={equipment.id}
              equipment={equipment}
              isSelected={isSelected}
              warbandAbility={warbandAbility}
              onToggle={handleToggle}
              disabled={isDisabled}
            />
          );
        })}
      </ul>
    </div>
  );
};

// Memoize component for performance
export const EquipmentSelector = memo(EquipmentSelectorComponent);