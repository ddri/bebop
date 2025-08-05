import { z } from 'zod';

// MongoDB ObjectId validation pattern
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Validation schema for ContentStaging
export const contentStagingSchema = z.object({
  campaignId: z.string()
    .min(1, 'Campaign ID is required')
    .regex(objectIdPattern, 'Campaign ID must be a valid MongoDB ObjectId'),
  topicId: z.string()
    .min(1, 'Topic ID is required') 
    .regex(objectIdPattern, 'Topic ID must be a valid MongoDB ObjectId'),
  status: z.enum(['draft', 'ready', 'scheduled'], {
    errorMap: () => ({ message: 'Status must be one of: draft, ready, scheduled' })
  }),
  platforms: z.array(z.string())
    .min(1, 'At least one platform must be specified')
    .refine(
      (platforms) => platforms.every(p => ['hashnode', 'devto', 'medium', 'linkedin', 'bluesky', 'mastodon'].includes(p)),
      'All platforms must be valid: hashnode, devto, medium, linkedin, bluesky, mastodon'
    ),
  scheduledFor: z.string().datetime().optional().or(z.literal('')).transform(val => val === '' ? undefined : val)
});

// Validation schema for ManualTask
export const manualTaskSchema = z.object({
  campaignId: z.string()
    .min(1, 'Campaign ID is required')
    .regex(objectIdPattern, 'Campaign ID must be a valid MongoDB ObjectId'),
  contentStagingId: z.string()
    .regex(objectIdPattern, 'Content Staging ID must be a valid MongoDB ObjectId')
    .optional()
    .or(z.literal('')).transform(val => val === '' ? undefined : val),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')).transform(val => val === '' ? undefined : val),
  platform: z.string()
    .refine(
      (platform) => ['medium', 'linkedin', 'twitter', 'instagram', 'youtube', 'tiktok', 'reddit'].includes(platform),
      'Platform must be one of: medium, linkedin, twitter, instagram, youtube, tiktok, reddit'
    )
    .optional()
    .or(z.literal('')).transform(val => val === '' ? undefined : val),
  status: z.enum(['todo', 'in_progress', 'completed'], {
    errorMap: () => ({ message: 'Status must be one of: todo, in_progress, completed' })
  }),
  dueDate: z.string().datetime().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  instructions: z.string()
    .max(2000, 'Instructions must be less than 2000 characters')
    .optional()
    .or(z.literal('')).transform(val => val === '' ? undefined : val),
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .or(z.literal('')).transform(val => val === '' ? undefined : val)
});

// Update schemas (subset of create schemas)
export const contentStagingUpdateSchema = contentStagingSchema.partial().omit({ campaignId: true, topicId: true });
export const manualTaskUpdateSchema = manualTaskSchema.partial().omit({ campaignId: true });

// Validation result types
export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
  data?: any;
}

// Validation helper functions
export function validateContentStaging(data: unknown): ValidationResult {
  try {
    const result = contentStagingSchema.parse(data);
    return {
      success: true,
      errors: {},
      data: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        errors
      };
    }
    return {
      success: false,
      errors: { general: 'Validation failed' }
    };
  }
}

export function validateContentStagingUpdate(data: unknown): ValidationResult {
  try {
    const result = contentStagingUpdateSchema.parse(data);
    return {
      success: true,
      errors: {},
      data: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        errors
      };
    }
    return {
      success: false,
      errors: { general: 'Validation failed' }
    };
  }
}

export function validateManualTask(data: unknown): ValidationResult {
  try {
    const result = manualTaskSchema.parse(data);
    return {
      success: true,
      errors: {},
      data: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        errors
      };
    }
    return {
      success: false,
      errors: { general: 'Validation failed' }
    };
  }
}

export function validateManualTaskUpdate(data: unknown): ValidationResult {
  try {
    const result = manualTaskUpdateSchema.parse(data);
    return {
      success: true,
      errors: {},
      data: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        errors
      };
    }
    return {
      success: false,
      errors: { general: 'Validation failed' }
    };
  }
}