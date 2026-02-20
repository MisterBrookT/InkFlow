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
}

type ViewMode = 'edit' | 'preview' | 'split';

export function Editor({ note, onContentChange, onTitleChange }: EditorProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  useEffect(() => {
    if (note && titleRef.current) {
      titleRef.current.value = note.title;
    }
  }, [note?.id]);

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

  if (!note) {
    return (
      <div className="editor editor-empty">
        <div className="empty-state">
          <span className="empty-icon">✒️</span>
          <p>Select a note to edit</p>
          <p className="hint">Or create a new note</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor">
      <div className="editor-header">
        <input
          ref={titleRef}
          type="text"
          className="note-title-input"
          defaultValue={note.title}
          onBlur={handleTitleBlur}
          placeholder="Title"
        />
        <div className="note-meta">
          <div className="note-tags-input">
            {note.tags.map((tag, i) => (
              <span key={i} className="note-tag">{tag}</span>
            ))}
            <button className="add-tag-btn">+ Tag</button>
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
          title="Edit only"
        >✏️</button>
        <button
          className={`toolbar-btn ${viewMode === 'split' ? 'active' : ''}`}
          onClick={() => setViewMode('split')}
          title="Split view"
        >⬛</button>
        <button
          className={`toolbar-btn ${viewMode === 'preview' ? 'active' : ''}`}
          onClick={() => setViewMode('preview')}
          title="Preview only"
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              className="markdown-preview"
            >
              {note.content || '*Nothing to preview...*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
