// src/app/api/github/backup/route.ts
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

interface BackupFile {
  path: string;
  content: string;
  message?: string;
}

interface BackupResult {
  path: string;
  success: boolean;
  url?: string;
  error?: string;
}

// POST /api/github/backup - Create or update backup files
export async function POST(request: Request) {
  try {
    const token = await getGitHubToken();
    const github = createGitHubClient(token);
    
    const body = await request.json();
    const { repository, files } = body as { repository: string; files: BackupFile[] };

    if (!repository || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [owner, repo] = repository.split('/');
    const results: BackupResult[] = [];

    // Get the default branch
    const { data: repoData } = await github.repos.get({ owner, repo });
    const branch = repoData.default_branch;

    // Process each file
    for (const file of files) {
      try {
        // Try to get the current file (to get the SHA if it exists)
        let sha: string | undefined;
        try {
          const { data: existingFile } = await github.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: branch
          });
          
          if (!Array.isArray(existingFile)) {
            sha = existingFile.sha;
          }
        } catch (_error) {
          // File doesn't exist yet, that's okay
        }

        // Create or update file
        const { data } = await github.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: file.path,
          message: file.message || `Update ${file.path}`,
          content: Buffer.from(file.content).toString('base64'),
          sha,
          branch
        });

        results.push({
          path: file.path,
          success: true,
          url: data.content?.html_url
        });
      } catch (error) {
        results.push({
          path: file.path,
          success: false,
          error: error instanceof Error ? error.message : 'Failed to backup file'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create backup' },
      { status: 500 }
    );
  }
}