# Bebop Development Roadmap

**Current Version**: v0.3.5 (Quality & Search release)  
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
    - ✅ Fix remaining TypeScript `any` types (87% improvement)
    - ✅ Clean up unused imports and variables
    - ✅ Add comprehensive error handling and boundaries
    - ✅ Implement consistent loading states
    - ✅ Database connection resilience with retry logic
    
- **Major feature addition**
    - ✅ Comprehensive search functionality across topics and collections
    - ✅ Real-time search with keyboard shortcuts (Cmd+K)
    - ✅ MongoDB text indexing for efficient search
    - ✅ Smart result highlighting and relevance scoring

### Planning for version 0.4.0
    - [ ] TypeScript any types: ~30 instances across hooks, API middleware, and social clients
    - [ ] Missing error boundaries: Components lack proper error handling
    - [ ] Inconsistent loading states: Some operations don't provide user feedback
    - [ ] Unused imports: ~70 unused import statements (warnings)
    - [ ] useEffect dependencies: Missing dependencies in Collections.tsx
    - [ ] Performance optimization: Bundle size and runtime optimizations

### Planning for version 0.4.0

- Content version control
    - [ ] Content versioning and history

- Content scheduling 
    - [ ] Publishing Workflow for Scheduling

- Enhanced media management
    - [ ] Explore enhanced media management

- Analytics and metrics
    - [ ] Publishing analytics and metrics

- Templates 
    - [ ] Content templates and snippets

- Writing improvements
    - [ ] Advanced markdown features
    - [ ] Collaborative editing features

- Improved UX and workflow
    - [ ] Topic Card UX** - Fix frustrating interaction patterns
    - [ ] Workflow Indicators** - Visual connections between Write → Topics → Collections
    - [ ] Bulk Operations** - Multi-select for topics and collections

- Miscellaneous technical changes
    - [ ] Error Handling - Comprehensive error boundaries and user feedback
    - [ ] Settings Validation - Form validation and API key verification
    - [ ] Loading States - Add user feedback for all actions


### Planning for version 0.5.0

- Search functionality for website and content
    - [ ] Search Functionality - Useful for content management

- Onboarding for new users
    - [ ] User Onboarding - Welcome tour and empty state guidance

- Content management
    - [ ] Content Organization - Tags, categories, and advanced filtering


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