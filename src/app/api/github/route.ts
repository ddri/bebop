// app/api/github/route.ts
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

    const tokens = await clerkClient.users.getUserOauthAccessToken(
      user.id,
      'oauth_github'
    );
    
    if (!tokens || tokens.length === 0 || !tokens[0].token) {
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

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = await getGitHubToken();
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
    const user = await currentUser();
    
    if (!user) {
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

    const token = await getGitHubToken();
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
        name: user.firstName ?? 'Bebop User',
        email: user.emailAddresses[0]?.emailAddress ?? 'noreply@github.com'
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