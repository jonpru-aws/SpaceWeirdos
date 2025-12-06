import { memo } from 'react';

interface WeirdoCostDisplayProps {
  pointCost: number;
  weirdoType: 'leader' | 'trooper';
  hasOther21To25: boolean;
  isApproaching: boolean;
  exceedsLimit: boolean;
}

/**
 * WeirdoCostDisplay Component
 * 
 * Displays weirdo point cost with warnings and error states.
 * Memoized for performance optimization.
 * 
 * Requirements: 4.2, 4.3, 4.4, 9.2, 9.3, 9.4, 15.4 - React.memo for reusable components
 */
const WeirdoCostDisplayComponent = ({
  pointCost,
  weirdoType,
  hasOther21To25,
  isApproaching,
  exceedsLimit
}: WeirdoCostDisplayProps) => {
  return (
    <div className="cost-display">
      <div className="cost-label">Point Cost:</div>
      <div 
        className={`cost-value ${isApproaching ? 'warning' : ''} ${exceedsLimit ? 'error' : ''}`}
        data-testid="weirdo-cost"
      >
        {pointCost} pts
      </div>
      {hasOther21To25 && pointCost <= 20 && (
        <div className="cost-info">ℹ 21-25 point slot taken by another weirdo</div>
      )}
      {isApproaching && !exceedsLimit && (
        <div className="cost-warning">⚠ Approaching limit</div>
      )}
      {exceedsLimit && (
        <div className="cost-error">
          {hasOther21To25 && pointCost > 20
            ? '✗ Only one weirdo may cost 21-25 points!'
            : '✗ Exceeds 20 point limit'}
        </div>
      )}
    </div>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const WeirdoCostDisplay = memo(WeirdoCostDisplayComponent);
