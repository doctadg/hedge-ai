import { NextResponse, NextRequest } from "next/server";
import { fetchCoinGeckoData } from "../utils"; // Points to app/api/coingecko/utils.ts

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const order = searchParams.get("order"); // e.g., market_cap_desc, market_cap_asc, name_desc, name_asc, market_cap_change_24h_desc, market_cap_change_24h_asc

    const params: Record<string, string> = {};
    if (order) {
      params.order = order;
    }

    // If no order is specified, CoinGecko defaults to its own ordering.
    // We can add a default here if desired, e.g., params.order = params.order || "market_cap_desc";
    
    const data = await fetchCoinGeckoData<any[]>("/coins/categories", params);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching CoinGecko categories data:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories data from CoinGecko", details: error.message },
      { status: 500 }
    );
  }
}
