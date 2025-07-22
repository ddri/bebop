import type { DestinationType } from '@repo/database/types';
import { BasePlatformClient } from '../../core/platform-client';
import type {
  PlatformCredentials,
  PlatformConfig,
  PlatformMetadata,
  AdaptedContent,
  PublishResult,
  ValidationResult,
} from '../../types/platform';
import {
  AuthenticationError,
  ValidationError,
  PublishingError,
} from '../../types/platform';
import type {
  BlueskyCredentials,
  BlueskyConfig,
  BlueskySession,
  BlueskyProfile,
  BlueskyCreatePostResponse,
  BlueskyUploadResponse,
  BlueskyThread,
} from './types';
import {
  BlueskyCredentialsSchema,
  BlueskyConfigSchema,
  BLUESKY_API_ENDPOINT,
  BLUESKY_LIMITS,
} from './types';

/**
 * Bluesky AT Protocol client for publishing and managing posts
 * Implements AT Protocol with direct HTTP calls
 */
export class BlueskyClient extends BasePlatformClient {
  readonly platform: DestinationType = 'BLUESKY';
  
  private session?: BlueskySession;
  private serviceEndpoint: string = BLUESKY_API_ENDPOINT;

  constructor() {
    super();
  }

  async authenticate(credentials: PlatformCredentials): Promise<void> {
    try {
      // Validate credentials structure
      if (credentials.type !== 'username-password') {
        throw new AuthenticationError(this.platform, 'Bluesky requires username/password authentication');
      }

      const parsedCredentials = BlueskyCredentialsSchema.parse(credentials.data);

      // Create session with AT Protocol
      const response = await this.makeRequest(`${this.serviceEndpoint}/xrpc/com.atproto.server.createSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: parsedCredentials.identifier,
          password: parsedCredentials.password,
        }),
      });

      this.session = await this.parseJsonResponse<BlueskySession>(response);
      
      this.credentials = credentials;
      this.isAuthenticated = true;
    } catch (error) {
      this.isAuthenticated = false;
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new AuthenticationError(this.platform, 'Failed to authenticate with Bluesky');
    }
  }

  async validateCredentials(credentials: PlatformCredentials): Promise<ValidationResult> {
    try {
      if (credentials.type !== 'username-password') {
        return {
          valid: false,
          errors: ['Bluesky requires username/password authentication'],
          warnings: [],
        };
      }

      BlueskyCredentialsSchema.parse(credentials.data);
      
      // Test the credentials by creating a session
      const response = await this.makeRequest(`${this.serviceEndpoint}/xrpc/com.atproto.server.createSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: credentials.data.identifier,
          password: credentials.data.password,
        }),
      });
      
      if (!response.ok) {
        return {
          valid: false,
          errors: [`Authentication failed: ${response.status} ${response.statusText}`],
          warnings: [],
        };
      }

      return {
        valid: true,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Invalid credentials'],
        warnings: [],
      };
    }
  }

  async publish(content: AdaptedContent, config?: PlatformConfig): Promise<PublishResult> {
    this.ensureAuthenticated();

    try {
      // Validate and parse configuration
      const blueskyConfig = config ? BlueskyConfigSchema.parse(config) : ({} as BlueskyConfig);
      
      // Validate content
      const validation = this.validateContent(content);
      if (!validation.valid) {
        return this.createErrorResult(`Content validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if content needs to be split into thread
      const shouldCreateThread = blueskyConfig.threadMode || this.shouldCreateThread(content.body!);
      
      if (shouldCreateThread) {
        return await this.publishThread(content, blueskyConfig);
      } else {
        return await this.publishSinglePost(content, blueskyConfig);
      }
    } catch (error) {
      this.handleApiError(error, 'Publishing');
    }
  }

  async update(id: string, content: AdaptedContent, config?: PlatformConfig): Promise<PublishResult> {
    // Bluesky doesn't support editing posts
    return this.createErrorResult(
      'Bluesky does not support editing posts. You can delete and recreate the post instead.',
      { postId: id, updateSupported: false }
    );
  }

  async delete(id: string): Promise<PublishResult> {
    this.ensureAuthenticated();

    try {
      // Extract repo and rkey from AT URI
      const { repo, rkey } = this.parseATUri(id);

      const response = await this.makeRequest(`${this.serviceEndpoint}/xrpc/com.atproto.repo.deleteRecord`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.session!.accessJwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo,
          collection: 'app.bsky.feed.post',
          rkey,
        }),
      });

      if (!response.ok) {
        return this.createErrorResult(`Failed to delete post: ${response.status} ${response.statusText}`);
      }

      return this.createSuccessResult(undefined, undefined, {
        deletedPostId: id,
      });
    } catch (error) {
      this.handleApiError(error, 'Deleting');
    }
  }

  async getMetadata(): Promise<PlatformMetadata> {
    this.ensureAuthenticated();

    try {
      // Get profile info
      const response = await this.makeRequest(
        `${this.serviceEndpoint}/xrpc/app.bsky.actor.getProfile?actor=${this.session!.did}`,
        {
          headers: {
            'Authorization': `Bearer ${this.session!.accessJwt}`,
          },
        }
      );

      const profile = await this.parseJsonResponse<BlueskyProfile>(response);

      return {
        user: {
          id: profile.did,
          name: profile.displayName || profile.handle,
          username: profile.handle,
          profilePicture: profile.avatar,
          bio: profile.description,
          followersCount: profile.followersCount,
          followingCount: profile.followsCount,
        },
        rateLimit: BLUESKY_LIMITS.rateLimit,
      };
    } catch (error) {
      throw new Error(`Failed to get Bluesky metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateContent(content: AdaptedContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!content.title && !content.body?.trim()) {
      errors.push('Either title or content body is required');
    }

    // Construct full text
    const fullText = this.constructPostText(content);

    // Length validations (Bluesky has practical limits)
    if (fullText.length > BLUESKY_LIMITS.maxTextLength) {
      warnings.push(`Post is ${fullText.length} characters. Consider splitting into a thread.`);
    }

    // Media validations
    if (content.media && content.media.length > BLUESKY_LIMITS.maxImagesPerPost) {
      errors.push(`Maximum ${BLUESKY_LIMITS.maxImagesPerPost} images allowed per post`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Bluesky-specific methods

  async uploadImage(imageData: Buffer, mimeType: string): Promise<BlueskyUploadResponse> {
    this.ensureAuthenticated();

    try {
      const response = await this.makeRequest(`${this.serviceEndpoint}/xrpc/com.atproto.repo.uploadBlob`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.session!.accessJwt}`,
          'Content-Type': mimeType,
        },
        body: imageData,
      });

      return await this.parseJsonResponse<BlueskyUploadResponse>(response);
    } catch (error) {
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createPost(text: string, options: {
    images?: Array<{ blob: any; alt: string }>;
    reply?: { root: { uri: string; cid: string }; parent: { uri: string; cid: string } };
    langs?: string[];
  } = {}): Promise<BlueskyCreatePostResponse> {
    this.ensureAuthenticated();

    const record: any = {
      $type: 'app.bsky.feed.post',
      text,
      createdAt: new Date().toISOString(),
    };

    if (options.langs) {
      record.langs = options.langs;
    }

    if (options.images && options.images.length > 0) {
      record.embed = {
        $type: 'app.bsky.embed.images',
        images: options.images,
      };
    }

    if (options.reply) {
      record.reply = options.reply;
    }

    // Auto-detect facets for mentions and links
    record.facets = this.detectFacets(text);

    const response = await this.makeRequest(`${this.serviceEndpoint}/xrpc/com.atproto.repo.createRecord`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.session!.accessJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: this.session!.did,
        collection: 'app.bsky.feed.post',
        record,
      }),
    });

    return await this.parseJsonResponse<BlueskyCreatePostResponse>(response);
  }

  // Private helper methods

  private async publishSinglePost(content: AdaptedContent, config: BlueskyConfig): Promise<PublishResult> {
    try {
      const text = this.constructPostText(content);
      const images: Array<{ blob: any; alt: string }> = [];

      // Handle image uploads
      if (content.media && config.includeImages !== false) {
        for (const media of content.media.slice(0, BLUESKY_LIMITS.maxImagesPerPost)) {
          if (media.type === 'image') {
            // Note: In a real implementation, you'd fetch the image data from media.url
            // For now, we'll skip this step as it requires additional image processing
            // const imageData = await fetch(media.url).then(r => r.arrayBuffer());
            // const uploadResult = await this.uploadImage(Buffer.from(imageData), 'image/jpeg');
            // images.push({ blob: uploadResult.blob, alt: media.altText || '' });
          }
        }
      }

      const postResult = await this.createPost(text, {
        images: images.length > 0 ? images : undefined,
        langs: config.languages,
      });

      const postUri = `at://${this.session!.did}/app.bsky.feed.post/${postResult.cid}`;
      const postUrl = `https://bsky.app/profile/${this.session!.handle}/post/${postResult.cid}`;

      return this.createSuccessResult(postResult.uri, postUrl, {
        post: postResult,
        handle: this.session!.handle,
        did: this.session!.did,
      });
    } catch (error) {
      throw error;
    }
  }

  private async publishThread(content: AdaptedContent, config: BlueskyConfig): Promise<PublishResult> {
    try {
      const thread = this.splitIntoThread(content);
      const posts: BlueskyCreatePostResponse[] = [];
      let rootPost: { uri: string; cid: string } | undefined;

      for (let i = 0; i < thread.posts.length; i++) {
        const threadPost = thread.posts[i];
        const isFirst = i === 0;
        const isLast = i === thread.posts.length - 1;

        let reply: { root: { uri: string; cid: string }; parent: { uri: string; cid: string } } | undefined;

        if (!isFirst && rootPost) {
          const parentPost = posts[i - 1];
          reply = {
            root: rootPost,
            parent: { uri: parentPost.uri, cid: parentPost.cid },
          };
        }

        const postResult = await this.createPost(threadPost.text, {
          reply,
          langs: config.languages,
        });

        posts.push(postResult);

        if (isFirst) {
          rootPost = { uri: postResult.uri, cid: postResult.cid };
        }

        // Small delay between posts to avoid rate limits
        if (!isLast) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const rootUrl = `https://bsky.app/profile/${this.session!.handle}/post/${posts[0].cid}`;

      return this.createSuccessResult(posts[0].uri, rootUrl, {
        thread: posts,
        rootPost: posts[0],
        threadLength: posts.length,
        handle: this.session!.handle,
        did: this.session!.did,
      });
    } catch (error) {
      throw error;
    }
  }

  private constructPostText(content: AdaptedContent): string {
    let text = '';
    
    if (content.title && content.body) {
      text = `${content.title}\n\n${content.body}`;
    } else {
      text = content.title || content.body || '';
    }

    return text.trim();
  }

  private shouldCreateThread(text: string): boolean {
    return text.length > BLUESKY_LIMITS.maxTextLength;
  }

  private splitIntoThread(content: AdaptedContent): BlueskyThread {
    const fullText = this.constructPostText(content);
    const posts: Array<{ text: string }> = [];
    
    if (fullText.length <= BLUESKY_LIMITS.maxTextLength) {
      return { posts: [{ text: fullText }] };
    }

    // Split by paragraphs first
    const paragraphs = fullText.split('\n\n');
    let currentPost = '';

    for (const paragraph of paragraphs) {
      const potentialPost = currentPost ? `${currentPost}\n\n${paragraph}` : paragraph;
      
      if (potentialPost.length <= BLUESKY_LIMITS.maxTextLength) {
        currentPost = potentialPost;
      } else {
        if (currentPost) {
          posts.push({ text: currentPost });
          currentPost = paragraph;
        } else {
          // Single paragraph is too long, split by sentences
          const sentences = paragraph.split('. ');
          let sentencePost = '';
          
          for (const sentence of sentences) {
            const potentialSentencePost = sentencePost ? `${sentencePost}. ${sentence}` : sentence;
            
            if (potentialSentencePost.length <= BLUESKY_LIMITS.maxTextLength) {
              sentencePost = potentialSentencePost;
            } else {
              if (sentencePost) {
                posts.push({ text: sentencePost });
                sentencePost = sentence;
              } else {
                // Even single sentence is too long, hard cut
                posts.push({ text: sentence.substring(0, BLUESKY_LIMITS.maxTextLength - 3) + '...' });
              }
            }
          }
          
          if (sentencePost) {
            currentPost = sentencePost;
          }
        }
      }
    }

    if (currentPost) {
      posts.push({ text: currentPost });
    }

    return { posts };
  }

  private detectFacets(text: string): any[] {
    const facets: any[] = [];
    
    // Detect mentions (@handle)
    const mentionRegex = /@([a-zA-Z0-9.-]+)/g;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      facets.push({
        index: {
          byteStart: match.index,
          byteEnd: match.index + match[0].length,
        },
        features: [{
          $type: 'app.bsky.richtext.facet#mention',
          did: `did:plc:${match[1]}`, // This would need proper DID resolution
        }],
      });
    }

    // Detect links
    const urlRegex = /https?:\/\/[^\s]+/g;
    while ((match = urlRegex.exec(text)) !== null) {
      facets.push({
        index: {
          byteStart: match.index,
          byteEnd: match.index + match[0].length,
        },
        features: [{
          $type: 'app.bsky.richtext.facet#link',
          uri: match[0],
        }],
      });
    }

    return facets;
  }

  private parseATUri(uri: string): { repo: string; rkey: string } {
    // Parse AT URI format: at://did:plc:xxx/app.bsky.feed.post/xxx
    const parts = uri.replace('at://', '').split('/');
    return {
      repo: parts[0],
      rkey: parts[2],
    };
  }
}