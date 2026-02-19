import { app, ipcMain } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Note, NoteMetadata, NotesIndex } from '../shared/types';

function getNotesDir(): string {
  return path.join(app.getAppPath(), 'notes');
}

function getIndexFile(): string {
  return path.join(getNotesDir(), 'notes-index.json');
}

async function ensureNotesDir(): Promise<void> {
  await fs.mkdir(getNotesDir(), { recursive: true });
}

async function readIndex(): Promise<NotesIndex> {
  try {
    const data = await fs.readFile(getIndexFile(), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeIndex(index: NotesIndex): Promise<void> {
  await fs.writeFile(getIndexFile(), JSON.stringify(index, null, 2), 'utf-8');
}

async function readNoteFile(id: string): Promise<Note> {
  const filepath = path.join(getNotesDir(), `${id}.json`);
  const content = await fs.readFile(filepath, 'utf-8');
  return JSON.parse(content) as Note;
}

async function writeNoteFile(note: Note): Promise<void> {
  const filepath = path.join(getNotesDir(), `${note.id}.json`);
  await fs.writeFile(filepath, JSON.stringify(note, null, 2), 'utf-8');
}

export function setupIPC(): void {
  ensureNotesDir().catch(console.error);

  ipcMain.handle('list-notes', async (): Promise<NoteMetadata[]> => {
    await ensureNotesDir();
    const index = await readIndex();
    return Object.values(index).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });

  ipcMain.handle('read-note', async (_event, id: string): Promise<Note> => {
    await ensureNotesDir();
    return await readNoteFile(id);
  });

  ipcMain.handle('create-note', async (): Promise<Note> => {
    await ensureNotesDir();
    const id = uuidv4();
    const now = new Date().toISOString();
    const note: Note = { id, title: 'Untitled', content: '', createdAt: now, updatedAt: now };

    await writeNoteFile(note);
    const index = await readIndex();
    index[id] = { id, title: note.title, createdAt: now, updatedAt: now };
    await writeIndex(index);

    return note;
  });

  ipcMain.handle('update-note', async (_event, id: string, updates: { title?: string; content?: string }): Promise<void> => {
    await ensureNotesDir();
    const note = await readNoteFile(id);
    const updatedNote: Note = {
      ...note,
      ...(updates.title !== undefined && { title: updates.title || 'Untitled' }),
      ...(updates.content !== undefined && { content: updates.content }),
      updatedAt: new Date().toISOString(),
    };

    await writeNoteFile(updatedNote);
    const index = await readIndex();
    if (index[id]) {
      index[id] = { ...index[id], title: updatedNote.title, updatedAt: updatedNote.updatedAt };
      await writeIndex(index);
    }
  });

  ipcMain.handle('delete-note', async (_event, id: string): Promise<void> => {
    await ensureNotesDir();
    const filepath = path.join(getNotesDir(), `${id}.json`);
    try { await fs.unlink(filepath); } catch {}
    const index = await readIndex();
    delete index[id];
    await writeIndex(index);
  });
}
