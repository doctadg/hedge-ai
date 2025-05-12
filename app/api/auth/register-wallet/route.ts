import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import shared Prisma client instance

// Remove local Prisma client instantiation: const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid walletAddress parameter.' }, { status: 400 });
    }

    const normalizedWalletAddress = walletAddress.toLowerCase();

    // Find user first, selecting only necessary fields
    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedWalletAddress },
      select: {
        id: true,
        walletAddress: true,
        isPremium: true,
        isAdmin: true,
      }
    });

    // If user doesn't exist, create them, selecting only necessary fields
    if (!user) {
      console.log(`User with wallet ${normalizedWalletAddress} not found, creating...`);
      user = await prisma.user.create({
        data: {
          walletAddress: normalizedWalletAddress,
          // isPremium and isAdmin will default to false based on schema defaults
        },
        select: { // Select the same fields after creation
          id: true,
          walletAddress: true,
          isPremium: true,
          isAdmin: true,
        }
      });
      console.log(`User created:`, user);
    } else {
      console.log(`User with wallet ${normalizedWalletAddress} found.`);
      // Optionally update something on existing user login if needed
      // e.g., await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    }

    // For a real auth system, you'd generate and return a session token (e.g., JWT) here.
    // For now, we're just ensuring the user record exists.
    return NextResponse.json({ 
      message: `User with wallet address ${normalizedWalletAddress} processed.`,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        isPremium: user.isPremium,
        isAdmin: user.isAdmin,
      } 
    });

  } catch (error: any) {
    console.error('[API auth/register-wallet] Error:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('walletAddress')) {
        // This should ideally be handled by upsert, but as a fallback:
        return NextResponse.json({ error: 'Error processing wallet address. It might already exist with a different casing or an unexpected issue occurred.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
