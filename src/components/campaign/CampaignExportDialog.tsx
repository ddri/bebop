'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileJson, FileText, AlertCircle } from 'lucide-react';
import { CampaignExportOptions } from '@/types/campaign-export';

interface CampaignExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignName: string;
}

export const CampaignExportDialog: React.FC<CampaignExportDialogProps> = ({
  isOpen,
  onClose,
  campaignId,
  campaignName
}) => {
  const [options, setOptions] = useState<CampaignExportOptions>({
    includeContent: true,
    includeContentDetails: false,
    includeTasks: true,
    includePublishingPlans: true,
    includeAnalytics: false,
    includeGoals: true,
    format: 'json',
    prettify: true,
    anonymize: false,
    excludeSecrets: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/campaigns/${campaignId}/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to export campaign');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-${campaignName.replace(/\s+/g, '-')}-${Date.now()}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const updateOption = <K extends keyof CampaignExportOptions>(
    key: K,
    value: CampaignExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Campaign</DialogTitle>
          <DialogDescription>
            Export "{campaignName}" for backup or sharing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup 
              value={options.format} 
              onValueChange={(value) => updateOption('format', value as 'json' | 'csv')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4" />
                    <div>
                      <div className="font-medium">JSON</div>
                      <div className="text-sm text-muted-foreground">
                        Complete campaign data with all relations
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <div>
                      <div className="font-medium">CSV</div>
                      <div className="text-sm text-muted-foreground">
                        Spreadsheet format for data analysis
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Content Options */}
          <div className="space-y-3">
            <Label>Include in Export</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="content"
                  checked={options.includeContent}
                  onCheckedChange={(checked) => updateOption('includeContent', !!checked)}
                />
                <Label htmlFor="content" className="cursor-pointer">
                  Content staging items
                </Label>
              </div>
              
              {options.includeContent && options.format === 'json' && (
                <div className="ml-6 flex items-center space-x-2">
                  <Checkbox
                    id="contentDetails"
                    checked={options.includeContentDetails}
                    onCheckedChange={(checked) => updateOption('includeContentDetails', !!checked)}
                  />
                  <Label htmlFor="contentDetails" className="cursor-pointer text-sm">
                    Include full content details
                  </Label>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tasks"
                  checked={options.includeTasks}
                  onCheckedChange={(checked) => updateOption('includeTasks', !!checked)}
                />
                <Label htmlFor="tasks" className="cursor-pointer">
                  Manual tasks
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publishing"
                  checked={options.includePublishingPlans}
                  onCheckedChange={(checked) => updateOption('includePublishingPlans', !!checked)}
                />
                <Label htmlFor="publishing" className="cursor-pointer">
                  Publishing plans
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analytics"
                  checked={options.includeAnalytics}
                  onCheckedChange={(checked) => updateOption('includeAnalytics', !!checked)}
                />
                <Label htmlFor="analytics" className="cursor-pointer">
                  Analytics snapshot
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goals"
                  checked={options.includeGoals}
                  onCheckedChange={(checked) => updateOption('includeGoals', !!checked)}
                />
                <Label htmlFor="goals" className="cursor-pointer">
                  Campaign goals
                </Label>
              </div>
            </div>
          </div>

          {/* Privacy Options */}
          {options.format === 'json' && (
            <div className="space-y-3">
              <Label>Privacy & Security</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymize"
                    checked={options.anonymize}
                    onCheckedChange={(checked) => updateOption('anonymize', !!checked)}
                  />
                  <Label htmlFor="anonymize" className="cursor-pointer text-sm">
                    Anonymize user data
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excludeSecrets"
                    checked={options.excludeSecrets}
                    onCheckedChange={(checked) => updateOption('excludeSecrets', !!checked)}
                  />
                  <Label htmlFor="excludeSecrets" className="cursor-pointer text-sm">
                    Exclude API keys and secrets
                  </Label>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? (
              'Exporting...'
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Campaign
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};