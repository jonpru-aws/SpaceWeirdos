import { useState } from 'react';
import { Weirdo, WarbandAbility } from '../../backend/models/types';
import { CostEngine } from '../../backend/services/CostEngine';
import './WeirdoCostDisplay.css';

/**
 * WeirdoCostDisplay Component
 * 
 * Shows individual weirdo cost with sticky positioning.
 * Provides expandable cost breakdown showing component costs.
 * Displays warning indicators when approaching limits.
 * 
 * Requirements: 3.1, 3.3, 3.4, 6.1, 6.3, 6.5, 6.6
 */

interface WeirdoCostDisplayProps {
  weirdo: Weirdo;
  warbandAbility: WarbandAbility | null;
  costEngine: CostEngine;
}

export function WeirdoCostDisplay({
  weirdo,
  warbandAbility,
  costEngine,
}: WeirdoCostDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate total cost (Requirement 3.1)
  const totalCost = costEngine.calculateWeirdoCost(weirdo, warbandAbility);

  // Calculate individual component costs for breakdown
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

  // Determine warning/error state (Requirement 3.4)
  // Leaders have 25 point limit, troopers have 20 point limit
  const weirdoLimit = weirdo.type === 'leader' ? 25 : 20;
  const isApproachingLimit = totalCost >= weirdoLimit - 10 && totalCost <= weirdoLimit;
  const isOverLimit = totalCost > weirdoLimit;

  // Build CSS classes based on state
  const displayClasses = [
    'weirdo-cost-display',
    isApproachingLimit && 'weirdo-cost-display--warning',
    isOverLimit && 'weirdo-cost-display--error',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={displayClasses}>
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

      {/* Expandable cost breakdown (Requirement 3.3) */}
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
}
