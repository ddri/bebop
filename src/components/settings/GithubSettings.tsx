'use client';

// src/app/components/settings/GitHubSettings.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Github, Check } from 'lucide-react';

export function GitHubSettings() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch('/api/github');
        if (response.ok) {
          setConnected(true);
        }
      } catch (err) {
        setError('Failed to check GitHub connection');
      } finally {
        setLoading(false);
      }
    }

    checkConnection();
  }, []);

  if (loading) {
    return (
      <Card className="bg-[#1c1c1e] border-0">
        <CardContent className="pt-6">
          <p className="text-slate-400">Checking GitHub connection...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1c1c1e] border-0">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Github className="w-5 h-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription className="text-slate-400">
          Connect with GitHub to enable backups and publishing features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive" className="border-red-500/20 bg-red-500/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : connected ? (
          <div className="flex items-center gap-2 bg-[#2f2f2d] p-4 rounded-md">
            <Check className="w-5 h-5 text-[#E669E8]" />
            <span className="text-white">Connected to GitHub</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#2f2f2d] p-4 rounded-md">
              <p className="text-slate-400">
                You need to connect your GitHub account to use backup and publishing features.
              </p>
            </div>
            <Button 
              className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
              onClick={() => window.location.reload()}
            >
              <Github className="w-4 h-4 mr-2" />
              Connect GitHub Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}