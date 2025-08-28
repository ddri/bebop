// Analytics-specific error types for better error handling

export class AnalyticsError extends Error {
  constructor(message: string, public code?: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export class MetricsNotFoundError extends AnalyticsError {
  constructor(message: string = 'Metrics not found') {
    super(message, 'METRICS_NOT_FOUND', 404);
    this.name = 'MetricsNotFoundError';
  }
}

export class InvalidDateRangeError extends AnalyticsError {
  constructor(message: string = 'Invalid date range provided') {
    super(message, 'INVALID_DATE_RANGE', 400);
    this.name = 'InvalidDateRangeError';
  }
}

export class AggregationError extends AnalyticsError {
  constructor(message: string, originalError?: Error) {
    super(`Aggregation failed: ${message}${originalError ? ` - ${originalError.message}` : ''}`, 'AGGREGATION_FAILED');
    this.name = 'AggregationError';
  }
}

export class TrackingError extends AnalyticsError {
  constructor(message: string = 'Failed to track analytics event') {
    super(message, 'TRACKING_FAILED', 400);
    this.name = 'TrackingError';
  }
}

export class CacheError extends AnalyticsError {
  constructor(message: string = 'Cache operation failed') {
    super(message, 'CACHE_ERROR', 500);
    this.name = 'CacheError';
  }
}

// Error handler utility for analytics routes
export function handleAnalyticsError(error: unknown): { 
  error: string; 
  code?: string; 
  statusCode: number 
} {
  if (error instanceof AnalyticsError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500
    };
  }

  return {
    error: 'An unexpected error occurred',
    statusCode: 500
  };
}

// Validation helpers
export function validateDateRange(startDate: Date, endDate: Date): void {
  if (startDate >= endDate) {
    throw new InvalidDateRangeError('Start date must be before end date');
  }

  const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year
  if (endDate.getTime() - startDate.getTime() > maxRange) {
    throw new InvalidDateRangeError('Date range cannot exceed 1 year');
  }

  const futureLimit = new Date();
  futureLimit.setDate(futureLimit.getDate() + 1);
  if (endDate > futureLimit) {
    throw new InvalidDateRangeError('End date cannot be in the future');
  }
}

export function validateMetricsType(type: string): void {
  const validTypes = ['dashboard', 'content', 'campaign'];
  if (!validTypes.includes(type)) {
    throw new AnalyticsError(`Invalid metrics type: ${type}. Must be one of: ${validTypes.join(', ')}`, 'INVALID_TYPE', 400);
  }
}

export function validateContentId(contentId: string): void {
  if (!contentId || typeof contentId !== 'string' || contentId.length < 10) {
    throw new AnalyticsError('Valid content ID is required', 'INVALID_CONTENT_ID', 400);
  }
}

export function validateCampaignId(campaignId: string): void {
  if (!campaignId || typeof campaignId !== 'string' || campaignId.length < 10) {
    throw new AnalyticsError('Valid campaign ID is required', 'INVALID_CAMPAIGN_ID', 400);
  }
}