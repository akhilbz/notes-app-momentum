export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  filepath: string;
}

export interface NoteMetadata {
  id: string;
  title: string;
  updatedAt: number;
  createdAt: number;
  filename: string;
}

export interface NotesIndex {
  [id: string]: NoteMetadata;
}

export interface IPCError {
  message: string;
  code?: string;
}
