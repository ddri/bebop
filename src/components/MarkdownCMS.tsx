'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTopics } from '@/hooks/useTopics';
import { ApiErrorBoundary } from '@/components/ErrorBoundary';
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
    return <div className="text-lg text-white">Loading topics...</div>;
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
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await deleteTopic(docId);
        setSelectedDocs(prev => prev.filter(id => id !== docId));
      } catch (error) {
        console.error('Failed to delete topic:', error);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Header with sort controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-white">Topics</h1>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-[#2f2f2d] border border-slate-700 rounded-md pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E669E8]"
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
                className: "h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400",
              }
            )}
          </div>
        </div>
        <Button 
          onClick={() => setShowNewDocForm(true)}
          className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Topic
        </Button>
      </div>

      {/* New Topic Form */}
      {showNewDocForm && (
        <Card className="bg-[#1c1c1e] border-0">
          <CardHeader>
            <CardTitle className="text-white">Create New Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Topic Name"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="mb-2 bg-[#2f2f2d] border-slate-700 text-white placeholder:text-slate-400"
                />
                <Textarea
                  placeholder="Brief description of your topic (shown in preview cards)"
                  value={newDocDescription}
                  onChange={(e) => setNewDocDescription(e.target.value)}
                  className="mb-2 h-20 bg-[#2f2f2d] border-slate-700 text-white placeholder:text-slate-400"
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
                  className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
                >
                  Save Topic
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowNewDocForm(false)}
                  className="text-white border-slate-700 hover:bg-[#2f2f2d]"
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
      <ApiErrorBoundary>
        {sortedTopics.map((topic) => (
  <React.Fragment key={topic.id}>
    {editingDoc?.id === topic.id ? (
      <Card className="bg-[#1c1c1e] border-0">
        <CardHeader>
          <CardTitle className="text-white">Edit Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Topic Name"
                value={editingDoc.name}
                onChange={(e) => setEditingDoc(prev => ({ ...prev!, name: e.target.value }))}
                className="mb-2 bg-[#2f2f2d] border-slate-700 text-white placeholder:text-slate-400"
              />
              <Textarea
                placeholder="Brief description of your topic (shown in preview cards)"
                value={editingDoc.description}
                onChange={(e) => setEditingDoc(prev => ({ ...prev!, description: e.target.value }))}
                className="mb-2 h-20 bg-[#2f2f2d] border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
            <MarkdownEditor
              content={editingDoc.content}
              onChange={(value) => setEditingDoc(prev => ({ ...prev!, content: value }))}
              theme={theme}
            />
            <div className="flex gap-2">
              <Button 
                onClick={saveEditedDocument}
                disabled={!editingDoc.name || !editingDoc.content}
                className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline"
                onClick={() => setEditingDoc(null)}
                className="text-white border-slate-700 hover:bg-[#2f2f2d]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ) : (
      <Card 
        className="bg-[#1c1c1e] hover:scale-[1.05] hover:border hover:border-[#E669E8] transition-all duration-200 border-0 cursor-pointer"
        onClick={(e) => {
          // Only trigger if we didn't click on a button
          if (!(e.target as HTMLElement).closest('button')) {
            setEditingDoc({
              id: topic.id,
              name: topic.name,
              content: topic.content,
              description: topic.description
            });
          }
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-white">{topic.name}</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-[#E669E8] hover:bg-transparent"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteDocument(topic.id);
              }}
              className="hover:text-red-500 hover:bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-300">
            {topic.description || 'No description provided'}
          </div>
          <div className="mt-2 flex items-center space-x-4 text-sm text-slate-400">
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
        </ApiErrorBoundary>
        {!sortedTopics.length && (
          <div className="text-center py-8 text-slate-300">
            No topics yet. Click "New Topic" to create one.
          </div>
        )}
      </div>
    </div>
  );
}