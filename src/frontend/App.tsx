import { useState } from 'react';
import { WarbandList } from './components/WarbandList';
import { WarbandEditor } from './components/WarbandEditor';
import { GameDataProvider } from './contexts/GameDataContext';

type View = 'list' | 'editor';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedWarbandId, setSelectedWarbandId] = useState<string | undefined>(undefined);

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

  return (
    <GameDataProvider>
      <div className="app">
        {currentView === 'list' ? (
          <WarbandList 
            onCreateWarband={handleCreateWarband}
            onLoadWarband={handleLoadWarband}
          />
        ) : (
          <WarbandEditor 
            warbandId={selectedWarbandId}
            onBack={handleBackToList}
          />
        )}
      </div>
    </GameDataProvider>
  );
}

export default App;
