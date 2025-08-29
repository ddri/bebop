'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Plus,
  AlertCircle,
  BarChart3,
  Calendar,
  FileText,
  Users
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useContentStaging } from '@/hooks/useContentStaging';
import { useManualTasks } from '@/hooks/useManualTasks';
import { useTopics } from '@/hooks/useTopics';
import { useCampaigns } from '@/hooks/useCampaigns';
import ContentStagingPipeline from './ContentStagingPipeline';
import ManualTaskQueue from './ManualTaskQueue';
import CampaignDetails from '@/components/CampaignDetails';
import CampaignMetrics from '@/components/CampaignMetrics';

interface CampaignOrchestrationDashboardProps {
  campaignId: string;
  pathname: string;
}

export const CampaignOrchestrationDashboard: React.FC<CampaignOrchestrationDashboardProps> = ({ 
  campaignId, 
  pathname 
}) => {
  const router = useRouter();
  const { campaigns } = useCampaigns();
  const { topics } = useTopics();
  const [error, setError] = useState<string | null>(null);

  // New orchestration hooks
  const {
    draftItems,
    readyItems,
    scheduledItems,
    loading: stagingLoading,
    error: stagingError,
    moveToReady,
    moveToScheduled,
    moveToDraft,
    createContentStaging
  } = useContentStaging(campaignId);

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createManualTask,
    updateManualTask,
    deleteManualTask,
    markAsCompleted,
    markAsInProgress,
    markAsTodo
  } = useManualTasks(campaignId);

  const campaign = campaigns?.find(c => c.id === campaignId);

  const handleCreateManualTask = async (stagingId: string, platform: string) => {
    try {
      const stagingItem = [...draftItems, ...readyItems, ...scheduledItems]
        .find(item => item.id === stagingId);
      
      if (!stagingItem) throw new Error('Staging item not found');
      
      const topic = topics.find(t => t.id === stagingItem.topicId);
      const topicName = topic?.name || 'Unknown Topic';

      await createManualTask({
        campaignId,
        contentStagingId: stagingId,
        title: `Publish "${topicName}" to ${platform}`,
        platform,
        status: 'todo',
        instructions: `Manual publishing required for ${platform}. Content is ready for publication.`
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create manual task');
    }
  };

  const handleStageContent = async (topicId: string, platforms: string[]) => {
    try {
      await createContentStaging({
        campaignId,
        topicId,
        status: 'draft',
        platforms
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stage content');
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
      {/* Header */}
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
          <Badge variant="outline" className="text-slate-300">
            Campaign Orchestration
          </Badge>
        </div>
        <Button 
          className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Campaign Details */}
      <CampaignDetails campaign={campaign} />

      {/* Error Alert */}
      {(error || stagingError || tasksError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || stagingError?.message || tasksError?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="staging" className="space-y-6">
        <TabsList className="bg-[#1c1c1e] border-slate-700">
          <TabsTrigger value="staging" className="data-[state=active]:bg-[#E669E8]">
            <FileText className="w-4 h-4 mr-2" />
            Content Pipeline
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-[#E669E8]">
            <Users className="w-4 h-4 mr-2" />
            Manual Tasks
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-[#E669E8]">
            <Calendar className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#E669E8]">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Content Staging Pipeline */}
        <TabsContent value="staging">
          <ContentStagingPipeline
            draftItems={draftItems}
            readyItems={readyItems}
            scheduledItems={scheduledItems}
            topics={topics}
            onMoveToReady={moveToReady}
            onMoveToScheduled={moveToScheduled}
            onMoveToDraft={moveToDraft}
            onCreateManualTask={handleCreateManualTask}
            loading={stagingLoading}
          />
        </TabsContent>

        {/* Manual Task Queue */}
        <TabsContent value="tasks">
          <ManualTaskQueue
            tasks={tasks}
            onUpdateTaskStatus={async (id: string, status: 'todo' | 'in_progress' | 'completed') => {
              await updateManualTask(id, { status });
            }}
            onDeleteTask={deleteManualTask}
            loading={tasksLoading}
          />
        </TabsContent>

        {/* Campaign Timeline - Placeholder */}
        <TabsContent value="calendar">
          <Card className="bg-[#1c1c1e] border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Campaign Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-400">
                Campaign timeline visualization coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics - Use existing component */}
        <TabsContent value="analytics">
          <CampaignMetrics campaign={campaign} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default CampaignOrchestrationDashboard;