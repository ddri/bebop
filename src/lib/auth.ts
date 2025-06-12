import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function authenticateRequest() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        ),
        userId: null
      };
    }
    
    return {
      error: null,
      userId
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      ),
      userId: null
    };
  }
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
} 