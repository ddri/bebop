'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useHashnodeSettings } from '@/hooks/useHashnodeSettings';
import { validateHashnodeSettings, testHashnodeConnection, type ValidationResult, type ConnectionTestResult } from '@/lib/validation/settings-validation';

interface FormData {
  token: string;
  publicationId: string;
}

export function HashnodeSettingsForm() {
  const { getSettings, saveSettings } = useHashnodeSettings();
  const [formData, setFormData] = useState<FormData>({ token: '', publicationId: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionTestResult | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const settings = getSettings();
    setFormData(settings);
  }, [getSettings]);

  // Real-time validation
  const validateForm = (data: FormData): ValidationResult => {
    const result = validateHashnodeSettings(data);
    setValidationErrors(result.errors);
    return result;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setIsDirty(true);
    setConnectionStatus(null);
    
    // Debounced validation
    setTimeout(() => {
      validateForm(newFormData);
    }, 300);
  };

  const handleTestConnection = async () => {
    const validation = validateForm(formData);
    if (!validation.isValid) return;

    setIsTesting(true);
    setConnectionStatus(null);

    try {
      const result = await testHashnodeConnection(formData.token, formData.publicationId);
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    const validation = validateForm(formData);
    if (!validation.isValid) return;

    setIsSaving(true);
    try {
      saveSettings(formData.token, formData.publicationId);
      setIsDirty(false);
      
      // Auto-test connection after saving
      if (!connectionStatus?.success) {
        await handleTestConnection();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = Object.keys(validationErrors).length === 0 && formData.token && formData.publicationId;

  return (
    <Card className="bg-[#1c1c1e] border-0">
      <CardHeader>
        <CardTitle className="text-white">Hashnode Integration</CardTitle>
        <CardDescription className="text-slate-300">
          Configure your Hashnode publication settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Personal Access Token Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2 text-white">
            Personal Access Token *
          </label>
          <div className="relative">
            <Input
              type="password"
              placeholder="Enter your Hashnode Personal Access Token"
              value={formData.token}
              onChange={(e) => handleInputChange('token', e.target.value)}
              className={`bg-[#2f2f2d] border-slate-600 text-white placeholder:text-slate-400 ${
                validationErrors.token ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                formData.token && !validationErrors.token ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''
              }`}
            />
            {formData.token && !validationErrors.token && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {validationErrors.token && (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {validationErrors.token}
            </p>
          )}
          <p className="text-sm text-slate-300">
            Get your token from{' '}
            <a 
              href="https://hashnode.com/settings/developer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E669E8] hover:text-[#d15dd3] inline-flex items-center gap-1"
            >
              Hashnode Developer Settings <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>

        {/* Publication ID Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2 text-white">
            Publication ID *
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter your Hashnode publication ID"
              value={formData.publicationId}
              onChange={(e) => handleInputChange('publicationId', e.target.value)}
              className={`bg-[#2f2f2d] border-slate-600 text-white placeholder:text-slate-400 ${
                validationErrors.publicationId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                formData.publicationId && !validationErrors.publicationId ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''
              }`}
            />
            {formData.publicationId && !validationErrors.publicationId && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {validationErrors.publicationId && (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {validationErrors.publicationId}
            </p>
          )}
          <p className="text-sm text-slate-300">
            Found in your Hashnode publication settings
          </p>
        </div>

        {/* Connection Status */}
        {connectionStatus && (
          <Alert className={connectionStatus.success ? 
            'border-green-500/20 bg-green-500/5' : 
            'border-red-500/20 bg-red-500/5'
          }>
            {connectionStatus.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription className={connectionStatus.success ? 'text-green-200' : 'text-red-200'}>
              {connectionStatus.message}
              {connectionStatus.details != null && (
                <div className="mt-1 text-xs opacity-80">
                  {String(connectionStatus.details)}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleTestConnection}
            disabled={!isFormValid || isTesting || isSaving}
            variant="outline"
            className="text-white border-slate-600 hover:bg-slate-700"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>

          <Button
            onClick={handleSave}
            disabled={!isFormValid || !isDirty || isSaving || isTesting}
            className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>

        {/* Status Indicator */}
        {isDirty && isFormValid && (
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            Unsaved changes
          </div>
        )}
      </CardContent>
    </Card>
  );
}