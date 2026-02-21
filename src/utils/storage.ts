import { Note, Notebook, NoteStatus } from '../types';

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

// Load notes from localStorage
export function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load notes:', error);
  }
  // Save default notes on first load
  saveNotes(defaultNotes);
  return defaultNotes;
}

// Save notes to localStorage
export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes:', error);
  }
}

// Load notebooks from localStorage
export function loadNotebooks(): Notebook[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTEBOOKS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load notebooks:', error);
  }
  // Save default notebooks on first load
  saveNotebooks(defaultNotebooks);
  return defaultNotebooks;
}

// Save notebooks to localStorage
export function saveNotebooks(notebooks: Notebook[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTEBOOKS, JSON.stringify(notebooks));
  } catch (error) {
    console.error('Failed to save notebooks:', error);
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
export function mcpListNotes(options?: {
  notebookId?: string;
  status?: NoteStatus;
  keyword?: string;
}): Note[] {
  let notes = loadNotes();
  
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

export function mcpGetNote(noteId: string): Note | null {
  const notes = loadNotes();
  return notes.find(n => n.id === noteId) || null;
}

export function mcpCreateNote(options: {
  title: string;
  body: string;
  notebookId: string;
  status?: NoteStatus;
}): Note {
  const notes = loadNotes();
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
  saveNotes(notes);
  return newNote;
}

export function mcpUpdateNote(noteId: string, updates: {
  title?: string;
  body?: string;
  status?: NoteStatus;
}): Note | null {
  const notes = loadNotes();
  const index = notes.findIndex(n => n.id === noteId);
  if (index === -1) return null;
  
  if (updates.title) notes[index].title = updates.title;
  if (updates.body) notes[index].content = updates.body;
  if (updates.status) notes[index].status = updates.status;
  notes[index].updatedAt = Date.now();
  
  saveNotes(notes);
  return notes[index];
}

export function mcpDeleteNote(noteId: string): boolean {
  const notes = loadNotes();
  const index = notes.findIndex(n => n.id === noteId);
  if (index === -1) return false;
  
  notes.splice(index, 1);
  saveNotes(notes);
  return true;
}

export function mcpListNotebooks(): Notebook[] {
  return loadNotebooks();
}
