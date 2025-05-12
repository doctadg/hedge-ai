import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      hedgeConversationId, 
      agentContent, 
      thoughts,       // Expected as a single string (e.g., joined by \n\n)
      toolStatus      // Expected as a JSON string
    } = body;

    if (!hedgeConversationId) {
      return NextResponse.json({ error: 'Missing required parameter: hedgeConversationId' }, { status: 400 });
    }
    if (typeof agentContent !== 'string' || agentContent.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid agentContent' }, { status: 400 });
    }

    // TODO: Add user authentication/authorization here if needed,
    // to ensure the user making this request owns the conversation or has rights to modify it.
    // For now, assuming client-side logic correctly passes the conversation ID.

    const agentMessage = await prisma.chatMessage.create({
      data: {
        content: agentContent,
        isUserMessage: false,
        conversationId: hedgeConversationId,
        thoughts: typeof thoughts === 'string' ? thoughts : null,
        toolUsed: null, // toolStatus might contain multiple tools; need to decide how to store this.
                        // For simplicity, toolUsed could be the name of the primary tool if available.
        toolStatus: typeof toolStatus === 'string' ? toolStatus : null, 
      },
    });

    // Also update the conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: hedgeConversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: 'Agent message saved successfully', agentMessage });

  } catch (error: any) {
    console.error('[API hedge-chat/save-agent-message] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
