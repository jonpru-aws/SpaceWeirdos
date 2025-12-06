import React, { memo } from 'react';
import './ItemList.css';

/**
 * ItemList Component
 * 
 * A reusable component for rendering lists of items with add/remove functionality.
 * Provides consistent styling and behavior for item lists throughout the application.
 * Memoized for performance optimization.
 * 
 * Requirements: 5.2, 9.4 - React.memo for reusable components
 */

export interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onRemove: (item: T, index: number) => void;
  emptyMessage: string;
  className?: string;
  'aria-label'?: string;
}

const ItemListComponent = <T,>({
  items,
  renderItem,
  onRemove,
  emptyMessage,
  className = '',
  'aria-label': ariaLabel
}: ItemListProps<T>) => {
  if (items.length === 0) {
    return (
      <div className={`item-list-empty ${className}`}>
        <p className="empty-message">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul 
      className={`item-list ${className}`}
      role="list"
      aria-label={ariaLabel}
    >
      {items.map((item, index) => (
        <li key={index} className="item-list-item">
          <div className="item-content">
            {renderItem(item, index)}
          </div>
          <button
            type="button"
            className="item-remove-button"
            onClick={() => onRemove(item, index)}
            aria-label={`Remove item ${index + 1}`}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const ItemList = memo(ItemListComponent) as typeof ItemListComponent;
