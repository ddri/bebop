// hooks/useCampaigns.ts
import { useState, useCallback, useEffect } from 'react';
import { Campaign, CreateCampaignInput } from '@/types/campaigns';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
        setError(err instanceof Error ? err : new Error('Unknown error'));
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create campaign');
      }

      const newCampaign = await response.json();
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, data: Partial<Campaign>) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT', // Changed from PATCH to PUT
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update campaign');
      }

      const updatedCampaign = await response.json();
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id ? updatedCampaign : campaign
        )
      );
      return updatedCampaign;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create publishing plan');
      }

      const newPlan = await response.json();
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
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  const deletePublishingPlan = useCallback(async (planId: string, campaignId: string) => {
    try {
      const response = await fetch(`/api/publishing-plans/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete publishing plan');
      }

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
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
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
        method: 'PUT', // Changed from PATCH to PUT
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update publishing plan');
      }

      const updatedPlan = await response.json();
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
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
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