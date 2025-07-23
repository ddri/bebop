import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrorTypes: string[];
}

export interface DatabaseError {
  type: 'connection' | 'validation' | 'constraint' | 'unknown';
  code?: string;
  message: string;
  isRetryable: boolean;
  userMessage: string;
}

/**
 * Categorizes Prisma errors into actionable types
 */
export function categorizePrismaError(error: unknown): DatabaseError {
  // Prisma Client Initialization Error (connection issues)
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      type: 'connection',
      code: error.errorCode,
      message: error.message,
      isRetryable: true,
      userMessage: 'Database connection issue. Please try again in a moment.'
    };
  }

  // Prisma Client Known Request Error (query/data issues)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          type: 'constraint',
          code: error.code,
          message: error.message,
          isRetryable: false,
          userMessage: 'This item already exists. Please use a different name.'
        };
      
      case 'P2025':
        return {
          type: 'validation',
          code: error.code,
          message: error.message,
          isRetryable: false,
          userMessage: 'The requested item was not found.'
        };
      
      case 'P1001':
      case 'P1002':
      case 'P1008':
      case 'P1009':
        return {
          type: 'connection',
          code: error.code,
          message: error.message,
          isRetryable: true,
          userMessage: 'Database connection issue. Please try again in a moment.'
        };
      
      case 'P2003':
      case 'P2004':
        return {
          type: 'constraint',
          code: error.code,
          message: error.message,
          isRetryable: false,
          userMessage: 'This operation conflicts with existing data.'
        };
      
      default:
        return {
          type: 'validation',
          code: error.code,
          message: error.message,
          isRetryable: false,
          userMessage: 'Invalid data provided. Please check your input.'
        };
    }
  }

  // Prisma Client Unknown Request Error
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return {
      type: 'unknown',
      message: error.message,
      isRetryable: true,
      userMessage: 'An unexpected error occurred. Please try again.'
    };
  }

  // Prisma Client Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      type: 'validation',
      message: error.message,
      isRetryable: false,
      userMessage: 'Invalid data provided. Please check your input.'
    };
  }

  // Generic Error fallback
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return {
    type: 'unknown',
    message: errorMessage,
    isRetryable: false,
    userMessage: 'An unexpected error occurred. Please try again.'
  };
}

/**
 * Error response payload interface
 */
interface ErrorResponsePayload {
  error: string;
  type: DatabaseError['type'];
  isRetryable: boolean;
  debug?: {
    operation: string;
    code?: string;
    originalMessage: string;
  };
}

/**
 * Creates a standardized error response based on database error type
 */
export function createErrorResponse(
  error: unknown,
  operation: string,
  devMode: boolean = process.env.NODE_ENV === 'development'
): NextResponse {
  const dbError = categorizePrismaError(error);
  
  // Log full error details for debugging
  console.error(`Database error during ${operation}:`, {
    type: dbError.type,
    code: dbError.code,
    isRetryable: dbError.isRetryable,
    message: dbError.message
  });

  // Determine HTTP status code
  const statusCode = dbError.type === 'validation' || dbError.type === 'constraint' 
    ? 400 
    : dbError.type === 'connection' 
    ? 503 
    : 500;

  // Response payload
  const responsePayload: ErrorResponsePayload = {
    error: dbError.userMessage,
    type: dbError.type,
    isRetryable: dbError.isRetryable
  };

  // Include additional debugging info in development
  if (devMode) {
    responsePayload.debug = {
      operation,
      code: dbError.code,
      originalMessage: dbError.message
    };
  }

  return NextResponse.json(responsePayload, { status: statusCode });
}

/**
 * Default retry configuration for database operations
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  retryableErrorTypes: ['connection', 'unknown']
};

/**
 * Calculates retry delay with exponential backoff and jitter
 */
function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  const delayWithJitter = exponentialDelay + jitter;
  
  return Math.min(delayWithJitter, config.maxDelayMs);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executes a database operation with retry logic
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const result = await operation();
      
      // Log successful retry if this wasn't the first attempt
      if (attempt > 0) {
        console.info(`Database operation '${operationName}' succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      const dbError = categorizePrismaError(error);
      
      // Log the error attempt
      console.warn(`Database operation '${operationName}' failed on attempt ${attempt + 1}:`, {
        type: dbError.type,
        code: dbError.code,
        isRetryable: dbError.isRetryable,
        message: dbError.message
      });

      // Check if we should retry
      const shouldRetry = attempt < retryConfig.maxRetries && 
                         dbError.isRetryable && 
                         retryConfig.retryableErrorTypes.includes(dbError.type);

      if (!shouldRetry) {
        console.error(`Database operation '${operationName}' failed permanently after ${attempt + 1} attempts`);
        throw error;
      }

      // Calculate and apply retry delay
      const delay = calculateRetryDelay(attempt, retryConfig);
      console.info(`Retrying database operation '${operationName}' in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // This shouldn't be reached, but just in case
  throw lastError;
}

/**
 * Executes a database operation with error handling (no retry)
 */
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorResponse = createErrorResponse(error, operationName);
    return { success: false, response: errorResponse };
  }
}

/**
 * Executes a database operation with retry logic and error handling
 */
export async function executeWithRetryAndErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  retryConfig?: Partial<RetryConfig>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const data = await executeWithRetry(operation, operationName, retryConfig);
    return { success: true, data };
  } catch (error) {
    const errorResponse = createErrorResponse(error, operationName);
    return { success: false, response: errorResponse };
  }
}

/**
 * Database health check utility
 */
export async function checkDatabaseHealth() {
  const { prisma } = await import('./prisma');
  
  try {
    const startTime = Date.now();
    
    // Use retry logic for health check - transient failures shouldn't mark DB as unhealthy
    await executeWithRetry(
      () => prisma.topic.count({ take: 1 }),
      'database health check',
      { maxRetries: 2, baseDelayMs: 50 } // Faster retries for health checks
    );
    
    const latency = Date.now() - startTime;
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      latency: `${latency}ms`
    };
  } catch (error) {
    const dbError = categorizePrismaError(error);
    
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        type: dbError.type,
        code: dbError.code,
        isRetryable: dbError.isRetryable,
        message: dbError.message
      }
    };
  }
}