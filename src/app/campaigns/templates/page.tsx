'use client';

import React, { useState } from 'react';
import { TemplateGallery } from '@/components/campaign/TemplateGallery';
import { TemplatePreview } from '@/components/campaign/TemplatePreview';
import { CreateCampaignFromTemplate } from '@/components/campaign/CreateCampaignFromTemplate';
import { CampaignTemplate } from '@/types/campaign-templates';
import { useCampaignTemplates } from '@/hooks/useCampaignTemplates';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CampaignTemplatesPage() {
  const router = useRouter();
  const { templates, loading, error } = useCampaignTemplates(true);
  
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  const handleSelectTemplate = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(false);
    setShowCreateCampaign(true);
  };

  const handleEditTemplate = (template: CampaignTemplate) => {
    // Navigate to template editor
    router.push(`/campaigns/templates/${template.id}/edit`);
  };

  const handleCreateCustomTemplate = () => {
    // Navigate to template builder
    router.push('/campaigns/templates/new');
  };

  const canEdit = (template: CampaignTemplate) => {
    // In a real app, check if current user owns the template
    return !template.isPublic;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Campaign Templates</h1>
            <p className="text-muted-foreground mt-2">
              Start your next campaign with a proven template or create your own
            </p>
          </div>
          <Button onClick={handleCreateCustomTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 mb-6">
          <p className="text-sm text-destructive">
            Error loading templates: {error.message}
          </p>
        </div>
      )}

      <TemplateGallery
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
        onCreateTemplate={handleCreateCustomTemplate}
        loading={loading}
      />

      <TemplatePreview
        template={selectedTemplate}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedTemplate(null);
        }}
        onUseTemplate={handleUseTemplate}
        onEditTemplate={handleEditTemplate}
        canEdit={selectedTemplate ? canEdit(selectedTemplate) : false}
      />

      <CreateCampaignFromTemplate
        template={selectedTemplate}
        isOpen={showCreateCampaign}
        onClose={() => {
          setShowCreateCampaign(false);
          setSelectedTemplate(null);
        }}
      />
    </div>
  );
}