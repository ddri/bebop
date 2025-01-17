'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Download, Eye, FileText } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  content: string;
}

export default function MarkdownCMS() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [combinedPreview, setCombinedPreview] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load documents after component mounts
  useEffect(() => {
    if (mounted) {
      const savedDocs = localStorage.getItem('markdown-docs');
      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs));
      }
    }
  }, [mounted]);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('markdown-docs', JSON.stringify(documents));
    }
  }, [documents, mounted]);

  // Calculate word count
  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
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

  return (
    <div className="container mx-auto p-4 max-w-7xl dark:bg-slate-900 min-h-screen">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Document Name"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="mb-2"
              />
            </div>
            <div>
              <Textarea
                placeholder="Markdown Content"
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                className="min-h-[200px] mb-2"
              />
            </div>
            <Button 
              onClick={saveDocument}
              disabled={!newDocName || !newDocContent}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Save Document
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map(doc => (
                <div 
                  key={doc.id} 
                  className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:border-slate-700 relative group"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleSelection(doc.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-4 w-4 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2">{doc.name}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>Edited {new Date(doc.id).toLocaleString()}</span>
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
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No documents yet. Create one to get started!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                      // Create full HTML document
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

                      // Open in new tab
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

                      // Create blob and download
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
  );
}