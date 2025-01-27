import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCollections } from '@/hooks/useCollections';
import { useTopics } from '@/hooks/useTopics';
import { 
  Plus, 
  Clock, 
  FileText,
  Pencil,
  Eye,
  Globe,
  GripVertical,
  X,
  MinusCircle
} from 'lucide-react';
import Layout from '@/components/Layout';
import { HashnodePublisher } from './HashnodePublisher';
import { cn } from '@/lib/utils';

interface Topic {
  id: string;
  name: string;
  content: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  collectionIds?: string[];
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  topicIds: string[];
  publishedUrl?: string;
  hashnodeUrl?: string | null;
  lastEdited: string;
  createdAt: string;
}

interface SortableTopicItemProps {
  id: string;
  topic: Topic;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

const SortableTopicItem = ({ id, topic, isSelected, onToggle, onRemove }: SortableTopicItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="flex items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md bg-white dark:bg-slate-900"
    >
      <button 
        className="touch-none flex items-center justify-center p-1 mx-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" 
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-grow min-w-0">
        <div className="font-medium truncate">{topic.name}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {topic.description || topic.content.substring(0, 100)}...
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(id);
        }}
        className="ml-2"
        title="Remove from collection"
      >
        <MinusCircle className="h-4 w-4 text-slate-500 hover:text-red-500" />
      </Button>
    </div>
  );
};

const TopicSelector = ({ topic, isSelected, onToggle }: { 
  topic: Topic; 
  isSelected: boolean; 
  onToggle: (id: string) => void; 
}) => {
  return (
    <div className="flex items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(topic.id)}
        className="mr-3 h-4 w-4 rounded border-gray-300"
      />
      <div>
        <div className="font-medium">{topic.name}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {topic.description || topic.content.substring(0, 100)}...
        </div>
      </div>
    </div>
  );
};

export default function Collections() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { collections, loading, error, createCollection, updateCollection, publishCollection, unpublishCollection } = useCollections();
  const { topics } = useTopics();
  const [mounted, setMounted] = useState(false);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [showHashnodePublisher, setShowHashnodePublisher] = useState(false);
  const [publishingCollection, setPublishingCollection] = useState<Collection | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateCollectionHTML = (collection: Collection): string => {
    const collectionTopics = collection.topicIds
      .map(id => topics.find(topic => topic.id === id))
      .filter((topic): topic is Topic => topic !== undefined);
    
    const combinedContent = collectionTopics
      .map(topic => topic.content)
      .join('\n\n---\n\n');

    const htmlContent = markdownToHtml(combinedContent);

    return `
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
            hr { margin: 2rem 0; }
          </style>
      </head>
      <body>
          <header>
            <h1>${collection.name}</h1>
            ${collection.description ? `<p>${collection.description}</p>` : ''}
            <hr>
          </header>
          <main>
            ${htmlContent}
          </main>
          <footer>
            <hr>
            <p>Published at ${new Date().toLocaleString()}</p>
          </footer>
      </body>
      </html>
    `.trim();
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

  const handleRemoveFromCollection = (topicId: string) => {
    setSelectedTopicIds(prev => prev.filter(id => id !== topicId));
  };

  const previewCollection = (collection: Collection) => {
    const htmlContent = generateCollectionHTML(collection);
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(htmlContent);
      newTab.document.close();
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSelectedTopicIds((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handlePublish = async (collection: Collection) => {
    try {
      const content = generateCollectionHTML(collection);
      const url = await publishCollection(collection.id, content);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Failed to publish:', error);
      alert('Failed to publish collection');
    }
  };

  const handleHashnodePublish = (collection: Collection) => {
    setPublishingCollection(collection);
    setShowHashnodePublisher(true);
  };

  const handleHashnodeUnpublish = async (collection: Collection) => {
    try {
      await fetch(`/api/collections/${collection.id}/hashnode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hashnodeUrl: null })
      });
      // Refresh collections or update local state
    } catch (error) {
      console.error('Failed to unpublish from Hashnode:', error);
    }
  };

  const handleUnpublish = async (collection: Collection) => {
    try {
      const success = await unpublishCollection(collection.id);
      if (success) {
        alert('Collection unpublished successfully');
      }
    } catch (error) {
      console.error('Failed to unpublish:', error);
      alert('Failed to unpublish collection');
    }
  };

  const saveNewCollection = async () => {
    if (newCollectionName && selectedTopicIds.length > 0) {
      try {
        await createCollection(newCollectionName, newCollectionDesc, selectedTopicIds);
        setNewCollectionName('');
        setNewCollectionDesc('');
        setSelectedTopicIds([]);
        setShowNewCollectionForm(false);
      } catch (error) {
        console.error('Failed to create collection:', error);
        alert('Failed to create collection');
      }
    }
  };

  const saveEditedCollection = async () => {
    if (editingCollection && newCollectionName && selectedTopicIds.length > 0) {
      try {
        await updateCollection(editingCollection.id, {
          name: newCollectionName,
          description: newCollectionDesc,
          topicIds: selectedTopicIds,
        });
        setEditingCollection(null);
        setNewCollectionName('');
        setNewCollectionDesc('');
        setSelectedTopicIds([]);
      } catch (error) {
        console.error('Failed to update collection:', error);
        alert('Failed to update collection');
      }
    }
  };

  const startEditing = (collection: Collection) => {
    setEditingCollection(collection);
    setNewCollectionName(collection.name);
    setNewCollectionDesc(collection.description || '');
    setSelectedTopicIds([...collection.topicIds]);
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <Layout pathname={pathname}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Loading collections...</div>
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

  return (
    <Layout pathname={pathname}>
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
                <Textarea
                  placeholder="Collection Description (optional)"
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  className="mb-4"
                />
              </div>

              {topics.length > 0 ? (
                <div className="border rounded-md">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Selected Topics ({selectedTopicIds.length})</h3>
                  </div>
                  {selectedTopicIds.length > 0 && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={selectedTopicIds}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="p-2 space-y-1">
                          {selectedTopicIds.map((id) => {
                            const topic = topics.find(t => t.id === id);
                            if (!topic) return null;
                            return (
                              <SortableTopicItem
                                key={id}
                                id={id}
                                topic={topic}
                                isSelected={true}
                                onToggle={toggleTopic}
                                onRemove={handleRemoveFromCollection}
                              />
                            );
                          })}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}

                  <div className="p-4 border-t">
                    <h3 className="font-medium mb-2">Available Topics</h3>
                    <div className="space-y-1">
                      {topics
                        .filter(topic => !selectedTopicIds.includes(topic.id))
                        .map(topic => (
                          <TopicSelector
                            key={topic.id}
                            topic={topic}
                            isSelected={selectedTopicIds.includes(topic.id)}
                            onToggle={toggleTopic}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500">
                  No topics available. Create some topics first.
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={editingCollection ? saveEditedCollection : saveNewCollection}
                  disabled={!newCollectionName || selectedTopicIds.length === 0}
                  className={`${editingCollection ? 'bg-blue-400 hover:bg-blue-500' : 'bg-yellow-400 hover:bg-yellow-500'} text-black`}
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

      {/* Hashnode Publisher Modal */}
      {showHashnodePublisher && publishingCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-lg">
            <HashnodePublisher
              collection={publishingCollection}
              content={generateCollectionHTML(publishingCollection)}
              onSuccess={(url: string) => {
                setShowHashnodePublisher(false);
                setPublishingCollection(null);
              }}
              onClose={() => {
                setShowHashnodePublisher(false);
                setPublishingCollection(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections && collections.length > 0 ? collections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">{collection.name}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(collection)}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => previewCollection(collection)}
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Publish"
                    >
                      <Globe className={cn(
                        "h-4 w-4",
                        collection.publishedUrl && "text-green-500"
                      )} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => handlePublish(collection)}>
                      <Globe className="h-4 w-4 mr-2" />
                      Publish to Web
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleHashnodePublish(collection)}>
                      <svg 
                        className="h-4 w-4 mr-2" 
                        viewBox="0 0 337 337" 
                        fill="currentColor"
                      >
                        <path d="M168.5,0C75.45,0,0,75.45,0,168.5S75.45,337,168.5,337S337,261.55,337,168.5S261.55,0,168.5,0z M168.5,304.5  c-75.11,0-136-60.89-136-136s60.89-136,136-136s136,60.89,136,136S243.61,304.5,168.5,304.5z"/>
                      </svg>
                      {collection.hashnodeUrl ? 'Republish to Hashnode' : 'Publish to Hashnode'}
                    </DropdownMenuItem>
                    {(collection.publishedUrl || collection.hashnodeUrl) && (
                      <DropdownMenuSeparator />
                    )}
                    {collection.publishedUrl && (
                      <DropdownMenuItem onClick={() => handleUnpublish(collection)}>
                        <X className="h-4 w-4 mr-2" />
                        Unpublish from Web
                      </DropdownMenuItem>
                    )}
                    {collection.hashnodeUrl && (
                      <DropdownMenuItem onClick={() => handleHashnodeUnpublish(collection)}>
                        <X className="h-4 w-4 mr-2" />
                        Unpublish from Hashnode
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {collection.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {collection.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {collection.topicIds.length} topics
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(collection.lastEdited).toLocaleDateString()}
                </div>
                {collection.publishedUrl && (
                  <a 
                    href={collection.publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-500"
                  >
                    View Published
                  </a>
                )}
                {collection.hashnodeUrl && (
                  <a 
                    href={collection.hashnodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-500"
                  >
                    View on Hashnode
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
            No collections yet. Click "New Collection" to create one.
          </div>
        )}
      </div>
    </Layout>
  );
}