import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    bebopAnalytics?: {
      track: (event: string, data?: Record<string, unknown>) => void;
      trackContentView: (contentId: string, title: string) => void;
      trackShare: (contentId: string, platform: string) => void;
    };
  }
}

export function useAnalytics() {
  // Load analytics script on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if script already loaded
    if (document.querySelector('script[data-bebop-analytics]')) return;
    
    const script = document.createElement('script');
    script.src = '/api/analytics/track';
    script.async = true;
    script.setAttribute('data-bebop-analytics', 'true');
    document.head.appendChild(script);
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  // Track custom event
  const track = useCallback((event: string, data?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.bebopAnalytics) {
      window.bebopAnalytics.track(event, data);
    }
  }, []);
  
  // Track content view
  const trackContentView = useCallback((contentId: string, title: string) => {
    if (typeof window !== 'undefined' && window.bebopAnalytics) {
      window.bebopAnalytics.trackContentView(contentId, title);
    }
  }, []);
  
  // Track share
  const trackShare = useCallback((contentId: string, platform: string) => {
    if (typeof window !== 'undefined' && window.bebopAnalytics) {
      window.bebopAnalytics.trackShare(contentId, platform);
    }
  }, []);
  
  // Track goal conversion
  const trackGoal = useCallback((goalType: string, value?: number) => {
    track('campaign.goal', { goalType, value });
  }, [track]);
  
  return {
    track,
    trackContentView,
    trackShare,
    trackGoal
  };
}