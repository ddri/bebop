/**
 * Database Retry Logic - Usage Examples
 * 
 * This file demonstrates how to use the database retry functionality.
 * These are examples for documentation purposes.
 */

import { executeWithRetry, executeWithRetryAndErrorHandling, RetryConfig } from './db-utils';
import { prisma } from './prisma';

// Example 1: Basic retry for read operations
export async function exampleFetchTopicsWithRetry() {
  return executeWithRetry(
    () => prisma.topic.findMany({ orderBy: { createdAt: 'desc' } }),
    'fetch topics'
  );
}

// Example 2: Custom retry configuration for critical operations
export async function exampleCriticalOperation() {
  const criticalRetryConfig: Partial<RetryConfig> = {
    maxRetries: 5,           // More retries for critical operations
    baseDelayMs: 200,        // Longer initial delay
    maxDelayMs: 10000,       // Higher max delay
    retryableErrorTypes: ['connection', 'unknown'] // Only retry these types
  };

  return executeWithRetry(
    () => prisma.settings.findFirst(),
    'fetch critical settings',
    criticalRetryConfig
  );
}

// Example 3: Fast retry for health checks
export async function exampleHealthCheckWithQuickRetry() {
  const quickRetryConfig: Partial<RetryConfig> = {
    maxRetries: 2,
    baseDelayMs: 50,
    maxDelayMs: 500,
    retryableErrorTypes: ['connection']
  };

  return executeWithRetry(
    () => prisma.topic.count({ take: 1 }),
    'quick health check',
    quickRetryConfig
  );
}

// Example 4: API route with retry and error handling
export async function exampleApiRoutePattern() {
  const result = await executeWithRetryAndErrorHandling(
    () => prisma.topic.findMany(),
    'fetch topics for API'
  );

  if (!result.success) {
    // This would be returned as the API response
    return result.response;
  }

  // Success - use result.data
  return result.data;
}

// Example 5: Write operations - use retry sparingly
export async function exampleWriteOperation() {
  // For write operations, be more conservative with retries
  const writeRetryConfig: Partial<RetryConfig> = {
    maxRetries: 1,           // Only one retry for writes
    baseDelayMs: 100,
    retryableErrorTypes: ['connection'] // Only retry connection errors, not validation
  };

  return executeWithRetry(
    () => prisma.topic.create({
      data: { name: 'Example', content: 'Content', collectionIds: [] }
    }),
    'create topic',
    writeRetryConfig
  );
}

/**
 * Retry Configuration Guidelines:
 * 
 * READ OPERATIONS:
 * - Safe to retry multiple times
 * - Can retry both 'connection' and 'unknown' errors
 * - Use default config or increase retries for critical data
 * 
 * WRITE OPERATIONS:
 * - Be conservative with retries (max 1-2)
 * - Only retry 'connection' errors
 * - Avoid retrying 'validation' or 'constraint' errors
 * 
 * HEALTH CHECKS:
 * - Use fast, limited retries
 * - Lower delays and max delay caps
 * - Prevent false unhealthy status from transient issues
 * 
 * ERROR TYPES:
 * - 'connection': Network/DB connectivity issues (retryable)
 * - 'validation': Data validation errors (not retryable)
 * - 'constraint': Duplicate key, foreign key violations (not retryable)
 * - 'unknown': Unexpected errors (retryable with caution)
 */