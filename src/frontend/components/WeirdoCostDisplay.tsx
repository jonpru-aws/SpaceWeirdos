import { useState, memo } from 'react';
import type { Weirdo, WarbandAbility } from '../../backend/models/types';
import { useCostCalculation } from '../hooks/useCostCalculation';
import './WeirdoCostDisplay.css';

/**
 * WeirdoCostDisplay Component
 * 
 * Shows individual weirdo cost with sticky positioning at top of weirdo editor.
 * Provides expandable cost breakdown fetched from API via useCostCalculation hook.
 * 
 * Context-Aware Warning System:
 * - Displays warnings when approaching limits (within 3 points of applicable limit)
 * - Warning logic handled by backend ValidationService for consistency with game rules
 * - Adapts to warband composition (considers existing 25-point weirdos)
 * - Shows appropriate messaging for 20-point vs 25-point limits
 * 
 * Features:
 * - Displays error indicators when exceeding limits
 * - Uses design system tokens for consistent styling
 * - Animates breakdown expand/collapse with smooth transitions
 * - Memoized for performance optimization
 * 
 * Requirements: 1.1, 2.1, 2.2, 2.10, 3.1, 3.2, 3.3
 */

interface WeirdoCostDisplayProps {
  weirdo: Weirdo;
  warbandAbility: WarbandAbility | null;
}

const WeirdoCostDisplayComponent = ({
  weirdo,
  warbandAbility,
}: WeirdoCostDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use useCostCalculation hook for real-time cost updates
  const costResult = useCostCalculation({
    weirdoType: weirdo.type,
    attributes: weirdo.attributes,
    weapons: {
      close: weirdo.closeCombatWeapons.map(w => w.name),
      ranged: weirdo.rangedWeapons.map(w => w.name),
    },
    equipment: weirdo.equipment.map(e => e.name),
    psychicPowers: weirdo.psychicPowers.map(p => p.name),
    warbandAbility: warbandAbility,
  });

  // Extract values from hook result
  const totalCost = costResult.totalCost;
  const breakdown = costResult.breakdown;
  const warnings = costResult.warnings;
  const isLoading = costResult.isLoading;
  const error = costResult.error;

  // Determine warning/error state (Requirements 2.1, 2.2, 2.10)
  // Use backend ValidationService warnings (within 3 points of applicable limit)
  // Leaders have 25 point limit, troopers have 20 point limit
  const weirdoLimit = weirdo.type === 'leader' ? 25 : 20;
  const remaining = weirdoLimit - totalCost;
  const isApproachingLimit = costResult.isApproachingLimit; // From backend warnings
  const isOverLimit = remaining < 0;

  // Build CSS classes based on state
  const displayClasses = [
    'weirdo-cost-display',
    isApproachingLimit && 'weirdo-cost-display--warning',
    isOverLimit && 'weirdo-cost-display--error',
  ]
    .filter(Boolean)
    .join(' ');

  // Build ARIA label for accessibility
  let ariaLabel = `Weirdo cost: ${totalCost} of ${weirdoLimit} points`;
  if (isOverLimit) {
    ariaLabel += `, over limit by ${Math.abs(remaining)} points`;
  } else if (isApproachingLimit) {
    ariaLabel += `, warning: only ${remaining} points remaining`;
  } else {
    ariaLabel += `, ${remaining} points remaining`;
  }

  return (
    <div 
      className={displayClasses}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className="weirdo-cost-display__header">
        <div className="weirdo-cost-display__main">
          <span className="weirdo-cost-display__label">Weirdo Cost:</span>
          <span className="weirdo-cost-display__value">
            {totalCost} / {weirdoLimit} pts
          </span>
          {isApproachingLimit && (
            <span className="weirdo-cost-display__indicator weirdo-cost-display__indicator--warning">
              ⚠ Approaching Limit
            </span>
          )}
          {isOverLimit && (
            <span className="weirdo-cost-display__indicator weirdo-cost-display__indicator--error">
              ✕ Over Limit
            </span>
          )}
        </div>
        <button
          className="weirdo-cost-display__toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Hide cost breakdown' : 'Show cost breakdown'}
        >
          {isExpanded ? '▼' : '▶'} Breakdown
        </button>
      </div>

      {/* Expandable cost breakdown with loading and error states */}
      {isExpanded && (
        <div className="weirdo-cost-display__breakdown">
          {error ? (
            <div className="weirdo-cost-display__breakdown-item weirdo-cost-display__breakdown-item--error">
              <span>Error: {error}</span>
            </div>
          ) : isLoading ? (
            <div className="weirdo-cost-display__breakdown-item">
              <span>Loading breakdown...</span>
            </div>
          ) : (
            <>
              <div className="weirdo-cost-display__breakdown-item">
                <span>Attributes:</span>
                <span>{breakdown.attributes} pts</span>
              </div>
              <div className="weirdo-cost-display__breakdown-item">
                <span>Weapons:</span>
                <span>{breakdown.weapons} pts</span>
              </div>
              <div className="weirdo-cost-display__breakdown-item">
                <span>Equipment:</span>
                <span>{breakdown.equipment} pts</span>
              </div>
              <div className="weirdo-cost-display__breakdown-item">
                <span>Psychic Powers:</span>
                <span>{breakdown.psychicPowers} pts</span>
              </div>
              <div className="weirdo-cost-display__breakdown-item weirdo-cost-display__breakdown-item--total">
                <span>Total:</span>
                <span>{totalCost} pts</span>
              </div>
              {warnings.length > 0 && (
                <div className="weirdo-cost-display__warnings">
                  {warnings.map((warning, index) => (
                    <div key={index} className="weirdo-cost-display__warning">
                      ⚠ {warning}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Memoize component for performance
export const WeirdoCostDisplay = memo(WeirdoCostDisplayComponent);
