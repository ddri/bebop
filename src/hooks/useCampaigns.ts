// hooks/useCampaigns.ts
import { useState, useCallback, useEffect } from 'react';
import { Campaign, CreateCampaignInput } from '@/types/campaigns';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/campaigns');
        if (!response.ok) throw new Error('Failed to fetch campaigns');
        const data = await response.json();
        setCampaigns(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const createCampaign = useCallback(async (input: CreateCampaignInput) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error('Failed to create campaign');

      const newCampaign = await response.json();
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, data: Partial<Campaign>) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update campaign');

      const updatedCampaign = await response.json();
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id ? updatedCampaign : campaign
        )
      );
      return updatedCampaign;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const createPublishingPlan = useCallback(async (data: {
    campaignId: string;
    topicId: string;
    platform: string;
    scheduledFor?: Date;
  }) => {
    try {
      const response = await fetch('/api/publishing-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create publishing plan');

      const newPlan = await response.json();

      // Update the local campaigns state
      setCampaigns(prev => prev.map(campaign => {
        if (campaign.id === data.campaignId) {
          return {
            ...campaign,
            publishingPlans: [...campaign.publishingPlans, newPlan]
          };
        }
        return campaign;
      }));

      return newPlan;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const deletePublishingPlan = useCallback(async (planId: string, campaignId: string) => {
    try {
      const response = await fetch(`/api/publishing-plans/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete publishing plan');

      // Update the local campaigns state
      setCampaigns(prev => prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            publishingPlans: campaign.publishingPlans.filter(plan => plan.id !== planId)
          };
        }
        return campaign;
      }));
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const updatePublishingPlan = useCallback(async (
    planId: string,
    campaignId: string,
    data: {
      status: 'scheduled' | 'published' | 'failed';
      publishedAt?: Date;
      publishedUrl?: string;
    }
  ) => {
    try {
      const response = await fetch(`/api/publishing-plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update publishing plan');

      const updatedPlan = await response.json();

      // Update the local campaigns state
      setCampaigns(prev => prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            publishingPlans: campaign.publishingPlans.map(plan => 
              plan.id === planId ? updatedPlan : plan
            )
          };
        }
        return campaign;
      }));

      return updatedPlan;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  return {
    campaigns,
    loading,
    error,
    createCampaign,
    updateCampaign,
    createPublishingPlan,
    deletePublishingPlan,
    updatePublishingPlan
  };
};

export default useCampaigns;