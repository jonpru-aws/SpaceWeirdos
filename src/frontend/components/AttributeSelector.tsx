import { memo } from 'react';
import { SelectWithCost, SelectOption } from './common/SelectWithCost';
import { 
  AttributeType, 
  SpeedLevel, 
  DiceLevel, 
  FirepowerLevel,
  WarbandAbility 
} from '../../backend/models/types';
import { CostEngine } from '../../backend/services/CostEngine';

/**
 * AttributeSelector Component
 * 
 * Dropdown selector for weirdo attributes with cost display.
 * Shows base cost and modified cost when warband ability applies.
 * Supports all five attributes: Speed, Defense, Firepower, Prowess, Willpower.
 * 
 * Requirements: 5.2, 12.1
 */

export interface AttributeSelectorProps {
  attribute: AttributeType;
  value: SpeedLevel | DiceLevel | FirepowerLevel;
  onChange: (value: SpeedLevel | DiceLevel | FirepowerLevel) => void;
  warbandAbility: WarbandAbility | null;
  costEngine: CostEngine;
  disabled?: boolean;
}

// Define available levels for each attribute type
// Type assertions needed: TypeScript cannot infer the specific union types from array literals
// These are safe because the values match the exact types defined in the type system
const ATTRIBUTE_LEVELS = {
  speed: [1, 2, 3] as SpeedLevel[],
  defense: ['2d6', '2d8', '2d10'] as DiceLevel[],
  firepower: ['None', '2d8', '2d10'] as FirepowerLevel[],
  prowess: ['2d6', '2d8', '2d10'] as DiceLevel[],
  willpower: ['2d6', '2d8', '2d10'] as DiceLevel[]
};

// Attribute display names
const ATTRIBUTE_LABELS: Record<AttributeType, string> = {
  speed: 'Speed',
  defense: 'Defense',
  firepower: 'Firepower',
  prowess: 'Prowess',
  willpower: 'Willpower'
};

const AttributeSelectorComponent = ({
  attribute,
  value,
  onChange,
  warbandAbility,
  costEngine,
  disabled = false
}: AttributeSelectorProps) => {
  // Get available levels for this attribute
  const levels = ATTRIBUTE_LEVELS[attribute];

  // Build options with cost information
  const options: SelectOption[] = levels.map((level) => {
    const baseCost = costEngine.getAttributeCost(attribute, level, null);
    const modifiedCost = costEngine.getAttributeCost(attribute, level, warbandAbility);

    return {
      value: String(level),
      label: String(level),
      baseCost,
      modifiedCost: modifiedCost !== baseCost ? modifiedCost : undefined
    };
  });

  const handleChange = (newValue: string) => {
    // Parse the value back to the appropriate type
    if (attribute === 'speed') {
      onChange(parseInt(newValue) as SpeedLevel);
    } else if (attribute === 'firepower') {
      onChange(newValue as FirepowerLevel);
    } else {
      onChange(newValue as DiceLevel);
    }
  };

  return (
    <SelectWithCost
      id={`attribute-${attribute}`}
      label={ATTRIBUTE_LABELS[attribute]}
      value={String(value)}
      options={options}
      onChange={handleChange}
      disabled={disabled}
      required
    />
  );
};

// Memoize component for performance
export const AttributeSelector = memo(AttributeSelectorComponent);
