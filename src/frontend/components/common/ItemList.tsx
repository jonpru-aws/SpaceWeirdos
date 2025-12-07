import React, { memo } from 'react';
import './ItemList.css';

/**
 * ItemList Component
 * 
 * A reusable checkbox list component for selecting multiple items with descriptions and costs.
 * Supports limit enforcement, modified cost indication, and disabled states.
 * Memoized for performance optimization.
 * 
 * Requirements: 5.3, 5.4, 5.5, 12.2, 12.3, 12.4, 12.6
 */

export interface ItemListItem {
  id: string;
  name: string;
  description?: string;
  baseCost: number;
  modifiedCost?: number;
}

export interface ItemListProps {
  items: ItemListItem[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  limit?: number;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const ItemListComponent = ({
  items,
  selectedIds,
  onChange,
  limit,
  disabled = false,
  className = '',
  'aria-label': ariaLabel
}: ItemListProps) => {
  const handleToggle = (itemId: string) => {
    const isSelected = selectedIds.includes(itemId);
    const isItemDisabled = disabled || (!isSelected && isLimitReached);
    
    if (isItemDisabled) return;
    
    if (isSelected) {
      // Remove from selection
      onChange(selectedIds.filter(id => id !== itemId));
    } else {
      // Add to selection
      onChange([...selectedIds, itemId]);
    }
  };

  const isLimitReached = limit !== undefined && selectedIds.length >= limit;

  const formatCost = (item: ItemListItem): string => {
    const hasModifier = item.modifiedCost !== undefined && item.modifiedCost !== item.baseCost;
    
    if (hasModifier) {
      return `${item.modifiedCost} pts (was ${item.baseCost} pts)`;
    }
    return `${item.baseCost} pts`;
  };

  return (
    <div className={`item-list-container ${className}`}>
      {limit !== undefined && (
        <div className="item-list-limit-info">
          Selected: {selectedIds.length}/{limit}
        </div>
      )}
      <ul 
        className="item-list-checkbox"
        role="list"
        aria-label={ariaLabel}
      >
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isDisabled = disabled || (!isSelected && isLimitReached);
          const hasModifier = item.modifiedCost !== undefined && item.modifiedCost !== item.baseCost;

          return (
            <li key={item.id} className="item-list-checkbox-item">
              <label className={`item-checkbox-label ${isDisabled ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(item.id)}
                  disabled={isDisabled}
                  className="item-checkbox-input"
                />
                <div className="item-checkbox-content">
                  <div className="item-checkbox-header">
                    <span className="item-name">{item.name}</span>
                    <span className={`item-cost ${hasModifier ? 'modified' : ''}`}>
                      {hasModifier && (
                        <span className="item-cost-original">{item.baseCost} pts</span>
                      )}
                      <span className="item-cost-current">{item.modifiedCost ?? item.baseCost} pts</span>
                    </span>
                  </div>
                  {item.description && (
                    <div className="item-description">{item.description}</div>
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
export const ItemList = memo(ItemListComponent);
