export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteMetadata {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

export interface NotesIndex {
  [id: string]: NoteMetadata;
}
