import { useEffect, useRef } from 'react';

interface MilkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function MilkdownEditor({ content, onChange }: MilkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== content) {
      // Only update if content changed externally
    }
  }, [content]);

  return (
    <textarea
      ref={textareaRef}
      className="editor-textarea"
      defaultValue={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start writing...&#10;&#10;Markdown supported:&#10;# Heading&#10;**bold** *italic*&#10;- list&#10;> quote&#10;`code`"
      spellCheck={false}
    />
  );
}
