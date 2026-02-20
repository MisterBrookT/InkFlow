import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { Note, Notebook } from './types';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

// Demo data
const demoNotebooks: Notebook[] = [
  { id: '1', name: 'Daily Notes', color: '#4caf50' },
  { id: '2', name: 'Work', color: '#2196f3' },
  { id: '3', name: 'Learning', color: '#ff9800' },
];

const demoNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to InkFlow',
    content: '# Welcome to InkFlow\n\nA clean and elegant note-taking app.\n\n## Features\n\n- Markdown editing\n- Notebook organization\n- Tag system\n\n> Start capturing your thoughts!',
    notebookId: '1',
    tags: ['Getting Started'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    title: 'Code Snippet',
    content: '# Code Snippet\n\n```javascript\nconst greeting = "Hello, InkFlow!";\nconsole.log(greeting);\n```\n\nBeautiful code highlighting!',
    notebookId: '2',
    tags: ['Code'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
];

function App() {
  const [notebooks] = useState<Notebook[]>(demoNotebooks);
  const [notes, setNotes] = useState<Note[]>(demoNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(demoNotes[0]?.id || null);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  const filteredNotes = selectedNotebookId
    ? notes.filter(n => n.notebookId === selectedNotebookId)
    : notes;

  const handleNoteSelect = useCallback((id: string) => {
    setSelectedNoteId(id);
  }, []);

  const handleNotebookSelect = useCallback((id: string | null) => {
    setSelectedNotebookId(id);
    setSelectedNoteId(null);
  }, []);

  const handleNoteUpdate = useCallback((id: string, content: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, content, updatedAt: Date.now() }
        : note
    ));
  }, []);

  const handleTitleUpdate = useCallback((id: string, title: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, title, updatedAt: Date.now() }
        : note
    ));
  }, []);

  const handleCreateNote = useCallback(() => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'New Note',
      content: '',
      notebookId: selectedNotebookId || '1',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  }, [selectedNotebookId]);

  return (
    <div className="app">
      <Sidebar
        notebooks={notebooks}
        selectedNotebookId={selectedNotebookId}
        onNotebookSelect={handleNotebookSelect}
        onNewNote={handleCreateNote}
      />
      <NoteList
        notes={filteredNotes}
        selectedNoteId={selectedNoteId}
        onNoteSelect={handleNoteSelect}
      />
      <Editor
        note={selectedNote}
        onContentChange={handleNoteUpdate}
        onTitleChange={handleTitleUpdate}
      />
    </div>
  );
}

export default App;
