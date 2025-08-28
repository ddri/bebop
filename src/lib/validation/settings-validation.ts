// lib/validation/settings-validation.ts
import { z } from 'zod';

// Validation schemas for different platforms
export const hashnodeSettingsSchema = z.object({
  token: z.string()
    .min(1, 'Personal Access Token is required')
    .min(20, 'Token appears to be too short')
    .regex(/^[a-f0-9-]+$/i, 'Token should contain only alphanumeric characters and hyphens'),
  publicationId: z.string()
    .min(1, 'Publication ID is required')
    .regex(/^[a-f0-9-]+$/i, 'Publication ID should be a valid UUID format')
});

export const devToSettingsSchema = z.object({
  token: z.string()
    .min(1, 'API Key is required')
    .min(20, 'API key appears to be too short')
    .regex(/^[a-zA-Z0-9_-]+$/, 'API key contains invalid characters')
});

export const beehiivSettingsSchema = z.object({
  token: z.string()
    .min(1, 'API Key is required')
    .min(20, 'API key appears to be too short'),
  publicationId: z.string()
    .min(1, 'Publication ID is required')
    .regex(/^pub_[0-9a-fA-F\-]+$/, 'Publication ID should start with "pub_" and contain valid characters')
});

// Base social credentials schema
export const socialCredentialsSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  password: z.string()
    .min(1, 'Password/App Password is required')
    .min(8, 'Password must be at least 8 characters'),
  instanceUrl: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal(''))
});

// Platform-specific social validation schemas
export const blueskyCredentialsSchema = z.object({
  identifier: z.string()
    .min(1, 'Handle or email is required')
    .refine(
      (val) => val.includes('@') || val.includes('.'),
      'Must be a valid handle (user.bsky.social) or email address'
    ),
  password: z.string()
    .min(1, 'App password is required')
    .min(8, 'App password must be at least 8 characters')
    .refine(
      (val) => !/\s/.test(val),
      'App password should not contain spaces'
    )
});

export const mastodonCredentialsSchema = z.object({
  instanceUrl: z.string()
    .min(1, 'Instance URL is required')
    .url('Must be a valid URL')
    .refine(
      (val) => val.startsWith('https://'),
      'Instance URL must use HTTPS'
    ),
  accessToken: z.string()
    .min(1, 'Access token is required')
    .min(20, 'Access token appears to be too short')
    .regex(/^[A-Za-z0-9_-]+$/, 'Access token contains invalid characters')
});

// Dynamic validation based on platform
export const platformValidationSchemas = {
  bluesky: blueskyCredentialsSchema,
  mastodon: mastodonCredentialsSchema,
  threads: z.object({}) // Threads uses web intent, no credentials needed
};

export const githubSettingsSchema = z.object({
  token: z.string()
    .min(1, 'GitHub token is required')
    .min(40, 'GitHub token appears to be too short')
    .regex(/^gh[ps]_[A-Za-z0-9_]{36,}$/, 'Invalid GitHub token format (should start with ghp_ or ghs_)')
});

// Validation result types
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export type ConnectionTestResult = {
  success: boolean;
  message: string;
  details?: unknown;
};

// Validation functions
export function validateHashnodeSettings(data: unknown): ValidationResult {
  try {
    hashnodeSettingsSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

export function validateDevToSettings(data: unknown): ValidationResult {
  try {
    devToSettingsSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

export function validateBeehiivSettings(data: unknown): ValidationResult {
  try {
    beehiivSettingsSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

export function validateSocialCredentials(data: unknown): ValidationResult {
  try {
    socialCredentialsSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

export function validateGitHubSettings(data: unknown): ValidationResult {
  try {
    githubSettingsSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

// Dynamic validation for social platforms
export function validateSocialPlatformCredentials(platformId: string, data: unknown): ValidationResult {
  try {
    const schema = platformValidationSchemas[platformId as keyof typeof platformValidationSchemas];
    if (!schema) {
      return { isValid: false, errors: { general: `Unsupported platform: ${platformId}` } };
    }

    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

// Connection testing functions
export async function testHashnodeConnection(token: string, publicationId: string): Promise<ConnectionTestResult> {
  try {
    const response = await fetch('https://gql.hashnode.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        query: `
          query GetPublication($id: ObjectId!) {
            publication(id: $id) {
              id
              title
              displayTitle
            }
          }
        `,
        variables: { id: publicationId }
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      return {
        success: false,
        message: 'Invalid token or publication ID',
        details: data.errors[0]?.message || 'Authentication failed'
      };
    }

    if (data.data?.publication) {
      return {
        success: true,
        message: `Connected to "${data.data.publication.displayTitle || data.data.publication.title}"`,
        details: data.data.publication
      };
    }

    return {
      success: false,
      message: 'Publication not found with the provided ID'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function testDevToConnection(token: string): Promise<ConnectionTestResult> {
  try {
    const response = await fetch('https://dev.to/api/users/me', {
      headers: {
        'api-key': token
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid API key'
        };
      }
      return {
        success: false,
        message: `Connection failed (${response.status})`
      };
    }

    const userData = await response.json();
    return {
      success: true,
      message: `Connected as ${userData.name} (@${userData.username})`,
      details: userData
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection failed',
      details: error instanceof Error ? error.message : 'Network error'
    };
  }
}

export async function testBeehiivConnection(token: string, publicationId: string): Promise<ConnectionTestResult> {
  try {
    const response = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid API key'
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          message: 'Publication not found with the provided ID'
        };
      }
      return {
        success: false,
        message: `Connection failed (${response.status})`
      };
    }

    const publicationData = await response.json();
    const publication = publicationData.data;
    
    if (publication) {
      return {
        success: true,
        message: `Connected to "${publication.name}"`,
        details: publication
      };
    }

    return {
      success: false,
      message: 'Invalid response from Beehiiv API'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection failed',
      details: error instanceof Error ? error.message : 'Network error'
    };
  }
}

export async function testSocialConnection(platform: string, credentials: unknown): Promise<ConnectionTestResult> {
  try {
    const response = await fetch('/api/social/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform,
        credentials
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Connection test failed',
        details: result.details
      };
    }

    return {
      success: true,
      message: result.message || 'Connection successful',
      details: result.details
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Network error'
    };
  }
}