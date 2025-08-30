'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  CampaignExportData, 
  CampaignImportOptions, 
  CampaignImportResult,
  validateExportData 
} from '@/types/campaign-export';
import { useRouter } from 'next/navigation';

interface CampaignImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (campaignId: string) => void;
}

export const CampaignImportDialog: React.FC<CampaignImportDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [exportData, setExportData] = useState<CampaignExportData | null>(null);
  const [options, setOptions] = useState<CampaignImportOptions>({
    includeContent: true,
    includeTasks: true,
    includePublishingPlans: true,
    includeAnalytics: false,
    includeGoals: true,
    conflictResolution: 'duplicate',
    namePrefix: '',
    nameSuffix: '',
    adjustDates: true,
    dateOffset: 0,
    resetStatus: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CampaignImportResult | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.json')) {
      setError('Please select a JSON file');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Read and validate file
    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);
      
      if (!validateExportData(data)) {
        setError('Invalid campaign export file format');
        setFile(null);
        return;
      }
      
      setExportData(data);
      
      // Auto-set name suffix if duplicate resolution
      if (options.conflictResolution === 'duplicate' && !options.nameSuffix) {
        setOptions(prev => ({
          ...prev,
          nameSuffix: ` (Imported ${new Date().toLocaleDateString()})`
        }));
      }
    } catch (err) {
      setError('Failed to read file. Please ensure it is a valid JSON file.');
      setFile(null);
      setExportData(null);
    }
  };

  const handleImport = async () => {
    if (!exportData) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/campaigns/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: exportData,
          options
        })
      });
      
      const importResult: CampaignImportResult = await response.json();
      
      if (!response.ok) {
        if (importResult.errors && importResult.errors.length > 0) {
          setError(importResult.errors.map(e => e.message).join(', '));
        } else {
          throw new Error('Failed to import campaign');
        }
        return;
      }
      
      setResult(importResult);
      
      if (importResult.success && importResult.campaignId) {
        setTimeout(() => {
          onSuccess?.(importResult.campaignId);
          router.push(`/campaigns/${importResult.campaignId}`);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const updateOption = <K extends keyof CampaignImportOptions>(
    key: K,
    value: CampaignImportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const resetDialog = () => {
    setFile(null);
    setExportData(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetDialog();
      }
      onClose();
    }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Campaign</DialogTitle>
          <DialogDescription>
            Import a campaign from an exported JSON file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Selection */}
          <div className="space-y-3">
            <Label>Campaign File</Label>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {file ? file.name : 'Select Campaign File'}
              </Button>
              
              {exportData && (
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4" />
                    <span className="font-medium">{exportData.campaign.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Exported: {new Date(exportData.exportedAt).toLocaleDateString()}</div>
                    <div>Content: {exportData.contentStaging.length} items</div>
                    <div>Tasks: {exportData.manualTasks.length} items</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {exportData && (
            <>
              {/* Import Options */}
              <div className="space-y-3">
                <Label>Import Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="content"
                      checked={options.includeContent}
                      onCheckedChange={(checked) => updateOption('includeContent', !!checked)}
                    />
                    <Label htmlFor="content" className="cursor-pointer">
                      Import content ({exportData.contentStaging.length} items)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tasks"
                      checked={options.includeTasks}
                      onCheckedChange={(checked) => updateOption('includeTasks', !!checked)}
                    />
                    <Label htmlFor="tasks" className="cursor-pointer">
                      Import tasks ({exportData.manualTasks.length} items)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="publishing"
                      checked={options.includePublishingPlans}
                      onCheckedChange={(checked) => updateOption('includePublishingPlans', !!checked)}
                    />
                    <Label htmlFor="publishing" className="cursor-pointer">
                      Import publishing plans ({exportData.publishingPlans.length} items)
                    </Label>
                  </div>
                  
                  {exportData.goals && exportData.goals.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="goals"
                        checked={options.includeGoals}
                        onCheckedChange={(checked) => updateOption('includeGoals', !!checked)}
                      />
                      <Label htmlFor="goals" className="cursor-pointer">
                        Import goals ({exportData.goals.length} items)
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Name Handling */}
              <div className="space-y-3">
                <Label>Campaign Name</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Prefix (optional)"
                      value={options.namePrefix}
                      onChange={(e) => updateOption('namePrefix', e.target.value)}
                    />
                    <Input
                      placeholder="Suffix (optional)"
                      value={options.nameSuffix}
                      onChange={(e) => updateOption('nameSuffix', e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    New name: {options.namePrefix}{exportData.campaign.name}{options.nameSuffix}
                  </p>
                </div>
              </div>

              {/* Conflict Resolution */}
              <div className="space-y-3">
                <Label>If Campaign Exists</Label>
                <RadioGroup 
                  value={options.conflictResolution} 
                  onValueChange={(value) => updateOption('conflictResolution', value as 'skip' | 'overwrite' | 'duplicate')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="duplicate" id="duplicate" />
                    <Label htmlFor="duplicate" className="cursor-pointer text-sm">
                      Create duplicate with number suffix
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skip" id="skip" />
                    <Label htmlFor="skip" className="cursor-pointer text-sm">
                      Skip import
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overwrite" id="overwrite" />
                    <Label htmlFor="overwrite" className="cursor-pointer text-sm">
                      Overwrite existing
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Date Adjustment */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjustDates"
                    checked={options.adjustDates}
                    onCheckedChange={(checked) => updateOption('adjustDates', !!checked)}
                  />
                  <Label htmlFor="adjustDates" className="cursor-pointer">
                    Adjust dates to start from today
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="resetStatus"
                    checked={options.resetStatus}
                    onCheckedChange={(checked) => updateOption('resetStatus', !!checked)}
                  />
                  <Label htmlFor="resetStatus" className="cursor-pointer">
                    Reset all items to draft/todo status
                  </Label>
                </div>
              </div>
            </>
          )}

          {/* Result Display */}
          {result && (
            <Alert className={result.success ? 'border-green-500' : 'border-yellow-500'}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">
                    {result.success ? 'Import successful!' : 'Import completed with warnings'}
                  </div>
                  <div className="text-sm">
                    <div>Content: {result.imported.contentStaging} imported, {result.skipped.contentStaging} skipped</div>
                    <div>Tasks: {result.imported.manualTasks} imported, {result.skipped.manualTasks} skipped</div>
                    {result.warnings.length > 0 && (
                      <div className="mt-2">
                        Warnings: {result.warnings.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
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
            {result?.success ? 'Close' : 'Cancel'}
          </Button>
          {!result?.success && (
            <Button 
              onClick={handleImport} 
              disabled={loading || !exportData}
            >
              {loading ? 'Importing...' : 'Import Campaign'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};