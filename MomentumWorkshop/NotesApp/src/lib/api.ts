import type { Note, NoteMetadata } from '@shared/types';

declare global {
  interface Window {
    api: {
      listNotes: () => Promise<NoteMetadata[]>;
      readNote: (id: string) => Promise<Note>;
      createNote: () => Promise<Note>;
      updateNote: (id: string, updates: { title?: string; content?: string }) => Promise<void>;
      deleteNote: (id: string) => Promise<void>;
    };
  }
}

async function waitForApi(): Promise<Window['api']> {
  if (window.api) return window.api;

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.api) {
        clearInterval(interval);
        resolve(window.api);
      } else if (Date.now() - start > 10000) {
        clearInterval(interval);
        reject(new Error('Electron API not available'));
      }
    }, 100);
  });
}

export const api = {
  listNotes: async () => (await waitForApi()).listNotes(),
  readNote: async (id: string) => (await waitForApi()).readNote(id),
  createNote: async () => (await waitForApi()).createNote(),
  updateNote: async (id: string, updates: { title?: string; content?: string }) =>
    (await waitForApi()).updateNote(id, updates),
  deleteNote: async (id: string) => (await waitForApi()).deleteNote(id),
};
