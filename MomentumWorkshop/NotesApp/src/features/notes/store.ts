import { create } from 'zustand';
import type { Note, NoteMetadata } from '@shared/types';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface NotesStore {
  notes: NoteMetadata[];
  currentNote: Note | null;
  isLoading: boolean;
  isSaving: boolean;
  searchQuery: string;
  loadNotes: () => Promise<void>;
  selectNote: (id: string) => Promise<void>;
  createNote: (initialTitle?: string) => Promise<void>;
  updateNote: (id: string, updates: { title?: string; content?: string }) => Promise<void>;
  renameNote: (id: string, newTitle: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearCurrentNote: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  isSaving: false,
  searchQuery: '',

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await api.listNotes();
      set({ notes, isLoading: false });
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notes',
        variant: 'destructive',
      });
      set({ isLoading: false });
    }
  },

  selectNote: async (id: string) => {
    const { currentNote } = get();
    if (currentNote?.id === id) return;

    set({ isLoading: true });
    try {
      const note = await api.readNote(id);
      set({ currentNote: note, isLoading: false });
    } catch (error) {
      console.error(`Failed to load note ${id}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to load note',
        variant: 'destructive',
      });
      set({ isLoading: false });
    }
  },

  createNote: async (initialTitle?: string) => {
    try {
      const note = await api.createNote(initialTitle);
      await get().loadNotes();
      set({ currentNote: note });
      toast({
        title: 'Note created',
        description: 'New note created successfully',
      });
    } catch (error) {
      console.error('Failed to create note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create note',
        variant: 'destructive',
      });
    }
  },

  updateNote: async (id: string, updates: { title?: string; content?: string }) => {
    set({ isSaving: true });
    try {
      await api.updateNote(id, updates);
      const { currentNote } = get();
      if (currentNote && currentNote.id === id) {
        set({
          currentNote: {
            ...currentNote,
            ...updates,
            updatedAt: Date.now(),
          },
        });
      }
      await get().loadNotes();
      set({ isSaving: false });
    } catch (error) {
      console.error(`Failed to update note ${id}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
      set({ isSaving: false });
      throw error; // Re-throw for retry logic
    }
  },

  renameNote: async (id: string, newTitle: string) => {
    try {
      await api.renameNote(id, newTitle);
      const { currentNote } = get();
      if (currentNote && currentNote.id === id) {
        set({
          currentNote: {
            ...currentNote,
            title: newTitle,
            updatedAt: Date.now(),
          },
        });
      }
      await get().loadNotes();
      toast({
        title: 'Note renamed',
        description: 'Note renamed successfully',
      });
    } catch (error: any) {
      console.error(`Failed to rename note ${id}:`, error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to rename note',
        variant: 'destructive',
      });
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    try {
      await api.deleteNote(id);
      const { currentNote } = get();
      if (currentNote?.id === id) {
        set({ currentNote: null });
      }
      await get().loadNotes();
      toast({
        title: 'Note deleted',
        description: 'Note deleted successfully',
      });
    } catch (error) {
      console.error(`Failed to delete note ${id}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearCurrentNote: () => {
    set({ currentNote: null });
  },
}));
