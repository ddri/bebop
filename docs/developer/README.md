# Bebop Developer Documentation

Welcome to the Bebop developer documentation. This guide will help you understand the project structure, setup process, and development workflow for contributing to Bebop.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [API Reference](#api-reference)
- [Contributing Guidelines](#contributing-guidelines)

## Introduction

Bebop is an opinionated content publishing tool for technical content creators, particularly focused on streamlining the workflow for roles like Developer Relations. It helps manage content across multiple publishing destinations without the need for manual copying, pasting, and tracking with spreadsheets.

Key features:
- **Content Management**: Write, organize, and store all your technical content
- **Collections**: Combine multiple topics into a single output
- **Cross-posting**: Publish content to various platforms automatically
- **Campaign Management**: Track and manage content for specific campaigns
- **GitHub Integration**: Backup and sync content with GitHub repositories
- **Social Sharing**: Share content across social platforms

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- MongoDB (for document storage)
- GitHub account (for GitHub integration features)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd bebop
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Set up the required environment variables in the `.env` file:
   - `DATABASE_URL`: MongoDB connection string
   - Authentication credentials (Clerk)
   - Storage configuration (if using S3)

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

Bebop follows the Next.js 14+ App Router structure.

```
bebop/
├── src/                  # Source code
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── (pages)/      # Page components
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries and services
│   ├── types/            # TypeScript types and interfaces
│   └── utils/            # Utility functions
├── prisma/               # Prisma ORM configuration and schema
├── public/               # Static assets
└── scripts/              # Utility scripts
```

### Key Directories:

- `/src/app/api`: Server-side API route handlers
- `/src/components`: Reusable UI components
- `/src/hooks`: Custom React hooks for data fetching and state management
- `/src/lib`: Helper libraries and services
- `/prisma`: Database schema and Prisma client configuration

## Development Workflow

### Local Development

1. Start the development server:
   ```
   npm run dev
   ```

2. Make your changes to the codebase
3. Test your changes locally
4. Commit your changes with a descriptive commit message

### Code Style

- We use ESLint for code linting
- Run linting with `npm run lint`
- Follow the existing code style for consistency

### Database Changes

When making changes to the database schema:

1. Update the Prisma schema in `prisma/schema.prisma`
2. Run migrations with Prisma to apply changes
3. Update any related types or interfaces

## API Reference

Bebop offers several API endpoints for managing content and integrations.

### Topics API

- `GET /api/topics` - List all topics
- `POST /api/topics` - Create a new topic
- `GET /api/topics/:id` - Get a specific topic
- `PUT /api/topics/:id` - Update a topic
- `DELETE /api/topics/:id` - Delete a topic

### Collections API

- `GET /api/collections` - List all collections
- `POST /api/collections` - Create a new collection
- `GET /api/collections/:id` - Get a specific collection
- `PUT /api/collections/:id` - Update a collection
- `DELETE /api/collections/:id` - Delete a collection

### GitHub Integration API

- `GET /api/github` - Check GitHub connection status
- `GET /api/github/repositories` - List GitHub repositories
- `POST /api/github/backup` - Backup content to GitHub

### Publishing API

- `POST /api/publish` - Publish content to various platforms
- `POST /api/publish/:id` - Publish a specific collection
- `POST /api/unpublish` - Unpublish content

## Contributing Guidelines

We welcome contributions to Bebop! Here's how you can contribute:

1. **Fork the repository** and create a new branch for your feature or bug fix
2. **Make your changes** following the coding standards
3. **Write tests** if applicable
4. **Update documentation** to reflect your changes
5. **Submit a pull request** with a clear description of your changes

Please note that Bebop is a personal project, so there might be delays in reviewing and merging pull requests.