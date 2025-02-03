'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTopics } from '@/hooks/useTopics';
import { 
  Plus, 
  Trash2, 
  Clock,
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  TextQuote,
  Pencil,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the MarkdownEditor to avoid SSR issues with CodeMirror
const MarkdownEditor = dynamic(
  () => import('@/components/editor/MarkdownEditor'),
  { ssr: false }
);

interface Topic {
  id: string;
  name: string;
  content: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  collectionIds?: string[];
}

type SortOption = 'newest' | 'oldest' | 'az' | 'za';

export function MarkdownCMS({ pathname }: { pathname: string }) {
  const { theme } = useTheme();
  const { topics, loading, error, createTopic, updateTopic, deleteTopic } = useTopics();

  const [mounted, setMounted] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [editingDoc, setEditingDoc] = useState<{ 
    id: string; 
    name: string; 
    content: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: CalendarDays },
    { value: 'oldest', label: 'Oldest First', icon: CalendarDays },
    { value: 'az', label: 'A-Z', icon: ArrowDownAZ },
    { value: 'za', label: 'Z-A', icon: ArrowUpAZ },
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
      default:
        return sorted;
    }
  }, [topics, sortBy]);

  if (!mounted) return null;

  if (loading) {
    return <div className="text-lg">Loading topics...</div>;
  }

  if (error) {
    return <div className="text-lg text-red-500">Error: {error}</div>;
  }

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const saveDocument = async () => {
    if (newDocName && newDocContent) {
      try {
        await createTopic(newDocName, newDocContent, newDocDescription);
        setNewDocName('');
        setNewDocContent('');
        setNewDocDescription('');
        setShowNewDocForm(false);
      } catch (error) {
        console.error('Failed to create topic:', error);
      }
    }
  };

  const saveEditedDocument = async () => {
    if (editingDoc && editingDoc.name && editingDoc.content) {
      try {
        await updateTopic(editingDoc.id, editingDoc.name, editingDoc.content, editingDoc.description);
        setEditingDoc(null);
      } catch (error) {
        console.error('Failed to update topic:', error);
      }
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteTopic(docId);
      setSelectedDocs(prev => prev.filter(id => id !== docId));
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Header with sort controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold dark:text-white">Topics</h1>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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

      {/* New Topic Form */}
      {showNewDocForm && (
        <Card className="border-2 border-yellow-400">
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
                <Textarea
                  placeholder="Brief description of your topic (shown in preview cards)"
                  value={newDocDescription}
                  onChange={(e) => setNewDocDescription(e.target.value)}
                  className="mb-2 h-20"
                />
              </div>
              <MarkdownEditor
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
        {sortedTopics.map((topic) => (
          <React.Fragment key={topic.id}>
            {editingDoc?.id === topic.id ? (
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
                      <Textarea
                        placeholder="Brief description of your topic (shown in preview cards)"
                        value={editingDoc.description}
                        onChange={(e) => setEditingDoc(prev => ({ ...prev!, description: e.target.value }))}
                        className="mb-2 h-20"
                      />
                    </div>
                    <MarkdownEditor
                      content={editingDoc.content}
                      onChange={(value) => setEditingDoc(prev => ({ ...prev!, content: value }))}
                      theme={theme}
                      // testing a fix
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
            ) : (
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
                        content: topic.content,
                        description: topic.description
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
                    {topic.description || 'No description provided'}
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
            )}
          </React.Fragment>
        ))}
        {!sortedTopics.length && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No topics yet. Click "New Topic" to create one.
          </div>
        )}
      </div>
    </div>
  );
}