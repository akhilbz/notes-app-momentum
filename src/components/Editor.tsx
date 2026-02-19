import { useState, useEffect } from 'react';
import { useNotesStore } from '@/features/notes/store';

export function Editor() {
  const currentNote = useNotesStore((state) => state.currentNote);
  const updateNote = useNotesStore((state) => state.updateNote);
  const isSaving = useNotesStore((state) => state.isSaving);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [currentNote]);

  useEffect(() => {
    if (!currentNote) return;

    const timeoutId = setTimeout(() => {
      if (title !== currentNote.title || content !== currentNote.content) {
        updateNote(currentNote.id, { title, content });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [title, content, currentNote, updateNote]);

  if (!currentNote) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select a note or create a new one
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent text-2xl font-semibold outline-none"
        />
        {isSaving && <p className="mt-1 text-xs text-muted-foreground">Saving...</p>}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="min-h-full w-full resize-none bg-transparent text-base outline-none"
        />
      </div>
    </div>
  );
}
