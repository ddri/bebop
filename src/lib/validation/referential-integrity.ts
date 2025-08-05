import prisma from '@/lib/prisma';

// Helper functions to check referential integrity for campaign-related operations

export interface ReferentialCheckResult {
  exists: boolean;
  error?: string;
}

/**
 * Check if a campaign exists
 */
export async function checkCampaignExists(campaignId: string): Promise<ReferentialCheckResult> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true } // Only select id for performance
    });
    
    return {
      exists: campaign !== null,
      error: campaign === null ? `Campaign with ID ${campaignId} does not exist` : undefined
    };
  } catch (error) {
    return {
      exists: false,
      error: `Error checking campaign existence: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if a topic exists
 */
export async function checkTopicExists(topicId: string): Promise<ReferentialCheckResult> {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { id: true } // Only select id for performance
    });
    
    return {
      exists: topic !== null,
      error: topic === null ? `Topic with ID ${topicId} does not exist` : undefined
    };
  } catch (error) {
    return {
      exists: false,
      error: `Error checking topic existence: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if a content staging item exists
 */
export async function checkContentStagingExists(stagingId: string): Promise<ReferentialCheckResult> {
  try {
    const staging = await prisma.contentStaging.findUnique({
      where: { id: stagingId },
      select: { id: true } // Only select id for performance
    });
    
    return {
      exists: staging !== null,
      error: staging === null ? `Content staging with ID ${stagingId} does not exist` : undefined
    };
  } catch (error) {
    return {
      exists: false,
      error: `Error checking content staging existence: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if a campaign and topic combination is valid for content staging
 */
export async function validateContentStagingReferences(campaignId: string, topicId: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  
  const [campaignCheck, topicCheck] = await Promise.all([
    checkCampaignExists(campaignId),
    checkTopicExists(topicId)
  ]);
  
  if (!campaignCheck.exists) {
    errors.push(campaignCheck.error!);
  }
  
  if (!topicCheck.exists) {
    errors.push(topicCheck.error!);
  }
  
  // Check for duplicate staging (same campaign + topic combination)
  if (campaignCheck.exists && topicCheck.exists) {
    try {
      const existingStaging = await prisma.contentStaging.findUnique({
        where: {
          campaignId_topicId: {
            campaignId,
            topicId
          }
        },
        select: { id: true }
      });
      
      if (existingStaging) {
        errors.push(`Content staging already exists for this campaign and topic combination`);
      }
    } catch (error) {
      errors.push(`Error checking for duplicate staging: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if references are valid for manual task creation
 */
export async function validateManualTaskReferences(campaignId: string, contentStagingId?: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  
  // Always check campaign exists
  const campaignCheck = await checkCampaignExists(campaignId);
  if (!campaignCheck.exists) {
    errors.push(campaignCheck.error!);
  }
  
  // Check content staging if provided
  if (contentStagingId) {
    const stagingCheck = await checkContentStagingExists(contentStagingId);
    if (!stagingCheck.exists) {
      errors.push(stagingCheck.error!);
    } else {
      // Verify the staging belongs to the same campaign
      try {
        const staging = await prisma.contentStaging.findUnique({
          where: { id: contentStagingId },
          select: { campaignId: true }
        });
        
        if (staging && staging.campaignId !== campaignId) {
          errors.push(`Content staging ${contentStagingId} does not belong to campaign ${campaignId}`);
        }
      } catch (error) {
        errors.push(`Error verifying staging-campaign relationship: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}