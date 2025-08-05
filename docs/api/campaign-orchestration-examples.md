# Campaign Orchestration API Examples

This document provides practical examples for using the Campaign Orchestration APIs introduced in Epic 1.

## Authentication

All API endpoints require authentication using Clerk. Include authentication headers in your requests.

## Content Staging API

### Create Content Staging

Stage content for a campaign with the simple 3-state workflow.

```bash
POST /api/staging
Content-Type: application/json

{
  "campaignId": "6891f8e4434f3cd22b614f5a",
  "topicId": "507f1f77bcf86cd799439011",
  "status": "draft",
  "platforms": ["hashnode", "devto", "medium"],
  "scheduledFor": "2024-08-15T10:00:00.000Z"
}
```

**Response:**
```json
{
  "id": "6891f8e5434f3cd22b614f5b",
  "campaignId": "6891f8e4434f3cd22b614f5a",
  "topicId": "507f1f77bcf86cd799439011",
  "status": "draft",
  "platforms": ["hashnode", "devto", "medium"],
  "scheduledFor": "2024-08-15T10:00:00.000Z",
  "createdAt": "2024-08-05T12:28:21.490Z",
  "updatedAt": "2024-08-05T12:28:21.490Z",
  "campaign": {
    "id": "6891f8e4434f3cd22b614f5a",
    "name": "Q4 Product Launch",
    "status": "active"
  }
}
```

### Update Content Status

Move content through the workflow: draft → ready → scheduled.

```bash
PUT /api/staging/6891f8e5434f3cd22b614f5b
Content-Type: application/json

{
  "status": "ready"
}
```

### Get All Staged Content

```bash
GET /api/staging
```

**Response:**
```json
[
  {
    "id": "6891f8e5434f3cd22b614f5b",
    "campaignId": "6891f8e4434f3cd22b614f5a", 
    "topicId": "507f1f77bcf86cd799439011",
    "status": "ready",
    "platforms": ["hashnode", "devto", "medium"],
    "scheduledFor": "2024-08-15T10:00:00.000Z",
    "campaign": {
      "id": "6891f8e4434f3cd22b614f5a",
      "name": "Q4 Product Launch",
      "status": "active"
    }
  }
]
```

## Manual Tasks API

### Create Manual Task

Track manual publishing work like Medium articles or LinkedIn posts.

```bash
POST /api/tasks
Content-Type: application/json

{
  "campaignId": "6891f8e4434f3cd22b614f5a",
  "title": "Publish article to Medium",
  "description": "Post the Q4 launch announcement to Medium with custom formatting",
  "platform": "medium",
  "status": "todo",
  "dueDate": "2024-08-15T09:00:00.000Z",
  "instructions": "1. Copy content from staging\n2. Add Medium-specific formatting\n3. Include custom images\n4. Tag with 'product-launch' and 'tech'"
}
```

**Response:**
```json
{
  "id": "6891f8e6434f3cd22b614f5c",
  "campaignId": "6891f8e4434f3cd22b614f5a",
  "contentStagingId": null,
  "title": "Publish article to Medium",
  "description": "Post the Q4 launch announcement to Medium with custom formatting",
  "platform": "medium",
  "status": "todo",
  "dueDate": "2024-08-15T09:00:00.000Z",
  "completedAt": null,
  "instructions": "1. Copy content from staging\n2. Add Medium-specific formatting\n3. Include custom images\n4. Tag with 'product-launch' and 'tech'",
  "notes": null,
  "campaign": {
    "id": "6891f8e4434f3cd22b614f5a",
    "name": "Q4 Product Launch",
    "status": "active"
  }
}
```

### Update Task Progress

```bash
PUT /api/tasks/6891f8e6434f3cd22b614f5c
Content-Type: application/json

{
  "status": "in_progress",
  "notes": "Started working on Medium formatting"
}
```

### Complete Task

```bash
PUT /api/tasks/6891f8e6434f3cd22b614f5c
Content-Type: application/json

{
  "status": "completed",
  "completedAt": "2024-08-15T10:30:00.000Z",
  "notes": "Successfully published to Medium: https://medium.com/@author/article-title"
}
```

### Get All Manual Tasks

```bash
GET /api/tasks
```

## Campaign API with New Relations

### Get Campaign with All Related Data

```bash
GET /api/campaigns/6891f8e4434f3cd22b614f5a
```

**Response:**
```json
{
  "id": "6891f8e4434f3cd22b614f5a",
  "name": "Q4 Product Launch",
  "description": "Comprehensive campaign for Q4 product launch",
  "startDate": "2024-08-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "status": "active",
  "createdAt": "2024-08-05T12:28:20.813Z",
  "updatedAt": "2024-08-05T12:28:20.813Z",
  "publishingPlans": [
    {
      "id": "507f1f77bcf86cd799439012",
      "platform": "hashnode",
      "status": "scheduled",
      "scheduledFor": "2024-08-15T10:00:00.000Z"
    }
  ],
  "contentStaging": [
    {
      "id": "6891f8e5434f3cd22b614f5b",
      "topicId": "507f1f77bcf86cd799439011",
      "status": "ready",
      "platforms": ["hashnode", "devto", "medium"]
    }
  ],
  "manualTasks": [
    {
      "id": "6891f8e6434f3cd22b614f5c",
      "title": "Publish article to Medium",
      "status": "todo",
      "platform": "medium",
      "dueDate": "2024-08-15T09:00:00.000Z"
    }
  ]
}
```

## Error Handling Examples

### Validation Errors

```bash
POST /api/staging
Content-Type: application/json

{
  "campaignId": "invalid-id",
  "topicId": "",
  "status": "invalid-status",
  "platforms": []
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": {
    "campaignId": "Campaign ID must be a valid MongoDB ObjectId",
    "topicId": "Topic ID must be a valid MongoDB ObjectId", 
    "status": "Status must be one of: draft, ready, scheduled",
    "platforms": "At least one platform must be specified"
  }
}
```

### Referential Integrity Errors

```bash
POST /api/staging
Content-Type: application/json

{
  "campaignId": "507f1f77bcf86cd799439099",
  "topicId": "507f1f77bcf86cd799439088",
  "status": "draft",
  "platforms": ["hashnode"]
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Reference validation failed",
  "details": [
    "Campaign with ID 507f1f77bcf86cd799439099 does not exist",
    "Topic with ID 507f1f77bcf86cd799439088 does not exist"
  ]
}
```

### Duplicate Content Staging

```bash
POST /api/staging
Content-Type: application/json

{
  "campaignId": "6891f8e4434f3cd22b614f5a",
  "topicId": "507f1f77bcf86cd799439011",
  "status": "draft",
  "platforms": ["hashnode"]
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Reference validation failed",
  "details": [
    "Content staging already exists for this campaign and topic combination"
  ]
}
```

## Workflow Examples

### Complete Campaign Content Workflow

1. **Create Campaign** (existing functionality)
2. **Stage Content** for the campaign
3. **Create Manual Tasks** for platforms requiring manual posting
4. **Update Staging Status** as content progresses through workflow
5. **Complete Manual Tasks** as they're finished
6. **Monitor Progress** via campaign endpoint

This workflow ensures nothing falls through the cracks and provides full visibility into both automated and manual publishing activities.

## Best Practices

1. **Always validate data** - The APIs enforce strict validation
2. **Check referential integrity** - Ensure campaigns and topics exist before creating staging/tasks
3. **Use proper status transitions** - Follow the defined workflows (draft → ready → scheduled)
4. **Include due dates** - Set realistic due dates for manual tasks
5. **Provide clear instructions** - Include detailed instructions for manual tasks
6. **Update progress regularly** - Keep task status current for accurate reporting