import { NextResponse, NextRequest } from "next/server";
import { fetchCoinGeckoData } from "../utils"; // Points to app/api/coingecko/utils.ts

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const order = searchParams.get("order"); // e.g., name_asc, name_desc, open_interest_btc_asc, open_interest_btc_desc, trade_volume_24h_btc_asc, trade_volume_24h_btc_desc
    const per_page_str = searchParams.get("per_page");
    const page_str = searchParams.get("page");

    const params: Record<string, string | number> = {};

    if (order) params.order = order;
    if (per_page_str) params.per_page = parseInt(per_page_str, 10);
    if (page_str) params.page = parseInt(page_str, 10);

    // CoinGecko defaults: order by open_interest_btc_desc, per_page 100, page 1
    // Add defaults if desired, e.g.:
    // params.order = params.order || "open_interest_btc_desc";
    // params.per_page = params.per_page || 10; // Default to 10 for smaller initial load

    const data = await fetchCoinGeckoData<any[]>("/derivatives/exchanges", params);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching CoinGecko derivatives exchanges data:", error);
    return NextResponse.json(
      { error: "Failed to fetch derivatives exchanges data from CoinGecko", details: error.message },
      { status: 500 }
    );
  }
}
