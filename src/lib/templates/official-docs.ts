// src/lib/templates/official-docs.ts

import { Template } from '@/types/templates';

export const bebopDocsTemplate: Template = {
  id: "bebop-docs-v1",
  type: "official-docs",
  name: "Bebop Documentation",
  description: "Official Bebop user guide and documentation",
  version: "0.2.0",
  author: {
    name: "Bebop Team",
    url: "https://github.com/yourusername/bebop" // Update with actual repo
  },
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  tags: ["documentation", "getting-started"],
  collections: [
    {
      name: "Getting Started with Bebop",
      description: "Everything you need to know to start using Bebop effectively",
      topics: [
        {
          name: "Welcome to Bebop",
          description: "Introduction and key features",
          order: 1,
          content: `# Welcome to Bebop

Welcome to Bebop, your modern content management system for technical writing. Whether you're writing documentation, blog posts, or technical articles, Bebop provides a streamlined environment for creating and publishing your content.

## What is Bebop?

Bebop is a content management system designed specifically for technical writers and developers. It combines:

- A focused writing environment
- Powerful organization tools
- Flexible publishing options

## Key Features

### 🖋 Write Mode
Our distraction-free writing environment includes:
- Live Markdown preview
- Image uploads
- Rich media embeds
- Fullscreen mode

### 📑 Topics
Organize your content with Topics:
- Individual pieces of content
- Markdown formatting
- Easy editing and updates
- Flexible organization

### 📚 Collections
Group related content with Collections:
- Combine multiple topics
- Arrange content order
- Publish as a single unit
- Share across platforms

### 🌐 Publishing
Share your work anywhere:
- Direct web publishing
- Dev.to integration
- Hashnode integration
- Custom HTML export

## Getting Started

1. Create your first piece of content using Write Mode
2. Organize your content into Topics
3. Group related Topics into Collections
4. Publish your work to your preferred platform

Explore the rest of this guide to learn more about each feature in detail.`
        },
        {
          name: "Writing in Bebop",
          description: "Master Bebop's writing environment",
          order: 2,
          content: `# Writing in Bebop

Bebop's Write Mode provides a powerful environment for creating technical content. This guide will help you make the most of our writing tools.

## The Write Mode Interface

### Editor Features
- **Live Preview**: See your content rendered in real-time
- **Toolbar**: Quick access to common formatting
- **Full Screen**: Distraction-free writing experience
- **Auto-save**: Never lose your work

## Markdown Support

Bebop supports standard Markdown plus some special features:

### Basic Formatting
\`\`\`markdown
# Header 1
## Header 2
### Header 3

*italic text*
**bold text**
~~strikethrough~~

- Bullet points
1. Numbered lists
\`\`\`

### Code Blocks
\`\`\`javascript
// Example code with syntax highlighting
function hello() {
  console.log("Hello from Bebop!");
}
\`\`\`

### Media Support
- Images can be dragged and dropped
- Videos can be embedded via URL
- Tweets and other social media can be embedded

## Best Practices

1. **Save Regularly**: While we auto-save, it's good practice to manually save important changes
2. **Use Preview**: Check how your content looks before publishing
3. **Organize Content**: Break long content into multiple topics
4. **Use Headers**: Structure your content with clear headers

## Keyboard Shortcuts

- \`Ctrl/Cmd + S\`: Save
- \`Ctrl/Cmd + E\`: Toggle preview
- \`F11\`: Toggle fullscreen
- \`Ctrl/Cmd + Shift + P\`: Command palette`
        },
        {
          name: "Managing Topics",
          description: "Learn to organize and manage your content effectively",
          order: 3,
          content: `# Managing Topics in Bebop

Topics are the building blocks of content in Bebop. This guide explains how to effectively manage your topics.

## What is a Topic?

A Topic is a single piece of content that can be:
- Written and edited independently
- Used in multiple collections
- Tagged and categorized
- Published individually or as part of a collection

## Creating Topics

You can create topics in two ways:
1. Using Write Mode for a focused writing experience
2. Using the Topics page for quick creation

### Best Practices for Topic Creation

1. **Clear Names**: Use descriptive names that indicate the content
2. **Good Descriptions**: Add helpful descriptions for easy reference
3. **Consistent Structure**: Use similar formatting across topics
4. **Regular Updates**: Keep content current

## Organizing Topics

The Topics page provides several tools for organization:

- **Search**: Find topics quickly
- **Sort**: Arrange by date, name, or status
- **Filter**: Focus on specific categories
- **Bulk Actions**: Manage multiple topics at once

## Topic Lifecycle

1. **Creation**: Write new content
2. **Editing**: Update and improve
3. **Collection**: Add to collections
4. **Publishing**: Share with readers
5. **Maintenance**: Keep content current

## Tips for Topic Management

1. **Regular Review**: Periodically review and update topics
2. **Version Control**: Track major changes
3. **Consistent Styling**: Maintain consistent formatting
4. **Clear Organization**: Use logical naming and structure`
        },
        {
          name: "Working with Collections",
          description: "How to use collections for content organization",
          order: 4,
          content: `# Working with Collections in Bebop

Collections help you organize and publish related content together. This guide covers everything you need to know about collections.

## Understanding Collections

A Collection is a group of topics that:
- Share a common theme
- Should be published together
- Form a complete series or guide
- Can be shared as a single unit

## Creating Collections

To create a collection:
1. Navigate to Collections
2. Click "New Collection"
3. Add a name and description
4. Select topics to include
5. Arrange topics in desired order

### Collection Best Practices

1. **Logical Grouping**: Group related content together
2. **Clear Order**: Arrange topics in a logical sequence
3. **Consistent Naming**: Use clear, descriptive names
4. **Complete Coverage**: Include all relevant topics

## Managing Collections

Collections can be:
- **Edited**: Update included topics
- **Reordered**: Change topic sequence
- **Published**: Share as a complete unit
- **Unpublished**: Remove from public view

## Publishing Options

Bebop offers multiple publishing destinations:

1. **Web Publishing**
   - Direct web link
   - Custom styling
   - Instant updates

2. **Dev.to Integration**
   - Series publishing
   - Community engagement
   - Platform features

3. **Hashnode Integration**
   - Blog integration
   - Custom domain support
   - Community features

## Collection Tips

1. Think about reader journey
2. Maintain consistent style
3. Update all topics together
4. Review before publishing`
        },
        {
          name: "Publishing Guide",
          description: "Learn about Bebop's publishing options",
          order: 5,
          content: `# Publishing with Bebop

Bebop provides flexible options for sharing your content. This guide covers all publishing features and best practices.

## Publishing Options

### 1. Direct Web Publishing
- Instant web link
- Custom styling
- Quick updates
- No external account needed

### 2. Dev.to Integration
- Reach developer community
- Series support
- Community engagement
- Analytics

### 3. Hashnode Integration
- Blog integration
- Custom domain
- Newsletter features
- Analytics

## Publishing Process

1. **Prepare Content**
   - Review and edit
   - Check formatting
   - Preview content

2. **Choose Platform**
   - Select publishing destination
   - Configure settings
   - Set visibility

3. **Publish**
   - Submit content
   - Verify publication
   - Share links

## Publishing Tips

1. **Review Thoroughly**
   - Check formatting
   - Verify links
   - Test media embeds

2. **Platform-Specific**
   - Use appropriate tags
   - Add platform-specific features
   - Follow community guidelines

3. **Post-Publishing**
   - Monitor engagement
   - Respond to comments
   - Track analytics

## Publishing Best Practices

1. **Consistent Schedule**
   - Plan publication dates
   - Maintain regular updates
   - Inform readers

2. **Quality Control**
   - Multiple reviews
   - Technical accuracy
   - Clear formatting

3. **Engagement**
   - Monitor feedback
   - Respond to comments
   - Update as needed`
        }
      ]
    }
  ]
};

export const getBebopDocs = async (): Promise<Template> => {
  // In the future, this could fetch from a remote source
  return bebopDocsTemplate;
};