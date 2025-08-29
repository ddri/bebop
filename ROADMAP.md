# Bebop Development Roadmap

**Current Version**: v0.3.5 (Quality & Search release)  
**Last Updated**: January 2025 (based on codebase analysis)  
**Tech Stack**: Next.js 15, TypeScript, MongoDB Atlas, Clerk Auth, Vercel deployment  
**Target Platform**: Desktop/laptop users (mobile support not currently planned)

## Priority & Labeling System

### Issue Types
- `type: bug` - Something broken or not working as expected
- `type: enhancement` - Improve existing feature or functionality
- `type: feature` - New functionality or capability

---------

## Development Phases

The roadmap is roughly organised by the release cycle, which is based on my personal bias and general intentions. There is no special versioning system, just what I feel is sensible at the time.

### ✅ Completed in version 0.3.5

- **Security and code quality audit**
    - ✅ Package updates & security vulnerability fixes
    - ✅ Critical linting errors resolved (React Hooks, text escaping)
    - ✅ Empty interface cleanup
    - ✅ Fix remaining TypeScript `any` types (97% improvement - only 3 instances remain)
    - ✅ Clean up unused imports and variables
    - ✅ Add comprehensive error handling and boundaries
    - ✅ Implement consistent loading states
    - ✅ Database connection resilience with retry logic
    - ✅ Robust ErrorBoundary system with specialized variants (ApiErrorBoundary, EditorErrorBoundary)
    - ✅ Database error categorization with user-friendly messaging
    
- **Major feature addition**
    - ✅ Comprehensive search functionality across topics and collections
    - ✅ Real-time search with keyboard shortcuts (Cmd+K)
    - ✅ MongoDB text indexing for efficient search
    - ✅ Smart result highlighting and relevance scoring

### Planning for version 0.4.0 - Campaign Orchestration Platform (**NEW STRATEGIC DIRECTION**)

**Vision**: Transform Bebop from a publishing tool into a comprehensive campaign orchestration platform that provides unified visibility and control over all campaign content, both automated and manual.

Based on research of leading platforms (HubSpot, CoSchedule, Marketo, Buffer, Hootsuite), this version focuses on campaign-centric workflows that excel at visual organization + workflow automation + human oversight.

**Core Features - Campaign Orchestration Hub:**

- **Campaign Management System**
    - [ ] **Unified Campaign Dashboard** - Central hub grouping all content by campaign (inspired by HubSpot's campaign tagging)
    - [ ] **Content Staging Area** - Pre-flight zone where all campaign content lives before scheduling
    - [ ] **Campaign Timeline View** - Gantt-style visualization of entire campaign lifecycle
    - [ ] **Template-Based Campaign Creation** - Reusable campaign structures for scaling

- **Calendar-First Content Scheduling**
    - [ ] **Multi-View Calendar** - Month/week/day views with drag-and-drop scheduling (CoSchedule pattern)
    - [ ] **Content State Visualization** - Clear status: Draft → Staged → Scheduled → Published → Manual Action Required
    - [ ] **Cross-Platform Campaign Calendar** - Unified view of all automated and manual publishing tasks
    - [ ] **Color-Coded Visual Organization** - Campaign-based visual differentiation

- **Manual Task Management & Mixed Workflows**
    - [ ] **Manual Publishing Queue** - "Ready to post manually" section with platform-specific formatting
    - [ ] **Task Automation Templates** - Reusable workflows for different content types (API docs, tutorials, release notes)
    - [ ] **Manual Action Tracking** - Checkboxes and completion status for platforms like Medium, LinkedIn
    - [ ] **Platform-Specific Guidelines** - Auto-generated formatting notes and posting instructions

- **Technical Content Specialization**
    - [ ] **Developer-Focused Workflows** - Integration points for code review and technical accuracy checks
    - [ ] **Cross-Platform Content Adaptation** - Auto-generate Medium, LinkedIn versions from master content
    - [ ] **Cross-Reference Management** - Track related docs, API changes, product updates within campaigns

**Supporting Infrastructure:**

- **Workflow & Collaboration**
    - [ ] **Approval Stages** - Technical content accuracy validation workflows
    - [ ] **Real-Time Collaboration** - Comments and task assignments within campaigns
    - [ ] **Role-Based Dashboards** - Customized views for content creators, managers, and reviewers

**Quick Wins (maintain momentum):**
- [ ] **TypeScript cleanup**: Fix remaining 3 `any` types in search route, db-utils, and WriteMode
- [ ] **useEffect dependencies**: Review and fix missing dependencies in Collections.tsx and other components
- [ ] **Settings Validation** - Form validation and API key verification


### Planning for version 0.5.0

- **User experience enhancements**
    - [ ] **User Onboarding** - Welcome tour and empty state guidance
    - [ ] **Content Organization** - Tags, categories, and advanced filtering
    - [ ] **Advanced search** - Filters, saved searches, and search history

- **Platform expansion**
    - [ ] **LinkedIn integration** - Professional content publishing
    - [ ] **Twitter/X integration** - Social media content distribution
    - [ ] **WordPress integration** - Blog platform connectivity

- **Analytics and insights**
    - [ ] **Content performance tracking** - Views, engagement, conversions
    - [ ] **Publishing analytics** - Success rates, optimal timing
    - [ ] **Campaign effectiveness** - ROI and goal tracking


----------

# General guidance for how we work on Bebop

## Working Session Structure

### Recommended Approach
1. **Status Check** (5 min) - Review current state and any blockers
2. **Focus Selection** (5 min) - Pick 1-3 related issues to tackle
3. **Implementation** (30-90 min) - Code, test, and iterate
4. **Review & Commit** (10 min) - Test, document, and commit changes
5. **Next Steps** (5 min) - Plan next session priorities

### Best Practices
- **Small, focused commits** with clear messages (and do NOT reference AI tools)
- **Test before committing** - ensure builds pass quality testing
- **Document decisions** - update this roadmap as needed
- **Stay focused** - avoid context switching between unrelated areas