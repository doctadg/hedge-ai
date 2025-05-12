import { NextResponse, NextRequest } from "next/server";
import { fetchCoinGeckoData } from "../utils"; // Points to app/api/coingecko/utils.ts

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vs_currency = searchParams.get("vs_currency") || "usd";
    const ids = searchParams.get("ids"); // Comma-separated string of coin ids
    const category = searchParams.get("category");
    const order = searchParams.get("order") || "market_cap_desc";
    const per_page_str = searchParams.get("per_page");
    const page_str = searchParams.get("page");
    const sparkline_str = searchParams.get("sparkline");
    const price_change_percentage = searchParams.get("price_change_percentage");
    const locale = searchParams.get("locale");
    const precision = searchParams.get("precision");

    const params: Record<string, string | number | boolean> = {
      vs_currency,
      order,
    };

    if (ids) params.ids = ids;
    if (category) params.category = category;
    if (per_page_str) params.per_page = parseInt(per_page_str, 10);
    if (page_str) params.page = parseInt(page_str, 10);
    if (sparkline_str) params.sparkline = sparkline_str === 'true';
    if (price_change_percentage) params.price_change_percentage = price_change_percentage;
    if (locale) params.locale = locale;
    if (precision) params.precision = precision;
    
    // Default to fetching a small number if no specific IDs are requested, to avoid large data pulls
    if (!ids && !category && !params.per_page) {
        params.per_page = 10; // Default to top 10 if no other filters imply a larger set
    }


    const data = await fetchCoinGeckoData<any[]>("/coins/markets", params);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching CoinGecko markets data:", error);
    return NextResponse.json(
      { error: "Failed to fetch markets data from CoinGecko", details: error.message },
      { status: 500 }
    );
  }
}
