'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  ArrowRight, 
  Clock, 
  Globe,
  MoreHorizontal,
  Trash2,
  Calendar,
  CheckSquare,
  X
} from 'lucide-react';
import { ContentStaging } from '@/types/campaigns';
import { BulkScheduleModal } from './BulkScheduleModal';
import { BulkPlatformModal } from './BulkPlatformModal';

interface ContentStagingPipelineWithBulkProps {
  draftItems: ContentStaging[];
  readyItems: ContentStaging[];
  scheduledItems: ContentStaging[];
  selectedIds: Set<string>;
  topics: Array<{ id: string; name: string; description?: string; }>;
  onMoveToReady: (id: string) => Promise<void>;
  onMoveToScheduled: (id: string, scheduledFor?: string) => Promise<void>;
  onMoveToDraft: (id: string) => Promise<void>;
  onCreateManualTask: (stagingId: string, platform: string) => Promise<void>;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSelectByStatus: (status: 'draft' | 'ready' | 'scheduled') => void;
  onBulkUpdateStatus: (ids: string[], status: 'draft' | 'ready' | 'scheduled', scheduledFor?: string) => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<boolean>;
  onBulkUpdatePlatforms: (ids: string[], platforms: string[]) => Promise<void>;
  loading?: boolean;
}

interface StagingItemProps {
  item: ContentStaging;
  isSelected: boolean;
  topics: Array<{ id: string; name: string; description?: string; }>;
  onToggleSelection: (id: string) => void;
  onMoveToReady?: (id: string) => Promise<void>;
  onMoveToScheduled?: (id: string) => Promise<void>;
  onMoveToDraft?: (id: string) => Promise<void>;
  onCreateManualTask?: (stagingId: string, platform: string) => Promise<void>;
}

const StagingItem: React.FC<StagingItemProps> = ({ 
  item, 
  isSelected,
  topics,
  onToggleSelection,
  onMoveToReady, 
  onMoveToScheduled, 
  onMoveToDraft,
  onCreateManualTask 
}) => {
  const topic = topics.find(t => t.id === item.topicId);
  
  return (
    <Card className={`bg-[#1c1c1e] border-slate-700 mb-3 transition-colors ${isSelected ? 'ring-2 ring-[#E669E8]' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with Checkbox */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(item.id)}
                className="mt-0.5"
              />
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h4 className="font-medium text-white truncate">
                  {topic?.name || 'Unknown Topic'}
                </h4>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </Button>
          </div>

          {/* Platforms */}
          <div className="flex flex-wrap gap-1 ml-7">
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
            <div className="flex items-center gap-2 text-sm text-slate-400 ml-7">
              <Clock className="w-3 h-3" />
              {new Date(item.scheduledFor).toLocaleDateString()}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 ml-7">
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
            {item.status === 'scheduled' && onMoveToDraft && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onMoveToDraft(item.id)}
                className="text-xs"
              >
                Unschedule
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ContentStagingPipelineWithBulk: React.FC<ContentStagingPipelineWithBulkProps> = ({
  draftItems,
  readyItems,
  scheduledItems,
  selectedIds,
  topics,
  onMoveToReady,
  onMoveToScheduled,
  onMoveToDraft,
  onCreateManualTask,
  onToggleSelection,
  onSelectAll,
  onSelectNone,
  onSelectByStatus,
  onBulkUpdateStatus,
  onBulkDelete,
  onBulkUpdatePlatforms,
  loading
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const selectedCount = selectedIds.size;
  const selectedArray = Array.from(selectedIds);

  const handleBulkMoveToReady = async () => {
    await onBulkUpdateStatus(selectedArray, 'ready');
  };

  const handleBulkMoveToDraft = async () => {
    await onBulkUpdateStatus(selectedArray, 'draft');
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedCount} items?`)) {
      await onBulkDelete(selectedArray);
    }
  };

  const handleBulkSchedule = async (date: Date) => {
    await onBulkUpdateStatus(selectedArray, 'scheduled', date.toISOString());
    setShowScheduleModal(false);
  };

  const handleBulkUpdatePlatforms = async (platforms: string[]) => {
    await onBulkUpdatePlatforms(selectedArray, platforms);
    setShowPlatformModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Bulk Operations Bar */}
      {selectedCount > 0 && (
        <Card className="bg-[#E669E8]/10 border-[#E669E8]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-white">
                  {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={onSelectAll}>
                    Select All
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onSelectNone}>
                    Clear Selection
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkMoveToDraft}
                  className="text-xs"
                >
                  Move to Draft
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkMoveToReady}
                  className="text-xs"
                >
                  Mark Ready
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowScheduleModal(true)}
                  className="text-xs"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Schedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPlatformModal(true)}
                  className="text-xs"
                >
                  <Globe className="w-3 h-3 mr-1" />
                  Set Platforms
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDelete}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Columns */}
      <div className="grid grid-cols-3 gap-6">
        {/* Draft Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Draft</h3>
              <Badge variant="secondary" className="bg-slate-700">
                {draftItems.length}
              </Badge>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => onSelectByStatus('draft')}
              className="text-xs"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Select All
            </Button>
          </div>
          {draftItems.map((item) => (
            <StagingItem
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              topics={topics}
              onToggleSelection={onToggleSelection}
              onMoveToReady={onMoveToReady}
              onCreateManualTask={onCreateManualTask}
            />
          ))}
          {draftItems.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No draft content
            </div>
          )}
        </div>

        {/* Ready Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Ready</h3>
              <Badge variant="secondary" className="bg-yellow-600">
                {readyItems.length}
              </Badge>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => onSelectByStatus('ready')}
              className="text-xs"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Select All
            </Button>
          </div>
          {readyItems.map((item) => (
            <StagingItem
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              topics={topics}
              onToggleSelection={onToggleSelection}
              onMoveToScheduled={onMoveToScheduled}
              onMoveToDraft={onMoveToDraft}
              onCreateManualTask={onCreateManualTask}
            />
          ))}
          {readyItems.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No ready content
            </div>
          )}
        </div>

        {/* Scheduled Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Scheduled</h3>
              <Badge variant="secondary" className="bg-green-600">
                {scheduledItems.length}
              </Badge>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => onSelectByStatus('scheduled')}
              className="text-xs"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Select All
            </Button>
          </div>
          {scheduledItems.map((item) => (
            <StagingItem
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              topics={topics}
              onToggleSelection={onToggleSelection}
              onMoveToDraft={onMoveToDraft}
              onCreateManualTask={onCreateManualTask}
            />
          ))}
          {scheduledItems.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No scheduled content
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showScheduleModal && (
        <BulkScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleBulkSchedule}
          itemCount={selectedCount}
        />
      )}

      {showPlatformModal && (
        <BulkPlatformModal
          isOpen={showPlatformModal}
          onClose={() => setShowPlatformModal(false)}
          onUpdatePlatforms={handleBulkUpdatePlatforms}
          itemCount={selectedCount}
        />
      )}
    </div>
  );
};

export default ContentStagingPipelineWithBulk;