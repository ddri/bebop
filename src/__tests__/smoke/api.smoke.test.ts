import { describe, it, expect, beforeEach } from 'vitest'

// Mock Prisma client
const mockPrismaClient = {
  publishingPlan: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  campaign: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  topic: {
    findUnique: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
}))

vi.mock('@/lib/auth', () => ({
  authenticateRequest: vi.fn().mockResolvedValue({ error: null }),
}))

describe('API Smoke Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('Publishing Plans API', () => {
    it('should create publishing plan with scheduling', async () => {
      const mockPlan = {
        id: 'test-id',
        campaignId: 'campaign-1',
        topicId: 'topic-1', 
        platform: 'devto',
        scheduledFor: new Date('2025-01-25T10:00:00Z'),
        status: 'scheduled'
      }

      mockPrismaClient.publishingPlan.create.mockResolvedValue(mockPlan)

      // Dynamically import the route handler
      const { POST } = await import('@/app/api/publishing-plans/route')
      
      const request = new Request('http://localhost/api/publishing-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: 'campaign-1',
          topicId: 'topic-1',
          platform: 'devto',
          scheduledFor: '2025-01-25T10:00:00Z'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject(mockPlan)
      expect(mockPrismaClient.publishingPlan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          campaignId: 'campaign-1',
          topicId: 'topic-1',
          platform: 'devto',
          scheduledFor: '2025-01-25T10:00:00Z',
          status: 'scheduled'
        })
      })
    })
  })

  describe('Scheduler API', () => {
    it('should process scheduled publications', async () => {
      const mockDuePlans = [{
        id: 'plan-1',
        topicId: 'topic-1',
        platform: 'devto',
        campaign: { name: 'Test Campaign' }
      }]

      const mockTopic = { name: 'Test Topic' }

      mockPrismaClient.publishingPlan.findMany.mockResolvedValue(mockDuePlans)
      mockPrismaClient.publishingPlan.update.mockResolvedValue({})
      mockPrismaClient.topic.findUnique.mockResolvedValue(mockTopic)

      const { POST } = await import('@/app/api/publishing-plans/process-scheduled/route')
      
      const request = new Request('http://localhost/api/publishing-plans/process-scheduled', {
        method: 'POST'
      })

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.processed).toBe(1)
      expect(data.results).toHaveLength(1)
      expect(mockPrismaClient.publishingPlan.update).toHaveBeenCalledWith({
        where: { id: 'plan-1' },
        data: expect.objectContaining({
          status: 'published',
          publishedAt: expect.any(Date),
          publishedUrl: expect.stringContaining('devto.example.com')
        })
      })
    })
  })

  describe('Scheduler Trigger API', () => {
    it('should trigger scheduler manually', async () => {
      // Mock the fetch call to process-scheduled endpoint
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          message: 'Test processed',
          processed: 1
        })
      })

      const { POST } = await import('@/app/api/scheduler/trigger/route')
      
      const request = new Request('http://localhost/api/scheduler/trigger', {
        method: 'POST'
      })

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Scheduler triggered successfully')
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3007/api/publishing-plans/process-scheduled',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })
  })
})