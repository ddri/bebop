# 🎯 Bebop v0.4.0 - Next-Forge Implementation

This is the **Next-Forge implementation** of Bebop, a campaign-centric content marketing platform. This version represents a complete architectural migration from a custom Next.js app to a production-grade monorepo built on Next-Forge.

## 🚀 What's New in v0.4.0

### ✨ Campaign-Centric Content Management
- **Strategic Campaigns**: Organize content around marketing objectives
- **Campaign Workspace**: Dedicated views for each content marketing initiative
- **Content Library**: Centralized content creation and management
- **Campaign Analytics**: Track performance across all content in a campaign

### 🔄 Multi-Platform Publishing
- **Phase 1 Platforms**: Hashnode, Dev.to, Bluesky, Mastodon
- **Automated Scheduling**: Built-in cron-based publishing queue
- **Intelligent Retry Logic**: Automatic retry with exponential backoff
- **Real-Time Monitoring**: Live dashboard for publishing status

### 🏗️ Enterprise Architecture
- **Next-Forge Foundation**: Production-grade monorepo structure
- **Turborepo Build System**: Efficient development and deployment
- **shadcn/ui Components**: Modern, accessible UI components
- **Semantic Design Tokens**: CSS variable-based theming system

## 🛠️ Technical Stack

### Core Framework
- **Next.js 15** with React 19
- **TypeScript** for type safety
- **Turborepo** for monorepo management
- **pnpm** as package manager

### Database & Backend
- **MongoDB** with Prisma ORM
- **Clerk** for authentication
- **Node-cron** for scheduling
- **Zod** for schema validation

### Frontend & UI
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Radix UI** primitives
- **Lucide React** icons
- **React Hook Form** for forms

### Development & Testing
- **Vitest** for unit testing
- **Storybook** for component development
- **ESLint** + **Prettier** for code quality
- **TypeScript** strict mode

## 🏃‍♂️ Quick Start

### Prerequisites
```bash
# Required
Node.js 18+
MongoDB (local or Atlas)
pnpm (npm install -g pnpm)

# Optional for full development
Docker (for containerization)
Git (version control)
```

### Installation
```bash
# Clone the repository
git clone https://github.com/ddri/bebop.git
cd bebop/bebop-next-forge/bebop-next-forge

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize database
pnpm migrate

# Start development server
pnpm dev
```

### Environment Variables
```bash
# Database
DATABASE_URL="mongodb://localhost:27017/bebop"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# App Configuration
NEXT_PUBLIC_WEB_URL="http://localhost:3007"

# Platform API Keys (Optional)
HASHNODE_API_KEY="your_hashnode_token"
DEVTO_API_KEY="your_devto_token"
BLUESKY_USERNAME="your_bluesky_handle"
BLUESKY_PASSWORD="your_bluesky_password"
MASTODON_ACCESS_TOKEN="your_mastodon_token"
MASTODON_INSTANCE_URL="https://your-instance.social"
```

## 📁 Project Structure

```
bebop-next-forge/
├── apps/
│   ├── app/                    # Main Bebop application
│   │   ├── app/
│   │   │   ├── (authenticated)/    # Protected routes
│   │   │   │   ├── campaigns/      # Campaign management
│   │   │   │   ├── content/        # Content creation
│   │   │   │   ├── schedule/       # Publishing schedule
│   │   │   │   ├── destinations/   # Platform setup
│   │   │   │   ├── monitoring/     # Publishing dashboard
│   │   │   │   ├── analytics/      # Performance tracking
│   │   │   │   └── settings/       # User preferences
│   │   │   ├── (unauthenticated)/  # Public routes
│   │   │   └── api/                # API endpoints
│   │   ├── lib/                    # Core business logic
│   │   │   └── scheduler.ts        # Publishing queue
│   │   └── scripts/                # Utility scripts
│   ├── api/                    # Dedicated API server
│   ├── web/                    # Marketing website
│   ├── docs/                   # Documentation site
│   └── storybook/              # Component development
├── packages/
│   ├── design-system/          # UI components & design tokens
│   │   ├── components/ui/      # shadcn/ui components
│   │   └── lib/               # Design utilities
│   ├── database/              # Database schema & utilities
│   │   ├── prisma/schema.prisma    # Database schema
│   │   └── types.ts               # Type definitions
│   ├── auth/                  # Authentication utilities
│   ├── analytics/             # Analytics & tracking
│   └── collaboration/         # Real-time features
```

## 🎯 Core Features

### Campaign Management
- **Create Campaigns**: Strategic content planning with goals and timelines
- **Campaign Workspace**: Dedicated view for managing campaign content
- **Content Organization**: Group related content under campaign objectives
- **Progress Tracking**: Monitor campaign completion and performance

### Content Creation
- **Rich Text Editor**: Markdown-based content creation with live preview
- **Content Types**: Blog posts, social media posts, email content
- **Draft Management**: Save, edit, and version control content
- **Content Library**: Searchable repository of all content

### Publishing & Scheduling
- **Multi-Platform Support**: Publish to 4+ platforms simultaneously
- **Intelligent Scheduling**: Queue-based publishing with retry logic
- **Content Adaptation**: Platform-specific formatting and optimization
- **Publishing Monitoring**: Real-time status tracking and error handling

### Platform Integrations

#### Hashnode
- **Blog Publishing**: Full article publishing with tags and metadata
- **Publication Support**: Publish to personal or team publications
- **Cover Images**: Automatic image handling and optimization

#### Dev.to
- **Article Publishing**: Technical content with syntax highlighting
- **Tag Management**: Automatic tag suggestion and optimization
- **Community Integration**: Engage with Dev.to community features

#### Bluesky
- **Social Posts**: Short-form content with character optimization
- **Thread Support**: Multi-post thread creation and management
- **Media Handling**: Image and link preview optimization

#### Mastodon
- **Federated Publishing**: Publish to any Mastodon instance
- **Visibility Controls**: Public, unlisted, and follower-only posts
- **Content Warnings**: Automatic content warning detection

## 🔧 Development Commands

### Core Development
```bash
# Start all applications
pnpm dev

# Start specific app
pnpm dev --filter=app
pnpm dev --filter=storybook
pnpm dev --filter=docs

# Build all packages
pnpm build

# Run tests
pnpm test
pnpm test --filter=app
```

### Database Management
```bash
# Initialize/migrate database
pnpm migrate

# Generate Prisma client
pnpm db:generate

# Open Prisma Studio
pnpm db:studio

# Reset database (development only)
pnpm db:reset
```

### Code Quality
```bash
# Lint all packages
pnpm lint

# Format code
pnpm format

# Type checking
pnpm typecheck

# Run all quality checks
pnpm check
```

### Testing & Validation
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test scheduler functionality
pnpm test:scheduler
pnpm test:scheduler:failures
```

## 📊 Publishing Queue System

### Architecture Overview
The publishing system uses a cron-based queue with the following components:

1. **Scheduler Service** (`lib/scheduler.ts`)
   - Checks for pending schedules every minute
   - Manages retry logic and error handling
   - Updates schedule status in real-time

2. **Platform Clients**
   - Hashnode, Dev.to, Bluesky, Mastodon integrations
   - Content adaptation for each platform
   - Authentication and error handling

3. **Monitoring Dashboard**
   - Real-time status updates
   - Failed schedule management
   - Publishing activity feed

### Queue Features
- **Automatic Retry**: Up to 3 attempts with exponential backoff
- **Error Handling**: Detailed error logging and user notification
- **Manual Controls**: Retry, cancel, and immediate publishing
- **Status Tracking**: Pending, publishing, published, failed states

## 🎨 Design System

### Color Tokens
```css
/* Semantic color variables */
:root {
  --success: 142 76% 36%;      /* Green for success states */
  --warning: 38 92% 50%;       /* Orange for warnings */
  --destructive: 0 84% 60%;    /* Red for errors */
  --info: 217 91% 60%;         /* Blue for information */
}
```

### Component Architecture
- **shadcn/ui base**: Accessible, customizable components
- **Semantic variants**: Status-aware component variations
- **Design tokens**: CSS variable-based theming
- **Dark mode**: Automatic theme switching support

### Usage Examples
```tsx
// Status-aware components
<Badge className={getStatusColor('success')}>Published</Badge>
<AlertTriangle className={iconColors.error} />
<div className={backgroundColors.warning}>Warning content</div>

// Platform-specific styling
<Badge className={getPlatformColor('HASHNODE')}>Hashnode</Badge>
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository**: Link GitHub repo to Vercel
2. **Environment Setup**: Configure all environment variables
3. **Deploy**: Automatic deployment on push to main branch

### Self-Hosting
1. **Build Application**
   ```bash
   pnpm build
   ```

2. **Environment Setup**
   - Configure production environment variables
   - Set up MongoDB connection
   - Configure platform API keys

3. **Deploy**
   ```bash
   # Using Docker
   docker build -t bebop .
   docker run -p 3000:3000 bebop
   
   # Or direct deployment
   pnpm start
   ```

## 🧪 Testing Strategy

### Unit Tests
- **Component Testing**: UI component behavior and rendering
- **Utility Functions**: Business logic and data transformations
- **API Routes**: Backend functionality and error handling

### Integration Tests
- **Platform Integrations**: Publishing to external platforms
- **Database Operations**: Data persistence and retrieval
- **Authentication Flow**: Clerk integration testing

### E2E Tests
- **User Workflows**: Complete campaign creation to publishing
- **Publishing Queue**: End-to-end scheduling and publishing
- **Error Scenarios**: Failure handling and recovery

## 📈 Performance Monitoring

### Metrics to Track
- **Publishing Success Rate**: Percentage of successful publications
- **Queue Processing Time**: Average time from schedule to publish
- **Platform Response Times**: API latency for each platform
- **Error Rates**: Failed publication frequency and types

### Monitoring Tools
- **Real-time Dashboard**: Built-in monitoring interface
- **Server Logs**: Detailed logging for debugging
- **Performance Metrics**: Built-in analytics tracking

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `pnpm install`
4. Make changes and test thoroughly
5. Submit pull request with clear description

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Enforced code quality rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Structured commit messages

### Testing Requirements
- Unit tests for new functionality
- Integration tests for platform integrations
- E2E tests for user-facing features
- Documentation updates for new features

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Issues**: [GitHub Issues](https://github.com/ddri/bebop/issues)
- **Documentation**: [Project Wiki](https://github.com/ddri/bebop/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/ddri/bebop/discussions)

---

**Built with Next-Forge for enterprise-grade content marketing** 🚀