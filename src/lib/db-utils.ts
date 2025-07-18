import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

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
  const responsePayload: any = {
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
 * Executes a database operation with error handling
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
 * Database health check utility
 */
export async function checkDatabaseHealth() {
  const { prisma } = await import('./prisma');
  
  try {
    const startTime = Date.now();
    
    // Simple query to check MongoDB connection - just count one collection
    await prisma.topic.count({ take: 1 });
    
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