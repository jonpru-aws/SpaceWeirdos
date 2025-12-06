import React, { memo } from 'react';
import './SelectWithCost.css';

/**
 * SelectWithCost Component
 * 
 * A reusable select dropdown that displays cost information for each option.
 * Supports ability modifiers that can change the displayed cost.
 * Memoized for performance optimization.
 * 
 * Requirements: 5.1, 9.4 - React.memo for reusable components
 */

export interface SelectOption {
  value: string;
  label: string;
  baseCost: number;
  modifiedCost?: number;
  description?: string;
}

export interface SelectWithCostProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const SelectWithCostComponent = ({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  placeholder = 'Select an option...',
  className = ''
}: SelectWithCostProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const formatOptionText = (option: SelectOption): string => {
    const hasModifier = option.modifiedCost !== undefined && option.modifiedCost !== option.baseCost;
    
    let costDisplay: string;
    if (hasModifier) {
      costDisplay = `${option.modifiedCost} pts, was ${option.baseCost} pts`;
    } else {
      costDisplay = `${option.baseCost} pts`;
    }

    let text = `${option.label} (${costDisplay})`;
    
    if (option.description) {
      text += ` - ${option.description}`;
    }

    return text;
  };

  return (
    <div className={`select-with-cost ${className}`}>
      <label htmlFor={id} className="select-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="select-input"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {formatOptionText(option)}
          </option>
        ))}
      </select>
    </div>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const SelectWithCost = memo(SelectWithCostComponent);
