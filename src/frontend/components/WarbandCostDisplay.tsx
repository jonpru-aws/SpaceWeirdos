import { useWarband } from '../contexts/WarbandContext';
import './WarbandCostDisplay.css';

/**
 * WarbandCostDisplay Component
 * 
 * Displays total warband cost with sticky positioning at top of editor.
 * Shows warning indicator when approaching limit (within 15 points).
 * Shows error styling when exceeding limit.
 * 
 * Requirements: 1.4, 3.2, 3.3, 3.5, 6.2, 6.4, 6.5, 6.6
 */
export function WarbandCostDisplay() {
  const { currentWarband, getWarbandCost } = useWarband();

  if (!currentWarband) {
    return null;
  }

  const totalCost = getWarbandCost();
  const pointLimit = currentWarband.pointLimit;
  const remaining = pointLimit - totalCost;
  
  // Determine warning/error state (Requirement 3.5)
  const isApproachingLimit = remaining <= 15 && remaining > 0;
  const isOverLimit = remaining < 0;

  // CSS class based on state
  let statusClass = '';
  if (isOverLimit) {
    statusClass = 'warband-cost-display--error';
  } else if (isApproachingLimit) {
    statusClass = 'warband-cost-display--warning';
  }

  return (
    <div className={`warband-cost-display ${statusClass}`}>
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
}
