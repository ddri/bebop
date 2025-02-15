import React, { useState } from 'react';
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Calendar,
  Clock,
  MoreVertical,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  Archive,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatePicker } from '@/components/ui/date-picker';
import Layout from '@/components/Layout';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useTopics } from '@/hooks/useTopics';

// TODO: Move to types/campaigns.ts
interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export default function Campaigns({ pathname }: { pathname: string }) {
  const { theme } = useTheme();
  const { campaigns, loading, error, createCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  const { topics } = useTopics();
  
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreateCampaign = async () => {
    if (!newCampaignName) return;
    
    setSaving(true);
    try {
      await createCampaign({
        name: newCampaignName,
        description: newCampaignDesc,
        startDate: startDate,
        endDate: endDate,
        status: 'draft'
      });
      
      setShowNewCampaignForm(false);
      setNewCampaignName('');
      setNewCampaignDesc('');
      setStartDate(null);
      setEndDate(null);
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (campaign: Campaign, newStatus: Campaign['status']) => {
    try {
      await updateCampaign(campaign.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    }
  };

  const handleDelete = async (campaign: Campaign) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(campaign.id);
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      }
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500';
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'archived':
        return 'bg-slate-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusActions = (campaign: Campaign) => {
    switch (campaign.status) {
      case 'draft':
        return (
          <DropdownMenuItem 
            onClick={() => handleStatusChange(campaign, 'active')}
            className="text-green-400 hover:bg-green-500 hover:text-white"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Activate Campaign
          </DropdownMenuItem>
        );
      case 'active':
        return (
          <>
            <DropdownMenuItem 
              onClick={() => handleStatusChange(campaign, 'completed')}
              className="text-blue-400 hover:bg-blue-500 hover:text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Campaign
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange(campaign, 'draft')}
              className="text-yellow-400 hover:bg-yellow-500 hover:text-white"
            >
              <PauseCircle className="h-4 w-4 mr-2" />
              Pause Campaign
            </DropdownMenuItem>
          </>
        );
      case 'completed':
        return (
          <DropdownMenuItem 
            onClick={() => handleStatusChange(campaign, 'archived')}
            className="text-slate-400 hover:bg-slate-500 hover:text-white"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive Campaign
          </DropdownMenuItem>
        );
      default:
        return null;
    }
  };

  return (
    <Layout pathname={pathname}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-white">Campaigns</h1>
        <Button 
          onClick={() => setShowNewCampaignForm(true)}
          className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* New Campaign Dialog */}
      <Dialog open={showNewCampaignForm} onOpenChange={setShowNewCampaignForm}>
        <DialogContent className="bg-[#1c1c1e] border-0">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Campaign</DialogTitle>
            <DialogDescription>
              Plan and schedule your content releases across multiple platforms.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Campaign Name"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                className="bg-[#2f2f2d] border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Campaign Description"
                value={newCampaignDesc}
                onChange={(e) => setNewCampaignDesc(e.target.value)}
                className="bg-[#2f2f2d] border-slate-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Start Date</label>
                <DatePicker
                  date={startDate}
                  onChange={setStartDate}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">End Date</label>
                <DatePicker
                  date={endDate}
                  onChange={setEndDate}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewCampaignForm(false)}
              className="border-slate-700 text-white hover:bg-[#2f2f2d]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={!newCampaignName || saving}
              className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
            >
              {saving ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <Card 
              key={campaign.id}
              className="group relative bg-[#1c1c1e] hover:scale-[1.00] hover:border hover:border-[#E669E8] transition-all duration-200 border-0"
            >
              {/* Status indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <div 
                  className={`h-2 w-2 rounded-full ${getStatusColor(campaign.status)}`}
                  title={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                />
              </div>

              <CardHeader className="pb-2 space-y-0">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-lg truncate pr-8 text-white">
                    {campaign.name}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#E669E8] hover:bg-transparent"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-[#1c1c1e] border-slate-700 text-white">
                      {getStatusActions(campaign)}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(campaign)}
                        className="text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="h-[60px] overflow-hidden">
                  {campaign.description ? (
                    <p className="text-sm text-slate-300 line-clamp-3">
                      {campaign.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      No description
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-slate-300 mt-4">
                  <div className="flex items-center gap-4">
                    {campaign.startDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(campaign.startDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {new Date(campaign.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-slate-500">
            No campaigns yet. Click "New Campaign" to create one.
          </div>
        )}
      </div>
    </Layout>
  );
}