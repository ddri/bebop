// Demo analytics data seeder for testing the analytics system
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate sample analytics events for testing
export async function seedAnalyticsData() {
  try {
    // Get existing topics to attach analytics to
    const topics = await prisma.topic.findMany({
      take: 5,
      select: { id: true, name: true }
    });

    if (topics.length === 0) {
      console.log('No topics found. Create some content first.');
      return;
    }

    const eventTypes = ['content.view', 'content.read', 'content.share', 'content.complete'];
    const platforms = ['hashnode', 'devto', 'direct', 'twitter', 'linkedin'];
    const countries = ['US', 'GB', 'CA', 'DE', 'IN', 'AU'];
    
    // Generate events for the last 30 days
    const events = [];
    const now = new Date();
    
    for (let day = 0; day < 30; day++) {
      const eventDate = new Date(now.getTime() - (day * 24 * 60 * 60 * 1000));
      
      // Generate 10-50 events per day per topic
      for (const topic of topics) {
        const eventsPerDay = Math.floor(Math.random() * 40) + 10;
        
        for (let i = 0; i < eventsPerDay; i++) {
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const platform = platforms[Math.floor(Math.random() * platforms.length)];
          const country = countries[Math.floor(Math.random() * countries.length)];
          
          // Add some random minutes/hours to the date
          const timestamp = new Date(
            eventDate.getTime() + 
            (Math.random() * 24 * 60 * 60 * 1000)
          );
          
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const visitorId = `visitor_${Math.random().toString(36).substr(2, 12)}`;
          
          // Create realistic metadata based on event type
          const metadata: Record<string, unknown> = {
            url: `https://example.com/${topic.name.toLowerCase().replace(/\s+/g, '-')}`,
            title: topic.name
          };
          
          if (eventType === 'content.read') {
            metadata.readTime = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
          }
          
          if (eventType === 'content.complete') {
            metadata.readTime = Math.floor(Math.random() * 600) + 120; // 2-12 minutes
            metadata.scrollDepth = Math.floor(Math.random() * 20) + 80; // 80-100%
          }
          
          if (eventType === 'content.share') {
            metadata.shareTarget = ['twitter', 'linkedin', 'facebook', 'email'][
              Math.floor(Math.random() * 4)
            ];
          }
          
          events.push({
            eventType,
            contentId: topic.id,
            platform,
            sessionId,
            visitorId,
            metadata,
            device: {
              type: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
              os: ['Windows', 'macOS', 'iOS', 'Android', 'Linux'][Math.floor(Math.random() * 5)],
              browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)]
            },
            geo: {
              country,
              region: country === 'US' ? ['CA', 'NY', 'TX', 'FL'][Math.floor(Math.random() * 4)] : undefined
            },
            timestamp
          });
        }
      }
    }
    
    // Insert events in batches to avoid overwhelming the database
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      await prisma.analyticsEvent.createMany({
        data: batch
      });
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${events.length} analytics events...`);
    }
    
    console.log(`✅ Successfully seeded ${events.length} analytics events for ${topics.length} topics`);
    
    // Display summary
    const totalEvents = await prisma.analyticsEvent.count();
    const viewEvents = await prisma.analyticsEvent.count({
      where: { eventType: 'content.view' }
    });
    const readEvents = await prisma.analyticsEvent.count({
      where: { eventType: 'content.read' }
    });
    
    console.log(`📊 Analytics Summary:`);
    console.log(`   Total events: ${totalEvents}`);
    console.log(`   Views: ${viewEvents}`);
    console.log(`   Reads: ${readEvents}`);
    console.log(`   Topics with analytics: ${topics.length}`);
    
  } catch (error) {
    console.error('Error seeding analytics data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Clear all analytics data (for testing)
export async function clearAnalyticsData() {
  try {
    const count = await prisma.analyticsEvent.count();
    await prisma.analyticsEvent.deleteMany({});
    console.log(`🗑️  Cleared ${count} analytics events`);
  } catch (error) {
    console.error('Error clearing analytics data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'seed') {
    seedAnalyticsData();
  } else if (command === 'clear') {
    clearAnalyticsData();
  } else {
    console.log('Usage: npx tsx src/lib/analytics/demo-data.ts [seed|clear]');
  }
}