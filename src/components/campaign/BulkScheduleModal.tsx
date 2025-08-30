'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Clock } from 'lucide-react';

interface BulkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: Date) => Promise<void>;
  itemCount: number;
}

export const BulkScheduleModal: React.FC<BulkScheduleModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  itemCount
}) => {
  const [scheduleType, setScheduleType] = useState<'immediate' | 'specific' | 'staggered'>('specific');
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
  const [specificTime, setSpecificTime] = useState('09:00');
  const [staggerDays, setStaggerDays] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      if (scheduleType === 'immediate') {
        await onSchedule(new Date());
      } else if (scheduleType === 'specific') {
        const dateTime = new Date(`${specificDate}T${specificTime}`);
        await onSchedule(dateTime);
      } else if (scheduleType === 'staggered') {
        // For staggered, we'll schedule the first item for the specific date/time
        // The backend or additional logic would handle staggering
        const dateTime = new Date(`${specificDate}T${specificTime}`);
        await onSchedule(dateTime);
      }
      onClose();
    } catch (error) {
      console.error('Failed to schedule items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule {itemCount} Items</DialogTitle>
          <DialogDescription>
            Choose when to publish the selected content items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={scheduleType} onValueChange={(value) => setScheduleType(value as 'immediate' | 'specific' | 'staggered')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="immediate" id="immediate" />
              <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                <div>
                  <div className="font-medium">Schedule Immediately</div>
                  <div className="text-sm text-muted-foreground">
                    Publish all items as soon as possible
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="specific" id="specific" />
              <Label htmlFor="specific" className="flex-1 cursor-pointer">
                <div>
                  <div className="font-medium">Specific Date & Time</div>
                  <div className="text-sm text-muted-foreground">
                    Schedule all items for the same time
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="staggered" id="staggered" />
              <Label htmlFor="staggered" className="flex-1 cursor-pointer">
                <div>
                  <div className="font-medium">Staggered Schedule</div>
                  <div className="text-sm text-muted-foreground">
                    Spread items over multiple days
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {(scheduleType === 'specific' || scheduleType === 'staggered') && (
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {scheduleType === 'staggered' ? 'Start Date' : 'Date'}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={specificTime}
                  onChange={(e) => setSpecificTime(e.target.value)}
                  disabled={loading}
                />
              </div>

              {scheduleType === 'staggered' && (
                <div className="space-y-2">
                  <Label htmlFor="stagger">Days Between Posts</Label>
                  <Input
                    id="stagger"
                    type="number"
                    min="1"
                    max="30"
                    value={staggerDays}
                    onChange={(e) => setStaggerDays(Number(e.target.value))}
                    disabled={loading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Items will be scheduled {staggerDays} day{staggerDays > 1 ? 's' : ''} apart
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Scheduling...' : `Schedule ${itemCount} Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};