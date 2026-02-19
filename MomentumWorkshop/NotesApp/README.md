# Electron Note Taking App

A premium-feeling offline note-taking desktop application built with Electron, React, TypeScript, and Tailwind CSS. Features a modern, minimal UI inspired by Notion, with full offline functionality and local file storage.

## Features

- **Offline-First**: All notes are stored locally on your machine - no cloud required
- **Auto-Save**: Notes are automatically saved as you type (debounced 500ms)
- **Command Palette**: Quick access to all actions via ⌘K / Ctrl+K
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Keyboard Shortcuts**: 
  - ⌘N / Ctrl+N: Create new note
  - ⌘S / Ctrl+S: Manual save
  - ⌘K / Ctrl+K: Open command palette
- **Search**: Quickly find notes by title
- **Rich UX**: Loading states, empty states, toast notifications, and smooth transitions

## Tech Stack

- **Electron**: Desktop app framework
- **React + TypeScript**: UI framework with type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality React components built on Radix UI
- **Zustand**: Lightweight state management
- **date-fns**: Date formatting utilities

## Project Structure

```
MomentumWorkshop/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry point
│   ├── preload.ts        # Preload script (exposes window.api)
│   └── ipc.ts            # IPC handlers (filesystem operations)
├── src/                   # React renderer process
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── Sidebar.tsx  # Notes list sidebar
│   │   ├── Editor.tsx   # Note editor
│   │   ├── TopBar.tsx   # Top bar with actions
│   │   └── ...
│   ├── features/
│   │   └── notes/
│   │       └── store.ts  # Zustand store
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API wrapper
│   └── styles/           # Global styles
├── shared/                # Shared TypeScript types
│   └── types.ts
└── package.json
```

## Architecture

### Process Separation

The app follows Electron's security best practices:

- **Main Process** (`electron/main.ts`): Handles filesystem operations, window management, and IPC handlers
- **Preload Script** (`electron/preload.ts`): Exposes a secure `window.api` interface
- **Renderer Process** (`src/`): React app with UI components and state management

### IPC Communication Flow

```
Renderer → window.api.method() → Preload → IPC → Main Process → Filesystem
```

### Data Storage

Notes are stored locally in:
- **Location**: `{app.getPath('userData')}/notes/`
- **Structure**:
  - `notes-index.json`: Metadata index for fast listing
  - `notes/{id}.md`: Individual note files (Markdown format)

Each note contains:
- `id`: UUID
- `title`: Note title
- `content`: Note body
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp
- `filepath`: Full file path

## Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start development server:
```bash
pnpm dev
```

This will:
- Start the Vite dev server on `http://localhost:5173`
- Launch Electron with hot reload enabled

### Building

To build for production:
```bash
pnpm build
```

This will:
- Compile TypeScript
- Build the React app
- Bundle Electron files
- Create distributable packages

## IPC API Contract

The preload script exposes `window.api` with the following methods:

### `listNotes(): Promise<NoteMetadata[]>`
Returns all notes sorted by `updatedAt` (descending).

### `readNote(id: string): Promise<Note>`
Reads a single note by ID.

### `createNote(initialTitle?: string): Promise<Note>`
Creates a new note with optional initial title. Returns the created note.

### `updateNote(id: string, updates: { title?: string; content?: string }): Promise<void>`
Updates note title and/or content. Auto-saves are debounced.

### `renameNote(id: string, newTitle: string): Promise<void>`
Renames a note. Validates title (non-empty, max 200 chars).

### `deleteNote(id: string): Promise<void>`
Deletes a note and removes its file.

### `revealNotesFolder(): Promise<void>`
Opens the notes folder in the system file explorer.

## Security Considerations

1. **Context Isolation**: Enabled - renderer has no direct Node access
2. **Node Integration**: Disabled - all Node APIs accessed via IPC
3. **IPC Validation**: All inputs validated in main process
4. **Path Sanitization**: Notes stored only in app-controlled directory
5. **Atomic Writes**: File operations use temp files + rename for safety

## Development

### Key Files

- `electron/main.ts`: Electron window setup and lifecycle
- `electron/ipc.ts`: Filesystem operations and IPC handlers
- `electron/preload.ts`: Secure API bridge
- `src/features/notes/store.ts`: Zustand store with all note operations
- `src/components/Editor.tsx`: Note editor with auto-save
- `src/components/Sidebar.tsx`: Notes list with search

### Adding Features

The architecture is designed for extensibility:

- **Markdown Preview**: Ready to add (content already stored as Markdown)
- **Tags/Categories**: Extend `Note` type and add filtering UI
- **Rich Text Editor**: Replace textarea with TipTap/ProseMirror
- **Export**: Add IPC handler for export functionality
- **Themes**: Already supports dark mode via shadcn theme system

## Troubleshooting

### Notes not loading
- Check that the notes directory exists: `{userData}/notes/`
- Verify `notes-index.json` is valid JSON
- Check console for errors (DevTools: ⌘+Option+I / Ctrl+Shift+I)

### Auto-save not working
- Check browser console for errors
- Verify filesystem permissions
- Check disk space

### IPC errors
- Ensure preload script is loaded (check DevTools console)
- Verify `window.api` is available in renderer
- Check main process logs

## License

MIT
