import useSWR from 'swr';

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

interface CreateCampaignInput {
  name: string;
  description?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  status: Campaign['status'];
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }
  return response.json();
};

export function useCampaigns() {
  const { data: campaigns = [], error, mutate } = useSWR<Campaign[]>('/api/campaigns', fetcher);

  const createCampaign = async (input: CreateCampaignInput) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      
      if (!response.ok) throw new Error('Failed to create campaign');
      const newCampaign = await response.json();
      
      // Optimistic update
      mutate(current => [newCampaign, ...(current || [])], false);
      
      // Revalidate
      await mutate();
      return newCampaign;
    } catch (err) {
      await mutate();
      throw err;
    }
  };

  const updateCampaign = async (id: string, data: Partial<Campaign>) => {
    try {
      // Optimistic update
      mutate(
        campaigns?.map(campaign =>
          campaign.id === id
            ? { ...campaign, ...data, updatedAt: new Date().toISOString() }
            : campaign
        ),
        false
      );

      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to update campaign');
      
      // Revalidate
      await mutate();
      return response.json();
    } catch (err) {
      // Revalidate on error
      await mutate();
      throw err;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      // Optimistic update
      mutate(
        campaigns?.filter(campaign => campaign.id !== id),
        false
      );

      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete campaign');
      
      // Revalidate
      await mutate();
      return true;
    } catch (err) {
      // Revalidate on error
      await mutate();
      throw err;
    }
  };

  return {
    campaigns,
    loading: !error && !campaigns,
    error: error?.message,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    refreshCampaigns: () => mutate()
  };