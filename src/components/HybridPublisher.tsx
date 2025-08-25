'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  FileText, 
  Hash, 
  MessageSquare, 
  Globe, 
  Clock, 
  Send, 
  Plus,
  X,
  Calendar,
  Eye,
  Zap,
  Target
} from 'lucide-react';
import { useTopics } from '@/hooks/useTopics';
import { useWebhooks } from '@/hooks/useWebhooks';
import ContentSelector from './ContentSelector';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  maxLength?: number;
}

const PLATFORMS: Platform[] = [
  { 
    id: 'hashnode', 
    name: 'Hashnode', 
    icon: <Hash className="w-4 h-4" />, 
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
  },
  { 
    id: 'devto', 
    name: 'Dev.to', 
    icon: <FileText className="w-4 h-4" />, 
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/20',
  },
  { 
    id: 'bluesky', 
    name: 'Bluesky', 
    icon: <MessageSquare className="w-4 h-4" />, 
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10 border-sky-500/20',
    maxLength: 300
  },
  { 
    id: 'mastodon', 
    name: 'Mastodon', 
    icon: <Globe className="w-4 h-4" />, 
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    maxLength: 500
  }
];

type ContentMode = 'existing' | 'new';
type ScheduleMode = 'now' | 'queue' | 'custom';

interface HybridPublisherProps {
  // Optional campaign context - if provided, content gets associated with campaign
  campaignId?: string;
  campaignName?: string;
  // Compact mode for campaign detail pages
  compact?: boolean;
  // Callback when content is published
  onPublished?: (publishData?: { 
    topicName: string; 
    platforms: string[]; 
    scheduleMode: string; 
    scheduledFor?: Date;
  }) => void;
}

export default function HybridPublisher({ 
  campaignId, 
  campaignName, 
  compact = false, 
  onPublished 
}: HybridPublisherProps) {
  const { topics } = useTopics();
  const { triggerWebhook } = useWebhooks();
  
  // Content state
  const [contentMode, setContentMode] = useState<ContentMode>('existing');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [newContent, setNewContent] = useState('');
  const [title, setTitle] = useState('');
  
  // Platform state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  // Scheduling state
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('queue');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  
  // UI state
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(!compact);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedTopicData = topics?.find(t => t.id === selectedTopic);
  const currentContent = contentMode === 'existing' && selectedTopicData ? selectedTopicData.content : newContent;
  const currentTitle = contentMode === 'existing' && selectedTopicData ? selectedTopicData.name : title;

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const canPublish = () => {
    const hasContent = contentMode === 'new' ? (newContent.trim() && title.trim()) : selectedTopic;
    const hasPlatforms = selectedPlatforms.length > 0;
    const hasValidSchedule = scheduleMode !== 'custom' || (customDate && customTime);
    
    return hasContent && hasPlatforms && hasValidSchedule;
  };

  const handlePublish = async () => {
    if (!canPublish()) return;

    setIsPublishing(true);
    setError(null);
    setSuccess(null);

    try {
      // Mock API call - replace with actual publishing logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const platformNames = selectedPlatforms
        .map(id => PLATFORMS.find(p => p.id === id)?.name)
        .join(', ');
      
      const scheduleText = scheduleMode === 'now' ? 'published' : 
                          scheduleMode === 'queue' ? 'added to queue' : 
                          `scheduled for ${new Date(`${customDate}T${customTime}`).toLocaleString()}`;
      
      const campaignText = campaignId ? ` in ${campaignName}` : '';
      setSuccess(`Content ${scheduleText} to ${platformNames}${campaignText}!`);
      
      // Reset form
      setContentMode('existing');
      setSelectedTopic('');
      setNewContent('');
      setTitle('');
      setSelectedPlatforms([]);
      setScheduleMode('queue');
      setCustomDate('');
      setCustomTime('');
      
      // Notify parent component with publish data
      const topicName = contentMode === 'existing' && selectedTopicData ? selectedTopicData.name : title;
      
      // Calculate the scheduled date based on mode
      let scheduledFor: Date;
      if (scheduleMode === 'now') {
        scheduledFor = new Date();
      } else if (scheduleMode === 'custom' && customDate && customTime) {
        scheduledFor = new Date(`${customDate}T${customTime}`);
      } else {
        // Default queue behavior - schedule for 1 hour from now
        scheduledFor = new Date(Date.now() + 60 * 60 * 1000);
      }
      
      // Trigger webhooks based on schedule mode
      const webhookEvent = scheduleMode === 'now' ? 'content.published' : 'content.scheduled';
      await triggerWebhook(webhookEvent, {
        title: topicName,
        content: currentContent,
        platforms: selectedPlatforms.map(id => ({
          id,
          name: PLATFORMS.find(p => p.id === id)?.name
        })),
        scheduleMode,
        scheduledFor: scheduledFor.toISOString(),
        campaignId,
        campaignName
      });
      
      onPublished?.({
        topicName,
        platforms: selectedPlatforms,
        scheduleMode,
        scheduledFor
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish content');
    } finally {
      setIsPublishing(false);
    }
  };

  const getPlatformPreview = (platform: Platform) => {
    let content = currentContent;
    if (platform.maxLength && content.length > platform.maxLength) {
      content = content.slice(0, platform.maxLength - 3) + '...';
    }
    return { content, title: currentTitle };
  };

  if (compact) {
    // Compact view for campaign detail pages
    return (
      <Card className="bg-[#1c1c1e] border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#E669E8]" />
              Add to Campaign
              {campaignName && <Badge variant="secondary" className="text-xs">{campaignName}</Badge>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-white"
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Content + Platform Selection */}
          <div className="flex gap-3">
            <div className="flex-1">
              <ContentSelector
                selectedTopicId={selectedTopic}
                onSelect={setSelectedTopic}
                placeholder="Search content..."
                compact={true}
              />
            </div>
            
            <Select 
              value={selectedPlatforms[0] || ''} 
              onValueChange={(platform) => setSelectedPlatforms([platform])}
            >
              <SelectTrigger className="bg-[#2f2f2d] border-slate-700 text-white w-[140px]">
                <SelectValue placeholder="Platform..." />
              </SelectTrigger>
              <SelectContent className="bg-[#2f2f2d] border-slate-700">
                {PLATFORMS.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id} className="text-white hover:bg-[#1c1c1e]">
                    <div className="flex items-center gap-2">
                      {platform.icon}
                      {platform.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={handlePublish}
              disabled={!selectedTopic || !selectedPlatforms.length || isPublishing}
              className="bg-[#E669E8] hover:bg-[#d15dd3] text-white px-6"
            >
              {isPublishing ? 'Adding...' : 'Add'}
            </Button>
          </div>

          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-slate-700">
              {/* Content Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContentMode('existing')}
                  className={`flex-1 ${
                    contentMode === 'existing' 
                      ? 'border-[#E669E8] text-[#E669E8]' 
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  From Topics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContentMode('new')}
                  className={`flex-1 ${
                    contentMode === 'new' 
                      ? 'border-[#E669E8] text-[#E669E8]' 
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Write New
                </Button>
              </div>

              {/* New Content Creation */}
              {contentMode === 'new' && (
                <div className="space-y-3">
                  <Input
                    placeholder="Content title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-[#2f2f2d] border-slate-700 text-white"
                  />
                  <Textarea
                    placeholder="Write your content..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                    className="bg-[#2f2f2d] border-slate-700 text-white resize-none"
                  />
                </div>
              )}

              {/* Multi-Platform Selection */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">Publish To</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <Button
                        key={platform.id}
                        variant="outline"
                        size="sm"
                        onClick={() => togglePlatform(platform.id)}
                        className={`justify-start gap-2 ${
                          isSelected
                            ? `${platform.bgColor} border-current ${platform.color}`
                            : 'border-slate-700 text-slate-400'
                        }`}
                      >
                        {platform.icon}
                        {platform.name}
                        {isSelected && <X className="w-3 h-3 ml-auto" />}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">Schedule</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScheduleMode('now')}
                    className={`flex-1 ${
                      scheduleMode === 'now' 
                        ? 'border-[#E669E8] text-[#E669E8]' 
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScheduleMode('queue')}
                    className={`flex-1 ${
                      scheduleMode === 'queue' 
                        ? 'border-[#E669E8] text-[#E669E8]' 
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Queue
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScheduleMode('custom')}
                    className={`flex-1 ${
                      scheduleMode === 'custom' 
                        ? 'border-[#E669E8] text-[#E669E8]' 
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Custom
                  </Button>
                </div>

                {scheduleMode === 'custom' && (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="bg-[#2f2f2d] border-slate-700 text-white"
                    />
                    <Input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="bg-[#2f2f2d] border-slate-700 text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-500">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full view for main campaigns page
  return (
    <Card className="bg-[#1c1c1e] border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="w-5 h-5 text-[#E669E8]" />
          Publish Content
          {campaignId && <Badge variant="secondary">Campaign: {campaignName}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Mode Toggle */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">Content</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContentMode('existing')}
              className={`flex-1 ${
                contentMode === 'existing' 
                  ? 'border-[#E669E8] text-[#E669E8] bg-[#E669E8]/10' 
                  : 'border-slate-700 text-slate-400'
              }`}
            >
              <FileText className="w-4 h-4 mr-1" />
              From Topics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContentMode('new')}
              className={`flex-1 ${
                contentMode === 'new' 
                  ? 'border-[#E669E8] text-[#E669E8] bg-[#E669E8]/10' 
                  : 'border-slate-700 text-slate-400'
              }`}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Write New
            </Button>
          </div>
        </div>

        {/* Content Input/Selection */}
        <div className="space-y-4">
          {contentMode === 'new' ? (
            <div className="space-y-3">
              <Input
                placeholder="Content title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#2f2f2d] border-slate-700 text-white"
              />
              <Textarea
                placeholder="What would you like to share?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={6}
                className="bg-[#2f2f2d] border-slate-700 text-white resize-none"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <ContentSelector
                selectedTopicId={selectedTopic}
                onSelect={setSelectedTopic}
                placeholder="Search and select content from your topics..."
                compact={false}
              />
            </div>
          )}
        </div>

        {/* Platform Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">Platforms</h3>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <Button
                  key={platform.id}
                  variant="outline"
                  onClick={() => togglePlatform(platform.id)}
                  className={`h-auto p-3 justify-start gap-3 border-2 transition-all ${
                    isSelected
                      ? `${platform.bgColor} border-current ${platform.color}`
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {platform.icon}
                  <div className="text-left">
                    <div className="font-medium">{platform.name}</div>
                    {platform.maxLength && (
                      <div className="text-xs opacity-75">
                        Max {platform.maxLength} chars
                      </div>
                    )}
                  </div>
                  {isSelected && <X className="w-4 h-4 ml-auto" />}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">Schedule</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScheduleMode('now')}
              className={`flex-1 ${
                scheduleMode === 'now' 
                  ? 'border-[#E669E8] text-[#E669E8] bg-[#E669E8]/10' 
                  : 'border-slate-700 text-slate-400'
              }`}
            >
              <Send className="w-4 h-4 mr-1" />
              Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScheduleMode('queue')}
              className={`flex-1 ${
                scheduleMode === 'queue' 
                  ? 'border-[#E669E8] text-[#E669E8] bg-[#E669E8]/10' 
                  : 'border-slate-700 text-slate-400'
              }`}
            >
              <Clock className="w-4 h-4 mr-1" />
              Queue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScheduleMode('custom')}
              className={`flex-1 ${
                scheduleMode === 'custom' 
                  ? 'border-[#E669E8] text-[#E669E8] bg-[#E669E8]/10' 
                  : 'border-slate-700 text-slate-400'
              }`}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Custom
            </Button>
          </div>

          {scheduleMode === 'custom' && (
            <div className="flex gap-2">
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="bg-[#2f2f2d] border-slate-700 text-white"
              />
              <Input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="bg-[#2f2f2d] border-slate-700 text-white"
              />
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 text-green-500">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Publish Button */}
        <Button
          onClick={handlePublish}
          disabled={!canPublish() || isPublishing}
          className="w-full bg-[#E669E8] hover:bg-[#d15dd3] text-white h-12 text-base font-medium"
        >
          {isPublishing ? 'Publishing...' : 
           scheduleMode === 'now' ? 'Publish Now' :
           scheduleMode === 'queue' ? 'Add to Queue' :
           'Schedule Post'}
        </Button>
      </CardContent>
    </Card>
  );
}