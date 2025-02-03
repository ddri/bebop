// app/api/templates/import/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Template, TemplateImportResponse } from '@/types/templates';
import { getBebopDocs } from '@/lib/templates/official-docs';

export async function POST(request: Request) {
  try {
    const { templateId, type } = await request.json();

    // For now, we only handle official docs
    if (type !== 'official-docs') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Only official documentation templates are currently supported' 
        } as TemplateImportResponse,
        { status: 400 }
      );
    }

    // Get the template content
    const template = await getBebopDocs();

    // Create all topics first
    const createdTopics = await Promise.all(
      template.collections[0].topics.map(async (topic) => {
        return await prisma.topic.create({
          data: {
            name: topic.name,
            description: topic.description,
            content: topic.content,
            createdAt: new Date(),
            updatedAt: new Date(),
            collectionIds: []
          }
        });
      })
    );

    // Create the collection
    const collection = await prisma.collection.create({
      data: {
        name: template.collections[0].name,
        description: template.collections[0].description,
        topicIds: createdTopics.map(topic => topic.id),
        createdAt: new Date(),
        lastEdited: new Date()
      }
    });

    // Update topics with collection ID
    await Promise.all(
      createdTopics.map(topic =>
        prisma.topic.update({
          where: { id: topic.id },
          data: {
            collectionIds: [collection.id]
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Template imported successfully',
      collections: [{
        id: collection.id,
        name: collection.name
      }],
      topics: createdTopics.map(topic => ({
        id: topic.id,
        name: topic.name
      }))
    } as TemplateImportResponse);

  } catch (error) {
    console.error('Failed to import template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to import template' 
      } as TemplateImportResponse,
      { status: 500 }
    );
  }
}