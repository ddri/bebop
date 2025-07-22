# 👩‍💻 Dev.to Integration Setup Guide

This guide will help you set up Dev.to integration in Bebop to automatically publish your technical content to the Dev.to community platform.

## 📋 Prerequisites

- Active Dev.to account ([dev.to](https://dev.to))
- Verified email address on Dev.to
- Bebop platform configured and running

## 🔑 Getting Your Dev.to API Key

### Step 1: Access Account Settings
1. Log in to [Dev.to](https://dev.to)
2. Click on your profile picture (top right)
3. Select **"Settings"** from the dropdown menu
4. Navigate to **"Account"** tab in the left sidebar

### Step 2: Generate API Key
1. Scroll down to **"DEV Community API Keys"** section
2. Click **"Generate API Key"**
3. Provide a descriptive name (e.g., "Bebop Content Publisher")
4. **⚠️ Important**: Copy the API key immediately - it won't be shown again!

### Step 3: Verify Permissions
Your API key automatically includes:
- ✅ **Write articles** (create and update)
- ✅ **Read user info** (your profile data)
- ✅ **Manage articles** (edit your published content)

## ⚙️ Configuring Bebop

### Step 1: Add Destination in Bebop
1. Navigate to **Settings → Destinations** in Bebop
2. Click **"Add Destination"**
3. Select **"Dev.to"** from the platform list

### Step 2: Configure Authentication
1. **API Key**: Paste your Dev.to API key
2. **Username**: Enter your Dev.to username (for verification)

### Step 3: Test Connection
1. Click **"Test Connection"** to verify your settings
2. You should see a success message with your profile info
3. Save your destination configuration

## 📝 Content Publishing Features

### Supported Content Types
- ✅ **Technical Articles**: Perfect for coding tutorials
- ✅ **How-to Guides**: Step-by-step technical content
- ✅ **Blog Posts**: General technical writing
- ✅ **Discussion Posts**: Community engagement content

### Automatic Features
- **Title**: Set from your content title
- **Slug**: Auto-generated from title
- **Tags**: Extracted from hashtags (max 4 tags)
- **Publication Status**: Published immediately or as draft
- **Canonical URL**: Optional link to original source

### Content Adaptation
Bebop automatically optimizes your content for Dev.to:

```markdown
---
title: "Your Article Title"
published: true
tags: webdev, javascript, tutorial, beginners
canonical_url: "https://yourblog.com/original-post"
cover_image: "https://example.com/cover.jpg"
---

# Your Content

Dev.to uses front matter for metadata:
- Title becomes the article title
- Tags from your hashtags
- Cover image from first image
- Published status from schedule settings

## Code Examples
```javascript
// Syntax highlighting included
function example() {
  return "Dev.to loves code!";
}
```

#webdev #javascript #tutorial #beginners
```

## 🎯 Publishing Workflow

### 1. Create Content in Bebop
- Use technical writing templates
- Include code examples with syntax highlighting
- Add relevant hashtags for the Dev.to community

### 2. Schedule Publication
- Select your Dev.to destination
- Choose publication date/time
- Set as published or draft

### 3. Monitor Publishing
- Track status in real-time dashboard
- Get notifications for successful/failed publications
- Edit published articles through Bebop updates

## 🏷️ Dev.to Tags and Community

### Popular Technical Tags
- **Languages**: `javascript`, `python`, `rust`, `go`, `typescript`
- **Frameworks**: `react`, `vue`, `angular`, `nodejs`, `nextjs`
- **Topics**: `webdev`, `programming`, `tutorial`, `beginners`
- **Tools**: `docker`, `git`, `vscode`, `linux`, `aws`

### Tag Strategy
- Use **4 tags maximum** (Dev.to limit)
- Include **one broad tag** (`webdev`, `programming`)
- Add **one specific technology** (`react`, `python`)
- Consider **skill level** (`beginners`, `intermediate`, `advanced`)
- Use **content type** (`tutorial`, `showdev`, `discuss`)

### Content Guidelines
- **Title**: Clear and descriptive (under 80 characters)
- **Introduction**: Hook readers in first paragraph
- **Code Examples**: Use proper syntax highlighting
- **Structure**: Use headers, lists, and clear sections
- **Community Focus**: Engage with Dev.to audience

## 🔧 Advanced Configuration

### Environment Variables
```bash
# Optional environment setup
DEVTO_API_KEY="your_dev_to_api_key"
DEVTO_API_URL="https://dev.to/api"  # Default endpoint
DEVTO_USERNAME="your_username"      # For verification
```

### Front Matter Options
```yaml
---
title: "Your Article Title"           # Required
published: true                      # true/false
tags: webdev, javascript, tutorial   # Up to 4 tags
canonical_url: "https://..."         # Optional
cover_image: "https://..."           # Optional
series: "Your Series Name"           # Optional
description: "Article summary"       # Optional
---
```

### Content Formatting
- **Code Blocks**: Use triple backticks with language
- **Images**: HTTPS URLs, optimized for mobile
- **Links**: Use descriptive anchor text
- **Lists**: Numbered or bulleted for readability
- **Headers**: H1 for title, H2/H3 for sections

## 🚨 Troubleshooting

### Common Issues

#### ❌ "Invalid API Key"
**Solution**: 
1. Verify API key is correct and complete
2. Check if key has been revoked
3. Regenerate new API key if needed
4. Ensure proper copy/paste without extra spaces

#### ❌ "Tag Limit Exceeded"
**Solution**:
1. Limit hashtags to 4 maximum
2. Remove duplicate or similar tags
3. Choose most relevant tags for content
4. Check Dev.to's allowed tags list

#### ❌ "Article Publishing Failed"
**Solution**:
1. Verify content meets Dev.to guidelines
2. Check for proper Markdown formatting
3. Ensure all required fields are present
4. Review character limits for title/description

#### ❌ "Rate Limit Exceeded"
**Solution**:
1. Wait for rate limit reset (typically 1 hour)
2. Reduce publishing frequency
3. Schedule publications with longer intervals
4. Contact Dev.to support if limits seem incorrect

### Content Validation
- **Title Length**: 128 characters maximum
- **Tag Format**: Lowercase, alphanumeric, no spaces
- **Image URLs**: Must be HTTPS and accessible
- **Code Syntax**: Verify language identifiers are correct

## 📊 Analytics and Monitoring

### Publishing Metrics
- **Success Rate**: Track successful publications
- **Community Engagement**: Views, reactions, comments
- **Tag Performance**: Which tags drive traffic
- **Publishing Times**: Optimal times for your audience

### Real-time Monitoring
- Live status updates during publishing
- Detailed error messages for troubleshooting
- Publishing activity feed with timestamps
- Community engagement notifications

## 🌟 Dev.to Best Practices

### Content Strategy
- **Be Helpful**: Focus on solving problems
- **Show Your Work**: Include code examples and demos
- **Engage**: Respond to comments and questions
- **Be Consistent**: Regular publishing builds audience

### Community Engagement
- **Read and Comment**: Engage with other developers
- **Share Knowledge**: Contribute valuable insights
- **Ask Questions**: Use discussion posts for community input
- **Follow Guidelines**: Respect community standards

### SEO and Discoverability
- **Descriptive Titles**: Clear value proposition
- **Relevant Tags**: Match content to community interests
- **Good Introduction**: Hook readers immediately
- **Call to Action**: Encourage engagement

## 🔒 Security Best Practices

### API Key Management
- **Store Securely**: Never commit to version control
- **Rotate Regularly**: Generate new keys periodically
- **Monitor Usage**: Track API activity
- **Revoke Unused**: Remove old or unused keys

### Content Security
- **Review Before Publishing**: Use preview mode
- **Backup Content**: Keep local copies
- **Monitor Published**: Check articles after publishing
- **Update Responsibly**: Version control your content

## 📚 Additional Resources

### Dev.to Documentation
- [Dev.to API Documentation](https://developers.forem.com/api)
- [Content Guidelines](https://dev.to/p/editor_guide)
- [Community Guidelines](https://dev.to/code-of-conduct)
- [Markdown Guide](https://dev.to/p/editor_guide)

### Community Resources
- [Dev.to Meta Discussions](https://dev.to/t/meta)
- [Writing Tips](https://dev.to/t/writing)
- [Career Advice](https://dev.to/t/career)
- [Open Source](https://dev.to/t/opensource)

### Bebop Resources
- [Platform Integration Overview](../README.md#platform-integrations)
- [Content Creation Guide](content-creation.md)
- [Scheduling Documentation](scheduling.md)
- [Analytics Dashboard](analytics.md)

## 🤝 Support

If you encounter issues with Dev.to integration:

1. **Check Dev.to Status**: [status.dev.to](https://status.dev.to)
2. **Review API Logs**: Check Bebop monitoring dashboard
3. **Test Manually**: Try publishing directly on Dev.to
4. **Contact Support**: [Create GitHub issue](https://github.com/ddri/bebop/issues)

## 💡 Pro Tips

### Content Ideas for Dev.to
- **Tutorial Series**: Multi-part learning content
- **Project Showcases**: Share your builds and demos
- **Problem Solutions**: Document debugging experiences
- **Tool Reviews**: Compare frameworks, libraries, tools
- **Career Stories**: Share learning journey and insights

### Engagement Strategies
- **Timing**: Publish when community is most active
- **Visuals**: Include diagrams, screenshots, GIFs
- **Interactive**: Ask questions, create polls
- **Follow-up**: Respond to all comments promptly
- **Cross-promotion**: Share on social media

---

**Happy coding and sharing with Dev.to! 👩‍💻🚀**