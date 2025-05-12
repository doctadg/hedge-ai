import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  // --- Authentication/Authorization with NextAuth Session ---
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.error('[API save-agent-message] Unauthorized: No active session or user data found.');
    return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
  }

  const userId = session.user.id as string;
  const isUserPremium = session.user.isPremium as boolean;
  const userWalletAddress = session.user.walletAddress as string;

  console.log(`[API save-agent-message] User ${userId} (Wallet: ${userWalletAddress}) attempting to save message. Premium: ${isUserPremium}.`);

  // Assuming premium is required to save agent messages, similar to creating them
  if (!isUserPremium) {
      console.error(`[API save-agent-message] Forbidden: User ${userId} is not premium.`);
      return NextResponse.json({ error: 'Forbidden: Premium access required to save agent messages.' }, { status: 403 });
  }
  // --- End Authentication/Authorization ---

  try {
    const body = await request.json();
    const {
      hedgeConversationId,
      agentContent,
      thoughts,
      toolStatus,
      // walletAddress // No longer needed from client for auth
    } = body;

    if (!hedgeConversationId) {
      return NextResponse.json({ error: 'Missing required parameter: hedgeConversationId' }, { status: 400 });
    }
    if (typeof agentContent !== 'string' || agentContent.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid agentContent' }, { status: 400 });
    }
    
    console.log(`[API save-agent-message] User ${userId} authorized (Premium: ${isUserPremium}).`);

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
