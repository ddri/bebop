import { WebhookEvent } from '@/lib/webhooks/types';

export function useWebhooks() {
  const triggerWebhook = async (event: WebhookEvent, data: Record<string, unknown>) => {
    try {
      // Send webhook trigger to backend
      await fetch('/api/webhooks/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data }),
      });
    } catch (error) {
      console.error('Failed to trigger webhook:', error);
    }
  };

  return {
    triggerWebhook,
  };
}