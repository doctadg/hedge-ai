import { NextResponse } from "next/server";
import { fetchCoinGeckoData } from "../utils"; // Points to app/api/coingecko/utils.ts

export async function GET() {
  try {
    const data = await fetchCoinGeckoData<any>("/global/decentralized_finance_defi");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching CoinGecko DeFi data:", error);
    return NextResponse.json(
      { error: "Failed to fetch DeFi data from CoinGecko", details: error.message },
      { status: 500 }
    );
  }
}
