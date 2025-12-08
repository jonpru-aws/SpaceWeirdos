import { useWarband } from '../contexts/WarbandContext';
import { WeirdoCard } from './WeirdoCard';
import './WeirdosList.css';

/**
 * WeirdosList Component
 * 
 * Displays all weirdos in the warband with management controls.
 * Provides buttons to add leader and trooper weirdos.
 * Handles weirdo selection and removal.
 * 
 * Requirements: 2.3, 2.4, 2.7, 11.1, 11.2, 11.3
 */
export function WeirdosList() {
  const {
    currentWarband,
    selectedWeirdoId,
    addWeirdo,
    selectWeirdo,
    removeWeirdo,
    getWeirdoCost,
    validationErrors,
  } = useWarband();

  if (!currentWarband) {
    return null;
  }

  // Check if warband has a leader (Requirement 11.3)
  const hasLeader = currentWarband.weirdos.some(w => w.type === 'leader');

  // Handle add leader button click
  const handleAddLeader = async () => {
    try {
      await addWeirdo('leader');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error adding leader:', error.message);
      } else {
        console.error('Error adding leader:', error);
      }
    }
  };

  // Handle add trooper button click
  const handleAddTrooper = async () => {
    try {
      await addWeirdo('trooper');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error adding trooper:', error.message);
      } else {
        console.error('Error adding trooper:', error);
      }
    }
  };

  return (
    <div className="weirdos-list" role="region" aria-label="Weirdos list">
      {/* Add buttons (Requirements 11.1, 11.2, 11.3) */}
      <div className="weirdos-list__actions" role="group" aria-label="Add weirdo actions">
        <button
          className="weirdos-list__add-button button"
          onClick={handleAddLeader}
          disabled={hasLeader}
          aria-label={hasLeader ? "Add Leader (disabled - leader already exists)" : "Add Leader"}
          aria-disabled={hasLeader}
        >
          Add Leader
        </button>
        <button
          className="weirdos-list__add-button button"
          onClick={handleAddTrooper}
          aria-label="Add Trooper"
        >
          Add Trooper
        </button>
      </div>

      {/* List of weirdos */}
      <div className="weirdos-list__items" role="list" aria-label="Warband members">
        {currentWarband.weirdos.length === 0 ? (
          <div className="weirdos-list__empty" role="status">
            No weirdos yet. Add a leader or trooper to get started.
          </div>
        ) : (
          currentWarband.weirdos.map((weirdo) => (
            <WeirdoCard
              key={weirdo.id}
              weirdo={weirdo}
              cost={getWeirdoCost(weirdo.id)}
              isSelected={selectedWeirdoId === weirdo.id}
              hasErrors={validationErrors.has(weirdo.id)}
              validationErrors={validationErrors.get(weirdo.id) || []}
              onClick={() => selectWeirdo(weirdo.id)}
              onRemove={() => removeWeirdo(weirdo.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
