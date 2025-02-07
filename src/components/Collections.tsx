import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { BlueskyIcon } from './social/icons/BlueskyIcon';
import { MastodonIcon } from './social/icons/MastodonIcon';
import { ThreadsIcon } from './social/icons/ThreadsIcon';
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
  MinusCircle,
  Trash2 
} from 'lucide-react';
import Layout from '@/components/Layout';
import { HashnodePublisher } from './HashnodePublisher';
import { DevToPublisher } from './DevToPublisher';
import { cn } from '@/lib/utils';
import { PlatformId } from '@/types/social';
import { SocialPublisher } from './social/SocialPublisher';
import { ShareMetrics } from './social/ShareMetrics';
import { SocialShareMetrics } from '@/types/social';

interface CollectionWithMetrics extends Collection {
  metrics?: SocialShareMetrics[];
}

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
  devToUrl?: string | null;
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

// Part TWO

export default function Collections() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { loading, error, createCollection, updateCollection, publishCollection, unpublishCollection } = useCollections();
  const { topics } = useTopics();
  const [collections, setCollections] = useState<CollectionWithMetrics[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [showHashnodePublisher, setShowHashnodePublisher] = useState(false);
  const [showDevToPublisher, setShowDevToPublisher] = useState(false);
  const [showSocialPublisher, setShowSocialPublisher] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);
  const [publishingCollection, setPublishingCollection] = useState<Collection | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch collections with metrics
  useEffect(() => {
    const fetchCollectionsWithMetrics = async () => {
      try {
        const [collectionsData, metricsData] = await Promise.all([
          fetch('/api/collections').then(res => res.json()),
          fetch('/api/social/metrics').then(res => res.json())
        ]);

        const collectionsWithMetrics = collectionsData.map((collection: Collection) => ({
          ...collection,
          metrics: metricsData.filter((m: SocialShareMetrics) => m.collectionId === collection.id)
        }));

        setCollections(collectionsWithMetrics);
      } catch (err) {
        console.error('Failed to fetch collections:', err);
      }
    };

    fetchCollectionsWithMetrics();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshCollectionsWithMetrics = async () => {
    const [collectionsData, metricsData] = await Promise.all([
      fetch('/api/collections').then(res => res.json()),
      fetch('/api/social/metrics').then(res => res.json())
    ]);

    const collectionsWithMetrics = collectionsData.map((collection: Collection) => ({
      ...collection,
      metrics: metricsData.filter((m: SocialShareMetrics) => m.collectionId === collection.id)
    }));

    setCollections(collectionsWithMetrics);
  };

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
            img {
              max-width: 100%;
              height: auto;
              border-radius: 0.5rem;
              margin: 1rem 0;
              ${theme === 'dark' ? 'filter: brightness(0.9);' : ''}
            }
            a {
              color: #3b82f6;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
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

  const handleDelete = async (collection: Collection) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await fetch(`/api/collections/${collection.id}`, { method: 'DELETE' });
        refreshCollectionsWithMetrics();
      } catch (error) {
        console.error('Failed to delete collection:', error);
        alert('Failed to delete collection');
      }
    }
  };

  const markdownToHtml = (markdown: string): string => {
    return markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-3 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" loading="lazy">')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">$1</code>')
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
        await refreshCollectionsWithMetrics();
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
      await refreshCollectionsWithMetrics();
    } catch (error) {
      console.error('Failed to unpublish from Hashnode:', error);
    }
  };

  const handleDevToPublish = (collection: Collection) => {
    setPublishingCollection(collection);
    setShowDevToPublisher(true);
  };

  const generateCollectionMarkdown = (collection: Collection): string => {
    const collectionTopics = collection.topicIds
      .map(id => topics.find(topic => topic.id === id))
      .filter((topic): topic is Topic => topic !== undefined);
    
    return collectionTopics
      .map(topic => topic.content)
      .join('\n\n---\n\n');
  };

  const handleDevToUnpublish = async (collection: Collection) => {
    try {
      await fetch(`/api/collections/${collection.id}/devto`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devToUrl: null })
      });
      await refreshCollectionsWithMetrics();
    } catch (error) {
      console.error('Failed to unpublish from Dev.to:', error);
    }
  };

  const handleUnpublish = async (collection: Collection) => {
    try {
      const success = await unpublishCollection(collection.id);
      if (success) {
        await refreshCollectionsWithMetrics();
        alert('Collection unpublished successfully');
      }
    } catch (error) {
      console.error('Failed to unpublish:', error);
      alert('Failed to unpublish collection');
    }
  };

  const handleSocialShare = async (collection: Collection, platform: PlatformId) => {
    try {
      await fetch('/api/social/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: platform,
          collectionId: collection.id
        })
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }
    
    setSelectedPlatform(platform);
    setPublishingCollection(collection);
    setShowSocialPublisher(true);
  };

  const saveNewCollection = async () => {
    if (newCollectionName && selectedTopicIds.length > 0) {
      try {
        await createCollection(newCollectionName, newCollectionDesc, selectedTopicIds);
        setNewCollectionName('');
        setNewCollectionDesc('');
        setSelectedTopicIds([]);
        setShowNewCollectionForm(false);
        await refreshCollectionsWithMetrics();
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
        await refreshCollectionsWithMetrics();
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
                refreshCollectionsWithMetrics();
              }}
              onClose={() => {
                setShowHashnodePublisher(false);
                setPublishingCollection(null);
              }}
            />
          </div>
        </div>
      )}    

      {/* Social Publisher Modal */}
      {showSocialPublisher && selectedPlatform && publishingCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-lg">
            <SocialPublisher
              platformId={selectedPlatform}
              collection={publishingCollection}
              onSuccess={(url: string) => {
                setShowSocialPublisher(false);
                setSelectedPlatform(null);
                setPublishingCollection(null);
                refreshCollectionsWithMetrics();
              }}
              onClose={() => {
                setShowSocialPublisher(false);
                setSelectedPlatform(null);
                setPublishingCollection(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Dev Publisher Modal */}
      {showDevToPublisher && publishingCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-lg">
            <DevToPublisher
              collection={publishingCollection}
              content={generateCollectionHTML(publishingCollection)}
              rawMarkdown={generateCollectionMarkdown(publishingCollection)}
              onSuccess={(url: string) => {
                setShowDevToPublisher(false);
                setPublishingCollection(null);
                refreshCollectionsWithMetrics();
              }}
              onClose={() => {
                setShowDevToPublisher(false);
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

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Share on Social
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleSocialShare(collection, 'bluesky')}>
                        <BlueskyIcon className="h-4 w-4 mr-2" />
                        Share on Bluesky 
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSocialShare(collection, 'mastodon')}>
                        <MastodonIcon className="h-4 w-4 mr-2" />
                        Share on Mastodon
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSocialShare(collection, 'threads')}>
                        <ThreadsIcon className="h-4 w-4 mr-2" />
                        Share on Threads
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuItem onClick={() => handleDevToPublish(collection)}>
                      <svg viewBox="0 0 448 512" className="h-4 w-4 mr-2" fill="currentColor">
                        <path d="M120.12 208.29c-3.88-2.9-7.77-4.35-11.65-4.35H91.03v104.47h17.45c3.88 0 7.77-1.45 11.65-4.35 3.88-2.9 5.82-7.25 5.82-13.06v-69.65c-.01-5.8-1.96-10.16-5.83-13.06zM404.1 32H43.9C19.7 32 .06 51.59 0 75.8v360.4C.06 460.41 19.7 480 43.9 480h360.2c24.21 0 43.84-19.59 43.9-43.8V75.8c-.06-24.21-19.7-43.8-43.9-43.8zM154.2 291.19c0 18.81-11.61 47.31-48.36 47.25h-46.4V172.98h47.38c35.44 0 47.36 28.46 47.37 47.28l.01 70.93zm100.68-88.66H201.6v38.42h32.57v29.57H201.6v38.41h53.29v29.57h-62.18c-11.16.29-20.44-8.53-20.72-19.69V193.7c-.27-11.15 8.56-20.41 19.71-20.69h63.19l-.01 29.52zm103.64 115.29c-13.2 30.75-36.85 24.63-47.44 0l-38.53-144.8h32.57l29.71 113.72 29.57-113.72h32.58l-38.46 144.8z"/>
                      </svg>
                      {collection.devToUrl ? 'Republish to Dev.to' : 'Publish to Dev.to'}
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
                    {(collection.publishedUrl || collection.hashnodeUrl || collection.devToUrl) && (
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
                    {collection.devToUrl && (
                      <DropdownMenuItem onClick={() => handleDevToUnpublish(collection)}>
                        <X className="h-4 w-4 mr-2" />
                        Unpublish from Dev.to
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(collection)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {collection.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {collection.description}
                </p>
              )}
              <div className="flex flex-col space-y-2">
                <ShareMetrics metrics={collection.metrics || []} />
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
                  {collection.devToUrl && (
                    <a 
                      href={collection.devToUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-500"
                    >
                      View on Dev.to
                    </a>
                  )}
                </div>
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