import { useRef } from 'react';
import { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onNoteSelect: (id: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  sortBy: 'updated' | 'created' | 'title';
  onSortChange: (sortBy: 'updated' | 'created' | 'title') => void;
  onImportNote: (content: string, filename: string) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function NoteList({
  notes,
  selectedNoteId,
  onNoteSelect,
  onSearch,
  searchQuery,
  sortBy,
  onSortChange,
  onImportNote,
}: NoteListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onImportNote(content, file.name);
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  return (
    <div className="note-list">
      <div className="note-list-header">
        <input
          type="text"
          placeholder="Search notes..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
        <div className="note-list-toolbar">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'updated' | 'created' | 'title')}
          >
            <option value="updated">Last Updated</option>
            <option value="created">Created</option>
            <option value="title">Title</option>
          </select>
          <button
            className="import-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Import Markdown"
          >
            📥
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            style={{ display: 'none' }}
            onChange={handleFileImport}
          />
        </div>
      </div>

      <div className="note-list-content">
        {notes.map(note => (
          <div
            key={note.id}
            className={`note-card ${selectedNoteId === note.id ? 'selected' : ''}`}
            onClick={() => onNoteSelect(note.id)}
          >
            <div className="note-card-title">{note.title}</div>
            <div className="note-card-preview">
              {note.content.replace(/[#*`>\-]/g, '').slice(0, 80)}
            </div>
            <div className="note-card-meta">
              <div className="note-card-tags">
                {note.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="note-tag">{tag}</span>
                ))}
              </div>
              <span className="note-card-date">{formatDate(note.updatedAt)}</span>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="note-list-empty">
            <p>{searchQuery ? 'No notes found' : 'No notes yet'}</p>
            <p className="hint">{searchQuery ? 'Try a different search term' : 'Click "New Note" or import a .md file'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
