import { useState, useEffect } from 'react';
import { Warband } from '../../backend/models/types';
import { apiClient, ApiError } from '../services/apiClient';
import './WarbandList.css';

/**
 * WarbandListComponent
 * 
 * Displays and manages the list of saved warbands.
 * Allows users to load warbands for editing or delete them.
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 14.1, 14.2, 14.3, 14.4
 */

interface WarbandListProps {
  onCreateWarband?: () => void;
  onLoadWarband?: (id: string) => void;
}

export function WarbandList({ onCreateWarband, onLoadWarband }: WarbandListProps) {
  const [warbands, setWarbands] = useState<Warband[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all warbands from the backend
   * Requirements: 13.1
   */
  const loadWarbands = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getAllWarbands();
      setWarbands(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to load warbands: ${err.message}`);
      } else {
        setError('An unexpected error occurred while loading warbands');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to warband editor with loaded warband
   * Requirements: 13.1
   */
  const handleLoadWarband = (id: string) => {
    if (onLoadWarband) {
      onLoadWarband(id);
    }
  };

  /**
   * Delete a warband after confirmation
   * Requirements: 14.1, 14.2, 14.3, 14.4
   */
  const handleDeleteWarband = async (id: string, name: string) => {
    // Requirement 14.1: Prompt for confirmation
    const confirmed = window.confirm(
      `Are you sure you want to delete the warband "${name}"? This action cannot be undone.`
    );

    // Requirement 14.4: Cancel deletion preserves warband
    if (!confirmed) {
      return;
    }

    try {
      // Requirement 14.2: Remove warband from storage
      await apiClient.deleteWarband(id);
      
      // Requirement 14.3: Confirm successful deletion
      window.alert(`Warband "${name}" has been deleted successfully.`);
      
      // Reload the list to reflect the deletion
      await loadWarbands();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to delete warband: ${err.message}`);
      } else {
        setError('An unexpected error occurred while deleting the warband');
      }
    }
  };

  // Load warbands on component mount
  useEffect(() => {
    loadWarbands();
  }, []);

  // Loading state
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

  // Empty state - Requirement 13.4
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

  // Display warband list
  // Requirements: 13.2, 13.3
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
          <article 
            key={warband.id} 
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
                <span className="stat-value" aria-label={`${warband.weirdos.length} weirdos`}>
                  {warband.weirdos.length}
                </span>
              </div>
            </div>

            <div className="warband-actions">
              <button 
                onClick={() => handleLoadWarband(warband.id)}
                className="load-button"
                aria-label={`Load ${warband.name} for editing`}
              >
                Load
              </button>
              <button 
                onClick={() => handleDeleteWarband(warband.id, warband.name)}
                className="delete-button"
                aria-label={`Delete ${warband.name}`}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
