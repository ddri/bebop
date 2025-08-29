'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Clock, Users, Target, Calendar, Star, Lock, Globe } from 'lucide-react';
import { CampaignTemplate } from '@/types/campaign-templates';

interface TemplateGalleryProps {
  templates: CampaignTemplate[];
  onSelectTemplate: (template: CampaignTemplate) => void;
  onCreateTemplate?: () => void;
  loading?: boolean;
}

// Helper function to get relative time
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else {
    return 'just now';
  }
};

const categoryIcons: Record<string, React.ElementType> = {
  'product-launch': Target,
  'content-series': Calendar,
  'seasonal': Clock,
  'awareness': Users,
  'custom': Star
};

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  onSelectTemplate,
  onCreateTemplate,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group templates by public/private
  const publicTemplates = filteredTemplates.filter(t => t.isPublic);
  const privateTemplates = filteredTemplates.filter(t => !t.isPublic);

  const renderTemplateCard = (template: CampaignTemplate) => {
    const Icon = categoryIcons[template.category] || Star;
    const structure = template.structure;
    
    return (
      <Card 
        key={template.id} 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => onSelectTemplate(template)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {template.isPublic ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              {template.usageCount > 0 && (
                <Badge variant="secondary">
                  Used {template.usageCount} times
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {structure.contentSlots.length} content slots
              </Badge>
              <Badge variant="outline">
                {structure.tasks.length} tasks
              </Badge>
              <Badge variant="outline">
                {structure.suggestedDuration} days
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {structure.platforms.map(platform => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
            
            {template.lastUsedAt && (
              <p className="text-xs text-muted-foreground">
                Last used {getRelativeTime(new Date(template.lastUsedAt))}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {onCreateTemplate && (
          <Button onClick={onCreateTemplate} variant="outline">
            Create Custom Template
          </Button>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category === 'all' ? 'All Templates' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="space-y-8">
            {/* Public Templates */}
            {publicTemplates.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Public Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicTemplates.map(renderTemplateCard)}
                </div>
              </div>
            )}

            {/* Private Templates */}
            {privateTemplates.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Your Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {privateTemplates.map(renderTemplateCard)}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No templates found matching your criteria.
                </p>
                {onCreateTemplate && (
                  <Button onClick={onCreateTemplate} variant="outline">
                    Create Your First Template
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};