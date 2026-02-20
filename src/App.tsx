import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { Note, Notebook } from './types';
import { loadNotes, saveNotes, loadNotebooks, saveNotebooks, searchNotes } from './utils/storage';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load data on mount
  useEffect(() => {
    const loadedNotes = loadNotes();
    const loadedNotebooks = loadNotebooks();
    setNotes(loadedNotes);
    setNotebooks(loadedNotebooks);
  }, []);

  // Auto-save notes when they change
  useEffect(() => {
    if (notes.length > 0) {
      saveNotes(notes);
    }
  }, [notes]);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  // Filter notes by notebook and search query
  const displayedNotes = searchNotes(
    selectedNotebookId ? notes.filter(n => n.notebookId === selectedNotebookId) : notes,
    searchQuery
  );

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

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  }, [selectedNoteId]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="app">
      <Sidebar
        notebooks={notebooks}
        selectedNotebookId={selectedNotebookId}
        onNotebookSelect={handleNotebookSelect}
        onNewNote={handleCreateNote}
      />
      <NoteList
        notes={displayedNotes}
        selectedNoteId={selectedNoteId}
        onNoteSelect={handleNoteSelect}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      <Editor
        note={selectedNote}
        onContentChange={handleNoteUpdate}
        onTitleChange={handleTitleUpdate}
        onDelete={selectedNote ? () => handleDeleteNote(selectedNote.id) : undefined}
      />
    </div>
  );
}

export default App;
