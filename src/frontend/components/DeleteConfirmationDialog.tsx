import { useEffect, useRef } from 'react';
import './DeleteConfirmationDialog.css';

/**
 * DeleteConfirmationDialog Component
 * 
 * Modal dialog for confirming warband deletion.
 * Implements focus trap and escape key handling for accessibility.
 * 
 * Requirements: 8.1, 8.2, 8.4
 */

interface DeleteConfirmationDialogProps {
  warbandName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationDialog({ 
  warbandName, 
  onConfirm, 
  onCancel 
}: DeleteConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Handle escape key press
   * Requirements: 8.4
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  /**
   * Focus trap implementation
   * Requirements: 8.4
   */
  useEffect(() => {
    // Focus the confirm button when dialog opens
    confirmButtonRef.current?.focus();

    // Trap focus within dialog
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, []);

  /**
   * Handle overlay click (close dialog)
   */
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="dialog-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="dialog-content" ref={dialogRef}>
        <h2 id="dialog-title">Confirm Deletion</h2>
        <p id="dialog-description">
          Are you sure you want to delete the warband <strong>"{warbandName}"</strong>? 
          This action cannot be undone.
        </p>
        <div className="dialog-actions">
          <button 
            onClick={onCancel}
            className="cancel-button"
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="confirm-button"
            ref={confirmButtonRef}
            aria-label={`Confirm deletion of ${warbandName}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
