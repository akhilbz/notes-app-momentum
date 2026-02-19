import { app, ipcMain } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Note, NoteMetadata, NotesIndex } from '../shared/types';

const NOTES_DIR = path.join(app.getPath('userData'), 'notes');
const NOTES_FOLDER = path.join(NOTES_DIR, 'notes');
const INDEX_FILE = path.join(NOTES_DIR, 'notes-index.json');

// Ensure notes directory exists
async function ensureNotesDir(): Promise<void> {
  try {
    await fs.mkdir(NOTES_FOLDER, { recursive: true });
  } catch (error) {
    console.error('Failed to create notes directory:', error);
    throw error;
  }
}

// Read index file
async function readIndex(): Promise<NotesIndex> {
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

// Write index file atomically
async function writeIndex(index: NotesIndex): Promise<void> {
  const tempFile = INDEX_FILE + '.tmp';
  try {
    await fs.writeFile(tempFile, JSON.stringify(index, null, 2), 'utf-8');
    await fs.rename(tempFile, INDEX_FILE);
  } catch (error) {
    // Clean up temp file on error
    try {
      await fs.unlink(tempFile);
    } catch {}
    throw error;
  }
}

// Rebuild index from filesystem
async function rebuildIndex(): Promise<NotesIndex> {
  const index: NotesIndex = {};
  try {
    const files = await fs.readdir(NOTES_FOLDER);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const id = path.basename(file, '.md');
        const filepath = path.join(NOTES_FOLDER, file);
        try {
          const content = await fs.readFile(filepath, 'utf-8');
          const lines = content.split('\n');
          const title = lines[0] || 'Untitled';
          const stats = await fs.stat(filepath);
          index[id] = {
            id,
            title,
            createdAt: stats.birthtimeMs,
            updatedAt: stats.mtimeMs,
            filename: file,
          };
        } catch (error) {
          console.error(`Failed to read note ${file}:`, error);
        }
      }
    }
    await writeIndex(index);
  } catch (error) {
    console.error('Failed to rebuild index:', error);
  }
  return index;
}

// Read note file
async function readNoteFile(id: string): Promise<Note> {
  const filename = `${id}.md`;
  const filepath = path.join(NOTES_FOLDER, filename);
  
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const lines = content.split('\n');
    const title = lines[0] || 'Untitled';
    const noteContent = lines.slice(1).join('\n');
    
    const stats = await fs.stat(filepath);
    const index = await readIndex();
    const metadata = index[id];
    
    return {
      id,
      title,
      content: noteContent,
      createdAt: metadata?.createdAt || stats.birthtimeMs,
      updatedAt: metadata?.updatedAt || stats.mtimeMs,
      filepath,
    };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Note ${id} not found`);
    }
    throw error;
  }
}

// Write note file
async function writeNoteFile(note: Note): Promise<void> {
  const filename = `${note.id}.md`;
  const filepath = path.join(NOTES_FOLDER, filename);
  const content = `${note.title}\n${note.content}`;
  
  const tempFile = filepath + '.tmp';
  try {
    await fs.writeFile(tempFile, content, 'utf-8');
    await fs.rename(tempFile, filepath);
  } catch (error) {
    try {
      await fs.unlink(tempFile);
    } catch {}
    throw error;
  }
}

// Initialize IPC handlers
export function setupIPC(): void {
  // Ensure directory exists on startup
  ensureNotesDir().catch(console.error);

  // List all notes
  ipcMain.handle('list-notes', async (): Promise<NoteMetadata[]> => {
    try {
      await ensureNotesDir();
      let index: NotesIndex;
      try {
        index = await readIndex();
      } catch (error) {
        console.warn('Index corrupted, rebuilding...', error);
        index = await rebuildIndex();
      }
      
      const notes = Object.values(index);
      return notes.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Failed to list notes:', error);
      throw error;
    }
  });

  // Read a single note
  ipcMain.handle('read-note', async (_event, id: string): Promise<Note> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid note ID');
      }
      await ensureNotesDir();
      return await readNoteFile(id);
    } catch (error) {
      console.error(`Failed to read note ${id}:`, error);
      throw error;
    }
  });

  // Create a new note
  ipcMain.handle('create-note', async (_event, initialTitle?: string): Promise<Note> => {
    try {
      await ensureNotesDir();
      const id = uuidv4();
      const title = initialTitle?.trim() || 'Untitled';
      const note: Note = {
        id,
        title,
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        filepath: path.join(NOTES_FOLDER, `${id}.md`),
      };
      
      await writeNoteFile(note);
      
      const index = await readIndex();
      index[id] = {
        id,
        title,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        filename: `${id}.md`,
      };
      await writeIndex(index);
      
      return note;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  });

  // Update a note
  ipcMain.handle('update-note', async (_event, id: string, updates: { title?: string; content?: string }): Promise<void> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid note ID');
      }
      await ensureNotesDir();
      
      const note = await readNoteFile(id);
      const updatedNote: Note = {
        ...note,
        ...(updates.title !== undefined && { title: updates.title.trim() || 'Untitled' }),
        ...(updates.content !== undefined && { content: updates.content }),
        updatedAt: Date.now(),
      };
      
      await writeNoteFile(updatedNote);
      
      const index = await readIndex();
      if (index[id]) {
        index[id] = {
          ...index[id],
          title: updatedNote.title,
          updatedAt: updatedNote.updatedAt,
        };
        await writeIndex(index);
      }
    } catch (error) {
      console.error(`Failed to update note ${id}:`, error);
      throw error;
    }
  });

  // Rename a note
  ipcMain.handle('rename-note', async (_event, id: string, newTitle: string): Promise<void> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid note ID');
      }
      if (!newTitle || typeof newTitle !== 'string' || !newTitle.trim()) {
        throw new Error('Title cannot be empty');
      }
      if (newTitle.length > 200) {
        throw new Error('Title too long (max 200 characters)');
      }
      
      await ensureNotesDir();
      const note = await readNoteFile(id);
      const updatedNote: Note = {
        ...note,
        title: newTitle.trim(),
        updatedAt: Date.now(),
      };
      
      await writeNoteFile(updatedNote);
      
      const index = await readIndex();
      if (index[id]) {
        index[id] = {
          ...index[id],
          title: updatedNote.title,
          updatedAt: updatedNote.updatedAt,
        };
        await writeIndex(index);
      }
    } catch (error) {
      console.error(`Failed to rename note ${id}:`, error);
      throw error;
    }
  });

  // Delete a note
  ipcMain.handle('delete-note', async (_event, id: string): Promise<void> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid note ID');
      }
      await ensureNotesDir();
      
      const filename = `${id}.md`;
      const filepath = path.join(NOTES_FOLDER, filename);
      
      try {
        await fs.unlink(filepath);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
      
      const index = await readIndex();
      delete index[id];
      await writeIndex(index);
    } catch (error) {
      console.error(`Failed to delete note ${id}:`, error);
      throw error;
    }
  });

  // Reveal notes folder in file explorer
  ipcMain.handle('reveal-notes-folder', async (): Promise<void> => {
    const { shell } = await import('electron');
    await shell.openPath(NOTES_DIR);
  });
}
