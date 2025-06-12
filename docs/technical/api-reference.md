# Bebop API Reference

This document provides detailed information about the API endpoints available in Bebop.

## Overview

Bebop uses Next.js API routes to create a RESTful API for managing content, collections, and integrations. All API routes are located in the `/src/app/api/` directory.

## Authentication

Most API routes require authentication. Bebop uses Clerk for authentication, and API routes check for a valid user session before processing requests.

## API Endpoints

### Topics API

#### List Topics

```
GET /api/topics
```

Retrieves a list of all topics.

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Introduction to React",
    "content": "# React Basics\n\nReact is a JavaScript library...",
    "description": "An introduction to React fundamentals",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z",
    "collectionIds": ["507f1f77bcf86cd799439012"]
  },
  // More topics...
]
```

#### Create Topic

```
POST /api/topics
```

Creates a new topic.

**Request Body:**
```json
{
  "name": "Getting Started with TypeScript",
  "content": "# TypeScript Basics\n\nTypeScript is a typed superset of JavaScript...",
  "description": "Learn the basics of TypeScript"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Getting Started with TypeScript",
  "content": "# TypeScript Basics\n\nTypeScript is a typed superset of JavaScript...",
  "description": "Learn the basics of TypeScript",
  "createdAt": "2023-01-03T00:00:00.000Z",
  "updatedAt": "2023-01-03T00:00:00.000Z",
  "collectionIds": []
}
```

#### Get Topic

```
GET /api/topics/:id
```

Retrieves a specific topic by ID.

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Getting Started with TypeScript",
  "content": "# TypeScript Basics\n\nTypeScript is a typed superset of JavaScript...",
  "description": "Learn the basics of TypeScript",
  "createdAt": "2023-01-03T00:00:00.000Z",
  "updatedAt": "2023-01-03T00:00:00.000Z",
  "collectionIds": []
}
```

#### Update Topic

```
PUT /api/topics/:id
```

Updates an existing topic.

**Request Body:**
```json
{
  "name": "Getting Started with TypeScript",
  "content": "# TypeScript Fundamentals\n\nTypeScript is a typed superset of JavaScript...",
  "description": "A comprehensive guide to TypeScript basics"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Getting Started with TypeScript",
  "content": "# TypeScript Fundamentals\n\nTypeScript is a typed superset of JavaScript...",
  "description": "A comprehensive guide to TypeScript basics",
  "createdAt": "2023-01-03T00:00:00.000Z",
  "updatedAt": "2023-01-04T00:00:00.000Z",
  "collectionIds": []
}
```

#### Delete Topic

```
DELETE /api/topics/:id
```

Deletes a topic.

**Response:**
```json
{
  "success": true,
  "id": "507f1f77bcf86cd799439013"
}
```

### Collections API

#### List Collections

```
GET /api/collections
```

Retrieves a list of all collections.

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "React Tutorial Series",
    "description": "A complete guide to React",
    "topicIds": ["507f1f77bcf86cd799439011"],
    "publishedUrl": "https://example.com/react-series",
    "hashnodeUrl": null,
    "devToUrl": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "lastEdited": "2023-01-02T00:00:00.000Z"
  },
  // More collections...
]
```

#### Create Collection

```
POST /api/collections
```

Creates a new collection.

**Request Body:**
```json
{
  "name": "TypeScript Guides",
  "description": "A series of TypeScript tutorials",
  "topicIds": ["507f1f77bcf86cd799439013"]
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "name": "TypeScript Guides",
  "description": "A series of TypeScript tutorials",
  "topicIds": ["507f1f77bcf86cd799439013"],
  "publishedUrl": null,
  "hashnodeUrl": null,
  "devToUrl": null,
  "createdAt": "2023-01-05T00:00:00.000Z",
  "lastEdited": "2023-01-05T00:00:00.000Z"
}
```

#### Get Collection

```
GET /api/collections/:id
```

Retrieves a specific collection by ID.

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "name": "TypeScript Guides",
  "description": "A series of TypeScript tutorials",
  "topicIds": ["507f1f77bcf86cd799439013"],
  "publishedUrl": null,
  "hashnodeUrl": null,
  "devToUrl": null,
  "createdAt": "2023-01-05T00:00:00.000Z",
  "lastEdited": "2023-01-05T00:00:00.000Z"
}
```

#### Update Collection

```
PUT /api/collections/:id
```

Updates an existing collection.

**Request Body:**
```json
{
  "name": "Advanced TypeScript Guides",
  "description": "A series of TypeScript tutorials for advanced users",
  "topicIds": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439015"]
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "name": "Advanced TypeScript Guides",
  "description": "A series of TypeScript tutorials for advanced users",
  "topicIds": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439015"],
  "publishedUrl": null,
  "hashnodeUrl": null,
  "devToUrl": null,
  "createdAt": "2023-01-05T00:00:00.000Z",
  "lastEdited": "2023-01-06T00:00:00.000Z"
}
```

#### Delete Collection

```
DELETE /api/collections/:id
```

Deletes a collection.

**Response:**
```json
{
  "success": true,
  "id": "507f1f77bcf86cd799439014"
}
```

### GitHub Integration API

#### Check GitHub Connection

```
GET /api/github
```

Checks the GitHub connection status.

**Response:**
```json
{
  "connected": true,
  "username": "username",
  "avatarUrl": "https://avatars.githubusercontent.com/u/12345678"
}
```

#### List GitHub Repositories

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

#### Backup to GitHub

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

### Publishing API

#### Publish Content

```
POST /api/publish
```

Publishes content to various platforms.

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
  "publishedUrls": {
    "devto": "https://dev.to/username/advanced-typescript-guides-123",
    "hashnode": "https://hashnode.com/username/advanced-typescript-guides-456"
  }
}
```

### Media API

#### Upload Media

```
POST /api/media
```

Uploads a media file.

**Request Body:**
Form data with file attachment.

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439016",
  "filename": "example.jpg",
  "url": "https://example.com/uploads/example.jpg",
  "size": 12345,
  "mimeType": "image/jpeg",
  "createdAt": "2023-01-07T00:00:00.000Z",
  "updatedAt": "2023-01-07T00:00:00.000Z"
}
```

#### List Media

```
GET /api/media
```

Lists all media files.

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439016",
    "filename": "example.jpg",
    "url": "https://example.com/uploads/example.jpg",
    "size": 12345,
    "mimeType": "image/jpeg",
    "createdAt": "2023-01-07T00:00:00.000Z",
    "updatedAt": "2023-01-07T00:00:00.000Z"
  },
  // More media files...
]
```

### Campaigns API

#### List Campaigns

```
GET /api/campaigns
```

Lists all campaigns.

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439017",
    "name": "Q1 Content Strategy",
    "description": "Content for Q1 2023",
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-03-31T00:00:00.000Z",
    "status": "active",
    "createdAt": "2022-12-15T00:00:00.000Z",
    "updatedAt": "2022-12-15T00:00:00.000Z",
    "publishingPlans": []
  },
  // More campaigns...
]
```

## Error Handling

All API endpoints follow a consistent error handling pattern:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## API Implementation Details

The API routes are implemented using Next.js API routes in the `/src/app/api/` directory. Each route handler follows this general pattern:

```typescript
export async function GET() {
  try {
    // Authentication check
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Request processing
    // ...

    // Success response
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
```

## API Testing

You can test the API endpoints using tools like Postman, curl, or the built-in fetch API in JavaScript.

Example:
```javascript
const response = await fetch('/api/topics');
const topics = await response.json();