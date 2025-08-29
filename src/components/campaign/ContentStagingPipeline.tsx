'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ArrowRight, 
  Clock, 
  Globe,
  MoreHorizontal
} from 'lucide-react';
import { ContentStaging } from '@/types/campaigns';

interface ContentStagingPipelineProps {
  draftItems: ContentStaging[];
  readyItems: ContentStaging[];
  scheduledItems: ContentStaging[];
  topics: Array<{ id: string; name: string; description?: string; }>;
  onMoveToReady: (id: string) => Promise<void>;
  onMoveToScheduled: (id: string, scheduledFor?: string) => Promise<void>;
  onMoveToDraft: (id: string) => Promise<void>;
  onCreateManualTask: (stagingId: string, platform: string) => Promise<void>;
  loading?: boolean;
}

interface StagingItemProps {
  item: ContentStaging;
  topics: Array<{ id: string; name: string; description?: string; }>;
  onMoveToReady?: (id: string) => Promise<void>;
  onMoveToScheduled?: (id: string) => Promise<void>;
  onMoveToDraft?: (id: string) => Promise<void>;
  onCreateManualTask?: (stagingId: string, platform: string) => Promise<void>;
}

const StagingItem: React.FC<StagingItemProps> = ({ 
  item, 
  topics,
  onMoveToReady, 
  onMoveToScheduled, 
  onMoveToDraft,
  onCreateManualTask 
}) => {
  const topic = topics.find(t => t.id === item.topicId);
  return (
    <Card className="bg-[#1c1c1e] border-slate-700 mb-3">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <h4 className="font-medium text-white truncate">
                {topic?.name || 'Unknown Topic'}
              </h4>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </Button>
          </div>

          {/* Platforms */}
          <div className="flex flex-wrap gap-1">
            {item.platforms.map((platform) => (
              <Badge 
                key={platform} 
                variant="secondary" 
                className="text-xs bg-slate-700 text-slate-300"
              >
                {platform}
              </Badge>
            ))}
          </div>

          {/* Scheduling Info */}
          {item.scheduledFor && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-3 h-3" />
              {new Date(item.scheduledFor).toLocaleDateString()}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {item.status === 'draft' && onMoveToReady && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onMoveToReady(item.id)}
                className="text-xs"
              >
                Mark Ready
              </Button>
            )}
            {item.status === 'ready' && onMoveToScheduled && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onMoveToScheduled(item.id)}
                className="text-xs"
              >
                Schedule
              </Button>
            )}
            {(item.status === 'ready' || item.status === 'scheduled') && onMoveToDraft && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onMoveToDraft(item.id)}
                className="text-xs"
              >
                Back to Draft
              </Button>
            )}
            {item.status === 'ready' && onCreateManualTask && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onCreateManualTask(item.id, item.platforms[0])}
                className="text-xs"
              >
                Create Task
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ContentStagingPipeline: React.FC<ContentStagingPipelineProps> = ({
  draftItems,
  readyItems,
  scheduledItems,
  topics,
  onMoveToReady,
  onMoveToScheduled,
  onMoveToDraft,
  onCreateManualTask,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-400">Loading staging pipeline...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Draft Column */}
      <div className="space-y-4">
        <Card className="bg-[#2a2a2a] border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              Draft Content
              <Badge variant="secondary" className="ml-auto">
                {draftItems.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {draftItems.length > 0 ? (
                draftItems.map((item) => (
                  <StagingItem 
                    key={item.id} 
                    item={item}
                    topics={topics}
                    onMoveToReady={onMoveToReady}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  No draft content
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ready Column */}
      <div className="space-y-4">
        <Card className="bg-[#2a2a2a] border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-yellow-500" />
              Ready to Publish
              <Badge variant="secondary" className="ml-auto">
                {readyItems.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {readyItems.length > 0 ? (
                readyItems.map((item) => (
                  <StagingItem 
                    key={item.id} 
                    item={item}
                    topics={topics}
                    onMoveToScheduled={onMoveToScheduled}
                    onMoveToDraft={onMoveToDraft}
                    onCreateManualTask={onCreateManualTask}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  No content ready
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Column */}
      <div className="space-y-4">
        <Card className="bg-[#2a2a2a] border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              Scheduled
              <Badge variant="secondary" className="ml-auto">
                {scheduledItems.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {scheduledItems.length > 0 ? (
                scheduledItems.map((item) => (
                  <StagingItem 
                    key={item.id} 
                    item={item}
                    topics={topics}
                    onMoveToDraft={onMoveToDraft}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  No scheduled content
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentStagingPipeline;