import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import shared Prisma client instance
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path if necessary

// Remove local Prisma client instantiation: const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // The middleware should have already performed the basic auth check.
  // Here, we can re-verify or directly trust the middleware's protection.
  // For robustness, let's re-verify admin status from the session.
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        // email: true, // Not in current schema
        // name: true, // Not in current schema
        isPremium: true,
        isAdmin: true,
        // createdAt: true, // Not in current schema
      },
      // orderBy: { // Cannot order by createdAt as it's not selected/available
      //   createdAt: 'desc',
      // },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('[API admin/users] Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
  }
}
