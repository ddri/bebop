import { DestinationType } from '@repo/database/types';
import { AlertCircle, Book, Key, Link, Shield, User } from 'lucide-react';

export interface PlatformFieldConfig {
  needsApiKey: boolean;
  needsApiSecret: boolean;
  needsUrl: boolean;
  needsUsername: boolean;
  apiKeyLabel: string;
  apiSecretLabel: string;
  urlLabel: string;
  usernameLabel: string;
  description: string;
  helpLink?: string;
  additionalFields?: {
    name: string;
    label: string;
    type: 'text' | 'url' | 'boolean' | 'select';
    placeholder?: string;
    description?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
  }[];
}

export const platformConfigurations: Record<DestinationType, PlatformFieldConfig> = {
  [DestinationType.HASHNODE]: {
    needsApiKey: true,
    apiKeyLabel: 'Personal Access Token',
    description: 'Connect to your Hashnode publication for developer blogging',
    helpLink: 'https://hashnode.com/settings/developer',
    needsApiSecret: false,
    needsUrl: false,
    needsUsername: false,
    apiSecretLabel: '',
    urlLabel: '',
    usernameLabel: '',
    additionalFields: [
      {
        name: 'publicationId',
        label: 'Publication ID',
        type: 'text',
        placeholder: 'your-publication-id',
        description: 'The unique ID of your Hashnode publication',
        required: true,
      },
      {
        name: 'enableTableOfContents',
        label: 'Enable Table of Contents',
        type: 'boolean',
        description: 'Automatically generate table of contents for articles',
      },
      {
        name: 'isNewsletterActivated',
        label: 'Send to Newsletter',
        type: 'boolean',
        description: 'Also send published articles to your newsletter subscribers',
      },
    ],
  },
  
  [DestinationType.DEVTO]: {
    needsApiKey: true,
    apiKeyLabel: 'API Key',
    description: 'Publish to the Dev.to developer community',
    helpLink: 'https://dev.to/settings/extensions',
    needsApiSecret: false,
    needsUrl: false,
    needsUsername: false,
    apiSecretLabel: '',
    urlLabel: '',
    usernameLabel: '',
    additionalFields: [
      {
        name: 'organizationId',
        label: 'Organization ID (Optional)',
        type: 'text',
        placeholder: '12345',
        description: 'Publish under an organization instead of personal account',
      },
      {
        name: 'series',
        label: 'Series Name (Optional)',
        type: 'text',
        placeholder: 'My Tutorial Series',
        description: 'Add articles to a series',
      },
      {
        name: 'published',
        label: 'Publish Immediately',
        type: 'boolean',
        description: 'Publish articles immediately or save as draft',
      },
    ],
  },
  
  [DestinationType.BLUESKY]: {
    needsUsername: true,
    needsApiKey: true,
    usernameLabel: 'Handle',
    apiKeyLabel: 'App Password',
    description: 'Share content on the decentralized Bluesky social network',
    helpLink: 'https://bsky.app/settings/app-passwords',
    needsApiSecret: false,
    needsUrl: false,
    apiSecretLabel: '',
    urlLabel: '',
    additionalFields: [
      {
        name: 'threadMode',
        label: 'Enable Thread Mode',
        type: 'boolean',
        description: 'Automatically split long content into threads',
      },
      {
        name: 'includeImages',
        label: 'Include Images',
        type: 'boolean',
        description: 'Include images from content in posts (max 4 per post)',
      },
      {
        name: 'languages',
        label: 'Post Language',
        type: 'select',
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
          { value: 'pt', label: 'Portuguese' },
          { value: 'ja', label: 'Japanese' },
          { value: 'ko', label: 'Korean' },
          { value: 'zh', label: 'Chinese' },
        ],
        description: 'Primary language for your posts',
      },
    ],
  },
  
  [DestinationType.MASTODON]: {
    needsUrl: true,
    needsApiKey: true,
    urlLabel: 'Instance URL',
    apiKeyLabel: 'Access Token',
    description: 'Connect to any Mastodon instance in the fediverse',
    helpLink: 'https://docs.joinmastodon.org/client/token/',
    needsApiSecret: false,
    needsUsername: false,
    apiSecretLabel: '',
    usernameLabel: '',
    additionalFields: [
      {
        name: 'visibility',
        label: 'Default Visibility',
        type: 'select',
        options: [
          { value: 'public', label: 'Public - Visible to all' },
          { value: 'unlisted', label: 'Unlisted - Public but not in timelines' },
          { value: 'private', label: 'Private - Followers only' },
          { value: 'direct', label: 'Direct - Mentioned users only' },
        ],
        description: 'Default visibility for posted content',
      },
      {
        name: 'sensitive',
        label: 'Mark as Sensitive by Default',
        type: 'boolean',
        description: 'Hide media behind a warning by default',
      },
      {
        name: 'language',
        label: 'Post Language',
        type: 'text',
        placeholder: 'en',
        description: 'ISO 639 language code (e.g., en, es, fr)',
      },
    ],
  },
  
  // Placeholder configurations for future platforms
  [DestinationType.WORDPRESS]: {
    needsUrl: true,
    needsUsername: true,
    needsApiKey: true,
    urlLabel: 'WordPress Site URL',
    usernameLabel: 'Username',
    apiKeyLabel: 'Application Password',
    description: 'Connect to your WordPress site',
    needsApiSecret: false,
    apiSecretLabel: '',
  },
  
  [DestinationType.GHOST]: {
    needsUrl: true,
    needsApiKey: true,
    urlLabel: 'Ghost Site URL',
    apiKeyLabel: 'Admin API Key',
    description: 'Connect to your Ghost publication',
    needsApiSecret: false,
    needsUsername: false,
    apiSecretLabel: '',
    usernameLabel: '',
  },
  
  [DestinationType.MAILCHIMP]: {
    needsApiKey: true,
    apiKeyLabel: 'API Key',
    description: 'Send content to Mailchimp campaigns',
    needsApiSecret: false,
    needsUrl: false,
    needsUsername: false,
    apiSecretLabel: '',
    urlLabel: '',
    usernameLabel: '',
  },
  
  [DestinationType.SENDGRID]: {
    needsApiKey: true,
    apiKeyLabel: 'API Key',
    description: 'Send content via SendGrid',
    needsApiSecret: false,
    needsUrl: false,
    needsUsername: false,
    apiSecretLabel: '',
    urlLabel: '',
    usernameLabel: '',
  },
  
  [DestinationType.TWITTER]: {
    needsApiKey: true,
    needsApiSecret: true,
    apiKeyLabel: 'API Key',
    apiSecretLabel: 'API Secret',
    description: 'Post to Twitter/X',
    needsUrl: false,
    needsUsername: false,
    urlLabel: '',
    usernameLabel: '',
  },
  
  [DestinationType.LINKEDIN]: {
    needsApiKey: true,
    apiKeyLabel: 'Access Token',
    description: 'Share on LinkedIn',
    needsApiSecret: false,
    needsUrl: false,
    needsUsername: false,
    apiSecretLabel: '',
    urlLabel: '',
    usernameLabel: '',
  },
  
  [DestinationType.FACEBOOK]: {
    needsApiKey: true,
    apiKeyLabel: 'Page Access Token',
    description: 'Post to Facebook pages',
    needsApiSecret: false,
    needsUrl: false,
    needsUsername: false,
    apiSecretLabel: '',
    urlLabel: '',
    usernameLabel: '',
  },
  
  [DestinationType.INSTAGRAM]: {
    needsApiKey: true,
    apiKeyLabel: 'Access Token',
    description: 'Share to Instagram',
    needsApiSecret: false,
    needsUrl: false,
    needsUsername: false,
    apiSecretLabel: '',
    urlLabel: '',
    usernameLabel: '',
  },
  
  [DestinationType.WEBHOOK]: {
    needsUrl: true,
    urlLabel: 'Webhook URL',
    description: 'Send content to a custom webhook endpoint',
    needsApiKey: false,
    needsApiSecret: false,
    needsUsername: false,
    apiKeyLabel: '',
    apiSecretLabel: '',
    usernameLabel: '',
  },
  
  [DestinationType.CUSTOM]: {
    needsUrl: true,
    needsApiKey: true,
    urlLabel: 'API Endpoint',
    apiKeyLabel: 'API Key',
    description: 'Configure a custom integration',
    needsApiSecret: false,
    needsUsername: false,
    apiSecretLabel: '',
    usernameLabel: '',
  },
};

export const platformIcons: Record<DestinationType, React.ReactNode> = {
  [DestinationType.HASHNODE]: <Book className="h-4 w-4" />,
  [DestinationType.DEVTO]: <Book className="h-4 w-4" />,
  [DestinationType.BLUESKY]: <User className="h-4 w-4" />,
  [DestinationType.MASTODON]: <Shield className="h-4 w-4" />,
  [DestinationType.WORDPRESS]: <Book className="h-4 w-4" />,
  [DestinationType.GHOST]: <Book className="h-4 w-4" />,
  [DestinationType.MAILCHIMP]: <AlertCircle className="h-4 w-4" />,
  [DestinationType.SENDGRID]: <AlertCircle className="h-4 w-4" />,
  [DestinationType.TWITTER]: <User className="h-4 w-4" />,
  [DestinationType.LINKEDIN]: <User className="h-4 w-4" />,
  [DestinationType.FACEBOOK]: <User className="h-4 w-4" />,
  [DestinationType.INSTAGRAM]: <User className="h-4 w-4" />,
  [DestinationType.WEBHOOK]: <Link className="h-4 w-4" />,
  [DestinationType.CUSTOM]: <Key className="h-4 w-4" />,
};

export const getHelpText = (type: DestinationType): string => {
  switch (type) {
    case DestinationType.HASHNODE:
      return 'Get your Personal Access Token from Hashnode Settings → Developer → Personal Access Tokens';
    case DestinationType.DEVTO:
      return 'Find your API key in Dev.to Settings → Extensions → API Key';
    case DestinationType.BLUESKY:
      return 'Create an App Password in Bluesky Settings → App Passwords. Use your full handle (e.g., user.bsky.social)';
    case DestinationType.MASTODON:
      return 'Generate an access token in your Mastodon instance Settings → Development → Your applications';
    default:
      return '';
  }
};

export const phase1Platforms: DestinationType[] = [
  DestinationType.HASHNODE,
  DestinationType.DEVTO,
  DestinationType.BLUESKY,
  DestinationType.MASTODON,
];

export const platformCategories: Record<string, DestinationType[]> = {
  'Developer Platforms': [DestinationType.HASHNODE, DestinationType.DEVTO],
  'Social Networks': [DestinationType.BLUESKY, DestinationType.MASTODON],
  'Coming Soon': [
    DestinationType.WORDPRESS,
    DestinationType.GHOST,
    DestinationType.TWITTER,
    DestinationType.LINKEDIN,
  ],
};