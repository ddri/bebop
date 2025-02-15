// src/components/CampaignDetails.tsx
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

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign }) => {
  const { updateCampaign } = useCampaigns();
  const [description, setDescription] = useState(campaign.description || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateCampaign(campaign.id, { description });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
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
              Edit Description
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter campaign description..."
                className="min-h-[100px] bg-[#2f2f2d] border-slate-700 text-white resize-none"
              />
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
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
                onClick={() => {
                  setIsEditing(false);
                  setDescription(campaign.description || '');
                  setError(null);
                }}
                disabled={isSaving}
                className="border-slate-700 text-white hover:bg-[#2f2f2d]"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-slate-300">
            {description || 'No description provided'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignDetails;