import { memo } from 'react';
import { SelectWithCost, SelectOption } from './common/SelectWithCost';
import { 
  AttributeType, 
  SpeedLevel, 
  DiceLevel, 
  FirepowerLevel,
  WarbandAbility 
} from '../../backend/models/types';

/**
 * AttributeSelector Component
 * 
 * Dropdown selector for weirdo attributes with cost display.
 * Shows base cost for each attribute level.
 * Total cost (including warband ability modifications) is calculated by the API.
 * Supports all five attributes: Speed, Defense, Firepower, Prowess, Willpower.
 * 
 * Requirements: 5.2, 12.1, 9.2, 9.6
 */

export interface AttributeSelectorProps {
  attribute: AttributeType;
  value: SpeedLevel | DiceLevel | FirepowerLevel;
  onChange: (value: SpeedLevel | DiceLevel | FirepowerLevel) => void;
  warbandAbility: WarbandAbility | null;
  disabled?: boolean;
}

// Define available levels for each attribute type
// Type assertions needed: TypeScript cannot infer the specific union types from array literals
// These are safe because the values match the exact types defined in the type system
const ATTRIBUTE_LEVELS = {
  speed: [1, 2, 3] as SpeedLevel[],
  // Type assertion safe: array contains only valid DiceLevel values
  defense: ['2d6', '2d8', '2d10'] as DiceLevel[],
  // Type assertion safe: array contains only valid FirepowerLevel values
  firepower: ['None', '2d8', '2d10'] as FirepowerLevel[],
  // Type assertion safe: array contains only valid DiceLevel values
  prowess: ['2d6', '2d8', '2d10'] as DiceLevel[],
  // Type assertion safe: array contains only valid DiceLevel values
  willpower: ['2d6', '2d8', '2d10'] as DiceLevel[]
};

// Base costs for each attribute level (from game rules)
// These are display-only; actual costs (including modifications) are calculated by the API
const ATTRIBUTE_BASE_COSTS: Record<AttributeType, Record<string, number>> = {
  speed: { '1': 0, '2': 1, '3': 2 },
  defense: { '2d6': 0, '2d8': 1, '2d10': 2 },
  firepower: { 'None': 0, '2d8': 1, '2d10': 2 },
  prowess: { '2d6': 0, '2d8': 1, '2d10': 2 },
  willpower: { '2d6': 0, '2d8': 1, '2d10': 2 }
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
  disabled = false
}: AttributeSelectorProps) => {
  // Get available levels for this attribute
  const levels = ATTRIBUTE_LEVELS[attribute];

  // Build options with base cost information
  // Modified costs are calculated by the API and reflected in the total cost
  const options: SelectOption[] = levels.map((level) => {
    const baseCost = ATTRIBUTE_BASE_COSTS[attribute][String(level)];

    return {
      value: String(level),
      label: String(level),
      baseCost,
      modifiedCost: undefined // API calculates total cost including modifications
    };
  });

  const handleChange = (newValue: string) => {
    // Parse the value back to the appropriate type
    // Type assertions safe: newValue comes from ATTRIBUTE_LEVELS which contains only valid values
    if (attribute === 'speed') {
      onChange(parseInt(newValue) as SpeedLevel);
    } else if (attribute === 'firepower') {
      // Type assertion safe: newValue is from ATTRIBUTE_LEVELS.firepower which contains only valid FirepowerLevel values
      onChange(newValue as FirepowerLevel);
    } else {
      // Type assertion safe: newValue is from ATTRIBUTE_LEVELS which contains only valid DiceLevel values
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
