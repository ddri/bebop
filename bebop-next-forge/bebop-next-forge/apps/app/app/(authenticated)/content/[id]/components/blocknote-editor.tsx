'use client';

import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface BlockNoteEditorWrapperProps {
  initialContent?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const BlockNoteEditorWrapper = ({
  initialContent = '',
  onChange,
  className = '',
  placeholder = 'Start writing...',
}: BlockNoteEditorWrapperProps) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Create the editor instance with simple initial content
  const editor = useCreateBlockNote({
    initialContent: initialContent 
      ? [{ type: 'paragraph', content: initialContent }]
      : [{ type: 'paragraph', content: '' }],
    placeholders: {
      default: placeholder,
      heading: 'Heading',
      bulletListItem: 'Bullet point',
      numberedListItem: 'Numbered point',
    },
  });

  // Handle content changes - convert BlockNote to simple string
  const handleChange = async () => {
    if (onChange) {
      try {
        // For now, convert to simple markdown
        const markdown = await editor.blocksToMarkdownLossy(editor.document);
        onChange(markdown);
      } catch (error) {
        console.error('Error converting content:', error);
        // Fallback: extract plain text
        const textContent = editor.document
          .map((block: any) => {
            if (block.content && Array.isArray(block.content)) {
              return block.content.map((item: any) => item.text || '').join('');
            }
            return '';
          })
          .join('\n');
        onChange(textContent);
      }
    }
  };

  // Wait for hydration to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`border rounded-md ${className}`}>
        <div className="p-4 text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  // Determine theme for BlockNote
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const blockNoteTheme = currentTheme === 'dark' ? 'dark' : 'light';

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme={blockNoteTheme}
        className="min-h-[400px]"
      />
    </div>
  );
};