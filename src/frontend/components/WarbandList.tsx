import { useState, useEffect } from 'react';
import { WarbandSummary } from '../../backend/models/types';
import { DataRepository } from '../../backend/services/DataRepository';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import './WarbandList.css';

/**
 * WarbandList Component
 * 
 * Displays all saved warbands with summary information.
 * Provides controls for creating new warbands and loading existing ones.
 * 
 * Requirements: 7.1, 7.7, 7.8
 */

interface WarbandListProps {
  dataRepository: DataRepository;
  onCreateWarband: () => void;
  onLoadWarband: (id: string) => void;
  onDeleteSuccess: () => void;
  onDeleteError: (error: Error) => void;
}

export function WarbandList({ 
  dataRepository, 
  onCreateWarband, 
  onLoadWarband,
  onDeleteSuccess,
  onDeleteError
}: WarbandListProps) {
  const [warbands, setWarbands] = useState<WarbandSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    id: string;
    name: string;
  } | null>(null);

  /**
   * Fetch all warbands from DataRepository
   * Requirements: 7.1
   */
  const loadWarbands = () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = dataRepository.getAllWarbands();
      setWarbands(data);
    } catch (err) {
      setError(`Failed to load warbands: ${(err as Error).message}`);
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
  const handleConfirmDelete = () => {
    if (deleteConfirmation) {
      try {
        const deleted = dataRepository.deleteWarband(deleteConfirmation.id);
        if (!deleted) {
          throw new Error('Warband not found');
        }
        setDeleteConfirmation(null);
        // Reload the list after deletion
        loadWarbands();
        // Show success notification
        onDeleteSuccess();
      } catch (err) {
        setDeleteConfirmation(null);
        // Show error notification
        onDeleteError(err as Error);
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
        {warbands.map((warband) => (
          <WarbandListItem
            key={warband.id}
            warband={warband}
            onSelect={() => handleSelectWarband(warband.id)}
            onDelete={() => handleDeleteRequest(warband.id, warband.name)}
          />
        ))}
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
 * 
 * Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.9
 */

interface WarbandListItemProps {
  warband: WarbandSummary;
  onSelect: () => void;
  onDelete: () => void;
}

export function WarbandListItem({ warband, onSelect, onDelete }: WarbandListItemProps) {
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
}
