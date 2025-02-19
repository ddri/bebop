// src/app/github-test/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  updated_at: string;
}

export default function GitHubTestPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRepos() {
      if (!isSignedIn) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/github');
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [isSignedIn]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-400">Please sign in with GitHub to test the integration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your GitHub Repositories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-400">Loading repositories...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : repos.length === 0 ? (
            <p className="text-slate-400">No repositories found.</p>
          ) : (
            <div className="space-y-4">
              {repos.map((repo) => (
                <Card key={repo.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400">{repo.description || 'No description'}</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Last updated: {new Date(repo.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}