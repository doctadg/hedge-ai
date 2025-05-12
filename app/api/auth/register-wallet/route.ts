import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid walletAddress parameter.' }, { status: 400 });
    }

    const normalizedWalletAddress = walletAddress.toLowerCase();

    // Upsert the user: find by walletAddress, or create if not exists.
    // New users will default to isPremium: false, isAdmin: false as per schema.
    const user = await prisma.user.upsert({
      where: { walletAddress: normalizedWalletAddress },
      update: { 
        // Optionally, update a lastLoginAt field here if you add one to the schema
        updatedAt: new Date(), // Touch updatedAt to signify activity
      }, 
      create: {
        walletAddress: normalizedWalletAddress,
        // isPremium and isAdmin will default to false based on schema defaults
      },
    });

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
