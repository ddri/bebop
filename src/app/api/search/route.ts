import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { executeWithRetryAndErrorHandling } from '@/lib/db-utils';

export interface SearchResult {
  id: string;
  type: 'topic';
  name: string;
  description: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  matches: string[]; // Which fields matched the search
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
}

export async function GET(request: Request) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!query || query.trim().length === 0) {
    return NextResponse.json<SearchResponse>({
      results: [],
      totalCount: 0,
      query: ''
    });
  }

  const searchTerm = query.trim();

  try {
    // Search topics only
    const topicsResult = await executeWithRetryAndErrorHandling(
      () => prisma.topic.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset
      }),
      'search topics'
    );

    // Handle errors from search
    if (!topicsResult.success) {
      return topicsResult.response;
    }

    // Helper function to determine which fields matched
    type SearchableItem = {
      name: string;
      description?: string | null;
      content?: string;
      [key: string]: string | Date | string[] | null | undefined;
    };

    const getMatches = (item: SearchableItem, fields: string[]): string[] => {
      const matches: string[] = [];
      const lowerQuery = searchTerm.toLowerCase();
      
      fields.forEach(field => {
        const value = item[field];
        if (value && typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
          matches.push(field);
        }
      });
      
      return matches;
    };

    // Transform results to unified format
    const topicResults: SearchResult[] = topicsResult.data.map(topic => ({
      id: topic.id,
      type: 'topic' as const,
      name: topic.name,
      description: topic.description,
      content: topic.content,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString(),
      matches: getMatches(topic, ['name', 'description', 'content'])
    }));

    // Sort results by relevance (name matches first, then by date)
    const sortedResults = topicResults.sort((a, b) => {
      // Prioritize name matches
      const aNameMatch = a.matches.includes('name');
      const bNameMatch = b.matches.includes('name');
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // Then sort by update date
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const response: SearchResponse = {
      results: sortedResults,
      totalCount: sortedResults.length,
      query: searchTerm
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}