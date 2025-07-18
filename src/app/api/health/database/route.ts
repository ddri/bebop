import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db-utils';

/**
 * Database health check endpoint
 * GET /api/health/database
 */
export async function GET() {
  const health = await checkDatabaseHealth();
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}