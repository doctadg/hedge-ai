import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession and authOptions imports
import prisma from '@/lib/prisma'; // Import shared Prisma client instance

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress'); // Expect walletAddress as query param

  if (!walletAddress || typeof walletAddress !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid query parameter: walletAddress' }, { status: 400 });
  }

  try {
    // --- Authentication/Authorization based on walletAddress ---
    const normalizedWalletAddress = walletAddress.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedWalletAddress },
      select: { id: true, isPremium: true } // Check for premium as well, assuming only premium users can see history
    });

    if (!user) {
      console.error(`[API history/conversations] Unauthorized: User not found for wallet ${normalizedWalletAddress}.`);
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }
    // Assuming premium is required to view conversation history
    if (!user.isPremium) {
        console.error(`[API history/conversations] Forbidden: User ${user.id} is not premium.`);
        return NextResponse.json({ error: 'Forbidden: Premium access required' }, { status: 403 });
    }
    const userId = user.id;
    console.log(`[API history/conversations] User ${userId} authorized (Premium: ${user.isPremium}).`);
    // --- End Authentication/Authorization ---

    const conversations = await prisma.conversation.findMany({
      where: { userId: userId }, // Filter by the user's ID obtained from walletAddress lookup
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
