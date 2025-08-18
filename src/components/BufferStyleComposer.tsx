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
  Hash, 
  FileText, 
  MessageSquare, 
  Globe, 
  Clock, 
  Send, 
  Plus,
  X,
  Calendar,
  Eye
} from 'lucide-react';
import { useTopics } from '@/hooks/useTopics';

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

type ContentSource = 'new' | 'existing';
type ScheduleMode = 'now' | 'queue' | 'custom';

export default function BufferStyleComposer() {
  const { topics } = useTopics();
  
  // Content state
  const [contentSource, setContentSource] = useState<ContentSource>('new');
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
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedTopicData = topics?.find(t => t.id === selectedTopic);
  const currentContent = contentSource === 'existing' && selectedTopicData ? selectedTopicData.content : newContent;
  const currentTitle = contentSource === 'existing' && selectedTopicData ? selectedTopicData.name : title;

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const canPublish = () => {
    const hasContent = contentSource === 'new' ? (newContent.trim() && title.trim()) : selectedTopic;
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
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const platformNames = selectedPlatforms
        .map(id => PLATFORMS.find(p => p.id === id)?.name)
        .join(', ');
      
      const scheduleText = scheduleMode === 'now' ? 'published' : 
                          scheduleMode === 'queue' ? 'added to queue' : 
                          `scheduled for ${new Date(`${customDate}T${customTime}`).toLocaleString()}`;
      
      setSuccess(`Content ${scheduleText} to ${platformNames}!`);
      
      // Reset form
      setContentSource('new');
      setSelectedTopic('');
      setNewContent('');
      setTitle('');
      setSelectedPlatforms([]);
      setScheduleMode('queue');
      setCustomDate('');
      setCustomTime('');
      
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

  return (
    <Card className="bg-[#1c1c1e] border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Edit3 className="w-5 h-5 text-[#E669E8]" />
          Compose Post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Source Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">Content Source</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContentSource('new')}
              className={`flex-1 ${
                contentSource === 'new' 
                  ? 'border-[#E669E8] text-[#E669E8] bg-[#E669E8]/10' 
                  : 'border-slate-700 text-slate-400'
              }`}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Write New
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContentSource('existing')}
              className={`flex-1 ${
                contentSource === 'existing' 
                  ? 'border-[#E669E8] text-[#E669E8] bg-[#E669E8]/10' 
                  : 'border-slate-700 text-slate-400'
              }`}
            >
              <FileText className="w-4 h-4 mr-1" />
              From Topics
            </Button>
          </div>
        </div>

        {/* Content Input */}
        <div className="space-y-4">
          {contentSource === 'new' ? (
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
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="bg-[#2f2f2d] border-slate-700 text-white">
                <SelectValue placeholder="Select content from your topics..." />
              </SelectTrigger>
              <SelectContent className="bg-[#2f2f2d] border-slate-700">
                {topics?.map((topic) => (
                  <SelectItem 
                    key={topic.id} 
                    value={topic.id}
                    className="text-white hover:bg-[#1c1c1e]"
                  >
                    <div className="flex flex-col">
                      <span>{topic.name}</span>
                      <span className="text-xs text-slate-400 truncate max-w-[200px]">
                        {topic.description || topic.content.slice(0, 50) + '...'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Platform Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-300">Publish To</h3>
            {selectedPlatforms.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-slate-400 hover:text-white"
              >
                <Eye className="w-3 h-3 mr-1" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <div key={platform.id} className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => togglePlatform(platform.id)}
                    className={`w-full h-16 p-3 border-2 transition-all ${
                      isSelected
                        ? `${platform.bgColor} border-current ${platform.color}`
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {platform.icon}
                      <div className="text-left">
                        <div className="font-medium">{platform.name}</div>
                        {platform.maxLength && (
                          <div className="text-xs opacity-75">
                            Max {platform.maxLength} chars
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <X className="w-4 h-4 ml-auto" />
                      )}
                    </div>
                  </Button>
                  
                  {/* Platform Preview */}
                  {isSelected && showPreview && currentContent && (
                    <div className={`p-3 rounded-md border text-sm ${platform.bgColor}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {platform.icon}
                        <span className={`text-xs font-medium ${platform.color}`}>
                          {platform.name} Preview
                        </span>
                      </div>
                      <div className="space-y-1">
                        {currentTitle && (
                          <div className="font-medium text-white">{currentTitle}</div>
                        )}
                        <div className="text-slate-300 text-xs leading-relaxed">
                          {getPlatformPreview(platform).content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Platforms Summary */}
        {selectedPlatforms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map(platformId => {
              const platform = PLATFORMS.find(p => p.id === platformId);
              return platform ? (
                <Badge 
                  key={platformId}
                  variant="secondary"
                  className={`${platform.bgColor} ${platform.color} border`}
                >
                  {platform.icon}
                  <span className="ml-1">{platform.name}</span>
                  <button
                    onClick={() => togglePlatform(platformId)}
                    className="ml-2 hover:bg-black/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        )}

        {/* Scheduling */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">When to Publish</h3>
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
              Share Now
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
              Add to Queue
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
              Schedule
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handlePublish}
            disabled={!canPublish() || isPublishing}
            className="flex-1 bg-[#E669E8] hover:bg-[#d15dd3] text-white h-12 text-base font-medium"
          >
            {isPublishing ? (
              'Publishing...'
            ) : scheduleMode === 'now' ? (
              'Publish Now'
            ) : scheduleMode === 'queue' ? (
              'Add to Queue'
            ) : (
              'Schedule Post'
            )}
          </Button>
          <Button
            variant="outline"
            disabled={!canPublish()}
            className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
          >
            Save Draft
          </Button>
        </div>

        {/* Character counts for social platforms */}
        {selectedPlatforms.some(id => PLATFORMS.find(p => p.id === id)?.maxLength) && currentContent && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-slate-400">Character Limits</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {selectedPlatforms
                .map(id => PLATFORMS.find(p => p.id === id))
                .filter(p => p?.maxLength)
                .map(platform => {
                  if (!platform) return null;
                  const isOverLimit = currentContent.length > platform.maxLength!;
                  return (
                    <div key={platform.id} className={`flex justify-between ${
                      isOverLimit ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      <span>{platform.name}:</span>
                      <span>{currentContent.length}/{platform.maxLength}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}