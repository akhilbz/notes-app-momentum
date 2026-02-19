import { useEffect } from 'react';
import { useNotesStore } from './features/notes/store';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';

function App() {
  const loadNotes = useNotesStore((state) => state.loadNotes);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <Editor />
    </div>
  );
}

export default App;
