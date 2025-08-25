// API endpoint for tracking analytics events
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AnalyticsService } from '@/lib/analytics/analytics-service';
import { AnalyticsEventType } from '@/lib/analytics/types';

const analyticsService = new AnalyticsService();

// POST /api/analytics/track - Track an analytics event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Parse visitor information from headers (privacy-safe)
    const userAgent = req.headers.get('user-agent') || undefined;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               undefined;
    
    // Generate privacy-safe IDs
    const visitorId = analyticsService.generateVisitorId(userAgent, ip);
    const sessionId = body.sessionId || analyticsService.generateSessionId();
    
    // Detect device and location
    const device = analyticsService.detectDevice(userAgent);
    const geo = analyticsService.parseGeoLocation(req.headers);
    
    // Create analytics event
    const event = {
      eventType: body.event as AnalyticsEventType || 'page.view',
      contentId: body.contentId,
      campaignId: body.campaignId,
      platform: body.platform,
      sessionId,
      visitorId,
      metadata: body.data || {},
      device,
      geo,
      timestamp: new Date()
    };
    
    // Store in database
    await prisma.analyticsEvent.create({
      data: {
        eventType: event.eventType,
        contentId: event.contentId,
        campaignId: event.campaignId,
        platform: event.platform,
        sessionId: event.sessionId,
        visitorId: event.visitorId,
        metadata: event.metadata,
        device: event.device,
        geo: event.geo,
        timestamp: event.timestamp
      }
    });
    
    // Return session ID for client to maintain session
    return NextResponse.json({ 
      success: true,
      sessionId 
    });
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't return errors to avoid breaking user experience
    return NextResponse.json({ success: false });
  }
}

// GET /api/analytics/track - Get tracking script
export async function GET() {
  // Return the analytics tracking script
  const script = `
(function() {
  const bebopAnalytics = {
    sessionId: null,
    
    init: function() {
      this.sessionId = this.getSessionId();
      this.trackPageView();
      this.setupEventListeners();
    },
    
    getSessionId: function() {
      const stored = sessionStorage.getItem('bebop_session');
      if (stored) return stored;
      
      const newId = this.generateId();
      sessionStorage.setItem('bebop_session', newId);
      return newId;
    },
    
    generateId: function() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    track: function(event, data) {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: event,
          sessionId: this.sessionId,
          data: {
            ...data,
            url: window.location.href,
            referrer: document.referrer,
            title: document.title
          },
          timestamp: Date.now()
        })
      }).catch(() => {}); // Fail silently
    },
    
    trackPageView: function() {
      this.track('page.view', {
        path: window.location.pathname,
        search: window.location.search
      });
    },
    
    trackContentView: function(contentId, title) {
      const startTime = Date.now();
      let maxScroll = 0;
      
      // Track scroll depth
      const trackScroll = () => {
        const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        maxScroll = Math.max(maxScroll, scrollPercentage);
      };
      
      window.addEventListener('scroll', trackScroll);
      
      // Track read time
      const trackRead = () => {
        const readTime = Math.floor((Date.now() - startTime) / 1000);
        
        // Consider it a "read" after 10 seconds
        if (readTime >= 10 && !this.hasTrackedRead) {
          this.hasTrackedRead = true;
          this.track('content.read', { contentId, title, readTime });
        }
        
        // Track completion at 80% scroll depth
        if (maxScroll >= 80 && !this.hasTrackedComplete) {
          this.hasTrackedComplete = true;
          this.track('content.complete', { 
            contentId, 
            title, 
            readTime,
            scrollDepth: maxScroll 
          });
        }
      };
      
      // Check read status every 5 seconds
      setInterval(trackRead, 5000);
      
      // Track when leaving
      window.addEventListener('beforeunload', () => {
        const readTime = Math.floor((Date.now() - startTime) / 1000);
        this.track('content.exit', { 
          contentId, 
          title, 
          readTime, 
          scrollDepth: maxScroll 
        });
      });
      
      // Initial content view
      this.track('content.view', { contentId, title });
    },
    
    trackShare: function(contentId, platform) {
      this.track('content.share', { contentId, shareTarget: platform });
    },
    
    setupEventListeners: function() {
      // Track share button clicks
      document.addEventListener('click', (e) => {
        const shareBtn = e.target.closest('[data-analytics-share]');
        if (shareBtn) {
          const contentId = shareBtn.getAttribute('data-content-id');
          const platform = shareBtn.getAttribute('data-platform');
          this.trackShare(contentId, platform);
        }
      });
    }
  };
  
  // Initialize analytics
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bebopAnalytics.init());
  } else {
    bebopAnalytics.init();
  }
  
  // Export for manual tracking
  window.bebopAnalytics = bebopAnalytics;
})();
  `;
  
  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}