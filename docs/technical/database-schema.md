# Bebop Database Schema

This document provides detailed information about the database schema used in Bebop. The application uses MongoDB as its database with Prisma as the ORM layer.

## Overview

Bebop's data model is designed around the core concepts of Topics (individual content pieces), Collections (groups of topics), and various publishing mechanisms. The database schema is defined using Prisma and supports MongoDB as the database provider.

## Schema Definition

The complete database schema is defined in `prisma/schema.prisma`.

## Data Models

### Topic

The `Topic` model represents an individual piece of content within Bebop.

```prisma
model Topic {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  content       String
  description   String    @default("")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  collectionIds String[]  @db.ObjectId

  @@map("topics")
}
```

**Fields:**
- `id`: Unique identifier (MongoDB ObjectId)
- `name`: Title of the topic
- `content`: Markdown content of the topic
- `description`: Brief description of the topic
- `createdAt`: Timestamp when the topic was created
- `updatedAt`: Timestamp when the topic was last updated
- `collectionIds`: Array of Collection IDs this topic belongs to

**Relationships:**
- One-to-many relationship with Collections (reference only, not a direct relation)

### Collections

The `Collections` model represents a grouping of topics that can be published together.

```prisma
model Collections {
  id           String    @id @default(auto()) @map("_id") @db.ObjectId
  name         String
  description  String?
  topicIds     String[]  @db.ObjectId
  publishedUrl String?
  hashnodeUrl  String?
  devToUrl     String?
  createdAt    DateTime  @default(now())
  lastEdited   DateTime  @updatedAt

  @@map("collections")
}
```

**Fields:**
- `id`: Unique identifier (MongoDB ObjectId)
- `name`: Name of the collection
- `description`: Description of the collection (optional)
- `topicIds`: Array of Topic IDs included in this collection
- `publishedUrl`: URL where the collection is published locally (optional)
- `hashnodeUrl`: URL where the collection is published on Hashnode (optional)
- `devToUrl`: URL where the collection is published on Dev.to (optional)
- `createdAt`: Timestamp when the collection was created
- `lastEdited`: Timestamp when the collection was last edited

**Relationships:**
- Many-to-many relationship with Topics (reference only, not a direct relation)

### PublishedContent

The `PublishedContent` model stores the published versions of content.

```prisma
model PublishedContent {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  fileName  String
  content   String
  createdAt DateTime  @default(now())

  @@map("publishedContent")
}
```

**Fields:**
- `id`: Unique identifier (MongoDB ObjectId)
- `fileName`: Name of the file where content is published
- `content`: The published content
- `createdAt`: Timestamp when the content was published

### MediaItem

The `MediaItem` model represents media files uploaded to the system.

```prisma
model MediaItem {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  filename  String
  url       String
  size      Int
  mimeType  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("mediaItems")
}
```

**Fields:**
- `id`: Unique identifier (MongoDB ObjectId)
- `filename`: Name of the media file
- `url`: URL where the media is stored
- `size`: Size of the media file in bytes
- `mimeType`: MIME type of the media file
- `createdAt`: Timestamp when the media was uploaded
- `updatedAt`: Timestamp when the media was last updated

### Settings

The `Settings` model stores application settings.

```prisma
model Settings {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  hashnodeToken   String?
  publicationId   String?
  lastUpdated     DateTime  @updatedAt
  
  @@map("settings")
}
```

**Fields:**
- `id`: Unique identifier (MongoDB ObjectId)
- `hashnodeToken`: API token for Hashnode integration (optional)
- `publicationId`: ID of the Hashnode publication (optional)
- `lastUpdated`: Timestamp when settings were last updated

### Campaign

The `Campaign` model represents content campaigns for organizing publishing.

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

  @@map("campaigns")
}
```

**Fields:**
- `id`: Unique identifier (MongoDB ObjectId)
- `name`: Name of the campaign
- `description`: Description of the campaign (optional)
- `startDate`: Start date of the campaign (optional)
- `endDate`: End date of the campaign (optional)
- `status`: Status of the campaign (draft, active, completed, archived)
- `createdAt`: Timestamp when the campaign was created
- `updatedAt`: Timestamp when the campaign was last updated

**Relationships:**
- One-to-many relationship with PublishingPlan (direct relation)

### PublishingPlan

The `PublishingPlan` model represents the scheduling and tracking of content publishing within campaigns.

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
  hashnodeUrl   String?
  devToUrl      String?
  campaign      Campaign   @relation(fields: [campaignId], references: [id])
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@unique([campaignId, topicId, platform])
  @@map("publishingPlans")
}
```

**Fields:**
- `id`: Unique identifier (MongoDB ObjectId)
- `campaignId`: ID of the associated campaign
- `topicId`: ID of the topic to be published
- `platform`: Publishing platform (e.g., "devto", "hashnode", "medium")
- `status`: Status of the publishing plan (scheduled, published, etc.)
- `scheduledFor`: Date and time scheduled for publishing (optional)
- `publishedAt`: Date and time when content was published (optional)
- `publishedUrl`: URL where content was published (optional)
- `hashnodeUrl`: URL where content was published on Hashnode (optional)
- `devToUrl`: URL where content was published on Dev.to (optional)
- `createdAt`: Timestamp when the plan was created
- `updatedAt`: Timestamp when the plan was last updated

**Relationships:**
- Many-to-one relationship with Campaign (direct relation)

## Database Indexes and Constraints

### Unique Constraints

- `PublishingPlan`: Unique constraint on [campaignId, topicId, platform] to prevent duplicate publishing plans

## Data Relationships

Bebop uses a mix of direct relations (for MongoDB) and reference arrays:

1. **Topics to Collections**: One-to-many relationship using reference arrays (`collectionIds` in Topic)
2. **Collections to Topics**: Many-to-many relationship using reference arrays (`topicIds` in Collections)
3. **Campaigns to PublishingPlans**: One-to-many relationship using direct relations

## Schema Evolution

When making changes to the database schema:

1. Update the Prisma schema in `prisma/schema.prisma`
2. Run migrations to apply changes
3. Update any related TypeScript types and interfaces
4. Update any affected API routes or components

## Best Practices

When working with the Bebop database:

1. Use Prisma Client for all database operations to maintain type safety
2. Avoid direct manipulation of MongoDB outside of Prisma
3. Add appropriate indexes for frequently queried fields
4. Maintain referential integrity between related models
5. Use transactions when updating multiple related records