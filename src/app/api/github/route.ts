// src/app/api/github/route.ts
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

// Initialize Octokit with a token
function createGitHubClient(token: string) {
  return new Octokit({
    auth: token
  });
}

// GET /api/github - Check connection and get user info
export async function GET() {
  try {
    const token = await getGitHubToken();
    const github = createGitHubClient(token);

    // Get authenticated user
    const { data: user } = await github.users.getAuthenticated();

    return NextResponse.json({
      connected: true,
      username: user.login,
      avatarUrl: user.avatar_url
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check GitHub connection' },
      { status: 500 }
    );
  }
}