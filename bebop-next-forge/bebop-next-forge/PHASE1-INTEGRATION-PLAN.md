# Phase 1 Integration Plan: Developer Platform Publishing

## Overview
This document outlines the implementation plan for integrating Hashnode, Dev.to, Bluesky, and Mastodon into Bebop's content orchestration platform.

## Implementation Steps

### Step 1: Schema Updates (Database Foundation)
**Goal:** Extend our data model to support platform-specific configurations and publishing metadata.

#### 1.1 Update Destination Model
```prisma
model Destination {
  // Existing fields...
  
  // Platform-specific configuration
  platformConfig    Json?     // Stores platform-specific settings
  apiCredentials    Json?     // Encrypted API keys/tokens
  
  // Platform metadata
  platformMetadata  Json?     // Instance URLs, publication IDs, etc.
  
  // Publishing history
  publishedContent  PublishedContent[]
}

model PublishedContent {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  scheduleId        String    @db.ObjectId
  schedule          Schedule  @relation(fields: [scheduleId], references: [id])
  destinationId     String    @db.ObjectId
  destination       Destination @relation(fields: [destinationId], references: [id])
  
  platformPostId    String?   // ID from the platform
  platformUrl       String?   // URL of published content
  publishedAt       DateTime  @default(now())
  platformResponse  Json?     // Full response from platform
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

#### 1.2 Update Schedule Model
```prisma
model Schedule {
  // Existing fields...
  
  // Platform-specific content adaptations
  platformContent   Json?     // Platform-specific versions of content
  
  // Publishing status
  publishedContent  PublishedContent[]
}
```

#### 1.3 Destination Type Updates
```prisma
enum DestinationType {
  // Existing types...
  HASHNODE
  DEVTO
  BLUESKY
  MASTODON
  // Keep others for future
}
```

### Step 2: Integration Architecture

#### 2.1 Create Package Structure
```
/packages/integrations/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Main exports
│   ├── types/                   # Shared types
│   │   ├── platform.ts          # Platform interfaces
│   │   └── content.ts           # Content adaptation types
│   ├── core/                    # Base classes
│   │   ├── platform-client.ts   # Abstract platform client
│   │   ├── content-adapter.ts   # Base content adapter
│   │   └── publisher.ts         # Publishing orchestrator
│   ├── platforms/               # Platform implementations
│   │   ├── hashnode/
│   │   │   ├── client.ts
│   │   │   ├── adapter.ts
│   │   │   └── types.ts
│   │   ├── devto/
│   │   ├── bluesky/
│   │   └── mastodon/
│   └── utils/                   # Shared utilities
│       ├── markdown.ts          # Markdown processing
│       ├── media.ts             # Image optimization
│       └── validation.ts        # Content validation
```

#### 2.2 Core Interfaces
```typescript
// types/platform.ts
export interface PlatformClient {
  authenticate(credentials: PlatformCredentials): Promise<void>;
  publish(content: AdaptedContent): Promise<PublishResult>;
  update(id: string, content: AdaptedContent): Promise<PublishResult>;
  delete(id: string): Promise<void>;
  getMetadata(): Promise<PlatformMetadata>;
}

export interface ContentAdapter {
  adaptContent(
    content: Content,
    options: AdaptationOptions
  ): Promise<AdaptedContent>;
  validateContent(content: AdaptedContent): ValidationResult;
  extractSocialTeaser(content: Content): string;
}
```

### Step 3: Hashnode Integration (First Platform)

#### 3.1 Implementation Priority
1. API client with authentication
2. Content adapter for Markdown/metadata
3. Publication/series management
4. Image upload handling
5. UI components for configuration

#### 3.2 Key Features
- API key management in settings
- Publication selector in destination setup
- Series creation/selection in content
- SEO metadata fields
- Cover image optimization

### Step 4: Progressive Platform Rollout

#### 4.1 Implementation Order
1. **Hashnode** (Week 1)
   - Most complex, sets patterns
   - Tests all edge cases
   
2. **Dev.to** (Week 2)
   - Similar to Hashnode
   - Simpler implementation
   
3. **Mastodon** (Week 3)
   - Different paradigm (federated)
   - Instance selection UI
   
4. **Bluesky** (Week 4)
   - Newest protocol
   - Threading complexity

#### 4.2 Each Platform Includes
- API client implementation
- Content adapter
- Platform-specific UI components
- Configuration management
- Error handling
- Testing suite

### Step 5: Publishing Queue System

#### 5.1 Queue Implementation
```typescript
// Simple in-memory queue initially
// Can upgrade to Redis/Bull later
export class PublishingQueue {
  async addToQueue(scheduleId: string): Promise<void>;
  async processQueue(): Promise<void>;
  async retryFailed(scheduleId: string): Promise<void>;
}
```

#### 5.2 Background Processing
- Cron job for scheduled publishing
- Retry logic for failures
- Status updates in real-time

### Step 6: Content Adaptation Engine

#### 6.1 Core Features
- Long-form to short-form extraction
- Platform-specific formatting
- Hashtag optimization
- Media handling
- Character limit enforcement

#### 6.2 Platform-Specific Adaptations
- Hashnode: Full Markdown, SEO
- Dev.to: Liquid tags, front matter
- Bluesky: Threading, 300 char limit
- Mastodon: CW handling, instance rules

## Success Criteria

### Phase 1 Complete When:
1. ✅ All four platforms integrated
2. ✅ Content publishes successfully
3. ✅ Platform-specific features work
4. ✅ Error handling is robust
5. ✅ UI is intuitive for solo creators

### Quality Metrics:
- No data loss during publishing
- Clear error messages
- Publishing success rate > 95%
- Configuration is straightforward

## Risk Mitigation

### Technical Risks:
1. **API Rate Limits**
   - Implement rate limiting
   - Queue management
   - User notifications

2. **API Changes**
   - Version checking
   - Graceful degradation
   - Update notifications

3. **Authentication Complexity**
   - Clear setup guides
   - Test authentication flow
   - Credential validation

### User Experience Risks:
1. **Configuration Overwhelm**
   - Progressive disclosure
   - Smart defaults
   - Setup wizards

2. **Platform Differences**
   - Clear platform indicators
   - Consistent UI patterns
   - Platform-specific help

## Timeline

### Week 1: Foundation
- Schema updates
- Integration architecture
- Core interfaces

### Week 2-3: Hashnode
- Full implementation
- Testing
- UI components

### Week 4-5: Dev.to + Mastodon
- Parallel development
- Shared components

### Week 6: Bluesky + Polish
- Final platform
- End-to-end testing
- Documentation

## Next Immediate Action
Begin with schema updates to establish the data foundation for platform integrations.