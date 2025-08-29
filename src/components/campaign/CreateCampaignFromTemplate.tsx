'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';
import { CampaignTemplate, CreateCampaignFromTemplateInput } from '@/types/campaign-templates';
import { useRouter } from 'next/navigation';
import { useCampaignTemplates } from '@/hooks/useCampaignTemplates';

interface CreateCampaignFromTemplateProps {
  template: CampaignTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCampaignFromTemplate: React.FC<CreateCampaignFromTemplateProps> = ({
  template,
  isOpen,
  onClose
}) => {
  const router = useRouter();
  const { createCampaignFromTemplate } = useCampaignTemplates();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<CreateCampaignFromTemplateInput, 'templateId'>>({
    name: '',
    description: '',
    startDate: new Date().toISOString(),
    adjustSchedule: true
  });

  const handleSubmit = async () => {
    if (!template) return;
    
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const campaign = await createCampaignFromTemplate({
        templateId: template.id,
        ...formData
      });
      
      // Navigate to the new campaign
      router.push(`/campaigns/${campaign.id}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  if (!template) return null;

  const startDate = formData.startDate ? new Date(formData.startDate) : undefined;
  const endDate = startDate ? new Date(startDate.getTime() + template.structure.suggestedDuration * 24 * 60 * 60 * 1000) : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Campaign from Template</DialogTitle>
          <DialogDescription>
            Create a new campaign based on "{template.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter campaign name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional campaign description"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                startDate: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
              })}
              disabled={loading}
            />
            {endDate && (
              <p className="text-sm text-muted-foreground">
                Campaign will run until {endDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} ({template.structure.suggestedDuration} days)
              </p>
            )}
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="adjust-schedule">Adjust Schedule</Label>
              <p className="text-sm text-muted-foreground">
                Automatically adjust content and task dates based on start date
              </p>
            </div>
            <Switch
              id="adjust-schedule"
              checked={formData.adjustSchedule}
              onCheckedChange={(checked) => setFormData({ ...formData, adjustSchedule: checked })}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="rounded-md bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">This template includes:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {template.structure.contentSlots.length} content pieces</li>
              <li>• {template.structure.tasks.length} manual tasks</li>
              <li>• {template.structure.platforms.length} platforms</li>
              {template.structure.goals && template.structure.goals.length > 0 && (
                <li>• {template.structure.goals.length} defined goals</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};