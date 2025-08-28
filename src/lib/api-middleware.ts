import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from './auth';

type ApiContext = {
  params?: Record<string, string | string[]>;
  searchParams?: URLSearchParams;
};

type ApiHandler = (request: NextRequest, context?: ApiContext) => Promise<NextResponse>;

/**
 * Higher-order function to add authentication to API routes
 * Usage: export const GET = withAuth(async (request) => { ... });
 */
export function withAuth(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: ApiContext) => {
    // Check authentication
    const authResult = await authenticateRequest();
    if (authResult.error) {
      return authResult.error;
    }

    // Add userId to request for use in handlers
    (request as NextRequest & { userId: string }).userId = authResult.userId;
    
    return handler(request, context);
  };
}

/**
 * Higher-order function for API routes that need basic input validation
 */
export function withValidation<T>(
  handler: (request: NextRequest, body: T, context?: ApiContext) => Promise<NextResponse>,
  requiredFields: (keyof T)[]
): ApiHandler {
  return async (request: NextRequest, context?: ApiContext) => {
    try {
      const body = await request.json();
      
      // Check required fields
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json(
            { error: `${String(field)} is required` },
            { status: 400 }
          );
        }
      }
      
      return handler(request, body, context);
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
  };
}

/**
 * Combine authentication and validation
 */
export function withAuthAndValidation<T>(
  handler: (request: NextRequest, body: T, userId: string, context?: ApiContext) => Promise<NextResponse>,
  requiredFields: (keyof T)[]
): ApiHandler {
  return withAuth(
    withValidation<T>(
      async (request: NextRequest, body: T, context?: ApiContext) => {
        const userId = (request as NextRequest & { userId: string }).userId;
        return handler(request, body, userId, context);
      },
      requiredFields
    )
  );
}

/**
 * Standard error responses
 */
export const ErrorResponses = {
  unauthorized: () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  badRequest: (message: string) => NextResponse.json({ error: message }, { status: 400 }),
  notFound: (resource: string) => NextResponse.json({ error: `${resource} not found` }, { status: 404 }),
  serverError: (message: string = 'Internal server error') => NextResponse.json({ error: message }, { status: 500 }),
}; 