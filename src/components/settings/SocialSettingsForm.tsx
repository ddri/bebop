'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useSocialSettings } from '@/hooks/useSocialSettings';
import { PLATFORMS } from '@/lib/social/platforms';
import { BlueskyIcon } from '@/components/social/icons/BlueskyIcon';
import { MastodonIcon } from '@/components/social/icons/MastodonIcon';
import { ThreadsIcon } from '@/components/social/icons/ThreadsIcon';
import { PlatformId, SocialCredentials } from '@/types/social';
import { validateSocialPlatformCredentials, testSocialConnection, type ValidationResult, type ConnectionTestResult } from '@/lib/validation/settings-validation';

interface PlatformFormState {
  credentials: Record<string, string>;
  validationErrors: Record<string, string>;
  connectionStatus: ConnectionTestResult | null;
  isTesting: boolean;
  isDirty: boolean;
}

export function SocialSettingsForm() {
  const { credentials, setCredentials, clearCredentials } = useSocialSettings();
  const [platformStates, setPlatformStates] = useState<Record<PlatformId, PlatformFormState>>({} as Record<PlatformId, PlatformFormState>);

  // Initialize platform states
  React.useEffect(() => {
    const initialStates: Record<PlatformId, PlatformFormState> = {} as Record<PlatformId, PlatformFormState>;
    
    Object.keys(PLATFORMS).forEach((platformId) => {
      const platformCredentials = credentials[platformId as PlatformId] || {};
      initialStates[platformId as PlatformId] = {
        credentials: platformCredentials as Record<string, string>,
        validationErrors: {},
        connectionStatus: null,
        isTesting: false,
        isDirty: false
      };
    });
    
    setPlatformStates(initialStates);
  }, [credentials]);

  const validatePlatformCredentials = (platformId: PlatformId, creds: Record<string, string>): ValidationResult => {
    const result = validateSocialPlatformCredentials(platformId, creds);
    
    setPlatformStates(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        validationErrors: result.errors
      }
    }));
    
    return result;
  };

  const handleInputChange = (platformId: PlatformId, field: string, value: string) => {
    const newCredentials = {
      ...platformStates[platformId]?.credentials,
      [field]: value
    };

    setPlatformStates(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        credentials: newCredentials,
        isDirty: true,
        connectionStatus: null
      }
    }));

    // Debounced validation
    setTimeout(() => {
      validatePlatformCredentials(platformId, newCredentials);
    }, 300);
  };

  const handleTestConnection = async (platformId: PlatformId) => {
    const platformState = platformStates[platformId];
    if (!platformState) return;

    const validation = validatePlatformCredentials(platformId, platformState.credentials);
    if (!validation.isValid) return;

    setPlatformStates(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        isTesting: true,
        connectionStatus: null
      }
    }));

    try {
      const result = await testSocialConnection(platformId, platformState.credentials);
      setPlatformStates(prev => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          connectionStatus: result
        }
      }));
    } catch (error) {
      setPlatformStates(prev => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          connectionStatus: {
            success: false,
            message: 'Connection test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }));
    } finally {
      setPlatformStates(prev => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          isTesting: false
        }
      }));
    }
  };

  const handleSave = (platformId: PlatformId) => {
    const platformState = platformStates[platformId];
    if (!platformState) return;

    const validation = validatePlatformCredentials(platformId, platformState.credentials);
    if (!validation.isValid) return;

    setCredentials(platformId, platformState.credentials as SocialCredentials);
    
    setPlatformStates(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        isDirty: false
      }
    }));
  };

  const handleClear = (platformId: PlatformId) => {
    clearCredentials(platformId);
    setPlatformStates(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        credentials: {},
        validationErrors: {},
        connectionStatus: null,
        isDirty: false
      }
    }));
  };

  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case 'bluesky': return <BlueskyIcon className="h-5 w-5" />;
      case 'mastodon': return <MastodonIcon className="h-5 w-5" />;
      case 'threads': return <ThreadsIcon className="h-5 w-5" />;
      default: return null;
    }
  };

  const isFormValid = (platformId: PlatformId): boolean => {
    const platformState = platformStates[platformId];
    if (!platformState) return false;
    
    const platform = PLATFORMS[platformId];
    if (!platform || platform.credentialFields.length === 0) return true; // Threads case
    
    return Object.keys(platformState.validationErrors).length === 0 && 
           platform.credentialFields.every(field => platformState.credentials[field]);
  };

  return (
    <Card className="bg-[#1c1c1e] border-0">
      <CardHeader>
        <CardTitle className="text-white">Social Integration Settings</CardTitle>
        <CardDescription className="text-slate-300">
          Configure your social platform credentials for automated posting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(PLATFORMS).map(([id, platform]) => {
          const platformId = id as PlatformId;
          const platformState = platformStates[platformId];
          
          if (!platformState) return null;

          return (
            <div key={id} className="space-y-4 pb-6 border-b border-slate-700 last:border-0">
              <div className="flex items-center gap-2 text-white">
                {getPlatformIcon(platformId)}
                <h3 className="font-medium text-lg">{platform.name}</h3>
              </div>

              {/* Render fields dynamically based on platform configuration */}
              {platform.credentialFields.map(field => {
                const fieldValue = platformState.credentials[field] || '';
                const hasError = platformState.validationErrors[field];
                const isValid = fieldValue && !hasError;

                return (
                  <div key={field} className="space-y-2">
                    <Label className="text-white capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()} *
                    </Label>
                    <div className="relative">
                      <Input
                        type={field.includes('password') || field.includes('token') ? 'password' : 'text'}
                        value={fieldValue}
                        onChange={(e) => handleInputChange(platformId, field, e.target.value)}
                        placeholder={platform.placeholders?.[field] || `Enter your ${field}`}
                        className={`bg-[#2f2f2d] border-slate-600 text-white placeholder:text-slate-400 ${
                          hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                          isValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 
                          'focus:border-[#E669E8] focus:ring-[#E669E8]'
                        }`}
                      />
                      {isValid && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {hasError && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {hasError}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Platform-specific help text */}
              {platform.helpText && (
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-[#E669E8] flex-shrink-0" />
                  <p className="text-slate-300">
                    {platform.helpText}
                    {platformId === 'bluesky' && (
                      <>
                        {' '}Create an app-specific password in your{' '}
                        <a 
                          href="https://bsky.app/settings/app-passwords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E669E8] hover:text-[#d15dd3] underline inline-flex items-center gap-1"
                        >
                          Bluesky Settings <ExternalLink className="h-3 w-3" />
                        </a>
                        . Never use your main account password.
                      </>
                    )}
                    {platformId === 'mastodon' && (
                      <>
                        {' '}You can find your access token in your Mastodon instance settings under{' '}
                        <strong>Development → Applications</strong>.
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Connection Status */}
              {platformState.connectionStatus && (
                <Alert className={platformState.connectionStatus.success ? 
                  'border-green-500/20 bg-green-500/5' : 
                  'border-red-500/20 bg-red-500/5'
                }>
                  {platformState.connectionStatus.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription className={platformState.connectionStatus.success ? 'text-green-200' : 'text-red-200'}>
                    {platformState.connectionStatus.message}
                    {platformState.connectionStatus.details != null && (
                      <div className="mt-1 text-xs opacity-80">
                        {JSON.stringify(platformState.connectionStatus.details)}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              {platform.credentialFields.length > 0 ? (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleTestConnection(platformId)}
                    disabled={!isFormValid(platformId) || platformState.isTesting}
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700"
                  >
                    {platformState.isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>

                  <Button
                    onClick={() => handleSave(platformId)}
                    disabled={!isFormValid(platformId) || !platformState.isDirty}
                    className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
                  >
                    Save Credentials
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => handleClear(platformId)}
                    className="text-white border-slate-600 hover:bg-red-500 hover:text-white"
                  >
                    Clear
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-slate-400">
                  This platform uses web-based sharing and doesn't require credentials.
                </div>
              )}

              {/* Dirty state indicator */}
              {platformState.isDirty && isFormValid(platformId) && (
                <div className="flex items-center gap-2 text-sm text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  Unsaved changes
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}