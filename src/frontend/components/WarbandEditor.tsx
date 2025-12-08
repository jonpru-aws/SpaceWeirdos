import { useEffect } from 'react';
import { useWarband } from '../contexts/WarbandContext';
import { WarbandProperties } from './WarbandProperties';
import { WarbandCostDisplay } from './WarbandCostDisplay';
import { WeirdosList } from './WeirdosList';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import './WarbandEditor.css';
import { useState } from 'react';

/**
 * WarbandEditor Component
 * 
 * Main editing interface for warband and weirdos.
 * Provides three-section layout:
 * - Warband properties (name, ability, point limit)
 * - List of weirdos with add buttons
 * - Selected weirdo editor
 * 
 * Implements progressive disclosure: hides weirdo management until warband exists.
 * 
 * Requirements: 2.1, 2.2, 2.6, 10.1, 10.2, 10.3, 10.4
 */

interface WarbandEditorProps {
  warbandId?: string;
  onBack: () => void;
  onSaveSuccess: () => void;
  onSaveError: (error: Error) => void;
  onDeleteSuccess: () => void;
  onDeleteError: (error: Error) => void;
}

export function WarbandEditor({ 
  warbandId, 
  onBack, 
  onSaveSuccess, 
  onSaveError,
  onDeleteSuccess,
  onDeleteError
}: WarbandEditorProps) {
  const { currentWarband, loadWarband, createWarband, saveWarband, deleteWarband } = useWarband();
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

  /**
   * Load warband on mount if warbandId provided
   */
  useEffect(() => {
    if (warbandId) {
      loadWarband(warbandId).catch((err) => {
        console.error('Failed to load warband:', err);
        onBack();
      });
    } else {
      // Create new warband with default values
      createWarband('New Warband', 75);
    }
  }, [warbandId]);

  /**
   * Handle save warband
   * Requirements: 9.1, 9.2
   */
  const handleSave = async () => {
    try {
      await saveWarband();
      onSaveSuccess();
    } catch (err) {
      // Type assertion needed: catch blocks receive unknown type, but callback expects Error
      // This is safe because saveWarband only throws Error instances
      onSaveError(err as Error);
    }
  };

  /**
   * Show delete confirmation dialog
   * Requirements: 8.1
   */
  const handleDeleteRequest = () => {
    setDeleteConfirmation(true);
  };

  /**
   * Confirm warband deletion
   * Requirements: 8.3, 8.5, 9.3, 9.4
   */
  const handleConfirmDelete = async () => {
    if (!currentWarband?.id) return;

    try {
      await deleteWarband(currentWarband.id);
      setDeleteConfirmation(false);
      onDeleteSuccess();
    } catch (err) {
      setDeleteConfirmation(false);
      // Type assertion needed: catch blocks receive unknown type, but callback expects Error
      // This is safe because deleteWarband only throws Error instances
      onDeleteError(err as Error);
    }
  };

  /**
   * Cancel warband deletion
   * Requirements: 8.4
   */
  const handleCancelDelete = () => {
    setDeleteConfirmation(false);
  };

  // Progressive disclosure: show message when no warband exists (Requirements 2.1, 2.2, 2.6)
  if (!currentWarband) {
    return (
      <div className="warband-editor">
        <div className="warband-editor__empty-state">
          <h2>No Warband Selected</h2>
          <p>Create a new warband or load an existing one to begin editing.</p>
        </div>
      </div>
    );
  }

  // Three-section layout (Requirements 10.1, 10.2, 10.3, 10.4)
  return (
    <div className="warband-editor">
      {/* Action buttons */}
      <div className="warband-editor__actions">
        <button onClick={onBack} className="back-button">
          ← Back to List
        </button>
        <div className="warband-editor__actions-right">
          <button 
            onClick={handleSave} 
            className="save-button"
            aria-label="Save warband"
          >
            Save Warband
          </button>
          {currentWarband.id && (
            <button 
              onClick={handleDeleteRequest} 
              className="delete-button"
              aria-label="Delete warband"
            >
              Delete Warband
            </button>
          )}
        </div>
      </div>

      {/* Section 1: Warband Properties */}
      <section className="warband-editor__properties">
        <WarbandCostDisplay />
        <h2>Warband Properties</h2>
        <WarbandProperties />
      </section>

      {/* Section 2: Weirdo List */}
      <section className="warband-editor__weirdos-list">
        <h2>Weirdos</h2>
        <WeirdosList />
      </section>

      {/* Section 3: Weirdo Editor */}
      <section className="warband-editor__weirdo-editor">
        <h2>Weirdo Editor</h2>
        {/* WeirdoEditor component will be added in task 6.1 */}
        <div>Weirdo editor section - to be implemented</div>
      </section>

      {/* Delete confirmation dialog */}
      {deleteConfirmation && (
        <DeleteConfirmationDialog
          warbandName={currentWarband.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
