import { FileText } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-notes' | 'no-selection';
  onCreateNote?: () => void;
}

export function EmptyState({ type, onCreateNote }: EmptyStateProps) {
  if (type === 'no-notes') {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="mb-4 rounded-full bg-muted p-6">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">No notes yet</h2>
        <p className="mb-6 text-center text-sm text-muted-foreground max-w-sm">
          Get started by creating your first note. Click the "New Note" button or press ⌘N.
        </p>
        {onCreateNote && (
          <button
            onClick={onCreateNote}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Note
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="mb-4 rounded-full bg-muted p-6">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">Select a note</h2>
      <p className="text-center text-sm text-muted-foreground max-w-sm">
        Choose a note from the sidebar to start editing, or create a new one.
      </p>
    </div>
  );
}
