import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // TODO: Add user authentication/authorization if needed
  // const userId = getUserIdFromRequest(request); // Placeholder for user extraction
  // if (!userId) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const conversations = await prisma.conversation.findMany({
      // where: { userId: userId }, // Filter by user if implementing multi-user
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        // Optionally, include a snippet of the last message or message count
      },
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('[API hedge-chat/history/conversations] Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations', details: error.message }, { status: 500 });
  }
}
