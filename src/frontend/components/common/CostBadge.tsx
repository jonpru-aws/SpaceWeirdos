import { memo } from 'react';
import './CostBadge.css';

/**
 * CostBadge Component
 * 
 * Displays cost information with support for modified costs.
 * Shows base cost with strikethrough when a modifier is applied.
 * Memoized for performance optimization.
 * 
 * Requirements: 3.7, 5.7, 5.8
 */

export interface CostBadgeProps {
  baseCost: number;
  modifiedCost?: number;
  className?: string;
}

const CostBadgeComponent = ({
  baseCost,
  modifiedCost,
  className = ''
}: CostBadgeProps) => {
  const hasModifier = modifiedCost !== undefined && modifiedCost !== baseCost;

  // Build ARIA label for accessibility
  const ariaLabel = hasModifier
    ? `Cost: ${modifiedCost} points, reduced from ${baseCost} points`
    : `Cost: ${baseCost} points`;

  return (
    <div 
      className={`cost-badge ${hasModifier ? 'modified' : ''} ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      {hasModifier ? (
        <>
          <span className="cost-badge-original" aria-hidden="true">{baseCost} pts</span>
          <span className="cost-badge-arrow" aria-hidden="true">→</span>
          <span className="cost-badge-current" aria-hidden="true">{modifiedCost} pts</span>
        </>
      ) : (
        <span className="cost-badge-single" aria-hidden="true">{baseCost} pts</span>
      )}
    </div>
  );
};

// Memoize component for performance
export const CostBadge = memo(CostBadgeComponent);
