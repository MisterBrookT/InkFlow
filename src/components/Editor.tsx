import { useEffect, useRef, useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Note } from '../types';
import 'highlight.js/styles/github-dark.css';

interface EditorProps {
  note: Note | null;
  onContentChange: (id: string, content: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onTagsChange: (id: string, tags: string[]) => void;
  onDelete?: () => void;
  onExport?: () => void;
}

type ViewMode = 'edit' | 'preview' | 'split';

export function Editor({ note, onContentChange, onTitleChange, onTagsChange, onDelete, onExport }: EditorProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note && titleRef.current) {
      titleRef.current.value = note.title;
    }
  }, [note?.id]);

  useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagInput]);

  const handleTitleBlur = useCallback(() => {
    if (note && titleRef.current) {
      const newTitle = titleRef.current.value.trim() || 'Untitled';
      if (newTitle !== note.title) {
        onTitleChange(note.id, newTitle);
      }
    }
  }, [note, onTitleChange]);

  const handleContentChange = useCallback((content: string) => {
    if (note) {
      onContentChange(note.id, content);
    }
  }, [note, onContentChange]);

  const handleAddTag = useCallback(() => {
    if (note && newTag.trim()) {
      const tag = newTag.trim();
      if (!note.tags.includes(tag)) {
        onTagsChange(note.id, [...note.tags, tag]);
      }
      setNewTag('');
      setShowTagInput(false);
    }
  }, [note, newTag, onTagsChange]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    if (note) {
      onTagsChange(note.id, note.tags.filter(tag => tag !== tagToRemove));
    }
  }, [note, onTagsChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'n':
          case 'N':
            // New note - handled by parent
            break;
          case 'e':
          case 'E':
            if (onExport) {
              e.preventDefault();
              onExport();
            }
            break;
          case '1':
            e.preventDefault();
            setViewMode('edit');
            break;
          case '2':
            e.preventDefault();
            setViewMode('split');
            break;
          case '3':
            e.preventDefault();
            setViewMode('preview');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExport]);

  if (!note) {
    return (
      <div className="editor editor-empty">
        <div className="empty-state">
          <span className="empty-icon">✒️</span>
          <p>Select a note to edit</p>
          <p className="hint">Or create a new note</p>
          <div className="shortcuts-hint">
            <div>⌘N - New note</div>
            <div>⌘E - Export note</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor">
      <div className="editor-header">
        <div className="editor-header-row">
          <input
            ref={titleRef}
            type="text"
            className="note-title-input"
            defaultValue={note.title}
            onBlur={handleTitleBlur}
            placeholder="Title"
          />
          <div className="editor-header-actions">
            {onExport && (
              <button className="header-btn" onClick={onExport} title="Export (⌘E)">
                📤
              </button>
            )}
            {onDelete && (
              <button className="header-btn delete-btn" onClick={onDelete} title="Delete note">
                🗑️
              </button>
            )}
          </div>
        </div>
        <div className="note-meta">
          <div className="note-tags-input">
            {note.tags.map((tag, i) => (
              <span key={i} className="note-tag removable" onClick={() => handleRemoveTag(tag)}>
                {tag}
                <span className="tag-remove">×</span>
              </span>
            ))}
            {showTagInput ? (
              <input
                ref={tagInputRef}
                type="text"
                className="tag-input"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onBlur={handleAddTag}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                  if (e.key === 'Escape') {
                    setShowTagInput(false);
                    setNewTag('');
                  }
                }}
                placeholder="Tag name..."
              />
            ) : (
              <button className="add-tag-btn" onClick={() => setShowTagInput(true)}>
                + Tag
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="editor-toolbar">
        <button className="toolbar-btn" title="Heading">H</button>
        <button className="toolbar-btn" title="Bold">B</button>
        <button className="toolbar-btn" title="Italic">I</button>
        <button className="toolbar-btn" title="Code">{'<>'}</button>
        <button className="toolbar-btn" title="Link">🔗</button>
        <button className="toolbar-btn" title="List">•</button>
        <button className="toolbar-btn" title="Quote">"</button>
        <div className="toolbar-spacer"></div>
        <button
          className={`toolbar-btn ${viewMode === 'edit' ? 'active' : ''}`}
          onClick={() => setViewMode('edit')}
          title="Edit only (⌘1)"
        >✏️</button>
        <button
          className={`toolbar-btn ${viewMode === 'split' ? 'active' : ''}`}
          onClick={() => setViewMode('split')}
          title="Split view (⌘2)"
        >⬛</button>
        <button
          className={`toolbar-btn ${viewMode === 'preview' ? 'active' : ''}`}
          onClick={() => setViewMode('preview')}
          title="Preview only (⌘3)"
        >👁️</button>
      </div>

      <div className={`editor-content-wrapper ${viewMode}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="editor-pane">
            <textarea
              className="editor-textarea"
              value={note.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing...&#10;&#10;Markdown supported:&#10;# Heading&#10;**bold** *italic*&#10;- list&#10;> quote&#10;`code`"
              spellCheck={false}
            />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane">
            <div className="markdown-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {note.content || '*Nothing to preview...*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
