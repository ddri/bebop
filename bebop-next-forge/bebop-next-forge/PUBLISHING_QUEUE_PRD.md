# Publishing Queue System - Simple Solo Writer Solution

## Executive Summary

This PRD outlines a simple, lightweight publishing queue system for Bebop designed for solo content writers. The system focuses on scheduled content publication across multiple platforms with minimal complexity and infrastructure overhead.

## Problem Statement

As a solo content writer, you need:
- Schedule content for future publication across 4 platforms (Hashnode, Dev.to, Bluesky, Mastodon)
- Simple retry mechanism for failed posts
- Basic monitoring of what published successfully
- Minimal setup and maintenance overhead

## Goals and Objectives

### Primary Goals
1. **Simplicity**: Easy to set up and maintain without complex infrastructure
2. **Reliability**: Posts publish when scheduled with basic retry for failures
3. **Visibility**: Clear status of what's scheduled, published, or failed
4. **Low Maintenance**: Works reliably without constant monitoring

## Research Findings

### Industry Analysis

#### WordPress Approach
- **WP-Cron**: Event-based system triggered by page loads
- **Action Scheduler**: Database-backed queue system handling 50,000+ jobs
- **Limitations**: Traffic dependency, race conditions on high-traffic sites
- **Best Practice**: Disable WP-Cron, use server-side cron for reliability

#### Ghost CMS Architecture
- **Internal Node.js**: Background task handling without exposed queue system
- **Scheduled Posts**: Built-in feature with timezone-aware publishing
- **Performance**: Optimized for content-heavy sites with minimal overhead
- **Key Insight**: Simple, focused approach without over-engineering

#### Headless CMS Patterns (Contentful/Strapi)
- **Webhook-Driven**: Event-based architecture for real-time updates
- **API-First**: Content as a Service (CaaS) with multiple presentation layers
- **Lifecycle Hooks**: Automated workflows for content state changes
- **Integration**: Seamless connection with external services

#### Social Media Schedulers (Buffer/Hootsuite)
- **Redis + Bull/BullMQ**: Industry standard for Node.js queue processing
- **Delayed Jobs**: Timestamp-based scheduling using Redis sorted sets
- **Concurrency Control**: Rate limiting and job distribution across workers
- **Horizontal Scaling**: Multiple workers processing from shared Redis instance

## Technical Architecture

### Simple Technology Stack
- **Queue Engine**: Node.js `node-cron` (simple cron-based scheduling)
- **Database**: MongoDB only (no Redis needed)
- **Processing**: Single background process checking every minute
- **Monitoring**: Simple UI showing scheduled/published status

### Core Components

#### 1. Scheduler Service (`apps/app/lib/scheduler.ts`)
```typescript
interface SchedulerService {
  checkPendingJobs(): Promise<void>
  publishNow(scheduleId: string): Promise<void>
  retryFailed(scheduleId: string): Promise<void>
}
```

#### 2. Simple Cron Job
```typescript
// Runs every minute to check for scheduled posts
cron.schedule('* * * * *', async () => {
  await schedulerService.checkPendingJobs();
});
```

#### 3. Platform Adapters (Existing)
- Use existing platform integrations (Hashnode, Dev.to, Bluesky, Mastodon)
- Add simple retry logic (2-3 attempts)
- Basic error logging

### Simple Architecture

#### Job States (in existing Schedule model)
- `pending`: Waiting to be published
- `publishing`: Currently attempting to publish
- `published`: Successfully published
- `failed`: Failed after retries

#### Processing Logic
1. Check database every minute for schedules where `scheduledAt <= now()`
2. For each pending schedule, attempt to publish to all destinations
3. Update status based on results
4. Retry failed jobs up to 3 times with 5-minute delays

### Error Handling & Retry Strategy

#### Simple Retry Logic
1. **3 Attempts Total**: If a platform fails, retry up to 3 times
2. **5 Minute Delays**: Wait 5 minutes between retry attempts
3. **Log Errors**: Store error messages in schedule record for debugging
4. **Manual Retry**: UI button to manually retry failed schedules

#### Error Handling
- **Network Errors**: Automatic retry
- **Auth Errors**: Mark as failed, show in UI for user to fix credentials
- **Content Errors**: Mark as failed, show error message

### Simple Monitoring

#### Basic Status Tracking
- Count of pending, published, and failed schedules
- Last error message for failed schedules
- Simple status page showing recent activity

#### UI Features
- Scheduled posts list with status indicators
- Failed posts with retry buttons
- Basic success/failure counts

## Database Schema (Uses Existing Models)

### Enhanced Schedule Model
```typescript
// Add these fields to existing Schedule model
interface Schedule {
  // existing fields...
  status: 'pending' | 'publishing' | 'published' | 'failed';
  attempts: number;
  lastError?: string;
  publishedAt?: Date;
  lastAttemptAt?: Date;
}
```

### Simple Storage
- Use existing MongoDB database
- No additional infrastructure needed
- Store retry attempts and errors in schedule records

## Implementation Plan

### Phase 1: Basic Scheduler (3 days)
1. Install `node-cron` package
2. Create simple scheduler service
3. Add status fields to Schedule model
4. Basic cron job to check pending schedules

### Phase 2: Publishing Logic (2 days)
1. Connect scheduler to existing platform integrations
2. Add retry logic and error handling
3. Update schedule status after publishing attempts
4. Test with one platform first

### Phase 3: UI Updates (2 days)
1. Add status indicators to schedule list
2. Add manual retry buttons for failed posts
3. Simple status dashboard
4. Error message display

### Phase 4: Polish (1 day)
1. Test all platforms
2. Add basic logging
3. Documentation
4. Deploy and monitor

## Risk Mitigation

### Simple Risks
- **Cron Job Failure**: Use PM2 or similar to keep process running
- **Database Issues**: Basic error logging to diagnose problems
- **Platform API Changes**: Monitor errors and update integrations as needed

### Operational Risks
- **Rate Limits**: Space out publishing attempts, handle rate limit errors gracefully
- **Auth Issues**: Clear error messages for expired tokens
- **Server Downtime**: Failed jobs will be retried automatically when server restarts

## Success Metrics

### Simple Goals
- **Reliability**: Posts publish within 5 minutes of scheduled time
- **User Experience**: Clear status of what's scheduled vs published
- **Error Handling**: Failed posts are visible with retry option
- **Maintenance**: System works reliably without daily monitoring

## Future Enhancements (If Needed)

### Nice-to-Have Features
- Bulk retry for multiple failed posts
- Better error categorization
- Optional email notifications for failures
- Simple analytics on posting patterns

## Conclusion

This simple publishing queue system will provide reliable scheduled posting for solo content creators without the complexity of enterprise solutions. The focus is on:

1. **Minimal Setup**: Uses existing database and simple Node.js cron
2. **Reliable Publishing**: 3 retry attempts with clear error visibility  
3. **Easy Maintenance**: Simple UI to see and retry failed posts
4. **Quick Implementation**: 8 days total vs 6 weeks for enterprise solution

Perfect for solo writers who need reliable scheduling without operational overhead.