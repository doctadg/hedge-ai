import { NextResponse } from "next/server"
import { fetchWithAuth, getApiKey } from "../utils"

export async function GET() {
  try {
    const apiKey = getApiKey("GLASSNODE_API_KEY")
    const endpoints = [
      "https://api.glassnode.com/v1/metrics/market/price_usd_close",
      "https://api.glassnode.com/v1/metrics/supply/current",
      "https://api.glassnode.com/v1/metrics/mining/hash_rate_mean",
    ]

    const results = await Promise.all(endpoints.map((endpoint) => fetchWithAuth(`${endpoint}?a=BTC&i=24h`, apiKey)))

    const [price, supply, hashRate] = results

    return NextResponse.json({ price, supply, hashRate })
  } catch (error) {
    console.error("Error fetching Glassnode data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

