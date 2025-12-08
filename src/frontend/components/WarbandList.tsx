import { useState, useEffect, memo } from 'react';
import type { Warband, WarbandSummary } from '../../backend/models/types';
import { apiClient } from '../services/apiClient';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import './WarbandList.css';

/**
 * WarbandList Component
 * 
 * Displays all saved warbands with summary information.
 * Provides controls for creating new warbands and loading existing ones.
 * Uses API-calculated costs from warband objects.
 * 
 * Requirements: 7.1, 7.7, 7.8, 9.2, 9.6
 */

interface WarbandListProps {
  onCreateWarband: () => void;
  onLoadWarband: (id: string) => void;
  onDeleteSuccess: () => void;
  onDeleteError: (error: Error) => void;
}

export function WarbandList({ 
  onCreateWarband, 
  onLoadWarband,
  onDeleteSuccess,
  onDeleteError
}: WarbandListProps) {
  const [warbands, setWarbands] = useState<Warband[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    id: string;
    name: string;
  } | null>(null);

  /**
   * Fetch all warbands from API
   * Requirements: 7.1
   */
  const loadWarbands = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getAllWarbands();
      setWarbands(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load warbands';
      setError(`Failed to load warbands: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle warband selection
   * Requirements: 7.9
   */
  const handleSelectWarband = (id: string) => {
    onLoadWarband(id);
  };

  /**
   * Show delete confirmation dialog
   * Requirements: 8.1
   */
  const handleDeleteRequest = (id: string, name: string) => {
    setDeleteConfirmation({ id, name });
  };

  /**
   * Confirm warband deletion
   * Requirements: 8.3, 8.5, 9.3, 9.4
   */
  const handleConfirmDelete = async () => {
    if (deleteConfirmation) {
      try {
        await apiClient.deleteWarband(deleteConfirmation.id);
        setDeleteConfirmation(null);
        // Reload the list after deletion
        await loadWarbands();
        // Show success notification
        onDeleteSuccess();
      } catch (error: unknown) {
        setDeleteConfirmation(null);
        // Show error notification
        // Type guard to ensure error is Error before passing to callback
        const err = error instanceof Error ? error : new Error(String(error));
        onDeleteError(err);
      }
    }
  };

  /**
   * Cancel warband deletion
   * Requirements: 8.4
   */
  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Load warbands on component mount
  useEffect(() => {
    loadWarbands();
  }, []);

  // Loading state - Requirement 7.8
  if (loading) {
    return (
      <div className="warband-list">
        <h1>My Warbands</h1>
        <div className="loading" role="status" aria-live="polite">
          <div className="spinner spinner-large" aria-hidden="true"></div>
          <span>Loading warbands...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="warband-list">
        <h1>My Warbands</h1>
        <div className="error" role="alert" aria-live="assertive">
          <p>{error}</p>
          <button onClick={loadWarbands} aria-label="Retry loading warbands">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state - Requirement 7.7
  if (warbands.length === 0) {
    return (
      <div className="warband-list">
        <h1>My Warbands</h1>
        <div className="empty-state" role="status">
          <p>No warbands found. Create your first warband to get started!</p>
          <button 
            onClick={onCreateWarband}
            className="create-button"
            aria-label="Create your first warband"
          >
            Create New Warband
          </button>
        </div>
      </div>
    );
  }

  // Display warband list - Requirement 7.1
  return (
    <div className="warband-list">
      <h1>My Warbands</h1>
      <button 
        onClick={onCreateWarband}
        className="create-button"
        aria-label="Create a new warband"
      >
        Create New Warband
      </button>
      
      <div className="warband-grid" role="list" aria-label="Saved warbands">
        {warbands.map((warband) => {
          // Use totalCost from warband object (calculated by API)
          const totalCost = warband.totalCost;
          const weirdoCount = warband.weirdos.length;
          const summary = {
            id: warband.id,
            name: warband.name,
            ability: warband.ability,
            pointLimit: warband.pointLimit,
            totalCost,
            weirdoCount,
            updatedAt: warband.updatedAt
          };
          return (
            <WarbandListItem
              key={warband.id}
              warband={summary}
              onSelect={() => handleSelectWarband(warband.id)}
              onDelete={() => handleDeleteRequest(warband.id, warband.name)}
            />
          );
        })}
      </div>

      {deleteConfirmation && (
        <DeleteConfirmationDialog
          warbandName={deleteConfirmation.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

/**
 * WarbandListItem Component
 * 
 * Displays summary information for a single warband.
 * Provides controls for loading and deleting the warband.
 * Memoized for performance optimization.
 * 
 * Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.9
 */

interface WarbandListItemProps {
  warband: WarbandSummary;
  onSelect: () => void;
  onDelete: () => void;
}

const WarbandListItemComponent = ({ warband, onSelect, onDelete }: WarbandListItemProps) => {
  return (
    <article 
      className="warband-card fade-in"
      role="listitem"
      aria-label={`Warband: ${warband.name}`}
    >
      <div className="warband-header">
        <h2>{warband.name}</h2>
        <span className="warband-ability" aria-label={`Ability: ${warband.ability || 'No Ability'}`}>
          {warband.ability || 'No Ability'}
        </span>
      </div>
      
      <div className="warband-stats">
        <div className="stat">
          <span className="stat-label">Point Limit:</span>
          <span className="stat-value" aria-label={`${warband.pointLimit} points`}>
            {warband.pointLimit}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Total Cost:</span>
          <span className="stat-value" aria-label={`${warband.totalCost} points used`}>
            {warband.totalCost}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Weirdos:</span>
          <span className="stat-value" aria-label={`${warband.weirdoCount} weirdos`}>
            {warband.weirdoCount}
          </span>
        </div>
      </div>

      <div className="warband-actions">
        <button 
          onClick={onSelect}
          className="load-button"
          aria-label={`Load ${warband.name} for editing`}
        >
          Load
        </button>
        <button 
          onClick={onDelete}
          className="delete-button"
          aria-label={`Delete ${warband.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
};

// Memoize component for performance
export const WarbandListItem = memo(WarbandListItemComponent);
