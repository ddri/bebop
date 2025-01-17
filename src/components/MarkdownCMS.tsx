'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { 
  Plus, 
  Trash2, 
  Download, 
  Eye, 
  FileText, 
  Clock, 
  MoreHorizontal,
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  TextQuote,
  Pencil
} from 'lucide-react';

interface Document {
  id: number;
  name: string;
  content: string;
}

type SortOption = 'newest' | 'oldest' | 'az' | 'za' | 'longest' | 'shortest';

export default function MarkdownCMS() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [combinedPreview, setCombinedPreview] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load documents after component mounts
  useEffect(() => {
    if (mounted) {
      const savedDocs = localStorage.getItem('markdown-docs');
      const savedSort = localStorage.getItem('sort-preference');
      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs));
      }
      if (savedSort) {
        setSortBy(savedSort as SortOption);
      }
    }
  }, [mounted]);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('markdown-docs', JSON.stringify(documents));
    }
  }, [documents, mounted]);

  // Save sort preference when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sort-preference', sortBy);
    }
  }, [sortBy, mounted]);

  // Sort options configuration
  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: CalendarDays },
    { value: 'oldest', label: 'Oldest First', icon: CalendarDays },
    { value: 'az', label: 'A-Z', icon: ArrowDownAZ },
    { value: 'za', label: 'Z-A', icon: ArrowUpAZ },
    { value: 'longest', label: 'Longest First', icon: TextQuote },
    { value: 'shortest', label: 'Shortest First', icon: TextQuote },
  ];

  // Save edited document
  const saveEditedDocument = () => {
    if (editingDoc && editingDoc.name && editingDoc.content) {
      setDocuments(documents.map(doc => 
        doc.id === editingDoc.id ? editingDoc : doc
      ));
      setEditingDoc(null);
    }
  };

  // Calculate word count
  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Convert Markdown to HTML
  const markdownToHtml = (markdown: string): string => {
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

  // Save new document
  const saveDocument = () => {
    if (newDocName && newDocContent) {
      const newDoc: Document = {
        id: Date.now(),
        name: newDocName,
        content: newDocContent
      };
      setDocuments([...documents, newDoc]);
      setNewDocName('');
      setNewDocContent('');
      setShowNewDocForm(false);
    }
  };

  // Toggle document selection
  const toggleSelection = (docId: number) => {
    if (selectedDocs.includes(docId)) {
      setSelectedDocs(selectedDocs.filter(id => id !== docId));
    } else {
      setSelectedDocs([...selectedDocs, docId]);
    }
  };

  // Delete document
  const deleteDocument = (docId: number) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
    setSelectedDocs(selectedDocs.filter(id => id !== docId));
  };

  // Generate combined preview
  useEffect(() => {
    const selectedContent = documents
      .filter(doc => selectedDocs.includes(doc.id))
      .map(doc => doc.content)
      .join('\n\n---\n\n');
    setCombinedPreview(markdownToHtml(selectedContent));
  }, [selectedDocs, documents]);

  // Memoized sorted documents
  const sortedDocuments = useMemo(() => {
    const sorted = [...documents];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.id - a.id);
      case 'oldest':
        return sorted.sort((a, b) => a.id - b.id);
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
  }, [documents, sortBy]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <span className="text-xl font-bold">Markdown CMS</span>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-yellow-300">Collections</a>
              <a href="#" className="text-yellow-300">Topics</a>
              <a href="#" className="hover:text-yellow-300">Media</a>
              <a href="#" className="hover:text-yellow-300">Team</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Header with Sort and New Topic Button */}
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
              {/* Show the current sort option's icon */}
              {React.createElement(
                sortOptions.find(opt => opt.value === sortBy)?.icon || CalendarDays,
                {
                  className: "h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500",
                }
              )}
            </div>
          </div>
          <Button 
            onClick={() => setShowNewDocForm(!showNewDocForm)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Topic
          </Button>
        </div>

        {/* Edit Document Form */}
        {editingDoc && (
          <Card className="mb-8 border-2 border-blue-400">
            <CardHeader>
              <CardTitle>Edit Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Topic Name"
                    value={editingDoc.name}
                    onChange={(e) => setEditingDoc({...editingDoc, name: e.target.value})}
                    className="mb-2"
                  />
                </div>

                <div className="border rounded-md">
                  <CodeMirror
                    value={newDocContent} // or editingDoc.content for edit form
                    height="400px"
                    extensions={[markdown()]}
                    theme={theme === 'dark' ? oneDark : undefined}
                    onChange={(value) => setNewDocContent(value)} // or (value) => setEditingDoc({...editingDoc, content: value})
                    className="border rounded-md"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={saveEditedDocument}
                    disabled={!editingDoc.name || !editingDoc.content}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
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

        {/* New Document Form */}
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

                <div className="border rounded-md">
                  <CodeMirror
                    value={newDocContent} // or editingDoc.content for edit form
                    height="400px"
                    extensions={[markdown()]}
                    theme={theme === 'dark' ? oneDark : undefined}
                    onChange={(value) => setNewDocContent(value)} // or (value) => setEditingDoc({...editingDoc, content: value})
                    className="border rounded-md"
                  />
                </div>

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

        {/* Documents Grid and Preview */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Documents List */}
          <div>
            <div className="space-y-4">
              {sortedDocuments.map(doc => (
                <div 
                  key={doc.id} 
                  className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-yellow-400 transition-colors relative group shadow-sm"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleSelection(doc.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingDoc(doc)}
                      className="text-slate-400 hover:text-blue-500 h-6 w-6 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-slate-400 hover:text-red-500 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 h-6 w-6 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2 pr-24">{doc.name}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(doc.id).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {getWordCount(doc.content)} words
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {doc.content.substring(0, 150)}...
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center text-slate-500 dark:text-slate-400 py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  No topics yet. Create one to get started!
                </div>
              )}
            </div>
          </div>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Combined Preview
                {selectedDocs.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const htmlContent = `
                          <!DOCTYPE html>
                          <html lang="en">
                          <head>
                              <meta charset="UTF-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <title>Preview Combined Content</title>
                              <style>
                                body { 
                                  font-family: system-ui, -apple-system, sans-serif;
                                  line-height: 1.5;
                                  max-width: 800px;
                                  margin: 0 auto;
                                  padding: 2rem;
                                  background-color: ${theme === 'dark' ? '#0f172a' : '#ffffff'};
                                  color: ${theme === 'dark' ? '#e2e8f0' : '#0f172a'};
                                }
                                h1, h2, h3 { margin-top: 2rem; }
                                p { margin: 1rem 0; }
                              </style>
                          </head>
                          <body>
                              ${combinedPreview}
                          </body>
                          </html>
                        `.trim();

                        const newTab = window.open();
                        if (newTab) {
                          newTab.document.write(htmlContent);
                          newTab.document.close();
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const htmlContent = `
                          <!DOCTYPE html>
                          <html lang="en">
                          <head>
                              <meta charset="UTF-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <title>Combined Markdown Content</title>
                              <style>
                                body { 
                                  font-family: system-ui, -apple-system, sans-serif;
                                  line-height: 1.5;
                                  max-width: 800px;
                                  margin: 0 auto;
                                  padding: 2rem;
                                  background-color: ${theme === 'dark' ? '#0f172a' : '#ffffff'};
                                  color: ${theme === 'dark' ? '#e2e8f0' : '#0f172a'};
                                }
                                h1, h2, h3 { margin-top: 2rem; }
                                p { margin: 1rem 0; }
                              </style>
                          </head>
                          <body>
                              ${combinedPreview}
                          </body>
                          </html>
                        `.trim();

                        const blob = new Blob([htmlContent], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'combined-content.html';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export HTML
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: combinedPreview }}
              />
              {selectedDocs.length === 0 && (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                  Select documents to see the combined preview
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}