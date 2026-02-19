import { useEffect } from 'react';
import { useNotesStore } from '@/features/notes/store';
import { useCommandPalette } from '@/components/CommandPalette';

export function useKeyboardShortcuts() {
  const createNote = useNotesStore((state) => state.createNote);
  const currentNote = useNotesStore((state) => state.currentNote);
  const updateNote = useNotesStore((state) => state.updateNote);
  const { setOpen } = useCommandPalette();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // ⌘N / Ctrl+N: New note
      if (modKey && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        createNote();
      }

      // ⌘S / Ctrl+S: Manual save
      if (modKey && e.key === 's') {
        e.preventDefault();
        if (currentNote) {
          updateNote(currentNote.id, {
            title: currentNote.title,
            content: currentNote.content,
          });
        }
      }

      // ⌘K / Ctrl+K: Command palette
      if (modKey && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNote, currentNote, updateNote, setOpen]);
}
