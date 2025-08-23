// lib/scheduler.ts
/**
 * Simple in-memory scheduler for processing scheduled publications
 * In production, this would be replaced with a proper job queue like Bull, Agenda, or external service
 */

class PublishingScheduler {
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL = 60000; // Check every minute

  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting publishing scheduler...');

    this.interval = setInterval(async () => {
      try {
        await this.processScheduledPublications();
      } catch (error) {
        console.error('Error in scheduled publication processing:', error);
      }
    }, this.POLL_INTERVAL);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('Publishing scheduler stopped');
  }

  private async processScheduledPublications() {
    try {
      // In development/testing, we might not want to process automatically
      if (process.env.NODE_ENV === 'development') {
        return;
      }

      const response = await fetch(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3007'}/api/publishing-plans/process-scheduled`,
        { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.processed > 0) {
          console.log(`Processed ${result.processed} scheduled publications`);
        }
      } else {
        console.error('Failed to process scheduled publications:', response.status);
      }
    } catch (error) {
      console.error('Error calling process-scheduled endpoint:', error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      pollInterval: this.POLL_INTERVAL
    };
  }
}

// Export a singleton instance
export const scheduler = new PublishingScheduler();

// Auto-start in production (disabled in development for testing)
if (process.env.NODE_ENV === 'production') {
  scheduler.start();
}