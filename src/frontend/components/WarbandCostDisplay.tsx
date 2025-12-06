import { memo } from 'react';
import './WarbandEditor.css';

/**
 * WarbandCostDisplay Component
 * 
 * Displays the total cost of the warband with warnings when approaching or exceeding the point limit.
 * Memoized for performance optimization.
 * 
 * Requirements: 4.1, 4.3, 4.4, 9.4 - React.memo for reusable components
 */

interface WarbandCostDisplayProps {
  totalCost: number;
  pointLimit: number;
  approaching: boolean;
  exceeds: boolean;
}

const WarbandCostDisplayComponent = ({
  totalCost,
  pointLimit,
  approaching,
  exceeds
}: WarbandCostDisplayProps) => {
  return (
    <div 
      className={`cost-display ${approaching && !exceeds ? 'warning' : ''} ${exceeds ? 'error' : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="cost-label">Total Cost:</div>
      <div 
        className={`cost-value ${approaching ? 'warning' : ''} ${exceeds ? 'error' : ''}`}
        aria-label={`${totalCost} points used out of ${pointLimit} points limit`}
      >
        {totalCost} / {pointLimit}
      </div>
      {approaching && !exceeds && (
        <div className="cost-warning" role="alert">
          Approaching point limit
        </div>
      )}
      {exceeds && (
        <div className="cost-error" role="alert">
          Exceeds point limit!
        </div>
      )}
    </div>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const WarbandCostDisplay = memo(WarbandCostDisplayComponent);
