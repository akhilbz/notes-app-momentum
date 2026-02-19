import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useNotesStore } from '@/features/notes/store';

interface RenameModalContext {
  open: boolean;
  noteId: string | null;
  currentTitle: string;
  openRenameModal: (id: string, title: string) => void;
  closeRenameModal: () => void;
}

const RenameModalContext = React.createContext<RenameModalContext | null>(null);

export function useRenameModal() {
  const context = React.useContext(RenameModalContext);
  if (!context) {
    throw new Error('useRenameModal must be used within RenameModalProvider');
  }
  return context;
}

export function RenameModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const renameNote = useNotesStore((state) => state.renameNote);

  const openRenameModal = (id: string, title: string) => {
    setNoteId(id);
    setCurrentTitle(title);
    setNewTitle(title);
    setOpen(true);
  };

  const closeRenameModal = () => {
    setOpen(false);
    setNoteId(null);
    setCurrentTitle('');
    setNewTitle('');
  };

  const handleSave = async () => {
    if (!noteId || !newTitle.trim()) return;
    if (newTitle.trim() === currentTitle) {
      closeRenameModal();
      return;
    }

    try {
      await renameNote(noteId, newTitle.trim());
      closeRenameModal();
    } catch (error) {
      // Error is handled by store/toast
    }
  };

  useEffect(() => {
    if (open) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeRenameModal();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  return (
    <RenameModalContext.Provider value={{ open, noteId, currentTitle, openRenameModal, closeRenameModal }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Note</DialogTitle>
            <DialogDescription>Enter a new name for this note.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTitle.trim()) {
                    handleSave();
                  }
                }}
                placeholder="Note title"
                maxLength={200}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRenameModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!newTitle.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RenameModalContext.Provider>
  );
}
