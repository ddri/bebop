# Bebop Documentation

Welcome to the Bebop documentation. This comprehensive guide covers both developer documentation for contributing to Bebop and technical documentation explaining the architecture and functionality of the system.

## About Bebop

Bebop is an opinionated content publishing tool for technical content creators. It is built around the workflow familiar to roles such as Developer Relations, where managing content to publish and cross-post across multiple publishing destinations often involves a range of writing tools, copying and pasting, and spreadsheets to track it all.

Key features include:
- **Eliminating content silos:** Bring all your writing together in one place
- **Saving time and effort:** Automate repetitive tasks and streamline the publishing process
- **Ensuring consistency:** Maintain a single source of truth for your content and easily update it across all platforms
- **Combining content dynamically:** Merge multiple notes into a single output with Collections
- **Streamlining cross-posting:** Publish your content to various platforms without manual copying and pasting
- **Automating reporting:** Understand what content is most effective in campaigns

## Documentation Sections

### [Developer Documentation](./developer/README.md)

The developer documentation is designed for contributors who want to set up a development environment, understand the codebase, and contribute to Bebop.

- [Getting Started](./developer/README.md#getting-started)
- [Project Structure](./developer/README.md#project-structure)
- [Development Workflow](./developer/README.md#development-workflow)
- [API Reference](./developer/README.md#api-reference)
- [Contributing Guidelines](./developer/README.md#contributing-guidelines)
- [Setup Guide](./developer/setup-guide.md)

### [Technical Documentation](./technical/README.md)

The technical documentation provides detailed information about Bebop's architecture, components, and systems.

- [Architecture](./technical/architecture.md)
- [Database Schema](./technical/database-schema.md)
- [API Reference](./technical/api-reference.md)
- [Component Structure](./technical/component-structure.md)
- [GitHub Integration](./technical/github-integration.md)
- [Publishing System](./technical/publishing-system.md)

## System Overview

Bebop is built with the following technology stack:

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Prisma ORM
- **Authentication**: Clerk for user authentication
- **Content Editing**: CodeMirror-based markdown editor
- **External Integrations**: GitHub, Dev.to, Hashnode, social media platforms

### Application Features

#### Content Management

- Create and edit markdown content with a rich editor
- Organize content into topics and collections
- Track content changes and version history

#### Collections

- Group related topics into collections
- Reorder topics within collections
- Publish collections as a single document

#### Publishing

- Publish to multiple platforms from a single interface
- Schedule content for future publishing
- Track published content across platforms

#### Campaign Management

- Create content campaigns with schedules
- Track campaign progress and performance
- Coordinate multi-platform publishing

#### GitHub Integration

- Back up content to GitHub repositories
- Sync content between Bebop and GitHub
- Use Git version control for content

#### Media Management

- Upload and manage media files
- Embed media in content
- Optimize media for different platforms

## Getting Help

If you have questions or need assistance, you can:

1. Check the documentation sections above
2. Look for answers in existing GitHub issues
3. Create a new GitHub issue for bugs or feature requests

## Contributing to Documentation

This documentation is maintained alongside the codebase. To contribute:

1. Make changes to the markdown files in the `docs/` directory
2. Follow the established format and structure
3. Update the relevant table of contents if adding new documents
4. Submit a pull request with your changes

## License

Bebop is licensed under the terms included in the [LICENSE](../LICENSE) file at the root of the repository.