import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Save, Pencil } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Campaign } from '@/types/campaigns';
import { useCampaigns } from '@/hooks/useCampaigns';

interface CampaignDetailsProps {
  campaign: Campaign;
}

interface EditDataState {
  description: string;
}

const CampaignDetails = ({ campaign }: CampaignDetailsProps) => {
  const { updateCampaign } = useCampaigns();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editData, setEditData] = useState<EditDataState>({
    description: campaign.description || ''
  });

  const handleSave = async () => {
    if (!editData.description.trim()) {
      setError('Description cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Only send the description field in the update
      const updatedCampaign = await updateCampaign(campaign.id, {
        description: editData.description.trim()
      });

      if (updatedCampaign) {
        setIsEditing(false);
      } else {
        throw new Error('Failed to update campaign - no response received');
      }
    } catch (err) {
      console.error('Campaign update error:', err);
      setError(
        err instanceof Error 
          ? `Failed to save changes: ${err.message}` 
          : 'Failed to save changes. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      description: campaign.description || ''
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
                onChange={(e) => {
                  setEditData(prev => ({ ...prev, description: e.target.value }));
                  setError(null); // Clear error when user starts typing
                }}
                placeholder="Enter campaign description..."
                className="min-h-[100px] bg-[#2f2f2d] border-slate-700 text-white resize-none"
              />
            ) : (
              <p className="text-slate-300">
                {campaign.description || 'No description provided'}
              </p>
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
                disabled={isSaving || !editData.description.trim()}
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