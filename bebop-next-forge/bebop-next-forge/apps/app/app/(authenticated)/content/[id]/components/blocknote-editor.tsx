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
          .map((block: unknown) => {
            const blockObj = block as { content?: unknown[] };
            if (blockObj.content && Array.isArray(blockObj.content)) {
              return blockObj.content
                .map((item: unknown) => {
                  const itemObj = item as { text?: string };
                  return itemObj.text || '';
                })
                .join('');
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
      <div className={`rounded-md border ${className}`}>
        <div className="p-4 text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  // Determine theme for BlockNote
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const blockNoteTheme = currentTheme === 'dark' ? 'dark' : 'light';

  return (
    <div className={`overflow-hidden rounded-md border ${className}`}>
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme={blockNoteTheme}
        className="min-h-[400px]"
      />
    </div>
  );
};
