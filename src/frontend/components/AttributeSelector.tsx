import { memo } from 'react';
import {
  Attributes,
  WarbandAbility,
  SpeedLevel,
  DiceLevel,
  FirepowerLevel
} from '../../backend/models/types';

interface AttributeSelectorProps {
  attributes: Attributes;
  warbandAbility: WarbandAbility | null;
  onAttributeChange: (attribute: keyof Attributes, level: SpeedLevel | DiceLevel | FirepowerLevel) => void;
}

const SPEED_LEVELS: SpeedLevel[] = [1, 2, 3];
const DICE_LEVELS: DiceLevel[] = ['2d6', '2d8', '2d10'];
const FIREPOWER_LEVELS: FirepowerLevel[] = ['None', '2d8', '2d10'];

/**
 * AttributeSelector Component
 * 
 * Displays and edits all five weirdo attributes with cost information.
 * Memoized for performance optimization.
 * 
 * Requirements: 2.1, 2.2, 4.2, 4.3, 4.4, 7.2, 9.4 - React.memo for reusable components
 */
const AttributeSelectorComponent = ({ attributes, warbandAbility, onAttributeChange }: AttributeSelectorProps) => {
  return (
    <div className="form-section">
      <h3>Attributes</h3>
      
      <div className="form-group">
        <label htmlFor="attr-speed">Speed</label>
        <select
          id="attr-speed"
          value={attributes.speed}
          onChange={(e) => onAttributeChange('speed', Number(e.target.value) as SpeedLevel)}
        >
          {SPEED_LEVELS.map(level => {
            const baseCost = level === 1 ? 0 : level === 2 ? 1 : 3;
            const modifiedCost = warbandAbility === 'Mutants' ? Math.max(0, baseCost - 1) : baseCost;
            const costDisplay = warbandAbility === 'Mutants' && baseCost !== modifiedCost
              ? `${level} (${modifiedCost} pts, was ${baseCost} pts)`
              : `${level} (${baseCost} pts)`;
            return (
              <option key={level} value={level}>
                {costDisplay}
              </option>
            );
          })}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="attr-defense">Defense</label>
        <select
          id="attr-defense"
          value={attributes.defense}
          onChange={(e) => onAttributeChange('defense', e.target.value as DiceLevel)}
        >
          {DICE_LEVELS.map(level => {
            const cost = level === '2d6' ? 2 : level === '2d8' ? 4 : 8;
            return (
              <option key={level} value={level}>
                {level} ({cost} pts)
              </option>
            );
          })}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="attr-firepower">Firepower</label>
        <select
          id="attr-firepower"
          value={attributes.firepower}
          onChange={(e) => onAttributeChange('firepower', e.target.value as FirepowerLevel)}
        >
          {FIREPOWER_LEVELS.map(level => {
            const cost = level === 'None' ? 0 : level === '2d8' ? 2 : 4;
            return (
              <option key={level} value={level}>
                {level} ({cost} pts)
              </option>
            );
          })}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="attr-prowess">Prowess</label>
        <select
          id="attr-prowess"
          value={attributes.prowess}
          onChange={(e) => onAttributeChange('prowess', e.target.value as DiceLevel)}
        >
          {DICE_LEVELS.map(level => {
            const cost = level === '2d6' ? 2 : level === '2d8' ? 4 : 6;
            return (
              <option key={level} value={level}>
                {level} ({cost} pts)
              </option>
            );
          })}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="attr-willpower">Willpower</label>
        <select
          id="attr-willpower"
          value={attributes.willpower}
          onChange={(e) => onAttributeChange('willpower', e.target.value as DiceLevel)}
        >
          {DICE_LEVELS.map(level => {
            const cost = level === '2d6' ? 2 : level === '2d8' ? 4 : 6;
            return (
              <option key={level} value={level}>
                {level} ({cost} pts)
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
export const AttributeSelector = memo(AttributeSelectorComponent);
