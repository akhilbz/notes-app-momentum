import { useNotesStore } from '@/features/notes/store';
import { formatDistanceToNow } from 'date-fns';

export function Sidebar() {
  const notes = useNotesStore((state) => state.notes);
  const currentNote = useNotesStore((state) => state.currentNote);
  const selectNote = useNotesStore((state) => state.selectNote);
  const createNote = useNotesStore((state) => state.createNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h1 className="text-lg font-semibold">Notes</h1>
        <button
          onClick={() => createNote()}
          className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">No notes yet</p>
        ) : (
          <div className="p-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`group mb-1 flex items-center justify-between rounded-md p-3 cursor-pointer transition-colors ${
                  currentNote?.id === note.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => selectNote(note.id)}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium">{note.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="ml-2 rounded px-1.5 py-0.5 text-xs text-muted-foreground opacity-0 hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
