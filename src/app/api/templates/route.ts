import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: Request) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includePublic = searchParams.get('includePublic') === 'true';
    
    const whereClause: Record<string, unknown> = {};
    
    // Filter by category if provided
    if (category) {
      whereClause.category = category;
    }
    
    // Include user's templates and optionally public templates
    if (includePublic) {
      whereClause.OR = [
        { userId: authResult.userId },
        { isPublic: true }
      ];
    } else {
      whereClause.userId = authResult.userId;
    }

    const templates = await prisma.campaignTemplate.findMany({
      where: whereClause,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { name, description, category, structure, isPublic } = body;

    // Validate required fields
    if (!name || !structure) {
      return NextResponse.json(
        { error: 'Name and structure are required' },
        { status: 400 }
      );
    }

    // Create the template
    const template = await prisma.campaignTemplate.create({
      data: {
        name,
        description,
        category: category || 'custom',
        structure,
        isPublic: isPublic || false,
        userId: authResult.userId
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}