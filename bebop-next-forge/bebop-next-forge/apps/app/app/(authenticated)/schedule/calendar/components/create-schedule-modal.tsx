'use client';

import type { CampaignStatus, DestinationType } from '@repo/database/types';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Calendar, Clock, Globe, Target } from 'lucide-react';
import { useState } from 'react';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date | null;
  destinations: {
    id: string;
    name: string;
    type: DestinationType;
  }[];
  campaigns: {
    id: string;
    name: string;
    status: CampaignStatus;
  }[];
}

export const CreateScheduleModal = ({
  isOpen,
  onClose,
  initialDate,
  destinations,
  campaigns,
}: CreateScheduleModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [scheduledDate, setScheduledDate] = useState(
    initialDate ? initialDate.toISOString().slice(0, 16) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !title ||
      !content ||
      !selectedDestination ||
      !selectedCampaign ||
      !scheduledDate
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to create schedule
      console.log('Creating schedule:', {
        title,
        content,
        destinationId: selectedDestination,
        campaignId: selectedCampaign,
        publishAt: new Date(scheduledDate),
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form and close modal
      setTitle('');
      setContent('');
      setSelectedDestination('');
      setSelectedCampaign('');
      setScheduledDate('');
      onClose();
    } catch (error) {
      console.error('Failed to create schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDestinationObj = destinations.find(
    (d) => d.id === selectedDestination
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Content
          </DialogTitle>
          <DialogDescription>
            Create and schedule content to be published on your selected
            platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your content here..."
              rows={6}
              required
            />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Select
              value={selectedDestination}
              onValueChange={setSelectedDestination}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination">
                  {selectedDestinationObj && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {selectedDestinationObj.name} (
                      {selectedDestinationObj.type})
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {destinations.map((destination) => (
                  <SelectItem key={destination.id} value={destination.id}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {destination.name} ({destination.type})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campaign */}
          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign</Label>
            <Select
              value={selectedCampaign}
              onValueChange={setSelectedCampaign}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select campaign">
                  {campaigns.find((c) => c.id === selectedCampaign) && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {campaigns.find((c) => c.id === selectedCampaign)?.name}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {campaigns
                  .filter((campaign) => campaign.status === 'ACTIVE')
                  .map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {campaign.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled Date & Time */}
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Publish Date & Time</Label>
            <div className="relative">
              <Clock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Content'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
