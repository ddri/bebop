import '@testing-library/jest-dom'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_URL = 'http://localhost:3007'

// Mock fetch globally
global.fetch = vi.fn()