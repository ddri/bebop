'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { useTopics } from '@/hooks/useTopics';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Clock, 
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  TextQuote,
  Pencil,
  Bold,
  Italic,
  Heading,
  List,
  Link as LinkIcon,
  Code
} from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'az' | 'za' | 'longest' | 'shortest';

const Navigation = ({ pathname }: { pathname: string }) => (
  <nav className="bg-slate-800 text-white p-4">
    <div className="container mx-auto flex items-center justify-between">
      <div className="flex items-center space-x-8">
        <span className="text-xl font-bold">Bebop</span>
        <div className="flex space-x-6">
          <Link 
            href="/collections" 
            className={`${pathname === '/collections' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
          >
            Collections
          </Link>
          <Link 
            href="/" 
            className={`${pathname === '/' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
          >
            Topics
          </Link>
          <Link 
            href="#" 
            className="hover:text-yellow-300"
          >
            Media
          </Link>
          <Link 
            href="/settings" 
            className={`${pathname === '/settings' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

const EditorWithPreview = ({
  content,
  onChange,
  theme,
  editorKey,
}: {
  content: string;
  onChange: (value: string) => void;
  theme?: string;
  editorKey?: string | number;
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleToolbarAction = (action: string) => {
    // Get selected text from CodeMirror
    const selection = window.getSelection()?.toString() || '';
    
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
    }
    
    onChange(content + insertText);
  };

  const previewMarkdownToHtml = (markdown: string): string => {
    return markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-3 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">$1</code>')
      .replace(/\n\n/g, '</p><p class="my-2">')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/gm, '<p class="my-2">$1</p>');
  };

  return (
    <div className="border rounded-md">
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
          EditorView.lineWrapping
        ]}
        theme={theme === 'dark' ? oneDark : undefined}
        onChange={onChange}
        className="text-sm"
        key={editorKey}
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

const Layout = ({ children, pathname }: { children: React.ReactNode; pathname: string }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
    <Navigation pathname={pathname} />
    <div className="container mx-auto p-8 max-w-7xl">
      {children}
    </div>
  </div>
);

export default function MarkdownCMS() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { topics, loading, error, createTopic, updateTopic, deleteTopic } = useTopics();

  const [mounted, setMounted] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [combinedPreview, setCombinedPreview] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [editingDoc, setEditingDoc] = useState<{ id: string; name: string; content: string } | null>(null);

  useEffect(() => {
    setMounted(true);

    if (selectedDocs.length > 0) {
      const selectedContent = topics
        .filter(doc => selectedDocs.includes(doc.id))
        .map(doc => doc.content)
        .join('\n\n---\n\n');
      setCombinedPreview(previewMarkdownToHtml(selectedContent));
    } else {
      setCombinedPreview('');
    }
  }, [mounted, selectedDocs, topics]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: CalendarDays },
    { value: 'oldest', label: 'Oldest First', icon: CalendarDays },
    { value: 'az', label: 'A-Z', icon: ArrowDownAZ },
    { value: 'za', label: 'Z-A', icon: ArrowUpAZ },
    { value: 'longest', label: 'Longest First', icon: TextQuote },
    { value: 'shortest', label: 'Shortest First', icon: TextQuote },
  ];

  const sortedTopics = useMemo(() => {
    if (!topics) return [];
    
    const sorted = [...topics];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'az':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'za':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'longest':
        return sorted.sort((a, b) => getWordCount(b.content) - getWordCount(a.content));
      case 'shortest':
        return sorted.sort((a, b) => getWordCount(a.content) - getWordCount(b.content));
      default:
        return sorted;
    }
  }, [topics, sortBy]);

  if (!mounted) return null;

  if (loading) {
    return (
      <Layout pathname={pathname}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Loading topics...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pathname={pathname}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const previewMarkdownToHtml = (markdown: string): string => {
    return markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-3 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p class="my-2">')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/gm, '<p class="my-2">$1</p>');
  };

  const saveDocument = async () => {
    if (newDocName && newDocContent) {
      try {
        await createTopic(newDocName, newDocContent);
        setNewDocName('');
        setNewDocContent('');
        setShowNewDocForm(false);
      } catch (error) {
        console.error('Failed to create topic:', error);
      }
    }
  };

  const toggleSelection = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteTopic(docId);
      setSelectedDocs(prev => prev.filter(id => id !== docId));
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  const saveEditedDocument = async () => {
    if (editingDoc && editingDoc.name && editingDoc.content) {
      try {
        await updateTopic(editingDoc.id, editingDoc.name, editingDoc.content);
        setEditingDoc(null);
      } catch (error) {
        console.error('Failed to update topic:', error);
      }
    }
  };

  return (
    <Layout pathname={pathname}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold dark:text-white">Topics</h1>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {sortOptions.map(option => {
                const Icon = option.icon;
                return (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </select>
            {React.createElement(
              sortOptions.find(opt => opt.value === sortBy)?.icon || CalendarDays,
              {
                className: "h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500",
              }
            )}
          </div>
        </div>
        <Button 
          onClick={() => setShowNewDocForm(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Topic
        </Button>
      </div>

      {showNewDocForm && (
        <Card className="mb-8 border-2 border-yellow-400">
          <CardHeader>
            <CardTitle>Create New Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Topic Name"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="mb-2"
                />
              </div>
              <EditorWithPreview
                content={newDocContent}
                onChange={setNewDocContent}
                theme={theme}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={saveDocument}
                  disabled={!newDocName || !newDocContent}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  Save Topic
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowNewDocForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topics List */}
      <div className="grid gap-4">
        {sortedTopics.length > 0 ? (
          sortedTopics.map((topic) => (
            <React.Fragment key={topic.id}>
              {editingDoc?.id === topic.id && (
                <Card className="border-2 border-blue-400">
                  <CardHeader>
                    <CardTitle>Edit Topic</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Input
                          placeholder="Topic Name"
                          value={editingDoc.name}
                          onChange={(e) => setEditingDoc(prev => ({ ...prev!, name: e.target.value }))}
                          className="mb-2"
                        />
                      </div>
                      <EditorWithPreview
                        content={editingDoc.content}
                        onChange={(value) => setEditingDoc(prev => ({ ...prev!, content: value }))}
                        theme={theme}
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={saveEditedDocument}
                          disabled={!editingDoc.name || !editingDoc.content}
                          className="bg-blue-400 hover:bg-blue-500 text-black"
                        >
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setEditingDoc(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">{topic.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDoc({
                        id: topic.id,
                        name: topic.name,
                        content: topic.content
                      })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(topic.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {topic.content.substring(0, 200)}
                    {topic.content.length > 200 && '...'}
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <TextQuote className="h-4 w-4 mr-1" />
                      {getWordCount(topic.content)} words
                    </div>
                  </div>
                </CardContent>
              </Card>
            </React.Fragment>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No topics yet. Click "New Topic" to create one.
          </div>
        )}
      </div>
    </Layout>
  );
}        