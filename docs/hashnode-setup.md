# 🌐 Hashnode Integration Setup Guide

This guide will help you set up Hashnode integration in Bebop to automatically publish your content to your Hashnode blog or publication.

## 📋 Prerequisites

- Active Hashnode account ([hashnode.com](https://hashnode.com))
- Your own blog or access to a team publication
- Bebop platform configured and running

## 🔑 Getting Your Hashnode API Token

### Step 1: Access Developer Settings
1. Log in to your [Hashnode dashboard](https://hashnode.com)
2. Click on your profile picture (top right)
3. Select **"Account Settings"**
4. Navigate to **"Developer"** tab in the left sidebar

### Step 2: Generate Personal Access Token
1. Click **"Generate New Token"**
2. Provide a descriptive name (e.g., "Bebop Integration")
3. Select required scopes:
   - ✅ **Write articles** (required)
   - ✅ **Read user info** (recommended)
   - ✅ **Manage publications** (if using team publications)
4. Click **"Generate Token"**
5. **⚠️ Important**: Copy the token immediately - it won't be shown again!

## 🏗️ Finding Your Publication ID (Optional)

If you want to publish to a specific publication instead of your personal blog:

### Method 1: Through Hashnode Dashboard
1. Go to your publication dashboard
2. Look at the URL: `https://hashnode.com/publications/[PUBLICATION_ID]`
3. Copy the publication ID from the URL

### Method 2: Using GraphQL Playground
1. Visit [Hashnode's GraphQL Playground](https://gql.hashnode.com/)
2. Run this query:
```graphql
query {
  me {
    publications {
      id
      title
      domain
    }
  }
}
```
3. Use your personal access token in the authorization header
4. Find your publication ID in the response

## ⚙️ Configuring Bebop

### Step 1: Add Destination in Bebop
1. Navigate to **Settings → Destinations** in Bebop
2. Click **"Add Destination"**
3. Select **"Hashnode"** from the platform list

### Step 2: Configure Authentication
1. **API Token**: Paste your Hashnode personal access token
2. **Publication ID**: (Optional) Enter your publication ID
   - Leave empty to publish to your personal blog
   - Enter ID to publish to a specific publication

### Step 3: Test Connection
1. Click **"Test Connection"** to verify your settings
2. You should see a success message confirming the connection
3. Save your destination configuration

## 📝 Content Publishing Features

### Supported Content Types
- ✅ **Blog Posts**: Full articles with rich formatting
- ✅ **Technical Articles**: Code syntax highlighting included
- ✅ **Long-form Content**: No length restrictions

### Automatic Features
- **Title**: Automatically set from your content title
- **Slug**: Generated from title (customizable in Hashnode)
- **Tags**: Extracted from hashtags in your content
- **Cover Image**: First image in content used as cover
- **Publication Date**: Set according to your schedule

### Content Adaptation
Bebop automatically optimizes your content for Hashnode:

```markdown
# Your Content Title

Your introduction paragraph...

![Cover Image](https://example.com/image.jpg)

## Section Headers
- Become proper H2/H3 tags
- Maintain hierarchy

#webdev #javascript #tutorial
- Hashtags become Hashnode tags
- Automatically cleaned and formatted
```

## 🎯 Publishing Workflow

### 1. Create Content in Bebop
- Use the campaign-based content editor
- Write in Markdown with live preview
- Add relevant hashtags for automatic tagging

### 2. Schedule Publication
- Select your Hashnode destination
- Choose publication date/time
- Review content adaptation preview

### 3. Monitor Publishing
- Track status in real-time dashboard
- Get notifications for successful/failed publications
- Manual retry for failed attempts

## 🔧 Advanced Configuration

### Custom Publication Settings
```bash
# Environment variables (optional)
HASHNODE_API_KEY="your_personal_access_token"
HASHNODE_PUBLICATION_ID="your_publication_id"  # Optional
HASHNODE_API_URL="https://gql.hashnode.com/"   # Default endpoint
```

### Content Formatting Options
- **Code Blocks**: Automatic syntax highlighting
- **Images**: Optimized for Hashnode's CDN
- **Links**: Preserved with proper formatting
- **Lists**: Converted to Hashnode's list format

## 🚨 Troubleshooting

### Common Issues

#### ❌ "Invalid API Token"
**Solution**: 
1. Verify your token is correct
2. Check token hasn't expired
3. Ensure proper scopes are selected
4. Regenerate token if necessary

#### ❌ "Publication Not Found"
**Solution**:
1. Verify publication ID is correct
2. Ensure you have write access to the publication
3. Try publishing to personal blog (leave publication ID empty)

#### ❌ "Content Publishing Failed"
**Solution**:
1. Check content length and formatting
2. Verify hashtags are valid
3. Ensure images are accessible
4. Review Hashnode's content guidelines

### API Rate Limits
- Hashnode allows **100 requests per hour** per token
- Bebop automatically handles rate limiting
- Failed requests are retried with exponential backoff

### Content Guidelines
- **Title**: 60 characters or less recommended
- **Tags**: Maximum 5 tags per article
- **Images**: HTTPS URLs only, optimized sizes preferred
- **Content**: Valid Markdown formatting required

## 📊 Analytics and Monitoring

### Publishing Metrics
- **Success Rate**: Track successful publications
- **Response Times**: Monitor API performance
- **Error Rates**: Identify common issues
- **Content Performance**: Track views and engagement

### Real-time Monitoring
- Live status updates during publishing
- Detailed error messages for troubleshooting
- Publishing activity feed with timestamps
- Retry management for failed publications

## 🔒 Security Best Practices

### Token Management
- **Store securely**: Never commit tokens to version control
- **Rotate regularly**: Generate new tokens periodically
- **Limit scope**: Only grant necessary permissions
- **Monitor usage**: Review API activity regularly

### Content Safety
- **Review before publishing**: Use preview mode
- **Backup content**: Keep local copies
- **Test with drafts**: Use test publications first
- **Monitor output**: Verify published content

## 📚 Additional Resources

### Hashnode Documentation
- [Hashnode API Documentation](https://hashnode.com/api/docs)
- [GraphQL Schema Reference](https://gql.hashnode.com/)
- [Publishing Guidelines](https://hashnode.com/guidelines)
- [Community Support](https://hashnode.com/discord)

### Bebop Resources
- [Platform Integration Overview](../README.md#platform-integrations)
- [Content Creation Guide](content-creation.md)
- [Scheduling Documentation](scheduling.md)
- [Troubleshooting Guide](troubleshooting.md)

## 🤝 Support

If you encounter issues with Hashnode integration:

1. **Check Logs**: Review publishing activity in monitoring dashboard
2. **Test Connection**: Verify API token and configuration
3. **Review Content**: Ensure content meets Hashnode guidelines
4. **Contact Support**: [Create GitHub issue](https://github.com/ddri/bebop/issues)

---

**Happy publishing with Hashnode! 🚀**