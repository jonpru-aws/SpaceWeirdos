import { useState, useEffect, memo } from 'react';
import type { Warband, WarbandSummary } from '../../backend/models/types';
import { apiClient } from '../services/apiClient';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { FileOperationStatus, FileOperationState } from './FileOperationStatus';
import { FileUtils, FileOperationError } from '../services/FileUtils';
import { ImportExportErrorDisplay } from './ImportExportErrorDisplay';
import { NameConflictDialog } from './NameConflictDialog';
import { ImportExportError } from '../services/ImportExportErrorHandler';
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
  onDuplicateSuccess: () => void;
  onDuplicateError: (error: Error) => void;
  onImportSuccess: () => void;
  onImportError: (error: Error) => void;
  onLearnAboutClick: () => void;
  onExportSuccess?: (warbandName: string) => void;
  onExportError?: (error: Error) => void;
}

export function WarbandList({ 
  onCreateWarband, 
  onLoadWarband,
  onDeleteSuccess,
  onDeleteError,
  onDuplicateSuccess,
  onDuplicateError,
  onImportSuccess,
  onImportError,
  onLearnAboutClick,
  onExportSuccess,
  onExportError
}: WarbandListProps) {
  const [warbands, setWarbands] = useState<Warband[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [exportState, setExportState] = useState<{
    warbandId: string;
    warbandName: string;
    state: FileOperationState;
    message?: string;
  } | null>(null);
  const [importState, setImportState] = useState<{
    state: FileOperationState;
    message?: string;
    fileName?: string;
  } | null>(null);
  const [importError, setImportError] = useState<ImportExportError | null>(null);
  const [nameConflict, setNameConflict] = useState<{
    existingName: string;
    importedName: string;
    importedData: unknown;
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

  /**
   * Handle warband export
   * Requirements: 1.1, 1.2, 1.5
   */
  const handleExportWarband = async (id: string, name: string) => {
    try {
      // Set initial export state
      setExportState({
        warbandId: id,
        warbandName: name,
        state: 'processing',
        message: `Preparing ${name} for export...`
      });

      // Export the warband via API
      const exportedData = await apiClient.exportWarband(id);

      // Update state to downloading
      setExportState(prev => prev ? {
        ...prev,
        state: 'downloading',
        message: `Downloading ${name}...`
      } : null);

      // Use FileUtils to download the warband
      FileUtils.downloadWarbandAsJson(exportedData, `${name}.json`);

      // Update state to complete
      setExportState(prev => prev ? {
        ...prev,
        state: 'complete',
        message: `${name} exported successfully`
      } : null);

      // Clear export state after a delay
      setTimeout(() => {
        setExportState(null);
      }, 2000);

      // Notify parent component of success
      if (onExportSuccess) {
        onExportSuccess(name);
      }

    } catch (error) {
      // Update state to error
      setExportState(prev => prev ? {
        ...prev,
        state: 'error',
        message: `Failed to export ${name}`
      } : null);

      // Clear export state after a delay
      setTimeout(() => {
        setExportState(null);
      }, 3000);

      // Notify parent component of error
      if (onExportError) {
        const exportError = error instanceof FileOperationError 
          ? new Error(`Export failed: ${error.message}`)
          : error instanceof Error 
            ? error 
            : new Error('Unknown export error');
        onExportError(exportError);
      }
    }
  };

  /**
   * Cancel export operation
   * Requirements: 4.2
   */
  const handleCancelExport = () => {
    setExportState(null);
  };

  /**
   * Handle warband import
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
   */
  const handleImportWarband = async () => {
    try {
      // Clear any previous errors
      setImportError(null);

      // Set initial import state
      setImportState({
        state: 'selecting',
        message: 'Select a warband file to import...'
      });

      // Open file selection dialog
      const file = await FileUtils.selectJsonFile();

      // Update state to reading
      setImportState({
        state: 'reading',
        message: 'Reading file...',
        fileName: file.name
      });

      // Read and parse the JSON file
      const importedData = await FileUtils.readJsonFile(file);

      // Update state to validating
      setImportState(prev => prev ? {
        ...prev,
        state: 'validating',
        message: 'Validating warband data...'
      } : null);

      // Validate the imported data via API
      const validation = await apiClient.validateImport({ warbandData: importedData });

      if (!validation.valid) {
        // Show validation errors
        setImportError({
          type: 'VALIDATION_ERROR',
          message: 'Warband data validation failed',
          details: validation.errors.map(e => e.message).join(', '),
          validationErrors: validation.errors,
          retryable: false,
          severity: 'high',
          suggestions: [],
          code: 'VALIDATION_FAILED'
        });
        setImportState(null);
        return;
      }

      // Check for name conflicts
      if (validation.nameConflict) {
        // Show name conflict dialog
        setImportState(null);
        setNameConflict({
          existingName: validation.nameConflict.existingName,
          importedName: validation.nameConflict.conflictsWith,
          importedData: importedData
        });
        return;
      }

      // No conflict, proceed with import
      await performImport(importedData, file.name);

    } catch (error) {
      // Handle different types of errors
      if (error instanceof FileOperationError) {
        setImportError({
          type: error.type === 'FILE_READ_ERROR' ? 'FILE_READ_ERROR' : 'VALIDATION_ERROR',
          message: error.message,
          details: error.details,
          retryable: error.type !== 'INVALID_JSON',
          severity: 'high',
          suggestions: [],
          code: error.type
        });
      } else if (error instanceof Error) {
        // Check if it's a user cancellation
        if (error.message.includes('cancelled') || error.message.includes('No file selected')) {
          // User cancelled, just clear the state
          setImportState(null);
          return;
        }

        setImportError({
          type: 'VALIDATION_ERROR',
          message: error.message,
          retryable: true,
          severity: 'high',
          suggestions: [],
          code: 'IMPORT_FAILED'
        });
      } else {
        setImportError({
          type: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred during import',
          retryable: true,
          severity: 'high',
          suggestions: [],
          code: 'UNKNOWN'
        });
      }

      setImportState(null);

      // Notify parent component of error
      if (onImportError) {
        const importError = error instanceof Error ? error : new Error('Unknown import error');
        onImportError(importError);
      }
    }
  };

  /**
   * Perform the actual import operation
   * Requirements: 2.3
   */
  const performImport = async (warbandData: any, fileName: string) => {
    try {
      // Update state to processing
      setImportState({
        state: 'processing',
        message: `Importing ${(warbandData as any)?.name || 'warband'}...`,
        fileName
      });

      // Import the warband via API
      const createdWarband = await apiClient.importWarband({
        warbandData: warbandData
      });

      // Update state to complete
      setImportState(prev => prev ? {
        ...prev,
        state: 'complete',
        message: `${createdWarband.name} imported successfully`
      } : null);

      // Clear import state after a delay
      setTimeout(() => {
        setImportState(null);
      }, 2000);

      // Reload the warband list to show the new warband
      await loadWarbands();

      // Notify parent component of success
      if (onImportSuccess) {
        onImportSuccess(createdWarband.name);
      }

    } catch (error) {
      throw error; // Re-throw to be handled by the caller
    }
  };

  /**
   * Handle name conflict resolution - rename
   * Requirements: 5.1, 5.2
   */
  const handleNameConflictRename = async (newName: string) => {
    if (!nameConflict) return;

    try {
      const warbandData = nameConflict.importedData;
      setNameConflict(null);
      
      setImportState({
        state: 'processing',
        message: `Importing as ${newName}...`,
        fileName: `${newName}.json`
      });

      const createdWarband = await apiClient.importWarband({
        warbandData: warbandData,
        options: { newName: newName }
      });

      // Update state to complete
      setImportState(prev => prev ? {
        ...prev,
        state: 'complete',
        message: `${createdWarband.name} imported successfully`
      } : null);

      // Clear import state after a delay
      setTimeout(() => {
        setImportState(null);
      }, 2000);

      // Reload the warband list
      await loadWarbands();

      // Notify parent component of success
      if (onImportSuccess) {
        onImportSuccess(createdWarband.name);
      }
    } catch (error) {
      setNameConflict(null);
      setImportState(null);
      if (onImportError) {
        const importError = error instanceof Error ? error : new Error('Failed to import with new name');
        onImportError(importError);
      }
    }
  };

  /**
   * Handle name conflict resolution - replace
   * Requirements: 5.1, 5.3
   */
  const handleNameConflictReplace = async () => {
    if (!nameConflict) return;

    try {
      // Import with replace option
      const warbandData = nameConflict.importedData;
      setNameConflict(null);
      
      setImportState({
        state: 'processing',
        message: `Replacing ${nameConflict.existingName}...`,
        fileName: `${nameConflict.importedName}.json`
      });

      const createdWarband = await apiClient.importWarband({
        warbandData: warbandData,
        options: { replaceExisting: true }
      });

      // Update state to complete
      setImportState(prev => prev ? {
        ...prev,
        state: 'complete',
        message: `${createdWarband.name} imported successfully (replaced existing)`
      } : null);

      // Clear import state after a delay
      setTimeout(() => {
        setImportState(null);
      }, 2000);

      // Reload the warband list
      await loadWarbands();

      // Notify parent component of success
      if (onImportSuccess) {
        onImportSuccess(createdWarband.name);
      }
    } catch (error) {
      setNameConflict(null);
      setImportState(null);
      if (onImportError) {
        const importError = error instanceof Error ? error : new Error('Failed to replace existing warband');
        onImportError(importError);
      }
    }
  };

  /**
   * Handle name conflict resolution - cancel
   * Requirements: 5.3
   */
  const handleNameConflictCancel = () => {
    setNameConflict(null);
  };

  /**
   * Cancel import operation
   * Requirements: 4.2
   */
  const handleCancelImport = () => {
    setImportState(null);
  };

  /**
   * Retry import operation
   * Requirements: 4.4, 7.2
   */
  const handleRetryImport = () => {
    setImportError(null);
    handleImportWarband();
  };

  /**
   * Dismiss import error
   * Requirements: 4.4
   */
  const handleDismissImportError = () => {
    setImportError(null);
  };

  // Load warbands on component mount
  useEffect(() => {
    loadWarbands();
  }, []);

  // Loading state - Requirement 7.8
  if (loading) {
    return (
      <div className="warband-list">
        <h1>Space Weirdos Warbands</h1>
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
        <h1>Space Weirdos Warbands</h1>
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
        <h1>Space Weirdos Warbands</h1>
        <div className="empty-state" role="status">
          <p>No warbands found. Create your first warband to get started!</p>
          <div className="button-container">
            <button 
              onClick={handleImportWarband}
              className="btn btn-primary"
              disabled={!!importState}
              aria-label="Import warband from JSON file"
            >
              {importState ? 'Importing...' : 'Import Warband'}
            </button>
            <button 
              onClick={onLearnAboutClick}
              className="btn btn-secondary"
              aria-label="Learn about the Space Weirdos Warband Builder"
            >
              About Space Weirdos
            </button>            <button 
              onClick={onCreateWarband}
              className="btn btn-primary"
              aria-label="Create your first warband"
            >
              Create New Warband
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display warband list - Requirement 7.1
  return (
    <div className="warband-list">
      <h1>Space Weirdos Warbands</h1>
      <div className="warband-list-actions">
        <button 
          onClick={handleImportWarband}
          className="btn btn-primary"
          aria-label="Import warband from JSON file"
          disabled={!!importState}
        >
          {importState ? 'Importing...' : 'Import Warband'}
        </button>
        <button 
          onClick={onLearnAboutClick}
          className="btn btn-secondary"
          aria-label="Learn about the Space Weirdos Warband Builder"
        >
          About Space Weirdos
        </button>
        <button 
          onClick={onCreateWarband}
          className="btn btn-primary"
          aria-label="Create a new warband"
        >
          Create New Warband
        </button>
      </div>
      
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
              onExport={() => handleExportWarband(warband.id, warband.name)}
              onDelete={() => handleDeleteRequest(warband.id, warband.name)}
            />
          );
        })}
      </div>

      {exportState && (
        <FileOperationStatus
          operation="export"
          state={exportState.state}
          message={exportState.message}
          fileName={`${exportState.warbandName}.json`}
          onCancel={exportState.state !== 'complete' && exportState.state !== 'error' ? handleCancelExport : undefined}
        />
      )}

      {importState && (
        <FileOperationStatus
          operation="import"
          state={importState.state}
          message={importState.message}
          fileName={importState.fileName}
          onCancel={importState.state !== 'complete' && importState.state !== 'error' ? handleCancelImport : undefined}
        />
      )}

      {importError && (
        <ImportExportErrorDisplay
          error={importError}
          operation="import"
          onRetry={importError.retryable ? handleRetryImport : undefined}
          onDismiss={handleDismissImportError}
        />
      )}

      {nameConflict && (
        <NameConflictDialog
          existingWarbandName={nameConflict.existingName}
          importedWarbandName={nameConflict.importedName}
          onRename={handleNameConflictRename}
          onReplace={handleNameConflictReplace}
          onCancel={handleNameConflictCancel}
        />
      )}

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
  onExport: () => void;
}

const WarbandListItemComponent = ({ warband, onSelect, onDelete, onExport }: WarbandListItemProps) => {
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
          onClick={onExport}
          className="export-button"
          aria-label={`Export ${warband.name} as JSON file`}
        >
          Export
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
