import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';  // Changed to default import
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    // Access params.id without any type assertions
    const collection = await prisma.collections.findUnique({
      where: { id: params.id } 
    });    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Failed to fetch collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    const { name, description, topicIds, publishedUrl } = await request.json();
    
    // Basic input validation
    if (name !== undefined && !name) {
      return NextResponse.json(
        { error: 'Collection name cannot be empty' },
        { status: 400 }
      );
    }
    
    const collection = await prisma.collections.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(topicIds && { topicIds }),
        ...(publishedUrl !== undefined && { publishedUrl }),
        lastEdited: new Date(),
      },
    });
    return NextResponse.json(collection);
  } catch (error) {
    console.error('Failed to update collection:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    await prisma.collections.delete({
      where: { id: params.id }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete collection:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
} 