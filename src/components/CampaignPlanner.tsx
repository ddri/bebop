import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTopics } from '@/hooks/useTopics';
import { 
  Plus,
  ArrowLeft,
  Calendar,
  Globe,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Layout from '@/components/Layout';

interface PublishingSlot {
  id: string;
  topicId?: string;
  platform?: string;
  scheduledDate?: Date;
}

interface CampaignPlannerProps {
  campaignId: string;
  pathname: string;
}

const PLATFORMS = [
  { id: 'devto', name: 'Dev.to' },
  { id: 'hashnode', name: 'Hashnode' },
  { id: 'medium', name: 'Medium' }
];

export default function CampaignPlanner({ campaignId, pathname }: CampaignPlannerProps) {
  const router = useRouter();
  const { topics } = useTopics();
  const [slots, setSlots] = useState<PublishingSlot[]>([
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ]);
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  const handleTopicSelect = (topicId: string) => {
    if (!activeSlotId) return;
    
    setSlots(currentSlots => 
      currentSlots.map(slot => 
        slot.id === activeSlotId
          ? { ...slot, topicId }
          : slot
      )
    );
    setShowTopicSelector(false);
    setActiveSlotId(null);
  };

  const handlePlatformSelect = (slotId: string, platform: string) => {
    setSlots(currentSlots =>
      currentSlots.map(slot =>
        slot.id === slotId
          ? { ...slot, platform }
          : slot
      )
    );
  };

  const handleDateSelect = (slotId: string, date: Date | null) => {
    if (!date) return;
    setSlots(currentSlots =>
      currentSlots.map(slot =>
        slot.id === slotId
          ? { ...slot, scheduledDate: date }
          : slot
      )
    );
  };

  const addNewSlot = () => {
    setSlots(current => [
      ...current,
      { id: String(current.length + 1) }
    ]);
  };

  return (
    <Layout pathname={pathname}>
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-white hover:text-[#E669E8]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>
      </div>

      <div className="space-y-4">
        {slots.map((slot) => (
          <Card 
            key={slot.id}
            className="bg-[#1c1c1e] border-0 hover:border hover:border-[#E669E8] transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Topic Selection */}
                <div 
                  className="col-span-1 cursor-pointer"
                  onClick={() => {
                    setActiveSlotId(slot.id);
                    setShowTopicSelector(true);
                  }}
                >
                  <div className="flex items-center space-x-2 p-2 rounded bg-[#2f2f2d] hover:bg-[#3f3f3d]">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-white">
                      {slot.topicId 
                        ? topics.find(t => t.id === slot.topicId)?.name 
                        : 'Select Topic'}
                    </span>
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="col-span-1">
                  <Select
                    value={slot.platform}
                    onValueChange={(value) => handlePlatformSelect(slot.id, value)}
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
                <div className="col-span-1">
                  <DatePicker
                    date={slot.scheduledDate}
                    onChange={(date) => handleDateSelect(slot.id, date)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Slot Button */}
        <Button
          onClick={addNewSlot}
          className="w-full bg-[#2f2f2d] hover:bg-[#3f3f3d] text-white border border-dashed border-slate-700 py-8"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Publishing Slot
        </Button>
      </div>

      {/* Topic Selector Dialog */}
      <Dialog open={showTopicSelector} onOpenChange={setShowTopicSelector}>
        <DialogContent className="bg-[#1c1c1e] border-0 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Select Topic</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  className="p-4 bg-[#2f2f2d] rounded-md hover:bg-[#3f3f3d] cursor-pointer"
                  onClick={() => handleTopicSelect(topic.id)}
                >
                  <h3 className="font-medium text-white">{topic.name}</h3>
                  {topic.description && (
                    <p className="text-sm text-slate-400 mt-1">
                      {topic.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}