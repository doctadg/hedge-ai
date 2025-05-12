import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hedgeConversationId = searchParams.get('hedgeConversationId');

  if (!hedgeConversationId) {
    return NextResponse.json({ error: 'Missing required query parameter: hedgeConversationId' }, { status: 400 });
  }

  // TODO: Add user authentication/authorization if needed
  //       Ensure the user requesting has access to this conversationId.
  // const userId = getUserIdFromRequest(request);
  // if (!userId) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }
  // const conversation = await prisma.conversation.findUnique({ where: { id: hedgeConversationId }});
  // if (!conversation || (conversation.userId && conversation.userId !== userId)) {
  //    return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
  // }


  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId: hedgeConversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      // Select all relevant fields, including those for agent messages
      select: {
        id: true,
        content: true,
        isUserMessage: true,
        createdAt: true,
        toolUsed: true,
        toolStatus: true,
        thoughts: true,
      }
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('[API hedge-chat/history/messages] Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages', details: error.message }, { status: 500 });
  }
}
