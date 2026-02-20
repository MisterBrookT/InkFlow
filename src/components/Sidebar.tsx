import { Notebook } from '../types';

interface SidebarProps {
  notebooks: Notebook[];
  selectedNotebookId: string | null;
  onNotebookSelect: (id: string | null) => void;
  onNewNote: () => void;
}

export function Sidebar({
  notebooks,
  selectedNotebookId,
  onNotebookSelect,
  onNewNote,
}: SidebarProps) {
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
          <div className="nav-section-title">Notebooks</div>
          {notebooks.map(notebook => (
            <div
              key={notebook.id}
              className={`nav-item ${selectedNotebookId === notebook.id ? 'active' : ''}`}
              onClick={() => onNotebookSelect(notebook.id)}
            >
              <span className="icon" style={{ color: notebook.color }}>📁</span>
              <span>{notebook.name}</span>
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
        <span className="status">Syncing...</span>
      </div>
    </aside>
  );
}
