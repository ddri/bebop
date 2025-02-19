'use client';

// src/components/settings/GitHubSettings.tsx
import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { AlertCircle, Github, Check, RefreshCcw } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
}

export function GitHubSettings() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [autoBackup, setAutoBackup] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      setLoading(true);
      const response = await fetch('/api/github');
      if (response.ok) {
        const data = await response.json();
        setConnected(true);
        setUsername(data.username);
        await fetchRepositories();
      }
    } catch (err) {
      setError('Failed to check GitHub connection');
    } finally {
      setLoading(false);
    }
  }

  async function fetchRepositories() {
    try {
      setLoadingRepos(true);
      const response = await fetch('/api/github/repositories');
      if (response.ok) {
        const repos = await response.json();
        setRepositories(repos);
        // If there's a previously selected repo, maintain the selection
        const savedRepo = localStorage.getItem('bebop-backup-repo');
        if (savedRepo && repos.some(r => r.full_name === savedRepo)) {
          setSelectedRepo(savedRepo);
        }
      }
    } catch (err) {
      setError('Failed to fetch repositories');
    } finally {
      setLoadingRepos(false);
    }
  }

  async function handleSelectRepository(repoFullName: string) {
    setSelectedRepo(repoFullName);
    localStorage.setItem('bebop-backup-repo', repoFullName);
    // Here we could also update the backend with the selected repository
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-slate-400" />
          <h3 className="font-medium text-white">GitHub</h3>
        </div>
        <p className="text-slate-400">Checking connection status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        {error ? (
          <Alert variant="destructive" className="border-red-500/20 bg-red-500/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : connected ? (
          <div className="flex items-center gap-2 text-[#E669E8]">
            <Check className="w-5 h-5" />
            <span>Connected</span>
          </div>
        ) : (
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
          >
            <Github className="w-4 h-4 mr-2" />
            Connect GitHub
          </Button>
        )}
      </div>

      {connected && (
        <div className="space-y-4 bg-[#2f2f2d] p-4 rounded-md">
          <div className="space-y-2">
            <label className="text-sm text-white">Backup Repository</label>
            <div className="flex gap-2">
              <Select 
                value={selectedRepo || ''} 
                onValueChange={handleSelectRepository}
              >
                <SelectTrigger className="flex-1 bg-[#1c1c1e] border-slate-700">
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1c1e] border-slate-700">
                  {repositories.map(repo => (
                    <SelectItem 
                      key={repo.id} 
                      value={repo.full_name}
                      className="text-white hover:bg-[#2f2f2d]"
                    >
                      {repo.full_name}
                      {repo.private && " (Private)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchRepositories}
                disabled={loadingRepos}
                className="border-slate-700 text-white hover:bg-[#2f2f2d]"
              >
                <RefreshCcw className={`h-4 w-4 ${loadingRepos ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm text-white">Automatic Backups</h4>
              <p className="text-sm text-slate-400">
                Automatically backup content when changes are made
              </p>
            </div>
            <Switch
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
            />
          </div>

          <Button 
            disabled={!selectedRepo}
            className="w-full bg-[#E669E8] hover:bg-[#d15dd3] text-white"
          >
            Backup Now
          </Button>
        </div>
      )}
    </div>
  );
}