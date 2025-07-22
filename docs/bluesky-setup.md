# 🦋 Bluesky Integration Setup Guide

This guide will help you set up Bluesky integration in Bebop to automatically publish your content to the decentralized Bluesky social network.

## 📋 Prerequisites

- Active Bluesky account ([bsky.app](https://bsky.app))
- Confirmed email address and phone number (if required)
- Bebop platform configured and running

## 🔑 Authentication Setup

### Understanding Bluesky Authentication
Bluesky uses the **AT Protocol** for authentication. Unlike traditional API keys, Bluesky requires:
- Your **handle** (username or custom domain)
- Your **password** or **app password** (recommended)

### Step 1: Get Your Bluesky Handle
Your handle can be:
- **Default format**: `username.bsky.social`
- **Custom domain**: `yourname.com` (if you've set up domain verification)

### Step 2: Create App Password (Recommended)
1. Open the Bluesky app or visit [bsky.app](https://bsky.app)
2. Go to **Settings → Privacy and Security**
3. Select **App Passwords**
4. Click **"Add App Password"**
5. Name it descriptively (e.g., "Bebop Content Publisher")
6. **⚠️ Important**: Copy the generated password immediately!

### Step 3: Alternative - Account Password
If app passwords aren't available:
- You can use your main account password
- **⚠️ Security Note**: App passwords are more secure and recommended

## ⚙️ Configuring Bebop

### Step 1: Add Destination in Bebop
1. Navigate to **Settings → Destinations** in Bebop
2. Click **"Add Destination"**
3. Select **"Bluesky"** from the platform list

### Step 2: Configure Authentication
1. **Handle**: Enter your Bluesky handle
   - Format: `username.bsky.social` or `yourdomain.com`
   - No @ symbol needed
2. **Password**: Enter your app password or account password

### Step 3: Test Connection
1. Click **"Test Connection"** to verify your settings
2. You should see a success message with your profile info
3. Save your destination configuration

## 📝 Content Publishing Features

### Supported Content Types
- ✅ **Social Posts**: Short-form content (300 characters)
- ✅ **Thread Posts**: Multi-post sequences
- ✅ **Link Sharing**: URLs with rich previews
- ✅ **Media Posts**: Images with captions

### Character Limits
- **Post Text**: 300 characters maximum
- **Alt Text**: 1000 characters for image descriptions
- **Link Cards**: Automatic generation from URLs

### Content Adaptation
Bebop automatically optimizes your content for Bluesky:

```markdown
# Long Content → Thread Creation

Your long-form content gets automatically split into:
1. Opening post with hook/summary
2. Threaded replies for continuation
3. Final post with conclusion/CTA

# Automatic Features:
- Link previews for URLs
- Hashtag support (#bluesky #atproto)
- Mention handling (@username.bsky.social)
- Image optimization and alt text
```

## 🎯 Publishing Workflow

### 1. Create Content in Bebop
- Write your content using the campaign editor
- Add relevant hashtags and mentions
- Include images if desired

### 2. Content Adaptation Options
- **Auto-Thread**: Long content becomes thread
- **Summary Post**: Extract key points for single post
- **Link Post**: Share with excerpt and link back

### 3. Schedule Publication
- Select your Bluesky destination
- Choose publication date/time
- Review thread preview

### 4. Monitor Publishing
- Track status in real-time dashboard
- Get notifications for successful/failed publications
- View published threads on Bluesky

## 🧵 Thread Management

### Automatic Threading
Bebop creates threads when content exceeds 300 characters:

```markdown
Post 1: Hook + introduction (280 chars)
Post 2: Main content section 1 (280 chars)
Post 3: Main content section 2 (280 chars)
Post 4: Conclusion + CTA (280 chars)
```

### Thread Best Practices
- **Strong Opening**: Hook readers in first post
- **Logical Flow**: Each post should flow naturally
- **Visual Breaks**: Use line breaks and emojis
- **Call to Action**: End with engagement request

### Manual Thread Control
- Use `---` in content to force thread breaks
- Add `[THREAD]` tag to force threading
- Include `[SINGLE]` to prevent threading

## 🔧 Advanced Configuration

### Environment Variables
```bash
# Optional environment setup
BLUESKY_USERNAME="your.handle.bsky.social"
BLUESKY_PASSWORD="your_app_password"
BLUESKY_SERVICE_URL="https://bsky.social"  # Default AT Protocol endpoint
```

### Content Formatting Options
- **Mentions**: `@username.bsky.social` or `@yourdomain.com`
- **Hashtags**: `#bluesky #atproto #socialmedia`
- **Links**: Automatic rich preview generation
- **Line Breaks**: Use double newlines for paragraphs

### Image Handling
- **Formats**: JPEG, PNG, GIF, WebP
- **Size Limit**: 1MB per image, 4 images max
- **Alt Text**: Automatic generation or custom descriptions
- **Optimization**: Automatic compression for optimal loading

## 🚨 Troubleshooting

### Common Issues

#### ❌ "Authentication Failed"
**Solution**: 
1. Verify handle format (no @ symbol)
2. Check app password is correct
3. Ensure account is in good standing
4. Try regenerating app password

#### ❌ "Handle Not Found"
**Solution**:
1. Verify handle spelling and format
2. Check if using custom domain vs bsky.social
3. Ensure account is active and not suspended
4. Try with full handle format

#### ❌ "Post Too Long"
**Solution**:
1. Enable automatic threading in settings
2. Manually add thread breaks with `---`
3. Use summary mode instead of full content
4. Edit content to fit character limits

#### ❌ "Rate Limit Exceeded"
**Solution**:
1. Bluesky allows ~300 posts per hour
2. Space out publications with longer intervals
3. Reduce thread frequency
4. Wait for rate limit reset

### Content Guidelines
- **Character Limit**: 300 characters per post
- **Image Limit**: 4 images per post, 1MB each
- **Link Previews**: One link card per post
- **Mentions**: Valid handles only

## 📊 Analytics and Monitoring

### Publishing Metrics
- **Success Rate**: Track successful publications
- **Thread Performance**: Engagement across thread posts
- **Reach Metrics**: Views, likes, reposts, replies
- **Timing Analysis**: Optimal posting times

### Real-time Monitoring
- Live status updates during publishing
- Thread creation progress tracking
- Error handling for failed posts
- Retry management for network issues

## 🌟 Bluesky Best Practices

### Content Strategy
- **Be Authentic**: Bluesky values genuine interaction
- **Engage**: Reply to comments and participate in conversations
- **Share Knowledge**: Technical insights are valued
- **Be Consistent**: Regular posting builds following

### Community Engagement
- **Follow Relevant Accounts**: Build your network
- **Use Hashtags Wisely**: Discover and join conversations
- **Share Others' Content**: Repost with commentary
- **Participate in Trends**: Join community discussions

### Technical Tips
- **Custom Domains**: Set up your own domain as handle
- **Feeds**: Create custom algorithmic feeds
- **Moderation**: Use Bluesky's moderation tools
- **Lists**: Organize follows into lists

## 🔒 Security Best Practices

### Authentication Security
- **App Passwords**: Always prefer over main password
- **Regular Rotation**: Change passwords periodically
- **Monitor Activity**: Check for unauthorized access
- **Secure Storage**: Never commit credentials to code

### Content Security
- **Review Before Publishing**: Use preview mode
- **Monitor Threads**: Check all posts in sequence
- **Handle Privacy**: Be mindful of mention privacy
- **Link Safety**: Verify URLs before sharing

## 🌐 AT Protocol Understanding

### Decentralized Features
- **Data Portability**: Your data isn't locked to one server
- **Federation**: Connect across different AT Protocol services
- **Self-Hosting**: Eventually host your own data
- **Open Standards**: Built on open, verifiable protocols

### Technical Benefits
- **Cryptographic Verification**: All posts are cryptographically signed
- **Content Addressing**: Posts have permanent, verifiable addresses
- **Algorithmic Choice**: Choose your own recommendation algorithm
- **Interoperability**: Works with other AT Protocol apps

## 📚 Additional Resources

### Bluesky Documentation
- [Bluesky Official Documentation](https://bsky.app/about)
- [AT Protocol Specification](https://atproto.com/)
- [Developer Resources](https://docs.bsky.app/)
- [API Reference](https://docs.bsky.app/docs/api)

### Community Resources
- [Bluesky Community Guidelines](https://bsky.app/about/support/community-guidelines)
- [Safety Center](https://bsky.app/about/support/safety)
- [Help Center](https://bsky.app/about/support)
- [Status Updates](https://status.bsky.app/)

### Bebop Resources
- [Platform Integration Overview](../README.md#platform-integrations)
- [Content Creation Guide](content-creation.md)
- [Thread Management](threading.md)
- [Social Media Best Practices](social-media.md)

## 🤝 Support

If you encounter issues with Bluesky integration:

1. **Check Bluesky Status**: [status.bsky.app](https://status.bsky.app)
2. **Review Authentication**: Verify handle and password
3. **Test Manual Post**: Try posting directly on Bluesky
4. **Contact Support**: [Create GitHub issue](https://github.com/ddri/bebop/issues)

## 💡 Pro Tips

### Growing Your Bluesky Presence
- **Complete Profile**: Add bio, profile picture, header
- **Starter Packs**: Create curated follow lists
- **Custom Feeds**: Build algorithmic feeds for your interests
- **Verification**: Set up domain verification for credibility

### Content Ideas
- **Tech Updates**: Share development insights
- **Thread Tutorials**: Step-by-step guides
- **Behind the Scenes**: Development process content
- **Community Questions**: Ask for input and feedback
- **Resource Sharing**: Helpful tools and links

### Engagement Strategies
- **Reply Thoughtfully**: Add value to conversations
- **Quote Post**: Share with your commentary
- **Use Lists**: Organize and discover content
- **Custom Feeds**: Create topic-specific feeds
- **Cross-Platform**: Share Bluesky content elsewhere

---

**Welcome to the decentralized social web with Bluesky! 🦋🌐**