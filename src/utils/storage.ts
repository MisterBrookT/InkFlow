import { Note, Notebook } from '../types';

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
- **Local storage** - your data stays on your device
- **Search** across all your notes

## Getting Started

1. Create a new note by clicking the "New Note" button
2. Write your content using Markdown
3. Switch between edit, split, and preview modes using the toolbar

> Start capturing your thoughts! ✨`,
    notebookId: '1',
    tags: ['Getting Started'],
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
