import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma client

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    console.log(`[API premium] Checking premium status for wallet: ${walletAddress}`); // Added logging

    // Use Prisma to find the user by wallet address
    const user = await prisma.user.findUnique({
      where: {
        walletAddress: walletAddress, // Use the field name from the Prisma schema
      },
      select: {
        isPremium: true, // Select only the isPremium field
      },
    });
    console.log(`[API premium] User found:`, user); // Added logging

    if (user) {
      console.log(`[API premium] Returning isPremium: ${user.isPremium}`); // Added logging
      return NextResponse.json({ isPremium: user.isPremium });
    } else {
      console.log(`[API premium] User not found, returning isPremium: false`); // Added logging
      // User not found, default to false
      return NextResponse.json({ isPremium: false });
    }

  } catch (error) {
    console.error('Error checking premium status:', error);
    // Consider more specific error handling based on Prisma errors if needed
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
