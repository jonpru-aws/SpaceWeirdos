import { useState } from 'react';
import { WarbandList } from './components/WarbandList';
import { WarbandEditor } from './components/WarbandEditor';
import { ToastNotification, ToastType } from './components/ToastNotification';
import { LearnAboutPopup, ReadmeContent } from './components/LearnAboutPopup';
import { readmeContentService } from './services/ReadmeContentService';
import { GameDataProvider } from './contexts/GameDataContext';
import { WarbandProvider } from './contexts/WarbandContext';

type View = 'list' | 'editor';

interface ToastState {
  message: string;
  type: ToastType;
}

interface PopupState {
  isOpen: boolean;
  content: ReadmeContent | null;
  loading: boolean;
  error: string | null;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedWarbandId, setSelectedWarbandId] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [popupState, setPopupState] = useState<PopupState>({
    isOpen: false,
    content: null,
    loading: false,
    error: null
  });

  const handleCreateWarband = () => {
    setSelectedWarbandId(undefined);
    setCurrentView('editor');
  };

  const handleLoadWarband = (id: string) => {
    setSelectedWarbandId(id);
    setCurrentView('editor');
  };

  const handleBackToList = () => {
    setSelectedWarbandId(undefined);
    setCurrentView('list');
  };

  /**
   * Show toast notification
   * Requirements: 9.1, 9.2, 9.3, 9.4
   */
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  /**
   * Dismiss toast notification
   * Requirements: 9.6
   */
  const dismissToast = () => {
    setToast(null);
  };

  /**
   * Handle successful save
   * Requirements: 9.1
   */
  const handleSaveSuccess = () => {
    showToast('Warband saved successfully!', 'success');
  };

  /**
   * Handle save error
   * Requirements: 9.2
   */
  const handleSaveError = (error: Error) => {
    showToast(`Failed to save warband: ${error.message}`, 'error');
  };

  /**
   * Handle successful delete
   * Requirements: 9.3
   */
  const handleDeleteSuccess = () => {
    showToast('Warband deleted successfully!', 'success');
    setCurrentView('list');
  };

  /**
   * Handle delete error
   * Requirements: 9.4
   */
  const handleDeleteError = (error: Error) => {
    showToast(`Failed to delete warband: ${error.message}`, 'error');
  };

  /**
   * Handle successful duplicate
   * Requirements: 7.6
   */
  const handleDuplicateSuccess = () => {
    showToast('Warband duplicated successfully!', 'success');
  };

  /**
   * Handle duplicate error
   * Requirements: 7.7
   */
  const handleDuplicateError = (error: Error) => {
    showToast(`Failed to duplicate warband: ${error.message}`, 'error');
  };

  /**
   * Handle successful import
   * Requirements: 2.3, 4.3
   */
  const handleImportSuccess = () => {
    showToast('Warband imported successfully!', 'success');
  };

  /**
   * Handle import error
   * Requirements: 2.4, 4.4
   */
  const handleImportError = (error: Error) => {
    showToast(`Failed to import warband: ${error.message}`, 'error');
  };

  /**
   * Handle successful download
   * Requirements: 4.1, 4.2
   */
  const handleDownloadSuccess = () => {
    showToast('Warband exported successfully!', 'success');
  };

  /**
   * Handle download error
   * Requirements: 4.4, 4.5
   */
  const handleDownloadError = (error: Error) => {
    showToast(`Failed to export warband: ${error.message}`, 'error');
  };

  /**
   * Handle Learn About button click
   * Requirements: 1.4, 4.3
   */
  const handleLearnAboutClick = async () => {
    // Open popup and start loading
    setPopupState({
      isOpen: true,
      content: readmeContentService.getCachedContent(),
      loading: true,
      error: null
    });

    try {
      // Fetch README content
      const content = await readmeContentService.getContent();
      
      setPopupState(prev => ({
        ...prev,
        content,
        loading: false,
        error: null
      }));
    } catch (error: unknown) {
      // Show error message when README content cannot be loaded
      setPopupState(prev => ({
        ...prev,
        content: null,
        loading: false,
        error: 'Unable to load README.md file information. Please check that the README.md file exists and is accessible.'
      }));
    }
  };

  /**
   * Handle Learn About popup close
   * Requirements: 3.2, 3.3, 3.4, 3.5
   */
  const handleLearnAboutClose = () => {
    setPopupState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  return (
    <GameDataProvider>
      <WarbandProvider>
        <div className="app">
          {currentView === 'list' ? (
            <WarbandList 
              onCreateWarband={handleCreateWarband}
              onLoadWarband={handleLoadWarband}
              onDeleteSuccess={handleDeleteSuccess}
              onDeleteError={handleDeleteError}
              onDuplicateSuccess={handleDuplicateSuccess}
              onDuplicateError={handleDuplicateError}
              onImportSuccess={handleImportSuccess}
              onImportError={handleImportError}
              onLearnAboutClick={handleLearnAboutClick}
            />
          ) : (
            <WarbandEditor 
              warbandId={selectedWarbandId}
              onBack={handleBackToList}
              onSaveSuccess={handleSaveSuccess}
              onSaveError={handleSaveError}
              onDeleteSuccess={handleDeleteSuccess}
              onDeleteError={handleDeleteError}
              onDownloadSuccess={handleDownloadSuccess}
              onDownloadError={handleDownloadError}
            />
          )}

          {toast && (
            <ToastNotification
              message={toast.message}
              type={toast.type}
              onDismiss={dismissToast}
            />
          )}

          <LearnAboutPopup
            isOpen={popupState.isOpen}
            onClose={handleLearnAboutClose}
            content={popupState.content}
            loading={popupState.loading}
            error={popupState.error}
          />
        </div>
      </WarbandProvider>
    </GameDataProvider>
  );
}

export default App;
