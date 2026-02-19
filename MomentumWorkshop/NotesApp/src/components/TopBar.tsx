import { useNotesStore } from '@/features/notes/store';
import { Button } from './ui/button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useRenameModal } from './RenameModal';
import { useDeleteModal } from './DeleteModal';
import { useCommandPalette } from './CommandPalette';

export function TopBar() {
  const currentNote = useNotesStore((state) => state.currentNote);
  const createNote = useNotesStore((state) => state.createNote);
  const { openRenameModal } = useRenameModal();
  const { openDeleteModal } = useDeleteModal();
  const { setOpen } = useCommandPalette();

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          {currentNote ? currentNote.title : 'No note selected'}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2"
          title="Command Palette (⌘K)"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => createNote()}
          className="gap-2"
          title="New Note (⌘N)"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New</span>
        </Button>
        {currentNote && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openRenameModal(currentNote.id, currentNote.title)}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Rename</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDeleteModal(currentNote.id, currentNote.title)}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
