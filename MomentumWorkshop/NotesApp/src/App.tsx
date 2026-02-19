import { useEffect } from 'react';
import { useNotesStore } from './features/notes/store';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Editor } from './components/Editor';
import { CommandPalette, CommandPaletteProvider } from './components/CommandPalette';
import { RenameModalProvider } from './components/RenameModal';
import { DeleteModalProvider } from './components/DeleteModal';
import { Toaster } from './components/ui/toaster';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';

function AppContent() {
  useKeyboardShortcuts();

  return (
    <>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <Editor />
      </div>
      <CommandPalette />
      <Toaster />
    </>
  );
}

function App() {
  const loadNotes = useNotesStore((state) => state.loadNotes);

  useEffect(() => {
    // Wait a bit for preload script to be ready
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.api) {
        loadNotes().catch((error) => {
          console.error('Failed to load notes on app start:', error);
        });
      } else {
        console.warn('Electron API not ready yet, retrying...');
        // Retry after a short delay
        setTimeout(() => {
          if (window.api) {
            loadNotes().catch((error) => {
              console.error('Failed to load notes on app start:', error);
            });
          } else {
            console.error('Electron API still not available after retry');
          }
        }, 500);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [loadNotes]);

  return (
    <CommandPaletteProvider>
      <RenameModalProvider>
        <DeleteModalProvider>
          <div className="flex h-screen w-screen overflow-hidden bg-background">
            <AppContent />
          </div>
        </DeleteModalProvider>
      </RenameModalProvider>
    </CommandPaletteProvider>
  );
}

export default App;
