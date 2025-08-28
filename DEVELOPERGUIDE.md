# 🛠️ Bebop Developer Guide

This guide contains all technical documentation for developers working with Bebop, including architecture details, API reference, and platform integration setup.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Platform Integrations Setup](#platform-integrations-setup)
  - [Hashnode](#hashnode-setup)
  - [Dev.to](#devto-setup)
  - [Beehiiv](#beehiiv-setup)
  - [Bluesky](#bluesky-setup)
  - [Mastodon](#mastodon-setup)
- [Testing](#testing)
- [Deployment](#deployment)

## Architecture Overview

Bebop is a Next.js 15 application with React 19, using MongoDB for data persistence and Clerk for authentication.

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Clerk
- **Storage**: AWS S3 (optional) or local filesystem
- **Analytics**: Privacy-first custom implementation

### Data Flow

```
User Input → React Components → API Routes → Prisma ORM → MongoDB
                    ↓                ↓
              Client Hooks    External APIs (GitHub, Dev.to, etc.)
```

### Key Directories

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/              # Business logic and utilities
├── hooks/            # Custom React hooks
└── types/            # TypeScript definitions
```

## Development Setup

### Prerequisites

- Node.js 18.17 or later
- MongoDB (local or Atlas)
- Git

### Environment Variables

Create `.env.local` in the root directory:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/bebop"

# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# AWS S3 (Optional - for media storage)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Platform APIs (Optional - add as needed)
GITHUB_TOKEN=""
DEVTO_API_KEY=""
HASHNODE_API_KEY=""
HASHNODE_PUBLICATION_ID=""
```

### Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to MongoDB
npx prisma db push

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev              # Development server (port 3000)
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint
npm test                 # Run tests
npm run test:smoke       # Smoke tests only
npm run test:quick       # Quick test summary
npx prisma studio        # Database GUI
```

## API Reference

### Core API Endpoints

#### Topics (Content Management)

```typescript
// GET /api/topics - List all topics
// POST /api/topics - Create new topic
// GET /api/topics/[id] - Get single topic
// PUT /api/topics/[id] - Update topic
// DELETE /api/topics/[id] - Delete topic
```

#### Campaigns

```typescript
// GET /api/campaigns - List campaigns
// POST /api/campaigns - Create campaign
// GET /api/campaigns/[id] - Get campaign details
// PUT /api/campaigns/[id] - Update campaign
// DELETE /api/campaigns/[id] - Delete campaign
```

#### Publishing

```typescript
// POST /api/publish - Publish to platforms
// POST /api/publishing-plans - Create scheduled publication
// POST /api/publishing-plans/process-scheduled - Process due items
// POST /api/scheduler/trigger - Manual scheduler trigger
```

#### Analytics

```typescript
// POST /api/analytics/track - Track events
// GET /api/analytics/metrics - Get analytics data
```

#### Media

```typescript
// GET /api/media - List media files
// POST /api/media - Upload media
// DELETE /api/media/[id] - Delete media
// POST /api/media/sync - Sync S3 media
```

### Authentication

All API routes use Clerk authentication middleware. Include authorization headers:

```typescript
const response = await fetch('/api/topics', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Database Schema

### Core Models

```prisma
model User {
  id              String @id @default(auto()) @map("_id") @db.ObjectId
  clerkId         String @unique
  email           String
  topics          Topic[]
  campaigns       Campaign[]
  media           Media[]
  settings        Json?
}

model Topic {
  id              String @id @default(auto()) @map("_id") @db.ObjectId
  title           String
  content         String
  description     String?
  tags            String[]
  status          String @default("draft")
  userId          String @db.ObjectId
  user            User @relation(fields: [userId], references: [id])
  campaignIds     String[] @db.ObjectId
  campaigns       Campaign[] @relation(fields: [campaignIds], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Campaign {
  id              String @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  description     String?
  status          String @default("draft")
  goals           String[]
  userId          String @db.ObjectId
  user            User @relation(fields: [userId], references: [id])
  topicIds        String[] @db.ObjectId
  topics          Topic[] @relation(fields: [topicIds], references: [id])
  publishingPlans PublishingPlan[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model PublishingPlan {
  id              String @id @default(auto()) @map("_id") @db.ObjectId
  campaignId      String @db.ObjectId
  campaign        Campaign @relation(fields: [campaignId], references: [id])
  topicId         String @db.ObjectId
  platform        String
  scheduledFor    DateTime
  status          String @default("scheduled")
  publishedUrl    String?
  error           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## Platform Integrations Setup

### Hashnode Setup

1. **Get Your API Token**
   - Log in to [Hashnode](https://hashnode.com)
   - Go to [Account Settings → Developer](https://hashnode.com/settings/developer)
   - Click "Generate New Token"
   - Copy the token

2. **Get Your Publication ID**
   - Visit your Hashnode blog
   - The URL format is: `yourblog.hashnode.dev` or custom domain
   - Go to Blog Dashboard → Settings
   - Find your Publication ID in the URL or settings

3. **Configure in Bebop**
   - Go to Settings → Integrations → Hashnode
   - Enter your API Token
   - Enter your Publication ID
   - Click "Test Connection"
   - Save configuration

4. **Publishing Options**
   - **Draft**: Save as draft on Hashnode
   - **Published**: Publish immediately
   - **Tags**: Automatically synced from your topics
   - **Cover Image**: First image in content used as cover

### Dev.to Setup

1. **Get Your API Key**
   - Log in to [Dev.to](https://dev.to)
   - Go to [Settings → Extensions](https://dev.to/settings/extensions)
   - Scroll to "DEV API Keys"
   - Generate new key with description "Bebop"
   - Copy the API key

2. **Configure in Bebop**
   - Go to Settings → Integrations → Dev.to
   - Enter your API Key
   - Click "Test Connection"
   - Save configuration

3. **Publishing Options**
   - **Draft**: Creates unpublished article
   - **Published**: Publishes immediately
   - **Series**: Can be linked to Dev.to series
   - **Tags**: Up to 4 tags, auto-formatted
   - **Canonical URL**: Set to maintain SEO

### Beehiiv Setup

1. **Get Your API Key**
   - Log in to [Beehiiv](https://app.beehiiv.com)
   - Go to Settings → API
   - Click "Create API Key"
   - Name it "Bebop Integration"
   - Copy the API key

2. **Get Your Publication ID**
   - In Beehiiv dashboard, go to your publication settings
   - The Publication ID starts with `pub_` and can be found in:
     - Publication settings URL
     - API documentation for your publication
     - Browser developer tools when viewing your publication

3. **Configure in Bebop**
   - Go to Settings → Beehiiv Integration
   - Enter your API Key
   - Enter your Publication ID (format: `pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - Click "Test Connection"
   - Save configuration

4. **Publishing Features**
   - **Newsletter Posts**: Creates newsletter posts directly
   - **Draft/Published**: Control publication status
   - **Rich Content**: Full HTML content support
   - **Subtitles**: Optional post descriptions

5. **Requirements**
   - **Enterprise Plan**: Post creation API requires Beehiiv Enterprise
   - **Beta API**: Feature is in beta and subject to change
   - **Rate Limits**: Respect Beehiiv's API rate limits

### Bluesky Setup

1. **Get App Password**
   - Log in to [Bluesky](https://bsky.app)
   - Go to Settings → App Passwords
   - Click "Add App Password"
   - Name it "Bebop"
   - Copy the generated password

2. **Configure in Bebop**
   - Go to Settings → Integrations → Bluesky
   - Enter your handle (e.g., `yourname.bsky.social`)
   - Enter the app password
   - Click "Test Connection"
   - Save configuration

3. **Publishing Features**
   - **Thread Support**: Long content auto-threaded
   - **Mentions**: Auto-linked @mentions
   - **Links**: Automatic link cards
   - **Images**: Up to 4 images per post

### Mastodon Setup

1. **Get Access Token**
   - Log in to your Mastodon instance
   - Go to Settings → Development
   - Click "New Application"
   - Name: "Bebop"
   - Scopes: `read`, `write:statuses`, `write:media`
   - Save and copy the access token

2. **Configure in Bebop**
   - Go to Settings → Integrations → Mastodon
   - Enter your instance URL (e.g., `https://mastodon.social`)
   - Enter your access token
   - Click "Test Connection"
   - Save configuration

3. **Publishing Features**
   - **Content Warnings**: Optional CW support
   - **Visibility**: Public, unlisted, followers-only
   - **Polls**: Create polls (if instance supports)
   - **Media**: Images with alt text

## Testing

### Test Structure

```
src/__tests__/
├── smoke/              # Quick smoke tests
│   ├── api.smoke.test.ts
│   ├── components.smoke.test.tsx
│   └── scheduler.smoke.test.ts
├── integration/        # Full integration tests
└── unit/              # Unit tests
```

### Running Tests

```bash
# All tests
npm test

# Smoke tests only
npm run test:smoke

# With UI
npm run test:ui

# Test specific file
npm test -- api.smoke.test.ts

# Test coverage
npm test -- --coverage
```

### Writing Tests

```typescript
// Example smoke test
import { describe, it, expect } from 'vitest';

describe('Publishing API', () => {
  it('creates publishing plan', async () => {
    const response = await fetch('/api/publishing-plans', {
      method: 'POST',
      body: JSON.stringify({
        campaignId: 'test-campaign',
        topicId: 'test-topic',
        platform: 'devto',
        scheduledFor: new Date()
      })
    });
    
    expect(response.ok).toBe(true);
  });
});
```

## Deployment

### Vercel Deployment

1. **Fork & Connect**
   ```bash
   # Fork the repo, then in Vercel:
   - Import Git Repository
   - Select your fork
   - Configure environment variables
   - Deploy
   ```

2. **Environment Variables**
   - Add all variables from `.env.local`
   - Set `NODE_ENV=production`
   - Configure domain settings

3. **Post-Deployment**
   - Verify MongoDB connection
   - Test Clerk authentication
   - Check platform integrations

### Self-Hosting

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Using PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "bebop" -- start
   pm2 save
   pm2 startup
   ```

3. **Using Docker**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

   ```bash
   docker build -t bebop .
   docker run -p 3000:3000 --env-file .env.local bebop
   ```

### Production Checklist

- [ ] Set strong session secrets
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup strategy
- [ ] Use MongoDB replica set
- [ ] Set up SSL/TLS
- [ ] Configure CDN for media

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB is running
mongosh --eval "db.version()"

# Verify connection string
mongodb://localhost:27017/bebop
```

**Clerk Authentication Issues**
- Verify API keys are correct
- Check allowed origins in Clerk dashboard
- Ensure webhook endpoints are configured

**Platform Publishing Fails**
- Verify API keys/tokens are valid
- Check rate limits
- Review platform-specific requirements
- Check error logs in PublishingPlan records

**Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Support

- **Issues**: [GitHub Issues](https://github.com/ddri/bebop/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ddri/bebop/discussions)

---

**Last Updated**: December 2024 | **Bebop Version**: 0.4.0