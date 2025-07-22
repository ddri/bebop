# 🛠️ Bebop Developer Guide

This comprehensive guide will help you set up a development environment for Bebop and contribute to the project effectively.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** ([Download](https://nodejs.org/))
- **pnpm** (Package manager)
  ```bash
  npm install -g pnpm
  ```
- **Git** ([Download](https://git-scm.com/))
- **MongoDB** (Local or Atlas)
  - [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
  - Or [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud)

### Optional Tools
- **Docker** ([Download](https://www.docker.com/)) - For containerization
- **MongoDB Compass** - Database GUI
- **Postman** or **Insomnia** - API testing
- **VS Code** - Recommended editor with extensions

### VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-playwright.playwright",
    "prisma.prisma"
  ]
}
```

## 🚀 Quick Setup

### 1. Clone the Repository
```bash
# Clone the main repository
git clone https://github.com/ddri/bebop.git
cd bebop

# Navigate to the Next-Forge implementation
cd bebop-next-forge/bebop-next-forge
```

### 2. Install Dependencies
```bash
# Install all dependencies using pnpm
pnpm install

# This installs dependencies for all packages in the monorepo
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local  # or your preferred editor
```

### 4. Required Environment Variables
```bash
# Database
DATABASE_URL="mongodb://localhost:27017/bebop-dev"

# Authentication (Clerk) - Get from https://clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# App Configuration
NEXT_PUBLIC_WEB_URL="http://localhost:3007"

# Platform API Keys (Optional for development)
HASHNODE_API_KEY="your_hashnode_token"
DEVTO_API_KEY="your_devto_token"
BLUESKY_USERNAME="your_bluesky_handle"
BLUESKY_PASSWORD="your_bluesky_password"
MASTODON_ACCESS_TOKEN="your_mastodon_token"
MASTODON_INSTANCE_URL="https://your-instance.social"
```

### 5. Database Setup
```bash
# Initialize database schema
pnpm migrate

# Optional: Seed with sample data
pnpm db:seed  # If seed script exists
```

### 6. Start Development Server
```bash
# Start all applications
pnpm dev

# Or start specific apps
pnpm dev --filter=app        # Main application only
pnpm dev --filter=storybook  # Storybook only
```

### 7. Access Applications
- **Main App**: http://localhost:3007
- **Storybook**: http://localhost:6006
- **Docs**: http://localhost:3001 (if running)

## 📁 Project Structure Deep Dive

### Monorepo Architecture
```
bebop-next-forge/
├── apps/                    # Applications
│   ├── app/                 # Main Bebop application
│   ├── api/                 # Dedicated API server
│   ├── web/                 # Marketing website
│   ├── docs/                # Documentation site
│   └── storybook/           # Component development
├── packages/                # Shared packages
│   ├── design-system/       # UI components & design tokens
│   ├── database/            # Database schema & utilities
│   ├── auth/                # Authentication utilities
│   ├── analytics/           # Analytics & tracking
│   └── collaboration/       # Real-time features
├── package.json             # Root package configuration
├── turbo.json              # Turborepo configuration
└── pnpm-workspace.yaml     # Workspace configuration
```

### Main Application Structure
```
apps/app/
├── app/                     # Next.js 15 app directory
│   ├── (authenticated)/     # Protected routes
│   │   ├── campaigns/       # Campaign management
│   │   ├── content/         # Content creation
│   │   ├── schedule/        # Publishing schedule
│   │   ├── destinations/    # Platform setup
│   │   ├── monitoring/      # Publishing dashboard
│   │   ├── analytics/       # Performance tracking
│   │   └── settings/        # User preferences
│   ├── (unauthenticated)/   # Public routes
│   ├── api/                 # API routes
│   └── globals.css          # Global styles
├── lib/                     # Core business logic
│   ├── scheduler.ts         # Publishing queue
│   ├── platforms/           # Platform integrations
│   └── utils/               # Utility functions
├── middleware.ts            # Next.js middleware
└── package.json             # App-specific dependencies
```

### Design System Structure
```
packages/design-system/
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── mode-toggle.tsx      # Theme switching
├── lib/                     # Utilities
│   ├── utils.ts             # Component utilities
│   └── status-colors.ts     # Design tokens
├── index.tsx                # Main export
└── package.json             # Package dependencies
```

## 🧑‍💻 Development Workflow

### Branch Strategy
```bash
# Main branches
main        # Production-ready code
develop     # Integration branch for features

# Feature branches
feature/campaign-management
feature/bluesky-integration
feature/ui-improvements

# Hotfix branches
hotfix/critical-bug-fix
```

### Creating a Feature Branch
```bash
# Start from develop branch
git checkout develop
git pull origin develop

# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to origin
git push -u origin feature/your-feature-name
```

### Development Commands
```bash
# Start development with hot reload
pnpm dev

# Run specific package scripts
pnpm --filter=app dev         # Main app only
pnpm --filter=design-system build  # Build design system

# Database operations
pnpm migrate                  # Run migrations
pnpm db:studio               # Open Prisma Studio
pnpm db:reset                # Reset database (development only)

# Code quality
pnpm lint                    # Run ESLint
pnpm format                  # Format with Prettier
pnpm typecheck              # TypeScript checking

# Testing
pnpm test                    # Run unit tests
pnpm test:e2e               # Run E2E tests
pnpm test:scheduler         # Test publishing queue
```

## 🧪 Testing Strategy

### Unit Testing
```bash
# Run all unit tests
pnpm test

# Run tests for specific package
pnpm --filter=app test
pnpm --filter=design-system test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### E2E Testing
```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e --ui

# Run specific test file
pnpm test:e2e tests/campaign-creation.spec.ts
```

### Testing Platform Integrations
```bash
# Test publishing queue
pnpm test:scheduler

# Test specific platform
pnpm test:scheduler:hashnode
pnpm test:scheduler:devto

# Test failure scenarios
pnpm test:scheduler:failures
```

### Writing Tests
```typescript
// Unit test example
import { render, screen } from '@testing-library/react'
import { CampaignCard } from './campaign-card'

describe('CampaignCard', () => {
  it('displays campaign information correctly', () => {
    const campaign = {
      id: '1',
      name: 'Test Campaign',
      status: 'ACTIVE'
    }
    
    render(<CampaignCard campaign={campaign} />)
    
    expect(screen.getByText('Test Campaign')).toBeInTheDocument()
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })
})

// E2E test example
import { test, expect } from '@playwright/test'

test('create new campaign', async ({ page }) => {
  await page.goto('/campaigns')
  
  await page.click('[data-testid="create-campaign"]')
  await page.fill('[data-testid="campaign-name"]', 'Test Campaign')
  await page.click('[data-testid="save-campaign"]')
  
  await expect(page.locator('[data-testid="campaign-list"]'))
    .toContainText('Test Campaign')
})
```

## 🏗️ Architecture Patterns

### Component Architecture
```typescript
// Component structure
interface ComponentProps {
  // Props with clear types
}

export const Component = ({ prop1, prop2 }: ComponentProps) => {
  // Hooks at the top
  const [state, setState] = useState()
  
  // Event handlers
  const handleClick = () => {
    // Handle logic
  }
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### API Route Structure
```typescript
// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { database } from '@repo/database'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const campaigns = await database.campaign.findMany({
      where: { userId }
    })
    
    return NextResponse.json({ campaigns })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### Database Patterns
```typescript
// Using Prisma with proper error handling
export async function getCampaigns(userId: string) {
  try {
    return await database.campaign.findMany({
      where: { userId },
      include: {
        content: true,
        schedules: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    throw new Error('Failed to fetch campaigns')
  }
}
```

## 🎨 Design System Development

### Creating New Components
```bash
# Generate new component
npx shadcn@latest add button

# Or manually create in packages/design-system/components/ui/
```

### Component Guidelines
```typescript
// packages/design-system/components/ui/new-component.tsx
import * as React from "react"
import { cn } from "../../lib/utils"

interface NewComponentProps {
  variant?: "default" | "secondary"
  size?: "sm" | "md" | "lg"
  className?: string
}

const NewComponent = React.forwardRef<
  HTMLDivElement,
  NewComponentProps
>(({ variant = "default", size = "md", className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "base-styles",
        {
          "default-variant": variant === "default",
          "secondary-variant": variant === "secondary",
          "sm-size": size === "sm",
          "lg-size": size === "lg"
        },
        className
      )}
      {...props}
    />
  )
})

NewComponent.displayName = "NewComponent"

export { NewComponent }
```

### Adding Design Tokens
```typescript
// packages/design-system/lib/status-colors.ts
export const statusColors = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
}

export const getStatusColor = (status: string) => {
  return statusColors[status] || statusColors.default
}
```

## 🔌 Platform Integration Development

### Adding New Platform
1. **Create platform client**
```typescript
// lib/platforms/new-platform.ts
export class NewPlatformClient {
  constructor(private config: NewPlatformConfig) {}
  
  async authenticate(): Promise<boolean> {
    // Authentication logic
  }
  
  async publish(content: Content): Promise<PublishResult> {
    // Publishing logic
  }
}
```

2. **Add to scheduler**
```typescript
// lib/scheduler.ts
case DestinationType.NEW_PLATFORM: {
  const client = new NewPlatformClient(config)
  return await client.publish(adaptedContent)
}
```

3. **Create UI configuration**
```typescript
// components/platform-configurations.tsx
case 'NEW_PLATFORM':
  return <NewPlatformConfig onSave={onSave} />
```

### Platform Client Pattern
```typescript
interface PlatformClient {
  authenticate(): Promise<boolean>
  publish(content: AdaptedContent): Promise<PublishResult>
  test(): Promise<TestResult>
}

interface AdaptedContent {
  title: string
  body: string
  tags?: string[]
  mediaUrls?: string[]
}

interface PublishResult {
  success: boolean
  url?: string
  error?: string
}
```

## 📝 Code Style and Standards

### TypeScript Guidelines
```typescript
// Use strict types
interface StrictInterface {
  id: string
  name: string
  status: 'ACTIVE' | 'INACTIVE'  // Use unions instead of string
  metadata?: Record<string, unknown>  // Use unknown instead of any
}

// Prefer type over interface for simple types
type Status = 'PENDING' | 'PUBLISHED' | 'FAILED'

// Use proper error handling
async function fetchData(): Promise<Data | null> {
  try {
    return await apiCall()
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return null
  }
}
```

### React Guidelines
```typescript
// Use proper component typing
interface Props {
  children: React.ReactNode
  onSubmit: (data: FormData) => void
}

// Prefer function components
export const Component: React.FC<Props> = ({ children, onSubmit }) => {
  // Component logic
}

// Use proper hooks
const [state, setState] = useState<Type | null>(null)
const [loading, setLoading] = useState(false)

// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])
```

### CSS and Styling
```typescript
// Use Tailwind utility classes
<div className="flex items-center gap-4 p-6 rounded-lg border bg-card">

// Use design tokens for colors
<Badge className={getStatusColor(status)}>

// Avoid arbitrary values unless necessary
<div className="w-[calc(100%-2rem)]"> // Only when needed
```

## 🚀 Deployment and Release

### Development Deployment
```bash
# Build all packages
pnpm build

# Test production build locally
pnpm start

# Docker development
docker build -t bebop-dev .
docker run -p 3007:3007 bebop-dev
```

### Environment Management
```bash
# Development
.env.local

# Production
.env.production

# Testing
.env.test
```

### Release Process
1. **Feature Complete**: All features tested and working
2. **Documentation**: Update relevant docs
3. **Version Bump**: Update package.json versions
4. **Create PR**: Merge to develop, then main
5. **Deploy**: Automatic deployment via Vercel/CI

## 🤝 Contributing Guidelines

### Pull Request Process
1. **Fork** the repository
2. **Create** feature branch from develop
3. **Make** your changes with tests
4. **Ensure** all tests pass
5. **Update** documentation if needed
6. **Submit** pull request with clear description

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Code Review Guidelines
- **Review for correctness**: Logic and implementation
- **Check tests**: Adequate coverage and quality
- **Verify documentation**: Clear and up-to-date
- **Security review**: No secrets or vulnerabilities
- **Performance**: No obvious performance issues

## 🐛 Debugging and Troubleshooting

### Common Development Issues

#### Database Connection Issues
```bash
# Check MongoDB status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Test connection
mongo mongodb://localhost:27017/bebop-dev
```

#### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install

# Clear Turborepo cache
pnpm clean
```

#### Environment Issues
```bash
# Verify environment variables
cat .env.local

# Check Node.js version
node --version  # Should be 18+

# Check pnpm version
pnpm --version
```

### Debugging Tools
```typescript
// Use proper logging
import { logger } from '@/lib/logger'

logger.info('User action', { userId, action })
logger.error('Failed operation', { error, context })

// Debug API routes
console.log('Request:', request.url, request.method)
console.log('Response:', response.status)

// Debug React components
console.log('Props:', props)
console.log('State:', state)
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

### Tools and Extensions
- [VS Code Settings](https://code.visualstudio.com/docs/getstarted/settings)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Playwright Testing](https://playwright.dev/docs/intro)

### Community
- [Bebop GitHub Issues](https://github.com/ddri/bebop/issues)
- [GitHub Discussions](https://github.com/ddri/bebop/discussions)
- [Next.js Discord](https://discord.gg/nextjs)
- [React Community](https://reactjs.org/community/support.html)

## 🆘 Getting Help

### Before Asking for Help
1. **Check documentation**: README, guides, and code comments
2. **Search issues**: Look for similar problems on GitHub
3. **Review logs**: Check console, network, and server logs
4. **Minimal reproduction**: Create smallest possible example

### Where to Ask
1. **GitHub Issues**: Bug reports and feature requests
2. **GitHub Discussions**: Questions and general discussion
3. **Code Review**: PR comments for specific implementation questions

### Providing Good Bug Reports
```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 13.0]
- Node.js: [e.g., 18.17.0]
- Browser: [e.g., Chrome 115]

**Additional Context**
Screenshots, logs, etc.
```

---

**Happy coding! Welcome to the Bebop development community! 🚀**