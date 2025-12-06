import { memo } from 'react';
import { Equipment, WarbandAbility } from '../../backend/models/types';

interface EquipmentSelectorProps {
  equipment: Equipment[];
  availableEquipment: Equipment[];
  maxEquipment: number;
  warbandAbility: WarbandAbility | null;
  onAddEquipment: (equipment: Equipment) => void;
  onRemoveEquipment: (equipmentId: string) => void;
}

/**
 * EquipmentSelector Component
 * 
 * Displays and manages equipment with limit tracking.
 * Memoized for performance optimization.
 * 
 * Requirements: 4.1, 4.2, 4.4, 4.2, 4.3, 4.4, 7.5, 7.6, 9.4 - React.memo for reusable components
 */
const EquipmentSelectorComponent = ({
  equipment,
  availableEquipment,
  maxEquipment,
  warbandAbility,
  onAddEquipment,
  onRemoveEquipment
}: EquipmentSelectorProps) => {
  return (
    <div className="form-section">
      <h3>Equipment (Max: {maxEquipment})</h3>
      
      {equipment.length > 0 ? (
        <ul className="item-list">
          {equipment.map((equip, index) => (
            <li key={`${equip.id}-${index}`} className="item">
              <span className="item-name">
                {equip.name}
                {equip.effect && <span className="item-description"> - {equip.effect}</span>}
              </span>
              <span className="item-cost">{equip.baseCost} pts</span>
              <button
                onClick={() => onRemoveEquipment(equip.id)}
                className="remove-item-button"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">No equipment selected</p>
      )}

      <div className="form-group">
        <label htmlFor="add-equipment">Add Equipment</label>
        <select
          id="add-equipment"
          onChange={(e) => {
            const equip = availableEquipment.find(eq => eq.id === e.target.value);
            if (equip) {
              onAddEquipment(equip);
              e.target.value = '';
            }
          }}
          defaultValue=""
          disabled={equipment.length >= maxEquipment}
        >
          <option value="" disabled>
            {equipment.length >= maxEquipment 
              ? 'Equipment limit reached' 
              : 'Select equipment...'}
          </option>
          {availableEquipment.map(equip => {
            const isSoldierEquipment = ['grenade', 'heavy-armor', 'medkit'].includes(equip.id);
            const modifiedCost = warbandAbility === 'Soldiers' && isSoldierEquipment
              ? 0
              : equip.baseCost;
            const costDisplay = warbandAbility === 'Soldiers' && isSoldierEquipment && equip.baseCost !== modifiedCost
              ? `${modifiedCost} pts, was ${equip.baseCost} pts`
              : `${modifiedCost} pts`;
            const displayText = `${equip.name} (${costDisplay}) - ${equip.effect}`;
            return (
              <option key={equip.id} value={equip.id}>
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
export const EquipmentSelector = memo(EquipmentSelectorComponent);
