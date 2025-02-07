import { NextResponse } from "next/server"
import { fetchWithAuth, getApiKey } from "../utils"

export async function GET() {
  try {
    const apiKey = getApiKey("COINGECKO_PRO_API_KEY")
    const data = await fetchWithAuth("https://pro-api.coingecko.com/api/v3/coins/bitcoin", apiKey)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching CoinGecko data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

