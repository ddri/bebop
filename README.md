# 🎯 Bebop - Campaign-Centric Content Marketing Platform

## What is Bebop?

Bebop is a **campaign-centric content marketing orchestration platform** designed specifically for technical content creators, Developer Relations professionals, and content marketing teams. It combines the power of content planning, creation, scheduling, and multi-platform publishing in a unified workflow.

## 🚀 What Makes Bebop Different

**Campaign-First Approach**: Unlike traditional CMSs that focus on individual posts, Bebop organizes content around **marketing campaigns** - helping you plan, create, and execute cohesive content strategies across multiple channels.

**Multi-Platform Publishing**: Write once, publish everywhere. Bebop automatically adapts and publishes your content to:
- **Technical Blogs**: Hashnode, Dev.to
- **Newsletters**: Beehiiv
- **Social Networks**: Bluesky, Mastodon  
- **Coming Soon**: LinkedIn, Twitter, WordPress, Ghost

**Intelligent Scheduling**: Built-in publishing queue with retry logic, failure monitoring, and real-time status tracking.

**Privacy-First Analytics**: Cookie-free, GDPR-compliant analytics that respect user privacy while providing valuable insights.

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
- **Privacy-First Analytics**: Track performance without cookies or invasive tracking
- **Rich Media Support**: YouTube, Spotify embeds with visual editors
- **GitHub Integration**: Import content from GitHub repositories



-----------------


## 📋 Roadmap

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

**Analytics & Insights (Complete):**
- ✅ **Privacy-first analytics** - Cookie-free tracking with daily visitor rotation
- ✅ **Publishing analytics** - Success rates, engagement tracking, performance metrics
- ✅ **Campaign ROI tracking** - Goal setting and achievement measurement
- ✅ **Content performance** - Views, clicks, and conversion tracking across platforms

**Platform Improvements:**
- [ ] **Enhanced Beehiiv integration** - Improve UI/UX design, better visual identity, clearer enterprise plan guidance
- [ ] **Platform grouping** - Organize platforms by type (newsletters, blogs, social) for better discovery
- [ ] **Settings wizard** - Guided setup flow for new platform integrations

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


---------

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- MongoDB database (local or cloud)
- Clerk account for authentication
- AWS S3 bucket for media storage (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ddri/bebop.git
cd bebop
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
# Required: Database (MongoDB)
DATABASE_URL="mongodb://localhost:27017/bebop"

# Required: Clerk Authentication (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Required: Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: See .env.example for AWS S3, platform APIs, etc.
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to MongoDB
npx prisma db push
```

5. **Start Bebop**
```bash
# Development mode (with hot reload)
npm run dev

# Or production mode
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) and sign up for an account!

### First-Time Setup Checklist

- [ ] MongoDB is running (local or cloud)
- [ ] Created Clerk account and added keys
- [ ] Configured `.env.local` with required variables
- [ ] Database schema pushed with `npx prisma db push`
- [ ] Server started with `npm run dev`
- [ ] Created your first account at http://localhost:3000

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Clerk
- **Storage**: AWS S3 (optional) or local filesystem
- **Analytics**: Privacy-first custom analytics

### Project Structure

```
bebop/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── campaigns/    # Campaign pages
│   │   ├── analytics/    # Analytics dashboard
│   │   ├── media/        # Media library
│   │   ├── settings/     # Settings pages
│   │   └── write/        # Content editor
│   ├── components/       # React components
│   │   ├── editor/       # Markdown editor components
│   │   ├── social/       # Social platform components
│   │   ├── analytics/    # Analytics components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utility libraries
│   │   ├── analytics/    # Analytics service
│   │   ├── social/       # Social platform clients
│   │   └── webhooks/     # Webhook handling
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── blog/                 # Blog content (markdown)
└── docs/                 # Documentation
```

------


## 📚 Platform Integrations

### Newsletter Platforms
| Platform | Status | Content Types | Requirements | Setup Guide |
|----------|---------|---------------|--------------|-------------|
| **Beehiiv** | ✅ Ready | Newsletter posts | Enterprise Plan | [Setup Guide](DEVELOPERGUIDE.md#beehiiv-setup) |

### Technical Blogs
| Platform | Status | Content Types | Setup Guide |
|----------|---------|---------------|-------------|
| **Hashnode** | ✅ Ready | Blog posts, articles | [Setup Guide](DEVELOPERGUIDE.md#hashnode-setup) |
| **Dev.to** | ✅ Ready | Technical articles | [Setup Guide](DEVELOPERGUIDE.md#devto-setup) |

### Social Networks
| Platform | Status | Content Types | Setup Guide |
|----------|---------|---------------|-------------|
| **Bluesky** | ✅ Ready | Social posts, threads | [Setup Guide](DEVELOPERGUIDE.md#bluesky-setup) |
| **Mastodon** | ✅ Ready | Social posts, updates | [Setup Guide](DEVELOPERGUIDE.md#mastodon-setup) |

### Coming Soon
| Platform | Status | Content Types |
|----------|---------|---------------|
| **LinkedIn** | 🚧 Development | Professional posts |
| **Twitter/X** | 🚧 Development | Tweets, threads |
| **Threads** | 🚧 Development | Posts, threads |
| **WordPress** | 🚧 Development | Blog posts |
| **Ghost** | 🚧 Development | Blog posts |

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

For complete technical documentation, API reference, and platform setup guides, see the **[Developer Guide](DEVELOPERGUIDE.md)**.

### Available Scripts

```bash
# Development
npm run dev              # Start development server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run build:analyze    # Build with bundle analyzer

# Testing
npm test                 # Run tests in watch mode
npm run test:ui          # Open Vitest UI
npm run test:smoke       # Run smoke tests
npm run test:quick       # Quick test summary
npm run test:workflow    # Test publishing workflow

# Code Quality
npm run lint             # Run ESLint

# Database
npx prisma studio        # Open Prisma Studio
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema changes to database
```

### Development Workflow

1. **Start the development server**
```bash
npm run dev
```

2. **Make your changes** - Hot reload will update the browser automatically

3. **Run tests** to ensure everything works
```bash
npm run test:smoke
```

4. **Build for production** to verify the build
```bash
npm run build
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
npm run test:quick

# All smoke tests with detailed output
npm run test:smoke

# Live API testing (requires dev server)
npm run test:workflow

# Interactive test UI
npm run test:ui

# Watch mode during development
npm test
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
   npm run dev
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
   - Run `npm run build:analyze` for bundle analysis

4. **Test API Integration**
   ```bash
   # Test scheduler manually
   curl -X POST http://localhost:3000/api/scheduler/trigger
   
   # Check database health
   curl http://localhost:3000/api/health/database
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

1. **Fork and connect repository**
   - Fork this repository to your GitHub account
   - Sign in to [Vercel](https://vercel.com) and import your fork
   
2. **Configure environment variables**
   Add all variables from `.env.local` to your Vercel project settings

3. **Deploy**
   - Vercel will automatically build and deploy your application
   - Enable automatic deployments for continuous deployment

### Self-Hosting

1. **Build the application**
```bash
npm run build
```

2. **Set up production environment**
   - Configure MongoDB (MongoDB Atlas recommended for production)
   - Set all environment variables
   - Use a process manager like PM2 for Node.js

3. **Start the production server**
```bash
npm run start
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 🤝 Contributing

Bebop is a personal project developed on nights and weekends. Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description


## 📄 License

This project is licensed under the AGPL-3.0 license - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ About the Author

Bebop is created and maintained by **David Ryan**, a product leader and developer now working in the quantum computing industry. This project combines experience from building content management systems at Red Hat and is a spiritual successor to the Corilla CMS.


## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ddri/bebop/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ddri/bebop/discussions)
- **Email**: [Contact via GitHub](https://github.com/ddri)

---
