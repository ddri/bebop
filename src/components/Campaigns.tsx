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
import { AlertCircle, Plus, Clock, FileText, Globe, MoreHorizontal, Edit3 } from 'lucide-react';
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
        <div className="text-lg text-red-500">{error?.message || 'An error occurred'}</div>
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
          campaigns.map((campaign) => {
            // Mock data for campaign metrics - replace with real data
            const contentCount = Math.floor(Math.random() * 10) + 1;
            const publishedCount = Math.floor(Math.random() * contentCount);
            const scheduledCount = contentCount - publishedCount;
            
            return (
              <Card 
                key={campaign.id}
                className="group relative bg-[#1c1c1e] hover:border hover:border-[#E669E8] transition-all duration-200 border-0"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-white truncate">{campaign.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${{
                          'draft': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
                          'active': 'bg-green-500/10 text-green-400 border border-green-500/20',
                          'paused': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
                          'completed': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                          'archived': 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }[campaign.status] || 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                          {campaign.status}
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle campaign menu
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-300 line-clamp-2 min-h-[2.5rem]">
                    {campaign.description || 'No description provided'}
                  </p>

                  {/* Campaign Metrics */}
                  <div className="grid grid-cols-3 gap-3 py-3 border-t border-slate-700">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{contentCount}</div>
                      <div className="text-xs text-slate-400">Content</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-400">{publishedCount}</div>
                      <div className="text-xs text-slate-400">Published</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-400">{scheduledCount}</div>
                      <div className="text-xs text-slate-400">Scheduled</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/campaigns/${campaign.id}`)}
                      className="flex-1 bg-[#E669E8] hover:bg-[#d15dd3] text-white text-sm h-9"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Quick view or preview functionality
                      }}
                      className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm h-9 px-3"
                    >
                      <Globe className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 text-slate-400">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto bg-[#E669E8]/10 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-[#E669E8]" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Create Your First Campaign</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Organize your content around strategic marketing campaigns and publish across multiple platforms.
                </p>
                <Button 
                  onClick={() => setShowNewDialog(true)}
                  className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            </div>
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