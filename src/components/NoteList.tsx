import { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onNoteSelect: (id: string) => void;
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

export function NoteList({ notes, selectedNoteId, onNoteSelect }: NoteListProps) {
  return (
    <div className="note-list">
      <div className="note-list-header">
        <input
          type="text"
          placeholder="Search notes..."
          className="search-input"
        />
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
            <p>No notes yet</p>
            <p className="hint">Click "New Note" to start</p>
          </div>
        )}
      </div>
    </div>
  );
}
