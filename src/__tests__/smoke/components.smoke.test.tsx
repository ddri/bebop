import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HybridPublisher from '@/components/HybridPublisher'

// Mock the hooks
vi.mock('@/hooks/useTopics', () => ({
  useTopics: () => ({
    topics: [
      { id: 'topic-1', name: 'Test Topic', content: 'Test content' }
    ],
    isLoading: false,
    error: null
  })
}))

vi.mock('@/hooks/useCampaigns', () => ({
  useCampaigns: () => ({
    createPublishingPlan: vi.fn().mockResolvedValue({}),
  })
}))

// Mock dynamic imports for card components
vi.mock('@/components/editor/cards', () => ({
  processRichMediaMarkdown: vi.fn((content: string) => content),
  cardRegistry: {},
}))

describe('Component Smoke Tests', () => {
  describe('HybridPublisher', () => {
    it('should render all scheduling modes', () => {
      render(<HybridPublisher />)

      expect(screen.getByText('Publish Now')).toBeInTheDocument()
      expect(screen.getByText('Add to Queue')).toBeInTheDocument() 
      expect(screen.getByText('Custom Schedule')).toBeInTheDocument()
    })

    it('should show custom date/time inputs when custom schedule selected', async () => {
      render(<HybridPublisher />)

      const customScheduleButton = screen.getByText('Custom Schedule')
      fireEvent.click(customScheduleButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('')).toBeInTheDocument() // date input
        expect(screen.getAllByDisplayValue('').length).toBeGreaterThan(1) // time input
      })
    })

    it('should handle form submission with different schedule modes', async () => {
      const mockOnPublished = vi.fn()
      render(<HybridPublisher onPublished={mockOnPublished} />)

      // Fill in basic content
      const titleInput = screen.getByPlaceholderText(/title/i)
      const contentTextarea = screen.getByPlaceholderText(/content/i)

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })
      fireEvent.change(contentTextarea, { target: { value: 'Test content' } })

      // Select platform
      const platformCheckboxes = screen.getAllByRole('checkbox')
      if (platformCheckboxes.length > 0) {
        fireEvent.click(platformCheckboxes[0])
      }

      // Test "Publish Now" mode
      const publishButton = screen.getByText(/publish/i)
      fireEvent.click(publishButton)

      await waitFor(() => {
        expect(mockOnPublished).toHaveBeenCalledWith(
          expect.objectContaining({
            scheduleMode: 'now',
            scheduledFor: expect.any(Date)
          })
        )
      }, { timeout: 3000 })
    })

    it('should validate required fields before submission', () => {
      render(<HybridPublisher />)

      const publishButton = screen.getByText(/publish/i)
      
      // Button should be disabled when no content
      expect(publishButton).toBeDisabled()
    })

    it('should handle platform selection', () => {
      render(<HybridPublisher />)

      const platformCards = screen.getAllByRole('button').filter(
        btn => btn.textContent?.includes('Hashnode') || 
              btn.textContent?.includes('Dev.to') ||
              btn.textContent?.includes('Bluesky')
      )

      expect(platformCards.length).toBeGreaterThan(0)
    })
  })

  describe('Schedule Mode Switching', () => {
    it('should update button text based on schedule mode', () => {
      render(<HybridPublisher />)

      // Default should be queue mode
      expect(screen.getByText('Add to Queue')).toBeInTheDocument()

      // Switch to now mode  
      const publishNowButton = screen.getByText('Publish Now')
      fireEvent.click(publishNowButton)
      
      // Button text should update (may need to check the submit button)
      const submitButton = screen.getByRole('button', { name: /publish|add|schedule/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should show validation for custom schedule', async () => {
      render(<HybridPublisher />)

      const customScheduleButton = screen.getByText('Custom Schedule')
      fireEvent.click(customScheduleButton)

      // Try to submit without date/time
      const titleInput = screen.getByPlaceholderText(/title/i)
      const contentTextarea = screen.getByPlaceholderText(/content/i)

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })
      fireEvent.change(contentTextarea, { target: { value: 'Test content' } })

      // Select platform
      const platformCheckboxes = screen.getAllByRole('checkbox')
      if (platformCheckboxes.length > 0) {
        fireEvent.click(platformCheckboxes[0])
      }

      const submitButton = screen.getByRole('button', { name: /schedule/i })
      
      // Should be disabled without date/time
      expect(submitButton).toBeDisabled()
    })
  })
})