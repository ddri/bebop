'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, FileText, CheckSquare, Users, Target, Globe, Lock } from 'lucide-react';
import { CampaignTemplate } from '@/types/campaign-templates';

interface TemplatePreviewProps {
  template: CampaignTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: CampaignTemplate) => void;
  onEditTemplate?: (template: CampaignTemplate) => void;
  canEdit?: boolean;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate,
  onEditTemplate,
  canEdit = false
}) => {
  if (!template) return null;

  const structure = template.structure;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{template.name}</DialogTitle>
            <div className="flex items-center gap-2">
              {template.isPublic ? (
                <Badge variant="outline">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
              <Badge variant="secondary">{template.category}</Badge>
            </div>
          </div>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content Slots</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{structure.suggestedDuration}</span>
                      <span className="text-muted-foreground">days</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{structure.contentSlots.length} content pieces</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <span>{structure.tasks.length} tasks</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {structure.platforms.map(platform => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {structure.goals && structure.goals.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Campaign Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {structure.goals.map((goal, index) => (
                        <li key={index} className="text-sm">{goal}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {structure.targetAudience && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Target Audience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{structure.targetAudience}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {structure.contentSlots.map((slot, index) => (
                <Card key={slot.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{slot.name}</CardTitle>
                    <CardDescription>{slot.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{slot.type}</Badge>
                        <div className="flex gap-1">
                          {slot.platforms.map(platform => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {slot.suggestedSchedule && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Day {slot.suggestedSchedule.daysFromStart}
                          {slot.suggestedSchedule.timeOfDay && 
                            ` at ${slot.suggestedSchedule.timeOfDay}`}
                        </div>
                      )}
                      
                      {slot.contentGuidelines && (
                        <div className="text-sm">
                          <span className="font-medium">Guidelines:</span> {slot.contentGuidelines}
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        Est. {slot.estimatedDuration} hours
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              {structure.tasks.map((task, index) => (
                <Card key={task.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    {task.description && (
                      <CardDescription>{task.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {task.platform && (
                        <Badge variant="secondary">{task.platform}</Badge>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Day {task.daysFromStart}
                      </div>
                      
                      {task.instructions && (
                        <div className="text-sm">
                          <span className="font-medium">Instructions:</span> {task.instructions}
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        Est. {task.estimatedDuration} hours
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Template Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="font-medium">
                        {new Date(template.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <p className="font-medium">
                        {new Date(template.updatedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Usage Count:</span>
                      <p className="font-medium">{template.usageCount} times</p>
                    </div>
                    {template.lastUsedAt && (
                      <div>
                        <span className="text-muted-foreground">Last Used:</span>
                        <p className="font-medium">
                          {new Date(template.lastUsedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canEdit && onEditTemplate && (
            <Button variant="outline" onClick={() => onEditTemplate(template)}>
              Edit Template
            </Button>
          )}
          <Button onClick={() => onUseTemplate(template)}>
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};