// app/api/github/route.ts
import { NextResponse } from 'next/server';
import { clerkClient, auth } from '@clerk/nextjs';
import { Octokit } from '@octokit/rest';

// Helper function to get GitHub token from Clerk
async function getGitHubToken(userId: string) {
  try {
    const oauthAccessToken = await clerkClient.users.getUserOauthAccessToken(
      userId,
      'oauth_github'
    );
    
    if (!oauthAccessToken?.[0]?.token) {
      throw new Error('No GitHub token found');
    }

    return oauthAccessToken[0].token;
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

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = await getGitHubToken(userId);
    const github = createGitHubClient(token);

    // Get user's repositories
    const { data: repos } = await github.repos.listForAuthenticatedUser({
      sort: 'updated',
      direction: 'desc'
    });

    return NextResponse.json(repos);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { repo, path, content, message } = body;

    if (!repo || !path || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const token = await getGitHubToken(userId);
    const github = createGitHubClient(token);

    // Get repository details
    const [owner, repoName] = repo.split('/');

    // Create or update file
    const { data } = await github.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path,
      message: message || `Update ${path}`,
      content: Buffer.from(content).toString('base64'),
      committer: {
        name: 'Bebop CMS',
        email: 'noreply@bebop.dev'
      }
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update file' },
      { status: 500 }
    );
  }
}