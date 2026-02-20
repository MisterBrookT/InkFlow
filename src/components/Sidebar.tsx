import { useState, useRef } from 'react';
import { Notebook } from '../types';

interface SidebarProps {
  notebooks: Notebook[];
  selectedNotebookId: string | null;
  onNotebookSelect: (id: string | null) => void;
  onNewNote: () => void;
  onCreateNotebook: (name: string) => void;
  onDeleteNotebook: (id: string) => void;
  onRenameNotebook: (id: string, name: string) => void;
}

export function Sidebar({
  notebooks,
  selectedNotebookId,
  onNotebookSelect,
  onNewNote,
  onCreateNotebook,
  onDeleteNotebook,
  onRenameNotebook,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showNewNotebook, setShowNewNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = (notebook: Notebook) => {
    setEditingId(notebook.id);
    setEditName(notebook.name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editingId) {
      onRenameNotebook(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCreateNotebook = () => {
    if (newNotebookName.trim()) {
      onCreateNotebook(newNotebookName.trim());
      setNewNotebookName('');
      setShowNewNotebook(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">✒️</span>
          <span className="logo-text">InkFlow</span>
        </div>
      </div>

      <div className="sidebar-actions">
        <button className="new-note-btn" onClick={onNewNote}>
          <span className="icon">+</span>
          <span>New Note</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${selectedNotebookId === null ? 'active' : ''}`}
          onClick={() => onNotebookSelect(null)}
        >
          <span className="icon">📒</span>
          <span>All Notes</span>
        </div>

        <div className="nav-section">
          <div className="nav-section-header">
            <div className="nav-section-title">Notebooks</div>
            <button
              className="nav-section-action"
              onClick={() => setShowNewNotebook(true)}
              title="Create notebook"
            >
              +
            </button>
          </div>

          {showNewNotebook && (
            <div className="nav-item-edit">
              <input
                ref={inputRef}
                type="text"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                onBlur={handleCreateNotebook}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNotebook();
                  if (e.key === 'Escape') {
                    setShowNewNotebook(false);
                    setNewNotebookName('');
                  }
                }}
                placeholder="Notebook name..."
                className="edit-input"
              />
            </div>
          )}

          {notebooks.map(notebook => (
            <div
              key={notebook.id}
              className={`nav-item ${selectedNotebookId === notebook.id ? 'active' : ''}`}
              onClick={() => editingId !== notebook.id && onNotebookSelect(notebook.id)}
            >
              <span className="icon" style={{ color: notebook.color }}>📁</span>
              {editingId === notebook.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditName('');
                    }
                  }}
                  className="edit-input"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="nav-item-name">{notebook.name}</span>
                  <div className="nav-item-actions">
                    <button
                      className="nav-item-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(notebook);
                      }}
                      title="Rename"
                    >
                      ✏️
                    </button>
                    {notebook.id !== '1' && notebook.id !== '2' && notebook.id !== '3' && (
                      <button
                        className="nav-item-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${notebook.name}"? Notes will be moved to Daily Notes.`)) {
                            onDeleteNotebook(notebook.id);
                          }
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Tags</div>
          <div className="nav-item">
            <span className="tag-dot" style={{ background: '#4caf50' }}></span>
            <span>Work</span>
          </div>
          <div className="nav-item">
            <span className="tag-dot" style={{ background: '#2196f3' }}></span>
            <span>Learning</span>
          </div>
          <div className="nav-item">
            <span className="tag-dot" style={{ background: '#ff9800' }}></span>
            <span>Life</span>
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <span className="status">v1.0.0</span>
      </div>
    </aside>
  );
}
