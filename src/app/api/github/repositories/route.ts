// src/app/api/github/repositories/route.ts
import { NextResponse } from 'next/server';
import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { Octokit } from '@octokit/rest';

// Helper function to get GitHub token from Clerk
async function getGitHubToken() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('No user found');
    }

    const clerk = await clerkClient();
    const tokenResponse = await clerk.users.getUserOauthAccessToken(
      user.id,
      'oauth_github'
    );
    
    // Access the data array from the paginated response
    const tokens = tokenResponse.data;
    if (!tokens || tokens.length === 0 || !tokens[0]?.token) {
      throw new Error('No GitHub token found');
    }

    return tokens[0].token;
  } catch (error) {
    console.error('Error getting GitHub token:', error);
    throw new Error('Failed to get GitHub token');
  }
}

function createGitHubClient(token: string) {
  return new Octokit({
    auth: token
  });
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  updated_at: string | null;
}

// GET /api/github/repositories - List user's repositories
export async function GET() {
  try {
    const token = await getGitHubToken();
    const github = createGitHubClient(token);

    // Get user's repositories
    const { data: repos } = await github.repos.listForAuthenticatedUser({
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
      visibility: 'all'
    });

    // Format the response to include only needed fields
    const formattedRepos: Repository[] = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      default_branch: repo.default_branch,
      updated_at: repo.updated_at ?? null
    }));

    return NextResponse.json(formattedRepos);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}