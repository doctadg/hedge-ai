import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) { // Kept as POST to minimize client changes, though GET might be more appropriate
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('[API premium] Unauthorized: No active session.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // The premium status is directly available in the session token
    const isUserPremium = session.user.isPremium as boolean;
    const userId = session.user.id;

    console.log(`[API premium] Checked premium status for user ${userId} via session: ${isUserPremium}`);
    
    // This endpoint now just returns the premium status from the session.
    // The database is the source of truth that populates the session token,
    // so this is consistent.
    return NextResponse.json({ isPremium: isUserPremium });

  } catch (error) {
    console.error('[API premium] Error checking premium status via session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
