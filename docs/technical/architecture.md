# Bebop Architecture

This document provides an overview of the Bebop application architecture, explaining the key components, data flow, and system design.

## System Overview

Bebop is a Next.js application designed to help technical content creators manage and publish their content across multiple platforms. The application follows a modern React architecture with server-side rendering capabilities and API routes for backend functionality.

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────┐       ┌────────────────┐   │
│  │         │       │                │   │
│  │   UI    │◄─────►│  Client-side   │   │
│  │ (React) │       │  Application   │   │
│  │         │       │                │   │
│  └─────────┘       └────────┬───────┘   │
│                             │           │
│  ┌─────────┐       ┌───────▼────────┐   │
│  │         │       │                │   │
│  │  Hooks  │◄─────►│  API Routes    │   │
│  │         │       │                │   │
│  └─────────┘       └───────┬────────┘   │
│                             │           │
│  ┌─────────┐       ┌───────▼────────┐   │
│  │         │       │                │   │
│  │ Prisma  │◄─────►│   Database     │   │
│  │  ORM    │       │  (MongoDB)     │   │
│  │         │       │                │   │
│  └─────────┘       └────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
            │               │ 
            ▼               ▼
  ┌─────────────────┐ ┌─────────────────┐
  │                 │ │                 │
  │  GitHub API     │ │  Publishing     │
  │  Integration    │ │  Platforms      │
  │                 │ │  (Dev.to, etc.) │
  └─────────────────┘ └─────────────────┘
```

## Key Components

### 1. Frontend Layer

The frontend is built with React and Next.js, utilizing the App Router for page routing and organization.

**Key Components:**
- **Pages**: Defined in `/src/app/` following Next.js App Router structure
- **UI Components**: Reusable components in `/src/components/`
- **Hooks**: Custom React hooks for data fetching and state management in `/src/hooks/`

### 2. API Layer

Backend functionality is implemented through Next.js API routes which handle data operations and external integrations.

**Key Components:**
- **API Routes**: Defined in `/src/app/api/` following the App Router structure
- **Service Functions**: Logic for interacting with external services

### 3. Data Layer

Data is stored in MongoDB and accessed via Prisma ORM.

**Key Components:**
- **Prisma Schema**: Defines the database structure in `/prisma/schema.prisma`
- **Prisma Client**: Generated from the schema to provide type-safe database access

### 4. External Integrations

Bebop integrates with various external services:

- **GitHub**: For backing up and syncing content
- **Publishing Platforms**: Dev.to, Hashnode, etc.
- **Social Media Platforms**: For sharing content

## Data Flow

### Content Creation Flow

1. User creates content in the web interface
2. Client-side components call the appropriate API route via custom hooks
3. API route handlers process the request and use Prisma to store data in MongoDB
4. The UI is updated to reflect the changes

### Publishing Flow

1. User selects content to publish and the destination
2. API routes handle authentication with the target platform
3. Content is transformed according to platform requirements
4. Content is submitted to the publishing platform via its API
5. Success/failure status is returned to the user

### GitHub Backup Flow

1. User initiates a backup to GitHub
2. API route authenticates with GitHub using OAuth token from Clerk
3. Content is formatted and sent to GitHub using Octokit
4. Repository is updated with the content
5. Success/failure status is returned to the user

## Authentication and Security

- **Authentication**: Implemented using Clerk for user authentication
- **Authorization**: API routes verify user authentication before processing requests
- **GitHub OAuth**: Uses OAuth flow via Clerk to authenticate with GitHub
- **API Security**: Protects API routes with proper authentication checks

## Database Schema

The application uses MongoDB with the following main collections:

- **Topics**: Individual pieces of content
- **Collections**: Groups of topics for publishing
- **PublishedContent**: Records of published content
- **MediaItems**: Media files associated with content
- **Campaigns**: Content campaign management
- **PublishingPlans**: Scheduling and tracking of content publishing

See the [Database Schema](./database-schema.md) document for detailed information.

## Scalability Considerations

- **Serverless Architecture**: Next.js API routes scale automatically in a serverless environment
- **Database Indexing**: Proper indexing of MongoDB collections
- **Caching**: Implementation of caching where appropriate
- **Media Storage**: Use of cloud storage (e.g., S3) for media items

## Deployment Architecture

Bebop can be deployed as:

1. **Vercel Deployment**: Optimized for Next.js applications
2. **Self-hosted**: Can be deployed on any Node.js hosting platform
3. **Local Application**: Can run as a local development application

## Further Reading

- [API Documentation](./api-reference.md)
- [Component Structure](./component-structure.md)
- [Integration Points](./integrations.md)