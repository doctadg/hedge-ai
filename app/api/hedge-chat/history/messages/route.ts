import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession and authOptions imports
import prisma from '@/lib/prisma'; // Import shared Prisma client instance

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hedgeConversationId = searchParams.get('hedgeConversationId');
  const walletAddress = searchParams.get('walletAddress'); // Expect walletAddress as query param

  if (!hedgeConversationId) {
    return NextResponse.json({ error: 'Missing required query parameter: hedgeConversationId' }, { status: 400 });
  }
  if (!walletAddress || typeof walletAddress !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid query parameter: walletAddress' }, { status: 400 });
  }

  try {
    // --- Authentication/Authorization based on walletAddress ---
    const normalizedWalletAddress = walletAddress.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedWalletAddress },
      select: { id: true, isPremium: true } // Also check for premium if this route requires it
    });

    if (!user) {
      console.error(`[API history/messages] Unauthorized: User not found for wallet ${normalizedWalletAddress}.`);
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }
    // Assuming premium is required to fetch messages
    if (!user.isPremium) {
        console.error(`[API history/messages] Forbidden: User ${user.id} is not premium.`);
        return NextResponse.json({ error: 'Forbidden: Premium access required' }, { status: 403 });
    }
    const userId = user.id;
    console.log(`[API history/messages] User ${userId} authorized (Premium: ${user.isPremium}).`);
    // --- End Authentication/Authorization ---

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
