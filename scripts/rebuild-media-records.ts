// scripts/rebuild-media-records.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const mediaFiles = [
  {
    filename: "jazz.jpg",
    url: "https://bebop-media.s3.us-east-1.amazonaws.com/uploads/1738210935844-jazz.jpg",
    size: 120100,
    mimeType: "image/jpeg",
    createdAt: new Date("2025-01-29T20:22:17.000Z")
  },
  {
    filename: "etude.jpeg",
    url: "https://bebop-media.s3.us-east-1.amazonaws.com/uploads/1738260467518-etude.jpeg",
    size: 614900,
    mimeType: "image/jpeg",
    createdAt: new Date("2025-01-30T10:07:48.000Z")
  },
  {
    filename: "a-bebop-img.jpg",
    url: "https://bebop-media.s3.us-east-1.amazonaws.com/uploads/1738261305894-a-bebop-img.jpg",
    size: 1500000,
    mimeType: "image/jpeg",
    createdAt: new Date("2025-01-30T10:21:47.000Z")
  },
  {
    filename: "jazz.jpg",
    url: "https://bebop-media.s3.us-east-1.amazonaws.com/uploads/1738278565511-jazz.jpg",
    size: 120100,
    mimeType: "image/jpeg",
    createdAt: new Date("2025-01-30T15:09:26.000Z")
  }
];

async function rebuildMediaRecords() {
  try {
    await prisma.mediaItem.deleteMany({}); // Clear existing records
    const results = await prisma.mediaItem.createMany({
      data: mediaFiles
    });
    console.log(`Created ${results.count} media records`);
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

rebuildMediaRecords();