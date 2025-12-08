import { useState, useMemo, memo } from 'react';
import { Weirdo, WarbandAbility } from '../../backend/models/types';
import { CostEngine } from '../../backend/services/CostEngine';
import './WeirdoCostDisplay.css';

/**
 * WeirdoCostDisplay Component
 * 
 * Shows individual weirdo cost with sticky positioning at top of weirdo editor.
 * Provides expandable cost breakdown showing component costs.
 * Displays warning indicators when approaching limits (within 10 points).
 * Displays error indicators when exceeding limits.
 * Uses design system tokens for consistent styling.
 * Animates breakdown expand/collapse with smooth transitions.
 * Memoized for performance optimization.
 * 
 * Requirements: 1.1, 1.3, 2.1, 2.2, 2.5, 2.6, 3.1, 3.3, 3.5, 3.6, 5.1-5.5
 */

interface WeirdoCostDisplayProps {
  weirdo: Weirdo;
  warbandAbility: WarbandAbility | null;
  costEngine: CostEngine;
}

const WeirdoCostDisplayComponent = ({
  weirdo,
  warbandAbility,
  costEngine,
}: WeirdoCostDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize total cost calculation (Requirements 1.1, 1.3, 1.4)
  const totalCost = useMemo(
    () => weirdo.totalCost ?? costEngine.calculateWeirdoCost(weirdo, warbandAbility),
    [weirdo, warbandAbility, costEngine]
  );

  // Memoize individual component costs for breakdown (Requirements 1.4, 5.2, 5.3)
  const costBreakdown = useMemo(() => {
    const attributeCost = 
      costEngine.getAttributeCost('speed', weirdo.attributes.speed, warbandAbility) +
      costEngine.getAttributeCost('defense', weirdo.attributes.defense, warbandAbility) +
      costEngine.getAttributeCost('firepower', weirdo.attributes.firepower, warbandAbility) +
      costEngine.getAttributeCost('prowess', weirdo.attributes.prowess, warbandAbility) +
      costEngine.getAttributeCost('willpower', weirdo.attributes.willpower, warbandAbility);
    
    const weaponCost = [...weirdo.closeCombatWeapons, ...weirdo.rangedWeapons]
      .reduce((sum, weapon) => sum + costEngine.getWeaponCost(weapon, warbandAbility), 0);
    
    const equipmentCost = weirdo.equipment
      .reduce((sum, equip) => sum + costEngine.getEquipmentCost(equip, warbandAbility), 0);
    
    const psychicPowerCost = weirdo.psychicPowers
      .reduce((sum, power) => sum + power.cost, 0);
    
    return { attributeCost, weaponCost, equipmentCost, psychicPowerCost };
  }, [weirdo, warbandAbility, costEngine]);
  
  const { attributeCost, weaponCost, equipmentCost, psychicPowerCost } = costBreakdown;

  // Determine warning/error state (Requirements 2.1, 2.2)
  // Leaders have 25 point limit, troopers have 20 point limit
  const weirdoLimit = weirdo.type === 'leader' ? 25 : 20;
  const remaining = weirdoLimit - totalCost;
  const isApproachingLimit = remaining <= 10 && remaining > 0;
  const isOverLimit = remaining < 0;

  // Build CSS classes based on state (Requirements 2.5, 2.6)
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

      {/* Expandable cost breakdown (Requirements 5.1, 5.2, 5.3, 5.4, 5.5) */}
      {isExpanded && (
        <div className="weirdo-cost-display__breakdown">
          <div className="weirdo-cost-display__breakdown-item">
            <span>Attributes:</span>
            <span>{attributeCost} pts</span>
          </div>
          <div className="weirdo-cost-display__breakdown-item">
            <span>Weapons:</span>
            <span>{weaponCost} pts</span>
          </div>
          <div className="weirdo-cost-display__breakdown-item">
            <span>Equipment:</span>
            <span>{equipmentCost} pts</span>
          </div>
          <div className="weirdo-cost-display__breakdown-item">
            <span>Psychic Powers:</span>
            <span>{psychicPowerCost} pts</span>
          </div>
          <div className="weirdo-cost-display__breakdown-item weirdo-cost-display__breakdown-item--total">
            <span>Total:</span>
            <span>{totalCost} pts</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize component for performance
export const WeirdoCostDisplay = memo(WeirdoCostDisplayComponent);
