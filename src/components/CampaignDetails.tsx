// src/components/CampaignDetails.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Save, Pencil, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Campaign, CampaignStatus } from '@/types/campaigns';
import { useCampaigns } from '@/hooks/useCampaigns';

interface CampaignDetailsProps {
  campaign: Campaign;
}

interface EditDataState {
  description: string;
  startDate?: Date;
  endDate?: Date;
  status: CampaignStatus;
}

const CampaignDetails = ({ campaign }: CampaignDetailsProps) => {
  const { updateCampaign } = useCampaigns();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editData, setEditData] = useState<EditDataState>({
    description: campaign.description || '',
    startDate: campaign.startDate ? new Date(campaign.startDate) : undefined,
    endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
    status: campaign.status
  });

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateCampaign(campaign.id, {
        description: editData.description,
        startDate: editData.startDate,
        endDate: editData.endDate,
        status: editData.status
      });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'paused':
        return 'text-yellow-500';
      case 'completed':
        return 'text-blue-500';
      case 'archived':
        return 'text-gray-500';
      default:
        return 'text-slate-500';
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      description: campaign.description || '',
      startDate: campaign.startDate ? new Date(campaign.startDate) : undefined,
      endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
      status: campaign.status
    });
    setError(null);
  };

  return (
    <Card className="mb-8 bg-[#1c1c1e] border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Campaign Details</h2>
          {!isEditing && (
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-white hover:bg-[#2f2f2d]"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Description Section */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Description</label>
            {isEditing ? (
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter campaign description..."
                className="min-h-[100px] bg-[#2f2f2d] border-slate-700 text-white resize-none"
              />
            ) : (
              <p className="text-slate-300">
                {editData.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Date Range Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Start Date</label>
              {isEditing ? (
                <DatePicker
                  date={editData.startDate}
                  onChange={(date) => setEditData(prev => ({ ...prev, startDate: date || undefined }))}
                />
              ) : (
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  {formatDate(editData.startDate)}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-400">End Date</label>
              {isEditing ? (
                <DatePicker
                  date={editData.endDate}
                  onChange={(date) => setEditData(prev => ({ ...prev, endDate: date || undefined }))}
                />
              ) : (
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  {formatDate(editData.endDate)}
                </div>
              )}
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Campaign Status</label>
            {isEditing ? (
              <Select
                value={editData.status}
                onValueChange={(value: CampaignStatus) => 
                  setEditData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="bg-[#2f2f2d] border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1c1e] border-slate-700">
                  <SelectItem value="draft" className="text-white hover:bg-[#2f2f2d]">Draft</SelectItem>
                  <SelectItem value="active" className="text-white hover:bg-[#2f2f2d]">Active</SelectItem>
                  <SelectItem value="paused" className="text-white hover:bg-[#2f2f2d]">Paused</SelectItem>
                  <SelectItem value="completed" className="text-white hover:bg-[#2f2f2d]">Completed</SelectItem>
                  <SelectItem value="archived" className="text-white hover:bg-[#2f2f2d]">Archived</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <div className={`capitalize ${getStatusColor(editData.status)}`}>
                  {editData.status}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
              >
                {isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="border-slate-700 text-white hover:bg-[#2f2f2d]"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignDetails;