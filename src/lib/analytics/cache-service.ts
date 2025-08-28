// Analytics caching service for improved performance
import { DashboardMetrics, ContentMetrics, CampaignMetrics } from './types';
import { CacheError } from './errors';

// Simple in-memory cache perfect for small apps (10-100 users)
// Automatically cleans up expired entries and limits memory usage
class SimpleCache {
  private cache = new Map<string, { data: unknown; expires: number }>();
  private defaultTTL = 2 * 60 * 1000; // 2 minutes - good for small apps
  private maxEntries = 1000; // Prevent memory bloat

  set(key: string, value: unknown, ttl?: number): void {
    // Simple memory management - remove oldest if full
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data: value, expires });
  }

  get(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Auto-cleanup expired entries
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get stats for debugging
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxEntries
    };
  }
}

export class AnalyticsCacheService {
  private cache: SimpleCache;
  
  constructor() {
    this.cache = new SimpleCache();
  }

  /**
   * Generate cache key for dashboard metrics
   */
  private getDashboardKey(userId: string, startDate: Date, endDate: Date, days: number): string {
    return `dashboard:${userId}:${startDate.getTime()}:${endDate.getTime()}:${days}`;
  }

  /**
   * Generate cache key for content metrics
   */
  private getContentKey(contentId: string, startDate: Date, endDate: Date): string {
    return `content:${contentId}:${startDate.getTime()}:${endDate.getTime()}`;
  }

  /**
   * Generate cache key for campaign metrics
   */
  private getCampaignKey(campaignId: string, startDate: Date, endDate: Date): string {
    return `campaign:${campaignId}:${startDate.getTime()}:${endDate.getTime()}`;
  }

  /**
   * Cache dashboard metrics
   */
  async cacheDashboardMetrics(
    userId: string, 
    startDate: Date, 
    endDate: Date, 
    days: number, 
    metrics: DashboardMetrics,
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.getDashboardKey(userId, startDate, endDate, days);
      this.cache.set(key, metrics, ttl);
    } catch (error) {
      throw new CacheError(`Failed to cache dashboard metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cached dashboard metrics
   */
  async getCachedDashboardMetrics(
    userId: string, 
    startDate: Date, 
    endDate: Date, 
    days: number
  ): Promise<DashboardMetrics | null> {
    try {
      const key = this.getDashboardKey(userId, startDate, endDate, days);
      return this.cache.get(key);
    } catch (error) {
      // Log error but don't throw - cache misses shouldn't break the app
      console.warn('Failed to get cached dashboard metrics:', error);
      return null;
    }
  }

  /**
   * Cache content metrics
   */
  async cacheContentMetrics(
    contentId: string,
    startDate: Date,
    endDate: Date,
    metrics: ContentMetrics,
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.getContentKey(contentId, startDate, endDate);
      this.cache.set(key, metrics, ttl);
    } catch (error) {
      throw new CacheError(`Failed to cache content metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cached content metrics
   */
  async getCachedContentMetrics(
    contentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ContentMetrics | null> {
    try {
      const key = this.getContentKey(contentId, startDate, endDate);
      return this.cache.get(key);
    } catch (error) {
      console.warn('Failed to get cached content metrics:', error);
      return null;
    }
  }

  /**
   * Cache campaign metrics
   */
  async cacheCampaignMetrics(
    campaignId: string,
    startDate: Date,
    endDate: Date,
    metrics: CampaignMetrics,
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.getCampaignKey(campaignId, startDate, endDate);
      this.cache.set(key, metrics, ttl);
    } catch (error) {
      throw new CacheError(`Failed to cache campaign metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cached campaign metrics
   */
  async getCachedCampaignMetrics(
    campaignId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CampaignMetrics | null> {
    try {
      const key = this.getCampaignKey(campaignId, startDate, endDate);
      return this.cache.get(key);
    } catch (error) {
      console.warn('Failed to get cached campaign metrics:', error);
      return null;
    }
  }

  /**
   * Invalidate cache for specific content
   */
  async invalidateContent(contentId: string): Promise<void> {
    try {
      // Clear all cached metrics for this content
      // Since we can't iterate over Redis keys easily in in-memory cache,
      // we'll implement a more sophisticated approach in production Redis version
      this.cache.clear(); // For now, clear all cache
      
      console.log(`🗑️ Invalidated cache for content: ${contentId}`);
    } catch (error) {
      throw new CacheError(`Failed to invalidate content cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Invalidate cache for specific campaign
   */
  async invalidateCampaign(campaignId: string): Promise<void> {
    try {
      this.cache.clear(); // For now, clear all cache
      console.log(`🗑️ Invalidated cache for campaign: ${campaignId}`);
    } catch (error) {
      throw new CacheError(`Failed to invalidate campaign cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number; maxSize: number } {
    return this.cache.getStats();
  }

  /**
   * Clear all cached data (useful for debugging)
   */
  async clearAll(): Promise<void> {
    this.cache.clear();
    console.log('🗑️ Cleared all analytics cache');
  }
}

// Singleton instance
export const analyticsCacheService = new AnalyticsCacheService();

// Simple cache TTL for small apps - just use 2 minutes for everything
export function determineCacheTTL(_startDate: Date, _endDate: Date): number {
  return 2 * 60 * 1000; // 2 minutes - simple and effective
}