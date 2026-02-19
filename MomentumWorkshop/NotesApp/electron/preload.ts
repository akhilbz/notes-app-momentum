import { contextBridge, ipcRenderer } from 'electron';

const api = {
  listNotes: () => ipcRenderer.invoke('list-notes'),
  readNote: (id: string) => ipcRenderer.invoke('read-note', id),
  createNote: () => ipcRenderer.invoke('create-note'),
  updateNote: (id: string, updates: { title?: string; content?: string }) =>
    ipcRenderer.invoke('update-note', id, updates),
  deleteNote: (id: string) => ipcRenderer.invoke('delete-note', id),
};

contextBridge.exposeInMainWorld('api', api);
