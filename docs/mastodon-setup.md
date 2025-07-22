# 🐘 Mastodon Integration Setup Guide

This guide will help you set up Mastodon integration in Bebop to automatically publish your content to any Mastodon instance in the fediverse.

## 📋 Prerequisites

- Active Mastodon account on any instance
- Verified account (if required by your instance)
- Bebop platform configured and running

## 🌐 Understanding Mastodon Instances

### What is an Instance?
Mastodon is federated, meaning it consists of many independent servers (instances) that talk to each other:

- **mastodon.social** - The flagship instance
- **mastodon.world** - General purpose, large community
- **fosstodon.org** - FOSS/Tech focused
- **hachyderm.io** - Tech professionals
- **mas.to** - General instance
- **Your custom instance** - Self-hosted or specialized

### Choosing Your Instance
Each instance has its own:
- **Community guidelines**
- **Moderation policies** 
- **Local timeline culture**
- **API endpoints**

## 🔑 Getting Your Mastodon Access Token

### Step 1: Access Developer Settings
1. Log in to your Mastodon instance
2. Go to **Preferences** (gear icon)
3. Navigate to **Development** in the left sidebar
4. Click **"New Application"**

### Step 2: Create Application
1. **Application name**: Enter "Bebop Content Publisher"
2. **Application website**: (Optional) Enter your website
3. **Redirect URI**: Leave as default: `urn:ietf:wg:oauth:2.0:oob`
4. **Scopes**: Select required permissions:
   - ✅ **write:statuses** (required - post content)
   - ✅ **read:accounts** (recommended - verify account)
   - ✅ **write:media** (recommended - upload images)

### Step 3: Get Access Token
1. Click **"Submit"** to create the application
2. Click on your newly created application
3. Copy the **"Your access token"** value
4. **⚠️ Important**: Store this securely - treat it like a password!

## ⚙️ Configuring Bebop

### Step 1: Add Destination in Bebop
1. Navigate to **Settings → Destinations** in Bebop
2. Click **"Add Destination"**
3. Select **"Mastodon"** from the platform list

### Step 2: Configure Connection
1. **Instance URL**: Enter your instance URL
   - Examples: `https://mastodon.social`, `https://fosstodon.org`
   - Include `https://` but no trailing slash
2. **Access Token**: Paste your access token
3. **Username**: Enter your username (for verification)

### Step 3: Test Connection
1. Click **"Test Connection"** to verify your settings
2. You should see success with your profile information
3. Save your destination configuration

## 📝 Content Publishing Features

### Supported Content Types
- ✅ **Status Updates**: Standard posts (500 characters default)
- ✅ **Thread Posts**: Connected status sequences
- ✅ **Media Posts**: Images, videos, audio
- ✅ **Link Previews**: Automatic URL card generation

### Character Limits
Character limits vary by instance:
- **Standard**: 500 characters (most instances)
- **Extended**: Some instances allow 1000+ characters
- **Custom**: Check your instance's specific limits

### Visibility Options
- **Public**: Visible to everyone, appears in public timelines
- **Unlisted**: Visible to everyone but not in public timelines
- **Followers-only**: Only your followers can see
- **Direct**: Only mentioned users can see

### Content Adaptation
Bebop automatically optimizes your content for Mastodon:

```markdown
# Long Content → Thread Creation

Your content is intelligently split into:
1. Main post with summary/hook
2. Threaded replies for continuation
3. Proper mention threading
4. Hashtag optimization

# Automatic Features:
- CW (Content Warning) detection
- Hashtag formatting (#mastodon #fediverse)
- Mention handling (@user@instance.social)
- Link card generation
- Image alt text
```

## 🎯 Publishing Workflow

### 1. Create Content in Bebop
- Write content using campaign editor
- Add hashtags for discoverability
- Include media if desired
- Set content warnings if needed

### 2. Content Options
- **Single Post**: Short content as one status
- **Thread**: Long content split into connected posts
- **Summary + Link**: Post excerpt with link to full content

### 3. Schedule Publication
- Select your Mastodon destination
- Choose publication date/time
- Set visibility level
- Review thread/content preview

### 4. Monitor Publishing
- Track status in real-time dashboard
- Get notifications for successful/failed publications
- Monitor engagement on your instance

## 🧵 Thread and Content Management

### Automatic Threading
Long content is automatically threaded:

```markdown
Post 1: "🧵 Thread about [topic] 

Main introduction and hook..." (480 chars)

Post 2: "2/ Content section one with detailed explanation..." (480 chars)

Post 3: "3/ Additional insights and examples..." (480 chars)

Post 4: "4/4 Conclusion and call to action 

#hashtags #fediverse" (final post)
```

### Content Warnings (CW)
Bebop automatically detects and suggests content warnings for:
- **Technical content**: Programming, debugging
- **Politics/News**: Current events discussion
- **Personal content**: Mental health, relationships
- **Media**: Eye contact, flashing images

### Hashtag Strategy
- **Local discovery**: Use instance-specific tags
- **Fediverse-wide**: Broader community hashtags
- **Trending topics**: Check your instance's trends
- **Content type**: #tutorial #showdev #introduction

## 🔧 Advanced Configuration

### Environment Variables
```bash
# Optional environment setup
MASTODON_ACCESS_TOKEN="your_access_token"
MASTODON_INSTANCE_URL="https://your.instance.social"
MASTODON_USERNAME="your_username"
MASTODON_VISIBILITY="public"  # public, unlisted, private, direct
```

### Custom Instance Configuration
```javascript
// Instance-specific settings
{
  "instanceUrl": "https://your.instance.social",
  "characterLimit": 500,  // Check your instance limits
  "mediaLimit": 4,        // Images per post
  "pollSupport": true,    // If polls are enabled
  "customEmojis": true    // Instance custom emoji support
}
```

### Content Formatting
- **Mentions**: `@username@instance.social` for cross-instance
- **Local mentions**: `@username` for same instance
- **Hashtags**: `#CamelCase` or `#lowercase`
- **Content warnings**: Auto-detected or manual
- **Line breaks**: Preserved in Mastodon posts

## 🚨 Troubleshooting

### Common Issues

#### ❌ "Invalid Access Token"
**Solution**: 
1. Verify token is copied correctly
2. Check token hasn't been revoked
3. Ensure proper scopes were selected
4. Regenerate token if necessary

#### ❌ "Instance Not Found"
**Solution**:
1. Verify instance URL format: `https://instance.domain`
2. Check instance is online and accessible
3. Try accessing instance URL in browser
4. Some instances may block API access

#### ❌ "Character Limit Exceeded"
**Solution**:
1. Check your instance's character limit
2. Enable automatic threading
3. Use summary mode for long content
4. Manually break content with `---`

#### ❌ "Media Upload Failed"
**Solution**:
1. Check image size limits (typically 8-40MB)
2. Verify supported formats (JPEG, PNG, GIF, WebP)
3. Ensure proper image URLs (HTTPS required)
4. Check instance media policies

### Instance-Specific Issues
- **Rate limits**: Vary by instance (typically 300 posts/hour)
- **Content policies**: Check instance rules
- **Federation issues**: Some instances may be blocked
- **Custom configurations**: Some instances modify limits

## 📊 Analytics and Monitoring

### Publishing Metrics
- **Success Rate**: Track successful publications
- **Engagement**: Favourites, boosts, replies
- **Reach**: Local vs federated timeline visibility
- **Thread Performance**: Engagement across thread posts

### Fediverse Analytics
- **Instance reach**: How content spreads across instances
- **Hashtag performance**: Which tags drive discovery
- **Timing analysis**: When your instance is most active
- **Cross-instance engagement**: Federation metrics

## 🌟 Mastodon Best Practices

### Community Engagement
- **Read local timeline**: Understand your instance culture
- **Follow local users**: Build community connections
- **Respect guidelines**: Each instance has its own rules
- **Use content warnings**: Be considerate of others

### Content Strategy
- **Be genuine**: Mastodon values authentic interaction
- **Engage in conversations**: Reply and interact thoughtfully
- **Share knowledge**: Technical content is often appreciated
- **Boost others**: Share interesting content from your community

### Fediverse Etiquette
- **Alt text for images**: Accessibility is important
- **Content warnings**: Use CWs appropriately
- **Don't cross-post excessively**: Quality over quantity
- **Respect boundaries**: Honor content warnings and preferences

## 🔒 Security and Privacy

### Access Token Security
- **Store securely**: Never commit to version control
- **Regular rotation**: Regenerate tokens periodically
- **Scope limitation**: Only grant necessary permissions
- **Monitor usage**: Check for suspicious activity

### Privacy Considerations
- **Visibility settings**: Choose appropriate visibility
- **Instance logging**: Understand your instance's data policies
- **Federation implications**: Public posts spread across instances
- **Content persistence**: Posts may be cached on other instances

### Data Control
- **Account migration**: Mastodon supports account migration
- **Data export**: Download your data anytime
- **Instance choice**: Pick instances with policies you trust
- **Self-hosting**: Ultimate control over your data

## 🌍 Fediverse Integration

### Federation Benefits
- **Cross-instance communication**: Reach users on any instance
- **No single point of failure**: Distributed network
- **Choice and control**: Pick your community and rules
- **Open standards**: Built on ActivityPub protocol

### ActivityPub Protocol
- **Interoperability**: Works with other fediverse apps
- **Standards-based**: W3C recommendation
- **Extensible**: Supports various content types
- **Decentralized**: No central authority

## 📚 Additional Resources

### Mastodon Documentation
- [Mastodon Official Documentation](https://docs.joinmastodon.org/)
- [API Documentation](https://docs.joinmastodon.org/api/)
- [Instance List](https://joinmastodon.org/servers)
- [Mastodon Mobile Apps](https://joinmastodon.org/apps)

### Fediverse Resources
- [ActivityPub Specification](https://www.w3.org/TR/activitypub/)
- [Fediverse Explanation](https://fediverse.info/)
- [Instance Comparison](https://instances.social/)
- [Fediverse Observer](https://fediverse.observer/)

### Community Guidelines
- [Mastodon Server Covenant](https://joinmastodon.org/covenant)
- [General Fediverse Etiquette](https://fedi.tips/)
- [Content Warning Guidelines](https://fedi.tips/content-warnings/)
- [Accessibility Tips](https://fedi.tips/alt-text/)

### Bebop Resources
- [Platform Integration Overview](../README.md#platform-integrations)
- [Content Creation Guide](content-creation.md)
- [Social Media Strategy](social-media.md)
- [Community Building](community.md)

## 🤝 Support

If you encounter issues with Mastodon integration:

1. **Check Instance Status**: Most instances have status pages
2. **Review Instance Rules**: Ensure content compliance
3. **Test Manual Posting**: Try posting directly on your instance
4. **Check Fediverse Status**: [fediverse.observer](https://fediverse.observer/)
5. **Contact Support**: [Create GitHub issue](https://github.com/ddri/bebop/issues)

## 💡 Pro Tips

### Finding Your Community
- **Instance selection**: Choose based on interests and values
- **Local timeline**: Participate in instance-specific discussions
- **Hashtag following**: Follow topics that interest you
- **Lists**: Organize follows into themed lists

### Content Optimization
- **Timing**: Post when your instance community is active
- **Hashtags**: Use both local and fediverse-wide tags
- **Threads**: Break long content into digestible pieces
- **Media**: Include alt text for accessibility
- **Engagement**: Ask questions and start conversations

### Growing Your Presence
- **Complete profile**: Bio, avatar, header image
- **Pinned post**: Introduce yourself and your interests
- **Regular interaction**: Reply, boost, and engage authentically
- **Cross-promotion**: Share your Mastodon handle on other platforms
- **Instance events**: Participate in instance-specific activities

---

**Welcome to the fediverse! 🐘🌍**