import { contextBridge, ipcRenderer } from 'electron';
import type { Note, NoteMetadata } from '../shared/types';

export interface ElectronAPI {
  listNotes: () => Promise<NoteMetadata[]>;
  readNote: (id: string) => Promise<Note>;
  createNote: (initialTitle?: string) => Promise<Note>;
  updateNote: (id: string, updates: { title?: string; content?: string }) => Promise<void>;
  renameNote: (id: string, newTitle: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  revealNotesFolder: () => Promise<void>;
}

const api: ElectronAPI = {
  listNotes: () => ipcRenderer.invoke('list-notes'),
  readNote: (id: string) => ipcRenderer.invoke('read-note', id),
  createNote: (initialTitle?: string) => ipcRenderer.invoke('create-note', initialTitle),
  updateNote: (id: string, updates: { title?: string; content?: string }) =>
    ipcRenderer.invoke('update-note', id, updates),
  renameNote: (id: string, newTitle: string) => ipcRenderer.invoke('rename-note', id, newTitle),
  deleteNote: (id: string) => ipcRenderer.invoke('delete-note', id),
  revealNotesFolder: () => ipcRenderer.invoke('reveal-notes-folder'),
};

contextBridge.exposeInMainWorld('api', api);

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
