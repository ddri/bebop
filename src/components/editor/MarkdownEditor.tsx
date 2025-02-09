'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { 
  Eye,
  Bold,
  Italic,
  Heading,
  List,
  Link as LinkIcon,
  Code,
  Video
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import { cn } from '@/lib/utils';
import {
  urlDetectorExtension,
  URLDetectorPopup,
  cardRegistry,
  processRichMediaMarkdown
} from './cards';

interface MarkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
  theme?: string;
  editorKey?: string | number;
}

const MarkdownEditor = ({
  content,
  onChange,
  theme,
  editorKey,
}: MarkdownEditorProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const editorRef = useRef<EditorView | null>(null);
  const [urlPopup, setUrlPopup] = useState<{
    url: string;
    position: { x: number; y: number };
  } | null>(null);

  // Calculate editor rect for popup positioning
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const handleUrlFound = useCallback((url: string, pos: number) => {
    if (!editorRef.current || !editorContainerRef.current) return;

    const cardType = cardRegistry.getCardForUrl(url);
    if (!cardType) return;

    // Get position information from CodeMirror
    const coords = editorRef.current.coordsAtPos(pos);
    if (!coords) return;

    // Get editor container position
    const editorRect = editorContainerRef.current.getBoundingClientRect();

    // Set popup position
    setUrlPopup({
      url,
      position: {
        x: coords.left - editorRect.left,
        y: coords.top - editorRect.top - 40 // Position above the URL
      }
    });
  }, []);

  const handleTransformToCard = async () => {
    if (!urlPopup || !editorRef.current) return;

    const cardType = cardRegistry.getCardForUrl(urlPopup.url);
    if (!cardType) return;

    try {
      // Extract metadata
      const metadata = await cardType.extractMetadata(urlPopup.url);

      // Create card data
      const cardData = {
        type: cardType.type,
        url: urlPopup.url,
        metadata
      };

      // Convert to markdown
      const markdown = cardType.toMarkdown(cardData);

      // Replace URL with card markdown in editor
      const doc = editorRef.current.state.doc.toString();
      const urlIndex = doc.indexOf(urlPopup.url);
      
      if (urlIndex !== -1) {
        const transaction = editorRef.current.state.update({
          changes: {
            from: urlIndex,
            to: urlIndex + urlPopup.url.length,
            insert: markdown
          }
        });
        editorRef.current.dispatch(transaction);
      }

      // Clear popup
      setUrlPopup(null);
    } catch (error) {
      console.error('Failed to transform URL to card:', error);
    }
  };

  const getEditorSelection = () => {
    if (!editorRef.current) return { text: '', from: 0, to: 0 };

    const state = editorRef.current.state;
    const selection = state.selection.main;
    const selectedText = state.sliceDoc(selection.from, selection.to);
    
    return {
      text: selectedText,
      from: selection.from,
      to: selection.to
    };
  };

  const insertTextAtCursor = (textToInsert: string, movePositions = 0) => {
    if (!editorRef.current) return;

    const state = editorRef.current.state;
    const selection = state.selection.main;
    const transaction = state.update({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: textToInsert
      }
    });

    editorRef.current.dispatch(transaction);

    if (movePositions !== 0) {
      const newPos = selection.from + movePositions;
      editorRef.current.dispatch({
        selection: { anchor: newPos }
      });
    }
  };

  const handleToolbarAction = (action: string) => {
    const { text: selectedText } = getEditorSelection();
    
    let insertText = '';
    let cursorMove = 0;

    switch (action) {
      case 'bold':
        if (selectedText) {
          insertText = `**${selectedText}**`;
        } else {
          insertText = '**Bold text**';
          cursorMove = 2;
        }
        break;

      case 'italic':
        if (selectedText) {
          insertText = `*${selectedText}*`;
        } else {
          insertText = '*Italic text*';
          cursorMove = 1;
        }
        break;

      case 'h1':
        insertText = selectedText ? `\n# ${selectedText}\n` : '\n# Heading 1\n';
        break;

      case 'h2':
        insertText = selectedText ? `\n## ${selectedText}\n` : '\n## Heading 2\n';
        break;

      case 'h3':
        insertText = selectedText ? `\n### ${selectedText}\n` : '\n### Heading 3\n';
        break;

      case 'bulletList':
        insertText = '\n- List item\n- Another item\n- And another\n';
        break;

      case 'numberedList':
        insertText = '\n1. First item\n2. Second item\n3. Third item\n';
        break;

      case 'link':
        if (selectedText) {
          insertText = `[${selectedText}](url)`;
          cursorMove = -1;
        } else {
          insertText = '[Link text](url)';
          cursorMove = 1;
        }
        break;

      case 'code':
        if (selectedText) {
          insertText = `\`${selectedText}\``;
        } else {
          insertText = '`code`';
          cursorMove = 1;
        }
        break;

      case 'embed':
        const url = prompt('Enter URL to embed (YouTube, Twitter, or Spotify):');
        if (url) {
          const cardType = cardRegistry.getCardForUrl(url);
          if (cardType) {
            handleUrlFound(url, editorRef.current?.state.selection.main.from || 0);
          } else {
            insertText = url + '\n';
          }
        }
        break;
    }

    if (insertText) {
      insertTextAtCursor(insertText, cursorMove);
      onChange(editorRef.current?.state.doc.toString() || '');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      const altText = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      insertTextAtCursor(`\n![${altText}](${data.url})\n`);
      onChange(editorRef.current?.state.doc.toString() || '');
    } catch (error) {
      console.error('Failed to upload:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const previewMarkdownToHtml = (markdown: string): string => {
    // Process cards first
    console.log('Input markdown:', markdown);
    let html = processRichMediaMarkdown(markdown);
    console.log('After card processing:', html);
    
    // Then process regular markdown
    return html
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" loading="lazy">')  // Images FIRST
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')  // Then links
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-3 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">$1</code>')
      .split(/\n\n/)
      .map(block => block.trim())
      .filter(block => block.length > 0)
      .map(block => {
        if (block.startsWith('<')) return block; // Don't wrap HTML in paragraphs
        return `<p class="my-2">${block}</p>`;
      })
      .join('\n');
  };

  return (
    <div 
      className={cn(
        "border rounded-md relative",
        isDragging && "ring-2 ring-yellow-400",
        isUploading && "opacity-50"
      )}
      ref={editorContainerRef}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
    >
      {/* URL Detector Popup */}
      {urlPopup && (
        <URLDetectorPopup
          cardType={cardRegistry.getCardForUrl(urlPopup.url)!}
          url={urlPopup.url}
          position={urlPopup.position}
          onTransform={handleTransformToCard}
        />
      )}

      {isDragging && (
        <div className="absolute inset-0 bg-yellow-400/10 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg px-4 py-2">
            Drop image to upload
          </div>
        </div>
      )}
      {isUploading && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg px-4 py-2">
            Uploading image...
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-2">
        <div className="flex flex-wrap gap-1 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction('bold')}
            className="h-8 w-8 p-0"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction('italic')}
            className="h-8 w-8 p-0"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction('h1')}
            className="h-8 w-8 p-0"
            title="Heading 1"
          >
            <Heading className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction('h2')}
            className="h-8 px-1 text-xs font-bold"
            title="Heading 2"
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction('h3')}
            className="h-8 px-1 text-xs font-bold"
            title="Heading 3"
          >
            H3
          </Button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction('bulletList')}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction('numberedList')}
            className="h-8 w-8 p-0 font-mono"
            title="Numbered List"
          >
            1.
          </Button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction('link')}
            className="h-8 w-8 p-0"
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction('code')}  
            className="h-8 w-8 p-0"
            title="Insert Code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />
          <ImageUploader 
            onImageInsert={(imageMarkdown) => {
              insertTextAtCursor(imageMarkdown);
              onChange(editorRef.current?.state.doc.toString() || '');
            }} 
          />
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction('embed')}
            className="h-8 w-8 p-0"
            title="Embed Media (YouTube, Twitter, Spotify)"
          >
            <Video className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="ml-2"
        >
          <Eye className="h-4 w-4 mr-2" />
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} divide-x dark:divide-slate-700`}>
        <CodeMirror
          value={content}
          height="400px"
          extensions={[
            markdown(),
            EditorView.lineWrapping,
            urlDetectorExtension(handleUrlFound)
          ]}
          theme={theme === 'dark' ? oneDark : undefined}
          onChange={onChange}
          className="text-sm"
          key={editorKey}
          onCreateEditor={(view) => {
            editorRef.current = view;
          }}
        />
        {showPreview && (
          <div className="p-4 prose dark:prose-invert max-w-none prose-sm">
            <div dangerouslySetInnerHTML={{ __html: previewMarkdownToHtml(content) }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;