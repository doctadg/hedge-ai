import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession and authOptions imports
import prisma from '@/lib/prisma'; // Import shared Prisma client instance

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hedgeConversationId,
      agentContent,
      thoughts,
      toolStatus,
      walletAddress // Expect walletAddress from the client
    } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid walletAddress parameter.' }, { status: 400 });
    }
    if (!hedgeConversationId) {
      return NextResponse.json({ error: 'Missing required parameter: hedgeConversationId' }, { status: 400 });
    }
    if (typeof agentContent !== 'string' || agentContent.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid agentContent' }, { status: 400 });
    }

    // --- Authentication/Authorization based on walletAddress ---
    const normalizedWalletAddress = walletAddress.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedWalletAddress },
      select: { id: true, isPremium: true } // Also check for premium if this route requires it
    });

    if (!user) {
      console.error(`[API save-agent-message] Unauthorized: User not found for wallet ${normalizedWalletAddress}.`);
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }
    // Assuming premium is required to save agent messages, similar to creating them
    if (!user.isPremium) {
        console.error(`[API save-agent-message] Forbidden: User ${user.id} is not premium.`);
        return NextResponse.json({ error: 'Forbidden: Premium access required' }, { status: 403 });
    }
    const userId = user.id;
    console.log(`[API save-agent-message] User ${userId} authorized (Premium: ${user.isPremium}).`);
    // --- End Authentication/Authorization ---

    // Verify user owns the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: hedgeConversationId },
      select: { userId: true }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.userId !== userId) { // Compare against userId from walletAddress lookup
      console.error(`[API save-agent-message] Forbidden: User ${userId} does not own conversation ${hedgeConversationId}.`);
      return NextResponse.json({ error: 'Forbidden: User does not own this conversation' }, { status: 403 });
    }

    // User is authorized, proceed to save the message
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
