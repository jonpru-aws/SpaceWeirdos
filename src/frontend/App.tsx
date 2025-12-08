import { useState } from 'react';
import { WarbandList } from './components/WarbandList';
import { WarbandEditor } from './components/WarbandEditor';
import { ToastNotification, ToastType } from './components/ToastNotification';
import { GameDataProvider } from './contexts/GameDataContext';
import { WarbandProvider } from './contexts/WarbandContext';
import { CostEngine } from '../backend/services/CostEngine';

type View = 'list' | 'editor';

interface ToastState {
  message: string;
  type: ToastType;
}

// Create singleton instance of CostEngine
const costEngine = new CostEngine();

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedWarbandId, setSelectedWarbandId] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<ToastState | null>(null);

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

  return (
    <GameDataProvider>
      <WarbandProvider
        costEngine={costEngine}
      >
        <div className="app">
          {currentView === 'list' ? (
            <WarbandList 
              onCreateWarband={handleCreateWarband}
              onLoadWarband={handleLoadWarband}
              onDeleteSuccess={handleDeleteSuccess}
              onDeleteError={handleDeleteError}
            />
          ) : (
            <WarbandEditor 
              warbandId={selectedWarbandId}
              onBack={handleBackToList}
              onSaveSuccess={handleSaveSuccess}
              onSaveError={handleSaveError}
              onDeleteSuccess={handleDeleteSuccess}
              onDeleteError={handleDeleteError}
            />
          )}

          {toast && (
            <ToastNotification
              message={toast.message}
              type={toast.type}
              onDismiss={dismissToast}
            />
          )}
        </div>
      </WarbandProvider>
    </GameDataProvider>
  );
}

export default App;
