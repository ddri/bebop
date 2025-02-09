'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from "next-themes";
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { useTopics } from '@/hooks/useTopics';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { 
  Bold, 
  Italic, 
  Heading,
  List,
  Link as LinkIcon,
  Code,
  Save,
  Maximize,
  Minimize,
  Image as ImageIcon,
  Video,
  Eye,
  EyeOff,
  Columns
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import { cn } from '@/lib/utils';
import { urlDetectorExtension, URLDetectorPopup, cardRegistry, processRichMediaMarkdown } from '@/components/editor/cards';

const WriteMode = () => {
  const { createTopic } = useTopics();
  const [content, setContent] = useState('');
  const [showToolbar, setShowToolbar] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'split' | 'full'>('split');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [urlPopup, setUrlPopup] = useState<{
    url: string;
    position: { x: number; y: number };
  } | null>(null);

  const editorRef = React.useRef<{
    view?: EditorView;
  }>(null);

  const editorContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (content) {
        localStorage.setItem('writemode_draft', content);
        setLastSaved(new Date());
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [content]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('writemode_draft');
    if (savedDraft) {
      setContent(savedDraft);
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        setShowSaveDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleUrlFound = useCallback((url: string, pos: number) => {
    if (!editorRef.current?.view || !editorContainerRef.current) return;

    const cardType = cardRegistry.getCardForUrl(url);
    if (!cardType) return;

    const coords = editorRef.current.view.coordsAtPos(pos);
    if (!coords) return;

    const editorRect = editorContainerRef.current.getBoundingClientRect();

    setUrlPopup({
      url,
      position: {
        x: coords.left - editorRect.left,
        y: coords.top - editorRect.top - 40
      }
    });
  }, []);

  const handleTransformToCard = async () => {
    if (!urlPopup || !editorRef.current?.view) return;

    const cardType = cardRegistry.getCardForUrl(urlPopup.url);
    if (!cardType) return;

    try {
      const metadata = await cardType.extractMetadata(urlPopup.url);
      const cardData = {
        type: cardType.type,
        url: urlPopup.url,
        metadata
      };

      const markdown = cardType.toMarkdown(cardData);
      const doc = editorRef.current.view.state.doc.toString();
      const urlIndex = doc.indexOf(urlPopup.url);
      
      if (urlIndex !== -1) {
        const view = editorRef.current.view;
        view.dispatch({
          changes: {
            from: urlIndex,
            to: urlIndex + urlPopup.url.length,
            insert: markdown
          }
        });
      }

      setUrlPopup(null);
    } catch (error) {
      console.error('Failed to transform URL to card:', error);
    }
  };
  
  const handleToolbarAction = (action: string) => {
    if (!editorRef.current?.view) return;
    
    const view = editorRef.current.view;
    const selection = view.state.sliceDoc(
      view.state.selection.main.from,
      view.state.selection.main.to
    );
    
    let insertText = '';
    switch (action) {
      case 'bold':
        insertText = selection ? `**${selection}**` : '**Bold text**';
        break;
      case 'italic':
        insertText = selection ? `*${selection}*` : '*Italic text*';
        break;
      case 'h1':
        insertText = `\n# ${selection || 'Heading 1'}\n`;
        break;
      case 'h2':
        insertText = `\n## ${selection || 'Heading 2'}\n`;
        break;
      case 'h3':
        insertText = `\n### ${selection || 'Heading 3'}\n`;
        break;
      case 'bulletList':
        insertText = '\n- List item\n- Another item\n- And another\n';
        break;
      case 'numberedList':
        insertText = '\n1. First item\n2. Second item\n3. Third item\n';
        break;
      case 'link':
        insertText = selection ? `[${selection}](url)` : '[Link text](url)';
        break;
      case 'code':
        insertText = selection ? `\`${selection}\`` : '`code`';
        break;
      case 'embed':
        const url = prompt('Enter URL to embed (YouTube, Spotify):');
        if (url) {
          const cardType = cardRegistry.getCardForUrl(url);
          if (cardType) {
            handleUrlFound(url, view.state.selection.main.from);
          } else {
            insertText = url + '\n';
          }
        }
        break;
    }
    
    if (insertText) {
      view.dispatch(view.state.replaceSelection(insertText));
    }
  };

  const handleSave = async () => {
    if (!topicName || !content) return;

    setSaving(true);
    setError('');

    try {
      await createTopic(topicName, content, topicDescription);
      localStorage.removeItem('writemode_draft');
      setContent('');
      setTopicName('');
      setTopicDescription('');
      setShowSaveDialog(false);
    } catch (err) {
      setError('Failed to save topic. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCount = (text: string): number => {
    return text.length;
  };

  const previewMarkdownToHtml = (markdown: string): string => {
    let html = processRichMediaMarkdown(markdown);
    
    return html
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-3 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" loading="lazy">')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">$1</code>')
      .split(/\n\n/)
      .map(block => block.trim())
      .filter(block => block.length > 0)
      .map(block => {
        if (block.startsWith('<')) return block;
        return `<p class="my-2">${block}</p>`;
      })
      .join('\n');
  };

  return (
    <div 
      className="flex flex-col h-[calc(100vh-8rem)] bg-[#2f2f2d]"
      ref={editorContainerRef}
    >
      {urlPopup && (
        <URLDetectorPopup
          cardType={cardRegistry.getCardForUrl(urlPopup.url)!}
          url={urlPopup.url}
          position={urlPopup.position}
          onTransform={handleTransformToCard}
        />
      )}
      
      {showToolbar && (
        <div className="bg-[#1c1c1e] border-b border-slate-800">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('bold')}
                className="h-8 w-8 p-0 hover:text-[#E669E8]"
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('italic')}
                className="h-8 w-8 p-0 hover:text-[#E669E8]"
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-slate-800" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('h1')}
                className="h-8 w-8 p-0 hover:text-[#E669E8]"
                title="Heading 1"
              >
                <Heading className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('h2')}
                className="h-8 px-2 text-xs font-bold hover:text-[#E669E8]"
                title="Heading 2"
              >
                H2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('h3')}
                className="h-8 px-2 text-xs font-bold hover:text-[#E669E8]"
                title="Heading 3"
              >
                H3
              </Button>
              <div className="w-px h-8 bg-slate-800" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('bulletList')}
                className="h-8 w-8 p-0 hover:text-[#E669E8]"
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('link')}
                className="h-8 w-8 p-0 hover:text-[#E669E8]"
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('code')}
                className="h-8 w-8 p-0 hover:text-[#E669E8]"
                title="Insert Code"
              >
                <Code className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-slate-800" />
              <ImageUploader 
                onImageInsert={(imageMarkdown) => {
                  setContent(prev => prev + imageMarkdown);
                }} 
              />
              <div className="w-px h-8 bg-slate-800" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('embed')}
                className="h-8 w-8 p-0 hover:text-[#E669E8]"
                title="Embed Media"
              >
                <Video className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-slate-800" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center hover:text-[#E669E8]"
                title={showPreview ? 'Hide Preview' : 'Show Preview'}
              >
                {showPreview ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>


              {showPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewMode(prev => prev === 'split' ? 'full' : 'split')}
                  className="hover:text-[#E669E8]"
                  title={previewMode === 'split' ? 'Full Preview' : 'Split View'}
                >
                  <Columns className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowToolbar(!showToolbar)}
                className="hover:text-[#E669E8]"
                title="Toggle Toolbar"
              >
                Hide Toolbar
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="hover:text-[#E669E8]"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={() => setShowSaveDialog(true)}
                className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
          <div className="flex justify-end px-4 py-1 text-sm text-slate-400 border-t border-slate-800">
            <div className="space-x-4">
              <span>{getWordCount(content)} words</span>
              <span>{getCharCount(content)} characters</span>
              {lastSaved && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        "flex flex-1 min-h-[600px] bg-[#2f2f2d]",
        showPreview && "divide-x divide-slate-800"
      )}>
        <div className={cn(
          "transition-all duration-200",
          showPreview ? (
            previewMode === 'split' ? "w-1/2" : "hidden"
          ) : "w-full"
        )}>
          <CodeMirror
            ref={editorRef as any}
            value={content}
            height="600px"
            autoFocus
            extensions={[
              markdown(),
              EditorView.lineWrapping,
              urlDetectorExtension(handleUrlFound)
            ]}
            theme={oneDark}
            onChange={setContent}
            className="text-base"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightActiveLineGutter: true,
              foldGutter: true,
            }}
          />
        </div>

        {showPreview && (
          <div className={cn(
            "bg-[#2f2f2d] transition-all duration-200",
            previewMode === 'split' ? "w-1/2" : "w-full"
          )}>
            <div className="prose prose-invert max-w-none p-8 h-full overflow-auto">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: previewMarkdownToHtml(content) 
                }} 
              />
            </div>
          </div>
        )}
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-[#1c1c1e] border-0">
          <DialogHeader>
            <DialogTitle>Save as Topic</DialogTitle>
            <DialogDescription>
              Enter a name and optional description for your topic.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Topic Name"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="bg-[#2f2f2d] border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Topic Description (optional)"
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                className="bg-[#2f2f2d] border-slate-700"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!topicName || !content || saving}
              className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
            >
              {saving ? 'Saving...' : 'Save Topic'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WriteMode;              