# GitHub Integration

This document provides detailed information about Bebop's GitHub integration, which allows users to backup and sync their content with GitHub repositories.

## Overview

Bebop's GitHub integration enables users to:

1. Connect their GitHub account
2. Select repositories for content backup
3. Automatically back up topics and collections to GitHub
4. Sync content between Bebop and GitHub
5. Track changes using Git's version control

## Architecture

The GitHub integration consists of several components:

1. **Authentication Layer**: Uses Clerk's OAuth integration to authenticate with GitHub
2. **API Layer**: API routes to interact with the GitHub API
3. **UI Components**: Interface elements for managing GitHub connections and operations
4. **Backend Services**: Logic for backing up and synchronizing content

## Authentication Flow

Bebop uses Clerk for authentication, including OAuth integration with GitHub:

1. User initiates GitHub connection in Bebop
2. Clerk handles the OAuth flow with GitHub
3. GitHub issues an OAuth token
4. Clerk securely stores the token
5. Bebop retrieves the token from Clerk when needed for GitHub operations

## API Endpoints

### Check GitHub Connection

```
GET /api/github
```

Checks if the user has connected their GitHub account and returns basic user information.

**Response:**
```json
{
  "connected": true,
  "username": "username",
  "avatarUrl": "https://avatars.githubusercontent.com/u/12345678"
}
```

### List GitHub Repositories

```
GET /api/github/repositories
```

Lists repositories for the authenticated GitHub user.

**Response:**
```json
[
  {
    "id": 12345678,
    "name": "example-repo",
    "full_name": "username/example-repo",
    "private": false,
    "default_branch": "main",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  // More repositories...
]
```

### Backup to GitHub

```
POST /api/github/backup
```

Backs up content to a GitHub repository.

**Request Body:**
```json
{
  "repository": "username/example-repo",
  "files": [
    {
      "path": "content/topic1.md",
      "content": "# Topic 1\n\nContent here...",
      "message": "Update topic 1"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "path": "content/topic1.md",
      "success": true,
      "url": "https://github.com/username/example-repo/blob/main/content/topic1.md"
    }
  ]
}
```

## Implementation Details

### GitHub API Client

Bebop uses the Octokit REST client to interact with the GitHub API:

```typescript
import { Octokit } from '@octokit/rest';

// Initialize Octokit with a token
function createGitHubClient(token: string) {
  return new Octokit({
    auth: token
  });
}
```

### Getting the GitHub Token

The application retrieves the OAuth token from Clerk:

```typescript
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
```

### Backing Up Content

The backup process follows these steps:

1. Retrieve the GitHub token
2. Initialize the Octokit client
3. Get the repository information (owner, name, default branch)
4. For each file to backup:
   a. Check if the file already exists (to get its SHA if it does)
   b. Create or update the file with the new content
   c. Record the result

```typescript
// Example of creating or updating a file on GitHub
const { data } = await github.repos.createOrUpdateFileContents({
  owner,
  repo,
  path: file.path,
  message: file.message || `Update ${file.path}`,
  content: Buffer.from(file.content).toString('base64'),
  sha, // Optional: Required if the file already exists
  branch // Optional: Defaults to the default branch
});
```

## UI Components

### GitHub Settings Component

The GitHubSettings component (`src/components/settings/GitHubSettings.tsx`) provides the user interface for managing the GitHub integration:

- Connect/disconnect GitHub account
- Select repositories for backup
- Configure backup options
- Trigger manual backups
- View backup history

## Content Sync Strategy

Bebop implements the following strategy for content synchronization:

1. **Creation**: When a topic is created, it can be automatically backed up to GitHub
2. **Updates**: When a topic is updated, the corresponding file in GitHub is updated
3. **Organization**: Content is organized into directories matching collections
4. **Metadata**: Additional metadata is stored to maintain the relationship between Bebop content and GitHub files

## File Structure in GitHub

Bebop organizes content in the GitHub repository as follows:

```
repository/
├── topics/
│   ├── topic1.md
│   ├── topic2.md
│   └── ...
├── collections/
│   ├── collection1/
│   │   ├── metadata.json
│   │   └── content.md
│   └── ...
└── bebop.json  // Configuration and metadata
```

## Error Handling

The GitHub integration implements robust error handling:

1. **Authentication Errors**: Handling token expiration or revocation
2. **Rate Limiting**: Managing GitHub API rate limits
3. **Conflict Resolution**: Handling conflicts when the same file is modified in both Bebop and GitHub
4. **Network Errors**: Managing connection issues

## Security Considerations

1. **Token Storage**: GitHub OAuth tokens are securely stored by Clerk
2. **Permissions**: Only the minimum required permissions are requested
3. **Private Repositories**: Support for private repositories with appropriate access controls
4. **Content Exposure**: Warning users about potential content exposure when backing up to public repositories

## Configuration Options

Users can configure various aspects of the GitHub integration:

1. **Target Repository**: Which repository to use for backups
2. **File Organization**: How content is organized in the repository
3. **Auto-Backup**: Whether content should be automatically backed up when created or updated
4. **Commit Messages**: Custom commit messages for content updates

## Best Practices

When working with the GitHub integration:

1. **Use a Dedicated Repository**: Create a repository specifically for Bebop content
2. **Consistent Backup**: Regularly back up content to maintain version history
3. **Repository Visibility**: Consider whether content should be in a public or private repository
4. **Collaboration**: Leverage GitHub's collaboration features for content review

## Troubleshooting

Common issues and their solutions:

1. **Connection Failed**: Reconnect your GitHub account in settings
2. **Backup Failed**: Check repository permissions and try again
3. **Content Not Appearing**: Verify the backup process completed successfully
4. **Rate Limit Exceeded**: Wait until the rate limit resets (usually one hour)

## Future Enhancements

Planned enhancements for the GitHub integration:

1. **Two-way Sync**: Syncing content changes from GitHub back to Bebop
2. **PR Creation**: Generating pull requests for content updates
3. **Webhook Support**: Responding to GitHub events via webhooks
4. **Branch Management**: Support for working with different branches
5. **GitHub Actions Integration**: Triggering automated workflows when content is updated