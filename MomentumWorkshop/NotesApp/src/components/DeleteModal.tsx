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
import { useNotesStore } from '@/features/notes/store';

interface DeleteModalContext {
  open: boolean;
  noteId: string | null;
  noteTitle: string;
  openDeleteModal: (id: string, title: string) => void;
  closeDeleteModal: () => void;
}

const DeleteModalContext = React.createContext<DeleteModalContext | null>(null);

export function useDeleteModal() {
  const context = React.useContext(DeleteModalContext);
  if (!context) {
    throw new Error('useDeleteModal must be used within DeleteModalProvider');
  }
  return context;
}

export function DeleteModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const deleteNote = useNotesStore((state) => state.deleteNote);

  const openDeleteModal = (id: string, title: string) => {
    setNoteId(id);
    setNoteTitle(title);
    setOpen(true);
  };

  const closeDeleteModal = () => {
    setOpen(false);
    setNoteId(null);
    setNoteTitle('');
  };

  const handleDelete = async () => {
    if (!noteId) return;

    try {
      await deleteNote(noteId);
      closeDeleteModal();
    } catch (error) {
      // Error is handled by store/toast
    }
  };

  useEffect(() => {
    if (open) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeDeleteModal();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  return (
    <DeleteModalContext.Provider value={{ open, noteId, noteTitle, openDeleteModal, closeDeleteModal }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{noteTitle}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DeleteModalContext.Provider>
  );
}
