import { useEffect, useRef } from 'react';
import './LearnAboutPopup.css';

/**
 * Convert markdown links to HTML links
 * Converts [text](url) format to <a href="url" target="_blank" rel="noopener noreferrer">text</a>
 */
function convertMarkdownLinksToHtml(text: string): string {
  // Handle null, undefined, or non-string values
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Regular expression to match markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  return text.replace(markdownLinkRegex, (match, linkText, url) => {
    // Sanitize the URL to prevent XSS attacks
    const sanitizedUrl = url.trim();
    
    // Only allow http and https URLs
    if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
      return match; // Return original text if URL is not safe
    }
    
    return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  });
}

/**
 * Component for rendering text with markdown links converted to HTML links
 */
interface TextWithLinksProps {
  text: string;
  className?: string;
}

function TextWithLinks({ text, className }: TextWithLinksProps) {
  const htmlContent = convertMarkdownLinksToHtml(text);
  
  // If no content after conversion, render nothing
  if (!htmlContent) {
    return null;
  }
  
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

/**
 * LearnAboutPopup Component
 * 
 * Modal popup for displaying Space Weirdos game information.
 * Shows README content including title, features, and game rules.
 * Implements focus trap and escape key handling for accessibility.
 * 
 * Requirements: 1.4, 1.5, 2.1, 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5
 */

export interface ReadmeContent {
  title: string;
  version: string;
  description: string;
  features: string[];
  gameRules: string[];
  recentUpdates: string[];
  lastUpdated: Date;
}

interface LearnAboutPopupProps {
  isOpen: boolean;
  onClose: () => void;
  content: ReadmeContent | null;
  loading?: boolean;
  error?: string | null;
}

export function LearnAboutPopup({ 
  isOpen,
  onClose, 
  content,
  loading = false,
  error = null
}: LearnAboutPopupProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Handle escape key press
   * Requirements: 3.4
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * Focus trap implementation
   * Requirements: 3.1
   */
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button when dialog opens
    closeButtonRef.current?.focus();

    // Trap focus within dialog
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      // Type assertions are safe: querySelectorAll returns Elements, but we know they're HTMLElements
      // because we're querying for interactive elements that are always HTMLElements
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
  }, [isOpen]);

  /**
   * Handle overlay click (close dialog)
   * Requirements: 3.3
   */
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="learn-about-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-about-title"
      aria-describedby="learn-about-description"
    >
      <div className="learn-about-content" ref={dialogRef}>
        <div className="learn-about-header">
          <h2 id="learn-about-title">Learn about the Space Weirdos Warband Builder</h2>
          <button 
            onClick={onClose}
            className="learn-about-close-button"
            ref={closeButtonRef}
            aria-label="Close learn about popup"
          >
            ×
          </button>
        </div>

        <div className="learn-about-body" id="learn-about-description">
          {/* Attribution Header - Always Displayed */}
          <div className="learn-about-attribution">
            <p>With respect and admiration to Space Weirdos by Garske Games</p>
          </div>

          {loading && (
            <div className="learn-about-loading">
              <p>Loading game information...</p>
            </div>
          )}

          {error && (
            <div className="learn-about-error">
              <p>{error}</p>
            </div>
          )}

          {content && !loading && !error && (
            <>
              {/* Title and Version Section - Requirements: 2.1 */}
              <div className="learn-about-section">
                <h3>{content.title}</h3>
                <p className="version-info">{content.version}</p>
                <p className="description-info">
                  <TextWithLinks text={content.description} />
                </p>
              </div>

              {/* Features Section - Requirements: 2.2 */}
              <div className="learn-about-section">
                <h4>Features</h4>
                <ul className="features-list">
                  {content.features.map((feature, index) => (
                    <li key={index}>
                      <TextWithLinks text={feature} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Game Rules Section - Requirements: 2.3 */}
              <div className="learn-about-section">
                <h4>Game Rules Implemented</h4>
                <ul className="game-rules-list">
                  {content.gameRules.map((rule, index) => (
                    <li key={index}>
                      <TextWithLinks text={rule} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent Updates Section */}
              {content.recentUpdates && content.recentUpdates.length > 0 && (
                <div className="learn-about-section">
                  <h4>Recent Updates</h4>
                  <ul className="recent-updates-list">
                    {content.recentUpdates.map((update, index) => (
                      <li key={index}>
                        <TextWithLinks text={update} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}