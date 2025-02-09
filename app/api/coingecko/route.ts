import { NextResponse } from "next/server";
import { fetchWithAuth, getApiKey } from "../utils";

export async function GET() {
  try {
    // const apiKey = getApiKey("COINGECKO_PRO_API_KEY") // No longer needed

    // const data = await fetchWithAuth("https://pro-api.coingecko.com/api/v3/coins/bitcoin", apiKey)

    return NextResponse.json({}); // Return empty object
  } catch (error) {
    console.error("Error fetching Messari data:", error); // Keep the error message as it was
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
