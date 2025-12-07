import React, { memo } from 'react';
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
  showLabel?: boolean;
}

const CostBadgeComponent = ({
  baseCost,
  modifiedCost,
  className = '',
  showLabel = true
}: CostBadgeProps) => {
  const hasModifier = modifiedCost !== undefined && modifiedCost !== baseCost;

  return (
    <div className={`cost-badge ${hasModifier ? 'modified' : ''} ${className}`}>
      {hasModifier ? (
        <>
          <span className="cost-badge-original">{baseCost} pts</span>
          <span className="cost-badge-arrow">→</span>
          <span className="cost-badge-current">{modifiedCost} pts</span>
        </>
      ) : (
        <span className="cost-badge-single">{baseCost} pts</span>
      )}
    </div>
  );
};

// Memoize component for performance
export const CostBadge = memo(CostBadgeComponent);
