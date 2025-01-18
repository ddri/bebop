'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Clock, 
  User,
  FileText,
  Pencil,
  Trash2,
  Eye,
  Download
} from 'lucide-react';

interface Collection {
  id: number;
  name: string;
  description?: string;
  topicIds: number[];  // References to the Topics included in this collection
  lastEdited: number;
}

interface Topic {
  id: number;
  name: string;
  content: string;
}


// Adding the markdown converter for collections
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

export default function Collections() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);

{/* Add this function in Collections component */}
const renderCollection = (collection: Collection) => {
  // Find all topics that are part of this collection
  const collectionTopics = availableTopics.filter(topic => 
    collection.topicIds.includes(topic.id)
  );
  
  // Combine their content
  const combinedContent = collectionTopics
    .map(topic => topic.content)
    .join('\n\n---\n\n');

  // Convert to HTML
  const htmlContent = markdownToHtml(combinedContent);

  // Create full HTML document with styling
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${collection.name}</title>
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
        <h1>${collection.name}</h1>
        ${collection.description ? `<p>${collection.description}</p>` : ''}
        <hr>
        ${htmlContent}
    </body>
    </html>
  `.trim();

  // Open in new tab
  const newTab = window.open();
  if (newTab) {
    newTab.document.write(fullHtml);
    newTab.document.close();
  }
};


  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load both collections and topics after component mounts
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const savedCollections = localStorage.getItem('collections');
      const savedTopics = localStorage.getItem('markdown-docs');
      if (savedCollections) {
        setCollections(JSON.parse(savedCollections));
      }
      if (savedTopics) {
        setAvailableTopics(JSON.parse(savedTopics));
      }
    }
  }, [mounted]);

  // Save collections to localStorage whenever they change
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('collections', JSON.stringify(collections));
    }
  }, [collections, mounted]);

  // Save new collection
  const saveNewCollection = () => {
    if (newCollectionName && selectedTopicIds.length > 0) {
      const newCollection: Collection = {
        id: Date.now(),
        name: newCollectionName,
        description: newCollectionDesc,
        topicIds: selectedTopicIds,
        lastEdited: Date.now(),
      };
      setCollections([...collections, newCollection]);
      setNewCollectionName('');
      setNewCollectionDesc('');
      setSelectedTopicIds([]);
      setShowNewCollectionForm(false);
    }
  };

  // Save edited collection
  const saveEditedCollection = () => {
    if (editingCollection && newCollectionName && selectedTopicIds.length > 0) {
      const updatedCollection: Collection = {
        ...editingCollection,
        name: newCollectionName,
        description: newCollectionDesc,
        topicIds: selectedTopicIds,
        lastEdited: Date.now(),
      };
      setCollections(collections.map(c => 
        c.id === editingCollection.id ? updatedCollection : c
      ));
      setEditingCollection(null);
      setNewCollectionName('');
      setNewCollectionDesc('');
      setSelectedTopicIds([]);
    }
  };

  // Start editing a collection
  const startEditing = (collection: Collection) => {
    setEditingCollection(collection);
    setNewCollectionName(collection.name);
    setNewCollectionDesc(collection.description || '');
    setSelectedTopicIds(collection.topicIds);
  };

  // Delete collection
  const deleteCollection = (id: number) => {
    setCollections(collections.filter(c => c.id !== id));
  };

  // Toggle topic selection
  const toggleTopic = (topicId: number) => {
    setSelectedTopicIds(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <span className="text-xl font-bold">Markdown CMS</span>
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
                href="#" 
                className="hover:text-yellow-300"
              >
                Team
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold dark:text-white">Collections</h1>
          <Button 
            onClick={() => {
              setShowNewCollectionForm(!showNewCollectionForm);
              setEditingCollection(null);
              setNewCollectionName('');
              setNewCollectionDesc('');
              setSelectedTopicIds([]);
            }}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        </div>

        {/* Collection Form */}
        {(showNewCollectionForm || editingCollection) && (
          <Card className={`mb-8 border-2 ${editingCollection ? 'border-blue-400' : 'border-yellow-400'}`}>
            <CardHeader>
              <CardTitle>{editingCollection ? 'Edit Collection' : 'Create New Collection'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Collection Name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Collection Description"
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">Select Topics to Include</h3>
                  <div className="space-y-2">
                    {availableTopics.map(topic => (
                      <div 
                        key={topic.id}
                        className="flex items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTopicIds.includes(topic.id)}
                          onChange={() => toggleTopic(topic.id)}
                          className="mr-3 h-4 w-4 rounded border-gray-300"
                        />
                        <div>
                          <div className="font-medium">{topic.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {topic.content.substring(0, 100)}...
                          </div>
                        </div>
                      </div>
                    ))}
                    {availableTopics.length === 0 && (
                      <div className="text-center text-slate-500 dark:text-slate-400 py-4">
                        No topics available. Create some topics first!
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={editingCollection ? saveEditedCollection : saveNewCollection}
                    disabled={!newCollectionName || selectedTopicIds.length === 0}
                    className={`${
                      editingCollection 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                    }`}
                  >
                    {editingCollection ? 'Save Changes' : 'Create Collection'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowNewCollectionForm(false);
                      setEditingCollection(null);
                      setNewCollectionName('');
                      setNewCollectionDesc('');
                      setSelectedTopicIds([]);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map(collection => (
            <Card 
              key={collection.id}
              className="hover:border-yellow-400 transition-colors relative group"
            >
              <CardContent className="pt-6">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      renderCollection(collection);
                    }}
                    className="text-slate-400 hover:text-blue-500"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(collection);
                    }}
                    className="text-slate-400 hover:text-yellow-500"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
                
                <h3 className="text-lg font-medium mb-2">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    {collection.description}
                  </p>
                )}
                <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Edited {new Date(collection.lastEdited).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {collection.topicIds.length} Topics
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>Contributors (In Development)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {collections.length === 0 && (
            <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              No collections yet. Create one to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}