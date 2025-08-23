import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTopics } from '@/hooks/useTopics';
import { useCampaigns } from '@/hooks/useCampaigns';
import { HashnodePublisher } from '@/components/HashnodePublisher';
import { DevToPublisher } from '@/components/DevToPublisher';
import { CampaignSocialPublisher } from '@/components/CampaignSocialPublisher';
import { 
  ArrowLeft,
  Globe,
  FileText,
  Play,
  Clock,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import Layout from '@/components/Layout';
import CampaignDetails from '@/components/CampaignDetails';
import CampaignMetrics from '@/components/CampaignMetrics';
import { PlatformId } from '@/types/social';
import { PublishingPlan } from '@/types/campaigns';

// Define available platforms including social media
const PLATFORMS = [
  { id: 'hashnode', name: 'Hashnode' },
  { id: 'devto', name: 'Dev.to' },
  { id: 'bluesky', name: 'Bluesky' },
  { id: 'mastodon', name: 'Mastodon' }
] as const;

interface NewPublicationSlot {
  topicId?: string;
  platform?: PlatformId;
}

interface CampaignPlannerProps {
  campaignId: string;
  pathname: string;
}

const CampaignPlanner = ({ campaignId, pathname }: CampaignPlannerProps) => {
  const router = useRouter();
  const { topics } = useTopics();
  const { 
    campaigns, 
    createPublishingPlan,
    deletePublishingPlan,
    updatePublishingPlan
  } = useCampaigns();
  
  // State
  const [newSlot, setNewSlot] = useState<NewPublicationSlot>({});
  const [error, setError] = useState<string | null>(null);
  const [showHashnodePublisher, setShowHashnodePublisher] = useState(false);
  const [showDevToPublisher, setShowDevToPublisher] = useState(false);
  const [showSocialPublisher, setShowSocialPublisher] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);
  const [publishingPlan, setPublishingPlan] = useState<PublishingPlan | null>(null);
  
  const campaign = campaigns?.find(c => c.id === campaignId);

  const isSlotComplete = () => {
    return newSlot.topicId && newSlot.platform;
  };

  const generateTopicContent = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return '';
    return topic.content;
  };

  const handleAddToQueue = async () => {
    if (!isSlotComplete() || !campaign) return;
    setError(null);

    try {
      await createPublishingPlan({
        campaignId: campaign.id,
        topicId: newSlot.topicId!,
        platform: newSlot.platform!
      });
      
      setNewSlot({}); // Reset form
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to queue');
    }
  };

  const handlePublishPlan = async (planId: string) => {
    if (!campaign) return;
    setError(null);

    try {
      const plan = campaign.publishingPlans.find(p => p.id === planId);
      if (!plan) throw new Error('Publication not found');

      setPublishingPlan(plan);

      switch (plan.platform) {
        case 'hashnode':
          setShowHashnodePublisher(true);
          break;
        case 'devto':
          setShowDevToPublisher(true);
          break;
        case 'bluesky':
        case 'mastodon':
          setSelectedPlatform(plan.platform);
          setShowSocialPublisher(true);
          break;
        default:
          throw new Error('Unsupported platform');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
      
      // Update status to failed
      await updatePublishingPlan(planId, campaign.id, {
        status: 'failed'
      });
    }
  };

  const handleRemoveFromQueue = async (planId: string) => {
    if (!campaign) return;
    setError(null);
  
    try {
      await deletePublishingPlan(planId, campaign.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from queue');
    }
  };

  const handleRetryPublication = async (planId: string) => {
    if (!campaign) return;
    setError(null);

    try {
      await updatePublishingPlan(planId, campaign.id, {
        status: 'scheduled',
        publishedAt: undefined,
        publishedUrl: undefined
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry publication');
    }
  };
  if (!campaign) {
    return (
      <Layout pathname={pathname}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg text-slate-400">Campaign not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pathname={pathname}>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:text-[#E669E8]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          <h1 className="text-2xl font-semibold text-white">
            {campaign.name}
          </h1>
        </div>
      </div>

      {/* Campaign Details & Metrics */}
      <CampaignDetails campaign={campaign} />
      <CampaignMetrics campaign={campaign} />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Publication Scheduler Section */}
      <Card className="mb-8 bg-[#1c1c1e] border-0">
        <CardHeader>
          <CardTitle className="text-white">Add New Publication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-2 bg-[#2f2f2d] rounded-md border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <Clock className="h-4 w-4" />
                <p className="text-sm">Scheduled publications are processed automatically.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await fetch('/api/scheduler/trigger', { method: 'POST' });
                  } catch (err) {
                    console.error('Failed to trigger scheduler:', err);
                  }
                }}
                className="text-xs"
              >
                Process Now
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Topic Selection */}
            <div className="col-span-1">
              <Select
                value={newSlot.topicId}
                onValueChange={(value) => setNewSlot(prev => ({ ...prev, topicId: value }))}
              >
                <SelectTrigger className="bg-[#2f2f2d] border-slate-700 text-white">
                  <FileText className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1c1e] border-slate-700">
                  {topics.map(topic => (
                    <SelectItem 
                      key={topic.id} 
                      value={topic.id}
                      className="text-white hover:bg-[#2f2f2d]"
                    >
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform Selection */}
            <div className="col-span-1">
              <Select
                value={newSlot.platform}
                onValueChange={(value) => setNewSlot(prev => ({ ...prev, platform: value as PlatformId }))}
              >
                <SelectTrigger className="bg-[#2f2f2d] border-slate-700 text-white">
                  <Globe className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1c1e] border-slate-700">
                  {PLATFORMS.map(platform => (
                    <SelectItem 
                      key={platform.id} 
                      value={platform.id}
                      className="text-white hover:bg-[#2f2f2d]"
                    >
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add to Queue Button */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleAddToQueue}
              disabled={!isSlotComplete()}
              className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Queue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Publications Lists */}
      <div className="space-y-8">
        {/* Scheduled Publications */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Publication Queue</h2>
          {campaign.publishingPlans.filter(pub => pub.status === 'scheduled').length > 0 ? (
            campaign.publishingPlans
              .filter(pub => pub.status === 'scheduled')
              .map((pub) => (
                <Card 
                  key={pub.id}
                  className="bg-[#1c1c1e] border-0 hover:border hover:border-[#E669E8] transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-white">
                            {topics.find(t => t.id === pub.topicId)?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span className="text-white">
                            {PLATFORMS.find(p => p.id === pub.platform)?.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handlePublishPlan(pub.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Publish
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromQueue(pub.id)}
                          className="hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              No publications queued. Add some content to get started.
            </div>
          )}
        </div>

        {/* Published History */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Publication History</h2>
          {campaign.publishingPlans.filter(pub => pub.status === 'published').length > 0 ? (
            campaign.publishingPlans
              .filter(pub => pub.status === 'published')
              .sort((a, b) => {
                const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                return dateB - dateA; // Most recent first
              })
              .map((pub) => (
                <Card 
                  key={pub.id}
                  className="bg-[#1c1c1e] border-0 opacity-75"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-400" />
                          <span className="text-white">
                            {topics.find(t => t.id === pub.topicId)?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-green-400" />
                          <span className="text-white">
                            {PLATFORMS.find(p => p.id === pub.platform)?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span className="text-white">
                            Published on {pub.publishedAt ? new Date(pub.publishedAt).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      {pub.publishedUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(pub.publishedUrl, '_blank')}
                          className="hover:text-[#E669E8]"
                        >
                          <Globe className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              No published content yet.
            </div>
          )}
        </div>

        {/* Failed Publications */}
        {campaign.publishingPlans.filter(pub => pub.status === 'failed').length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-red-500 mb-4">Failed Publications</h2>
            {campaign.publishingPlans
              .filter(pub => pub.status === 'failed')
              .map((pub) => (
                <Card 
                  key={pub.id}
                  className="bg-[#1c1c1e] border border-red-500/20"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-400" />
                          <span className="text-white">
                            {topics.find(t => t.id === pub.topicId)?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-red-400" />
                          <span className="text-white">
                            {PLATFORMS.find(p => p.id === pub.platform)?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">
                            Publication Failed
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetryPublication(pub.id)}
                        className="hover:text-green-500"
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          <span>Retry</span>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Publisher Modals */}
      {showHashnodePublisher && publishingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-[#1c1c1e] rounded-lg shadow-xl">
            <HashnodePublisher
              type="publishingPlan"
              itemId={publishingPlan.id}
              name={topics.find(t => t.id === publishingPlan.topicId)?.name || ''}
              description={topics.find(t => t.id === publishingPlan.topicId)?.description || ''}
              content={generateTopicContent(publishingPlan.topicId)}
              onSuccess={async (url: string) => {
                try {
                  await updatePublishingPlan(publishingPlan.id, campaign.id, {
                    status: 'published',
                    publishedAt: new Date(),
                    publishedUrl: url
                  });
                } catch (err) {
                  console.error('Failed to update status:', err);
                  setError('Post published but failed to update status');
                } finally {
                  setShowHashnodePublisher(false);
                  setPublishingPlan(null);
                }
              }}
              onClose={() => {
                setShowHashnodePublisher(false);
                setPublishingPlan(null);
              }}
            />
          </div>
        </div>
      )}

      {showDevToPublisher && publishingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-[#1c1c1e] rounded-lg shadow-xl">
            <DevToPublisher
              type="publishingPlan"
              itemId={publishingPlan.id}
              name={topics.find(t => t.id === publishingPlan.topicId)?.name || ''}
              description={topics.find(t => t.id === publishingPlan.topicId)?.description || ''}
              content={generateTopicContent(publishingPlan.topicId)}
              rawMarkdown={generateTopicContent(publishingPlan.topicId)}
              onSuccess={async (url: string) => {
                try {
                  await updatePublishingPlan(publishingPlan.id, campaign.id, {
                    status: 'published',
                    publishedAt: new Date(),
                    publishedUrl: url
                  });
                } catch (err) {
                  console.error('Failed to update status:', err);
                  setError('Post published but failed to update status');
                } finally {
                  setShowDevToPublisher(false);
                  setPublishingPlan(null);
                }
              }}
              onClose={() => {
                setShowDevToPublisher(false);
                setPublishingPlan(null);
              }}
            />
          </div>
        </div>
      )}

      {showSocialPublisher && selectedPlatform && publishingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-[#1c1c1e] rounded-lg shadow-xl">
            <CampaignSocialPublisher
              platformId={selectedPlatform}
              publishingPlan={publishingPlan}
              content={generateTopicContent(publishingPlan.topicId)}
              campaignId={campaign.id}
              onSuccess={async (url: string) => {
                try {
                  await updatePublishingPlan(publishingPlan.id, campaign.id, {
                    status: 'published',
                    publishedAt: new Date(),
                    publishedUrl: url
                  });
                } catch (err) {
                  console.error('Failed to update status:', err);
                  setError('Post published but failed to update status');
                } finally {
                  setShowSocialPublisher(false);
                  setSelectedPlatform(null);
                  setPublishingPlan(null);
                }
              }}
              onClose={() => {
                setShowSocialPublisher(false);
                setSelectedPlatform(null);
                setPublishingPlan(null);
              }}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CampaignPlanner;