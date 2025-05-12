import { NextResponse } from "next/server";
import { fetchCoinGeckoData } from "../utils"; // Corrected path to coingecko utils

export async function GET() {
  try {
    const data = await fetchCoinGeckoData<any>("/global");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching CoinGecko global data:", error);
    return NextResponse.json(
      { error: "Failed to fetch global data from CoinGecko", details: error.message },
      { status: 500 }
    );
  }
}
