# Bebop Publishing System

This document provides detailed information about Bebop's publishing system, which enables users to publish content to various platforms.

## Overview

Bebop's publishing system allows users to:

1. Publish content to multiple platforms from a single interface
2. Schedule content for future publishing
3. Track published content across platforms
4. Manage publishing campaigns
5. Unpublish content when needed

## Supported Publishing Platforms

Bebop currently supports publishing to:

- **Bebop Blog**: Local hosting of published content
- **Dev.to**: Technical blog platform for developers
- **Hashnode**: Developer blogging platform
- **Social Media**: Platforms like Bluesky, Mastodon, and Threads

## Architecture

The publishing system consists of several components:

1. **Publishing API**: API routes for publishing operations
2. **Platform Connectors**: Individual connectors for each publishing platform
3. **UI Components**: Interface elements for managing publishing
4. **Database Models**: Storage of publishing data and history
5. **Scheduling System**: Management of scheduled publications

## Publishing Workflow

The typical publishing workflow in Bebop:

1. **Content Creation**: User creates or edits a topic or collection
2. **Platform Selection**: User selects one or more platforms to publish to
3. **Publishing Configuration**: User configures platform-specific settings
4. **Preview**: User previews how content will appear on the selected platforms
5. **Publishing**: User triggers the publishing process
6. **Confirmation**: System confirms successful publishing and stores the published URLs
7. **Tracking**: System tracks engagement and metrics for published content

## API Endpoints

### Publish Content

```
POST /api/publish
```

Publishes content to selected platforms.

**Request Body:**
```json
{
  "collectionId": "507f1f77bcf86cd799439014",
  "platforms": ["devto", "hashnode"],
  "settings": {
    "devto": {
      "tags": ["typescript", "programming"],
      "canonical_url": "https://example.com/original-post"
    },
    "hashnode": {
      "publication_id": "publication-123",
      "tags": ["web-development", "typescript"]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "publishedUrls": {
    "devto": "https://dev.to/username/advanced-typescript-guides-123",
    "hashnode": "https://hashnode.com/username/advanced-typescript-guides-456"
  }
}
```

### Publish Collection

```
POST /api/publish/:id
```

Publishes a specific collection.

**Parameters:**
- `id`: Collection ID

**Request Body:**
```json
{
  "platforms": ["devto", "hashnode"]
}
```

**Response:**
```json
{
  "success": true,
  "publishedUrls": {
    "devto": "https://dev.to/username/collection-title-123",
    "hashnode": "https://hashnode.com/username/collection-title-456"
  }
}
```

### Unpublish Content

```
POST /api/unpublish
```

Unpublishes content from selected platforms.

**Request Body:**
```json
{
  "collectionId": "507f1f77bcf86cd799439014",
  "platforms": ["devto", "hashnode"]
}
```

**Response:**
```json
{
  "success": true,
  "platforms": ["devto", "hashnode"]
}
```

## Publishing to Dev.to

### Authentication

Dev.to integration requires an API key:

1. User obtains an API key from their Dev.to account settings
2. API key is stored in Bebop settings
3. Key is used for all publishing operations to Dev.to

### Publishing Process

1. Content is formatted for Dev.to's API requirements
2. Images are processed and uploaded if needed
3. Article is created via the Dev.to API
4. Published URL is retrieved and stored

### Implementation Details

```typescript
// Example of publishing to Dev.to
async function publishToDevTo(title, content, tags) {
  const apiKey = await getDevToApiKey();
  
  const response = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      article: {
        title,
        body_markdown: content,
        published: true,
        tags,
      }
    }),
  });
  
  const data = await response.json();
  return data.url;
}
```

## Publishing to Hashnode

### Authentication

Hashnode integration requires an API token:

1. User obtains an API token from their Hashnode account
2. Token is stored in Bebop settings
3. Token is used for GraphQL API operations

### Publishing Process

1. Content is formatted for Hashnode's requirements
2. Publication is identified (if the user has multiple)
3. Article is created via Hashnode's GraphQL API
4. Published URL is retrieved and stored

### Implementation Details

```typescript
// Example of publishing to Hashnode
async function publishToHashnode(title, content, tags, publicationId) {
  const token = await getHashnodeToken();
  
  const query = `
    mutation CreatePublication($input: CreatePublicationInput!) {
      createPublication(input: $input) {
        post {
          slug
          url
        }
      }
    }
  `;
  
  const variables = {
    input: {
      title,
      contentMarkdown: content,
      tags,
      publicationId,
    },
  };
  
  const response = await fetch('https://api.hashnode.com', {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  
  const data = await response.json();
  return data.data.createPublication.post.url;
}
```

## Social Media Publishing

### Supported Platforms

- **Bluesky**: Decentralized social network
- **Mastodon**: Federated social network
- **Threads**: Meta's text-based social platform

### Authentication

Each platform has its own authentication method:

- **Bluesky**: Uses App Password authentication
- **Mastodon**: Uses OAuth or access tokens
- **Threads**: Uses Meta's authentication system

### Implementation Details

Bebop implements platform-specific clients for each social media platform:

```typescript
// Abstract class for all social clients
abstract class AbstractSocialClient {
  abstract publish(content: string, media?: MediaItem[]): Promise<string>;
  abstract getProfile(): Promise<SocialProfile>;
}

// Example Bluesky client implementation
class BlueskyClient extends AbstractSocialClient {
  private agent: BskyAgent;
  
  constructor(credentials: BlueskyCredentials) {
    super();
    this.agent = new BskyAgent({
      service: 'https://bsky.social',
    });
  }
  
  async initialize() {
    await this.agent.login({
      identifier: this.credentials.identifier,
      password: this.credentials.appPassword,
    });
  }
  
  async publish(content: string, media?: MediaItem[]) {
    // Implementation of Bluesky publishing
  }
  
  async getProfile() {
    // Implementation of profile retrieval
  }
}
```

## Campaign-based Publishing

### Campaign Model

The Campaign model allows for organizing and scheduling content publications:

```prisma
model Campaign {
  id            String           @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  description   String?
  startDate     DateTime?
  endDate       DateTime?
  status        String           @default("draft") // draft, active, completed, archived
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  publishingPlans PublishingPlan[]
}
```

### Publishing Plan Model

Each campaign can have multiple publishing plans:

```prisma
model PublishingPlan {
  id            String     @id @default(auto()) @map("_id") @db.ObjectId
  campaignId    String     @db.ObjectId
  topicId       String     @db.ObjectId
  platform      String    
  status        String     @default("scheduled") 
  scheduledFor  DateTime?
  publishedAt   DateTime?
  publishedUrl  String?
  campaign      Campaign   @relation(fields: [campaignId], references: [id])
}
```

### Implementation

Campaign publishing is implemented through a combination of:

1. **UI Components**: For creating and managing campaigns
2. **API Routes**: For campaign CRUD operations
3. **Scheduled Jobs**: For executing scheduled publications
4. **Publishing Logic**: For actual content publishing to platforms

## Content Transformation

Before publishing, content is transformed for each platform:

1. **Markdown Processing**: Converting markdown to the platform's required format
2. **Image Processing**: Handling images for each platform's requirements
3. **Link Transformation**: Adjusting links for cross-posting
4. **Platform-specific Formatting**: Adjusting content for platform norms

```typescript
// Example content transformer
function transformForPlatform(content, platform) {
  switch (platform) {
    case 'devto':
      return transformForDevTo(content);
    case 'hashnode':
      return transformForHashnode(content);
    // Other platforms
    default:
      return content;
  }
}
```

## Media Handling

Media files are handled during publishing:

1. **Storage**: Images are stored in S3 or local storage
2. **Processing**: Images are processed for size and format
3. **Platform Upload**: Images are uploaded to each platform as needed
4. **URL Mapping**: Image URLs are mapped between platforms

## Error Handling

The publishing system implements robust error handling:

1. **Platform Errors**: Handling errors from publishing platforms
2. **Retry Logic**: Retrying failed publishing attempts
3. **Partial Success**: Handling cases where publishing succeeds on some platforms but fails on others
4. **User Feedback**: Providing clear error messages to users

## Metrics and Analytics

Bebop tracks publishing metrics:

1. **Publication Status**: Tracking where content is published
2. **Engagement Metrics**: Views, likes, comments (when available from platforms)
3. **Historical Data**: Tracking publishing history over time
4. **Campaign Performance**: Analyzing performance of publishing campaigns

## Security Considerations

1. **API Key Storage**: Secure storage of platform API keys
2. **Authentication**: Secure handling of authentication tokens
3. **Content Validation**: Validating content before publishing
4. **Rate Limiting**: Respecting platform rate limits

## Best Practices

When using the publishing system:

1. **Cross-platform Consistency**: Ensure content is suitable for all target platforms
2. **Campaign Planning**: Use campaigns for coordinated content publishing
3. **Media Optimization**: Optimize media for each platform
4. **Link Management**: Use canonical URLs when cross-posting
5. **Testing**: Test publishing to each platform before full deployment

## Troubleshooting

Common issues and solutions:

1. **Authentication Failures**: Check API keys and tokens
2. **Content Rejection**: Ensure content meets platform guidelines
3. **Rate Limiting**: Space out publishing to avoid rate limits
4. **Media Issues**: Check media formats and sizes for platform compatibility