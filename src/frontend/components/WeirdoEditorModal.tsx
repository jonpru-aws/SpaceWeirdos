import { useEffect, useRef } from 'react';
import { useWarband } from '../contexts/WarbandContext';
import { WeirdoEditor } from './WeirdoEditor';
import './WeirdoEditorModal.css';

/**
 * WeirdoEditorModal Component
 * 
 * Modal dialog for editing weirdos.
 * Provides overlay, focus trap, and keyboard accessibility.
 * Prevents background scrolling when open.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
 */

interface WeirdoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeirdoEditorModal({ isOpen, onClose }: WeirdoEditorModalProps) {
  const { selectedWeirdoId, currentWarband } = useWarband();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Get selected weirdo
  const selectedWeirdo = currentWarband?.weirdos.find(w => w.id === selectedWeirdoId);

  // Handle Escape key press (Requirement 8.6)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open (Requirement 8.7)
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Focus management (Requirement 8.3)
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      // Type assertion safe: document.activeElement is always an Element, and we need HTMLElement for focus restoration
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus modal after a brief delay to ensure it's rendered
      const focusTimer = setTimeout(() => {
        modalRef.current?.focus();
      }, 10);
      
      return () => clearTimeout(focusTimer);
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Handle click outside modal (Requirement 8.5)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen || !selectedWeirdo) {
    return null;
  }

  return (
    <div
      className="weirdo-editor-modal__overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="weirdo-editor-modal__content"
        tabIndex={-1}
        role="document"
      >
        {/* Modal Header (Requirement 8.2) */}
        <div className="weirdo-editor-modal__header">
          <h2 id="modal-title" className="weirdo-editor-modal__title">
            {selectedWeirdo.name} ({selectedWeirdo.type === 'leader' ? 'Leader' : 'Trooper'})
          </h2>
          <div className="weirdo-editor-modal__header-actions">
            <button
              className="weirdo-editor-modal__close-button"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Body (scrollable) */}
        <div className="weirdo-editor-modal__body">
          <WeirdoEditor />
        </div>
      </div>
    </div>
  );
}
