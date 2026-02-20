import { useEffect, useRef, useCallback } from 'react';
import { MilkdownEditor } from './MilkdownEditor';
import { Note } from '../types';

interface EditorProps {
  note: Note | null;
  onContentChange: (id: string, content: string) => void;
  onTitleChange: (id: string, title: string) => void;
}

export function Editor({ note, onContentChange, onTitleChange }: EditorProps) {
  const titleRef = useRef<HTMLInputElement>(null);

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
      </div>

      <div className="editor-content">
        <MilkdownEditor
          content={note.content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
}
