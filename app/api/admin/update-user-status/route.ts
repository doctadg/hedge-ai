import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path if necessary

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    // The 'secret' is no longer needed as auth is handled by session
    const { walletAddress, isPremium, isAdmin } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid walletAddress parameter.' }, { status: 400 });
    }
    
    const dataToUpdate: { isPremium?: boolean; isAdmin?: boolean } = {};
    if (typeof isPremium === 'boolean') {
      dataToUpdate.isPremium = isPremium;
    }
    if (typeof isAdmin === 'boolean') {
      dataToUpdate.isAdmin = isAdmin;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No status (isPremium or isAdmin) provided to update.' }, { status: 400 });
    }

    const normalizedWalletAddress = walletAddress.toLowerCase();

    const user = await prisma.user.upsert({
      where: { walletAddress: normalizedWalletAddress },
      update: dataToUpdate,
      create: {
        walletAddress: normalizedWalletAddress,
        isPremium: typeof isPremium === 'boolean' ? isPremium : false, // Default to false if not provided
        isAdmin: typeof isAdmin === 'boolean' ? isAdmin : false,       // Default to false if not provided
      },
    });

    return NextResponse.json({ 
      message: `User status for wallet address ${normalizedWalletAddress} has been processed.`,
      user: user 
    });

  } catch (error: any) {
    console.error('[API admin/update-user-status] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
