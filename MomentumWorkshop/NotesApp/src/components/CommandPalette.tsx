import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNotesStore } from '@/features/notes/store';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import { useRenameModal } from './RenameModal';
import { useDeleteModal } from './DeleteModal';

interface CommandPaletteContext {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandPaletteContext = React.createContext<CommandPaletteContext | null>(null);

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return context;
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const notes = useNotesStore((state) => state.notes);
  const currentNote = useNotesStore((state) => state.currentNote);
  const createNote = useNotesStore((state) => state.createNote);
  const selectNote = useNotesStore((state) => state.selectNote);
  const { openRenameModal } = useRenameModal();
  const { openDeleteModal } = useDeleteModal();

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              createNote();
              setOpen(false);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New Note</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Notes">
          {notes.map((note) => (
            <CommandItem
              key={note.id}
              onSelect={() => {
                selectNote(note.id);
                setOpen(false);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>{note.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        {currentNote && (
          <CommandGroup heading="Current Note">
            <CommandItem
              onSelect={() => {
                openRenameModal(currentNote.id, currentNote.title);
                setOpen(false);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              <span>Rename</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                openDeleteModal(currentNote.id, currentNote.title);
                setOpen(false);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
