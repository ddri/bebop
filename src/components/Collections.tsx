// components/Collections.tsx - Part 1
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
import { Plus, Clock, FileText, Pencil, Eye, Globe, GripVertical, X, MinusCircle, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { HashnodePublisher } from './HashnodePublisher';
import { DevToPublisher } from './DevToPublisher';
import { cn } from '@/lib/utils';
import { PlatformId } from '@/types/social';
import { SocialPublisher } from './social/SocialPublisher';
import { ShareMetrics } from './social/ShareMetrics';
import { SocialShareMetrics } from '@/types/social';

// Interfaces
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

// Component and Hook Definitions
const SortableTopicItem = ({ id, topic, isSelected, onToggle, onRemove }: SortableTopicItemProps) => {
  // ... SortableTopicItem implementation (unchanged)
};

const TopicSelector = ({ topic, isSelected, onToggle }: { 
  topic: Topic; 
  isSelected: boolean; 
  onToggle: (id: string) => void; 
}) => {
  // ... TopicSelector implementation (unchanged)
};

export default function Collections() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { loading, error, createCollection, updateCollection, publishCollection, unpublishCollection } = useCollections();
  const { topics } = useTopics();
  const [collections, setCollections] = useState<CollectionWithMetrics[]>([]);
  
  // ... other state declarations (unchanged)

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
          metrics: metricsData.filter(m => m.collectionId === collection.id)
        }));

        setCollections(collectionsWithMetrics);
      } catch (err) {
        console.error('Failed to fetch collections:', err);
      }
    };

    fetchCollectionsWithMetrics();
  }, []);

  const refreshCollectionsWithMetrics = async () => {
    const [collectionsData, metricsData] = await Promise.all([
      fetch('/api/collections').then(res => res.json()),
      fetch('/api/social/metrics').then(res => res.json())
    ]);

    const collectionsWithMetrics = collectionsData.map((collection: Collection) => ({
      ...collection,
      metrics: metricsData.filter(m => m.collectionId === collection.id)
    }));

    setCollections(collectionsWithMetrics);
  };

  // Social sharing handler
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

  // ... rest of your utility functions (generateCollectionHTML, markdownToHtml, etc.)




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
    <Layout pathname={pathname as string}>
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
                refreshCollections();
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
              content={generateCollectionHTML(publishingCollection)} // for preview if needed
              rawMarkdown={generateCollectionMarkdown(publishingCollection)} // for Dev.to
              onSuccess={(url: string) => {
                setShowDevToPublisher(false);
                setPublishingCollection(null);
                refreshCollections(); // Make sure this is called to update the UI
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
         )   
    </Layout>
  );
}