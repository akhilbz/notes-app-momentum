import { useState, useEffect, useRef } from 'react';
import { useNotesStore } from '@/features/notes/store';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { EmptyState } from './EmptyState';
import { Loader2 } from 'lucide-react';

export function Editor() {
  const currentNote = useNotesStore((state) => state.currentNote);
  const notes = useNotesStore((state) => state.notes);
  const updateNote = useNotesStore((state) => state.updateNote);
  const isSaving = useNotesStore((state) => state.isSaving);
  const createNote = useNotesStore((state) => state.createNote);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when note changes
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [currentNote]);

  // Debounced auto-save
  useEffect(() => {
    if (!currentNote) return;

    const timeoutId = setTimeout(() => {
      const hasChanges =
        title !== currentNote.title || content !== currentNote.content;

      if (hasChanges) {
        updateNote(currentNote.id, { title, content }).catch((error) => {
          console.error('Auto-save failed:', error);
          // Retry on next keystroke
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [title, content, currentNote, updateNote]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  if (!currentNote) {
    return (
      <div className="flex-1 overflow-hidden">
        <EmptyState
          type={notes.length === 0 ? 'no-notes' : 'no-selection'}
          onCreateNote={createNote}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Title */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <Input
            ref={titleRef}
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="border-0 text-2xl font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto"
          />
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Textarea
          ref={contentRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing..."
          className="min-h-full resize-none border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
        />
      </div>
    </div>
  );
}
