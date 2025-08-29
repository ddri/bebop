import { useState, useCallback, useEffect } from 'react';
import { CampaignTemplate, CreateTemplateFromCampaignInput, CreateCampaignFromTemplateInput } from '@/types/campaign-templates';

export const useCampaignTemplates = (includePublic: boolean = true) => {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch templates on mount
  const fetchTemplates = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (includePublic) params.append('includePublic', 'true');
      if (category) params.append('category', category);

      const response = await fetch(`/api/templates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [includePublic]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Create template from existing campaign
  const createTemplateFromCampaign = useCallback(async (input: CreateTemplateFromCampaignInput) => {
    try {
      const response = await fetch('/api/templates/from-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create template');
      }

      const newTemplate = await response.json();
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  // Create campaign from template
  const createCampaignFromTemplate = useCallback(async (input: CreateCampaignFromTemplateInput) => {
    try {
      const response = await fetch('/api/campaigns/from-template', {
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
      
      // Update template usage count locally
      setTemplates(prev => prev.map(template => 
        template.id === input.templateId 
          ? { ...template, usageCount: template.usageCount + 1, lastUsedAt: new Date().toISOString() }
          : template
      ));

      return newCampaign;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  // Update template
  const updateTemplate = useCallback(async (id: string, data: Partial<CampaignTemplate>) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }

      const updatedTemplate = await response.json();
      setTemplates(prev => 
        prev.map(template => 
          template.id === id ? updatedTemplate : template
        )
      );
      return updatedTemplate;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  // Delete template
  const deleteTemplate = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete template');
      }

      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  // Get templates by category
  const getTemplatesByCategory = useCallback((category: string) => {
    return templates.filter(template => template.category === category);
  }, [templates]);

  // Get popular templates
  const getPopularTemplates = useCallback(() => {
    return [...templates].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);
  }, [templates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplateFromCampaign,
    createCampaignFromTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    getPopularTemplates,
  };
};

export default useCampaignTemplates;