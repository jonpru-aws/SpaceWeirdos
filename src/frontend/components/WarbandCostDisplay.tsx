import { useMemo, memo } from 'react';
import { useWarband } from '../contexts/WarbandContext';
import './WarbandCostDisplay.css';

/**
 * WarbandCostDisplay Component
 * 
 * Displays total warband cost with sticky positioning at top of editor.
 * Shows warning indicator when approaching limit (within 15 points).
 * Shows error styling when exceeding limit.
 * Uses design system tokens for consistent styling.
 * Memoized for performance optimization.
 * 
 * Requirements: 1.3, 2.3, 2.4, 2.5, 2.6, 3.2, 3.4, 3.5, 3.6
 */
const WarbandCostDisplayComponent = () => {
  const { currentWarband, getWarbandCost } = useWarband();

  if (!currentWarband) {
    return null;
  }

  // Memoize cost calculation (Requirements 1.4)
  const totalCost = useMemo(() => getWarbandCost(), [getWarbandCost]);
  const pointLimit = currentWarband.pointLimit;
  
  // Memoize derived values (Requirements 1.4)
  const { remaining, isApproachingLimit, isOverLimit } = useMemo(() => {
    const remaining = pointLimit - totalCost;
    return {
      remaining,
      isApproachingLimit: remaining <= 15 && remaining > 0,
      isOverLimit: remaining < 0
    };
  }, [pointLimit, totalCost]);

  // CSS class based on state (Requirements 2.5, 2.6)
  let statusClass = '';
  let ariaLabel = `Warband total cost: ${totalCost} of ${pointLimit} points`;
  
  if (isOverLimit) {
    statusClass = 'warband-cost-display--error';
    ariaLabel += `, over limit by ${Math.abs(remaining)} points`;
  } else if (isApproachingLimit) {
    statusClass = 'warband-cost-display--warning';
    ariaLabel += `, warning: only ${remaining} points remaining`;
  } else {
    ariaLabel += `, ${remaining} points remaining`;
  }

  return (
    <div 
      className={`warband-cost-display ${statusClass}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className="warband-cost-display__content">
        <div className="warband-cost-display__main">
          <span className="warband-cost-display__label">Total Cost:</span>
          <span className="warband-cost-display__value">
            {totalCost} / {pointLimit} pts
          </span>
        </div>
        
        <div className="warband-cost-display__remaining">
          {isOverLimit ? (
            <span className="warband-cost-display__over">
              Over limit by {Math.abs(remaining)} pts
            </span>
          ) : (
            <span className={isApproachingLimit ? 'warband-cost-display__warning-text' : ''}>
              {remaining} pts remaining
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoize component for performance
export const WarbandCostDisplay = memo(WarbandCostDisplayComponent);
