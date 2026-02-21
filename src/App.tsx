import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { Note, Notebook } from './types';
import { loadNotes, saveNotes, loadNotebooks, saveNotebooks, searchNotes } from './utils/storage';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

type SortBy = 'updated' | 'created' | 'title';

function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updated');

  // Load data on mount
  useEffect(() => {
    const loadedNotes = loadNotes();
    const loadedNotebooks = loadNotebooks();
    setNotes(loadedNotes);
    setNotebooks(loadedNotebooks);

    // Load sort preference
    const savedSort = localStorage.getItem('inkflow_sort');
    if (savedSort) {
      setSortBy(savedSort as SortBy);
    }
  }, []);

  // Auto-save notes when they change
  useEffect(() => {
    if (notes.length > 0) {
      saveNotes(notes);
    }
  }, [notes]);

  // Auto-save notebooks when they change
  useEffect(() => {
    if (notebooks.length > 0) {
      saveNotebooks(notebooks);
    }
  }, [notebooks]);

  // Save sort preference
  useEffect(() => {
    localStorage.setItem('inkflow_sort', sortBy);
  }, [sortBy]);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  // Filter and sort notes
  const filteredNotes = (() => {
    let result = selectedNotebookId
      ? notes.filter(n => n.notebookId === selectedNotebookId)
      : notes;

    result = searchNotes(result, searchQuery);

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'updated') {
        return b.updatedAt - a.updatedAt;
      } else if (sortBy === 'created') {
        return b.createdAt - a.createdAt;
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return result;
  })();

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

  const handleTagsUpdate = useCallback((id: string, tags: string[]) => {
    setNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, tags, updatedAt: Date.now() }
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

  // Global keyboard shortcut for new note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleCreateNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateNote]);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  }, [selectedNoteId]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Notebook management
  const handleCreateNotebook = useCallback((name: string) => {
    const colors = ['#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4'];
    const newNotebook: Notebook = {
      id: uuidv4(),
      name,
      color: colors[notebooks.length % colors.length],
    };
    setNotebooks(prev => [...prev, newNotebook]);
  }, [notebooks.length]);

  const handleDeleteNotebook = useCallback((id: string) => {
    setNotebooks(prev => prev.filter(nb => nb.id !== id));
    // Move notes to "Daily Notes" (id: '1')
    setNotes(prev => prev.map(note =>
      note.notebookId === id
        ? { ...note, notebookId: '1' }
        : note
    ));
    if (selectedNotebookId === id) {
      setSelectedNotebookId(null);
    }
  }, [selectedNotebookId]);

  const handleRenameNotebook = useCallback((id: string, name: string) => {
    setNotebooks(prev => prev.map(nb =>
      nb.id === id ? { ...nb, name } : nb
    ));
  }, []);

  // Export/Import
  const handleExportNote = useCallback((note: Note) => {
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportNote = useCallback((content: string, filename: string) => {
    const title = filename.replace(/\.md$/i, '') || 'Imported Note';
    const newNote: Note = {
      id: uuidv4(),
      title,
      content,
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
        onCreateNotebook={handleCreateNotebook}
        onDeleteNotebook={handleDeleteNotebook}
        onRenameNotebook={handleRenameNotebook}
      />
      <NoteList
        notes={filteredNotes}
        selectedNoteId={selectedNoteId}
        onNoteSelect={handleNoteSelect}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onImportNote={handleImportNote}
      />
      <Editor
        note={selectedNote}
        onContentChange={handleNoteUpdate}
        onTitleChange={handleTitleUpdate}
        onTagsChange={handleTagsUpdate}
        onDelete={selectedNote ? () => handleDeleteNote(selectedNote.id) : undefined}
        onExport={selectedNote ? () => handleExportNote(selectedNote) : undefined}
      />
    </div>
  );
}

export default App;
