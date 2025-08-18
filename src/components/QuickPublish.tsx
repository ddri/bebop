'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Zap, Calendar, Clock, Send, FileText, Hash, MessageSquare, Globe } from 'lucide-react';
import { useTopics } from '@/hooks/useTopics';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const PLATFORMS: Platform[] = [
  { 
    id: 'hashnode', 
    name: 'Hashnode', 
    icon: <Hash className="w-4 h-4" />, 
    color: 'border-blue-500 text-blue-500' 
  },
  { 
    id: 'devto', 
    name: 'Dev.to', 
    icon: <FileText className="w-4 h-4" />, 
    color: 'border-green-500 text-green-500' 
  },
  { 
    id: 'bluesky', 
    name: 'Bluesky', 
    icon: <MessageSquare className="w-4 h-4" />, 
    color: 'border-sky-500 text-sky-500' 
  },
  { 
    id: 'mastodon', 
    name: 'Mastodon', 
    icon: <Globe className="w-4 h-4" />, 
    color: 'border-purple-500 text-purple-500' 
  }
];

type ScheduleOption = 'now' | 'queue' | 'custom';

export default function QuickPublish() {
  const { topics } = useTopics();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption>('queue');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedTopicData = topics?.find(t => t.id === selectedTopic);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const canPublish = selectedTopic && selectedPlatforms.length > 0;

  const handlePublish = async () => {
    if (!canPublish) return;

    setIsPublishing(true);
    setError(null);
    setSuccess(null);

    try {
      // Mock API call - replace with actual publishing logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const platformNames = selectedPlatforms
        .map(id => PLATFORMS.find(p => p.id === id)?.name)
        .join(', ');
      
      setSuccess(`Successfully scheduled for ${platformNames}!`);
      
      // Reset form
      setSelectedTopic('');
      setSelectedPlatforms([]);
      setScheduleOption('queue');
      setCustomDate('');
      setCustomTime('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish content');
    } finally {
      setIsPublishing(false);
    }
  };

  const getScheduleText = () => {
    switch (scheduleOption) {
      case 'now':
        return 'Publish immediately';
      case 'queue':
        return 'Add to publishing queue';
      case 'custom':
        return customDate && customTime 
          ? `Schedule for ${new Date(`${customDate}T${customTime}`).toLocaleString()}`
          : 'Set custom date and time';
      default:
        return '';
    }
  };

  return (
    <Card className="bg-[#1c1c1e] border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="w-5 h-5 text-[#E669E8]" />
          Quick Publish
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Select Content */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">1. Select Content</h3>
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="bg-[#2f2f2d] border-slate-700 text-white">
              <SelectValue placeholder="Choose from your topics..." />
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
                      {topic.description || 'No description'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Content Preview */}
          {selectedTopicData && (
            <div className="bg-[#2f2f2d] p-3 rounded-md border border-slate-700">
              <p className="text-xs text-slate-400 mb-2">Preview:</p>
              <p className="text-sm text-slate-300 line-clamp-3">
                {selectedTopicData.content.slice(0, 200)}...
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Choose Platforms */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">2. Choose Platforms</h3>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map((platform) => (
              <Button
                key={platform.id}
                variant="outline"
                onClick={() => togglePlatform(platform.id)}
                className={`h-auto p-3 justify-start gap-3 border-2 transition-all ${
                  selectedPlatforms.includes(platform.id)
                    ? `${platform.color} bg-opacity-10`
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {platform.icon}
                <span className="font-medium">{platform.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Step 3: Schedule */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">3. Schedule</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScheduleOption('now')}
                className={`flex-1 ${
                  scheduleOption === 'now' 
                    ? 'border-[#E669E8] text-[#E669E8]' 
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                <Send className="w-4 h-4 mr-1" />
                Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScheduleOption('queue')}
                className={`flex-1 ${
                  scheduleOption === 'queue' 
                    ? 'border-[#E669E8] text-[#E669E8]' 
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4 mr-1" />
                Queue
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScheduleOption('custom')}
                className={`flex-1 ${
                  scheduleOption === 'custom' 
                    ? 'border-[#E669E8] text-[#E669E8]' 
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Custom
              </Button>
            </div>

            {/* Custom Date/Time Inputs */}
            {scheduleOption === 'custom' && (
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

            {/* Schedule Summary */}
            <div className="bg-[#2f2f2d] p-3 rounded-md border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Schedule:</p>
              <p className="text-sm text-white">{getScheduleText()}</p>
            </div>
          </div>
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
          disabled={!canPublish || isPublishing}
          className="w-full bg-[#E669E8] hover:bg-[#d15dd3] text-white h-12 text-base font-medium"
        >
          {isPublishing ? 'Publishing...' : 'Publish Content'}
        </Button>

        {/* Help Text */}
        {!canPublish && (
          <p className="text-xs text-slate-400 text-center">
            Select content and at least one platform to publish
          </p>
        )}
      </CardContent>
    </Card>
  );
}