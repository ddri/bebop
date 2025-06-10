# Bebop Component Structure

This document outlines the component structure of Bebop, explaining the key UI components, their relationships, and how they work together to create the user interface.

## Overview

Bebop follows a component-based architecture using React and Next.js. The UI is built with a combination of custom components and components from the shadcn UI library, which is built on top of Radix UI.

## Component Organization

The components are organized in the following directory structure:

```
src/components/
├── ui/                 # Base UI components (shadcn)
├── editor/             # Markdown editor components
│   └── cards/          # Rich media cards for the editor
├── settings/           # Settings-related components
├── social/             # Social media integration components
│   └── icons/          # Social media icons
└── templates/          # Template management components
```

## Key Components

### Layout Component

The `Layout` component (`src/components/Layout.tsx`) provides the overall page structure including:
- Navigation
- Sidebar
- Main content area

This component is used by all the pages to maintain a consistent layout.

```jsx
// Usage example
<Layout pathname={pathname}>
  <PageContent />
</Layout>
```

### Markdown CMS Component

The `MarkdownCMS` component (`src/components/MarkdownCMS.tsx`) is a core component for managing topics/documents. It provides:
- List of topics
- Topic creation form
- Topic editing interface
- Sorting and filtering options

This component uses the `useTopics` hook to fetch and manage topic data.

### Editor Components

#### MarkdownEditor

The `MarkdownEditor` component (`src/components/editor/MarkdownEditor.tsx`) provides a rich markdown editing experience based on CodeMirror. Features include:
- Syntax highlighting
- Preview mode
- Markdown shortcuts
- Rich media embedding

```jsx
// Usage example
<MarkdownEditor
  content={content}
  onChange={setContent}
  theme={theme}
/>
```

#### RichMediaTransformer

The `RichMediaTransformer` component (`src/components/editor/RichMediaTransformer.tsx`) handles transforming URLs and other content into rich media cards.

### Collection Management Components

#### Collections

The `Collections` component (`src/components/Collections.tsx`) manages collections of topics, including:
- List of collections
- Collection creation
- Collection editing
- Topic ordering within collections

#### CollectionCard

The `CollectionCard` component (`src/components/CollectionCard.tsx`) displays a collection as a card with summary information and actions.

### Campaign Components

#### Campaigns

The `Campaigns` component (`src/components/Campaigns.tsx`) manages content campaigns, including:
- List of campaigns
- Campaign creation and editing
- Campaign status management

#### CampaignDetails

The `CampaignDetails` component (`src/components/CampaignDetails.tsx`) shows detailed information about a specific campaign.

#### CampaignPlanner

The `CampaignPlanner` component (`src/components/CampaignPlanner.tsx`) provides planning tools for content campaigns.

#### CampaignMetrics

The `CampaignMetrics` component (`src/components/CampaignMetrics.tsx`) displays metrics and analytics for campaigns.

### Publishing Components

#### DevToPublisher

The `DevToPublisher` component (`src/components/DevToPublisher.tsx`) handles publishing content to Dev.to.

#### HashnodePublisher

The `HashnodePublisher` component (`src/components/HashnodePublisher.tsx`) handles publishing content to Hashnode.

#### SocialPublisher

The `SocialPublisher` component (`src/components/social/SocialPublisher.tsx`) manages publishing to social media platforms.

### Media Management

#### Media

The `Media` component (`src/components/Media.tsx`) provides media file management capabilities.

#### ImageUploader

The `ImageUploader` component (`src/components/ImageUploader.tsx`) handles uploading and managing images.

### Settings Components

#### GitHubSettings

The `GitHubSettings` component (`src/components/settings/GitHubSettings.tsx`) manages GitHub integration settings.

#### SocialSettings

The `SocialSettings` component (`src/components/settings/SocialSettings.tsx`) manages social media account connections.

### UI Components

Bebop uses the shadcn UI library for base UI components. These are stored in `src/components/ui/` and include:

- `button.tsx` - Button components
- `card.tsx` - Card components
- `dialog.tsx` - Dialog/modal components
- `input.tsx` - Input components
- `textarea.tsx` - Textarea components
- `select.tsx` - Select components
- And many more...

## Component Hierarchy

The following diagram shows the high-level component hierarchy for the main pages:

```
Layout
├── Navigation
└── Page Content
    ├── Home Page
    │   └── Feature Cards
    │
    ├── Topics Page
    │   └── MarkdownCMS
    │       ├── Topic List
    │       └── MarkdownEditor
    │
    ├── Collections Page
    │   └── Collections
    │       ├── CollectionCard
    │       └── CollectionEditor
    │
    ├── Campaigns Page
    │   └── Campaigns
    │       ├── CampaignCard
    │       └── CampaignDetails
    │           ├── CampaignPlanner
    │           └── CampaignMetrics
    │
    ├── Media Page
    │   └── Media
    │       └── ImageUploader
    │
    └── Settings Page
        ├── GitHubSettings
        └── SocialSettings
```

## Component Data Flow

Components in Bebop follow these data flow patterns:

1. **API Data Fetching**: Custom hooks (e.g., `useTopics`, `useCollections`) fetch data from the API and provide it to components.

2. **State Management**: Components use React's useState and useEffect for local state management.

3. **Props Passing**: Data and callbacks are passed down through props.

4. **Context Usage**: Theme context is used for dark/light mode theming.

Example data flow for the Topics page:

```
// Data flow example for Topics page
useTopics hook  ───► MarkdownCMS component
    │                     │
    │                     ▼
    │               Topic List UI
    │                     │
    ▼                     ▼
API Endpoints       MarkdownEditor
                         │
                         ▼
                   Content Saving
```

## Component Styling

Styling in Bebop is achieved through:

1. **Tailwind CSS**: Utility classes for most styling needs
2. **shadcn UI**: Pre-styled components based on Radix UI
3. **CSS Modules**: For component-specific styles that go beyond Tailwind

Example of Tailwind styling:

```jsx
<div className="bg-[#1c1c1e] rounded-lg p-6 border-0 flex flex-col">
  <h2 className="text-2xl font-semibold mb-2 text-white">Topics</h2>
</div>
```

## Component Best Practices

When working with Bebop components:

1. **Component Composition**: Use composition rather than inheritance
2. **Props Typing**: Use TypeScript interfaces for component props
3. **Separation of Concerns**: Keep UI components separate from data fetching logic
4. **Responsive Design**: Ensure components work well on all screen sizes
5. **Accessibility**: Follow accessibility best practices, leveraging Radix UI's built-in accessibility features

## Testing Components

Components can be tested using:

1. **Unit Tests**: Testing individual component functionality
2. **Integration Tests**: Testing component interactions
3. **Visual Regression Tests**: Ensuring UI appearance remains consistent

## Extending the Component Library

To add new components to Bebop:

1. Create a new file in the appropriate directory under `src/components/`
2. Define the component with proper TypeScript typing
3. Use existing UI components from shadcn where possible
4. Follow the established styling patterns
5. Add any necessary custom hooks for data fetching
6. Import and use the component where needed