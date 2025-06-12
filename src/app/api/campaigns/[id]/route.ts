import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        publishingPlans: true
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Failed to fetch campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
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
    const { name, description, startDate, endDate, status } = await request.json();
    
    // Basic input validation
    if (name !== undefined && !name) {
      return NextResponse.json(
        { error: 'Campaign name cannot be empty' },
        { status: 400 }
      );
    }
    
    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status && { status }),
      },
      include: {
        publishingPlans: true
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Failed to update campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
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
    // First delete all associated publishing plans
    await prisma.publishingPlan.deleteMany({
      where: { campaignId: params.id }
    });

    // Then delete the campaign
    await prisma.campaign.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}