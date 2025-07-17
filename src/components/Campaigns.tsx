// src/components/Campaigns.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Clock } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { CreateCampaignInput } from '@/types/campaigns';

export default function Campaigns() {
  const router = useRouter();
  const { campaigns, loading, error, createCampaign } = useCampaigns();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState<CreateCampaignInput>({
    name: '',
    description: '',
    status: 'draft',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateCampaign = async () => {
    if (!newCampaignData.name) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const campaign = await createCampaign(newCampaignData);
      setShowNewDialog(false);
      setNewCampaignData({
        name: '',
        description: '',
        status: 'draft',
      });
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-lg text-white">Loading campaigns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-white">Campaigns</h1>
        <Button 
          onClick={() => setShowNewDialog(true)}
          className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <Card 
              key={campaign.id}
              className="group relative bg-[#1c1c1e] hover:scale-[1.02] hover:border hover:border-[#E669E8] transition-all duration-200 border-0 cursor-pointer"
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
              <CardHeader className="pb-2">
                <h3 className="font-semibold text-lg text-white">{campaign.name}</h3>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {campaign.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-slate-400">
            No campaigns yet. Click &quot;New Campaign&quot; to create one.
          </div>
        )}
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="bg-[#1c1c1e] border-0">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a new campaign to manage your content publishing schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Campaign Name"
                value={newCampaignData.name}
                onChange={(e) => setNewCampaignData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-[#2f2f2d] border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Campaign Description (optional)"
                value={newCampaignData.description || ''}
                onChange={(e) => setNewCampaignData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-[#2f2f2d] border-slate-700 text-white resize-none"
                rows={3}
              />
            </div>
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewDialog(false)}
              disabled={isCreating}
              className="border-slate-700 text-white hover:bg-[#2f2f2d]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={!newCampaignData.name || isCreating}
              className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
            >
              {isCreating ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}