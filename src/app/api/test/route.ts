// app/api/test/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Create a test topic
    const topic = await prisma.topic.create({
      data: {
        name: 'Test Topic',
        content: 'This is a test topic'
      }
    })

    return NextResponse.json({ 
      message: 'Database connection successful',
      topic 
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 }
    )
  }
}