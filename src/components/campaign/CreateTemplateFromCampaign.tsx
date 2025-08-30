'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateTemplateFromCampaignInput } from '@/types/campaign-templates';
import { useCampaignTemplates } from '@/hooks/useCampaignTemplates';

interface CreateTemplateFromCampaignProps {
  campaignId: string;
  campaignName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TEMPLATE_CATEGORIES = [
  { value: 'product-launch', label: 'Product Launch' },
  { value: 'content-series', label: 'Content Series' },
  { value: 'seasonal', label: 'Seasonal Campaign' },
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'custom', label: 'Custom' }
];

export const CreateTemplateFromCampaign: React.FC<CreateTemplateFromCampaignProps> = ({
  campaignId,
  campaignName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createTemplateFromCampaign } = useCampaignTemplates();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<CreateTemplateFromCampaignInput, 'campaignId'>>({
    name: `${campaignName} Template`,
    description: '',
    category: 'custom',
    isPublic: false
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Template name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createTemplateFromCampaign({
        campaignId,
        ...formData
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Template from Campaign</DialogTitle>
          <DialogDescription>
            Save &quot;{campaignName}&quot; as a reusable template for future campaigns
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter template name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this template is for"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={loading}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="public">Make Public</Label>
              <p className="text-sm text-muted-foreground">
                Allow other users to use this template
              </p>
            </div>
            <Switch
              id="public"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="rounded-md bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">What will be saved:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Content structure and scheduling</li>
              <li>• Manual tasks and their timing</li>
              <li>• Platform configuration</li>
              <li>• Campaign duration and pacing</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Note: Actual content and specific dates will not be saved.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};