import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    const template = await prisma.campaignTemplate.findUnique({
      where: { id: params.id }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (!template.isPublic && template.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    // Check ownership
    const existing = await prisma.campaignTemplate.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, category, structure, isPublic } = body;

    const template = await prisma.campaignTemplate.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(structure && { structure }),
        ...(isPublic !== undefined && { isPublic })
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    // Check ownership
    const existing = await prisma.campaignTemplate.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await prisma.campaignTemplate.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}