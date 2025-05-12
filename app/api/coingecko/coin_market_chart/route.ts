import { NextResponse, NextRequest } from "next/server";
import { fetchCoinGeckoData } from "../utils"; // Points to app/api/coingecko/utils.ts

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id"); // Coin ID, e.g., "bitcoin"
    const vs_currency = searchParams.get("vs_currency") || "usd";
    const days_str = searchParams.get("days"); // e.g., 1, 7, 14, 30, 90, 180, 365, "max"
    const interval = searchParams.get("interval"); // "daily" or omit for auto
    const precision = searchParams.get("precision"); // "full" or number of decimal places

    if (!id) {
      return NextResponse.json(
        { error: "Coin ID (id) is required" },
        { status: 400 }
      );
    }
    if (!days_str) {
        return NextResponse.json(
            { error: "Number of days (days) is required" },
            { status: 400 }
        );
    }

    const params: Record<string, string | number> = {
      vs_currency,
      days: days_str, // CoinGecko API expects 'days' as string or number
    };

    if (interval) params.interval = interval;
    if (precision) params.precision = precision;
    
    const endpoint = `/coins/${id}/market_chart`;
    const data = await fetchCoinGeckoData<any>(endpoint, params);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching CoinGecko coin market chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch coin market chart data from CoinGecko", details: error.message },
      { status: 500 }
    );
  }
}
