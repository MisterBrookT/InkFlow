import { Note, Notebook, NoteStatus } from '../types';
import { invoke } from '@tauri-apps/api/core';

const STORAGE_KEYS = {
  NOTES: 'inkflow_notes',
  NOTEBOOKS: 'inkflow_notebooks',
};

// Default notebooks
const defaultNotebooks: Notebook[] = [
  { id: '1', name: 'Daily Notes', color: '#4caf50' },
  { id: '2', name: 'Work', color: '#2196f3' },
  { id: '3', name: 'Learning', color: '#ff9800' },
];

// Default notes
const defaultNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to InkFlow',
    content: `# Welcome to InkFlow

A clean and elegant note-taking app.

## Features

- **Markdown editing** with live preview
- **Notebook organization** for your notes
- **Tag system** for easy categorization
- **Note status** - track your work progress
- **Local storage** - your data stays on your device
- **Search** across all your notes
- **Pin notes** to keep important ones at top

## Getting Started

1. Create a new note by clicking the "New Note" button
2. Write your content using Markdown
3. Switch between edit, split, and preview modes using the toolbar
4. Set status to track progress (Active, On Hold, Completed, Dropped)

> Start capturing your thoughts! ✨`,
    notebookId: '1',
    tags: ['Getting Started'],
    status: 'completed',
    pinned: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    title: 'Markdown Cheat Sheet',
    content: `# Markdown Cheat Sheet

## Text Formatting

**Bold text** and *italic text*
~~Strikethrough~~

## Headings

# Heading 1
## Heading 2
### Heading 3

## Lists

- Item 1
- Item 2
  - Nested item

1. First
2. Second

## Code

Inline \`code\` here

\`\`\`javascript
function hello() {
  console.log("Hello, InkFlow!");
}
\`\`\`

## Quotes

> This is a blockquote

## Links & Images

[Link text](https://example.com)

## Tables

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`,
    notebookId: '3',
    tags: ['Reference', 'Markdown'],
    status: 'active',
    pinned: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
];

// Check if running in Tauri
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

// Load notes from storage
export async function loadNotes(): Promise<Note[]> {
  if (isTauri()) {
    try {
      const notes = await invoke<string>('load_notes');
      return JSON.parse(notes);
    } catch {
      // First run, create default notes
      await saveNotes(defaultNotes);
      return defaultNotes;
    }
  } else {
    // Fallback to localStorage for web
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(defaultNotes));
    return defaultNotes;
  }
}

// Save notes to storage
export async function saveNotes(notes: Note[]): Promise<void> {
  if (isTauri()) {
    await invoke('save_notes', { notesJson: JSON.stringify(notes) });
  } else {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }
}

// Load notebooks from storage
export async function loadNotebooks(): Promise<Notebook[]> {
  if (isTauri()) {
    try {
      const notebooks = await invoke<string>('load_notebooks');
      return JSON.parse(notebooks);
    } catch {
      await saveNotebooks(defaultNotebooks);
      return defaultNotebooks;
    }
  } else {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTEBOOKS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notebooks:', error);
    }
    localStorage.setItem(STORAGE_KEYS.NOTEBOOKS, JSON.stringify(defaultNotebooks));
    return defaultNotebooks;
  }
}

// Save notebooks to storage
export async function saveNotebooks(notebooks: Notebook[]): Promise<void> {
  if (isTauri()) {
    await invoke('save_notebooks', { notebooksJson: JSON.stringify(notebooks) });
  } else {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTEBOOKS, JSON.stringify(notebooks));
    } catch (error) {
      console.error('Failed to save notebooks:', error);
    }
  }
}

// Search notes by query
export function searchNotes(notes: Note[], query: string): Note[] {
  if (!query.trim()) {
    return notes;
  }

  const lowerQuery = query.toLowerCase();
  return notes.filter(
    note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// MCP API functions for AI integration
export async function mcpListNotes(options?: {
  notebookId?: string;
  status?: NoteStatus;
  keyword?: string;
}): Promise<Note[]> {
  let notes = await loadNotes();
  
  if (options?.notebookId) {
    notes = notes.filter(n => n.notebookId === options.notebookId);
  }
  
  if (options?.status) {
    notes = notes.filter(n => n.status === options.status);
  }
  
  if (options?.keyword) {
    notes = searchNotes(notes, options.keyword);
  }
  
  return notes;
}

export async function mcpGetNote(noteId: string): Promise<Note | null> {
  const notes = await loadNotes();
  return notes.find(n => n.id === noteId) || null;
}

export async function mcpCreateNote(options: {
  title: string;
  body: string;
  notebookId: string;
  status?: NoteStatus;
}): Promise<Note> {
  const notes = await loadNotes();
  const newNote: Note = {
    id: `note:${Date.now()}`,
    title: options.title,
    content: options.body,
    notebookId: options.notebookId,
    tags: [],
    status: options.status || 'active',
    pinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  notes.push(newNote);
  await saveNotes(notes);
  return newNote;
}

export async function mcpUpdateNote(noteId: string, updates: {
  title?: string;
  body?: string;
  status?: NoteStatus;
}): Promise<Note | null> {
  const notes = await loadNotes();
  const index = notes.findIndex(n => n.id === noteId);
  if (index === -1) return null;
  
  if (updates.title) notes[index].title = updates.title;
  if (updates.body) notes[index].content = updates.body;
  if (updates.status) notes[index].status = updates.status;
  notes[index].updatedAt = Date.now();
  
  await saveNotes(notes);
  return notes[index];
}

export async function mcpDeleteNote(noteId: string): Promise<boolean> {
  const notes = await loadNotes();
  const index = notes.findIndex(n => n.id === noteId);
  if (index === -1) return false;
  
  notes.splice(index, 1);
  await saveNotes(notes);
  return true;
}

export async function mcpListNotebooks(): Promise<Notebook[]> {
  return loadNotebooks();
}

// GitHub Sync functions
export async function exportNotesAsMarkdown(notesJson: string): Promise<string> {
  if (isTauri()) {
    return await invoke<string>('export_notes_as_markdown', { notesJson });
  }
  throw new Error('Export only available in desktop app');
}

export async function gitStatus(repoPath: string): Promise<string> {
  if (isTauri()) {
    return await invoke<string>('git_status', { repoPath });
  }
  throw new Error('Git operations only available in desktop app');
}

export async function gitAddAll(repoPath: string): Promise<string> {
  if (isTauri()) {
    return await invoke<string>('git_add_all', { repoPath });
  }
  throw new Error('Git operations only available in desktop app');
}

export async function gitCommit(repoPath: string, message: string): Promise<string> {
  if (isTauri()) {
    return await invoke<string>('git_commit', { repoPath, message });
  }
  throw new Error('Git operations only available in desktop app');
}

export async function gitPush(repoPath: string): Promise<string> {
  if (isTauri()) {
    return await invoke<string>('git_push', { repoPath });
  }
  throw new Error('Git operations only available in desktop app');
}

export async function gitPull(repoPath: string): Promise<string> {
  if (isTauri()) {
    return await invoke<string>('git_pull', { repoPath });
  }
  throw new Error('Git operations only available in desktop app');
}
