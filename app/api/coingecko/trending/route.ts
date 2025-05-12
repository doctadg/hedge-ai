import { NextResponse } from "next/server";
import { fetchCoinGeckoData } from "../utils"; // Points to app/api/coingecko/utils.ts

export async function GET() {
  try {
    // The /search/trending endpoint does not typically require parameters for a general fetch.
    // Consult CoinGecko API docs if specific filtering for trending is needed.
    const data = await fetchCoinGeckoData<any>("/search/trending");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching CoinGecko trending data:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending data from CoinGecko", details: error.message },
      { status: 500 }
    );
  }
}
