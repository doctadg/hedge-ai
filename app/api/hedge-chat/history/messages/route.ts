import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  // --- Authentication/Authorization with NextAuth Session ---
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.error('[API history/messages] Unauthorized: No active session or user data found.');
    return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
  }

  const userId = session.user.id as string;
  const isUserPremium = session.user.isPremium as boolean;
  const userWalletAddress = session.user.walletAddress as string; // Available if needed

  console.log(`[API history/messages] User ${userId} (Wallet: ${userWalletAddress}) attempting to fetch messages. Premium: ${isUserPremium}.`);
  
  // Assuming premium is required to fetch messages (consistent with other chat APIs)
  if (!isUserPremium) {
      console.error(`[API history/messages] Forbidden: User ${userId} is not premium.`);
      return NextResponse.json({ error: 'Forbidden: Premium access required to fetch chat history.' }, { status: 403 });
  }
  // --- End Authentication/Authorization ---

  const { searchParams } = new URL(request.url);
  const hedgeConversationId = searchParams.get('hedgeConversationId');
  // const walletAddress = searchParams.get('walletAddress'); // No longer needed for auth

  if (!hedgeConversationId) {
    return NextResponse.json({ error: 'Missing required query parameter: hedgeConversationId' }, { status: 400 });
  }
  // walletAddress query param is no longer used for auth.

  try {
    console.log(`[API history/messages] User ${userId} authorized (Premium: ${isUserPremium}).`);

    // Verify user owns the conversation before fetching messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: hedgeConversationId },
      select: { userId: true }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.userId !== userId) { // Compare against userId from walletAddress lookup
      console.error(`[API history/messages] Forbidden: User ${userId} does not own conversation ${hedgeConversationId}.`);
      return NextResponse.json({ error: 'Forbidden: User does not own this conversation' }, { status: 403 });
    }

    // User is authorized, proceed to fetch messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId: hedgeConversationId, // Already verified ownership
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
