# 🎯 Bebop - Campaign-Centric Content Marketing Platform

Bebop is a **campaign-centric content marketing orchestration platform** designed for technical content creators, Developer Relations professionals, and content marketing teams. It combines the power of content planning, creation, scheduling, and multi-platform publishing in a unified workflow.

## 🚀 What Makes Bebop Different

**Campaign-First Approach**: Unlike traditional CMSs that focus on individual posts, Bebop organizes content around **marketing campaigns** - helping you plan, create, and execute cohesive content strategies across multiple channels.

**Multi-Platform Publishing**: Write once, publish everywhere. Bebop automatically adapts and publishes your content to:
- **Technical Blogs**: Hashnode, Dev.to
- **Social Networks**: Bluesky, Mastodon  
- **Coming Soon**: LinkedIn, Twitter, WordPress, Ghost

**Intelligent Scheduling**: Built-in publishing queue with retry logic, failure monitoring, and real-time status tracking.

## 🎯 Core Workflow

1. **📋 Plan** → Create content marketing campaigns with strategic goals
2. **✍️ Create** → Write content using our integrated editor with live preview
3. **⏰ Schedule** → Plan publishing timeline across multiple platforms
4. **📊 Monitor** → Track publishing status with real-time dashboard
5. **📈 Analyze** → Monitor campaign performance and content analytics

## ✨ Key Features

- **Campaign Management**: Organize content around marketing objectives
- **Content Library**: Centralized content creation and management
- **Multi-Platform Publishing**: Automated cross-posting with platform-specific formatting
- **Publishing Queue**: Reliable scheduling with retry logic and monitoring
- **Real-Time Dashboard**: Monitor publishing status and campaign progress
- **Platform Integration**: Easy setup for Hashnode, Dev.to, Bluesky, and Mastodon
- **Content Analytics**: Track performance across all publishing destinations

## 📊 Project Status

**Current Version**: v0.4.0 (Hybrid Publishing Workflow Release)

### ✅ **What's Complete**

**Core Publishing System:**
- ✅ **Campaign-centric workflow** - Create and manage content campaigns
- ✅ **Multi-platform publishing** - Hashnode, Dev.to, Bluesky, Mastodon support
- ✅ **Hybrid scheduling system** - Three modes: "Publish Now", "Add to Queue", "Custom Schedule"
- ✅ **Background processing** - Automated scheduler with manual trigger capability
- ✅ **Real-time monitoring** - Publishing queue with status tracking and retry logic

**Technical Infrastructure:**
- ✅ **TypeScript implementation** - Type-safe codebase with proper interfaces
- ✅ **Performance optimizations** - Lazy loading, code splitting, bundle analysis
- ✅ **Comprehensive testing** - Automated smoke tests for APIs and workflows
- ✅ **Modern stack** - Next.js 15, React 19, MongoDB, Prisma, Clerk Auth
- ✅ **Developer experience** - Testing suite, documentation, development workflow

**User Experience:**
- ✅ **Integrated editor** - Markdown editor with rich media card support
- ✅ **Content library** - Centralized topic and media management
- ✅ **Search functionality** - Real-time search across content with keyboard shortcuts
- ✅ **Responsive UI** - Modern interface with loading states and error handling

### 🚧 **What's Next (v0.5.0)**

**Analytics & Insights:**
- [ ] **Publishing analytics** - Success rates, engagement tracking, performance metrics
- [ ] **Campaign ROI tracking** - Goal setting and achievement measurement
- [ ] **Content performance** - Views, clicks, and conversion tracking across platforms

**Platform Expansion:**
- [ ] **LinkedIn integration** - Professional content publishing and scheduling
- [ ] **Twitter/X integration** - Social media content distribution with threading
- [ ] **WordPress integration** - Blog platform connectivity and content sync
- [ ] **Ghost integration** - Modern publishing platform support

**Advanced Features:**
- [ ] **Content versioning** - Track changes and maintain content history
- [ ] **Team collaboration** - Multi-user workflows and permission management
- [ ] **Content templates** - Reusable templates for common content types
- [ ] **Advanced scheduling** - Optimal timing suggestions and bulk scheduling

**User Experience Enhancements:**
- [ ] **User onboarding** - Welcome tour and guided setup for new users
- [ ] **Advanced filtering** - Tags, categories, and saved search functionality
- [ ] **Bulk operations** - Multi-select actions for topics and campaigns
- [ ] **Mobile optimization** - Responsive design improvements for mobile devices

### 🎯 **Ready to Use**

Bebop is **production-ready** for the core publishing workflow. You can:
- Create and manage content campaigns
- Schedule content across multiple platforms
- Monitor publishing status and performance
- Use the integrated editor for content creation
- Test functionality with the comprehensive test suite

**Perfect for:** Developer Relations teams, technical content creators, and marketing teams focused on multi-platform content distribution.

## 🏗️ Architecture

Bebop is built with **Next-Forge**, a production-grade Next.js monorepo template, providing:
- **Next.js 15** with React 19
- **TypeScript** for type safety
- **Tailwind CSS** + **shadcn/ui** for modern UI
- **Prisma** with **MongoDB** for data persistence
- **Clerk** for authentication
- **Turborepo** for efficient monorepo management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ddri/bebop.git
   cd bebop/bebop-next-forge/bebop-next-forge
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your environment variables:
   # - MongoDB connection string
   # - Clerk authentication keys
   # - Platform API keys (optional)
   ```

4. **Database Setup**
   ```bash
   # Initialize database
   pnpm migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - App: http://localhost:3007
   - Storybook: http://localhost:6006

## 📚 Platform Integrations

### Supported Platforms

| Platform | Status | Content Types | Setup Guide |
|----------|---------|---------------|-------------|
| **Hashnode** | ✅ Ready | Blog posts, articles | [Setup Guide](docs/hashnode-setup.md) |
| **Dev.to** | ✅ Ready | Technical articles | [Setup Guide](docs/devto-setup.md) |
| **Bluesky** | ✅ Ready | Social posts, threads | [Setup Guide](docs/bluesky-setup.md) |
| **Mastodon** | ✅ Ready | Social posts, updates | [Setup Guide](docs/mastodon-setup.md) |
| **LinkedIn** | 🚧 Coming Soon | Professional posts | - |
| **Twitter/X** | 🚧 Coming Soon | Tweets, threads | - |
| **WordPress** | 🚧 Coming Soon | Blog posts | - |
| **Ghost** | 🚧 Coming Soon | Blog posts | - |

### Setting Up Platform Integrations

1. Navigate to **Settings → Destinations**
2. Click **Add Destination**
3. Select your platform and follow the setup wizard
4. Test the connection to ensure proper configuration

## 📊 Monitoring & Analytics

### Publishing Dashboard
- **Real-time status** of all scheduled content
- **Retry management** for failed publications
- **Publishing activity feed** with detailed logs
- **Performance metrics** and success rates

### Campaign Analytics
- **Content performance** across all platforms
- **Publishing success rates** by destination
- **Campaign ROI** and engagement metrics
- **Content type analysis** (blog posts vs social media)

## 🛠️ Development

### Project Structure
```
bebop-next-forge/
├── apps/
│   ├── app/           # Main Bebop application
│   ├── api/           # API server
│   ├── web/           # Marketing website
│   └── docs/          # Documentation
├── packages/
│   ├── design-system/ # UI components
│   ├── database/      # Prisma schema
│   ├── auth/          # Authentication
│   └── shared/        # Shared utilities
```

### Key Commands
```bash
# Development
pnpm dev                 # Start all apps
pnpm dev --filter=app    # Start main app only

# Building
pnpm build              # Build all packages
pnpm test               # Run test suite

# Database
pnpm migrate            # Run database migrations
pnpm db:studio          # Open Prisma Studio

# Code Quality
pnpm lint               # Run linting
pnpm format             # Format code
```

## 🧪 Testing

Bebop includes a comprehensive testing suite with automated smoke tests to ensure the publishing workflow functions correctly.

### Test Types

- **Smoke Tests**: Fast tests covering critical functionality
- **API Tests**: Publishing plans, scheduler, and trigger endpoints
- **Component Tests**: HybridPublisher scheduling modes and validation
- **Integration Tests**: End-to-end workflow validation

### Running Tests

```bash
# Quick smoke test summary
pnpm test:quick

# All smoke tests with detailed output
pnpm test:smoke

# Live API testing (requires dev server)
pnpm test:workflow

# Interactive test UI
pnpm test:ui

# Watch mode during development
pnpm test
```

### What's Tested

**Publishing Workflow:**
- ✅ Three scheduling modes: "Publish Now", "Add to Queue", "Custom Schedule"
- ✅ Date/time validation and timezone handling
- ✅ Publishing plan creation and status transitions
- ✅ Background scheduler processing

**API Endpoints:**
- ✅ `POST /api/publishing-plans` - Create scheduled publications
- ✅ `POST /api/publishing-plans/process-scheduled` - Process due publications
- ✅ `POST /api/scheduler/trigger` - Manual scheduler trigger

**Components:**
- ✅ HybridPublisher form validation and submission
- ✅ Platform selection and content requirements
- ✅ Lazy loading states and performance optimizations

### Manual Testing Checklist

1. **Start Development Server**
   ```bash
   pnpm dev
   ```

2. **Test Scheduling Features**
   - Visit `/campaigns/[id]` (create campaign if needed)
   - Test "Publish Now" - immediate publishing
   - Test "Add to Queue" - 1-hour delay scheduling  
   - Test "Custom Schedule" - user-selected date/time
   - Use "Process Now" button in campaign planner

3. **Test Performance Optimizations**
   - Visit `/write`, `/media`, `/settings`
   - Verify lazy loading with skeleton states
   - Run `pnpm build:analyze` for bundle analysis

4. **Test API Integration**
   ```bash
   # Test scheduler manually
   curl -X POST http://localhost:3007/api/scheduler/trigger
   
   # Check database health
   curl http://localhost:3007/api/health/database
   ```

### Test Files

- `src/__tests__/smoke/` - Smoke test suite
  - `api.smoke.test.ts` - API endpoint tests
  - `components.smoke.test.tsx` - Component behavior tests  
  - `scheduler.smoke.test.ts` - Scheduling logic tests
- `scripts/test-workflow.js` - Manual integration testing
- `vitest.config.ts` - Test configuration

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Self-Hosting
1. Build the application: `pnpm build`
2. Set up MongoDB and environment variables
3. Deploy using Docker or your preferred hosting platform

## 🤝 Contributing

Bebop is a personal project developed on nights and weekends. Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

## 📋 Roadmap

See our [ROADMAP.md](ROADMAP.md) for detailed development roadmap and completed milestones.

### ✅ Completed (v0.4.0 - Hybrid Publishing Workflow Release)
- ✅ **Campaign-centric workflow** - Complete content campaign management system
- ✅ **Hybrid scheduling system** - Three publishing modes with custom date/time support  
- ✅ **Multi-platform publishing** - Hashnode, Dev.to, Bluesky, Mastodon integration
- ✅ **Background processing** - Automated scheduler with manual trigger capability
- ✅ **Performance optimization** - Lazy loading, code splitting, bundle analysis
- ✅ **Testing infrastructure** - Comprehensive test suite with automated smoke tests
- ✅ **TypeScript improvements** - Type-safe implementation throughout codebase

### 🎯 Next Release (v0.5.0 - Analytics & Platform Expansion)
- [ ] **Publishing analytics** - Performance metrics and engagement tracking
- [ ] **LinkedIn integration** - Professional content publishing platform
- [ ] **Twitter/X integration** - Social media content distribution  
- [ ] **Content versioning** - Track changes and maintain content history
- [ ] **Team collaboration** - Multi-user workflows and permissions
- [ ] **Advanced scheduling** - Optimal timing and bulk operations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ About the Author

Bebop is created and maintained by **David Ryan**, a product manager and developer in the quantum computing space. This project combines experience from building content management systems at Red Hat and commercial SaaS platforms.

- **Day Job**: Product Manager for quantum computing
- **Background**: Developer Relations, Technical Writing, Content Strategy
- **Previous Work**: Red Hat PressGang CCMS, Corilla SaaS platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ddri/bebop/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ddri/bebop/discussions)
- **Email**: [Contact via GitHub](https://github.com/ddri)

---

**Built with ❤️ for content creators and Developer Relations professionals**