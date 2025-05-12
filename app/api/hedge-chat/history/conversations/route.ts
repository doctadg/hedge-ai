import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  // --- Authentication/Authorization with NextAuth Session ---
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.error('[API history/conversations] Unauthorized: No active session or user data found.');
    return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
  }

  const userId = session.user.id as string;
  const isUserPremium = session.user.isPremium as boolean;
  const userWalletAddress = session.user.walletAddress as string;

  console.log(`[API history/conversations] User ${userId} (Wallet: ${userWalletAddress}) attempting to fetch conversations. Premium: ${isUserPremium}.`);

  // Assuming premium is required to view conversation history
  if (!isUserPremium) {
      console.error(`[API history/conversations] Forbidden: User ${userId} is not premium.`);
      return NextResponse.json({ error: 'Forbidden: Premium access required to view chat history.' }, { status: 403 });
  }
  // --- End Authentication/Authorization ---
  
  // const { searchParams } = new URL(request.url); // Not needed if walletAddress is not a param
  // const walletAddress = searchParams.get('walletAddress'); // No longer needed for auth

  try {
    console.log(`[API history/conversations] User ${userId} authorized (Premium: ${isUserPremium}).`);

    const conversations = await prisma.conversation.findMany({
      where: { userId: userId }, // Filter by the userId from the session
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
