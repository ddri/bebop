import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock data
const mockEvents = [
  {
    id: '1',
    eventType: 'content.view',
    contentId: 'topic1234567890',
    visitorId: 'visitor1',
    timestamp: new Date('2024-01-01'),
    metadata: {}
  },
  {
    id: '2', 
    eventType: 'content.read',
    contentId: 'topic1234567890',
    visitorId: 'visitor1',
    timestamp: new Date('2024-01-01'),
    metadata: { readTime: 120 }
  },
  {
    id: '3',
    eventType: 'content.complete',
    contentId: 'topic1234567890', 
    visitorId: 'visitor1',
    timestamp: new Date('2024-01-01'),
    metadata: { scrollDepth: 85 }
  }
]

const mockTopics = [
  {
    id: 'topic1234567890', // 10+ chars for validation
    name: 'Test Topic',
    createdAt: new Date('2024-01-01')
  }
]

// Mock modules
vi.mock('@/lib/prisma', () => ({
  prisma: {
    topic: {
      findMany: vi.fn().mockResolvedValue(mockTopics),
      findUnique: vi.fn().mockResolvedValue(mockTopics[0])
    },
    analyticsEvent: {
      findMany: vi.fn().mockResolvedValue(mockEvents)
    },
    campaign: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'campaign1',
        name: 'Test Campaign',
        createdAt: new Date('2024-01-01'),
        publishingPlans: []
      })
    }
  }
}))

vi.mock('@/lib/auth', () => ({
  authenticateRequest: vi.fn().mockResolvedValue({ 
    error: null, 
    userId: 'user1' 
  }),
}))

describe('Analytics Integration Tests', () => {
  let GET: (request: NextRequest) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    // Dynamically import after mocks are set up
    const routeModule = await import('@/app/api/analytics/metrics/route')
    GET = routeModule.GET
  })

  it('should return dashboard metrics without crashing', async () => {
    const url = new URL('http://localhost:3000/api/analytics/metrics?type=dashboard&days=7')
    const request = new NextRequest(url)
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('overview')
    expect(data).toHaveProperty('topContent')
    expect(data).toHaveProperty('recentlyPublished')
    expect(data.overview).toHaveProperty('totalViews')
    expect(data.overview).toHaveProperty('uniqueVisitors')
  })

  it('should return content metrics with completion tracking', async () => {
    const url = new URL('http://localhost:3000/api/analytics/metrics?type=content&contentId=topic1234567890')
    const request = new NextRequest(url)
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('contentId', 'topic1234567890')
    expect(data).toHaveProperty('completions')
    expect(data).toHaveProperty('avgReadTime')
  })

  it('should handle validation errors gracefully', async () => {
    const url = new URL('http://localhost:3000/api/analytics/metrics?type=content&contentId=short')
    const request = new NextRequest(url)
    
    const response = await GET(request)
    
    expect(response.status).toBe(400) // Should return validation error
    // Test passes if it returns proper error status
  })
})