import { memo } from 'react';
import { LeaderTrait } from '../../backend/models/types';

interface LeaderTraitSelectorProps {
  leaderTrait: LeaderTrait | null;
  leaderTraitDescriptions: Record<string, string>;
  onLeaderTraitChange: (trait: LeaderTrait | null) => void;
}

const LEADER_TRAITS: LeaderTrait[] = [
  'Bounty Hunter',
  'Healer',
  'Majestic',
  'Monstrous',
  'Political Officer',
  'Sorcerer',
  'Tactician'
];

/**
 * LeaderTraitSelector Component
 * 
 * Displays and manages leader trait selection (only for leaders).
 * Memoized for performance optimization.
 * 
 * Requirements: 6.1, 6.2, 6.3, 4.2, 4.3, 4.4, 9.4 - React.memo for reusable components
 */
const LeaderTraitSelectorComponent = ({
  leaderTrait,
  leaderTraitDescriptions,
  onLeaderTraitChange
}: LeaderTraitSelectorProps) => {
  return (
    <div className="form-section">
      <h3>Leader Trait (Optional)</h3>
      
      <div className="form-group">
        <label htmlFor="leader-trait">Trait</label>
        <select
          id="leader-trait"
          value={leaderTrait || ''}
          onChange={(e) => onLeaderTraitChange(e.target.value ? e.target.value as LeaderTrait : null)}
        >
          <option value="">None</option>
          {LEADER_TRAITS.map(trait => {
            const description = leaderTraitDescriptions[trait];
            const displayText = description ? `${trait} - ${description}` : trait;
            return (
              <option key={trait} value={trait}>
                {displayText}
              </option>
            );
          })}
        </select>
      </div>

      {leaderTrait && leaderTraitDescriptions[leaderTrait] && (
        <p className="trait-description">
          {leaderTraitDescriptions[leaderTrait]}
        </p>
      )}
    </div>
  );
};

// Memoize component for performance
// Requirements: 9.4 - React.memo for reusable components
export const LeaderTraitSelector = memo(LeaderTraitSelectorComponent);
