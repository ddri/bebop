'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  Target,
  Play,
  Pause,
  Trash2,
  Edit3,
  MoreHorizontal
} from 'lucide-react';
import Layout from '@/components/Layout';
import HybridPublisher from '@/components/HybridPublisher';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useTopics } from '@/hooks/useTopics';

interface SimplifiedCampaignDetailProps {
  campaignId: string;
  pathname: string;
}

interface QueueItem {
  id: string;
  topicName: string;
  platform: string;
  status: 'scheduled' | 'published' | 'failed' | 'pending';
  scheduledFor: Date;
  publishedUrl?: string | null;
  error?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'scheduled': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'hashnode': return '🔗';
    case 'devto': return '📝';
    case 'bluesky': return '🦋';
    case 'mastodon': return '🐘';
    default: return '📤';
  }
};

export default function SimplifiedCampaignDetail({ campaignId, pathname }: SimplifiedCampaignDetailProps) {
  const router = useRouter();
  const { campaigns } = useCampaigns();
  const { topics } = useTopics();
  
  // Initialize with some mock data - replace with real campaign data
  const [queueItems, setQueueItems] = useState<QueueItem[]>([
    {
      id: '1',
      topicName: 'Getting Started with React Hooks',
      platform: 'hashnode',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      publishedUrl: null
    },
    {
      id: '2', 
      topicName: 'TypeScript Best Practices',
      platform: 'devto',
      status: 'published',
      scheduledFor: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      publishedUrl: 'https://dev.to/example/typescript-best-practices'
    },
    {
      id: '3',
      topicName: 'Quick tip: Array methods',
      platform: 'bluesky',
      status: 'failed',
      scheduledFor: new Date(Date.now() - 1 * 60 * 60 * 1000),
      publishedUrl: null,
      error: 'Authentication failed'
    }
  ]);

  const campaign = campaigns?.find(c => c.id === campaignId);

  if (!campaign) {
    return (
      <Layout pathname={pathname}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg text-red-500">Campaign not found</div>
        </div>
      </Layout>
    );
  }

  const handleContentPublished = (publishData?: { 
    topicName: string; 
    platforms: string[]; 
    scheduleMode: string; 
    scheduledFor?: Date;
  }) => {
    if (publishData) {
      // Add new items to the queue for each platform
      const newItems: QueueItem[] = publishData.platforms.map(platform => ({
        id: `${Date.now()}-${platform}`,
        topicName: publishData.topicName,
        platform,
        status: publishData.scheduleMode === 'now' ? 'published' : 'scheduled',
        scheduledFor: publishData.scheduledFor || new Date(),
        publishedUrl: publishData.scheduleMode === 'now' ? `https://${platform}.example.com/post` : null
      }));
      
      setQueueItems(prev => [...newItems, ...prev]);
    }
  };

  const handleRetry = async (itemId: string) => {
    // Mock retry logic
    console.log('Retrying publication:', itemId);
  };

  const handleRemove = async (itemId: string) => {
    setQueueItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <Layout pathname={pathname}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/campaigns')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-white">{campaign.name}</h1>
              <p className="text-slate-400">{campaign.description || 'No description'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {campaign.status}
            </Badge>
            <Button variant="ghost" size="sm" className="text-slate-400">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Publishing Interface - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <HybridPublisher 
              campaignId={campaign.id}
              campaignName={campaign.name}
              compact={true}
              onPublished={handleContentPublished}
            />
          </div>

          {/* Campaign Stats - Takes up 1 column */}
          <div className="space-y-4">
            <Card className="bg-[#1c1c1e] border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-300">Campaign Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{queueItems.length}</div>
                    <div className="text-xs text-slate-400">Total Posts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {queueItems.filter(q => q.status === 'published').length}
                    </div>
                    <div className="text-xs text-slate-400">Published</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Created:</span>
                    <span className="text-white">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Status:</span>
                    <Badge variant="secondary" className="text-xs">{campaign.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Publishing Queue */}
        <Card className="bg-[#1c1c1e] border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-[#E669E8]" />
              Publishing Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queueItems.length > 0 ? (
              <div className="space-y-3">
                {queueItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 bg-[#2f2f2d] rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getPlatformIcon(item.platform)}</div>
                      <div>
                        <h4 className="font-medium text-white">{item.topicName}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span>{item.platform}</span>
                          <span>•</span>
                          <span>
                            {item.status === 'scheduled' && `Scheduled for ${item.scheduledFor.toLocaleDateString()}`}
                            {item.status === 'published' && `Published ${item.scheduledFor.toLocaleDateString()}`}
                            {item.status === 'failed' && `Failed ${item.scheduledFor.toLocaleDateString()}`}
                          </span>
                        </div>
                        {item.error && (
                          <div className="text-xs text-red-400 mt-1">{item.error}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </Badge>
                      
                      <div className="flex gap-1">
                        {item.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetry(item.id)}
                            className="text-slate-400 hover:text-white p-2"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {item.publishedUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.publishedUrl!, '_blank')}
                            className="text-slate-400 hover:text-white p-2"
                          >
                            <Globe className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.id)}
                          className="text-slate-400 hover:text-red-400 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                No content in the publishing queue yet.
                <br />
                <span className="text-sm">Add content above to get started!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}