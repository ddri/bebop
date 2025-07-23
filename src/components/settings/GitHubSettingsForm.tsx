'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink, Github, Check, RefreshCcw } from 'lucide-react';
import { validateGitHubSettings, type ValidationResult, type ConnectionTestResult } from '@/lib/validation/settings-validation';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
}

interface FormData {
  token: string;
}

export function GitHubSettingsForm() {
  const [formData, setFormData] = useState<FormData>({ token: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // GitHub specific state
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [autoBackup, setAutoBackup] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('githubToken');
    const savedRepo = localStorage.getItem('githubSelectedRepo');
    const savedAutoBackup = localStorage.getItem('githubAutoBackup') === 'true';
    
    if (savedToken) {
      setFormData({ token: savedToken });
      checkConnection(savedToken);
    }
    
    setSelectedRepo(savedRepo);
    setAutoBackup(savedAutoBackup);
  }, [checkConnection]);

  // Real-time validation
  const validateForm = (data: FormData): ValidationResult => {
    const result = validateGitHubSettings(data);
    setValidationErrors(result.errors);
    return result;
  };

  const handleInputChange = (value: string) => {
    const newFormData = { token: value };
    setFormData(newFormData);
    setIsDirty(true);
    setConnectionStatus(null);
    setConnected(false);
    
    // Debounced validation
    setTimeout(() => {
      validateForm(newFormData);
    }, 300);
  };

  const checkConnection = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/github', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConnected(true);
        setUsername(data.username);
        setConnectionStatus({
          success: true,
          message: `Connected as ${data.username}`,
          details: data
        });
        await fetchRepositories(token);
      } else {
        setConnected(false);
        setConnectionStatus({
          success: false,
          message: 'Invalid GitHub token'
        });
      }
    } catch (error) {
      setConnected(false);
      setConnectionStatus({
        success: false,
        message: 'Failed to check GitHub connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRepositories = async (token: string) => {
    try {
      setLoadingRepos(true);
      const response = await fetch('/api/github/repositories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const repos = await response.json();
        setRepositories(repos);
      }
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleTestConnection = async () => {
    const validation = validateForm(formData);
    if (!validation.isValid) return;

    setIsTesting(true);
    await checkConnection(formData.token);
    setIsTesting(false);
  };

  const handleSave = async () => {
    const validation = validateForm(formData);
    if (!validation.isValid) return;

    setIsSaving(true);
    try {
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('githubToken', formData.token);
      localStorage.setItem('githubSelectedRepo', selectedRepo || '');
      localStorage.setItem('githubAutoBackup', autoBackup.toString());
      
      setIsDirty(false);
      
      // Auto-test connection after saving
      if (!connected) {
        await checkConnection(formData.token);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setConnectionStatus({
        success: false,
        message: 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('githubToken');
    localStorage.removeItem('githubSelectedRepo');
    localStorage.removeItem('githubAutoBackup');
    
    setFormData({ token: '' });
    setConnected(false);
    setUsername(null);
    setRepositories([]);
    setSelectedRepo(null);
    setAutoBackup(false);
    setConnectionStatus(null);
    setIsDirty(false);
  };

  const isFormValid = Object.keys(validationErrors).length === 0 && formData.token;

  return (
    <Card className="bg-[#1c1c1e] border-0">
      <CardHeader>
        <CardTitle className="text-white">GitHub Integration</CardTitle>
        <CardDescription className="text-slate-300">
          Connect with GitHub for backups and content management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-slate-400" />
            <div>
              <h3 className="font-medium text-white">GitHub</h3>
              {username && (
                <p className="text-sm text-slate-400">Connected as {username}</p>
              )}
            </div>
          </div>
          {connected && (
            <div className="flex items-center gap-2 text-[#E669E8]">
              <Check className="w-5 h-5" />
              <span>Connected</span>
            </div>
          )}
        </div>

        {/* Token Input Field */}
        {!connected && (
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-2 text-white">
              Personal Access Token *
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={formData.token}
                onChange={(e) => handleInputChange(e.target.value)}
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
              Create a token at{' '}
              <a 
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E669E8] hover:text-[#d15dd3] inline-flex items-center gap-1"
              >
                GitHub Settings <ExternalLink className="h-3 w-3" />
              </a>
              {' '}with &apos;repo&apos; scope
            </p>
          </div>
        )}

        {/* Repository Selection */}
        {connected && repositories.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-2 text-white">
              Backup Repository
            </label>
            <Select value={selectedRepo || ''} onValueChange={setSelectedRepo}>
              <SelectTrigger className="bg-[#2f2f2d] border-slate-600 text-white">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.full_name}>
                    {repo.name} {repo.private && '(Private)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Auto Backup Toggle */}
        {connected && (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-white">
                Automatic Backup
              </label>
              <p className="text-xs text-slate-400">
                Automatically backup content to GitHub when publishing
              </p>
            </div>
            <Switch
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
              className="data-[state=checked]:bg-[#E669E8]"
            />
          </div>
        )}

        {/* Connection Status Alert */}
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
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!connected ? (
            <>
              <Button
                onClick={handleTestConnection}
                disabled={!isFormValid || isTesting || loading}
                variant="outline"
                className="text-white border-slate-600 hover:bg-slate-700"
              >
                {isTesting || loading ? (
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
                disabled={!isFormValid || !isDirty || isSaving}
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
            </>
          ) : (
            <>
              <Button
                onClick={() => fetchRepositories(formData.token)}
                disabled={loadingRepos}
                variant="outline"
                className="text-white border-slate-600 hover:bg-slate-700"
              >
                {loadingRepos ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh Repos
                  </>
                )}
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving}
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

              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="text-white border-slate-600 hover:bg-red-500 hover:text-white"
              >
                Disconnect
              </Button>
            </>
          )}
        </div>

        {/* Dirty state indicator */}
        {isDirty && isFormValid && !connected && (
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            Unsaved changes
          </div>
        )}
      </CardContent>
    </Card>
  );
}