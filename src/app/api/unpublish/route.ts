// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function POST(request: Request) {
//   try {
//     const json = await request.json();
//     const { fileName } = json;

//     if (!fileName) {
//       return NextResponse.json(
//         { error: 'Filename is required' },
//         { status: 400 }
//       );
//     }

//     // Delete the content from MongoDB using Prisma
//     const deleteResult = await prisma.publishedContent.deleteMany({
//       where: {
//         fileName: fileName
//       }
//     });

//     if (deleteResult.count === 0) {
//       return NextResponse.json(
//         { error: 'No published content found with that filename' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Failed to unpublish:', error);
//     return NextResponse.json(
//       { error: 'Failed to unpublish content' },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const publishedContent = await prisma.publishedContent.findUnique({
      where: {
        id: params.id
      }
    });

    if (!publishedContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Return the content with HTML content type
    return new NextResponse(publishedContent.content, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}