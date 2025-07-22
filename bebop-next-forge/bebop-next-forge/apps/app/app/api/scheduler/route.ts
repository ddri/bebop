import { NextRequest, NextResponse } from 'next/server';
import { scheduler } from '../../../lib/scheduler';
import { database } from '@repo/database';
import { ScheduleStatus } from '@repo/database/types';

export async function POST(request: NextRequest) {
  try {
    const { action, scheduleId } = await request.json();

    switch (action) {
      case 'publishNow':
        if (!scheduleId) {
          return NextResponse.json(
            { error: 'scheduleId is required for publishNow action' },
            { status: 400 }
          );
        }
        await scheduler.publishNow(scheduleId);
        return NextResponse.json({ success: true, message: 'Published successfully' });

      case 'retry':
        if (!scheduleId) {
          return NextResponse.json(
            { error: 'scheduleId is required for retry action' },
            { status: 400 }
          );
        }
        await scheduler.retryFailed(scheduleId);
        return NextResponse.json({ success: true, message: 'Retry initiated' });

      case 'retrySchedule':
        if (!scheduleId) {
          return NextResponse.json(
            { error: 'scheduleId is required for retrySchedule action' },
            { status: 400 }
          );
        }
        await scheduler.retryFailed(scheduleId);
        return NextResponse.json({ success: true, message: 'Schedule retry initiated' });

      case 'cancelSchedule':
        if (!scheduleId) {
          return NextResponse.json(
            { error: 'scheduleId is required for cancelSchedule action' },
            { status: 400 }
          );
        }
        // Update schedule status to cancelled
        await database.schedule.update({
          where: { id: scheduleId },
          data: { 
            status: ScheduleStatus.FAILED,
            error: 'Cancelled by user',
            updatedAt: new Date()
          }
        });
        return NextResponse.json({ success: true, message: 'Schedule cancelled' });

      case 'checkPending':
        await scheduler.checkPendingJobs();
        return NextResponse.json({ success: true, message: 'Checked pending jobs' });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: publishNow, retry, retrySchedule, cancelSchedule, or checkPending' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check endpoint
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'health') {
      // Get scheduler status and statistics
      const stats = await database.schedule.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      const recentActivity = await database.schedule.findMany({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        select: {
          id: true,
          status: true,
          publishAt: true,
          publishedAt: true,
          attempts: true,
          error: true,
          content: {
            select: { title: true }
          },
          destination: {
            select: { name: true, type: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      });

      const pendingCount = stats.find(s => s.status === ScheduleStatus.PENDING)?._count.status || 0;
      const publishedCount = stats.find(s => s.status === ScheduleStatus.PUBLISHED)?._count.status || 0;
      const failedCount = stats.find(s => s.status === ScheduleStatus.FAILED)?._count.status || 0;
      const publishingCount = stats.find(s => s.status === ScheduleStatus.PUBLISHING)?._count.status || 0;

      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        statistics: {
          pending: pendingCount,
          publishing: publishingCount,
          published: publishedCount,
          failed: failedCount,
          total: stats.reduce((sum, s) => sum + s._count.status, 0)
        },
        recentActivity
      });
    }

    return NextResponse.json({
      message: 'Publishing Scheduler API',
      actions: ['publishNow', 'retry', 'retrySchedule', 'cancelSchedule', 'checkPending'],
      usage: 'POST with action and optional scheduleId',
      health: 'GET /api/scheduler?action=health'
    });
  } catch (error) {
    console.error('Scheduler GET error:', error);
    return NextResponse.json({ 
      error: 'Health check failed', 
      details: String(error) 
    }, { status: 500 });
  }
}