import { create } from 'zustand';
import type { Note, NoteMetadata } from '@shared/types';
import { api } from '@/lib/api';

interface NotesStore {
  notes: NoteMetadata[];
  currentNote: Note | null;
  isLoading: boolean;
  isSaving: boolean;
  loadNotes: () => Promise<void>;
  selectNote: (id: string) => Promise<void>;
  createNote: () => Promise<void>;
  updateNote: (id: string, updates: { title?: string; content?: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  isSaving: false,

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await api.listNotes();
      set({ notes, isLoading: false });
    } catch (error) {
      console.error('Failed to load notes:', error);
      set({ isLoading: false });
    }
  },

  selectNote: async (id: string) => {
    if (get().currentNote?.id === id) return;
    try {
      const note = await api.readNote(id);
      set({ currentNote: note });
    } catch (error) {
      console.error('Failed to load note:', error);
    }
  },

  createNote: async () => {
    try {
      const note = await api.createNote();
      await get().loadNotes();
      set({ currentNote: note });
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  },

  updateNote: async (id: string, updates: { title?: string; content?: string }) => {
    set({ isSaving: true });
    try {
      await api.updateNote(id, updates);
      const { currentNote } = get();
      if (currentNote?.id === id) {
        set({ currentNote: { ...currentNote, ...updates, updatedAt: new Date().toISOString() } });
      }
      await get().loadNotes();
      set({ isSaving: false });
    } catch (error) {
      console.error('Failed to save note:', error);
      set({ isSaving: false });
    }
  },

  deleteNote: async (id: string) => {
    try {
      await api.deleteNote(id);
      if (get().currentNote?.id === id) {
        set({ currentNote: null });
      }
      await get().loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  },
}));
