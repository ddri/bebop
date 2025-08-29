import prisma from '@/lib/prisma';
import { CampaignTemplateStructure } from '@/types/campaign-templates';

const templates: Array<{
  name: string;
  description: string;
  category: string;
  structure: CampaignTemplateStructure;
  isPublic: boolean;
}> = [
  {
    name: 'Product Launch Campaign',
    description: 'Complete template for launching a new product with pre-launch buzz, launch day activities, and post-launch follow-up',
    category: 'product-launch',
    isPublic: true,
    structure: {
      contentSlots: [
        {
          id: 'slot-1',
          name: 'Teaser Announcement',
          description: 'Build anticipation with a mysterious teaser',
          type: 'social',
          platforms: ['twitter', 'instagram', 'linkedin'],
          suggestedSchedule: { daysFromStart: 0, timeOfDay: '10:00' },
          contentGuidelines: 'Create intrigue without revealing too much. Focus on the problem your product solves.',
          estimatedDuration: 2
        },
        {
          id: 'slot-2',
          name: 'Product Reveal Blog Post',
          description: 'Comprehensive article introducing the product',
          type: 'article',
          platforms: ['blog', 'medium'],
          suggestedSchedule: { daysFromStart: 7, timeOfDay: '09:00' },
          contentGuidelines: 'Cover features, benefits, use cases, and pricing. Include visuals and demos.',
          estimatedDuration: 6
        },
        {
          id: 'slot-3',
          name: 'Launch Day Social Blast',
          description: 'Coordinated social media announcement',
          type: 'social',
          platforms: ['twitter', 'facebook', 'instagram', 'linkedin'],
          suggestedSchedule: { daysFromStart: 14, timeOfDay: '12:00' },
          contentGuidelines: 'High energy announcement with clear CTA. Use launch-specific hashtags.',
          estimatedDuration: 3
        },
        {
          id: 'slot-4',
          name: 'Email Newsletter',
          description: 'Detailed product announcement to subscribers',
          type: 'newsletter',
          platforms: ['email'],
          suggestedSchedule: { daysFromStart: 14, timeOfDay: '10:00' },
          contentGuidelines: 'Exclusive offers for subscribers, detailed feature walkthrough, customer testimonials.',
          estimatedDuration: 4
        },
        {
          id: 'slot-5',
          name: 'Customer Success Story',
          description: 'Share early adopter testimonials',
          type: 'article',
          platforms: ['blog', 'linkedin'],
          suggestedSchedule: { daysFromStart: 21, timeOfDay: '11:00' },
          contentGuidelines: 'Real customer stories showing product value and ROI.',
          estimatedDuration: 5
        }
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'Prepare press kit',
          description: 'Create media assets and press release',
          daysFromStart: 5,
          estimatedDuration: 4
        },
        {
          id: 'task-2',
          title: 'Reach out to influencers',
          description: 'Contact relevant industry influencers for launch support',
          platform: 'email',
          daysFromStart: 7,
          instructions: 'Use personalized outreach template. Offer early access or exclusive content.',
          estimatedDuration: 3
        },
        {
          id: 'task-3',
          title: 'Schedule product demo webinar',
          description: 'Set up and promote live demo session',
          daysFromStart: 16,
          estimatedDuration: 2
        },
        {
          id: 'task-4',
          title: 'Monitor launch metrics',
          description: 'Track engagement and conversion metrics',
          daysFromStart: 14,
          instructions: 'Set up tracking dashboards, monitor social mentions, track sign-ups.',
          estimatedDuration: 1
        }
      ],
      suggestedDuration: 30,
      platforms: ['twitter', 'instagram', 'linkedin', 'facebook', 'blog', 'medium', 'email'],
      goals: [
        'Generate buzz and anticipation before launch',
        'Achieve 1000+ sign-ups in first week',
        'Establish thought leadership in product category',
        'Build engaged community around product'
      ],
      targetAudience: 'Early adopters, tech-savvy professionals, and existing customer base'
    }
  },
  {
    name: 'Content Series Campaign',
    description: 'Educational content series template for building authority and engagement over 6 weeks',
    category: 'content-series',
    isPublic: true,
    structure: {
      contentSlots: [
        {
          id: 'slot-1',
          name: 'Series Introduction',
          description: 'Announce the series and set expectations',
          type: 'article',
          platforms: ['blog', 'linkedin'],
          suggestedSchedule: { daysFromStart: 0, timeOfDay: '09:00' },
          contentGuidelines: 'Outline what readers will learn, series schedule, and why it matters.',
          estimatedDuration: 4
        },
        {
          id: 'slot-2',
          name: 'Episode 1: Fundamentals',
          description: 'Cover the basics of your topic',
          type: 'article',
          platforms: ['blog', 'medium'],
          suggestedSchedule: { daysFromStart: 7, timeOfDay: '09:00' },
          contentGuidelines: 'Start with foundational concepts. Make it accessible to beginners.',
          estimatedDuration: 5
        },
        {
          id: 'slot-3',
          name: 'Episode 2: Deep Dive',
          description: 'Explore advanced concepts',
          type: 'article',
          platforms: ['blog', 'medium'],
          suggestedSchedule: { daysFromStart: 14, timeOfDay: '09:00' },
          contentGuidelines: 'Build on Episode 1. Include practical examples and case studies.',
          estimatedDuration: 5
        },
        {
          id: 'slot-4',
          name: 'Episode 3: Practical Application',
          description: 'Hands-on tutorial or guide',
          type: 'article',
          platforms: ['blog', 'youtube'],
          suggestedSchedule: { daysFromStart: 21, timeOfDay: '09:00' },
          contentGuidelines: 'Step-by-step walkthrough. Include downloadable resources.',
          estimatedDuration: 6
        },
        {
          id: 'slot-5',
          name: 'Episode 4: Expert Interview',
          description: 'Feature industry expert perspectives',
          type: 'article',
          platforms: ['blog', 'podcast'],
          suggestedSchedule: { daysFromStart: 28, timeOfDay: '09:00' },
          contentGuidelines: 'Interview format with actionable insights and expert tips.',
          estimatedDuration: 4
        },
        {
          id: 'slot-6',
          name: 'Series Wrap-up & Resources',
          description: 'Summarize key learnings and next steps',
          type: 'newsletter',
          platforms: ['blog', 'email'],
          suggestedSchedule: { daysFromStart: 35, timeOfDay: '09:00' },
          contentGuidelines: 'Recap main points, provide resource list, announce next series.',
          estimatedDuration: 3
        }
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'Create series landing page',
          description: 'Build dedicated page for series content',
          daysFromStart: -2,
          estimatedDuration: 3
        },
        {
          id: 'task-2',
          title: 'Design series graphics',
          description: 'Create consistent visual branding for series',
          daysFromStart: -1,
          estimatedDuration: 4
        },
        {
          id: 'task-3',
          title: 'Promote each episode',
          description: 'Share new episodes across social channels',
          platform: 'social',
          daysFromStart: 7,
          instructions: 'Create unique social posts for each platform. Use series hashtag.',
          estimatedDuration: 1
        }
      ],
      suggestedDuration: 42,
      platforms: ['blog', 'medium', 'linkedin', 'youtube', 'podcast', 'email'],
      goals: [
        'Establish thought leadership in industry',
        'Grow email list by 25%',
        'Generate 10,000+ series page views',
        'Build engaged community around content'
      ],
      targetAudience: 'Industry professionals seeking to deepen their knowledge and skills'
    }
  },
  {
    name: 'Seasonal Holiday Campaign',
    description: 'Holiday marketing campaign template with promotional content and special offers',
    category: 'seasonal',
    isPublic: true,
    structure: {
      contentSlots: [
        {
          id: 'slot-1',
          name: 'Holiday Campaign Kickoff',
          description: 'Announce holiday promotions and themes',
          type: 'announcement',
          platforms: ['email', 'blog'],
          suggestedSchedule: { daysFromStart: 0, timeOfDay: '08:00' },
          contentGuidelines: 'Set festive tone, preview upcoming offers, create excitement.',
          estimatedDuration: 3
        },
        {
          id: 'slot-2',
          name: 'Gift Guide Article',
          description: 'Curated product recommendations',
          type: 'article',
          platforms: ['blog', 'pinterest'],
          suggestedSchedule: { daysFromStart: 3, timeOfDay: '10:00' },
          contentGuidelines: 'Organize by recipient type or price range. Include beautiful imagery.',
          estimatedDuration: 5
        },
        {
          id: 'slot-3',
          name: 'Flash Sale Announcement',
          description: 'Limited-time holiday offer',
          type: 'social',
          platforms: ['instagram', 'facebook', 'twitter'],
          suggestedSchedule: { daysFromStart: 7, timeOfDay: '12:00' },
          contentGuidelines: 'Create urgency with countdown timer. Clear discount information.',
          estimatedDuration: 2
        },
        {
          id: 'slot-4',
          name: 'Customer Holiday Stories',
          description: 'Share customer testimonials and photos',
          type: 'social',
          platforms: ['instagram', 'facebook'],
          suggestedSchedule: { daysFromStart: 10, timeOfDay: '14:00' },
          contentGuidelines: 'User-generated content featuring your products in holiday settings.',
          estimatedDuration: 2
        },
        {
          id: 'slot-5',
          name: 'Last-Minute Shopping Email',
          description: 'Final push for holiday sales',
          type: 'newsletter',
          platforms: ['email'],
          suggestedSchedule: { daysFromStart: 14, timeOfDay: '09:00' },
          contentGuidelines: 'Shipping deadlines, express options, digital gift cards.',
          estimatedDuration: 3
        }
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'Update website with holiday theme',
          description: 'Add seasonal graphics and banners',
          daysFromStart: -1,
          estimatedDuration: 2
        },
        {
          id: 'task-2',
          title: 'Coordinate with customer service',
          description: 'Prepare team for increased holiday inquiries',
          daysFromStart: 0,
          instructions: 'Share promotion details, update FAQ, prepare response templates.',
          estimatedDuration: 2
        },
        {
          id: 'task-3',
          title: 'Monitor inventory levels',
          description: 'Ensure popular items stay in stock',
          daysFromStart: 5,
          estimatedDuration: 1
        }
      ],
      suggestedDuration: 21,
      platforms: ['email', 'blog', 'instagram', 'facebook', 'twitter', 'pinterest'],
      goals: [
        'Increase holiday sales by 40%',
        'Grow social media engagement by 50%',
        'Clear seasonal inventory',
        'Build customer loyalty for new year'
      ],
      targetAudience: 'Holiday shoppers looking for gifts and seasonal deals'
    }
  },
  {
    name: 'Brand Awareness Campaign',
    description: 'Build brand recognition and trust through consistent storytelling and engagement',
    category: 'awareness',
    isPublic: true,
    structure: {
      contentSlots: [
        {
          id: 'slot-1',
          name: 'Brand Story Article',
          description: 'Share your founding story and mission',
          type: 'article',
          platforms: ['blog', 'medium'],
          suggestedSchedule: { daysFromStart: 0, timeOfDay: '10:00' },
          contentGuidelines: 'Authentic storytelling about why your brand exists and what you stand for.',
          estimatedDuration: 5
        },
        {
          id: 'slot-2',
          name: 'Behind the Scenes Content',
          description: 'Show your team and process',
          type: 'social',
          platforms: ['instagram', 'tiktok'],
          suggestedSchedule: { daysFromStart: 5, timeOfDay: '13:00' },
          contentGuidelines: 'Humanize your brand with employee spotlights and workspace tours.',
          estimatedDuration: 3
        },
        {
          id: 'slot-3',
          name: 'Values in Action',
          description: 'Demonstrate brand values through actions',
          type: 'article',
          platforms: ['blog', 'linkedin'],
          suggestedSchedule: { daysFromStart: 10, timeOfDay: '09:00' },
          contentGuidelines: 'Share CSR initiatives, community involvement, or sustainability efforts.',
          estimatedDuration: 4
        },
        {
          id: 'slot-4',
          name: 'Customer Spotlight Series',
          description: 'Feature loyal customers and their stories',
          type: 'social',
          platforms: ['instagram', 'facebook', 'linkedin'],
          suggestedSchedule: { daysFromStart: 15, timeOfDay: '11:00' },
          contentGuidelines: 'Interview format highlighting how customers use and love your brand.',
          estimatedDuration: 3
        },
        {
          id: 'slot-5',
          name: 'Industry Thought Leadership',
          description: 'Share expertise and insights',
          type: 'article',
          platforms: ['linkedin', 'medium'],
          suggestedSchedule: { daysFromStart: 20, timeOfDay: '10:00' },
          contentGuidelines: 'Position brand as industry expert with trends analysis and predictions.',
          estimatedDuration: 5
        }
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'Develop brand messaging guidelines',
          description: 'Create consistent voice and tone document',
          daysFromStart: -3,
          estimatedDuration: 4
        },
        {
          id: 'task-2',
          title: 'Partner with micro-influencers',
          description: 'Identify and reach out to aligned influencers',
          platform: 'social',
          daysFromStart: 8,
          instructions: 'Focus on authenticity over follower count. Look for values alignment.',
          estimatedDuration: 3
        },
        {
          id: 'task-3',
          title: 'Host virtual brand event',
          description: 'Organize online meetup or workshop',
          daysFromStart: 25,
          estimatedDuration: 5
        }
      ],
      suggestedDuration: 30,
      platforms: ['blog', 'medium', 'linkedin', 'instagram', 'facebook', 'tiktok'],
      goals: [
        'Increase brand mention by 30%',
        'Grow social media following by 20%',
        'Improve brand sentiment scores',
        'Build community of brand advocates'
      ],
      targetAudience: 'Potential customers who align with brand values and existing customers for advocacy'
    }
  }
];

export async function seedTemplates() {
  console.log('Seeding campaign templates...');
  
  for (const template of templates) {
    try {
      const existing = await prisma.campaignTemplate.findFirst({
        where: { name: template.name }
      });
      
      if (!existing) {
        await prisma.campaignTemplate.create({
          data: {
            ...template,
            userId: '000000000000000000000000' // System user ID for public templates
          }
        });
        console.log(`Created template: ${template.name}`);
      } else {
        console.log(`Template already exists: ${template.name}`);
      }
    } catch (error) {
      console.error(`Failed to create template ${template.name}:`, error);
    }
  }
  
  console.log('Template seeding complete!');
}

// Run if called directly
if (require.main === module) {
  seedTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}