import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT is_premium FROM users WHERE wallet_address = $1',
        [walletAddress]
      );

      if (result.rows.length > 0) {
        return NextResponse.json({ isPremium: result.rows[0].is_premium });
      } else {
        return NextResponse.json({ isPremium: false }); // User not found, default to false
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error checking premium status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
