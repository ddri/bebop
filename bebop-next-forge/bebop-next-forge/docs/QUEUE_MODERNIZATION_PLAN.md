# Queue Modernization Plan: Upstash Redis/Bull Implementation

## Overview
This document outlines the plan to migrate Bebop from node-cron to a production-grade queue system using Upstash Redis and Bull.

## Current State vs Target State

### Current Implementation
- **Scheduler**: node-cron in `/apps/app/lib/scheduler.ts`
- **Publishing**: Direct API calls from scheduler
- **Job Tracking**: In-memory (lost on restart)
- **Retry Logic**: Basic or none
- **Monitoring**: Limited visibility

### Target Architecture
- **Queue Storage**: Upstash Redis (managed, serverless)
- **Job Management**: Bull queues
- **Workers**: Separate processors per platform
- **Reliability**: Persistent jobs with automatic retries
- **Monitoring**: Full dashboard with metrics

## Architecture Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│ Bull Queues  │────▶│  Platform   │
│   API/UI    │     │  (Upstash)   │     │  Workers    │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  Job Types  │
                    ├─────────────┤
                    │ • publish   │
                    │ • schedule  │
                    │ • retry     │
                    │ • analytics │
                    └─────────────┘
```

## Implementation Phases

### Phase 1: Architecture & Setup (2 days)
1. Create new `packages/queue` package
2. Set up Upstash Redis account and credentials
3. Design job interfaces and types
4. Create base queue configuration

### Phase 2: Core Implementation (5 days)
1. Implement Redis client with Upstash
2. Set up Bull queues with proper configuration
3. Create job type definitions
4. Build error handling and retry logic

### Phase 3: Migration Strategy (3 days)
1. Run Bull queues in parallel with existing system
2. Create migration script for pending schedules
3. Implement feature flags for gradual rollout
4. Validate both systems produce same results

### Phase 4: Platform Workers (4 days)
1. Create worker for each platform (Hashnode, Dev.to, etc.)
2. Implement platform-specific retry logic
3. Add rate limiting per platform
4. Handle platform-specific errors

### Phase 5: Monitoring & Operations (2 days)
1. Build queue monitoring dashboard
2. Add health check endpoints
3. Implement alerting for failed jobs
4. Create job history viewer

## Key Technical Decisions

### Queue Structure
- **Single Queue with Routing**: One 'publish' queue that routes to platform workers
- **Benefits**: Unified monitoring, simpler rate limiting, easier debugging

### Job Retention Policy
- **Completed Jobs**: Keep for 24 hours
- **Failed Jobs**: Keep for 7 days
- **In-Progress**: No expiration (until completed/failed)

### Retry Strategy
```javascript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000  // 5s, 30s, 2m
  }
}
```

### Environment Configuration
```env
# Required environment variables
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=xxx
QUEUE_CONCURRENCY=10
ENABLE_QUEUE_UI=true
QUEUE_RETRY_ATTEMPTS=3
```

## Code Examples

### Job Type Definition
```typescript
// packages/queue/src/types.ts
export interface PublishJob {
  scheduleId: string;
  contentId: string;
  destinationId: string;
  platform: DestinationType;
  scheduledFor: Date;
  attempt?: number;
}

export interface JobResult {
  success: boolean;
  publishedUrl?: string;
  error?: string;
  retryable?: boolean;
  publishedAt?: Date;
}
```

### Queue Setup
```typescript
// packages/queue/src/client.ts
import { Redis } from '@upstash/redis';
import Bull from 'bull';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

export const publishQueue = new Bull('publish', {
  redis: redis as any,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});
```

### Worker Example
```typescript
// packages/queue/src/workers/hashnode.worker.ts
export async function processHashnodeJob(job: Bull.Job<PublishJob>) {
  const { contentId, destinationId, scheduleId } = job.data;
  
  try {
    // 1. Fetch content and destination
    const content = await db.content.findUnique({ where: { id: contentId }});
    const destination = await db.destination.findUnique({ where: { id: destinationId }});
    
    // 2. Transform content for platform
    const hashnodePost = transformForHashnode(content);
    
    // 3. Call platform API
    const result = await hashnodeClient.publish(hashnodePost);
    
    // 4. Update database
    await db.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedUrl: result.url
      }
    });
    
    // 5. Return result
    return {
      success: true,
      publishedUrl: result.url,
      publishedAt: new Date()
    };
  } catch (error) {
    // Determine if retryable
    if (error.code === 'RATE_LIMITED') {
      throw error; // Bull will retry with backoff
    }
    
    // Non-retryable error
    await db.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'FAILED',
        error: error.message
      }
    });
    
    return {
      success: false,
      error: error.message,
      retryable: false
    };
  }
}
```

## Success Metrics

1. **Reliability**
   - Zero lost jobs during server restart
   - 99.9% publish success rate (with retries)
   - Automatic recovery from transient failures

2. **Performance**
   - < 1s queue processing latency
   - Support for 1000+ concurrent schedules
   - Horizontal scaling capability

3. **Observability**
   - Real-time job status visibility
   - Historical success/failure rates
   - Platform-specific metrics

## Rollback Strategy

If issues arise during migration:

1. **Feature Flag Control**
   ```typescript
   if (flags.useQueueSystem) {
     await publishQueue.add(job);
   } else {
     await legacyScheduler.schedule(job);
   }
   ```

2. **Data Recovery**
   - All jobs persisted in Redis
   - Export tool to extract pending jobs
   - Script to re-queue in legacy system

3. **Zero Downtime**
   - Both systems run in parallel
   - Gradual traffic shifting
   - Monitor error rates

## Cost Analysis

### Upstash Pricing
- **Free Tier**: 10,000 commands/day
- **Expected Usage**: ~1,000 commands/day initially
- **Growth Projection**: $5-10/month at 10x scale

### Cost Breakdown
```
Per scheduled post:
- 1 command to add job
- 1 command to fetch job
- 1 command to complete job
- 2 commands for status checks
Total: ~5 commands per post
```

## Next Steps

1. Review and approve this plan
2. Set up Upstash account
3. Create `packages/queue` structure
4. Begin Phase 1 implementation

## References

- [Bull Documentation](https://github.com/OptimalBits/bull)
- [Upstash Redis](https://upstash.com/docs/redis)
- [Buffer Engineering: Queue Architecture](https://buffer.com/engineering)
- [Ghost Publishing Queue](https://ghost.org/docs/architecture)