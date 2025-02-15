import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTopics } from '@/hooks/useTopics';
import { useCampaigns } from '@/hooks/useCampaigns';
import { 
  ArrowLeft,
  Calendar,
  Globe,
  FileText,
  Play,
  Pause,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import Layout from '@/components/Layout';
import { 
  Campaign, 
  CampaignStatus, 
  NewPublicationSlot, 
  PublishingSlot,
  PLATFORMS 
} from '@/types/campaigns';

export default function CampaignPlanner({ campaignId, pathname }: { campaignId: string; pathname: string }) {
  const router = useRouter();
  const { topics } = useTopics();
  const { campaigns, updateCampaign } = useCampaigns();
  
  // State for the new publication form
  const [newSlot, setNewSlot] = useState<NewPublicationSlot>({});
  const [confirmedPublications, setConfirmedPublications] = useState<PublishingSlot[]>([]);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  
  const campaign = campaigns?.find(c => c.id === campaignId);

  const handleDateSelect = (date: Date | null) => {
    setNewSlot(prev => ({
      ...prev,
      scheduledDate: date ?? undefined
    }));
  };

  const handlePublishNow = () => {
    setNewSlot(prev => ({
      ...prev,
      scheduledDate: new Date()
    }));
  };

  const isSlotComplete = () => {
    return newSlot.topicId && newSlot.platform && newSlot.scheduledDate;
  };

  const handleConfirmSlot = () => {
    if (!isSlotComplete()) return;

    const newPublication: PublishingSlot = {
      id: Date.now().toString(), // temporary ID
      topicId: newSlot.topicId!,
      platform: newSlot.platform!,
      scheduledDate: newSlot.scheduledDate!,
      status: 'scheduled'
    };

    setConfirmedPublications(prev => [...prev, newPublication]);
    setNewSlot({}); // Reset the form
  };

  const handleCampaignStatusChange = async (newStatus: CampaignStatus) => {
    if (!campaign) return;
    try {
      await updateCampaign(campaign.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    }
  };

  return (
    <Layout pathname={pathname}>
      {/* Header with back button and campaign controls */}
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
          {campaign && (
            <h1 className="text-2xl font-semibold text-white">
              {campaign.name}
            </h1>
          )}
        </div>
        
        {/* Campaign Status Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Campaign Status:</span>
          {campaign?.status === 'active' ? (
            <Button
              size="sm"
              onClick={() => handleCampaignStatusChange('paused')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause Campaign
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleCampaignStatusChange('active')}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Activate Campaign
            </Button>
          )}
        </div>
      </div>

      {/* New Publication Form */}
      <Card className="mb-8 bg-[#1c1c1e] border-0">
        <CardHeader>
          <CardTitle className="text-white">Add New Publication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
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
                onValueChange={(value) => setNewSlot(prev => ({ ...prev, platform: value }))}
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

            {/* Date Selection */}
            <div className="col-span-1 space-y-2">
              <div className="flex gap-2">
                <DatePicker
                  date={newSlot.scheduledDate}
                  onChange={handleDateSelect}
                />
                <Button
                  variant="outline"
                  onClick={handlePublishNow}
                  className="border-slate-700 text-white hover:bg-[#2f2f2d]"
                >
                  Now
                </Button>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleConfirmSlot}
              disabled={!isSlotComplete()}
              className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Publication
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Publications Lists */}
      <div className="space-y-8">
        {/* Scheduled Publications */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Scheduled Publications</h2>
          {confirmedPublications.filter(pub => pub.status === 'scheduled').length > 0 ? (
            confirmedPublications
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
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-white">
                            {pub.scheduledDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setConfirmedPublications(prev => 
                            prev.filter(p => p.id !== pub.id)
                          );
                        }}
                        className="hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              No scheduled publications.
            </div>
          )}
        </div>

        {/* Published History */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Publication History</h2>
          {confirmedPublications.filter(pub => pub.status === 'published').length > 0 ? (
            confirmedPublications
              .filter(pub => pub.status === 'published')
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
                            Published on {pub.scheduledDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open('#', '_blank')} // TODO: Add actual published URL
                        className="hover:text-[#E669E8]"
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
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
        {confirmedPublications.filter(pub => pub.status === 'failed').length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-red-500 mb-4">Failed Publications</h2>
            {confirmedPublications
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
                            Failed to publish on {pub.scheduledDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Add retry logic
                          console.log('Retry publication:', pub.id);
                        }}
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
              ))
            }
            </div>
        )}
      </div>
    </Layout>
  );
}