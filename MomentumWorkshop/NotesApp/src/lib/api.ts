import type { Note, NoteMetadata } from '@shared/types';

declare global {
  interface Window {
    api: {
      listNotes: () => Promise<NoteMetadata[]>;
      readNote: (id: string) => Promise<Note>;
      createNote: (initialTitle?: string) => Promise<Note>;
      updateNote: (id: string, updates: { title?: string; content?: string }) => Promise<void>;
      renameNote: (id: string, newTitle: string) => Promise<void>;
      deleteNote: (id: string) => Promise<void>;
      revealNotesFolder: () => Promise<void>;
    };
  }
}

// Safely get the API, checking if it's available
function getApi() {
  if (typeof window === 'undefined') {
    throw new Error('window is not defined');
  }
  if (!window.api) {
    console.error('window.api is not available. Preload script may not have loaded.');
    throw new Error('Electron API not available. Make sure preload script is loaded.');
  }
  return window.api;
}

export const api = {
  listNotes: () => getApi().listNotes(),
  readNote: (id: string) => getApi().readNote(id),
  createNote: (initialTitle?: string) => getApi().createNote(initialTitle),
  updateNote: (id: string, updates: { title?: string; content?: string }) =>
    getApi().updateNote(id, updates),
  renameNote: (id: string, newTitle: string) => getApi().renameNote(id, newTitle),
  deleteNote: (id: string) => getApi().deleteNote(id),
  revealNotesFolder: () => getApi().revealNotesFolder(),
};
